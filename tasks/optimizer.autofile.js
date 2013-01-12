/*jshint node:true*/

'use strict';

var fs = require('fs');
var glob = require('glob');
var async = require('async');
var path  = require('path');
var utils = require('amd-utils');
var optimizer = require('../optimizer');

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
                            return !utils.string.endsWith(match, '/');
                        });

                        if (!files.length) {
                            error = new Error('ENOENT, no such file \'' + pattern + '\'');
                            error.code = 'ENOENT';
                            return next(error);
                        }

                        async.forEachLimit(files, 30, function (file, next) {
                            ctx.log.debugln('Optimizing file: ', file);

                            var contents = fs.readFile(file, function (err) {
                                if (err) {
                                    return next(err);
                                }

                                optimizer(contents, optimizerOpts, function (errors, contents) {
                                    errors.forEach(function (err) {
                                        ctx.log.warnln(err.message);
                                    });
                                    fs.writeFile(file, contents, next);
                                });
                            });
                        }, next);
                    });
                }, next);
            }
        }
    ]
};