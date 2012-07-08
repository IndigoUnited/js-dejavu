//>>excludeStart('strict', pragmas.strict);
/*jshint strict:false*/

//>>excludeEnd('strict');
define([
    'amd-utils/lang/isNumber',
    'amd-utils/lang/isString',
    'amd-utils/lang/isBoolean'
], function (
    isNumber,
    isString,
    isBoolean
) {

//>>includeStart('strict', pragmas.strict);
    'use strict';

//>>includeEnd('strict');
    /**
     * Checks if a value is immutable.
     *
     * @param {Mixed} value The value
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function isImmutable(value) {
        return value == null || isBoolean(value) || isNumber(value) || isString(value);
    }

    return isImmutable;
});
