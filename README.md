# @personaxis/persona.md

[![npm](https://img.shields.io/npm/v/@personaxis%2Fpersona.md)](https://www.npmjs.com/package/@personaxis/persona.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spec](https://img.shields.io/badge/spec-0.2.0-informational)](https://github.com/personaxis/persona.md/blob/main/docs/SPEC.md)

CLI for [PERSONA.md](https://github.com/personaxis/persona.md) — define, validate, lint, and compile AI agent personas.

Full documentation lives in the [PERSONA.md spec repository](https://github.com/personaxis/persona.md).

---

## Quick start

```bash
npx @personaxis/persona.md init
npx @personaxis/persona.md validate
npx @personaxis/persona.md lint
npx @personaxis/persona.md compile --target claude-code
```

Requires Node.js 18+.

---

## Commands

| Command | Description |
|---|---|
| `init` | Create a PERSONA.md interactively |
| `validate` | Schema validation — exits 1 if invalid |
| `lint` | Semantic lint — 8 rules, structured findings |
| `compile --target <t>` | Compile to `claude-code`, `cursor`, or `soul-md` |
| `export --format json` | Export frontmatter as JSON |
| `diff <before> <after>` | Compare two versions field by field |
| `spec` | Print the spec — useful for injecting into agent prompts |
| `use <template>` | Scaffold a persona from a template |
| `list` | List personas installed in this project |
| `templates` | List built-in templates |

See [github.com/personaxis/persona.md](https://github.com/personaxis/persona.md) for the full CLI reference, lint rules, programmatic API, and examples.

---

## License

MIT.
