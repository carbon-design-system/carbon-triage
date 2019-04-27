/**
 * Copyright IBM Corp. 2019, 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const Octokit = require('@octokit/rest');
const { prompt } = require('enquirer');

async function getGitHubClient() {
  let { GH_TOKEN } = process.env;

  if (!GH_TOKEN) {
    const question = [
      {
        type: 'password',
        name: 'token',
        message: 'Provide a GitHub access token',
        hint:
          'Help: https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line',
      },
    ];
    const answers = await prompt(question);
    GH_TOKEN = answers.token;
  }

  const octokit = new Octokit({
    auth: `token ${GH_TOKEN}`,
  });

  try {
    await octokit.users.getAuthenticated();
    return octokit;
  } catch (error) {
    throw new Error('Invalid GitHub token');
  }
}

module.exports = getGitHubClient;
