import { Command } from "commander";
import { existsSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";
import chalk from "chalk";
import { loadPersonaFile } from "../load.js";
import { validatePersona } from "../schema.js";

function validateFile(filePath: string): boolean {
  let loaded;
  try {
    loaded = loadPersonaFile(filePath);
  } catch (err) {
    console.error(chalk.red("Error:"), (err as Error).message);
    return false;
  }

  const result = validatePersona(loaded.data);

  if (result.valid) {
    const name = (loaded.data.identity as Record<string, string> | undefined)?.name ?? "persona";
    console.log(chalk.green("✓"), chalk.bold(name), chalk.dim(`(${loaded.path})`));
    return true;
  }

  console.error(chalk.red("✗"), chalk.bold("Validation failed"), chalk.dim(`(${loaded.path})`));
  for (const err of result.errors) {
    const field = err.field ? chalk.yellow(err.field) + " " : "";
    console.error(`  ${field}${err.message}`);
  }
  return false;
}

export const validateCommand = new Command("validate")
  .description("Validate a PERSONA.md file against the spec schema")
  .argument("[file]", "Path to PERSONA.md (defaults to ./PERSONA.md)")
  .option("--all", "Validate root PERSONA.md + every persona in .personaxis/personas/")
  .action((file?: string, opts?: { all?: boolean }) => {
    if (opts?.all) {
      let passed = 0;
      let failed = 0;

      // Root
      const rootPath = resolve(process.cwd(), "PERSONA.md");
      if (existsSync(rootPath)) {
        console.log("");
        validateFile(rootPath) ? passed++ : failed++;
      }

      // All personas in .personaxis/personas/*/PERSONA.md
      const personasDir = resolve(process.cwd(), ".personaxis", "personas");
      if (existsSync(personasDir)) {
        const slugs = readdirSync(personasDir).filter((name) =>
          statSync(join(personasDir, name)).isDirectory()
        );

        for (const slug of slugs) {
          const p = join(personasDir, slug, "PERSONA.md");
          if (existsSync(p)) {
            validateFile(p) ? passed++ : failed++;
          }
        }
      }

      console.log("");
      if (failed === 0) {
        console.log(chalk.green(`  ${passed} persona${passed !== 1 ? "s" : ""} valid.`));
      } else {
        console.error(chalk.red(`  ${failed} failed,`), chalk.green(`${passed} passed.`));
        console.error("");
        console.error(chalk.dim("Run"), chalk.cyan("personaxis init"), chalk.dim("to generate a valid PERSONA.md template."));
      }
      console.log("");
      process.exit(failed > 0 ? 1 : 0);
    }

    // Single file mode
    let loaded;
    try {
      loaded = loadPersonaFile(file);
    } catch (err) {
      console.error(chalk.red("Error:"), (err as Error).message);
      process.exit(1);
    }

    const result = validatePersona(loaded.data);

    if (result.valid) {
      const name = (loaded.data.identity as Record<string, string> | undefined)?.name ?? "persona";
      console.log(chalk.green("✓"), chalk.bold(name), chalk.dim(`(${loaded.path})`));
      process.exit(0);
    }

    console.error(chalk.red("✗"), chalk.bold("Validation failed"), chalk.dim(`(${loaded.path})`));
    console.error("");
    for (const err of result.errors) {
      const field = err.field ? chalk.yellow(err.field) + " " : "";
      console.error(`  ${field}${err.message}`);
    }
    console.error("");
    console.error(chalk.dim("Run"), chalk.cyan("personaxis init"), chalk.dim("to generate a valid PERSONA.md template."));
    process.exit(1);
  });
