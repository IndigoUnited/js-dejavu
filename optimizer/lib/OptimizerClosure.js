/*jshint node:true, regexp:false*/

'use strict';

var Optimizer = require('./Optimizer'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    util = require('util'),
    Syntax = esprima.Syntax,
    OptimizerClosure;

/**
 * Constructor.
 *
 * @param {Object} opts The escodegen options
 */
OptimizerClosure = function (opts) {
    Optimizer.call(this, opts);
};

util.inherits(OptimizerClosure, Optimizer);

/**
 * Checks if this optimizer can optimize a target.
 *
 * @param {String|Object} target The string or the ast
 */
OptimizerClosure.prototype.canOptimize = function () {
    return true;
};

/**
 * Optimizes a concrete class.
 * The ast will be directly modified.
 *
 * @param {Object} ast The class ast
 */
OptimizerClosure.prototype.optimizeClass = function (ast) {
    var args = ast['arguments'],
        type = ast.callee.property.name,
        extend,
        funcExpression,
        canBeOptimized,
        hasParent;

    // Do not optimize if the class is already optimized
    if (args.length && args[args.length - 1].value === true) {
        return;
    }

    // Step 1
    // Convert the object to a return function with the magical $ params
    funcExpression = {
        type: Syntax.FunctionExpression,
        id: null,
        params: [],
        body: {
            type: Syntax.BlockStatement,
            body: [
                {
                    type: Syntax.ReturnStatement
                    // Return object will be here as the argument key
                }
            ]
        }
    };

    if (type === 'extend' || (extend = this._getExtends(args[0]))) {
        hasParent = true;
        funcExpression.params.push(
            {
                type: Syntax.Identifier,
                name: '$super'
            },
            {
                type: Syntax.Identifier,
                name: '$parent'
            },
            {
                type: Syntax.Identifier,
                name: '$self'
            }
        );

        if (type !== 'extend') {
            this._removeExtends(args[0]);
            ast['arguments'] = [
                {
                    type: 'Identifier',
                    name: extend
                },
                funcExpression
            ];
        } else {
            ast['arguments'] = [funcExpression];
        }
    } else {
        hasParent = false;
        funcExpression.params.push(
            {
                type: Syntax.Identifier,
                name: '$self'
            }
        );
        ast['arguments'] = [funcExpression];
    }

    funcExpression.body.body[0].argument = args[0];

    // Step 2
    // Replace all the this.$super / this.$static / this.$self accordingly
    // Be aware that depending on the context (normal or static, things must be adapted)
    canBeOptimized = this._findAndParseFunctions(args[0].properties);

    // Step 3
    // Add a true flag if the constructor can be optimized
    // and remove the $super and $parent that was previously added
    if (canBeOptimized) {
        ast['arguments'].push({
            type: 'Literal',
            value: true
        });

        funcExpression.params.splice(hasParent ? 2 : 0, 1);
    }

    // Step 4
    // Remove $name and $locked
    this._removeProperties(args[0].properties, ['$name', '$locked']);
};

/**
 * Replaces a function usage of keywords for their efficient counterparts.
 * Basically this.$super, this.$static and this.$self will be optimized.
 *
 * @param {String} funcName The function name
 * @param {Object} ast      The function ast
 * @param {Boolean} isStatic True if in static context, false otherwise
 *
 * @return {Boolean} False if this functions causes the constructor to not be optimized, false otherwise
 */
OptimizerClosure.prototype._replaceSpecial = function (funcName, ast, isStatic) {
    if (!ast.value && !ast.object) {
        process.stderr.write(JSON.stringify(ast, null, '  '));
        process.exit(1);
    }
    var code = escodegen.generate(ast.value || ast.object, this._escodegenOpts),
        canBeOptimized = true,
        newAst;

    function selfReplacer() {
        canBeOptimized = false;
        return '$self';
    }

    if (!isStatic && funcName === ('_initialize' || funcName === '__initialize')) {
        funcName = 'initialize';
    }

    // Super replacement
    code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)?\.((?:\r|\n|\s)*)\$super\(/g, '$super$2.$3' + funcName + '.call($1, ')
               .replace(/(_*this|_*that|_*thus|_*self), \)/g, '$1)')
               .replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)?\.((?:\r|\n|\s)*)\$super\./g, '$super$2.$3' + funcName + '.');

    // If on static context, $super is actually $parent
    // Also this.$static can be replaced by this because is faster
    if (isStatic) {
        code = code.replace(/\$super/g, '$parent');
        code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)?\.((?:\r|\n|\s)*)?\$static/g, '$1$2$3');
    }

    // Self replacement
    code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)?\.((?:\r|\n|\s)*)?\$self?/g, selfReplacer);

    // Test if something went wrong
    if (/\.(\r|\n|\s)*\$super/g.test(code) || /\.(\r|\n|\s)*\$self/g.test(code) || (isStatic && /\.(\r|\n|\s)*\$static/g.test(code))) {
        process.stderr.write('The optimization might have broken the behavior at line ' + ast.value.loc.start.line + ', column ' + ast.value.loc.start.column + '\n');
    }

    // Remove member
    code = code.replace(/\.\$member\(\)/g, '');

    code = code.replace(/function\s*\(/, 'function x(');

    if (ast.value) {
        ast.value = newAst = esprima.parse(code).body[0];
    } else {
        ast.object = newAst = esprima.parse(code).body[0];
    }

    newAst.id = null;
    newAst.type = Syntax.FunctionExpression;

    return canBeOptimized;
};

module.exports = OptimizerClosure;
