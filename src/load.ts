import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import matter from "gray-matter";

export interface PersonaData {
  [key: string]: unknown;
}

export interface LoadResult {
  data: PersonaData;
  raw: string;
  path: string;
}

export function loadPersonaFile(filePath?: string): LoadResult {
  const candidates = filePath
    ? [resolve(filePath)]
    : [
        resolve(process.cwd(), "PERSONA.md"),
        resolve(process.cwd(), "persona.md"),
      ];

  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    const searched = candidates.map((p) => `  ${p}`).join("\n");
    throw new Error(`No PERSONA.md found. Searched:\n${searched}`);
  }

  const raw = readFileSync(found, "utf-8");

  // Support both YAML frontmatter (---) and plain YAML
  if (raw.trimStart().startsWith("---")) {
    const parsed = matter(raw);
    return { data: parsed.data as PersonaData, raw, path: found };
  }

  // Plain YAML — import dynamically only if needed
  throw new Error(
    "PERSONA.md must use YAML frontmatter (delimited by ---).\n" +
      "See: https://github.com/personaxis/persona.md for the format."
  );
}
