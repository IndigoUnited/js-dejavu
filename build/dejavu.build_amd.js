/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: '.',
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
    },
    name: 'dejavu',
    include: ['Class', 'AbstractClass', 'FinalClass', 'Interface', 'instanceOf']
})