//>>includeStart('strict', pragmas.strict);
define(['./isImmutable'], function (isImmutable) {

    'use strict';

    /**
     * Extract meta data from a property.
     *
     * @param {Mixed} prop The property
     * @param {String} name The name of the property
     *
     * @return {Object} An object containg the metadata
     */
    function propertyMeta(prop, name) {
        var ret = {};

        // Is it undefined?
        if (prop === undefined) {
            return null;
        }

        // Analyze visibility
        if (name) {
            if (name.charAt(0) === '_') {
                if (name.charAt(1) === '_') {
                    ret.isPrivate = true;
                } else {
                    ret.isProtected = true;
                }
            } else {
                ret.isPublic = true;
            }
        }

        ret.isImmutable = isImmutable(prop);

        return ret;
    }

    return propertyMeta;
});
//>>includeEnd('strict');
