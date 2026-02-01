---
applyTo: '**'
description: 'Guidelines for using GitHub MCP tools (mcp_github_*) within this repository'
---

## Overview

This file describes best practices and conventions for using MCP tools to interact with GitHub (fetching code, listing/opening/updating issues and pull requests, reading diffs/files, etc.). Follow these guidelines to avoid duplicate actions, reduce unnecessary calls, and operate securely.

## First Call: Get Context and Permissions

- Always call the API that returns the current user/context (e.g., an equivalent to `get_me`) early in workflows that make changes: this allows you to validate that the token/credentials have the necessary permissions (read, write, create PRs/issues).
- Make decisions based on actual permissions rather than assuming the account has access.

## Search vs Listing

- Use `list_*` endpoints for broad retrievals (e.g., getting all branches, all issues of a repository) when you need a complete set with simple filters.
- Use `search_*` when you need targeted queries (e.g., issues with specific text, PRs by author, code containing a string). The search API generally supports rich syntax and is more efficient for text-based filtering.
- Before creating an issue/PR, perform a search to avoid duplicates.

## Pagination and Limits

- Always paginate results when possible. Pages of 5-50 items are recommended depending on the use case. For paginated listings in UIs, prefer 5-10 per page for responsive UX.
- For analytical operations or batch scripts, use larger pages (up to the maximum allowed) with rate limit handling.
- Respect rate limit headers; implement exponential backoff in case of 429/limits.

## Issues

- Always run a search for similar content and titles before creating a new issue.
- When closing an issue via the API, if there's a supported reason, pass the appropriate `state_reason` (e.g., `duplicate`, `completed`).
- Fill in metadata (labels, assignees, milestone) when available — this facilitates automated triaging.

## Pull Requests

- Use `mcp_github_pull_request_read` / list APIs to gather information before creating or updating PRs.
- For complex reviews:
  1. Create a pending review (`pull_request_review_write` with `method: 'create'`).
  2. Attach review comments to the pending review (`add_comment_to_pending_review`) when applicable.
  3. Submit the review (`submit_pending`).
- To update a PR branch based on the base branch, use the dedicated tool that updates the PR branch (if available) and check the `expectedHeadSha` to avoid races.

## Reading Diffs / Files

- To show diffs, use `get_diff` (if available) to avoid downloading entire commits.
- To inspect changed files in a PR, use `get_files` and process only the necessary entries.

## Comments and Reviews

- When adding comments, include enough context (lines from the diff, reason for suggestion) and avoid trivial comments that add noise.
- When automating comments (bots), clearly mark the origin (e.g., `[bot]` in the body).

## Security and Sensitivity

- Never write or log tokens, secrets, or sensitive data in public comments or in issue/PR bodies.
- For content that might contain sensitive information (logs, dumps), send secure links or private artifacts when necessary.

## Recommended Parameters and Conventions

- Always pass `owner` and `repo` explicitly (do not rely on implicit global context).
- When possible, enable `minimal_output` to reduce payloads and speed up read operations.
- Prefer idempotent operations when possible (avoid creating multiple resources on retries without checking existence).

## Performance Best Practices

- Parallelize independent reads (e.g., fetching status of multiple PRs) but limit concurrency to avoid triggering rate limits.
- Cache results of frequent queries for short periods (e.g., 30s) when appropriate.

## Example Flow (Summary)

1. Check current user permissions.
2. Search for similar issues/PRs (use `search_*`).
3. If no duplicates: create issue/PR with metadata.
4. For automated review: create pending review, add comments, submit review.
5. When closing issues/PRs, log `state_reason` if supported.

## Errors and Handling

- Handle HTTP errors clearly: 401 (credentials), 403 (permissions), 404 (resource not found), 409 (conflict), 429 (rate limit), and 5xx (server failures).
- For transient errors (5xx, 429), try retrying with exponential backoff. For permanent errors (401/403/404), fail fast and report the reason.