#!/usr/bin/env node

/*jshint node:true*/
'use strict';

var fs        = require('fs'),
    rcFile    = '.dejavurc',
    defaultRC = __dirname + '/../dist/node/.dejavurc';

console.log(process.env);

// if it's not possible to figure out the dir of the base package, abort
if (!process.cwd().match(/node_modules/)) {
    console.log('Could not figure package base dir: SKIPPING');
    process.exit();
}
else if (process.cwd().match(new RegExp('^' + process.env.npm_config_prefix))) {
    console.log('Module is being installed globally, could not figure out the base package dir');
    process.exit();
}
// if it's possible, then generate the filename of the rc file
else {
    rcFile = process.cwd().split(/node_modules/)[0] + rcFile;
    console.log('Figured package base dir:', rcFile);
}

try {
    // check if RC file exists
    fs.statSync(rcFile);
// RC file does not exist, create the default one
} catch (err) {
    // copy default file
    fs.createReadStream(defaultRC).pipe(fs.createWriteStream(rcFile));
}