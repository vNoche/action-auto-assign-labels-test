const fs = require('fs-extra');
const path = require('path');
const getCommitsByType = require('./getCommitsByType');
const changelogJson = require('../changelog.json');
const argv = require('yargs/yargs')(process.argv.slice(2)).argv; // Pass in -u flag to 'yarn changelog' script in package.json in order to only show 'unreleased' commits.

/**
 * The final markup for the CHANGELOG.
 */
const createTaggedChangelog = () => {
  const { commits, title, date } = changelogJson[argv.tag];

  let body = `
| Change   | Type        | Jira task |
| :------- | :---------- | :-------- |`;

  const { feat, fix, enh, refactor, revert, chore, breaking } =
    getCommitsByType(commits);

  const createSection = (type, commitsList) => {
    const transformList = commitsList
      .map((commit) => {
        const { scopeText, description, ticketNumber } = commit;
        return `
| ${
          scopeText ? `**${scopeText}:**` : ''
        } ${description} | ${type} | **${ticketNumber}** |`;
      })
      .join('');

    return `${transformList}`;
  };

  if (breaking.length > 0) {
    body = body + createSection('BREAKING CHANGE', breaking);
  }

  if (feat.length > 0) {
    body = body + createSection('Feature', feat);
  }

  if (fix.length > 0) {
    body = body + createSection('Fix', fix);
  }

  if (enh.length > 0) {
    body = body + createSection('Enhancement', enh);
  }

  if (refactor.length > 0) {
    body = body + createSection('Refactor', refactor);
  }

  if (revert.length > 0) {
    body = body + createSection('Revert', revert);
  }

  if (chore.length > 0) {
    body = body + createSection('Chore', chore);
  }

  return `
## ${title} ${date ? `(${date})` : ''}
    ${body}`;
};

/**
 * Write to the file.
 */
fs.writeFileSync(
  path.resolve(__dirname, '.', 'TAGGEDCHANGELOG.md'),
  createTaggedChangelog(),
  {
    encoding: 'utf8',
  },
);
