/*jslint sloppy: true*/
/*global define*/

define([
    'Utils/object/forOwn',
    'Utils/array/contains',
    'Utils/array/difference'
], function (
    forOwn,
    contains,
    difference
) {
    var reservedNormal = ['$constructor', '$initializing'],
        reservedStatics = ['$class', '$abstract', '$interface', '$binds', '$statics'];

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
     * @param {Array}  [ignoreList="[]"] An array to ignore
     */
    function verifyReserved(object, type, ignoreList) {

        var reserved = type === 'normal' || !type ? reservedNormal : reservedStatics;

        if (ignoreList) {
            reserved = difference(reserved, ignoreList);
        }

        forOwn(object, function (value, key) {
            if (contains(reserved, key) || Object.prototype[key]) {
                throw new TypeError('"' + object.Name + '" is using a reserved keyword: ' + key);
            }
        });
    }

    return verifyReserved;
});
