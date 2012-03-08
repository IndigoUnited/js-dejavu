/*jslint sloppy:true*/
/*global define*/

define(['./hasDefineProperty'], function (hasDefineProperty) {

    /**
     * Sets the key of object with the specified value.
     * The property is obfuscated, by not being enumerable, configurable and writable.
     *
     * @param {Object}  obj                  The object
     * @param {String}  key                  The key
     * @param {Mixin}   value                The value
     * @param {Boolean} [isWritable="false"] True to be writable, false otherwise
     */
    function obfuscateProperty(obj, key, value, isWritable) {

        if (hasDefineProperty) {
            Object.defineProperty(obj, key, {
                value: value,
                configurable: false,
                writable: isWritable || false,
                enumerable: false
            });
        } else {
            obj[key] = value;
        }
    }

    return obfuscateProperty;
});
