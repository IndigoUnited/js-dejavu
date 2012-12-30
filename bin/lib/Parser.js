/*jshint node:true*/

'use strict';

var esprima = require('esprima'),
    Syntax = esprima.Syntax,
    Parser;

/**
 * Constructor.
 */
Parser = function () {};

/**
 * Run the callback foreach dejavu usage.
 * The callback will receive an object containing a type and the ast.
 * The type is either interface, abstract or concrete.
 *
 * @param {Object}   ast      The ast
 * @param {Function} callback The callback
 */
Parser.prototype.forEachUsage = function (ast, callback) {
    var queue = [ast],
        curr,
        objectName,
        x,
        keys,
        props;

    while (queue.length) {
        curr = queue.pop();

        if (!curr) {
            continue;
        }

        if (curr.type === Syntax.CallExpression &&
            curr.callee.type === Syntax.MemberExpression &&
            curr.callee.property.type === Syntax.Identifier &&
            curr['arguments'].length && curr['arguments'][0].type === Syntax.ObjectExpression) {

            objectName = curr.callee.object.type === 'MemberExpression' ? curr.callee.object.property.name : curr.callee.object.name;

            // Obvious usage
            if (curr.callee.property.name === 'declare') {
                if (objectName === 'Interface') {
                    callback({ type: 'interface', ast: curr });
                } else if (objectName === 'AbstractClass') {
                    callback({ type: 'abstract', ast: curr });
                } else if (objectName === 'Class' || objectName === 'FinalClass') {
                    callback({ type: 'concrete', ast: curr });
                }
            // Usage with extend
            } else if (curr.callee.property.name === 'extend') {
                props = curr['arguments'][0].properties;

                if (this._isInterface(props)) {
                    callback({ type: 'interface', ast: curr });
                } else if (this._isAbstractClass(props)) {
                    callback({ type: 'abstract', ast: curr });
                } else if (this._isClass(props)) {
                    callback({ type: 'concrete', ast: curr });
                } else {
                    process.stderr.write('Not enough metadata to optimize usage at line ' + curr.loc.start.line + ', column ' + curr.loc.start.column + ' (add a $name property?)\n');
                }
            }
        }

        if (Object.prototype.toString.call(curr) === '[object Array]') {
            for (x = curr.length - 1; x >= 0; x -= 1) {
                queue.push(curr[x]);
            }
        } else if (curr.type) {
            keys = Object.keys(curr);

            for (x = keys.length - 1; x >= 0; x -= 1) {
                queue.push(curr[keys[x]]);
            }
        }
    }
};

/**
 * Checks if the passed asts (members) are part of an interface.
 *
 * @param  {Array} asts The asts
 *
 * @return {Boolean} True if it is, false otherwise
 */
Parser.prototype._isInterface = function (asts) {
    var x,
        curr;

    // Every single function must be empty
    // Also all the properties must be functions except a few ones ($extends, $name, $static)
    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (curr.key.name === '$name' || curr.key.name === '$extends') {
            continue;
        }

        if (curr.key.name === '$statics') {
            if (!this._isInterface(curr.value)) {
                return false;
            }
        } else if (curr.type === Syntax.FunctionExpression) {
            if (curr.body.body.length) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
};

/**
 * Checks if the passed asts (members) are part of an abstract class.
 *
 * @param  {Array} asts The asts
 *
 * @return {Boolean} True if it is, false otherwise
 */
Parser.prototype._isAbstractClass = function (asts) {
    // Check if it has an $abstracts
    var x,
        curr;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (curr.key.name === '$abstracts') {
            return true;
        }
    }

    return false;
};

/**
 * Checks if the passed asts (members) are part of a concrete class.
 *
 * @param  {Array} asts The asts
 *
 * @return {Boolean} True if it is, false otherwise
 */
Parser.prototype._isClass = function (asts) {
    // Check if it has a $name, $extends, $borrows, $statics, $finals, $constants
    var x,
        curr,
        known = ['$name', '$extends', '$borrows', '$implements', '$statics', '$finals', '$constants'];

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (known.indexOf(curr.key.name) !== -1) {
            return true;
        }
    }

    return false;
};

module.exports = Parser;