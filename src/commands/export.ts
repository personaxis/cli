import { Command } from "commander";
import chalk from "chalk";
import { loadPersonaFile } from "../load.js";

const FORMATS = ["json"] as const;
type ExportFormat = (typeof FORMATS)[number];

export const exportCommand = new Command("export")
  .description("Export PERSONA.md frontmatter to another format")
  .argument("[file]", "Path to PERSONA.md (defaults to ./PERSONA.md)")
  .requiredOption("--format <format>", `Export format: ${FORMATS.join(" | ")}`)
  .option("--stdout", "Print to stdout (default)")
  .action((file: string | undefined, opts: { format: string; stdout?: boolean }) => {
    const fmt = opts.format as ExportFormat;
    if (!FORMATS.includes(fmt)) {
      console.error(chalk.red("Unknown format:"), fmt);
      console.error(chalk.dim("Valid formats:"), FORMATS.join(", "));
      process.exit(1);
    }

    let loaded;
    try {
      loaded = loadPersonaFile(file);
    } catch (err) {
      console.error(chalk.red("Error:"), (err as Error).message);
      process.exit(1);
    }

    if (fmt === "json") {
      process.stdout.write(JSON.stringify(loaded.data, null, 2) + "\n");
    }
  });
