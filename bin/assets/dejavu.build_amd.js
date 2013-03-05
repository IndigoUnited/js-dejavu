/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../../src',
    baseUrl: '.',
    dir : '../dist',
    paths : {
        'mout': '../node_modules/mout/src'
    },
    pragmas: {
        'strict': true,
        'regular': false,
        'node': false,
        'amd': true
    },
    optimize: 'none',
    uglify: {
        beautify: false,
        unsafe : true
    },
    modules: [{
        name: 'dejavu'
    }]
})