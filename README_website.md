# dejavu #

---

[![Build Status](https://secure.travis-ci.org/IndigoUnited/dejavu.png)](http://travis-ci.org/IndigoUnited/dejavu)

Have you ever had the feeling that you're seeing something you've already seen
before? That's the feeling you get when using `dejavu`.

If you are a developer coming from a language like PHP, Java, ActionScript 3.0,
and others, it's likely that you are already familiar with Object Oriented
Programming. However, JavaScript uses prototypal inheritance which, although
powerful and flexible, can be difficult to understand, and specially to maintain
in large projects.

`dejavu` is a library that delivers classical inheritance on top of JavaScript
prototypal inheritance, making it a breeze to move into JavaScript.



## Why another? ##

There are some libraries out there able to shim classical inheritance,
however none offers all the functionality that many programmers require.

Also, even though being one of the most feature rich OOP libraries out there, it has the best performance, rivaling with vanilla in production.



## Features ##

* Classes (concrete, abstract and final)
* Interfaces
* Mixins (so you can get some sort of multiple inheritance)
* Private and protected members
* Static members
* Constants
* Context binding for functions
* Method signature checks
* Possible to extend or borrow from vanilla classes
* Custom instanceOf with support for Interfaces
* Two builds, `regular` and `AMD` based
    * `AMD` optimized for speeding up developer workflow, allowing testing
      without the need to re-compile everything into a single file
    * `regular` if you are not using `AMD` in your projects
* Two modes for each build, `strict` and `loose`
    * `strict` best in development, enforcing a lot of checks, making sure you
      don't make many typical mistakes
    * `loose` best for production, without checks, improving performance

Users are encouraged to declare
['use strict'](https://developer.mozilla.org/en/JavaScript/Strict_mode) while
using the `dejavu` in strict mode, otherwise some code might fail silently.
This can happen because `dejavu` uses `Object.freeze` and `Object.seal` to lock
classes and instances, guaranteeing that no one changes the behaviour of your
classes by replacing methods, etc, and possibly breaking your code, making it
really hard to pin point what's wrong. Although this is the default behaviour, it can be changed.

You will read more on it later in this document.

**Do not confuse 'use strict' with the dejavu strict mode.**




## Getting started ##

The quickest way to start using `dejavu` in your project, is by simply including
`dist/regular/strict/dejavu.js` (note that this is in __strict__ mode).

If you're developing a __client-side__ app, simply put the file in some folder,
and include it in the HTML:

```
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="dejavu.js"></script>
    </head>
    <body>
        <script type="text/javascript">
            'use strict';

            // Declare the "Person" class
            var Person = dejavu.Class.declare({
                _name: null,

                initialize: function(name) {
                    this.setName(name);
                },

                setName: function(name) {
                    this._name = name;

                    return this;
                },

                getName: function() {
                    return this._name;
                }
            });

            // Create a new instance of person
            var indigo = new Person('Marco');
            console.log('A new indigo was born,', indigo.getName());
        </script>
    </body>
</html>
```

This will make a `dejavu` global available for you.
If you're developing in __Node.js__, install it with `npm install dejavu` and use it like so:

```
var dejavu = require('dejavu');

// Declare the "Person" class
var Person = dejavu.Class.declare({
    _name: null,

    initialize: function(name) {
        this.setName(name);
    },

    setName: function(name) {
        this._name = name;

        return this;
    },

    getName: function() {
        return this._name;
    }
});

// Create a new instance of person
var indigo = new Person("Marco");
console.log("A new indigo was born,", indigo.getName());
```

In node, the default mode running will be the strict mode unless the STRICT environmen
 variable is set to false.
Environment variables can be changed system wide or per process like so:

```
process.env.STRICT = false;
```

## Benchmarks ##

## Performance ##

Since all those nice features and common rules of classic OOP degrade
performance, `dejavu` has two separates modes, for different stages in the
development.

The `strict` mode is suitable for __development__, and will do all sorts of
checks, throwing an error when you try to do something considered illegal.

**Note that if your project works in strict mode, it will work in loose mode.**

As for the `loose` mode, there is no overhead associated with checks, thus
making it suitable for __production__, since it will be more efficient and
have a __lower memory footprint and filesize__.

Finally, in order to achieve that extra edge, that puts `dejavu` next to vanilla
JS in terms of performance, you should run the optimizer that is bundled with
the library. Note that this step is completely optional, and `dejavu` will still
perform faster than the other libraries in most browsers, even if you don't run
the optimizer. The optimizer will analyse your code, and make some improvements
boosting it a bit further.

You can check the benchmarks in [jsperf](http://jsperf.com/oop-benchmark/58)
comparing `dejavu` with other OOP libraries. Note that the loose mode
is used in this test, simulating a production environment, and both the normal
and optimized versions are tested.



## Taking it to another level


Front-end devs are encouraged to program using the AMD paradigm because of its obvious benefits.
Since dejavu is built on it, it will integrate seamlessly with your AMD loader.
The easy way to set it up is to define a path for dejavu in your loader config like so:

```
{
   // Your loader config
   paths: {
       // You can switch to the loose mode anytime
       'dejavu': '/path/to/dejavu/dist/strict/main'
   }
}
```
Then require it and use it:

```
define(['dejavu'], function (dejavu) {

    // The dejavu variable is an object that contains:
    // Class
    // FinalClass
    // AbstractClass
    // Interface
    // instanceOf
    // options

    // Example usage
    var Person = dejavu.Class.declare({
        initialize: function () {
            // ...
        }
    });

    return Person;
});
```

If you just want to require specific parts of `dejavu`, you can do so.
In order to achieve this, you must configure your loader like so:


```
{
    // Your loader config
    packages: [
        {
            name: 'dejavu',
            location: '/path/to/dejavu/dist/strict'     // You can switch to the loose mode anytime
        }
    ]
}
```

With this setup, you can still require the dejavu object like shown above or require specific parts of it:

```
define(['dejavu/Class'], function (Class) {

    // Example usage
    var Person = dejavu.Class.declare({
        initialize: function () {
            // ...
        }
    });

    return MyClass;
});
```

As you can see, in this case, only the `Class` module of `dejavu` is included,
which means all the other modules are not loaded.



## Syntax

### Overview

Here's an overview of what most developers look for in an OOP library. You can find complete examples further down.

```
var Person = Class.declare({
    // although not mandatory, it's really useful to identify the class types,
    // which simplifies debugging
    $name: 'Person',

    // this is a protected property, which is identified by the single underscore
    // two underscores denotes a private property, and no underscore stands for public
    _name: null,
    __pinCode: null,

    // class constructor
    initialize: function (name, pinCode) {
        this._name = name;
        this.__pinCode = pinCode;
        
        // create some timer that will callback methods of the class
        setTimeout(this._logName, 1000);
        
        // note that we're binding to the current instance in this case.
        // also note that if this function is to be used only as a callback, you can
        // use $bound(), which will be more efficient
        setTimeout(this._logName, 1000);
    },

    // public method (follows the same visibility logic, in this case with no underscore)
    getName: function () {
        return this._name;
    }
    
    _logName: function () {
        console.log(this._name);
    }
});
```

### Reference

For those looking for something more, here's an example featuring all features. In this case, we'll 

DejaVu allows too to implement interfaces and abstract classes. Here's simple example of each one:

```
var AbstractPerson = AbstractClass.declare({

    $name = 'AbstractPerson',
    
    _name: null
});
```

```
var InterfacePerson = Interface.declare({

    $name = 'InterfacePerson',
    
    getName: function() {}
});
```

The interface and the abstract class now could be integrated into the Person class as we can see below:

```
var Person = Class.declare({
    
    $name = 'Person',
    
    $extends = AbstractPerson,
    
    $implements = InterfacePerson,

    _name: null,

    initialize: function (name) {
        
        this.name = name;
    },

    getName: function () {
        return this._name; 
    }
});
```
The following sections show how you specifically can use other features.



### Class ###



```
var Person = Class.declare({

    $name: 'Person', // $name is an internal option used for debug

    // extends classes - multiple interfaces should be specified as array
    // $extends: [AbstractPerson, AbstractIndigo]
    $extends: AbstractPerson,
    
    // implements interfaces - multiple interfaces should be specified as array
    $implements: InterfacePerson
    
    // use mixins - multiple mixins should be specified as array
    $borrows: Indigo,
    
    // define constants
    $constants: {
        INDIGO: 'nice dudes'
    },
    
    // public property
    isIndigo: null,
    
    // protected property (starts with _)
    _name: null,
    
    // private properties (starts with __)
    
    /**
     * Class constructor.
     */
    initialize: function () {

        // call super
        this.$super();

        // do other stuff
    },
    
    // public method
    getName: function () { // arguments prefixed with a $ are evaluated as optional.
        return this._name; 
    },

    // protected methods (starts with _)

    // private method (starts with __)
    
    // define static properties and methos
    $statics: {
        // Some class static members
    }
});

```

### Abstract classes ###

Methods defined as abstract simply declare the method's signature.
When an abstract class implements an interface and doesn't implement some of its methods, those will be automatically declared as abstract.

Below there is an example of an abstract class.

```
var AbstractPerson = AbstractClass.declare({
    
    $name = 'AbstractPerson',
    
    // here you can define abstract methods
    $abstracts: {

        // you can define abstract methods
            
        $statics: {
            // you can also define abstract static methods
        }
    }
});
```

Abstract classes can extend other abstract classes or concrete classes while implementing other interfaces.

A(n) (abstract) class can extend a another one with extend function, as shown above:

```
var Person = AbstractPerson.extend({

    // class definition
});
```

### Interfaces ###

Interfaces can extends multiple interfaces. 

They can also define static functions signature.

```
var ExtendedInterfacePerson = Interface.declare({

    $name: 'ExtendedInterfacePerson',

    $statics: {
        // this is how you can define statics
    }
});
```
Alternatively, one can extend an interface with the extend() function. The equivalent code of the shown above is:

```
var ExtendedInterfacePerson = InterfacePerson.extend(
    $name: 'ExtendedInterface',
});
```


### Mixins ###

A mixin is a class or object that provides a certain functionality to be reused by other classes, since all their members will be copied (expect for the initialize method).

If clashes occur with multiple mixins, that last one takes precedence.



### Binds ###

The $bound() function allows you to bind a function to the instance.
This is useful if certain functions are meant to be used as callbacks or handlers.
You don't need to bind the function manually, it will be bound for you automatically.

```
var Person = Class.declare({

    $name: 'Person',
    
    /**
     * Constructor.
     */
     initialize: function (element) {
         element.addEventListener('click', this._handleClick);
     },

    /**
     * Handles some click event.
     */
     handleClick: function () {
         console.log('is indigo');
     }.$bound()
});
```

Alternatively, one can use anonymous functions and bind them to the instanjsce to preserve the context as well as allowing private/protected methods invocations.



### Constants ###

The $constants keyword allows you to defined constants.
If Object.defineProperty is available, any attempt to modify the constant value will throw an error (only in thjse strict mode).
Constants can be defined in classes, abstract classes and interfaces.

```
Person.INDIGOS; // 'nice dudes' :)
```


### Final members/classes ###

Final classes cannot be extended.

```
// This class cannot be extended
var FinalPerson = FinalClass.declare({    

    $name: 'FinalPerson',
    
    initialize: function () {
        // ...
    }
});
```
Members that are declared as final cannot be overriden by js child class.

```
var Person = Class.declare({

    $name: 'Person',

    // classes that extend this one are not allowed to override the members below
    $finals: {

        getName: function () {
            // ...
        },

        // you can also define static methods and members as final
        $statics: {
                // ...
        }
    }
});

```
### Option $name ###
This option is only used for debug, and should be the same as class name.

### Calling static methods within an instance ###

To call static methods inside an instance you can use $self and $static.

$self gives access to the class itself and $static gives access to the called class in ajs context of static inheritance.

$self is the same as using the class variable itself.

```
var Indigo1 = Class.declare({
    
    $name: 'Indigo1',
    
    getName: function () {
        
        // same as Filipe.name;
        return this.$self.name;
    },
    $statics: {
        name: 'Marco'
    }
});

```

```
var Indigo2 = Class.declare({

    $name: 'Indigo2',

    getName: function () {
        return this.$static.name;
    },
    $statics: {
        name: 'Andre'
    }
});

```

```
var Indigo3 = Class.declare({

    $name: 'Indigo3',

    $extends: Indigo1
    $statics: {
        bar: 'Filipe'
    }
});

```

```
var Indigo4 = Class.declare({

    $name: 'Indigo4',

    $extends: Indigo2
    $statics: {
        bar: 'Filipe'
    }
});

```

```
Indigo3.getName(); // Marco
Indigo4.getName(); // Filipe
```



### instanceOf ###

The instanceOf function works exactly the same way as the native instanceof except that it also works for interfaces.



### Notes ##

Please avoid using object constructors for strings, objects, booleans and numbers:

```
var Person = Class.declare({

    $name: 'Person',

    // don't use this
    indigo: new String('Filipe'),
    
    // ok
    indigo: 'Filipe'
});
```

###  Classes/instances are locked ###

By default, constructors and instances are locked. This means that no one can monkey patch your code.

This behaviour can be changed in two ways:

#### With the $locked flag:

```
var UnlockedIndigo = Class.declare({

    $name: 'UnlockedIndigo',

    $locked: false

    initialize: function () {
        
        // Altough the foo property is not declared,
        // it will not throw an error
        
        this.name = 'Filipe';           
                                    
    },

    talk: function () {
        console.log('An indigo is talking!');
    }
});
```

Methods can be replaced in the prototype

```
UnlockedIndigo.prototype.talk = function () {

    console.log('... now is running');
};
```

Properties can be added to the instance and methods can be replace in the instance.

```
var Filipe = new UnlockedIndigo();

Filipe.friends = ['Marco','Andre'];

Filipe.talk = function () { 
    console.log('I'm talking about DejaVu!');
};
```

#### By setting the global option:

This will change the default behaviour, but classes can still override it with the $locked flag.

```
dejavu.options.locked = false;
```

Note that once a class is unlocked, its subclasses cannot be locked.
Also, although undeclared members are allowed, they will not have their access controlled (they are interpreted as public).
### Notes ###

Please avoid using object constructors for strings, objects, booleans and numbers:

```
var MyClass = Class.declare({
    foo: new String('bar'),  // Don't use this
    foz: 'bar'               // Ok
});
```

## Vanilla classes ##

DejaVu allows you to extend or borrow vanilla classes. In this case, constructors and instances are UNLOCKED by default.

```
function Person(name) {

    this.name = name;
};

var filipe = new Person('Filipe');


filipe.name  // Filipe

```

Now you can add a new function to Person.

```
Person.prototype.monkey = function () {
    console.log(this.name + ' can monkey patching the code!');
}


filipe.monkey()  // Filipe can monkey patching the code!
```
## Optimizer ##

dejavu bundles an optimizer that makes your code faster and lighter.
It specifically:

* Improves $super and $self usage
* Removes all $name and $locked properties because they are not used in the loose version
* Removes the need for wrappers, improving performance by a great margin
* Removes abstract functions from abstract classes
* Removes functions from interfaces

The optimizer is located in the `bin` folder.
Example usage:

`node optimizer < file_in.js > file_out.js`

dejavu also comes with a grunt task.
Bellow is a sample usage copied from a grunt file:

```
grunt.loadNpmTasks('dejavu');

grunt.initConfig({
    dejavu: {
        optimize: {
            options: {
                exclude: [/bootstrap(\.min)?\.js$/]
            },
            files: {
                'dist/': 'src/**/*.js'
            }
        }
    }
});
```

## Dependencies ##

dejavu depends on [amd-utils](https://github.com/millermedeiros/amd-utils).
If you use the regular build, you don't need to worry because all functions used from amd-utils are bundled for you.
If you use the AMD build, you must specijsfy the path to amd-utils.
For example, if you use [RequireJS](http://requirejs.org/):

```
paths : {
    'amd-utils': '../vendor/amd-utils/src'
},

packages: [
    {
        name: 'dejavu'
        location: '../../dist/amd/strict',
    }
]
```



## Building dejavu ##

Simply run `npm install` to install all the tools needed.
Then just run `npm run-script build` or `node build`.


## Testing dejavu ##

Please take a look at the [test](https://github.com/IndigoUnited/dejavu/tree/master/test) section.



## Works on ##

* IE (6+)
* Chrome (4+)
* Safari (3+)
* Firefox (3.6+)
* Opera (9+)
* Node.js and Rhino


## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).