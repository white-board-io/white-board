---
name: add-command-documentation
description: Workflow command scaffold for add-command-documentation in white-board.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-command-documentation

Use this workflow when working on **add-command-documentation** in `white-board`.

## Goal

Adds or updates a command documentation file for the white-board ECC bundle.

## Common Files

- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/refactoring.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a Markdown file in .claude/commands/ (e.g., feature-development.md, database-migration.md, refactoring.md)
- Commit the file with a message referencing the command and ECC bundle

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.