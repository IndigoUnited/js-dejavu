/**
 * Module/Class description.
 */
define(['dejavu/Class', './base'], function (Class, Base) {

    'use strict';

    var Mixin = Class.declare({
        someMixinMethod: function () {},
        someMixinProperty: 'yea',

        $statics: {
            someStaticMixinMethod: function () {},
            someStaticMixinProperty: 'yea'
        }
    });

    return Base.extend(function ($super) {
        return {
            $name: 'Marcelo',
            $borrows: Mixin,

            run: function () {
                console.log('marcelo run');
                $super.run.call(this);
            },

            $statics: {
                staticMethod: function () {}
            }
        };
    });
});