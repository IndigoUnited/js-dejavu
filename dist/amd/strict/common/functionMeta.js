/*jslint sloppy:true regexp:true*/
/*global define*/

define(function () {

    /**
     * Extract meta data from a function.
     * It returns an object containing the number of normal arguments, the number
     * of optional arguments, the function signature and the function name.
     *
     * Will return null if the function arguments are invalid.
     *
     * @param {Function} func The function
     *
     * @return {Object|null} An object containg the normal and optional counts
     */
    function functionMeta(func) {

        var matches = /^function\s+([a-zA-Z0-9_$]*)\s*\(([^\(]*)\)/m.exec(func.toString()),
            ret,
            split,
            optionalReached = false,
            length,
            x;

        if (!matches) {
            return null;
        }

        split = (matches[2] || '').split(/\s*,\s*/gm);
        length = split.length;

        ret = { mandatory: 0, optional: 0, signature: '', name: matches[1] || '' };

        if (split[0] !== '') {

            for (x = 0; x < length; x += 1) {
                if (split[x][0] === '$') {
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

        return ret;
    }

    return functionMeta;
});
