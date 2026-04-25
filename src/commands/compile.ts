import { Command } from "commander";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, basename, sep } from "path";
import chalk from "chalk";
import { loadPersonaFile } from "../load.js";
import { validatePersona } from "../schema.js";
import { compileClaudeCode, compileClaudeCodeAgent, injectBaselineIntoClaude } from "../targets/claude-code.js";
import { compileSoulMd } from "../targets/soul-md.js";
import { compileCursor } from "../targets/cursor.js";

const TARGETS = ["claude-code", "soul-md", "cursor"] as const;
type Target = (typeof TARGETS)[number];

function isAgentPersona(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes(".personaxis/personas/");
}

function agentSlugFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/\.personaxis\/personas\/([^/]+)\//);
  return match?.[1] ?? basename(dirname(filePath));
}

function handleClaudeCode(
  loaded: ReturnType<typeof loadPersonaFile>,
  opts: { out?: string; stdout?: boolean }
): void {
  const isAgent = isAgentPersona(loaded.path);

  if (isAgent) {
    const agentSlug = agentSlugFromPath(loaded.path);
    const output = compileClaudeCodeAgent(loaded.data, agentSlug);

    if (opts.stdout) { process.stdout.write(output + "\n"); return; }

    const dest = resolve(opts.out ?? `.claude${sep}agents${sep}${agentSlug}.md`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, output, "utf-8");

    const name = (loaded.data.identity as Record<string, string> | undefined)?.name ?? agentSlug;
    console.log(chalk.green("✓"), chalk.bold(name), chalk.dim("→"), `.claude/agents/${agentSlug}.md`);
    console.log(chalk.dim("  Claude Code subagent. Invoke with /agents or slash commands."));

    // Also ensure CLAUDE.md has the @PERSONA.md baseline reference
    const claudeMdPath = resolve("CLAUDE.md");
    const existingClaude = existsSync(claudeMdPath) ? readFileSync(claudeMdPath, "utf-8") : "";
    const updatedClaude = injectBaselineIntoClaude(existingClaude);
    writeFileSync(claudeMdPath, updatedClaude, "utf-8");
    const claudeAction = existingClaude.includes("PERSONA:BASELINE") ? "already up to date" : "updated";
    console.log(chalk.green("✓"), chalk.bold("CLAUDE.md"), chalk.dim(`(${claudeAction}) — @PERSONA.md reference injected`));
  } else {
    const section = injectBaselineIntoClaude(
      existsSync("CLAUDE.md") ? readFileSync("CLAUDE.md", "utf-8") : ""
    );

    if (opts.stdout) { process.stdout.write(section + "\n"); return; }

    const dest = resolve(opts.out ?? "CLAUDE.md");
    writeFileSync(dest, section, "utf-8");

    console.log(chalk.green("✓"), chalk.bold("Behavioral baseline"), chalk.dim("→"), dest);
    console.log(chalk.dim("  CLAUDE.md references @PERSONA.md. Claude Code will apply it automatically."));
  }
}

export const compileCommand = new Command("compile")
  .description("Compile a PERSONA.md to a target format")
  .argument("[file]", "Path to PERSONA.md (defaults to ./PERSONA.md)")
  .requiredOption(
    "-t, --target <target>",
    `Compile target: ${TARGETS.join(" | ")}`
  )
  .option("-o, --out <path>", "Output file path (overrides default)")
  .option("--stdout", "Print to stdout instead of writing a file")
  .action((file: string | undefined, opts: { target: string; out?: string; stdout?: boolean }) => {
    const target = opts.target as Target;
    if (!TARGETS.includes(target)) {
      console.error(chalk.red("Unknown target:"), target);
      console.error(chalk.dim("Valid targets:"), TARGETS.join(", "));
      process.exit(1);
    }

    let loaded;
    try {
      loaded = loadPersonaFile(file);
    } catch (err) {
      console.error(chalk.red("Error:"), (err as Error).message);
      process.exit(1);
    }

    const validation = validatePersona(loaded.data);
    if (!validation.valid) {
      console.error(chalk.red("✗"), "PERSONA.md is invalid — run", chalk.cyan("personaxis validate"), "for details.");
      process.exit(1);
    }

    if (target === "claude-code") {
      handleClaudeCode(loaded, opts);
      return;
    }

    const standaloneTargets = {
      "soul-md": { fn: compileSoulMd, outFile: "SOUL.md", label: "OpenClaw SOUL.md" },
      cursor: { fn: compileCursor, outFile: `.cursor${sep}rules${sep}persona.mdc`, label: "Cursor rules (.mdc)" },
    } as const;

    const { fn, outFile, label } = standaloneTargets[target as "soul-md" | "cursor"];
    const output = fn(loaded.data);

    if (opts.stdout) { process.stdout.write(output + "\n"); return; }

    const dest = resolve(opts.out ?? outFile);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, output, "utf-8");

    const name = (loaded.data.identity as Record<string, string> | undefined)?.name ?? "persona";
    console.log(chalk.green("✓"), chalk.bold(name), chalk.dim("→"), label);
    console.log(chalk.dim("  Written to"), dest);
  });
