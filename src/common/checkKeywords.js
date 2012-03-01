//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define*/

define([
    'Utils/object/forOwn',
    'Utils/array/contains'
], function (
    forOwn,
    contains
) {
    var reservedNormal = ['$constructor', '$initializing', '$static', '$self', '$super'],
        reservedStatics = ['$class', '$abstract', '$interface', '$parent', '$super'];

    /**
     * Verify reserved words found in classes/interfaces.
     * The second parameter can be normal or statics.
     * Normal will test for reserved words of the instance.
     * Statics will test for reserved words in the ckass statics.
     *
     * Will throw an error if any reserved key is found.
     *
     * @param {Object} object            The object to verify
     * @param {String} [type="normal"]   The list of reserved word to test
     */
    function checkKeywords(object, type) {

        var reserved = type === 'normal' || !type ? reservedNormal : reservedStatics;

        forOwn(object, function (value, key) {
            if (contains(reserved, key) || Object.prototype[key]) {
                throw new TypeError('"' + object.$name + '" is using a reserved keyword: ' + key);
            }
        });
    }

    return checkKeywords;
});
//>>includeEnd('strict');
