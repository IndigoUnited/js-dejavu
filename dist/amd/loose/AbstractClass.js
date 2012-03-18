/*jslint nomen:true, newcap:true, forin:true*/
/*global define*/

define([
    'Utils/object/hasOwn',
    './Class'
], function AbstractClassWrapper(
    hasOwn,
    Class
) {

    var $abstract = '$abstract';

    /**
     * Create an abstract class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    function AbstractClass(params) {

        var def;

        // Handle abstract methods
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        // Create the class definition
        def = Class(params);
        def[$abstract] = true;

        return def;
    }

    return AbstractClass;
});
