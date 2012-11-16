define(global.modules, function (Class, AbstractClass, Interface, FinalClass, instanceOf, options, hasDefineProperty, Emitter) {
    'use strict';
    var expect = global.expect;
    beforeEach(function (done) {
        setTimeout(done, 0);
    });
    describe('Functional:', function () {
        describe('Instantiation of a simple Class', function () {
            var SomeClass = Class.declare(function ($self) {
                    return {};
                }, true), Example = Class.declare(SomeClass, function ($super) {
                    return {
                        some: 'property',
                        someOther: null,
                        someDate: new Date(),
                        someClass: SomeClass,
                        someInstance: new SomeClass(),
                        someRegExp: /some/gi,
                        options: { option1: 'property' },
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
                            this.someArray.push('other');
                        },
                        $finals: {
                            foo: 'bar',
                            otherClass: SomeClass,
                            otherInstance: new SomeClass()
                        },
                        $constants: { SOME_CONST: 'const' },
                        $statics: {
                            staticMethod: function () {
                            },
                            staticSome: 'property'
                        }
                    };
                }, true), example = new Example(), example2 = new Example();
            it('should return a valid instance', function () {
                expect(instanceOf(example, Example)).to.be.equal(true);
                expect(example).to.be.an('object');
            });
            it('should have 4 methods', function () {
                expect(example.method1).to.be.a('function');
                expect(example.method1).to.not.be.equal(Example.prototype.method1);
                expect(example.method2).to.be.a('function');
                expect(example.method2).to.not.be.equal(Example.prototype.method);
                expect(example.method3).to.be.a('function');
                expect(example.method3).to.not.be.equal(Example.prototype.method3);
                expect(example.test).to.be.a('function');
                expect(example.test).to.be.equal(Example.prototype.test);
            });
            it('should have 3 properties', function () {
                expect(example.some).to.be.equal('property');
                expect(example.some).to.be.equal(Example.prototype.some);
                expect(example.options).to.be.a('object');
                expect(example.options).to.not.be.equal(Example.prototype.options);
                expect(example.someArray).to.be.an('array');
                expect(example.someArray).to.not.be.equal(Example.prototype.someArray);
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
                return expect(example.$statics).to.be.equal(undefined);
            });
            it('should not have the $finals property', function () {
                return expect(example.$finals).to.be.equal(undefined);
            });
            it('should not have the $constants property', function () {
                return expect(example.$constants).to.be.equal(undefined);
            });
            it('should not share properties with other instances', function () {
                example2.test();
                expect(example2.some).to.be.equal('test');
                expect(example.some).to.be.equal('property');
                expect(example2.options.option1).to.be.equal('test');
                expect(example.options.option1).to.be.equal('property');
                expect(example2.someArray.length).to.be.equal(2);
                expect(example.someArray.length).to.be.equal(1);
                expect(example.someDate).to.not.be.equal(example2.someDate);
                expect(example.someClass).to.be.equal(example2.someClass);
                expect(example.someInstance).to.not.be.equal(example2.someInstance);
                expect(instanceOf(example.someInstance, SomeClass)).to.be.equal(true);
                expect(instanceOf(example2.someInstance, SomeClass)).to.be.equal(true);
                expect(example.otherClass).to.be.equal(example2.otherClass);
                expect(example.otherInstance).to.not.be.equal(example2.otherInstance);
                expect(instanceOf(example.otherInstance, SomeClass)).to.be.equal(true);
                expect(instanceOf(example2.otherInstance, SomeClass)).to.be.equal(true);
                expect(example.someRegExp).to.not.be.equal(example2.someRegExp);
                expect(example.someRegExp.toString()).to.be.equal(example2.someRegExp.toString());
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
            var Person = Class.declare(function ($self) {
                    return {
                        status: null,
                        initialize: function () {
                            this.status = 'alive';
                        }
                    };
                }, true), Andre = Class.declare(Person, function ($super) {
                    return {};
                }, true), SuperAndre = Class.declare(Andre, function ($super) {
                    return {};
                }, true), PersonAbstract = AbstractClass.declare(function ($self) {
                    return {
                        status: null,
                        initialize: function () {
                            this.status = 'alive';
                        }
                    };
                }, true), AndreAbstract = AbstractClass.declare(PersonAbstract, function ($super) {
                    return {};
                }, true), SuperAndre2 = Class.declare(AndreAbstract, function ($super) {
                    return {};
                }, true), ProtectedPerson = Class.declare(function ($self) {
                    return {
                        status: null,
                        _initialize: function () {
                            this.status = 'alive';
                        }
                    };
                }, true), PrivatePerson = Class.declare(function ($self) {
                    return {
                        __initialize: function () {
                        }
                    };
                }, true), FreakPerson = Class.declare(ProtectedPerson, function ($super) {
                    return {};
                }, true), NerdPerson = Class.declare(PrivatePerson, function ($super) {
                    return {};
                }, true), ComplexProtectedPerson = ProtectedPerson.extend(function ($super) {
                    return {
                        initialize: function () {
                            $super.initialize.call(this);
                        }
                    };
                }, true);
            it('should invoke the parent constructor automatically if no constructor was defined', function () {
                var andre = new Andre(), superAndre = new SuperAndre(), superAndre2 = new SuperAndre2();
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
                }, Person2 = function () {
                    this.status = 'alive';
                    this._name = 'Cruz';
                }, Andre, SuperAndre, Mario, Helena, Marco;
            Person.prototype.getName = function () {
                return this._name;
            }, Person2.prototype.getName = function () {
                return this._name;
            }, Person2.prototype.initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype._initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype.__initialize = function () {
                this.status = 'wrong!';
            };
            Person2.prototype._what = function () {
            };
            Person2.prototype.__hmm = function () {
            };
            Andre = Class.declare(Person, function ($super) {
                return {
                    getName: function () {
                        return 'Andr\xe9 ' + $super.getName.call(this);
                    }
                };
            }, true);
            SuperAndre = Class.declare(Andre, function ($super) {
                return {};
            }, true), Mario = Class.declare(Person, function ($super) {
                return {
                    initialize: function () {
                        $super.initialize.call(this);
                    }
                };
            }, true), Helena = Class.declare(Person2, function ($super) {
                return {
                    initialize: function () {
                        $super.initialize.call(this);
                        this._name = 'Ribau';
                    },
                    getName: function () {
                        return 'Helena ' + $super.getName.call(this);
                    },
                    _walk: function () {
                    },
                    __run: function () {
                    },
                    _what: function () {
                        return 'what';
                    },
                    __hmm: function () {
                        return 'hmm';
                    }
                };
            }, true);
            Marco = Class.declare(Person2, function ($super) {
                return {
                    initialize: function () {
                        $super.initialize.call(this);
                        this._name = 'Oliveira';
                    },
                    getName: function () {
                        return 'Marco ' + $super.getName.call(this);
                    },
                    _what: function () {
                        return 'what';
                    },
                    __hmm: function () {
                        return 'hmm';
                    }
                };
            }, true);
            it('should invoke the parent constructor automatically if no constructor was defined', function () {
                var andre = new Andre(), superAndre = new SuperAndre(), mario = new Mario(), helena = new Helena();
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
                var helena = new Helena(), andre = new Andre();
                expect(helena.getName()).to.be.equal('Helena Ribau');
                expect(andre.getName()).to.be.equal('Andr\xe9 Cruz');
            });
            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should not protect the vanilla class methods', function () {
                    var helena = new Helena(), marco = new Marco();
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
            var SomeClass = Class.declare(function ($self) {
                    return {
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
                    };
                }, true), OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                    return {
                        _lastName: null,
                        initialize: function () {
                            $super.initialize.call(this);
                            this._lastName = 'cruz';
                        },
                        getFullName: function () {
                            return $super.getFullName.call(this) + ' ' + this._lastName;
                        },
                        $statics: {
                            getFruit: function () {
                                return 'hot ' + $parent.getFruit.call(this);
                            }
                        }
                    };
                }), HiClass = Class.declare(OtherClass, function ($super, $self, $parent) {
                    return {
                        getFullName: function () {
                            return 'hi ' + $super.getFullName.call(this);
                        },
                        $statics: {
                            getFruit: function () {
                                return 'hi ' + $parent.getFruit.call(this);
                            }
                        }
                    };
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
            var SomeClass = Class.declare(function ($self) {
                    return {
                        initialize: function () {
                            $self._fruit = 'orange';
                        },
                        getFruit: function () {
                            return $self.getFruitStatic();
                        },
                        $statics: {
                            _fruit: 'potato',
                            getFruitStatic: function () {
                                return this._fruit;
                            },
                            setFruitStatic: function (fruit) {
                                $self._fruit = fruit;
                            }
                        }
                    };
                }), OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                    return {
                        initialize: function () {
                            $super.initialize.call(this);
                        },
                        getFruit: function () {
                            return $self.getFruitStatic();
                        },
                        $statics: {
                            _fruit: 'potato',
                            getFruitStatic: function () {
                                return this._fruit;
                            }
                        }
                    };
                });
            it('should give access to the static layer of itself', function () {
                expect(new SomeClass().getFruit()).to.be.equal('orange');
                expect(SomeClass.getFruitStatic()).to.be.equal('orange');
                expect(new OtherClass().getFruit()).to.be.equal('potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');
                OtherClass.setFruitStatic('carrot');
                expect(SomeClass.getFruitStatic()).to.be.equal('carrot');
                expect(OtherClass.getFruitStatic()).to.be.equal('potato');
                SomeClass.setFruitStatic('carrot');
            });
        });
        describe('$static', function () {
            var SomeClass = Class.declare(function ($self) {
                    return {
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
                    };
                }, true), OtherClass = Class.declare(SomeClass, function ($super) {
                    return {
                        initialize: function () {
                            $super.initialize.call(this);
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
                    };
                }, true);
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
        if (/strict/.test(global.build) && (Object.seal || Object.freeze)) {
            describe('$locked', function () {
                afterEach(function () {
                    options.locked = true;
                });
                it('should not lock classes if it\'s false', function () {
                    var SomeClass = Class.declare(function ($self) {
                            return {
                                test: function () {
                                },
                                $statics: {
                                    testStatic: function () {
                                    }
                                }
                            };
                        }, true), someClass = new SomeClass(), someFunc = function () {
                        };
                    SomeClass.foo = 'bar';
                    SomeClass.prototype.foo = 'bar';
                    someClass.bar = 'foo';
                    expect(SomeClass.foo).to.equal('bar');
                    expect(SomeClass.prototype.foo).to.equal('bar');
                    expect(someClass.bar).to.equal('foo');
                    someClass.test = someFunc;
                    expect(someClass.test).to.equal(someFunc);
                    SomeClass.someFunc = someFunc;
                    expect(SomeClass.someFunc).to.equal(someFunc);
                });
                it('should lock classes if it\'s true', function () {
                    var SomeClass = Class.declare(function ($self) {
                            return {
                                test: function () {
                                },
                                $statics: {
                                    staticFunc: function () {
                                    }
                                }
                            };
                        }, true), someClass = new SomeClass();
                    expect(function () {
                        SomeClass.foo = 'bar';
                    }).to.throwException('not extensible');
                    expect(function () {
                        SomeClass.prototype.foo = 'bar';
                    }).to.throwException('not extensible');
                    expect(function () {
                        someClass.bar = 'foo';
                    }).to.throwException('not extensible');
                    expect(function () {
                        someClass.test = function () {
                        };
                    }).to.throwException('not extensible');
                    expect(function () {
                        SomeClass.staticFunc = function () {
                        };
                    }).to.throwException('not extensible');
                });
                it('should read the default value', function () {
                    options.locked = true;
                    var SomeClass = Class.declare(function ($self) {
                            return {};
                        }, true), OtherClass;
                    options.locked = false;
                    OtherClass = Class.declare(function ($self) {
                        return {};
                    }, true);
                    expect(function () {
                        SomeClass.foo = 'bar';
                    }).to.throwException('not extensible');
                    OtherClass.foo = 'bar';
                    expect(OtherClass.foo).to.equal('bar');
                });
                it('should throw an error when $force is true but it must be false (due to borrowing or extending from a vanilla class)', function () {
                    var SomeClass = function () {
                    };
                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot be locked/);
                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot be locked/);
                    expect(function () {
                        return Class.declare(function ($self) {
                            return { $borrows: SomeClass };
                        }, true);
                    }).to.throwException(/cannot be locked/);
                    expect(function () {
                        return Class.declare(function ($self) {
                            return { $borrows: SomeClass };
                        }, true);
                    }).to.throwException(/cannot be locked/);
                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot be locked/);
                });
                it('should be inherited and once unlocked it can\'t be locked', function () {
                    var SomeClass = function () {
                        }, OtherClass = Class.declare(function ($self) {
                            return {};
                        }, true), SomeSubClass, OtherSubClass, someSubClass, otherSubClass;
                    options.locked = true;
                    SomeSubClass = Class.declare(SomeClass, function ($super) {
                        return {};
                    }, true);
                    OtherSubClass = Class.declare(OtherClass, function ($super) {
                        return {};
                    }, true);
                    someSubClass = new SomeSubClass();
                    otherSubClass = new OtherSubClass();
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
                        return Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot be locked/);
                    expect(function () {
                        return Class.declare(OtherClass, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot be locked/);
                });
            });
        }
        describe('$bind', function () {
            var context = {}, SomeClass = Class.declare(function ($self) {
                    return {
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
                                    this.__privateProperty = 'dummy', this._protectedMethod();
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
                        _protectedMethod: function () {
                        },
                        __privateMethod: function () {
                        },
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
                                        this.__privatePropertyStatic = 'dummy', this._protectedMethodStatic();
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
                            _protectedMethodStatic: function () {
                            },
                            __privateMethodStatic: function () {
                            }
                        }
                    };
                }, true), someClass = new SomeClass(), ReplicaClass = Class.declare(function ($self) {
                    return {
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
                                    this.__privateProperty = 'dummy', this._protectedMethod();
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
                        _protectedMethod: function () {
                        },
                        __privateMethod: function () {
                        },
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
                                        this.__privatePropertyStatic = 'dummy', this._protectedMethodStatic();
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
                            _protectedMethodStatic: function () {
                            },
                            __privateMethodStatic: function () {
                            }
                        }
                    };
                }, true), replicaClass = new ReplicaClass();
            it('should work outside classes', function () {
                expect(function () {
                    return this;
                }.$bind(context)()).to.equal(context);
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
                    SomeClass.otherSimpleMethodStatic();
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
            var Pet = Class.declare(function ($self) {
                    return {
                        name: 'Pet',
                        position: 0,
                        initialize: function () {
                            $self.nrPets += 1;
                            $self.dummy = 'dummy';
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
                            getNrPets: function () {
                                return this.nrPets;
                            },
                            getMaxAge: function () {
                                return 50;
                            }
                        }
                    };
                }), Cat, pet = new Pet(), cat;
            Cat = Class.declare(Pet, function ($super) {
                return {
                    initialize: function () {
                        this.name = 'Cat';
                        $super.initialize.call(this);
                    },
                    walk: function () {
                        this.position += 1;
                        $super.walk.call(this);
                    },
                    $statics: {
                        getMaxAge: function () {
                            return 20;
                        }
                    }
                };
            }, true);
            cat = new Cat();
            pet.walk();
            cat.walk();
            it('should be an instance of Pet and Cat', function () {
                expect(instanceOf(pet, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Pet)).to.be.equal(true);
                expect(instanceOf(cat, Cat)).to.be.equal(true);
            });
            it('should not have the $extends property', function () {
                return expect(cat.$extends).to.be.equal(undefined);
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
                return expect(Cat.nrPets).to.be.ok;
            });
            it('should not have inherited already defined static methods', function () {
                expect(Pet.getMaxAge()).to.be.equal(50);
                expect(Cat.getMaxAge()).to.be.equal(20);
            });
        });
        describe('Instantiation of Concrete Classes that implement Interfaces', function () {
            it('should not have the $implements property', function () {
                var SomeImplementation = Class.declare(function ($self) {
                        return {
                            $implements: [Interface.declare({})],
                            method1: function () {
                            }
                        };
                    }, true), someImplementation = new SomeImplementation();
                return expect(someImplementation.$implements).to.be.equal(undefined);
            });
        });
        describe('Instantiation of Concrete Classes that extend Abstract Classes', function () {
            it('should not have the $abstracts property', function () {
                var tmp = AbstractClass.declare(function ($self) {
                        return {};
                    }, true), SomeImplementation = Class.declare(tmp, function ($super) {
                        return {
                            method1: function () {
                            }
                        };
                    }, true), someImplementation = new SomeImplementation();
                return expect(someImplementation.$abstracts).to.be.equal(undefined);
            });
        });
        if (/strict/.test(global.build)) {
            describe('Extending final classes', function () {
                it('should throw an error', function () {
                    expect(function () {
                        var tmp = FinalClass.declare(function ($self) {
                                return {};
                            }, true);
                        return Class.declare(tmp, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot inherit from final/);
                    expect(function () {
                        var tmp = FinalClass.declare(function ($self) {
                                return {};
                            }, true);
                        return AbstractClass.declare(tmp, function ($super) {
                            return {};
                        }, true);
                    }).to.throwException(/cannot inherit from final/);
                });
            });
        }
        describe('Defining a Concrete/Abstract Classes that implements $interfaces', function () {
            var SomeInterface = Interface.declare({ $constants: { SOME: 'foo' } }), SomeClass = Class.declare(function ($self) {
                    return { $implements: SomeInterface };
                }, true), OtherClass = Class.declare(SomeClass, function ($super) {
                    return {};
                }, true), SomeOtherClass = Class.declare(SomeClass, function ($super) {
                    return { $implements: SomeInterface };
                }, true), SomeAbstractClass = AbstractClass.declare(function ($self) {
                    return { $implements: SomeInterface };
                }, true), OtherAbstractClass = AbstractClass.declare(SomeAbstractClass, function ($super) {
                    return {};
                }, true), SomeOtherAbstractClass = Class.declare(SomeAbstractClass, function ($super) {
                    return { $implements: SomeInterface };
                }, true);
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
            it('should grab the borrowed members to their own', function () {
                var CommonMixin = AbstractClass.declare(function ($self) {
                        return {
                            method1: function () {
                            }
                        };
                    }, true);
                (function () {
                    var SomeImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: {
                                    method1: function () {
                                    },
                                    method2: function () {
                                    },
                                    some: 'property'
                                }
                            };
                        }, true), VanillaImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: function () {
                                    var Vanilla = function () {
                                    };
                                    Vanilla.prototype.method1 = function () {
                                    };
                                    Vanilla.prototype.method2 = function () {
                                    };
                                    Vanilla.prototype.some = 'property';
                                    return Vanilla;
                                }()
                            };
                        }, true), OtherImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: [
                                    Class.declare(function ($self) {
                                        return {
                                            method1: function () {
                                            },
                                            method2: function () {
                                            },
                                            some: 'property',
                                            $finals: {
                                                finalProp: 'test',
                                                finalFunc: function () {
                                                }
                                            },
                                            $constants: { FOO: 'bar' }
                                        };
                                    }, true),
                                    {
                                        method3: function () {
                                        }
                                    }
                                ]
                            };
                        }, true), EvenOtherImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: Class.declare(function ($self) {
                                    return {
                                        method1: function () {
                                        },
                                        method2: function () {
                                        },
                                        some: 'property',
                                        $finals: {
                                            finalProp: 'test',
                                            finalFunc: function () {
                                            }
                                        },
                                        $constants: { FOO: 'bar' }
                                    };
                                }, true)
                            };
                        }, true), someImplementation = new SomeImplementation(), vanillaImplementation = new VanillaImplementation(), otherImplementation = new OtherImplementation(), evenOtherImplementation = new EvenOtherImplementation();
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
                    expect(evenOtherImplementation.finalProp).to.equal('test');
                    expect(evenOtherImplementation.finalFunc).to.be.a('function');
                    expect(EvenOtherImplementation.FOO).to.equal('bar');
                }());
                (function () {
                    var SomeImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: {
                                    _method1: function () {
                                    },
                                    _method2: function () {
                                    },
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
                            };
                        }, true), someImplementation = new SomeImplementation();
                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');
                }());
                (function () {
                    var SomeImplementation = Class.declare(function ($self) {
                            return {
                                $borrows: {
                                    __method1: function () {
                                    },
                                    __method2: function () {
                                    },
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
                            };
                        }, true), someImplementation = new SomeImplementation();
                    expect(someImplementation.method1()).to.be.a('function');
                    expect(someImplementation.method2()).to.be.a('function');
                    expect(someImplementation.some()).to.be.equal('property');
                }());
                expect(function () {
                    var SomeClass = Class.declare(function ($self) {
                            return {
                                _protectedProp: 'foo',
                                _privateProp: 'bar'
                            };
                        }, true), Common1 = Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true), Common2 = Class.declare(SomeClass, function ($super) {
                            return {
                                accessProtected: function (inst) {
                                    return inst._protectedProp;
                                },
                                accessPrivate: function (inst) {
                                    return inst._protectedProp;
                                }
                            };
                        }, true), common1 = new Common1(), common2 = new Common2();
                    common2.accessProtected(common1);
                }).to.not.throwException();
                (function () {
                    var SomeClass = Class.declare(function ($self) {
                            return {};
                        }, true), Common1 = Class.declare(SomeClass, function ($super) {
                            return { $borrows: CommonMixin };
                        }, true), Common2 = Class.declare(SomeClass, function ($super) {
                            return { $borrows: CommonMixin };
                        }, true), common1 = new Common1(), common2 = new Common2();
                    expect(common1.method1).to.be.a('function');
                    expect(common2.method1).to.be.a('function');
                }());
            });
            it('should not protect the grabbed members of vanilla classes', function () {
                var SomeVanillaClass = function () {
                    }, Def = {
                        _method1: function () {
                        },
                        __method2: function () {
                        },
                        _grr: 'foo',
                        __bleh: 'bar'
                    }, SomeClass, OtherClass, someClass, otherClass;
                SomeVanillaClass.prototype = Def;
                SomeClass = Class.declare(function ($self) {
                    return {
                        $borrows: SomeVanillaClass,
                        _bla: function () {
                        },
                        __buh: function () {
                        }
                    };
                }, true);
                someClass = new SomeClass();
                OtherClass = Class.declare(SomeClass, function ($super) {
                    return {
                        _method1: function () {
                            return 'foo';
                        },
                        __method2: function () {
                            return 'bar';
                        },
                        _grr: 'what',
                        __bleh: 'whatt'
                    };
                }, true);
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
                var SomeVanillaClass = function () {
                    }, SomeClass = Class.declare(function ($self) {
                        return { $borrows: SomeVanillaClass };
                    }, true), someClass = new SomeVanillaClass();
                someClass.foo = 'bar';
                expect(someClass.foo).to.equal('bar');
            });
            it('should grab the borrowed members, respecting the precedence order and not replace self methods', function () {
                var SomeMixin = Class.declare(function ($self) {
                        return {
                            method1: function () {
                            },
                            $statics: {
                                staticMethod1: function () {
                                }
                            }
                        };
                    }, true), OtherMixin = Class.declare(function ($self) {
                        return {
                            method1: function () {
                            },
                            $statics: {
                                staticMethod1: function () {
                                }
                            }
                        };
                    }, true), SomeClass = Class.declare(function ($self) {
                        return {
                            $borrows: [
                                SomeMixin,
                                OtherMixin
                            ]
                        };
                    }, true), OtherClass = Class.declare(function ($self) {
                        return {
                            $borrows: [
                                OtherMixin,
                                SomeMixin
                            ]
                        };
                    }, true), method1 = function () {
                        return 'foo';
                    }, method2 = function () {
                        return 'bar';
                    }, SomeOtherClass = Class.declare(function ($self) {
                        return {
                            $borrows: [
                                SomeMixin,
                                OtherMixin
                            ],
                            method1: method1,
                            $statics: { staticMethod1: method2 }
                        };
                    }, true), someClass = new SomeClass(), otherClass = new OtherClass(), someOtherClass = new SomeOtherClass();
                expect(someClass.method1.$wrapped).to.be.equal(OtherMixin.prototype.method1.$wrapped);
                expect(SomeClass.staticMethod1.$wrapped).to.be.equal(OtherMixin.staticMethod1.$wrapped);
                expect(otherClass.method1.$wrapped).to.be.equal(SomeMixin.prototype.method1.$wrapped);
                expect(OtherClass.staticMethod1.$wrapped).to.be.equal(SomeMixin.staticMethod1.$wrapped);
                expect(someOtherClass.method1()).to.be.equal('foo');
                expect(SomeOtherClass.staticMethod1()).to.be.equal('bar');
            });
            it('should not grab the initialize method of any class/object', function () {
                var initialize = function () {
                        this.some = 'test';
                    }, SomeImplementation = Class.declare(function ($self) {
                        return {
                            $borrows: {
                                initialize: function () {
                                    this.some = 'nooo';
                                },
                                method1: function () {
                                }
                            },
                            some: 'property',
                            initialize: initialize
                        };
                    }, true), OtherImplementation = Class.declare(function ($self) {
                        return {
                            $borrows: Class.declare(function ($self) {
                                return {
                                    initialize: function () {
                                        this.some = 'nooo';
                                    }
                                };
                            }, true),
                            some: 'property'
                        };
                    }, true), someImplementation = new SomeImplementation(), otherImplementation = new OtherImplementation();
                expect(someImplementation.some).to.be.equal('test');
                expect(otherImplementation.some).to.be.equal('property');
            });
            it('should have passed the specified binds correctly', function () {
                var SomeImplementation = Class.declare(function ($self) {
                        return {
                            $borrows: Class.declare(function ($self) {
                                return {
                                    method1: function () {
                                        this.some = 'test';
                                    }.$bound(),
                                    method2: function () {
                                        this.some = 'test2';
                                    }.$bound()
                                };
                            }, true),
                            some: 'property'
                        };
                    }, true), OtherImplementation = Class.declare(function ($self) {
                        return {
                            $borrows: Class.declare(function ($self) {
                                return {
                                    method1: function () {
                                        this.some = 'test';
                                    }.$bound()
                                };
                            }, true),
                            method2: function () {
                                this.some = 'test2';
                            }.$bound(),
                            some: 'property'
                        };
                    }, true), SomeOtherImplementation = Class.declare(function ($self) {
                        return {
                            $borrows: [
                                Class.declare(function ($self) {
                                    return {
                                        method2: function () {
                                        }.$bound()
                                    };
                                }, true),
                                Class.declare(function ($self) {
                                    return {
                                        method2: function () {
                                        }.$bound()
                                    };
                                }, true)
                            ],
                            method1: function () {
                                this.some = 'test';
                            }.$bound(),
                            method2: function () {
                                this.some = 'test2';
                            },
                            some: 'property'
                        };
                    }, true), AbstractUsageImplementation = function () {
                        var tmp = AbstractClass.declare(function ($self) {
                                return {
                                    $abstracts: {
                                        method1: function () {
                                        }.$bound()
                                    }
                                };
                            }, true);
                        return Class.declare(tmp, function ($super) {
                            return {
                                method1: function () {
                                    this.some = 'test';
                                },
                                method2: function () {
                                    this.some = 'test2';
                                }.$bound(),
                                some: 'property'
                            };
                        }, true);
                    }(), OtherAbstractUsageImplementation = function () {
                        var tmp = AbstractClass.declare(function ($self) {
                                return {
                                    $abstracts: {
                                        method1: function () {
                                        }.$bound()
                                    },
                                    method2: function () {
                                        this.some = 'test2';
                                    }.$bound()
                                };
                            }, true);
                        return Class.declare(tmp, function ($super) {
                            return {
                                method1: function () {
                                    this.some = 'test';
                                },
                                some: 'property'
                            };
                        }, true);
                    }(), someImplementation = new SomeImplementation(), otherImplementation = new OtherImplementation(), someOtherImplementation = new SomeOtherImplementation(), abstractUsageImplementation = new AbstractUsageImplementation(), otherAbstractUsageImplementation = new OtherAbstractUsageImplementation();
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
        });
        describe('Final members', function () {
            it('should be accessible just as normal parameter/function', function () {
                var SomeClass = Class.declare(function ($self) {
                        return {
                            $finals: {
                                foo: 'bar',
                                someFunction: function () {
                                    return this.foo;
                                }
                            }
                        };
                    }, true), someClass = new SomeClass();
                expect(someClass.foo).to.be.equal('bar');
                expect(someClass.someFunction()).to.be.equal('bar');
            });
        });
        describe('Constants', function () {
            var SomeClass = Class.declare(function ($self) {
                    return { $constants: { FOO: 'bar' } };
                }, true), SomeInterface = Interface.declare({ $constants: { FOO: 'bar' } });
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
            var SomeClass = Class.declare(function ($self) {
                    return {
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
                            return $self.__SOME;
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
                            __funcStatic: function () {
                            },
                            __propStatic: 'property'
                        },
                        $constants: { __SOME: 'foo' }
                    };
                });
            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should not be available in the prototype', function () {
                    expect(SomeClass.prototype.__func).to.be.equal(undefined);
                    expect(SomeClass.prototype.__prop).to.be.equal(undefined);
                });
            }
            it('should not be copied to the childs constructor if they are static', function () {
                expect(function () {
                    var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    return OtherClass.__funcStatic;
                }()).to.be.equal(undefined);
                expect(function () {
                    var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    return OtherClass.__propStatic;
                }()).to.be.equal(undefined);
                expect(function () {
                    var OtherClass = Class.declare(SomeClass, function ($super) {
                            return {};
                        }, true);
                    return OtherClass.__SOME;
                }()).to.be.equal(undefined);
            });
            if (/strict/.test(global.build) && hasDefineProperty) {
                it('should only be available to self', function () {
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {};
                            }, true);
                        return OtherClass.__funcStatic;
                    }()).to.be.equal(undefined);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {};
                            }, true);
                        return OtherClass.__propStatic;
                    }()).to.be.equal(undefined);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        this.__privateMethod();
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        SomeClass.__funcStatic();
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        some: function () {
                                            this.__funcStatic();
                                        }
                                    }
                                };
                            }, true);
                        OtherClass.some();
                    }).to.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        return this.__privateProperty;
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        return SomeClass.__propStatic;
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        some: function () {
                                            return this.__privateProperty;
                                        }
                                    }
                                };
                            }, true);
                        return OtherClass.some();
                    }()).to.be.equal(undefined);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    __test: function () {
                                    }
                                };
                            }, true);
                        return new OtherClass().callTest();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        __test: function () {
                                        }
                                    }
                                };
                            }, true);
                        OtherClass.callTest();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return { __test: 'some' };
                            }, true);
                        return new OtherClass().accessTest();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return { $statics: { __test: 'some' } };
                            }, true);
                        return OtherClass.accessTest();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var tmp = Class.declare(function ($self) {
                                return {
                                    initialize: function () {
                                        this.__test();
                                    }
                                };
                            }, true), OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    __test: function () {
                                    }
                                };
                            }, true);
                        return new OtherClass();
                    }).to.throwException(/access private/);
                    expect(function () {
                        var tmp = Class.declare(function ($self) {
                                return {
                                    initialize: function () {
                                        this.__test = 'test';
                                    }
                                };
                            }, true), OtherClass = Class.declare(tmp, function ($super) {
                                return { __test: 'some' };
                            }, true);
                        return new OtherClass();
                    }).to.throwException(/set private/);
                    expect(function () {
                        new SomeClass().__privateMethod();
                    }).to.throwException(/access private/);
                    expect(function () {
                        new SomeClass().__privateProperty();
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
                        new SomeClass().getProp();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    getProp: function () {
                                        return $super.getProp.call(this);
                                    }
                                };
                            }, true);
                        return new OtherClass().getProp();
                    }).to.not.throwException();
                    expect(function () {
                        new SomeClass().getProp2();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    getProp2: function () {
                                        return $super.getProp2.call(this);
                                    }
                                };
                            }, true);
                        return new OtherClass().getProp2();
                    }).to.not.throwException();
                    expect(function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }()).to.be.equal('test');
                    expect(function () {
                        return new SomeClass().accessStaticProp();
                    }).to.not.throwException();
                    expect(function () {
                        return new SomeClass().accessStaticFunc();
                    }).to.not.throwException();
                    expect(function () {
                        return SomeClass.accessConst();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst2();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst3();
                    }()).to.be.equal('foo');
                    expect(function () {
                        var SomeTestClass = Class.declare(function ($self) {
                                return {
                                    __someVar: 'foo',
                                    __someMethod: function () {
                                    },
                                    test: function () {
                                        return this.__someVar;
                                    },
                                    test2: function () {
                                        this.__someMethod();
                                    }
                                };
                            }, true), OtherClass = Class.declare(function ($self) {
                                return { $borrows: SomeTestClass };
                            }, true), myOtherClass = new OtherClass();
                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();
                });
                it('cannot be overrided', function () {
                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return {
                                __getProp: function () {
                                }
                            };
                        }, true);
                    }).to.throwException(/override private/);
                    expect(function () {
                        return Class.declare(SomeClass, function ($super) {
                            return { __privateProperty: 'foo' };
                        }, true);
                    }).to.throwException(/override private/);
                });
                it('should do well with borrowed members', function () {
                    expect(function () {
                        var secondClass, BaseClass = AbstractClass.declare(function ($self) {
                                return {};
                            }, true), FirstClass = Class.declare(BaseClass, function ($super) {
                                return { $borrows: Emitter.DirectEventsEmitter };
                            }, true), firstClass = new FirstClass(), SecondClass = Class.declare(BaseClass, function ($super) {
                                return {
                                    $borrows: Emitter.DirectEventsEmitter,
                                    run: function () {
                                        this._begin();
                                    },
                                    _begin: function () {
                                        firstClass.addListener('yeaa', function () {
                                        }, this);
                                    }
                                };
                            }, true);
                        secondClass = new SecondClass();
                        secondClass.run();
                    }).to.not.throwException();
                });
            }
        });
        describe('Protected members', function () {
            var SomeClass = Class.declare(function ($self) {
                    return {
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
                            return $self._SOME;
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
                        $constants: { _SOME: 'foo' }
                    };
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
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        this._protectedMethod();
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                                return {
                                    some: function () {
                                        $self._funcStatic();
                                    }
                                };
                            });
                        new OtherClass().some();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        some: function () {
                                            this._funcStatic();
                                        }
                                    }
                                };
                            }, true);
                        OtherClass.some();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    some: function () {
                                        return this._protectedProperty;
                                    }
                                };
                            }, true);
                        new OtherClass().some();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        some: function () {
                                            return this._protectedProperty;
                                        }
                                    }
                                };
                            }, true);
                        return OtherClass.some();
                    }()).to.be.equal(undefined);
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    _test: function () {
                                    }
                                };
                            }, true);
                        return new OtherClass().callTest();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    $statics: {
                                        _test: function () {
                                        }
                                    }
                                };
                            }, true);
                        OtherClass.callTest();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return { _test: 'some' };
                            }, true);
                        return new OtherClass().accessTest();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return { $statics: { _test: 'some' } };
                            }, true);
                        return OtherClass.accessTest();
                    }).to.not.throwException();
                    expect(function () {
                        var tmp = Class.declare(function ($self) {
                                return {
                                    initialize: function () {
                                        this._test();
                                    }
                                };
                            }, true), OtherClass = Class.declare(tmp, function ($super) {
                                return {
                                    _test: function () {
                                    }
                                };
                            }, true);
                        return new OtherClass();
                    }).to.not.throwException();
                    expect(function () {
                        var tmp = Class.declare(function ($self) {
                                return {
                                    initialize: function () {
                                        this._test = 'test';
                                    }
                                };
                            }, true), OtherClass = Class.declare(tmp, function ($super) {
                                return { _test: 'some' };
                            }, true);
                        return new OtherClass();
                    }).to.not.throwException();
                    expect(function () {
                        new SomeClass()._protectedMethod();
                    }).to.throwException(/access protected/);
                    expect(function () {
                        return new SomeClass()._protectedProperty;
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
                        new SomeClass().getProp();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    getProp: function () {
                                        return $super.getProp.call(this);
                                    }
                                };
                            }, true);
                        return new OtherClass().getProp();
                    }).to.not.throwException();
                    expect(function () {
                        new SomeClass().getProp2();
                    }).to.not.throwException();
                    expect(function () {
                        var OtherClass = Class.declare(SomeClass, function ($super) {
                                return {
                                    getProp2: function () {
                                        return $super.getProp2.call(this);
                                    }
                                };
                            }, true);
                        return new OtherClass().getProp2();
                    }).to.not.throwException();
                    expect(function () {
                        var test = new SomeClass();
                        test.setProp();
                        return test.getProp();
                    }()).to.be.equal('test');
                    expect(function () {
                        return SomeClass.accessConst();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst2();
                    }()).to.be.equal('foo');
                    expect(function () {
                        return new SomeClass().getConst3();
                    }()).to.be.equal('foo');
                    expect(function () {
                        var SomeClass = Class.declare(function ($self) {
                                return {
                                    _someVar: 'foo',
                                    _someMethod: function () {
                                    },
                                    test: function () {
                                        return this._someVar;
                                    },
                                    test2: function () {
                                        this._someMethod();
                                    }
                                };
                            }, true), OtherClass = Class.declare(function ($self) {
                                return { $borrows: SomeClass };
                            }, true), myOtherClass = new OtherClass();
                        myOtherClass.test();
                        myOtherClass.test2();
                    }).to.not.throwException();
                    expect(function () {
                        var Common = Class.declare(function ($self) {
                                return {};
                            }, true), A = Class.declare(Common, function ($super) {
                                return {
                                    foo: function (b) {
                                        return 'ola ' + b._bar();
                                    }
                                };
                            }, true), B = Class.declare(Common, function ($super) {
                                return {
                                    _bar: function () {
                                        return 'mundo';
                                    }
                                };
                            }, true), a = new A(), b = new B();
                        a.foo(b);
                    }).to.throwException(/access protected/);
                });
            }
            it('should work well with $super()', function () {
                var OtherClass = Class.declare(SomeClass, function ($super, $self, $parent) {
                        return {
                            _getFruit: function () {
                                return 'hot ' + $super._getFruit.call(this);
                            },
                            $statics: {
                                _getFruitStatic: function () {
                                    return 'hot ' + $parent._getFruitStatic.call(this);
                                }
                            }
                        };
                    }), HiClass = Class.declare(OtherClass, function ($super, $self, $parent) {
                        return {
                            _getFruit: function () {
                                return 'hi ' + $super._getFruit.call(this);
                            },
                            $statics: {
                                _getFruitStatic: function () {
                                    return 'hi ' + $parent._getFruitStatic.call(this);
                                }
                            }
                        };
                    }), other = new OtherClass(), hi = new HiClass();
                expect(other.getFruit()).to.be.equal('hot potato');
                expect(hi.getFruit()).to.be.equal('hi hot potato');
                expect(OtherClass.getFruitStatic()).to.be.equal('hot potato');
                expect(HiClass.getFruitStatic()).to.be.equal('hi hot potato');
            });
        });
        describe('instanceOf', function () {
            it('should work the same was as native instanceof works (for normal classes)', function () {
                var Class1 = Class.declare(function ($self) {
                        return {};
                    }, true), Class2 = AbstractClass.declare(function ($self) {
                        return {};
                    }, true), Class3 = Class.declare(Class1, function ($super) {
                        return {};
                    }, true), Class4 = Class.declare(Class2, function ($super) {
                        return {};
                    }, true), Class5 = AbstractClass.declare(Class1, function ($super) {
                        return {};
                    }, true), Class6 = Class.declare(Class5, function ($super) {
                        return {};
                    }, true);
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
            it('should work with interfaces as well', function () {
                var Interface1 = Interface.declare({}), Interface2 = Interface.declare({}), Interface3 = Interface.declare({}), Interface4 = Interface.declare({ $extends: Interface3 }), Interface5 = Interface.declare({
                        $extends: [
                            Interface4,
                            Interface1
                        ]
                    }), Interface6 = Interface5.extend({}), Class1 = Class.declare(function ($self) {
                        return { $implements: Interface1 };
                    }, true), Class2 = AbstractClass.declare(function ($self) {
                        return {
                            $implements: [
                                Interface1,
                                Interface2
                            ]
                        };
                    }, true), Class3 = Class.declare(Class1, function ($super) {
                        return {};
                    }, true), Class4 = Class.declare(Class2, function ($super) {
                        return {};
                    }, true), Class5 = AbstractClass.declare(Class1, function ($super) {
                        return { $implements: Interface3 };
                    }, true), Class6 = Class.declare(Class5, function ($super) {
                        return {};
                    }, true), Class7 = Class.declare(function ($self) {
                        return {
                            $implements: [
                                Interface2,
                                Interface5
                            ]
                        };
                    }, true), Class8 = Class.declare(function ($self) {
                        return { $implements: Interface6 };
                    }, true);
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
        });
        describe('Singletons', function () {
            var Singleton = Class.declare(function ($self) {
                    return {
                        foo: null,
                        _initialize: function () {
                            this.foo = 'bar';
                        },
                        $statics: {
                            getInstance: function () {
                                return new Singleton();
                            }
                        }
                    };
                }, true), Singleton2 = Class.declare(function ($self) {
                    return {
                        foo: null,
                        __initialize: function () {
                            this.foo = 'bar';
                        },
                        $statics: {
                            getInstance: function () {
                                return new Singleton2();
                            }
                        }
                    };
                }, true), SubSingleton = Class.declare(Singleton, function ($super) {
                    return {};
                }, true), SubSingleton2 = Class.declare(Singleton2, function ($super) {
                    return {};
                }, true), OtherSubSingleton = Class.declare(SubSingleton, function ($super) {
                    return {
                        $statics: {
                            getInstance: function () {
                                return new OtherSubSingleton();
                            }
                        }
                    };
                }, true), OtherSubSingleton2 = Class.declare(SubSingleton2, function ($super) {
                    return {
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
                    };
                }, true);
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
    });
});