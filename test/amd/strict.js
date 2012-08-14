if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = 'amd/strict';
global.modules = [path + '/Class', path + '/AbstractClass', path + '/Interface', path + '/FinalClass', path + '/instanceOf', path + '/common/hasDefineProperty'];
global.build = 'amd/strict';

define(['specs/verifications', 'specs/functional'], function () {});