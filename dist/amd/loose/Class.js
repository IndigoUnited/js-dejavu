/*jshint strict:false, noarg:false*/

// TODO: implement the super like john resign for the loose version

define([
    './common/isImmutable',
    './common/isPlainObject',
    'amd-utils/lang/isFunction',
    'amd-utils/lang/isObject',
    'amd-utils/lang/isArray',
    'amd-utils/lang/isDate',
    'amd-utils/lang/isRegExp',
    'amd-utils/lang/isUndefined',
    'amd-utils/lang/createObject',
    'amd-utils/object/hasOwn',
    'amd-utils/array/combine',
    'amd-utils/array/contains',
    './common/mixIn',
    'amd-utils/array/append',
    'amd-utils/lang/bind',
    'amd-utils/lang/toArray',
    'amd-utils/array/insert'
], function ClassWrapper(
    isImmutable,
    isPlainObject,
    isFunction,
    isObject,
    isArray,
    isDate,
    isRegExp,
    isUndefined,
    createObject,
    hasOwn,
    combine,
    contains,
    mixIn,
    append,
    bind,
    toArray,
    insert
) {

    var Class,
        nextId = 0,
        $class = '$class',
        $interface = '$interface',
        $bound = '$bound_dejavu',
        staticAlias;

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {

        var temp;

        if (isArray(prop)) {
            return [].concat(prop);
        }
        if (isObject(prop)) {
            if (isPlainObject(prop)) {
                return mixIn({}, prop);
            }

            return createObject(prop);
        }
        if (isDate(prop)) {
            temp = new Date();
            temp.setTime(prop.getTime());

            return temp;
        }
        if (isRegExp(prop)) {
            temp = (prop.toString()).replace(/[\s\S]+\//, '');

            return new RegExp(prop.source, temp);
        }

        return prop;
    }

    /**
     * Wraps a method.
     * This is to make some alias such as $super to work correctly.
     *
     * @param {Function} method      The method to wrap
     * @param {Function} parent      The parent method
     *
     * @return {Function} The wrapper
     */
    function wrapMethod(method, parent) {

        if (method.$wrapped) {
            method = method.$wrapped;
        }

        if (!parent) {
            return method;
        } else {

            var wrapper = function () {
                var _super = this.$super,
                    ret;

                this.$super = parent;
                try {
                    ret = method.apply(this, arguments);
                } finally {
                    this.$super = _super;
                }

                return ret;
            };

            wrapper.$wrapped = method;

            return wrapper;
        }
    }

    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, '$borrows')) {

            var current,
                k,
                key,
                value,
                mixins = toArray(constructor.prototype.$borrows),
                i = mixins.length;

            for (i -= 1; i >= 0; i -= 1) {

                current = isObject(mixins[i]) ? new Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

                // Grab mixin members
                for (key in current) {

                    value = current[key];

                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        if (isFunction(value) && !value[$class] && !value[$interface]) {
                            constructor.prototype[key] = wrapMethod(value, constructor.$parent ? constructor.$parent.prototype[key] : null);
                            value['$prototype_' + constructor[$class].id] = constructor.prototype;
                            value.$name = key;

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

                // Grab mixin static methods
                for (k = current.$constructor[$class].staticMethods.length - 1; k >= 0; k -= 1) {

                    key = current.$constructor[$class].staticMethods[k];

                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor[$class].staticMethods, key);
                        constructor[key] = current.$constructor[key];
                        constructor[key]['$constructor_' + constructor[$class].id] = constructor;
                        constructor[key].$name = key;
                    }
                }

                // Grab mixin static properties
                for (key in current.$constructor[$class].staticProperties) {

                    value = current.$constructor[$class].staticProperties[key];

                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        constructor[$class].staticProperties[key] = value;
                        constructor[key] = cloneProperty(value);
                    }
                }

                // Merge the binds
                combine(constructor[$class].binds, current.$constructor[$class].binds);
            }

            delete constructor.prototype.$borrows;
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
                    value['$constructor_' + constructor[$class].id] = constructor;
                    value.$name = key;
                } else {
                    constructor[$class].staticProperties[key] = value;
                }

                constructor[key] = value;
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
                constructor.prototype[key] = !value.$inherited ? wrapMethod(value, constructor.$parent ? constructor.$parent.prototype[key] : null) : value;

                value['$prototype_' + constructor[$class].id] = constructor.prototype;
                value.$name = key;

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
            instance[fns[i]]['$prototype_' + instance.$constructor[$class].id] = current['$prototype_' + instance.$constructor[$class].id];
            instance[fns[i]].$name = current.$name;
        }
    }

    /**
     * Builds the constructor function that calls the initialize and do
     * more things internally.
     *
     * @return {Function} The constructor function
     */
    function createConstructor() {

        var Instance = function Instance() {

            var x,
                properties;

            // Reset some types of the object in order for each instance to have their variables
            properties = this.$constructor[$class].properties;
            for (x = properties.length - 1; x >= 0; x -= 1) {
                this[properties[x]] = cloneProperty(this[properties[x]]);
            }

            this.$super = defaultSuper;           // Add the super to the instance object to speed lookup of the wrapper function

            // Apply binds
            if (this.$constructor[$class].binds.length) {
                applyBinds(this.$constructor[$class].binds, this, this);
            }

            // Call initialize
            this.initialize.apply(this, arguments);
        };

        Instance[$class] = { staticMethods: [], staticProperties: {}, properties: [], interfaces: [], binds: [] };

        return Instance;
    }

    /**
     * Default implementation of the super function.
     */
    function defaultSuper() {
        throw new Error('Trying to call $super when there is not parent function.');
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
     * Creates a function that will be used to access the static members of itself.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function selfAlias(classId) {

        return function self() {

            var caller = self.caller || arguments.callee.caller || arguments.caller;    // Ignore JSLint error regarding .caller and .callee

            return caller['$prototype_' + classId].$constructor;
        };
    }

    /**
     * Creates a function that will be used to access the static methods of itself (with late binding).
     *
     * @return {Function} The function
     */
    staticAlias = function () {
        return this.$constructor;
    };

    /**
     * Creates a function that will be used to call a parent static method.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function superStaticAlias(classId) {

        return function parent() {

            var caller = parent.caller || arguments.callee.caller || arguments.caller;  // Ignore JSLint error regarding .caller and .callee

            return caller['$constructor_' + classId].$parent[caller.$name].apply(this, arguments);
        };
    }

    /**
     * Create a class definition.
     *
     * @param {Object} params An object containing methods and properties
     *
     * @return {Function} The constructor
     */
    Class = function Class(params) {

        var dejavu,
            parent;

        delete params.$name;

        if (hasOwn(params, '$extends')) {
            parent = params.$extends;
            delete params.$extends;

            params.initialize = params.initialize || params._initialize || params.__initialize;
            if (!params.initialize) {
                delete params.initialize;
            }

            dejavu = createConstructor();
            dejavu.$parent = parent;
            dejavu[$class].id = parent[$class].id;
            dejavu.prototype = createObject(parent.prototype);

            inheritParent(dejavu, parent);
        } else {
            params.initialize = params.initialize || params._initialize || params.__initialize || function () {};
            dejavu = createConstructor();
            dejavu[$class].id = nextId += 1;
            dejavu.prototype = params;
        }

        delete params._initialize;
        delete params.__initialize;

        // Parse class members
        parseClass(params, dejavu);

        // Assign aliases
        if (!parent) {
            dejavu.prototype.$self = selfAlias(dejavu[$class].id);
            dejavu.prototype.$static = staticAlias;
        }
        dejavu.prototype.$constructor = dejavu;
        dejavu.$super = superStaticAlias(dejavu[$class].id);

        // Parse mixins
        parseBorrows(dejavu);

        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, dejavu);
            delete dejavu.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        return dejavu;
    };

    // TODO: check if a $bound or $bind already exist in the prototype and emit a warning?
    // TODO: do a $bound and $bind function available as amd defines

    // Add custom bound function to supply binds
    Function.prototype.$bound = function () {
        this[$bound] = true;

        return this;
    };

    Function.prototype.$bind = function () {
        if (!arguments.length) {
            this[$bound] = true;
        } else {
            // TODO:
        }
    };

    return Class;
});

// TODO: comment out the wrapMethod
// TODO: make the static methods also use the wrapper
// Remove unecessary $name and suff