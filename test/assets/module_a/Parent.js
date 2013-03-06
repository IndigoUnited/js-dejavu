/*jshint node:true*/

'use strict';

var dejavu = require('dejavu');

// Force ids to increment
dejavu.Class.declare({});
dejavu.Class.declare({});
dejavu.Class.declare({});
dejavu.Class.declare({});
dejavu.Class.declare({});

module.exports = dejavu.Class.declare({
    $name: 'Parent',

    _protectedProp: 'foo',

    setProp: function (val) {
        this._protectedProp = val;
    }
});