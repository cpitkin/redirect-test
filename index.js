#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const URL = require('url');
const csv = require('csv');
const request = require('request');
const _ = require('underscore');
const chalk = require('chalk');
const async = require('async');
const writeCSV = require('write-csv');
const isAbsoluteUrl = require('is-absolute-url');
const ora = require('ora');
const program = require('commander');
const pkgVersion = require('./package.json').version;

let fileName;
let siteUrl;
const updatedCSV = [];
const error = chalk.bold.red;
const good = chalk.bold.green;
const concurrency = program.number || 5;
const spinner = ora({ spinner: 'dots2', text: `Making HTTP(S) requests with concurrency ${concurrency}` });

const q = async.queue((urls, cb) => {
  let update;
  request({
    url: siteUrl + urls[0],
    method: 'get',
    headers: {
      'User-Agent': `Redirect Tester v${pkgVersion}`,
    },
    followRedirect: false,
  }, (err, res) => {
    if (err) {
      spinner.fail(error(err));
    } else {
      if (res.statusCode === 301) {
        const locPath = URL.parse(res.headers.location).pathname;
        if (locPath !== urls[1]) {
          update = {
            old: urls[0],
            new: urls[1],
            status_code: res.statusCode,
            actual_url: locPath,
          };
        }
      } else {
        update = {
          old: urls[0],
          new: urls[1],
          status_code: res.statusCode,
          actual_url: '',
        };
      }
      if (update) {
        updatedCSV.push(update);
      }
      cb(null, res);
    }
  });
}, concurrency);

q.drain = () => {
  if (_.isEmpty(updatedCSV) && !program.quite) {
    spinner.succeed(good('All links look good.'));
    spinner.succeed(good('No errors so nothing written to the csv file'));
  } else if (!program.quite) {
    spinner.fail(error('See errors in the csv file'));
    writeCSV(program.csv, updatedCSV);
  } else if (program.quite) {
    spinner.stop();
    writeCSV(program.csv, updatedCSV);
  }
};

function parseCsv(contents) {
  csv.parse(contents, (err, data) => {
    if (err) {
      console.error(error('Error: It looks like your file is either not a csv or has some bad formatting.'));
      program.help();
    } else {
      q.push(data);
      spinner.start();
    }
  });
}

function readFile(file) {
  fs.readFile(file, 'utf8', (err, contents) => {
    if (err) {
      console.error(error(err[0]));
    } else {
      parseCsv(contents);
    }
  });
}

program
  .version(pkgVersion)
  .usage('<file> <url> [options]')
  .description('Check a list of new URLs for 301 status code and path for correctness.')
  .option('-c, --csv <file>', 'Save the results to a csv file. Default: ./results.csv')
  .option('-q, --quite', 'Don\'t output error results to the terminal.')
  .option('-n, --number <integer>', 'Number of concurrent requests. Default: 5')
  .arguments('<file> <url>')
  .action((file, url) => {
    fileName = path.resolve(file.trim());
    siteUrl = url.trim();
  });

program.parse(process.argv);

if (!isAbsoluteUrl(siteUrl)) {
  console.error((error('Error: URL must be an absolute path. eg. https://www.example.com')));
  program.help();
} else if (!fs.existsSync(fileName)) {
  console.error((error('Error: File or directory doesn\'t exist.')));
  program.help();
} else {
  readFile(fileName);
}

program.csv = program.csv || './results.csv';

program.csv = path.resolve(program.csv.trim());
