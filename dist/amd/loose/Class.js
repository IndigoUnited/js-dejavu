/*jslint sloppy:true, forin:true, newcap:true, callee:true, eqeq:true*/
/*global define*/

define([
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isDate',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/array/combine',
    'Utils/array/contains',
    'Utils/array/append',
    'Utils/array/insert',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function ClassWrapper(
    isFunction,
    isObject,
    isArray,
    isDate,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    combine,
    contains,
    append,
    insert,
    bind,
    toArray
) {

    var Class,
        nextId = 0,
        $class = '$class',
        $interface = '$interface';

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
            return mixIn({}, prop);
        }
        if (isDate(prop)) {
            temp = new Date();
            temp.setTime(prop.getTime());
            return temp;
        }

        return prop;
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

                current = isObject(mixins[i]) ? Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

                // Grab mixin members
                for (key in current) {

                    value = current[key];

                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        constructor.prototype[key] = value;
                        if (isFunction(value) && !value[$class] && !value[$interface]) {
                            value['$prototype_' + constructor[$class].id] = constructor.prototype;
                            value.$name = key;
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
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, '$binds')) {
            var binds = toArray(constructor.prototype.$binds);

            combine(constructor[$class].binds, binds);
            delete constructor.prototype.$binds;
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
        if (hasOwn(params, '$binds')) {
            cache.$binds = params.$binds;
            delete params.$binds;
        }

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
                value['$prototype_' + constructor[$class].id] = constructor.prototype;
                value.$name = key;
            }

            if (isFinal) {
                constructor.prototype[key] = value;
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
     * @param {Function} initialize The initialize function
     *
     * @return {Function} The constructor function
     */
    function createConstructor(initialize) {

        var Instance = function () {

            var key;

            // Reset some types of the object in order for each instance to have their variables
            for (key in this) {
                this[key] = cloneProperty(this[key]);
            }

            // Apply binds
            applyBinds(this.$constructor[$class].binds, this, this);

            // Call initialize
            initialize.apply(this, arguments);
        };

        Instance[$class] = { staticMethods: [], staticProperties: {}, interfaces: [], binds: [] };

        return Instance;
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
     * Creates a function that will be used to call a parent method.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function superAlias(classId) {

        return function parent() {

            var caller = parent.caller || arguments.callee.caller || arguments.caller;

            return caller['$prototype_' + classId].$constructor.$parent.prototype[caller.$name].apply(this, arguments);
        };
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

            var caller = self.caller || arguments.callee.caller || arguments.caller;

            return caller['$prototype_' + classId].$constructor;
        };
    }

    /**
     * Creates a function that will be used to access the static methods of itself (with late binding).
     *
     * @return {Function} The function
     */
    function staticAlias() {
        return this.$constructor;
    }

    /**
     * Creates a function that will be used to call a parent static method.
     *
     * @param {String} classId The unique class id
     *
     * @return {Function} The function
     */
    function superStaticAlias(classId) {

        return function parent() {

            var caller = parent.caller || arguments.callee.caller || arguments.caller;

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

        delete params.$name;

        var classify,
            parent;

        if (hasOwn(params, '$extends')) {
            parent = params.$extends;
            delete params.$extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = createConstructor(params.initialize);
            classify.$parent = parent;
            classify[$class].id = parent[$class].id;
            classify.prototype = createObject(parent.prototype, params);

            inheritParent(classify, parent);
        } else {
            params.initialize = params.initialize || function () {};
            classify = createConstructor(params.initialize);
            classify[$class].id = nextId += 1;
            classify.prototype = params;

            // Assign aliases
            classify.prototype.$super = superAlias(classify[$class].id);
            classify.prototype.$self = selfAlias(classify[$class].id);
            classify.prototype.$static = staticAlias;
        }


        // Parse class members
        parseClass(params, classify);

        // Assign constructor & static parent alias
        classify.prototype.$constructor = classify;
        classify.$super = superStaticAlias(classify[$class].id);

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);


        // Handle interfaces
        if (hasOwn(params, '$implements')) {
            handleInterfaces(params.$implements, classify);
            delete classify.prototype.$implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, '$abstracts')) {
            delete params.$abstracts;
        }

        return classify;
    };

    return Class;
});
