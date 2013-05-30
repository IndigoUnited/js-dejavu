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

    describe('Functional:', function () {

        describe('Instantiation of a simple Class', function () {

            var SomeClass = Class.declare({
                arr: ['foo', 'bar'],
                obj: {
                    foo: 'bar'
                }
            }),
                someObj = {},
                someInstance = new SomeClass(),
                Example = Class.declare({
                    $extends: SomeClass,

                    some: 'property',
                    someOther: null,
                    someDate: new Date(),
                    someClass: SomeClass,
                    someRegExp: /some/ig,
                    options: {
                        option1: 'property',
                        option2: {
                            foo: 'bar'
                        }
                    },
                    someArray: ['some'],
                    initialize: function () {
                        this.someOther = 'property';
                    },
                    method1: function () {
                        this.some = 'test';
                    }.$bound(),
                    method2: function () {
                        this.some = 'test2';
                    }.$bound(),
                    method3: function () {
                        this.some = 'test3';
                    }.$bound(),
                    _method4: function () {
                        this.some = 'test4';
                    }.$bound(),
                    __method5: function () {
                        this.some = 'test5';
                    }.$bound(),
                    method4: function () {
                        return this._method4;
                    },
                    method5: function () {
                        return this.__method5;
                    },
                    test: function () {
                        this.some = 'test';
                        this.options.option1 = 'test';
                        this.options.option2.foo = 'baz';
                        this.someArray.push('other');
                    },
                    $finals: {
                        foo: 'bar',
                        otherClass: SomeClass
                    },
                    $constants: {
                        SOME_CONST: 'const'
                    },
                    $statics: {
                        staticMethod: function () {},
                        staticSome: 'property',
                        staticInstance: someInstance,
                        staticObj: someObj
                    }
                }),
                example = new Example(),
                example2 = new Example();

            it('should return a valid instance', function () {

                expect(instanceOf(example, Example)).to.be.equal(true);
                expect(example).to.be.an('object');

            });

            it('should have 4 methods', function () {

                expect(example.method1).to.be.a('function');
                expect(example.method1).to.not.be.equal(Example.prototype.method1);    // Because it was bound
                expect(example.method2).to.be.a('function');
                expect(example.method2).to.not.be.equal(Example.prototype.method);     // Because it was bound
                expect(example.method3).to.be.a('function');
                expect(example.method3).to.not.be.equal(Example.prototype.method3);    // Because it was bound
                expect(example.test).to.be.a('function');
                expect(example.test).to.be.equal(Example.prototype.test);

            });

            it('should have 3 properties', function () {

                expect(example.some).to.be.equal('property');
                expect(example.some).to.be.equal(Example.prototype.some);
                expect(example.options).to.be.a('object');
                expect(example.options).to.not.be.equal(Example.prototype.options);       // Because it was reseted to be independent
                expect(example.someArray).to.be.an('array');
                expect(example.someArray).to.not.be.equal(Example.prototype.someArray);   // Because it was reseted to be independent

            });

            it('should have 1 static methods, 1 static property and 1 constant', function () {

                expect(Example.staticMethod).to.be.a('function');
                expect(Example).to.have.property('staticMethod');
                expect(Example.staticSome).to.be.equal('property');
                expect(Example).to.have.property('staticSome');
                expect(Example.SOME_CONST).to.be.equal('const');
                expect(Example).to.have.property('SOME_CONST');

            });

            it('should have run the initialize method', function () {

                expect(example.someOther).to.be.equal('property');

            });

            it('should not have the $statics property', function () {

                expect(example.$statics).to.be.equal(undefined);
                expect(Example.prototype.$statics).to.be.equal(undefined);
                expect(Example.$statics).to.be.equal(undefined);

            });

            it('should not have the $finals property', function () {

                expect(example.$finals).to.be.equal(undefined);
                expect(Example.prototype.$finals).to.be.equal(undefined);
                expect(Example.$finals).to.be.equal(undefined);

            });

            it('should not have the $constants property', function () {

                expect(example.$constants).to.be.equal(undefined);
                expect(Example.prototype.$constants).to.be.equal(undefined);
                expect(Example.$constants).to.be.equal(undefined);

            });

            it('should not share properties with other instances', function () {

                example2.test();

                expect(example2.some).to.be.equal('test');
                expect(example.some).to.be.equal('property');
                expect(example2.options.option1).to.be.equal('test');
                expect(example.options.option1).to.be.equal('property');
                expect(example2.options.option2.foo).to.be.equal('baz');
                expect(example.options.option2.foo).to.be.equal('bar');
                expect(example2.someArray.length).to.be.equal(2);
                expect(example.someArray.length).to.be.equal(1);
                expect(example.someDate).to.not.be.equal(example2.someDate);

                expect(example.someClass).to.be.equal(example2.someClass);
                expect(example.otherClass).to.be.equal(example2.otherClass);

                expect(example.someRegExp).to.not.be.equal(example2.someRegExp);
                expect(example.someRegExp.toString()).to.be.equal(example2.someRegExp.toString());

            });

            it('should not clone static properties', function () {

                expect(Example.staticInstance === someInstance).to.be.equal(true);
                expect(Example.staticObj === someObj).to.be.equal(true);

            });

            it('should have bound the methods into the instance context', function () {

                example.method1.call(this);
                expect(example.some).to.be.equal('test');
                example.method2.apply(this, arguments);

                expect(example.some).to.be.equal('test2');
                example.method3();
                expect(example.some).to.be.equal('test3');
                example2.method1.call(this);
                expect(example2.some).to.be.equal('test');
                example2.method2.apply(this);
                expect(example2.some).to.be.equal('test2');
                example2.method3();
                expect(example2.some).to.be.equal('test3');
                example2.method4().call(this);
                expect(example2.some).to.be.equal('test4');
                example2.method5().call(this);
                expect(example2.some).to.be.equal('test5');

            });

        });

        describe('Instantiation of a simple inheritance setup', function () {

            var Person = Class.declare({
                status: null,
                initialize: function () {
                    this.status = 'alive';
                }
            }),
                Andre = Class.declare({
                    $extends: Person,
                    $name: 'André'
                }),
                SuperAndre = Class.declare({
                    $extends: Andre,
                    $name: 'SuperAndre'
                }),
                PersonAbstract = AbstractClass.declare({
                    status: null,
                    initialize: function () {
                        this.status = 'alive';
                    }
                }),
                AndreAbstract = AbstractClass.declare({
                    $extends: PersonAbstract,
                    $name: 'André'
                }),
                SuperAndre2 = Class.declare({
                    $extends: AndreAbstract,
                    $name: 'SuperAndre'
                }),
                ProtectedPerson = Class.declare({
                    status: null,
                    _initialize: function () {
                        this.status = 'alive';
                    }
                }),
                PrivatePerson = Class.declare({
                    __initialize: function () {}
                }),
                FreakPerson = Class.declare({
                    $extends: ProtectedPerson
                }),
                NerdPerson = Class.declare({
                    $extends: PrivatePerson
                }),
                ComplexProtectedPerson = ProtectedPerson.extend({
                    $name: 'ComplexProtectedPerson',
                    initialize: function () {
                        this.$super();
                    }
                });

            it('should invoke the parent constructor automatically if no constructor was defined', function () {

                var andre = new Andre(),
                    superAndre = new SuperAndre(),
                    superAndre2 = new SuperAndre2();

                expect(andre.status).to.be.equal('alive');
                expect(superAndre.status).to.be.equal('alive');
                expect(superAndre2.status).to.be.equal('alive');

            });

            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should throw an error if inheriting from a private/protected constructor', function () {

                    expect(function () {
                        return new NerdPerson();
                    }).to.throwException(/is private/);

                });

                it('should throw an error if inheriting from a private/protected constructor', function () {

                    expect(function () {
                        return new FreakPerson();
                    }).to.throwException(/is protected/);

                });
            }

            it('should run the parent constructor even if it\'s defined as protected', function () {

                var person = new ComplexProtectedPerson();

                expect(person.status).to.be.equal('alive');

            });


            it('should work with .extend()', function () {

                var person = new ComplexProtectedPerson();
                expect(person).to.be.an(ComplexProtectedPerson);
                expect(person).to.be.an(ProtectedPerson);

            });

            it('should run the parent constructor even if it\'s defined as protected', function () {

                var person = new ComplexProtectedPerson();

                expect(person.status).to.be.equal('alive');

            });

        });

        describe('Instantiation of a simple vanilla inheritance setup', function () {

            var Person = function () {
                this.status = 'alive';
                this._name = 'Cruz';
            },
                Person2 = function () {
                    this.status = 'alive';
                    this._name = 'Cruz';
                },
                Andre,
                SuperAndre,
                Mario,
                Helena,
                Marco;

            Person.prototype.getName = function () {
                return this._name;
            },

            Person2.prototype.getName = function () {
                return this._name;
            },

            Person2.prototype.initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype._initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype.__initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype._what = function () {};
            Person2.prototype.__hmm = function () {};
            Andre = Class.declare({
                $extends: Person,
                $name: 'André',
                getName: function () {
                    return 'André ' + this.$super();
                }
            });

            SuperAndre = Class.declare({
                $extends: Andre,
                $name: 'SuperAndre'
            }),

            Mario = Class.declare({
                $extends: Person,
                initialize: function () {
                    this.$super();
                }
            }),

            Helena = Class.declare({
                $extends: Person2,
                initialize: function () {
                    this.$super();
                    this._name = 'Ribau';
                },
                getName: function () {
                    return 'Helena ' + this.$super();
                },
                _walk: function () {},
                __run: function () {},

                _what: function () { return 'what'; },
                __hmm: function () { return 'hmm'; }
            });

            Marco = Class.declare({
                $extends: Person2,
                initialize: function () {
                    this.$super();
                    this._name = 'Oliveira';
                },
                getName: function () {
                    return 'Marco ' + this.$super();
                },

                _what: function () { return 'what'; },
                __hmm: function () { return 'hmm'; }
            });

            it('should invoke the parent constructor automatically if no constructor was defined', function () {

                var andre = new Andre(),
                    superAndre = new SuperAndre(),
                    mario = new Mario(),
                    helena = new Helena();

                expect(andre.status).to.be.equal('alive');
                expect(superAndre.status).to.be.equal('alive');
                expect(mario.status).to.be.equal('alive');
                expect(helena.status).to.be.equal('alive');

                expect(andre.$bind).to.be.ok();
                expect(andre.$static).to.be.ok();
                expect(superAndre.$bind).to.be.ok();
                expect(superAndre.$static).to.be.ok();
                expect(mario.$bind).to.be.ok();
                expect(mario.$static).to.be.ok();
                expect(helena.$bind).to.be.ok();
                expect(helena.$static).to.be.ok();

            });

            it('should not delete _initialize and __initialize methods', function () {

                var helena = new Helena();

                expect(helena._initialize).to.be.a('function');
                expect(helena.__initialize).to.be.a('function');

            });

            it('should work with $super', function () {

                var helena = new Helena(),
                    andre = new Andre();

                expect(helena.getName()).to.be.equal('Helena Ribau');
                expect(andre.getName()).to.be.equal('André Cruz');

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not protect the vanilla class methods', function () {

                    var helena = new Helena(),
                        marco = new Marco();

                    expect(function () {
                        return helena._what();
                    }).to.not.throwException();

                    expect(function () {
                        return helena.__hmm();
                    }).to.not.throwException();

                    expect(function () {
                        return helena._walk();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return helena.__run();
                    }).to.throwException(/access private/);

                    expect(function () {
                        return marco._what();
                    }).to.not.throwException();

                    expect(function () {
                        return marco.__hmm();
                    }).to.not.throwException();

                    expect(marco._what()).to.equal('what');
                    expect(marco.__hmm()).to.equal('hmm');

                });

            }

        });

        describe('$super()', function () {

            var SomeClass = Class.declare({
                _firstName: null,
                initialize: function () {
                    this._firstName = 'andre';
                },
                getFullName: function () {
                    return this._firstName;
                },
                $statics: {
                    _fruit: 'potato',
                    getFruit: function () {
                        return this._fruit;
                    }
                }
            }),
                OtherClass = Class.declare({
                    $extends: SomeClass,
                    _lastName: null,
                    initialize: function () {
                        this.$super();
                        this._lastName = 'cruz';
                    },
                    getFullName: function () {
                        return this.$super() + ' ' + this._lastName;
                    },
                    $statics: {
                        getFruit: function () {
                            return 'hot ' + this.$super();
                        }
                    }
                }),
                HiClass = Class.declare({
                    $extends: OtherClass,
                    getFullName: function () {
                        return 'hi ' + this.$super();
                    },
                    $statics: {
                        getFruit: function () {
                            return 'hi ' + this.$super();
                        }
                    }
                });

            it('should call the parent method', function () {

                expect(new OtherClass().getFullName()).to.be.equal('andre cruz');
                expect(new HiClass().getFullName()).to.be.equal('hi andre cruz');

            });

            it('should work the same way with static methods', function () {

                expect(OtherClass.getFruit()).to.be.equal('hot potato');
                expect(HiClass.getFruit()).to.be.equal('hi hot potato');

            });

        });

        describe('$self', function () {

            var SomeClass = Class.declare({
                $name: 'SomeClass',
                initialize: function () {
                    this.$self._fruit = 'orange';
                },
                getFruit: function () {
                    return this.$self.getFruitStatic();
                },
                $statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    },
                    setFruitStatic: function (fruit) {
                        this.$self._fruit = fruit;
                    }
                }
            }),
                OtherClass = Class.declare({
                    $extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$self.getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        }
                    }
                });

            it('should give access to the static layer of itself', function () {

                expect((new SomeClass()).getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect((new OtherClass()).getFruit()).to.be.equal('potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');

                OtherClass.setFruitStatic('carrot');
                expect(SomeClass.getFruitStatic()).to.be.equal('carrot');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');

                SomeClass.setFruitStatic('carrot');

            });

        });

        describe('$static', function () {

            var SomeClass = Class.declare({
                initialize: function () {
                    this.$static._fruit = 'orange';
                },
                getFruit: function () {
                    return this.$static.getFruitStatic();
                },
                $statics: {
                    _fruit: 'potato',
                    getFruitStatic: function () {
                        return this._fruit;
                    },
                    setFruitStatic: function (fruit) {
                        this._fruit = fruit;
                    },
                    setFruitStatic2: function (fruit) {
                        this.$static._fruit = fruit;
                    }
                }
            }),
                OtherClass = Class.declare({
                    $extends: SomeClass,
                    initialize: function () {
                        this.$super();
                    },
                    getFruit: function () {
                        return this.$static.getFruitStatic();
                    },
                    $statics: {
                        _fruit: 'potato',
                        getFruitStatic: function () {
                            return this._fruit;
                        }
                    }
                });

            it('should give access the static layer of itself (using late binding)', function () {

                expect(new SomeClass().getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(new OtherClass().getFruit()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('orange');

                OtherClass.setFruitStatic('carrot');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('carrot');

                OtherClass.setFruitStatic2('banana');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(OtherClass.getFruitStatic()).to.be.equal('banana');

                SomeClass.setFruitStatic('carrot');

            });

        });

        describe('$locked', function () {
            afterEach(function () {
                options.locked = true;
            });

            it('should have it removed', function () {

                var SomeClass = Class.declare({
                    $locked: false
                }),
                    someClass = new SomeClass();

                expect(someClass.$locked).to.be.equal(undefined);
                expect(SomeClass.prototype.$locked).to.be.equal(undefined);
                expect(SomeClass.$locked).to.be.equal(undefined);

            });

            if (/strict/.test(global.build) && (Object.seal || Object.freeze)) {

                it('should not lock classes if it\'s false', function () {

                    var SomeClass = Class.declare({
                        $locked: false,

                        test: function () {},
                        testProp: null,

                        $statics: {
                            testStatic: function () {},
                            testStaticProp: null
                        }
                    }),
                        someClass = new SomeClass(),
                        someFunc = function () {};

                    SomeClass.foo = 'bar';
                    SomeClass.prototype.foo = 'bar';
                    someClass.bar = 'foo';

                    expect(SomeClass.foo).to.equal('bar');
                    expect(SomeClass.prototype.foo).to.equal('bar');

                    expect(someClass.bar).to.equal('foo');

                    someClass.test = someFunc;
                    someClass.testProp = 'foo';
                    expect(someClass.test).to.equal(someFunc);
                    expect(someClass.testProp).to.equal('foo');

                    SomeClass.testStatic = someFunc;
                    SomeClass.testStaticProp = 'foo';
                    expect(SomeClass.testStatic).to.equal(someFunc);
                    expect(SomeClass.testStaticProp).to.equal('foo');
                });

                it('should lock classes if it\'s true', function () {

                    var SomeClass = Class.declare({
                        $locked: true,

                        test: function () {},

                        $statics: {
                            staticFunc: function () {}
                        }
                    }),
                        someClass = new SomeClass();

                    expect(function () {
                        SomeClass.foo = 'bar';
                        if (!SomeClass.foo) {
                            throw new Error('not extensible');
                        }
                    }).to.throwException(/(not extensible|invalid assignment|attempted to assign to readonly)/i); // Opera reports "Invalid assignment in strict mode", wtf?
                                                                                                                  // Safari reports "Attempted to assign to readonly property", wtf?

                    expect(function () {
                        SomeClass.prototype.foo = 'bar';
                        if (!SomeClass.prototype.foo) {
                            throw new Error('not extensible');
                        }
                    }).to.throwException(/(not extensible|invalid assignment|attempted to assign to readonly)/i);

                    expect(function () {
                        someClass.bar = 'foo';
                        if (!someClass.bar) {
                            throw new Error('not extensible');
                        }
                    }).to.throwException(/(not extensible|invalid assignment|attempted to assign to readonly)/i);

                    expect(function () {
                        someClass.test = function () {};
                    }).to.throwException(/(cannot set|not extensible|invalid assignment|attempted to assign to readonly)/i);

                    expect(function () {
                        SomeClass.staticFunc = function () {};
                    }).to.throwException(/(cannot set|not extensible|invalid assignment|attempted to assign to readonly)/i);

                });

                it('should read the default value', function () {

                    var SomeClass = Class.declare({}),
                        OtherClass;

                    options.locked = false;

                    OtherClass = Class.declare({});

                    expect(function () {
                        SomeClass.foo = 'bar';
                        if (!SomeClass.foo) {
                            throw new Error('not extensible');
                        }
                    }).to.throwException(/(not extensible|invalid assignment|attempted to assign to readonly)/i);

                    OtherClass.foo = 'bar';

                    expect(OtherClass.foo).to.equal('bar');

                });

                it('should throw an error when $locked is true but it must be false (due to borrowing or extending from a vanilla class)', function () {

                    var SomeClass = function () {};

                    // Tests bellow are duplicated on purpose
                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                    expect(function () {
                        return Class.declare({
                            $borrows: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                    expect(function () {
                        return Class.declare({
                            $borrows: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                });

                it('should be inherited and once unlocked it can\'t be locked', function () {

                    var SomeClass = function () {},
                        OtherClass = Class.declare({ $locked: false }),
                        SomeSubClass,
                        OtherSubClass,
                        someSubClass,
                        otherSubClass;

                    SomeSubClass = Class.declare({ $extends: SomeClass });
                    OtherSubClass = Class.declare({ $extends: OtherClass });

                    someSubClass = new SomeSubClass();
                    otherSubClass = new OtherSubClass();

                    options.locked = false;

                    someSubClass.foo = 'bar';
                    someSubClass._foo2 = 'bar';
                    someSubClass.__foo3 = 'bar';

                    otherSubClass.foo = 'bar';
                    otherSubClass._foo2 = 'bar';
                    otherSubClass.__foo3 = 'bar';

                    expect(someSubClass.foo).to.equal('bar');
                    expect(someSubClass._foo2).to.equal('bar');
                    expect(someSubClass.__foo3).to.equal('bar');

                    expect(someSubClass.foo).to.equal('bar');
                    expect(someSubClass._foo2).to.equal('bar');
                    expect(someSubClass.__foo3).to.equal('bar');

                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                    expect(function () {
                        return Class.declare({
                            $extends: OtherClass,
                            $locked: true
                        });
                    }).to.throwException(/cannot be locked/);

                });

                it('$super should use parent prototypes methods, even when modified, when unlocked', function () {

                    var Person = Class.declare({
                        $name: 'Person',
                        $locked: false,
                        speak: function () {
                            return 'hi';
                        },
                        _run: function () {
                            return 'running';
                        }
                    }),
                        Engineer = Class.declare({
                            $name: 'Engineer',
                            $extends: Person,
                            $locked: false,
                            speak: function () {
                                return this.$super() + ' there';
                            },
                            foo: function () {
                                return this._run();
                            },
                            _run: function () {
                                return 'i am ' + this.$super();
                            }
                        }),
                        engineer;

                    engineer = new Engineer();

                    Person.prototype.speak = function () {
                        return 'hello';
                    };
                    Person.prototype._run = function () {
                        return 'flying';
                    };

                    expect(engineer.speak()).to.be.equal('hello there');
                    expect(engineer.foo()).to.be.equal('i am flying');

                });

                it('$super should not use parent prototypes methods, when locked', function () {

                    var Person = Class.declare({
                        $name: 'Person',
                        speak: function () {
                            return 'hi';
                        }
                    }),
                        Engineer = Class.declare({
                            $name: 'Engineer',
                            $extends: Person,
                            speak: function () {
                                return this.$super() + ' there';
                            }
                        }),
                        engineer;

                    engineer = new Engineer();

                    Person.prototype.speak = function () {
                        return 'hello';
                    };

                    expect(engineer.speak()).to.be.equal('hi there');

                });

            }

        });

        describe('$member', function () {

            var SomeClass = Class.declare({
                    otherSimpleMethod: function () {
                        var that = this,
                            func = this.$member(function () {
                                return that._protectedProperty;
                            });

                        return func;
                    },
                    someMethod: function () {
                        var that = this,
                            func = function () {
                                that._protectedProperty = 'dummy';
                                that.__privateProperty = 'dummy',
                                that._protectedMethod();
                                that.__privateMethod();
                            }.$member();

                        func();
                    },
                    getProtectedProperty: function () {
                        return this._protectedProperty;
                    },
                    getPrivateProperty: function () {
                        return this.__privateProperty;
                    },
                    _protectedProperty: 'some',
                    __privateProperty: 'other',
                    _protectedMethod: function () {},
                    __privateMethod: function () {},

                    $statics: {
                        otherSimpleMethodStatic: function () {
                            var that = this,
                                func = this.$member(function () {
                                    return that._protectedPropertyStatic;
                                });

                            return func;
                        },
                        someMethodStatic: function () {
                            var that = this,
                                func = function () {
                                    that._protectedPropertyStatic = 'dummy';
                                    that.__privatePropertyStatic = 'dummy',
                                    that._protectedMethodStatic();
                                    that.__privateMethodStatic();
                                }.$member();

                            func();
                        },
                        getProtectedPropertyStatic: function () {
                            return this._protectedPropertyStatic;
                        },
                        getPrivatePropertyStatic: function () {
                            return this.__privatePropertyStatic;
                        },
                        _protectedPropertyStatic: 'some',
                        __privatePropertyStatic: 'other',
                        _protectedMethodStatic: function () {},
                        __privateMethodStatic: function () {}
                    }
                }),
                someClass = new SomeClass();

            if (/strict/.test(global.build)) {
                it('should throw error if called outside an instance/class', function () {

                    expect(function () {
                        return function () {}.$member();
                    }).to.throwException(/outside an/);

                });

                it('should throw error if the marked twice', function () {

                    expect(function () {
                        var SomeClass = Class.declare({
                            bla: function () {
                                return function () {}.$member().$member();
                            }
                        }),
                            someClass = new SomeClass();

                        someClass.bla();
                    }).to.throwException(/already marked/);

                });
            }

            it('should have access to private/protected members', function () {

                expect(function () {
                    someClass.someMethod();
                }).to.not.throwException();

                expect(function () {
                    someClass.otherSimpleMethod()();
                }).to.not.throwException();

                expect(someClass.getProtectedProperty()).to.equal('dummy');
                expect(someClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    SomeClass.someMethodStatic();
                }).to.not.throwException();

                expect(function () {
                    SomeClass.otherSimpleMethodStatic()();
                }).to.not.throwException();

                expect(SomeClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(SomeClass.getPrivatePropertyStatic()).to.equal('dummy');
            });

        });

        describe('$bind', function () {

            var context = {},
                SomeClass = Class.declare({
                    simpleMethod: function () {
                        var func = this.$bind(function () {
                            return this;
                        });

                        return func.call(context);
                    },
                    otherSimpleMethod: function () {
                        var func = this.$bind(function () {
                            return this._protectedProperty;
                        });

                        return func;
                    },
                    boundTwice: function () {
                        var func = function () {
                            return this;
                        }.$bind(this).$bind(context);

                        return func.call({});
                    },
                    boundOfNamed: function () {
                        return this.$bind(this.simpleMethod);
                    },
                    someMethod: function () {
                        var func = this.$bind(function () {
                            this._protectedProperty = 'dummy';
                            this.__privateProperty = 'dummy',
                            this._protectedMethod();
                            this.__privateMethod();
                        });

                        func.call(context);
                    },
                    someMethod2: function () {
                        var func = function (x) {
                            return x;
                        }.$bind(this, 'foo');

                        return func.call(context);
                    },
                    getProtectedProperty: function () {
                        return this._protectedProperty;
                    },
                    getPrivateProperty: function () {
                        return this.__privateProperty;
                    },
                    _protectedProperty: 'some',
                    __privateProperty: 'other',
                    _protectedMethod: function () {},
                    __privateMethod: function () {},

                    $statics: {
                        simpleMethodStatic: function () {
                            var func = this.$bind(function () {
                                return this;
                            });

                            return func.call(context);
                        },
                        otherSimpleMethodStatic: function () {
                            var func = this.$bind(function () {
                                return this._protectedPropertyStatic;
                            });

                            return func;
                        },
                        someMethodStatic: function () {
                            var func = this.$bind(function () {
                                this._protectedPropertyStatic = 'dummy';
                                this.__privatePropertyStatic = 'dummy',
                                this._protectedMethodStatic();
                                this.__privateMethodStatic();
                            });

                            func.call(context);
                        },
                        someMethod2Static: function () {
                            var func = function (x) {
                                return x;
                            }.$bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedPropertyStatic: function () {
                            return this._protectedPropertyStatic;
                        },
                        getPrivatePropertyStatic: function () {
                            return this.__privatePropertyStatic;
                        },
                        _protectedPropertyStatic: 'some',
                        __privatePropertyStatic: 'other',
                        _protectedMethodStatic: function () {},
                        __privateMethodStatic: function () {}
                    }
                }),
                someClass = new SomeClass(),
                ReplicaClass = Class.declare({
                    retMethod: function () {
                        return this;
                    },
                    simpleMethod: function () {
                        var func = function () {
                            return this;
                        }.$bind(this);

                        return func.call(context);
                    },
                    boundTwice: function () {
                        var func = function () {
                            return this;
                        }.$bind(this).$bind(context);

                        return func.call({});
                    },
                    boundOfNamed: function () {
                        return this.$bind(this.simpleMethod);
                    },
                    someMethod: function () {
                        var func = function () {
                            this._protectedProperty = 'dummy';
                            this.__privateProperty = 'dummy',
                            this._protectedMethod();
                            this.__privateMethod();
                        }.$bind(this);

                        func.call(context);
                    },
                    someMethod2: function () {
                        var func = function (x) {
                            return x;
                        }.$bind(this, 'foo');

                        return func.call(context);
                    },
                    getProtectedProperty: function () {
                        return this._protectedProperty;
                    },
                    getPrivateProperty: function () {
                        return this.__privateProperty;
                    },
                    _protectedProperty: 'some',
                    __privateProperty: 'other',
                    _protectedMethod: function () {},
                    __privateMethod: function () {},

                    $statics: {
                        simpleMethodStatic: function () {
                            var func = function () {
                                return this;
                            }.$bind(this);

                            return func.call(context);
                        },
                        someMethodStatic: function () {
                            var func = function () {
                                this._protectedPropertyStatic = 'dummy';
                                this.__privatePropertyStatic = 'dummy',
                                this._protectedMethodStatic();
                                this.__privateMethodStatic();
                            }.$bind(this);

                            func.call(context);
                        },
                        someMethod2Static: function () {
                            var func = function (x) {
                                return x;
                            }.$bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedPropertyStatic: function () {
                            return this._protectedPropertyStatic;
                        },
                        getPrivatePropertyStatic: function () {
                            return this.__privatePropertyStatic;
                        },
                        _protectedPropertyStatic: 'some',
                        __privatePropertyStatic: 'other',
                        _protectedMethodStatic: function () {},
                        __privateMethodStatic: function () {}
                    }
                }),
                replicaClass = new ReplicaClass();

            it('should work outside classes', function () {

                expect((function () {
                    return this;
                }.$bind(context)())).to.equal(context);

            });

            it('should work with named functions', function () {

                expect(function () {
                    someClass.boundOfNamed();
                }).to.not.throwException();

                expect(function () {
                    replicaClass.boundOfNamed();
                }).to.not.throwException();

                var someObj = {};
                someObj.callback = replicaClass.retMethod.$bind(replicaClass);

                expect(someObj.callback.call({})).to.be.equal(replicaClass);
                expect(someObj.callback.call(null)).to.be.equal(replicaClass);
            });

            it('should work if double bound', function () {

                expect(someClass.boundTwice()).to.equal(someClass);
                expect(replicaClass.boundTwice()).to.equal(replicaClass);

            });

            it('should have access to the right context', function () {

                expect(someClass.simpleMethod()).to.equal(someClass);
                expect(SomeClass.simpleMethodStatic()).to.equal(SomeClass);

                expect(replicaClass.simpleMethod()).to.equal(replicaClass);
                expect(ReplicaClass.simpleMethodStatic()).to.equal(ReplicaClass);

            });

            it('should curl the parameters', function () {

                expect(someClass.someMethod2()).to.equal('foo');
                expect(SomeClass.someMethod2Static()).to.equal('foo');

                expect(replicaClass.someMethod2()).to.equal('foo');
                expect(ReplicaClass.someMethod2Static()).to.equal('foo');

            });

            it('should have access to private/protected members', function () {

                expect(function () {
                    someClass.someMethod();
                }).to.not.throwException();

                expect(function () {
                    someClass.otherSimpleMethod()();
                }).to.not.throwException();

                expect(someClass.getProtectedProperty()).to.equal('dummy');
                expect(someClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    SomeClass.someMethodStatic();
                }).to.not.throwException();

                expect(function () {
                    SomeClass.otherSimpleMethodStatic()();
                }).to.not.throwException();

                expect(SomeClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(SomeClass.getPrivatePropertyStatic()).to.equal('dummy');

                expect(function () {
                    replicaClass.someMethod();
                }).to.not.throwException();

                expect(replicaClass.getProtectedProperty()).to.equal('dummy');
                expect(replicaClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    ReplicaClass.someMethodStatic();
                }).to.not.throwException();

                expect(ReplicaClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(ReplicaClass.getPrivatePropertyStatic()).to.equal('dummy');

            });

        });

        describe('$member + bind', function () {

            var context = {},
                SomeClass = Class.declare({
                    simpleMethod: function () {
                        var func = this.$member(function () {
                            return this;
                        }.bind(this));

                        return func.call(context);
                    },
                    otherSimpleMethod: function () {
                        var func = this.$member(function () {
                            return this._protectedProperty;
                        }.bind(this));

                        return func;
                    },
                    boundTwice: function () {
                        var func = function () {
                            return this;
                        }.$member().bind(this).bind(context);

                        return func.call({});
                    },
                    boundOfNamed: function () {
                        return this.simpleMethod.$member().bind(this);
                    },
                    someMethod: function () {
                        var func = this.$member(function () {
                            this._protectedProperty = 'dummy';
                            this.__privateProperty = 'dummy',
                            this._protectedMethod();
                            this.__privateMethod();
                        }.bind(this));

                        func.call(context);
                    },
                    someMethod2: function () {
                        var func = function (x) {
                            return x;
                        }.$member().bind(this, 'foo');

                        return func.call(context);
                    },
                    getProtectedProperty: function () {
                        return this._protectedProperty;
                    },
                    getPrivateProperty: function () {
                        return this.__privateProperty;
                    },
                    _protectedProperty: 'some',
                    __privateProperty: 'other',
                    _protectedMethod: function () {},
                    __privateMethod: function () {},

                    $statics: {
                        simpleMethodStatic: function () {
                            var func = this.$member(function () {
                                return this;
                            }.bind(this));

                            return func.call(context);
                        },
                        otherSimpleMethodStatic: function () {
                            var func = this.$member(function () {
                                return this._protectedPropertyStatic;
                            }.bind(this));

                            return func;
                        },
                        someMethodStatic: function () {
                            var func = this.$member(function () {
                                this._protectedPropertyStatic = 'dummy';
                                this.__privatePropertyStatic = 'dummy',
                                this._protectedMethodStatic();
                                this.__privateMethodStatic();
                            }.bind(this));

                            func.call(context);
                        },
                        someMethod2Static: function () {
                            var func = function (x) {
                                return x;
                            }.$member().bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedPropertyStatic: function () {
                            return this._protectedPropertyStatic;
                        },
                        getPrivatePropertyStatic: function () {
                            return this.__privatePropertyStatic;
                        },
                        _protectedPropertyStatic: 'some',
                        __privatePropertyStatic: 'other',
                        _protectedMethodStatic: function () {},
                        __privateMethodStatic: function () {}
                    }
                }),
                someClass = new SomeClass(),
                ReplicaClass = Class.declare({
                    retMethod: function () {
                        return this;
                    },
                    simpleMethod: function () {
                        var func = this.$member(function () {
                            return this;
                        }.bind(this));

                        return func.call(context);
                    },
                    otherSimpleMethod: function () {
                        var func = this.$member(function () {
                            return this._protectedProperty;
                        }.bind(this));

                        return func;
                    },
                    boundTwice: function () {
                        var func = function () {
                            return this;
                        }.$member().bind(this).bind(context);

                        return func.call({});
                    },
                    boundOfNamed: function () {
                        return this.simpleMethod.$member().bind(this);
                    },
                    someMethod: function () {
                        var func = this.$member(function () {
                            this._protectedProperty = 'dummy';
                            this.__privateProperty = 'dummy',
                            this._protectedMethod();
                            this.__privateMethod();
                        }.bind(this));

                        func.call(context);
                    },
                    someMethod2: function () {
                        var func = function (x) {
                            return x;
                        }.$member().bind(this, 'foo');

                        return func.call(context);
                    },
                    getProtectedProperty: function () {
                        return this._protectedProperty;
                    },
                    getPrivateProperty: function () {
                        return this.__privateProperty;
                    },
                    _protectedProperty: 'some',
                    __privateProperty: 'other',
                    _protectedMethod: function () {},
                    __privateMethod: function () {},

                    $statics: {
                        simpleMethodStatic: function () {
                            var func = this.$member(function () {
                                return this;
                            }.bind(this));

                            return func.call(context);
                        },
                        otherSimpleMethodStatic: function () {
                            var func = this.$member(function () {
                                return this._protectedPropertyStatic;
                            }.bind(this));

                            return func;
                        },
                        someMethodStatic: function () {
                            var func = this.$member(function () {
                                this._protectedPropertyStatic = 'dummy';
                                this.__privatePropertyStatic = 'dummy',
                                this._protectedMethodStatic();
                                this.__privateMethodStatic();
                            }.bind(this));

                            func.call(context);
                        },
                        someMethod2Static: function () {
                            var func = function (x) {
                                return x;
                            }.$member().bind(this, 'foo');

                            return func.call(context);
                        },
                        getProtectedPropertyStatic: function () {
                            return this._protectedPropertyStatic;
                        },
                        getPrivatePropertyStatic: function () {
                            return this.__privatePropertyStatic;
                        },
                        _protectedPropertyStatic: 'some',
                        __privatePropertyStatic: 'other',
                        _protectedMethodStatic: function () {},
                        __privateMethodStatic: function () {}
                    }
                }),
                replicaClass = new ReplicaClass();

            it('should work outside classes', function () {

                expect((function () {
                    return this;
                }.$bind(context)())).to.equal(context);

            });

            it('should work outside classes (with null context)', function () {

                expect(function () {
                    return function () {}.$bind(null);
                }).to.not.throwException();

            });

            it('should work with named functions', function () {

                expect(function () {
                    someClass.boundOfNamed();
                }).to.not.throwException();

                expect(function () {
                    replicaClass.boundOfNamed();
                }).to.not.throwException();

                var someObj = {};
                someObj.callback = replicaClass.retMethod.$bind(replicaClass);

                expect(someObj.callback.call({})).to.be.equal(replicaClass);
                expect(someObj.callback.call(null)).to.be.equal(replicaClass);
            });

            it('should work if double bound', function () {

                expect(someClass.boundTwice()).to.equal(someClass);
                expect(replicaClass.boundTwice()).to.equal(replicaClass);

            });

            it('should have access to the right context', function () {

                expect(someClass.simpleMethod()).to.equal(someClass);
                expect(SomeClass.simpleMethodStatic()).to.equal(SomeClass);

                expect(replicaClass.simpleMethod()).to.equal(replicaClass);
                expect(ReplicaClass.simpleMethodStatic()).to.equal(ReplicaClass);

            });

            it('should curl the parameters', function () {

                expect(someClass.someMethod2()).to.equal('foo');
                expect(SomeClass.someMethod2Static()).to.equal('foo');

                expect(replicaClass.someMethod2()).to.equal('foo');
                expect(ReplicaClass.someMethod2Static()).to.equal('foo');

            });

            it('should have access to private/protected members', function () {

                expect(function () {
                    someClass.someMethod();
                }).to.not.throwException();

                expect(function () {
                    someClass.otherSimpleMethod()();
                }).to.not.throwException();

                expect(someClass.getProtectedProperty()).to.equal('dummy');
                expect(someClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    SomeClass.someMethodStatic();
                }).to.not.throwException();

                expect(function () {
                    SomeClass.otherSimpleMethodStatic()();
                }).to.not.throwException();

                expect(SomeClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(SomeClass.getPrivatePropertyStatic()).to.equal('dummy');

                expect(function () {
                    replicaClass.someMethod();
                }).to.not.throwException();

                expect(replicaClass.getProtectedProperty()).to.equal('dummy');
                expect(replicaClass.getPrivateProperty()).to.equal('dummy');

                expect(function () {
                    ReplicaClass.someMethodStatic();
                }).to.not.throwException();

                expect(ReplicaClass.getProtectedPropertyStatic()).to.equal('dummy');
                expect(ReplicaClass.getPrivatePropertyStatic()).to.equal('dummy');

            });

        });

        describe('Instantiation of inheritance Cat -> Pet', function () {

            var someObj = {},
                Pet = Class.declare({
                    $name: 'Pet',
                    name: 'Pet',
                    position: 0,
                    initialize: function () {
                        this.$self.nrPets += 1;
                        this.$self.dummy = 'dummy';
                    },
                    walk: function () {
                        this.position += 1;
                    },
                    getName: function () {
                        return this.name;
                    },
                    getPosition: function () {
                        return this.position;
                    },
                    $statics: {
                        nrPets: 0,
                        dummy: 'test',
                        obj: someObj,
                        getNrPets: function () {
                            return this.nrPets;
                        },
                        getMaxAge: function () {
                            return 50;
                        }
                    }
                }),
                Cat,
                pet = new Pet(),
                cat;

            Cat = Class.declare({
                $name: 'Cat',
                $extends: Pet,
                initialize: function () {
                    this.name = 'Cat';
                    this.$super();
                },
                walk: function () {
                    this.position += 1;
                    this.$super();
                },
                $statics: {
                    getMaxAge: function () {
                        return 20;
                    }
                }
            });

            cat = new Cat();

            pet.walk();
            cat.walk();

            it('should be an instance of Pet and Cat', function () {

                expect(instanceOf(pet, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Cat)).to.be.equal(true);

            });

            it('should not have the $extends property', function () {

                expect(cat.$extends).to.be.equal(undefined);
                expect(Cat.prototype.$extends).to.be.equal(undefined);
                expect(Cat.$extends).to.be.equal(undefined);

            });

            it('should exist 2 pets', function () {

                expect(Pet.getNrPets()).to.be.equal(2);

            });

            it('should be at the right position', function () {

                expect(pet.getPosition()).to.be.equal(1);
                expect(cat.getPosition()).to.be.equal(2);

            });

            it('should have the right name', function () {

                expect(pet.getName()).to.be.equal('Pet');
                expect(cat.getName()).to.be.equal('Cat');

            });

            it('should have inherited the static members correctly', function () {

                expect(Cat.getNrPets).to.be.a('function');
                expect(Cat.dummy).to.be.equal('test');
                expect(Cat.nrPets).to.be.equal(0);
                expect(Cat.obj === someObj).to.be.equal(true);

            });

            it('should not have inherited already defined static methods', function () {

                expect(Pet.getMaxAge()).to.be.equal(50);
                expect(Cat.getMaxAge()).to.be.equal(20);

            });

        });

        describe('Instantiation of Concrete Classes that implement Interfaces', function () {

            it('should not have the $implements property', function () {

                var SomeImplementation = Class.declare({
                    $implements: [Interface.declare({ method1: function () {}})],
                    method1: function () {}
                }),
                    someImplementation = new SomeImplementation();

                expect(someImplementation.$implements).to.be.equal(undefined);
                expect(SomeImplementation.prototype.$implements).to.be.equal(undefined);
                expect(SomeImplementation.$implements).to.be.equal(undefined);
            });

        });

        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {

            it('should not have the $abstracts property', function () {

                var tmp = AbstractClass.declare({ $abstracts: { method1: function () {} }}),
                    SomeImplementation = Class.declare({
                        $extends: tmp,
                        method1: function () {}
                    }),
                    someImplementation = new SomeImplementation();

                expect(someImplementation.$abstracts).to.be.equal(undefined);
                expect(SomeImplementation.prototype.$abstracts).to.be.equal(undefined);
                expect(SomeImplementation.$abstract).to.be.equal(undefined);

            });

        });

        if (/strict/.test(global.build)) {

            describe('Extending final classes', function () {

                it('should throw an error', function () {

                    expect(function () {
                        var tmp = FinalClass.declare({});

                        return Class.declare({
                            $extends: tmp
                        });
                    }).to.throwException(/cannot inherit from final/);

                    expect(function () {
                        var tmp = FinalClass.declare({});

                        return AbstractClass.declare({
                            $extends: tmp
                        });
                    }).to.throwException(/cannot inherit from final/);

                });

            });
        }

        describe('Defining a Concrete/Abstract Classes that implements $interfaces', function () {

            var SomeInterface = Interface.declare({
                $constants: {
                    SOME: 'foo'
                }
            }),
                SomeClass = Class.declare({
                    $name: 'SomeClass',
                    $implements: SomeInterface
                }),
                OtherClass = Class.declare({
                    $name: 'OtherClass',
                    $extends: SomeClass
                }),
                SomeOtherClass = Class.declare({
                    $name: 'SomeOtherClass',
                    $extends: SomeClass,
                    $implements: SomeInterface
                }),
                SomeAbstractClass = AbstractClass.declare({
                    $name: 'SomeAbstractClass',
                    $implements: SomeInterface
                }),
                OtherAbstractClass = AbstractClass.declare({
                    $name: 'OtherAbstractClass',
                    $extends: SomeAbstractClass
                }),
                SomeOtherAbstractClass = Class.declare({
                    $name: 'SomeOtherAbstractClass',
                    $extends: SomeAbstractClass,
                    $implements: SomeInterface
                });

            it('should inherit the interface constants', function () {

                expect(SomeClass.SOME).to.be.equal('foo');
                expect(OtherClass.SOME).to.be.equal('foo');
                expect(SomeOtherClass.SOME).to.be.equal('foo');
                expect(SomeAbstractClass.SOME).to.be.equal('foo');
                expect(OtherAbstractClass.SOME).to.be.equal('foo');
                expect(SomeOtherAbstractClass.SOME).to.be.equal('foo');

            });
        });

        describe('Defining a Concrete/Abstract Classes that use $borrows (mixins)', function () {

            it('should have it removed', function () {

                var SomeClass = Class.declare({
                    $borrows: {}
                }),
                    someClass = new SomeClass();

                expect(someClass.$borrows).to.be.equal(undefined);
                expect(SomeClass.prototype.$borrows).to.be.equal(undefined);
                expect(SomeClass.$borrows).to.be.equal(undefined);

            });

            it('should grab the borrowed members to their own', function () {

                var CommonMixin = AbstractClass.declare({
                    method1: function () {}
                });

                (function () {
                    var SomeImplementation = Class.declare({
                        $borrows: {
                            method1: function () {},
                            method2: function () {},
                            some: 'property'
                        }
                    }),
                        VanillaImplementation = Class.declare({
                            $borrows: (function () {
                                var Vanilla = function () {};
                                Vanilla.prototype.method1 = function () {};
                                Vanilla.prototype.method2 = function () {};
                                Vanilla.prototype.some = 'property';

                                return Vanilla;
                            }())
                        }),
                        OtherImplementation = Class.declare({
                            $borrows: [Class.declare({
                                method1: function () {},
                                method2: function () {},
                                some: 'property',
                                $finals: {
                                    finalProp: 'test',
                                    finalFunc: function () {}
                                },
                                $constants: {
                                    FOO: 'bar'
                                }
                            }), { method3: function () {} }]
                        }),
                        EvenOtherImplementation = Class.declare({
                            $borrows: Class.declare({
                                method1: function () {},
                                method2: function () {},
                                some: 'property',
                                $statics: {
                                    staticMethod1: function () {},
                                    staticProperty1: 'foo'
                                },
                                $finals: {
                                    finalProp: 'test',
                                    finalFunc: function () {}
                                },
                                $constants: {
                                    FOO: 'bar'
                                }
                            })
                        }),
                        someImplementation = new SomeImplementation(),
                        vanillaImplementation = new VanillaImplementation(),
                        otherImplementation = new OtherImplementation(),
                        evenOtherImplementation = new EvenOtherImplementation();

                    expect(SomeImplementation.prototype.method1).to.be.a('function');
                    expect(SomeImplementation.prototype.method2).to.be.a('function');
                    expect(SomeImplementation.prototype.some).to.be.equal('property');
                    expect(VanillaImplementation.prototype.method1).to.be.a('function');
                    expect(VanillaImplementation.prototype.method2).to.be.a('function');
                    expect(VanillaImplementation.prototype.some).to.be.equal('property');
                    expect(OtherImplementation.prototype.method1).to.be.a('function');
                    expect(OtherImplementation.prototype.method2).to.be.a('function');
                    expect(OtherImplementation.prototype.method3).to.be.a('function');
                    expect(OtherImplementation.prototype.some).to.be.equal('property');
                    expect(EvenOtherImplementation.prototype.method1).to.be.a('function');
                    expect(EvenOtherImplementation.prototype.method2).to.be.a('function');
                    expect(EvenOtherImplementation.prototype.some).to.be.equal('property');

                    expect(someImplementation.method1).to.be.a('function');
                    expect(someImplementation.method2).to.be.a('function');
                    expect(someImplementation.some).to.be.equal('property');
                    expect(vanillaImplementation.method1).to.be.a('function');
                    expect(vanillaImplementation.method2).to.be.a('function');
                    expect(vanillaImplementation.some).to.be.equal('property');
                    expect(otherImplementation.method1).to.be.a('function');
                    expect(otherImplementation.method2).to.be.a('function');
                    expect(otherImplementation.method3).to.be.a('function');
                    expect(otherImplementation.some).to.be.equal('property');
                    expect(evenOtherImplementation.method1).to.be.a('function');
                    expect(evenOtherImplementation.method2).to.be.a('function');
                    expect(evenOtherImplementation.some).to.be.equal('property');

                    expect(otherImplementation.finalProp).to.equal('test');
                    expect(otherImplementation.finalFunc).to.be.a('function');
                    expect(OtherImplementation.FOO).to.equal('bar');
                    expect(EvenOtherImplementation.staticMethod1).to.be.a('function');
                    expect(EvenOtherImplementation.staticProperty1).to.equal('foo');

                    expect(evenOtherImplementation.finalProp).to.equal('test');
                    expect(evenOtherImplementation.finalFunc).to.be.a('function');
                    expect(EvenOtherImplementation.FOO).to.equal('bar');
                }());

                (function () {
                    var SomeImplementation = Class.declare({
                        $borrows: {
                            _method1: function () {},
                            _method2: function () {},
                            _some: 'property'
                        },
                        method1: function () {
                            return this._method1;
                        },
                        method2: function () {
                            return this._method2;
                        },
                        some: function () {
                            return this._some;
                        }
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());

                (function () {
                    var SomeImplementation = Class.declare({
                        $borrows: {
                            __method1: function () {},
                            __method2: function () {},
                            __some: 'property'
                        },
                        method1: function () {
                            return this.__method1;
                        },
                        method2: function () {
                            return this.__method2;
                        },
                        some: function () {
                            return this.__some;
                        }
                    }),
                        someImplementation = new SomeImplementation();


                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');

                }());

                (function () {
                    var SomeClass = Class.declare({}),
                        Common1 = Class.declare({
                            $extends: SomeClass,
                            $borrows: CommonMixin
                        }),
                        Common2 = Class.declare({
                            $extends: SomeClass,
                            $borrows: CommonMixin
                        }),
                        common1 = new Common1(),
                        common2  = new Common2();

                    expect(common1.method1).to.be.a('function');
                    expect(common2.method1).to.be.a('function');

                }());

            });

            it('should not protect the grabbed members of vanilla classes', function () {

                var SomeVanillaClass = function () {},
                    Def = {
                        _method1: function () {},
                        __method2: function () {},
                        _grr: 'foo',
                        __bleh: 'bar'
                    },
                    SomeClass,
                    OtherClass,
                    someClass,
                    otherClass;

                SomeVanillaClass.prototype = Def;

                SomeClass = Class.declare({
                    $borrows: SomeVanillaClass,
                    _bla: function () {},
                    __buh: function () {}
                });

                someClass = new SomeClass();

                OtherClass = Class.declare({
                    $extends: SomeClass,
                    _method1: function () {
                        return 'foo';
                    },
                    __method2: function () {
                        return 'bar';
                    },
                    _grr: 'what',
                    __bleh: 'whatt'
                });

                otherClass = new OtherClass();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        someClass._bla();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        someClass.__buh();
                    }).to.throwException(/access private/);
                }

                expect(function () {
                    someClass._method1();
                }).to.not.throwException();

                expect(function () {
                    someClass.__method2();
                }).to.not.throwException();

                expect(someClass._grr).to.equal('foo');
                expect(someClass.__bleh).to.equal('bar');

                expect(function () {
                    otherClass._method1();
                }).to.not.throwException();

                expect(function () {
                    otherClass.__method2();
                }).to.not.throwException();

                expect(otherClass._method1()).to.equal('foo');
                expect(otherClass.__method2()).to.equal('bar');
                expect(otherClass._grr).to.equal('what');
                expect(otherClass.__bleh).to.equal('whatt');

            });

            it('should not lock instances if borrowing from vanilla classes', function () {

                var SomeVanillaClass = function () {},
                    SomeClass = Class.declare({
                        $borrows: SomeVanillaClass
                    }),
                    someClass = new SomeVanillaClass();

                someClass.foo = 'bar';

                expect(someClass.foo).to.equal('bar');

            });

            it('should grab the borrowed members, respecting the precedence order and not replace self methods', function () {

                var SomeMixin = Class.declare({
                    method1: function () {
                        return 'mixin_foo';
                    },
                    $statics: {
                        staticMethod1: function () {
                            return 'mixin_bar';
                        }
                    }
                }),
                    OtherMixin = Class.declare({
                        method1: function () {},
                        $statics: {
                            staticMethod1: function () {}
                        }
                    }),
                    BaseClass = Class.declare({
                        method1: function () {
                            return 'bla';
                        },
                        $statics: {
                            staticMethod1: function () {
                                return 'bla';
                            }
                        }
                    }),
                    SomeClass = Class.declare({
                        $borrows: [SomeMixin, OtherMixin]
                    }),
                    OtherClass = Class.declare({
                        $borrows: [OtherMixin, SomeMixin]
                    }),
                    ComplexClass = Class.declare({
                        $extends: BaseClass,
                        $borrows: SomeMixin
                    }),
                    method1 = function () {
                        return 'foo';
                    },
                    method2 = function () {
                        return 'bar';
                    },
                    SomeOtherClass = Class.declare({
                        $borrows: [SomeMixin, OtherMixin],
                        method1: method1,
                        $statics: {
                            staticMethod1: method2
                        }
                    }),
                    someClass = new SomeClass(),
                    otherClass = new OtherClass(),
                    someOtherClass = new SomeOtherClass(),
                    complexClass = new ComplexClass();

                expect(someClass.method1.$wrapped).to.be.equal(OtherMixin.prototype.method1.$wrapped);
                expect(SomeClass.staticMethod1.$wrapped).to.be.equal(OtherMixin.staticMethod1.$wrapped);
                expect(otherClass.method1.$wrapped).to.be.equal(SomeMixin.prototype.method1.$wrapped);
                expect(OtherClass.staticMethod1.$wrapped).to.be.equal(SomeMixin.staticMethod1.$wrapped);
                expect(someOtherClass.method1()).to.be.equal('foo');
                expect(SomeOtherClass.staticMethod1()).to.be.equal('bar');
                expect(complexClass.method1()).to.be.equal('mixin_foo');
                expect(ComplexClass.staticMethod1()).to.be.equal('mixin_bar');
            });

            it('should not grab the initialize method of any class/object', function () {

                var initialize = function () {
                    this.some = 'test';
                },
                    SomeImplementation = Class.declare({
                        $borrows: { initialize: function () { this.some = 'nooo'; }, method1: function () {} },
                        some: 'property',
                        initialize: initialize
                    }),
                    OtherImplementation = Class.declare({
                        $borrows: Class.declare({ initialize: function () { this.some = 'nooo'; } }),
                        some: 'property'
                    }),
                    SomeOtherImplementation = Class.declare({
                        $extends: SomeImplementation,
                        $borrows: Class.declare({ initialize: function () { this.some = 'nooo'; } })
                    }),
                    SomeOtherProtectedImplementation = Class.declare({
                        $extends: SomeImplementation,
                        $borrows: Class.declare({ _initialize: function () { this.some = 'nooo'; } })
                    }),
                    SomeOtherProtectedImplementation2 = Class.declare({
                        $extends: SomeImplementation,
                        $borrows: { _initialize: function () { this.some = 'nooo'; } }
                    }),
                    SomeOtherPrivateImplementation = Class.declare({
                        $extends: SomeImplementation,
                        $borrows: Class.declare({ __initialize: function () { this.some = 'nooo'; } })
                    }),
                    SomeOtherPrivateImplementation2 = Class.declare({
                        $extends: SomeImplementation,
                        $borrows: { __initialize: function () { this.some = 'nooo'; } }
                    }),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation(),
                    someOtherImplementation = new SomeOtherImplementation(),
                    someOtherProtectedImplementation = new SomeOtherProtectedImplementation(),
                    someOtherProtectedImplementation2 = new SomeOtherProtectedImplementation2(),
                    someOtherPivateImplementation = new SomeOtherPrivateImplementation(),
                    someOtherPivateImplementation2 = new SomeOtherPrivateImplementation2();

                expect(someImplementation.some).to.be.equal('test');
                expect(otherImplementation.some).to.be.equal('property');
                expect(someOtherImplementation.some).to.be.equal('test');
                expect(someOtherProtectedImplementation.some).to.be.equal('test');
                expect(someOtherProtectedImplementation2.some).to.be.equal('test');
                expect(someOtherPivateImplementation.some).to.be.equal('test');
                expect(someOtherPivateImplementation2.some).to.be.equal('test');

                expect(someOtherProtectedImplementation._initialize).to.not.be.ok();
                expect(someOtherProtectedImplementation2._initialize).to.not.be.ok();
                expect(someOtherPivateImplementation.__initialize).to.not.be.ok();
                expect(someOtherPivateImplementation2.__initialize).to.not.be.ok();
            });

            it('should have passed the specified binds correctly', function () {

                var SomeImplementation = Class.declare({
                        $borrows: Class.declare({
                            method1: function () {
                                this.some = 'test';
                            }.$bound(),
                            method2: function () {
                                this.some = 'test2';
                            }.$bound()
                        }),
                        some: 'property'
                    }),
                    OtherImplementation = Class.declare({
                        $borrows: Class.declare({
                            method1: function () {
                                this.some = 'test';
                            }.$bound()
                        }),
                        method2: function () {
                            this.some = 'test2';
                        }.$bound(),
                        some: 'property'
                    }),
                    SomeOtherImplementation = Class.declare({
                        $borrows: [Class.declare({
                            method2: function () {}.$bound()
                        }), Class.declare({
                            method2: function () {}.$bound()
                        })],
                        method1: function () {
                            this.some = 'test';
                        }.$bound(),
                        method2: function () {
                            this.some = 'test2';
                        },
                        some: 'property'
                    }),
                    AbstractUsageImplementation = (function () {
                        var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function () {}.$bound()
                            }
                        });

                        return Class.declare({
                            $extends: tmp,
                            method1: function () {
                                this.some = 'test';
                            },
                            method2: function () {
                                this.some = 'test2';
                            }.$bound(),
                            some: 'property'
                        });
                    }()),
                    OtherAbstractUsageImplementation = (function () {
                        var tmp = AbstractClass.declare({
                            $abstracts: {
                                method1: function () {}.$bound()
                            },
                            method2: function () {
                                this.some = 'test2';
                            }.$bound()
                        });

                        return Class.declare({
                            $extends: tmp,
                            method1: function () {
                                this.some = 'test';
                            },
                            some: 'property'
                        });
                    }()),
                    someImplementation = new SomeImplementation(),
                    otherImplementation = new OtherImplementation(),
                    someOtherImplementation = new SomeOtherImplementation(),
                    abstractUsageImplementation = new AbstractUsageImplementation(),
                    otherAbstractUsageImplementation = new OtherAbstractUsageImplementation();

                someImplementation.method1.call(this);
                expect(someImplementation.some).to.be.equal('test');
                someImplementation.method2.call(this);
                expect(someImplementation.some).to.be.equal('test2');
                someImplementation.method1();
                expect(someImplementation.some).to.be.equal('test');
                someImplementation.method2();
                expect(someImplementation.some).to.be.equal('test2');

                otherImplementation.method1.call(this);
                expect(otherImplementation.some).to.be.equal('test');
                otherImplementation.method2.call(this);
                expect(otherImplementation.some).to.be.equal('test2');
                otherImplementation.method1();
                expect(otherImplementation.some).to.be.equal('test');
                otherImplementation.method2();
                expect(otherImplementation.some).to.be.equal('test2');

                someOtherImplementation.method1.call(this);
                expect(someOtherImplementation.some).to.be.equal('test');
                someOtherImplementation.method2.call(this);
                expect(someOtherImplementation.some).to.be.equal('test2');
                someOtherImplementation.method1();
                expect(someOtherImplementation.some).to.be.equal('test');
                someOtherImplementation.method2();
                expect(someOtherImplementation.some).to.be.equal('test2');

                abstractUsageImplementation.method1.call(this);
                expect(abstractUsageImplementation.some).to.be.equal('test');
                abstractUsageImplementation.method2.call(this);
                expect(abstractUsageImplementation.some).to.be.equal('test2');
                abstractUsageImplementation.method1();
                expect(abstractUsageImplementation.some).to.be.equal('test');
                abstractUsageImplementation.method2();
                expect(abstractUsageImplementation.some).to.be.equal('test2');

                otherAbstractUsageImplementation.method1.call(this);
                expect(otherAbstractUsageImplementation.some).to.be.equal('test');
                otherAbstractUsageImplementation.method2.call(this);
                expect(otherAbstractUsageImplementation.some).to.be.equal('test2');
                otherAbstractUsageImplementation.method1();
                expect(otherAbstractUsageImplementation.some).to.be.equal('test');
                otherAbstractUsageImplementation.method2();
                expect(otherAbstractUsageImplementation.some).to.be.equal('test2');

            });

            it('should work correctly for multiple levels of inheritance while borrowing from the same mixin', function () {

                var Mixin = function () {},
                    SomeClass,
                    ComplexSomeClass,
                    OtherClass;

                Mixin.prototype.fireEvent = function () { return this._fire(); };
                Mixin.prototype._fire = function () { return 'fired'; };

                SomeClass = Class.declare({
                    $borrows: Mixin
                }),
                ComplexSomeClass = Class.declare({
                    $extends: SomeClass,
                    $borrows: Mixin
                });
                OtherClass = Class.declare({
                    $borrows: Mixin
                }),

                expect((new SomeClass()).fireEvent()).to.equal('fired');
                expect((new ComplexSomeClass()).fireEvent()).to.equal('fired');
                expect((new OtherClass()).fireEvent()).to.equal('fired');

            });

        });

        describe('Final members', function () {

            it('should be accessible just as normal parameter/function', function () {

                var SomeClass = Class.declare({
                    $finals: {
                        foo: 'bar',
                        someFunction: function () {
                            return this.foo;
                        }
                    }
                }),
                    someClass = new SomeClass();

                expect(someClass.foo).to.be.equal('bar');
                expect(someClass.someFunction()).to.be.equal('bar');

            });

        });

        describe('Constants', function () {

            var SomeClass = Class.declare({
                $constants: {
                    FOO: 'bar'
                }
            }),
                SomeInterface = Interface.declare({
                    $constants: {
                        FOO: 'bar'
                    }
                });

            it('should be accessible in a similiar way as static members', function () {

                expect(SomeClass.FOO).to.be.equal('bar');
                expect(SomeInterface.FOO).to.be.equal('bar');

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should throw an error while attempting to change their values', function () {

                    expect(function () {
                        SomeClass.FOO = 'test';
                    }).to.throwException(/constant property/);

                    expect(function () {
                        SomeInterface.FOO = 'test';
                    }).to.throwException(/constant property/);

                });
            }

        });

        describe('Private members', function () {

            var SomeClass = Class.declare({
                __privateMethod: function () {
                    this.__privateProperty = 'test';
                }.$bound(),
                __privateProperty: 'property',
                setProp: function () {
                    this.__privateMethod();
                },
                getProp: function () {
                    return this.__privateProperty;
                },
                getProp2: function () {
                    return this.__getProp();
                },
                getMethod: function () {
                    return this.__privateMethod;
                },
                callTest: function () {
                    this.__test();
                },
                accessTest: function () {
                    return this.__test;
                },
                callStatic: function () {
                    return SomeClass.__funcStatic();
                },
                accessStaticProp: function () {
                    return SomeClass.__propStatic;
                },
                accessStaticFunc: function () {
                    return SomeClass.__funcStatic();
                },
                getConst: function () {
                    return this.$self.__SOME;
                },
                getConst2: function () {
                    return this.$static.__SOME;
                },
                getConst3: function () {
                    return SomeClass.__SOME;
                },
                __getProp: function () {
                    this.__privateMethod();
                    return this.__privateProperty;
                },
                $statics: {
                    callTest: function () {
                        this.__test();
                    },
                    accessTest: function () {
                        return this.__test;
                    },
                    accessConst: function () {
                        return this.__SOME;
                    },
                    __funcStatic: function () {},
                    __propStatic: 'property'
                },
                $constants: {
                    __SOME: 'foo'
                }
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype.__func).to.be.equal(undefined);
                    expect(SomeClass.prototype.__prop).to.be.equal(undefined);

                });

            }

            it('should not be copied to the childs constructor if they are static', function () {

                expect((function () {
                    var OtherClass = Class.declare({
                        $extends: SomeClass
                    });
                    return OtherClass.__funcStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class.declare({
                        $extends: SomeClass
                    });
                    return OtherClass.__propStatic;
                }())).to.be.equal(undefined);

                expect((function () {
                    var OtherClass = Class.declare({
                        $extends: SomeClass
                    });
                    return OtherClass.__SOME;
                }())).to.be.equal(undefined);

            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to self', function () {

                    expect((function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass
                        });
                        return OtherClass.__funcStatic;
                    }())).to.be.equal(undefined);

                    expect((function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass
                        });
                        return OtherClass.__propStatic;
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                this.__privateMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                SomeClass.__funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    this.__funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                return this.__privateProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                return SomeClass.__propStatic;
                            }
                        });
                        new OtherClass().some();
                    }).to.throwException(/access private/);

                    expect((function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    return this.__privateProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            __test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                __test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            __test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                __test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var tmp = Class.declare({
                                initialize: function () {
                                    this.__test();
                                }
                            }),
                            OtherClass = Class.declare({
                                $extends: tmp,
                                __test: function () {}

                            });

                        return new OtherClass();
                    }).to.throwException(/access private/);

                    expect(function () {
                        var tmp = Class.declare({
                                initialize: function () {
                                    this.__test = 'test';
                                }
                            }),
                            OtherClass = Class.declare({
                                $extends: tmp,
                                __test: 'some'
                            });

                        return new OtherClass();
                    }).to.throwException(/set private/);

                    expect(function () {
                        (new SomeClass()).__privateMethod();
                    }).to.throwException(/access private/);

                    expect(function () {
                        (new SomeClass()).__privateProperty();
                    }).to.throwException(/access private/);

                    expect(function () {
                        SomeClass.__funcStatic();
                    }).to.throwException(/access private/);

                    expect(function () {
                        return SomeClass.__propStatic;
                    }).to.throwException(/access private/);

                    expect(function () {
                        return SomeClass.__SOME;
                    }).to.throwException(/access private/);

                    expect(function () {
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            getProp: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            getProp2: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp2();
                    }).to.not.throwException();

                    expect((function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }())).to.be.equal('test');

                    expect(function () {
                        return (new SomeClass()).accessStaticProp();
                    }).to.not.throwException();

                    expect(function () {
                        return (new SomeClass()).accessStaticFunc();
                    }).to.not.throwException();

                    expect((function () {
                        return SomeClass.accessConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst2();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst3();
                    }())).to.be.equal('foo');

                    expect(function () {
                        var SomeTestClass = Class.declare({
                            __someVar: 'foo',
                            __someMethod: function () {},
                            test: function () {
                                return this.__someVar;
                            },
                            test2: function () {
                                this.__someMethod();
                            }
                        }), OtherClass = Class.declare({
                            $borrows: SomeTestClass
                        }),
                            myOtherClass = new OtherClass();

                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();

                    // This was commented out because under strict was temporarly removed
                    /*expect(function () {
                        var SomeClass = Class.declare({
                            __someVar: 'foo',
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass.__someVar;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            __someFunc: function () {},
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass.__someFunc;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            $statics: {
                                __someVar: 'foo'
                            },
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass.__someVar;
                        });
                    }).to.throwException(/access private/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            $statics: {
                                __someFunc: function () {}
                            },
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass.__someFunc;
                        });
                    }).to.throwException(/access private/);*/

                });

                it('cannot be overrided', function () {

                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            __getProp: function () {}
                        });
                    }).to.throwException(/override private/);

                    expect(function () {
                        return Class.declare({
                            $extends: SomeClass,
                            __privateProperty: 'foo'
                        });
                    }).to.throwException(/override private/);

                });

                it('should do well with borrowed members', function () {

                    expect(function () {
                        // This was a bug that was associated with private access from two classes that borrowed from the same thing
                        var secondClass,
                            BaseClass = AbstractClass.declare({}),
                            FirstClass = Class.declare({
                                $extends: BaseClass,
                                $borrows: Emitter.DirectEventsEmitter
                            }),
                            firstClass = new FirstClass(),
                            SecondClass = Class.declare({
                                $extends: BaseClass,
                                $borrows: Emitter.DirectEventsEmitter,

                                run: function () {
                                    this._begin();
                                },
                                _begin: function () {
                                    firstClass.addListener('yeaa', function () {}, this);
                                }
                            });

                        secondClass = new SecondClass();
                        secondClass.run();
                    }).to.not.throwException();

                });
            }

        });

        describe('Protected members', function () {

            var SomeClass = Class.declare({
                $name: 'SomeClass',
                _protectedMethod: function () {
                    this._protectedProperty = 'test';
                }.$bound(),
                _protectedProperty: 'property',
                setProp: function () {
                    this._protectedMethod();
                },
                getProp: function () {
                    return this._protectedProperty;
                },
                getProp2: function () {
                    return this._getProp();
                },
                getMethod: function () {
                    return this._protectedMethod;
                },
                callTest: function () {
                    this._test();
                },
                accessTest: function () {
                    return this._test;
                },
                _getProp: function () {
                    this._protectedMethod();
                    return this._protectedProperty;
                },
                getFruit: function () {
                    return this._getFruit();
                },
                _getFruit: function () {
                    return 'potato';
                },
                getConst: function () {
                    return this.$self._SOME;
                },
                getConst2: function () {
                    return this.$static._SOME;
                },
                getConst3: function () {
                    return SomeClass._SOME;
                },
                $statics: {
                    callTest: function () {
                        this._test();
                    },
                    accessTest: function () {
                        return this._test;
                    },
                    accessConst: function () {
                        return this._SOME;
                    },
                    _funcStatic: function () {
                        return 'potato';
                    },
                    _propStatic: 'property',
                    getFruitStatic: function () {
                        return this._getFruitStatic();
                    },
                    _getFruitStatic: function () {
                        return 'potato';
                    }
                },
                $constants: {
                    _SOME: 'foo'
                }
            });

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should not be available in the prototype', function () {

                    expect(SomeClass.prototype._func).to.be.equal(undefined);
                    expect(SomeClass.prototype._prop).to.be.equal(undefined);

                });

            }

            if (/strict/.test(global.build) && hasDefineProperty) {

                it('should only be available to derived classes', function () {

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                this._protectedMethod();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                this.$self._funcStatic();
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    this._funcStatic();
                                }
                            }
                        });
                        OtherClass.some();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            some: function () {
                                return this._protectedProperty;
                            }
                        });
                        new OtherClass().some();
                    }).to.not.throwException();

                    expect((function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                some: function () {
                                    return this._protectedProperty;
                                }
                            }
                        });
                        return OtherClass.some();
                    }())).to.be.equal(undefined);

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            _test: function () {}
                        });
                        return new OtherClass().callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                _test: function () {}
                            }
                        });
                        OtherClass.callTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            _test: 'some'
                        });
                        return new OtherClass().accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            $statics: {
                                _test: 'some'
                            }
                        });
                        return OtherClass.accessTest();
                    }).to.not.throwException();

                    expect(function () {
                        var tmp = Class.declare({
                                initialize: function () {
                                    this._test();
                                }
                            }),
                            OtherClass = Class.declare({
                                $extends: tmp,
                                _test: function () {}
                            });

                        return new OtherClass();
                    }).to.not.throwException();

                    expect(function () {
                        var tmp = Class.declare({
                                initialize: function () {
                                    this._test = 'test';
                                }
                            }),
                            OtherClass = Class.declare({
                                $extends: tmp,
                                _test: 'some'
                            });

                        return new OtherClass();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass())._protectedMethod();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return (new SomeClass())._protectedProperty;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        SomeClass._funcStatic();
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return SomeClass._propStatic;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        return SomeClass._SOME;
                    }).to.throwException(/access protected/);

                    expect(function () {
                        (new SomeClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            getProp: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp();
                    }).to.not.throwException();

                    expect(function () {
                        (new SomeClass()).getProp2();
                    }).to.not.throwException();

                    expect(function () {
                        var OtherClass = Class.declare({
                            $extends: SomeClass,
                            getProp2: function () {
                                return this.$super();
                            }
                        });

                        return (new OtherClass()).getProp2();
                    }).to.not.throwException();

                    expect((function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }())).to.be.equal('test');

                    expect((function () {
                        return SomeClass.accessConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst2();
                    }())).to.be.equal('foo');

                    expect((function () {
                        return (new SomeClass()).getConst3();
                    }())).to.be.equal('foo');

                    expect(function () {
                        var SomeClass = Class.declare({
                            _someVar: 'foo',
                            _someMethod: function () {},
                            test: function () {
                                return this._someVar;
                            },
                            test2: function () {
                                this._someMethod();
                            }
                        }), OtherClass = Class.declare({
                            $borrows: SomeClass
                        }),
                            myOtherClass = new OtherClass();

                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();

                    // This was commented out because under strict was temorarly removed
                    /*expect(function () {
                        var SomeClass = Class.declare({
                            _someVar: 'foo',
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass._someVar;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            _someFunc: function () {},
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return someClass._someFunc;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            $statics: {
                                _someVar: 'foo'
                            },
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass._someVar;
                        });
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            $statics: {
                                _someFunc: function () {}
                            },
                            exec: function (func) {
                                func();
                            }
                        }),
                            someClass = new SomeClass();

                        return someClass.exec(function () {
                            return SomeClass._someFunc;
                        });
                    }).to.throwException(/access protected/);*/

                    expect(function () {
                        var Common = Class.declare({}),
                            A = Class.declare({
                                $extends: Common,
                                foo: function (b) {
                                    return 'ola ' + b._bar();
                                }
                            }),
                            B = Class.declare({
                                $extends: Common,
                                _bar: function () {
                                    return 'mundo';
                                }
                            }),
                            a = new A(),
                            b = new B();

                        a.foo(b);
                    }).to.throwException(/access protected/);

                    expect(function () {
                        var SomeClass = Class.declare({
                            _protectedProp: 'foo'
                        }),
                            Common1 = Class.declare({
                                $extends: SomeClass
                            }),
                            Common2 = Class.declare({
                                $extends: SomeClass,
                                accessProtected: function (inst) {
                                    return inst._protectedProp;
                                }
                            }),
                            common1 = new Common1(),
                            common2  = new Common2();

                        common2.accessProtected(common1);
                    }).to.not.throwException();

                });

            }

            it('should work well with $super()', function () {

                var OtherClass = Class.declare({
                        $extends: SomeClass,
                        _getFruit: function () {
                            return 'hot ' + this.$super();
                        },
                        $statics: {
                            _getFruitStatic: function () {
                                return 'hot ' + this.$super();
                            }
                        }
                    }),
                    HiClass = Class.declare({
                        $extends: OtherClass,
                        _getFruit: function () {
                            return 'hi ' + this.$super();
                        },
                        $statics: {
                            _getFruitStatic: function () {
                                return 'hi ' + this.$super();
                            }
                        }
                    }),
                    other = new OtherClass(),
                    hi = new HiClass();

                expect(other.getFruit()).to.be.equal('hot potato');
                expect(hi.getFruit()).to.be.equal('hi hot potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('hot potato');
                expect(HiClass.getFruitStatic()).to.be.equal('hi hot potato');
            });

        });

        describe('instanceOf', function () {

            it('should work the same was as native instanceof works (for normal classes)', function () {

                var Class1 = Class.declare({}),
                    Class2 = AbstractClass.declare({}),
                    Class3 = Class.declare({ $extends: Class1 }),
                    Class4 = Class.declare({ $extends: Class2 }),
                    Class5 = AbstractClass.declare({ $extends: Class1 }),
                    Class6 = Class.declare({ $extends: Class5 });

                expect(instanceOf(new Class1(), Class1)).to.be.equal(true);
                expect(instanceOf(new Class3(), Class3)).to.be.equal(true);
                expect(instanceOf(new Class3(), Class1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Class4)).to.be.equal(true);
                expect(instanceOf(new Class4(), Class2)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class6)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class5)).to.be.equal(true);
                expect(instanceOf(new Class6(), Class1)).to.be.equal(true);

                expect(instanceOf(new Class3(), Class2)).to.be.equal(false);
                expect(instanceOf(new Class4(), Class1)).to.be.equal(false);
                expect(instanceOf(new Class6(), Class2)).to.be.equal(false);

            });

            it('should work even with optimized constructors', function () {

                var Class1 = Class.declare({
                    initialize: function () {}
                }),
                    Class2 = Class.declare({
                        $extends: Class1
                    }),
                    Class3 = Class.declare({
                        $extends: Class2
                    }),
                    class2 = new Class2(),
                    class3 = new Class3();

                expect(instanceOf(class2, Class1)).to.be.equal(true);
                expect(instanceOf(class3, Class1)).to.be.equal(true);
                expect(instanceOf(class3, Class2)).to.be.equal(true);

                // Constructors can't be the same
                // This is very important
                expect(Class2 === Class1).to.be.equal(false);
                expect(Class3 === Class1).to.be.equal(false);
                expect(Class3 === Class2).to.be.equal(false);
            });

            it('should work with interfaces as well', function () {

                var Interface1 = Interface.declare({}),
                    Interface2 = Interface.declare({}),
                    Interface3 = Interface.declare({}),
                    Interface4 = Interface.declare({ $extends: Interface3 }),
                    Interface5 = Interface.declare({ $extends: [Interface4, Interface1] }),
                    Interface6 = Interface5.extend({ $name: 'Interface6' }),

                    Class1 = Class.declare({ $implements: Interface1 }),
                    Class2 = AbstractClass.declare({ $implements: [Interface1, Interface2] }),
                    Class3 = Class.declare({ $extends: Class1 }),
                    Class4 = Class.declare({ $extends: Class2 }),
                    Class5 = AbstractClass.declare({ $extends: Class1, $implements: Interface3 }),
                    Class6 = Class.declare({ $extends: Class5 }),
                    Class7 = Class.declare({ $implements: [Interface2, Interface5] }),
                    Class8 = Class.declare({ $implements: Interface6 });

                expect(instanceOf(new Class1(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class3(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class4(), Interface2)).to.be.equal(true);
                expect(instanceOf(new Class6(), Interface3)).to.be.equal(true);
                expect(instanceOf(new Class6(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface5)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface2)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface4)).to.be.equal(true);
                expect(instanceOf(new Class7(), Interface1)).to.be.equal(true);
                expect(instanceOf(new Class8(), Interface5)).to.be.equal(true);

                expect(instanceOf(new Class1(), Interface2)).to.be.equal(false);
                expect(instanceOf(new Class6(), Interface4)).to.be.equal(false);

            });

            it('should work if an invalid constructor was passed', function () {

                var SomeClass = Class.declare({});

                expect(instanceOf(new SomeClass(), {})).to.be.equal(false);
                expect(instanceOf(new SomeClass(), '')).to.be.equal(false);
                expect(instanceOf(new SomeClass(), 2)).to.be.equal(false);

            });
        });


        describe('Singletons', function () {

            var Singleton = Class.declare({
                foo: null,
                _initialize: function () {
                    this.foo = 'bar';
                },

                $statics: {
                    getInstance: function () {
                        return new Singleton();
                    }
                }
            }),
                Singleton2 = Class.declare({
                    foo: null,
                    __initialize: function () {
                        this.foo = 'bar';
                    },

                    $statics: {
                        getInstance: function () {
                            return new Singleton2();
                        }
                    }
                }),
                SubSingleton = Class.declare({
                    $extends: Singleton
                }),
                SubSingleton2 = Class.declare({
                    $extends: Singleton2
                }),
                OtherSubSingleton = Class.declare({
                    $extends: SubSingleton,
                    $statics: {
                        getInstance: function () {
                            return new OtherSubSingleton();
                        }

                    }
                }),
                OtherSubSingleton2 = Class.declare({
                    $extends: SubSingleton2,
                    $statics: {
                        getInstance: function () {
                            return new OtherSubSingleton2();
                        },
                        getInstanceWrong: function () {
                            return new Singleton2();
                        },
                        getInstanceWrong2: function () {
                            return new SubSingleton2();
                        }
                    }
                });

            it('should be accomplished with protected constructors', function () {

                expect(function () {
                    return Singleton.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return SubSingleton.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return OtherSubSingleton.getInstance();
                }).to.not.throwException();

            });

            it('should be accomplished with private constructors', function () {

                expect(function () {
                    return Singleton2.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return SubSingleton2.getInstance();
                }).to.not.throwException();

                expect(function () {
                    return OtherSubSingleton2.getInstance();
                }).to.not.throwException();

                if (/strict/.test(global.build) && hasDefineProperty) {
                    expect(function () {
                        return OtherSubSingleton2.getInstanceWrong();
                    }).to.throwException(/is private/);

                    expect(function () {
                        return OtherSubSingleton2.getInstanceWrong2();
                    }).to.throwException(/is private/);
                }

            });

        });

        describe('Optimized code', function () {

            it('should work with namespaced classes', function () {

                var namespace = {};

                namespace.SomeClass = Class.declare({
                    someMethod: function () {
                        return 'ok';
                    }
                });

                namespace.ComplexSomeClass = Class.declare({
                    $extends: namespace.SomeClass
                });

                expect((new namespace.ComplexSomeClass()).someMethod()).to.be.equal('ok');

            });

            it('should work for functions that are $bound', function () {

                var SomeClass = Class.declare({
                    test: function () {
                        return 'foo';
                    }
                }),
                    OtherClass = Class.declare({
                        $extends: SomeClass,

                        test: function () {
                            return this.$super();
                        }.$bound()
                    });

                expect((new OtherClass()).test()).to.be.equal('foo');

            });

        });

    });

});
