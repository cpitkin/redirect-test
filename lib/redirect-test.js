(() => {
  'use strict';

  const path = require('path');
  const fs = require('fs');
  const csv = require('csv');
  const request = require('request');
  const _ = require('underscore');
  const chalk = require('chalk');
  const async = require('async');
  const writeCSV = require('write-csv');
  const isAbsoluteUrl = require('is-absolute-url');
  const Table = require("terminal-table");
  const ora = require('ora');

  let t = new Table({
    borderStyle: 3, 
    horizontalLine: true
  });

  t.insertColumn(0, ['Old'])
  t.insertColumn(1, ['New'])
  t.insertColumn(2, ['Status Code'])
  t.insertColumn(3, ['Actual URL'])
  t.attrRange({row: [0, 1]}, {align: 'center'});

  let updatedCSV = [];
  let error = chalk.bold.red;
  let good = chalk.bold.green;

  let spinner = ora({spinner: 'dots2', text: 'Making HTTP(S) requests with concurrency ' + concurrency})

  module.exports = rt = function(options) {
    var extend, type;
    rt = this;
    rt.options = options;
    return rt;
  };

  var q = async.queue((urls, cb) => {
    let update = {};
    request({
      url: siteUrl + urls[0],
      method: 'get',
      headers: {
        'User-Agent': 'Redirect Tester version:' + pkgVersion
      },
      followRedirect: false
    }, (err, res) => {
      if(err){
        spinner.fail(error('See error below'));
        console.error(error('ERROR: ' + err));
        program.help();
        cb(err, null);
      } else {
        if(res.statusCode === 301) {
          let locPath = res.headers.location.split('.com')[1]
          if(locPath === urls[1]){
            if(program.all) {
              t.insertRow(1, [urls[0], urls[1], res.statusCode, ''])
            }
            if(program.csv) {
              update = {
                'Old':urls[0],
                'New': urls[1],
                'Status Code': res.statusCode,
                'Actual URL': ''
              }
            }
          } else {
            if(program.csv) { 
              update = {
                'Old':urls[0],
                'New': urls[1],
                'Status Code': res.statusCode,
                'Actual URL': locPath
              }
            }
            if(program.all) {
              t.insertRow(1, [urls[0], error(urls[1]), res.statusCode, locPath])
            } else {
              t.insertRow(1, [urls[0], error(urls[1]), res.statusCode, locPath])
            }
          }
        }
        else {
          if(program.output) { 
            update = {
              'Old':urls[0],
              'New': urls[1],
              'Status Code': res.statusCodedfds,
              'Actual URL': ''
            }
          }
         t.insertRow(1, [error(urls[0]), urls[1], error(res.statusCode), ''])
        }
        updatedCSV.push(update)
        cb(null, res)
      }
    });
  }, rt.options.concurrency);

  q.drain = () => {
    if(updatedCSV.length > 1 && program.all !== true){
      spinner.succeed(good('All links look good.'))
    } else {
      if(!program.quite) {
        spinner.fail(error('See errors in red below'))
        console.log("" + t);
      }
    }
    if(_.isString(program.csv)) { 
      writeCSV(program.csv, updatedCSV)
    }
  }

  function parseCsv (contents) {
    csv.parse(contents, (err, data) => {
      if(err) {
        console.error(error('ERROR: It looks like your file is either not a csv or has some bad formatting.'));
        program.help();
      } else {
        q.push(data);
        spinner.start();
      }
    });
  }

  function readFile(file) {
    fs.readFile(file, 'utf8', (err, contents) => {
      if(err) {
        console.error(error('ERROR: ' + err[0]));
      } else {
        parseCsv(contents);
      }
    });
  }
}).call(this);
