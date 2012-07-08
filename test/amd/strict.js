/*jslint node:true, sloppy:true*/
/*global define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/strict';
global.modules = [path + '/Class', path + '/AbstractClass', path + '/Interface', path + '/FinalClass', path + '/instanceOf', path + '/common/hasDefineProperty'];
global.build = 'amd/strict';

define(['../verifications', '../functional'], function () {});