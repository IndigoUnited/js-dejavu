/*jshint node:true, latedef:false*/

'use strict';

var fs = require('fs');
var glob = require('glob');
var async = require('async');
var path  = require('path');
var mkdirp = require('mkdirp');
var utils = require('mout');

var optimizer = require('../optimizer');

// TODO: don't change to the new automaton syntax for now, otherwise it will conflict with grunt
//       only do it when we automaton has compatibility with node-task
module.exports = {
    id          : 'dejavu-optimizer',
    author      : 'Indigo United',
    name        : 'dejavu optimizer',
    description : 'Optimize dejavu usages.',
    options: {
        files: {
            description: 'Which files should be optimized. Accepts an object in which keys are the source files and values the destination. Source values support minimatch.'
        },
        closure: {
            description: 'Optimize using closures. This has better performance for nodejs, chrome and safari but worst for Firefox and IE',
            'default': false
        },
        glob: {
            description: 'The options to pass to glob (check https://npmjs.org/package/glob for details).',
            'default': null
        }
    },
    tasks: [
        {
            task: function (opt, ctx, next) {
                opt.glob = opt.glob || {};
                var optimizerOpts = { closure: opt.closure },
                    sources = Object.keys(opt.files),
                    error;

                // Cycle through each source
                // Note that series is used to avoid conflicts between each pattern
                async.forEachSeries(sources, function (pattern, next) {
                    var dsts = utils.lang.isArray(opt.files[pattern]) ? opt.files[pattern] : [opt.files[pattern]];
                    dsts = utils.array.unique(dsts.map(function (dst) { return path.normalize(dst); }));
                    pattern = path.normalize(pattern);

                    // Expand the files
                    opt.glob.mark = true;
                    glob(pattern, opt.glob, function (err, matches) {
                        if (err) {
                            return next(err);
                        }

                        var files = matches.filter(function (match) {
                            return !/[\/\\]$/.test(match);
                        });

                        if (!files.length) {
                            error = new Error('ENOENT, no such file \'' + pattern + '\'');
                            error.code = 'ENOENT';
                            return next(error);
                        }

                        async.forEachLimit(files, 30, function (file, next) {
                            ctx.log.debugln('Optimizing file: ', file);

                            // Read source file
                            fs.readFile(file, function (err, contents) {
                                if (err) {
                                    return next(err);
                                }

                                // Optimize it
                                optimizer(contents.toString(), optimizerOpts, function (errors, contents) {
                                    // Print any non-destructive errors
                                    errors.forEach(function (err) {
                                        ctx.log.warnln(err.message);
                                    });

                                    // Save new contents for each dest
                                    var relative = relativePath(file, pattern);
                                    async.forEach(dsts, function (dst, next) {
                                        var dstFilePath = path.join(dst, relative);

                                        // Ensure the dest directory is created
                                        mkdirp(path.dirname(dstFilePath), function (err) {
                                            if (err) {
                                                return next(err);
                                            }

                                            // Finally save
                                            fs.writeFile(dstFilePath, contents, next);
                                        });
                                    }, next);
                                });
                            });
                        }, next);
                    });
                }, next);
            }
        }
    ]
};

/**
 * Gets the relative path of a file relative to the pattern.
 * For instance:
 *   file = /a/b.js
 *   pattern = /a/*
 *
 * Should return b.js
 *
 * @param {String} file    The file
 * @param {String} pattern The pattern
 *
 * @return {String} The relative path
 */
function relativePath(file, pattern) {
    var length = file.length,
        x;

    pattern = path.normalize(pattern);
    file = path.normalize(file);

    for (x = 0; x < length; x += 1) {
        if (file[x] !== pattern[x]) {
            return file.substr(x);
        }
    }

    return path.basename(file);
}
