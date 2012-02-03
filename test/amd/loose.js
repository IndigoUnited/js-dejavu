/*jslint node:true, sloppy:true*/
/*globals define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/loose';
global.modules = [path + '/Class.js', path + '/AbstractClass', path + '/Interface'];
define(['../functional'], function () { });