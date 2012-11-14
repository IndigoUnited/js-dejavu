/*jshint node:true onevar:false*/

// Dependencies
var fs    = require('fs');
var url   = require('url');
var https = require('https');
var md    = require('marked');

module.exports = function (grunt) {

    grunt.registerTask('getreadme', 'Downloads the dejavu README.md', function () {
        var file = fs.createWriteStream('dejavu_readme.md');
        var fileUrl = 'https://raw.github.com/IndigoUnited/dejavu/master/README.md';
        var taskDone = this.async();
        var options = {
            host: url.parse(fileUrl).host,
            path: url.parse(fileUrl).pathname
        };

        https.get(options, function (res) {
            res.on('data', function (data) {
                file.write(data);
            })
            .on('end', taskDone);
        });
    });

    grunt.registerTask('markdown2html', 'Converts the dejavu README.md into HTML', function () {
        // Set default options
        md.setOptions({
            gfm: true,
            pedantic: false,
            sanitize: true
        });

        var contents = fs.readFileSync('dejavu_readme.md').toString();
        var html = md(contents);


        fs.writeFileSync('tmpl/doc.tmpl', html);
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-mincss');
    grunt.loadNpmTasks('grunt-remove-logging');

    grunt.initConfig({
        clean: {
            dist: ['dist']
        },

        concat: {
            dist: {
                src: ['js/vendor/highlight.pack.js', 'js/main.js'],
                dest: 'dist/compiled.js'
            }
        },
        removelogging: {
            dist: {
                src: 'dist/compiled.js',
                dest: 'dist/compiled.js'
            }
        },

        min: {
            dist: {
                src: 'dist/compiled.js',
                dest: 'dist/compiled.min.js'
            }
        },

        // Requirejs is used to inline all the css's
        requirejs: {
            dist: {
                options: {
                    optimizeCss: 'standard.keepLines',
                    cssIn: 'css/main.css',
                    out: 'dist/compiled.css'
                }
            }
        },

        mincss: {
            dist: {
                src: 'dist/compiled.css',
                dest: 'dist/compiled.min.css'
            }
        }
    });

    grunt.registerTask('build', 'clean concat removelogging min requirejs mincss');
    grunt.registerTask('doc', 'getreadme markdown2html');
    grunt.registerTask('default', 'doc build');
};