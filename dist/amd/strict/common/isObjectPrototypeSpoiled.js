/*jslint sloppy:true, forin:true*/
/*global define,console*/

define(function () {

    /**
     * Checks if object prototype has non enumerable properties attached.
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function isObjectPrototypeSpoiled() {

        var obj = {},
            key,
            spoiled = false;

        for (key in obj) {
            spoiled = true;
        }

        return spoiled;
    }

    return isObjectPrototypeSpoiled;
});

