if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['amd-utils/lang/isFunction'], function (isFunction) {

    'use strict';

    /**
     * Check if the environment supports Object.hasDefineProperty.
     * There is some quirks related to IE that is handled inside.
     *
     * @return {Boolean} True if it supports, false otherwise
     */
    function hasDefineProperty() {
        if (!isFunction(Object.defineProperty)) {
            return false;
        }

        // Avoid IE8 bug
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            return false;
        }

        return true;
    }

    return hasDefineProperty();
});