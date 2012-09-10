//>>includeStart('strict', pragmas.strict);
/*jshint regexp:false*/

define([], function () {

    'use strict';

    /**
     * Extract meta data from a function.
     * It returns an object containing the number of normal arguments, the number
     * of optional arguments, the function signature, the function name and the visibility.
     *
     * Will return null if the function arguments are invalid.
     *
     * @param {Function} func The function
     * @param {String}   name The name of the function
     *
     * @return {Object|null} An object containg the function metadata
     */
    function functionMeta(func, name) {
        var matches = /^function(\s+[a-zA-Z0-9_$]*)*\s*\(([^\(]*)\)/m.exec(func.toString()),
            ret,
            split,
            optionalReached = false,
            length,
            x;

        // Analyze arguments
        if (!matches) {
            return null;
        }

        split = (matches[2] || '').split(/\s*,\s*/gm);
        length = split.length;

        ret = { mandatory: 0, optional: 0, signature: '' };

        if (split[0] !== '') {
            for (x = 0; x < length; x += 1) {
                if (split[x].charAt(0) === '$') {
                    ret.optional += 1;
                    ret.signature += ' ' + split[x] + ', ';
                    optionalReached = true;
                } else if (!optionalReached) {
                    ret.mandatory += 1;
                    ret.signature += split[x] + ', ';
                } else {
                    return null;
                }
            }

            ret.signature = ret.signature.substr(0, ret.signature.length - 2);
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

        return ret;
    }

    return functionMeta;
});
//>>includeEnd('strict');
