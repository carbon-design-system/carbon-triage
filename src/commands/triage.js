/**
 * Copyright IBM Corp. 2019, 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

require('core-js/features/array/flat');

const Configstore = require('configstore');
const { prompt } = require('enquirer');
const ora = require('ora');
const packageJson = require('../../package.json');
const getGitHubClient = require('../tools/getGitHubClient');
const { clearConsole, print } = require('../tools/print');

const REPO_LIST = new Map([
  [
    'carbon-components',
    {
      owner: 'IBM',
    },
  ],
  [
    'carbon-components-react',
    {
      owner: 'IBM',
    },
  ],
  [
    'carbon-icons',
    {
      owner: 'IBM',
    },
  ],
  [
    'carbon-elements',
    {
      owner: 'IBM',
    },
  ],
  [
    'carbon-contribution',
    {
      owner: 'carbon-design-system',
    },
  ],
  [
    'carbon-website',
    {
      owner: 'carbon-design-system',
    },
  ],
  [
    'issue-tracking',
    {
      owner: 'carbon-design-system',
    },
  ],
]);

async function triage(args) {
  const client = await getGitHubClient();
  const conf = new Configstore(packageJson.name);

  clearConsole();

  if (conf.get('repos') !== undefined) {
    const answers = await prompt([
      {
        type: 'confirm',
        name: 'use-saved-settings',
        message: 'Would you like to use your saved settings?',
        initial: true,
        hint: JSON.stringify(conf.all),
      },
    ]);

    if (answers['use-saved-settings']) {
      return getIssues(client, conf.all);
    }
  }

  const keys = [...REPO_LIST.keys()];
  const answers = await prompt([
    {
      type: 'multiselect',
      name: 'repos',
      message: 'Choose some repos',
      initial: keys,
      choices: keys.map(repo => ({
        name: repo,
      })),
    },
    {
      type: 'list',
      name: 'keywords',
      message: 'Type comma-separated keywords you are interested in',
    },
  ]);

  conf.all = answers;

  return getIssues(client, conf.all);
}

async function getIssues(client, { repos, keywords }) {
  const spinner = ora();
  spinner.start('Looking up issues...');

  const allIssues = (await Promise.all(
    repos.map(async repo => {
      const { owner } = REPO_LIST.get(repo);
      const options = client.issues.listForRepo.endpoint.merge({
        repo,
        owner,
        assignee: 'none',
        state: 'open',
        sort: 'created',
      });
      const result = await client.paginate(options);
      return result.map(issue => ({
        ...issue,
        repo: options.repo,
        owner: options.owner,
      }));
    })
  )).flat();

  spinner.succeed();
  spinner.start('Filtering issues by keywords, comments, and labels...');

  const issues = allIssues.filter(repo => {
    if (repo.labels.length > 0 && repo.comments > 0) {
      return false;
    }

    if (repo.pull_request) {
      return false;
    }

    if (keywords.length > 0) {
      const title = repo.title.toLowerCase();
      const body = repo.body.toLowerCase();

      for (const keyword of keywords) {
        const value = keyword.toLowerCase();
        if (title.includes(value)) {
          return true;
        }
        if (body.includes(value)) {
          return true;
        }
      }

      return false;
    }

    return true;
  });

  spinner.succeed();

  for (const issue of pick(issues, 10)) {
    console.log(print`{title ${issue.title}} {repo [${issue.repo}]}`);
    console.log(print.dim('>'), print`{link ${issue.html_url}}`);
    console.log();
  }
}

function pick(collection, amount) {
  const result = Array(amount);
  for (let i = 0; i < amount; i++) {
    const index = Math.floor(Math.random() * (collection.length - 1));
    result[i] = collection[index];
  }
  return result;
}

module.exports = cli => {
  cli
    .usage('Usage: $0 [options]')
    .command('$0', 'get latest issues to triage', {}, triage);

  return cli;
};
