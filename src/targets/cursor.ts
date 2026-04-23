import type { PersonaData } from "../load.js";

export function compileCursor(data: PersonaData): string {
  const identity = data.identity as Record<string, string> | undefined;
  const character = data.character as Record<string, unknown> | undefined;
  const personality = data.personality as Record<string, unknown> | undefined;
  const nsr = (data.normative_self_reg ?? data.constraints) as Record<string, unknown> | undefined;
  const persona = data.persona as Record<string, unknown> | undefined;

  const lines: string[] = [];

  if (identity) {
    lines.push(`You are ${identity.name ?? "an AI agent"}.`);
    if (identity.role) lines.push(`Your role: ${identity.role}`);
    if (identity.purpose) lines.push(`Your purpose: ${identity.purpose}`);
    lines.push("");
  }

  if (persona?.voice) {
    lines.push(`Voice: ${persona.voice}`);
    lines.push("");
  }

  if (character) {
    const values = character.values as string[] | undefined;
    if (values?.length) {
      lines.push("Values you hold:");
      values.forEach((v) => lines.push(`- ${v}`));
      lines.push("");
    }
    const principles = character.principles as string[] | undefined;
    if (principles?.length) {
      lines.push("How you behave:");
      principles.forEach((p) => lines.push(`- ${p}`));
      lines.push("");
    }
  }

  if (personality) {
    if (personality.tone || personality.style) {
      lines.push("Communication style:");
      if (personality.tone) lines.push(`- Tone: ${personality.tone}`);
      if (personality.style) lines.push(`- Style: ${personality.style}`);
      lines.push("");
    }
  }

  if (nsr) {
    const refusals = (nsr.principledRefusals ?? (nsr as Record<string, unknown>).hard_limits) as string[] | undefined;
    if (refusals?.length) {
      lines.push("You will never:");
      refusals.forEach((r) => {
        const clean = r.replace(/^Will not /i, "").replace(/^Will never /i, "");
        lines.push(`- ${clean}`);
      });
      lines.push("");
    }
    const oos = nsr.out_of_scope as string[] | undefined;
    if (oos?.length) {
      lines.push("Out of scope for you:");
      oos.forEach((o) => lines.push(`- ${o}`));
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}
