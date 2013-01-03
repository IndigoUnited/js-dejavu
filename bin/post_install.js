#!/usr/bin/env node

/*jshint node:true*/
'use strict';

var fs        = require('fs'),
    path      = require('path'),
    defaultRC = {
        strict: true,
        locked: false
    },
    target;

// If module is being installed globably, abort
if ((new RegExp('^' + process.env.npm_config_prefix)).test(process.cwd())) {
    process.exit();
}

target = path.resolve(process.cwd(), '..');

// If the parent directory is not "node_modules", abort
if (path.basename(target) !== 'node_modules') {
    process.exit();
}

// Otherwise put the RC file in the imediate parent module
target = path.resolve(target, '../.dejavurc');
console.log('.dejavurc will be saved in' +  target);

try {
    // Check if RC file exists
    fs.statSync(target);
} catch (err) {
    // RC file does not exist, create the default one
    if (err.code === 'ENOENT') {
        fs.writeFileSync(target, JSON.stringify(defaultRC, null, '  '));
    }
}