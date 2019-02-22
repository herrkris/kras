#!/usr/bin/env node

import { runFromCli } from './kras-server';
import { defaultConfig } from './core/config';
import { author, krasrc } from './core/info';

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('c', 'config')
  .describe('c', `Sets the configuration file to use, by default ${krasrc}`)
  .number('p')
  .alias('p', 'port')
  .describe('p', `Sets the port of the server, by default ${defaultConfig.port}`)
  .string('n')
  .alias('n', 'name')
  .describe('n', `Sets the name of the server, by default ${defaultConfig.name}`)
  .string('d')
  .alias('d', 'dir')
  .describe('d', `Sets the base directory of the server, by default ${defaultConfig.directory}`)
  .string('cert')
  .describe('cert', `Sets the certificate of the server, by default ${defaultConfig.ssl.cert}`)
  .string('key')
  .describe('key', `Sets the key of the server, by default ${defaultConfig.ssl.key}`)
  .alias('l', 'log-level')
  .describe('l', `Sets the log level of the application, by default ${defaultConfig.logLevel}`)
  .choices('l', ['info', 'debug', 'error'])
  .boolean('skip-api')
  .describe('skip-api', 'If set avoids creating the management API endpoint')
  .version()
  .help('h')
  .alias('h', 'help')
  .describe('h', 'Shows the argument descriptions')
  .epilog(`Copyright (c) 2018 ${author}`).argv;

  runFromCli(
  {
    port: argv.p,
    name: argv.n,
    logs: argv.l,
    cert: argv.cert,
    key: argv.key,
    dir: argv.d,
    skipApi: argv.skipApi,
  },
  argv.c,
);
