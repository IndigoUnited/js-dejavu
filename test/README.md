# Testing Classify #

You can test Classify directly in the command line (using node) or in the browser.
The tests are built on top of [mocha](http://visionmedia.github.com/mocha/) and the [expect.js](https://github.com/LearnBoost/expect.js) assert library.

## Command line ##

To test in the command line you:

1. Need to install [nodejs](http://nodejs.org)
2. Need to install [mocha](http://visionmedia.github.com/mocha/) (npm install -g mocha)
3. Can run mocha test/amd/scrict to test the [amd/strict](https://github.com/TrinityJS/Classify/tree/master/dist/amd/loose) build
4. Can run test/amd/loose to test the [amd/loose](https://github.com/TrinityJS/Classify/tree/master/dist/amd/loose) build

_Tip_: You can use mocha -R list [file] to give you a full list of the tests

## Browser: ##

* Run tester.html to test the diferent builds
