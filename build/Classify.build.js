/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: '../dist',
    dir : '../dist',
    paths : {
        'Trinity/Classify': 'Classify',
        'Utils': '../vendor/amd-utils/src'
    },
    modules: [{
        name: 'Trinity/Classify'
    }],
    pragmas: {
        'checks': true
    },
    optimize: 'uglify',
    uglify: {
        beautify: false,
        unsafe : true
    }
})