/*jslint forin:true*/
/*globals define*/

define([
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn'
], function (
    isFunction,
    hasOwn
) {

    'use strict';

    var hasObjectPrototypeOf = isFunction(Object.getPrototypeOf);

    /**
     * Checks if a given object is a plain object.
     *
     * @param {Object} obj The object
     */
    function isPlainObject(obj) {

        var proto = '__proto__',
            key;

        proto = hasObjectPrototypeOf ? Object.getPrototypeOf(obj) : obj[proto];

        if (proto && proto !== Object.prototype) {
            return false;
        }

        if (obj.constructor && !hasOwn(obj, 'constructor') && !hasOwn(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        for (key in obj) {}

        return key === undefined || hasOwn(obj, key);
    }

    return isPlainObject;
});
