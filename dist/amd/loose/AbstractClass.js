/*jslint sloppy:true, nomen:true, newcap:true, forin:true*/
/*global define*/

define([
    'amd-utils/object/hasOwn',
    'amd-utils/array/insert',
    './Class'
], function AbstractClassWrapper(
    hasOwn,
    insert,
    Class
) {

    var $abstract = '$abstract',
        $class = '$class',
        $bound = '$bound_dejavu';

    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function AbstractClass(params) {

        var def,
            savedMembers,
            key,
            value;

        // Handle abstract methods
        if (hasOwn(params, '$abstracts')) {
            savedMembers = params.$abstracts;
            delete params.$abstracts;
        }

        // Create the class definition
        def = Class(params);
        def[$abstract] = true;

        // Grab binds
        if (savedMembers) {
            for (key in savedMembers) {
                value = savedMembers[key];

                if (value[$bound]) {
                    insert(def[$class].binds, key);
                }
            }
        }

        return def;
    }

    return AbstractClass;
});
