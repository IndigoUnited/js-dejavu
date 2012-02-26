/*jslint sloppy:true, regexp:true*/
/*global define*/

define(function () {

    /**
     * Extract meta data from a property.
     * It returns an object containing the value and visibility.
     * 
     * @param {Mixed}  prop The property
     * @param {String} name The name of the property
     *
     * @return {Object} An object containg the metadata
     */
    function propertyMeta(prop, name) {

        var ret = { value: prop };

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

        return ret;
    }

    return propertyMeta;
});
