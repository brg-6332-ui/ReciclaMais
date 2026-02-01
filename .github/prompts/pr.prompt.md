---
description: 'Review changes, push commits, and create pull request to the nearest branch.'
mode: 'agent'
tools: ['search', 'runCommands', 'usages', 'vscodeAPI', 'problems', 'fetch', 'githubRepo', 'github.vscode-pull-request-github/copilotCodingAgent', 'github.vscode-pull-request-github/issue_fetch', 'github.vscode-pull-request-github/suggest-fix', 'github.vscode-pull-request-github/searchSyntax', 'github.vscode-pull-request-github/doSearch', 'github.vscode-pull-request-github/renderIssues', 'github.vscode-pull-request-github/activePullRequest', 'github.vscode-pull-request-github/openPullRequest', 'todos']
model: GPT-5 mini (copilot)
---

## Purpose

This agent-oriented prompt generates a rich, well-structured Pull Request (PR) message and performs the minimal git steps to push and open the PR against the nearest release candidate branch (rc/**) or the default branch if no rc branch exists. The generated PR should follow the project's conventional-commit style and include detailed sections for reviewers, CI, and deployment notes so it reads like example below.

Use this prompt when you want the agent to:
- Examine local, staged and unstaged changes on the current branch
- Ensure commits are pushed (or prompt if interactive auth required)
- Construct a clear PR title (conventional-commit style) and a detailed body including motivation, implementation, testing, breaking changes, references, and 'closes' links
- Add recommended labels and checklist items, and suggest reviewers (do not request them)
- Create the PR using GitHub CLI or another configured workflow (the repository's helper scripts are preferred)
	- Prefer using the repository helper scripts in `.github/scripts/` for create/update/metadata collection and label management. Only run raw `git` or `gh` commands when the required workflow is not supported by the helper scripts or when an explicit dry-run/debug is requested.

## Agent contract (inputs / outputs / success criteria)

- Inputs: current git branch, diff from common ancestor with target branch, commit messages, available CI/deploy info (from remote checks), optional user-supplied PR body hints
-- Outputs: formatted PR title and body, list of suggested labels and assignees, GH CLI command used to create the PR. Reviewer suggestions are allowed but the agent must not request reviewers automatically.
-- Success: commits are pushed and a PR is created that targets the nearest `rc/**` branch (or `main` if none), and the PR body contains the sections described below

## Required PR body structure (must produce all these sections)

1. Short title using Conventional Commits (e.g. `feat(ui): add MaxQuantityButton and integrate in ItemEditModal`)
2. One-line summary (expanded subtitle) under the title
3. What was changed — bullet list of concrete file-level changes
4. Why — short bullet points with user-facing motivation
5. Implementation details — small technical notes, referenced functions and components
6. Breaking changes — list or `None` explicitly
7. Testing & QA — how to verify locally and CI expectations
8. Deployment & Preview notes — deployments, storybook or vercel/preview links when available
9. References — related prompts, docs, or issues
10. Closes — explicit issue references that will be closed on merge
11. Reviewed Changes (automatically produced summary table) — per-file brief notes suitable for reviewers and bots
12. Suggested Labels / Milestone / Projects — short form suggestions single-line each. The agent may suggest reviewer usernames or teams in the PR body but must not request them automatically.

The agent must also include a short footer with the GH CLI command to create the PR (or a helper-script invocation) and a reminder of any manual steps (auth, pushing tags, or uploading artifacts) required. The agent must not attempt to request reviewers automatically; it should only suggest reviewer names or teams.

Important: always include suggested labels in the helper-script invocation and in the returned `gh_command` so repository tooling can apply them without a second step.

## Example PR template produced by the agent (model)

Title:
feat(ui): add MaxQuantityButton and integrate in ItemEditModal for macro-based max input

Subtitle (one-line): Adds a reusable button to set the input to the max allowed quantity based on user macro targets and integrates it in the ItemEditModal.

What was changed
- Added `src/sections/common/components/MaxQuantityButton.tsx` (new component)
- Integrated `MaxQuantityButton` in `src/sections/food-item/components/ItemEditModal.tsx`
- Minor UI/import adjustments in `test-app.tsx`
- Added `.github/prompts/end-session.prompt.md` for session summary automation
- Small VSCode settings update for chat tool auto-approval

Why
- Improves UX by allowing quick selection of the maximum allowed food quantity based on personalized macro targets
- Keeps calculation logic modular and testable

Implementation details
- Max calculation uses latest weight and macro targets per-kg
- Button disabled when input is not applicable
- All new code is statically imported and follows existing conventions

Breaking changes
- None

Testing & QA
- Manual: Open ItemEditModal → for a food item with macros, click the MaxQuantityButton and verify the value matches expected max
- Automated: run `pnpm test` in `frontend/` and `poetry run pytest` in `backend/` (if available)
- CI: check that unit tests and lint pass; check Vercel/Netlify preview when available

Deployment & Preview
- Vercel preview available at: <deployment link, if CI shows a deployment>
- Merge to `rc/vX.Y.Z` will trigger staging deployment

References
- See `.github/prompts/end-session.prompt.md` for session summary helper

Closes
- closes #724 (MaxQuantityButton UI Component)

- closes <issue-number-here> (for example: issue 724 — MaxQuantityButton UI Component)

Reviewed Changes
| File | Summary |
| --- | --- |
| src/sections/common/components/MaxQuantityButton.tsx | New component that computes max quantity and sets input value |
| src/sections/food-item/components/ItemEditModal.tsx | Integrated MaxQuantityButton, minor position/style adjustments |
| .github/prompts/ui-component-issue.prompt.md | Added a new prompt to standardize UI component issues |

Suggested Reviewers / Labels / Projects
- Reviewers: @frontend-owner, @ux-team
- Labels: feature, ui, needs-review
- Milestone: rc/v0.11.0 (suggested)

GH CLI command (agent will run):
gh pr create --base <target-branch> --head $(git rev-parse --abbrev-ref HEAD) --title "<PR title>" --body-file <path-to-body-file> --labels <comma-separated-suggested-labels>

Note: replace `<target-branch>` with the nearest `rc/**` branch detected or `main` if none. If pushing is required the agent will run `git push --set-upstream origin $(git rev-parse --abbrev-ref HEAD)` first.

## Agent implementation notes & behavior

- The agent should attempt to locate the nearest remote `rc/*` branch name (use `git ls-remote --heads origin 'rc/*'` and pick the most recent semantic tag or `rc/v*` that matches the repo) and use it as the PR base. If none found, default to `main`.
- The agent MUST use the repository helper scripts in `.github/scripts/` for all supported actions. Do NOT run raw `git` or `gh` commands for operations the scripts cover. The scripts are the authoritative workflow for this repository and must be invoked directly from the agent's run (the agent may call the scripts or echo the exact script command it will run in `gh_command`).

1. Collect diagnostics and build/lint info using `.github/scripts/collect-pr-info.sh`  #file:../scripts/collect-pr-info.sh
2. Create or update the PR using `.github/scripts/create-pr.sh` (supports creation and editing of PR title/body and adding labels)  #file:../scripts/create-pr.sh
3. Apply PR metadata (add/remove labels, edit title/body) using `.github/scripts/add-pr-meta.sh`  #file:../scripts/add-pr-meta.sh

Only when a script cannot perform the required action (an explicit capability gap) or when running the script is impossible in the current environment, the agent MAY fall back to raw `git`/`gh` commands. In that case the agent MUST:

- include a short `fallback_reason` string in the JSON output explaining why the script could not be used (e.g., "missing gh on PATH", "script capability: merge-squash not supported")
- include the exact raw `gh`/`git` command(s) it executed or would execute in `gh_command`
- prefer presenting a helper-script invocation in `gh_command` when possible (for auditability)
- Collect commit messages since the common ancestor with the base branch and include a short summary list in the body.
- If there are unpushed commits, push them automatically. If push fails due to auth, print the exact git command and a short instruction to authenticate (e.g., run `gh auth login` or open the browser to authorize).
- If `gh` is not installed or configured, fall back to printing the `gh pr create ...` command and the prepared body file path.
- Add CI badges or deploy preview links when detected in remote checks (look up the PR checks or remote CI status via `gh` or CI API if available).
- Suggest reviewers and labels based on changed directories (e.g., changes in `frontend/` -> `@frontend-team`, changes in `backend/` -> `@backend-team`).

## Checklist the agent should run before creating the PR

- [ ] Lint & type checks (run `pnpm --prefix frontend run lint` and `poetry run mypy` or project equivalents when available)
- [ ] Unit tests (run fast test subsets: frontend unit tests and backend unit tests if quick)
- [ ] Build (frontend dev build or `pnpm --prefix frontend run build` if quick)
- [ ] Ensure no large artifacts (>5MB) are accidentally included
- [ ] Push branch to remote

## When to avoid auto-creating PRs

- When local changes include secrets, large media assets, or WIP debug code that mentions TODO/WIP
- When branch is behind by many commits and a rebase/merge commit is required — in that case prefer a manual PR creation with a suggested body

## Output format

The agent must return a JSON object (and write a temporary body file) with the following keys:

- title: string
- body_path: path to the temporary file containing the PR body
- base: chosen base branch
- head: current branch name
- labels: array of suggested labels
- gh_command: the exact GH CLI command used (or suggested)

When helper scripts are used, `gh_command` should contain the invoked helper-script command (for example: `.github/scripts/create-pr.sh --head <branch> --base <base> --title "<title>" --body /tmp/pr_body.md --labels feature,docs`). If the agent falls back to raw `gh` commands, include the full `gh pr create` command.

## Minimal example of agent run steps (what the agent will run)

1. Prefer helper scripts first (use these when available):

 - Collect diagnostics and quick build/lint info:
 `.github/scripts/collect-pr-info.sh`

 - Create or update a PR (script supports creation and label assignment):
 `.github/scripts/create-pr.sh --head $(git rev-parse --abbrev-ref HEAD) --base <base> --title "<title>" --body /tmp/pr_body.md --labels feature,docs`

 - Edit PR metadata (add/remove labels, edit title/body):
 `.github/scripts/add-pr-meta.sh --pr <number> --add-labels feature,docs --edit-title "New title"`

2. Fallback sequence (only when a script does not support the required action):

 a. git fetch origin --prune
 b. detect base branch (rc/* preferred)
 c. git merge-base --fork-point origin/<base> HEAD
 d. collect commits: git log <fork-point>..HEAD --oneline
 e. run lint/tests/build (best-effort)
 f. git push --set-upstream origin HEAD
 g. create PR with gh (example fallback):

gh pr create --base <target-branch> --head $(git rev-parse --abbrev-ref HEAD) --title "<title>" --body-file /tmp/pr_body.md --label feature --label docs

The agent should return the exact command it used (or would use) as `gh_command` in the JSON output. Reviewer assignment should be suggested in the PR body but performed manually or by a collaborator with permissions.

## Updating an existing PR

When the agent detects that a PR already exists for the current branch (or when instructed to update an existing PR number), prefer the helper scripts to perform edits rather than constructing raw `gh` commands.

- To update title and/or body using the create script's update mode:

	`.github/scripts/create-pr.sh --update <pr-number> --edit-title "New title" --edit-body /tmp/pr_body.md`

- To add/remove labels or make small edits to the PR metadata:

	`.github/scripts/add-pr-meta.sh --pr <pr-number> --add-labels feature,docs --remove-labels wip --edit-title "Refined title" --edit-body /tmp/pr_body.md`

- If a script cannot perform the required update (edge-case), use the fallback `gh pr edit` commands (ensure the branch is pushed first):

	`git push --set-upstream origin $(git rev-parse --abbrev-ref HEAD)`

	`gh pr edit <pr-number> --title "New title" --body-file /tmp/pr_body.md --add-label feature --remove-label wip`

Include the exact command used as `gh_command` in the JSON return so maintainers can reproduce or audit the change.

## Short note about auth and CI

If `gh pr create` fails due to missing auth, the agent should instruct the user to run `gh auth login` and provide the `git push` command for manual execution. If CI detects a preview deployment URL, include it in the PR body under Deployment & Preview.

---

Keep the prompt concise but specific — the goal is to make the PR created by automation as close as possible in clarity and usefulness to high-quality, manual PRs such as the example referenced above.

## Shell Invocation Policy

Agents must NOT invoke commands wrapped in a shell string like `bash -lc`, `sh -c`, or similar constructs. Using these wrappers was found to cause inconsistent environment inheritance, quoting/escaping issues, and surprising side-effects in CI and local automation. Follow these rules instead:

- Run scripts and commands directly using plain command arguments (no single-string shell wrappers). Example:
  - Good: `./.github/scripts/create-pr.sh --head ... --base ... --body /tmp/pr_body.md`
  - Bad: `bash -lc "./.github/scripts/create-pr.sh --head ... --base ... --body /tmp/pr_body.md"`
- Use absolute or repo-relative paths to scripts when invoking them in automation (e.g., `./.github/scripts/collect-pr-info.sh`) to avoid PATH surprises.
- Do not chain multiple independent operations in one shell string. Run commands separately so errors are surfaced and handled explicitly.
- If the runtime needs environment setup, prefer exporting explicit environment variables or calling a setup script that documents required env vars. Avoid implicit shell login/profile side-effects.
- If an agent cannot run a command directly (for example because interactive auth is required), it should surface the exact plain command the user should run (not wrapped in `bash -lc`) and instruct the user how to authenticate (for example, `gh auth login`).

Rationale: this policy improves reproducibility, avoids subtle quoting/escaping bugs, and makes command usage easier to audit and reproduce by humans or the helper scripts under `.github/scripts/`.
