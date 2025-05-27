# Pre-Commit Hooks Documentation

## Overview

This project uses pre-commit hooks to ensure code quality and consistency before any code is committed to the repository. The hooks automatically run linting, formatting, and type checking on staged files.

## Technology Stack

- **Husky**: Git hooks management (v9.1.7)
- **lint-staged**: Run linters on staged files (v16.0.0)
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## What Happens on Commit

When you run `git commit`, the following checks are performed on staged files:

1. **ESLint** (for `.ts` and `.tsx` files):

   - Checks for code quality issues
   - Automatically fixes fixable issues
   - Enforces zero warnings policy (`--max-warnings=0`)
   - Prevents commits if any warnings or errors remain

2. **Prettier** (for all supported files):

   - Formats `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, and `.md` files
   - Ensures consistent code style across the project
   - Automatically applies formatting fixes

3. **TypeScript** (for TypeScript files):
   - Runs type checking on all `.ts` and `.tsx` files in `src/` and `server/`
   - Ensures no type errors exist in the codebase
   - Prevents commits if type errors are found

## Configuration

The configuration is defined in `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "*.{js,jsx,json,css,md}": [
    "prettier --write"
  ],
  "src/**/*.{ts,tsx}": [
    "bash -c 'npm run typecheck'"
  ],
  "server/**/*.ts": [
    "bash -c 'npm run typecheck'"
  ]
}
```

## Common Scenarios

### Commit Fails Due to ESLint Warnings

If your commit fails with ESLint warnings:

```bash
✖ eslint --fix --max-warnings=0:
/path/to/file.ts
  3:1  warning  Unexpected console statement  no-console
```

**Solution**: Fix the warning in your code. In this case, remove the console statement or use the logger service instead.

### Commit Fails Due to Type Errors

If your commit fails with TypeScript errors:

```bash
error TS2322: Type 'string' is not assignable to type 'number'.
```

**Solution**: Fix the type error in your code before committing.

### Formatting Changes Applied Automatically

When you commit, you might see:

```bash
[STARTED] prettier --write
[COMPLETED] prettier --write
```

This means Prettier has automatically formatted your code. The formatted changes are included in your commit.

## Bypassing Hooks (Emergency Only)

In rare cases where you need to bypass the hooks:

```bash
git commit --no-verify -m "Emergency fix"
```

**⚠️ Warning**: This should only be used in emergencies. Always ensure your code passes all checks.

## Setup for New Contributors

The hooks are automatically set up when you run `npm install` thanks to the `prepare` script in `package.json`:

```json
"scripts": {
  "prepare": "husky"
}
```

No additional setup is required.

## Troubleshooting

### Hooks Not Running

If hooks aren't running:

1. Ensure you've run `npm install`
2. Check that `.husky/` directory exists
3. Verify Git version is 2.9 or higher: `git --version`

### Performance Issues

If pre-commit hooks are slow:

1. Consider staging fewer files at once
2. Run `npm run lint` and `npm run format` before staging
3. Type checking can be slow on large changes

## Benefits

1. **Consistent Code Quality**: Every commit meets our quality standards
2. **No More "Fix Lint" Commits**: Issues are caught before commit
3. **Team Efficiency**: No time wasted on formatting discussions
4. **Reduced PR Review Time**: Automated checks catch common issues
5. **Better Git History**: Commits are always in a working state

## Related Documentation

- [ESLint Configuration](./.eslintrc.json)
- [Prettier Configuration](./.prettierrc)
- [TypeScript Configuration](./tsconfig.json)
- [Testing Standards](./TESTING-STANDARDS.md)
