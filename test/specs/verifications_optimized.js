/*jshint strict:false, regexp:false*/

define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, hasDefineProperty) {

    var expect = global.expect;

    // TODO: remove this once mocha fixes it (https://github.com/visionmedia/mocha/issues/502)
    beforeEach(function (done) {
        setTimeout(done, 0);
    });

    describe('Verifications:', function () {

        describe('Defining an Interface', function () {

            it('should throw an error when using an invalid argument', function () {

                expect(function () {
                    return Interface.create('some');
                }).to.throwException(/to be an object/);

            });

            it('should throw an error when using an invalid name', function () {

                expect(function () {
                    return Interface.create({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface.create({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface.create({ $name: 'Some Name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Interface.create({ $name: 'SomeName' });
                }).to.not.throwException();

            });

            it('should throw an error when defining the initialize method', function () {

                expect(function () {
                    return Interface.create({
                        initialize: function () {}
                    });
                }).to.throwException(/initialize method/i);

            });

            it('should throw an error if using .extend() with an $extend property', function () {

                expect(function () {
                    var SomeInterface = Interface.create({}),
                        OtherInterface = SomeInterface.extend({
                            $extends: SomeInterface
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should work with .extend()', function () {

                var SomeInterface = Interface.create({}),
                    OtherInterface = SomeInterface.extend({}),
                    SomeClass = Class.create(function ($self) {
                        return {
                            $implements: OtherInterface
                        };
                    }),
                    someClass = new SomeClass();

                expect(instanceOf(someClass, OtherInterface)).to.be.equal(true);
                expect(instanceOf(someClass, SomeInterface)).to.be.equal(true);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Interface.create({
                        $constants: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            $statics: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $finals: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $abstracts: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $implements: []
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface.create({
                        $borrows: []
                    });
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Interface.create({
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
                    return Interface.create({
                        $extends: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface.create({
                        $extends: undefined
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    var tmp =  Interface.create({});
                    return Interface.create({
                        $extends: [undefined, tmp]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface.create({
                        $extends: null
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface.create({
                        $extends: function () {}
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    var tmp = Class.create(function ($self) { return {}; });

                    return Interface.create({
                        $extends: tmp
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    var tmp = Interface.create({});
                    return Interface.create({
                        $extends: tmp
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.create({});

                    return Interface.create({
                        $extends: tmp
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it does not contain only functions without implementation', function () {

                expect(function () {
                    return Interface.create({
                        some: 'property'
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        some: undefined
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        some: null
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: 'property'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        some: function (a) {
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
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
                    return Interface.create({
                        $statics: {
                            some: function (b) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
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
                    return Interface.create({
                        some: Class.create({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        some: AbstractClass.create({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        some: Interface.create({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: Class.create({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: AbstractClass.create({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            some: Interface.create({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface.create({
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        method1: function (a) { }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $statics: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Interface.create({
                        method1: function ($a, b) {}
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Interface.create({
                        $statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
                        $statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
                        $statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
                        $statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Interface.create({
                        $constants: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
                        $constants: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
                        $constants: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface.create({
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
                            return Interface.create(obj);
                        };
                    },
                    checkStatic = function (key) {
                        return function () {
                            var obj = {$statics: {}};
                            obj.$statics[key] = 'bla';
                            return Interface.create(obj);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return Interface.create(obj);
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
                    var SomeInterface = Interface.create({});
                    return Interface.create({
                        $extends: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Interface.create({
                        $extends: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error when it extends multiple ones with incompatible duplicate methods', function () {

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                method1: function () {}
                            }),
                            Interface.create({
                                method1: function (a) {}
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                method1: function (a, b) {}
                            }),
                            Interface.create({
                                method1: function (a) {}
                            })
                        ],
                        method1: function (a, b) {}
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                $statics: {
                                    method1: function () {}
                                }
                            }),
                            Interface.create({
                                $statics: {
                                    method1: function (a) {}
                                }
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                $statics: {
                                    method1: function (a) {}
                                }
                            }),
                            Interface.create({
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
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                method1: function () {}
                            })
                        ],
                        method1: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }),
                            Interface.create({
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
                    var tmp = Interface.create({
                            method1: function () {}
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            method1: function (a) {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.create({
                            $statics: {
                                method1: function () {}
                            }
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.create({
                            method1: function (a, $b) {}
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            method1: function (a, b) {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.create({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                method1: function (a, b) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = Interface.create({
                            method1: function (a, $b) {}
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            method1: function (a, $b) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.create({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.create({
                            method1: function (a, $b) {}
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            method1: function (a, $b, $c) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Interface.create({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: new Date()
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: []
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: false
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: null
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: 'SOME'
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface.create({
                        $constants: {
                            SOME: 1
                        }
                    });
                }).to.not.throwException();
            });

            it('should throw an error when it extends multiple ones with same constants but different values', function () {

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface.create({
                                $constants: {
                                    FOO: 'test2'
                                }
                            })
                        ]
                    });
                }).to.throwException(/different values/);

                expect(function () {
                    return Interface.create({
                        $extends: [
                            Interface.create({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface.create({
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
                    var tmp = Interface.create({
                            $constants: {
                                FOO: 'test'
                            }
                        });

                    return Interface.create(tmp, function ($super, $self, $parent) {
                        return {
                            $constants: {
                                FOO: 'test'
                            }
                        };
                    });
                }).to.throwException(/override constant/);

            });

            it('should throw an error if a protected/private methods/constants are defined', function () {

                expect(function () {
                    return Interface.create({
                        __privateMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.create({
                        _protectedMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            __privateMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.create({
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.create({
                        $constants: {
                            _FOO: 'bar'
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface.create({
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
                    return Class.create('some');
                }).to.throwException(/to be an object/);

                expect(function () {
                    return Class.create(undefined);
                }).to.throwException(/to be an object/);

                expect(function () {
                    return Class.create(null);
                }).to.throwException(/to be an object/);

            });

            it('should throw an error when using an invalid name', function () {

                expect(function () {
                    return Class.create(function ($self) { return { $name: undefined }; });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.create(function ($self) { return { $name: null }; });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class.create(function ($self) { return { $name: 'Some $name' }; });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Class.create(function ($self) { return { $name: 'SomeName' }; });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) { return { $name: undefined }; });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.create(function ($self) { return { $name: null }; });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass.create(function ($self) { return { $name: 'Some $name' }; });
                }).to.throwException(/spaces/);

                expect(function () {
                    return AbstractClass.create(function ($self) { return { $name: 'SomeName' }; });
                }).to.not.throwException();

            });

            it('should throw an error when using an invalid initialize', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            initialize: undefined
                        };
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            initialize: null
                        };
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            initialize: 'some'
                        };
                    });
                }).to.throwException(/must be a function/);

            });

            it('should throw an error if using .extend() with an $extend property', function () {

                expect(function () {
                    var SomeClass = Class.create(function ($self) { return {}; }),
                        OtherClass = SomeClass.extend({
                            $extends: SomeClass
                        });
                }).to.throwException(/cannot contain an .extends property/);

            });

            it('should throw an error when defining several constructors', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            initialize: function () {},
                            _initialize: function () {}
                        };
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            initialize: function () {},
                            __initialize: function () {}
                        };
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            _initialize: function () {},
                            __initialize: function () {}
                        };
                    });
                }).to.throwException(/several constructors/i);

            });

            it('should throw an error when using the same function for different members', function () {

                var a = function () {};

                expect(function () {
                    Class.create(function ($self) {
                        return {
                            test: a,
                            test2: a
                        };
                    });
                }).to.throwException(/by the same/);

                expect(function () {
                    Class.create(function ($self) {
                        return {
                            test: a,
                            $finals: {
                                test2: a
                            }
                        };
                    });
                }).to.throwException(/by the same/);

                expect(function () {
                    Class.create(function ($self) {
                        return {
                            $statics: {
                                test: 1
                            },
                            $finals: {
                                test2: a
                            }
                        };
                    });
                }).to.throwException(/by the same/);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                $finals: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                $abstracts: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                $statics: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $constants: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $abstracts: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {
                                $finals: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {
                                $constants: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {
                                $name: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $name: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                $constants: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                $extends: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $extends: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $abstracts: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $constants: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $finals: {}
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    $constants: {}
                                }
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    $finals: {}
                                }
                            }
                        };
                    });
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: 'foo'
                            },
                            $statics: {
                                SOME: 'foo'
                            }
                        };
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.create(function ($self) {
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
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.create(function ($self) {
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
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                some: 'foo'
                            },
                            some: 'foo'
                        };
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class.create(function ($self) {
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
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
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
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            $finals: {
                                some: 'foo'
                            }
                        };
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            some: 'foo'
                        };
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            $finals: {
                                some: function () {}
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: function () {}
                            },
                            some: function () {}
                        };
                    });
                }).to.throwException(/already implemented/);

            });

            it('should throw an error when defining unallowed properties', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            some: undefined
                        };
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                some: undefined
                            }
                        };
                    });
                }).to.throwException(/cannot be parsed/);


                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {
                                some: undefined
                            }
                        };
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            some: undefined
                        };
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $finals: {
                                some: undefined
                            }
                        };
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $statics: {
                                some: undefined
                            }
                        };
                    });
                }).to.throwException(/cannot be parsed/);

            });

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $extends: 'wtf'
                        };
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $extends: undefined
                        };
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $extends: null
                        };
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $extends: function () {}
                        };
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    var tmp = Interface.create({});

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    var tmp = Class.create(function ($self) { return {}; });

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            method1: function ($a, b) {}
                        };
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {
                                method1: function ($a, b) {}
                            }
                        };
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    var $ = function () {};
                    return Class.create(function ($self) {
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
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: 'wtf'
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: undefined
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: null
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $statics: {}
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $finals is not an object', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $statics: 'wtf'
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $statics: undefined
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $statics: null
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                $statics: {}
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $finals is not an object', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: 'wtf'
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: undefined
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: null
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {}
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error while defining private method/parameter as $final', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $finals: {
                                __foo: 'bar',
                                __someFunction: function () {
                                    return this.foo;
                                }
                            }
                        };
                    });
                }).to.throwException(/classified as final/);

            });

            it('should throw an error if overriding a final method or parameter', function () {

                var SomeClass = Class.create(function ($self) {
                    return {
                        $finals: {
                            foo: 'bar',
                            someFunction: function () {
                                return this.foo;
                            }
                        }
                    };
                });

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            foo: 'wtf'
                        };
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            someFunction: function () {}
                        };
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            $finals: {
                                foo: 'wtf'
                            }
                        };
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            $finals: {
                                someFunction: function () {}
                            }
                        };
                    });
                }).to.throwException(/override final/);

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: 'wtf'
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: undefined
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: null
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {}
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: {}
                            }
                        };
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: new Date()
                            }
                        };
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: function () {}
                            }
                        };
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: []
                            }
                        };
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: false
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: null
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: 'SOME'
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $constants: {
                                SOME: 1
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if overriding a constant parameter', function () {

                var SomeClass = Class.create(function ($self) {
                    return {
                        $constants: {
                            FOO: 'bar'
                        }
                    };
                });

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            $finals: {
                                $statics: {
                                    FOO: 'WTF'
                                }
                            }
                        };
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                FOO: 'WTF'
                            }
                        };
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            $constants: {
                                FOO: 'WTF'
                            }
                        };
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface.create({
                                $constants: {
                                    FOO: 'WTF'
                                }
                            }),
                            $constants: {
                                FOO: 'WTF'
                            }
                        };
                    });
                }).to.throwException(/override constant/);
            });

            it('should throw an error when specifying duplicate interfaces', function () {

                var SomeInterface = Interface.create({});

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, SomeInterface]
                        };
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [SomeInterface, SomeInterface]
                        };
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [undefined, undefined]
                        };
                    });
                }).to.not.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [undefined, undefined]
                        };
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error if $borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: function () {}
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: undefined
                        };
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: null
                        };
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: 'wtf'
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: ['wtf']
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [undefined]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [null]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [undefined, undefined]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [null, null]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [function () {}]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: AbstractClass.create({
                                $abstracts: {
                                    some: function () {}
                                }
                            })
                        };
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [AbstractClass.create({
                                $abstracts: {
                                    some: function () {}
                                }
                            })]
                        };
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: Interface.create({})
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [Interface.create({})]
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    var SomeClass = Class.create(function ($self) { return {}; });
                    return Class.create(function ($self) {
                        return {
                            $borrows: new SomeClass()
                        };
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: Class.create({})
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [{}]
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [Class.create({})]
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $borrows: AbstractClass.create({
                                $abstracts: {}
                            })
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $borrows: [AbstractClass.create({})]
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $borrows contains an inherited class', function () {

                expect(function () {
                    var tmp = Class.create(function ($self) { return {}; }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(function ($self) {
                        return {
                            $borrows: tmp2
                        };
                    });
                }).to.throwException(/inherited class/);

                expect(function () {
                    var tmp = Class.create(function ($self) { return {}; }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return AbstractClass.create(function ($self) {
                        return {
                            $borrows: tmp2
                        };
                    });
                }).to.throwException(/inherited class/);

            });

            it('should throw an error on duplicate $borrows', function () {

                expect(function () {
                    var Mixin = Class.create(function ($self) { return {}; });
                    return Class.create(function ($self) {
                        return {
                            $borrows: [Mixin, Mixin]
                        };
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $borrows: [undefined, undefined]
                        };
                    });
                }).to.not.throwException(/duplicate entries/);
            });

            it('should throw an error if $implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: 'wtf'
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: undefined
                        };
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: null
                        };
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: ['wtf']
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [undefined]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [null]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [undefined, undefined]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [null, null]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: AbstractClass.create({})
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [AbstractClass.create({})]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Class.create({})
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Class.create({})]
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: 'wtf'
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: undefined
                        };
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: null
                        };
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: ['wtf']
                        };
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [undefined]
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [null]
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [undefined, undefined]
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [null, null]
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: AbstractClass.create({})
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [AbstractClass.create({})]
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: Class.create({})
                        };
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [Class.create({})]
                        };
                    }).to.throwException(/not a valid interface/);
                });

            });

            it('should throw an error when overriding methods with properties and vice-versa', function () {

                var SomeClass = Class.create(function ($self) {
                    return {
                        func: function () {},
                        prop: 'some'
                    };
                }),
                    SomeAbstractClass = AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                func: function () {}
                            }
                        };
                    });

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            func: 'some'
                        };
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.create(SomeClass, function ($super, $self, $parent) {
                        return {
                            prop: function () {}
                        };
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            func: 'some'
                        };
                    });
                }).to.throwException(/(with the same name)|(was not found)/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                var Interface1 = Interface.create({
                    method1: function (a) {}
                }),
                    Interface2 = Interface.create({
                        method1: function (a) {}
                    }),
                    Interface3 = Interface.create({
                        method1: function (a, b) {}
                    }),
                    Interface4 = Interface.create({
                        method1: function (a, $b) {}
                    }),
                    Interface5 = Interface.create({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface6 = Interface.create({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface7 = Interface.create({
                        $statics: {
                            method1: function (a, b) {}
                        }
                    }),
                    Interface8 = Interface.create({
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface1,
                            method1: function () {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Interface1, Interface3],
                            method1: function (a) {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface4,
                            method1: function (a) {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Interface1, Interface2],
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface1,
                            method1: function (a, $b) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface1,
                            method1: function (a, $b, $c) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function () {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Interface5, Interface7],
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface8,
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Interface1],
                            $borrows: {
                                method1: function (a, b) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
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
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: [Interface5, Interface6],
                            $statics: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $implements: Interface5,
                            $statics: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: Interface1,
                            $abstracts: {
                                method1: function ($a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: [Interface1, Interface3],
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: Interface8,
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface3,
                            method1: function (a, b) {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface3,
                            $borrows: {
                                method1: function (a, b) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                $abstracts: {
                                    method1: function (a) {}
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            method1: function () {}
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            initialize: function (a) {},
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, b) {},
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, $b) {},
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $implements: Interface1,
                                initialize: function (a, $b) {}
                            };
                        });
                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $implements: Interface1,
                            initialize: function (a, $b, $c) {},
                            method1: function (a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                initialize: function (a, $b) {}
                            };
                        }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            initialize: function (a, $b, $c) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                get: function (a) {}
                            };
                        }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(tmp2, function ($super, $self, $parent) {
                        return {
                            get: function (a, b) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                get: function (a) {}
                            };
                        }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(tmp2, function ($super, $self, $parent) {
                        return {
                            get: function () {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                get: function (a) {}
                            };
                        }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(tmp2, function ($super, $self, $parent) {
                        return {
                            get: function ($a) {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                get: function (a) {}
                            };
                        }),
                        tmp2 = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return Class.create(tmp2, function ($super, $self, $parent) {
                        return {
                            get: function (a, $b) {}
                        };
                    });
                }).to.not.throwException();

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: 'wtf'
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: undefined
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: null
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {}
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: 'wtf'
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: undefined
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: null
                            }
                        };
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {}
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if abstracts does not contain only functions without implementation', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: 'wtf'
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: undefined
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: null
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: 'wtf'
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: undefined
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: null
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: function (a) {
                                }
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
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
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function (b) {
                                    }
                                }
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
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
                    });
                }).to.throwException(/no implementation/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: Class.create({})
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: AbstractClass.create({})
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                some: Interface.create({})
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: Class.create({})
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: AbstractClass.create({})
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: Interface.create({})
                                }
                            }
                        };
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                method1: function (a) { }
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) { }
                                }
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                method1: function ($a, b) {}
                            }
                        };
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function ($a, b) {}
                                }
                            }
                        };
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    method1: function () {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                method1: function (a) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function () {}
                                    }
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a) {}
                                }
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                method1: function (a, b) {}
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, b) {}
                                }
                            }
                        };
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    method1: function (a, $b) {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                method1: function (a, $b, $c) {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        method1: function (a, $b) {}
                                    }
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b, $c) {}
                                }
                            }
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if declared abstract functions in $abstracts are already defined', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            some: function () {},
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass.create(function ($self) {
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
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp =  Class.create(function ($self) {
                            return {
                                some: function () {}
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                some: function () {}
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                some: 'foo'
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                some: function () {}
                            }
                        };
                    });
                }).to.throwException(/defined property/);

                expect(function () {
                    var tmp = Class.create(function ($self) {
                            return {
                                $statics: {
                                    some: function () {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $statics: {
                                    some: function () {}
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $statics: {
                                    some: 'some'
                                }
                            };
                        });

                    return AbstractClass.create(tmp, function ($super, $self, $parent) {
                        return {
                            $abstracts: {
                                $statics: {
                                    some: function () {}
                                }
                            }
                        };
                    });
                }).to.throwException(/defined property/);

            });

            it('should not throw an error while extending another abstract class while not implementing its methods', function () {

                expect(function () {
                    var AbstractExample = AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                someMethod: function () {},
                                $statics: {
                                    someStaticMethod: function () {}
                                }
                            }
                        };
                    });
                    return AbstractClass.create(function ($self) {
                        return {
                            $extends: AbstractExample
                        };
                    });
                }).to.not.throwException();

            });

            it('should not throw an error when specifying binds poiting to abstract methods', function () {

                expect(function () {
                    return AbstractClass.create(function ($self) {
                        return {
                            $abstracts: {
                                method1: function () {}.$bound()
                            }
                        };
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

                            return AbstractClass.create(temp);
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

                            return AbstractClass.create(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return AbstractClass.create(obj);
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
                SomeInterface = Interface.create({        // Simple interface
                    someMethod: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                });
            }

            function createOtherInterface() {
                OtherInterface = Interface.create({       // Other interface with different methods
                    extraMethod: function () {},
                    $statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }

            function createExtendedInterface() {
                createSomeInterface();
                ExtendedInterface = Interface.create(SomeInterface, function ($super, $self, $parent) {
                    return {    // Interface that extends another
                        otherMethod: function () {},
                        $statics: {
                            otherStaticMethod: function () {}
                        }
                    };
                });
            }

            function createAbstractClass() {
                SomeAbstractClass = AbstractClass.create(function ($self) {
                    return {        // Simple abstract class
                        $implements: SomeInterface
                    };
                });
            }

            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass.create(SomeAbstractClass, function ($super, $self, $parent) {
                    return {    // Abstract class that extends another
                        $abstracts: {
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                            }
                        }
                    };
                });
            }

            it('should throw an error when it is incomplete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface]
                            // miss all methods
                            // miss all static methods
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {}
                            // miss all static methods
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {},
                            $statics: {
                                weirdStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [ExtendedInterface],
                            otherMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // miss otherStaticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // missing extraStaticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            extraMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            extraMethod: function () {},
                            // missing someMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
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
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
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
                    });
                }).to.throwException(/was not found/);

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.create(function ($self) {
                        return {
                            $extends: SomeAbstractClass
                            // miss all methods
                            // miss all static methods
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {}
                            // miss all static methods
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            $statics: {
                                weirdStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {

                    createExtendedAbstractClass();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
                        return {
                            otherMethod: function () {},
                            // miss someMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            // miss otherMethod()
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                otherStaticMethod: function () {}
                                // miss staticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // miss otherStaticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                                // missing extraStaticMethod()
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            $implements: [OtherInterface],
                            extraMethod: function () {},
                            someMethod: function () {},
                            $statics: {
                                // missing staticMethod()
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            $implements: [OtherInterface],
                            extraMethod: function () {},
                            // missing someMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            // missing extraMethod()
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
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
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
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
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        });

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        });

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            _protectedMethod: function () {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                _protectedMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();
                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        });

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        });

                    return Class.create(function ($self) {
                        return {
                            $extends: tmp
                        };
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    _protectedMethod: function () {}
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            _protectedMethod: function () {}
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) {
                            return {
                                $abstracts: {
                                    $statics: {
                                        _protectedMethod: function () {}
                                    }
                                }
                            };
                        });

                    return Class.create(tmp, function ($super, $self, $parent) {
                        return {
                            $statics: {
                                _protectedMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();
            });

            it('should not throw an error when it is complete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface],
                            someMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [ExtendedInterface],
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface, OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class.create(function ($self) {
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
                    });
                }).to.not.throwException();

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            $statics: {
                                staticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
                        return {
                            someMethod: function () {},
                            otherMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                otherStaticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class.create(SomeAbstractClass, function ($super, $self, $parent) {
                        return {
                            $implements: [OtherInterface],
                            someMethod: function () {},
                            extraMethod: function () {},
                            $statics: {
                                staticMethod: function () {},
                                extraStaticMethod: function () {}
                            }
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class.create(ExtendedAbstractClass, function ($super, $self, $parent) {
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

                            return Class.create(temp);
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

                            return Class.create(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return AbstractClass.create(obj);
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

                var Mixin1 = Class.create(function ($self) {
                    return {
                        $implements: [SomeInterface],
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    };
                }),
                    Mixin2 = {
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    };

                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface],
                            $borrows: [Mixin1]
                        };
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    return Class.create(function ($self) {
                        return {
                            $implements: [SomeInterface],
                            $borrows: [Mixin2]
                        };
                    });
                }).to.not.throwException();

            });

            it('should throw an error if they define abstract methods', function () {

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $abstracts: {}
                        };
                    });
                }).to.throwException(/has abstract methods/);

                expect(function () {
                    return Class.create(function ($self) {
                        return {
                            $abstracts: {
                                method1: function () {}
                            }
                        };
                    });
                }).to.throwException(/has abstract methods/);
            });

        });

        describe('Instantiation of Interfaces', function () {

            it('should throw an error', function () {

                expect(function () {
                    var SomeInterface = Interface.create({
                        someMethod: function () {}
                    });
                    return new SomeInterface();
                }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Abstract Classes', function () {

            var AbstractExample = AbstractClass.create(function ($self) {
                return {
                    initialize: function () {},
                    $abstracts: {
                        abstractMethod: function () {}
                    }
                };
            });

            it('should throw an error while using new', function () {

                expect(function () { return new AbstractExample(); }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Concrete Classes', function () {

            it('should throw an error if we do it without using the new keyword', function () {

                var SomeClass = Class.create(function ($self) { return {}; }),
                    OtherClass = FinalClass.create(function ($self) { return {}; });

                expect(function () {
                    return SomeClass();
                }).to.throwException(/called as a function/);

                expect(function () {
                    return OtherClass();
                }).to.throwException(/called as a function/);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should throw an error if the constructor is private/protected', function () {

                    var SomeClass = Class.create(function ($self) {
                        return {
                            _initialize: function () {}
                        };
                    }),
                        OtherClass = Class.create(function ($self) {
                            return {
                                __initialize: function () {}
                            };
                        });

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
                    var tmp = AbstractClass.create(function ($self) { return { initialize: function () {} }; }),
                        SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) { return { initialize: function () {} }; }),
                        SomeImplementation = Class.create(function ($self) {
                            return {
                                $extends: tmp
                            };
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

            });

            it('should not throw an error while invoking the the parent class protected constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) { return { _initialize: function () {} }; }),
                        SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.create(function ($self) { return { _initialize: function () {} }; }),
                            SomeImplementation = Class.create(function ($self) {
                                return {
                                    $extends: tmp
                                };
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

                expect(function () {
                    var tmp = Class.create(function ($self) { return { _initialize: function () {} }; }),
                        SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.create(function ($self) { return { _initialize: function () {} }; }),
                            SomeImplementation = Class.create(function ($self) {
                                return {
                                    $extends: tmp
                                };
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is protected/);
                }

            });

            it('should throw an error while invoking the parent class private constructor', function () {

                expect(function () {
                    var tmp = AbstractClass.create(function ($self) { return { __initialize: function () {} }; }),
                        SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        });

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = AbstractClass.create(function ($self) { return { __initialize: function () {} }; }),
                            SomeImplementation = Class.create(function ($self) {
                                return {
                                    $extends: tmp
                                };
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.create(function ($self) { return { __initialize: function () {} }; }),
                        SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {
                                    $super.initialize.call(this);
                                }
                            };
                        });

                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var tmp = Class.create(function ($self) { return { __initialize: function () {} }; }),
                            SomeImplementation = Class.create(function ($self) {
                                return {
                                    $extends: tmp
                                };
                            });

                        return new SomeImplementation();
                    }).to.throwException(/is private/);
                }

                expect(function () {
                    var tmp = Class.create(function ($self) { return { __initialize: function () {} }; }),
                            SomeImplementation = Class.create(tmp, function ($super, $self, $parent) {
                            return {
                                initialize: function () {}
                            };
                        });

                    return new SomeImplementation();
                }).to.not.throwException();

            });

        });

    });

});
