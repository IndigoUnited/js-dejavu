dejavu
------

[![Build Status](https://secure.travis-ci.org/IndigoUnited/dejavu.png)](http://travis-ci.org/IndigoUnited/dejavu)

Have you ever had the feeling that you're seeing something you've already seen
before? That's the feeling you get when using `dejavu`.

If you are a developer coming from a language like PHP, Java, ActionScript 3.0,
and others, it's likely that you are already familiar with Object Oriented
Programming. However, JavaScript uses prototypal inheritance which, although
powerful and flexible, can be difficult to unde
rstand, and specially to maintain
in large projects.

`dejavu` is a library that delivers classical inheritance on top of JavaScript
prototypal inheritance, making it a breeze to move into JavaScript.



## Why another?

There are some libraries out there able to shim classical inheritance,
however none offers all the functionality that many programmers require.

Also, even though being one of the most feature rich OOP libraries out there, it has an outstanding performance, rivaling with vanilla in production.



## Features

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



## Getting started

The quickest way to start using `dejavu` in your project, is by simply including
`dist/regular/strict/dejavu.js` (note that this is in __strict__ mode).

If you're developing a __client-side__ app, simply put the file in some folder,
and include it in the HTML:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type"
              content="text/html; charset=UTF-8">
        <script type="text/javascript" src="dejavu.js"></script>
    </head>
    <body>
        <script type="text/javascript">
            'use strict';

            // declare the "Person" class
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

            // create a new instance of person
            var indigo = new Person('Marco');
            console.log('A new indigo was born,', indigo.getName());
        </script>
    </body>
</html>
```

This will make a `dejavu` global available for you.
If you're developing in __Node.js__, install it with `npm install dejavu` and use it like so:

```js
var dejavu = require('dejavu');

// declare the "Person" class
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

// create a new instance of person
var indigo = new Person("Marco");
console.log("A new indigo was born,", indigo.getName());
```

The installation will create a `.dejavurc` in your package, where you can enable/disable the strict mode as well as change other dejavu options.
By default the strict mode is used. Still, you want to leverage your package with the loose mode.
Because dejavu reads`.dejavurc` from the process.cwd(), packages that require your package will be running the loose mode unless they also define a `.dejavurc` (which will only happen if they also depend on dejavu directly).



## Performance

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
perform faster than most libraries, even if you don't run the [optimizer](https://github.com/IndigoUnited/dejavu##optimizer).
The optimizer will analyse your code and make some improvements,
boosting it a bit further.

You can check the benchmarks in [jsperf](http://jsperf.com/oop-benchmark/107)
comparing `dejavu` with other OOP libraries. Note that the loose mode
is used in this test, simulating a production environment, and both the normal
and optimized versions are tested. It is also important to mention that many libraries like
[JSFace](https://github.com/tnhu/jsface) does not chain prototypes. This gives
JSFace an extra edge in performance in some browsers, like Firefox, but renders
the `instanceof` operator useless.



## Syntax

### Overview

Here's an overview of what most developers look for in an OOP library. You can find complete examples further down.

```js
var Person = Class.declare({
    // although not mandatory, it's really useful to identify
    // the class name, which simplifies debugging
    $name: 'Person',

    // this is a protected property, which is identified by
    // the single underscore. two underscores denotes a
    // private property, and no underscore stands for public
    _name: null,
    __pinCode: null,

    // class constructor
    initialize: function (name, pinCode) {
        this._name = name;
        this.__pinCode = pinCode;

        // note that we're binding to the current instance with `$bind`.
        // this will be explained with great detail later on
        setTimeout(this._logName.$bind(this), 1000);
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

### Complete example

For those looking for something more, here's a more complete usage of `dejavu`.

This example illustrates the usage of:

- `$name` meta attribute
- `this.$self` vs `this.$static`
- `$super()` for accessing overridden methods
- `instanceOf`
- member visibility
- statics, abstracts, abstract statics, finals, final statics and constants
- `$extends` vs `$borrows`

In this case, and keep in mind that this is just for illustration purposes, we'll create three interfaces, that are implemented by an abstract class, that is then extended by a concrete class.


```js
var dejavu = require('dejavu');

// ------------ AN INTERFACE ------------
// this interface is useless, is only here to illustrate
// that interfaces can extend other interfaces
var UselessInterface = dejavu.Interface.declare({
    $name: 'UselessInterface'
});

var PersonInterface = dejavu.Interface.declare({
    $name: 'PersonInterface',
    // if you need to extend multiple interfaces,
    // just provide an array
    $extends: UselessInterface,

    // interface methods can specify argument list, and any class
    // that implements that interface will be automatically checked,
    // to make sure it obeys the method signature. If you want to
    // specify an optional argument, you should prepend it by a dollar
    // sign, like so: someMethod(arg1, arg2, $thisArgIsOptional)
    getName: function () {},
    setName: function (name) {}
});

// ------------ ANOTHER INTERFACE ------------
var EngineerInterface = dejavu.Interface.declare({
    $name: 'EngineerInterface',

    think: function(subject) {}
});

// ------------ AN ABSTRACT CLASS ------------
var AbstractIndigo = dejavu.AbstractClass.declare({
    $name: 'AbstractIndigo',
    // implements multiple interfaces
    $implements: [PersonInterface, EngineerInterface],

    $constants: {
        INDIGO_WEBSITE: 'http://www.indigounited.com/',
        INDIGO_EMAIL:   'hello@indigounited.com'
    },

    $statics: {
        logIndigoInfo: function () {
            // by using this.$static, we're making sure that dejavu
            // uses late binding to resolve the member. If you're
            // looking for early binding, you can use this.$self
            // instead
            console.log(
                this.$static.INDIGO_WEBSITE,
                this.$static.INDIGO_EMAIL
            );
        }
    },

    // method/attribute visibility is controlled by
    // the number of underscores that the identifier
    // has:
    // public:    no underscores
    // protected: 1 underscore
    // private:   2 underscores
    //
    // the attribute below is protected
    _name: null,

    getName: function () {
        return this._name;
    },

    setName: function (name) {
        this._name = name;

        return this;
    },

    // note that we're not implementing the method `think()` of the
    // EngineerInterface. This will be automatically turned into an
    // abstract method, since we're in an abstract class
    $abstracts: {
        beAwesome: function () {}

        // you can also put "$statics {}" here
        // to create an abstract static method
    },

    // finals are not overridable
    $finals: {
        // you can also put "$statics {}" here
        // to create a final static method

        thisIsFinal: function () {
            console.log('Can\'t change this!');
        }
    }
});

// ------------ A CONCRETE CLASS ------------
// also, if you need this concrete class to be final,
// you can just use dejavu.FinalClass.declare instead
var Indigo = dejavu.Class.declare({
    $name: 'Indigo',
    // class extends another one.
    //
    // in case you need to extend from several classes,
    // you can instead use $borrows, and specify an
    // array of identifiers. Still, note that borrowing
    // will not allow you to perform dejavu.instanceOf
    // tests, as the class is not technically extending
    // the other, just borrowing its behaviour.
    $extends: AbstractIndigo,

    _subject: 'nothing',

    initialize: function (name) {
        // call the parent method, in this case the parent constructor,
        // but can be applied to any method when you need to call the
        // overridden method
        this.$super();

        this.setName(name);

        this._logThought();
    },

    beAwesome: function () {
        console.log(this._name, 'is being awesome!');
        this.$self.logIndigoInfo();
        this.think('the next big thing');
    },

    think: function (subject) {
        this._subject = subject;
    },

    _logThought: function () {
        console.log(this._name, 'is thinking about', this._subject);
    }
});

var indigo = new Indigo('André');
indigo.beAwesome();

// check the type of an object
console.log(
    dejavu.instanceOf(indigo, EngineerInterface) ?
    'we have an engineer!'
    : 'say what now?'
);
console.log(dejavu.instanceOf(indigo, Indigo) ?
    'we have an indigo!'
    : 'say what now?'
);
// native instanceof also works for classes, but not for interfaces
console.log((indigo instanceof Indigo) ?
    'we have an indigo!'
    : 'say what now?'
);

```



## Taking it to another level

Front-end devs are encouraged to program using the AMD paradigm because of its obvious benefits.
Since dejavu is built on it, it will integrate seamlessly with your AMD loader.

```js
{
    // your loader config
    paths: {
           'mout': '../vendor/mout/src'
    },
    packages: [
        {
            name: 'dejavu',
            // You can switch to the loose mode anytime
            location: '/path/to/dejavu/dist/strict'
        }
    ]
}
```

With this setup, you can require the dejavu object or specific parts of it:

```js
// Load dejavu completely
define(['dejavu'], function (dejavu) {

    // the dejavu variable is an object that contains:
    // Class
    // FinalClass
    // AbstractClass
    // Interface
    // instanceOf
    // options

    // example usage
    var Person = dejavu.Class.declare({
        initialize: function () {
            // ...
        }
    });

    return Person;
});

// In this case, only the `Class` module of `dejavu` is included,
// which means all the other modules are not loaded.
define(['dejavu/Class'], function (Class) {

    // Example usage
    var Person = Class.declare({
        initialize: function () {
            // ...
        }
    });

    return MyClass;
});
```



## Additional details

### Binding and anonymous members

You will eventually run into a situation where you want to declare a callback that accesses class members. On traditional JavaScript, you would just `var that = this` or `.bind(this)`, and everything would be ok, because there is no restriction on visibility. Since `dejavu` enforces this, you will need to mark that callback as a member of the class, using something like the following:

```js
// ...
var that = this;
setTimeout(function () {
    that._someProperty = 'protected properties on callbacks';
}.$member(), 1000);
```

```js
// ...
setTimeout(function () {
    this._someProperty = 'protected properties on callbacks';
}.$member().bind(this), 1000);
```

If the `$member().bind(this)` is too verbose for you, you can just `.$bind(this)`, which is equivalent.

Finally, when defining a method directly on the class declaration that you know will always be used using the class context, you can bind it right there like so:

```js
var MyClass = dejavu.Class.declare({
    $name: 'MyClass',

    doSomething: function () {
        // notice that _someMethod is $bound() below,
        // which is more efficient than $bind()ing on
        // every execution of doSomething()
        setTimeout(this._someMethod, 1000);
    },

    _someMethod: function () {
        console.log('method efficiently bound');
    }.$bound()
});
```

### Classes/instances are locked

By default, constructors and instances are locked. This means that no one can monkey patch your code.

This behaviour can be changed in two ways:

#### With the $locked flag:

```js
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

Members can be added, replaced and deleted from the prototype:

```js
UnlockedIndigo.prototype.age = 20;
UnlockedIndigo.prototype.talk = function () {
    console.log('... now is running');
};
```

Members can be added, replaced and deleted from the instance:

```js
var filipe     = new UnlockedIndigo();
filipe.friends = ['Marco','Andre'];
filipe.talk    = function () {
    console.log('I am talking about dejavu!');
};
```

#### By setting the global option:

This will change the default behaviour, but classes can still override it with the $locked flag.

```js
dejavu.options.locked = false;
```

Note that once a class is unlocked, its subclasses cannot be locked.
Also, although undeclared members are allowed, they will not have their access controlled (they are interpreted as public).



### Vanilla classes

`dejavu` allows you to extend or borrow vanilla classes. In this case, constructors and instances are forcibly UNLOCKED.

```js
function Person(name) {
    this.name = name;
};

var Engineer = dejavu.Class.declare({
    $extends: Person
});

var filipe = new Engineer('Filipe');
// Engineer class and filipe instance are unlocked

```


### Debugging

In strict mode, logging instances with `console.log` will print some strange stuff (getters, setters, etc).
This happens because `dejavu` manages accesses to private/protected members as well as make other stuff work.
To get around this issue, `dejavu` provides a `console.inspect` method that works just like `console.log` but prints a friendly object representation of the instance.



## Optimizer

`dejavu` bundles an optimizer that makes your code faster and lighter.

It specifically:

- Improves `$super()`, `$self` and `$static` usage
- Removes the need for wrappers, improving performance by a great margin
- Removes abstract functions from abstract classes
- Removes functions from interfaces
- Removes all `$locked` and `$member()` because they are not used in the loose version

The optimizer is located in the `bin` folder.
If you are optimizing your code for `nodejs` then pass the --closure option. This will boost the performance when running code in v8.
Please look at the jsperf results to see the difference in the different browsers.

Example usage:

`node optimizer < file_in.js > file_out.js`

You can also use the optimizer programatically, please check `bin/optimizer` for an example.

`dejavu` also comes with a automaton task.

Below is a sample usage:

```js
var dejavuOptimizer = require('dejavu/tasks/optimizer.autofile');

module.exports = {
    tasks: [
        {
            task: dejavuOptimizer,
            options: {
                files: {
                    'src/myfile.js': 'dst/myfile.opt.js'
                }
            }
        }
    ]
}
```



## Works on

* IE (6+)
* Chrome (4+)
* Safari (3+)
* Firefox (3.6+)
* Opera (9+)
* Node.js and Rhino



## Dependencies

dejavu depends on [mout](https://github.com/mout/mout).
If you use the regular build, you don't need to worry because all functions used from mout are bundled for you.
If you use the AMD build, learn [how](https://github.com/IndigoUnited/dejavu#taking-it-to-another-level) to setup your loader.
If you use dejavu on `node`, `npm` will take care of fetching everything for you.


## Building dejavu

Simply run `npm install` to install all the tools needed.
Then just run `npm run-script build` or `node build`.



## Testing dejavu

`dejavu` has more than 250 tests.
Simply run `npm install` to install all the tools needed.
Then just run `npm test` to execute them.



## License ##

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
