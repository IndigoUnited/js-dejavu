//>>includeStart('strict', pragmas.strict);
/*jslint eqeq:true*/
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
/*jslint sloppy:true, eqeq:true*/
//>>excludeEnd('strict');
/*global define,console*/

define([
    'amd-utils/lang/isNumber',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/isString',
    'amd-utils/lang/isBoolean',
    'amd-utils/lang/isFunction'
], function (
    isNumber,
    isRegExp,
    isString,
    isBoolean,
    isFunction
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
