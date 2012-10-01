if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'amd-utils/lang/isFunction',
    'amd-utils/object/hasOwn',
    'amd-utils/lang/toArray'
], function InterfaceWrapper(
    isFunction,
    hasOwn,
    toArray
) {

    'use strict';

    var $interface = '$interface',
        Interface = {};

    /**
     * Function to easily extend another interface.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The new interface
     */
    function extend(params) {
        /*jshint validthis:true*/
        params.$extends = this;

        return Interface.declare(params);
    }

    /**
     * Create an interface definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function createInterface(params) {
        delete params.$name;

        var parents,
            k,
            i,
            current,
            interf = function () {};

        interf[$interface] = { parents: [], constants: [] };

        if (hasOwn(params, '$extends')) {
            parents = toArray(params.$extends);
            k = parents.length;

            for (k -= 1; k >= 0; k -= 1) {
                current = parents[k];

                // Add interface constants
                for (i = current[$interface].constants.length - 1; i >= 0; i -= 1) {
                    interf[current[$interface].constants[i]] = current[current[$interface].constants[i]];
                }

                // Add interface to the parents
                interf[$interface].parents.push(current);
            }

            delete params.$extends;
        }

        // Parse constants
        if (hasOwn(params, '$constants')) {
            for (k in params.$constants) {
                interf[k] = params.$constants[k];
                interf[$interface].constants.push(k);
            }
        }

        // Supply .extend() to easily extend an interface
        interf.extend = extend;

        return interf;
    }

    /**
     * Function to declare an Interface.
     *
     * @param {Object} obj An object containing the interface members.
     *
     * @return {Function} The Interface
     */
    Interface.declare = createInterface;

    return Interface;
});
