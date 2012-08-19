if (!global.evaluated) {
    require('../util/adapter.js');
}

var path = 'amd/loose';

global.modules = [path + '/Class', path + '/AbstractClass', path + '/Interface', path + '/FinalClass', path + '/instanceOf'];
global.build = 'amd/loose';

// TODO: loose tests are not being run (only using mocha -R list) because the reference is cached
//       even if we actually do it, we cannot prevent the Function.prototype.$bound error for being thrown
/*if (!global.browser) {
    define.undef('specs/functional');
}*/

define(['specs/functional', 'specs/functional_optimized'], function () {});