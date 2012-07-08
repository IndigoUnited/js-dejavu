/*jslint node:true, sloppy:true*/
/*global define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/loose';
global.modules = [path + '/Class.js', path + '/AbstractClass', path + '/Interface', path + '/FinalClass', path + '/instanceOf'];
global.build = 'amd/loose';
define(['../functional'], function () {});