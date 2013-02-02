define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, options, hasDefineProperty, Emitter) {
    'use strict';
    var expect = global.expect;
    beforeEach(function (done) {
        setTimeout(done, 0);
    });
    describe('Verifications:', function () {
        describe('Defining an Interface', function () {
            it('should throw an error when using an invalid argument', function () {
                expect(function () {
                    return Interface.declare('some');
                }).to.throwException(/to be an object/);
            });
            it('should throw an error when using an invalid name', function () {
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/must be a string/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/must be a string/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/spaces/);
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
            });
            it('should throw an error when defining the initialize method', function () {
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/initialize method/i);
            });
            it('should throw an error if using .extend() with an $extend property', function () {
                expect(function () {
                    var SomeInterface = Interface.declare({}), OtherInterface = SomeInterface.extend({ $extends: SomeInterface });
                }).to.throwException(/cannot contain an .extends property/);
            });
            it('should work with .extend()', function () {
                var SomeInterface = Interface.declare({}), OtherInterface = SomeInterface.extend({}), SomeClass = Class.declare({ $implements: OtherInterface }, true), someClass = new SomeClass();
                expect(instanceOf(someClass, OtherInterface)).to.be.equal(true);
                expect(instanceOf(someClass, SomeInterface)).to.be.equal(true);
            });
            it('should throw an error when defining unallowed members', function () {
                expect(function () {
                    return Interface.declare({ $constants: { $finals: {} } });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $constants: { $abstracts: {} } });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $constants: { $statics: {} } });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $finals: {} });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $abstracts: {} });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $implements: [] });
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Interface.declare({ $borrows: [] });
                }).to.throwException(/unallowed/);
            });
            it('should throw an error when defining ambiguous members', function () {
                expect(function () {
                    return Interface.declare({ $constants: { SOME: 'foo' } });
                }).to.throwException(/different modifiers/);
            });
            it('should throw an error when extending an invalid interface', function () {
                expect(function () {
                    return Interface.declare({ $extends: 'wtf' });
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Interface.declare({ $extends: undefined });
                }).to.throwException(/nonexistent interface/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({
                        $extends: [
                            undefined,
                            tmp
                        ]
                    });
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Interface.declare({ $extends: null });
                }).to.throwException(/nonexistent interface/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    var tmp = Class.declare({}, true);
                    return Interface.declare({ $extends: tmp });
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
            });
            it('should throw an error if it does not contain only functions without implementation', function () {
                expect(function () {
                    return Interface.declare({ some: 'property' });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({ some: undefined });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({ some: null });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/no implementation/);
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/no implementation/);
                expect(function () {
                    return Interface.declare({ some: Class.declare({}, true) });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({ some: AbstractClass.declare({}, true) });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({ some: Interface.declare({}) });
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/not a function/);
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
            });
            it('should throw an error if it any function is not well formed', function () {
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/contains optional arguments before mandatory ones/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/contains optional arguments before mandatory ones/);
            });
            it('should throw an error if $statics is not an object', function () {
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({});
                }).to.not.throwException();
            });
            it('should throw an error if $constants is not an object', function () {
                expect(function () {
                    return Interface.declare({ $constants: 'wtf' });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({ $constants: undefined });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({ $constants: null });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Interface.declare({ $constants: {} });
                }).to.not.throwException();
            });
            it('should throw an error when using reserved keywords', function () {
                var reserved = [
                        '$constructor',
                        '$initializing',
                        '$static',
                        '$self',
                        '$super'
                    ], reservedStatic = [
                        '$parent',
                        '$super',
                        '$static',
                        '$self',
                        'extend'
                    ], x, checkNormal = function (key) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return Interface.declare(obj);
                        };
                    }, checkStatic = function (key) {
                        return function () {
                            var obj = { $statics: {} };
                            obj.$statics[key] = 'bla';
                            return Interface.declare(obj);
                        };
                    }, checkConst = function (key) {
                        return function () {
                            var obj = { $constants: {} };
                            obj.$constants[key] = 'bla';
                            return Interface.declare(obj);
                        };
                    };
                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkConst(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                }
            });
            it('should throw an error when it extends duplicate interfaces', function () {
                expect(function () {
                    var SomeInterface = Interface.declare({});
                    return Interface.declare({
                        $extends: [
                            SomeInterface,
                            SomeInterface
                        ]
                    });
                }).to.throwException(/duplicate entries/);
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            undefined,
                            undefined
                        ]
                    });
                }).to.not.throwException(/duplicate entries/);
            });
            it('should throw an error when it extends multiple ones with incompatible duplicate methods', function () {
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({}),
                            Interface.declare({})
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({}),
                            Interface.declare({})
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({}),
                            Interface.declare({})
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({}),
                            Interface.declare({})
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);
                expect(function () {
                    return Interface.declare({ $extends: [Interface.declare({})] });
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({}),
                            Interface.declare({})
                        ]
                    });
                }).to.not.throwException();
            });
            it('should throw an error when defining incompatible methods compared to its base signature', function () {
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({ $extends: tmp });
                }).to.not.throwException();
            });
            it('should throw an error if $constants have non primitive types', function () {
                expect(function () {
                    return Interface.declare({ $constants: { SOME: {} } });
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Interface.declare({ $constants: { SOME: new Date() } });
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: function () {
                            }
                        }
                    });
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Interface.declare({ $constants: { SOME: [] } });
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Interface.declare({ $constants: { SOME: false } });
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({ $constants: { SOME: null } });
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({ $constants: { SOME: 'SOME' } });
                }).to.not.throwException();
                expect(function () {
                    return Interface.declare({ $constants: { SOME: 1 } });
                }).to.not.throwException();
            });
            it('should throw an error when it extends multiple ones with same constants but different values', function () {
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({ $constants: { FOO: 'test' } }),
                            Interface.declare({ $constants: { FOO: 'test2' } })
                        ]
                    });
                }).to.throwException(/different values/);
                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({ $constants: { FOO: 'test' } }),
                            Interface.declare({ $constants: { FOO: 'test' } })
                        ]
                    });
                }).to.not.throwException();
            });
            it('should throw when overriding a constant', function () {
                expect(function () {
                    var tmp = Interface.declare({ $constants: { FOO: 'test' } });
                    return Interface.declare({
                        $extends: tmp,
                        $constants: { FOO: 'test' }
                    });
                }).to.throwException(/override constant/);
            });
            it('should throw an error if a protected/private methods/constants are defined', function () {
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/non public/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/non public/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/non public/);
                expect(function () {
                    return Interface.declare({});
                }).to.throwException(/non public/);
                expect(function () {
                    return Interface.declare({ $constants: { _FOO: 'bar' } });
                }).to.throwException(/non public/);
                expect(function () {
                    return Interface.declare({ $constants: { __FOO: 'bar' } });
                }).to.throwException(/non public/);
            });
        });
        describe('Defining a Concrete/Abstract Class', function () {
            it('should throw an error when using an invalid argument', function () {
                expect(function () {
                    return Class.declare('some');
                }).to.throwException(/to be an object/);
                expect(function () {
                    return Class.declare(undefined);
                }).to.throwException(/to be an object/);
                expect(function () {
                    return Class.declare(null);
                }).to.throwException(/to be an object/);
            });
            it('should throw an error when using an invalid name', function () {
                expect(function () {
                    return Class.declare({ $name: undefined }, true);
                }).to.throwException(/must be a string/);
                expect(function () {
                    return Class.declare({ $name: null }, true);
                }).to.throwException(/must be a string/);
                expect(function () {
                    return Class.declare({ $name: 'Some $name' }, true);
                }).to.throwException(/spaces/);
                expect(function () {
                    return Class.declare({ $name: 'SomeName' }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({ $name: undefined }, true);
                }).to.throwException(/must be a string/);
                expect(function () {
                    return AbstractClass.declare({ $name: null }, true);
                }).to.throwException(/must be a string/);
                expect(function () {
                    return AbstractClass.declare({ $name: 'Some $name' }, true);
                }).to.throwException(/spaces/);
                expect(function () {
                    return AbstractClass.declare({ $name: 'SomeName' }, true);
                }).to.not.throwException();
            });
            it('should throw an error when using an invalid initialize', function () {
                expect(function () {
                    return Class.declare({ initialize: undefined }, true);
                }).to.throwException(/must be a function/);
                expect(function () {
                    return Class.declare({ initialize: null }, true);
                }).to.throwException(/must be a function/);
                expect(function () {
                    return Class.declare({ initialize: 'some' }, true);
                }).to.throwException(/must be a function/);
            });
            it('should throw an error if using .extend() with an $extend property', function () {
                expect(function () {
                    var SomeClass = Class.declare({}, true), OtherClass = SomeClass.extend({ $extends: SomeClass });
                }).to.throwException(/cannot contain an .extends property/);
            });
            it('should throw an error when defining several constructors', function () {
                expect(function () {
                    return Class.declare({
                        initialize: function () {
                        },
                        _initialize: function () {
                        }
                    }, true);
                }).to.throwException(/several constructors/i);
                expect(function () {
                    return Class.declare({
                        initialize: function () {
                        },
                        __initialize: function () {
                        }
                    }, true);
                }).to.throwException(/several constructors/i);
                expect(function () {
                    return Class.declare({
                        _initialize: function () {
                        },
                        __initialize: function () {
                        }
                    }, true);
                }).to.throwException(/several constructors/i);
            });
            it('should work well when using the same function for different members', function () {
                var a = function () {
                        return 'ola';
                    }, SomeClass = Class.declare({
                        test: a,
                        test2: a
                    }, true), someClass = new SomeClass(), otherClass = new SomeClass();
                expect(someClass.test()).to.equal('ola');
                expect(someClass.test2()).to.equal('ola');
                expect(otherClass.test()).to.equal('ola');
                expect(otherClass.test2()).to.equal('ola');
            });
            it('should throw an error when defining unallowed members', function () {
                expect(function () {
                    return Class.declare({ $constants: { $finals: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $constants: { $abstracts: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $constants: { $statics: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $finals: { $constants: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $finals: { $abstracts: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $statics: { $finals: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $statics: { $constants: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $statics: { $name: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $finals: { $name: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $constants: { $constants: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return Class.declare({ $constants: { $extends: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $extends: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $abstracts: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $constants: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $finals: {} } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { $constants: {} } } }, true);
                }).to.throwException(/unallowed/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { $finals: {} } } }, true);
                }).to.throwException(/unallowed/);
            });
            it('should throw an error when defining ambiguous members', function () {
                expect(function () {
                    return Class.declare({
                        $constants: { SOME: 'foo' },
                        $statics: { SOME: 'foo' }
                    }, true);
                }).to.throwException(/different modifiers/);
                expect(function () {
                    return Class.declare({
                        $finals: { $statics: { SOME: 'foo' } },
                        $statics: { SOME: 'foo' }
                    }, true);
                }).to.throwException(/different modifiers/);
                expect(function () {
                    return Class.declare({
                        $finals: { $statics: { SOME: 'foo' } },
                        $statics: { other: 'foo' }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $finals: { some: 'foo' },
                        some: 'foo'
                    }, true);
                }).to.throwException(/different modifiers/);
                expect(function () {
                    return Class.declare({
                        $finals: { $statics: { SOME: 'foo' } },
                        $constants: { SOME: 'foo' }
                    }, true);
                }).to.throwException(/different modifiers/);
                expect(function () {
                    return AbstractClass.declare({ $constants: { some: 'foo' } }, true);
                }).to.throwException(/already defined/);
                expect(function () {
                    return AbstractClass.declare({ $finals: { some: 'foo' } }, true);
                }).to.throwException(/already defined/);
                expect(function () {
                    return AbstractClass.declare({ some: 'foo' }, true);
                }).to.throwException(/already defined/);
                expect(function () {
                    return AbstractClass.declare({
                        $finals: {
                            some: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    return AbstractClass.declare({
                        some: function () {
                        }
                    }, true);
                }).to.throwException(/already implemented/);
            });
            it('should throw an error when defining unallowed properties', function () {
                expect(function () {
                    return Class.declare({ some: undefined }, true);
                }).to.throwException(/cannot be parsed/);
                expect(function () {
                    return Class.declare({ $finals: { some: undefined } }, true);
                }).to.throwException(/cannot be parsed/);
                expect(function () {
                    return Class.declare({ $statics: { some: undefined } }, true);
                }).to.throwException(/cannot be parsed/);
                expect(function () {
                    return AbstractClass.declare({ some: undefined }, true);
                }).to.throwException(/cannot be parsed/);
                expect(function () {
                    return AbstractClass.declare({ $finals: { some: undefined } }, true);
                }).to.throwException(/cannot be parsed/);
                expect(function () {
                    return AbstractClass.declare({ $statics: { some: undefined } }, true);
                }).to.throwException(/cannot be parsed/);
            });
            it('should throw an error if initialize is defined inside $abstracts or $finals', function () {
                expect(function () {
                    return Class.declare({
                        $finals: {
                            initialize: function () {
                            }
                        }
                    }, true);
                }).to.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.throwException();
            });
            it('should throw an error when extending an invalid class', function () {
                expect(function () {
                    return Class.declare({ $extends: 'wtf' });
                }).to.throwException(/is not a valid class/);
                expect(function () {
                    return Class.declare({ $extends: undefined }, true);
                }).to.throwException(/is not a valid class/);
                expect(function () {
                    return Class.declare({ $extends: null }, true);
                }).to.throwException(/is not a valid class/);
                expect(function () {
                    var tmp = Interface.declare({});
                    return Class.declare({ $extends: tmp }, true);
                }).to.throwException(/is not a valid class/);
                expect(function () {
                    var tmp = Class.declare({}, true);
                    return Class.declare({ $extends: tmp }, true);
                }).to.not.throwException();
            });
            it('should throw an error if it any function is not well formed', function () {
                expect(function () {
                    return Class.declare({
                        method1: function ($a, b) {
                        }
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);
                expect(function () {
                    return Class.declare({
                        $statics: {
                            method1: function ($a, b) {
                            }
                        }
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);
                expect(function () {
                    var $ = function () {
                    };
                    return Class.declare({
                        _handleKeydownSubmit: function (e) {
                            if (e.which === 13) {
                                $(e.currentTarget).blur();
                            }
                        },
                        _other: function (e) {
                            if (e.which === 13) {
                                $(e.currentTarget).blur();
                            }
                        }
                    }, true);
                }).to.not.throwException();
            });
            it('should throw an error if $statics is not an object', function () {
                expect(function () {
                    return Class.declare({ $statics: 'wtf' });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $statics: undefined });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $statics: null });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $statics: {} }, true);
                }).to.not.throwException();
            });
            it('should throw an error if $statics inside $finals is not an object', function () {
                expect(function () {
                    return Class.declare({ $finals: { $statics: 'wtf' } });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: { $statics: undefined } });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: { $statics: null } });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: { $statics: {} } }, true);
                }).to.not.throwException();
            });
            it('should throw an error if $finals is not an object', function () {
                expect(function () {
                    return Class.declare({ $finals: 'wtf' });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: undefined });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: null });
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $finals: {} }, true);
                }).to.not.throwException();
            });
            it('should throw an error while defining private method/parameter as $final', function () {
                expect(function () {
                    return Class.declare({
                        $finals: {
                            __foo: 'bar',
                            __someFunction: function () {
                                return this.foo;
                            }
                        }
                    }, true);
                }).to.throwException(/classified as final/);
            });
            it('should throw an error if overriding a final method or parameter', function () {
                var SomeClass = Class.declare({
                        $finals: {
                            foo: 'bar',
                            someFunction: function () {
                                return this.foo;
                            }
                        }
                    }, true);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        foo: 'wtf'
                    }, true);
                }).to.throwException(/override final/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        someFunction: function () {
                        }
                    }, true);
                }).to.throwException(/override final/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: { foo: 'wtf' }
                    }, true);
                }).to.throwException(/override final/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: {
                            someFunction: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/override final/);
            });
            it('should throw an error if $constants is not an object', function () {
                expect(function () {
                    return Class.declare({ $constants: 'wtf' }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $constants: undefined }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $constants: null }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return Class.declare({ $constants: {} }, true);
                }).to.not.throwException();
            });
            it('should throw an error if $constants have non primitive types', function () {
                expect(function () {
                    return Class.declare({ $constants: { SOME: {} } }, true);
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Class.declare({ $constants: { SOME: new Date() } }, true);
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Class.declare({ $constants: { SOME: [] } }, true);
                }).to.throwException(/primitive type/);
                expect(function () {
                    return Class.declare({ $constants: { SOME: false } }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $constants: { SOME: null } }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $constants: { SOME: 'SOME' } }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $constants: { SOME: 1 } }, true);
                }).to.not.throwException();
            });
            it('should throw an error if overriding a constant parameter', function () {
                var SomeClass = Class.declare({ $constants: { FOO: 'bar' } }, true);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: { $statics: { FOO: 'WTF' } }
                    }, true);
                }).to.throwException(/override constant/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $statics: { FOO: 'WTF' }
                    }, true);
                }).to.throwException(/override constant/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $constants: { FOO: 'WTF' }
                    }, true);
                }).to.throwException(/override constant/);
                expect(function () {
                    return Class.declare({
                        $implements: Interface.declare({ $constants: { FOO: 'WTF' } }),
                        $constants: { FOO: 'WTF' }
                    }, true);
                }).to.throwException(/override constant/);
            });
            it('should throw an error when specifying duplicate interfaces', function () {
                var SomeInterface = Interface.declare({});
                expect(function () {
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            SomeInterface
                        ]
                    }, true);
                }).to.throwException(/duplicate entries/);
                expect(function () {
                    return AbstractClass.declare({
                        $implements: [
                            SomeInterface,
                            SomeInterface
                        ]
                    }, true);
                }).to.throwException(/duplicate entries/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            undefined,
                            undefined
                        ]
                    }, true);
                }).to.not.throwException(/duplicate entries/);
                expect(function () {
                    return AbstractClass.declare({
                        $implements: [
                            undefined,
                            undefined
                        ]
                    }, true);
                }).to.not.throwException(/duplicate entries/);
            });
            it('should throw an error if $borrows is not an object/class or an array of objects/classes', function () {
                expect(function () {
                    return Class.declare({ $borrows: undefined }, true);
                }).to.throwException(/a class\/object or an array of classes\/objects/);
                expect(function () {
                    return Class.declare({ $borrows: null }, true);
                }).to.throwException(/a class\/object or an array of classes\/objects/);
                expect(function () {
                    return Class.declare({ $borrows: 'wtf' }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: ['wtf'] }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: [undefined] }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: [null] }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({
                        $borrows: [
                            undefined,
                            undefined
                        ]
                    }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({
                        $borrows: [
                            null,
                            null
                        ]
                    }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: AbstractClass.declare({}, true) }, true);
                }).to.throwException(/abstract class with abstract members/);
                expect(function () {
                    return Class.declare({ $borrows: [AbstractClass.declare({}, true)] }, true);
                }).to.throwException(/abstract class with abstract members/);
                expect(function () {
                    return Class.declare({ $borrows: Emitter.DirectEventsEmitter }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $borrows: Interface.declare({}) }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: [Interface.declare({})] }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    var SomeClass = Class.declare({}, true);
                    return Class.declare({ $borrows: new SomeClass() }, true);
                }).to.throwException(/not a valid class\/object/);
                expect(function () {
                    return Class.declare({ $borrows: {} }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $borrows: Class.declare({}, true) }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({
                        $borrows: function () {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $borrows: [{}] }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({ $borrows: [Class.declare({}, true)] }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({ $borrows: AbstractClass.declare({}, true) }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({ $borrows: [AbstractClass.declare({}, true)] }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({
                        $borrows: [function () {
                            }]
                    }, true);
                }).to.not.throwException();
            });
            it('should throw an error if $borrows contains an inherited class', function () {
                expect(function () {
                    var tmp = Class.declare({}, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({ $borrows: tmp2 }, true);
                }).to.throwException(/inherited class/);
                expect(function () {
                    var tmp = Class.declare({}, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return AbstractClass.declare({ $borrows: tmp2 }, true);
                }).to.throwException(/inherited class/);
            });
            it('should throw an error on duplicate $borrows', function () {
                expect(function () {
                    var Mixin = Class.declare({}, true);
                    return Class.declare({
                        $borrows: [
                            Mixin,
                            Mixin
                        ]
                    }, true);
                }).to.throwException(/duplicate entries/);
                expect(function () {
                    return Class.declare({
                        $borrows: [
                            undefined,
                            undefined
                        ]
                    }, true);
                }).to.not.throwException(/duplicate entries/);
            });
            it('should throw an error if $implements is not an Interface or an array of Interfaces', function () {
                expect(function () {
                    return Class.declare({ $implements: 'wtf' }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: undefined }, true);
                }).to.throwException(/an interface or an array of interfaces/);
                expect(function () {
                    return Class.declare({ $implements: null }, true);
                }).to.throwException(/an interface or an array of interfaces/);
                expect(function () {
                    return Class.declare({ $implements: ['wtf'] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: [undefined] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: [null] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            undefined,
                            undefined
                        ]
                    }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            null,
                            null
                        ]
                    }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: AbstractClass.declare({}, true) }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: [AbstractClass.declare({}, true)] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: Class.declare({}, true) }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return Class.declare({ $implements: [Class.declare({}, true)] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return AbstractClass.declare({ $implements: 'wtf' }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return AbstractClass.declare({ $implements: undefined }, true);
                }).to.throwException(/an interface or an array of interfaces/);
                expect(function () {
                    return AbstractClass.declare({ $implements: null }, true);
                }).to.throwException(/an interface or an array of interfaces/);
                expect(function () {
                    return AbstractClass.declare({ $implements: ['wtf'] }, true);
                }).to.throwException(/not a valid interface/);
                expect(function () {
                    return AbstractClass.declare({ $implements: [undefined] }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({ $implements: [null] }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({
                        $implements: [
                            undefined,
                            undefined
                        ]
                    }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({
                        $implements: [
                            null,
                            null
                        ]
                    }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({ $implements: AbstractClass.declare({}, true) }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({ $implements: [AbstractClass.declare({}, true)] }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({ $implements: Class.declare({}, true) }, true).to.throwException(/not a valid interface/);
                });
                expect(function () {
                    return AbstractClass.declare({ $implements: [Class.declare({}, true)] }, true).to.throwException(/not a valid interface/);
                });
            });
            it('should throw an error when overriding methods with properties and vice-versa', function () {
                var SomeClass = Class.declare({
                        func: function () {
                        },
                        prop: 'some'
                    }, true), SomeAbstractClass = AbstractClass.declare({}, true);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        func: 'some'
                    }, true);
                }).to.throwException(/with the same name/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        prop: function () {
                        }
                    }, true);
                }).to.throwException(/with the same name/);
                expect(function () {
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        func: 'some'
                    }, true);
                }).to.throwException(/(with the same name)|(was not found)/);
            });
            it('should throw an error when defining incompatible methods compared to its base signature', function () {
                var Interface1 = Interface.declare({}), Interface2 = Interface.declare({}), Interface3 = Interface.declare({}), Interface4 = Interface.declare({}), Interface5 = Interface.declare({}), Interface6 = Interface.declare({}), Interface7 = Interface.declare({}), Interface8 = Interface.declare({});
                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function () {
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            Interface1,
                            Interface3
                        ],
                        method1: function (a) {
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: Interface4,
                        method1: function (a) {
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            Interface1,
                            Interface2
                        ],
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function (a, $b) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function (a, $b, $c) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            Interface5,
                            Interface7
                        ],
                        $statics: {
                            method1: function (a) {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: Interface8,
                        $statics: {
                            method1: function (a) {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [Interface1],
                        $borrows: {
                            method1: function (a, b) {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            Interface5,
                            Interface7
                        ],
                        $borrows: {
                            $statics: {
                                method1: function (a) {
                                }
                            }
                        },
                        $statics: {
                            method1: function (a) {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return Class.declare({
                        $implements: [
                            Interface5,
                            Interface6
                        ],
                        $statics: {
                            method1: function (a) {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b) {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b, $c) {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({ $implements: Interface1 }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return AbstractClass.declare({
                        $implements: [
                            Interface1,
                            Interface3
                        ]
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return AbstractClass.declare({ $implements: Interface8 }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    return AbstractClass.declare({ $implements: Interface1 }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({ $implements: Interface1 }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface3,
                        method1: function (a, b) {
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({ $implements: Interface1 }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface3,
                        $borrows: {
                            method1: function (a, b) {
                            }
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({ $implements: Interface1 }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        method1: function () {
                        }
                    }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({ $implements: Interface1 }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {
                            }
                        }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a) {
                        },
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {
                            }
                        }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, b) {
                        },
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {
                            }
                        }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, $b) {
                        },
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {
                            }
                        }, true);
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, $b, $c) {
                        },
                        method1: function (a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = Class.declare({
                            initialize: function (a, $b) {
                            }
                        }, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({
                        $extends: tmp,
                        initialize: function (a, $b, $c) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {
                            }
                        }, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({
                        $extends: tmp2,
                        get: function (a, b) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {
                            }
                        }, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({
                        $extends: tmp2,
                        get: function () {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {
                            }
                        }, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({
                        $extends: tmp2,
                        get: function ($a) {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {
                            }
                        }, true), tmp2 = Class.declare({ $extends: tmp }, true);
                    return Class.declare({
                        $extends: tmp2,
                        get: function (a, $b) {
                        }
                    }, true);
                }).to.not.throwException();
            });
        });
        describe('Defining an Abstract Class', function () {
            it('should throw an error if $abstracts is not an object', function () {
                expect(function () {
                    return AbstractClass.declare({ $abstracts: 'wtf' }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: undefined }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: null }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
            });
            it('should throw an error if $statics inside $abstracts is not an object', function () {
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: 'wtf' } }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: undefined } }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: null } }, true);
                }).to.throwException(/must be an object/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
            });
            it('should throw an error if abstracts does not contain only functions without implementation', function () {
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: 'wtf' } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: undefined } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: null } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: 'wtf' } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: undefined } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: null } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.throwException(/no implementation/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.throwException(/no implementation/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: Class.declare({}, true) } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: AbstractClass.declare({}, true) } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { some: Interface.declare({}) } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: Class.declare({}, true) } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: AbstractClass.declare({}, true) } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({ $abstracts: { $statics: { some: Interface.declare({}) } } }, true);
                }).to.throwException(/not a function/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.not.throwException();
            });
            it('should throw an error if it any function is not well formed', function () {
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);
                expect(function () {
                    return AbstractClass.declare({}, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);
            });
            it('should throw an error when defining incompatible methods compared to its base signature', function () {
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/not compatible with/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.not.throwException();
            });
            it('should throw an error if declared abstract functions in $abstracts are already defined', function () {
                expect(function () {
                    return AbstractClass.declare({
                        some: function () {
                        }
                    }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    return AbstractClass.declare({
                        $statics: {
                            some: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    var tmp = Class.declare({
                            some: function () {
                            }
                        }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    var tmp = AbstractClass.declare({
                            some: function () {
                            }
                        }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    var tmp = AbstractClass.declare({ some: 'foo' }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/defined property/);
                expect(function () {
                    var tmp = Class.declare({
                            $statics: {
                                some: function () {
                                }
                            }
                        }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $statics: {
                                some: function () {
                                }
                            }
                        }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/already implemented/);
                expect(function () {
                    var tmp = AbstractClass.declare({ $statics: { some: 'some' } }, true);
                    return AbstractClass.declare({ $extends: tmp }, true);
                }).to.throwException(/defined property/);
            });
            it('should not throw an error while extending another abstract class while not implementing its methods', function () {
                expect(function () {
                    var AbstractExample = AbstractClass.declare({}, true);
                    return AbstractClass.declare({ $extends: AbstractExample }, true);
                }).to.not.throwException();
            });
            it('should not throw an error when specifying binds poiting to abstract methods', function () {
                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            method1: function () {
                            }.$bound()
                        }
                    }, true);
                }).to.not.throwException();
            });
            it('should throw an error when using reserved keywords', function () {
                var reserved = [
                        '$constructor',
                        '$initializing',
                        '$static',
                        '$self',
                        '$super',
                        '$underStrict'
                    ], reservedStatic = [
                        '$parent',
                        '$super',
                        '$static',
                        '$self',
                        'extend'
                    ], x, checkNormal = function (key, where) {
                        return function () {
                            var obj = {}, temp;
                            obj[key] = 'bla';
                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }
                            return AbstractClass.declare(temp);
                        };
                    }, checkStatic = function (key, where) {
                        return function () {
                            var obj = { $statics: {} }, temp;
                            obj.$statics[key] = 'bla';
                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }
                            return AbstractClass.declare(temp);
                        };
                    }, checkConst = function (key) {
                        return function () {
                            var obj = { $constants: {} };
                            obj.$constants[key] = 'bla';
                            return AbstractClass.declare(obj);
                        };
                    };
                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], '$abstracts')).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], '$abstracts')).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], '$finals')).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], '$finals')).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkConst(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                }
            });
        });
        describe('Defining a Concrete Class', function () {
            var SomeInterface, OtherInterface, ExtendedInterface, SomeAbstractClass, ExtendedAbstractClass;
            function createSomeInterface() {
                SomeInterface = Interface.declare({});
            }
            function createOtherInterface() {
                OtherInterface = Interface.declare({});
            }
            function createExtendedInterface() {
                createSomeInterface();
                ExtendedInterface = Interface.declare({ $extends: SomeInterface });
            }
            function createAbstractClass() {
                SomeAbstractClass = AbstractClass.declare({ $implements: SomeInterface }, true);
            }
            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass.declare({ $extends: SomeAbstractClass }, true);
            }
            it('should throw an error when it is incomplete', function () {
                expect(function () {
                    createSomeInterface();
                    return Class.declare({ $implements: [SomeInterface] }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {
                        },
                        $statics: {
                            weirdStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            OtherInterface
                        ],
                        someMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            OtherInterface
                        ],
                        extraMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            OtherInterface
                        ],
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            OtherInterface
                        ],
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            ExtendedInterface,
                            OtherInterface
                        ],
                        extraMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            ExtendedInterface,
                            OtherInterface
                        ],
                        otherMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    return Class.declare({ $extends: SomeAbstractClass }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {
                        },
                        $statics: {
                            weirdStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        otherMethod: function () {
                        },
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({ $extends: tmp }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({ $extends: tmp }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({
                        $extends: tmp,
                        _protectedMethod: function () {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({
                        $extends: tmp,
                        $statics: {
                            _protectedMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({ $extends: tmp }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({ $extends: tmp }, true);
                }).to.throwException(/was not found/);
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({
                        $extends: tmp,
                        _protectedMethod: function () {
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({}, true);
                    return Class.declare({
                        $extends: tmp,
                        $statics: {
                            _protectedMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
            });
            it('should not throw an error when it is complete', function () {
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            SomeInterface,
                            OtherInterface
                        ],
                        someMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [
                            ExtendedInterface,
                            OtherInterface
                        ],
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {
                        },
                        otherMethod: function () {
                        },
                        extraMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            },
                            otherStaticMethod: function () {
                            },
                            extraStaticMethod: function () {
                            }
                        }
                    }, true);
                }).to.not.throwException();
            });
            it('should throw an error when using reserved keywords', function () {
                var reserved = [
                        '$constructor',
                        '$initializing',
                        '$static',
                        '$self',
                        '$super',
                        '$underStrict'
                    ], reservedStatic = [
                        '$parent',
                        '$super',
                        '$static',
                        '$self',
                        'extend'
                    ], x, checkNormal = function (key, where) {
                        return function () {
                            var obj = {}, temp;
                            obj[key] = 'bla';
                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }
                            return Class.declare(temp);
                        };
                    }, checkStatic = function (key, where) {
                        return function () {
                            var obj = { $statics: {} }, temp;
                            obj.$statics[key] = 'bla';
                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }
                            return Class.declare(temp);
                        };
                    }, checkConst = function (key) {
                        return function () {
                            var obj = { $constants: {} };
                            obj.$constants[key] = 'bla';
                            return AbstractClass.declare(obj);
                        };
                    };
                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], '$finals')).to.throwException(/using a reserved keyword/);
                }
                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], '$finals')).to.throwException(/using a reserved keyword/);
                    expect(checkConst(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                }
            });
            it('should not throw an error if they are complete, even using borrowed methods to implement interfaces/abstract classes', function () {
                var Mixin1 = Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true);
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        $borrows: [Mixin1]
                    }, true);
                }).to.not.throwException();
            });
            it('should throw an error if they define abstract methods', function () {
                expect(function () {
                    return Class.declare({ $abstracts: {} }, true);
                }).to.throwException(/has abstract methods/);
                expect(function () {
                    return Class.declare({
                        $abstracts: {
                            method1: function () {
                            }
                        }
                    }, true);
                }).to.throwException(/has abstract methods/);
            });
        });
        describe('Instantiation of Interfaces', function () {
            it('should throw an error', function () {
                expect(function () {
                    var SomeInterface = Interface.declare({});
                    return new SomeInterface();
                }).to.throwException(/cannot be instantiated/);
            });
        });
        describe('Instantiation of Abstract Classes', function () {
            var AbstractExample = AbstractClass.declare({
                    initialize: function () {
                    }
                }, true);
            it('should throw an error while using new', function () {
                expect(function () {
                    return new AbstractExample();
                }).to.throwException(/cannot be instantiated/);
            });
        });
        describe('Instantiation of Concrete Classes', function () {
            it('should throw an error if we do it without using the new keyword', function () {
                var SomeClass = Class.declare({}, true), OtherClass = FinalClass.declare({}, true);
                expect(function () {
                    return SomeClass();
                }).to.throwException(/called as a function/);
                expect(function () {
                    return OtherClass();
                }).to.throwException(/called as a function/);
            });
            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should throw an error if the constructor is private/protected', function () {
                    var SomeClass = Class.declare({
                            _initialize: function () {
                            }
                        }, true), OtherClass = Class.declare({
                            __initialize: function () {
                            }
                        }, true);
                    expect(function () {
                        return new SomeClass();
                    }).to.throwException(/is protected/);
                    expect(function () {
                        return new OtherClass();
                    }).to.throwException(/is private/);
                });
            }
            it('should not throw an error if calling a function with a null context', function () {
                var Example = Class.declare({
                        method: function () {
                        },
                        $statics: {
                            staticMethod: function () {
                            }
                        }
                    }, true), example = new Example();
                expect(function () {
                    return example.method.call(null);
                }).to.not.throwException();
                expect(function () {
                    return example.method.call(undefined);
                }).to.not.throwException();
                expect(function () {
                    return Example.staticMethod.call(null);
                }).to.not.throwException();
                expect(function () {
                    return Example.staticMethod.call(undefined);
                }).to.not.throwException();
            });
            it('should not throw an error while invoking the the parent abstract class constructor', function () {
                expect(function () {
                    var tmp = AbstractClass.declare({
                            initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                tmp.prototype.initialize.call(this);
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({ $extends: tmp }, true);
                    return new SomeImplementation();
                }).to.not.throwException();
            });
            it('should not throw an error while invoking the the parent class protected constructor', function () {
                expect(function () {
                    var tmp = AbstractClass.declare({
                            _initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                tmp.prototype.initialize.call(this);
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.not.throwException();
                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare({
                                _initialize: function () {
                                }
                            }, true), SomeImplementation = Class.declare({ $extends: tmp }, true);
                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }
                expect(function () {
                    var tmp = Class.declare({
                            _initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                tmp.prototype.initialize.call(this);
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.not.throwException();
                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare({
                                _initialize: function () {
                                }
                            }, true), SomeImplementation = Class.declare({ $extends: tmp }, true);
                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }
            });
            it('should throw an error while invoking the parent class private constructor', function () {
                expect(function () {
                    var tmp = AbstractClass.declare({
                            __initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                tmp.prototype.initialize.call(this);
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);
                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare({
                                __initialize: function () {
                                }
                            }, true), SomeImplementation = Class.declare({ $extends: tmp }, true);
                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }
                expect(function () {
                    var tmp = Class.declare({
                            __initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                tmp.prototype.initialize.call(this);
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);
                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare({
                                __initialize: function () {
                                }
                            }, true), SomeImplementation = Class.declare({ $extends: tmp }, true);
                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }
                expect(function () {
                    var tmp = Class.declare({
                            __initialize: function () {
                            }
                        }, true), SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                            }
                        }, true);
                    return new SomeImplementation();
                }).to.not.throwException();
            });
        });
    });
});