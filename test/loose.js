if (!global.evaluated) {
    require('./util/adapter.js');
}

var path = global.browser || process.argv.indexOf('--node') === -1 ? 'amd/loose' : 'node/loose';

global.modules = [
    path + '/Class',
    path + '/AbstractClass',
    path + '/Interface',
    path + '/FinalClass',
    path + '/instanceOf',
    path + '/options'
];
global.build = 'loose';

if (!global.browser) {
    console.log(path);
}

// As of requirejs 2.1 requirejs is also async in node
// But if we call it directly by id it has sync behavior
if (!global.browser) {
    define('specs/functional');
    define('specs/functional_optimized');
} else {
    define(['specs/functional', 'specs/functional_optimized']);
}