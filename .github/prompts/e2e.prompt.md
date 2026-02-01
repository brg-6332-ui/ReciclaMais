---
description: Prompt for running Playwright end-to-end acceptance tests via Playwright MCP.
mode: agent
tools: ['edit', 'search', 'microsoft/playwright-mcp/*', 'github/add_issue_comment', 'github/assign_copilot_to_issue', 'github/get_commit', 'github/get_file_contents', 'github/get_label', 'github/get_latest_release', 'github/get_me', 'github/get_release_by_tag', 'github/get_tag', 'github/issue_read', 'github/issue_write', 'github/list_branches', 'github/list_commits', 'github/list_issue_types', 'github/list_issues', 'github/list_pull_requests', 'github/list_releases', 'github/list_tags', 'github/pull_request_read', 'github/pull_request_review_write', 'github/search_issues', 'github/search_pull_requests', 'github/sub_issue_write', 'github/update_pull_request', 'github/update_pull_request_branch', 'usages', 'think', 'problems', 'changes', 'openSimpleBrowser', 'todos']
---

# /e2e — Playwright acceptance test prompt

Purpose
-------
This prompt instructs an automated developer agent how to validate implementation acceptance criteria using the project's Playwright end-to-end tests. The agent will run Playwright via the Microsoft Playwright MCP tool, collect artifacts (reports, screenshots/videos), and include the results in the PR summary.

Invocation
----------
Call the agent with zero or more optional arguments:
- No args: run the full Playwright test suite.
- A single test path or glob: run a focused subset that maps to specific acceptance criteria (example: `tests/e2e/login.spec.ts`).

Examples
--------
/e2e
/e2e frontend/tests/e2e/dashboard.spec.ts

Behavior / Checklist
--------------------
1. Validate input
   - If provided, ensure an optional path argument is a valid file or glob in the repository. If invalid, return an error and list available test files.

2. Environment sanity
   - Confirm the environment and repo state needed to run Playwright tests (dependencies installed, dev server running if required, environment variables). If the test suite requires the frontend dev server or backend, start them following repository conventions (for example: `pnpm run dev` in `frontend/` and `docker compose up -d --build spreadsheet-analysis-backend`) or use the project's test harness.
   - Use the project's canonical commands where possible (see `frontend/package.json` scripts). Prefer local dev server + headless Playwright runs unless the project recommends otherwise.

3. Run Playwright via the Playwright MCP tool
    - Note: this repository may not include an automated Playwright test suite. When a suite does not exist, the agent MUST perform manual/interactive acceptance runs driven by the PR's acceptance criteria. To do this the agent MUST:
       1. Call `github-pull-request_activePullRequest` to fetch the active PR title, body, changed files, and any referenced issues. Extract the acceptance criteria, user-facing changes, and affected pages/components from that data.
       2. Translate acceptance criteria into one or more scripted interaction flows (step sequences) that a browser can perform to validate the feature. For example: open page X at width 375px, verify element Y is visible and stacked; resize to 1024px and verify layout changes; exercise navigation and confirm text/content.
       3. Use the Microsoft Playwright MCP tool to spawn a browser driver and execute those scripted flows programmatically (navigate, click, fill, assert). Run in headless mode unless visual debugging is required.
       4. Ensure the run collects console logs, screenshots for each step (and especially failures), and video recordings for failing flows when available. Save a short run log describing which acceptance criteria were validated and which steps passed or failed.
    - If an automated Playwright test suite does exist and a test path was provided, the agent may run the suite or subset instead, using HTML and JUnit reporters as usual.

4. Acceptance criteria mapping
   - For each acceptance criterion defined in the issue/PR, map it to one or more Playwright test cases (test file and test title). If any acceptance criteria have no mapped test, report this as part of the output and recommend cases to add.

5. Failure handling and artifacts
   - If any Playwright tests fail:
     - Collect screenshots and video recordings of failing runs.
     - Save the Playwright HTML report and JUnit XML report.
     - Capture the Playwright console output and the application logs (frontend/backend) for the duration of the failed run.
     - If failures are environmental (e.g., server not started, timeouts), retry once after attempting to start or fix the environment. If failures persist, provide a clear failure summary and attach artifacts.

6. Iteration & verification
   - If tests fail and the agent is allowed to edit code, attempt minimal, focused fixes that address flaky/wrong behavior. Re-run the Playwright acceptance runs until all acceptance criteria pass or edits are exhausted.

7. Integration with PR flow
   - Attach Playwright artifacts to the PR or include links to the stored reports in the PR comment. The final PR summary must include:
     - Pass/fail summary for Playwright acceptance tests
     - Links to HTML report and JUnit XML
     - Attached screenshots/videos for failures
     - The mapping of acceptance criteria -> tests executed

8. Output
   - Produce a concise, machine- and human-readable report that includes:
     - Which tests were run (file paths and test titles)
     - Overall pass/fail
     - For failures: failing test names, short stack traces, and links to artifacts
     - Environment used (browser, Playwright version, headless or headed)
     - Any retries performed and their outcome

Playwright run contract (recommended parameters)
-----------------------------------------------
- Browser: Chromium (default) unless tests require others
- Mode: headless when running via MCP in CI
- Reporters: html, junit
- Capture: screenshots on failure, record video on failure
- Timeouts: keep consistent with test suite defaults; if there are global timeouts configured in the project, use them

Artifacts to collect
--------------------
- `playwright-report/` (HTML report)
- `test-results/junit.xml` (JUnit XML)
- `artifacts/screenshots/*` for failed steps
- `artifacts/videos/*` for failed tests
- `logs/playwright-run.log` (console and agent output)

Security and side-effects
-------------------------
- Do not exfiltrate secrets. If the tests require credentials, use repository/CI secret injection only and avoid printing secrets to logs.
- For tests that perform destructive operations (delete, write), ensure they run against test fixtures or ephemeral environments.

Example Playwright MCP usage (high-level)
-----------------------------------------
- Start dependencies (if needed)
- Run Playwright MCP tool to execute tests with reporters and artifact capture
- Collect artifacts and attach to PR

Notes and troubleshooting
-------------------------
- If Playwright cannot reach the application, double-check the dev server host/port, CORS, and any environment variables required by the app.
- For flaky tests, prefer to make small test improvements (timeouts, robust selectors) rather than disabling tests.

Exit conditions
---------------
- Success: All acceptance criteria covered by Playwright tests pass and artifacts are attached to the PR.
- Partial: Some acceptance criteria have no tests; agent reports missing tests and includes Playwright run results for the mapped criteria.
- Failure: Playwright runs fail due to reproducible product bugs; agent includes artifacts and suggests next steps for developers.

Minimal output format (when run)
--------------------------------
1. Short summary (pass/fail, tests run count, artifacts path)
2. The list of acceptance criteria and the Playwright tests that validated each
3. Links to HTML report, JUnit XML, screenshots/videos (or attached files)
4. If edits were made: list of files changed and commit messages

--

When ready, please run `/e2e` with optional test path(s) to execute Playwright acceptance tests via Playwright MCP and return the summarized artifacts.
