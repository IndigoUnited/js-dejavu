define("Classify.Abstract",[],function(){function a(a){}return a}),define("Classify.Interface",[],function(){function a(a){function b(a,b){var c;for(c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}function c(){b(this,a)}if(!a)throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1");a.Name||(a.Name="Unnamed");if(a.Name&&typeof a.Name!="string")throw new Error("Classify.Interface's property 'Name' must be a String");return a.Extends&&(c.prototype=a.Extends),new c}return a}),define("Classify.Singleton",[],function(){function a(a){}return a}),define("Trinity/Classify",["Classify.Abstract","Classify.Interface","Classify.Singleton"],function(a,b,c){function d(a){function c(a,b){var c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c])}function d(a,b){var d,e=a.length,f,g;for(d=0;d<e;d+=1)g=a[d],g.prototype&&g.prototype.constructor?(f=g.prototype.constructor,delete g.prototype.constructor,c(g.prototype,b.prototype),g.prototype.constructor=f):c(g.prototype||g,b.prototype)}function e(a,c,d){var e=function(a){return Function.prototype.bind?a.bind(c):function(){return a.apply(c,arguments)}},f=a.length-1;for(f;f>=0;f-=1)d[a[f]]=e(d[a[f]],b)}function f(a){function b(){}return b.prototype=a,new b}function g(a,b){var c,d,e,f;Object.prototype.toString.call(a)!=="[object Array]"&&(a=[a]);for(c=a.length-1;c>=0;c-=1){f=a[c];for(d in f)if(f.hasOwnProperty(d)){if(d!=="Extends"&&d!=="Name"&&d!=="Statics"&&!b.prototype.hasOwnProperty(d))throw new Error("Class does not implements Interface "+f.Name+" correctly, "+d+" was not found");if(d==="Statics"){if(!b.prototype.hasOwnProperty(d))throw new Error("Class does not implements Interface "+f.Name+" correctly, "+d+" method was not found");for(e in f.Statics)if(f.Statics.hasOwnProperty(e)&&!b.hasOwnProperty(e))throw new Error("Class does not implements Interface "+f.Name+" correctly, static method "+d+"  was not found")}}}}var b;return b=a.initialize||function(){},a.Extends?(b.Super=a.Extends.prototype,b.prototype=f(b.Super),c(a,b.prototype)):b.prototype=a,b.prototype.constructor=b,a.Borrows&&(d(a.Borrows,b),delete b.prototype.Borrows),a.Binds&&(e(a.Binds,b,b.prototype),delete b.prototype.Binds),a.Statics&&c(a.Statics,b),a.Implements&&(g(a.Implements,b),delete b.prototype.Implements),delete b.prototype.Statics,b}return d.Abstract=a,d.Interface=b,d.Singleton=c,d})