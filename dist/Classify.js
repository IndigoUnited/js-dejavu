define("Classify.Abstract", [], function() {
    function a(a) {}
    return a;
}), define("Classify.Singleton", [], function() {
    function a(a) {}
    return a;
}), define("Classify.Interface", [], function() {
    function a(a) {
        function b(a, b) {
            var c;
            for (c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        }
        function c() {
            b(this, a);
        }
        if (!a) throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1");
        if (!a.Name) throw new Error("Classify.Interface expects property Name in arguments");
        if (a.Name && typeof a.Name != "string") throw new Error("Classify.Interface's property 'Name' must be a String");
        return a.Extends && (c.prototype = a.Extends), new c;
    }
    return a;
}), define("Classify", [ "Classify.Abstract", "Classify.Singleton", "Classify.Interface" ], function(a, b, c) {
    function d(a) {
        function c(a, b) {
            var c;
            for (c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
        }
        function d(a, b) {
            var d = a.length - 1, e;
            for (d; d >= 0; d -= 1) a[d].prototype && a[d].prototype.constructor ? (e = a[d].prototype.constructor, delete a[d].prototype.constructor, c(a[d].prototype, b.prototype), a[d].prototype.constructor = e) : c(a[d].prototype || a[d], b.prototype);
        }
        function e(a, c, d) {
            var e = function(a) {
                return Function.prototype.bind ? a.bind(c) : function() {
                    return a.apply(c, arguments);
                };
            }, f = a.length - 1;
            for (f; f >= 0; f -= 1) d[a[f]] = e(d[a[f]], b);
        }
        function f(a) {
            function b() {}
            return b.prototype = a, new b;
        }
        function g(a, b) {
            var c = a.length - 1, d;
            for (c; c >= 0; c -= 1) for (d in a[c]) if (!b.hasOwnProperty(d) && (d !== "Extends" || d !== "Name")) throw new Error("Class does not implements Interface " + a[c].Name + "correctly");
        }
        var b;
        return b = a.initialize || function() {}, a.Extends ? (b.Parent = a.Extends.prototype, b.prototype = f(b.Parent), c(a, b.prototype)) : b.prototype = a, b.prototype.constructor = b, a.Borrows && d(a.Borrows, b), a.Binds && e(a.Binds, b, b.prototype), a.Statics && (c(a.Statics, b), delete b.prototype.Static), a.Implements && g(a.Implements, this), b;
    }
    return d.Abstract = a, d.Interface = c, d.Singleton = b, d;
});