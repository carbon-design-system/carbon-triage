/**
 * Copyright IBM Corp. 2019, 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');

const print = chalk.constructor();

print.link = print.underline.italic.dim;
print.repo = print.dim;
print.title = print.bold;
print.quote = print.italic;

function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
}

module.exports = {
  clearConsole,
  print,
};
