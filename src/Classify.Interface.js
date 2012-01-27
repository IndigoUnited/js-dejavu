/*jslint sloppy: true*/
/*global define*/

define(function () {

    function Interface(params) {

        var interf = function () {};

        params.Name = params.Name || 'Unnamed';

        /**
         * Extends an object with another given object.
         *
         * @param {Object} source The object to copy from
         * @param {Object} target The object that will get the source properties and methods
         */
        function extend(source, target) {

            var k;

            for (k in source) {
                if (source.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }

        /**
         * Copies the given object into a freshly created empty function's prototype.
         *
         * @param {Object} object Object
         *
         * @returns {Function} Thew new instance
         */
        function clone(object) {

            function F() {}
            F.prototype = object;

            return new F();
        }

        if (params.Extends) {
            interf.Super = params.Extends.prototype;
            //console.log(interf.Super);
            interf.prototype = clone(interf.Super);
                        //console.log(interf);
            extend(params, interf.prototype);
            delete interf.prototype.Extends;
            //console.log(interf.prototype.extraMethod);

            //delete interf.prototype.Extends;
        } else {
            interf.prototype = params;
        }

        // TODO: Make a way to test if a class implements an interface
        return interf;
    }

    return Interface;
});