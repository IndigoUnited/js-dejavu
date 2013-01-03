/*jshint node:true*/

'use strict';

var dejavu = require('dejavu');

var MyClass = dejavu.Class.declare({
    initialize: function () {
        console.log('Hello!');
    }
});

var instance = new MyClass();
instance._wtf = 'bla';