# Commit Message Standards

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages. This ensures consistent, machine-readable commit history that can be used for automated changelog generation and semantic versioning.

## Quick Start

All commit messages must follow this format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Examples

```bash
# Good commits
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(credits): correct balance calculation for bulk purchases"
git commit -m "docs: update API documentation with new endpoints"
git commit -m "chore(deps): upgrade React to v18.3.0"

# Bad commits (will be rejected)
git commit -m "Updated code"  # No type
git commit -m "FEAT: new feature"  # Wrong case
git commit -m "feat: added new feature."  # Ends with period
```

## Commit Types

| Type       | Description                                         | Example                                                    |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `feat`     | New feature for the user                            | `feat(vessels): add vessel export functionality`           |
| `fix`      | Bug fix for the user                                | `fix(websocket): resolve reconnection race condition`      |
| `docs`     | Documentation only changes                          | `docs: add JSDoc to auth service methods`                  |
| `style`    | Code style changes (formatting, semicolons)         | `style: format code with Prettier`                         |
| `refactor` | Code changes that neither fix bugs nor add features | `refactor(credits): consolidate duplicate implementations` |
| `perf`     | Performance improvements                            | `perf(search): optimize vessel search query`               |
| `test`     | Adding or updating tests                            | `test(auth): add integration tests for login flow`         |
| `chore`    | Build process or auxiliary tool changes             | `chore(deps): update ESLint configuration`                 |
| `revert`   | Reverts a previous commit                           | `revert: feat(auth): add password reset`                   |
| `ci`       | CI/CD configuration changes                         | `ci: add automated test coverage reporting`                |
| `build`    | Build system or dependency changes                  | `build: configure Webpack for production`                  |

## Scope Guidelines

The scope is optional but recommended. It should indicate what part of the codebase is affected:

- **Feature scopes**: `auth`, `vessels`, `areas`, `credits`, `reports`, `fleet`, `investigations`
- **Technical scopes**: `api`, `db`, `websocket`, `ui`, `deps`, `config`
- **No scope**: Omit for changes that affect multiple areas

### Examples with Scope

```bash
# Feature-specific changes
git commit -m "feat(vessels): add real-time position updates"
git commit -m "fix(credits): prevent negative balance on deduction"

# Technical changes
git commit -m "chore(deps): upgrade Vite to v5.0.0"
git commit -m "test(api): add contract validation tests"

# Cross-cutting changes (no scope)
git commit -m "refactor: implement repository pattern across all services"
```

## Subject Rules

The subject line must:

1. **Be concise**: Limit to 50 characters (enforced at 100)
2. **Use imperative mood**: "add" not "added" or "adds"
3. **Start with lowercase**: "add feature" not "Add feature"
4. **No period at end**: "add feature" not "add feature."
5. **Be meaningful**: Explain what and why, not how

### Good vs Bad Subjects

```bash
# Good
feat(auth): add OAuth2 integration with Google
fix(credits): resolve race condition in balance updates
docs: clarify WebSocket reconnection behavior

# Bad
feat(auth): Added OAuth2  # Past tense
fix: bug fix  # Not descriptive
docs: Update docs.  # Has period, not specific
```

## Commit Body (Optional)

For complex changes, add a body to provide more context:

```bash
git commit -m "fix(websocket): implement operation queue for auth race condition

The WebSocket service was attempting to rejoin rooms before authentication
completed, causing 'User must be authenticated' errors. This fix:

- Adds an operation queue that delays room operations
- Flushes the queue after successful authentication
- Implements exponential backoff for auth retries

Closes #123"
```

## Footer (Optional)

Use footers for:

- **Breaking changes**: `BREAKING CHANGE: <description>`
- **Issue references**: `Closes #123`, `Fixes #456`
- **Co-authors**: `Co-authored-by: Name <email>`

### Breaking Change Example

```bash
git commit -m "refactor(api)!: change credit balance field names

BREAKING CHANGE: Changed 'current' to 'available' in credit balance API responses.
This aligns with financial industry standards and improves clarity.

Migration guide:
- Update all references from balance.current to balance.available
- Update API response handlers to use new field names"
```

## Multi-line Commits

For commits with body or footer, use git's multi-line format:

```bash
# Using -m multiple times
git commit -m "feat(reports): add PDF export functionality" \
  -m "Implements PDF generation for compliance and chronology reports using
  jsPDF. Includes custom templates and formatting options." \
  -m "Closes #789"

# Using editor (recommended for complex commits)
git commit  # Opens your default editor
```

## Commitlint Enforcement

All commits are validated by commitlint before they're accepted. If your commit is rejected:

1. Read the error message carefully
2. Fix the issue (usually type, format, or subject)
3. Try committing again

### Example Rejection

```bash
$ git commit -m "Updated auth logic"
⧗   input: Updated auth logic
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

husky - commit-msg hook exited with code 1 (error)
```

## Emergency Bypass

In rare cases where you need to bypass commitlint (not recommended):

```bash
# Bypass all hooks
git commit -m "emergency fix" --no-verify

# Better: Fix your commit message!
git commit -m "fix(auth): emergency patch for production login issue"
```

## Tips for Good Commits

1. **Commit often**: Small, focused commits are better than large, mixed ones
2. **One concern per commit**: Don't mix features, fixes, and refactoring
3. **Think about the reviewer**: Will they understand what and why?
4. **Think about future you**: Will you understand this in 6 months?
5. **Use the body**: Complex changes deserve explanation

## Integration with Tools

Our conventional commits enable:

- **Automated changelogs**: Generate CHANGELOG.md from commit history
- **Semantic versioning**: Determine version bumps from commit types
- **Better PR reviews**: Clear understanding of changes
- **Easy rollbacks**: Find and revert specific changes
- **Release notes**: Automated release note generation

## Common Patterns

### Feature Development

```bash
git commit -m "feat(vessels): add vessel search API endpoint"
git commit -m "test(vessels): add unit tests for vessel search"
git commit -m "docs(api): document vessel search endpoint"
```

### Bug Fixing

```bash
git commit -m "test(credits): add failing test for balance bug"
git commit -m "fix(credits): correct balance calculation logic"
git commit -m "test(credits): verify balance bug is fixed"
```

### Refactoring

```bash
git commit -m "test(auth): add tests for current implementation"
git commit -m "refactor(auth): extract auth logic to service"
git commit -m "test(auth): update tests for new structure"
```

## Questions?

- See [Conventional Commits Specification](https://www.conventionalcommits.org/)
- Check existing commits: `git log --oneline`
- Ask the team if unsure about type or scope

Remember: The goal is clear communication. When in doubt, err on the side of being more descriptive rather than less.
