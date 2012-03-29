/*jslint sloppy:true, forin:true*/
/*global define*/

define([
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function InterfaceWrapper(
    hasOwn,
    toArray
) {

    var $interface = '$interface';

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

        return interf;
    }

    return Interface;
});
