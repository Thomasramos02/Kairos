# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- PRDs use `.scratch/<feature-slug>/PRD.md`
- Implementation issues use `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Issue numbers start at `01`
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new markdown file under `.scratch/<feature-slug>/`, creating the directory if needed.

## When a skill says "fetch the relevant ticket"

Read the referenced markdown file. The user will normally provide the path or issue number directly.
