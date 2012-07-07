/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: './',
    dir : '../tmp',
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
    },
    wrap: true,
    modules: [{
        name: 'dejavu',
        include: ['../vendor/almond/almond.js']
    }]
})