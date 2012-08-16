define([
    'amd-utils/object/hasOwn',
    'amd-utils/lang/toArray'
], function InterfaceWrapper(
    hasOwn,
    toArray
) {

    'use strict';

    /*jshint newcap:false*/

    var $interface = '$interface';

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

        return Interface(params);
    }

    /**
     * Create an interface definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function Interface(params) {

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

        // Supply .extend() to easily extend a class
        interf.extend = extend;

        return interf;
    }

    /**
     * Function to create an Interface.
     *
     * @param {Function} arg1 Object containing the members or a function to obtain it.
     *
     * @return {Function} The Interface
     */
    Interface.create = function (arg1) {
        return Interface(isFunction(arg1) ? arg1() : arg1);
    };

    return Interface;
});
