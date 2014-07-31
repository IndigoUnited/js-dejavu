#!/usr/bin/env node

/*jshint node:true*/

'use strict';

var fs = require('fs'),
    path = require('path'),
    escapeRegExp = require('mout/string/escapeRegExp'),
    defaultRC = {
        strict: true,
        locked: true
    },
    target;

// NOTE: There is not tests for this script
//       Change it with caution

// If module is being installed globably, abort
if ((new RegExp('^' + escapeRegExp(process.env.npm_config_prefix))).test(process.cwd())) {
    process.exit();
}

try {
    target = path.resolve(process.cwd(), '..');
} catch (e) {
    console.log('Could not store runtime configuration, please add .dejavurc manually if necessary');
}

// If the parent directory is not "node_modules", abort
if (path.basename(target) !== 'node_modules') {
    process.exit();
}

// Otherwise put the RC file in the imediate parent module
target = path.resolve(target, '../.dejavurc');
console.log('Saving runtime configuration in ' +  target);

try {
    // Check if RC file exists
    fs.statSync(target);
} catch (err) {
    // RC file does not exist, create the default one
    if (err.code === 'ENOENT') {
        fs.writeFileSync(target, JSON.stringify(defaultRC, null, '  '));
    }
}
