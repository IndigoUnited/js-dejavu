//>>includeStart('strict', pragmas.strict);
define([
    'mout/object/hasOwn',
    'mout/array/append'
], function (
    hasOwn,
    append
) {

    'use strict';

    var reservedNormal = ['$constructor', '$initializing', '$static', '$self', '$super', '$underStrict'],
        reservedAll = append(['initialize'], reservedNormal),
        reservedStatics = ['$parent', '$super', '$self', '$static', 'extend'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * $statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object The object to verify
     * @param {String} [type] The list of reserved word to test (defaults to all)
     */
    function checkKeywords(object, type) {
        var reserved = type === 'normal' || !type ? reservedNormal : (type === 'all' ? reservedAll : reservedStatics),
            x;

        for (x = reserved.length - 1; x >= 0; x -= 1) {
            if (hasOwn(object, reserved[x])) {
                throw new Error('"' + object.$name + '" is using a reserved keyword: ' + reserved[x]);
            }
        }
    }

    return checkKeywords;
});
//>>includeEnd('strict');
