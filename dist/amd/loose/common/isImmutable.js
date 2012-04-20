/*jslint sloppy:true, eqeq:true*/
/*global define,console*/

define([
    'amd-utils/lang/isNumber',
    'amd-utils/lang/isString',
    'amd-utils/lang/isBoolean'
], function (
    isNumber,
    isString,
    isBoolean
) {

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
