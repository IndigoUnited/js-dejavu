/*jslint sloppy:true, forin:true*/
/*global define*/

define([
    'Utils/object/hasOwn'
], function (
    hasOwn
) {
    var reservedNormal = ['$constructor', '$initializing', '$static', '$self', '$super'],
        reservedStatics = ['$parent', '$super'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * $statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object            The object to verify
     * @param {String} [type="normal"]   The list of reserved word to test
     */
    function checkKeywords(object, type) {

        var reserved = type === 'normal' || !type ? reservedNormal : reservedStatics,
            x;

        for (x = reserved.length - 1; x >= 0; x -= 1) {
            if (hasOwn(object, reserved[x])) {
                throw new TypeError('"' + object.$name + '" is using a reserved keyword: ' + reserved[x]);
            }
        }
    }

    return checkKeywords;
});
