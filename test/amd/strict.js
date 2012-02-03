/*jslint node:true, sloppy:true*/
/*globals define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/strict';
global.modules = [path + '/Class.js', path + '/AbstractClass', path + '/Interface'];
define(['../verifications', '../functional'], function () { });