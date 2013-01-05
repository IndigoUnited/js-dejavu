define([
    './isObjectPrototypeSpoiled',
    'amd-utils/lang/isFunction'
], function (
    isObjectPrototypeSpoiled,
    isFunction
) {

    'use strict';

    /**
     * Checks object prototype, throwing an error if it has enumerable properties.
     * Also seals it, preventing any additions or deletions.
     */
    function checkObjectPrototype() {
        if (isObjectPrototypeSpoiled()) {
            throw new Error('dejavu will not work properly if Object.prototype has enumerable properties!');
        }

        // TODO: should we really do this? the user could legitimately adding non enumerable properties..
        if (isFunction(Object.seal) && !Object.isSealed(Object.prototype)) {
            Object.seal(Object.prototype);
        }
    }

    return checkObjectPrototype;
});
