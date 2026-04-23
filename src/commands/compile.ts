import { Command } from "commander";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import chalk from "chalk";
import { loadPersonaFile } from "../load.js";
import { validatePersona } from "../schema.js";
import { compileClaudeCode } from "../targets/claude-code.js";
import { compileSoulMd } from "../targets/soul-md.js";
import { compileCursor } from "../targets/cursor.js";

const TARGETS = {
  "claude-code": { fn: compileClaudeCode, outFile: "CLAUDE.md", label: "Claude Code system prompt" },
  "soul-md": { fn: compileSoulMd, outFile: "SOUL.md", label: "OpenClaw SOUL.md" },
  cursor: { fn: compileCursor, outFile: ".cursor/rules/persona.md", label: "Cursor rules" },
};

type Target = keyof typeof TARGETS;

export const compileCommand = new Command("compile")
  .description("Compile a PERSONA.md to a target format")
  .argument("[file]", "Path to PERSONA.md (defaults to ./PERSONA.md)")
  .requiredOption(
    "-t, --target <target>",
    `Compile target: ${Object.keys(TARGETS).join(" | ")}`
  )
  .option("-o, --out <path>", "Output file path (overrides default)")
  .option("--stdout", "Print to stdout instead of writing a file")
  .action((file: string | undefined, opts: { target: string; out?: string; stdout?: boolean }) => {
    const target = opts.target as Target;
    if (!TARGETS[target]) {
      console.error(chalk.red("Unknown target:"), target);
      console.error(chalk.dim("Valid targets:"), Object.keys(TARGETS).join(", "));
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

    const { fn, outFile, label } = TARGETS[target];
    const output = fn(loaded.data);

    if (opts.stdout) {
      process.stdout.write(output + "\n");
      return;
    }

    const dest = resolve(opts.out ?? outFile);

    try {
      mkdirSync(dirname(dest), { recursive: true });
    } catch {}

    writeFileSync(dest, output, "utf-8");

    const name = (loaded.data.identity as Record<string, string> | undefined)?.name ?? "persona";
    console.log(chalk.green("✓"), chalk.bold(name), chalk.dim("→"), label);
    console.log(chalk.dim("  Written to"), dest);
  });
