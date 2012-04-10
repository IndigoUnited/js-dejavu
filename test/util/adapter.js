/*jslint nomen:true*/
/*global window,navigator,document,global:true,define:true,require,expect,__dirname,process*/

if (!(typeof window !== 'undefined' && window.navigator && window.document)) { // Test if we are at command line

    var requirejs = require('../../vendor/r.js/dist/r.js');
    requirejs.config({
        baseUrl: __dirname + '/../',
        paths: {
            'amd-utils': '../vendor/amd-utils/src'
        },
        nodeRequire: require
    });

    define = requirejs;
    global.browser = false;
    global.expect = require('../../vendor/expect.js/expect.js');

    // change working directory due to some issues related with requirejs
    process.chdir(__dirname + '/..');

} else {

    global = window;
    global.expect = expect;
    global.browser = true;

    require({
        baseUrl : './',
        paths: {
            'amd-utils': '../vendor/amd-utils/src'
        },
        waitSeconds : (window.location.protocol === 'file:' || window.location.href.indexOf('://localhost') !== -1) ? 5 : 45, // Fail early locally
        urlArgs : 'bust=' + (+new Date())
    });
}

global.evaluated = true;