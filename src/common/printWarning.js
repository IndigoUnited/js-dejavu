//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define,console*/

define(function () {

    function printWarning(message) {

        if (typeof console !== 'undefined' && console.warn) {
            console.warn(message);
        }

    }

    return printWarning;
});
//>>includeEnd('strict');
