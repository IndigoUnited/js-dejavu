//>>includeStart('strict', pragmas.strict);
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
            key;

        for (key in obj) {
            if (key) {  // This is just to trick jslint..
                return true;
            }
        }

        return false;
    }

    return isObjectPrototypeSpoiled;
});
//>>includeEnd('strict');

