//>>includeStart('strict', pragmas.strict);
define([
    'mout/array/difference',
    'mout/object/hasOwn'
], function (
    difference,
    hasOwn
) {

    'use strict';

    var keywords = [
        '$name', '$extends', '$implements', '$borrows',
        '$statics', '$finals', '$abstracts', '$constants'
    ];

    /**
     * Tests if an object contains an unallowed keyword in a given context.
     *
     * @param {String} object    The object to verify
     * @param {Array}  [allowed  The list of allowed keywords (defaults to [])
     *
     * @return {Mixed} False if is ok, or the key that is unallowed.
     */
    function testKeywords(object, allowed) {
        var test = allowed ? difference(keywords, allowed) : keywords,
            x;

        for (x = test.length - 1; x >= 0; x -= 1) {
            if (hasOwn(object, test[x])) {
                return test[x];
            }
        }

        return false;
    }

    return testKeywords;
});
//>>includeEnd('strict');
