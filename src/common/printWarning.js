//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define,console*/

define(['Utils/lang/isFunction'], function (isFunction) {

    function printWarning(message) {

        if (typeof console !== 'undefined' && isFunction(console.warn)) {
            console.warn(message);
        }

    }

    return printWarning;
});
//>>includeEnd('strict');
