#!/usr/bin/env node

'use strict'

const program = require('commander');
const path = require('path');
const fs = require('fs');
const csv = require('csv');
const request = require('request');
const _ = require('underscore');
const chalk = require('chalk');
const async = require('async');
const writeCSV = require('write-csv');

// const limiter = new RateLimiter({
//   rate: 60,
//   interval: 1,
//   backoffCode: 429,
//   backoffTime: 10,
//   maxWaitingTime: 1800
// });

// program
//   .version('0.0.1')
//   .option('-i, --input <value>', 'required', 'path to csv file of redirects')
//   .option('-u, --url <value>', 'Root URL (example.com) to use in the redirects if not already in the csv file.')
//   // .option('-b, --bbq-sauce', 'Add bbq sauce')
//   // .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
//   .parse(process.argv);

let updatedCSV = [];

function testTheRequest(urls, cb) {
  let update = {};
  request({
    url: 'https://www.mckibbon.com' + urls[0],
    method: 'get',
    headers: {
      'User-Agent': 'Redirect Tester v0.0.1'
    },
    followRedirect: false
  }, (err, res) => {
    if(err){
      cb(err, null);
    } else {
      // console.log(res.headers.location);
      if(res.statusCode === 301) {
        // console.log(res.headers.location.split('.com')[1], urls[1]);
        let locPath = res.headers.location.split('.com')[1]
        if(locPath === urls[1]){
          update = {
            'old':urls[0],
            'new': urls[1],
            'status code': res.statusCode
          }
        } else {
          update = {
            'old':urls[0],
            'new': urls[1],
            'status code': res.statusCode,
            'actual': locPath
          }
        }
      }
      updatedCSV.push(update)
      cb(null, res)
    }
  });
};

fs.readFile(path.resolve('../301s.csv'), 'utf8', (err, contents) => {
  if(err){
    console.log(err);
  } else {
    csv.parse(contents, (err, data) => {
      if(err){
        console.log(err);
      } else {
        async.everyLimit(data, 5, (urls, cb) => {
          let update = {};
          request({
            url: 'https://www.mckibbon.com' + urls[0],
            method: 'get',
            headers: {
              'User-Agent': 'Redirect Tester v0.0.1'
            },
            followRedirect: false
          }, (err, res) => {
            if(err){
              cb(err, false);
            } else {
              // console.log(res.headers.location);
              if(res.statusCode === 301) {
                // console.log(res.headers.location.split('.com')[1], urls[1]);
                let locPath = res.headers.location.split('.com')[1]
                if(locPath === urls[1]){
                  update = {
                    'old':urls[0],
                    'new': urls[1],
                    'status code': res.statusCode
                  }
                } else {
                  update = {
                    'old':urls[0],
                    'new': urls[1],
                    'status code': res.statusCode,
                    'actual': locPath
                  }
                }
              }
              updatedCSV.push(update)
              cb(res, true)
            }
          });
        }),(err, res) => {
          console.log(err, res);
          // writeCSV('./results.csv', updatedCSV)
        };
      }
    });
  }
});
