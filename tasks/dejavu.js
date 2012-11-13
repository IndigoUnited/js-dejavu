/*jshint node:true, onevar:false*/

var path     = require('path');
var async    = require('async');
var contrib  = require('grunt-lib-contrib');
var cp       = require('child_process');

module.exports = function (grunt) {
    'use strict';

    // TODO: remove this when grunt v0.4 is released
    grunt.util = grunt.util || grunt.utils;

    // TODO: remove if node <= 0.7.9 is dropped
    path.sep = path.sep || path.normalize('/');

    grunt.registerMultiTask('dejavu', 'Optimize dejavu usages.', function () {
        var taskDone = this.async();
        var kindOf = grunt.util.kindOf;
        var helpers = contrib.init(grunt);
        var options = helpers.options(this, {
            exclude: [],
            basePath: false,
            minimatch: {}
        });

        // TODO: ditch this when grunt v0.4 is released
        this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

        grunt.verbose.writeflags(options, 'Options');

        var srcFiles;
        var destType;

        var basePath;
        var filename;
        var relative;
        var destFile;
        var srcFile;

        // Use the async awesome queue with 10 concurrency
        var queue = async.queue(function (task, next) {
            grunt.verbose.or.writeln('Optimizing file ' + task.src.cyan);

            if (task.dest === task.src) {
                grunt.fail.fatal('Source and destination files can\'t be equal.');
            }

            cp.exec('node ./node_modules/dejavu/bin/optimizer < ' + task.src + ' > ' + task.dest, function (error, stdout, stderr) {
                if (error) {
                    grunt.fail.fatal('Unable to optimize ' + task.src.cyan);
                }
                if (stderr) {
                    grunt.log.error(task.src + ' > ' + stderr);
                }
                next();
            });
        }, 10);

        queue.drain = function () {
            grunt.verbose.or.ok();
            taskDone();
        };

        this.files.forEach(function (file) {
            file.dest = path.normalize(file.dest);
            srcFiles = grunt.file.expandFiles(options.minimatch, file.src);

            if (srcFiles.length === 0) {
                grunt.fail.warn('Unable to optimize; no valid source files were found.');
                return;
            }

            destType = detectDestType(file.dest);

            if (destType === 'file') {
                if (srcFiles.length === 1) {
                    srcFile = path.normalize(srcFiles[0]);

                    if (!matchesExclude(srcFile, options.exclude)) {
                        queue.push({ src: srcFile, dest: file.dest });
                    }
                } else {
                    grunt.fail.warn('Unable to optimize multiple files to the same destination filename, did you forget a trailing slash?');
                }
            } else if (destType === 'directory') {
                basePath = helpers.findBasePath(srcFiles, options.basePath);

                grunt.verbose.writeln('Base Path: ' + basePath.cyan);

                srcFiles.forEach(function (srcFile) {
                    srcFile = path.normalize(srcFile);

                    if (matchesExclude(srcFile, options.exclude)) {
                        return;
                    }

                    filename = path.basename(srcFile);
                    relative = path.dirname(srcFile);

                    if (basePath && basePath.length >= 1) {
                        relative = grunt.util._(relative).strRight(basePath).trim(path.sep);
                    }

                    if (options.processName && kindOf(options.processName) === 'function') {
                        filename = options.processName(filename);
                    }

                    // Make paths outside grunts working dir relative
                    relative = relative.replace(/\.\.(\/|\\)/g, '');
                    destFile = path.join(file.dest, relative, filename);

                    queue.push({ src: srcFile, dest: destFile });
                });
            }
        }, function () {
            grunt.verbose.or.ok();
            taskDone();
        });
    });

    var detectDestType = function (dest) {
        if (grunt.util._.endsWith(dest, path.sep)) {
            return 'directory';
        } else {
            return 'file';
        }
    };

    var matchesExclude = function (file, exclude) {
        var x,
            length = exclude.length;

        for (x = 0; x < length; x += 1) {
            if (exclude[x].test(file)) {
                return true;
            }
        }

        return false;
    };
};