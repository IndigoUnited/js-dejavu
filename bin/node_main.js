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

// Check if version is cached
if (process.env._DEJAVU_STRICT != null) {
    if (process.env._DEJAVU_STRICT) {
        requireStrict();
    } else {
        requireLoose();
    }

    // Merge the options
    if (process.env._DEJAVU_OPTIONS && module.exports.options) {
        deepMixIn(module.exports.options, process.env._DEJAVU_OPTIONS);
    }
} else {
    // Check if there is a RC file in the cwd
    rcFile = path.join(process.cwd(), '.dejavurc');
    try {
        fs.statSync(rcFile);
    } catch (e) {
        if (e.code === 'ENOENT') {
            // If not, we require the loose
            requireLoose();
            process.env._DEJAVU_STRICT = false;
        }
    }

    if (!exported) {
        // Try to parse the RC file
        try {
            // Read RC file
            rc = JSON.parse(fs.readFileSync(rcFile));

            // Include build accordingly
            if (rc.strict) {
                requireStrict(rc);
                process.env._DEJAVU_STRICT = true;
            } else {
                requireLoose(rc);
                process.env._DEJAVU_STRICT = false;
            }

            delete rc.strict;
            process.env._DEJAVU_OPTIONS = rc;

            // Merge the options
            if (module.exports.options) {
                deepMixIn(module.exports.options, rc);
            }
        // Error parsing RC file
        } catch (err) {
            throw new Error('Invalid .dejavurc file: ' + err.message);
        }
    }
}