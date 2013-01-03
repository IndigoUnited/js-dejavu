/*jshint node:true*/
'use strict';

var fs        = require('fs'),
    path      = require('path'),
    deepMixIn = require('amd-utils/object/deepMixIn'),
    exported  = false,
    rcFile,
    rc;

function requireLoose() {
    module.exports = require('./loose/main');
    exported = true;
}

function requireStrict() {
    module.exports = require('./strict/main');
    exported = true;
}

// Check if there is a RC file in the cwd
rcFile = path.join(process.cwd(), '.dejavurc');
try {
    fs.statSync(rcFile);
} catch (e) {
    if (e.code === 'ENOENT') {
        // If not, we require the loose
        requireLoose();
    }
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

        // Merge the options
        module.exports.options = deepMixIn(rc);
    // Error parsing RC file
    } catch (err) {
        throw new Error('Invalid .dejavurc file: ' + err.message);
    }
}