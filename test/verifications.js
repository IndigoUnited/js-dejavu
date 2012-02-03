/*jslint sloppy:true newcap:true*/
/*global global,define,describe,it*/

define(global.modules, function (Class, AbstractClass, Interface) {

    var expect = global.expect;

    describe('Verifications:', function () {

        describe('Defining an Interface', function () {

            it('should throw an error when using an invalid argument', function () {

                expect(function () {
                    return Interface('some');
                }).to.throwException(TypeError);

            });

            it('should throw an error when extending an invalid interface', function () {

                expect(function () {
                    return Interface({
                        Extends: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: function () {}
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: Class({})
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: Interface({})
                    });
                }).to.not.throwException();

            });

            it('should throw an error when extending a class or abstract class', function () {

                expect(function () {
                    return Interface({
                        Extends: Class({})
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Extends: AbstractClass({})
                    });
                }).to.throwException(TypeError);

            });

            it('should throw an error if Statics is not an object', function () {

                expect(function () {
                    return Interface({
                        Statics: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Statics: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Statics: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Interface({
                        Statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error when using reserved keywords', function () {

                var reserved = ['$constructor', '$initializing'],
                    reservedStatic = ['$class', '$abstract', '$interface', '$binds', '$statics'],
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
                            var obj = { Statics: {} };
                            obj.Statics[key] = 'bla';
                            return Interface(obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(TypeError);
                    expect(checkNormal(reserved[x], true)).to.throwException(TypeError);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(TypeError);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(TypeError);
                }

                expect(function () {
                    return Interface({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException();

                expect(function () {
                    return Interface({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException();

            });

        });

        describe('Defining a Concrete/Abstract Class', function () {

            it('should throw an error when using an invalid argument', function () {

                expect(function () {
                    return Class('some');
                }).to.throwException(TypeError);

                expect(function () {
                    return Class(undefined);
                }).to.throwException(TypeError);

                expect(function () {
                    return Class(null);
                }).to.throwException(TypeError);

            });

            it('should throw an error when extending an invalid class', function () {

                expect(function () {
                    return Class({
                        Extends: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Extends: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Extends: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Extends: function () {}
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Extends: Class({})
                    });
                }).to.not.throwException();

            });

            it('should throw an error when extending an interface', function () {

                expect(function () {
                    var SomeInterface = Interface({});

                    return Class({
                        Extends: SomeInterface
                    });
                }).to.throwException(TypeError);

            });

            it('should throw an error if Statics is not an object', function () {

                expect(function () {
                    return Class({
                        Statics: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Statics: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Statics: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Statics: {}
                    });
                }).to.not.throwException();

            });

            it('should throw an error if Binds is not a string or an array of strings', function () {

                expect(function () {
                    return Class({
                        Binds: {}
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Binds: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Binds: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Binds: [undefined]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Binds: [null]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Binds: [{}, 'method1'],
                        'method1': function () {}
                    });
                }).to.throwException(TypeError);

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
                }).to.throwException();

                expect(function () {
                    return Class({
                        Extends: Class({
                            Binds: ['method1'],
                            method1: function () {}
                        }),
                        Binds: ['method2']
                    });
                }).to.throwException();

            });

            it('should throw an error when specifying duplicate binds', function () {

                expect(function () {
                    return Class({
                        Binds: ['method1', 'method1'],
                        method1: function () {}
                    });
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException(Error);

            });

            it('should throw an error if Borrows is not an object/class or an array of objects/classes', function () {

                expect(function () {
                    return Class({
                        Borrows: function () {}
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: null
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: ['wtf']
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: [undefined]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: [undefined]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: [function () {}]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: AbstractClass({})
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: [AbstractClass({})]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: Interface({})
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return Class({
                        Borrows: [Interface({})]
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    var SomeClass = Class({});
                    return Class({
                        Borrows: new SomeClass()
                    });
                }).to.throwException(TypeError);

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
                }).to.throwException();

            });

            it('should throw an error if Implements is not an Interface or an array of Interfaces', function () {

                expect(function () {
                    return Class({
                        Implements: 'wtf'
                    });
                });

                expect(function () {
                    return Class({
                        Implements: undefined
                    });
                });

                expect(function () {
                    return Class({
                        Implements: null
                    });
                });

                expect(function () {
                    return Class({
                        Implements: ['wtf']
                    });
                });

                expect(function () {
                    return Class({
                        Implements: [undefined]
                    });
                });

                expect(function () {
                    return Class({
                        Implements: [null]
                    });
                });

                expect(function () {
                    return Class({
                        Implements: AbstractClass({})
                    });
                });

                expect(function () {
                    return Class({
                        Implements: [AbstractClass({})]
                    });
                });

                expect(function () {
                    return Class({
                        Implements: Class({})
                    });
                });

                expect(function () {
                    return Class({
                        Implements: [Class({})]
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: 'wtf'
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: undefined
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: null
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: ['wtf']
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [undefined]
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [null]
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: AbstractClass({})
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [AbstractClass({})]
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: Class({})
                    });
                });

                expect(function () {
                    return AbstractClass({
                        Implements: [Class({})]
                    });
                });

            });

        });

        describe('Defining an Abstract Class', function () {

            it('should throw an error if Abstracts is not an object', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: 'wtf'
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: undefined
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: null
                    });
                }).to.throwException(TypeError);

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
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: undefined
                        }
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: null
                        }
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {}
                        }
                    });
                }).to.not.throwException();

            });

            it('should throw an error if all values of Abstracts are not functions', function () {

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            some: 'wtf'
                        }
                    });
                }).to.throwException(TypeError);

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                some: 'wtf'
                            }
                        }
                    });
                }).to.throwException(TypeError);

            });

            it('should throw an error if declared abstract functions in Abstracts are already defined', function () {

                expect(function () {
                    return AbstractClass({
                        some: function () {},
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException();

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
                }).to.throwException();

                expect(function () {
                    return AbstractClass({
                        Extends: Class({
                            some: function () {}
                        }),
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException();

                expect(function () {
                    return AbstractClass({
                        Extends: AbstractClass({
                            some: function () {}
                        }),
                        Abstracts: {
                            some: function () {}
                        }
                    });
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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

            it('should not throw an error when specifying binds poiting abstract methods', function () {

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
                    reservedStatic = ['$class', '$abstract', '$interface', '$binds', '$statics'],
                    x,
                    checkNormal = function (key, inAbstracts) {
                        return function () {
                            var obj = {};
                            obj[key] = 'bla';
                            return AbstractClass(!!inAbstracts ? { Abstracts: obj } : obj);
                        };
                    },
                    checkStatic = function (key, inAbstracts) {
                        return function () {
                            var obj = { Statics: {} };
                            obj.Statics[key] = 'bla';
                            return AbstractClass(!!inAbstracts ? { Abstracts: obj } : obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(TypeError);
                    expect(checkNormal(reserved[x], true)).to.throwException(TypeError);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(TypeError);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(TypeError);
                }

                expect(function () {
                    return AbstractClass({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException();

                expect(function () {
                    return AbstractClass({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException();

                expect(function () {
                    return AbstractClass({
                        Abstracts: {
                            Statics: {
                                hasOwnProperty: function () {}
                            }
                        }
                    });
                }).to.throwException();

            });

        });

        describe('Defining a Concrete Class', function () {

            var SomeInterface,
                OtherInterface,
                ExtendedInterface,
                SomeAbstractClass,
                OtherAbstractClass,
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

            function createOtherAbstractClass() {
                OtherAbstractClass = AbstractClass({    // Other abstract class with different methods
                    extraMethod: function () {},
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
                }).to.throwException();

                expect(function () {
                    createSomeInterface();
                    return Class({
                        Implements: [SomeInterface],
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

                // Abstract Classes
                expect(function () {
                    createAbstractClass();
                    return Class({
                        Extends: SomeAbstractClass
                        // miss all methods
                        // miss all static methods
                    });
                }).to.throwException();

                expect(function () {
                    createAbstractClass();
                    return Class({
                        Extends: SomeAbstractClass,
                        someMethod: function () {}
                        // miss all static methods
                    });
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                }).to.throwException();

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
                    reservedStatic = ['$class', '$abstract', '$interface', '$binds', '$statics'],
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
                            var obj = { Statics: {} };
                            obj.Statics[key] = 'bla';
                            return Class(obj);
                        };
                    };

                for (x = 0; x < reserved.length; x += 1) {
                    expect(checkNormal(reserved[x])).to.throwException(TypeError);
                    expect(checkNormal(reserved[x], true)).to.throwException(TypeError);
                }

                for (x = 0; x < reservedStatic.length; x += 1) {
                    expect(checkStatic(reservedStatic[x])).to.throwException(TypeError);
                    expect(checkStatic(reservedStatic[x], true)).to.throwException(TypeError);
                }

                expect(function () {
                    return Class({
                        hasOwnProperty: function () {}
                    });
                }).to.throwException();

                expect(function () {
                    return Class({
                        Statics: {
                            hasOwnProperty: function () {}
                        }
                    });
                }).to.throwException();

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
                }).to.throwException();

                expect(function () {
                    return Class({
                        Abstracts: {
                            method1: function () {}
                        }
                    });
                }).to.throwException();
            });

        });

        describe('Instantiation of Interfaces', function () {

            it('should throw an error', function () {

                expect(function () {
                    var SomeInterface = Interface({
                        someMethod: function () {}
                    });
                    return new SomeInterface();
                }).to.throwException();

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

                expect(function () { return new AbstractExample(); }).to.throwException();
                expect(function () { AbstractExample.prototype.initialize(); }).to.throwException();
                expect(function () { AbstractExample.prototype.initialize.apply(AbstractExample.prototype, []); }).to.throwException();
                expect(function () { AbstractExample.prototype.initialize.apply(AbstractExample, []); }).to.throwException();

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
