module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce type enum
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'chore', // Changes to the build process or auxiliary tools
        'revert', // Reverts a previous commit
        'ci', // Changes to CI configuration files and scripts
        'build', // Changes that affect the build system or dependencies
      ],
    ],
    // Enforce max line length in commit body
    'body-max-line-length': [2, 'always', 100],
    // Enforce max line length in commit header
    'header-max-length': [2, 'always', 100],
    // Enforce lowercase for scope
    'scope-case': [2, 'always', 'lower-case'],
    // Enforce lowercase for subject
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    // Ensure subject doesn't end with period
    'subject-full-stop': [2, 'never', '.'],
    // Ensure subject is not empty
    'subject-empty': [2, 'never'],
    // Ensure type is not empty
    'type-empty': [2, 'never'],
  },
}
