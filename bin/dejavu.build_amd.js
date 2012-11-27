/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: '.',
    dir : '../dist',
    paths : {
        'amd-utils': '../components/amd-utils/src'
    },
    pragmas: {
        'strict': true,
        'regular': false
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