define([
    'amd-utils/object/hasOwn',
    'amd-utils/array/insert',
    './Class'
], function AbstractClassWrapper(
    hasOwn,
    insert,
    Class
) {

    'use strict';

    var $abstract = '$abstract',
        $class = '$class',
        $bound = '$bound_dejavu',
        AbstractClass = {};

    /**
     * Create an abstract class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     *
     * @return {Function} The constructor
     */
    function createAbstractClass(params, constructor) {
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
        def = Class.$create(params, constructor);
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

    /**
     * Function to declare an abstract class.
     * This function can be called with various formats.
     * The first parameter can be a class to extend.
     * The second parameter must be an object containing the class members or a function to obtain it.
     *
     * @param {Function|Object} arg1 A class, an object or a function
     * @param {Function|Object} arg2 Object containing the class members or a function to obtain it.
     *
     * @return {Function} The constructor
     */
    AbstractClass.declare = function (arg1, arg2, $arg3) {
        return Class.declare.call(createAbstractClass, arg1, arg2, $arg3);
    };

    return AbstractClass;
});
