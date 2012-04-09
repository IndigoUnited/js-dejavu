/*jslint regexp:true*/
/*global define*/

define([
    'amd-utils/lang/isUndefined',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isFunction'
], function (
    isUndefined,
    isObject,
    isFunction
) {

    "use strict";

    var hasObjectPrototypeOf = isFunction(Object.getPrototypeOf);

    /**
     * Extract meta data from a property.
     * It returns an object containing the value and visibility.
     *
     * @param {Mixed}  prop The property
     * @param {String} name The name of the property
     *
     * @return {Object} An object containg the metadata
     */
    function propertyMeta(prop, name) {

        var ret = {},
            proto;

        // Is it undefined?
        if (isUndefined(prop)) {
            return null;
        }
        // If is a object, check if it is a plain object
        if (isObject(prop)) {
            proto = '__proto__';
            proto = hasObjectPrototypeOf ? Object.getPrototypeOf(prop) : prop[proto];
            if (proto && proto !== Object.prototype) {
                return null;
            }
        }
        // Is it a function?
        if (isFunction(prop)) {
            return null;
        }

        // Analyze visibility
        if (name) {
            if (name.charAt(0) === '_') {
                if (name.charAt(1) === '_') {
                    ret.isPrivate = true;
                } else {
                    ret.isProtected = true;
                }
            } else {
                ret.isPublic = true;
            }
        }

        return ret;
    }

    return propertyMeta;
});
