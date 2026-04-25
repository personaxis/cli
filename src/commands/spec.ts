import { Command } from "commander";

const SPEC_TEXT = `# PERSONA.md Specification v0.2

A PERSONA.md file defines who an AI agent is. It uses YAML frontmatter for
machine-readable fields and a Markdown body for human-readable rationale.
Both parts matter — the YAML is what agents parse; the prose is what humans
maintain.

## Required top-level fields

  spec: "0.2"       — spec version (quoted string)
  version: "1.0.0"  — persona version (semver)

## The ten layers (all required)

  Layer 1   identity           name, role, purpose, tagline, self_concept
  Layer 2   character          values[], principles[], virtues[]
  Layer 3   personality        tone, style, traits[], formality, humor, hexaco{}
  Layer 4   cognition          reasoning_style, epistemic_stance, handles_uncertainty
  Layer 5   affect             baseline, frustration_response, conflict_response
  Layer 6   drives_values      mission, goals[], valueHierarchy[], anti_goals[]
  Layer 7   normative_self_reg principledRefusals[], discrepancyFeedback, out_of_scope[]
  Layer 8   memory             session_retention, cross_session, semantic, procedural
  Layer 9   metacognition      selfModel, uncertaintyCalibration, metaVolitions[], driftMonitor
  Layer 10  persona            display_name, voice, presentation, adaptations{}

## Markdown body sections (optional — appear in this order)

  ## Overview              Who the agent is and what it is for
  ## Design rationale      Why specific YAML values were chosen
  ## When to use           Use cases where this persona is the right tool
  ## When not to use       Explicit out-of-scope contexts
  ## Do's and Don'ts       Behavioral guardrails for the user
  ## Working with this persona  How to get the best output
  ## Agent prompt guide    Prompt snippets for common invocation patterns
  ## Skills used           What each skill in the skills[] list does

The Design rationale section is the most important for long-term
maintainability. It explains the reasoning behind YAML values so future
editors understand what they are changing and why.

Full spec: https://github.com/personaxis/persona.md/blob/main/docs/SPEC.md`;

const RULES_TEXT = `
## Lint rules

  Rule                     Severity  What it checks
  ─────────────────────────────────────────────────────────────────────────
  missing-required-layers  error     Any of the 10 required YAML layers is absent
  todo-fields              warning   Any field value starts with "TODO"
  identity-completeness    warning   identity.name / role / purpose missing or empty
  spec-field               warning   'spec' field is missing from frontmatter
  version-field            warning   'version' field is missing from frontmatter
  refusals-present         warning   normative_self_reg.principledRefusals is empty
  drift-monitor            info      metacognition.driftMonitor is not defined
  layer-summary            info      Count of defined layers (always emitted)`;

const RULES_JSON = [
  { rule: "missing-required-layers", severity: "error",   checks: "Any of the 10 required YAML layers is absent" },
  { rule: "todo-fields",             severity: "warning",  checks: "Any field value starts with \"TODO\"" },
  { rule: "identity-completeness",   severity: "warning",  checks: "identity.name / role / purpose missing or empty" },
  { rule: "spec-field",              severity: "warning",  checks: "'spec' field is missing from frontmatter" },
  { rule: "version-field",           severity: "warning",  checks: "'version' field is missing from frontmatter" },
  { rule: "refusals-present",        severity: "warning",  checks: "normative_self_reg.principledRefusals is empty" },
  { rule: "drift-monitor",           severity: "info",     checks: "metacognition.driftMonitor is not defined" },
  { rule: "layer-summary",           severity: "info",     checks: "Summary of defined layers — always emitted" },
];

export const specCommand = new Command("spec")
  .description("Output the PERSONA.md specification — useful for injecting into agent prompts")
  .option("--rules", "Append the lint rules table")
  .option("--rules-only", "Output only the lint rules")
  .option("--format <format>", "Output format: text (default) or json", "text")
  .action((opts: { rules?: boolean; rulesOnly?: boolean; format: string }) => {
    if (opts.format === "json") {
      if (opts.rulesOnly) {
        process.stdout.write(JSON.stringify(RULES_JSON, null, 2) + "\n");
        return;
      }
      process.stdout.write(
        JSON.stringify({ spec: SPEC_TEXT, rules: opts.rules ? RULES_JSON : undefined }, null, 2) + "\n"
      );
      return;
    }

    if (opts.rulesOnly) {
      process.stdout.write(RULES_TEXT.trimStart() + "\n");
      return;
    }

    process.stdout.write(SPEC_TEXT + "\n");
    if (opts.rules) process.stdout.write(RULES_TEXT + "\n");
  });
