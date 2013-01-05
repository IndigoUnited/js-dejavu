define([
    'amd-utils/object/forOwn',
    'amd-utils/lang/kindOf',
    'amd-utils/lang/createObject'
], function (forOwn, kindOf, createObject) {

    'use strict';

    /**
     * Modified version of amd-utils's clone.
     * Works with instances.
     *
     * @param {Mixed} val The val to clone
     *
     * @return {Mixed} The cloned value
     */
    function clone(val) {
        var result;

        switch (kindOf(val)) {
        case 'Object':
            if (val.constructor !== Object) {
                result = createObject(val);
            } else {
                result = cloneObject(val);
            }
            break;
        case 'Array':
            result = deepCloneArray(val);
            break;
        case 'RegExp':
            result = cloneRegExp(val);
            break;
        case 'Date':
            result = cloneDate(val);
            break;
        default:
            result = val;
        }
        return result;
    }

    function cloneObject(source) {
        var out = {};
        forOwn(source, copyProperty, out);
        return out;
    }

    function copyProperty(val, key) {
        /*jshint validthis:true*/
        this[key] = clone(val);
    }

    function cloneRegExp(r) {
        var flags = '';

        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignoreCase ? 'i' : '';

        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(date.getTime());
    }

    function deepCloneArray(arr) {
        var out = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            out[i] = clone(arr[i]);
            i += 1;
        }
        return out;
    }

    return clone;
});