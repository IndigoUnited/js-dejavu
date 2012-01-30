/*jslint sloppy: true, forin: true*/
/*global define*/

/**
 * Classify - Sugar syntax for Prototypal Inheritance
 *
 * @author Luís Couto <lcouto87@gmail.com>
 * @author André Cruz <andremiguelcruz@msn.com>
 * @version 1.0.0
 *
 * @example
 *
 *      var MyClass = Classify({
 *          Implements: [SomeInterface, OtherInterface],
 *          Extends: ParentClass,
 *          Borrows: [SomeMixin, OtherMixin],
 *          Binds: ['method1', 'method2'],
 *          Statics: {
 *              staticMethod1: function () {},
 *              staticMethod2: function () {},
 *              staticMethod3: function () {},
 *          },
 *          initialize: function () {
 *              MyClass.Super.initialize.call(this);
 *          },
 *          method1: function () {},
 *          method2: function () {},
 *          method3: function () {}
 *      });
 */
define('Trinity/Classify', [
    //>>includeStart('checks', pragmas.checks);
    'Utils/lang/isFunction',
    'Utils/lang/isString',
    'Utils/array/intersection',
    'Utils/array/unique',
    //>>includeEnd('checks');
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/keys',
    'Utils/array/forEach',
    'Utils/lang/bind',
    'Utils/lang/toArray',
    'Classify.Abstract',
    'Classify.Interface'
], function (
    //>>includeStart('checks', pragmas.checks);
    isFunction,
    isString,
    intersection,
    unique,
    //>>includeEnd('checks');
    isObject,
    isArray,
    createObject,
    mixIn,
    keys,
    forEach,
    bind,
    toArray,
    Abstract,
    Interface
) {

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @returns {Function} The constructor
     */
    function Classify(params) {

        //>>includeStart('checks', pragmas.checks);
        if (!isObject(params)) {
            throw new TypeError('Argument "params" must be an object.');
        }

        params.Name = params.Name || 'Unnamed';

        if (params.Abstracts && !params.$abstract) {
            throw new Error('Class "' + params.Name + '" has abstract methods, therefore it must be defined as abstract.');
        }
        //>>includeEnd('checks');

        //>>excludeStart('checks', pragmas.checks);
        delete params.Name;
        //>>excludeEnd('checks');

        var classify,
            parent;

        /**
         * Borrows the properties and methods of various source objects to the target.
         *
         * @param {Array}  sources Array of objects that will give their methods
         * @param {Object} target  Target that will receive the methods
         */
        function borrows(sources, target) {

            sources = toArray(sources);

            var i, length = sources.length,
                constructorBck, current, currentPrototype;

            for (i = 0; i < length; i += 1) {

                current = sources[i];

                //>>includeStart('checks', pragmas.checks);
                if (!isFunction(current) && !isObject(current)) {
                    throw new TypeError('Entry at index ' + i + ' in Borrows of class "' + params.Name + '" is not a valid class/object.');
                }
                //>>includeEnd('checks');

                currentPrototype = sources[i].prototype;

                if (currentPrototype && currentPrototype.$constructor) {
                    constructorBck = currentPrototype.$constructor;
                    delete currentPrototype.constructor;
                    mixIn(target.prototype, currentPrototype);
                    currentPrototype.$constructor = constructorBck;
                } else {
                    mixIn(target.prototype, currentPrototype || current);
                }
            }
        }

        /**
         * Fixes the context in given methods.
         *
         * @param {Array}  fns     The array of functions to be bound
         * @param {Object} context The context that will be bound
         * @param {Object} target  The target class that will have these methods
         */
        function binds(fns, context, target) {

            var i = fns.length - 1;

            for (i; i >= 0; i -= 1) {
                target[fns[i]] = bind(target[fns[i]], context);
            }
        }

        //>>includeStart('checks', pragmas.checks);
        /**
         * Checks a target against interfaces methods.
         *
         * @param {Array}  interfaces The array of interfaces
         * @param {Object} target     The target that will be check
         */
        function checkInterfaces(interfaces, target) {

            interfaces = toArray(interfaces);

            var i, k,
                curr,
                checkStatic = function (value) {
                    if (!isFunction(target[value])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + curr.prototype.Name + '" correctly, static method "' + value + '()" was not found.');
                    }
                };

            for (i = interfaces.length - 1; i >= 0; i -= 1) {

                curr = interfaces[i];

                if (!isFunction(curr) || !curr.$interface) {
                    throw new TypeError('Entry at index ' + i + ' in Implements of class "' + params.Name + '" is not a valid interface.');
                }

                // Check normal functions
                for (k in curr.prototype) {
                    if (isFunction(curr.prototype[k]) && !isFunction(target.prototype[k])) {
                        throw new Error('Class "' + target.prototype.Name + '" does not implement interface "' + curr.prototype.Name + '" correctly, method "' + k + '()" was not found.');
                    }
                }

                // Check static functions
                if (curr.$statics) {
                    forEach(curr.$statics, checkStatic);
                }
            }
        }

        /**
         * Checks a target against an abstract class.
         *
         * @param {Function} abstractClass The abstract class
         * @param {Object}   target        The target that will be check
         */
        function checkAbstract(abstractClass, target) {

            var abstracts = abstractClass.$abstract,
                length = abstracts.normal.length,
                x,
                func;

            for (x = 0; x < length; x += 1) {

                func = abstracts.normal[x];

                if (!isFunction(target.prototype[func])) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, method "' + func + '()" was not found.');
                }
            }

            length = abstracts.statics.length;

            for (x = 0; x < length; x += 1) {

                func = abstracts.statics[x];

                if (!isFunction(target[func])) {
                    throw new Error('Class "' + target.prototype.Name + '" does not implement abstract class "' + abstractClass.prototype.Name + '" correctly, static method "' + func + '()" was not found.');
                }
            }
        }
        //>>includeEnd('checks');

        /**
         * Grab all the bound from the constructor parent and itself and merges them for later use.
         *
         * @param {Function} constructor The constructor
         */
        function grabBinds(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null,
                prototype = constructor.prototype;

            //>>includeStart('checks', pragmas.checks);
            if ((prototype.Binds || []).length !== unique(prototype.Binds || []).length) {
                throw new Error('There are duplicate binds in "' + prototype.Name + '".');
            }
            //>>includeEnd('checks');

            if (parent && parent.$binds) {

                //>>includeStart('checks', pragmas.checks);
                if (intersection(prototype.Binds || [], parent.$binds).length > 0) {
                    throw new Error('There are binds in "' + prototype.Name + '" that are already being bound in the parent class.');
                }
                //>>includeEnd('checks');

                constructor.$binds = (prototype.Binds || []).concat(parent.$binds);
            } else if (params.Binds) {
                constructor.$binds = prototype.Binds;
            }

            //>>includeStart('checks', pragmas.checks);
            if (constructor.$binds) {

                forEach(constructor.$binds, function (value) {

                    if (!isString(value)) {
                        throw new TypeError('All bind entries of "' + prototype.Name + '" must be a string.');
                    }

                    if (!isFunction(prototype[value])) {
                        throw new Error('Method "' + value + '()" referenced in "' + prototype.Name + '" binds does not exist.');
                    }
                });
            }
            //>>includeEnd('checks');

            delete prototype.Binds;
        }

        /**
         * Grabs the static methods from the constructor parent and itself and merges them.
         *
         * @param {Function} constructor The constructor
         */
        function grabStatics(constructor) {

            var parent = constructor.Super ? constructor.Super.$constructor : null;

            if (constructor.prototype.Statics) {

                //>>includeStart('checks', pragmas.checks);
                if (!isObject(constructor.prototype.Statics)) {
                    throw new TypeError('Statics definition for "' + params.Name + '" must be an object.');
                }
                //>>includeEnd('checks');

                mixIn(constructor, constructor.prototype.Statics);
                constructor.$statics = keys(constructor.prototype.Statics);
            }

            if (parent && parent.$statics) {

                if (!constructor.$statics) {
                    constructor.$statics = [];
                }

                forEach(parent.$statics, function (value) {
                    if (!constructor[value]) {
                        constructor[value] = parent[value];
                        constructor.$statics.push(value);
                    }
                });
            }
        }

        /**
         * Reset some properties in order to make them unique for the instance.
         * This solves the shared properties for types like objects or arrays.
         *
         * @param {Object} object The instance
         */
        function reset(object) {

            var key;

            for (key in object) {
                if (isArray(object[key])) {    // If is array, clone it
                    object[key] = [].concat(object[key]);
                } else if (isObject(object[key])) {    // If is an object, clone it
                    object[key] = mixIn({}, object[key]);
                }
            }
        }

        /**
         * Builds the constructor function that calls the initialize and do
         * more things internally.
         *
         * @param {Funciton} initialize The initialize function
         *
         * @return {Function} The constructor function
         */
        function constructor(initialize) {

            return function initializer() {

                // Reset some types of the object in order for each instance to have their variables
                reset(this);

                // Apply binds
                if (this.$constructor.$binds) {
                    binds(this.$constructor.$binds, this, this);
                }

                // Call initialize
                //>>includeStart('checks', pragmas.checks);
                if (!this.$constructor.$abstract) {
                    this.$initializing = true;
                }
                //>>includeEnd('checks');
                initialize.apply(this, arguments);
                //>>includeStart('checks', pragmas.checks);
                delete this.$initializing;
                //>>includeEnd('checks');
            };
        }

        if (params.Extends) {

            //>>includeStart('checks', pragmas.checks);
            if (!isFunction(params.Extends) || !params.Extends.$class) {
                throw new TypeError('Specified parent class in Extends of "' + params.Name + '" is not a valid class.');
            }
            //>>includeEnd('checks');

            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = constructor(params.initialize);
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);
        } else {
            params.initialize = params.initialize || function () {};
            classify = constructor(params.initialize);
            classify.prototype = params;
        }

        classify.prototype.$constructor = classify;
        //>>includeStart('checks', pragmas.checks);
        classify.$class = true;
        //>>includeEnd('checks');

        // Grab all the defined mixins
        if (params.Borrows) {
            borrows(params.Borrows, classify);
            delete classify.prototype.Borrows;
        }

        // Grab all the defined binds
        if (params.Binds) {
            grabBinds(classify);
            delete classify.prototype.Binds;
        }

        // Grab static methods from the parent and itself
        grabStatics(classify);
        //>>excludeStart('checks', pragmas.checks);
        if (params.Statics) {
            delete classify.prototype.Statics;  // If we got checks enabled, we can't delete the Statics yet (see bellow)
        }
        //>>excludeEnd('checks');

        //>>includeStart('checks', pragmas.checks);
        // If we are a concrete class that extends an abstract class, we need to verify the methods existence
        if (parent && parent.$abstract && !params.$abstract) {
            checkAbstract(parent, classify);
        }
        //>>includeEnd('checks');

        // If the class implement some interfaces and is not abstract then
        if (params.Implements) {

            //>>includeStart('checks', pragmas.checks);
            if (!params.$abstract) {
                checkInterfaces(params.Implements, classify);
            }
            //>>includeEnd('checks');

            delete classify.prototype.Implements;
        }

        //>>includeStart('checks', pragmas.checks);
        if (params.Statics) {
            delete classify.prototype.Statics;  // Delete statics now
        }
        //>>includeEnd('checks');

        return classify;
    }

    Classify.Abstract = Abstract;
    Classify.Interface = Interface;

    return Classify;
});
