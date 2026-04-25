#!/usr/bin/env node
import { program } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { compileCommand } from "./commands/compile.js";
import { useCommand } from "./commands/use.js";
import { listCommand, templatesCommand } from "./commands/list.js";
import { lintCommand } from "./commands/lint.js";
import { diffCommand } from "./commands/diff.js";
import { exportCommand } from "./commands/export.js";
import { specCommand } from "./commands/spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
) as { version: string };

program
  .name("personaxis")
  .description("Define, validate, and compile AI agent personas")
  .version(pkg.version);

program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(lintCommand);
program.addCommand(compileCommand);
program.addCommand(exportCommand);
program.addCommand(diffCommand);
program.addCommand(specCommand);
program.addCommand(useCommand);
program.addCommand(listCommand);
program.addCommand(templatesCommand);

program.parse();
