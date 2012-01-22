/**
 *
 * Blueprint - Sugar syntax for Prototypal Inheritance
 *
 * @author Luis Couto
 * @contact lcouto87@gmail.com
 * @version 0.2
 *
 * @license
 *     Copyright (c) 2012 André Cruz, Luís Couto, Marcelo Conceição
 *
 *     Permission is hereby granted, free of charge, to any person obtaining a copy
 *     of this software and associated documentation files (the "Software"), to deal
 *     in the Software without restriction, including without limitation the rights
 *     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *     copies of the Software, and to permit persons to whom the Software is furnished
 *     to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included in all
 *     copies or substantial portions of the Software.
 *
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *     THE SOFTWARE.
 *
 * @copyright 2012 André Cruz, Luís Couto, Marcelo Conceição
 *
 * @example
 *      var Example = Classify({
 *          Extends : ParentBlueprint,
 *          Borrows : [Mixin1, Mixin2],
 *          Binds   : ['method1', 'method2'],
 *          Statics : {
 *              staticMethod1 : function(){},
 *              staticMethod2 : function(){},
 *              staticMethod3 : function(){},
 *          },
 *          initialize : function () {},
 *          method1 : function () {},
 *          method2 : function () {},
 *          method3 : function () {}
 *      });
 * @param {Object} methods Object
 * @returns Function
 */
define("Classify.Singleton",["Classify"],function(a){return a.Singleton=function(a){},a.Singleton}),define("Classify.Interface",["Classify"],function(a){return a.Interface=function(a){function b(a,b){var c;for(c in b)b.hasOwnProperty(c)&&(a[c]=b[c])}function c(){b(this,a)}if(!a)throw new Error("Classify.Interface constructor called with no arguments, but expects at least 1");if(!a.Name)throw new Error("Classify.Interface expects property Name in arguments");if(a.Name&&typeof a.Name!="string")throw new Error("Classify.Interface's property 'Name' must be a String");return a.Extends&&(c.prototype=a.Extends),new c},a.Interface}),define("Classify.Abstract",["Classify"],function(a){return a.Abstract=function(a){},a.Abstract}),define("Classify",["Classify.Singleton","Classify.Interface","Classify.Abstract"],function(){function a(a){function c(a,b){var c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c])}function d(a,b){var d=a.length-1,e;for(d;d>=0;d-=1)a[d].prototype&&a[d].prototype.constructor?(e=a[d].prototype.constructor,delete a[d].prototype.constructor,c(a[d].prototype,b.prototype),a[d].prototype.constructor=e):c(a[d].prototype||a[d],b.prototype)}function e(a,c,d){var e=function(a){return Function.prototype.bind?a.bind(c):function(){return a.apply(c,arguments)}},f=a.length-1;for(f;f>=0;f-=1)d[a[f]]=e(d[a[f]],b)}function f(a){function b(){}return b.prototype=a,new b}function g(a,b){var c=a.length-1,d;for(c;c>=0;c-=1)for(d in a[c])if(!b.hasOwnProperty(d)&&(d!=="Extends"||d!=="Name"))throw new Error("Class does not implements Interface "+a[c].Name+"correctly")}var b;return b=a.initialize||function(){},a.Extends?(b.Parent=a.Extends.prototype,b.prototype=f(b.Parent),c(a,b.prototype)):b.prototype=a,b.prototype.constructor=b,a.Borrows&&d(a.Borrows,b),a.Binds&&e(a.Binds,b,b.prototype),a.Statics&&(c(a.Statics,b),delete b.prototype.Static),a.Implements&&g(a.Implements,this),b}return a.Singleton=require("Classify.Singleton"),a.Interface=require("Classify.Interface"),a.Abstract=require("Classify.Abstract"),a})