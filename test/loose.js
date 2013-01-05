if (!global.evaluated) {
    require('./util/adapter.js');
}

var path = (!(typeof window !== 'undefined' && window.navigator && window.document)) ? 'node/loose' : 'amd/loose';

global.modules = [
    path + '/Class',
    path + '/AbstractClass',
    path + '/Interface',
    path + '/FinalClass',
    path + '/instanceOf',
    path + '/options'
];
global.build = 'amd/loose';

// As of requirejs 2.1 requirejs is also async in node
// But if we call it directly by id it has sync behavior
if (!global.browser) {
    define('specs/functional');
    define('specs/functional_optimized');
} else {
    define(['specs/functional', 'specs/functional_optimized']);
}