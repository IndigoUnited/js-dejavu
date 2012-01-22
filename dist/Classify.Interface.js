define(function() {
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
});