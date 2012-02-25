/*jslint node:true sloppy:true*/
/*globals define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/strict';
global.modules = [path + '/Class.js', path + '/AbstractClass', path + '/Interface', path + '/instanceOf'];
global.build = 'amd/strict';
define(['../verifications', '../functional'], function () { });