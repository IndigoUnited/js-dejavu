/*jslint sloppy:true, forin:true*/
/*global define*/

define([
    'Utils/object/hasOwn',
    'Utils/lang/toArray'
], function (
    hasOwn,
    toArray
) {

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
            interf = function () {};

        interf.$interface = { parents: [] };

        if (hasOwn(params, '$extends')) {

            parents = toArray(params.$extends);
            k = parents.length;

            for (k -= 1; k >= 0; k -= 1) {
                // Add interface to the parents
                interf.$interface.parents.push(parents[k]);
            }

            delete params.$extends;
        }


        return interf;
    }

    return Interface;
});
