# Testing dejavu #

You can test dejavu directly in the command line (using node) or in the browser.
The tests are built on top of [mocha](http://visionmedia.github.com/mocha/) test framework and the [expect.js](https://github.com/LearnBoost/expect.js) assert library.

## Command line ##

To test in the command line:

First run `npm install` to install all the tools needed.
Finally type `"node_modules/.bin/mocha" test/strict` to run the strict tests.
To run the loose tests type `"node_modules/.bin/mocha" test/loose`

If you got mocha installed globally you can also run `npm run-script test`.

_Tip_: You can use the `-R list [file]` option to give you a full list of the tests.

## Browser ##

To test directly in the browser, open tester.html and select the build you want to test at the top menu.