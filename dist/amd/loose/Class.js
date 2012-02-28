/*jslint sloppy:true, forin:true, newcap:true, callee:true*/
/*global define*/

define([
    'Utils/lang/isFunction',
    'Utils/lang/isObject',
    'Utils/lang/isArray',
    'Utils/lang/isUndefined',
    'Utils/lang/createObject',
    'Utils/object/mixIn',
    'Utils/object/hasOwn',
    'Utils/object/forOwn',
    'Utils/array/combine',
    'Utils/array/append',
    'Utils/array/insert',
    'Utils/lang/bind',
    'Utils/lang/toArray'
], function (
    isFunction,
    isObject,
    isArray,
    isUndefined,
    createObject,
    mixIn,
    hasOwn,
    forOwn,
    combine,
    append,
    insert,
    bind,
    toArray
) {

    var Class,
        nextId = 0;

    /**
     * Clones a property in order to make them unique for the instance.
     * This solves the shared properties for types like objects or arrays.
     *
     * @param {Mixed} prop The property
     *
     * @return {Mixed} The cloned property
     */
    function cloneProperty(prop) {

        if (isArray(prop)) {
            return [].concat(prop);
        }
        if (isObject(prop)) {
            return mixIn({}, prop);
        }
        return prop;
    }

    /**
     * Parse borrows (mixins).
     *
     * @param {Function} constructor The constructor
     */
    function parseBorrows(constructor) {

        if (hasOwn(constructor.prototype, 'Borrows')) {

            var current,
                k,
                key,
                mixins = toArray(constructor.prototype.Borrows),
                i = mixins.length,
                grabMember = function (value, key) {
                    if (isUndefined(constructor.prototype[key])) {    // Already defined members are not overwritten
                        constructor.prototype[key] = value;
                        if (isFunction(value) && !value.$class && !value.$interface) {
                            value['$prototype_' + constructor.$class.id] = constructor.prototype;
                            value.$name = key;
                        }
                    }
                },
                grabStaticProperty = function (value, key) {
                    if (isUndefined(constructor[key])) {              // Already defined members are not overwritten
                        constructor[key] = cloneProperty(value);
                        constructor.$class.staticProperties[key] = value;
                    }
                };

            for (i -= 1; i >= 0; i -= 1) {

                current = isObject(mixins[i]) ? Class(mixIn({}, mixins[i])).prototype : mixins[i].prototype;

                // Grab mixin members
                forOwn(current, grabMember);

                // Grab mixin static methods
                for (k = current.$constructor.$class.staticMethods.length - 1; k >= 0; k -= 1) {
                    key = current.$constructor.$class.staticMethods[k];
                    if (isUndefined(constructor[key])) {    // Already defined members are not overwritten
                        insert(constructor.$class.staticMethods, key);
                        constructor[key] = current.$constructor[key];
                        constructor[key]['$constructor_' + constructor.$class.id] = constructor;
                        constructor[key].$name = key;
                    }
                }

                // Grab mixin static properties
                forOwn(current.$constructor.$class.staticProperties, grabStaticProperty);

                // Merge the binds
                combine(constructor.$class.binds, current.$constructor.$class.binds);
            }

            delete constructor.prototype.Borrows;
        }
    }

    /**
     * Handle class interfaces.
     *
     * @param {Array}  interfs The array of interfaces
     * @param {Object} target  The target that will be checked
     */
    function handleInterfaces(interfs, target) {

        var interfaces = toArray(interfs),
            x = interfaces.length;

        for (x -= 1; x >= 0; x -= 1) {
            target.$class.interfaces.push(interfaces[x]);
        }
    }

    /**
     * Parse binds.
     *
     * @param {Function} constructor The constructor
     */
    function parseBinds(constructor) {

        if (hasOwn(constructor.prototype, 'Binds')) {
            var binds = toArray(constructor.prototype.Binds);

            combine(constructor.$class.binds, binds);
            delete constructor.prototype.Binds;
        }
    }

    /**
     * Parse all the members, including static ones.
     *
     * @param {Object}   params      The parameters
     * @param {Function} constructor The constructor
     */
    function parseMembers(params, constructor) {

        forOwn(params, function (value, key) {

            if (key === 'Statics') {

                forOwn(params.Statics, function (value, key) {
                    if (isFunction(value) && !value.$class && !value.$interface) {
                        insert(constructor.$class.staticMethods, key);
                        value['$constructor_' + constructor.$class.id] = constructor;
                        value.$name = key;
                    } else {
                        constructor.$class.staticProperties[key] = value;
                    }

                    constructor[key] = value;
                });

                delete constructor.prototype.Statics;

            } else {
                // TODO: Maybe we could improve this be storing this in the constructor itself and then deleting it
                if (key !== '$constructor' && key !== '$self' && key !== '$static' && key !== 'Name' && key !== 'Binds' && key !== 'Borrows' && key !== 'Implements' && key !== 'Abstracts') {
                    if (isFunction(value) && !value.$class && !value.$interface) {
                        value['$prototype_' + constructor.$class.id] = constructor.prototype;
                        value.$name = key;
                    }
                }
            }
        });
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
            instance[fns[i]]['$prototype_' + instance.$constructor.$class.id] = current['$prototype_' + instance.$constructor.$class.id];
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
            applyBinds(this.$constructor.$class.binds, this, this);

            // Call initialize
            initialize.apply(this, arguments);
        };

        Instance.$class = { staticMethods: [], staticProperties: {}, interfaces: [], binds: [] };

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
            binds = parent.$class.binds;


        // Inherit binds
        for (x = binds.length - 1; x >= 0; x -= 1) {
            if (binds[x].substr(0, 2) !== '__') {
                constructor.$class.binds.push(binds[x]);
            }
        }

        // Inherit static methods and properties
        append(constructor.$class.staticMethods, parent.$class.staticMethods);

        for (x =  parent.$class.staticMethods.length - 1; x >= 0; x -= 1) {
            if (parent.$class.staticMethods[x].substr(0, 2) !== '__') {
                constructor[parent.$class.staticMethods[x]] = parent[parent.$class.staticMethods[x]];
            }
        }

        forOwn(parent.$class.staticProperties, function (value, k) {
            if (k.substr(0, 2) !== '__') {
                constructor.$class.staticProperties[k] = value;
                constructor[k] = cloneProperty(constructor.$class.staticProperties[k]);
            }
        });
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

            return caller['$prototype_' + classId].$constructor.Super[caller.$name].apply(this, arguments);
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

            return caller['$constructor_' + classId].Super.$constructor[caller.$name].apply(this, arguments);
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


        var classify,
            parent;

        if (hasOwn(params, 'Extends')) {
            parent = params.Extends;
            delete params.Extends;

            params.initialize = params.initialize || function () { parent.prototype.initialize.apply(this, arguments); };
            classify = createConstructor(params.initialize);
            classify.$class.id = parent.$class.id;
            classify.Super = parent.prototype;
            classify.prototype = createObject(parent.prototype, params);

            inheritParent(classify, parent);
        } else {
            params.initialize = params.initialize || function () {};
            classify = createConstructor(params.initialize);
            classify.$class.id = nextId += 1;
            classify.prototype = params;

            // Assign aliases
            classify.prototype.$super = superAlias(classify.$class.id);
            classify.prototype.$self = selfAlias(classify.$class.id);
            classify.prototype.$static = staticAlias;
        }

        delete classify.prototype.Name;

        // Assign constructor & static parent alias
        classify.prototype.$constructor = classify;
        classify.$super = superStaticAlias(classify.$class.id);

        // Parse members
        parseMembers(params, classify);

        // Parse mixins
        parseBorrows(classify);

        // Parse binds
        parseBinds(classify);

        // Handle interfaces
        if (hasOwn(params, 'Implements')) {
            handleInterfaces(params.Implements, classify);
            delete classify.prototype.Implements;
        }

        // Remove abstracts reference
        if (hasOwn(params, 'Abstracts')) {
            delete params.Abstracts;
        }

        return classify;
    };

    return Class;
});
