/**
 * Copyright IBM Corp. 2019, 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const cli = require('yargs');
const packageJson = require('../package.json');

async function main({ argv }) {
  cli.scriptName(packageJson.name).version(packageJson.version);

  const commands = [require('./commands/triage')];

  for (const setupCommand of commands) {
    setupCommand(cli);
  }

  cli
    .demandCommand()
    .recommendCommands()
    .strict()
    .parse(argv.slice(2)).argv;
}

module.exports = main;
