if (!global.evaluated) {
    require('./util/adapter.js');
}

var path = global.browser || process.argv.indexOf('--node') === -1 ? 'amd/strict' : 'node/strict';

global.modules = [
    path + '/Class',
    path + '/AbstractClass',
    path + '/Interface',
    path + '/FinalClass',
    path + '/instanceOf',
    path + '/options',
    path + '/lib/hasDefineProperty',
    'assets/cases/Emitter'
];
global.build = 'strict';

if (!global.browser) {
    console.log(path);
}

// As of requirejs 2.1 requirejs is also async in node
// But if we call it directly by id it has sync behavior
if (!global.browser) {
    define('specs/verifications');
    define('specs/functional');
} else {
    define(['specs/verifications', 'specs/functional']);
}