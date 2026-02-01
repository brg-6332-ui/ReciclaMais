---
description: Prompt for implementing work on a GitHub Issue or Pull Request.
mode: agent
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'microsoft/playwright-mcp/*', 'github/*', 'executePrompt', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'github.vscode-pull-request-github/copilotCodingAgent', 'github.vscode-pull-request-github/issue_fetch', 'github.vscode-pull-request-github/suggest-fix', 'github.vscode-pull-request-github/searchSyntax', 'github.vscode-pull-request-github/doSearch', 'github.vscode-pull-request-github/renderIssues', 'github.vscode-pull-request-github/activePullRequest', 'github.vscode-pull-request-github/openPullRequest', 'extensions', 'todos', 'runTests']
---
# /implement (pr or issue no)

Purpose
-------
This prompt instructs an automated developer agent how to pick up and implement work for a given GitHub Issue or Pull Request (PR) number. The agent will use the MCP GitHub tools to discover related data (issue, PR, PR commits, comments, files changed), prepare a branch if needed, run tests/builds, implement changes, and update or create a PR.

Invocation
----------
Call the agent with the single argument: a numeric identifier that is either an Issue number or a Pull Request number. Example:

   /implement 123

Behavior / Checklist
--------------------
1. Validate input
   - Ensure the argument is a positive integer. If not, ask the user to provide a valid issue or PR number and stop.

2. GitHub context & permissions
   - Call the GitHub "get me" style endpoint to understand the current authenticated user and available permissions.
   - When the agent will run end-to-end validation, call the `github-pull-request_activePullRequest` tool (or equivalent) early to fetch the active PR context: PR title, body, changed files, head SHA, and referenced issues. Use this data to extract acceptance criteria, feature scope, and any explicit test steps contained in the PR or linked issue.

3. Discover issue ↔ PR links (must check both directions)
   - Attempt to read a PR with the provided number using the PR read tool.
   - Attempt to read an Issue with the provided number using the Issue read tool.
   - If one exists and the other does not, search for an associated counterpart.
   - When a PR is present the agent MUST scan the PR metadata and textual content for explicit linkers (for example: "Closes #72", "Fixes owner/repo#72", "Resolves #123"). The agent MUST look in this order and stop earlier if a clear "closes/fixes/resolves" match is found:
     1. PR body (primary source)
     2. PR title
     3. Commits on the PR head branch (commit messages)
     4. PR review comments and issue/PR comments
     5. Related merge commit messages if available

   - Use the following keyword list (case-insensitive) as linkers: closes, close, fixes, fix, resolves, resolve, resolved, addresses. Support common punctuation and spacing (for example "Fixes: #72", "closes owner/repo#72").

   - Pattern rules and extraction examples (implement as robust regex or equivalent parsing):
       - Pattern rules and extraction examples (implement as robust regex or equivalent parsing):
            - Recommended approach: build a case-insensitive extractor that matches the close/fix/resolve keywords followed by optional punctuation and either a local issue reference (for example: issue 123) or a full owner/repo reference (for example: owner/repo issue 123).
            - In plain terms, the extractor should accept forms like:
               - Closes issue 72 (local issue references)
               - Fixes owner/repo issue 72 (cross-repo references)
          - If implementing a regex, test it against PR bodies, commit messages, and comments to ensure it extracts either the local issue number or the explicit owner/repo + issue number.

   - If matches are found:
     - Extract all referenced issue numbers and owner/repo pairs.
     - For owner/repo references use the explicit owner/repo; otherwise assume the current repository.
     - For each referenced issue number, call the GitHub Issue read API and include the issue object in the agent's context for the rest of the flow.
     - If multiple issues are referenced, include and summarize all of them.

   - If you were given an issue: search for any PRs that reference or close that issue (use GitHub search / list tools). If multiple PRs reference the issue, prefer open PRs and the most recently updated.
   - If you were given a PR: in addition to the scan above, search the repository's issues for any issue that references this PR (or has the same number). Also read the PR body, commit messages, and comments for close-keyword patterns as described.

4. Summarize findings
   - Produce a concise summary describing: which object(s) exist (issue, PR, or both), PR state (open/closed/merged), branch name and head SHA, last commit(s) summary, any failing CI or outstanding review comments, and files modified in the PR (if present). Include the contents of any referenced issues discovered by the scan.

5. Branch strategy
   - If only an Issue exists and there is no associated PR:
     - Choose a branch name of the form: issue/<number>-short-slug (slugify the issue title to ~50 chars lower-case, alphanum and hyphens). Example: issue/123-fix-login-flow
     - If the current working branch (local or remote default branch context) already has that name or the issue is already being worked on in an existing branch, note that and switch to it if possible.
     - Otherwise create a new branch from the repository's main development branch (use repository default branch from the repo metadata). If the agent cannot perform VCS operations itself, describe exact git commands to run.

   - If a PR exists for the issue (or you were given a PR):
     - Read the PR details, the head branch and commits, the changed files and any review comments.
     - If the PR branch is stale (behind base) or CI failed, run the minimal steps to reproduce or fix (run tests, update dependency, rebase or merge base into branch as required). If you cannot rebase remotely, provide exact git commands and the rationale.

6. Development loop
   - Using the code from the repository, run tests and linters relevant to the project (describe/execute: pytest, npm/pnpm build, or other project-specific commands). If tests fail, report failing tests and make edits to fix them.
   - Make the smallest, well-scoped commit(s) to resolve the issue or move the PR forward. Each commit must have a clear message referencing the issue/PR number (e.g., "Fix spreadsheet upload null pointer — closes issue 123").
   - Run tests/lints again. Iterate until green locally.
   - After unit and integration tests are green, validate the implementation against the acceptance criteria using Playwright via the MCP browser tool. NOTE: if the repository does not include a Playwright test suite, do not expect automated test files — instead the agent MUST:
      1. Call `github-pull-request_activePullRequest` to learn what the active PR implements and to extract acceptance criteria and relevant changed UI files.
      2. Translate acceptance criteria into a small set of manual/interactive test flows (steps the user or browser must perform to validate the feature). For example, if the PR implements mobile responsiveness, an acceptance flow might open specific pages at different viewport sizes and verify layout/visibility of elements.
      3. Use the Microsoft Playwright MCP tool to spawn a browser driver and execute those scripted flows (navigate, interact, assert visible text/element positions, take screenshots/videos). Collect console logs, screenshots and video for failing or key steps.
      4. Attach or link all artifacts (screenshots, videos, logs) in the PR or final implementation summary. If validation fails, iterate fixes until acceptance criteria are satisfied.

7. Push & PR
   - If you created a new branch for an issue: push the branch and create a PR titled: "Implement: SHORT_ISSUE_TITLE (closes issue ISSUE_NUMBER)" with a descriptive body that links the issue and explains the changes.
   - If you continued an existing PR branch: push additional commits to that branch and update the PR with a comment summarizing the new commits and next steps.

8. Final deliverable
   - Post a final concise status: what was changed, test status, files touched, PR URL (created or updated), and suggested reviewers (if known from CODEOWNERS or repository conventions).
   - Include the Playwright MCP acceptance test results as part of the final deliverable: pass/fail summary, a link to the full test report or attached report files, and any failure screenshots/videos demonstrating the issue and the fix.

Edge cases & constraints
-----------------------
- If both an Issue and a PR exist but refer to different branches, prefer the PR's head branch for continuing work. Still read the Issue to ensure no missing context.
- If multiple PRs seem to implement the same issue, summarize differences and ask for human direction if the correct branch is ambiguous.
- If the agent lacks permissions to create branches or PRs, produce exact git and GitHub CLI or API commands the user (or CI) should run, including remote names and preferred base branch.
- Keep commits small, testable and well-documented. Mention the files changed and why.

Minimal output format (when run)
-------------------------------
When the prompt is executed the agent should produce, step-by-step, the following artifacts in this order:
1. Short summary of discovered objects (issue +/− PR) and repository/default branch.
2. The planned branch name and whether the agent will create or switch to it.
3. A short development plan (3 bullets max) describing next edits.
4. The patch/changes (or apply_patch actions if running in an environment that can edit files) with commit messages.
5. Test results after edits.
6. PR creation or update result (URL and summary) or exact commands to run if the agent cannot perform GitHub write actions.

Notes for implementers (agent hints)
----------------------------------
- Prefer reading PR files and diffs (file lists + diff) and the most recent commit messages to infer work already done.
- Use MCP GitHub tools to read issues/PRs, list branches, create PRs, and add comments. If you need to list PR files, use pull request read methods that expose files/diff.
- Follow repository conventions for branch naming, commit messages, and code style.

Safety & politeness
-------------------
- Always link created PRs to the original issue using "closes issue ISSUE_NUMBER" when the change completes the issue.
- If in doubt about large design changes, open a draft PR and request human guidance instead of pushing large unreviewed changes.

Example invocation summary
--------------------------
Input: `/implement 73`
Agent actions (high-level):
- Read issue 73 and check for PRs referencing it.
- If none, create branch `issue/73-add-mobile-responsiveness`, implement small UI changes, run frontend tests, push the branch, and open a PR titled:

      `Implement mobile-responsive UI across dashboard, landing page, and data components — closes issue 73`

- Run Playwright acceptance tests via the Playwright MCP tool to validate all acceptance criteria and attach the test report and any failure screenshots to the PR.

---
This prompt should be used when the user wants the agent to fully implement or continue implementing the work tracked by a single GitHub issue or PR number. The agent must use the repository's GitHub MCP tools to gather context, then either create or continue the PR, and report back with commits, tests, and PRs.