/*jshint node:true*/

'use strict';

var fs = require('fs');
var path = require('path');
var fstream = require('fstream');
var mkdirp = require('mkdirp');
var async = require('async');
var rimraf = require('rimraf');

describe('node', function () {
    var dejavuPath = path.normalize(__dirname + '/../dist/node/node.js'),
        expect = require('expect.js');

    describe('load', function () {

        var cwd = process.cwd();

        beforeEach(function () {
            // Delete dejavu and require cache
            delete process._dejavu;
            delete require.cache[dejavuPath];
            process.chdir(cwd);
        });

        it('should load loose if no .dejavurc is found', function () {

            process.chdir(__dirname);
            var dejavu = require(dejavuPath);

            expect(process._dejavu.rc.strict).to.equal(false);
            expect(dejavu.mode).to.equal('loose');

        });

        it('should error on invalid .dejavurc', function () {

            process.chdir(__dirname + '/assets/invalid_rc');

            expect(function () {
                require(dejavuPath);
            }).to.throwException(/invalid \.dejavurc/i);

        });

        it('should load the loose version if set in the .dejavurc', function () {

            process.chdir(__dirname + '/assets/loose_rc');

            var dejavu = require(dejavuPath);

            expect(process._dejavu.rc.strict).to.equal(false);
            expect(dejavu.mode).to.equal('loose');

        });

        it('should load the strict version if set in the .dejavurc', function () {

            process.chdir(__dirname + '/assets/strict_rc');

            var dejavu = require(dejavuPath);

            expect(process._dejavu.rc.strict).to.equal(true);
            expect(dejavu.mode).to.equal('strict');

        });

        it('should merge the options', function () {

            process.chdir(__dirname + '/assets/strict_rc');

            var dejavu = require(dejavuPath);

            expect(process._dejavu.rc.locked).to.equal(false);

        });

        it('should load the cached version', function () {

            process.chdir(__dirname + '/assets/strict_rc');

            require(dejavuPath);

            // Force reload of dejavu but now from the loose
            delete require.cache[dejavuPath];
            process.chdir(__dirname + '/assets/loose_rc');

            var dejavu = require(dejavuPath);

            expect(process._dejavu.rc.strict).to.equal(true);
            expect(dejavu.mode).to.equal('strict');

        });

    });


    describe('misc', function () {

        var module_a = __dirname + '/assets/module_a',
            module_b = __dirname + '/assets/module_b',
            cwd = process.cwd();

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


        beforeEach(function () {
            process.chdir(cwd);
        });

        it('it should be able for a class to extend another even if loaded dejavu is not the same', function () {

            process.chdir(__dirname + '/assets/module_b/');

            var Child = require('./assets/module_b/Child'),
                child = new Child();

            child.setProp('bar');

        });

        it('should set shared variables in process._dejavu', function () {

            var dejavu = require(dejavuPath),
                SimpleClass = dejavu.Class.declare({
                    initialize: function () {
                        expect(process._dejavu).to.be.an('object');
                        expect(process._dejavu.caller).to.be.an('object');
                    }
                }),
                simpleClass;

            expect(process._dejavu).to.be.an('object');
            simpleClass = new SimpleClass();
            expect(process._dejavu.caller).to.equal(null);

        });

        it('should not allow weird modification of nextId', function () {

            expect(function () {
                process._dejavu.nextId = -1;
            }).to.throwException(/trying to mess with the class ids/i);

        });

        it.skip('should use self inspect');
    });

});