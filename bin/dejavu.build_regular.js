/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : '../src',
    baseUrl: '.',
    dir : '../tmp',
    paths : {
        'amd-utils': '../node_modules/amd-utils',
        'almond': '../node_modules/almond/almond'
    },
    pragmas: {
        'strict': true,
        'regular': true
    },
    optimize: 'none',
    uglify: {
        beautify: false,
        unsafe : true
    },
    wrap: {
        start: "(function() {",
        end: "\nrequire('dejavu', null, null, true);\n\n}());"
    },
    modules: [{
        name: 'dejavu',
        include: ['almond']
    }]
})