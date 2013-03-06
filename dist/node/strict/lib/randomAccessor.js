/*jshint node:true*/

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

/*global process*/

define(['mout/array/contains'], function (contains) {

    'use strict';

    var random,
        allowed = ['ClassWrapper', 'InterfaceWrapper', 'AbstractClassWrapper', 'FinalClassWrapper', 'instanceOfWrapper', 'inspectWrapper'],
        nrAllowed = allowed.length,
        nrAccesses = 0;

    if (!(typeof window !== 'undefined' && window.navigator && window.document)) {
        random = process.pid;
    } else {
        random = new Date().getTime() + '_' + Math.floor((Math.random() * 100000000 + 1));
    }

    /**
     * Provides access to a random string that allows acceess to some hidden properties
     * used through this library.
     *
     * @param {Function} caller The function that is trying to access
     *
     * @return {String} The random string
     */
    function randomAccessor(caller) {
        if (nrAccesses > nrAllowed || !contains(allowed, caller)) {
            throw new Error('Can\'t access random identifier.');
        }

        nrAccesses += 1;

        return random;
    }

    return randomAccessor;
});
