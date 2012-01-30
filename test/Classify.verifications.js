/*jslint sloppy:true nomen:true newcap:true*/
/*global require,describe,it,navigator,document,__dirname,window*/

var requirejs,
    modules = ['Trinity/Classify'],
    expectAlias;

if (!(typeof window !== 'undefined' && navigator && document)) { // Test if we are at command line

    requirejs = require('../vendor/r.js/dist/r.js');

    requirejs.config({
        baseUrl: __dirname,
        paths: {
            'Trinity/Classify': '../dist/Classify'
        },
        nodeRequire: require
    });

    var define = requirejs;
    modules.push('../vendor/expect.js/expect.js');
} else {
    /*jslint undef:true*/
    expectAlias = expect;
    /*jslint undef:false*/
}

define(modules, function (Classify, expect) {

    if (expectAlias) {
        expect = expectAlias;
    }

    describe('Defining an Interface', function () {

        it('should throw an error when using an invalid argument', function () {

            expect(function () {
                return Classify.Interface('some');
            }).to.throwException(TypeError);

        });

        it('should throw an error when extending an invalid interface', function () {

            expect(function () {
                return Classify.Interface({
                    Extends: 'wtf'
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Interface({
                    Extends: function () {}
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Interface({
                    Extends: Classify({})
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Interface({
                    Extends: Classify.Interface({})
                });
            }).to.not.throwException();

        });

        it('should throw an error when extending a class or abstract class', function () {

            expect(function () {
                return Classify.Interface({
                    Extends: Classify({})
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Interface({
                    Extends: Classify.Abstract({})
                });
            }).to.throwException(TypeError);

        });

        it('should throw an error if Statics is not an object', function () {

            expect(function () {
                return Classify.Interface({
                    Statics: 'wtf'
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Interface({
                    Statics: {}
                });
            }).to.not.throwException();

        });
    });

    describe('Defining a Concrete/Abstract Class', function () {

        it('should throw an error when using an invalid argument', function () {

            expect(function () {
                return Classify('some');
            }).to.throwException(TypeError);

        });

        it('should throw an error when extending an invalid class', function () {

            expect(function () {
                return Classify({
                    Extends: 'wtf'
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify({
                    Extends: function () {}
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify({
                    Extends: Classify({})
                });
            }).to.not.throwException();

        });

        it('should throw an error when extending an interface', function () {

            expect(function () {
                var SomeInterface = Classify.Interface({});

                return Classify({
                    Extends: SomeInterface
                });
            }).to.throwException(TypeError);

        });

        it('should throw an error if Statics is not an object', function () {

            expect(function () {
                return Classify({
                    Statics: 'wtf'
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify({
                    Statics: {}
                });
            }).to.not.throwException();

        });

        it('should throw an error if Binds is not an array/string', function () {

            expect(function () {
                return Classify({
                    Binds: {}
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify({
                    Binds: []
                });
            }).to.not.throwException();

            expect(function () {
                return Classify({
                    Binds: ['method1'],
                    'method1': function () {}
                });
            }).to.not.throwException();

        });
    });

    describe('Defining an Abstract Class', function () {

        it('should throw an error if Abstracts is not an object', function () {

            expect(function () {
                return Classify.Abstract({
                    Abstracts: 'wtf'
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Abstract({
                    Abstracts: {}
                });
            }).to.not.throwException();

        });

        it('should throw an error if Statics inside Abstracts is not an object', function () {

            expect(function () {
                return Classify.Abstract({
                    Abstracts: {
                        Statics: 'wtf'
                    }
                });
            }).to.throwException(TypeError);

            expect(function () {
                return Classify.Abstract({
                    Abstracts: {
                        Statics: {}
                    }
                });
            }).to.not.throwException();

        });

        it('should not throw error when implementing an interface while not implementing the methods', function () {

            expect(function () {
                var SomeInterface = Classify.Interface({
                    someMethod: function () {},
                    Statics: {
                        someStaticMethod: function () {}
                    }
                });
                return Classify.Abstract({
                    Implements: [SomeInterface]
                });
            }).to.not.throwException();

        });

        it('should not throw error while extending another abstract class while not implementing the methods', function () {

            expect(function () {
                var AbstractExample = Classify.Abstract({
                    Abstracts: {
                        someMethod: function () {},
                        Statics: {
                            someStaticMethod: function () {}
                        }
                    }
                });
                return Classify.Abstract({
                    Extends: AbstractExample
                });
            }).to.not.throwException();

        });
    });

    describe('Defining a Concrete Class', function () {

        var SomeInterface,
            OtherInterface,
            ExtendedInterface;

        function createSomeInterface() {
            SomeInterface = Classify.Interface({        // Simple interface
                someMethod: function () {},
                Statics: {
                    staticMethod: function () {}
                }
            });
        }

        function createOtherInterface() {
            OtherInterface = Classify.Interface({       // Other interface with different methods
                extraMethod: function () {},
                Statics: {
                    extraStaticMethod: function () {}
                }
            });
        }

        function createExtendedInterface() {
            createSomeInterface();
            ExtendedInterface = Classify.Interface({    // Interface that extends another
                Extends: SomeInterface,
                otherMethod: function () {},
                Statics: {
                    otherStaticMethod: function () {}
                }
            });
        }

        it('should throw error if they are incomplete', function () {

            expect(function () {
                createSomeInterface();
                return Classify({
                    Implements: [SomeInterface]
                    // miss all methods
                    // miss all static methods
                });
            }).to.throwException();

            expect(function () {
                createSomeInterface();
                return Classify({
                    Implements: [SomeInterface],
                    someMethod: function () {}
                    // miss all static methods
                });
            }).to.throwException();

            expect(function () {
                createSomeInterface();
                return Classify({
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
                return Classify({
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
                return Classify({
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
                return Classify({
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
                return Classify({
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
                return Classify({
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
                OtherInterface();
                return Classify({
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
                OtherInterface();
                return Classify({
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
                OtherInterface();
                return Classify({
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
                OtherInterface();
                return Classify({
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
                OtherInterface();
                return Classify({
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
        });

        it('should not throw error when they are complete', function () {

            expect(function () {
                createSomeInterface();
                return Classify({
                    Implements: [SomeInterface],
                    someMethod: function () {},
                    otherMethod: function () {},
                    Statics: {
                        staticMethod: function () {}
                    }
                });
            }).to.not.throwException();

            expect(function () {
                createExtendedInterface();
                return Classify({
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
                return Classify({
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
                return Classify({
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

        });


        it('should throw error if they define abstract methods', function () {

            expect(function () {
                return Classify({
                    Abstracts: {}
                });
            }).to.throwException();

            expect(function () {
                return Classify({
                    Abstracts: {
                        method1: function () {}
                    }
                });
            }).to.throwException();
        });

        it('should throw an error when specifying binds poiting to non existent methods', function () {

            expect(function () {
                return Classify({
                    Binds: ['method4']
                });
            }).to.throwException();

            expect(function () {
                return Classify({
                    Extends: Classify({
                        Binds: ['method1'],
                        method1: function () {}
                    }),
                    Binds: ['method2']
                });
            }).to.throwException();

        });

        it('should throw an error when specifying duplicate binds', function () {

            expect(function () {
                return Classify({
                    Binds: ['method1', 'method1'],
                    method1: function () {}
                });
            }).to.throwException();

        });

        it('should throw an error when binds are also present in the parent class', function () {

            expect(function () {
                return Classify({
                    Extends: Classify({
                        Binds: ['method1'],
                        method1: function () {}
                    }),
                    Binds: ['method1']
                });
            }).to.throwException();

        });

    });

    describe('Instantiation of Interfaces', function () {

        it('should throw an error', function () {

            expect(function () {
                var SomeInterface = Classify.Interface({
                    someMethod: function () {}
                });
                return new SomeInterface();
            }).to.throwException();

        });
    });

    describe('Instantiation of Abstract Classes', function () {

        var AbstractExample = Classify.Abstract({
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

        it('should not throw error while invoking the the parent class constructor', function () {

            expect(function () {
                var SomeImplementation = Classify({
                    Extends: Classify.Abstract({ initialize: function () {} }),
                    initialize: function () {
                        SomeImplementation.Super.initialize.call(this);
                    }
                });
                return new SomeImplementation();
            }).to.not.throwException();

            expect(function () {
                var SomeImplementation = Classify({
                    Extends: Classify.Abstract({ initialize: function () {} })
                });
                return new SomeImplementation();
            }).to.not.throwException();

        });

    });

});
