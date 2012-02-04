# Testing Classify #

You can test Classify directly in the command line (using node) or in the browser.
The tests are built on top of [mocha](http://visionmedia.github.com/mocha/) test framework and the [expect.js](https://github.com/LearnBoost/expect.js) assert library.

## Command line ##

To test in the command line you:

1. Need to install [nodejs](http://nodejs.org)
2. Need to install [mocha](http://visionmedia.github.com/mocha/) (npm install -g mocha)

Then you can run all build tests individually:

* Run mocha test/amd/scrict.js to test the [amd/strict](https://github.com/TrinityJS/Classify/tree/master/dist/amd/loose) build
* Run test/amd/loose.js to test the [amd/loose](https://github.com/TrinityJS/Classify/tree/master/dist/amd/loose) build

_Tip_: You can use mocha -R list [file] to give you a full list of the tests.

## Browser ##

To test directly in the browser, simply run tester.html and select the build you want to test at the too menu.
