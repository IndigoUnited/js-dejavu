/*jslint sloppy: true*/
/*global define*/

define([
    //>>includeStart('checks', pragmas.checks);
    'Utils/lang/isObject',
    'Utils/lang/isFunction',
    'Utils/object/forOwn',
    'Utils/Array/insert',
    'Utils/lang/createObject'
    //>>includeEnd('checks');
], function (
    //>>includeStart('checks', pragmas.checks);
    isObject,
    isFunction,
    forOwn,
    insert,
    createObject
    //>>includeEnd('checks');
) {

    /**
     *
     */
    function Interface(params) {

        //>>includeStart('checks', pragmas.checks);
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }
        //>>includeEnd('checks');

        var interf = function () {
            //>>includeStart('checks', pragmas.checks);
            throw new Error('Interfaces cannot be instantiated.');
            //>>includeEnd('checks');
        };

        //>>includeStart('checks', pragmas.checks);
        params.Name = params.Name || 'Unnamed';

        /**
         * Grabs the static methods from the constructor parent and itself and merges them.
         *
         * @param {Function} constructor The constructor
         */
        function grabStatics(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null;

            constructor.$statics = [];

            if (constructor.prototype.Statics) {

                if (!isObject(constructor.prototype.Statics)) {
                    throw new TypeError('Statics definition for "' + params.Name + '" must be an object.');
                }

                forOwn(constructor.prototype.Statics, function (value, key) {
                    if (isFunction(value)) {
                        constructor.$statics.push(key);
                    }
                });
            }

            if (parent && parent.$statics) {

                parent.$statics.forEach(function (value) {
                    insert(constructor.$statics, value);
                });
            }

            if (!constructor.$statics.length) {
                delete constructor.$statics;
            }
        }

        if (params.Extends) {

            if (!isFunction(params.Extends) || !params.Extends.$interface) {
                throw new TypeError('The parent interface of "' + params.Name + '" is not a valid interface (defined in Extends).');
            }

            interf.Super = params.Extends.prototype;
            delete params.Extends;

            interf.prototype = createObject(interf.Super, params);
            delete interf.prototype.Extends;
        } else {
            interf.prototype = params;
        }

        interf.prototype.$constructor = interf;

        // Grab all statics from the parent and itself and references them for later use
        grabStatics(interf);
        delete interf.prototype.Statics;

        // TODO: make a way to validate a class
        interf.$interface = true;   // Mark it as an interface

        //>>includeEnd('checks');

        return interf;
    }

    return Interface;
});