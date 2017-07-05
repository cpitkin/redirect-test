(() => {
  'use strict';

  const program = require('commander');
  const path = require('path');
  const pkgVersion = require(path.resolve('./package.json')).version;
  const rt = require('./redirect-test.js');

  let t = new Table({
    borderStyle: 3, 
    horizontalLine: true
  });

  t.insertColumn(0, ['Old'])
  t.insertColumn(1, ['New'])
  t.insertColumn(2, ['Status Code'])
  t.insertColumn(3, ['Actual URL'])
  t.attrRange({row: [0, 1]}, {align: 'center'});

  let fileName, siteUrl, concurrency;
  let updatedCSV = [];
  let error = chalk.bold.red;
  let good = chalk.bold.green;

  let spinner = ora({spinner: 'dots2', text: 'Making HTTP(S) requests with concurrency ' + concurrency})

  program
    .version(pkgVersion)
    .usage('<file> <url> [options]')
    .description('Check a list of new URLs for 301 status code and path for correctness.')
    .option('-c, --csv <file>', 'Save the results to a csv file.', path)
    .option('-q, --quite', 'Don\'t output error results to the terminal.')
    .option('-a, --all', 'Output all results to the terminal not just the errors.')
    .option('-n, --number <integer>', 'Number of concurrent requests. Default: 5', parseInt)
    .arguments('<file> <url>')
    .action(function (file, url) {
      fileName = path.resolve(file);
      siteUrl  = url;
    });

  program.parse(process.argv)

  if (!isAbsoluteUrl(siteUrl)) {
    console.error(error('ERROR: URL must be an absolute path. eg. https://www.example.com'));
    program.help();
  } else if (!fs.existsSync(fileName)) {
    console.error(error('ERROR: File or directory doesn\'t exists.'));
    program.help();
  } else {
    readFile(fileName);
  }

  if(program.number) {
    concurrency = program.number;
  } else {
    concurrency = 5;
  }
}).call(this);
