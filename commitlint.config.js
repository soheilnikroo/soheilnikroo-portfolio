module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'git-changelog-trailer': [2, 'always'],
    'body-max-line-length': [0],
  },
  plugins: [
    {
      rules: {
        'git-changelog-trailer': ({ body }) => {
          /**
           * Changelog entries have this format:
           * - It should start with the `Changelog:` prefix (case-sensitive)
           * - Acceptable values after the prefix are: `added`, `fixed`, `changed`, `deprecated`, `removed`, `security`, `performance`, `other`
           *
           * For more information, see:
           * - https://docs.gitlab.com/ee/development/changelog.html
           */

          // Skip if the body is empty
          if (!body) {
            return [true];
          }

          // Split the body into lines
          const lines = body.split('\n');

          const CHANGELOG = 'changelog';
          // Check whether or not a line starts with the `Changelog:` prefix using a boolean (case-insensitive)
          const changelogLine = lines.find((line) =>
            line.toLowerCase().startsWith(CHANGELOG),
          );

          // Skip the rule if there is no changelog line
          if (!changelogLine) {
            return [true];
          }

          const CHANGELOG_PREFIX = 'Changelog:';

          // Check the prefix case-sensitivity
          const changelogIndex = changelogLine
            .toLowerCase()
            .indexOf(CHANGELOG_PREFIX.toLocaleLowerCase());

          const changelogPrefix = changelogLine.substring(
            changelogIndex,
            changelogIndex + CHANGELOG_PREFIX.length,
          );
          if (changelogPrefix !== CHANGELOG_PREFIX) {
            return [
              false,
              `Invalid Changelog prefix: "${changelogPrefix}". It should be "${CHANGELOG_PREFIX}".`,
            ];
          }

          // Check the Changelog value
          const changelogValue = changelogLine.substring(
            changelogIndex + CHANGELOG_PREFIX.length + 1,
          );
          const validValues = [
            'added',
            'fixed',
            'changed',
            'deprecated',
            'removed',
            'security',
            'performance',
            'other',
          ];
          if (!validValues.includes(changelogValue)) {
            return [
              false,
              `Invalid Changelog value: "${changelogValue}". Valid values are: ${validValues.join(
                ', ',
              )}\n
                Sample: ${CHANGELOG_PREFIX} ${
                  validValues[0]
                } (With a space after the colon)
                `,
            ];
          }

          // There is no error
          return [true];
        },
      },
    },
  ],
};
