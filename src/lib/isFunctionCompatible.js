//>>includeStart('strict', pragmas.strict);
define([], function () {

    'use strict';

    /**
     * Check if a function signature is compatible with another.
     *
     * @param {Function} func1 The function to be checked
     * @param {Function} func2 The function to be compared with
     *
     * @return {Boolean} True if it's compatible, false otherwise
     */
    function isFunctionCompatible(func1, func2) {
        return func1.mandatory === func2.mandatory && func1.optional >= func2.optional;
    }

    return isFunctionCompatible;
});
//>>includeEnd('strict');
