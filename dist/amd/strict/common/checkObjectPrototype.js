/*jslint forin:true*/
/*global define,console*/

define([
    './isObjectPrototypeSpoiled',
    'amd-utils/lang/isFunction'
], function (
    isObjectPrototypeSpoiled,
    isFunction
) {

    "use strict";

    /**
     * Checks object prototype, throwing an error if it has enumerable properties.
     * Also seals it, preventing any additions or deletions.
     */
    function checkObjectPrototype() {

        if (isObjectPrototypeSpoiled()) {
            throw new Error('Classify will not work properly if Object.prototype has enumerable properties!');
        }

        if (isFunction(Object.seal)) {
            Object.seal(Object.prototype);
        }
    }

    return isObjectPrototypeSpoiled;
});

