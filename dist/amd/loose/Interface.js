/*jslint sloppy: true*/
/*global define*/

define([
], function (
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

        var interf = function () {
        };

        return interf;
    }

    return Interface;
});