/*jshint node:true, regexp:false*/

'use strict';

var esprima = require('esprima'),
    escodegen = require('escodegen'),
    Syntax = esprima.Syntax,
    Optimizer;

/**
 * Constructor.
 *
 * @param {Object} opts The escodegen options
 */
Optimizer = function (opts) {
    this._escodegenOpts = opts.escodegen;
};

/**
 * Checks if this optimizer can optimize a target.
 *
 * @param {String|Object} target The string or the ast
 */
Optimizer.prototype.canOptimize = function (target) {
    if (typeof target !== 'string') {
        target = escodegen.generate(target, this._escodegenOpts);
    }

    return !(/((_*this|_*that|_*thus|_*self))((?:\r|\n|\s)*)\.((?:\r|\n|\s)*)\$self/g).test(target);
};

/**
 * Optimizes the ast passed in the object according to the type.
 * Used as the callback for forEachUsage.
 *
 * @param {Object} obj The object containing the type and the ast
 */
Optimizer.prototype.optimize = function (obj) {
    var type = obj.type,
        ast = obj.ast;

    // Detect and make the optimizations according to the type
    if (type === 'concrete') {
        this.optimizeClass(ast);
    } else if (type === 'abstract') {
        this.optimizeAbstractClass(ast);
        this.optimizeClass(ast);
    } else if (type === 'interface') {
        this.optimizeInterface(ast);
    }
};

/**
 * Optimizes an interface.
 * The ast will be directly modified.
 *
 * @param {Object} ast The interface ast
 */
Optimizer.prototype.optimizeInterface = function (ast) {
    // Step 1
    // Remove all the functions
    var asts = ast['arguments'][0].properties,
        x,
        curr;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (curr.value.type === Syntax.FunctionExpression) {
            asts.splice(x, 1);
        }
    }

    // Step 2
    // Remove $name and $statics
    this._removeProperties(asts, ['$name', '$statics']);
};

/**
 * Optimizes an abstract classs.
 * This just removes the abstract members.
 * You should call optimizeClass() after.
 * The ast will be directly modified.
 *
 * @param {Object} ast The abstract class ast
 */
Optimizer.prototype.optimizeAbstractClass = function (ast) {
    // Step 1
    // Remove abstracts
    // Beware that we need to preserve functions that have .$bound()
    var asts = ast['arguments'][0].properties,
        curr,
        x;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (curr.key.name === '$abstracts' && curr.value.type === Syntax.ObjectExpression) {
            this._removeAbstractFunctions(curr.value.properties);
            if (!curr.value.properties.length) {
                asts.splice(x, 1);
            }

            break;
        }
    }
};

/**
 * Optimizes a concrete class.
 * The ast will be directly modified.
 *
 * @param {Object} ast The class ast
 */
Optimizer.prototype.optimizeClass = function (ast) {
    var args = ast['arguments'],
        type = ast.callee.property.name,
        canBeOptimized,
        parent;

    if (type === 'extend') {
        parent = escodegen.generate(ast.callee.object, this._escodegenOpts);
    } else {
        parent = this._getExtends(args[0]);
    }

    // If something strange is being extended, do not optimize
    if (parent && !(/^[a-z0-9_\$\.]+$/i).test(parent)) {
        return;
    }

    this._currentParent = parent;

    // Step 1
    // Replace all the this.$super / this.$static / this.$self accordingly
    // Be aware that depending on the context (normal or static, things must be adapted)
    canBeOptimized = this._findAndParseFunctions(args[0].properties);

    // Step 2
    // Add a true flag if the constructor can be optimized
    // and remove the $super and $parent that was previously added
    if (canBeOptimized) {
        ast['arguments'].push({
            type: 'Literal',
            value: true
        });
    }

    // Step 3
    // Remove $locked
    this._removeProperties(args[0].properties, ['$locked']);
};

/**
 * Removes the given properties from the ast.
 * The original ast will be modified.
 *
 * @param {Array} asts       The asts
 * @param {Array} properties The properties to remove
 */
Optimizer.prototype._removeProperties = function (asts, properties) {
    var x;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        if (properties.indexOf(asts[x].key.name) !== -1) {
            asts.splice(x, 1);
        }
    }
};

/**
 * Removes all abstract functions of an abstract class.
 * All $bound functions will be kept.
 * The original asts array will be modified.
 *
 * @param {Array} asts The asts
 */
Optimizer.prototype._removeAbstractFunctions = function (asts) {
    var x,
        curr;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];

        if (curr.key.name === '$statics' && curr.value.type === Syntax.ObjectExpression) {
            this._removeAbstractFunctions(curr.value.properties);
            if (!curr.value.properties.length) {
                asts.splice(x, 1);
            }
        } else if (curr.value.type === Syntax.FunctionExpression) {
            asts.splice(x, 1);
        }
    }
};

/**
 * Finds and parses a concrete class functions in order to optimize them.
 * All super and self calls will be replaced with their efficient counterpart.
 *
 * @param {Array}   asts     The functions asts
 * @param {Boolean} isStatic True if in static context, false otherwise
 *
 * @return {Boolean} True if the constructor can be optimized, false otherwise
 */
Optimizer.prototype._findAndParseFunctions = function (asts, isStatic) {
    if (Object.prototype.toString.call(asts) !== '[object Array]') {
        return false;
    }

    var x,
        prevCurr,
        curr,
        currFuncName,
        canBeOptimized = true,
        ret;

    for (x = asts.length - 1; x >= 0; x -= 1) {
        curr = asts[x];
        ret = null;

        if (curr.key.name === '$statics') {
            ret = this._findAndParseFunctions(curr.value.properties, true);
        } else if (curr.key.name === '$finals') {
            ret = this._findAndParseFunctions(curr.value.properties);
        } else if (curr.value.type === Syntax.CallExpression) {
            // Traverse all the CallExpressions and MemberExpressions until we find the FunctionExpression
            // This is because we can have functions with .$bound and other possibly things
            currFuncName = curr.key.name;
            curr = curr.value.callee;
            prevCurr = null;
            while (curr && curr.type !== Syntax.FunctionExpression) {
                prevCurr = curr;
                curr = curr.object || curr.callee;
            }

            if (curr && curr.type === Syntax.FunctionExpression && prevCurr) {
                ret = this._replaceSpecial(currFuncName, prevCurr, isStatic);
            }
        } else if (curr.value.type === Syntax.FunctionExpression) {
            currFuncName = curr.key.name;
            ret = this._replaceSpecial(currFuncName, curr, isStatic);

        }

        if (ret === false) {
            canBeOptimized = false;
        }
    }

    return canBeOptimized;
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
Optimizer.prototype._replaceSpecial = function (funcName, ast, isStatic) {
    var code = escodegen.generate(ast.value || ast.object, this._escodegenOpts),
        newAst,
        currParent = this._currentParent;

    if (!isStatic && funcName === ('_initialize' || funcName === '__initialize')) {
        funcName = 'initialize';
    }

    // Super replacement
    if (!isStatic) {
        code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)\.((?:\r|\n|\s)*)\$super\(/g, currParent + '$2.prototype.$3' + funcName + '.call($1, ')
                   .replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)\.((?:\r|\n|\s)*)\$super\./g, currParent + '$2.prototype.$3' + funcName + '.');
    } else {
        code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)\.((?:\r|\n|\s)*)\$super\(/g, currParent + '$2.$3' + funcName + '.call($1, ')
                   .replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)\.((?:\r|\n|\s)*)\$super\./g, currParent + '$2.$3' + funcName + '.');
    }
    code = code.replace(/(_*this|_*that|_*thus|_*self), \)/g, '$1)');

    // If on static context, this.$static can be optimized to just this
    if (isStatic) {
        code = code.replace(/(_*this|_*that|_*thus|_*self)((?:\r|\n|\s)*)?\.((?:\r|\n|\s)*)?\$static/g, '$1$2$3');
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

    return true;
};

/**
 * Grabs and returns the $extends of an ast.
 * Will null if none.
 *
 * @param {Function} ast The ast
 *
 * @return {String} The $extends property
 */
Optimizer.prototype._getExtends = function (ast) {
    var x,
        length = ast.properties.length;

    for (x = 0; x < length; x += 1) {
        if (ast.properties[x].key.name === '$extends') {
            return escodegen.generate(ast.properties[x].value, this._escodegenOpts);
        }
    }

    return null;
};

/**
 * Removes $extends of an ast.
 *
 * @param {Function} ast The ast
 */
Optimizer.prototype._removeExtends = function (ast) {
    var x,
        length = ast.properties.length;

    for (x = 0; x < length; x += 1) {
        if (ast.properties[x].key.name === '$extends') {
            ast.properties.splice(x, 1);
            break;
        }
    }
};

module.exports = Optimizer;