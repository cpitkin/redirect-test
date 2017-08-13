## redirect-test

[![NPM version](https://img.shields.io/npm/v/redirect-test.svg?style=flat-square)](https://www.npmjs.com/package/redirect-test)
[![Build Status](https://travis-ci.org/cpitkin/redirect-test.svg?branch=master)](https://travis-ci.org/cpitkin/redirect-test)
[![Code Climate](https://codeclimate.com/github/cpitkin/redirect-test/badges/gpa.svg)](https://codeclimate.com/github/cpitkin/redirect-test)
[![Test Coverage](https://codeclimate.com/github/cpitkin/redirect-test/badges/coverage.svg)](https://codeclimate.com/github/cpitkin/redirect-test/coverage)
[![Issue Count](https://codeclimate.com/github/cpitkin/redirect-test/badges/issue_count.svg)](https://codeclimate.com/github/cpitkin/redirect-test)
[![Dependency Status](https://david-dm.org/cpitkin/redirect-test.svg)](https://david-dm.org/cpitkin/redirect-test)

URL must be the final URL for the site. If it is not the redirect will get caught to early by conditionals like non-www -> www and http -> https. Since this tool in not meant to test those types of redirects we don't include that in the input argument.

#### License

MIT © 2017 Charlie Pitkin
