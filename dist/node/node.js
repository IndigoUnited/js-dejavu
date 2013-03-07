/*jshint node:true*/
'use strict';

var fs        = require('fs'),
    path      = require('path'),
    deepMixIn = require('mout/object/deepMixIn'),
    rcFile,
    nextId = 0;

// The _dejavu object should ALWAYS be backwards compatible!
// Avoid changing this!
process._dejavu = process._dejavu || {
    caller: null
};

// Control the set of nextId to avoid users messing with it
// The class ids is what guarantees the visibility access control
if (!process._dejavu.hasOwnProperty('nextId')) {
    if (!Object.defineProperty) {
        process._dejavu.nextId = nextId;
    } else {
        Object.defineProperty(process._dejavu, 'nextId', {
            get: function () {
                return nextId;
            },
            set: function (newVal) {
                if (newVal <= nextId) {
                    throw new Error('Trying to mess with the class ids?');
                }

                nextId = newVal;
            },
            configurable: false,
            enumerable: true
        });
    }
}

function load() {
    var rc = process._dejavu.rc || {};

    // Include build accordingly
    if (rc.strict) {
        module.exports = require('./strict/main');
    } else {
        module.exports = require('./loose/main');
    }

    // Merge the options
    if (module.exports.options) {
        deepMixIn(module.exports.options, rc);
    }
}

// Check if version is cached
if (process._dejavu.rc) {
    load();
} else {
    // Check if there is a RC file in the cwd
    rcFile = path.join(process.cwd(), '.dejavurc');
    try {
        fs.statSync(rcFile);
    } catch (e) {
        rcFile = null;
    }

    // If something went wrong while reading the rc file (or if no rc file was found), we require the loose
    if (!rcFile) {
        process._dejavu.rc = { strict: false };
        load();
    } else {
        // Try to parse the RC file
        try {
            // Read RC file
            process._dejavu.rc = JSON.parse(fs.readFileSync(rcFile));
            load();
        // Error parsing RC file
        } catch (err) {
            throw new Error('Invalid .dejavurc file: ' + err.message);
        }
    }
}