/**
 * Module/Class description.
 */
define(['dejavu/Class', './marcelo'], function (Class, Marcelo) {

    'use strict';

    var Andre = Class.declare(Marcelo, function ($super) {
        return {
            $name: 'André',
            $locked: false,

            _test: 2,

            initialize: function () {
                this._test = 10;
                this.$static.someStatic = 'foo';
                this.$static.otherStatic = 'bar';
            },

            run: function () {
                console.log('andre run', this._test);
                $super.run.call(this);
            },

            $statics: {
                someStatic: 'test',
                otherStatic: 'test'
            }
        };
    });

    Andre.prototype._undeclared = 'bar';
    Andre._undeclared = 'bar';

    return Andre;
});