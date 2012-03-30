/*jslint sloppy:true, eqeq:true*/
/*global define,console*/

define([
    'Utils/lang/isNumber',
    'Utils/lang/isRegExp',
    'Utils/lang/isString',
    'Utils/lang/isBoolean'
], function (
    isNumber,
    isRegExp,
    isString,
    isBoolean
) {

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
