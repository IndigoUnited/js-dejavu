/*jshint node:true*/
'use strict';

var fs         = require('fs'),
    path       = require('path'),
    deepMixIn  = require('amd-utils/object/deepMixIn'),
    rcFile     = path.join(process.cwd(), '/.dejavurc'),
    exported   = false,
    rc;

function requireLoose() {
    module.exports = require('./loose/main');
    exported = true;
}

function requireStrict() {
    module.exports = require('./strict/main');
    exported = true;
}

try {
    // Check if RC file exists
    fs.statSync(rcFile);
} catch (e) {
    // RC file does not exist, use loose build by default
    requireLoose();
}

if (!exported) {
    // Try to parse the RC file
    try {
        // Read RC file
        rc = JSON.parse(fs.readFileSync(rcFile));

        // Include build accordingly
        if (rc.strict) {
            requireStrict();
        } else {
            requireLoose();
        }
        delete rc.strict;

        // Parse options
        module.exports.options = deepMixIn(rc);
    // Error parsing RC file
    } catch (err) {
        throw new Error('Invalid .dejavurc file: ' + err.message);
    }
}