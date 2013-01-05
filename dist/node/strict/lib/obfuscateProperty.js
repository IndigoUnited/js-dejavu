if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./hasDefineProperty'], function (hasDefineProperty) {

    'use strict';

    /**
     * Sets the key of object with the specified value.
     * The property is obfuscated, by not being enumerable, configurable and writable.
     *
     * @param {Object}  obj           The object
     * @param {String}  key           The key
     * @param {Mixed}   value         The value
     * @param {Boolean} [isWritable]  True to be writable, false otherwise (defaults to false)
     * @param {Boolean} [isDeletable] True to be deletable, false otherwise (defaults to false)
     */
    function obfuscateProperty(obj, key, value, isWritable, isDeletable) {
        if (hasDefineProperty) {
            Object.defineProperty(obj, key, {
                value: value,
                configurable: isDeletable || false,
                writable: isWritable || false,
                enumerable: false
            });
        } else {
            obj[key] = value;
        }
    }

    return obfuscateProperty;
});
