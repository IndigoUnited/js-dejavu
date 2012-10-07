if (!global.evaluated) {
    require('./util/adapter.js');
}

var path = 'amd/loose';

global.modules = [
    path + '/Class',
    path + '/AbstractClass',
    path + '/Interface',
    path + '/FinalClass',
    path + '/instanceOf'
];
global.build = 'amd/loose';

define(['specs/functional', 'specs/functional_optimized'], function () {});