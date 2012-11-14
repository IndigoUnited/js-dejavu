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

    grunt.registerTask('default', 'getreadme markdown2html');
};