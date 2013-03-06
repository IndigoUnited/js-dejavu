/*jshint node:true*/

'use strict';

var dejavu = require('dejavu');
var Parent = require('../module_a/Parent');

// Force ids to increment
dejavu.Class.declare({});

module.exports = dejavu.Class.declare({
    $name: 'Child',
    $extends: Parent
});