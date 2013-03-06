/*jshint node:true*/

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function () {

    'use strict';

    /**
     * This method does exactly the same as the mout counterpart but
     * does not perform hasOwn for each key in the objects.
     * This is only done because the object prototype is guaranteed to be sealed.
     * There is other ones that could be also optimized, but this is the most used
     * one in the loose version.
     *
     * @param {object}    target  Target Object
     * @param {...object} objects Objects to be combined (0...n objects)
     *
     * @return {object} Target Object
     */
    function mixIn(target, objects) {
        var x,
            length = arguments.length,
            key,
            curr;

        for (x = 1; x < length; x += 1) {
            curr = arguments[x];
            for (key in arguments[x]) {
                target[key] = curr[key];
            }
        }

        return target;
    }

    return mixIn;
});
