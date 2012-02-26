/*jslint node:true, sloppy:true*/
/*globals define*/

if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = '../dist/amd/loose';
global.modules = [path + '/Class.js', path + '/AbstractClass', path + '/Interface', path + '/instanceOf', path + '/common/hasDefineProperty'];
global.build = 'amd/loose';
define(['../functional'], function () { });