/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: '../dist',
    dir : '../dist',
    paths : {
        'amd-utils': '../vendor/amd-utils/src'
    },
    /*pragmas: {
        'strict': true
    },*/
    optimize: 'none',
    uglify: {
        beautify: false,
        unsafe : true
    }
})