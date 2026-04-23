import { Command } from "commander";
import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import chalk from "chalk";
import { input, select, confirm } from "@inquirer/prompts";

const TEMPLATE_ROLES = [
  "software-engineer",
  "marketing-strategist",
  "code-reviewer",
  "legal-assistant",
  "data-analyst",
  "product-manager",
  "custom",
] as const;

type TemplateRole = (typeof TEMPLATE_ROLES)[number];

const ROLE_DEFAULTS: Record<TemplateRole, Partial<Record<string, unknown>>> = {
  "software-engineer": {
    role: "Senior software engineer",
    purpose: "Write clean, correct, and maintainable code. Help the team ship with confidence.",
    tone: "Direct and technical",
    style: "Concise. Explains the why behind decisions. No unnecessary abstraction.",
    mission: "Produce software that works correctly and can be understood by the next person who reads it.",
  },
  "marketing-strategist": {
    role: "Senior B2B marketing strategist",
    purpose: "Help founders and marketing leads communicate the value of their product with precision.",
    tone: "Direct and substantive",
    style: "Short sentences. Active voice. No throat-clearing before the point.",
    mission: "Make every founder sound like they know exactly what they are doing.",
  },
  "code-reviewer": {
    role: "Code reviewer",
    purpose: "Review code for correctness, clarity, and maintainability. Improve team quality standards.",
    tone: "Precise and constructive",
    style: "Line-specific. Explains what is wrong and why. Suggests concrete improvements.",
    mission: "Raise the quality bar on every PR without creating friction that slows the team down.",
  },
  "legal-assistant": {
    role: "Legal research assistant",
    purpose: "Summarize legal concepts, cases, and documents accurately. Flag uncertainty explicitly.",
    tone: "Formal and precise",
    style: "Structured. Citations included. Never overstates confidence.",
    mission: "Help the team understand the legal landscape without overstepping into legal advice.",
  },
  "data-analyst": {
    role: "Data analyst",
    purpose: "Turn raw data into clear, actionable insights. Explain methodology so findings are trustworthy.",
    tone: "Clear and methodical",
    style: "Numbers-first. Caveats stated. Conclusions separated from observations.",
    mission: "Make data legible and decisions better.",
  },
  "product-manager": {
    role: "Product manager",
    purpose: "Define what to build and why. Align engineering, design, and business on clear priorities.",
    tone: "Clear and decisive",
    style: "User-needs first. Trade-offs made explicit. No requirements that cannot be tested.",
    mission: "Ship the right thing, not just the next thing.",
  },
  custom: {
    role: "",
    purpose: "",
    tone: "Direct",
    style: "Clear and concise.",
    mission: "",
  },
};

function buildTemplate(name: string, role: TemplateRole, defaults: Partial<Record<string, unknown>>): string {
  const r = defaults.role as string;
  const purpose = defaults.purpose as string;
  const tone = defaults.tone as string;
  const style = defaults.style as string;
  const mission = defaults.mission as string;

  return `---
spec: "0.2"
version: "1.0.0"

identity:
  name: "${name}"
  role: "${r}"
  purpose: "${purpose}"
  self_concept: "TODO: how does this agent understand itself?"

character:
  values:
    - "TODO: first core value"
    - "TODO: second core value"
  principles:
    - "TODO: first behavioral principle"
    - "TODO: second behavioral principle"

personality:
  tone: "${tone}"
  style: "${style}"
  traits:
    - "TODO: first observable trait"
    - "TODO: second observable trait"
  formality: "semi-formal"

cognition:
  reasoning_style: "TODO: dominant reasoning approach"
  epistemic_stance: "TODO: how it handles knowledge and uncertainty"
  handles_uncertainty: "TODO: explicit behavior when uncertain"

affect:
  baseline: "TODO: resting emotional register"
  frustration_response: "TODO: how it behaves when stuck"
  conflict_response: "TODO: how it handles disagreement"

drives_values:
  mission: "${mission}"
  goals:
    - "TODO: first concrete goal"
    - "TODO: second concrete goal"
  valueHierarchy:
    - "TODO: highest priority value"
    - "TODO: second priority value"

normative_self_reg:
  principledRefusals:
    - "Will not TODO: first principled refusal"

memory:
  session_retention: "TODO: what persists within a session"
  cross_session: "TODO: what persists across sessions, or limitation if none"

metacognition:
  selfModel: "TODO: how this agent understands itself and its limitations"
  uncertaintyCalibration: "TODO: how it distinguishes confident from uncertain claims"

persona:
  voice: "TODO: how it sounds to the people it interacts with"
  presentation: "TODO: how it introduces and positions itself"
---

TODO: Add a Markdown body describing this persona — its use cases, when to use it, and when not to.
`;
}

export const initCommand = new Command("init")
  .description("Create a new PERSONA.md in the current directory")
  .option("-f, --force", "Overwrite existing PERSONA.md")
  .action(async (opts: { force?: boolean }) => {
    const outPath = resolve(process.cwd(), "PERSONA.md");

    if (existsSync(outPath) && !opts.force) {
      const overwrite = await confirm({
        message: "PERSONA.md already exists. Overwrite?",
        default: false,
      });
      if (!overwrite) {
        console.log(chalk.dim("Aborted."));
        process.exit(0);
      }
    }

    console.log("");
    console.log(chalk.bold("Creating PERSONA.md"));
    console.log(chalk.dim("Fields marked TODO need to be filled in manually.\n"));

    const name = await input({
      message: "Agent name:",
      validate: (v) => (v.trim().length > 0 ? true : "Required"),
    });

    const role = await select({
      message: "Start from a template:",
      choices: TEMPLATE_ROLES.map((r) => ({ value: r, name: r })),
    });

    const defaults = {
      ...ROLE_DEFAULTS[role],
      role: role === "custom" ? await input({ message: "Role (one line):" }) : ROLE_DEFAULTS[role].role,
      purpose: role === "custom" ? await input({ message: "Purpose:" }) : ROLE_DEFAULTS[role].purpose,
      mission: role === "custom" ? await input({ message: "Mission:" }) : ROLE_DEFAULTS[role].mission,
    };

    const content = buildTemplate(name, role, defaults);
    writeFileSync(outPath, content, "utf-8");

    console.log("");
    console.log(chalk.green("✓"), chalk.bold("PERSONA.md created"));
    console.log(chalk.dim("  Edit the TODO fields, then run:"));
    console.log(chalk.cyan("  personaxis validate"));
    console.log(chalk.dim("  When valid:"));
    console.log(chalk.cyan("  personaxis compile --target claude-code"));
  });
