if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

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

        // This function is based on the jquery one
        if (obj.nodeType || obj === obj.window) {
            return false;
        }

        try {
            proto = hasObjectPrototypeOf ? Object.getPrototypeOf(obj) : obj[proto];

            if (proto && proto !== Object.prototype) {
                return false;
            }

            if (obj.constructor && !hasOwn(obj, 'constructor') && !hasOwn(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;       // IE8,9 Will throw exceptions on certain host objects
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own
        for (key in obj) {}

        return key === undefined || hasOwn(obj, key);
    }

    return isPlainObject;
});
