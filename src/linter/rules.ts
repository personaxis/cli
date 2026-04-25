import type { Finding } from "./types.js";

export const REQUIRED_LAYERS = [
  "identity",
  "character",
  "personality",
  "cognition",
  "affect",
  "drives_values",
  "normative_self_reg",
  "memory",
  "metacognition",
  "persona",
] as const;

export type RequiredLayer = (typeof REQUIRED_LAYERS)[number];

function collectTodoFields(obj: unknown, path: string, out: Finding[]): void {
  if (typeof obj === "string") {
    if (obj.trimStart().startsWith("TODO")) {
      out.push({
        rule: "todo-fields",
        severity: "warning",
        path,
        message: "Field has a placeholder value — fill in before deploying.",
      });
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) collectTodoFields(obj[i], `${path}[${i}]`, out);
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      collectTodoFields(v, path ? `${path}.${k}` : k, out);
    }
  }
}

export interface RuleResult {
  findings: Finding[];
  presentLayers: string[];
  missingLayers: string[];
}

export function runRules(data: Record<string, unknown>): RuleResult {
  const findings: Finding[] = [];

  // missing-required-layers
  const presentLayers: string[] = [];
  const missingLayers: string[] = [];
  for (const layer of REQUIRED_LAYERS) {
    if (data[layer] && typeof data[layer] === "object") {
      presentLayers.push(layer);
    } else {
      missingLayers.push(layer);
      findings.push({
        rule: "missing-required-layers",
        severity: "error",
        path: layer,
        message: `Required layer '${layer}' is missing from the frontmatter.`,
      });
    }
  }

  // spec-field
  if (!data.spec || typeof data.spec !== "string") {
    findings.push({
      rule: "spec-field",
      severity: "warning",
      message: `'spec' field is missing. Add spec: "0.2" to declare which version this file conforms to.`,
    });
  }

  // version-field
  if (!data.version || typeof data.version !== "string") {
    findings.push({
      rule: "version-field",
      severity: "warning",
      message: `'version' field is missing. Add version: "1.0.0" to track persona versions.`,
    });
  }

  // identity-completeness
  const identity = data.identity as Record<string, unknown> | undefined;
  if (identity) {
    for (const field of ["name", "role", "purpose"] as const) {
      const val = identity[field];
      if (!val || typeof val !== "string" || !val.trim()) {
        findings.push({
          rule: "identity-completeness",
          severity: "warning",
          path: `identity.${field}`,
          message: `identity.${field} is missing or empty — one of the three required identity fields.`,
        });
      }
    }
  }

  // refusals-present
  const normReg = data.normative_self_reg as Record<string, unknown> | undefined;
  if (normReg) {
    const refusals = normReg.principledRefusals;
    if (!refusals || !Array.isArray(refusals) || refusals.length === 0) {
      findings.push({
        rule: "refusals-present",
        severity: "warning",
        path: "normative_self_reg.principledRefusals",
        message:
          "principledRefusals is empty. Without explicit refusals, the agent has no defined limits under pressure.",
      });
    }
  }

  // drift-monitor
  const meta = data.metacognition as Record<string, unknown> | undefined;
  if (meta && !meta.driftMonitor) {
    findings.push({
      rule: "drift-monitor",
      severity: "info",
      path: "metacognition.driftMonitor",
      message:
        "driftMonitor is not defined. Agents without it have no self-correction signal for behavioral drift over long conversations.",
    });
  }

  // todo-fields
  collectTodoFields(data, "", findings);

  // layer-summary (always last — info)
  const absent = missingLayers.length;
  findings.push({
    rule: "layer-summary",
    severity: "info",
    message:
      absent === 0
        ? `Persona defines all 10 required layers.`
        : `Persona defines ${presentLayers.length}/10 layers. Missing: ${missingLayers.join(", ")}.`,
  });

  return { findings, presentLayers, missingLayers };
}
