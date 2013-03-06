/*jshint node:true*/

'use strict';

var path = require('path');

describe('node-main', function () {

    var expect = require('expect.js'),
        cwd = process.cwd(),
        dejavuPath = path.normalize(__dirname + '/../dist/node/node.js');

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