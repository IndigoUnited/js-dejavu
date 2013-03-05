/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir: '../../src',
    baseUrl: '.',
    dir: '../tmp',
    paths : {
        'almond': '../node_modules/almond/almond',
        'mout': '../node_modules/mout'
    },
    cjsTranslate: true,
    pragmas: {
        'strict': true,
        'regular': true,
        'amd': false,
        'node': false
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