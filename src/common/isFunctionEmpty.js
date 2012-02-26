//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true, regexp:true*/
/*global define*/

define(function () {

    /**
     * Check if a function has no body.
     * 
     * @param {Function} func The function
     * 
     * @return {Boolean} True if it's empty, false otherwise 
     */
    function isFunctionEmpty(func) {
        return (/^function\s+\([^\(]*\)\s*\{\s*\}$/m).test(func.toString());
    }

    return isFunctionEmpty;
});
//>>includeEnd('strict');
