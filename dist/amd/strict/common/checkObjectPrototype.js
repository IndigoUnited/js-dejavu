/*jslint forin:true*/
/*global define,console*/

define([
    './hasObjectPrototypeSpoiled',
    'amd-utils/lang/isFunction'
], function (
    hasObjectPrototypeSpoiled,
    isFunction
) {

    'use strict';

    /**
     * Checks object prototype, throwing an error if it has enumerable properties.
     * Also seals it, preventing any additions or deletions.
     */
    function checkObjectPrototype() {

        if (hasObjectPrototypeSpoiled) {
            throw new Error('Classify will not work properly if Object.prototype has enumerable properties!');
        }

        if (isFunction(Object.seal) && !Object.isSealed(Object.prototype)) {
            Object.seal(Object.prototype);
        }
    }

    return checkObjectPrototype;
});

