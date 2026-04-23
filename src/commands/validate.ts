import { Command } from "commander";
import chalk from "chalk";
import { loadPersonaFile } from "../load.js";
import { validatePersona } from "../schema.js";

export const validateCommand = new Command("validate")
  .description("Validate a PERSONA.md file against the spec schema")
  .argument("[file]", "Path to PERSONA.md (defaults to ./PERSONA.md)")
  .action((file?: string) => {
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
    console.error(
      chalk.dim("Run"),
      chalk.cyan("personaxis init"),
      chalk.dim("to generate a valid PERSONA.md template.")
    );

    process.exit(1);
  });
