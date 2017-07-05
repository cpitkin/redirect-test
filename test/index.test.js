'use strict';

const test = require('ava');
const restify = require('restify');
const execa = require('execa');

test.before(t => {
	const server = restify.createServer();
  
  server.get('/about-bob', (req, res, next) => {
    res.header('Location', 'https://bobsburgers.com/about/bob');
    res.send(301);
    return next();
  });

  server.get('/about-linda', (req, res, next) => {
    res.header('Location', 'https://bobsburgers.com/about/linda');
    res.send(301);
    return next();
  });

  server.listen(9090, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
});

test('No Options', async t => {
  execa('./bin/index.js', ['./test.csv', 'http://localhost:9090']).then(result => {
	   resolve(result.stdout);
  });
	// const value = await noOps();
	t.true(true);
});
