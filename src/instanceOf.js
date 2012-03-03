/*jslint sloppy:true*/
/*global define*/

define([
//>>includeStart('strict', pragmas.strict);
    './common/randomAccessor'
//>>includeEnd('strict');
], function (
//>>includeStart('strict', pragmas.strict);
    randomAccessor
//>>includeEnd('strict');
) {

//>>includeStart('strict', pragmas.strict);
    var random = randomAccessor(),
        $class = '$class_' + random,
        $interface = '$interface_' + random;
//>>includeEnd('strict');
//>>excludeStart('strict', pragmas.strict);
    var $class = '$class',
        $interface = '$interface';
//>>excludeEnd('strict');

    /**
     * Check if an interface is descendant of another.
     *
     * @param {Function} interf1 The interface to be checked
     * @param {Function} interf2 The interface to be expected as the ancestor
     *
     * @return {Boolean} True if it's a descendant, false otherwise
     */
    function interfaceDescendantOf(interf1, interf2) {

        var x,
            parents = interf1[$interface].parents;

        for (x = parents.length - 1; x >= 0; x -= 1) {
            if (parents[x] === interf2) {
                return true;
            }
            if (interfaceDescendantOf(interf1, parents[x])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a class is an instance of an interface.
     *
     * @param {Object}   instance The instance to be checked
     * @param {Function} target   The interface
     *
     * @return {Boolean} True if it is, false otherwise
     */
    function instanceOfInterface(instance, target) {

        var x,
            interfaces = instance.$constructor[$class].interfaces;

        for (x = interfaces.length - 1; x >= 0; x -= 1) {
            if (interfaces[x] === target || interfaceDescendantOf(interfaces[x], target)) {
                return true;
            }
        }

        return instance.$constructor.$parent ? instanceOfInterface(instance.$constructor.$parent.prototype, target) : false;
    }

    /**
     * Custom instanceOf that also works on interfaces.
     *
     * @param {Object}   instance The instance to be checked
     * @param {Function} target   The target
     *
     * @return {Boolean} True if it is a valid instance of target, false otherwise
     */
    function instanceOf(instance, target) {

        if (instance.$constructor[$class] && target[$interface]) {
            return instanceOfInterface(instance, target);
        }

        return instance instanceof target;
    }

    return instanceOf;
});