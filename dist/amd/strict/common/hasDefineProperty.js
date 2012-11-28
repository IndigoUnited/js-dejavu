define(['amd-utils/lang/isFunction', 'amd-utils/lang/inheritPrototype'], function (isFunction, inheritPrototype) {

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

        // Avoid Safari bug (in some lower versions)
        var BaseClass = function () {},
            SuperClass = function () {};

        Object.defineProperty(BaseClass.prototype, 'x', {
            value: 'foo',
            configurable: false,
            writable: false,
            enumerable: false
        });

        inheritPrototype(SuperClass, BaseClass);

        try {
            Object.defineProperty(SuperClass.prototype, 'x', {
                value: 'bar',
                configurable: false,
                writable: false,
                enumerable: false
            });
        } catch (e) {
            return false;
        }

        return true;
    }

    return hasDefineProperty();
});