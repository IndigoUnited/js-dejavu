/*jslint eqeq:true*/
/*global define,console*/

define([
    'amd-utils/lang/isNumber',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/isString',
    'amd-utils/lang/isBoolean'
], function (
    isNumber,
    isRegExp,
    isString,
    isBoolean
) {

    "use strict";

    /**
     * Checks if a value is a primitive type.
     *
     * @param {Mixed} value The value
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function isPrimitiveType(value) {
        return isNumber(value) || isString(value) || isBoolean(value) || isRegExp(value) || value == null;
    }

    return isPrimitiveType;
});
