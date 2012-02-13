/*jslint sloppy:true*/
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

        delete params.Name;

        var parents,
            k,
            interf = function () {};

        interf.$interface = { parents: [] };

        if (hasOwn(params, 'Extends')) {

            parents = toArray(params.Extends);
            k = parents.length;

            for (k -= 1; k >= 0; k -= 1) {
                // Add interface to the parents
                interf.$interface.parents.push(parents[k]);
            }

            delete params.Extends;
        }


        return interf;
    }

    return Interface;
});
