/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir: '../src',
    baseUrl: '.',
    dir: '../tmp',
    paths : {
        'almond': '../node_modules/almond/almond',
        'amd-utils': '../components/amd-utils/src'
    },
    cjsTranslate: true,
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