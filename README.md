# personaxis

[![npm](https://img.shields.io/npm/v/personaxis)](https://www.npmjs.com/package/personaxis)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spec](https://img.shields.io/badge/spec-0.2.0-informational)](https://github.com/personaxis/persona.md/blob/main/docs/SPEC.md)

CLI for [PERSONA.md](https://github.com/personaxis/persona.md) — define, validate, and compile AI agent personas.

---

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
  - [list](#list)
  - [templates](#templates)
  - [init](#init)
  - [validate](#validate)
  - [compile](#compile)
  - [use](#use)
  - [diff](#diff)
  - [pull / push](#pull--push)
- [Examples](#examples)
- [How it fits together](#how-it-fits-together)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

No installation required for one-off use:

```bash
npx personaxis <command>
```

Or install globally:

```bash
npm install -g personaxis
personaxis <command>
```

Requires Node.js 18+.

---

## Commands

### list

List personas installed in this project (`.personaxis/personas/`).

```bash
personaxis list
```

Shows the personas that already exist locally in your project — their name, slug, and role. This is the equivalent of `npm list`: what you have, not what's available.

**Example output:**

```
Installed personas

  Maven               (marketing-guru)       Full-stack marketing professional
```

---

### templates

List built-in templates available for `personaxis use`.

```bash
personaxis templates
```

This is a fixed, small list of templates bundled in the CLI. Not the registry — just the ones you can use right now without an account.

**Example output:**

```
Built-in templates

  marketing-guru         Full-stack marketing professional for founders and small teams

Use a template:  personaxis use <template> [--target claude-code|cursor|soul-md]
Search registry: personaxis search <query>  (coming soon)
```

When new templates are added to the CLI, they appear here automatically.

---

### init

Create a PERSONA.md file interactively.

```bash
personaxis init [options]
```

**Options:**

| Flag | Description |
|---|---|
| `--agent` | Create a named agent persona instead of a project baseline |
| `-f, --force` | Overwrite an existing file |

**What it creates:**

`personaxis init` (no flags) creates a **project baseline** — a `PERSONA.md` at the project root that establishes the shared character, values, and limits for every agent in this project.

`personaxis init --agent` creates a **named agent persona** inside `.personaxis/personas/{slug}/PERSONA.md`. The wizard asks for the template first, then an optional name. Folder naming: `{template}` or `{template}_{name}` if a name is given.

**Example:**

```
$ npx personaxis init --agent

? Choose a template:
  > Marketing Guru — full-stack marketing professional
    Custom — blank template with TODO markers

? Agent name (optional — press Enter to skip): Maya

✓ Maya → .personaxis/personas/marketing-guru_maya/PERSONA.md
  All fields pre-filled. Review and adjust, then:
  personaxis validate .personaxis/personas/marketing-guru_maya/PERSONA.md
```

---

### validate

Validate a PERSONA.md against the spec schema.

```bash
personaxis validate [file]
```

`file` defaults to `./PERSONA.md` if omitted. Exits with code `0` if valid, `1` if invalid. Safe for CI pipelines.

**Examples:**

```bash
personaxis validate
personaxis validate .personaxis/personas/marketing-guru/PERSONA.md
```

---

### compile

Compile a PERSONA.md to a target format.

```bash
personaxis compile [file] --target <target> [options]
```

`file` defaults to `./PERSONA.md` if omitted.

**Targets:**

| Target | Output | Description |
|---|---|---|
| `claude-code` | `CLAUDE.md` or `.claude/agents/` | Claude Code integration |
| `cursor` | `.cursor/rules/persona.mdc` | Cursor IDE rules |
| `soul-md` | `SOUL.md` | OpenClaw agent framework |

**How `claude-code` works — root vs agent:**

- **Root** (`./PERSONA.md`): injects a `@PERSONA.md` reference section into `CLAUDE.md`. Does not dump the content — Claude reads the live file each session.
- **Agent** (path inside `.personaxis/personas/`): creates `.claude/agents/{slug}.md` — a Claude Code subagent with YAML frontmatter and full compiled content.

**Options:**

| Flag | Description |
|---|---|
| `-t, --target <target>` | Compile target (required) |
| `-o, --out <path>` | Override output path |
| `--stdout` | Print to stdout instead of writing a file |

**Examples:**

```bash
# Root PERSONA.md → reference in CLAUDE.md
personaxis compile --target claude-code

# Named agent persona → .claude/agents/marketing-guru.md
personaxis compile .personaxis/personas/marketing-guru/PERSONA.md --target claude-code

# Compile to Cursor rule
personaxis compile --target cursor
personaxis compile .personaxis/personas/marketing-guru/PERSONA.md --target cursor

# Compile to OpenClaw SOUL.md
personaxis compile --target soul-md

# Preview output
personaxis compile --target claude-code --stdout
```

---

### use

Create and optionally compile a template in one step — no wizard.

```bash
personaxis use <template> [options]
```

Run `personaxis templates` to see available options.

**Options:**

| Flag | Description |
|---|---|
| `-n, --name <name>` | Agent name (optional) |
| `-t, --target <target>` | Also compile after creating |
| `-f, --force` | Overwrite existing files |

**Examples:**

```bash
# Create marketing-guru persona
personaxis use marketing-guru

# Create and compile to Claude Code in one step
personaxis use marketing-guru --target claude-code

# With custom name
personaxis use marketing-guru --name Maya --target claude-code
# → .personaxis/personas/marketing-guru_maya/PERSONA.md
# → .claude/agents/marketing-guru_maya.md
```

---

### diff

Compare two versions of a PERSONA.md and report field-level changes.

```bash
personaxis diff PERSONA.md PERSONA-v2.md
```

Reports added, removed, and modified fields across all ten layers. Useful for reviewing changes before publishing a new version or auditing what changed between persona iterations.

**Example output:**

```
Diff: PERSONA.md → PERSONA-v2.md

  modified  character.values[0]        "Honesty over comfort" → "Precision over comfort"
  added     metacognition.driftMonitor  "When responses become more agreeable..."
  removed   persona.adaptations.early_ideation
```

Exit code `1` if there are breaking changes (required field removed or type changed), `0` otherwise.

---

### pull / push

> Registry commands — available when the Personaxis registry launches.

```bash
# Download a persona from the registry
personaxis pull marketing-guru
personaxis pull personaxis/marketing-guru@1.0.0

# Publish your persona to the registry
personaxis push
```

`pull` downloads a persona package into `.personaxis/personas/` and works exactly like `npm install` — by name, by `author/name`, or pinned to an exact version.

`push` publishes the persona in the current directory to the registry. Each push creates an immutable version. Requires authentication (`personaxis login`).

[Join the waitlist at personaxis.com](https://personaxis.com) to be notified when the registry launches.

---

## Examples

### Full workflow — project baseline + named agent

```bash
# 1. Create project baseline
npx personaxis init
# Edit PERSONA.md — fill in TODOs

# 2. Validate
personaxis validate

# 3. Wire into Claude Code
personaxis compile --target claude-code

# 4. See available agent templates
personaxis templates

# 5. Add a named agent in one step
personaxis use marketing-guru --target claude-code

# 6. See what's installed in this project
personaxis list
```

### CI validation

```yaml
name: Validate personas
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx personaxis validate
      - run: npx personaxis validate .personaxis/personas/marketing-guru/PERSONA.md
```

---

## How it fits together

```
PERSONA.md (source of truth)
    │
    ├── personaxis compile --target claude-code
    │       ├── root → CLAUDE.md (@PERSONA.md reference section)
    │       └── agent → .claude/agents/{slug}.md (subagent)
    │
    ├── personaxis compile --target cursor
    │       └── .cursor/rules/persona.mdc (alwaysApply: true)
    │
    └── personaxis compile --target soul-md
            └── SOUL.md (OpenClaw system prompt)
```

PERSONA.md is the source. Compiled outputs are regenerated when the source changes. Never edit compiled files directly.

---

## Contributing

Issues and PRs welcome at [github.com/personaxis/cli](https://github.com/personaxis/cli).

---

## License

MIT.
