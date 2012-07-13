/*jshint strict:false*/

define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, hasDefineProperty) {

    var expect = global.expect;

    describe('Verifications:', function () {

        describe('Defining an Interface', function () {

            it('should throw an error when using an invalid argument', function () {

                expect(function () {
                    return Interface('some');
                }).to.throwException(/must be an object/);

            });

            it('should throw an error when using an invalid name', function () {

                expect(function () {
                    return Interface({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Interface({ $name: 'Some Name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Interface({ $name: 'SomeName' });
                }).to.not.throwException();

            });

            it('should throw an error when defining the initialize method', function () {

                expect(function () {
                    return Interface({
                        initialize: function () {}
                    });
                }).to.throwException(/initialize method/i);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Interface({
                        $constants: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $constants: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $constants: {
                            $statics: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $finals: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $abstracts: {}
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $implements: []
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Interface({
                        $borrows: []
                    });
                }).to.throwException(/unallowed/);

            });

            it('should throw an error when defining ambiguous members', function () {

                expect(function () {
                    return Interface({
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
                    return Interface({
                        $extends: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        $extends: undefined
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface({
                        $extends: [undefined, Interface({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        $extends: null
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface({
                        $extends: function () {}
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        $extends: Class({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        $extends: Interface({})
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $extends: [Interface({})]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it does not contain only functions without implementation', function () {

                expect(function () {
                    return Interface({
                        some: 'property'
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: undefined
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: null
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: 'property'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: function (a) {
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
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
                    return Interface({
                        $statics: {
                            some: function (b) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
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
                    return Interface({
                        some: Class({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: AbstractClass({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: Interface({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: Class({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: AbstractClass({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        $statics: {
                            some: Interface({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        method1: function (a) { }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $statics: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Interface({
                        method1: function ($a, b) {}
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Interface({
                        $statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error if $statics is not an object', function () {

                expect(function () {
                    return Interface({
                        $statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Interface({
                        $constants: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $constants: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $constants: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        $constants: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super'],
                    reservedStatic = ['$parent', '$super'],
                    x,
                    checkNormal = function (key) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return Interface(obj);
                        };
                    },
                    checkStatic = function (key) {
                        return function () {
                            var obj = {$statics: {}};
                            obj.$statics[key] = 'bla';
                            return Interface(obj);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return Interface(obj);
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
                    var SomeInterface = Interface({});
                    return Interface({
                        $extends: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Interface({
                        $extends: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error when it extends multiple ones with incompatible duplicate methods', function () {

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                method1: function () {}
                            }),
                            Interface({
                                method1: function (a) {}
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                method1: function (a, b) {}
                            }),
                            Interface({
                                method1: function (a) {}
                            })
                        ],
                        method1: function (a, b) {}
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                $statics: {
                                    method1: function () {}
                                }
                            }),
                            Interface({
                                $statics: {
                                    method1: function (a) {}
                                }
                            })
                        ]
                    });
                }).to.throwException(/from different parents with incompatible signatures/);

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                $statics: {
                                    method1: function (a) {}
                                }
                            }),
                            Interface({
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
                    return Interface({
                        $extends: [
                            Interface({
                                method1: function () {}
                            })
                        ],
                        method1: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }),
                            Interface({
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
                    return Interface({
                        $extends: Interface({
                            method1: function () {}
                        }),
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            $statics: {
                                method1: function () {}
                            }
                        }),
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $statics: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $extends: Interface({
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: new Date()
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: []
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: false
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: null
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: "SOME"
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        $constants: {
                            SOME: 1
                        }
                    });
                }).to.not.throwException();
            });

            it('should throw an error when it extends multiple ones with same constants but different values', function () {

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface({
                                $constants: {
                                    FOO: 'test2'
                                }
                            })
                        ]
                    });
                }).to.throwException(/different values/);

                expect(function () {
                    return Interface({
                        $extends: [
                            Interface({
                                $constants: {
                                    FOO: 'test'
                                }
                            }),
                            Interface({
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
                    return Interface({
                        $extends: Interface({
                            $constants: {
                                FOO: 'test'
                            }
                        }),
                        $constants: {
                            FOO: 'test'
                        }
                    });
                }).to.throwException(/override constant/);

            });

            it('should throw an error if a protected/private methods/constants are defined', function () {

                expect(function () {
                    return Interface({
                        __privateMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface({
                        _protectedMethod: function () {}
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface({
                        $statics: {
                            __privateMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface({
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface({
                        $constants: {
                            _FOO: 'bar'
                        }
                    });
                }).to.throwException(/non public/);

                expect(function () {
                    return Interface({
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
                    return Class('some');
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class(undefined);
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class(null);
                }).to.throwException(/must be an object/);

            });

            it('should throw an error when using an invalid name', function () {

                expect(function () {
                    return Class({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return Class({ $name: 'Some $name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return Class({ $name: 'SomeName' });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({ $name: undefined });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass({ $name: null });
                }).to.throwException(/must be a string/);

                expect(function () {
                    return AbstractClass({ $name: 'Some $name' });
                }).to.throwException(/spaces/);

                expect(function () {
                    return AbstractClass({ $name: 'SomeName' });
                }).to.not.throwException();

            });

            it('should throw an error when using an invalid initialize', function () {

                expect(function () {
                    return Class({
                        initialize: undefined
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class({
                        initialize: null
                    });
                }).to.throwException(/must be a function/);

                expect(function () {
                    return Class({
                        initialize: 'some'
                    });
                }).to.throwException(/must be a function/);

            });

            it('should throw an error when defining several constructors', function () {

                expect(function () {
                    return Class({
                        initialize: function () {},
                        _initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class({
                        initialize: function () {},
                        __initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

                expect(function () {
                    return Class({
                        _initialize: function () {},
                        __initialize: function () {}
                    });
                }).to.throwException(/several constructors/i);

            });

            it('should throw an error when using the same function for different members', function () {

                var a = function () {};

                expect(function () {
                    Class({
                        test: a,
                        test2: a
                    });
                }).to.throwException(/by the same/);

                expect(function () {
                    Class({
                        test: a,
                        $finals: {
                            test2: a
                        }
                    });
                }).to.throwException(/by the same/);

                expect(function () {
                    Class({
                        $statics: {
                            test: 1
                        },
                        $finals: {
                            test2: a
                        }
                    });
                }).to.throwException(/by the same/);

            });

            it('should throw an error when defining unallowed members', function () {

                expect(function () {
                    return Class({
                        $constants: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $constants: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $constants: {
                            $statics: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $finals: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $finals: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $statics: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $statics: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $statics: {
                            $name: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $finals: {
                            $name: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $constants: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return Class({
                        $constants: {
                            $extends: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $extends: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $abstracts: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $constants: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $finals: {}
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                $constants: {}
                            }
                        }
                    });
                }).to.throwException(/unallowed/);

                expect(function () {
                    return AbstractClass({
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
                    return Class({
                        $constants: {
                            SOME: 'foo'
                        },
                        $statics: {
                            SOME: 'foo'
                        }
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class({
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
                    return Class({
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
                    return Class({
                        $finals: {
                            some: 'foo'
                        },
                        some: 'foo'
                    });
                }).to.throwException(/different modifiers/);

                expect(function () {
                    return Class({
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
                    return AbstractClass({
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
                    return AbstractClass({
                        $abstracts: {
                            some: function () {}
                        },
                        $finals: {
                            some: 'foo'
                        }
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: function () {}
                        },
                        some: 'foo'
                    });
                }).to.throwException(/already defined/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: function () {}
                        },
                        $finals: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: function () {}
                        },
                        some: function () {}
                    });
                }).to.throwException(/already implemented/);

            });

            it('should throw an error when defining unallowed properties', function () {

                expect(function () {
                    return Class({
                        some: undefined
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return Class({
                        $finals: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);


                expect(function () {
                    return Class({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass({
                        some: undefined
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass({
                        $finals: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

                expect(function () {
                    return AbstractClass({
                        $statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/cannot be parsed/);

            });

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class({
                        $extends: 'wtf'
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        $extends: undefined
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        $extends: null
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        $extends: function () {}
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        $extends: Interface({})
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        $extends: Class({})
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return Class({
                        method1: function ($a, b) {}
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return Class({
                        $statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    var $ = function () {};
                    return Class({
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
                    return Class({
                        $statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $finals is not an object', function () {

                expect(function () {
                    return Class({
                        $finals: {
                            $statics: 'wtf'
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: {
                            $statics: undefined
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: {
                            $statics: null
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: {
                            $statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $finals is not an object', function () {

                expect(function () {
                    return Class({
                        $finals: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $finals: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error while defining private method/parameter as $final', function () {

                expect(function () {
                    return Class({
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

                var SomeClass = Class({
                    $finals: {
                        foo: 'bar',
                        someFunction: function () {
                            return this.foo;
                        }
                    }
                });

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        foo: 'wtf'
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        someFunction: function () {}
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        $finals: {
                            foo: 'wtf'
                        }
                    });
                }).to.throwException(/override final/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        $finals: {
                            someFunction: function () {}
                        }
                    });
                }).to.throwException(/override final/);

            });

            it('should throw an error if $constants is not an object', function () {

                expect(function () {
                    return Class({
                        $constants: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $constants: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $constants: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        $constants: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $constants have non primitive types', function () {

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: new Date()
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: function () {}
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: []
                        }
                    });
                }).to.throwException(/primitive type/);

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: false
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: null
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: "SOME"
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $constants: {
                            SOME: 1
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if overriding a constant parameter', function () {

                var SomeClass = Class({
                    $constants: {
                        FOO: 'bar'
                    }
                });

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        $finals: {
                            $statics: {
                                FOO: 'WTF'
                            }
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        $statics: {
                            FOO: 'WTF'
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        $constants: {
                            FOO: 'WTF'
                        }
                    });
                }).to.throwException(/override constant/);

                expect(function () {
                    return Class({
                        $implements: Interface({
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

                var SomeInterface = Interface({});

                expect(function () {
                    return Class({
                        $implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass({
                        $implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class({
                        $implements: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass({
                        $implements: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);

            });

            it('should throw an error if $borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class({
                        $borrows: function () {}
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: undefined
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class({
                        $borrows: null
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class({
                        $borrows: 'wtf'
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: ['wtf']
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [null]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [undefined, undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [null, null]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [function () {}]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: AbstractClass({
                            $abstracts: {
                                some: function () {}
                            }
                        })
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class({
                        $borrows: [AbstractClass({
                            $abstracts: {
                                some: function () {}
                            }
                        })]
                    });
                }).to.throwException(/abstract class with abstract members/);

                expect(function () {
                    return Class({
                        $borrows: Interface({})
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: [Interface({})]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    var SomeClass = Class({});
                    return Class({
                        $borrows: new SomeClass()
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        $borrows: {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $borrows: Class({})
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $borrows: [{}]
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $borrows: [Class({})]
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $borrows: AbstractClass({
                            $abstracts: {}
                        })
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $borrows: [AbstractClass({})]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $borrows contains an inherited class', function () {

                expect(function () {
                    return Class({
                        $borrows: Class({
                            $extends: Class({})
                        })
                    });
                }).to.throwException(/inherited class/);

                expect(function () {
                    return AbstractClass({
                        $borrows: Class({
                            $extends: Class({})
                        })
                    });
                }).to.throwException(/inherited class/);

            });

            it('should throw an error on duplicate $borrows', function () {

                expect(function () {
                    var Mixin = Class({});
                    return Class({
                        $borrows: [Mixin, Mixin]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return Class({
                        $borrows: [undefined, undefined]
                    });
                }).to.not.throwException(/duplicate entries/);
            });

            it('should throw an error if $implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class({
                        $implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class({
                        $implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class({
                        $implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [undefined]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [null]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [undefined, undefined]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [null, null]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: AbstractClass({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [AbstractClass({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: Class({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        $implements: [Class({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        $implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        $implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass({
                        $implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass({
                        $implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        $implements: [undefined]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: [null]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: [undefined, undefined]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: [null, null]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: AbstractClass({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: [AbstractClass({})]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: Class({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        $implements: [Class({})]
                    }).to.throwException(/not a valid interface/);
                });

            });

            it('should throw an error when overriding methods with properties and vice-versa', function () {

                var SomeClass = Class({
                    func: function () {},
                    prop: 'some'
                }),
                    SomeAbstractClass = AbstractClass({
                        $abstracts: {
                            func: function () {}
                        }
                    });

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        func: 'some'
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class({
                        $extends: SomeClass,
                        prop: function () {}
                    });
                }).to.throwException(/with the same name/);

                expect(function () {
                    return Class({
                        $extends: SomeAbstractClass,
                        func: 'some'
                    });
                }).to.throwException(/(with the same name)|(was not found)/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                var Interface1 = Interface({
                    method1: function (a) {}
                }),
                    Interface2 = Interface({
                        method1: function (a) {}
                    }),
                    Interface3 = Interface({
                        method1: function (a, b) {}
                    }),
                    Interface4 = Interface({
                        method1: function (a, $b) {}
                    }),
                    Interface5 = Interface({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface6 = Interface({
                        $statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface7 = Interface({
                        $statics: {
                            method1: function (a, b) {}
                        }
                    }),
                    Interface8 = Interface({
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });

                expect(function () {
                    return Class({
                        $implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: [Interface1, Interface3],
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: Interface4,
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: [Interface1, Interface2],
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $implements: Interface1,
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $implements: Interface1,
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $implements: Interface5,
                        $statics: {
                            method1: function () {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: [Interface5, Interface7],
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: Interface8,
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $implements: [Interface1],
                        $borrows: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
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
                    return Class({
                        $implements: [Interface5, Interface6],
                        $statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $implements: Interface5,
                        $statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $implements: Interface1,
                        $abstracts: {
                            method1: function ($a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $implements: [Interface1, Interface3],
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $implements: Interface8,
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $implements: Interface1,
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        }),
                        $implements: Interface3,
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        }),
                        $implements: Interface3,
                        $borrows: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            $abstracts: {
                                method1: function (a) {}
                            }
                        }),
                        $implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1
                        }),
                        $implements: Interface1,
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        $implements: Interface1,
                        initialize: function (a) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        $implements: Interface1,
                        initialize: function (a, b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        $implements: Interface1,
                        initialize: function (a, $b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        $implements: Interface1,
                        initialize: function (a, $b, $c) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: Class({
                            $extends: Class({
                                initialize: function (a, $b) {}
                            })
                        }),
                        initialize: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: Class({
                            $extends: Class({
                                get: function (a) {}
                            })
                        }),
                        get: function (a, b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: Class({
                            $extends: Class({
                                get: function (a) {}
                            })
                        }),
                        get: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: Class({
                            $extends: Class({
                                get: function (a) {}
                            })
                        }),
                        get: function ($a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: Class({
                            $extends: Class({
                                get: function (a) {}
                            })
                        }),
                        get: function (a, $b) {}
                    });
                }).to.not.throwException();

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass({
                        $abstracts: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if $statics inside $abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: 'wtf'
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: undefined
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: null
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if abstracts does not contain only functions without implementation', function () {

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: 'wtf'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: 'wtf'
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: undefined
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: null
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: function (a) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
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
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: function (b) {
                                }
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
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
                    return AbstractClass({
                        $abstracts: {
                            some: Class({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: AbstractClass({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            some: Interface({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: Class({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: AbstractClass({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                some: Interface({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
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
                    return AbstractClass({
                        $abstracts: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return AbstractClass({
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
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                method1: function () {}
                            }
                        }),
                        $abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    method1: function () {}
                                }
                            }
                        }),
                        $abstracts: {
                            $statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $abstracts: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
                        $abstracts: {
                            $statics: {
                                method1: function (a, b) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $abstracts: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
                        $abstracts: {
                            $statics: {
                                method1: function (a, $b) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        $abstracts: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
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
                    return AbstractClass({
                        some: function () {},
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
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
                    return AbstractClass({
                        $extends: Class({
                            some: function () {}
                        }),
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            some: function () {}
                        }),
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            some: 'foo'
                        }),
                        $abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/defined property/);

                expect(function () {
                    return AbstractClass({
                        $extends: Class({
                            $statics: {
                                some: function () {}
                            }
                        }),
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $statics: {
                                some: function () {}
                            }
                        }),
                        $abstracts: {
                            $statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        $extends: AbstractClass({
                            $statics: {
                                some: 'some'
                            }
                        }),
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
                    var AbstractExample = AbstractClass({
                        $abstracts: {
                            someMethod: function () {},
                            $statics: {
                                someStaticMethod: function () {}
                            }
                        }
                    });
                    return AbstractClass({
                        $extends: AbstractExample
                    });
                }).to.not.throwException();

            });

            it('should not throw an error when specifying binds poiting to abstract methods', function () {

                expect(function () {
                    return AbstractClass({
                        $abstracts: {
                            method1: function () {}.$bound()
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super'],
                    reservedStatic = ['$parent', '$super'],
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

                            return AbstractClass(temp);
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

                            return AbstractClass(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return AbstractClass(obj);
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
                SomeInterface = Interface({        // Simple interface
                    someMethod: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                });
            }

            function createOtherInterface() {
                OtherInterface = Interface({       // Other interface with different methods
                    extraMethod: function () {},
                    $statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }

            function createExtendedInterface() {
                createSomeInterface();
                ExtendedInterface = Interface({    // Interface that extends another
                    $extends: SomeInterface,
                    otherMethod: function () {},
                    $statics: {
                        otherStaticMethod: function () {}
                    }
                });
            }

            function createAbstractClass() {
                SomeAbstractClass = AbstractClass({        // Simple abstract class
                    $implements: SomeInterface
                });
            }

            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass({    // Abstract class that extends another
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
                    return Class({
                        $implements: [SomeInterface]
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class({
                        $implements: [SomeInterface],
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
                        $extends: SomeAbstractClass
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class({
                        $extends: SomeAbstractClass,
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        })
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        })
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        }),
                        _protectedMethod: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        }),
                        $statics: {
                            _protectedMethod: function () {}
                        }
                    });
                }).to.not.throwException();
                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        })
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        })
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                _protectedMethod: function () {}
                            }
                        }),
                        _protectedMethod: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        $extends: AbstractClass({
                            $abstracts: {
                                $statics: {
                                    _protectedMethod: function () {}
                                }
                            }
                        }),
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
                    return Class({
                        $implements: [SomeInterface],
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    return Class({
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
                    return Class({
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
                    return Class({
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
                    return Class({
                        $extends: SomeAbstractClass,
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    return Class({
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
                    return Class({
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
                    return Class({
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

                var reserved = ['$constructor', '$initializing', '$static', '$self', '$super'],
                    reservedStatic = ['$parent', '$super'],
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

                            return Class(temp);
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

                            return Class(temp);
                        };
                    },
                    checkConst = function (key) {
                        return function () {
                            var obj = {$constants: {}};
                            obj.$constants[key] = 'bla';
                            return AbstractClass(obj);
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

                var Mixin1 = Class({
                    $implements: [SomeInterface],
                    someMethod: function () {},
                    $statics: {
                        staticMethod: function () {}
                    }
                }),
                    Mixin2 = {
                        someMethod: function () {},
                        $statics: {
                            staticMethod: function () {}
                        }
                    };

                expect(function () {
                    createSomeInterface();
                    return Class({
                        $implements: [SomeInterface],
                        $borrows: [Mixin1]
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    return Class({
                        $implements: [SomeInterface],
                        $borrows: [Mixin2]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if they define abstract methods', function () {

                expect(function () {
                    return Class({
                        $abstracts: {}
                    });
                }).to.throwException(/has abstract methods/);

                expect(function () {
                    return Class({
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
                    var SomeInterface = Interface({
                        someMethod: function () {}
                    });
                    return new SomeInterface();
                }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Abstract Classes', function () {

            var AbstractExample = AbstractClass({
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

                var SomeClass = Class({}),
                    OtherClass = FinalClass({});

                expect(function () {
                    return SomeClass();
                }).to.throwException(/called as a function/);

                expect(function () {
                    return OtherClass();
                }).to.throwException(/called as a function/);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should throw an error if the constructor is private/protected', function () {

                    var SomeClass = Class({
                        _initialize: function () {}
                    }),
                        OtherClass = Class({
                            __initialize: function () {}
                        });

                    expect(function () {
                        return new SomeClass();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return new OtherClass();
                    }).to.throwException(/access private/);

                });
            }

            it('should not throw an error while invoking the the parent abstract class constructor', function () {

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: AbstractClass({ initialize: function () {} }),
                        initialize: function () {
                            this.$super();
                        }
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: AbstractClass({ initialize: function () {} })
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

            });

            it('should not throw an error while invoking the the parent class protected constructor', function () {

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: AbstractClass({ _initialize: function () {} }),
                        initialize: function () {
                            this.$super();
                        }
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var SomeImplementation = Class({
                            $extends: AbstractClass({ _initialize: function () {} })
                        });
                        return new SomeImplementation();
                    }).to.throwException(/access protected/);
                }

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: Class({ _initialize: function () {} }),
                        initialize: function () {
                            this.$super();
                        }
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var SomeImplementation = Class({
                            $extends: Class({ _initialize: function () {} })
                        });
                        return new SomeImplementation();
                    }).to.throwException(/access protected/);
                }

            });

            it('should throw an error while invoking the parent class private constructor', function () {

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: AbstractClass({ __initialize: function () {} }),
                        initialize: function () {
                            this.$super();
                        }
                    });
                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var SomeImplementation = Class({
                            $extends: AbstractClass({ __initialize: function () {} })
                        });
                        return new SomeImplementation();
                    }).to.throwException(/access private/);
                }

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: Class({ __initialize: function () {} }),
                        initialize: function () {
                            this.$super();
                        }
                    });
                    return new SomeImplementation();
                }).to.throwException(/parent constructor/);

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        var SomeImplementation = Class({
                            $extends: Class({ __initialize: function () {} })
                        });
                        return new SomeImplementation();
                    }).to.throwException(/access private/);
                }

                expect(function () {
                    var SomeImplementation = Class({
                        $extends: Class({ __initialize: function () {} }),
                        initialize: function () {}
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

            });

        });

    });

});
