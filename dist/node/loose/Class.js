if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

/*jshint noarg:false*/

define([
    './common/printWarning',
    './common/obfuscateProperty',
    './common/isImmutable',
    './common/isPlainObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isDate',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/createObject',
    'amd-utils/object/hasOwn',
    'amd-utils/array/combine',
    'amd-utils/array/contains',
    './common/mixIn',
    'amd-utils/array/append',
    'amd-utils/function/bind',
    'amd-utils/lang/toArray',
    'amd-utils/lang/clone',
    'amd-utils/array/insert'
], function ClassWrapper(
    printWarning,
    obfuscateProperty,
    isImmutable,
    isPlainObject,
    isFunction,
    isObject,
    isArray,
    isDate,
    isRegExp,
    createObject,
    hasOwn,
    combine,
    contains,
    mixIn,
    append,
    bind,
    toArray,
    clone,
    insert
) {

    'use strict';

    var createClass,
        Class = {},
        $class = '$class',
        $interface = '$interface',
        $bound = '$bound_dejavu',
        $wrapped = '$wrapped_dejavu',
        tmp,
        descriptor;

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {
        // We treat object differently than amd-utils
        // If is a plain object, we use our built-in mixIn to be faster
        // Otherwise we do a createObject
        if (isObject(prop)) {
            if (isPlainObject(prop)) {
                return mixIn({}, prop);
            }

            return createObject(prop);
        }

        return clone(prop);
    }

    /**
     * Wraps a method.
     * This is to make some alias such as $super and $self to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} constructor The constructor
     * @param {Function} parent      The parent method
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(method, constructor, parent) {
        // Return the method if the class was created efficiently
        if (constructor[$class].efficient) {
            method[$wrapped] = true;
            return method;
        }

        var wrapper,
            isWrapped = !!method[$wrapped];

        if (isWrapped) {
            method = method[$wrapped];
        }

        if (!parent) {
            if (isWrapped || method.toString().indexOf('$self') !== -1) {
                wrapper = function () {
                    var _self = this.$self,
                        ret;

                    // TODO: We should be using a try finally here to ensure that $super is restored correctly but it slows down by a lot!
                    //       Find a better solution?
                    this.$self = constructor;
                    ret = method.apply(this, arguments);
                    this.$self = _self;

                    return ret;
                };
            } else {
                return method;
            }
        } else {
            wrapper = function () {
                var _super = this.$super,
                    _self = this.$self,
                    ret;

                // TODO: We should be using a try finally here to ensure that $super is restored correctly but it slows down by a lot!
                //       Find a better solution?
                this.$super = parent;
                this.$self = constructor;
                ret = method.apply(this, arguments);
                this.$super = _super;
                this.$self = _self;

                return ret;
            };
        }

        wrapper[$wrapped] = method;

        return wrapper;
    }

    /**
     * Borrows members from a vanilla object definition.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function borrowFromVanilla(params, constructor) {
        var key,
            value;

        // Grab mixin members
        for (key in params) {
            value = params[key];

            if (constructor.prototype[key] === undefined) {    // Already defined members are not overwritten
                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    constructor.prototype[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent.prototype[key] : null);

                    // If the function is specified to be bound, add it to the binds
                    if (value[$bound]) {
                        insert(constructor[$class].binds, key);
                    }
                } else {
                    constructor.prototype[key] = value;
                    if (!isImmutable(value)) {
                        insert(constructor[$class].properties, key);
                    }
                }
            }
        }

    }

    /**
     * Parse borrows (mixins).
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseBorrows(params, constructor) {
        if (hasOwn(params, '$borrows')) {
            var current,
                k,
                key,
                value,
                mixins = toArray(params.$borrows),
                i = mixins.length;

            for (i -= 1; i >= 0; i -= 1) {
                current = mixins[i];
                // If it's a vanilla object
                if (isObject(current)) {
                    borrowFromVanilla(current, constructor);
                    continue;
                }
                // If it's a vanilla class
                if (isFunction(current) && !current[$class]) {
                    borrowFromVanilla(current.prototype, constructor);
                    continue;
                }

                current = current.prototype;

                // Grab mixin members
                borrowFromVanilla(current, constructor);

                // Grab mixin static methods
                for (k = current.$static[$class].staticMethods.length - 1; k >= 0; k -= 1) {
                    key = current.$static[$class].staticMethods[k];

                    if (constructor[key] === undefined) {    // Already defined members are not overwritten
                        insert(constructor[$class].staticMethods, key);
                        constructor[key] = current.$static[key];
                    }
                }

                // Grab mixin static properties
                for (key in current.$static[$class].staticProperties) {
                    value = current.$static[$class].staticProperties[key];

                    if (constructor[key] === undefined) {              // Already defined members are not overwritten
                        constructor[$class].staticProperties[key] = value;
                        constructor[key] = cloneProperty(value);
                    }
                }

                // Merge the binds
                combine(constructor[$class].binds, current.$static[$class].binds);
            }
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that has the interfaces
     */
    function handleInterfaces(interfs, target) {
        interfs = toArray(interfs);

        var interf,
            x = interfs.length,
            k;

        for (x -= 1; x >= 0; x -= 1) {
            interf = interfs[x];

            // Inherit constants and add interface to the interfaces array
            if (!contains(target[$class].interfaces, interf)) {

                for (k = interf[$interface].constants.length - 1; k >= 0; k -= 1) {
                    target[interf[$interface].constants[k]] = interf[interf[$interface].constants[k]];
                    target[$class].staticProperties[interf[$interface].constants[k]] = interf[interf[$interface].constants[k]];
                }

                target[$class].interfaces.push(interf);
            }
        }
    }

    /**
     * Parse an object members.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     * @param {Boolean}  isFinal     Parse the members as finals
     */
    function parseMembers(params, constructor, isFinal) {
        var key,
            value,
            cache = {};

        if (hasOwn(params, '$statics')) {
            for (key in params.$statics) {
                value = params.$statics[key];

                if (isFunction(value) && !value[$class] && !value[$interface]) {
                    insert(constructor[$class].staticMethods, key);
                    constructor[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent[key] : null);
                } else {
                    constructor[$class].staticProperties[key] = value;
                    constructor[key] = value;
                }
            }

            delete params.$statics;
        }

        // Save certain keywords in the cache for the loop bellow to work faster
        if (hasOwn(params, '$borrows')) {
            cache.$borrows = params.$borrows;
            delete params.$borrows;
        }

        if (hasOwn(params, '$implements')) {
            cache.$implements = params.$implements;
            delete params.$implements;
        }

        if (hasOwn(params, '$abstracts')) {
            cache.$abstracts = params.$abstracts;
            delete params.$abstracts;
        }

        for (key in params) {
            value = params[key];

            if (isFunction(value) && !value[$class] && !value[$interface]) {
                constructor.prototype[key] = wrapMethod(value, constructor, constructor.$parent ? constructor.$parent.prototype[key] : null);

                // If the function is specified to be bound, add it to the binds
                if (value[$bound]) {
                    insert(constructor[$class].binds, key);
                    delete value[$bound];
                }

                // We should remove the key here because a class may override from primitive to non primitive,
                // but we skip it because the cloneProperty already handles it
            } else {
                constructor.prototype[key] = value;

                if (!isImmutable(value)) {
                    insert(constructor[$class].properties, key);
                }
            }
        }

        // Restore from cache
        mixIn(params, cache);
    }

    /**
     * Parse all the class members, including finals, static and constants.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseClass(params, constructor) {
        var key,
            value,
            saved = {},
            has = {};

         // Save constants & finals to parse later
        if (hasOwn(params, '$constants')) {
            saved.$constants = params.$constants;
            has.$constants = true;
            delete params.$constants;
        }

        if (hasOwn(params, '$finals')) {
            saved.$finals = params.$finals;
            has.$finals = true;
            delete params.$finals;
        }

        // Parse members
        parseMembers(params, constructor);

        // Parse constants
        if (has.$constants) {
            for (key in saved.$constants) {

                value = saved.$constants[key];

                constructor[$class].staticProperties[key] = value;
                constructor[key] = value;
            }
        }

        // Parse finals
        if (has.$finals) {
            parseMembers(saved.$finals, constructor, true);
        }
    }

    /**
     * Applies the context of given methods in the target.
     *
     * @param {Array}  fns      The array of functions to be bound
     * @param {Object} instance The target instance
     */
    function applyBinds(fns, instance) {
        var i,
            current;

        for (i = fns.length - 1; i >= 0; i -= 1) {
            current = instance[fns[i]];
            instance[fns[i]] = bind(current, instance);
        }
    }


    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @param {Function} constructor The constructor function to assume and fill
     * @param {Boolean}  isAbstract  Treat this class as abstract
     *
     * @return {Function} The constructor function
     */
    function createConstructor(constructor, isAbstract) {
        var Instance = constructor || function Instance() {
            var x,
                tmp;

            tmp = this.$static[$class];

            // Reset some types of the object in order for each instance to have their variables
            for (x = tmp.properties.length - 1; x >= 0; x -= 1) {
                this[tmp.properties[x]] = cloneProperty(this[tmp.properties[x]]);
            }

            if (!tmp.efficient) {
                this.$super = this.$self = null;  // Add the super & self to the instance object to speed lookup of the wrapper function
            }

            // Apply binds
            if (tmp.binds.length) {
                applyBinds(tmp.binds, this, this);
            }

            // Call initialize
            this.initialize.apply(this, arguments);
        };

        if (!Instance[$class]) {
            obfuscateProperty(Instance, $class, { staticMethods: [], staticProperties: {}, properties: [], interfaces: [], binds: [] });
        }

        return Instance;
    }

    /**
     * Bind.
     * Works for anonymous functions also.
     *
     * @param {Function} func   The function to be bound
     * @param {...mixed} [args] The arguments to also be bound
     *
     * @return {Function} The bound function
     */
    function doBind(func) {
        /*jshint validthis:true*/
        var args = toArray(arguments),
            bound;

        if (!func[$wrapped] && this.$static && this.$static[$class]) {
            func = wrapMethod(func, this.$self || this.$static);
        }

        args.splice(1, 0, this);
        bound = bind.apply(func, args);

        return bound;
    }

    /**
     * Inherits aditional data from the parent, such as metadata, binds and static members.
     *
     * @param {Function} constructor The constructor
     * @param {Function} parent      The parent
     */
    function inheritParent(constructor, parent) {
        var x,
            binds = parent[$class].binds,
            key,
            value;

        // Inherit binds
        for (x = binds.length - 1; x >= 0; x -= 1) {
            if (binds[x].substr(0, 2) !== '__') {
                constructor[$class].binds.push(binds[x]);
            }
        }

        // Grab properties
        append(constructor[$class].properties, parent[$class].properties);

        // Inherit static methods and properties
        append(constructor[$class].staticMethods, parent[$class].staticMethods);

        for (x =  parent[$class].staticMethods.length - 1; x >= 0; x -= 1) {
            if (parent[$class].staticMethods[x].substr(0, 2) !== '__') {
                constructor[parent[$class].staticMethods[x]] = parent[parent[$class].staticMethods[x]];
            }
        }

        for (key in parent[$class].staticProperties) {
            value = parent[$class].staticProperties[key];

            if (key.substr(0, 2) !== '__') {
                constructor[$class].staticProperties[key] = value;
                constructor[key] = cloneProperty(value);
            }
        }

        // Inherit implemented interfaces
        constructor[$class].interfaces = [].concat(parent[$class].interfaces);
    }

    /**
     * Attempts to optimize the constructor function.
     *
     * @param {Function} constructor The constructor
     *
     * @param {Function} The old or the new constructor
     */
    function optimizeConstructor(constructor) {
        var tmp = constructor[$class],
            canOptimizeConst,
            newConstructor;

        // Check if we can optimize the constructor
        if (tmp.efficient) {
            canOptimizeConst = constructor.$canOptimizeConst;
            delete constructor.$canOptimizeConst;

            if (canOptimizeConst && !tmp.properties.length && !tmp.binds.length) {
                newConstructor = constructor.prototype.initialize;
                newConstructor[$class] = constructor[$class];
                mixIn(newConstructor, constructor);
                newConstructor.prototype = constructor.prototype;

                return newConstructor;
            }
        }

        return constructor;
    }

    /**
     * Function to easily extend another class.
     *
     * @param {Object|Function} params An object containing methods and properties or a function that returns it
     *
     * @return {Function} The new class constructor
     */
    function extend(params, $arg) {
        /*jshint validthis:true*/
        return Class.declare(this, params, $arg);
    }

    /**
     * Create a class definition.
     *
     * @param {Object}      params        An object containing methods and properties
     * @param {Constructor} [constructor] Assume the passed constructor
     * @param {Object}      [opts]        Options
     *
     * @return {Function} The constructor
     */
    createClass = function (params, constructor, opts) {
        opts = opts || {};

        var dejavu,
            parent,
            isEfficient = !!constructor;

        delete params.$name;

        if (hasOwn(params, '$extends')) {
            parent = params.$extends;
            delete params.$extends;

            // If its a vanilla class create a dejavu class based on it
            if (!parent[$class])  {
                parent = createClass(parent.prototype, parent, { isVanilla: true });
            }

            params.initialize = opts.isVanilla ? dejavu : params.initialize || params._initialize || params.__initialize;
            if (!params.initialize) {
                delete params.initialize;
            }

            dejavu = createConstructor(constructor);
            obfuscateProperty(dejavu, '$parent', parent);
            dejavu.prototype = createObject(parent.prototype);

            inheritParent(dejavu, parent);
        } else {
            dejavu = createConstructor(constructor);
            params.initialize = opts.isVanilla ? dejavu : params.initialize || params._initialize || params.__initialize || function () {};
        }

        dejavu[$class].efficient = isEfficient;
        if (!opts.isVanilla) {
            delete params._initialize;
            delete params.__initialize;
        }

        // Parse class members
        parseClass(params, dejavu);

        // Parse mixins
        parseBorrows(params, dejavu);

        // Optimize constructor if possible
        dejavu = optimizeConstructor(dejavu);

        // Assign aliases
        obfuscateProperty(dejavu.prototype, '$static', dejavu);
        obfuscateProperty(dejavu, '$static', dejavu);
        obfuscateProperty(dejavu, '$self', null, true);
        obfuscateProperty(dejavu, '$super', null, true);
        obfuscateProperty(dejavu, '$bind', doBind);
        if (!dejavu.$parent) {
            obfuscateProperty(dejavu.prototype, '$bind', doBind);
        }

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, dejavu);
            delete dejavu.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        // Supply .extend() to easily extend a class
        dejavu.extend = extend;

        return dejavu;
    };

    /**
     * Function to declare a class.
     * This function can be called with various formats.
     *
     * @param {Function|Object} arg1 A class to extend or an object/function to obtain the members
     * @param {Function|Object} arg2 Object/function to obtain the members
     *
     * @return {Function} The constructor
     */
    Class.declare = function (arg1, arg2, $arg3) {
        var params,
            callable = isFunction(this) ? this : createClass,
            constructor;

        if (arg1 && arg2 && arg2 !== true) {
            // create(parentClass, func)
            if (isFunction(arg2)) {
                constructor = createConstructor();
                constructor.$canOptimizeConst = !!$arg3;
                params = arg2(arg1.prototype, constructor, arg1);
            // create(parentClass, props)
            } else {
                params = arg2;
            }

            params.$extends = arg1;
        // create(func)
        } else if (isFunction(arg1)) {
            constructor = createConstructor();
            constructor.$canOptimizeConst = !!arg2;
            params = arg1(constructor);
        // create (props)
        } else {
            params = arg1;
        }

        // Validate params as an object
        if (!isObject(params)) {
            throw new Error('Expected class definition to be an object with the class members.');
        }

        return callable(params, constructor);
    };

    // Add a reference to the createFunction method to be used by other files
    obfuscateProperty(Class, '$create', createClass);

    // Add custom bound function to supply binds
    tmp = true;
    if (Function.prototype.$bound) {
        if (!Function.prototype.$bound.dejavu) {
            printWarning('Function.prototype.$bound is already defined and will be overwritten.');
            if (Object.getOwnPropertyDescriptor) {
                descriptor = Object.getOwnPropertyDescriptor(Function.prototype, '$bound');
                if (!descriptor.writable || !descriptor.configurable) {
                    printWarning('Could not overwrite Function.prototype.$bound.');
                    tmp = false;
                }
            }
        } else {
            tmp = false;
        }
    }

    if (tmp) {
        obfuscateProperty(Function.prototype, '$bound', function () {
            this[$bound] = true;

            return this;
        });
        Function.prototype.$bound.dejavu = true;
    }

    // Add custom bind function to supply binds
    tmp = true;
    if (Function.prototype.$bind) {
        if (!Function.prototype.$bind.dejavu) {
            printWarning('Function.prototype.$bind is already defined and will be overwritten.');
            if (Object.getOwnPropertyDescriptor) {
                descriptor = Object.getOwnPropertyDescriptor(Function.prototype, '$bind');
                if (!descriptor.writable || !descriptor.configurable) {
                    printWarning('Could not overwrite Function.prototype.$bind.');
                    tmp = false;
                }
            }
        } else {
            tmp = false;
        }
    }

    if (tmp) {
        obfuscateProperty(Function.prototype, '$bind', function (context) {
            if (!arguments.length) {
                this[$bound] = true;

                return this;
            }

            var args = toArray(arguments);
            args.splice(0, 1, this);

            return doBind.apply(context, args);
        });
        Function.prototype.$bind.dejavu = true;
    }

    return Class;
});