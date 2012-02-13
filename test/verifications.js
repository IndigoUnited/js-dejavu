/*jslint sloppy:true newcap:true regexp:true*/
/*global global,define,describe,it*/

define(global.modules, function (Class, AbstractClass, Interface) {

    var expect = global.expect;

    // Uncomment the lines bellow to test a modified object prototype
    //Object.prototype.youShouldNotDoThis = function (a, b) {};
    //Object.prototype.youShouldNotDoThisAlso = 'some';
    describe('Verifications:', function () {

        describe('Defining an Interface', function () {

            it('should throw an error when using an invalid argument', function () {

                expect(function () {
                    return Interface('some');
                }).to.throwException(/must be an object/);

            });

            it('should throw an error when defining the initialize method', function () {

                expect(function () {
                    return Interface({
                        initialize: function () {}
                    });
                }).to.throwException(/initialize method/i);

            });

            it('should throw an error when extending an invalid interface', function () {

                expect(function () {
                    return Interface({
                        Extends: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        Extends: undefined
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface({
                        Extends: [undefined, Interface({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        Extends: null
                    });
                }).to.throwException(/nonexistent interface/);

                expect(function () {
                    return Interface({
                        Extends: function () {}
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        Extends: Class({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Interface({
                        Extends: Interface({})
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Extends: [Interface({})]
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
                        Statics: {
                            some: 'property'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        Statics: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        Statics: {
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
                        Statics: {
                            some: function (b) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Statics: {
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
                        some: new Class({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: new AbstractClass({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        some: new Interface({})
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        Statics: {
                            some: new Class({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        Statics: {
                            some: new AbstractClass({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return Interface({
                        Statics: {
                            some: new Interface({})
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
                        Statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Statics: {
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
                        Statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error if Statics is not an object', function () {

                expect(function () {
                    return Interface({
                        Statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        Statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        Statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Interface({
                        Statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing'],
                    reservedStatic = ['$class', '$abstract', '$interface', 'Super'],
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
                            var obj = {Statics: {}};
                            obj.Statics[key] = 'bla';
                            return Interface(obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], true)).to.throwException(/using a reserved keyword/);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(/using a reserved keyword/);
                }

                expect(function () {
                    return Interface({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException(/using a reserved keyword/);

                expect(function () {
                    return Interface({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException(/using a reserved keyword/);

            });

            it('should throw an error when it extends duplicate interfaces', function () {

                expect(function () {
                    var SomeInterface = Interface({});
                    return Interface({
                        Extends: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

            });

            it('should throw an error when it extends multiple ones with duplicate methods', function () {

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                method1: function () {}
                            }),
                            new Interface({
                                method1: function () {}
                            })
                        ]
                    });
                }).to.throwException(/from different parents/);

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                method1: function () {}
                            }),
                            new Interface({
                                method1: function () {}
                            })
                        ],
                        method1: function () {}
                    });
                }).to.throwException(/from different parents/);

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                Statics: {
                                    method1: function () {}
                                }
                            }),
                            new Interface({
                                Statics: {
                                    method1: function () {}
                                }
                            })
                        ]
                    });
                }).to.throwException(/from different parents/);

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                Statics: {
                                    method1: function () {}
                                }
                            }),
                            new Interface({
                                Statics: {
                                    method1: function () {}
                                }
                            })
                        ],
                        Statics: {
                            method1: function () {}
                        }
                    });
                }).to.throwException(/from different parents/);

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                method1: function () {}
                            })
                        ],
                        method1: function () {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Extends: [
                            new Interface({
                                Statics: {
                                    method1: function () {}
                                }
                            })
                        ],
                        Statics: {
                            method1: function () {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            method1: function () {}
                        }),
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            Statics: {
                                method1: function () {}
                            }
                        }),
                        Statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            Statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Statics: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            Statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            method1: function (a, $b) {}
                        }),
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Interface({
                        Extends: Interface({
                            Statics: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

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

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class({
                        Extends: 'wtf'
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        Extends: undefined
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        Extends: null
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        Extends: function () {}
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        Extends: Interface({})
                    });
                }).to.throwException(/is not a valid class/);

                expect(function () {
                    return Class({
                        Extends: Class({})
                    });
                }).to.not.throwException();

            });

            it('should throw an error if Statics is not an object', function () {

                expect(function () {
                    return Class({
                        Statics: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        Statics: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        Statics: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return Class({
                        Statics: {}
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
                        Statics: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error if Binds is not a string or an array of strings', function () {

                expect(function () {
                    return Class({
                        Binds: {}
                    });
                }).to.throwException(/is not a string/);

                expect(function () {
                    return Class({
                        Binds: undefined
                    });
                }).to.throwException(/must be a string or an array of strings/);

                expect(function () {
                    return Class({
                        Binds: null
                    });
                }).to.throwException(/must be a string or an array of strings/);

                expect(function () {
                    return Class({
                        Binds: [undefined]
                    });
                }).to.throwException(/is not a string/);

                expect(function () {
                    return Class({
                        Binds: [null]
                    });
                }).to.throwException(/is not a string/);

                expect(function () {
                    return Class({
                        Binds: [{}, 'method1'],
                        'method1': function () {}
                    });
                }).to.throwException(/is not a string/);

                expect(function () {
                    return Class({
                        Binds: []
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Binds: ['method1'],
                        'method1': function () {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error when specifying binds poiting to non existent methods', function () {

                expect(function () {
                    return Class({
                        Binds: ['method4']
                    });
                }).to.throwException(/does not exist/);

                expect(function () {
                    return Class({
                        Extends: Class({
                            Binds: ['method1'],
                            method1: function () {}
                        }),
                        Binds: ['method2']
                    });
                }).to.throwException(/does not exist/);

            });

            it('should throw an error when specifying duplicate binds', function () {

                expect(function () {
                    return Class({
                        Binds: ['method1', 'method1'],
                        method1: function () {}
                    });
                }).to.throwException(/duplicate entries/);

            });

            it('should throw an error when binds are also present in the parent class', function () {

                expect(function () {
                    return Class({
                        Extends: Class({
                            Binds: ['method1'],
                            method1: function () {}
                        }),
                        Binds: ['method1']
                    });
                }).to.throwException(/already being bound/);

            });

            it('should throw an error when binds are also present in a mixin (Borrows)', function () {

                expect(function () {
                    return Class({
                        Binds: ['method1'],
                        Borrows: Class({
                            Binds: ['method1', 'method2'],
                            method1: function () {
                                this.some = 'test';
                            },
                            method2: function () {
                                this.some = 'test2';
                            }
                        })
                    });
                }).to.throwException(/already being bound/);

            });

            it('should throw an error when specifying duplicate interfaces', function () {

                var SomeInterface = Interface({});

                expect(function () {
                    return Class({
                        Implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);

                expect(function () {
                    return AbstractClass({
                        Implements: [SomeInterface, SomeInterface]
                    });
                }).to.throwException(/duplicate entries/);
            });

            it('should throw an error if Borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class({
                        Borrows: function () {}
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: undefined
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class({
                        Borrows: null
                    });
                }).to.throwException(/a class\/object or an array of classes\/objects/);

                expect(function () {
                    return Class({
                        Borrows: 'wtf'
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: ['wtf']
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: [undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: [undefined]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: [function () {}]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: AbstractClass({})
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: [AbstractClass({})]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: Interface({})
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: [Interface({})]
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    var SomeClass = Class({});
                    return Class({
                        Borrows: new SomeClass()
                    });
                }).to.throwException(/not a valid class\/object/);

                expect(function () {
                    return Class({
                        Borrows: {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Borrows: Class({})
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Borrows: [{}]
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Borrows: [Class({})]
                    });
                }).to.not.throwException();

            });

            it('should throw an error on duplicate Borrows', function () {

                expect(function () {
                    var Mixin = Class({});
                    return Class({
                        Borrows: [Mixin, Mixin]
                    });
                }).to.throwException(/duplicate entries/);

            });

            it('should throw an error if Implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class({
                        Implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class({
                        Implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return Class({
                        Implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: [undefined]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: [null]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: AbstractClass({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: [AbstractClass({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: Class({})
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return Class({
                        Implements: [Class({})]
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        Implements: 'wtf'
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        Implements: undefined
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass({
                        Implements: null
                    });
                }).to.throwException(/an interface or an array of interfaces/);

                expect(function () {
                    return AbstractClass({
                        Implements: ['wtf']
                    });
                }).to.throwException(/not a valid interface/);

                expect(function () {
                    return AbstractClass({
                        Implements: [undefined]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [null]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        Implements: AbstractClass({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [AbstractClass({})]
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        Implements: Class({})
                    }).to.throwException(/not a valid interface/);
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [Class({})]
                    }).to.throwException(/not a valid interface/);
                });

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
                        Statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface6 = Interface({
                        Statics: {
                            method1: function (a) {}
                        }
                    }),
                    Interface7 = Interface({
                        Statics: {
                            method1: function (a, b) {}
                        }
                    }),
                    Interface8 = Interface({
                        Statics: {
                            method1: function (a, $b) {}
                        }
                    });

                expect(function () {
                    return Class({
                        Implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: [Interface1, Interface3],
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: Interface4,
                        method1: function (a) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: [Interface1, Interface2],
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Implements: Interface1,
                        method1: function (a, $b) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Implements: Interface1,
                        method1: function (a, $b, $c) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Implements: Interface5,
                        Statics: {
                            method1: function () {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: [Interface5, Interface7],
                        Statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: Interface8,
                        Statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Implements: [Interface5, Interface6],
                        Statics: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Implements: Interface5,
                        Statics: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Implements: Interface5,
                        Statics: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Implements: Interface1,
                        Abstracts: {
                            method1: function ($a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Implements: [Interface1, Interface3],
                        Abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Implements: Interface8,
                        Abstracts: {
                            Statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Implements: Interface1,
                        Abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            Abstracts: {
                                method1: function (a) {}
                            }
                        }),
                        Implements: Interface3,
                        method1: function (a, b) {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            Abstracts: {
                                method1: function (a) {}
                            }
                        }),
                        Implements: Interface1,
                        method1: function () {}
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1
                        }),
                        Implements: Interface1,
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        Implements: Interface1,
                        initialize: function (a) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        Implements: Interface1,
                        initialize: function (a, b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        Implements: Interface1,
                        initialize: function (a, $b) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

                expect(function () {
                    return Class({
                        Extends: AbstractClass({
                            Implements: Interface1,
                            initialize: function (a, $b) {}
                        }),
                        Implements: Interface1,
                        initialize: function (a, $b, $c) {},
                        method1: function (a) {}
                    });
                }).to.not.throwException();

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if Abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: 'wtf'
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: undefined
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: null
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if Statics inside Abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: 'wtf'
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: undefined
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: null
                        }
                    });
                }).to.throwException(/must be an object/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if abstracts does not contain only functions without implementation', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: 'wtf'
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: undefined
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: null
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: 'wtf'
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: undefined
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: null
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: function (a) {
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
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
                        Abstracts: {
                            Statics: {
                                some: function (b) {
                                }
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
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
                        Abstracts: {
                            some: new Class({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: new AbstractClass({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: new Interface({})
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: new Class({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: new AbstractClass({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: new Interface({})
                            }
                        }
                    });
                }).to.throwException(/not a function/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            method1: function (a) { }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                method1: function (a) { }
                            }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if it any function is not well formed', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            method1: function ($a, b) {}
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                method1: function ($a, b) {}
                            }
                        }
                    });
                }).to.throwException(/contains optional arguments before mandatory ones/);

            });

            it('should throw an error when defining incompatible methods compared to its base signature', function () {

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                method1: function () {}
                            }
                        }),
                        Abstracts: {
                            method1: function (a) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                Statics: {
                                    method1: function () {}
                                }
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                method1: function (a) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Abstracts: {
                            method1: function (a, b) {}
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                Statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                method1: function (a, b) {}
                            }
                        }
                    });
                }).to.throwException(/not compatible with/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Abstracts: {
                            method1: function (a, $b) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                Statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                method1: function (a, $b) {}
                            }
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                method1: function (a, $b) {}
                            }
                        }),
                        Abstracts: {
                            method1: function (a, $b, $c) {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Abstracts: {
                                Statics: {
                                    method1: function (a, $b) {}
                                }
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                method1: function (a, $b, $c) {}
                            }
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if declared abstract functions in Abstracts are already defined', function () {

                expect(function () {
                    return AbstractClass({
                        some: function () {},
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        Statics: {
                            some: function () {}
                        },
                        Abstracts: {
                            Statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        Extends: Class({
                            some: function () {}
                        }),
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            some: function () {}
                        }),
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        Extends: Class({
                            Statics: {
                                some: function () {}
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            Statics: {
                                some: function () {}
                            }
                        }),
                        Abstracts: {
                            Statics: {
                                some: function () {}
                            }
                        }
                    });
                }).to.throwException(/already implemented/);

            });

            it('should not throw an error while extending another abstract class while not implementing its methods', function () {

                expect(function () {
                    var AbstractExample = AbstractClass({
                        Abstracts: {
                            someMethod: function () {},
                            Statics: {
                                someStaticMethod: function () {}
                            }
                        }
                    });
                    return AbstractClass({
                        Extends: AbstractExample
                    });
                }).to.not.throwException();

            });

            it('should not throw an error when specifying binds poiting to abstract methods', function () {

                expect(function () {
                    return AbstractClass({
                        Binds: ['method1'],
                        Abstracts: {
                            method1: function () {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing'],
                    reservedStatic = ['$class', '$abstract', '$interface', 'Super'],
                    x,
                    checkNormal = function (key, inAbstracts) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return AbstractClass(!!inAbstracts ? {Abstracts: obj} : obj);
                        };
                    },
                    checkStatic = function (key, inAbstracts) {
                        return function () {
                            var obj = {Statics: {}};
                            obj.Statics[key] = 'bla';
                            return AbstractClass(!!inAbstracts ? {Abstracts: obj} : obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], true)).to.throwException(/using a reserved keyword/);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(/using a reserved keyword/);
                }

                expect(function () {
                    return AbstractClass({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException(/using a reserved keyword/);

                expect(function () {
                    return AbstractClass({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException(/using a reserved keyword/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException(/using a reserved keyword/);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                hasOwnProperty: function () {}
                            }
                        }
                    });
                }).to.throwException(/using a reserved keyword/);

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
                    Statics: {
                        staticMethod: function () {}
                    }
                });
            }

            function createOtherInterface() {
                OtherInterface = Interface({       // Other interface with different methods
                    extraMethod: function () {},
                    Statics: {
                        extraStaticMethod: function () {}
                    }
                });
            }

            function createExtendedInterface() {
                createSomeInterface();
                ExtendedInterface = Interface({    // Interface that extends another
                    Extends: SomeInterface,
                    otherMethod: function () {},
                    Statics: {
                        otherStaticMethod: function () {}
                    }
                });
            }

            function createAbstractClass() {
                SomeAbstractClass = AbstractClass({         // Simple abstract class
                    Implements: SomeInterface
                });
            }

            function createExtendedAbstractClass() {
                createAbstractClass();
                ExtendedAbstractClass = AbstractClass({    // Abstract class that extends another
                    Extends: SomeAbstractClass,
                    Abstracts: {
                        otherMethod: function () {},
                        Statics: {
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
                        Implements: [SomeInterface]
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        someMethod: function () {},
                        Statics: {
                            weirdStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class({
                        Implements: [ExtendedInterface],
                        otherMethod: function () {},
                        // miss someMethod()
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class({
                        Implements: [ExtendedInterface],
                        someMethod: function () {},
                        // miss someMethod()
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class({
                        Implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            otherStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    return Class({
                        Implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                            // miss otherStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                            // missing extraStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [SomeInterface, OtherInterface],
                        extraMethod: function () {},
                        someMethod: function () {},
                        Statics: {
                            // missing staticMethod()
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [SomeInterface, OtherInterface],
                        extraMethod: function () {},
                        // missing someMethod()
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        // missing extraMethod()
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [ExtendedInterface, OtherInterface],
                        extraMethod: function () {},
                        otherMethod: function () {},
                        someMethod: function () {},
                        Statics: {
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
                        Implements: [ExtendedInterface, OtherInterface],
                        otherMethod: function () {},
                        someMethod: function () {},
                        // missing extraMethod()
                        Statics: {
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
                        Extends: SomeAbstractClass
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class({
                        Extends: SomeAbstractClass,
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    return Class({
                        Extends: SomeAbstractClass,
                        someMethod: function () {},
                        Statics: {
                            weirdStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {

                    createExtendedAbstractClass();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        otherMethod: function () {},
                        // miss someMethod()
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        // miss otherMethod()
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            otherStaticMethod: function () {}
                            // miss staticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                            // miss otherStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: SomeAbstractClass,
                        Implements: [OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                            // missing extraStaticMethod()
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: SomeAbstractClass,
                        Implements: [OtherInterface],
                        extraMethod: function () {},
                        someMethod: function () {},
                        Statics: {
                            // missing staticMethod()
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: SomeAbstractClass,
                        Implements: [OtherInterface],
                        extraMethod: function () {},
                        // missing someMethod()
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: SomeAbstractClass,
                        Implements: [OtherInterface],
                        someMethod: function () {},
                        // missing extraMethod()
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        Implements: [OtherInterface],
                        extraMethod: function () {},
                        otherMethod: function () {},
                        someMethod: function () {},
                        Statics: {
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
                        Extends: ExtendedAbstractClass,
                        Implements: [OtherInterface],
                        otherMethod: function () {},
                        someMethod: function () {},
                        // missing extraMethod()
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.throwException(/was not found/);

            });

            it('should not throw an error when it is complete', function () {

                // Interfaces
                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        someMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    return Class({
                        Implements: [ExtendedInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [SomeInterface, OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedInterface();
                    createOtherInterface();
                    return Class({
                        Implements: [ExtendedInterface, OtherInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
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
                        Extends: SomeAbstractClass,
                        someMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        someMethod: function () {},
                        otherMethod: function () {},
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: SomeAbstractClass,
                        Implements: [OtherInterface],
                        someMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
                            staticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();

                expect(function () {
                    createExtendedAbstractClass();
                    createOtherInterface();
                    return Class({
                        Extends: ExtendedAbstractClass,
                        Implements: [OtherInterface],
                        someMethod: function () {},
                        otherMethod: function () {},
                        extraMethod: function () {},
                        Statics: {
                            staticMethod: function () {},
                            otherStaticMethod: function () {},
                            extraStaticMethod: function () {}
                        }
                    });
                }).to.not.throwException();
            });


            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing'],
                    reservedStatic = ['$class', '$abstract', '$interface', 'Super'],
                    x,
                    checkNormal = function (key) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return Class(obj);
                        };
                    },
                    checkStatic = function (key) {
                        return function () {
                            var obj = {Statics: {}};
                            obj.Statics[key] = 'bla';
                            return Class(obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(/using a reserved keyword/);
                    expect(checkNormal(reserved[x], true)).to.throwException(/using a reserved keyword/);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(/using a reserved keyword/);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(/using a reserved keyword/);
                }

                expect(function () {
                    return Class({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException(/using a reserved keyword/);

                expect(function () {
                    return Class({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException(/using a reserved keyword/);

            });

            it('should not throw an error if they are complete, even using borrowed methods to implement interfaces/abstract classes', function () {

                var Mixin1 = Class({
                    Implements: [SomeInterface],
                    someMethod: function () {},
                    Statics: {
                        staticMethod: function () {}
                    }
                }),
                    Mixin2 = {
                        someMethod: function () {},
                        Statics: {
                            staticMethod: function () {}
                        }
                    };

                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        Borrows: [Mixin1]
                    });
                }).to.not.throwException();

                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        Borrows: [Mixin2]
                    });
                }).to.not.throwException();

            });

            it('should throw an error if they define abstract methods', function () {

                expect(function () {
                    return Class({
                        Abstracts: {}
                    });
                }).to.throwException(/has abstract methods/);

                expect(function () {
                    return Class({
                        Abstracts: {
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
                Abstracts: {
                    abstractMethod: function () {}
                }
            });

            it('should throw an error while using new or its constructor', function () {

                expect(function () { return new AbstractExample(); }).to.throwException(/cannot be instantiated/);
                expect(function () { AbstractExample.prototype.initialize(); }).to.throwException(/cannot be instantiated/);
                expect(function () { AbstractExample.prototype.initialize.apply(AbstractExample.prototype, []); }).to.throwException(/cannot be instantiated/);
                expect(function () { AbstractExample.prototype.initialize.apply(AbstractExample, []); }).to.throwException(/cannot be instantiated/);

            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not throw an error while invoking the the parent class constructor', function () {

                expect(function () {
                    var SomeImplementation = Class({
                        Extends: AbstractClass({initialize: function () {}}),
                        initialize: function () {
                            SomeImplementation.Super.initialize.call(this);
                        }
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

                expect(function () {
                    var SomeImplementation = Class({
                        Extends: AbstractClass({initialize: function () {}})
                    });
                    return new SomeImplementation();
                }).to.not.throwException();

            });

        });

    });

});
