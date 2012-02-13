//>>includeStart('strict', pragmas.strict);
/*jslint sloppy:true*/
/*global define*/

define([
    'Utils/lang/isObject',
    './functionMeta',
    './isFunctionEmpty',
    './isFunctionCompatible'
], function (
    isObject,
    functionMeta,
    isFunctionEmpty,
    isFunctionCompatible
) {

    /**
     * Adds a new method to a target.
     *
     * Will throw an error if:
     *  - If the target is flagged as an interface or abstract class and the method has implementation
     *  - If the target is flagged as an abstract class and is already defined
     *  - The method is not compatible with its base signature
     *
     * @param {String}   name    The method name
     * @param {Function} method  The method itself
     * @param {Object}   target  The target in which the method will be saved
     * @param {Object}   opts    An object with options (type: static|normal, defType: interface|abstract class|class, defName: definition name, defConstructor: definition constructor)
     *
     * @return {Boolean} True if it's compatible, false otherwise
     */
    function addMethod(name, method, target, opts) {

        var metadata;

        // Check if it contains implementation
        if ((opts.isAbstract || opts.isInterface) && !isFunctionEmpty(method)) {
            throw new TypeError((opts.type !== 'normal' ? 'Static method' : 'Method') + ' "' + name + '()" must be anonymous and contain no implementation in ' + opts.defType + ' "' + opts.defName + '".');
        }
        // Check if it is already implemented
        if (opts.isAbstract && (opts.type === 'static' ? opts.defConstructor : opts.defConstructor.prototype)[name]) {
            throw new Error('Abstract method "' + name + '()" defined in ' + opts.defType + ' "' + opts.defName + "' seems to be already implemented and cannot be declared as abstract anymore.");
        }
        // Check if function is ok
        metadata = functionMeta(method);
        if (metadata === null) {
            throw new Error((opts.type !== 'normal' ? 'Static method' : 'Method') + ' "' + name + '" contains optional arguments before mandatory ones in ' + opts.defType + ' "' + opts.defName + '".');
        }

        // Check if the method already exists and if it's compatible
        if (isObject(target[name])) {
            if (!isFunctionCompatible(metadata, target[name])) {
                throw new Error((opts.type !== 'normal' ? 'Static method' : 'Method') + ' "' + name + '(' + metadata.signature + ')" defined in ' + opts.defType + ' "' + opts.defName + '" overrides its ancestor but it is not compatible with its signature: "' + name + '(' + target[name].signature + ')".');
            }
        }

        target[name] = metadata;
    }

    return addMethod;
});
//>>includeEnd('strict');
