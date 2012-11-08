/*jshint strict:false, regexp:false*/

define(global.modules, function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf,
    options,
    hasDefineProperty,
    Emitter
) {

    'use strict';

    var expect = global.expect;

    // TODO: remove this once mocha fixes it (https://github.com/visionmedia/mocha/issues/502)
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
                    return Interface.declare({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface.declare({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface.declare({ $name: 'Some Name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Interface.declare({ $name: 'SomeName' });
                }).to.not.throwException();

            });

            it('should throw an error when defining the initialize method', function () {

                expect(function () {
                    return Interface.declare({
                        initialize: function () {}
                    });
                }).to.throwException(/initialize method/i);

            });

            it('should throw an error if using .extend() with an $extend property', function () {

                expect(function () {
                    var SomeInterface = Interface.declare({}),
                        OtherInterface = SomeInterface.extend({
                            $name: 'OtherInterface',
                            $extends: SomeInterface
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should work with .extend()', function () {

                var SomeInterface = Interface.declare({}),
                    OtherInterface = SomeInterface.extend({ $name: 'OtherInterface' }),
                    SomeClass = Class.declare({
                        $implements: OtherInterface
                    }),
                    someClass = new SomeClass();

                expect(instanceOf(someClass, OtherInterface)).to.be.equal(true);
                expect(instanceOf(someClass, SomeInterface)).to.be.equal(true);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            $statics: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $finals: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $abstracts: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $implements: []
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.declare({
                        $borrows: []
                    });
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: 'foo'
                        },
                        $statics: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/different modifiers/);

            });

            it('should throw an error when extending an invalid interface', function () {

                expect(function () {
                    return Interface.declare({
                        $extends: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface.declare({
                        $extends: undefined
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    var tmp =  Interface.declare({});
                    return Interface.declare({
                        $extends: [undefined, tmp]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface.declare({
                        $extends: null
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface.declare({
                        $extends: function () {}
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    var tmp = Class.declare({});

                    return Interface.declare({
                        $extends: tmp
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    var tmp = Interface.declare({});
                    return Interface.declare({
                        $extends: tmp
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({});

                    return Interface.declare({
                        $extends: tmp
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it does not contain only functions without implementation', function () {

                expect(function () {
                    return Interface.declare({
                        some: 'property'
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        some: undefined
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        some: null
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: 'property'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        some: function (a) {
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        some: function (a) {

                            // Some code in here
                            var x;

                            for (x = 0; x < 5; x += 1) {
                                if (x === 0) {
                                    break;
                                }
                            }
                        }
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: function (b) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: function (a) {

                                // Some code in here
                                var x;

                                for (x = 0; x < 5; x += 1) {
                                    if (x === 0) {
                                        break;
                                    }
                                }
                            }
                        }
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return Interface.declare({
                        some: Class.declare({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        some: AbstractClass.declare({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        some: Interface.declare({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: Class.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: AbstractClass.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            some: Interface.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.declare({
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        method1: function (a) { }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Interface.declare({
                        method1: function ($a, b) {}
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Interface.declare({
                        $statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Interface.declare({
                        $constants: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $constants: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $constants: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.declare({
                        $constants: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super'],
                    reservedStatic = ['$parent', '$super', '$static', '$self', 'extend'],
                    x,
                    checkNormal = function (key) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return Interface.declare(obj);
                        };
                    },
                    checkStatic = function (key) {
                        return function () {
                            var obj = {$statics: {}};
                            obj.$statics[key] = 'bla';
                            return Interface.declare(obj);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
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
                        $extends: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Interface.declare({
                        $extends: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error when it extends multiple ones with incompatible duplicate methods', function () {

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                method1: function () {}
                            }),
                            Interface.declare({
                                method1: function (a) {}
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                method1: function (a, b) {}
                            }),
                            Interface.declare({
                                method1: function (a) {}
                            })
                        ],
                        method1: function (a, b) {}
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                $statics: {
                                    method1: function () {}
                                }
                            }),
                            Interface.declare({
                                $statics: {
                                    method1: function (a) {}
                                }
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                $statics: {
                                    method1: function (a) {}
                                }
                            }),
                            Interface.declare({
                                $statics: {
                                    method1: function (a, b) {}
                                }
                            })
                        ],
                        $statics: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                method1: function () {}
                            })
                        ],
                        method1: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }),
                            Interface.declare({
                                $statics: {
                                    method1: function (a) {}
                                }
                            })
                        ],
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function () {}
                        });

                    return Interface.declare({
                        $extends: tmp,
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function () {}
                            }
                        });

                    return Interface.declare({
                        $extends: tmp,
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare({
                        $extends: tmp,
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare({
                        $extends: tmp,
                        $statics: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare({
                        $extends: tmp,
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare({
                        $extends: tmp,
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare({
                        $extends: tmp,
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare({
                        $extends: tmp,
                        $statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: new Date()
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: []
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: false
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: null
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: 'SOME'
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            SOME: 1
                        }
                    });
                }).to.not.throwException();
            });

            it('should throw an error when it extends multiple ones with same constants but different values', function () {

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface.declare({
                                $constants: {
                                    FOO: 'test2'
                                }
                            })
                        ]
                    });
                }).to.throwException(/different values/);

                expect(function () {
                    return Interface.declare({
                        $extends: [
                            Interface.declare({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface.declare({
                                $constants: {
                                    FOO: 'test'
                                }
                            })
                        ]
                    });
                }).to.not.throwException();

            });

            it('should throw when overriding a constant', function () {

                expect(function () {
                    var tmp = Interface.declare({
                            $constants: {
                                FOO: 'test'
                            }
                        });

                    return Interface.declare({
                        $extends: tmp,
                        $constants: {
                            FOO: 'test'
                        }
                    });
                }).to.throwException(/override constant/);

            });

            it('should throw an error if a protected/private methods/constants are defined', function () {

                expect(function () {
                    return Interface.declare({
                        __privateMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.declare({
                        _protectedMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            __privateMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.declare({
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            _FOO: 'bar'
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.declare({
                        $constants: {
                            __FOO: 'bar'
                        }
                    });
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
                    return Class.declare({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.declare({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.declare({ $name: 'Some $name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Class.declare({ $name: 'SomeName' });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.declare({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.declare({ $name: 'Some $name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return AbstractClass.declare({ $name: 'SomeName' });
                }).to.not.throwException();

            });

            it('should throw an error when using an invalid initialize', function () {

                expect(function () {
                    return Class.declare({
                        initialize: undefined
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.declare({
                        initialize: null
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.declare({
                        initialize: 'some'
                    });
                }).to.throwException(/must be a function/);

            });

            it('should throw an error if using .extend() with an $extend property', function () {

                expect(function () {
                    var SomeClass = Class.declare({}),
                        OtherClass = SomeClass.extend({
                            $name: 'OtherClass',
                            $extends: SomeClass
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should throw an error when defining several constructors', function () {

                expect(function () {
                    return Class.declare({
                        initialize: function () {},
                        _initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.declare({
                        initialize: function () {},
                        __initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.declare({
                        _initialize: function () {},
                        __initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

            });

            it('should work well when using the same function for different members', function () {

                var a = function () { return 'ola'; },
                    SomeClass = Class.declare({
                        test: a,
                        test2: a
                    }),
                    someClass = new SomeClass(),
                    otherClass = new SomeClass();

                expect(someClass.test()).to.equal('ola');
                expect(someClass.test2()).to.equal('ola');
                expect(otherClass.test()).to.equal('ola');
                expect(otherClass.test2()).to.equal('ola');

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Class.declare({
                        $constants: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            $statics: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $statics: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $statics: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $statics: {
                            $name: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $name: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            $extends: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $extends: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                $constants: {}
                            }
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                $finals: {}
                            }
                        }
                    });
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: 'foo'
                        },
                        $statics: {
                            SOME: 'foo'
                        }
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: {
                                SOME: 'foo'
                            }
                        },
                        $statics: {
                            SOME: 'foo'
                        }
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: {
                                SOME: 'foo'
                            }
                        },
                        $statics: {
                            other: 'foo'
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $finals: {
                            some: 'foo'
                        },
                        some: 'foo'
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: {
                                SOME: 'foo'
                            }
                        },
                        $constants: {
                            SOME: 'foo'
                        }
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        },
                        $constants: {
                            some: 'foo'
                        }
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function () {}
                        },
                        $finals: {
                            some: 'foo'
                        }
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function () {}
                        },
                        some: 'foo'
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function () {}
                        },
                        $finals: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function () {}
                        },
                        some: function () {}
                    });
                }).to.throwException(/already implemented/);

            });

            it('should throw an error when defining unallowed properties', function () {

                expect(function () {
                    return Class.declare({
                        some: undefined
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);


                expect(function () {
                    return Class.declare({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare({
                        some: undefined
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare({
                        $finals: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

            });

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class.declare({
                        $extends: 'wtf'
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.declare({
                        $extends: undefined
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.declare({
                        $extends: null
                    });
                }).to.throwException(/is not a valid class/);


                expect(function () {
                    var tmp = Interface.declare({});

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    var tmp = Class.declare({});

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Class.declare({
                        method1: function ($a, b) {}
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Class.declare({
                        $statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    var $ = function () {};
                    return Class.declare({
                        _handleKeydownSubmit: function (e) {
                            if (e.which === 13) {
                                $(e.currentTarget).blur();
                            }
                        },
                        _other: function _other(e) {
                            if (e.which === 13) {
                                $(e.currentTarget).blur();
                            }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Class.declare({
                        $statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $finals is not an object', function () {

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: 'wtf'
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: undefined
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: null
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: {
                            $statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $finals is not an object', function () {

                expect(function () {
                    return Class.declare({
                        $finals: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $finals: {}
                    });
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
                    });
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
                });

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        foo: 'wtf'
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        someFunction: function () {}
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: {
                            foo: 'wtf'
                        }
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: {
                            someFunction: function () {}
                        }
                    });
                }).to.throwException(/override final/);

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Class.declare({
                        $constants: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $constants: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $constants: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare({
                        $constants: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: new Date()
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: []
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: false
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: null
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: 'SOME'
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $constants: {
                            SOME: 1
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if overriding a constant parameter', function () {

                var SomeClass = Class.declare({
                    $constants: {
                        FOO: 'bar'
                    }
                });

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $finals: {
                            $statics: {
                                FOO: 'WTF'
                            }
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $statics: {
                            FOO: 'WTF'
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        $constants: {
                            FOO: 'WTF'
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare({
                        $implements: Interface.declare({
                            $constants: {
                                FOO: 'WTF'
                            }
                        }),
                        $constants: {
                            FOO: 'WTF'
                        }
                    });
                }).to.throwException(/override constant/);
            });

            it('should throw an error when specifying duplicate interfaces', function () {

                var SomeInterface = Interface.declare({});

                expect(function () {
                    return Class.declare({
                        $implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.declare({
                        $implements: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error if $borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class.declare({
                        $borrows: undefined
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.declare({
                        $borrows: null
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.declare({
                        $borrows: 'wtf'
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: ['wtf']
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: [undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: [null]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: [undefined, undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: [null, null]
                    });
                }).to.throwException(/not a valid class\/object/);


                expect(function () {
                    return Class.declare({
                        $borrows: AbstractClass.declare({
                            $abstracts: {
                                some: function () {}
                            }
                        })
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class.declare({
                        $borrows: [AbstractClass.declare({
                            $abstracts: {
                                some: function () {}
                            }
                        })]
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class.declare({
                        $borrows: Emitter.DirectEventsEmitter
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $borrows: Interface.declare({})
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: [Interface.declare({})]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    var SomeClass = Class.declare({});
                    return Class.declare({
                        $borrows: new SomeClass()
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare({
                        $borrows: {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $borrows: Class.declare({})
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $borrows: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $borrows: [{}]
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $borrows: [Class.declare({})]
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $borrows: AbstractClass.declare({
                            $abstracts: {}
                        })
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $borrows: [AbstractClass.declare({})]
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $borrows: [function () {}]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $borrows contains an inherited class', function () {

                expect(function () {
                    var tmp = Class.declare({}),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $borrows: tmp2
                    });
                }).to.throwException(/inherited class/);

                expect(function () {
                    var tmp = Class.declare({}),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return AbstractClass.declare({
                        $borrows: tmp2
                    });
                }).to.throwException(/inherited class/);

            });

            it('should throw an error on duplicate $borrows', function () {

                expect(function () {
                    var Mixin = Class.declare({});
                    return Class.declare({
                        $borrows: [Mixin, Mixin]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.declare({
                        $borrows: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);
            });

            it('should throw an error if $implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class.declare({
                        $implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.declare({
                        $implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.declare({
                        $implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [undefined]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [null]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [undefined, undefined]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [null, null]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: AbstractClass.declare({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [AbstractClass.declare({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: Class.declare({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare({
                        $implements: [Class.declare({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [undefined]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [null]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [undefined, undefined]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [null, null]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: AbstractClass.declare({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [AbstractClass.declare({})]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: Class.declare({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [Class.declare({})]
                    }).to.throwException(/not a valid interface/);
                });

            });

            it('should throw an error when overriding methods with properties and vice-versa', function () {

                var SomeClass = Class.declare({
                    func: function () {},
                    prop: 'some'
                }),
                    SomeAbstractClass = AbstractClass.declare({
                        $abstracts: {
                            func: function () {}
                        }
                    });

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        func: 'some'
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeClass,
                        prop: function () {}
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        func: 'some'
                    });
                }).to.throwException(/(with the same name)|(was not found)/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                var Interface1 = Interface.declare({
                    method1: function (a) {}
                }),
                    Interface2 = Interface.declare({
                        method1: function (a) {}
                    }),
                    Interface3 = Interface.declare({
                        method1: function (a, b) {}
                    }),
                    Interface4 = Interface.declare({
                        method1: function (a, $b) {}
                    }),
                    Interface5 = Interface.declare({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface6 = Interface.declare({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface7 = Interface.declare({
                        $statics: {
                            method1: function (a, b) {}
                        }
                    }),
                    Interface8 = Interface.declare({
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });

                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface1, Interface3],
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: Interface4,
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface1, Interface2],
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $implements: Interface1,
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function () {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface5, Interface7],
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: Interface8,
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface1],
                        $borrows: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface5, Interface7],
                        $borrows: {
                            $statics: {
                                method1: function (a) {}
                            }
                        },
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare({
                        $implements: [Interface5, Interface6],
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.declare({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $implements: Interface1,
                        $abstracts: {
                            method1: function ($a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: [Interface1, Interface3],
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: Interface8,
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare({
                        $implements: Interface1,
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface3,
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface3,
                        $borrows: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        });

                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, $b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        });
                    return Class.declare({
                        $extends: tmp,
                        $implements: Interface1,
                        initialize: function (a, $b, $c) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare({
                            initialize: function (a, $b) {}
                        }),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $extends: tmp,
                        initialize: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {}
                        }),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $extends: tmp2,
                        get: function (a, b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {}
                        }),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $extends: tmp2,
                        get: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {}
                        }),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $extends: tmp2,
                        get: function ($a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare({
                            get: function (a) {}
                        }),
                        tmp2 = Class.declare({
                            $extends: tmp
                        });

                    return Class.declare({
                        $extends: tmp2,
                        get: function (a, $b) {}
                    });
                }).to.not.throwException();

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: 'wtf'
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: undefined
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: null
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if abstracts does not contain only functions without implementation', function () {

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: 'wtf'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: 'wtf'
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: undefined
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: null
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function (a) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: function (a) {

                                // Some code in here
                                var x;

                                for (x = 0; x < 5; x += 1) {
                                    if (x === 0) {
                                        break;
                                    }
                                }
                            }
                        }
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: function (b) {
                                }
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: function (a) {

                                    // Some code in here
                                    var x;

                                    for (x = 0; x < 5; x += 1) {
                                        if (x === 0) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: Class.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: AbstractClass.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            some: Interface.declare({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: Class.declare({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: AbstractClass.declare({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                some: Interface.declare({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                method1: function (a) { }
                            }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            $statics: {
                                method1: function ($a, b) {}
                            }
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function () {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    method1: function () {}
                                }
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                method1: function (a, b) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                method1: function (a, $b, $c) {}
                            }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if declared abstract functions in $abstracts are already defined', function () {

                expect(function () {
                    return AbstractClass.declare({
                        some: function () {},
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.declare({
                        $statics: {
                            some: function () {}
                        },
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp =  Class.declare({
                            some: function () {}
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            some: function () {}
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            some: 'foo'
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/defined property/);

                expect(function () {
                    var tmp = Class.declare({
                            $statics: {
                                some: function () {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $statics: {
                                some: function () {}
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $statics: {
                                some: 'some'
                            }
                        });

                    return AbstractClass.declare({
                        $extends: tmp,
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/defined property/);

            });

            it('should not throw an error while extending another abstract class while not implementing its methods', function () {

                expect(function () {
                    var AbstractExample = AbstractClass.declare({
                        $abstracts: {
                            someMethod: function () {},
                            $statics: {
                                someStaticMethod: function () {}
                            }
                        }
                    });
                    return AbstractClass.declare({
                        $extends: AbstractExample
                    });
                }).to.not.throwException();

            });

            it('should not throw an error when specifying binds poiting to abstract methods', function () {

                expect(function () {
                    return AbstractClass.declare({
                        $abstracts: {
                            method1: function () {}.$bound()
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super', '$underStrict'],
                    reservedStatic = ['$parent', '$super', '$static', '$self', 'extend'],
                    x,
                    checkNormal = function (key, where) {
                        return function () {
                            var obj = {},
                                temp;
                            obj[key] = 'bla';

                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }

                            return AbstractClass.declare(temp);
                        };
                    },
                    checkStatic = function (key, where) {
                        return function () {
                            var obj = {$statics: {}},
                                temp;
                            obj.$statics[key] = 'bla';

                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }

                            return AbstractClass.declare(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
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

            var SomeInterface,
                OtherInterface,
                ExtendedInterface,
                SomeAbstractClass,
                ExtendedAbstractClass;

            function createSomeInterface() {
                SomeInterface = Interface.declare({        // Simple interface
                    someMethod: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                });
            }

            function createOtherInterface() {
                OtherInterface = Interface.declare({       // Other interface with different methods
                    extraMethod: function () {},
                    $statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }

            function createExtendedInterface() {
                createSomeInterface();
                ExtendedInterface = Interface.declare({    // Interface that extends another
                    $extends: SomeInterface,
                    otherMethod: function () {},
                    $statics: {
                        otherStaticMethod: function () {}
                    }
                });
            }

            function createAbstractClass() {
                SomeAbstractClass = AbstractClass.declare({        // Simple abstract class
                    $implements: SomeInterface
                });
            }

            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass.declare({    // Abstract class that extends another
                    $extends: SomeAbstractClass,
                    $abstracts: {
                        otherMethod: function () {},
                        $statics: {
                            otherStaticMethod: function () {}
                        }
                    }
                });
            }

            it('should throw an error when it is incomplete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface]
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {},
                        $statics: {
                            weirdStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        otherMethod: function () {},
                        // miss someMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {},
                        // miss someMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            otherStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                            // miss otherStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                            // missing extraStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [SomeInterface, OtherInterface],
                        extraMethod: function () {},
                        someMethod: function () {},
                        $statics: {
                            // missing staticMethod()
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [SomeInterface, OtherInterface],
                        extraMethod: function () {},
                        // missing someMethod()
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        // missing extraMethod()
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface, OtherInterface],
                        extraMethod: function () {},
                        otherMethod: function () {},
                        someMethod: function () {},
                        $statics: {
                            // missing staticMethod()
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface, OtherInterface],
                        otherMethod: function () {},
                        someMethod: function () {},
                        // missing extraMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {},
                        $statics: {
                            weirdStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {

                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        otherMethod: function () {},
                        // miss someMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        // miss otherMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            otherStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                            // miss otherStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                            // missing extraStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {},
                        someMethod: function () {},
                        $statics: {
                            // missing staticMethod()
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {},
                        // missing someMethod()
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {},
                        // missing extraMethod()
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        extraMethod: function () {},
                        otherMethod: function () {},
                        someMethod: function () {},
                        $statics: {
                            // missing staticMethod()
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        otherMethod: function () {},
                        someMethod: function () {},
                        // missing extraMethod()
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        });

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        _protectedMethod: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        });

                    return Class.declare({
                        $extends: tmp
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        _protectedMethod: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        });

                    return Class.declare({
                        $extends: tmp,
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.not.throwException();
            });

            it('should not throw an error when it is complete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare({
                        $implements: [ExtendedInterface, OtherInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: SomeAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare({
                        $extends: ExtendedAbstractClass,
                        $implements: [OtherInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        extraMethod: function () {},
                        $statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();
            });


            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super', '$underStrict'],
                    reservedStatic = ['$parent', '$super', '$static', '$self', 'extend'],
                    x,
                    checkNormal = function (key, where) {
                        return function () {
                            var obj = {},
                                temp;
                            obj[key] = 'bla';

                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }

                            return Class.declare(temp);
                        };
                    },
                    checkStatic = function (key, where) {
                        return function () {
                            var obj = {$statics: {}},
                                temp;
                            obj.$statics[key] = 'bla';

                            if (where) {
                                temp = {};
                                temp[where] = obj;
                            } else {
                                temp = obj;
                            }

                            return Class.declare(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
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
                    someMethod: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                });

                expect(function () {
                    createSomeInterface();
                    return Class.declare({
                        $implements: [SomeInterface],
                        $borrows: [Mixin1]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if they define abstract methods', function () {

                expect(function () {
                    return Class.declare({
                        $abstracts: {}
                    });
                }).to.throwException(/has abstract methods/);

                expect(function () {
                    return Class.declare({
                        $abstracts: {
                            method1: function () {}
                        }
                    });
                }).to.throwException(/has abstract methods/);
            });

        });

        describe('Instantiation of Interfaces', function () {

            it('should throw an error', function () {

                expect(function () {
                    var SomeInterface = Interface.declare({
                        someMethod: function () {}
                    });
                    return new SomeInterface();
                }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Abstract Classes', function () {

            var AbstractExample = AbstractClass.declare({
                initialize: function () {},
                $abstracts: {
                    abstractMethod: function () {}
                }
            });

            it('should throw an error while using new', function () {

                expect(function () { return new AbstractExample(); }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Concrete Classes', function () {

            it('should throw an error if we do it without using the new keyword', function () {

                var SomeClass = Class.declare({}),
                    OtherClass = FinalClass.declare({});

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
                        _initialize: function () {}
                    }),
                        OtherClass = Class.declare({
                            __initialize: function () {}
                        });

                    expect(function () {
                        return new SomeClass();
                    }).to.throwException(/is protected/);

                    expect(function () {
                        return new OtherClass();
                    }).to.throwException(/is private/);

                });
            }

            it('should throw an error if calling a function with a null context', function () {

                var Example = Class.declare({
                    method: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                }),
                    example = new Example();

                expect(function () {
                    return example.method.call(null);
                }).to.throwException(/with a null context/);

                expect(function () {
                    return example.method.call(undefined);
                }).to.throwException(/with a null context/);

                expect(function () {
                    return Example.staticMethod.call(null);
                }).to.throwException(/with a null context/);

                expect(function () {
                    return Example.staticMethod.call(undefined);
                }).to.throwException(/with a null context/);

            });

            it('should not throw an error while invoking the the parent abstract class constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare({ initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                this.$super();
                            }
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare({ initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

            });

            it('should not throw an error while invoking the the parent class protected constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare({ _initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                this.$super();
                            }
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare({ _initialize: function () {} }),
                            SomeImplementation = Class.declare({
                                $extends: tmp
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

                expect(function () {
                    var tmp = Class.declare({ _initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp,

                            initialize: function () {
                                this.$super();
                            }
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare({ _initialize: function () {} }),
                            SomeImplementation = Class.declare({
                                $extends: tmp
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

            });

            it('should throw an error while invoking the parent class private constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare({ __initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                this.$super();
                            }
                        });

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare({ __initialize: function () {} }),
                            SomeImplementation = Class.declare({
                                $extends: tmp
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.declare({ __initialize: function () {} }),
                        SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {
                                this.$super();
                            }
                        });

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare({ __initialize: function () {} }),
                            SomeImplementation = Class.declare({
                                $extends: tmp
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.declare({ __initialize: function () {} }),
                            SomeImplementation = Class.declare({
                            $extends: tmp,
                            initialize: function () {}
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

            });

        });

    });

});
