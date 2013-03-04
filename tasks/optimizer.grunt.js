/*jshint node:true*/

'use strict';

var fs        = require('fs');
var async     = require('async');
var optimizer = require('../optimizer');

module.exports = function (grunt) {
    grunt.registerMultiTask('dejavuopt', 'Optimize dejavu usages.', function () {
        var options = this.options({
            closure: false
        }),
            files = [],
            done = this.async();

        grunt.verbose.writeflags(options, 'Options');

        // Foreach file pair
        this.files.forEach(function (filePair) {
            // Cycle through each src
            filePair.src.forEach(function (src) {
                // Ignore directories
                if (grunt.util._.endsWith(src, '/')) {
                    return;
                }

                // Add it to the files array to be processed later
                files.push({ src: src, dest: filePair.dest });
            });
        });

        // Parallelize in bulks of 30 files
        async.forEachLimit(files, 30, function (file, next) {
            grunt.log.debug('Optimizing file: ' + file.src);

            // Read source file
            fs.readFile(file.src, function (err, contents) {
                if (err) {
                    return next(err);
                }

                // Optimize it
                optimizer(contents.toString(), options, function (errors, contents) {
                    // Print any non-destructive errors
                    errors.forEach(function (err) {
                        grunt.log.writeln(err.message);
                    });

                    // Save new contents
                    fs.writeFile(file.dest, contents, next);
                });
            });
        }, function (err) {
            if (err) {
                grunt.log.error(err.message);
                return done(false);
            }

            done();
        });
    });
};