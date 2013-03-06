/*jshint node:true*/

'use strict';

var fs = require('fs');
var fstream = require('fstream');
var mkdirp = require('mkdirp');
var async = require('async');
var rimraf = require('rimraf');

describe('node_misc', function () {

    var module_a = __dirname + '/assets/module_a',
        module_b = __dirname + '/assets/module_b';

    function copyDir(src, dst, callback) {
        var stream = fstream.Reader({
            path: src
        }).pipe(
            fstream.Writer({
                type: 'Directory',
                path: dst
            })
        );

        stream
            .on('close', function () {
                stream.removeAllListeners();
                callback();
            })
            .on('error', function (err) {
                stream.removeAllListeners();
                callback(err);
            });
    }

    before(function (next) {

        // Recreate two dejavus in module_a and module_b
        var packageJSON = fs.readFileSync(__dirname + '/../package.json');

        async.parallel({
            'module_a': function (next) {
                rimraf(module_a + '/node_modules', function (err) {
                    if (err) {
                        return next(err);
                    }

                    // Copy dejavu to module_a
                    mkdirp(module_a + '/node_modules/dejavu/dist', function (err) {
                        if (err) {
                            return next(err);
                        }

                        copyDir(__dirname + '/../dist/node', module_a + '/node_modules/dejavu/dist/node', function (err) {
                            if (err) {
                                return next(err);
                            }

                            // Copy package.json
                            fs.writeFileSync(module_a + '/node_modules/dejavu/package.json', packageJSON);
                            next();
                        });
                    });
                });
            },
            'module_b': function (next) {
                rimraf(module_b + '/node_modules', function (err) {
                    if (err) {
                        return next(err);
                    }

                    // Copy dejavu to module_a
                    mkdirp(module_b + '/node_modules/dejavu/dist', function (err) {
                        if (err) {
                            return next(err);
                        }

                        copyDir(__dirname + '/../dist/node', module_b + '/node_modules/dejavu/dist/node', function (err) {
                            if (err) {
                                return next(err);
                            }

                            // Copy package.json
                            fs.writeFileSync(module_b + '/node_modules/dejavu/package.json', packageJSON);
                            next();
                        });
                    });
                });
            }
        }, next);

    });

    after(function (next) {
        async.parallel({
            'module_a': function (next) {
                rimraf(module_a + '/node_modules', next);
            },
            'module_b': function (next) {
                rimraf(module_b + '/node_modules', next);
            }
        }, next);

    });

    describe('node-misc', function () {

        var cwd = process.cwd();

        beforeEach(function () {
            process.chdir(cwd);
        });

        it('it should be able for a class to extend another even if loaded dejavu is not the same', function () {

            process.chdir(__dirname + '/assets/module_b/');

            var Child = require('./assets/module_b/Child'),
                child = new Child();

            child.setProp('bar');
        });

        it.skip('should set shared variables in process._dejavu');
        it.skip('should use self inspect');
    });

});