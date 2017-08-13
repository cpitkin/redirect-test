const test = require('ava');
const restify = require('restify');
const execa = require('execa');
const path = require('path');
const fs = require('fs');
const csv = require('csv');

const index = path.resolve('../index.js');
const localhost = 'http://localhost:9090'

test.before('Start Restify server', () => {
  const server = restify.createServer();

  server.get('/about-bob', (req, res, next) => {
    res.header('Location', 'http://localhost:9090/about/bob');
    res.send(301);
    return next();
  });

  server.get('/about-lousie', (req, res, next) => {
    res.header('Location', 'http://localhost:9090/about-lousie');
    res.send(404);
    return next();
  });

  server.listen(9090, 'localhost', () => {
    console.log('%s listening at %s', server.name, server.url);
  });
});

test.after('Clean test files', () => {
  fs.unlinkSync(path.resolve('results.csv'));
});

test('URL must be an absolute path', (t) => {
  return execa.stderr(index, ['both.csv', 'example.com']).then((result) => {
    t.is(result, 'Error: URL must be an absolute path. eg. https://www.example.com');
  });
});

test('All links are good', (t) => {
  return execa(index, ['301.csv', localhost]).then((result) => {
    t.regex(result.stderr, /✔ All links look good\.\n✔ No errors so nothing written to the csv file/);
    t.is(result.stdout, '');
  });
});

test('Gives a 404', (t) => {
  return execa(index, ['404.csv', localhost]).then((result) => {
    t.is(result.stderr, '✖ See errors in the csv file');
    t.regex(result.stdout, /(DONE: Wrote).*(results\.csv)/);
  });
});

test('No terminal results', (t) => {
  return execa(index, ['both.csv', localhost, '-q']).then((result) => {
    t.is(result.stderr, '');
    t.regex(result.stdout, /(DONE: Wrote).*(results\.csv)/);
  });
});

test('Input file doesn\'t exist', (t) => {
  return execa.stderr(index, ['fileNotThere.csv', localhost]).then((results) => {
    t.is(results, 'Error: File or directory doesn\'t exist.');
  });
});

test.serial('Check CSV file', (t) => {
  t.plan(1);
  return execa(index, ['404.csv', localhost]).then((results) => {
    t.is(results.stderr, '✖ See errors in the csv file');
  });
});

test.serial.cb('Read the results CSV', (t) => {
  t.plan(1)
  fs.readFile(path.resolve('results.csv'), 'utf8', (error, contents) => {
    csv.parse(contents, (er, data) => {
      csv.stringify(data, (err, stringified) => {
        t.is(stringified, 'old,new,status_code,actual_url\n/about-lousie,/about/lousie,404,\n');
        t.end(err, stringified);
      });
    });
  });
});
