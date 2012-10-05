/*jshint strict:false, regexp:false*/

define(global.modules, function (
    Class,
    AbstractClass,
    Interface,
    FinalClass,
    instanceOf,
    hasDefineProperty,
    Emitter
) {

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
                            $extends: SomeInterface
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should work with .extend()', function () {

                var SomeInterface = Interface.declare({}),
                    OtherInterface = SomeInterface.extend({}),
                    SomeClass = Class.declare(function () {
                        return {
                            $implements: OtherInterface
                        };
                    }, true),
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
                    var tmp = Class.declare(function () { return {}; }, true);

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

                    return Interface.declare(tmp, function ($super) {
                        return {
                            method1: function (a) {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function () {}
                            }
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            method1: function (a, b) {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                method1: function (a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            method1: function (a, $b) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            method1: function (a, $b) {}
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            method1: function (a, $b, $c) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.declare({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    }, true);
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

                    return Interface.declare(tmp, function ($super) {
                        return {
                            $constants: {
                                FOO: 'test'
                            }
                        };
                    }, true);
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
                    return Class.declare(function () { return { $name: undefined }; }, true);
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.declare(function () { return { $name: null }; }, true);
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.declare(function () { return { $name: 'Some $name' }; }, true);
                }).to.throwException(/spaces/);

                expect(function () {
                    return Class.declare(function () { return { $name: 'SomeName' }; }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () { return { $name: undefined }; }, true);
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.declare(function () { return { $name: null }; }, true);
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.declare(function () { return { $name: 'Some $name' }; }, true);
                }).to.throwException(/spaces/);

                expect(function () {
                    return AbstractClass.declare(function () { return { $name: 'SomeName' }; }, true);
                }).to.not.throwException();

            });

            it('should throw an error when using an invalid initialize', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            initialize: undefined
                        };
                    }, true);
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            initialize: null
                        };
                    }, true);
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            initialize: 'some'
                        };
                    }, true);
                }).to.throwException(/must be a function/);

            });

            it('should throw an error if using .extend() with an $extend property', function () {

                expect(function () {
                    var SomeClass = Class.declare(function () { return {}; }, true),
                        OtherClass = SomeClass.extend({
                            $extends: SomeClass
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should throw an error when defining several constructors', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            initialize: function () {},
                            _initialize: function () {}
                        };
                    }, true);
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            initialize: function () {},
                            __initialize: function () {}
                        };
                    }, true);
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            _initialize: function () {},
                            __initialize: function () {}
                        };
                    }, true);
                }).to.throwException(/several constructors/i);

            });

            it('should throw an error when using the same function for different members', function () {

                var a = function () {};

                expect(function () {
                    Class.declare(function () {
                        return {
                            test: a,
                            test2: a
                        };
                    }, true);
                }).to.throwException(/by the same/);

                expect(function () {
                    Class.declare(function () {
                        return {
                            test: a,
                            $finals: {
                                test2: a
                            }
                        };
                    }, true);
                }).to.throwException(/by the same/);

                expect(function () {
                    Class.declare(function () {
                        return {
                            $statics: {
                                test: 1
                            },
                            $finals: {
                                test2: a
                            }
                        };
                    }, true);
                }).to.throwException(/by the same/);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                $finals: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                $abstracts: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                $statics: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $constants: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $abstracts: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {
                                $finals: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {
                                $constants: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {
                                $name: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $name: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                $constants: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                $extends: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $extends: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $abstracts: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $constants: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $finals: {}
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    $constants: {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    $finals: {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: 'foo'
                            },
                            $statics: {
                                SOME: 'foo'
                            }
                        };
                    }, true);
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: {
                                    SOME: 'foo'
                                }
                            },
                            $statics: {
                                SOME: 'foo'
                            }
                        };
                    }, true);
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: {
                                    SOME: 'foo'
                                }
                            },
                            $statics: {
                                other: 'foo'
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                some: 'foo'
                            },
                            some: 'foo'
                        };
                    }, true);
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: {
                                    SOME: 'foo'
                                }
                            },
                            $constants: {
                                SOME: 'foo'
                            }
                        };
                    }, true);
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            },
                            $constants: {
                                some: 'foo'
                            }
                        };
                    }, true);
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            $finals: {
                                some: 'foo'
                            }
                        };
                    }, true);
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            some: 'foo'
                        };
                    }, true);
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            $finals: {
                                some: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            some: function () {}
                        };
                    }, true);
                }).to.throwException(/already implemented/);

            });

            it('should throw an error when defining unallowed properties', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            some: undefined
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                some: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);


                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {
                                some: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            some: undefined
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $finals: {
                                some: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $statics: {
                                some: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/cannot be parsed/);

            });

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $extends: 'wtf'
                        };
                    }, true);
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $extends: undefined
                        };
                    }, true);
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $extends: null
                        };
                    }, true);
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $extends: function () {}
                        };
                    }, true);
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    var tmp = Interface.declare({});

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    var tmp = Class.declare(function () { return {}; }, true);

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            method1: function ($a, b) {}
                        };
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {
                                method1: function ($a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    var $ = function () {};
                    return Class.declare(function () {
                        return {
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
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: 'wtf'
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: undefined
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: null
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $statics: {}
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $finals is not an object', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: 'wtf'
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: null
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                $statics: {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $finals is not an object', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: 'wtf'
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: undefined
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: null
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {}
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error while defining private method/parameter as $final', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $finals: {
                                __foo: 'bar',
                                __someFunction: function () {
                                    return this.foo;
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/classified as final/);

            });

            it('should throw an error if overriding a final method or parameter', function () {

                var SomeClass = Class.declare(function () {
                    return {
                        $finals: {
                            foo: 'bar',
                            someFunction: function () {
                                return this.foo;
                            }
                        }
                    };
                }, true);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            foo: 'wtf'
                        };
                    }, true);
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            someFunction: function () {}
                        };
                    }, true);
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            $finals: {
                                foo: 'wtf'
                            }
                        };
                    }, true);
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            $finals: {
                                someFunction: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/override final/);

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: 'wtf'
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: undefined
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: null
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {}
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: {}
                            }
                        };
                    }, true);
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: new Date()
                            }
                        };
                    }, true);
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: []
                            }
                        };
                    }, true);
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: false
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: null
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: 'SOME'
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $constants: {
                                SOME: 1
                            }
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if overriding a constant parameter', function () {

                var SomeClass = Class.declare(function () {
                    return {
                        $constants: {
                            FOO: 'bar'
                        }
                    };
                }, true);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            $finals: {
                                $statics: {
                                    FOO: 'WTF'
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            $statics: {
                                FOO: 'WTF'
                            }
                        };
                    }, true);
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            $constants: {
                                FOO: 'WTF'
                            }
                        };
                    }, true);
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface.declare({
                                $constants: {
                                    FOO: 'WTF'
                                }
                            }),
                            $constants: {
                                FOO: 'WTF'
                            }
                        };
                    }, true);
                }).to.throwException(/override constant/);
            });

            it('should throw an error when specifying duplicate interfaces', function () {

                var SomeInterface = Interface.declare({});

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, SomeInterface]
                        };
                    }, true);
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [SomeInterface, SomeInterface]
                        };
                    }, true);
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [undefined, undefined]
                        };
                    }, true);
                }).to.not.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [undefined, undefined]
                        };
                    }, true);
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error if $borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: function () {}
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: undefined
                        };
                    }, true);
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: null
                        };
                    }, true);
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: 'wtf'
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: ['wtf']
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [undefined]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [null]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [undefined, undefined]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [null, null]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [function () {}]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: AbstractClass.declare({
                                $abstracts: {
                                    some: function () {}
                                }
                            })
                        };
                    }, true);
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [AbstractClass.declare({
                                $abstracts: {
                                    some: function () {}
                                }
                            })]
                        };
                    }, true);
                }).to.throwException(/abstract class with abstract members/);

                // TODO: enable this test if we ever support classes with inherited in the $borrows
                /*expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: Emitter.EventsEmitter
                        };
                    }, true);
                }).to.not.throwException();*/

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: Emitter.DirectEventsEmitter
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: Interface.declare({})
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [Interface.declare({})]
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    var SomeClass = Class.declare(function () { return {}; }, true);
                    return Class.declare(function () {
                        return {
                            $borrows: new SomeClass()
                        };
                    }, true);
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: Class.declare({})
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [{}]
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [Class.declare({})]
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $borrows: AbstractClass.declare({
                                $abstracts: {}
                            })
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $borrows: [AbstractClass.declare({})]
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $borrows contains an inherited class', function () {

                expect(function () {
                    var tmp = Class.declare(function () { return {}; }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(function () {
                        return {
                            $borrows: tmp2
                        };
                    }, true);
                }).to.throwException(/inherited class/);

                expect(function () {
                    var tmp = Class.declare(function () { return {}; }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return AbstractClass.declare(function () {
                        return {
                            $borrows: tmp2
                        };
                    }, true);
                }).to.throwException(/inherited class/);

            });

            it('should throw an error on duplicate $borrows', function () {

                expect(function () {
                    var Mixin = Class.declare(function () { return {}; }, true);
                    return Class.declare(function () {
                        return {
                            $borrows: [Mixin, Mixin]
                        };
                    }, true);
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $borrows: [undefined, undefined]
                        };
                    }, true);
                }).to.not.throwException(/duplicate entries/);
            });

            it('should throw an error if $implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: 'wtf'
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: undefined
                        };
                    }, true);
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: null
                        };
                    }, true);
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: ['wtf']
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [undefined]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [null]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [undefined, undefined]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [null, null]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: AbstractClass.declare({})
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [AbstractClass.declare({})]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Class.declare({})
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Class.declare({})]
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: 'wtf'
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: undefined
                        };
                    }, true);
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: null
                        };
                    }, true);
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: ['wtf']
                        };
                    }, true);
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [undefined]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [null]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [undefined, undefined]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [null, null]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: AbstractClass.declare({})
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [AbstractClass.declare({})]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: Class.declare({})
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [Class.declare({})]
                        };
                    }, true).to.throwException(/not a valid interface/);
                });

            });

            it('should throw an error when overriding methods with properties and vice-versa', function () {

                var SomeClass = Class.declare(function () {
                    return {
                        func: function () {},
                        prop: 'some'
                    };
                }, true),
                    SomeAbstractClass = AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                func: function () {}
                            }
                        };
                    }, true);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            func: 'some'
                        };
                    }, true);
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.declare(SomeClass, function ($super) {
                        return {
                            prop: function () {}
                        };
                    }, true);
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            func: 'some'
                        };
                    }, true);
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
                    return Class.declare(function () {
                        return {
                            $implements: Interface1,
                            method1: function () {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface1, Interface3],
                            method1: function (a) {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface4,
                            method1: function (a) {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface1, Interface2],
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface1,
                            method1: function (a, $b) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface1,
                            method1: function (a, $b, $c) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface5, Interface7],
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface8,
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface1],
                            $borrows: {
                                method1: function (a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface5, Interface7],
                            $borrows: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            },
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: [Interface5, Interface6],
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: Interface1,
                            $abstracts: {
                                method1: function ($a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: [Interface1, Interface3],
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: Interface8,
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface3,
                            method1: function (a, b) {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface3,
                            $borrows: {
                                method1: function (a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            method1: function () {}
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            initialize: function (a) {},
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, b) {},
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, $b) {},
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        }, true);
                    return Class.declare(tmp, function ($super) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, $b, $c) {},
                            method1: function (a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                initialize: function (a, $b) {}
                            };
                        }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            initialize: function (a, $b, $c) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                get: function (a) {}
                            };
                        }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(tmp2, function ($super) {
                        return {
                            get: function (a, b) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                get: function (a) {}
                            };
                        }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(tmp2, function ($super) {
                        return {
                            get: function () {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                get: function (a) {}
                            };
                        }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(tmp2, function ($super) {
                        return {
                            get: function ($a) {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                get: function (a) {}
                            };
                        }, true),
                        tmp2 = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return Class.declare(tmp2, function ($super) {
                        return {
                            get: function (a, $b) {}
                        };
                    }, true);
                }).to.not.throwException();

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: 'wtf'
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: undefined
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: null
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {}
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: 'wtf'
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: null
                            }
                        };
                    }, true);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if abstracts does not contain only functions without implementation', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: 'wtf'
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: undefined
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: null
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: 'wtf'
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: undefined
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: null
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: function (a) {
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
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
                        };
                    }, true);
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function (b) {
                                    }
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
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
                        };
                    }, true);
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: Class.declare({})
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: AbstractClass.declare({})
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                some: Interface.declare({})
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: Class.declare({})
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: AbstractClass.declare({})
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: Interface.declare({})
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                method1: function (a) { }
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) { }
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                method1: function ($a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function ($a, b) {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function () {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function () {}
                                    }
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                method1: function (a, b) {}
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, b) {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b, $c) {}
                                }
                            }
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if declared abstract functions in $abstracts are already defined', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            some: function () {},
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $statics: {
                                some: function () {}
                            },
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp =  Class.declare(function () {
                            return {
                                some: function () {}
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                some: function () {}
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                some: 'foo'
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/defined property/);

                expect(function () {
                    var tmp = Class.declare(function () {
                            return {
                                $statics: {
                                    some: function () {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $statics: {
                                    some: function () {}
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $statics: {
                                    some: 'some'
                                }
                            };
                        }, true);

                    return AbstractClass.declare(tmp, function ($super) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    }, true);
                }).to.throwException(/defined property/);

            });

            it('should not throw an error while extending another abstract class while not implementing its methods', function () {

                expect(function () {
                    var AbstractExample = AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                someMethod: function () {},
                                $statics: {
                                    someStaticMethod: function () {}
                                }
                            }
                        };
                    }, true);
                    return AbstractClass.declare(function () {
                        return {
                            $extends: AbstractExample
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should not throw an error when specifying binds poiting to abstract methods', function () {

                expect(function () {
                    return AbstractClass.declare(function () {
                        return {
                            $abstracts: {
                                method1: function () {}.$bound()
                            }
                        };
                    }, true);
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
                ExtendedInterface = Interface.declare(SomeInterface, function ($super) {
                    return {    // Interface that extends another
                        otherMethod: function () {},
                        $statics: {
                            otherStaticMethod: function () {}
                        }
                    };
                }, true);
            }

            function createAbstractClass() {
                SomeAbstractClass = AbstractClass.declare(function () {
                    return {        // Simple abstract class
                        $implements: SomeInterface
                    };
                }, true);
            }

            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass.declare(SomeAbstractClass, function ($super) {
                    return {    // Abstract class that extends another
                        $abstracts: {
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                            }
                        }
                    };
                }, true);
            }

            it('should throw an error when it is incomplete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface]
                            // miss all methods
                            // miss all static methods
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {}
                            // miss all static methods
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {},
                            $statics: {
                                weirdStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface],
                            otherMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // miss otherStaticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // missing extraStaticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            extraMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            extraMethod: function () {},
                            // missing someMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface, OtherInterface],
                            extraMethod: function () {},
                            otherMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface, OtherInterface],
                            otherMethod: function () {},
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.declare(function () {
                        return {
                            $extends: SomeAbstractClass
                            // miss all methods
                            // miss all static methods
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            someMethod: function () {}
                            // miss all static methods
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            $statics: {
                                weirdStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {

                    createExtendedAbstractClass();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            otherMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            // miss otherMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // miss otherStaticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // missing extraStaticMethod()
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            extraMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            extraMethod: function () {},
                            // missing someMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            extraMethod: function () {},
                            otherMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            otherMethod: function () {},
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        }, true);

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        }, true);

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            _protectedMethod: function () {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                _protectedMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        }, true);

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        }, true);

                    return Class.declare(function () {
                        return {
                            $extends: tmp
                        };
                    }, true);
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            _protectedMethod: function () {}
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        }, true);

                    return Class.declare(tmp, function ($super) {
                        return {
                            $statics: {
                                _protectedMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();
            });

            it('should not throw an error when it is complete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [ExtendedInterface, OtherInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.declare(SomeAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.declare(ExtendedAbstractClass, function ($super) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    }, true);
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

                var Mixin1 = Class.declare(function () {
                    return {
                        $implements: [SomeInterface],
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    };
                }, true),
                    Mixin2 = {
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    };

                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface],
                            $borrows: [Mixin1]
                        };
                    }, true);
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    return Class.declare(function () {
                        return {
                            $implements: [SomeInterface],
                            $borrows: [Mixin2]
                        };
                    }, true);
                }).to.not.throwException();

            });

            it('should throw an error if they define abstract methods', function () {

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $abstracts: {}
                        };
                    }, true);
                }).to.throwException(/has abstract methods/);

                expect(function () {
                    return Class.declare(function () {
                        return {
                            $abstracts: {
                                method1: function () {}
                            }
                        };
                    }, true);
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

            var AbstractExample = AbstractClass.declare(function () {
                return {
                    initialize: function () {},
                    $abstracts: {
                        abstractMethod: function () {}
                    }
                };
            }, true);

            it('should throw an error while using new', function () {

                expect(function () { return new AbstractExample(); }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Concrete Classes', function () {

            it('should throw an error if we do it without using the new keyword', function () {

                var SomeClass = Class.declare(function () { return {}; }, true),
                    OtherClass = FinalClass.declare(function () { return {}; }, true);

                expect(function () {
                    return SomeClass();
                }).to.throwException(/called as a function/);

                expect(function () {
                    return OtherClass();
                }).to.throwException(/called as a function/);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should throw an error if the constructor is private/protected', function () {

                    var SomeClass = Class.declare(function () {
                        return {
                            _initialize: function () {}
                        };
                    }, true),
                        OtherClass = Class.declare(function () {
                            return {
                                __initialize: function () {}
                            };
                        }, true);

                    expect(function () {
                        return new SomeClass();
                    }).to.throwException(/is protected/);

                    expect(function () {
                        return new OtherClass();
                    }).to.throwException(/is private/);

                });
            }

            it('should not throw an error while invoking the the parent abstract class constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare(function () { return { initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.declare(function () { return { initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(function () {
                            return {
                                $extends: tmp
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.not.throwException();

            });

            it('should not throw an error while invoking the the parent class protected constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare(function () { return { _initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare(function () { return { _initialize: function () {} }; }, true),
                            SomeImplementation = Class.declare(function () {
                                return {
                                    $extends: tmp
                                };
                            }, true);

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

                expect(function () {
                    var tmp = Class.declare(function () { return { _initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare(function () { return { _initialize: function () {} }; }, true),
                            SomeImplementation = Class.declare(function () {
                                return {
                                    $extends: tmp
                                };
                            }, true);

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

            });

            it('should throw an error while invoking the parent class private constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.declare(function () { return { __initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.declare(function () { return { __initialize: function () {} }; }, true),
                            SomeImplementation = Class.declare(function () {
                                return {
                                    $extends: tmp
                                };
                            }, true);

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.declare(function () { return { __initialize: function () {} }; }, true),
                        SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.declare(function () { return { __initialize: function () {} }; }, true),
                            SomeImplementation = Class.declare(function () {
                                return {
                                    $extends: tmp
                                };
                            }, true);

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.declare(function () { return { __initialize: function () {} }; }, true),
                            SomeImplementation = Class.declare(tmp, function ($super) {
                            return {
                                initialize: function () {}
                            };
                        }, true);

                    return new SomeImplementation();
                }).to.not.throwException();

            });

        });

    });

});
