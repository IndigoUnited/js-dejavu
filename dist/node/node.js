/*jshint node:true*/
'use strict';

var fs     = require('fs'),
    rcFile = process.cwd() + '/.dejavurc',
    rc;

function requireLoose() {
    console.log('loose!!!');

    module.exports = require('./loose/main');
}

function requireStrict() {
    console.log('strict!!!!');

    module.exports = require('./strict/main');
}

try {
    // check if RC file exists
    fs.statSync(rcFile);

    // try to parse the RC file
    try {
        // read RC file
        rc = JSON.parse(fs.readFileSync(rcFile));

        // include build accordingly
        if (rc.strict) {
            requireStrict();
        } else {
            requireLoose();
        }
    // error parsing RC file
    } catch (err) {
        console.error('Invalid .dejavurc file:', err);
        process.exit();
    }

// RC file does not exist, use loose build by default
} catch (err) {
    requireLoose();
}
