/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-05-16 14:36:50 (f9be68accb407158ba2b1be2c226a6ce1f649314)
*/
// @tag foundation,core
// @define Ext

/**
 * @class Ext
 * @singleton
 */
var Ext = Ext || {};
Ext._startTime = new Date().getTime();
(function() {
    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = true,
        enumerablesTest = {toString: 1},
        emptyFn = function () {},
        // This is the "$previous" method of a hook function on an instance. When called, it
        // calls through the class prototype by the name of the called method.
        callOverrideParent = function () {
            var method = callOverrideParent.caller.caller; // skip callParent (our caller)
            return method.$owner.prototype[method.$name].apply(this, arguments);
        },
        i,
        nonWhitespaceRe = /\S/,
        ExtApp,
        iterableRe = /\[object\s*(?:Array|Arguments|\w*Collection|\w*List|HTML\s+document\.all\s+class)\]/;

    Function.prototype.$extIsFunction = true;

    Ext.global = global;

    for (i in enumerablesTest) {
        enumerables = null;
    }

    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
                       'toLocaleString', 'toString', 'constructor'];
    }

    /**
     * An array containing extra enumerables for old browsers
     * @property {String[]}
     */
    Ext.enumerables = enumerables;

    /**
     * Copies all the properties of config to the specified object.
     * Note that if recursive merging and cloning without referencing the original objects / arrays is needed, use
     * {@link Ext.Object#merge} instead.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} [defaults] A different object that will also be applied for default values
     * @return {Object} returns obj
     */
    Ext.apply = function(object, config, defaults) {
        if (defaults) {
            Ext.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };

    Ext.buildSettings = Ext.apply({
        baseCSSPrefix: 'x-'
    }, Ext.buildSettings || {});

    Ext.apply(Ext, {

        /**
         * @property {String} [name='Ext']
         * <p>The name of the property in the global namespace (The <code>window</code> in browser environments) which refers to the current instance of Ext.</p>
         * <p>This is usually <code>"Ext"</code>, but if a sandboxed build of ExtJS is being used, this will be an alternative name.</p>
         * <p>If code is being generated for use by <code>eval</code> or to create a <code>new Function</code>, and the global instance
         * of Ext must be referenced, this is the name that should be built into the code.</p>
         */
        name: Ext.sandboxName || 'Ext',

        /**
         * @property {Function}
         * A reusable empty function
         */
        emptyFn: emptyFn,
        
        /**
         * A reusable identity function. The function will always return the first argument, unchanged.
         */
        identityFn: function(o) {
            return o;
        },

        /**
         * A zero length string which will pass a truth test. Useful for passing to methods
         * which use a truth test to reject <i>falsy</i> values where a string value must be cleared.
         */
        emptyString: new String(),

        baseCSSPrefix: Ext.buildSettings.baseCSSPrefix,

        /**
         * Copies all the properties of config to object if they don't already exist.
         * @param {Object} object The receiver of the properties
         * @param {Object} config The source of the properties
         * @return {Object} returns obj
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },

        /**
         * Iterates either an array or an object. This method delegates to
         * {@link Ext.Array#each Ext.Array.each} if the given value is iterable, and {@link Ext.Object#each Ext.Object.each} otherwise.
         *
         * @param {Object/Array} object The object or array to be iterated.
         * @param {Function} fn The function to be called for each iteration. See and {@link Ext.Array#each Ext.Array.each} and
         * {@link Ext.Object#each Ext.Object.each} for detailed lists of arguments passed to this function depending on the given object
         * type that is being iterated.
         * @param {Object} scope (Optional) The scope (`this` reference) in which the specified function is executed.
         * Defaults to the object being iterated itself.
         * @markdown
         */
        iterate: function(object, fn, scope) {
            if (Ext.isEmpty(object)) {
                return;
            }

            if (scope === undefined) {
                scope = object;
            }

            if (Ext.isIterable(object)) {
                Ext.Array.each.call(Ext.Array, object, fn, scope);
            }
            else {
                Ext.Object.each.call(Ext.Object, object, fn, scope);
            }
        }
    });

    Ext.apply(Ext, {

        /**
         * This method deprecated. Use {@link Ext#define Ext.define} instead.
         * @method
         * @param {Function} superclass
         * @param {Object} overrides
         * @return {Function} The subclass constructor from the <tt>overrides</tt> parameter, or a generated one if not provided.
         * @deprecated 4.0.0 Use {@link Ext#define Ext.define} instead
         */
        extend: (function() {
            // inline overrides
            var objectConstructor = objectPrototype.constructor,
                inlineOverrides = function(o) {
                for (var m in o) {
                    if (!o.hasOwnProperty(m)) {
                        continue;
                    }
                    this[m] = o[m];
                }
            };

            return function(subclass, superclass, overrides) {
                // First we check if the user passed in just the superClass with overrides
                if (Ext.isObject(superclass)) {
                    overrides = superclass;
                    superclass = subclass;
                    subclass = overrides.constructor !== objectConstructor ? overrides.constructor : function() {
                        superclass.apply(this, arguments);
                    };
                }

                if (!superclass) {
                    Ext.Error.raise({
                        sourceClass: 'Ext',
                        sourceMethod: 'extend',
                        msg: 'Attempting to extend from a class which has not been loaded on the page.'
                    });
                }

                // We create a new temporary class
                var F = function() {},
                    subclassProto, superclassProto = superclass.prototype;

                F.prototype = superclassProto;
                subclassProto = subclass.prototype = new F();
                subclassProto.constructor = subclass;
                subclass.superclass = superclassProto;

                if (superclassProto.constructor === objectConstructor) {
                    superclassProto.constructor = superclass;
                }

                subclass.override = function(overrides) {
                    Ext.override(subclass, overrides);
                };

                subclassProto.override = inlineOverrides;
                subclassProto.proto = subclassProto;

                subclass.override(overrides);
                subclass.extend = function(o) {
                    return Ext.extend(subclass, o);
                };

                return subclass;
            };
        }()),

        /**
         * Overrides members of the specified `target` with the given values.
         * 
         * If the `target` is a class declared using {@link Ext#define Ext.define}, the
         * `override` method of that class is called (see {@link Ext.Base#override}) given
         * the `overrides`.
         *
         * If the `target` is a function, it is assumed to be a constructor and the contents
         * of `overrides` are applied to its `prototype` using {@link Ext#apply Ext.apply}.
         * 
         * If the `target` is an instance of a class declared using {@link Ext#define Ext.define},
         * the `overrides` are applied to only that instance. In this case, methods are
         * specially processed to allow them to use {@link Ext.Base#callParent}.
         * 
         *      var panel = new Ext.Panel({ ... });
         *      
         *      Ext.override(panel, {
         *          initComponent: function () {
         *              // extra processing...
         *              
         *              this.callParent();
         *          }
         *      });
         *
         * If the `target` is none of these, the `overrides` are applied to the `target`
         * using {@link Ext#apply Ext.apply}.
         *
         * Please refer to {@link Ext#define Ext.define} and {@link Ext.Base#override} for
         * further details.
         *
         * @param {Object} target The target to override.
         * @param {Object} overrides The properties to add or replace on `target`. 
         * @method override
         */
        override: function (target, overrides) {
            if (target.$isClass) {
                target.override(overrides);
            } else if (typeof target == 'function') {
                Ext.apply(target.prototype, overrides);
            } else {
                var owner = target.self,
                    name, value;

                if (owner && owner.$isClass) { // if (instance of Ext.define'd class)
                    for (name in overrides) {
                        if (overrides.hasOwnProperty(name)) {
                            value = overrides[name];

                            if (typeof value == 'function') {
                                if (owner.$className) {
                                    value.displayName = owner.$className + '#' + name;
                                }

                                value.$name = name;
                                value.$owner = owner;
                                value.$previous = target.hasOwnProperty(name)
                                    ? target[name] // already hooked, so call previous hook
                                    : callOverrideParent; // calls by name on prototype
                            }

                            target[name] = value;
                        }
                    }
                } else {
                    Ext.apply(target, overrides);
                }
            }

            return target;
        }
    });

    // A full set of static methods to do type checking
    Ext.apply(Ext, {

        /**
         * Returns the given value itself if it's not empty, as described in {@link Ext#isEmpty}; returns the default
         * value (second argument) otherwise.
         *
         * @param {Object} value The value to test
         * @param {Object} defaultValue The value to return if the original value is empty
         * @param {Boolean} allowBlank (optional) true to allow zero length strings to qualify as non-empty (defaults to false)
         * @return {Object} value, if non-empty, else defaultValue
         */
        valueFrom: function(value, defaultValue, allowBlank){
            return Ext.isEmpty(value, allowBlank) ? defaultValue : value;
        },

        /**
         * Returns the type of the given variable in string format. List of possible values are:
         *
         * - `undefined`: If the given value is `undefined`
         * - `null`: If the given value is `null`
         * - `string`: If the given value is a string
         * - `number`: If the given value is a number
         * - `boolean`: If the given value is a boolean value
         * - `date`: If the given value is a `Date` object
         * - `function`: If the given value is a function reference
         * - `object`: If the given value is an object
         * - `array`: If the given value is an array
         * - `regexp`: If the given value is a regular expression
         * - `element`: If the given value is a DOM Element
         * - `textnode`: If the given value is a DOM text node and contains something other than whitespace
         * - `whitespace`: If the given value is a DOM text node and contains only whitespace
         *
         * @param {Object} value
         * @return {String}
         * @markdown
         */
        typeOf: function(value) {
            var type,
                typeToString;
            
            if (value === null) {
                return 'null';
            }

            type = typeof value;

            if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }

            typeToString = toString.call(value);

            switch(typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }

            if (type === 'function') {
                return 'function';
            }

            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return (nonWhitespaceRe).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    }
                    else {
                        return 'element';
                    }
                }

                return 'object';
            }

            Ext.Error.raise({
                sourceClass: 'Ext',
                sourceMethod: 'typeOf',
                msg: 'Failed to determine the type of the specified value "' + value + '". This is most likely a bug.'
            });
        },

        /**
         * Coerces the first value if possible so that it is comparable to the second value.
         *
         * Coercion only works between the basic atomic data types String, Boolean, Number, Date, null and undefined.
         *
         * Numbers and numeric strings are coerced to Dates using the value as the millisecond era value.
         *
         * Strings are coerced to Dates by parsing using the {@link Ext.Date#defaultFormat defaultFormat}.
         * 
         * For example
         *
         *     Ext.coerce('false', true);
         *     
         * returns the boolean value `false` because the second parameter is of type `Boolean`.
         * 
         * @param {Mixed} from The value to coerce
         * @param {Mixed} to The value it must be compared against
         * @return The coerced value.
         */
        coerce: function(from, to) {
            var fromType = Ext.typeOf(from),
                toType = Ext.typeOf(to),
                isString = typeof from === 'string';

            if (fromType !== toType) {
                switch (toType) {
                    case 'string':
                        return String(from);
                    case 'number':
                        return Number(from);
                    case 'boolean':
                        return isString && (!from || from === 'false') ? false : Boolean(from);
                    case 'null':
                        return isString && (!from || from === 'null') ? null : from;
                    case 'undefined':
                        return isString && (!from || from === 'undefined') ? undefined : from;
                    case 'date':
                        return isString && isNaN(from) ? Ext.Date.parse(from, Ext.Date.defaultFormat) : Date(Number(from));
                }
            }
            return from;
        },

        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         * @markdown
         */
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Ext.isArray(value) && value.length === 0);
        },

        /**
         * Returns true if the passed value is a JavaScript Array, false otherwise.
         *
         * @param {Object} target The target to test
         * @return {Boolean}
         * @method
         */
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
            return toString.call(value) === '[object Array]';
        },

        /**
         * Returns true if the passed value is a JavaScript Date object, false otherwise.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isDate: function(value) {
            return toString.call(value) === '[object Date]';
        },

        /**
         * Returns true if the passed value is a JavaScript Object, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         * @method
         */
        isObject: (toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        },

        /**
         * @private
         */
        isSimpleObject: function(value) {
            return value instanceof Object && value.constructor === Object;
        },
        /**
         * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isPrimitive: function(value) {
            var type = typeof value;

            return type === 'string' || type === 'number' || type === 'boolean';
        },

        /**
         * Returns true if the passed value is a JavaScript Function, false otherwise.
         * @param {Object} value The value to test
         * @return {Boolean}
         * @method
         */
        isFunction: function(value) {
            return !!(value && value.$extIsFunction);
        },

        /**
         * Returns true if the passed value is a number. Returns false for non-finite numbers.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isNumber: function(value) {
            return typeof value === 'number' && isFinite(value);
        },

        /**
         * Validates that a value is numeric.
         * @param {Object} value Examples: 1, '1', '2.34'
         * @return {Boolean} True if numeric, false otherwise
         */
        isNumeric: function(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * Returns true if the passed value is a string.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * Returns true if the passed value is a boolean.
         *
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns `true` if the passed value is iterable, that is, if elements of it are addressable using array
         * notation with numeric indices, `false` otherwise.
         *
         * Arrays and function `arguments` objects are iterable. Also HTML collections such as `NodeList` and `HTMLCollection'
         * are iterable.
         *
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isIterable: function(value) {
            // To be iterable, the object must have a numeric length property and must not be a string or function.
            if (!value || typeof value.length !== 'number' || typeof value === 'string' || value.$extIsFunction) {
                return false;
            }

            // Certain "standard" collections in IE (such as document.images) do not offer the correct
            // Javascript Object interface; specifically, they lack the propertyIsEnumerable method.
            // And the item property while it does exist is not typeof "function"
            if (!value.propertyIsEnumerable) {
                return !!value.item;
            }

            // If it is a regular, interrogatable JS object (not an IE ActiveX object), then...
            // If it has its own property called "length", but not enumerable, it's iterable
            if (value.hasOwnProperty('length') && !value.propertyIsEnumerable('length')) {
                return true;
            }

            // Test against whitelist which includes known iterable collection types
            return iterableRe.test(toString.call(value));
        }
    });

    Ext.apply(Ext, {

        /**
         * Clone simple variables including array, {}-like objects, DOM nodes and Date without keeping the old reference.
         * A reference for the object itself is returned if it's not a direct decendant of Object. For model cloning,
         * see {@link Ext.data.Model#copy Model.copy}.
         * 
         * @param {Object} item The variable to clone
         * @return {Object} clone
         */
        clone: function(item) {
            var type,
                i,
                j,
                k,
                clone,
                key;
            
            if (item === null || item === undefined) {
                return item;
            }

            // DOM nodes
            // TODO proxy this to Ext.Element.clone to handle automatic id attribute changing
            // recursively
            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }

            type = toString.call(item);

            // Date
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }


            // Array
            if (type === '[object Array]') {
                i = item.length;

                clone = [];

                while (i--) {
                    clone[i] = Ext.clone(item[i]);
                }
            }
            // Object
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = Ext.clone(item[key]);
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        if (item.hasOwnProperty(k)) {
                            clone[k] = item[k];
                        }
                    }
                }
            }

            return clone || item;
        },

        /**
         * @private
         * Generate a unique reference of Ext in the global scope, useful for sandboxing
         */
        getUniqueGlobalNamespace: function() {
            var uniqueGlobalNamespace = this.uniqueGlobalNamespace,
                i;

            if (uniqueGlobalNamespace === undefined) {
                i = 0;

                do {
                    uniqueGlobalNamespace = 'ExtBox' + (++i);
                } while (Ext.global[uniqueGlobalNamespace] !== undefined);

                Ext.global[uniqueGlobalNamespace] = Ext;
                this.uniqueGlobalNamespace = uniqueGlobalNamespace;
            }

            return uniqueGlobalNamespace;
        },
        
        /**
         * @private
         */
        functionFactoryCache: {},
        
        cacheableFunctionFactory: function() {
            var me = this,
                args = Array.prototype.slice.call(arguments),
                cache = me.functionFactoryCache,
                idx, fn, ln;
                
             if (Ext.isSandboxed) {
                ln = args.length;
                if (ln > 0) {
                    ln--;
                    args[ln] = 'var Ext=window.' + Ext.name + ';' + args[ln];
                }
            }
            idx = args.join('');
            fn = cache[idx];
            if (!fn) {
                fn = Function.prototype.constructor.apply(Function.prototype, args);
                
                cache[idx] = fn;
            }
            return fn;
        },
        
        functionFactory: function() {
            var me = this,
                args = Array.prototype.slice.call(arguments),
                ln;
                
            if (Ext.isSandboxed) {
                ln = args.length;
                if (ln > 0) {
                    ln--;
                    args[ln] = 'var Ext=window.' + Ext.name + ';' + args[ln];
                }
            }
     
            return Function.prototype.constructor.apply(Function.prototype, args);
        },

        /**
         * @private
         * @property
         */
        Logger: {
            verbose: emptyFn,
            log: emptyFn,
            info: emptyFn,
            warn: emptyFn,
            error: function(message) {
                throw new Error(message);
            },
            deprecate: emptyFn
        }
    });

    /**
     * Old alias to {@link Ext#typeOf}
     * @deprecated 4.0.0 Use {@link Ext#typeOf} instead
     * @method
     * @inheritdoc Ext#typeOf
     */
    Ext.type = Ext.typeOf;
    
    // When using Cmd optimizations, the namespace Ext.app may already be defined
    // by this point since it's done up front by the tool. Check if app already
    // exists before overwriting it.
    ExtApp = Ext.app;
    if (!ExtApp) {
        ExtApp = Ext.app = {};
    }
    Ext.apply(ExtApp, {
        namespaces: {},
        
        /**
        * @private
        */
        collectNamespaces: function(paths) {
            var namespaces = Ext.app.namespaces,
                path;
            
            for (path in paths) {
                if (paths.hasOwnProperty(path)) {
                    namespaces[path] = true;
                }
            }
        },

        /**
        * Adds namespace(s) to known list.
        *
        * @param {String/String[]} namespace
        */
        addNamespaces: function(ns) {
            var namespaces = Ext.app.namespaces,
                i, l;

            if (!Ext.isArray(ns)) {
                ns = [ns];
            }

            for (i = 0, l = ns.length; i < l; i++) {
                namespaces[ns[i]] = true;
            }
        },

        /**
        * @private Clear all namespaces from known list.
        */
        clearNamespaces: function() {
            Ext.app.namespaces = {};
        },

        /**
        * Get namespace prefix for a class name.
        *
        * @param {String} className
        *
        * @return {String} Namespace prefix if it's known, otherwise undefined
        */
        getNamespace: function(className) {
            var namespaces    = Ext.app.namespaces,
                deepestPrefix = '',
                prefix;

            for (prefix in namespaces) {
                if (namespaces.hasOwnProperty(prefix)    &&
                    prefix.length > deepestPrefix.length &&
                    (prefix + '.' === className.substring(0, prefix.length + 1))) {
                    deepestPrefix = prefix;
                }
            }

            return deepestPrefix === '' ? undefined : deepestPrefix;
        }
    });
}());

/*
 * This method evaluates the given code free of any local variable. In some browsers this
 * will be at global scope, in others it will be in a function.
 * @parma {String} code The code to evaluate.
 * @private
 * @method
 */
Ext.globalEval = Ext.global.execScript
    ? function(code) {
        execScript(code);
    }
    : function($$code) {
        // IMPORTANT: because we use eval we cannot place this in the above function or it
        // will break the compressor's ability to rename local variables...
        (function(){
            // This var should not be replaced by the compressor. We need to do this so
            // that Ext refers to the global Ext, if we're sandboxing it may
            // refer to the local instance inside the closure
            var Ext = this.Ext;
            eval($$code);
        }());
    };

// @tag foundation,core
// @require ../Ext.js
// @define Ext.Version

/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.Version
 *
 * A utility class that wrap around a string version number and provide convenient
 * method to perform comparison. See also: {@link Ext.Version#compare compare}. Example:
 *
 *     var version = new Ext.Version('1.0.2beta');
 *     console.log("Version is " + version); // Version is 1.0.2beta
 *
 *     console.log(version.getMajor()); // 1
 *     console.log(version.getMinor()); // 0
 *     console.log(version.getPatch()); // 2
 *     console.log(version.getBuild()); // 0
 *     console.log(version.getRelease()); // beta
 *
 *     console.log(version.isGreaterThan('1.0.1')); // True
 *     console.log(version.isGreaterThan('1.0.2alpha')); // True
 *     console.log(version.isGreaterThan('1.0.2RC')); // False
 *     console.log(version.isGreaterThan('1.0.2')); // False
 *     console.log(version.isLessThan('1.0.2')); // True
 *
 *     console.log(version.match(1.0)); // True
 *     console.log(version.match('1.0.2')); // True
 *
 */
(function() {

// Current core version
// also fix Ext-more.js
var version = '4.2.1.883', Version;
    Ext.Version = Version = Ext.extend(Object, {

        /**
         * @param {String/Number} version The version number in the following standard format:
         *
         *     major[.minor[.patch[.build[release]]]]
         *
         * Examples:
         *
         *     1.0
         *     1.2.3beta
         *     1.2.3.4RC
         *
         * @return {Ext.Version} this
         */
        constructor: function(version) {
            var parts, releaseStartIndex;

            if (version instanceof Version) {
                return version;
            }

            this.version = this.shortVersion = String(version).toLowerCase().replace(/_/g, '.').replace(/[\-+]/g, '');

            releaseStartIndex = this.version.search(/([^\d\.])/);

            if (releaseStartIndex !== -1) {
                this.release = this.version.substr(releaseStartIndex, version.length);
                this.shortVersion = this.version.substr(0, releaseStartIndex);
            }

            this.shortVersion = this.shortVersion.replace(/[^\d]/g, '');

            parts = this.version.split('.');

            this.major = parseInt(parts.shift() || 0, 10);
            this.minor = parseInt(parts.shift() || 0, 10);
            this.patch = parseInt(parts.shift() || 0, 10);
            this.build = parseInt(parts.shift() || 0, 10);

            return this;
        },

        /**
         * Override the native toString method
         * @private
         * @return {String} version
         */
        toString: function() {
            return this.version;
        },

        /**
         * Override the native valueOf method
         * @private
         * @return {String} version
         */
        valueOf: function() {
            return this.version;
        },

        /**
         * Returns the major component value
         * @return {Number} major
         */
        getMajor: function() {
            return this.major || 0;
        },

        /**
         * Returns the minor component value
         * @return {Number} minor
         */
        getMinor: function() {
            return this.minor || 0;
        },

        /**
         * Returns the patch component value
         * @return {Number} patch
         */
        getPatch: function() {
            return this.patch || 0;
        },

        /**
         * Returns the build component value
         * @return {Number} build
         */
        getBuild: function() {
            return this.build || 0;
        },

        /**
         * Returns the release component value
         * @return {Number} release
         */
        getRelease: function() {
            return this.release || '';
        },

        /**
         * Returns whether this version if greater than the supplied argument
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version if greater than the target, false otherwise
         */
        isGreaterThan: function(target) {
            return Version.compare(this.version, target) === 1;
        },

        /**
         * Returns whether this version if greater than or equal to the supplied argument
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version if greater than or equal to the target, false otherwise
         */
        isGreaterThanOrEqual: function(target) {
            return Version.compare(this.version, target) >= 0;
        },

        /**
         * Returns whether this version if smaller than the supplied argument
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version if smaller than the target, false otherwise
         */
        isLessThan: function(target) {
            return Version.compare(this.version, target) === -1;
        },

        /**
         * Returns whether this version if less than or equal to the supplied argument
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version if less than or equal to the target, false otherwise
         */
        isLessThanOrEqual: function(target) {
            return Version.compare(this.version, target) <= 0;
        },

        /**
         * Returns whether this version equals to the supplied argument
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version equals to the target, false otherwise
         */
        equals: function(target) {
            return Version.compare(this.version, target) === 0;
        },

        /**
         * Returns whether this version matches the supplied argument. Example:
         *
         *     var version = new Ext.Version('1.0.2beta');
         *     console.log(version.match(1)); // True
         *     console.log(version.match(1.0)); // True
         *     console.log(version.match('1.0.2')); // True
         *     console.log(version.match('1.0.2RC')); // False
         *
         * @param {String/Number} target The version to compare with
         * @return {Boolean} True if this version matches the target, false otherwise
         */
        match: function(target) {
            target = String(target);
            return this.version.substr(0, target.length) === target;
        },

        /**
         * Returns this format: [major, minor, patch, build, release]. Useful for comparison
         * @return {Number[]}
         */
        toArray: function() {
            return [this.getMajor(), this.getMinor(), this.getPatch(), this.getBuild(), this.getRelease()];
        },

        /**
         * Returns shortVersion version without dots and release
         * @return {String}
         */
        getShortVersion: function() {
            return this.shortVersion;
        },

        /**
         * Convenient alias to {@link Ext.Version#isGreaterThan isGreaterThan}
         * @param {String/Number} target
         * @return {Boolean}
         */
        gt: function() {
            return this.isGreaterThan.apply(this, arguments);
        },

        /**
         * Convenient alias to {@link Ext.Version#isLessThan isLessThan}
         * @param {String/Number} target
         * @return {Boolean}
         */
        lt: function() {
            return this.isLessThan.apply(this, arguments);
        },

        /**
         * Convenient alias to {@link Ext.Version#isGreaterThanOrEqual isGreaterThanOrEqual}
         * @param {String/Number} target
         * @return {Boolean}
         */
        gtEq: function() {
            return this.isGreaterThanOrEqual.apply(this, arguments);
        },

        /**
         * Convenient alias to {@link Ext.Version#isLessThanOrEqual isLessThanOrEqual}
         * @param {String/Number} target
         * @return {Boolean}
         */
        ltEq: function() {
            return this.isLessThanOrEqual.apply(this, arguments);
        }
    });

    Ext.apply(Version, {
        // @private
        releaseValueMap: {
            'dev': -6,
            'alpha': -5,
            'a': -5,
            'beta': -4,
            'b': -4,
            'rc': -3,
            '#': -2,
            'p': -1,
            'pl': -1
        },

        /**
         * Converts a version component to a comparable value
         *
         * @static
         * @param {Object} value The value to convert
         * @return {Object}
         */
        getComponentValue: function(value) {
            return !value ? 0 : (isNaN(value) ? this.releaseValueMap[value] || value : parseInt(value, 10));
        },

        /**
         * Compare 2 specified versions, starting from left to right. If a part contains special version strings,
         * they are handled in the following order:
         * 'dev' < 'alpha' = 'a' < 'beta' = 'b' < 'RC' = 'rc' < '#' < 'pl' = 'p' < 'anything else'
         *
         * @static
         * @param {String} current The current version to compare to
         * @param {String} target The target version to compare to
         * @return {Number} Returns -1 if the current version is smaller than the target version, 1 if greater, and 0 if they're equivalent
         */
        compare: function(current, target) {
            var currentValue, targetValue, i;

            current = new Version(current).toArray();
            target = new Version(target).toArray();

            for (i = 0; i < Math.max(current.length, target.length); i++) {
                currentValue = this.getComponentValue(current[i]);
                targetValue = this.getComponentValue(target[i]);

                if (currentValue < targetValue) {
                    return -1;
                } else if (currentValue > targetValue) {
                    return 1;
                }
            }

            return 0;
        }
    });

    /**
     * @class Ext
     */
    Ext.apply(Ext, {
        /**
         * @private
         */
        versions: {},

        /**
         * @private
         */
        lastRegisteredVersion: null,

        /**
         * Set version number for the given package name.
         *
         * @param {String} packageName The package name, for example: 'core', 'touch', 'extjs'
         * @param {String/Ext.Version} version The version, for example: '1.2.3alpha', '2.4.0-dev'
         * @return {Ext}
         */
        setVersion: function(packageName, version) {
            Ext.versions[packageName] = new Version(version);
            Ext.lastRegisteredVersion = Ext.versions[packageName];

            return this;
        },

        /**
         * Get the version number of the supplied package name; will return the last registered version
         * (last Ext.setVersion call) if there's no package name given.
         *
         * @param {String} packageName (Optional) The package name, for example: 'core', 'touch', 'extjs'
         * @return {Ext.Version} The version
         */
        getVersion: function(packageName) {
            if (packageName === undefined) {
                return Ext.lastRegisteredVersion;
            }

            return Ext.versions[packageName];
        },

        /**
         * Create a closure for deprecated code.
         *
         *     // This means Ext.oldMethod is only supported in 4.0.0beta and older.
         *     // If Ext.getVersion('extjs') returns a version that is later than '4.0.0beta', for example '4.0.0RC',
         *     // the closure will not be invoked
         *     Ext.deprecate('extjs', '4.0.0beta', function() {
         *         Ext.oldMethod = Ext.newMethod;
         *
         *         ...
         *     });
         *
         * @param {String} packageName The package name
         * @param {String} since The last version before it's deprecated
         * @param {Function} closure The callback function to be executed with the specified version is less than the current version
         * @param {Object} scope The execution scope (`this`) if the closure
         */
        deprecate: function(packageName, since, closure, scope) {
            if (Version.compare(Ext.getVersion(packageName), since) < 1) {
                closure.call(scope);
            }
        }
    }); // End Versioning

    Ext.setVersion('core', version);

}());

// @tag foundation,core
// @require ../version/Version.js
// @define Ext.String

/**
 * @class Ext.String
 *
 * A collection of useful static methods to deal with strings.
 * @singleton
 */

Ext.String = (function() {
    var trimRegex     = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
        escapeRe      = /('|\\)/g,
        formatRe      = /\{(\d+)\}/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        basicTrimRe   = /^\s+|\s+$/g,
        whitespaceRe  = /\s+/,
        varReplace    = /(^[^a-z]*|[^\w])/gi,
        charToEntity,
        entityToChar,
        charToEntityRegex,
        entityToCharRegex,
        htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        },
        htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        },
        boundsCheck = function(s, other){
            if (s === null || s === undefined || other === null || other === undefined) {
                return false;
            }
            
            return other.length <= s.length; 
        };

    return {
        
        /**
         * Inserts a substring into a string.
         * @param {String} s The original string.
         * @param {String} value The substring to insert.
         * @param {Number} index The index to insert the substring. Negative indexes will insert from the end of
         * the string. Example: 
         *
         *     Ext.String.insert("abcdefg", "h", -1); // abcdefhg
         *
         * @return {String} The value with the inserted substring
         */
        insert: function(s, value, index) {
            if (!s) {
                return value;
            }
            
            if (!value) {
                return s;
            }
            
            var len = s.length;
            
            if (!index && index !== 0) {
                index = len;
            }
            
            if (index < 0) {
                index *= -1;
                if (index >= len) {
                    // negative overflow, insert at start
                    index = 0;
                } else {
                    index = len - index;
                }
            }
            
            if (index === 0) {
                s = value + s;
            } else if (index >= s.length) {
                s += value;
            } else {
                s = s.substr(0, index) + value + s.substr(index);
            }
            return s;
        },
        
        /**
         * Checks if a string starts with a substring
         * @param {String} s The original string
         * @param {String} start The substring to check
         * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
         */
        startsWith: function(s, start, ignoreCase){
            var result = boundsCheck(s, start);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    start = start.toLowerCase();
                }
                result = s.lastIndexOf(start, 0) === 0;
            }
            return result;
        },
        
        /**
         * Checks if a string ends with a substring
         * @param {String} s The original string
         * @param {String} start The substring to check
         * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
         */
        endsWith: function(s, end, ignoreCase){
            var result = boundsCheck(s, end);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    end = end.toLowerCase();
                }
                result = s.indexOf(end, s.length - end.length) !== -1;
            }
            return result;
        },

        /**
         * Converts a string of characters into a legal, parse-able JavaScript `var` name as long as the passed
         * string contains at least one alphabetic character. Non alphanumeric characters, and *leading* non alphabetic
         * characters will be removed.
         * @param {String} s A string to be converted into a `var` name.
         * @return {String} A legal JavaScript `var` name.
         */
        createVarName: function(s) {
            return s.replace(varReplace, '');
        },

        /**
         * Convert certain characters (&, <, >, ', and ") to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode.
         * @return {String} The encoded text.
         * @method
         */
        htmlEncode: function(value) {
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
        },

        /**
         * Convert certain characters (&, <, >, ', and ") from their HTML character equivalents.
         * @param {String} value The string to decode.
         * @return {String} The decoded text.
         * @method
         */
        htmlDecode: function(value) {
            return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
        },

        /**
         * Adds a set of character entity definitions to the set used by
         * {@link Ext.String#htmlEncode} and {@link Ext.String#htmlDecode}.
         *
         * This object should be keyed by the entity name sequence,
         * with the value being the textual representation of the entity.
         *
         *      Ext.String.addCharacterEntities({
         *          '&amp;Uuml;':'Ü',
         *          '&amp;ccedil;':'ç',
         *          '&amp;ntilde;':'ñ',
         *          '&amp;egrave;':'è'
         *      });
         *      var s = Ext.String.htmlEncode("A string with entities: èÜçñ");
         *
         * __Note:__ the values of the character entities defined on this object are expected
         * to be single character values.  As such, the actual values represented by the
         * characters are sensitive to the character encoding of the JavaScript source
         * file when defined in string literal form. Script tags referencing server
         * resources with character entities must ensure that the 'charset' attribute
         * of the script node is consistent with the actual character encoding of the
         * server resource.
         *
         * The set of character entities may be reset back to the default state by using
         * the {@link Ext.String#resetCharacterEntities} method
         *
         * @param {Object} entities The set of character entities to add to the current
         * definitions.
         */
        addCharacterEntities: function(newEntities) {
            var charKeys = [],
                entityKeys = [],
                key, echar;
            for (key in newEntities) {
                echar = newEntities[key];
                entityToChar[key] = echar;
                charToEntity[echar] = key;
                charKeys.push(echar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        },

        /**
         * Resets the set of character entity definitions used by
         * {@link Ext.String#htmlEncode} and {@link Ext.String#htmlDecode} back to the
         * default state.
         */
        resetCharacterEntities: function() {
            charToEntity = {};
            entityToChar = {};
            // add the default set
            this.addCharacterEntities({
                '&amp;'     :   '&',
                '&gt;'      :   '>',
                '&lt;'      :   '<',
                '&quot;'    :   '"',
                '&#39;'     :   "'"
            });
        },

        /**
         * Appends content to the query string of a URL, handling logic for whether to place
         * a question mark or ampersand.
         * @param {String} url The URL to append to.
         * @param {String} string The content to append to the URL.
         * @return {String} The resulting URL
         */
        urlAppend : function(url, string) {
            if (!Ext.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * Trims whitespace from either end of a string, leaving spaces within the string intact.  Example:
         *
         *     var s = '  foo bar  ';
         *     alert('-' + s + '-');                   //alerts "- foo bar -"
         *     alert('-' + Ext.String.trim(s) + '-');  //alerts "-foo bar-"
         *
         * @param {String} string The string to trim.
         * @return {String} The trimmed string.
         */
        trim: function(string) {
            return string.replace(trimRegex, "");
        },

        /**
         * Capitalize the given string
         * @param {String} string
         * @return {String}
         */
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.substr(1);
        },

        /**
         * Uncapitalize the given string.
         * @param {String} string
         * @return {String}
         */
        uncapitalize: function(string) {
            return string.charAt(0).toLowerCase() + string.substr(1);
        },

        /**
         * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length.
         * @param {String} value The string to truncate.
         * @param {Number} length The maximum length to allow before truncating.
         * @param {Boolean} [word=false] `true` to try to find a common word break.
         * @return {String} The converted text.
         */
        ellipsis: function(value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index !== -1 && index >= (len - 15)) {
                        return vs.substr(0, index) + "...";
                    }
                }
                return value.substr(0, len - 3) + "...";
            }
            return value;
        },

        /**
         * Escapes the passed string for use in a regular expression.
         * @param {String} string
         * @return {String}
         */
        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },

        /**
         * Escapes the passed string for ' and \
         * @param {String} string The string to escape
         * @return {String} The escaped string
         */
        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },

        /**
         * Utility function that allows you to easily switch a string between two alternating values.  The passed value
         * is compared to the current string, and if they are equal, the other value that was passed in is returned.  If
         * they are already different, the first value passed in is returned.  Note that this method returns the new value
         * but does not change the current string.
         *
         *     // alternate sort directions
         *     sort = Ext.String.toggle(sort, 'ASC', 'DESC');
         *
         *     // instead of conditional logic:
         *     sort = (sort === 'ASC' ? 'DESC' : 'ASC');
         *
         * @param {String} string The current string.
         * @param {String} value The value to compare to the current string.
         * @param {String} other The new value to use if the string already equals the first value passed in.
         * @return {String} The new value.
         */
        toggle: function(string, value, other) {
            return string === value ? other : value;
        },

        /**
         * Pads the left side of a string with a specified character.  This is especially useful
         * for normalizing number and date strings.  Example usage:
         *
         *     var s = Ext.String.leftPad('123', 5, '0');
         *     // s now contains the string: '00123'
         *
         * @param {String} string The original string.
         * @param {Number} size The total length of the output string.
         * @param {String} [character=' '] (optional) The character with which to pad the original string.
         * @return {String} The padded string.
         */
        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },

        /**
         * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
         * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
         *
         *     var cls = 'my-class',
         *         text = 'Some text';
         *     var s = Ext.String.format('<div class="{0}">{1}</div>', cls, text);
         *     // s now contains the string: '<div class="my-class">Some text</div>'
         *
         * @param {String} string The tokenized string to be formatted.
         * @param {Mixed...} values The values to replace tokens `{0}`, `{1}`, etc in order.
         * @return {String} The formatted string.
         */
        format: function(format) {
            var args = Ext.Array.toArray(arguments, 1);
            return format.replace(formatRe, function(m, i) {
                return args[i];
            });
        },

        /**
         * Returns a string with a specified number of repetitions a given string pattern.
         * The pattern be separated by a different string.
         *
         *      var s = Ext.String.repeat('---', 4); // = '------------'
         *      var t = Ext.String.repeat('--', 3, '/'); // = '--/--/--'
         *
         * @param {String} pattern The pattern to repeat.
         * @param {Number} count The number of times to repeat the pattern (may be 0).
         * @param {String} sep An option string to separate each pattern.
         */
        repeat: function(pattern, count, sep) {
            if (count < 1) {
                count = 0;
            }
            for (var buf = [], i = count; i--; ) {
                buf.push(pattern);
            }
            return buf.join(sep || '');
        },

        /**
         * Splits a string of space separated words into an array, trimming as needed. If the
         * words are already an array, it is returned.
         *
         * @param {String/Array} words
         */
        splitWords: function (words) {
            if (words && typeof words == 'string') {
                return words.replace(basicTrimRe, '').split(whitespaceRe);
            }
            return words || [];
        }
    };
}());

// initialize the default encode / decode entities
Ext.String.resetCharacterEntities();

/**
 * Old alias to {@link Ext.String#htmlEncode}
 * @deprecated Use {@link Ext.String#htmlEncode} instead
 * @method
 * @member Ext
 * @inheritdoc Ext.String#htmlEncode
 */
Ext.htmlEncode = Ext.String.htmlEncode;


/**
 * Old alias to {@link Ext.String#htmlDecode}
 * @deprecated Use {@link Ext.String#htmlDecode} instead
 * @method
 * @member Ext
 * @inheritdoc Ext.String#htmlDecode
 */
Ext.htmlDecode = Ext.String.htmlDecode;

/**
 * Old alias to {@link Ext.String#urlAppend}
 * @deprecated Use {@link Ext.String#urlAppend} instead
 * @method
 * @member Ext
 * @inheritdoc Ext.String#urlAppend
 */
Ext.urlAppend = Ext.String.urlAppend;

// @tag foundation,core
// @require String.js
// @define Ext.Number

/**
 * @class Ext.Number
 *
 * A collection of useful static methods to deal with numbers
 * @singleton
 */

Ext.Number = new function() {

    var me = this,
        isToFixedBroken = (0.9).toFixed() !== '1',
        math = Math;

    Ext.apply(this, {
        /**
         * Checks whether or not the passed number is within a desired range.  If the number is already within the
         * range it is returned, otherwise the min or max value is returned depending on which side of the range is
         * exceeded. Note that this method returns the constrained value but does not change the current number.
         * @param {Number} number The number to check
         * @param {Number} min The minimum number in the range
         * @param {Number} max The maximum number in the range
         * @return {Number} The constrained value if outside the range, otherwise the current value
         */
        constrain: function(number, min, max) {
            var x = parseFloat(number);

            // Watch out for NaN in Chrome 18
            // V8bug: http://code.google.com/p/v8/issues/detail?id=2056

            // Operators are faster than Math.min/max. See http://jsperf.com/number-constrain
            // ... and (x < Nan) || (x < undefined) == false
            // ... same for (x > NaN) || (x > undefined)
            // so if min or max are undefined or NaN, we never return them... sadly, this
            // is not true of null (but even Math.max(-1,null)==0 and isNaN(null)==false)
            return (x < min) ? min : ((x > max) ? max : x);
        },

        /**
         * Snaps the passed number between stopping points based upon a passed increment value.
         *
         * The difference between this and {@link #snapInRange} is that {@link #snapInRange} uses the minValue
         * when calculating snap points:
         *
         *     r = Ext.Number.snap(56, 2, 55, 65);        // Returns 56 - snap points are zero based
         *
         *     r = Ext.Number.snapInRange(56, 2, 55, 65); // Returns 57 - snap points are based from minValue
         *
         * @param {Number} value The unsnapped value.
         * @param {Number} increment The increment by which the value must move.
         * @param {Number} minValue The minimum value to which the returned value must be constrained. Overrides the increment.
         * @param {Number} maxValue The maximum value to which the returned value must be constrained. Overrides the increment.
         * @return {Number} The value of the nearest snap target.
         */
        snap : function(value, increment, minValue, maxValue) {
            var m;

            // If no value passed, or minValue was passed and value is less than minValue (anything < undefined is false)
            // Then use the minValue (or zero if the value was undefined)
            if (value === undefined || value < minValue) {
                return minValue || 0;
            }

            if (increment) {
                m = value % increment;
                if (m !== 0) {
                    value -= m;
                    if (m * 2 >= increment) {
                        value += increment;
                    } else if (m * 2 < -increment) {
                        value -= increment;
                    }
                }
            }
            return me.constrain(value, minValue,  maxValue);
        },

        /**
         * Snaps the passed number between stopping points based upon a passed increment value.
         *
         * The difference between this and {@link #snap} is that {@link #snap} does not use the minValue
         * when calculating snap points:
         *
         *     r = Ext.Number.snap(56, 2, 55, 65);        // Returns 56 - snap points are zero based
         *
         *     r = Ext.Number.snapInRange(56, 2, 55, 65); // Returns 57 - snap points are based from minValue
         *
         * @param {Number} value The unsnapped value.
         * @param {Number} increment The increment by which the value must move.
         * @param {Number} [minValue=0] The minimum value to which the returned value must be constrained.
         * @param {Number} [maxValue=Infinity] The maximum value to which the returned value must be constrained.
         * @return {Number} The value of the nearest snap target.
         */
        snapInRange : function(value, increment, minValue, maxValue) {
            var tween;

            // default minValue to zero
            minValue = (minValue || 0);

            // If value is undefined, or less than minValue, use minValue
            if (value === undefined || value < minValue) {
                return minValue;
            }

            // Calculate how many snap points from the minValue the passed value is.
            if (increment && (tween = ((value - minValue) % increment))) {
                value -= tween;
                tween *= 2;
                if (tween >= increment) {
                    value += increment;
                }
            }

            // If constraining within a maximum, ensure the maximum is on a snap point
            if (maxValue !== undefined) {
                if (value > (maxValue = me.snapInRange(maxValue, increment, minValue))) {
                    value = maxValue;
                }
            }

            return value;
        },

        /**
         * Formats a number using fixed-point notation
         * @param {Number} value The number to format
         * @param {Number} precision The number of digits to show after the decimal point
         */
        toFixed: isToFixedBroken ? function(value, precision) {
            precision = precision || 0;
            var pow = math.pow(10, precision);
            return (math.round(value * pow) / pow).toFixed(precision);
        } : function(value, precision) {
            return value.toFixed(precision);
        },

        /**
         * Validate that a value is numeric and convert it to a number if necessary. Returns the specified default value if
         * it is not.

    Ext.Number.from('1.23', 1); // returns 1.23
    Ext.Number.from('abc', 1); // returns 1

         * @param {Object} value
         * @param {Number} defaultValue The value to return if the original value is non-numeric
         * @return {Number} value, if numeric, defaultValue otherwise
         */
        from: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }

            return !isNaN(value) ? value : defaultValue;
        },

        /**
         * Returns a random integer between the specified range (inclusive)
         * @param {Number} from Lowest value to return.
         * @param {Number} to Highst value to return.
         * @return {Number} A random integer within the specified range.
         */
        randomInt: function (from, to) {
           return math.floor(math.random() * (to - from + 1) + from);
        },
        
        /**
         * Corrects floating point numbers that overflow to a non-precise
         * value because of their floating nature, for example `0.1 + 0.2`
         * @param {Number} The number
         * @return {Number} The correctly rounded number
         */
        correctFloat: function(n) {
            // This is to correct the type of errors where 2 floats end with
            // a long string of decimals, eg 0.1 + 0.2. When they overflow in this
            // manner, they usually go to 15-16 decimals, so we cut it off at 14.
            return parseFloat(n.toPrecision(14));
        }
    });

    /**
     * @deprecated 4.0.0 Please use {@link Ext.Number#from} instead.
     * @member Ext
     * @method num
     * @inheritdoc Ext.Number#from
     */
    Ext.num = function() {
        return me.from.apply(this, arguments);
    };
};

// @tag foundation,core
// @require Number.js
// @define Ext.Array

/**
 * @class Ext.Array
 * @singleton
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 *
 * A set of useful static methods to deal with arrays; provide missing methods for older browsers.
 */
(function() {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = (function () {
            var array = [],
                lengthBefore,
                j = 20;

            if (!array.splice) {
                return false;
            }

            // This detects a bug in IE8 splice method:
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");

            lengthBefore = array.length; //41
            array.splice(13, 0, "XXX"); // add one element

            if (lengthBefore+1 != array.length) {
                return false;
            }
            // end IE8 bug

            return true;
        }()),
        supportsForEach = 'forEach' in arrayPrototype,
        supportsMap = 'map' in arrayPrototype,
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsEvery = 'every' in arrayPrototype,
        supportsSome = 'some' in arrayPrototype,
        supportsFilter = 'filter' in arrayPrototype,
        supportsSort = (function() {
            var a = [1,2,3,4,5].sort(function(){ return 0; });
            return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
        }()),
        supportsSliceOnNodeList = true,
        ExtArray,
        erase,
        replace,
        splice;

    try {
        // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }

    function fixArrayIndex (array, index) {
        return (index < 0) ? Math.max(0, array.length + index)
                           : Math.min(array.length, index);
    }

    /*
    Does the same work as splice, but with a slightly more convenient signature. The splice
    method has bugs in IE8, so this is the implementation we use on that platform.

    The rippling of items in the array can be tricky. Consider two use cases:

                  index=2
                  removeCount=2
                 /=====\
        +---+---+---+---+---+---+---+---+
        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
        +---+---+---+---+---+---+---+---+
                         /  \/  \/  \/  \
                        /   /\  /\  /\   \
                       /   /  \/  \/  \   +--------------------------+
                      /   /   /\  /\   +--------------------------+   \
                     /   /   /  \/  +--------------------------+   \   \
                    /   /   /   /+--------------------------+   \   \   \
                   /   /   /   /                             \   \   \   \
                  v   v   v   v                               v   v   v   v
        +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
        | 0 | 1 | 4 | 5 | 6 | 7 |       | 0 | 1 | a | b | c | 4 | 5 | 6 | 7 |
        +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
        A                               B        \=========/
                                                 insert=[a,b,c]

    In case A, it is obvious that copying of [4,5,6,7] must be left-to-right so
    that we don't end up with [0,1,6,7,6,7]. In case B, we have the opposite; we
    must go right-to-left or else we would end up with [0,1,a,b,c,4,4,4,4].
    */
    function replaceSim (array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index),
            remove,
            tailOldPos,
            tailNewPos,
            tailCount,
            lengthAfterRemove,
            i;

        // we try to use Array.push when we can for efficiency...
        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            remove = Math.min(removeCount, length - pos);
            tailOldPos = pos + remove;
            tailNewPos = tailOldPos + add - remove;
            tailCount = length - tailOldPos;
            lengthAfterRemove = length - remove;

            if (tailNewPos < tailOldPos) { // case A
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } else if (tailNewPos > tailOldPos) { // case B
                for (i = tailCount; i--; ) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } // else, add == remove (nothing to do)

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove; // truncate array
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add; // reserves space
                for (i = 0; i < add; ++i) {
                    array[pos+i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative (array, index, removeCount, insert) {
        if (insert && insert.length) {
            // Inserting at index zero with no removing: use unshift
            if (index === 0 && !removeCount) {
                array.unshift.apply(array, insert);
            }
            // Inserting/replacing in middle of array
            else if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            }
            // Appending to array
            else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim (array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative (array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim (array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos+removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    erase = supportsSplice ? eraseNative : eraseSim;
    replace = supportsSplice ? replaceNative : replaceSim;
    splice = supportsSplice ? spliceNative : spliceSim;

    // NOTE: from here on, use erase, replace or splice (not native methods)...

    ExtArray = Ext.Array = {
        /**
         * Iterates an array or an iterable value and invoke the given callback function for each item.
         *
         *     var countries = ['Vietnam', 'Singapore', 'United States', 'Russia'];
         *
         *     Ext.Array.each(countries, function(name, index, countriesItSelf) {
         *         console.log(name);
         *     });
         *
         *     var sum = function() {
         *         var sum = 0;
         *
         *         Ext.Array.each(arguments, function(value) {
         *             sum += value;
         *         });
         *
         *         return sum;
         *     };
         *
         *     sum(1, 2, 3); // returns 6
         *
         * The iteration can be stopped by returning false in the function callback.
         *
         *     Ext.Array.each(countries, function(name, index, countriesItSelf) {
         *         if (name === 'Singapore') {
         *             return false; // break here
         *         }
         *     });
         *
         * {@link Ext#each Ext.each} is alias for {@link Ext.Array#each Ext.Array.each}
         *
         * @param {Array/NodeList/Object} iterable The value to be iterated. If this
         * argument is not iterable, the callback function is called once.
         * @param {Function} fn The callback function. If it returns false, the iteration stops and this method returns
         * the current `index`.
         * @param {Object} fn.item The item at the current `index` in the passed `array`
         * @param {Number} fn.index The current `index` within the `array`
         * @param {Array} fn.allItems The `array` itself which was passed as the first argument
         * @param {Boolean} fn.return Return false to stop iteration.
         * @param {Object} scope (Optional) The scope (`this` reference) in which the specified function is executed.
         * @param {Boolean} reverse (Optional) Reverse the iteration order (loop from the end to the beginning)
         * Defaults false
         * @return {Boolean} See description for the `fn` parameter.
         */
        each: function(array, fn, scope, reverse) {
            array = ExtArray.from(array);

            var i,
                ln = array.length;

            if (reverse !== true) {
                for (i = 0; i < ln; i++) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }
            else {
                for (i = ln - 1; i > -1; i--) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }

            return true;
        },

        /**
         * Iterates an array and invoke the given callback function for each item. Note that this will simply
         * delegate to the native Array.prototype.forEach method if supported. It doesn't support stopping the
         * iteration by returning false in the callback function like {@link Ext.Array#each}. However, performance
         * could be much better in modern browsers comparing with {@link Ext.Array#each}
         *
         * @param {Array} array The array to iterate
         * @param {Function} fn The callback function.
         * @param {Object} fn.item The item at the current `index` in the passed `array`
         * @param {Number} fn.index The current `index` within the `array`
         * @param {Array}  fn.allItems The `array` itself which was passed as the first argument
         * @param {Object} scope (Optional) The execution scope (`this`) in which the specified function is executed.
         */
        forEach: supportsForEach ? function(array, fn, scope) {
            array.forEach(fn, scope);
        } : function(array, fn, scope) {
            var i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                fn.call(scope, array[i], i, array);
            }
        },

        /**
         * Get the index of the provided `item` in the given `array`, a supplement for the
         * missing arrayPrototype.indexOf in Internet Explorer.
         *
         * @param {Array} array The array to check
         * @param {Object} item The item to look for
         * @param {Number} from (Optional) The index at which to begin the search
         * @return {Number} The index of item in the array (or -1 if it is not found)
         */
        indexOf: supportsIndexOf ? function(array, item, from) {
            return arrayPrototype.indexOf.call(array, item, from);
         } : function(array, item, from) {
            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * Checks whether or not the given `array` contains the specified `item`
         *
         * @param {Array} array The array to check
         * @param {Object} item The item to look for
         * @return {Boolean} True if the array contains the item, false otherwise
         */
        contains: supportsIndexOf ? function(array, item) {
            return arrayPrototype.indexOf.call(array, item) !== -1;
        } : function(array, item) {
            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Converts any iterable (numeric indices and a length property) into a true array.
         *
         *     function test() {
         *         var args = Ext.Array.toArray(arguments),
         *             fromSecondToLastArgs = Ext.Array.toArray(arguments, 1);
         *
         *         alert(args.join(' '));
         *         alert(fromSecondToLastArgs.join(' '));
         *     }
         *
         *     test('just', 'testing', 'here'); // alerts 'just testing here';
         *                                      // alerts 'testing here';
         *
         *     Ext.Array.toArray(document.getElementsByTagName('div')); // will convert the NodeList into an array
         *     Ext.Array.toArray('splitted'); // returns ['s', 'p', 'l', 'i', 't', 't', 'e', 'd']
         *     Ext.Array.toArray('splitted', 0, 3); // returns ['s', 'p', 'l']
         *
         * {@link Ext#toArray Ext.toArray} is alias for {@link Ext.Array#toArray Ext.Array.toArray}
         *
         * @param {Object} iterable the iterable object to be turned into a true Array.
         * @param {Number} start (Optional) a zero-based index that specifies the start of extraction. Defaults to 0
         * @param {Number} end (Optional) a 1-based index that specifies the end of extraction. Defaults to the last
         * index of the iterable value
         * @return {Array} array
         */
        toArray: function(iterable, start, end){
            if (!iterable || !iterable.length) {
                return [];
            }

            if (typeof iterable === 'string') {
                iterable = iterable.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(iterable, start || 0, end || iterable.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? iterable.length + end : end) : iterable.length;

            for (i = start; i < end; i++) {
                array.push(iterable[i]);
            }

            return array;
        },

        /**
         * Plucks the value of a property from each item in the Array. Example:
         *
         *     Ext.Array.pluck(Ext.query("p"), "className"); // [el1.className, el2.className, ..., elN.className]
         *
         * @param {Array/NodeList} array The Array of items to pluck the value from.
         * @param {String} propertyName The property name to pluck from each element.
         * @return {Array} The value from each item in the Array.
         */
        pluck: function(array, propertyName) {
            var ret = [],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                ret.push(item[propertyName]);
            }

            return ret;
        },

        /**
         * Creates a new array with the results of calling a provided function on every element in this array.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being iterated.
         * @param {Object} [scope] Callback function scope
         * @return {Array} results
         */
        map: supportsMap ? function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.map must have a callback function passed as second argument.');
            }
            return array.map(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.map must have a callback function passed as second argument.');
            }
            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        /**
         * Executes the specified function for each array element until the function returns a falsy value.
         * If such an item is found, the function will return false immediately.
         * Otherwise, it will return true.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being iterated.
         * @param {Object} scope Callback function scope
         * @return {Boolean} True if no false value is returned by the callback function.
         */
        every: supportsEvery ? function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            return array.every(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Executes the specified function for each array element until the function returns a truthy value.
         * If such an item is found, the function will return true immediately. Otherwise, it will return false.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being iterated.
         * @param {Object} scope Callback function scope
         * @return {Boolean} True if the callback function returns a truthy value.
         */
        some: supportsSome ? function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
            return array.some(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },
        
        /**
         * Shallow compares the contents of 2 arrays using strict equality.
         * @param {Array} array1
         * @param {Array} array2
         * @return {Boolean} `true` if the arrays are equal.
         */
        equals: function(array1, array2) {
            var len1 = array1.length,
                len2 = array2.length,
                i;
                
            // Short circuit if the same array is passed twice
            if (array1 === array2) {
                return true;
            }
                
            if (len1 !== len2) {
                return false;
            }
            
            for (i = 0; i < len1; ++i) {
                if (array1[i] !== array2[i]) {
                    return false;
                }
            }
            
            return true;
        },

        /**
         * Filter through an array and remove empty item as defined in {@link Ext#isEmpty Ext.isEmpty}
         *
         * See {@link Ext.Array#filter}
         *
         * @param {Array} array
         * @return {Array} results
         */
        clean: function(array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Ext.isEmpty(item)) {
                    results.push(item);
                }
            }

            return results;
        },

        /**
         * Returns a new array with unique items
         *
         * @param {Array} array
         * @return {Array} results
         */
        unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (ExtArray.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

        /**
         * Creates a new array with all of the elements of this array for which
         * the provided filtering function returns true.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being iterated.
         * @param {Object} scope Callback function scope
         * @return {Array} results
         */
        filter: supportsFilter ? function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.filter must have a filter function passed as second argument.');
            }
            return array.filter(fn, scope);
        } : function(array, fn, scope) {
            if (!fn) {
                Ext.Error.raise('Ext.Array.filter must have a filter function passed as second argument.');
            }
            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
        },

        /**
         * Returns the first item in the array which elicits a true return value from the
         * passed selection function.
         * @param {Array} array The array to search
         * @param {Function} fn The selection function to execute for each item.
         * @param {Mixed} fn.item The array item.
         * @param {String} fn.index The index of the array item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the
         * function is executed. Defaults to the array
         * @return {Object} The first item in the array which returned true from the selection
         * function, or null if none was found.
         */
        findBy : function(array, fn, scope) {
            var i = 0,
                len = array.length;

            for (; i < len; i++) {
                if (fn.call(scope || array, array[i], i)) {
                    return array[i];
                }
            }
            return null;
        },

        /**
         * Converts a value to an array if it's not already an array; returns:
         *
         * - An empty array if given value is `undefined` or `null`
         * - Itself if given value is already an array
         * - An array copy if given value is {@link Ext#isIterable iterable} (arguments, NodeList and alike)
         * - An array with one item which is the given value, otherwise
         *
         * @param {Object} value The value to convert to an array if it's not already is an array
         * @param {Boolean} newReference (Optional) True to clone the given array and return a new reference if necessary,
         * defaults to false
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Ext.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            var type = typeof value;
            // Both strings and functions will have a length property. In phantomJS, NodeList
            // instances report typeof=='function' but don't have an apply method...
            if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                return ExtArray.toArray(value);
            }

            return [value];
        },

        /**
         * Removes the specified item from the array if it exists
         *
         * @param {Array} array The array
         * @param {Object} item The item to remove
         * @return {Array} The passed array itself
         */
        remove: function(array, item) {
            var index = ExtArray.indexOf(array, item);

            if (index !== -1) {
                erase(array, index, 1);
            }

            return array;
        },

        /**
         * Push an item into the array only if the array doesn't contain it yet
         *
         * @param {Array} array The array
         * @param {Object} item The item to include
         */
        include: function(array, item) {
            if (!ExtArray.contains(array, item)) {
                array.push(item);
            }
        },

        /**
         * Clone a flat array without referencing the previous one. Note that this is different
         * from Ext.clone since it doesn't handle recursive cloning. It's simply a convenient, easy-to-remember method
         * for Array.prototype.slice.call(array)
         *
         * @param {Array} array The array
         * @return {Array} The clone array
         */
        clone: function(array) {
            return slice.call(array);
        },

        /**
         * Merge multiple arrays into one with unique items.
         *
         * {@link Ext.Array#union} is alias for {@link Ext.Array#merge}
         *
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} merged
         */
        merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;

            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }

            return ExtArray.unique(array);
        },

        /**
         * Merge multiple arrays into one with unique items that exist in all of the arrays.
         *
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} intersect
         */
        intersect: function() {
            var intersection = [],
                arrays = slice.call(arguments),
                arraysLength,
                array,
                arrayLength,
                minArray,
                minArrayIndex,
                minArrayCandidate,
                minArrayLength,
                element,
                elementCandidate,
                elementCount,
                i, j, k;

            if (!arrays.length) {
                return intersection;
            }

            // Find the smallest array
            arraysLength = arrays.length;
            for (i = minArrayIndex = 0; i < arraysLength; i++) {
                minArrayCandidate = arrays[i];
                if (!minArray || minArrayCandidate.length < minArray.length) {
                    minArray = minArrayCandidate;
                    minArrayIndex = i;
                }
            }

            minArray = ExtArray.unique(minArray);
            erase(arrays, minArrayIndex, 1);

            // Use the smallest unique'd array as the anchor loop. If the other array(s) do contain
            // an item in the small array, we're likely to find it before reaching the end
            // of the inner loop and can terminate the search early.
            minArrayLength = minArray.length;
            arraysLength = arrays.length;
            for (i = 0; i < minArrayLength; i++) {
                element = minArray[i];
                elementCount = 0;

                for (j = 0; j < arraysLength; j++) {
                    array = arrays[j];
                    arrayLength = array.length;
                    for (k = 0; k < arrayLength; k++) {
                        elementCandidate = array[k];
                        if (element === elementCandidate) {
                            elementCount++;
                            break;
                        }
                    }
                }

                if (elementCount === arraysLength) {
                    intersection.push(element);
                }
            }

            return intersection;
        },

        /**
         * Perform a set difference A-B by subtracting all items in array B from array A.
         *
         * @param {Array} arrayA
         * @param {Array} arrayB
         * @return {Array} difference
         */
        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        /**
         * Returns a shallow copy of a part of an array. This is equivalent to the native
         * call "Array.prototype.slice.call(array, begin, end)". This is often used when "array"
         * is "arguments" since the arguments object does not supply a slice method but can
         * be the context object to Array.prototype.slice.
         *
         * @param {Array} array The array (or arguments object).
         * @param {Number} begin The index at which to begin. Negative values are offsets from
         * the end of the array.
         * @param {Number} end The index at which to end. The copied items do not include
         * end. Negative values are offsets from the end of the array. If end is omitted,
         * all items up to the end of the array are copied.
         * @return {Array} The copied piece of the array.
         * @method slice
         */
        // Note: IE6 will return [] on slice.call(x, undefined).
        slice: ([1,2].slice(1, undefined).length ?
            function (array, begin, end) {
                return slice.call(array, begin, end);
            } :
            // at least IE6 uses arguments.length for variadic signature
            function (array, begin, end) {
                // After tested for IE 6, the one below is of the best performance
                // see http://jsperf.com/slice-fix
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }
        ),

        /**
         * Sorts the elements of an Array.
         * By default, this method sorts the elements alphabetically and ascending.
         *
         * @param {Array} array The array to sort.
         * @param {Function} sortFn (optional) The comparison function.
         * @param {Mixed} sortFn.a An item to compare.
         * @param {Mixed} sortFn.b Another item to compare.
         * @return {Array} The sorted array.
         */
        sort: supportsSort ? function(array, sortFn) {
            if (sortFn) {
                return array.sort(sortFn);
            } else {
                return array.sort();
            }
         } : function(array, sortFn) {
            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        /**
         * Recursively flattens into 1-d Array. Injects Arrays inline.
         *
         * @param {Array} array The array to flatten
         * @return {Array} The 1-d array.
         */
        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Ext.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

        /**
         * Returns the minimum value in the Array.
         *
         * @param {Array/NodeList} array The Array from which to select the minimum value.
         * @param {Function} comparisonFn (optional) a function to perform the comparision which determines minimization.
         * If omitted the "<" operator will be used. Note: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.min Current minimum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current minimum.
         * @return {Object} minValue The minimum value
         */
        min: function(array, comparisonFn) {
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

        /**
         * Returns the maximum value in the Array.
         *
         * @param {Array/NodeList} array The Array from which to select the maximum value.
         * @param {Function} comparisonFn (optional) a function to perform the comparision which determines maximization.
         * If omitted the ">" operator will be used. Note: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.max Current maximum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current maximum.
         * @return {Object} maxValue The maximum value
         */
        max: function(array, comparisonFn) {
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        /**
         * Calculates the mean of all items in the array.
         *
         * @param {Array} array The Array to calculate the mean value of.
         * @return {Number} The mean.
         */
        mean: function(array) {
            return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
        },

        /**
         * Calculates the sum of all items in the given array.
         *
         * @param {Array} array The Array to calculate the sum value of.
         * @return {Number} The sum.
         */
        sum: function(array) {
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        /**
         * Creates a map (object) keyed by the elements of the given array. The values in
         * the map are the index+1 of the array element. For example:
         * 
         *      var map = Ext.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * Or a key property can be specified:
         * 
         *      var map = Ext.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * Lastly, a key extractor can be provided:
         * 
         *      var map = Ext.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: 1, B: 2, C: 3 };
         * 
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = i+1;
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = i+1;
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = i+1;
                }
            }

            return map;
        },

        /**
         * Creates a map (object) keyed by a property of elements of the given array. The values in
         * the map are the array element. For example:
         * 
         *      var map = Ext.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 'a', b: 'b', c: 'c' };
         * 
         * Or a key property can be specified:
         * 
         *      var map = Ext.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'} };
         * 
         * Lastly, a key extractor can be provided:
         * 
         *      var map = Ext.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: {name: 'a'}, B: {name: 'b'}, C: {name: 'c'} };
         *
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toValueMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = array[i];
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = array[i];
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = array[i];
                }
            }

            return map;
        },

        _replaceSim: replaceSim, // for unit testing
        _spliceSim: spliceSim,

        /**
         * Removes items from an array. This is functionally equivalent to the splice method
         * of Array, but works around bugs in IE8's splice method and does not copy the
         * removed elements in order to return them (because very often they are ignored).
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index.
         * @return {Array} The array passed.
         * @method
         */
        erase: erase,

        /**
         * Inserts items in to an array.
         *
         * @param {Array} array The Array in which to insert.
         * @param {Number} index The index in the array at which to operate.
         * @param {Array} items The array of items to insert at index.
         * @return {Array} The array passed.
         */
        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        /**
         * Replaces items in an array. This is functionally equivalent to the splice method
         * of Array, but works around bugs in IE8's splice method and is often more convenient
         * to call because it accepts an array of items to insert rather than use a variadic
         * argument list.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index (can be 0).
         * @param {Array} insert (optional) An array of items to insert at index.
         * @return {Array} The array passed.
         * @method
         */
        replace: replace,

        /**
         * Replaces items in an array. This is equivalent to the splice method of Array, but
         * works around bugs in IE8's splice method. The signature is exactly the same as the
         * splice method except that the array is the first argument. All arguments following
         * removeCount are inserted in the array at index.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index (can be 0).
         * @param {Object...} elements The elements to add to the array. If you don't specify
         * any elements, splice simply removes elements from the array.
         * @return {Array} An array containing the removed items.
         * @method
         */
        splice: splice,

        /**
         * Pushes new items onto the end of an Array.
         *
         * Passed parameters may be single items, or arrays of items. If an Array is found in the argument list, all its
         * elements are pushed into the end of the target Array.
         *
         * @param {Array} target The Array onto which to push new items
         * @param {Object...} elements The elements to add to the array. Each parameter may
         * be an Array, in which case all the elements of that Array will be pushed into the end of the
         * destination Array.
         * @return {Array} An array containing all the new items push onto the end.
         *
         */
        push: function(array) {
            var len = arguments.length,
                i = 1,
                newItem;

            if (array === undefined) {
                array = [];
            } else if (!Ext.isArray(array)) {
                array = [array];
            }
            for (; i < len; i++) {
                newItem = arguments[i];
                Array.prototype.push[Ext.isIterable(newItem) ? 'apply' : 'call'](array, newItem);
            }
            return array;
        }
    };

    /**
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#each
     */
    Ext.each = ExtArray.each;

    /**
     * @method
     * @member Ext.Array
     * @inheritdoc Ext.Array#merge
     */
    ExtArray.union = ExtArray.merge;

    /**
     * Old alias to {@link Ext.Array#min}
     * @deprecated 4.0.0 Use {@link Ext.Array#min} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#min
     */
    Ext.min = ExtArray.min;

    /**
     * Old alias to {@link Ext.Array#max}
     * @deprecated 4.0.0 Use {@link Ext.Array#max} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#max
     */
    Ext.max = ExtArray.max;

    /**
     * Old alias to {@link Ext.Array#sum}
     * @deprecated 4.0.0 Use {@link Ext.Array#sum} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#sum
     */
    Ext.sum = ExtArray.sum;

    /**
     * Old alias to {@link Ext.Array#mean}
     * @deprecated 4.0.0 Use {@link Ext.Array#mean} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#mean
     */
    Ext.mean = ExtArray.mean;

    /**
     * Old alias to {@link Ext.Array#flatten}
     * @deprecated 4.0.0 Use {@link Ext.Array#flatten} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#flatten
     */
    Ext.flatten = ExtArray.flatten;

    /**
     * Old alias to {@link Ext.Array#clean}
     * @deprecated 4.0.0 Use {@link Ext.Array#clean} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#clean
     */
    Ext.clean = ExtArray.clean;

    /**
     * Old alias to {@link Ext.Array#unique}
     * @deprecated 4.0.0 Use {@link Ext.Array#unique} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#unique
     */
    Ext.unique = ExtArray.unique;

    /**
     * Old alias to {@link Ext.Array#pluck Ext.Array.pluck}
     * @deprecated 4.0.0 Use {@link Ext.Array#pluck Ext.Array.pluck} instead
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#pluck
     */
    Ext.pluck = ExtArray.pluck;

    /**
     * @method
     * @member Ext
     * @inheritdoc Ext.Array#toArray
     */
    Ext.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
}());

// @tag foundation,core
// @require Array.js
// @define Ext.Function

/**
 * @class Ext.Function
 *
 * A collection of useful static methods to deal with function callbacks
 * @singleton
 * @alternateClassName Ext.util.Functions
 */
Ext.Function = {

    /**
     * A very commonly used method throughout the framework. It acts as a wrapper around another method
     * which originally accepts 2 arguments for `name` and `value`.
     * The wrapped function then allows "flexible" value setting of either:
     *
     * - `name` and `value` as 2 arguments
     * - one single object argument with multiple key - value pairs
     *
     * For example:
     *
     *     var setValue = Ext.Function.flexSetter(function(name, value) {
     *         this[name] = value;
     *     });
     *
     *     // Afterwards
     *     // Setting a single name - value
     *     setValue('name1', 'value1');
     *
     *     // Settings multiple name - value pairs
     *     setValue({
     *         name1: 'value1',
     *         name2: 'value2',
     *         name3: 'value3'
     *     });
     *
     * @param {Function} setter
     * @returns {Function} flexSetter
     */
    flexSetter: function(fn) {
        return function(a, b) {
            var k, i;

            if (a === null) {
                return this;
            }

            if (typeof a !== 'string') {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        fn.call(this, k, a[k]);
                    }
                }

                if (Ext.enumerables) {
                    for (i = Ext.enumerables.length; i--;) {
                        k = Ext.enumerables[i];
                        if (a.hasOwnProperty(k)) {
                            fn.call(this, k, a[k]);
                        }
                    }
                }
            } else {
                fn.call(this, a, b);
            }

            return this;
        };
    },

    /**
     * Create a new function from the provided `fn`, change `this` to the provided scope, optionally
     * overrides arguments for the call. (Defaults to the arguments passed by the caller)
     *
     * {@link Ext#bind Ext.bind} is alias for {@link Ext.Function#bind Ext.Function.bind}
     *
     * @param {Function} fn The function to delegate.
     * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
     * **If omitted, defaults to the default global environment object (usually the browser window).**
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Function} The new function
     */
    bind: function(fn, scope, args, appendArgs) {
        if (arguments.length === 2) {
            return function() {
                return fn.apply(scope, arguments);
            };
        }

        var method = fn,
            slice = Array.prototype.slice;

        return function() {
            var callArgs = args || arguments;

            if (appendArgs === true) {
                callArgs = slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (typeof appendArgs == 'number') {
                callArgs = slice.call(arguments, 0); // copy arguments first
                Ext.Array.insert(callArgs, appendArgs, args);
            }

            return method.apply(scope || Ext.global, callArgs);
        };
    },

    /**
     * Create a new function from the provided `fn`, the arguments of which are pre-set to `args`.
     * New arguments passed to the newly created callback when it's invoked are appended after the pre-set ones.
     * This is especially useful when creating callbacks.
     *
     * For example:
     *
     *     var originalFunction = function(){
     *         alert(Ext.Array.from(arguments).join(' '));
     *     };
     *
     *     var callback = Ext.Function.pass(originalFunction, ['Hello', 'World']);
     *
     *     callback(); // alerts 'Hello World'
     *     callback('by Me'); // alerts 'Hello World by Me'
     *
     * {@link Ext#pass Ext.pass} is alias for {@link Ext.Function#pass Ext.Function.pass}
     *
     * @param {Function} fn The original function
     * @param {Array} args The arguments to pass to new callback
     * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
     * @return {Function} The new callback function
     */
    pass: function(fn, args, scope) {
        if (!Ext.isArray(args)) {
            if (Ext.isIterable(args)) {
                args = Ext.Array.clone(args);
            } else {
                args = args !== undefined ? [args] : [];
            }
        }

        return function() {
            var fnArgs = [].concat(args);
            fnArgs.push.apply(fnArgs, arguments);
            return fn.apply(scope || this, fnArgs);
        };
    },

    /**
     * Create an alias to the provided method property with name `methodName` of `object`.
     * Note that the execution scope will still be bound to the provided `object` itself.
     *
     * @param {Object/Function} object
     * @param {String} methodName
     * @return {Function} aliasFn
     */
    alias: function(object, methodName) {
        return function() {
            return object[methodName].apply(object, arguments);
        };
    },

    /**
     * Create a "clone" of the provided method. The returned method will call the given
     * method passing along all arguments and the "this" pointer and return its result.
     *
     * @param {Function} method
     * @return {Function} cloneFn
     */
    clone: function(method) {
        return function() {
            return method.apply(this, arguments);
        };
    },

    /**
     * Creates an interceptor function. The passed function is called before the original one. If it returns false,
     * the original one is not called. The resulting function returns the results of the original function.
     * The passed function is called with the parameters of the original function. Example usage:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // alerts "Hi, Fred"
     *
     *     // create a new function that validates input without
     *     // directly modifying the original function:
     *     var sayHiToFriend = Ext.Function.createInterceptor(sayHi, function(name){
     *         return name == 'Brian';
     *     });
     *
     *     sayHiToFriend('Fred');  // no alert
     *     sayHiToFriend('Brian'); // alerts "Hi, Brian"
     *
     * @param {Function} origFn The original function.
     * @param {Function} newFn The function to call before the original
     * @param {Object} [scope] The scope (`this` reference) in which the passed function is executed.
     * **If omitted, defaults to the scope in which the original function is called or the browser window.**
     * @param {Object} [returnValue=null] The value to return if the passed function return false.
     * @return {Function} The new function
     */
    createInterceptor: function(origFn, newFn, scope, returnValue) {
        var method = origFn;
        if (!Ext.isFunction(newFn)) {
            return origFn;
        } else {
            returnValue = Ext.isDefined(returnValue) ? returnValue : null;
            return function() {
                var me = this,
                    args = arguments;
                    
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || Ext.global, args) !== false) ? origFn.apply(me || Ext.global, args) : returnValue;
            };
        }
    },

    /**
     * Creates a delegate (callback) which, when called, executes after a specific delay.
     *
     * @param {Function} fn The function which will be called on a delay when the returned function is called.
     * Optionally, a replacement (or additional) argument list may be specified.
     * @param {Number} delay The number of milliseconds to defer execution by whenever called.
     * @param {Object} scope (optional) The scope (`this` reference) used by the function at execution time.
     * @param {Array} args (optional) Override arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position.
     * @return {Function} A function which, when called, executes the original function after the specified delay.
     */
    createDelayed: function(fn, delay, scope, args, appendArgs) {
        if (scope || args) {
            fn = Ext.Function.bind(fn, scope, args, appendArgs);
        }

        return function() {
            var me = this,
                args = Array.prototype.slice.call(arguments);

            setTimeout(function() {
                fn.apply(me, args);
            }, delay);
        };
    },

    /**
     * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     // executes immediately:
     *     sayHi('Fred');
     *
     *     // executes after 2 seconds:
     *     Ext.Function.defer(sayHi, 2000, this, ['Fred']);
     *
     *     // this syntax is sometimes useful for deferring
     *     // execution of an anonymous function:
     *     Ext.Function.defer(function(){
     *         alert('Anonymous');
     *     }, 100);
     *
     * {@link Ext#defer Ext.defer} is alias for {@link Ext.Function#defer Ext.Function.defer}
     *
     * @param {Function} fn The function to defer.
     * @param {Number} millis The number of milliseconds for the setTimeout call
     * (if less than or equal to 0 the function is executed immediately)
     * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
     * **If omitted, defaults to the browser window.**
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Number} The timeout id that can be used with clearTimeout
     */
    defer: function(fn, millis, scope, args, appendArgs) {
        fn = Ext.Function.bind(fn, scope, args, appendArgs);
        if (millis > 0) {
            return setTimeout(Ext.supports.TimeoutActualLateness ? function () {
                fn();
            } : fn, millis);
        }
        fn();
        return 0;
    },

    /**
     * Create a combined function call sequence of the original function + the passed function.
     * The resulting function returns the results of the original function.
     * The passed function is called with the parameters of the original function. Example usage:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // alerts "Hi, Fred"
     *
     *     var sayGoodbye = Ext.Function.createSequence(sayHi, function(name){
     *         alert('Bye, ' + name);
     *     });
     *
     *     sayGoodbye('Fred'); // both alerts show
     *
     * @param {Function} originalFn The original function.
     * @param {Function} newFn The function to sequence
     * @param {Object} scope (optional) The scope (`this` reference) in which the passed function is executed.
     * If omitted, defaults to the scope in which the original function is called or the default global environment object (usually the browser window).
     * @return {Function} The new function
     */
    createSequence: function(originalFn, newFn, scope) {
        if (!newFn) {
            return originalFn;
        }
        else {
            return function() {
                var result = originalFn.apply(this, arguments);
                newFn.apply(scope || this, arguments);
                return result;
            };
        }
    },

    /**
     * Creates a delegate function, optionally with a bound scope which, when called, buffers
     * the execution of the passed function for the configured number of milliseconds.
     * If called again within that period, the impending invocation will be canceled, and the
     * timeout period will begin again.
     *
     * @param {Function} fn The function to invoke on a buffered timer.
     * @param {Number} buffer The number of milliseconds by which to buffer the invocation of the
     * function.
     * @param {Object} scope (optional) The scope (`this` reference) in which
     * the passed function is executed. If omitted, defaults to the scope specified by the caller.
     * @param {Array} args (optional) Override arguments for the call. Defaults to the arguments
     * passed by the caller.
     * @return {Function} A function which invokes the passed function after buffering for the specified time.
     */
    createBuffered: function(fn, buffer, scope, args) {
        var timerId;

        return function() {
            var callArgs = args || Array.prototype.slice.call(arguments, 0),
                me = scope || this;

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(function(){
                fn.apply(me, callArgs);
            }, buffer);
        };
    },

    /**
     * Creates a throttled version of the passed function which, when called repeatedly and
     * rapidly, invokes the passed function only after a certain interval has elapsed since the
     * previous invocation.
     *
     * This is useful for wrapping functions which may be called repeatedly, such as
     * a handler of a mouse move event when the processing is expensive.
     *
     * @param {Function} fn The function to execute at a regular time interval.
     * @param {Number} interval The interval **in milliseconds** on which the passed function is executed.
     * @param {Object} scope (optional) The scope (`this` reference) in which
     * the passed function is executed. If omitted, defaults to the scope specified by the caller.
     * @returns {Function} A function which invokes the passed function at the specified interval.
     */
    createThrottled: function(fn, interval, scope) {
        var lastCallTime, elapsed, lastArgs, timer, execute = function() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = Ext.Date.now();
        };

        return function() {
            elapsed = Ext.Date.now() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || (elapsed >= interval)) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    },


    /**
     * Adds behavior to an existing method that is executed before the
     * original behavior of the function.  For example:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Ext.Function.interceptBefore(soup, "add", function(ingredient){
     *         if (!this.contents.length && ingredient !== "water") {
     *             // Always add water to start with
     *             this.contents.push("water");
     *         }
     *     });
     *     soup.add("onions");
     *     soup.add("salt");
     *     soup.contents; // will contain: water, onions, salt
     * 
     * @param {Object} object The target object
     * @param {String} methodName Name of the method to override
     * @param {Function} fn Function with the new behavior.  It will
     * be called with the same arguments as the original method.  The
     * return value of this function will be the return value of the
     * new method.
     * @param {Object} [scope] The scope to execute the interceptor function. Defaults to the object.
     * @return {Function} The new function just created.
     */
    interceptBefore: function(object, methodName, fn, scope) {
        var method = object[methodName] || Ext.emptyFn;

        return (object[methodName] = function() {
            var ret = fn.apply(scope || this, arguments);
            method.apply(this, arguments);

            return ret;
        });
    },

    /**
     * Adds behavior to an existing method that is executed after the
     * original behavior of the function.  For example:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Ext.Function.interceptAfter(soup, "add", function(ingredient){
     *         // Always add a bit of extra salt
     *         this.contents.push("salt");
     *     });
     *     soup.add("water");
     *     soup.add("onions");
     *     soup.contents; // will contain: water, salt, onions, salt
     * 
     * @param {Object} object The target object
     * @param {String} methodName Name of the method to override
     * @param {Function} fn Function with the new behavior.  It will
     * be called with the same arguments as the original method.  The
     * return value of this function will be the return value of the
     * new method.
     * @param {Object} [scope] The scope to execute the interceptor function. Defaults to the object.
     * @return {Function} The new function just created.
     */
    interceptAfter: function(object, methodName, fn, scope) {
        var method = object[methodName] || Ext.emptyFn;

        return (object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(scope || this, arguments);
        });
    }
};

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#defer
 */
Ext.defer = Ext.Function.alias(Ext.Function, 'defer');

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#pass
 */
Ext.pass = Ext.Function.alias(Ext.Function, 'pass');

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#bind
 */
Ext.bind = Ext.Function.alias(Ext.Function, 'bind');

// @tag foundation,core
// @require Function.js
// @define Ext.Object

/**
 * @class Ext.Object
 *
 * A collection of useful static methods to deal with objects.
 *
 * @singleton
 */

(function() {

// The "constructor" for chain:
var TemplateClass = function(){},
    ExtObject = Ext.Object = {

    /**
     * Returns a new object with the given object as the prototype chain. This method is
     * designed to mimic the ECMA standard `Object.create` method and is assigned to that
     * function when it is available.
     * 
     * **NOTE** This method does not support the property definitions capability of the
     * `Object.create` method. Only the first argument is supported.
     * 
     * @param {Object} object The prototype chain for the new object.
     */
    chain: Object.create || function (object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    },

    /**
     * Converts a `name` - `value` pair to an array of objects with support for nested structures. Useful to construct
     * query strings. For example:
     *
     *     var objects = Ext.Object.toQueryObjects('hobbies', ['reading', 'cooking', 'swimming']);
     *
     *     // objects then equals:
     *     [
     *         { name: 'hobbies', value: 'reading' },
     *         { name: 'hobbies', value: 'cooking' },
     *         { name: 'hobbies', value: 'swimming' },
     *     ];
     *
     *     var objects = Ext.Object.toQueryObjects('dateOfBirth', {
     *         day: 3,
     *         month: 8,
     *         year: 1987,
     *         extra: {
     *             hour: 4
     *             minute: 30
     *         }
     *     }, true); // Recursive
     *
     *     // objects then equals:
     *     [
     *         { name: 'dateOfBirth[day]', value: 3 },
     *         { name: 'dateOfBirth[month]', value: 8 },
     *         { name: 'dateOfBirth[year]', value: 1987 },
     *         { name: 'dateOfBirth[extra][hour]', value: 4 },
     *         { name: 'dateOfBirth[extra][minute]', value: 30 },
     *     ];
     *
     * @param {String} name
     * @param {Object/Array} value
     * @param {Boolean} [recursive=false] True to traverse object recursively
     * @return {Array}
     */
    toQueryObjects: function(name, value, recursive) {
        var self = ExtObject.toQueryObjects,
            objects = [],
            i, ln;

        if (Ext.isArray(value)) {
            for (i = 0, ln = value.length; i < ln; i++) {
                if (recursive) {
                    objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                }
                else {
                    objects.push({
                        name: name,
                        value: value[i]
                    });
                }
            }
        }
        else if (Ext.isObject(value)) {
            for (i in value) {
                if (value.hasOwnProperty(i)) {
                    if (recursive) {
                        objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                    }
                    else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            }
        }
        else {
            objects.push({
                name: name,
                value: value
            });
        }

        return objects;
    },

    /**
     * Takes an object and converts it to an encoded query string.
     *
     * Non-recursive:
     *
     *     Ext.Object.toQueryString({foo: 1, bar: 2}); // returns "foo=1&bar=2"
     *     Ext.Object.toQueryString({foo: null, bar: 2}); // returns "foo=&bar=2"
     *     Ext.Object.toQueryString({'some price': '$300'}); // returns "some%20price=%24300"
     *     Ext.Object.toQueryString({date: new Date(2011, 0, 1)}); // returns "date=%222011-01-01T00%3A00%3A00%22"
     *     Ext.Object.toQueryString({colors: ['red', 'green', 'blue']}); // returns "colors=red&colors=green&colors=blue"
     *
     * Recursive:
     *
     *     Ext.Object.toQueryString({
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: 1,
     *             month: 2,
     *             year: 1911
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }, true); // returns the following string (broken down and url-decoded for ease of reading purpose):
     *     // username=Jacky
     *     //    &dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911
     *     //    &hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=nested&hobbies[3][1]=stuff
     *
     * @param {Object} object The object to encode
     * @param {Boolean} [recursive=false] Whether or not to interpret the object in recursive format.
     * (PHP / Ruby on Rails servers and similar).
     * @return {String} queryString
     */
    toQueryString: function(object, recursive) {
        var paramObjects = [],
            params = [],
            i, j, ln, paramObject, value;

        for (i in object) {
            if (object.hasOwnProperty(i)) {
                paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i, object[i], recursive));
            }
        }

        for (j = 0, ln = paramObjects.length; j < ln; j++) {
            paramObject = paramObjects[j];
            value = paramObject.value;

            if (Ext.isEmpty(value)) {
                value = '';
            } else if (Ext.isDate(value)) {
                value = Ext.Date.toString(value);
            }

            params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
        }

        return params.join('&');
    },

    /**
     * Converts a query string back into an object.
     *
     * Non-recursive:
     *
     *     Ext.Object.fromQueryString("foo=1&bar=2"); // returns {foo: '1', bar: '2'}
     *     Ext.Object.fromQueryString("foo=&bar=2"); // returns {foo: null, bar: '2'}
     *     Ext.Object.fromQueryString("some%20price=%24300"); // returns {'some price': '$300'}
     *     Ext.Object.fromQueryString("colors=red&colors=green&colors=blue"); // returns {colors: ['red', 'green', 'blue']}
     *
     * Recursive:
     *
     *     Ext.Object.fromQueryString(
     *         "username=Jacky&"+
     *         "dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&"+
     *         "hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&"+
     *         "hobbies[3][0]=nested&hobbies[3][1]=stuff", true);
     *
     *     // returns
     *     {
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: '1',
     *             month: '2',
     *             year: '1911'
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }
     *
     * @param {String} queryString The query string to decode
     * @param {Boolean} [recursive=false] Whether or not to recursively decode the string. This format is supported by
     * PHP / Ruby on Rails servers and similar.
     * @return {Object}
     */
    fromQueryString: function(queryString, recursive) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            object = {},
            temp, components, name, value, i, ln,
            part, j, subLn, matchedKeys, matchedName,
            keys, key, nextKey;

        for (i = 0, ln = parts.length; i < ln; i++) {
            part = parts[i];

            if (part.length > 0) {
                components = part.split('=');
                name = decodeURIComponent(components[0]);
                value = (components[1] !== undefined) ? decodeURIComponent(components[1]) : '';

                if (!recursive) {
                    if (object.hasOwnProperty(name)) {
                        if (!Ext.isArray(object[name])) {
                            object[name] = [object[name]];
                        }

                        object[name].push(value);
                    }
                    else {
                        object[name] = value;
                    }
                }
                else {
                    matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
                    matchedName = name.match(/^([^\[]+)/);

                    if (!matchedName) {
                        throw new Error('[Ext.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                    }

                    name = matchedName[0];
                    keys = [];

                    if (matchedKeys === null) {
                        object[name] = value;
                        continue;
                    }

                    for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                        key = matchedKeys[j];
                        key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                        keys.push(key);
                    }

                    keys.unshift(name);

                    temp = object;

                    for (j = 0, subLn = keys.length; j < subLn; j++) {
                        key = keys[j];

                        if (j === subLn - 1) {
                            if (Ext.isArray(temp) && key === '') {
                                temp.push(value);
                            }
                            else {
                                temp[key] = value;
                            }
                        }
                        else {
                            if (temp[key] === undefined || typeof temp[key] === 'string') {
                                nextKey = keys[j+1];

                                temp[key] = (Ext.isNumeric(nextKey) || nextKey === '') ? [] : {};
                            }

                            temp = temp[key];
                        }
                    }
                }
            }
        }

        return object;
    },

    /**
     * Iterates through an object and invokes the given callback function for each iteration.
     * The iteration can be stopped by returning `false` in the callback function. For example:
     *
     *     var person = {
     *         name: 'Jacky'
     *         hairColor: 'black'
     *         loves: ['food', 'sleeping', 'wife']
     *     };
     *
     *     Ext.Object.each(person, function(key, value, myself) {
     *         console.log(key + ":" + value);
     *
     *         if (key === 'hairColor') {
     *             return false; // stop the iteration
     *         }
     *     });
     *
     * @param {Object} object The object to iterate
     * @param {Function} fn The callback function.
     * @param {String} fn.key
     * @param {Object} fn.value
     * @param {Object} fn.object The object itself
     * @param {Object} [scope] The execution scope (`this`) of the callback function
     */
    each: function(object, fn, scope) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (fn.call(scope || object, property, object[property], object) === false) {
                    return;
                }
            }
        }
    },

    /**
     * Merges any number of objects recursively without referencing them or their children.
     *
     *     var extjs = {
     *         companyName: 'Ext JS',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer'],
     *         isSuperCool: true,
     *         office: {
     *             size: 2000,
     *             location: 'Palo Alto',
     *             isFun: true
     *         }
     *     };
     *
     *     var newStuff = {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City'
     *         }
     *     };
     *
     *     var sencha = Ext.Object.merge(extjs, newStuff);
     *
     *     // extjs and sencha then equals to
     *     {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext JS', 'Ext GWT', 'Ext Designer', 'Sencha Touch', 'Sencha Animator'],
     *         isSuperCool: true,
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City',
     *             isFun: true
     *         }
     *     }
     *
     * @param {Object} destination The object into which all subsequent objects are merged.
     * @param {Object...} object Any number of objects to merge into the destination.
     * @return {Object} merged The destination object with all passed objects merged in.
     */
    merge: function(destination) {
        var i = 1,
            ln = arguments.length,
            mergeFn = ExtObject.merge,
            cloneFn = Ext.clone,
            object, key, value, sourceKey;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                value = object[key];
                if (value && value.constructor === Object) {
                    sourceKey = destination[key];
                    if (sourceKey && sourceKey.constructor === Object) {
                        mergeFn(sourceKey, value);
                    }
                    else {
                        destination[key] = cloneFn(value);
                    }
                }
                else {
                    destination[key] = value;
                }
            }
        }

        return destination;
    },

    /**
     * @private
     * @param destination
     */
    mergeIf: function(destination) {
        var i = 1,
            ln = arguments.length,
            cloneFn = Ext.clone,
            object, key, value;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                if (!(key in destination)) {
                    value = object[key];

                    if (value && value.constructor === Object) {
                        destination[key] = cloneFn(value);
                    }
                    else {
                        destination[key] = value;
                    }
                }
            }
        }

        return destination;
    },

    /**
     * Returns the first matching key corresponding to the given value.
     * If no matching value is found, null is returned.
     *
     *     var person = {
     *         name: 'Jacky',
     *         loves: 'food'
     *     };
     *
     *     alert(Ext.Object.getKey(person, 'food')); // alerts 'loves'
     *
     * @param {Object} object
     * @param {Object} value The value to find
     */
    getKey: function(object, value) {
        for (var property in object) {
            if (object.hasOwnProperty(property) && object[property] === value) {
                return property;
            }
        }

        return null;
    },

    /**
     * Gets all values of the given object as an array.
     *
     *     var values = Ext.Object.getValues({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['Jacky', 'food']
     *
     * @param {Object} object
     * @return {Array} An array of values from the object
     */
    getValues: function(object) {
        var values = [],
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                values.push(object[property]);
            }
        }

        return values;
    },

    /**
     * Gets all keys of the given object as an array.
     *
     *     var values = Ext.Object.getKeys({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['name', 'loves']
     *
     * @param {Object} object
     * @return {String[]} An array of keys from the object
     * @method
     */
    getKeys: (typeof Object.keys == 'function')
        ? function(object){
            if (!object) {
                return [];
            }
            return Object.keys(object);
        }
        : function(object) {
            var keys = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }

            return keys;
        },

    /**
     * Gets the total number of this object's own properties
     *
     *     var size = Ext.Object.getSize({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // size equals 2
     *
     * @param {Object} object
     * @return {Number} size
     */
    getSize: function(object) {
        var size = 0,
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                size++;
            }
        }

        return size;
    },
    
    /**
     * Checks if there are any properties on this object.
     * @param {Object} object
     * @return {Boolean} `true` if there no properties on the object.
     */
    isEmpty: function(object){
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;    
    },
    
    /**
     * Shallow compares the contents of 2 objects using strict equality. Objects are
     * considered equal if they both have the same set of properties and the
     * value for those properties equals the other in the corresponding object.
     * 
     *     // Returns true
     *     Ext.Object.equals({
     *         foo: 1,
     *         bar: 2
     *     }, {
     *         foo: 1,
     *         bar: 2
     *     });
     * 
     * @param {Object} object1
     * @param {Object} object2
     * @return {Boolean} `true` if the objects are equal.
     */
    equals: (function() {
        var check = function(o1, o2) {
            var key;
        
            for (key in o1) {
                if (o1.hasOwnProperty(key)) {
                    if (o1[key] !== o2[key]) {
                        return false;
                    }    
                }
            }    
            return true;
        };
        
        return function(object1, object2) {
            
            // Short circuit if the same object is passed twice
            if (object1 === object2) {
                return true;
            } if (object1 && object2) {
                // Do the second check because we could have extra keys in
                // object2 that don't exist in object1.
                return check(object1, object2) && check(object2, object1);  
            } else if (!object1 && !object2) {
                return object1 === object2;
            } else {
                return false;
            }
        };
    })(),

    /**
     * @private
     */
    classify: function(object) {
        var prototype = object,
            objectProperties = [],
            propertyClassesMap = {},
            objectClass = function() {
                var i = 0,
                    ln = objectProperties.length,
                    property;

                for (; i < ln; i++) {
                    property = objectProperties[i];
                    this[property] = new propertyClassesMap[property]();
                }
            },
            key, value;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                value = object[key];

                if (value && value.constructor === Object) {
                    objectProperties.push(key);
                    propertyClassesMap[key] = ExtObject.classify(value);
                }
            }
        }

        objectClass.prototype = prototype;

        return objectClass;
    }
};

/**
 * A convenient alias method for {@link Ext.Object#merge}.
 *
 * @member Ext
 * @method merge
 * @inheritdoc Ext.Object#merge
 */
Ext.merge = Ext.Object.merge;

/**
 * @private
 * @member Ext
 */
Ext.mergeIf = Ext.Object.mergeIf;

/**
 *
 * @member Ext
 * @method urlEncode
 * @inheritdoc Ext.Object#toQueryString
 * @deprecated 4.0.0 Use {@link Ext.Object#toQueryString} instead
 */
Ext.urlEncode = function() {
    var args = Ext.Array.from(arguments),
        prefix = '';

    // Support for the old `pre` argument
    if ((typeof args[1] === 'string')) {
        prefix = args[1] + '&';
        args[1] = false;
    }

    return prefix + ExtObject.toQueryString.apply(ExtObject, args);
};

/**
 * Alias for {@link Ext.Object#fromQueryString}.
 *
 * @member Ext
 * @method urlDecode
 * @inheritdoc Ext.Object#fromQueryString
 * @deprecated 4.0.0 Use {@link Ext.Object#fromQueryString} instead
 */
Ext.urlDecode = function() {
    return ExtObject.fromQueryString.apply(ExtObject, arguments);
};

}());

// @tag foundation,core
// @require Object.js
// @define Ext.Date

/**
 * @class Ext.Date
 * A set of useful static methods to deal with date
 * Note that if Ext.Date is required and loaded, it will copy all methods / properties to
 * this object for convenience
 *
 * The date parsing and formatting syntax contains a subset of
 * [PHP's `date()` function](http://www.php.net/date), and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre class="">
Format      Description                                                               Example returned values
------      -----------------------------------------------------------------------   -----------------------
  d         Day of the month, 2 digits with leading zeros                             01 to 31
  D         A short textual representation of the day of the week                     Mon to Sun
  j         Day of the month without leading zeros                                    1 to 31
  l         A full textual representation of the day of the week                      Sunday to Saturday
  N         ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S         English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w         Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z         The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W         ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F         A full textual representation of a month, such as January or March        January to December
  m         Numeric representation of a month, with leading zeros                     01 to 12
  M         A short textual representation of a month                                 Jan to Dec
  n         Numeric representation of a month, without leading zeros                  1 to 12
  t         Number of days in the given month                                         28 to 31
  L         Whether it&#39;s a leap year                                                  1 if it is a leap year, 0 otherwise.
  o         ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
            belongs to the previous or next year, that year is used instead)
  Y         A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y         A two digit representation of a year                                      Examples: 99 or 03
  a         Lowercase Ante meridiem and Post meridiem                                 am or pm
  A         Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g         12-hour format of an hour without leading zeros                           1 to 12
  G         24-hour format of an hour without leading zeros                           0 to 23
  h         12-hour format of an hour with leading zeros                              01 to 12
  H         24-hour format of an hour with leading zeros                              00 to 23
  i         Minutes, with leading zeros                                               00 to 59
  s         Seconds, with leading zeros                                               00 to 59
  u         Decimal fraction of a second                                              Examples:
            (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                      100 (i.e. 0.100s) or
                                                                                      999 (i.e. 0.999s) or
                                                                                      999876543210 (i.e. 0.999876543210s)
  O         Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P         Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T         Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z         Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c         ISO 8601 date
            Notes:                                                                    Examples:
            1) If unspecified, the month / day defaults to the current month / day,   1991 or
               the time defaults to midnight, while the timezone defaults to the      1992-10 or
               browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
               and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
               are optional.                                                          1995-07-18T17:21:28-02:00 or
            2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
               least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
               of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
            Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
            date-time granularity which are supported, or see                         2000-02-13T21:25:33
            http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U         Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  MS        Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                      \/Date(1238606590509+0800)\/
  time      A javascript millisecond timestamp                                        1350024476440
  timestamp A UNIX timestamp (same as U)                                              1350024866            
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 *
 *     // Sample date:
 *     // 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'
 *     
 *     var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
 *     console.log(Ext.Date.format(dt, 'Y-m-d'));                          // 2007-01-10
 *     console.log(Ext.Date.format(dt, 'F j, Y, g:i a'));                  // January 10, 2007, 3:05 pm
 *     console.log(Ext.Date.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A')); // Wednesday, the 10th of January 2007 03:05:01 PM
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of Ext.Date, but to use them you can simply copy this
 * block of code into any script that is included after Ext.Date and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 *
 *     Ext.Date.patterns = {
 *         ISO8601Long:"Y-m-d H:i:s",
 *         ISO8601Short:"Y-m-d",
 *         ShortDate: "n/j/Y",
 *         LongDate: "l, F d, Y",
 *         FullDateTime: "l, F d, Y g:i:s A",
 *         MonthDay: "F d",
 *         ShortTime: "g:i A",
 *         LongTime: "g:i:s A",
 *         SortableDateTime: "Y-m-d\\TH:i:s",
 *         UniversalSortableDateTime: "Y-m-d H:i:sO",
 *         YearMonth: "F, Y"
 *     };
 *
 * Example usage:
 *
 *     var dt = new Date();
 *     console.log(Ext.Date.format(dt, Ext.Date.patterns.ShortDate));
 *
 * Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.
 * @singleton
 */

/*
 * Most of the date-formatting functions below are the excellent work of Baron Schwartz.
 * (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
 * They generate precompiled functions from format patterns instead of parsing and
 * processing each pattern every time a date is formatted. These functions are available
 * on every Date object.
 */

Ext.Date = new function() {
  var utilDate = this,
      stripEscapeRe = /(\\.)/g,
      hourInfoRe = /([gGhHisucUOPZ]|MS)/,
      dateInfoRe = /([djzmnYycU]|MS)/,
      slashRe = /\\/gi,
      numberTokenRe = /\{(\d+)\}/g,
      MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
      code = [
        // date calculations (note: the code below creates a dependency on Ext.Number.from())
        "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday, daysInMonth, dayMatched,",
            "def = me.defaults,",
            "from = Ext.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = me.clearTime(new Date);",

                "y = from(y, from(def.y, dt.getFullYear()));",
                "m = from(m, from(def.m - 1, dt.getMonth()));",
                "dayMatched = d !== undefined;",
                "d = from(d, from(def.d, dt.getDate()));",
                
                // Attempt to validate the day. Since it defaults to today, it may go out
                // of range, for example parsing m/Y where the value is 02/2000 on the 31st of May.
                // It will attempt to parse 2000/02/31, which will overflow to March and end up
                // returning 03/2000. We only do this when we default the day. If an invalid day value
                // was set to be parsed by the user, continue on and either let it overflow or return null
                // depending on the strict value. This will be in line with the normal Date behaviour.
                
                "if (!dayMatched) {", 
                    "dt.setDate(1);",
                    "dt.setMonth(m);",
                    "dt.setFullYear(y);",
                
                    "daysInMonth = me.getDaysInMonth(dt);",
                    "if (d > daysInMonth) {",
                        "d = daysInMonth;",
                    "}",
                "}",

                "h  = from(h, from(def.h, dt.getHours()));",
                "i  = from(i, from(def.i, dt.getMinutes()));",
                "s  = from(s, from(def.s, dt.getSeconds()));",
                "ms = from(ms, from(def.ms, dt.getMilliseconds()));",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    // handle years < 100 appropriately
                    "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
                "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    "if (W) {", // support ISO-8601
                        // http://en.wikipedia.org/wiki/ISO_week_date
                        //
                        // Mutually equivalent definitions for week 01 are:
                        // a. the week starting with the Monday which is nearest in time to 1 January
                        // b. the week with 4 January in it
                        // ... there are many others ...
                        //
                        // We'll use letter b above to determine the first week of the year.
                        //
                        // So, first get a Date object for January 4th of whatever calendar year is desired.
                        //
                        // Then, the first Monday of the year can easily be determined by (operating on this Date):
                        // 1. Getting the day of the week.
                        // 2. Subtracting that by one.
                        // 3. Multiplying that by 86400000 (one day in ms).
                        // 4. Subtracting this number of days (in ms) from the January 4 date (represented in ms).
                        // 
                        // Example #1 ...
                        //
                        //       January 2012
                        //   Su Mo Tu We Th Fr Sa
                        //    1  2  3  4  5  6  7
                        //    8  9 10 11 12 13 14
                        //   15 16 17 18 19 20 21
                        //   22 23 24 25 26 27 28
                        //   29 30 31
                        //
                        // 1. January 4th is a Wednesday.
                        // 2. Its day number is 3.
                        // 3. Simply substract 2 days from Wednesday.
                        // 4. The first week of the year begins on Monday, January 2. Simple!
                        //
                        // Example #2 ...
                        //       January 1992
                        //   Su Mo Tu We Th Fr Sa
                        //             1  2  3  4
                        //    5  6  7  8  9 10 11
                        //   12 13 14 15 16 17 18
                        //   19 20 21 22 23 24 25
                        //   26 27 28 29 30 31
                        // 
                        // 1. January 4th is a Saturday.
                        // 2. Its day number is 6.
                        // 3. Simply subtract 5 days from Saturday.
                        // 4. The first week of the year begins on Monday, December 30. Simple!
                        //
                        // v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));
                        // (This is essentially doing the same thing as above but for the week rather than the day)
                        "year = y || (new Date()).getFullYear(),",
                        "jan4 = new Date(year, 0, 4, 0, 0, 0),",
                        "week1monday = new Date(jan4.getTime() - ((jan4.getDay() - 1) * 86400000));",
                        "v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));",
                    "} else {",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",
        "}",

        "if(v){",
            // favor UTC offset over GMT offset
            "if(zz != null){",
                // reset to UTC, then add offset
                "v = me.add(v, me.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
                // reset to GMT, then add offset
                "v = me.add(v, me.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return v;"
      ].join('\n');

  // create private copy of Ext JS's `Ext.util.Format.format()` method
  // - to remove unnecessary dependency
  // - to resolve namespace conflict with MS-Ajax's implementation
  function xf(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(numberTokenRe, function(m, i) {
          return args[i];
      });
  }

  Ext.apply(utilDate, {
    /**
     * Returns the current timestamp.
     * @return {Number} Milliseconds since UNIX epoch.
     * @method
     */
    now: Date.now || function() {
        return +new Date();
    },

    /**
     * @private
     * Private for now
     */
    toString: function(date) {
        var pad = Ext.String.leftPad;

        return date.getFullYear() + "-"
            + pad(date.getMonth() + 1, 2, '0') + "-"
            + pad(date.getDate(), 2, '0') + "T"
            + pad(date.getHours(), 2, '0') + ":"
            + pad(date.getMinutes(), 2, '0') + ":"
            + pad(date.getSeconds(), 2, '0');
    },

    /**
     * Returns the number of milliseconds between two dates.
     * @param {Date} dateA The first date.
     * @param {Date} [dateB=new Date()] (optional) The second date.
     * @return {Number} The difference in milliseconds
     */
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || utilDate.now()));
    },

    /**
     * Global flag which determines if strict date parsing should be used.
     * Strict date parsing will not roll-over invalid dates, which is the
     * default behavior of JavaScript Date objects.
     * (see {@link #parse} for more information)
     * @type Boolean
    */
    useStrict: false,

    // private
    formatCodeToRegex: function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for Ext.Date.parseCodes below)
        var p = utilDate.parseCodes[character];

        if (p) {
          p = typeof p == 'function'? p() : p;
          utilDate.parseCodes[character] = p; // reassign function result to prevent repeated execution
        }

        return p ? Ext.applyIf({
          c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        }, p) : {
            g: 0,
            c: null,
            s: Ext.String.escapeRegex(character) // treat unrecognized characters as literals
        };
    },

    /**
     * An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.
     *
     * This object is automatically populated with date parsing functions as
     * date formats are requested for Ext standard formatting strings.
     *
     * Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parse}.
     *
     * Example:
     *
     *     Ext.Date.parseFunctions['x-date-format'] = myDateParser;
     *
     * A parsing function should return a Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">The date string to parse.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">True to validate date strings while parsing
     * (i.e. prevent JavaScript Date "rollover") (The default must be `false`).
     * Invalid date strings should return `null` when parsed.</div></li>
     * </ul></div>
     *
     * To enable Dates to also be _formatted_ according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @type Object
     */
    parseFunctions: {
        "MS": function(input, strict) {
            // note: the timezone offset is ignored since the MS Ajax server sends
            // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
            var r = (input || '').match(MSFormatRe);
            return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
        },
        "time": function(input, strict) {
            var num = parseInt(input, 10);
            if (num || num === 0) {
                return new Date(num);
            }
            return null;
        },
        "timestamp": function(input, strict) {
            var num = parseInt(input, 10);
            if (num || num === 0) {
                return new Date(num * 1000);
            }
            return null;
        }
    },
    parseRegexes: [],

    /**
     * An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.
     *
     * This object is automatically populated with date formatting functions as
     * date formats are requested for Ext standard formatting strings.
     *
     * Custom formatting functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #format}.
     *
     * Example:
     *
     *     Ext.Date.formatFunctions['x-date-format'] = myDateFormatter;
     *
     * A formatting function should return a string representation of the passed Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">The Date to format.</div></li>
     * </ul></div>
     *
     * To enable date strings to also be _parsed_ according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @type Object
     */
    formatFunctions: {
        "MS": function() {
            // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
            return '\\/Date(' + this.getTime() + ')\\/';
        },
        "time": function(){
            return this.getTime().toString();
        },
        "timestamp": function(){
            return utilDate.format(this, 'U');
        }
    },

    y2kYear : 50,

    /**
     * Date interval constant
     * @type String
     */
    MILLI : "ms",

    /**
     * Date interval constant
     * @type String
     */
    SECOND : "s",

    /**
     * Date interval constant
     * @type String
     */
    MINUTE : "mi",

    /** Date interval constant
     * @type String
     */
    HOUR : "h",

    /**
     * Date interval constant
     * @type String
     */
    DAY : "d",

    /**
     * Date interval constant
     * @type String
     */
    MONTH : "mo",

    /**
     * Date interval constant
     * @type String
     */
    YEAR : "y",

    /**
     * An object hash containing default date values used during date parsing.
     * 
     * The following properties are available:<div class="mdetail-params"><ul>
     * <li><code>y</code> : Number<div class="sub-desc">The default year value. (defaults to undefined)</div></li>
     * <li><code>m</code> : Number<div class="sub-desc">The default 1-based month value. (defaults to undefined)</div></li>
     * <li><code>d</code> : Number<div class="sub-desc">The default day value. (defaults to undefined)</div></li>
     * <li><code>h</code> : Number<div class="sub-desc">The default hour value. (defaults to undefined)</div></li>
     * <li><code>i</code> : Number<div class="sub-desc">The default minute value. (defaults to undefined)</div></li>
     * <li><code>s</code> : Number<div class="sub-desc">The default second value. (defaults to undefined)</div></li>
     * <li><code>ms</code> : Number<div class="sub-desc">The default millisecond value. (defaults to undefined)</div></li>
     * </ul></div>
     * 
     * Override these properties to customize the default date values used by the {@link #parse} method.
     * 
     * __Note:__ In countries which experience Daylight Saving Time (i.e. DST), the `h`, `i`, `s`
     * and `ms` properties may coincide with the exact time in which DST takes effect.
     * It is the responsibility of the developer to account for this.
     *
     * Example Usage:
     * 
     *     // set default day value to the first day of the month
     *     Ext.Date.defaults.d = 1;
     *
     *     // parse a February date string containing only year and month values.
     *     // setting the default day value to 1 prevents weird date rollover issues
     *     // when attempting to parse the following date string on, for example, March 31st 2009.
     *     Ext.Date.parse('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
     *
     * @property defaults
     * @type Object
     */
    defaults: {},

    //<locale type="array">
    /**
     * @property {String[]} dayNames
     * An array of textual day names.
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.dayNames = [
     *         'SundayInYourLang',
     *         'MondayInYourLang'
     *         // ...
     *     ];
     */
    dayNames : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],
    //</locale>

    //<locale type="array">
    /**
     * @property {String[]} monthNames
     * An array of textual month names.
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.monthNames = [
     *         'JanInYourLang',
     *         'FebInYourLang'
     *         // ...
     *     ];
     */
    monthNames : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    //</locale>

    //<locale type="object">
    /**
     * @property {Object} monthNumbers
     * An object hash of zero-based JavaScript month numbers (with short month names as keys. **Note:** keys are case-sensitive).
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.monthNumbers = {
     *         'LongJanNameInYourLang': 0,
     *         'ShortJanNameInYourLang':0,
     *         'LongFebNameInYourLang':1,
     *         'ShortFebNameInYourLang':1
     *         // ...
     *     };
     */
    monthNumbers : {
        January: 0,
        Jan: 0,
        February: 1,
        Feb: 1,
        March: 2,
        Mar: 2,
        April: 3,
        Apr: 3,
        May: 4,
        June: 5,
        Jun: 5,
        July: 6,
        Jul: 6,
        August: 7,
        Aug: 7,
        September: 8,
        Sep: 8,
        October: 9,
        Oct: 9,
        November: 10,
        Nov: 10,
        December: 11,
        Dec: 11
    },
    //</locale>
    
    //<locale>
    /**
     * @property {String} defaultFormat
     * The date format string that the {@link Ext.util.Format#dateRenderer}
     * and {@link Ext.util.Format#date} functions use.  See {@link Ext.Date} for details.
     *
     * This may be overridden in a locale file.
     */
    defaultFormat : "m/d/Y",
    //</locale>
    //<locale type="function">
    /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based JavaScript month number.
     * @return {String} The short month name.
     */
    getShortMonthName : function(month) {
        return Ext.Date.monthNames[month].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based JavaScript day number.
     * @return {String} The short day name.
     */
    getShortDayName : function(day) {
        return Ext.Date.dayNames[day].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * Get the zero-based JavaScript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based JavaScript month number.
     */
    getMonthNumber : function(name) {
        // handle camel casing for English month names (since the keys for the Ext.Date.monthNumbers hash are case sensitive)
        return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    },
    //</locale>

    /**
     * Checks if the specified format contains hour information
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains hour information
     * @method
     */
    formatContainsHourInfo : function(format){
        return hourInfoRe.test(format.replace(stripEscapeRe, ''));
    },

    /**
     * Checks if the specified format contains information about
     * anything other than the time.
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains information about
     * date/day information.
     * @method
     */
    formatContainsDateInfo : function(format){
        return dateInfoRe.test(format.replace(stripEscapeRe, ''));
    },
    
    /**
     * Removes all escaping for a date format string. In date formats,
     * using a '\' can be used to escape special characters.
     * @param {String} format The format to unescape
     * @return {String} The unescaped format
     * @method
     */
    unescapeFormat: function(format) {
        // Escape the format, since \ can be used to escape special
        // characters in a date format. For example, in a Spanish
        // locale the format may be: 'd \\de F \\de Y'
        return format.replace(slashRe, '');
    },

    /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     *
     * __Note:__ Ext.Date.format() treats characters as literals if an appropriate mapping cannot be found.
     *
     * Example:
     *
     *     Ext.Date.formatCodes.x = "Ext.util.Format.leftPad(this.getDate(), 2, '0')";
     *     console.log(Ext.Date.format(new Date(), 'X'); // returns the current day of the month
     * @type Object
     */
    formatCodes : {
        d: "Ext.String.leftPad(this.getDate(), 2, '0')",
        D: "Ext.Date.getShortDayName(this.getDay())", // get localized short day name
        j: "this.getDate()",
        l: "Ext.Date.dayNames[this.getDay()]",
        N: "(this.getDay() ? this.getDay() : 7)",
        S: "Ext.Date.getSuffix(this)",
        w: "this.getDay()",
        z: "Ext.Date.getDayOfYear(this)",
        W: "Ext.String.leftPad(Ext.Date.getWeekOfYear(this), 2, '0')",
        F: "Ext.Date.monthNames[this.getMonth()]",
        m: "Ext.String.leftPad(this.getMonth() + 1, 2, '0')",
        M: "Ext.Date.getShortMonthName(this.getMonth())", // get localized short month name
        n: "(this.getMonth() + 1)",
        t: "Ext.Date.getDaysInMonth(this)",
        L: "(Ext.Date.isLeapYear(this) ? 1 : 0)",
        o: "(this.getFullYear() + (Ext.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
        Y: "Ext.String.leftPad(this.getFullYear(), 4, '0')",
        y: "('' + this.getFullYear()).substring(2, 4)",
        a: "(this.getHours() < 12 ? 'am' : 'pm')",
        A: "(this.getHours() < 12 ? 'AM' : 'PM')",
        g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
        G: "this.getHours()",
        h: "Ext.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
        H: "Ext.String.leftPad(this.getHours(), 2, '0')",
        i: "Ext.String.leftPad(this.getMinutes(), 2, '0')",
        s: "Ext.String.leftPad(this.getSeconds(), 2, '0')",
        u: "Ext.String.leftPad(this.getMilliseconds(), 3, '0')",
        O: "Ext.Date.getGMTOffset(this)",
        P: "Ext.Date.getGMTOffset(this, true)",
        T: "Ext.Date.getTimezone(this)",
        Z: "(this.getTimezoneOffset() * -60)",

        c: function() { // ISO-8601 -- GMT format
            var c, code, i, l, e;
            for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                e = c.charAt(i);
                code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); // treat T as a character literal
            }
            return code.join(" + ");
        },
        /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "Ext.util.Format.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "Ext.util.Format.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "Ext.util.Format.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "Ext.util.Format.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "Ext.util.Format.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

        U: "Math.round(this.getTime() / 1000)"
    },

    /**
     * Checks if the passed Date parameters will cause a JavaScript Date "rollover".
     * @param {Number} year 4-digit year
     * @param {Number} month 1-based month-of-year
     * @param {Number} day Day of month
     * @param {Number} hour (optional) Hour
     * @param {Number} minute (optional) Minute
     * @param {Number} second (optional) Second
     * @param {Number} millisecond (optional) Millisecond
     * @return {Boolean} `true` if the passed parameters do not cause a Date "rollover", `false` otherwise.
     */
    isValid : function(y, m, d, h, i, s, ms) {
        // setup defaults
        h = h || 0;
        i = i || 0;
        s = s || 0;
        ms = ms || 0;

        // Special handling for year < 100
        var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);

        return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
    },

    /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based (i.e. 1 = January).
     * The {@link #defaults} hash will be used for any date value (i.e. year, month, day, hour, minute, second or millisecond)
     * which cannot be found in the passed string. If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used instead.
     * Keep in mind that the input date string must precisely match the specified format string
     * in order for the parse operation to be successful (failed parse operations return a null value).
     * 
     * Example:
     *
     *     //dt = Fri May 25 2007 (current date)
     *     var dt = new Date();
     *     
     *     //dt = Thu May 25 2006 (today&#39;s month/day in 2006)
     *     dt = Ext.Date.parse("2006", "Y");
     *     
     *     //dt = Sun Jan 15 2006 (all date parts specified)
     *     dt = Ext.Date.parse("2006-01-15", "Y-m-d");
     *     
     *     //dt = Sun Jan 15 2006 15:20:01
     *     dt = Ext.Date.parse("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");
     *     
     *     // attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
     *     dt = Ext.Date.parse("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
     *
     * @param {String} input The raw date string.
     * @param {String} format The expected date string format.
     * @param {Boolean} [strict=false] (optional) `true` to validate date strings while parsing (i.e. prevents JavaScript Date "rollover").
     * Invalid date strings will return `null` when parsed.
     * @return {Date} The parsed Date.
     */
    parse : function(input, format, strict) {
        var p = utilDate.parseFunctions;
        if (p[format] == null) {
            utilDate.createParser(format);
        }
        return p[format].call(utilDate, input, Ext.isDefined(strict) ? strict : utilDate.useStrict);
    },

    // Backwards compat
    parseDate: function(input, format, strict){
        return utilDate.parse(input, format, strict);
    },


    // private
    getFormatCode : function(character) {
        var f = utilDate.formatCodes[character];

        if (f) {
          f = typeof f == 'function'? f() : f;
          utilDate.formatCodes[character] = f; // reassign function result to prevent repeated execution
        }

        // note: unknown characters are treated as literals
        return f || ("'" + Ext.String.escape(character) + "'");
    },

    // private
    createFormat : function(format) {
        var code = [],
            special = false,
            ch = '',
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                code.push("'" + Ext.String.escape(ch) + "'");
            } else {
                code.push(utilDate.getFormatCode(ch));
            }
        }
        utilDate.formatFunctions[format] = Ext.functionFactory("return " + code.join('+'));
    },

    // private
    createParser : function(format) {
        var regexNum = utilDate.parseRegexes.length,
            currentGroup = 1,
            calc = [],
            regex = [],
            special = false,
            ch = "",
            i = 0,
            len = format.length,
            atEnd = [],
            obj;

        for (; i < len; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                regex.push(Ext.String.escape(ch));
            } else {
                obj = utilDate.formatCodeToRegex(ch, currentGroup);
                currentGroup += obj.g;
                regex.push(obj.s);
                if (obj.g && obj.c) {
                    if (obj.calcAtEnd) {
                        atEnd.push(obj.c);
                    } else {
                        calc.push(obj.c);
                    }
                }
            }
        }

        calc = calc.concat(atEnd);

        utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
        utilDate.parseFunctions[format] = Ext.functionFactory("input", "strict", xf(code, regexNum, calc.join('')));
    },

    // private
    parseCodes : {
        /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
        d: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
        },
        j: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
        },
        D: function() {
            for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); // get localised short day names
            return {
                g:0,
                c:null,
                s:"(?:" + a.join("|") +")"
            };
        },
        l: function() {
            return {
                g:0,
                c:null,
                s:"(?:" + utilDate.dayNames.join("|") + ")"
            };
        },
        N: {
            g:0,
            c:null,
            s:"[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
        },
        //<locale type="object" property="parseCodes">
        S: {
            g:0,
            c:null,
            s:"(?:st|nd|rd|th)"
        },
        //</locale>
        w: {
            g:0,
            c:null,
            s:"[0-6]" // JavaScript day number (0 (sunday) - 6 (saturday))
        },
        z: {
            g:1,
            c:"z = parseInt(results[{0}], 10);\n",
            s:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
        },
        W: {
            g:1,
            c:"W = parseInt(results[{0}], 10);\n",
            s:"(\\d{2})" // ISO-8601 week number (with leading zero)
        },
        F: function() {
            return {
                g:1,
                c:"m = parseInt(me.getMonthNumber(results[{0}]), 10);\n", // get localised month number
                s:"(" + utilDate.monthNames.join("|") + ")"
            };
        },
        M: function() {
            for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); // get localised short month names
            return Ext.applyIf({
                s:"(" + a.join("|") + ")"
            }, utilDate.formatCodeToRegex("F"));
        },
        m: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
        },
        n: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
        },
        t: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // no. of days in the month (28 - 31)
        },
        L: {
            g:0,
            c:null,
            s:"(?:1|0)"
        },
        o: { 
            g: 1,
            c: "y = parseInt(results[{0}], 10);\n",
            s: "(\\d{4})" // ISO-8601 year number (with leading zero)

        },
        Y: {
            g:1,
            c:"y = parseInt(results[{0}], 10);\n",
            s:"(\\d{4})" // 4-digit year
        },
        y: {
            g:1,
            c:"var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
            s:"(\\d{1,2})"
        },
        /*
         * In the am/pm parsing routines, we allow both upper and lower case
         * even though it doesn't exactly match the spec. It gives much more flexibility
         * in being able to specify case insensitive regexes.
         */
        //<locale type="object" property="parseCodes">
        a: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(am|pm|AM|PM)",
            calcAtEnd: true
        },
        //</locale>
        //<locale type="object" property="parseCodes">
        A: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(AM|PM|am|pm)",
            calcAtEnd: true
        },
        //</locale>
        g: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
        },
        G: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
        },
        h: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
        },
        H: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
        },
        i: {
            g:1,
            c:"i = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // minutes with leading zeros (00 - 59)
        },
        s: {
            g:1,
            c:"s = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // seconds with leading zeros (00 - 59)
        },
        u: {
            g:1,
            c:"ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
            s:"(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
        },
        O: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(3,5) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{4})" // GMT offset in hrs and mins
        },
        P: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(4,6) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        },
        T: {
            g:0,
            c:null,
            s:"[A-Z]{1,5}" // timezone abbrev. may be between 1 - 5 chars
        },
        Z: {
            g:1,
            c:"zz = results[{0}] * 1;\n" // -43200 <= UTC offset <= 50400
                  + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
            s:"([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
        },
        c: function() {
            var calc = [],
                arr = [
                    utilDate.formatCodeToRegex("Y", 1), // year
                    utilDate.formatCodeToRegex("m", 2), // month
                    utilDate.formatCodeToRegex("d", 3), // day
                    utilDate.formatCodeToRegex("H", 4), // hour
                    utilDate.formatCodeToRegex("i", 5), // minute
                    utilDate.formatCodeToRegex("s", 6), // second
                    {c:"ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                    {c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                        "if(results[8]) {", // timezone specified
                            "if(results[8] == 'Z'){",
                                "zz = 0;", // UTC
                            "}else if (results[8].indexOf(':') > -1){",
                                utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
                            "}else{",
                                utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
                            "}",
                        "}"
                    ].join('\n')}
                ],
                i,
                l;

            for (i = 0, l = arr.length; i < l; ++i) {
                calc.push(arr[i].c);
            }

            return {
                g:1,
                c:calc.join(""),
                s:[
                    arr[0].s, // year (required)
                    "(?:", "-", arr[1].s, // month (optional)
                        "(?:", "-", arr[2].s, // day (optional)
                            "(?:",
                                "(?:T| )?", // time delimiter -- either a "T" or a single blank space
                                arr[3].s, ":", arr[4].s,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                                "(?::", arr[5].s, ")?", // seconds (optional)
                                "(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                                "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                            ")?",
                        ")?",
                    ")?"
                ].join("")
            };
        },
        U: {
            g:1,
            c:"u = parseInt(results[{0}], 10);\n",
            s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
        }
    },

    //Old Ext.Date prototype methods.
    // private
    dateFormat: function(date, format) {
        return utilDate.format(date, format);
    },

    /**
     * Compares if two dates are equal by comparing their values.
     * @param {Date} date1
     * @param {Date} date2
     * @return {Boolean} `true` if the date values are equal
     */
    isEqual: function(date1, date2) {
        // check we have 2 date objects
        if (date1 && date2) {
            return (date1.getTime() === date2.getTime());
        }
        // one or both isn't a date, only equal if both are falsey
        return !(date1 || date2);
    },

    /**
     * Formats a date given the supplied format string.
     * @param {Date} date The date to format
     * @param {String} format The format string
     * @return {String} The formatted date or an empty string if date parameter is not a JavaScript Date object
     */
    format: function(date, format) {
        var formatFunctions = utilDate.formatFunctions;

        if (!Ext.isDate(date)) {
            return '';
        }

        if (formatFunctions[format] == null) {
            utilDate.createFormat(format);
        }

        return formatFunctions[format].call(date) + '';
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * __Note:__ The date string returned by the JavaScript Date object's `toString()` method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in America).
     * For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() first tries to get the timezone abbreviation from between a pair of parentheses
     * (which may or may not be present), failing which it proceeds to get the timezone abbreviation
     * from the GMT offset portion of the date string.
     * @param {Date} date The date
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone : function(date) {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     * @param {Date} date The date
     * @param {Boolean} [colon=false] (optional) true to separate the hours and minutes with a colon.
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset : function(date, colon) {
        var offset = date.getTimezoneOffset();
        return (offset > 0 ? "-" : "+")
            + Ext.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
            + (colon ? ":" : "")
            + Ext.String.leftPad(Math.abs(offset % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function(date) {
        var num = 0,
            d = Ext.Date.clone(date),
            m = date.getMonth(),
            i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += utilDate.getDaysInMonth(d);
        }
        return num + date.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     * @param {Date} date The date
     * @return {Number} 1 to 53
     * @method
     */
    getWeekOfYear : (function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5, // milliseconds in a day
            ms7d = 7 * ms1d; // milliseconds in a week

        return function(date) { // return a closure so constants get calculated only once
            var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
                AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }()),

    /**
     * Checks if the current date falls within a leap year.
     * @param {Date} date The date
     * @return {Boolean} True if the current date falls within a leap year, false otherwise.
     */
    isLeapYear : function(date) {
        var year = date.getFullYear();
        return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     *
     * Example:
     *
     *     var dt = new Date('1/10/2007'),
     *         firstDay = Ext.Date.getFirstDayOfMonth(dt);
     *     console.log(Ext.Date.dayNames[firstDay]); // output: 'Monday'
     *
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth : function(date) {
        var day = (date.getDay() - (date.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     *
     * Example:
     *
     *     var dt = new Date('1/10/2007'),
     *         lastDay = Ext.Date.getLastDayOfMonth(dt);
     *     console.log(Ext.Date.dayNames[lastDay]); // output: 'Wednesday'
     *
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth : function(date) {
        return utilDate.getLastDateOfMonth(date).getDay();
    },


    /**
     * Get the date of the first day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getFirstDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getLastDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} The number of days in the month.
     * @method
     */
    getDaysInMonth: (function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(date) { // return a closure for efficiency
            var m = date.getMonth();

            return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
        };
    }()),

    //<locale type="function">
    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @param {Date} date The date
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix : function(date) {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    },
    //</locale>

    /**
     * Creates and returns a new Date instance with the exact same date value as the called instance.
     * Dates are copied and passed by reference, so if a copied date variable is modified later, the original
     * variable will also be changed.  When the intention is to create a new variable that will not
     * modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     *
     *     //wrong way:
     *     var orig = new Date('10/1/2006');
     *     var copy = orig;
     *     copy.setDate(5);
     *     console.log(orig);  // returns 'Thu Oct 05 2006'!
     *
     *     //correct way:
     *     var orig = new Date('10/1/2006'),
     *         copy = Ext.Date.clone(orig);
     *     copy.setDate(5);
     *     console.log(orig);  // returns 'Thu Oct 01 2006'
     *
     * @param {Date} date The date.
     * @return {Date} The new Date instance.
     */
    clone : function(date) {
        return new Date(date.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @param {Date} date The date
     * @return {Boolean} `true` if the current date is affected by DST.
     */
    isDST : function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
     * automatically adjusting for Daylight Saving Time (DST) where applicable.
     *
     * __Note:__ DST timezone information for the browser's host operating system is assumed to be up-to-date.
     * @param {Date} date The date
     * @param {Boolean} [clone=false] `true` to create a clone of this date, clear the time and return it.
     * @return {Date} this or the clone.
     */
    clearTime : function(date, clone) {
        if (clone) {
            return Ext.Date.clearTime(Ext.Date.clone(date));
        }

        // get current date before clearing time
        var d = date.getDate(),
            hr,
            c;

        // clear time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

            // increment hour until cloned date == current date
            for (hr = 1, c = utilDate.add(date, Ext.Date.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, Ext.Date.HOUR, hr));

            date.setDate(d);
            date.setHours(c.getHours());
        }

        return date;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     *
     *     // Basic usage:
     *     var dt = Ext.Date.add(new Date('10/29/2006'), Ext.Date.DAY, 5);
     *     console.log(dt); // returns 'Fri Nov 03 2006 00:00:00'
     *
     *     // Negative values will be subtracted:
     *     var dt2 = Ext.Date.add(new Date('10/1/2006'), Ext.Date.DAY, -5);
     *     console.log(dt2); // returns 'Tue Sep 26 2006 00:00:00'
     *
     *      // Decimal values can be used:
     *     var dt3 = Ext.Date.add(new Date('10/1/2006'), Ext.Date.DAY, 1.25);
     *     console.log(dt3); // returns 'Mon Oct 02 2006 06:00:00'
     *
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    add : function(date, interval, value) {
        var d = Ext.Date.clone(date),
            Date = Ext.Date,
            day, decimalValue, base = 0;
        if (!interval || value === 0) {
            return d;
        }

        decimalValue = value - parseInt(value, 10);
        value = parseInt(value, 10);

        if (value) {
            switch(interval.toLowerCase()) {
                // See EXTJSIV-7418. We use setTime() here to deal with issues related to
                // the switchover that occurs when changing to daylight savings and vice
                // versa. setTime() handles this correctly where setHour/Minute/Second/Millisecond
                // do not. Let's assume the DST change occurs at 2am and we're incrementing using add
                // for 15 minutes at time. When entering DST, we should see:
                // 01:30am
                // 01:45am
                // 03:00am // skip 2am because the hour does not exist
                // ...
                // Similarly, leaving DST, we should see:
                // 01:30am
                // 01:45am
                // 01:00am // repeat 1am because that's the change over
                // 01:30am
                // 01:45am
                // 02:00am
                // ....
                // 
                case Ext.Date.MILLI:
                    d.setTime(d.getTime() + value);
                    break;
                case Ext.Date.SECOND:
                    d.setTime(d.getTime() + value * 1000);
                    break;
                case Ext.Date.MINUTE:
                    d.setTime(d.getTime() + value * 60 * 1000);
                    break;
                case Ext.Date.HOUR:
                    d.setTime(d.getTime() + value * 60 * 60 * 1000);
                    break;
                case Ext.Date.DAY:
                    d.setDate(d.getDate() + value);
                    break;
                case Ext.Date.MONTH:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(date), Ext.Date.MONTH, value)).getDate());
                    }
                    d.setDate(day);
                    d.setMonth(date.getMonth() + value);
                    break;
                case Ext.Date.YEAR:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(date), Ext.Date.YEAR, value)).getDate());
                    }
                    d.setDate(day);
                    d.setFullYear(date.getFullYear() + value);
                    break;
            }
        }

        if (decimalValue) {
            switch (interval.toLowerCase()) {
                case Ext.Date.MILLI:    base = 1;               break;
                case Ext.Date.SECOND:   base = 1000;            break;
                case Ext.Date.MINUTE:   base = 1000*60;         break;
                case Ext.Date.HOUR:     base = 1000*60*60;      break;
                case Ext.Date.DAY:      base = 1000*60*60*24;   break;

                case Ext.Date.MONTH:
                    day = utilDate.getDaysInMonth(d);
                    base = 1000*60*60*24*day;
                    break;

                case Ext.Date.YEAR:
                    day = (utilDate.isLeapYear(d) ? 366 : 365);
                    base = 1000*60*60*24*day;
                    break;
            }
            if (base) {
                d.setTime(d.getTime() + base * decimalValue); 
            }
        }

        return d;
    },
    
    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     * 
     * Examples:
     *
     *     // Basic usage:
     *     var dt = Ext.Date.subtract(new Date('10/29/2006'), Ext.Date.DAY, 5);
     *     console.log(dt); // returns 'Tue Oct 24 2006 00:00:00'
     *
     *     // Negative values will be added:
     *     var dt2 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, -5);
     *     console.log(dt2); // returns 'Fri Oct 6 2006 00:00:00'
     *
     *      // Decimal values can be used:
     *     var dt3 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, 1.25);
     *     console.log(dt3); // returns 'Fri Sep 29 2006 06:00:00'
     * 
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to subtract from the current date.
     * @return {Date} The new Date instance.
     */
    subtract: function(date, interval, value){
        return utilDate.add(date, interval, -value);
    },

    /**
     * Checks if a date falls on or between the given start and end dates.
     * @param {Date} date The date to check
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} `true` if this date falls on or between the given start and end dates.
     */
    between : function(date, start, end) {
        var t = date.getTime();
        return start.getTime() <= t && t <= end.getTime();
    },

    //Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var nativeDate = window.Date,
            p,
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            sLen    = statics.length,
            pLen    = proto.length,
            stat, prot, s;

        //Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        //Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];
            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return utilDate[prot].apply(utilDate, args);
            };
        }
    }
  });
};

// @tag foundation,core
// @require ../lang/Date.js
// @define Ext.Base

/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.Base
 *
 * The root of all classes created with {@link Ext#define}.
 *
 * Ext.Base is the building block of all Ext classes. All classes in Ext inherit from Ext.Base.
 * All prototype and static members of this class are inherited by all other classes.
 */
(function(flexSetter) {

var noArgs = [],
    Base = function(){},
    hookFunctionFactory = function(hookFunction, underriddenFunction, methodName, owningClass) {
        var result = function() {
            var result = this.callParent(arguments);
            hookFunction.apply(this, arguments);
            return result;
        };
        result.$name = methodName;
        result.$owner = owningClass;
        if (underriddenFunction) {
            result.$previous = underriddenFunction.$previous;
            underriddenFunction.$previous = result;
        }
        return result;
    };

    // These static properties will be copied to every newly created class with {@link Ext#define}
    Ext.apply(Base, {
        $className: 'Ext.Base',

        $isClass: true,

        /**
         * Create a new instance of this Class.
         *
         *     Ext.define('My.cool.Class', {
         *         ...
         *     });
         *
         *     My.cool.Class.create({
         *         someConfig: true
         *     });
         *
         * All parameters are passed to the constructor of the class.
         *
         * @return {Object} the created instance.
         * @static
         * @inheritable
         */
        create: function() {
            return Ext.create.apply(Ext, [this].concat(Array.prototype.slice.call(arguments, 0)));
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param config
         */
        extend: function(parent) {
            var parentPrototype = parent.prototype,
                basePrototype, prototype, i, ln, name, statics;

            prototype = this.prototype = Ext.Object.chain(parentPrototype);
            prototype.self = this;

            this.superclass = prototype.superclass = parentPrototype;

            if (!parent.$isClass) {
                basePrototype = Ext.Base.prototype;

                for (i in basePrototype) {
                    if (i in prototype) {
                        prototype[i] = basePrototype[i];
                    }
                }
            }

            // Statics inheritance
            statics = parentPrototype.$inheritableStatics;

            if (statics) {
                for (i = 0,ln = statics.length; i < ln; i++) {
                    name = statics[i];

                    if (!this.hasOwnProperty(name)) {
                        this[name] = parent[name];
                    }
                }
            }

            if (parent.$onExtended) {
                this.$onExtended = parent.$onExtended.slice();
            }

            prototype.config = new prototype.configClass();
            prototype.initConfigList = prototype.initConfigList.slice();
            prototype.initConfigMap = Ext.clone(prototype.initConfigMap);
            prototype.configMap = Ext.Object.chain(prototype.configMap);
        },

        /**
         * @private
         * @static
         * @inheritable
         */
        $onExtended: [],

        /**
         * @private
         * @static
         * @inheritable
         */
        triggerExtended: function() {
            Ext.classSystemMonitor && Ext.classSystemMonitor(this, 'Ext.Base#triggerExtended', arguments);
        
            var callbacks = this.$onExtended,
                ln = callbacks.length,
                i, callback;

            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    callback = callbacks[i];
                    callback.fn.apply(callback.scope || this, arguments);
                }
            }
        },

        /**
         * @private
         * @static
         * @inheritable
         */
        onExtended: function(fn, scope) {
            this.$onExtended.push({
                fn: fn,
                scope: scope
            });

            return this;
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param config
         */
        addConfig: function(config, fullMerge) {
            var prototype = this.prototype,
                configNameCache = Ext.Class.configNameCache,
                hasConfig = prototype.configMap,
                initConfigList = prototype.initConfigList,
                initConfigMap = prototype.initConfigMap,
                defaultConfig = prototype.config,
                initializedName, name, value;

            for (name in config) {
                if (config.hasOwnProperty(name)) {
                    if (!hasConfig[name]) {
                        hasConfig[name] = true;
                    }

                    value = config[name];

                    initializedName = configNameCache[name].initialized;

                    if (!initConfigMap[name] && value !== null && !prototype[initializedName]) {
                        initConfigMap[name] = true;
                        initConfigList.push(name);
                    }
                }
            }

            if (fullMerge) {
                Ext.merge(defaultConfig, config);
            }
            else {
                Ext.mergeIf(defaultConfig, config);
            }

            prototype.configClass = Ext.Object.classify(defaultConfig);
        },

        /**
         * Add / override static properties of this class.
         *
         *     Ext.define('My.cool.Class', {
         *         ...
         *     });
         *
         *     My.cool.Class.addStatics({
         *         someProperty: 'someValue',      // My.cool.Class.someProperty = 'someValue'
         *         method1: function() { ... },    // My.cool.Class.method1 = function() { ... };
         *         method2: function() { ... }     // My.cool.Class.method2 = function() { ... };
         *     });
         *
         * @param {Object} members
         * @return {Ext.Base} this
         * @static
         * @inheritable
         */
        addStatics: function(members) {
            var member, name;

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    if (typeof member == 'function' && !member.$isClass && member !== Ext.emptyFn && member !== Ext.identityFn) {
                        member.$owner = this;
                        member.$name = name;
                        member.displayName = Ext.getClassName(this) + '.' + name;
                    }
                    this[name] = member;
                }
            }

            return this;
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param {Object} members
         */
        addInheritableStatics: function(members) {
            var inheritableStatics,
                hasInheritableStatics,
                prototype = this.prototype,
                name, member;

            inheritableStatics = prototype.$inheritableStatics;
            hasInheritableStatics = prototype.$hasInheritableStatics;

            if (!inheritableStatics) {
                inheritableStatics = prototype.$inheritableStatics = [];
                hasInheritableStatics = prototype.$hasInheritableStatics = {};
            }

            for (name in members) {
                if (members.hasOwnProperty(name)) {
                    member = members[name];
                    if (typeof member == 'function') {
                        member.displayName = Ext.getClassName(this) + '.' + name;
                    }
                    this[name] = member;

                    if (!hasInheritableStatics[name]) {
                        hasInheritableStatics[name] = true;
                        inheritableStatics.push(name);
                    }
                }
            }

            return this;
        },

        /**
         * Add methods / properties to the prototype of this class.
         *
         *     Ext.define('My.awesome.Cat', {
         *         constructor: function() {
         *             ...
         *         }
         *     });
         *
         *      My.awesome.Cat.addMembers({
         *          meow: function() {
         *             alert('Meowww...');
         *          }
         *      });
         *
         *      var kitty = new My.awesome.Cat;
         *      kitty.meow();
         *
         * @param {Object} members
         * @static
         * @inheritable
         */
        addMembers: function(members) {
            var prototype = this.prototype,
                enumerables = Ext.enumerables,
                names = [],
                i, ln, name, member;

            for (name in members) {
                names.push(name);
            }

            if (enumerables) {
                names.push.apply(names, enumerables);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];

                if (members.hasOwnProperty(name)) {
                    member = members[name];

                    if (typeof member == 'function' && !member.$isClass && member !== Ext.emptyFn && member !== Ext.identityFn) {
                        member.$owner = this;
                        member.$name = name;
                        member.displayName = (this.$className || '') + '#' + name;
                    }

                    prototype[name] = member;
                }
            }

            return this;
        },

        /**
         * @private
         * @static
         * @inheritable
         * @param name
         * @param member
         */
        addMember: function(name, member) {            
            if (typeof member == 'function' && !member.$isClass && member !== Ext.emptyFn && member !== Ext.identityFn) {
                member.$owner = this;
                member.$name = name;
                member.displayName = (this.$className || '') + '#' + name;
            }

            this.prototype[name] = member;
            return this;
        },

        /**
         * Adds members to class.
         * @static
         * @inheritable
         * @deprecated 4.1 Use {@link #addMembers} instead.
         */
        implement: function() {
            this.addMembers.apply(this, arguments);
        },

        /**
         * Borrow another class' members to the prototype of this class.
         *
         *     Ext.define('Bank', {
         *         money: '$$$',
         *         printMoney: function() {
         *             alert('$$$$$$$');
         *         }
         *     });
         *
         *     Ext.define('Thief', {
         *         ...
         *     });
         *
         *     Thief.borrow(Bank, ['money', 'printMoney']);
         *
         *     var steve = new Thief();
         *
         *     alert(steve.money); // alerts '$$$'
         *     steve.printMoney(); // alerts '$$$$$$$'
         *
         * @param {Ext.Base} fromClass The class to borrow members from
         * @param {Array/String} members The names of the members to borrow
         * @return {Ext.Base} this
         * @static
         * @inheritable
         * @private
         */
        borrow: function(fromClass, members) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(this, 'Ext.Base#borrow', arguments);
            
            var prototype = this.prototype,
                fromPrototype = fromClass.prototype,
                className = Ext.getClassName(this),
                i, ln, name, fn, toBorrow;

            members = Ext.Array.from(members);

            for (i = 0,ln = members.length; i < ln; i++) {
                name = members[i];

                toBorrow = fromPrototype[name];

                if (typeof toBorrow == 'function') {
                    fn = Ext.Function.clone(toBorrow);

                    if (className) {
                        fn.displayName = className + '#' + name;
                    }

                    fn.$owner = this;
                    fn.$name = name;

                    prototype[name] = fn;
                }
                else {
                    prototype[name] = toBorrow;
                }
            }

            return this;
        },

        /**
         * Override members of this class. Overridden methods can be invoked via
         * {@link Ext.Base#callParent}.
         *
         *     Ext.define('My.Cat', {
         *         constructor: function() {
         *             alert("I'm a cat!");
         *         }
         *     });
         *
         *     My.Cat.override({
         *         constructor: function() {
         *             alert("I'm going to be a cat!");
         *
         *             this.callParent(arguments);
         *
         *             alert("Meeeeoooowwww");
         *         }
         *     });
         *
         *     var kitty = new My.Cat(); // alerts "I'm going to be a cat!"
         *                               // alerts "I'm a cat!"
         *                               // alerts "Meeeeoooowwww"
         *
         * As of 4.1, direct use of this method is deprecated. Use {@link Ext#define Ext.define}
         * instead:
         *
         *     Ext.define('My.CatOverride', {
         *         override: 'My.Cat',
         *         constructor: function() {
         *             alert("I'm going to be a cat!");
         *
         *             this.callParent(arguments);
         *
         *             alert("Meeeeoooowwww");
         *         }
         *     });
         *
         * The above accomplishes the same result but can be managed by the {@link Ext.Loader}
         * which can properly order the override and its target class and the build process
         * can determine whether the override is needed based on the required state of the
         * target class (My.Cat).
         *
         * @param {Object} members The properties to add to this class. This should be
         * specified as an object literal containing one or more properties.
         * @return {Ext.Base} this class
         * @static
         * @inheritable
         * @markdown
         * @deprecated 4.1.0 Use {@link Ext#define Ext.define} instead
         */
        override: function(members) {
            var me = this,
                enumerables = Ext.enumerables,
                target = me.prototype,
                cloneFunction = Ext.Function.clone,
                name, index, member, statics, names, previous;

            if (arguments.length === 2) {
                name = members;
                members = {};
                members[name] = arguments[1];
                enumerables = null;
            }

            do {
                names = []; // clean slate for prototype (1st pass) and static (2nd pass)
                statics = null; // not needed 1st pass, but needs to be cleared for 2nd pass

                for (name in members) { // hasOwnProperty is checked in the next loop...
                    if (name == 'statics') {
                        statics = members[name];
                    } else if (name == 'inheritableStatics'){
                        me.addInheritableStatics(members[name]);
                    } else if (name == 'config') {
                        me.addConfig(members[name], true);
                    } else {
                        names.push(name);
                    }
                }

                if (enumerables) {
                    names.push.apply(names, enumerables);
                }

                for (index = names.length; index--; ) {
                    name = names[index];

                    if (members.hasOwnProperty(name)) {
                        member = members[name];

                        if (typeof member == 'function' && !member.$className && member !== Ext.emptyFn && member !== Ext.identityFn) {
                            if (typeof member.$owner != 'undefined') {
                                member = cloneFunction(member);
                            }

                            if (me.$className) {
                                member.displayName = me.$className + '#' + name;
                            }

                            member.$owner = me;
                            member.$name = name;

                            previous = target[name];
                            if (previous) {
                                member.$previous = previous;
                            }
                        }

                        target[name] = member;
                    }
                }

                target = me; // 2nd pass is for statics
                members = statics; // statics will be null on 2nd pass
            } while (members);

            return this;
        },

        // Documented downwards
        callParent: function(args) {
            var method;

            // This code is intentionally inlined for the least number of debugger stepping
            return (method = this.callParent.caller) && (method.$previous ||
                  ((method = method.$owner ? method : method.caller) &&
                        method.$owner.superclass.self[method.$name])).apply(this, args || noArgs);
        },

        // Documented downwards
        callSuper: function(args) {
            var method;

            // This code is intentionally inlined for the least number of debugger stepping
            return (method = this.callSuper.caller) &&
                    ((method = method.$owner ? method : method.caller) &&
                      method.$owner.superclass.self[method.$name]).apply(this, args || noArgs);
        },

        /**
         * Used internally by the mixins pre-processor
         * @private
         * @static
         * @inheritable
         */
        mixin: function(name, mixinClass) {
            var me = this,
                mixin = mixinClass.prototype,
                prototype = me.prototype,
                key, statics, i, ln, staticName,
                mixinValue, hookKey, hookFunction;

            if (typeof mixin.onClassMixedIn != 'undefined') {
                mixin.onClassMixedIn.call(mixinClass, me);
            }

            if (!prototype.hasOwnProperty('mixins')) {
                if ('mixins' in prototype) {
                    prototype.mixins = Ext.Object.chain(prototype.mixins);
                }
                else {
                    prototype.mixins = {};
                }
            }

            for (key in mixin) {
                mixinValue = mixin[key];
                if (key === 'mixins') {
                    Ext.merge(prototype.mixins, mixinValue);
                }
                else if (key === 'xhooks') {
                    for (hookKey in mixinValue) {
                        hookFunction = mixinValue[hookKey];

                        // Mixed in xhook methods cannot call a parent.
                        hookFunction.$previous = Ext.emptyFn;

                        if (prototype.hasOwnProperty(hookKey)) {

                            // Pass the hook function, and the existing function which it is to underride.
                            // The existing function has its $previous pointer replaced by a closure
                            // which calls the hookFunction and then the existing function's original $previous
                            hookFunctionFactory(hookFunction, prototype[hookKey], hookKey, me);
                        } else {
                            // There's no original function, so generate an implementation which calls
                            // the hook function. It will not get any $previous pointer.
                            prototype[hookKey] = hookFunctionFactory(hookFunction, null, hookKey, me);
                        }
                    }
                }
                else if (!(key === 'mixinId' || key === 'config') && (prototype[key] === undefined)) {
                    prototype[key] = mixinValue;
                }
            }

            // Mixin statics inheritance
            statics = mixin.$inheritableStatics;

            if (statics) {
                for (i = 0, ln = statics.length; i < ln; i++) {
                    staticName = statics[i];

                    if (!me.hasOwnProperty(staticName)) {
                        me[staticName] = mixinClass[staticName];
                    }
                }
            }

            if ('config' in mixin) {
                me.addConfig(mixin.config, false);
            }

            prototype.mixins[name] = mixin;
            return me;
        },

        /**
         * Get the current class' name in string format.
         *
         *     Ext.define('My.cool.Class', {
         *         constructor: function() {
         *             alert(this.self.getName()); // alerts 'My.cool.Class'
         *         }
         *     });
         *
         *     My.cool.Class.getName(); // 'My.cool.Class'
         *
         * @return {String} className
         * @static
         * @inheritable
         */
        getName: function() {
            return Ext.getClassName(this);
        },

        /**
         * Create aliases for existing prototype methods. Example:
         *
         *     Ext.define('My.cool.Class', {
         *         method1: function() { ... },
         *         method2: function() { ... }
         *     });
         *
         *     var test = new My.cool.Class();
         *
         *     My.cool.Class.createAlias({
         *         method3: 'method1',
         *         method4: 'method2'
         *     });
         *
         *     test.method3(); // test.method1()
         *
         *     My.cool.Class.createAlias('method5', 'method3');
         *
         *     test.method5(); // test.method3() -> test.method1()
         *
         * @param {String/Object} alias The new method name, or an object to set multiple aliases. See
         * {@link Ext.Function#flexSetter flexSetter}
         * @param {String/Object} origin The original method name
         * @static
         * @inheritable
         * @method
         */
        createAlias: flexSetter(function(alias, origin) {
            this.override(alias, function() {
                return this[origin].apply(this, arguments);
            });
        }),

        /**
         * @private
         * @static
         * @inheritable
         */
        addXtype: function(xtype) {
            var prototype = this.prototype,
                xtypesMap = prototype.xtypesMap,
                xtypes = prototype.xtypes,
                xtypesChain = prototype.xtypesChain;

            if (!prototype.hasOwnProperty('xtypesMap')) {
                xtypesMap = prototype.xtypesMap = Ext.merge({}, prototype.xtypesMap || {});
                xtypes = prototype.xtypes = prototype.xtypes ? [].concat(prototype.xtypes) : [];
                xtypesChain = prototype.xtypesChain = prototype.xtypesChain ? [].concat(prototype.xtypesChain) : [];
                prototype.xtype = xtype;
            }

            if (!xtypesMap[xtype]) {
                xtypesMap[xtype] = true;
                xtypes.push(xtype);
                xtypesChain.push(xtype);
                Ext.ClassManager.setAlias(this, 'widget.' + xtype);
            }

            return this;
        }
    });

    Base.implement({
        /** @private */
        isInstance: true,

        /** @private */
        $className: 'Ext.Base',

        /** @private */
        configClass: Ext.emptyFn,

        /** @private */
        initConfigList: [],

        /** @private */
        configMap: {},

        /** @private */
        initConfigMap: {},

        /**
         * Get the reference to the class from which this object was instantiated. Note that unlike {@link Ext.Base#self},
         * `this.statics()` is scope-independent and it always returns the class from which it was called, regardless of what
         * `this` points to during run-time
         *
         *     Ext.define('My.Cat', {
         *         statics: {
         *             totalCreated: 0,
         *             speciesName: 'Cat' // My.Cat.speciesName = 'Cat'
         *         },
         *
         *         constructor: function() {
         *             var statics = this.statics();
         *
         *             alert(statics.speciesName);     // always equals to 'Cat' no matter what 'this' refers to
         *                                             // equivalent to: My.Cat.speciesName
         *
         *             alert(this.self.speciesName);   // dependent on 'this'
         *
         *             statics.totalCreated++;
         *         },
         *
         *         clone: function() {
         *             var cloned = new this.self;                      // dependent on 'this'
         *
         *             cloned.groupName = this.statics().speciesName;   // equivalent to: My.Cat.speciesName
         *
         *             return cloned;
         *         }
         *     });
         *
         *
         *     Ext.define('My.SnowLeopard', {
         *         extend: 'My.Cat',
         *
         *         statics: {
         *             speciesName: 'Snow Leopard'     // My.SnowLeopard.speciesName = 'Snow Leopard'
         *         },
         *
         *         constructor: function() {
         *             this.callParent();
         *         }
         *     });
         *
         *     var cat = new My.Cat();                 // alerts 'Cat', then alerts 'Cat'
         *
         *     var snowLeopard = new My.SnowLeopard(); // alerts 'Cat', then alerts 'Snow Leopard'
         *
         *     var clone = snowLeopard.clone();
         *     alert(Ext.getClassName(clone));         // alerts 'My.SnowLeopard'
         *     alert(clone.groupName);                 // alerts 'Cat'
         *
         *     alert(My.Cat.totalCreated);             // alerts 3
         *
         * @protected
         * @return {Ext.Class}
         */
        statics: function() {
            var method = this.statics.caller,
                self = this.self;

            if (!method) {
                return self;
            }

            return method.$owner;
        },

        /**
         * Call the "parent" method of the current method. That is the method previously
         * overridden by derivation or by an override (see {@link Ext#define}).
         *
         *      Ext.define('My.Base', {
         *          constructor: function (x) {
         *              this.x = x;
         *          },
         *
         *          statics: {
         *              method: function (x) {
         *                  return x;
         *              }
         *          }
         *      });
         *
         *      Ext.define('My.Derived', {
         *          extend: 'My.Base',
         *
         *          constructor: function () {
         *              this.callParent([21]);
         *          }
         *      });
         *
         *      var obj = new My.Derived();
         *
         *      alert(obj.x);  // alerts 21
         *
         * This can be used with an override as follows:
         *
         *      Ext.define('My.DerivedOverride', {
         *          override: 'My.Derived',
         *
         *          constructor: function (x) {
         *              this.callParent([x*2]); // calls original My.Derived constructor
         *          }
         *      });
         *
         *      var obj = new My.Derived();
         *
         *      alert(obj.x);  // now alerts 42
         *
         * This also works with static methods.
         *
         *      Ext.define('My.Derived2', {
         *          extend: 'My.Base',
         *
         *          statics: {
         *              method: function (x) {
         *                  return this.callParent([x*2]); // calls My.Base.method
         *              }
         *          }
         *      });
         *
         *      alert(My.Base.method(10);     // alerts 10
         *      alert(My.Derived2.method(10); // alerts 20
         *
         * Lastly, it also works with overridden static methods.
         *
         *      Ext.define('My.Derived2Override', {
         *          override: 'My.Derived2',
         *
         *          statics: {
         *              method: function (x) {
         *                  return this.callParent([x*2]); // calls My.Derived2.method
         *              }
         *          }
         *      });
         *
         *      alert(My.Derived2.method(10); // now alerts 40
         *
         * To override a method and replace it and also call the superclass method, use
         * {@link #callSuper}. This is often done to patch a method to fix a bug.
         *
         * @protected
         * @param {Array/Arguments} args The arguments, either an array or the `arguments` object
         * from the current method, for example: `this.callParent(arguments)`
         * @return {Object} Returns the result of calling the parent method
         */
        callParent: function(args) {
            // NOTE: this code is deliberately as few expressions (and no function calls)
            // as possible so that a debugger can skip over this noise with the minimum number
            // of steps. Basically, just hit Step Into until you are where you really wanted
            // to be.
            var method,
                superMethod = (method = this.callParent.caller) && (method.$previous ||
                        ((method = method.$owner ? method : method.caller) &&
                                method.$owner.superclass[method.$name]));

            if (!superMethod) {
                method = this.callParent.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callParent() was called but there's no such method (" + methodName +
                                ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }

            return superMethod.apply(this, args || noArgs);
        },

        /**
         * This method is used by an override to call the superclass method but bypass any
         * overridden method. This is often done to "patch" a method that contains a bug
         * but for whatever reason cannot be fixed directly.
         * 
         * Consider:
         * 
         *      Ext.define('Ext.some.Class', {
         *          method: function () {
         *              console.log('Good');
         *          }
         *      });
         * 
         *      Ext.define('Ext.some.DerivedClass', {
         *          method: function () {
         *              console.log('Bad');
         * 
         *              // ... logic but with a bug ...
         *              
         *              this.callParent();
         *          }
         *      });
         * 
         * To patch the bug in `DerivedClass.method`, the typical solution is to create an
         * override:
         * 
         *      Ext.define('App.paches.DerivedClass', {
         *          override: 'Ext.some.DerivedClass',
         *          
         *          method: function () {
         *              console.log('Fixed');
         * 
         *              // ... logic but with bug fixed ...
         *
         *              this.callSuper();
         *          }
         *      });
         * 
         * The patch method cannot use `callParent` to call the superclass `method` since
         * that would call the overridden method containing the bug. In other words, the
         * above patch would only produce "Fixed" then "Good" in the console log, whereas,
         * using `callParent` would produce "Fixed" then "Bad" then "Good".
         *
         * @protected
         * @param {Array/Arguments} args The arguments, either an array or the `arguments` object
         * from the current method, for example: `this.callSuper(arguments)`
         * @return {Object} Returns the result of calling the superclass method
         */
        callSuper: function(args) {
            // NOTE: this code is deliberately as few expressions (and no function calls)
            // as possible so that a debugger can skip over this noise with the minimum number
            // of steps. Basically, just hit Step Into until you are where you really wanted
            // to be.
            var method,
                superMethod = (method = this.callSuper.caller) &&
                        ((method = method.$owner ? method : method.caller) &&
                          method.$owner.superclass[method.$name]);

            if (!superMethod) {
                method = this.callSuper.caller;
                var parentClass, methodName;

                if (!method.$owner) {
                    if (!method.caller) {
                        throw new Error("Attempting to call a protected method from the public scope, which is not allowed");
                    }

                    method = method.caller;
                }

                parentClass = method.$owner.superclass;
                methodName = method.$name;

                if (!(methodName in parentClass)) {
                    throw new Error("this.callSuper() was called but there's no such method (" + methodName +
                                ") found in the parent class (" + (Ext.getClassName(parentClass) || 'Object') + ")");
                }
            }

            return superMethod.apply(this, args || noArgs);
        },

        /**
         * @property {Ext.Class} self
         *
         * Get the reference to the current class from which this object was instantiated. Unlike {@link Ext.Base#statics},
         * `this.self` is scope-dependent and it's meant to be used for dynamic inheritance. See {@link Ext.Base#statics}
         * for a detailed comparison
         *
         *     Ext.define('My.Cat', {
         *         statics: {
         *             speciesName: 'Cat' // My.Cat.speciesName = 'Cat'
         *         },
         *
         *         constructor: function() {
         *             alert(this.self.speciesName); // dependent on 'this'
         *         },
         *
         *         clone: function() {
         *             return new this.self();
         *         }
         *     });
         *
         *
         *     Ext.define('My.SnowLeopard', {
         *         extend: 'My.Cat',
         *         statics: {
         *             speciesName: 'Snow Leopard'         // My.SnowLeopard.speciesName = 'Snow Leopard'
         *         }
         *     });
         *
         *     var cat = new My.Cat();                     // alerts 'Cat'
         *     var snowLeopard = new My.SnowLeopard();     // alerts 'Snow Leopard'
         *
         *     var clone = snowLeopard.clone();
         *     alert(Ext.getClassName(clone));             // alerts 'My.SnowLeopard'
         *
         * @protected
         */
        self: Base,

        // Default constructor, simply returns `this`
        constructor: function() {
            return this;
        },

        /**
         * Initialize configuration for this class. a typical example:
         *
         *     Ext.define('My.awesome.Class', {
         *         // The default config
         *         config: {
         *             name: 'Awesome',
         *             isAwesome: true
         *         },
         *
         *         constructor: function(config) {
         *             this.initConfig(config);
         *         }
         *     });
         *
         *     var awesome = new My.awesome.Class({
         *         name: 'Super Awesome'
         *     });
         *
         *     alert(awesome.getName()); // 'Super Awesome'
         *
         * @protected
         * @param {Object} config
         * @return {Ext.Base} this
         */
        initConfig: function(config) {
            var instanceConfig = config,
                configNameCache = Ext.Class.configNameCache,
                defaultConfig = new this.configClass(),
                defaultConfigList = this.initConfigList,
                hasConfig = this.configMap,
                nameMap, i, ln, name, initializedName;

            this.initConfig = Ext.emptyFn;

            this.initialConfig = instanceConfig || {};

            this.config = config = (instanceConfig) ? Ext.merge(defaultConfig, config) : defaultConfig;

            if (instanceConfig) {
                defaultConfigList = defaultConfigList.slice();

                for (name in instanceConfig) {
                    if (hasConfig[name]) {
                        if (instanceConfig[name] !== null) {
                            defaultConfigList.push(name);
                            this[configNameCache[name].initialized] = false;
                        }
                    }
                }
            }

            for (i = 0,ln = defaultConfigList.length; i < ln; i++) {
                name = defaultConfigList[i];
                nameMap = configNameCache[name];
                initializedName = nameMap.initialized;

                if (!this[initializedName]) {
                    this[initializedName] = true;
                    this[nameMap.set].call(this, config[name]);
                }
            }

            return this;
        },

        /**
         * @private
         * @param config
         */
        hasConfig: function(name) {
            return Boolean(this.configMap[name]);
        },

        /**
         * @private
         */
        setConfig: function(config, applyIfNotSet) {
            if (!config) {
                return this;
            }

            var configNameCache = Ext.Class.configNameCache,
                currentConfig = this.config,
                hasConfig = this.configMap,
                initialConfig = this.initialConfig,
                name, value;

            applyIfNotSet = Boolean(applyIfNotSet);

            for (name in config) {
                if (applyIfNotSet && initialConfig.hasOwnProperty(name)) {
                    continue;
                }

                value = config[name];
                currentConfig[name] = value;

                if (hasConfig[name]) {
                    this[configNameCache[name].set](value);
                }
            }

            return this;
        },

        /**
         * @private
         * @param name
         */
        getConfig: function(name) {
            var configNameCache = Ext.Class.configNameCache;

            return this[configNameCache[name].get]();
        },

        /**
         * Returns the initial configuration passed to constructor when instantiating
         * this class.
         * @param {String} [name] Name of the config option to return.
         * @return {Object/Mixed} The full config object or a single config value
         * when `name` parameter specified.
         */
        getInitialConfig: function(name) {
            var config = this.config;

            if (!name) {
                return config;
            }
            else {
                return config[name];
            }
        },

        /**
         * @private
         * @param names
         * @param callback
         * @param scope
         */
        onConfigUpdate: function(names, callback, scope) {
            var self = this.self,
                className = self.$className,
                i, ln, name,
                updaterName, updater, newUpdater;

            names = Ext.Array.from(names);

            scope = scope || this;

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];
                updaterName = 'update' + Ext.String.capitalize(name);
                updater = this[updaterName] || Ext.emptyFn;
                newUpdater = function() {
                    updater.apply(this, arguments);
                    scope[callback].apply(scope, arguments);
                };
                newUpdater.$name = updaterName;
                newUpdater.$owner = self;
                newUpdater.displayName = className + '#' + updaterName;

                this[updaterName] = newUpdater;
            }
        },

        /**
         * @private
         */
        destroy: function() {
            this.destroy = Ext.emptyFn;
        }
    });

    /**
     * Call the original method that was previously overridden with {@link Ext.Base#override}
     *
     *     Ext.define('My.Cat', {
     *         constructor: function() {
     *             alert("I'm a cat!");
     *         }
     *     });
     *
     *     My.Cat.override({
     *         constructor: function() {
     *             alert("I'm going to be a cat!");
     *
     *             this.callOverridden();
     *
     *             alert("Meeeeoooowwww");
     *         }
     *     });
     *
     *     var kitty = new My.Cat(); // alerts "I'm going to be a cat!"
     *                               // alerts "I'm a cat!"
     *                               // alerts "Meeeeoooowwww"
     *
     * @param {Array/Arguments} args The arguments, either an array or the `arguments` object
     * from the current method, for example: `this.callOverridden(arguments)`
     * @return {Object} Returns the result of calling the overridden method
     * @protected
     * @deprecated as of 4.1. Use {@link #callParent} instead.
     */
    Base.prototype.callOverridden = Base.prototype.callParent;

    Ext.Base = Base;

}(Ext.Function.flexSetter));

// @tag foundation,core
// @require Base.js
// @define Ext.Class

/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.Class
 *
 * Handles class creation throughout the framework. This is a low level factory that is used by Ext.ClassManager and generally
 * should not be used directly. If you choose to use Ext.Class you will lose out on the namespace, aliasing and depency loading
 * features made available by Ext.ClassManager. The only time you would use Ext.Class directly is to create an anonymous class.
 *
 * If you wish to create a class you should use {@link Ext#define Ext.define} which aliases
 * {@link Ext.ClassManager#create Ext.ClassManager.create} to enable namespacing and dynamic dependency resolution.
 *
 * Ext.Class is the factory and **not** the superclass of everything. For the base class that **all** Ext classes inherit
 * from, see {@link Ext.Base}.
 */
(function() {
    var ExtClass,
        Base = Ext.Base,
        baseStaticMembers = [],
        baseStaticMember, baseStaticMemberLength;

    for (baseStaticMember in Base) {
        if (Base.hasOwnProperty(baseStaticMember)) {
            baseStaticMembers.push(baseStaticMember);
        }
    }

    baseStaticMemberLength = baseStaticMembers.length;

    // Creates a constructor that has nothing extra in its scope chain.
    function makeCtor (className) {
        function constructor () {
            // Opera has some problems returning from a constructor when Dragonfly isn't running. The || null seems to
            // be sufficient to stop it misbehaving. Known to be required against 10.53, 11.51 and 11.61.
            return this.constructor.apply(this, arguments) || null;
        }
        if (className) {
            constructor.displayName = className;
        }
        return constructor;
    }

    /**
     * @method constructor
     * Create a new anonymous class.
     *
     * @param {Object} data An object represent the properties of this class
     * @param {Function} onCreated Optional, the callback function to be executed when this class is fully created.
     * Note that the creation process can be asynchronous depending on the pre-processors used.
     *
     * @return {Ext.Base} The newly created class
     */
    Ext.Class = ExtClass = function(Class, data, onCreated) {
        if (typeof Class != 'function') {
            onCreated = data;
            data = Class;
            Class = null;
        }

        if (!data) {
            data = {};
        }

        Class = ExtClass.create(Class, data);

        ExtClass.process(Class, data, onCreated);

        return Class;
    };

    Ext.apply(ExtClass, {
        /**
         * @private
         */
        onBeforeCreated: function(Class, data, hooks) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '>> Ext.Class#onBeforeCreated', arguments);
        
            Class.addMembers(data);

            hooks.onCreated.call(Class, Class);
            
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '<< Ext.Class#onBeforeCreated', arguments);
        },

        /**
         * @private
         */
        create: function(Class, data) {
            var name, i;

            if (!Class) {
                Class = makeCtor(
                    data.$className
                );
            }

            for (i = 0; i < baseStaticMemberLength; i++) {
                name = baseStaticMembers[i];
                Class[name] = Base[name];
            }

            return Class;
        },

        /**
         * @private
         */
        process: function(Class, data, onCreated) {
            var preprocessorStack = data.preprocessors || ExtClass.defaultPreprocessors,
                registeredPreprocessors = this.preprocessors,
                hooks = {
                    onBeforeCreated: this.onBeforeCreated
                },
                preprocessors = [],
                preprocessor, preprocessorsProperties,
                i, ln, j, subLn, preprocessorProperty;

            delete data.preprocessors;

            for (i = 0,ln = preprocessorStack.length; i < ln; i++) {
                preprocessor = preprocessorStack[i];

                if (typeof preprocessor == 'string') {
                    preprocessor = registeredPreprocessors[preprocessor];
                    preprocessorsProperties = preprocessor.properties;

                    if (preprocessorsProperties === true) {
                        preprocessors.push(preprocessor.fn);
                    }
                    else if (preprocessorsProperties) {
                        for (j = 0,subLn = preprocessorsProperties.length; j < subLn; j++) {
                            preprocessorProperty = preprocessorsProperties[j];

                            if (data.hasOwnProperty(preprocessorProperty)) {
                                preprocessors.push(preprocessor.fn);
                                break;
                            }
                        }
                    }
                }
                else {
                    preprocessors.push(preprocessor);
                }
            }

            hooks.onCreated = onCreated ? onCreated : Ext.emptyFn;
            hooks.preprocessors = preprocessors;

            this.doProcess(Class, data, hooks);
        },
        
        doProcess: function(Class, data, hooks) {
            var me = this,
                preprocessors = hooks.preprocessors,
                preprocessor = preprocessors.shift(),
                doProcess = me.doProcess;

            for ( ; preprocessor ; preprocessor = preprocessors.shift()) {
                // Returning false signifies an asynchronous preprocessor - it will call doProcess when we can continue
                if (preprocessor.call(me, Class, data, hooks, doProcess) === false) {
                    return;
                }
            }
            hooks.onBeforeCreated.apply(me, arguments);
        },

        /** @private */
        preprocessors: {},

        /**
         * Register a new pre-processor to be used during the class creation process
         *
         * @param {String} name The pre-processor's name
         * @param {Function} fn The callback function to be executed. Typical format:
         *
         *     function(cls, data, fn) {
         *         // Your code here
         *
         *         // Execute this when the processing is finished.
         *         // Asynchronous processing is perfectly ok
         *         if (fn) {
         *             fn.call(this, cls, data);
         *         }
         *     });
         *
         * @param {Function} fn.cls The created class
         * @param {Object} fn.data The set of properties passed in {@link Ext.Class} constructor
         * @param {Function} fn.fn The callback function that **must** to be executed when this
         * pre-processor finishes, regardless of whether the processing is synchronous or aynchronous.
         * @return {Ext.Class} this
         * @private
         * @static
         */
        registerPreprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }

            if (!properties) {
                properties = [name];
            }

            this.preprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };

            this.setDefaultPreprocessorPosition(name, position, relativeTo);

            return this;
        },

        /**
         * Retrieve a pre-processor callback function by its name, which has been registered before
         *
         * @param {String} name
         * @return {Function} preprocessor
         * @private
         * @static
         */
        getPreprocessor: function(name) {
            return this.preprocessors[name];
        },

        /**
         * @private
         */
        getPreprocessors: function() {
            return this.preprocessors;
        },

        /**
         * @private
         */
        defaultPreprocessors: [],

        /**
         * Retrieve the array stack of default pre-processors
         * @return {Function[]} defaultPreprocessors
         * @private
         * @static
         */
        getDefaultPreprocessors: function() {
            return this.defaultPreprocessors;
        },

        /**
         * Set the default array stack of default pre-processors
         *
         * @private
         * @param {Array} preprocessors
         * @return {Ext.Class} this
         * @static
         */
        setDefaultPreprocessors: function(preprocessors) {
            this.defaultPreprocessors = Ext.Array.from(preprocessors);

            return this;
        },

        /**
         * Insert this pre-processor at a specific position in the stack, optionally relative to
         * any existing pre-processor. For example:
         *
         *     Ext.Class.registerPreprocessor('debug', function(cls, data, fn) {
         *         // Your code here
         *
         *         if (fn) {
         *             fn.call(this, cls, data);
         *         }
         *     }).setDefaultPreprocessorPosition('debug', 'last');
         *
         * @private
         * @param {String} name The pre-processor name. Note that it needs to be registered with
         * {@link Ext.Class#registerPreprocessor registerPreprocessor} before this
         * @param {String} offset The insertion position. Four possible values are:
         * 'first', 'last', or: 'before', 'after' (relative to the name provided in the third argument)
         * @param {String} relativeName
         * @return {Ext.Class} this
         * @static
         */
        setDefaultPreprocessorPosition: function(name, offset, relativeName) {
            var defaultPreprocessors = this.defaultPreprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPreprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPreprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPreprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPreprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        },

        configNameCache: {},

        getConfigNameMap: function(name) {
            var cache = this.configNameCache,
                map = cache[name],
                capitalizedName;

            if (!map) {
                capitalizedName = name.charAt(0).toUpperCase() + name.substr(1);

                map = cache[name] = {
                    internal: name,
                    initialized: '_is' + capitalizedName + 'Initialized',
                    apply: 'apply' + capitalizedName,
                    update: 'update' + capitalizedName,
                    'set': 'set' + capitalizedName,
                    'get': 'get' + capitalizedName,
                    doSet : 'doSet' + capitalizedName,
                    changeEvent: name.toLowerCase() + 'change'
                };
            }

            return map;
        }
    });

    /**
     * @cfg {String} extend
     * The parent class that this class extends. For example:
     *
     *     Ext.define('Person', {
     *         say: function(text) { alert(text); }
     *     });
     *
     *     Ext.define('Developer', {
     *         extend: 'Person',
     *         say: function(text) { this.callParent(["print "+text]); }
     *     });
     */
    ExtClass.registerPreprocessor('extend', function(Class, data, hooks) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#extendPreProcessor', arguments);
        
        var Base = Ext.Base,
            basePrototype = Base.prototype,
            extend = data.extend,
            Parent, parentPrototype, i;

        delete data.extend;

        if (extend && extend !== Object) {
            Parent = extend;
        }
        else {
            Parent = Base;
        }

        parentPrototype = Parent.prototype;

        if (!Parent.$isClass) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }

        Class.extend(Parent);

        Class.triggerExtended.apply(Class, arguments);

        if (data.onClassExtended) {
            Class.onExtended(data.onClassExtended, Class);
            delete data.onClassExtended;
        }

    }, true);

    /**
     * @cfg {Object} statics
     * List of static methods for this class. For example:
     *
     *     Ext.define('Computer', {
     *          statics: {
     *              factory: function(brand) {
     *                  // 'this' in static methods refer to the class itself
     *                  return new this(brand);
     *              }
     *          },
     *
     *          constructor: function() { ... }
     *     });
     *
     *     var dellComputer = Computer.factory('Dell');
     */
    ExtClass.registerPreprocessor('statics', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#staticsPreprocessor', arguments);
        
        Class.addStatics(data.statics);

        delete data.statics;
    });

    /**
     * @cfg {Object} inheritableStatics
     * List of inheritable static methods for this class.
     * Otherwise just like {@link #statics} but subclasses inherit these methods.
     */
    ExtClass.registerPreprocessor('inheritableStatics', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#inheritableStaticsPreprocessor', arguments);
        
        Class.addInheritableStatics(data.inheritableStatics);

        delete data.inheritableStatics;
    });

    /**
     * @cfg {Object} config
     * List of configuration options with their default values, for which automatically
     * accessor methods are generated.  For example:
     *
     *     Ext.define('SmartPhone', {
     *          config: {
     *              hasTouchScreen: false,
     *              operatingSystem: 'Other',
     *              price: 500
     *          },
     *          constructor: function(cfg) {
     *              this.initConfig(cfg);
     *          }
     *     });
     *
     *     var iPhone = new SmartPhone({
     *          hasTouchScreen: true,
     *          operatingSystem: 'iOS'
     *     });
     *
     *     iPhone.getPrice(); // 500;
     *     iPhone.getOperatingSystem(); // 'iOS'
     *     iPhone.getHasTouchScreen(); // true;
     *
     * NOTE for when configs are reference types, the getter and setter methods do not make copies.
     *
     * For example, when a config value is set, the reference is stored on the instance. All instances that set
     * the same reference type will share it.
     *
     * In the case of the getter, the value with either come from the prototype if the setter was never called or from
     * the instance as the last value passed to the setter.
     *
     * For some config properties, the value passed to the setter is transformed prior to being stored on the instance.
     */
    ExtClass.registerPreprocessor('config', function(Class, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#configPreProcessor', arguments);
        
        var config = data.config,
            prototype = Class.prototype;

        delete data.config;

        Ext.Object.each(config, function(name, value) {
            var nameMap = ExtClass.getConfigNameMap(name),
                internalName = nameMap.internal,
                initializedName = nameMap.initialized,
                applyName = nameMap.apply,
                updateName = nameMap.update,
                setName = nameMap.set,
                getName = nameMap.get,
                hasOwnSetter = (setName in prototype) || data.hasOwnProperty(setName),
                hasOwnApplier = (applyName in prototype) || data.hasOwnProperty(applyName),
                hasOwnUpdater = (updateName in prototype) || data.hasOwnProperty(updateName),
                optimizedGetter, customGetter;

            if (value === null || (!hasOwnSetter && !hasOwnApplier && !hasOwnUpdater)) {
                prototype[internalName] = value;
                prototype[initializedName] = true;
            }
            else {
                prototype[initializedName] = false;
            }

            if (!hasOwnSetter) {
                data[setName] = function(value) {
                    var oldValue = this[internalName],
                        applier = this[applyName],
                        updater = this[updateName];

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                    }

                    if (applier) {
                        value = applier.call(this, value, oldValue);
                    }

                    if (typeof value != 'undefined') {
                        this[internalName] = value;

                        if (updater && value !== oldValue) {
                            updater.call(this, value, oldValue);
                        }
                    }

                    return this;
                };
            }

            if (!(getName in prototype) || data.hasOwnProperty(getName)) {
                customGetter = data[getName] || false;

                if (customGetter) {
                    optimizedGetter = function() {
                        return customGetter.apply(this, arguments);
                    };
                }
                else {
                    optimizedGetter = function() {
                        return this[internalName];
                    };
                }

                data[getName] = function() {
                    var currentGetter;

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                        this[setName](this.config[name]);
                    }

                    currentGetter = this[getName];

                    if ('$previous' in currentGetter) {
                        currentGetter.$previous = optimizedGetter;
                    }
                    else {
                        this[getName] = optimizedGetter;
                    }

                    return optimizedGetter.apply(this, arguments);
                };
            }
        });

        Class.addConfig(config, true);
    });

    /**
     * @cfg {String[]/Object} mixins
     * List of classes to mix into this class. For example:
     *
     *     Ext.define('CanSing', {
     *          sing: function() {
     *              alert("I'm on the highway to hell...")
     *          }
     *     });
     *
     *     Ext.define('Musician', {
     *          mixins: ['CanSing']
     *     })
     *
     * In this case the Musician class will get a `sing` method from CanSing mixin.
     *
     * But what if the Musician already has a `sing` method? Or you want to mix
     * in two classes, both of which define `sing`?  In such a cases it's good
     * to define mixins as an object, where you assign a name to each mixin:
     *
     *     Ext.define('Musician', {
     *          mixins: {
     *              canSing: 'CanSing'
     *          },
     * 
     *          sing: function() {
     *              // delegate singing operation to mixin
     *              this.mixins.canSing.sing.call(this);
     *          }
     *     })
     *
     * In this case the `sing` method of Musician will overwrite the
     * mixed in `sing` method. But you can access the original mixed in method
     * through special `mixins` property.
     */
    ExtClass.registerPreprocessor('mixins', function(Class, data, hooks) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor', arguments);
        
        var mixins = data.mixins,
            name, mixin, i, ln;

        delete data.mixins;

        Ext.Function.interceptBefore(hooks, 'onCreated', function() {
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor#beforeCreated', arguments);
        
            if (mixins instanceof Array) {
                for (i = 0,ln = mixins.length; i < ln; i++) {
                    mixin = mixins[i];
                    name = mixin.prototype.mixinId || mixin.$className;

                    Class.mixin(name, mixin);
                }
            }
            else {
                for (var mixinName in mixins) {
                    if (mixins.hasOwnProperty(mixinName)) {
                        Class.mixin(mixinName, mixins[mixinName]);
                    }
                }
            }
        });
    });

    // Backwards compatible
    Ext.extend = function(Class, Parent, members) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#extend-backwards-compatible', arguments);
            
        if (arguments.length === 2 && Ext.isObject(Parent)) {
            members = Parent;
            Parent = Class;
            Class = null;
        }

        var cls;

        if (!Parent) {
            throw new Error("[Ext.extend] Attempting to extend from a class which has not been loaded on the page.");
        }

        members.extend = Parent;
        members.preprocessors = [
            'extend'
            ,'statics'
            ,'inheritableStatics'
            ,'mixins'
            ,'config'
        ];

        if (Class) {
            cls = new ExtClass(Class, members);
            // The 'constructor' is given as 'Class' but also needs to be on prototype
            cls.prototype.constructor = Class;
        } else {
            cls = new ExtClass(members);
        }

        cls.prototype.override = function(o) {
            for (var m in o) {
                if (o.hasOwnProperty(m)) {
                    this[m] = o[m];
                }
            }
        };

        return cls;
    };
}());

// @tag foundation,core
// @require Class.js
// @define Ext.ClassManager

/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.ClassManager
 *
 * Ext.ClassManager manages all classes and handles mapping from string class name to
 * actual class objects throughout the whole framework. It is not generally accessed directly, rather through
 * these convenient shorthands:
 *
 * - {@link Ext#define Ext.define}
 * - {@link Ext#create Ext.create}
 * - {@link Ext#widget Ext.widget}
 * - {@link Ext#getClass Ext.getClass}
 * - {@link Ext#getClassName Ext.getClassName}
 *
 * # Basic syntax:
 *
 *     Ext.define(className, properties);
 *
 * in which `properties` is an object represent a collection of properties that apply to the class. See
 * {@link Ext.ClassManager#create} for more detailed instructions.
 *
 *     Ext.define('Person', {
 *          name: 'Unknown',
 *
 *          constructor: function(name) {
 *              if (name) {
 *                  this.name = name;
 *              }
 *          },
 *
 *          eat: function(foodType) {
 *              alert("I'm eating: " + foodType);
 *
 *              return this;
 *          }
 *     });
 *
 *     var aaron = new Person("Aaron");
 *     aaron.eat("Sandwich"); // alert("I'm eating: Sandwich");
 *
 * Ext.Class has a powerful set of extensible {@link Ext.Class#registerPreprocessor pre-processors} which takes care of
 * everything related to class creation, including but not limited to inheritance, mixins, configuration, statics, etc.
 *
 * # Inheritance:
 *
 *     Ext.define('Developer', {
 *          extend: 'Person',
 *
 *          constructor: function(name, isGeek) {
 *              this.isGeek = isGeek;
 *
 *              // Apply a method from the parent class' prototype
 *              this.callParent([name]);
 *          },
 *
 *          code: function(language) {
 *              alert("I'm coding in: " + language);
 *
 *              this.eat("Bugs");
 *
 *              return this;
 *          }
 *     });
 *
 *     var jacky = new Developer("Jacky", true);
 *     jacky.code("JavaScript"); // alert("I'm coding in: JavaScript");
 *                               // alert("I'm eating: Bugs");
 *
 * See {@link Ext.Base#callParent} for more details on calling superclass' methods
 *
 * # Mixins:
 *
 *     Ext.define('CanPlayGuitar', {
 *          playGuitar: function() {
 *             alert("F#...G...D...A");
 *          }
 *     });
 *
 *     Ext.define('CanComposeSongs', {
 *          composeSongs: function() { ... }
 *     });
 *
 *     Ext.define('CanSing', {
 *          sing: function() {
 *              alert("I'm on the highway to hell...")
 *          }
 *     });
 *
 *     Ext.define('Musician', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canComposeSongs: 'CanComposeSongs',
 *              canSing: 'CanSing'
 *          }
 *     })
 *
 *     Ext.define('CoolPerson', {
 *          extend: 'Person',
 *
 *          mixins: {
 *              canPlayGuitar: 'CanPlayGuitar',
 *              canSing: 'CanSing'
 *          },
 *
 *          sing: function() {
 *              alert("Ahem....");
 *
 *              this.mixins.canSing.sing.call(this);
 *
 *              alert("[Playing guitar at the same time...]");
 *
 *              this.playGuitar();
 *          }
 *     });
 *
 *     var me = new CoolPerson("Jacky");
 *
 *     me.sing(); // alert("Ahem...");
 *                // alert("I'm on the highway to hell...");
 *                // alert("[Playing guitar at the same time...]");
 *                // alert("F#...G...D...A");
 *
 * # Config:
 *
 *     Ext.define('SmartPhone', {
 *          config: {
 *              hasTouchScreen: false,
 *              operatingSystem: 'Other',
 *              price: 500
 *          },
 *
 *          isExpensive: false,
 *
 *          constructor: function(config) {
 *              this.initConfig(config);
 *          },
 *
 *          applyPrice: function(price) {
 *              this.isExpensive = (price > 500);
 *
 *              return price;
 *          },
 *
 *          applyOperatingSystem: function(operatingSystem) {
 *              if (!(/^(iOS|Android|BlackBerry)$/i).test(operatingSystem)) {
 *                  return 'Other';
 *              }
 *
 *              return operatingSystem;
 *          }
 *     });
 *
 *     var iPhone = new SmartPhone({
 *          hasTouchScreen: true,
 *          operatingSystem: 'iOS'
 *     });
 *
 *     iPhone.getPrice(); // 500;
 *     iPhone.getOperatingSystem(); // 'iOS'
 *     iPhone.getHasTouchScreen(); // true;
 *     iPhone.hasTouchScreen(); // true
 *
 *     iPhone.isExpensive; // false;
 *     iPhone.setPrice(600);
 *     iPhone.getPrice(); // 600
 *     iPhone.isExpensive; // true;
 *
 *     iPhone.setOperatingSystem('AlienOS');
 *     iPhone.getOperatingSystem(); // 'Other'
 *
 * # Statics:
 *
 *     Ext.define('Computer', {
 *          statics: {
 *              factory: function(brand) {
 *                 // 'this' in static methods refer to the class itself
 *                  return new this(brand);
 *              }
 *          },
 *
 *          constructor: function() { ... }
 *     });
 *
 *     var dellComputer = Computer.factory('Dell');
 *
 * Also see {@link Ext.Base#statics} and {@link Ext.Base#self} for more details on accessing
 * static properties within class methods
 *
 * @singleton
 */
(function(Class, alias, arraySlice, arrayFrom, global) {

    // Creates a constructor that has nothing extra in its scope chain.
    function makeCtor () {
        function constructor () {
            // Opera has some problems returning from a constructor when Dragonfly isn't running. The || null seems to
            // be sufficient to stop it misbehaving. Known to be required against 10.53, 11.51 and 11.61.
            return this.constructor.apply(this, arguments) || null;
        }
        return constructor;
    }

    var Manager = Ext.ClassManager = {

        /**
         * @property {Object} classes
         * All classes which were defined through the ClassManager. Keys are the
         * name of the classes and the values are references to the classes.
         * @private
         */
        classes: {},

        /**
         * @private
         */
        existCache: {},

        /**
         * @private
         */
        namespaceRewrites: [{
            from: 'Ext.',
            to: Ext
        }],

        /**
         * @private
         */
        maps: {
            alternateToName: {},
            aliasToName: {},
            nameToAliases: {},
            nameToAlternates: {}
        },

        /** @private */
        enableNamespaceParseCache: true,

        /** @private */
        namespaceParseCache: {},

        /** @private */
        instantiators: [],

        /**
         * Checks if a class has already been created.
         *
         * @param {String} className
         * @return {Boolean} exist
         */
        isCreated: function(className) {
            var existCache = this.existCache,
                i, ln, part, root, parts;

            if (typeof className != 'string' || className.length < 1) {
                throw new Error("[Ext.ClassManager] Invalid classname, must be a string and must not be empty");
            }

            if (this.classes[className] || existCache[className]) {
                return true;
            }

            root = global;
            parts = this.parseNamespace(className);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return false;
                    }

                    root = root[part];
                }
            }

            existCache[className] = true;

            this.triggerCreated(className);

            return true;
        },

        /**
         * @private
         */
        createdListeners: [],

        /**
         * @private
         */
        nameCreatedListeners: {},

        /**
         * @private
         */
        triggerCreated: function(className) {
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                alternateNames = this.maps.nameToAlternates[className],
                names = [className],
                i, ln, j, subLn, listener, name;

            for (i = 0,ln = listeners.length; i < ln; i++) {
                listener = listeners[i];
                listener.fn.call(listener.scope, className);
            }

            if (alternateNames) {
                names.push.apply(names, alternateNames);
            }

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];
                listeners = nameListeners[name];

                if (listeners) {
                    for (j = 0,subLn = listeners.length; j < subLn; j++) {
                        listener = listeners[j];
                        listener.fn.call(listener.scope, name);
                    }
                    delete nameListeners[name];
                }
            }
        },

        /**
         * @private
         */
        onCreated: function(fn, scope, className) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'Ext.ClassManager#onCreated', arguments);
            
            var listeners = this.createdListeners,
                nameListeners = this.nameCreatedListeners,
                listener = {
                    fn: fn,
                    scope: scope
                };

            if (className) {
                if (this.isCreated(className)) {
                    fn.call(scope, className);
                    return;
                }

                if (!nameListeners[className]) {
                    nameListeners[className] = [];
                }

                nameListeners[className].push(listener);
            }
            else {
                listeners.push(listener);
            }
        },

        /**
         * Supports namespace rewriting
         * @private
         */
        parseNamespace: function(namespace) {
            if (typeof namespace != 'string') {
                throw new Error("[Ext.ClassManager] Invalid namespace, must be a string");
            }

            var cache = this.namespaceParseCache,
                parts,
                rewrites,
                root,
                name,
                rewrite, from, to, i, ln;

            if (this.enableNamespaceParseCache) {
                if (cache.hasOwnProperty(namespace)) {
                    return cache[namespace];
                }
            }

            parts = [];
            rewrites = this.namespaceRewrites;
            root = global;
            name = namespace;

            for (i = 0, ln = rewrites.length; i < ln; i++) {
                rewrite = rewrites[i];
                from = rewrite.from;
                to = rewrite.to;

                if (name === from || name.substring(0, from.length) === from) {
                    name = name.substring(from.length);

                    if (typeof to != 'string') {
                        root = to;
                    } else {
                        parts = parts.concat(to.split('.'));
                    }

                    break;
                }
            }

            parts.push(root);

            parts = parts.concat(name.split('.'));

            if (this.enableNamespaceParseCache) {
                cache[namespace] = parts;
            }

            return parts;
        },

        /**
         * Creates a namespace and assign the `value` to the created object
         *
         *     Ext.ClassManager.setNamespace('MyCompany.pkg.Example', someObject);
         *
         *     alert(MyCompany.pkg.Example === someObject); // alerts true
         *
         * @param {String} name
         * @param {Object} value
         */
        setNamespace: function(name, value) {
            var root = global,
                parts = this.parseNamespace(name),
                ln = parts.length - 1,
                leaf = parts[ln],
                i, part;

            for (i = 0; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root[part]) {
                        root[part] = {};
                    }

                    root = root[part];
                }
            }

            root[leaf] = value;

            return root[leaf];
        },

        /**
         * The new Ext.ns, supports namespace rewriting
         * @private
         */
        createNamespaces: function() {
            var root = global,
                parts, part, i, j, ln, subLn;

            for (i = 0, ln = arguments.length; i < ln; i++) {
                parts = this.parseNamespace(arguments[i]);

                for (j = 0, subLn = parts.length; j < subLn; j++) {
                    part = parts[j];

                    if (typeof part != 'string') {
                        root = part;
                    } else {
                        if (!root[part]) {
                            root[part] = {};
                        }

                        root = root[part];
                    }
                }
            }

            return root;
        },

        /**
         * Sets a name reference to a class.
         *
         * @param {String} name
         * @param {Object} value
         * @return {Ext.ClassManager} this
         */
        set: function(name, value) {
            var me = this,
                maps = me.maps,
                nameToAlternates = maps.nameToAlternates,
                targetName = me.getName(value),
                alternates;

            me.classes[name] = me.setNamespace(name, value);

            if (targetName && targetName !== name) {
                maps.alternateToName[name] = targetName;
                alternates = nameToAlternates[targetName] || (nameToAlternates[targetName] = []);
                alternates.push(name);
            }

            return this;
        },

        /**
         * Retrieve a class by its name.
         *
         * @param {String} name
         * @return {Ext.Class} class
         */
        get: function(name) {
            var classes = this.classes,
                root,
                parts,
                part, i, ln;

            if (classes[name]) {
                return classes[name];
            }

            root = global;
            parts = this.parseNamespace(name);

            for (i = 0, ln = parts.length; i < ln; i++) {
                part = parts[i];

                if (typeof part != 'string') {
                    root = part;
                } else {
                    if (!root || !root[part]) {
                        return null;
                    }

                    root = root[part];
                }
            }

            return root;
        },

        /**
         * Register the alias for a class.
         *
         * @param {Ext.Class/String} cls a reference to a class or a className
         * @param {String} alias Alias to use when referring to this class
         */
        setAlias: function(cls, alias) {
            var aliasToNameMap = this.maps.aliasToName,
                nameToAliasesMap = this.maps.nameToAliases,
                className;

            if (typeof cls == 'string') {
                className = cls;
            } else {
                className = this.getName(cls);
            }

            if (alias && aliasToNameMap[alias] !== className) {
                if (aliasToNameMap[alias] && Ext.isDefined(global.console)) {
                    global.console.log("[Ext.ClassManager] Overriding existing alias: '" + alias + "' " +
                        "of: '" + aliasToNameMap[alias] + "' with: '" + className + "'. Be sure it's intentional.");
                }

                aliasToNameMap[alias] = className;
            }

            if (!nameToAliasesMap[className]) {
                nameToAliasesMap[className] = [];
            }

            if (alias) {
                Ext.Array.include(nameToAliasesMap[className], alias);
            }

            return this;
        },

        /**
         * Adds a batch of class name to alias mappings
         * @param {Object} aliases The set of mappings of the form
         * className : [values...]
         */
        addNameAliasMappings: function(aliases){
            var aliasToNameMap = this.maps.aliasToName,
                nameToAliasesMap = this.maps.nameToAliases,
                className, aliasList, alias, i;

            for (className in aliases) {
                aliasList = nameToAliasesMap[className] ||
                    (nameToAliasesMap[className] = []);

                for (i = 0; i < aliases[className].length; i++) {
                    alias = aliases[className][i];
                    if (!aliasToNameMap[alias]) {
                        aliasToNameMap[alias] = className;
                        aliasList.push(alias);
                    }
                }

            }
            return this;
        },

        /**
         *
         * @param {Object} alternates The set of mappings of the form
         * className : [values...]
         */
        addNameAlternateMappings: function(alternates) {
            var alternateToName = this.maps.alternateToName,
                nameToAlternates = this.maps.nameToAlternates,
                className, aliasList, alternate, i;

            for (className in alternates) {
                aliasList = nameToAlternates[className] ||
                    (nameToAlternates[className] = []);

                for (i  = 0; i < alternates[className].length; i++) {
                    alternate = alternates[className][i];
                    if (!alternateToName[alternate]) {
                        alternateToName[alternate] = className;
                        aliasList.push(alternate);
                    }
                }

            }
            return this;
        },

        /**
         * Get a reference to the class by its alias.
         *
         * @param {String} alias
         * @return {Ext.Class} class
         */
        getByAlias: function(alias) {
            return this.get(this.getNameByAlias(alias));
        },

        /**
         * Get the name of a class by its alias.
         *
         * @param {String} alias
         * @return {String} className
         */
        getNameByAlias: function(alias) {
            return this.maps.aliasToName[alias] || '';
        },

        /**
         * Get the name of a class by its alternate name.
         *
         * @param {String} alternate
         * @return {String} className
         */
        getNameByAlternate: function(alternate) {
            return this.maps.alternateToName[alternate] || '';
        },

        /**
         * Get the aliases of a class by the class name
         *
         * @param {String} name
         * @return {Array} aliases
         */
        getAliasesByName: function(name) {
            return this.maps.nameToAliases[name] || [];
        },

        /**
         * Get the name of the class by its reference or its instance;
         * 
         * {@link Ext.ClassManager#getName} is usually invoked by the shorthand {@link Ext#getClassName}.
         *
         *     Ext.getName(Ext.Action); // returns "Ext.Action"
         *
         * @param {Ext.Class/Object} object
         * @return {String} className
         */
        getName: function(object) {
            return object && object.$className || '';
        },

        /**
         * Get the class of the provided object; returns null if it's not an instance
         * of any class created with Ext.define.
         *
         * {@link Ext.ClassManager#getClass} is usually invoked by the shorthand {@link Ext#getClass}.
         *
         *     var component = new Ext.Component();
         *
         *     Ext.getClass(component); // returns Ext.Component
         *
         * @param {Object} object
         * @return {Ext.Class} class
         */
        getClass: function(object) {
            return object && object.self || null;
        },

        /**
         * Defines a class.
         * @deprecated 4.1.0 Use {@link Ext#define} instead, as that also supports creating overrides.
         */
        create: function(className, data, createdFn) {
            if (className != null && typeof className != 'string') {
                throw new Error("[Ext.define] Invalid class name '" + className + "' specified, must be a non-empty string");
            }

            var ctor = makeCtor();
            if (typeof data == 'function') {
                data = data(ctor);
            }

            if (className) {
                ctor.displayName = className;
            }

            data.$className = className;

            return new Class(ctor, data, function() {
                var postprocessorStack = data.postprocessors || Manager.defaultPostprocessors,
                    registeredPostprocessors = Manager.postprocessors,
                    postprocessors = [],
                    postprocessor, i, ln, j, subLn, postprocessorProperties, postprocessorProperty;

                delete data.postprocessors;

                for (i = 0,ln = postprocessorStack.length; i < ln; i++) {
                    postprocessor = postprocessorStack[i];

                    if (typeof postprocessor == 'string') {
                        postprocessor = registeredPostprocessors[postprocessor];
                        postprocessorProperties = postprocessor.properties;

                        if (postprocessorProperties === true) {
                            postprocessors.push(postprocessor.fn);
                        }
                        else if (postprocessorProperties) {
                            for (j = 0,subLn = postprocessorProperties.length; j < subLn; j++) {
                                postprocessorProperty = postprocessorProperties[j];

                                if (data.hasOwnProperty(postprocessorProperty)) {
                                    postprocessors.push(postprocessor.fn);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        postprocessors.push(postprocessor);
                    }
                }

                data.postprocessors = postprocessors;
                data.createdFn = createdFn;
                Manager.processCreate(className, this, data);
            });
        },

        processCreate: function(className, cls, clsData){
            var me = this,
                postprocessor = clsData.postprocessors.shift(),
                createdFn = clsData.createdFn;

            if (!postprocessor) {
                Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'Ext.ClassManager#classCreated', arguments);
                
                if (className) {
                    me.set(className, cls);
                }

                if (createdFn) {
                    createdFn.call(cls, cls);
                }

                if (className) {
                    me.triggerCreated(className);
                }
                return;
            }

            if (postprocessor.call(me, className, cls, clsData, me.processCreate) !== false) {
                me.processCreate(className, cls, clsData);
            }
        },

        createOverride: function (className, data, createdFn) {
            var me = this,
                overriddenClassName = data.override,
                requires = data.requires,
                uses = data.uses,
                classReady = function () {
                    var cls, temp;

                    if (requires) {
                        temp = requires;
                        requires = null; // do the real thing next time (which may be now)

                        // Since the override is going to be used (its target class is now
                        // created), we need to fetch the required classes for the override
                        // and call us back once they are loaded:
                        Ext.Loader.require(temp, classReady);
                    } else {
                        // The target class and the required classes for this override are
                        // ready, so we can apply the override now:
                        cls = me.get(overriddenClassName);

                        // We don't want to apply these:
                        delete data.override;
                        delete data.requires;
                        delete data.uses;

                        Ext.override(cls, data);

                        // This pushes the overridding file itself into Ext.Loader.history
                        // Hence if the target class never exists, the overriding file will
                        // never be included in the build.
                        me.triggerCreated(className);

                        if (uses) {
                            Ext.Loader.addUsedClasses(uses); // get these classes too!
                        }

                        if (createdFn) {
                            createdFn.call(cls); // last but not least!
                        }
                    }
                };

            me.existCache[className] = true;

            // Override the target class right after it's created
            me.onCreated(classReady, me, overriddenClassName);

            return me;
        },

        /**
         * Instantiate a class by its alias.
         * 
         * {@link Ext.ClassManager#instantiateByAlias} is usually invoked by the shorthand {@link Ext#createByAlias}.
         *
         * If {@link Ext.Loader} is {@link Ext.Loader#setConfig enabled} and the class has not been defined yet, it will
         * attempt to load the class via synchronous loading.
         *
         *     var window = Ext.createByAlias('widget.window', { width: 600, height: 800, ... });
         *
         * @param {String} alias
         * @param {Object...} args Additional arguments after the alias will be passed to the
         * class constructor.
         * @return {Object} instance
         */
        instantiateByAlias: function() {
            var alias = arguments[0],
                args = arraySlice.call(arguments),
                className = this.getNameByAlias(alias);

            if (!className) {
                className = this.maps.aliasToName[alias];

                if (!className) {
                    throw new Error("[Ext.createByAlias] Cannot create an instance of unrecognized alias: " + alias);
                }

                if (global.console) {
                    global.console.warn("[Ext.Loader] Synchronously loading '" + className + "'; consider adding " +
                         "Ext.require('" + alias + "') above Ext.onReady");
                }

                Ext.syncRequire(className);
            }

            args[0] = className;

            return this.instantiate.apply(this, args);
        },

        /**
         * @private
         */
        instantiate: function() {
            var name = arguments[0],
                nameType = typeof name,
                args = arraySlice.call(arguments, 1),
                alias = name,
                possibleName, cls;

            if (nameType != 'function') {
                if (nameType != 'string' && args.length === 0) {
                    args = [name];
                    name = name.xclass;
                }

                if (typeof name != 'string' || name.length < 1) {
                    throw new Error("[Ext.create] Invalid class name or alias '" + name + "' specified, must be a non-empty string");
                }

                cls = this.get(name);
            }
            else {
                cls = name;
            }

            // No record of this class name, it's possibly an alias, so look it up
            if (!cls) {
                possibleName = this.getNameByAlias(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still no record of this class name, it's possibly an alternate name, so look it up
            if (!cls) {
                possibleName = this.getNameByAlternate(name);

                if (possibleName) {
                    name = possibleName;

                    cls = this.get(name);
                }
            }

            // Still not existing at this point, try to load it via synchronous mode as the last resort
            if (!cls) {
                if (global.console) {
                    global.console.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding " +
                         "Ext.require('" + ((possibleName) ? alias : name) + "') above Ext.onReady");
                }

                Ext.syncRequire(name);

                cls = this.get(name);
            }

            if (!cls) {
                throw new Error("[Ext.create] Cannot create an instance of unrecognized class name / alias: " + alias);
            }

            if (typeof cls != 'function') {
                throw new Error("[Ext.create] '" + name + "' is a singleton and cannot be instantiated");
            }

            return this.getInstantiator(args.length)(cls, args);
        },

        /**
         * @private
         * @param name
         * @param args
         */
        dynInstantiate: function(name, args) {
            args = arrayFrom(args, true);
            args.unshift(name);

            return this.instantiate.apply(this, args);
        },

        /**
         * @private
         * @param length
         */
        getInstantiator: function(length) {
            var instantiators = this.instantiators,
                instantiator,
                i,
                args;

            instantiator = instantiators[length];

            if (!instantiator) {
                i = length;
                args = [];

                for (i = 0; i < length; i++) {
                    args.push('a[' + i + ']');
                }

                instantiator = instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ')');
                instantiator.displayName = "Ext.ClassManager.instantiate" + length;
            }

            return instantiator;
        },

        /**
         * @private
         */
        postprocessors: {},

        /**
         * @private
         */
        defaultPostprocessors: [],

        /**
         * Register a post-processor function.
         *
         * @private
         * @param {String} name
         * @param {Function} postprocessor
         */
        registerPostprocessor: function(name, fn, properties, position, relativeTo) {
            if (!position) {
                position = 'last';
            }

            if (!properties) {
                properties = [name];
            }

            this.postprocessors[name] = {
                name: name,
                properties: properties || false,
                fn: fn
            };

            this.setDefaultPostprocessorPosition(name, position, relativeTo);

            return this;
        },

        /**
         * Set the default post processors array stack which are applied to every class.
         *
         * @private
         * @param {String/Array} postprocessors The name of a registered post processor or an array of registered names.
         * @return {Ext.ClassManager} this
         */
        setDefaultPostprocessors: function(postprocessors) {
            this.defaultPostprocessors = arrayFrom(postprocessors);

            return this;
        },

        /**
         * Insert this post-processor at a specific position in the stack, optionally relative to
         * any existing post-processor
         *
         * @private
         * @param {String} name The post-processor name. Note that it needs to be registered with
         * {@link Ext.ClassManager#registerPostprocessor} before this
         * @param {String} offset The insertion position. Four possible values are:
         * 'first', 'last', or: 'before', 'after' (relative to the name provided in the third argument)
         * @param {String} relativeName
         * @return {Ext.ClassManager} this
         */
        setDefaultPostprocessorPosition: function(name, offset, relativeName) {
            var defaultPostprocessors = this.defaultPostprocessors,
                index;

            if (typeof offset == 'string') {
                if (offset === 'first') {
                    defaultPostprocessors.unshift(name);

                    return this;
                }
                else if (offset === 'last') {
                    defaultPostprocessors.push(name);

                    return this;
                }

                offset = (offset === 'after') ? 1 : -1;
            }

            index = Ext.Array.indexOf(defaultPostprocessors, relativeName);

            if (index !== -1) {
                Ext.Array.splice(defaultPostprocessors, Math.max(0, index + offset), 0, name);
            }

            return this;
        },

        /**
         * Converts a string expression to an array of matching class names. An expression can either refers to class aliases
         * or class names. Expressions support wildcards:
         *
         *      // returns ['Ext.window.Window']
         *     var window = Ext.ClassManager.getNamesByExpression('widget.window');
         *
         *     // returns ['widget.panel', 'widget.window', ...]
         *     var allWidgets = Ext.ClassManager.getNamesByExpression('widget.*');
         *
         *     // returns ['Ext.data.Store', 'Ext.data.ArrayProxy', ...]
         *     var allData = Ext.ClassManager.getNamesByExpression('Ext.data.*');
         *
         * @param {String} expression
         * @return {String[]} classNames
         */
        getNamesByExpression: function(expression) {
            var nameToAliasesMap = this.maps.nameToAliases,
                names = [],
                name, alias, aliases, possibleName, regex, i, ln;

            if (typeof expression != 'string' || expression.length < 1) {
                throw new Error("[Ext.ClassManager.getNamesByExpression] Expression " + expression + " is invalid, must be a non-empty string");
            }

            if (expression.indexOf('*') !== -1) {
                expression = expression.replace(/\*/g, '(.*?)');
                regex = new RegExp('^' + expression + '$');

                for (name in nameToAliasesMap) {
                    if (nameToAliasesMap.hasOwnProperty(name)) {
                        aliases = nameToAliasesMap[name];

                        if (name.search(regex) !== -1) {
                            names.push(name);
                        }
                        else {
                            for (i = 0, ln = aliases.length; i < ln; i++) {
                                alias = aliases[i];

                                if (alias.search(regex) !== -1) {
                                    names.push(name);
                                    break;
                                }
                            }
                        }
                    }
                }

            } else {
                possibleName = this.getNameByAlias(expression);

                if (possibleName) {
                    names.push(possibleName);
                } else {
                    possibleName = this.getNameByAlternate(expression);

                    if (possibleName) {
                        names.push(possibleName);
                    } else {
                        names.push(expression);
                    }
                }
            }

            return names;
        }
    };

    /**
     * @cfg {String[]} alias
     * @member Ext.Class
     * List of short aliases for class names.  Most useful for defining xtypes for widgets:
     *
     *     Ext.define('MyApp.CoolPanel', {
     *         extend: 'Ext.panel.Panel',
     *         alias: ['widget.coolpanel'],
     *         title: 'Yeah!'
     *     });
     *
     *     // Using Ext.create
     *     Ext.create('widget.coolpanel');
     *
     *     // Using the shorthand for defining widgets by xtype
     *     Ext.widget('panel', {
     *         items: [
     *             {xtype: 'coolpanel', html: 'Foo'},
     *             {xtype: 'coolpanel', html: 'Bar'}
     *         ]
     *     });
     *
     * Besides "widget" for xtype there are alias namespaces like "feature" for ftype and "plugin" for ptype.
     */
    Manager.registerPostprocessor('alias', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#aliasPostProcessor', arguments);
        
        var aliases = data.alias,
            i, ln;

        for (i = 0,ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            this.setAlias(cls, alias);
        }

    }, ['xtype', 'alias']);

    /**
     * @cfg {Boolean} singleton
     * @member Ext.Class
     * When set to true, the class will be instantiated as singleton.  For example:
     *
     *     Ext.define('Logger', {
     *         singleton: true,
     *         log: function(msg) {
     *             console.log(msg);
     *         }
     *     });
     *
     *     Logger.log('Hello');
     */
    Manager.registerPostprocessor('singleton', function(name, cls, data, fn) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#singletonPostProcessor', arguments);
        
        if (data.singleton) {
            fn.call(this, name, new cls(), data);
        }
        else {
            return true;
        }
        return false;
    });

    /**
     * @cfg {String/String[]} alternateClassName
     * @member Ext.Class
     * Defines alternate names for this class.  For example:
     *
     *     Ext.define('Developer', {
     *         alternateClassName: ['Coder', 'Hacker'],
     *         code: function(msg) {
     *             alert('Typing... ' + msg);
     *         }
     *     });
     *
     *     var joe = Ext.create('Developer');
     *     joe.code('stackoverflow');
     *
     *     var rms = Ext.create('Hacker');
     *     rms.code('hack hack');
     */
    Manager.registerPostprocessor('alternateClassName', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(name, 'Ext.ClassManager#alternateClassNamePostprocessor', arguments);
        
        var alternates = data.alternateClassName,
            i, ln, alternate;

        if (!(alternates instanceof Array)) {
            alternates = [alternates];
        }

        for (i = 0, ln = alternates.length; i < ln; i++) {
            alternate = alternates[i];

            if (typeof alternate != 'string') {
                throw new Error("[Ext.define] Invalid alternate of: '" + alternate + "' for class: '" + name + "'; must be a valid string");
            }

            this.set(alternate, cls);
        }
    });

    Ext.apply(Ext, {
        /**
         * Instantiate a class by either full name, alias or alternate name.
         *
         * If {@link Ext.Loader} is {@link Ext.Loader#setConfig enabled} and the class has
         * not been defined yet, it will attempt to load the class via synchronous loading.
         *
         * For example, all these three lines return the same result:
         *
         *      // alias
         *      var window = Ext.create('widget.window', {
         *          width: 600,
         *          height: 800,
         *          ...
         *      });
         *
         *      // alternate name
         *      var window = Ext.create('Ext.Window', {
         *          width: 600,
         *          height: 800,
         *          ...
         *      });
         *
         *      // full class name
         *      var window = Ext.create('Ext.window.Window', {
         *          width: 600,
         *          height: 800,
         *          ...
         *      });
         *
         *      // single object with xclass property:
         *      var window = Ext.create({
         *          xclass: 'Ext.window.Window', // any valid value for 'name' (above)
         *          width: 600,
         *          height: 800,
         *          ...
         *      });
         *
         * @param {String} [name] The class name or alias. Can be specified as `xclass`
         * property if only one object parameter is specified.
         * @param {Object...} [args] Additional arguments after the name will be passed to
         * the class' constructor.
         * @return {Object} instance
         * @member Ext
         * @method create
         */
        create: alias(Manager, 'instantiate'),

        /**
         * Convenient shorthand to create a widget by its xtype or a config object.
         * See also {@link Ext.ClassManager#instantiateByAlias}.
         *
         *      var button = Ext.widget('button'); // Equivalent to Ext.create('widget.button');
         *
         *      var panel = Ext.widget('panel', { // Equivalent to Ext.create('widget.panel')
         *          title: 'Panel'
         *      });
         *
         *      var grid = Ext.widget({
         *          xtype: 'grid',
         *          ...
         *      });
         *
         * If a {@link Ext.Component component} instance is passed, it is simply returned.
         *
         * @member Ext
         * @param {String} [name] The xtype of the widget to create.
         * @param {Object} [config] The configuration object for the widget constructor.
         * @return {Object} The widget instance
         */
        widget: function(name, config) {
            // forms:
            //      1: (xtype)
            //      2: (xtype, config)
            //      3: (config)
            //      4: (xtype, component)
            //      5: (component)
            //      
            var xtype = name,
                alias, className, T, load;

            if (typeof xtype != 'string') { // if (form 3 or 5)
                // first arg is config or component
                config = name; // arguments[0]
                xtype = config.xtype;
            } else {
                config = config || {};
            }

            if (config.isComponent) {
                return config;
            }

            alias = 'widget.' + xtype;
            className = Manager.getNameByAlias(alias);

            // this is needed to support demand loading of the class
            if (!className) {
                load = true;
            }

            T = Manager.get(className);
            if (load || !T) {
                return Manager.instantiateByAlias(alias, config);
            }
            return new T(config);
        },

        /**
         * @inheritdoc Ext.ClassManager#instantiateByAlias
         * @member Ext
         * @method createByAlias
         */
        createByAlias: alias(Manager, 'instantiateByAlias'),

        /**
         * Defines a class or override. A basic class is defined like this:
         *
         *      Ext.define('My.awesome.Class', {
         *          someProperty: 'something',
         *
         *          someMethod: function(s) {
         *              alert(s + this.someProperty);
         *          }
         *
         *          ...
         *      });
         *
         *      var obj = new My.awesome.Class();
         *
         *      obj.someMethod('Say '); // alerts 'Say something'
         *
         * To create an anonymous class, pass `null` for the `className`:
         *
         *      Ext.define(null, {
         *          constructor: function () {
         *              // ...
         *          }
         *      });
         *
         * In some cases, it is helpful to create a nested scope to contain some private
         * properties. The best way to do this is to pass a function instead of an object
         * as the second parameter. This function will be called to produce the class
         * body:
         *
         *      Ext.define('MyApp.foo.Bar', function () {
         *          var id = 0;
         *
         *          return {
         *              nextId: function () {
         *                  return ++id;
         *              }
         *          };
         *      });
         * 
         * _Note_ that when using override, the above syntax will not override successfully, because
         * the passed function would need to be executed first to determine whether or not the result 
         * is an override or defining a new object. As such, an alternative syntax that immediately 
         * invokes the function can be used:
         * 
         *      Ext.define('MyApp.override.BaseOverride', function () {
         *          var counter = 0;
         *
         *          return {
         *              override: 'Ext.Component',
         *              logId: function () {
         *                  console.log(++counter, this.id);
         *              }
         *          };
         *      }());
         * 
         *
         * When using this form of `Ext.define`, the function is passed a reference to its
         * class. This can be used as an efficient way to access any static properties you
         * may have:
         *
         *      Ext.define('MyApp.foo.Bar', function (Bar) {
         *          return {
         *              statics: {
         *                  staticMethod: function () {
         *                      // ...
         *                  }
         *              },
         *
         *              method: function () {
         *                  return Bar.staticMethod();
         *              }
         *          };
         *      });
         *
         * To define an override, include the `override` property. The content of an
         * override is aggregated with the specified class in order to extend or modify
         * that class. This can be as simple as setting default property values or it can
         * extend and/or replace methods. This can also extend the statics of the class.
         *
         * One use for an override is to break a large class into manageable pieces.
         *
         *      // File: /src/app/Panel.js
         *
         *      Ext.define('My.app.Panel', {
         *          extend: 'Ext.panel.Panel',
         *          requires: [
         *              'My.app.PanelPart2',
         *              'My.app.PanelPart3'
         *          ]
         *
         *          constructor: function (config) {
         *              this.callParent(arguments); // calls Ext.panel.Panel's constructor
         *              //...
         *          },
         *
         *          statics: {
         *              method: function () {
         *                  return 'abc';
         *              }
         *          }
         *      });
         *
         *      // File: /src/app/PanelPart2.js
         *      Ext.define('My.app.PanelPart2', {
         *          override: 'My.app.Panel',
         *
         *          constructor: function (config) {
         *              this.callParent(arguments); // calls My.app.Panel's constructor
         *              //...
         *          }
         *      });
         *
         * Another use of overrides is to provide optional parts of classes that can be
         * independently required. In this case, the class may even be unaware of the
         * override altogether.
         *
         *      Ext.define('My.ux.CoolTip', {
         *          override: 'Ext.tip.ToolTip',
         *
         *          constructor: function (config) {
         *              this.callParent(arguments); // calls Ext.tip.ToolTip's constructor
         *              //...
         *          }
         *      });
         *
         * The above override can now be required as normal.
         *
         *      Ext.define('My.app.App', {
         *          requires: [
         *              'My.ux.CoolTip'
         *          ]
         *      });
         *
         * Overrides can also contain statics:
         *
         *      Ext.define('My.app.BarMod', {
         *          override: 'Ext.foo.Bar',
         *
         *          statics: {
         *              method: function (x) {
         *                  return this.callParent([x * 2]); // call Ext.foo.Bar.method
         *              }
         *          }
         *      });
         *
         * IMPORTANT: An override is only included in a build if the class it overrides is
         * required. Otherwise, the override, like the target class, is not included.
         *
         * @param {String} className The class name to create in string dot-namespaced format, for example:
         * 'My.very.awesome.Class', 'FeedViewer.plugin.CoolPager'
         * It is highly recommended to follow this simple convention:
         *  - The root and the class name are 'CamelCased'
         *  - Everything else is lower-cased
         * Pass `null` to create an anonymous class.
         * @param {Object} data The key - value pairs of properties to apply to this class. Property names can be of any valid
         * strings, except those in the reserved listed below:
         *  - `mixins`
         *  - `statics`
         *  - `config`
         *  - `alias`
         *  - `self`
         *  - `singleton`
         *  - `alternateClassName`
         *  - `override`
         *
         * @param {Function} createdFn Optional callback to execute after the class is created, the execution scope of which
         * (`this`) will be the newly created class itself.
         * @return {Ext.Base}
         * @member Ext
         */
        define: function (className, data, createdFn) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'ClassManager#define', arguments);
            
            if (data.override) {
                return Manager.createOverride.apply(Manager, arguments);
            }

            return Manager.create.apply(Manager, arguments);
        },

        /**
         * Undefines a class defined using the #define method. Typically used
         * for unit testing where setting up and tearing down a class multiple
         * times is required.  For example:
         * 
         *     // define a class
         *     Ext.define('Foo', {
         *        ...
         *     });
         *     
         *     // run test
         *     
         *     // undefine the class
         *     Ext.undefine('Foo');
         * @param {String} className The class name to undefine in string dot-namespaced format.
         * @private
         */
        undefine: function(className) {
            Ext.classSystemMonitor && Ext.classSystemMonitor(className, 'Ext.ClassManager#undefine', arguments);
        
            var classes = Manager.classes,
                maps = Manager.maps,
                aliasToName = maps.aliasToName,
                nameToAliases = maps.nameToAliases,
                alternateToName = maps.alternateToName,
                nameToAlternates = maps.nameToAlternates,
                aliases = nameToAliases[className],
                alternates = nameToAlternates[className],
                parts, partCount, namespace, i;

            delete Manager.namespaceParseCache[className];
            delete nameToAliases[className];
            delete nameToAlternates[className];
            delete classes[className];

            if (aliases) {
                for (i = aliases.length; i--;) {
                    delete aliasToName[aliases[i]];
                }
            }

            if (alternates) {
                for (i = alternates.length; i--; ) {
                    delete alternateToName[alternates[i]];
                }
            }

            parts  = Manager.parseNamespace(className);
            partCount = parts.length - 1;
            namespace = parts[0];

            for (i = 1; i < partCount; i++) {
                namespace = namespace[parts[i]];
                if (!namespace) {
                    return;
                }
            }

            // Old IE blows up on attempt to delete window property
            try {
                delete namespace[parts[partCount]];
            }
            catch (e) {
                namespace[parts[partCount]] = undefined;
            }
        },

        /**
         * @inheritdoc Ext.ClassManager#getName
         * @member Ext
         * @method getClassName
         */
        getClassName: alias(Manager, 'getName'),

        /**
         * Returns the displayName property or className or object. When all else fails, returns "Anonymous".
         * @param {Object} object
         * @return {String}
         */
        getDisplayName: function(object) {
            if (object) {
                if (object.displayName) {
                    return object.displayName;
                }

                if (object.$name && object.$class) {
                    return Ext.getClassName(object.$class) + '#' + object.$name;
                }

                if (object.$className) {
                    return object.$className;
                }
            }

            return 'Anonymous';
        },

        /**
         * @inheritdoc Ext.ClassManager#getClass
         * @member Ext
         * @method getClass
         */
        getClass: alias(Manager, 'getClass'),

        /**
         * Creates namespaces to be used for scoping variables and classes so that they are not global.
         * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
         *
         *     Ext.namespace('Company', 'Company.data');
         *
         *     // equivalent and preferable to the above syntax
         *     Ext.ns('Company.data');
         *
         *     Company.Widget = function() { ... };
         *
         *     Company.data.CustomStore = function(config) { ... };
         *
         * @param {String...} namespaces
         * @return {Object} The namespace object.
         * (If multiple arguments are passed, this will be the last namespace created)
         * @member Ext
         * @method namespace
         */
        namespace: alias(Manager, 'createNamespaces')
    });

    /**
     * Old name for {@link Ext#widget}.
     * @deprecated 4.0.0 Use {@link Ext#widget} instead.
     * @method createWidget
     * @member Ext
     */
    Ext.createWidget = Ext.widget;

    /**
     * Convenient alias for {@link Ext#namespace Ext.namespace}.
     * @inheritdoc Ext#namespace
     * @member Ext
     * @method ns
     */
    Ext.ns = Ext.namespace;

    Class.registerPreprocessor('className', function(cls, data) {
        if (data.$className) {
            cls.$className = data.$className;
            cls.displayName = cls.$className;
        }
        
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#classNamePreprocessor', arguments);
    }, true, 'first');

    Class.registerPreprocessor('alias', function(cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#aliasPreprocessor', arguments);
        
        var prototype = cls.prototype,
            xtypes = arrayFrom(data.xtype),
            aliases = arrayFrom(data.alias),
            widgetPrefix = 'widget.',
            widgetPrefixLength = widgetPrefix.length,
            xtypesChain = Array.prototype.slice.call(prototype.xtypesChain || []),
            xtypesMap = Ext.merge({}, prototype.xtypesMap || {}),
            i, ln, alias, xtype;

        for (i = 0,ln = aliases.length; i < ln; i++) {
            alias = aliases[i];

            if (typeof alias != 'string' || alias.length < 1) {
                throw new Error("[Ext.define] Invalid alias of: '" + alias + "' for class: '" + name + "'; must be a valid string");
            }

            if (alias.substring(0, widgetPrefixLength) === widgetPrefix) {
                xtype = alias.substring(widgetPrefixLength);
                Ext.Array.include(xtypes, xtype);
            }
        }

        cls.xtype = data.xtype = xtypes[0];
        data.xtypes = xtypes;

        for (i = 0,ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];

            if (!xtypesMap[xtype]) {
                xtypesMap[xtype] = true;
                xtypesChain.push(xtype);
            }
        }

        data.xtypesChain = xtypesChain;
        data.xtypesMap = xtypesMap;

        Ext.Function.interceptAfter(data, 'onClassCreated', function() {
            Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.ClassManager#aliasPreprocessor#afterClassCreated', arguments);
        
            var mixins = prototype.mixins,
                key, mixin;

            for (key in mixins) {
                if (mixins.hasOwnProperty(key)) {
                    mixin = mixins[key];

                    xtypes = mixin.xtypes;

                    if (xtypes) {
                        for (i = 0,ln = xtypes.length; i < ln; i++) {
                            xtype = xtypes[i];

                            if (!xtypesMap[xtype]) {
                                xtypesMap[xtype] = true;
                                xtypesChain.push(xtype);
                            }
                        }
                    }
                }
            }
        });

        for (i = 0,ln = xtypes.length; i < ln; i++) {
            xtype = xtypes[i];

            if (typeof xtype != 'string' || xtype.length < 1) {
                throw new Error("[Ext.define] Invalid xtype of: '" + xtype + "' for class: '" + name + "'; must be a valid non-empty string");
            }

            Ext.Array.include(aliases, widgetPrefix + xtype);
        }

        data.alias = aliases;

    }, ['xtype', 'alias']);

}(Ext.Class, Ext.Function.alias, Array.prototype.slice, Ext.Array.from, Ext.global));

// simple mechanism for automated means of injecting large amounts of dependency info
// at the appropriate time in the load cycle
if (Ext._alternatesMetadata) {
   Ext.ClassManager.addNameAlternateMappings(Ext._alternatesMetadata);
   Ext._alternatesMetadata = null;
}

if (Ext._aliasMetadata) {
    Ext.ClassManager.addNameAliasMappings(Ext._aliasMetadata);
    Ext._aliasMetadata = null;
}

// @tag foundation,core
// @require ClassManager.js
// @define Ext.Loader

/**
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 * @class Ext.Loader
 *
 * Ext.Loader is the heart of the new dynamic dependency loading capability in Ext JS 4+. It is most commonly used
 * via the {@link Ext#require} shorthand. Ext.Loader supports both asynchronous and synchronous loading
 * approaches, and leverage their advantages for the best development flow. We'll discuss about the pros and cons of each approach:
 *
 * # Asynchronous Loading #
 *
 * - Advantages:
 *     + Cross-domain
 *     + No web server needed: you can run the application via the file system protocol (i.e: `file://path/to/your/index
 *  .html`)
 *     + Best possible debugging experience: error messages come with the exact file name and line number
 *
 * - Disadvantages:
 *     + Dependencies need to be specified before-hand
 *
 * ### Method 1: Explicitly include what you need: ###
 *
 *     // Syntax
 *     Ext.require({String/Array} expressions);
 *
 *     // Example: Single alias
 *     Ext.require('widget.window');
 *
 *     // Example: Single class name
 *     Ext.require('Ext.window.Window');
 *
 *     // Example: Multiple aliases / class names mix
 *     Ext.require(['widget.window', 'layout.border', 'Ext.data.Connection']);
 *
 *     // Wildcards
 *     Ext.require(['widget.*', 'layout.*', 'Ext.data.*']);
 *
 * ### Method 2: Explicitly exclude what you don't need: ###
 *
 *     // Syntax: Note that it must be in this chaining format.
 *     Ext.exclude({String/Array} expressions)
 *        .require({String/Array} expressions);
 *
 *     // Include everything except Ext.data.*
 *     Ext.exclude('Ext.data.*').require('*');
 *
 *     // Include all widgets except widget.checkbox*,
 *     // which will match widget.checkbox, widget.checkboxfield, widget.checkboxgroup, etc.
 *     Ext.exclude('widget.checkbox*').require('widget.*');
 *
 * # Synchronous Loading on Demand #
 *
 * - Advantages:
 *     + There's no need to specify dependencies before-hand, which is always the convenience of including ext-all.js
 *  before
 *
 * - Disadvantages:
 *     + Not as good debugging experience since file name won't be shown (except in Firebug at the moment)
 *     + Must be from the same domain due to XHR restriction
 *     + Need a web server, same reason as above
 *
 * There's one simple rule to follow: Instantiate everything with Ext.create instead of the `new` keyword
 *
 *     Ext.create('widget.window', { ... }); // Instead of new Ext.window.Window({...});
 *
 *     Ext.create('Ext.window.Window', {}); // Same as above, using full class name instead of alias
 *
 *     Ext.widget('window', {}); // Same as above, all you need is the traditional `xtype`
 *
 * Behind the scene, {@link Ext.ClassManager} will automatically check whether the given class name / alias has already
 *  existed on the page. If it's not, Ext.Loader will immediately switch itself to synchronous mode and automatic load the given
 *  class and all its dependencies.
 *
 * # Hybrid Loading - The Best of Both Worlds #
 *
 * It has all the advantages combined from asynchronous and synchronous loading. The development flow is simple:
 *
 * ### Step 1: Start writing your application using synchronous approach.
 *
 * Ext.Loader will automatically fetch all dependencies on demand as they're needed during run-time. For example:
 *
 *     Ext.onReady(function(){
 *         var window = Ext.widget('window', {
 *             width: 500,
 *             height: 300,
 *             layout: {
 *                 type: 'border',
 *                 padding: 5
 *             },
 *             title: 'Hello Dialog',
 *             items: [{
 *                 title: 'Navigation',
 *                 collapsible: true,
 *                 region: 'west',
 *                 width: 200,
 *                 html: 'Hello',
 *                 split: true
 *             }, {
 *                 title: 'TabPanel',
 *                 region: 'center'
 *             }]
 *         });
 *
 *         window.show();
 *     })
 *
 * ### Step 2: Along the way, when you need better debugging ability, watch the console for warnings like these: ###
 *
 *     [Ext.Loader] Synchronously loading 'Ext.window.Window'; consider adding Ext.require('Ext.window.Window') before your application's code
 *     ClassManager.js:432
 *     [Ext.Loader] Synchronously loading 'Ext.layout.container.Border'; consider adding Ext.require('Ext.layout.container.Border') before your application's code
 *
 * Simply copy and paste the suggested code above `Ext.onReady`, i.e:
 *
 *     Ext.require('Ext.window.Window');
 *     Ext.require('Ext.layout.container.Border');
 *
 *     Ext.onReady(...);
 *
 * Everything should now load via asynchronous mode.
 *
 * # Deployment #
 *
 * It's important to note that dynamic loading should only be used during development on your local machines.
 * During production, all dependencies should be combined into one single JavaScript file. Ext.Loader makes
 * the whole process of transitioning from / to between development / maintenance and production as easy as
 * possible. Internally {@link Ext.Loader#history Ext.Loader.history} maintains the list of all dependencies your application
 * needs in the exact loading sequence. It's as simple as concatenating all files in this array into one,
 * then include it on top of your application.
 *
 * This process will be automated with Sencha Command, to be released and documented towards Ext JS 4 Final.
 *
 * @singleton
 */

Ext.Loader = new function() {
    var Loader = this,
        Manager = Ext.ClassManager,
        Class = Ext.Class,
        flexSetter = Ext.Function.flexSetter,
        alias = Ext.Function.alias,
        pass = Ext.Function.pass,
        defer = Ext.Function.defer,
        arrayErase = Ext.Array.erase,
        dependencyProperties = ['extend', 'mixins', 'requires'],
        isInHistory = {},
        history = [],
        slashDotSlashRe = /\/\.\//g,
        dotRe = /\./g,
        setPathCount = 0;

    Ext.apply(Loader, {

        /**
         * @private
         */
        isInHistory: isInHistory,

        /**
         * An array of class names to keep track of the dependency loading order.
         * This is not guaranteed to be the same everytime due to the asynchronous
         * nature of the Loader.
         *
         * @property {Array} history
         */
        history: history,

        /**
         * Configuration
         * @private
         */
        config: {
            /**
             * @cfg {Boolean} enabled
             * Whether or not to enable the dynamic dependency loading feature.
             */
            enabled: false,

            /**
             * @cfg {Boolean} scriptChainDelay
             * millisecond delay between asynchronous script injection (prevents stack overflow on some user agents)
             * 'false' disables delay but potentially increases stack load.
             */
            scriptChainDelay : false,

            /**
             * @cfg {Boolean} disableCaching
             * Appends current timestamp to script files to prevent caching.
             */
            disableCaching: true,

            /**
             * @cfg {String} disableCachingParam
             * The get parameter name for the cache buster's timestamp.
             */
            disableCachingParam: '_dc',

            /**
             * @cfg {Boolean} garbageCollect
             * True to prepare an asynchronous script tag for garbage collection (effective only
             * if {@link #preserveScripts preserveScripts} is false)
             */
            garbageCollect : false,

            /**
             * @cfg {Object} paths
             * The mapping from namespaces to file paths
             *
             *     {
             *         'Ext': '.', // This is set by default, Ext.layout.container.Container will be
             *                     // loaded from ./layout/Container.js
             *
             *         'My': './src/my_own_folder' // My.layout.Container will be loaded from
             *                                     // ./src/my_own_folder/layout/Container.js
             *     }
             *
             * Note that all relative paths are relative to the current HTML document.
             * If not being specified, for example, <code>Other.awesome.Class</code>
             * will simply be loaded from <code>./Other/awesome/Class.js</code>
             */
            paths: {
                'Ext': '.'
            },

            /**
             * @cfg {Boolean} preserveScripts
             * False to remove and optionally {@link #garbageCollect garbage-collect} asynchronously loaded scripts,
             * True to retain script element for browser debugger compatibility and improved load performance.
             */
            preserveScripts : true,

            /**
             * @cfg {String} scriptCharset
             * Optional charset to specify encoding of dynamic script content.
             */
            scriptCharset : undefined
        },

        /**
         * Set the configuration for the loader. This should be called right after ext-(debug).js
         * is included in the page, and before Ext.onReady. i.e:
         *
         *     <script type="text/javascript" src="ext-core-debug.js"></script>
         *     <script type="text/javascript">
         *         Ext.Loader.setConfig({
         *           enabled: true,
         *           paths: {
         *               'My': 'my_own_path'
         *           }
         *         });
         *     </script>
         *     <script type="text/javascript">
         *         Ext.require(...);
         *
         *         Ext.onReady(function() {
         *           // application code here
         *         });
         *     </script>
         *
         * Refer to config options of {@link Ext.Loader} for the list of possible properties
         *
         * @param {Object} config The config object to override the default values
         * @return {Ext.Loader} this
         */
        setConfig: function(name, value) {
            if (Ext.isObject(name) && arguments.length === 1) {
                Ext.merge(Loader.config, name);

                if ('paths' in name) {
                    Ext.app.collectNamespaces(name.paths);
                }
            }
            else {
                Loader.config[name] = (Ext.isObject(value)) ? Ext.merge(Loader.config[name], value) : value;

                if (name === 'paths') {
                    Ext.app.collectNamespaces(value);
                }
            }

            return Loader;
        },

        /**
         * Get the config value corresponding to the specified name. If no name is given, will return the config object
         * @param {String} name The config property name
         * @return {Object}
         */
        getConfig: function(name) {
            if (name) {
                return Loader.config[name];
            }

            return Loader.config;
        },

        /**
         * Sets the path of a namespace.
         * For Example:
         *
         *     Ext.Loader.setPath('Ext', '.');
         *
         * @param {String/Object} name See {@link Ext.Function#flexSetter flexSetter}
         * @param {String} [path] See {@link Ext.Function#flexSetter flexSetter}
         * @return {Ext.Loader} this
         * @method
         */
        setPath: flexSetter(function(name, path) {
            Loader.config.paths[name] = path;
            Ext.app.namespaces[name] = true;
            setPathCount++;

            return Loader;
        }),

        /**
         * Sets a batch of path entries
         *
         * @param {Object } paths a set of className: path mappings
         * @return {Ext.Loader} this
         */
        addClassPathMappings: function(paths) {
            var name;

            if(setPathCount == 0){
                Loader.config.paths = paths;
            } else {
                for(name in paths){
                    Loader.config.paths[name] = paths[name];
                }
            }
            setPathCount++;
            return Loader;
        },

        /**
         * Translates a className to a file path by adding the
         * the proper prefix and converting the .'s to /'s. For example:
         *
         *     Ext.Loader.setPath('My', '/path/to/My');
         *
         *     alert(Ext.Loader.getPath('My.awesome.Class')); // alerts '/path/to/My/awesome/Class.js'
         *
         * Note that the deeper namespace levels, if explicitly set, are always resolved first. For example:
         *
         *     Ext.Loader.setPath({
         *         'My': '/path/to/lib',
         *         'My.awesome': '/other/path/for/awesome/stuff',
         *         'My.awesome.more': '/more/awesome/path'
         *     });
         *
         *     alert(Ext.Loader.getPath('My.awesome.Class')); // alerts '/other/path/for/awesome/stuff/Class.js'
         *
         *     alert(Ext.Loader.getPath('My.awesome.more.Class')); // alerts '/more/awesome/path/Class.js'
         *
         *     alert(Ext.Loader.getPath('My.cool.Class')); // alerts '/path/to/lib/cool/Class.js'
         *
         *     alert(Ext.Loader.getPath('Unknown.strange.Stuff')); // alerts 'Unknown/strange/Stuff.js'
         *
         * @param {String} className
         * @return {String} path
         */
        getPath: function(className) {
            var path = '',
                paths = Loader.config.paths,
                prefix = Loader.getPrefix(className);

            if (prefix.length > 0) {
                if (prefix === className) {
                    return paths[prefix];
                }

                path = paths[prefix];
                className = className.substring(prefix.length + 1);
            }

            if (path.length > 0) {
                path += '/';
            }

            return path.replace(slashDotSlashRe, '/') + className.replace(dotRe, "/") + '.js';
        },

        /**
         * @private
         * @param {String} className
         */
        getPrefix: function(className) {
            var paths = Loader.config.paths,
                prefix, deepestPrefix = '';

            if (paths.hasOwnProperty(className)) {
                return className;
            }

            for (prefix in paths) {
                if (paths.hasOwnProperty(prefix) && prefix + '.' === className.substring(0, prefix.length + 1)) {
                    if (prefix.length > deepestPrefix.length) {
                        deepestPrefix = prefix;
                    }
                }
            }

            return deepestPrefix;
        },

        /**
         * @private
         * @param {String} className
         */
        isAClassNameWithAKnownPrefix: function(className) {
            var prefix = Loader.getPrefix(className);

            // we can only say it's really a class if className is not equal to any known namespace
            return prefix !== '' && prefix !== className;
        },

        /**
         * Loads all classes by the given names and all their direct dependencies; optionally executes
         * the given callback function when finishes, within the optional scope.
         *
         * {@link Ext#require} is alias for {@link Ext.Loader#require}.
         *
         * @param {String/Array} expressions Can either be a string or an array of string
         * @param {Function} fn (Optional) The callback function
         * @param {Object} scope (Optional) The execution scope (`this`) of the callback function
         * @param {String/Array} excludes (Optional) Classes to be excluded, useful when being used with expressions
         */
        require: function(expressions, fn, scope, excludes) {
            if (fn) {
                fn.call(scope);
            }
        },

        /**
         * Synchronously loads all classes by the given names and all their direct dependencies; optionally
         * executes the given callback function when finishes, within the optional scope.
         *
         * {@link Ext#syncRequire} is alias for {@link Ext.Loader#syncRequire}.
         *
         * @param {String/Array} expressions Can either be a string or an array of string
         * @param {Function} fn (Optional) The callback function
         * @param {Object} scope (Optional) The execution scope (`this`) of the callback function
         * @param {String/Array} excludes (Optional) Classes to be excluded, useful when being used with expressions
         */
        syncRequire: function() {},

        /**
         * Explicitly exclude files from being loaded. Useful when used in conjunction with a broad include expression.
         * Can be chained with more `require` and `exclude` methods, eg:
         *
         *     Ext.exclude('Ext.data.*').require('*');
         *
         *     Ext.exclude('widget.button*').require('widget.*');
         *
         * {@link Ext#exclude} is alias for {@link Ext.Loader#exclude}.
         *
         * @param {Array} excludes
         * @return {Object} object contains `require` method for chaining
         */
        exclude: function(excludes) {
            return {
                require: function(expressions, fn, scope) {
                    return Loader.require(expressions, fn, scope, excludes);
                },

                syncRequire: function(expressions, fn, scope) {
                    return Loader.syncRequire(expressions, fn, scope, excludes);
                }
            };
        },

        /**
         * Add a new listener to be executed when all required scripts are fully loaded
         *
         * @param {Function} fn The function callback to be executed
         * @param {Object} scope The execution scope (<code>this</code>) of the callback function
         * @param {Boolean} withDomReady Whether or not to wait for document dom ready as well
         */
        onReady: function(fn, scope, withDomReady, options) {
            var oldFn;

            if (withDomReady !== false && Ext.onDocumentReady) {
                oldFn = fn;

                fn = function() {
                    Ext.onDocumentReady(oldFn, scope, options);
                };
            }

            fn.call(scope);
        }
    });

    var queue = [],
        isClassFileLoaded = {},
        isFileLoaded = {},
        classNameToFilePathMap = {},
        scriptElements = {},
        readyListeners = [],
        usedClasses = [],
        requiresMap = {},
        comparePriority = function(listenerA, listenerB) {
            return listenerB.priority - listenerA.priority;
        };

    Ext.apply(Loader, {
        /**
         * @private
         */
        documentHead: typeof document != 'undefined' && (document.head || document.getElementsByTagName('head')[0]),

        /**
         * Flag indicating whether there are still files being loaded
         * @private
         */
        isLoading: false,

        /**
         * Maintain the queue for all dependencies. Each item in the array is an object of the format:
         *
         *     {
         *          requires: [...], // The required classes for this queue item
         *          callback: function() { ... } // The function to execute when all classes specified in requires exist
         *     }
         *
         * @private
         */
        queue: queue,

        /**
         * Maintain the list of files that have already been handled so that they never get double-loaded
         * @private
         */
        isClassFileLoaded: isClassFileLoaded,

        /**
         * @private
         */
        isFileLoaded: isFileLoaded,

        /**
         * Maintain the list of listeners to execute when all required scripts are fully loaded
         * @private
         */
        readyListeners: readyListeners,

        /**
         * Contains classes referenced in `uses` properties.
         * @private
         */
        optionalRequires: usedClasses,

        /**
         * Map of fully qualified class names to an array of dependent classes.
         * @private
         */
        requiresMap: requiresMap,

        /**
         * @private
         */
        numPendingFiles: 0,

        /**
         * @private
         */
        numLoadedFiles: 0,

        /** @private */
        hasFileLoadError: false,

        /**
         * @private
         */
        classNameToFilePathMap: classNameToFilePathMap,

        /**
         * The number of scripts loading via loadScript.
         * @private
         */
        scriptsLoading: 0,

        /**
         * @private
         */
        syncModeEnabled: false,

        scriptElements: scriptElements,

        /**
         * Refresh all items in the queue. If all dependencies for an item exist during looping,
         * it will execute the callback and call refreshQueue again. Triggers onReady when the queue is
         * empty
         * @private
         */
        refreshQueue: function() {
            var ln = queue.length,
                i, item, j, requires;

            // When the queue of loading classes reaches zero, trigger readiness

            if (!ln && !Loader.scriptsLoading) {
                return Loader.triggerReady();
            }

            for (i = 0; i < ln; i++) {
                item = queue[i];

                if (item) {
                    requires = item.requires;

                    // Don't bother checking when the number of files loaded
                    // is still less than the array length
                    if (requires.length > Loader.numLoadedFiles) {
                        continue;
                    }

                    // Remove any required classes that are loaded
                    for (j = 0; j < requires.length; ) {
                        if (Manager.isCreated(requires[j])) {
                            // Take out from the queue
                            arrayErase(requires, j, 1);
                        }
                        else {
                            j++;
                        }
                    }

                    // If we've ended up with no required classes, call the callback
                    if (item.requires.length === 0) {
                        arrayErase(queue, i, 1);
                        item.callback.call(item.scope);
                        Loader.refreshQueue();
                        break;
                    }
                }
            }

            return Loader;
        },

        /**
         * Inject a script element to document's head, call onLoad and onError accordingly
         * @private
         */
        injectScriptElement: function(url, onLoad, onError, scope, charset) {
            var script = document.createElement('script'),
                dispatched = false,
                config = Loader.config,
                onLoadFn = function() {

                    if(!dispatched) {
                        dispatched = true;
                        script.onload = script.onreadystatechange = script.onerror = null;
                        if (typeof config.scriptChainDelay == 'number') {
                            //free the stack (and defer the next script)
                            defer(onLoad, config.scriptChainDelay, scope);
                        } else {
                            onLoad.call(scope);
                        }
                        Loader.cleanupScriptElement(script, config.preserveScripts === false, config.garbageCollect);
                    }

                },
                onErrorFn = function(arg) {
                    defer(onError, 1, scope);   //free the stack
                    Loader.cleanupScriptElement(script, config.preserveScripts === false, config.garbageCollect);
                };

            script.type = 'text/javascript';
            script.onerror = onErrorFn;
            charset = charset || config.scriptCharset;
            if (charset) {
                script.charset = charset;
            }

            /*
             * IE9 Standards mode (and others) SHOULD follow the load event only
             * (Note: IE9 supports both onload AND readystatechange events)
             */
            if ('addEventListener' in script ) {
                script.onload = onLoadFn;
            } else if ('readyState' in script) {   // for <IE9 Compatability
                script.onreadystatechange = function() {
                    if ( this.readyState == 'loaded' || this.readyState == 'complete' ) {
                        onLoadFn();
                    }
                };
            } else {
                 script.onload = onLoadFn;
            }

            script.src = url;
            (Loader.documentHead || document.getElementsByTagName('head')[0]).appendChild(script);

            return script;
        },

        /**
         * @private
         */
        removeScriptElement: function(url) {
            if (scriptElements[url]) {
                Loader.cleanupScriptElement(scriptElements[url], true, !!Loader.getConfig('garbageCollect'));
                delete scriptElements[url];
            }

            return Loader;
        },

        /**
         * @private
         */
        cleanupScriptElement: function(script, remove, collect) {
            var prop;
            script.onload = script.onreadystatechange = script.onerror = null;
            if (remove) {
                Ext.removeNode(script);       // Remove, since its useless now
                if (collect) {
                    for (prop in script) {
                        try {
                            if (prop != 'src') {
                                // If we set the src property to null IE
                                // will try and request a script at './null'
                                script[prop] = null;
                            }
                            delete script[prop];      // and prepare for GC
                        } catch (cleanEx) {
                            //ignore
                        }
                    }
                }
            }

            return Loader;
        },

        /**
         * Loads the specified script URL and calls the supplied callbacks. If this method
         * is called before {@link Ext#isReady}, the script's load will delay the transition
         * to ready. This can be used to load arbitrary scripts that may contain further
         * {@link Ext#require Ext.require} calls.
         *
         * @param {Object/String} options The options object or simply the URL to load.
         * @param {String} options.url The URL from which to load the script.
         * @param {Function} [options.onLoad] The callback to call on successful load.
         * @param {Function} [options.onError] The callback to call on failure to load.
         * @param {Object} [options.scope] The scope (`this`) for the supplied callbacks.
         */
        loadScript: function (options) {
            var config = Loader.getConfig(),
                isString = typeof options == 'string',
                url = isString ? options : options.url,
                onError = !isString && options.onError,
                onLoad = !isString && options.onLoad,
                scope = !isString && options.scope,
                onScriptError = function() {
                    Loader.numPendingFiles--;
                    Loader.scriptsLoading--;

                    if (onError) {
                        onError.call(scope, "Failed loading '" + url + "', please verify that the file exists");
                    }

                    if (Loader.numPendingFiles + Loader.scriptsLoading === 0) {
                        Loader.refreshQueue();
                    }
                },
                onScriptLoad = function () {
                    Loader.numPendingFiles--;
                    Loader.scriptsLoading--;

                    if (onLoad) {
                        onLoad.call(scope);
                    }

                    if (Loader.numPendingFiles + Loader.scriptsLoading === 0) {
                        Loader.refreshQueue();
                    }
                },
                src;

            Loader.isLoading = true;
            Loader.numPendingFiles++;
            Loader.scriptsLoading++;

            src = config.disableCaching ?
                (url + '?' + config.disableCachingParam + '=' + Ext.Date.now()) : url;

            scriptElements[url] = Loader.injectScriptElement(src, onScriptLoad, onScriptError);
        },

        /**
         * Load a script file, supports both asynchronous and synchronous approaches
         * @private
         */
        loadScriptFile: function(url, onLoad, onError, scope, synchronous) {
            if (isFileLoaded[url]) {
                return Loader;
            }

            var config = Loader.getConfig(),
                noCacheUrl = url + (config.disableCaching ? ('?' + config.disableCachingParam + '=' + Ext.Date.now()) : ''),
                isCrossOriginRestricted = false,
                xhr, status, onScriptError,
                debugSourceURL = "";

            scope = scope || Loader;

            Loader.isLoading = true;

            if (!synchronous) {
                onScriptError = function() {
                    onError.call(scope, "Failed loading '" + url + "', please verify that the file exists", synchronous);
                };

                scriptElements[url] = Loader.injectScriptElement(noCacheUrl, onLoad, onScriptError, scope);
            } else {
                if (typeof XMLHttpRequest != 'undefined') {
                    xhr = new XMLHttpRequest();
                } else {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }

                try {
                    xhr.open('GET', noCacheUrl, false);
                    xhr.send(null);
                } catch (e) {
                    isCrossOriginRestricted = true;
                }

                status = (xhr.status === 1223) ? 204 :
                    (xhr.status === 0 && ((self.location || {}).protocol == 'file:' || (self.location || {}).protocol == 'ionp:')) ? 200 : xhr.status;

                isCrossOriginRestricted = isCrossOriginRestricted || (status === 0);

                if (isCrossOriginRestricted
                ) {
                    onError.call(Loader, "Failed loading synchronously via XHR: '" + url + "'; It's likely that the file is either " +
                                       "being loaded from a different domain or from the local file system whereby cross origin " +
                                       "requests are not allowed due to security reasons. Use asynchronous loading with " +
                                       "Ext.require instead.", synchronous);
                }
                else if ((status >= 200 && status < 300) || (status === 304)
                ) {
                    // Debugger friendly, file names are still shown even though they're eval'ed code
                    // Breakpoints work on both Firebug and Chrome's Web Inspector
                    if (!Ext.isIE) {
                        debugSourceURL = "\n//@ sourceURL=" + url;
                    }

                    Ext.globalEval(xhr.responseText + debugSourceURL);

                    onLoad.call(scope);
                }
                else {
                    onError.call(Loader, "Failed loading synchronously via XHR: '" + url + "'; please " +
                                       "verify that the file exists. " +
                                       "XHR status code: " + status, synchronous);
                }

                // Prevent potential IE memory leak
                xhr = null;
            }
        },

        // documented above
        syncRequire: function() {
            var syncModeEnabled = Loader.syncModeEnabled;

            if (!syncModeEnabled) {
                Loader.syncModeEnabled = true;
            }

            Loader.require.apply(Loader, arguments);

            if (!syncModeEnabled) {
                Loader.syncModeEnabled = false;
            }

            Loader.refreshQueue();
        },

        // documented above
        require: function(expressions, fn, scope, excludes) {
            var excluded = {},
                included = {},
                excludedClassNames = [],
                possibleClassNames = [],
                classNames = [],
                references = [],
                callback,
                syncModeEnabled,
                filePath, expression, exclude, className,
                possibleClassName, i, j, ln, subLn;

            if (excludes) {
                // Convert possible single string to an array.
                excludes = (typeof excludes === 'string') ? [ excludes ] : excludes;

                for (i = 0,ln = excludes.length; i < ln; i++) {
                    exclude = excludes[i];

                    if (typeof exclude == 'string' && exclude.length > 0) {
                        excludedClassNames = Manager.getNamesByExpression(exclude);

                        for (j = 0,subLn = excludedClassNames.length; j < subLn; j++) {
                            excluded[excludedClassNames[j]] = true;
                        }
                    }
                }
            }

            // Convert possible single string to an array.
            expressions = (typeof expressions === 'string') ? [ expressions ] : (expressions ? expressions : []);

            if (fn) {
                if (fn.length > 0) {
                    callback = function() {
                        var classes = [],
                            i, ln;

                        for (i = 0,ln = references.length; i < ln; i++) {
                            classes.push(Manager.get(references[i]));
                        }

                        return fn.apply(this, classes);
                    };
                }
                else {
                    callback = fn;
                }
            }
            else {
                callback = Ext.emptyFn;
            }

            scope = scope || Ext.global;

            for (i = 0,ln = expressions.length; i < ln; i++) {
                expression = expressions[i];

                if (typeof expression == 'string' && expression.length > 0) {
                    possibleClassNames = Manager.getNamesByExpression(expression);
                    subLn = possibleClassNames.length;

                    for (j = 0; j < subLn; j++) {
                        possibleClassName = possibleClassNames[j];

                        if (excluded[possibleClassName] !== true) {
                            references.push(possibleClassName);

                            if (!Manager.isCreated(possibleClassName) && !included[possibleClassName]) {
                                included[possibleClassName] = true;
                                classNames.push(possibleClassName);
                            }
                        }
                    }
                }
            }

            // If the dynamic dependency feature is not being used, throw an error
            // if the dependencies are not defined
            if (classNames.length > 0) {
                if (!Loader.config.enabled) {
                    throw new Error("Ext.Loader is not enabled, so dependencies cannot be resolved dynamically. " +
                             "Missing required class" + ((classNames.length > 1) ? "es" : "") + ": " + classNames.join(', '));
                }
            }
            else {
                callback.call(scope);
                return Loader;
            }

            syncModeEnabled = Loader.syncModeEnabled;

            if (!syncModeEnabled) {
                queue.push({
                    requires: classNames.slice(), // this array will be modified as the queue is processed,
                                                  // so we need a copy of it
                    callback: callback,
                    scope: scope
                });
            }

            ln = classNames.length;

            for (i = 0; i < ln; i++) {
                className = classNames[i];

                filePath = Loader.getPath(className);

                // If we are synchronously loading a file that has already been asychronously loaded before
                // we need to destroy the script tag and revert the count
                // This file will then be forced loaded in synchronous
                if (syncModeEnabled && isClassFileLoaded.hasOwnProperty(className)) {
                    if (!isClassFileLoaded[className]) {
                        Loader.numPendingFiles--;
                        Loader.removeScriptElement(filePath);
                        delete isClassFileLoaded[className];
                    }
                }

                if (!isClassFileLoaded.hasOwnProperty(className)) {
                    isClassFileLoaded[className] = false;
                    classNameToFilePathMap[className] = filePath;

                    Loader.numPendingFiles++;
                    Loader.loadScriptFile(
                        filePath,
                        pass(Loader.onFileLoaded, [className, filePath], Loader),
                        pass(Loader.onFileLoadError, [className, filePath], Loader),
                        Loader,
                        syncModeEnabled
                    );
                }
            }

            if (syncModeEnabled) {
                callback.call(scope);

                if (ln === 1) {
                    return Manager.get(className);
                }
            }

            return Loader;
        },

        /**
         * @private
         * @param {String} className
         * @param {String} filePath
         */
        onFileLoaded: function(className, filePath) {
            var loaded = isClassFileLoaded[className];
            Loader.numLoadedFiles++;

            isClassFileLoaded[className] = true;
            isFileLoaded[filePath] = true;

            // In FF, when we sync load something that has had a script tag inserted, the load event may
            // sometimes fire even if we clean it up and set it to null, so check if we're already loaded here.
            if (!loaded) {
                Loader.numPendingFiles--;
            }

            if (Loader.numPendingFiles === 0) {
                Loader.refreshQueue();
            }

            if (!Loader.syncModeEnabled && Loader.numPendingFiles === 0 && Loader.isLoading && !Loader.hasFileLoadError) {
                var missingClasses = [],
                    missingPaths = [],
                    requires,
                    i, ln, j, subLn;

                for (i = 0,ln = queue.length; i < ln; i++) {
                    requires = queue[i].requires;

                    for (j = 0,subLn = requires.length; j < subLn; j++) {
                        if (isClassFileLoaded[requires[j]]) {
                            missingClasses.push(requires[j]);
                        }
                    }
                }

                if (missingClasses.length < 1) {
                    return;
                }

                missingClasses = Ext.Array.filter(Ext.Array.unique(missingClasses), function(item) {
                    return !requiresMap.hasOwnProperty(item);
                }, Loader);
                
                if (missingClasses.length < 1) {
                    return;
                }

                for (i = 0,ln = missingClasses.length; i < ln; i++) {
                    missingPaths.push(classNameToFilePathMap[missingClasses[i]]);
                }

                throw new Error("The following classes are not declared even if their files have been " +
                    "loaded: '" + missingClasses.join("', '") + "'. Please check the source code of their " +
                    "corresponding files for possible typos: '" + missingPaths.join("', '"));
            }
        },

        /**
         * @private
         */
        onFileLoadError: function(className, filePath, errorMessage, isSynchronous) {
            Loader.numPendingFiles--;
            Loader.hasFileLoadError = true;

            throw new Error("[Ext.Loader] " + errorMessage);
        },

        /**
         * @private
         * Ensure that any classes referenced in the `uses` property are loaded.
         */
        addUsedClasses: function (classes) {
            var cls, i, ln;

            if (classes) {
                classes = (typeof classes == 'string') ? [classes] : classes;
                for (i = 0, ln = classes.length; i < ln; i++) {
                    cls = classes[i];
                    if (typeof cls == 'string' && !Ext.Array.contains(usedClasses, cls)) {
                        usedClasses.push(cls);
                    }
                }
            }

            return Loader;
        },

        /**
         * @private
         */
        triggerReady: function() {
            var listener,
                refClasses = usedClasses;

            if (Loader.isLoading) {
                Loader.isLoading = false;

                if (refClasses.length !== 0) {
                    // Clone then empty the array to eliminate potential recursive loop issue
                    refClasses = refClasses.slice();
                    usedClasses.length = 0;
                    // this may immediately call us back if all 'uses' classes
                    // have been loaded
                    Loader.require(refClasses, Loader.triggerReady, Loader);
                    return Loader;
                }
            }

            Ext.Array.sort(readyListeners, comparePriority);

            // this method can be called with Loader.isLoading either true or false
            // (can be called with false when all 'uses' classes are already loaded)
            // this may bypass the above if condition
            while (readyListeners.length && !Loader.isLoading) {
                // calls to refreshQueue may re-enter triggerReady
                // so we cannot necessarily iterate the readyListeners array
                listener = readyListeners.shift();
                listener.fn.call(listener.scope);
            }

            return Loader;
        },

        // Documented above already
        onReady: function(fn, scope, withDomReady, options) {
            var oldFn;

            if (withDomReady !== false && Ext.onDocumentReady) {
                oldFn = fn;

                fn = function() {
                    Ext.onDocumentReady(oldFn, scope, options);
                };
            }

            if (!Loader.isLoading) {
                fn.call(scope);
            }
            else {
                readyListeners.push({
                    fn: fn,
                    scope: scope,
                    priority: (options && options.priority) || 0
                });
            }
        },

        /**
         * @private
         * @param {String} className
         */
        historyPush: function(className) {
            if (className && isClassFileLoaded.hasOwnProperty(className) && !isInHistory[className]) {
                isInHistory[className] = true;
                history.push(className);
            }
            return Loader;
        }
    });

    /**
     * Turns on or off the "cache buster" applied to dynamically loaded scripts. Normally
     * dynamically loaded scripts have an extra query parameter appended to avoid stale
     * cached scripts. This method can be used to disable this mechanism, and is primarily
     * useful for testing. This is done using a cookie.
     * @param {Boolean} disable True to disable the cache buster.
     * @param {String} [path="/"] An optional path to scope the cookie.
     * @private
     */
    Ext.disableCacheBuster = function (disable, path) {
        var date = new Date();
        date.setTime(date.getTime() + (disable ? 10*365 : -1) * 24*60*60*1000);
        date = date.toGMTString();
        document.cookie = 'ext-cache=1; expires=' + date + '; path='+(path || '/');
    };


    /**
     * @member Ext
     * @method require
     * @inheritdoc Ext.Loader#require
     */
    Ext.require = alias(Loader, 'require');

    /**
     * @member Ext
     * @method syncRequire
     * @inheritdoc Ext.Loader#syncRequire
     */
    Ext.syncRequire = alias(Loader, 'syncRequire');

    /**
     * Convenient shortcut to {@link Ext.Loader#exclude}
     * @member Ext
     * @method exclude
     * @inheritdoc Ext.Loader#exclude
     */
    Ext.exclude = alias(Loader, 'exclude');

    /**
     * @member Ext
     * @method onReady
     * @ignore
     */
    Ext.onReady = function(fn, scope, options) {
        Loader.onReady(fn, scope, true, options);
    };

    /**
     * @cfg {String[]} requires
     * @member Ext.Class
     * List of classes that have to be loaded before instantiating this class.
     * For example:
     *
     *     Ext.define('Mother', {
     *         requires: ['Child'],
     *         giveBirth: function() {
     *             // we can be sure that child class is available.
     *             return new Child();
     *         }
     *     });
     */
    Class.registerPreprocessor('loader', function(cls, data, hooks, continueFn) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.Loader#loaderPreprocessor', arguments);
        
        var me = this,
            dependencies = [],
            dependency,
            className = Manager.getName(cls),
            i, j, ln, subLn, value, propertyName, propertyValue,
            requiredMap, requiredDep;

        /*
        Loop through the dependencyProperties, look for string class names and push
        them into a stack, regardless of whether the property's value is a string, array or object. For example:
        {
              extend: 'Ext.MyClass',
              requires: ['Ext.some.OtherClass'],
              mixins: {
                  observable: 'Ext.util.Observable';
              }
        }
        which will later be transformed into:
        {
              extend: Ext.MyClass,
              requires: [Ext.some.OtherClass],
              mixins: {
                  observable: Ext.util.Observable;
              }
        }
        */

        for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
            propertyName = dependencyProperties[i];

            if (data.hasOwnProperty(propertyName)) {
                propertyValue = data[propertyName];

                if (typeof propertyValue == 'string') {
                    dependencies.push(propertyValue);
                }
                else if (propertyValue instanceof Array) {
                    for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                        value = propertyValue[j];

                        if (typeof value == 'string') {
                            dependencies.push(value);
                        }
                    }
                }
                else if (typeof propertyValue != 'function') {
                    for (j in propertyValue) {
                        if (propertyValue.hasOwnProperty(j)) {
                            value = propertyValue[j];

                            if (typeof value == 'string') {
                                dependencies.push(value);
                            }
                        }
                    }
                }
            }
        }

        if (dependencies.length === 0) {
            return;
        }

        var deadlockPath = [],
            detectDeadlock;

        /*
        Automatically detect deadlocks before-hand,
        will throw an error with detailed path for ease of debugging. Examples of deadlock cases:

        - A extends B, then B extends A
        - A requires B, B requires C, then C requires A

        The detectDeadlock function will recursively transverse till the leaf, hence it can detect deadlocks
        no matter how deep the path is.
        */

        if (className) {
            requiresMap[className] = dependencies;
            requiredMap = Loader.requiredByMap || (Loader.requiredByMap = {});

            for (i = 0,ln = dependencies.length; i < ln; i++) {
                dependency = dependencies[i];
                (requiredMap[dependency] || (requiredMap[dependency] = [])).push(className);
            }
            detectDeadlock = function(cls) {
                deadlockPath.push(cls);

                if (requiresMap[cls]) {
                    if (Ext.Array.contains(requiresMap[cls], className)) {
                        throw new Error("Deadlock detected while loading dependencies! '" + className + "' and '" +
                                deadlockPath[1] + "' " + "mutually require each other. Path: " +
                                deadlockPath.join(' -> ') + " -> " + deadlockPath[0]);
                    }

                    for (i = 0,ln = requiresMap[cls].length; i < ln; i++) {
                        detectDeadlock(requiresMap[cls][i]);
                    }
                }
            };

            detectDeadlock(className);
        }


        Loader.require(dependencies, function() {
            for (i = 0,ln = dependencyProperties.length; i < ln; i++) {
                propertyName = dependencyProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    propertyValue = data[propertyName];

                    if (typeof propertyValue == 'string') {
                        data[propertyName] = Manager.get(propertyValue);
                    }
                    else if (propertyValue instanceof Array) {
                        for (j = 0, subLn = propertyValue.length; j < subLn; j++) {
                            value = propertyValue[j];

                            if (typeof value == 'string') {
                                data[propertyName][j] = Manager.get(value);
                            }
                        }
                    }
                    else if (typeof propertyValue != 'function') {
                        for (var k in propertyValue) {
                            if (propertyValue.hasOwnProperty(k)) {
                                value = propertyValue[k];

                                if (typeof value == 'string') {
                                    data[propertyName][k] = Manager.get(value);
                                }
                            }
                        }
                    }
                }
            }

            continueFn.call(me, cls, data, hooks);
        });

        return false;
    }, true, 'after', 'className');

    /**
     * @cfg {String[]} uses
     * @member Ext.Class
     * List of optional classes to load together with this class. These aren't neccessarily loaded before
     * this class is created, but are guaranteed to be available before Ext.onReady listeners are
     * invoked. For example:
     *
     *     Ext.define('Mother', {
     *         uses: ['Child'],
     *         giveBirth: function() {
     *             // This code might, or might not work:
     *             // return new Child();
     *
     *             // Instead use Ext.create() to load the class at the spot if not loaded already:
     *             return Ext.create('Child');
     *         }
     *     });
     */
    Manager.registerPostprocessor('uses', function(name, cls, data) {
        Ext.classSystemMonitor && Ext.classSystemMonitor(cls, 'Ext.Loader#usesPostprocessor', arguments);
        
        var uses = data.uses;
        if (uses) {
            Loader.addUsedClasses(uses);
        }
    });

    Manager.onCreated(Loader.historyPush);
};

// simple mechanism for automated means of injecting large amounts of dependency info
// at the appropriate time in the load cycle
if (Ext._classPathMetadata) {
    Ext.Loader.addClassPathMappings(Ext._classPathMetadata);
    Ext._classPathMetadata = null;
}

// initalize the default path of the framework
(function() {
    var scripts = document.getElementsByTagName('script'),
        currentScript = scripts[scripts.length - 1],
        src = currentScript.src,
        path = src.substring(0, src.lastIndexOf('/') + 1),
        Loader = Ext.Loader;

    if(src.indexOf("/platform/core/src/class/") != -1) {
        path = path + "../../../../extjs/";
    } else if(src.indexOf("/core/src/class/") != -1) {
        path = path + "../../../";
    }

    Loader.setConfig({
        enabled: true,
        disableCaching:
            (/[?&](?:cache|disableCacheBuster)\b/i.test(location.search) ||
             /(^|[ ;])ext-cache=1/.test(document.cookie)) ? false : 
            true,
        paths: {
            'Ext': path + 'src'
        }
    });
})();

// allows a tools like dynatrace to deterministically detect onReady state by invoking
// a callback (intended for external consumption)
Ext._endTime = new Date().getTime();
if (Ext._beforereadyhandler){
    Ext._beforereadyhandler();
}

// @tag foundation,core
// @require ../class/Loader.js
// @define Ext.Error

/**
 * @author Brian Moeskau <brian@sencha.com>
 * @docauthor Brian Moeskau <brian@sencha.com>
 *
 * A wrapper class for the native JavaScript Error object that adds a few useful capabilities for handling
 * errors in an Ext application. When you use Ext.Error to {@link #raise} an error from within any class that
 * uses the Ext 4 class system, the Error class can automatically add the source class and method from which
 * the error was raised. It also includes logic to automatically log the error to the console, if available,
 * with additional metadata about the error. In all cases, the error will always be thrown at the end so that
 * execution will halt.
 *
 * Ext.Error also offers a global error {@link #handle handling} method that can be overridden in order to
 * handle application-wide errors in a single spot. You can optionally {@link #ignore} errors altogether,
 * although in a real application it's usually a better idea to override the handling function and perform
 * logging or some other method of reporting the errors in a way that is meaningful to the application.
 *
 * At its simplest you can simply raise an error as a simple string from within any code:
 *
 * Example usage:
 *
 *     Ext.Error.raise('Something bad happened!');
 *
 * If raised from plain JavaScript code, the error will be logged to the console (if available) and the message
 * displayed. In most cases however you'll be raising errors from within a class, and it may often be useful to add
 * additional metadata about the error being raised.  The {@link #raise} method can also take a config object.
 * In this form the `msg` attribute becomes the error description, and any other data added to the config gets
 * added to the error object and, if the console is available, logged to the console for inspection.
 *
 * Example usage:
 *
 *     Ext.define('Ext.Foo', {
 *         doSomething: function(option){
 *             if (someCondition === false) {
 *                 Ext.Error.raise({
 *                     msg: 'You cannot do that!',
 *                     option: option,   // whatever was passed into the method
 *                     'error code': 100 // other arbitrary info
 *                 });
 *             }
 *         }
 *     });
 *
 * If a console is available (that supports the `console.dir` function) you'll see console output like:
 *
 *     An error was raised with the following data:
 *     option:         Object { foo: "bar"}
 *         foo:        "bar"
 *     error code:     100
 *     msg:            "You cannot do that!"
 *     sourceClass:   "Ext.Foo"
 *     sourceMethod:  "doSomething"
 *
 *     uncaught exception: You cannot do that!
 *
 * As you can see, the error will report exactly where it was raised and will include as much information as the
 * raising code can usefully provide.
 *
 * If you want to handle all application errors globally you can simply override the static {@link #handle} method
 * and provide whatever handling logic you need. If the method returns true then the error is considered handled
 * and will not be thrown to the browser. If anything but true is returned then the error will be thrown normally.
 *
 * Example usage:
 *
 *     Ext.Error.handle = function(err) {
 *         if (err.someProperty == 'NotReallyAnError') {
 *             // maybe log something to the application here if applicable
 *             return true;
 *         }
 *         // any non-true return value (including none) will cause the error to be thrown
 *     }
 *
 */
Ext.Error = Ext.extend(Error, {
    statics: {
        /**
         * @property {Boolean} ignore
         * Static flag that can be used to globally disable error reporting to the browser if set to true
         * (defaults to false). Note that if you ignore Ext errors it's likely that some other code may fail
         * and throw a native JavaScript error thereafter, so use with caution. In most cases it will probably
         * be preferable to supply a custom error {@link #handle handling} function instead.
         *
         * Example usage:
         *
         *     Ext.Error.ignore = true;
         *
         * @static
         */
        ignore: false,

        /**
         * @property {Boolean} notify
         * Static flag that can be used to globally control error notification to the user. Unlike
         * Ex.Error.ignore, this does not effect exceptions. They are still thrown. This value can be
         * set to false to disable the alert notification (default is true for IE6 and IE7).
         *
         * Only the first error will generate an alert. Internally this flag is set to false when the
         * first error occurs prior to displaying the alert.
         *
         * This flag is not used in a release build.
         *
         * Example usage:
         *
         *     Ext.Error.notify = false;
         *
         * @static
         */
        //notify: Ext.isIE6 || Ext.isIE7,

        /**
         * Raise an error that can include additional data and supports automatic console logging if available.
         * You can pass a string error message or an object with the `msg` attribute which will be used as the
         * error message. The object can contain any other name-value attributes (or objects) to be logged
         * along with the error.
         *
         * Note that after displaying the error message a JavaScript error will ultimately be thrown so that
         * execution will halt.
         *
         * Example usage:
         *
         *     Ext.Error.raise('A simple string error message');
         *
         *     // or...
         *
         *     Ext.define('Ext.Foo', {
         *         doSomething: function(option){
         *             if (someCondition === false) {
         *                 Ext.Error.raise({
         *                     msg: 'You cannot do that!',
         *                     option: option,   // whatever was passed into the method
         *                     'error code': 100 // other arbitrary info
         *                 });
         *             }
         *         }
         *     });
         *
         * @param {String/Object} err The error message string, or an object containing the attribute "msg" that will be
         * used as the error message. Any other data included in the object will also be logged to the browser console,
         * if available.
         * @static
         */
        raise: function(err){
            err = err || {};
            if (Ext.isString(err)) {
                err = { msg: err };
            }

            var method = this.raise.caller,
                msg;

            if (method) {
                if (method.$name) {
                    err.sourceMethod = method.$name;
                }
                if (method.$owner) {
                    err.sourceClass = method.$owner.$className;
                }
            }

            if (Ext.Error.handle(err) !== true) {
                msg = Ext.Error.prototype.toString.call(err);

                Ext.log({
                    msg: msg,
                    level: 'error',
                    dump: err,
                    stack: true
                });

                throw new Ext.Error(err);
            }
        },

        /**
         * Globally handle any Ext errors that may be raised, optionally providing custom logic to
         * handle different errors individually. Return true from the function to bypass throwing the
         * error to the browser, otherwise the error will be thrown and execution will halt.
         *
         * Example usage:
         *
         *     Ext.Error.handle = function(err) {
         *         if (err.someProperty == 'NotReallyAnError') {
         *             // maybe log something to the application here if applicable
         *             return true;
         *         }
         *         // any non-true return value (including none) will cause the error to be thrown
         *     }
         *
         * @param {Ext.Error} err The Ext.Error object being raised. It will contain any attributes that were originally
         * raised with it, plus properties about the method and class from which the error originated (if raised from a
         * class that uses the Ext 4 class system).
         * @static
         */
        handle: function(){
            return Ext.Error.ignore;
        }
    },

    // This is the standard property that is the name of the constructor.
    name: 'Ext.Error',

    /**
     * Creates new Error object.
     * @param {String/Object} config The error message string, or an object containing the
     * attribute "msg" that will be used as the error message. Any other data included in
     * the object will be applied to the error instance and logged to the browser console, if available.
     */
    constructor: function(config){
        if (Ext.isString(config)) {
            config = { msg: config };
        }

        var me = this;

        Ext.apply(me, config);

        me.message = me.message || me.msg; // 'message' is standard ('msg' is non-standard)
        // note: the above does not work in old WebKit (me.message is readonly) (Safari 4)
    },

    /**
     * Provides a custom string representation of the error object. This is an override of the base JavaScript
     * `Object.toString` method, which is useful so that when logged to the browser console, an error object will
     * be displayed with a useful message instead of `[object Object]`, the default `toString` result.
     *
     * The default implementation will include the error message along with the raising class and method, if available,
     * but this can be overridden with a custom implementation either at the prototype level (for all errors) or on
     * a particular error instance, if you want to provide a custom description that will show up in the console.
     * @return {String} The error message. If raised from within the Ext 4 class system, the error message will also
     * include the raising class and method names, if available.
     */
    toString: function(){
        var me = this,
            className = me.sourceClass ? me.sourceClass : '',
            methodName = me.sourceMethod ? '.' + me.sourceMethod + '(): ' : '',
            msg = me.msg || '(No description provided)';

        return className + methodName + msg;
    }
});

/*
 * Create a function that will throw an error if called (in debug mode) with a message that
 * indicates the method has been removed.
 * @param {String} suggestion Optional text to include in the message (a workaround perhaps).
 * @return {Function} The generated function.
 * @private
 */
Ext.deprecated = function (suggestion) {
    if (!suggestion) {
        suggestion = '';
    }

    function fail () {
        Ext.Error.raise('The method "' + fail.$owner.$className + '.' + fail.$name + 
                '" has been removed. ' + suggestion);
    }

    return fail;
    return Ext.emptyFn;
};

/*
 * This mechanism is used to notify the user of the first error encountered on the page. This
 * was previously internal to Ext.Error.raise and is a desirable feature since errors often
 * slip silently under the radar. It cannot live in Ext.Error.raise since there are times
 * where exceptions are handled in a try/catch.
 */
(function () {
    var timer, errors = 0,
        win = Ext.global,
        msg;

    if (typeof window === 'undefined') {
        return; // build system or some such environment...
    }

    // This method is called to notify the user of the current error status.
    function notify () {
        var counters = Ext.log.counters,
            supports = Ext.supports,
            hasOnError = supports && supports.WindowOnError; // TODO - timing

        // Put log counters to the status bar (for most browsers):
        if (counters && (counters.error + counters.warn + counters.info + counters.log)) {
            msg = [ 'Logged Errors:',counters.error, 'Warnings:',counters.warn,
                        'Info:',counters.info, 'Log:',counters.log].join(' ');
            if (errors) {
                msg = '*** Errors: ' + errors + ' - ' + msg;
            } else if (counters.error) {
                msg = '*** ' + msg;
            }
            win.status = msg;
        }

        // Display an alert on the first error:
        if (!Ext.isDefined(Ext.Error.notify)) {
            Ext.Error.notify = Ext.isIE6 || Ext.isIE7; // TODO - timing
        }
        if (Ext.Error.notify && (hasOnError ? errors : (counters && counters.error))) {
            Ext.Error.notify = false;

            if (timer) {
                win.clearInterval(timer); // ticks can queue up so stop...
                timer = null;
            }

            alert('Unhandled error on page: See console or log');
            poll();
        }
    }

    // Sets up polling loop. This is the only way to know about errors in some browsers
    // (Opera/Safari) and is the only way to update the status bar for warnings and other
    // non-errors.
    function poll () {
        timer = win.setInterval(notify, 1000);
    }

    // window.onerror sounds ideal but it prevents the built-in error dialog from doing
    // its (better) thing.
    poll();
}());

// @tag extras,core
// @require ../lang/Error.js
// @define Ext.JSON

/**
 * Modified version of [Douglas Crockford's JSON.js][dc] that doesn't
 * mess with the Object prototype.
 *
 * [dc]: http://www.json.org/js.html
 *
 * @singleton
 */
Ext.JSON = (new(function() {
    var me = this,
    encodingFunction,
    decodingFunction,
    useNative = null,
    useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        if (useNative === null) {
            useNative = Ext.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
        }
        return useNative;
    },
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o, newline) {
        // http://jsperf.com/is-undefined
        if (o === null || o === undefined) {
            return "null";
        } else if (Ext.isDate(o)) {
            return Ext.JSON.encodeDate(o);
        } else if (Ext.isString(o)) {
            return Ext.JSON.encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (Ext.isBoolean(o)) {
            return String(o);
        }
        // Allow custom zerialization by adding a toJSON method to any object type.
        // Date/String have a toJSON in some environments, so check these first.
        else if (o.toJSON) {
            return o.toJSON();
        } else if (Ext.isArray(o)) {
            return encodeArray(o, newline);
        } else if (Ext.isObject(o)) {
            return encodeObject(o, newline);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },

    encodeArrayPretty = function(o, newline) {
        var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline], // Note newline in case there are no members
            i;

        for (i = 0; i < len; i += 1) {
            a.push(Ext.JSON.encodeValue(o[i], cnewline), sep);
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + ']';

        return a.join('');
    },

    encodeObjectPretty = function(o, newline) {
        var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline], // Note newline in case there are no members
            i, val;

        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(Ext.JSON.encodeValue(i) + ': ' + Ext.JSON.encodeValue(val, cnewline), sep);
            }
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + '}';

        return a.join('');
    },

    encodeArray = function(o, newline) {
        if (newline) {
            return encodeArrayPretty(o, newline);
        }

        var a = ["[", ""], // Note empty string in case there are no serializable members.
            len = o.length,
            i;
        for (i = 0; i < len; i += 1) {
            a.push(Ext.JSON.encodeValue(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },

    encodeObject = function(o, newline) {
        if (newline) {
            return encodeObjectPretty(o, newline);
        }

        var a = ["{", ""], // Note empty string in case there are no serializable members.
            i, val;
        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(Ext.JSON.encodeValue(i), ":", Ext.JSON.encodeValue(val), ',');
                
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    };
    
    /**
     * Encodes a String. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * To override this:
     *
     *     Ext.JSON.encodeString = function(s) {
     *         return 'Foo' + s;
     *     };
     *
     * @param {String} s The String to encode
     * @return {String} The string literal to use in a JSON string.
     * @method
     */
    me.encodeString = encodeString;

    /**
     * The function which {@link #encode} uses to encode all javascript values to their JSON representations
     * when {@link Ext#USE_NATIVE_JSON} is `false`.
     * 
     * This is made public so that it can be replaced with a custom implementation.
     *
     * @param {Object} o Any javascript value to be converted to its JSON representation
     * @return {String} The JSON representation of the passed value.
     * @method
     */
    me.encodeValue = doEncode;

    /**
     * Encodes a Date. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * The default return format is `"yyyy-mm-ddThh:mm:ss"`.
     *
     * To override this:
     *
     *     Ext.JSON.encodeDate = function(d) {
     *         return Ext.Date.format(d, '"Y-m-d"');
     *     };
     *
     * @param {Date} d The Date to encode
     * @return {String} The string literal to use in a JSON string.
     */
    me.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    /**
     * Encodes an Object, Array or other value.
     * 
     * If the environment's native JSON encoding is not being used ({@link Ext#USE_NATIVE_JSON} is not set,
     * or the environment does not support it), then ExtJS's encoding will be used. This allows the developer
     * to add a `toJSON` method to their classes which need serializing to return a valid JSON representation
     * of the object.
     * 
     * @param {Object} o The variable to encode
     * @return {String} The JSON string
     */
    me.encode = function(o) {
        if (!encodingFunction) {
            // setup encoding function on first access
            encodingFunction = isNative() ? JSON.stringify : me.encodeValue;
        }
        return encodingFunction(o);
    };

    /**
     * Decodes (parses) a JSON string to an object. If the JSON is invalid, this function throws
     * a SyntaxError unless the safe option is set.
     *
     * @param {String} json The JSON string
     * @param {Boolean} [safe=false] True to return null, false to throw an exception if the JSON is invalid.
     * @return {Object} The resulting object
     */
    me.decode = function(json, safe) {
        if (!decodingFunction) {
            // setup decoding function on first access
            decodingFunction = isNative() ? JSON.parse : doDecode;
        }
        try {
            return decodingFunction(json);
        } catch (e) {
            if (safe === true) {
                return null;
            }
            Ext.Error.raise({
                sourceClass: "Ext.JSON",
                sourceMethod: "decode",
                msg: "You're trying to decode an invalid JSON String: " + json
            });
        }
    };
})());
/**
 * Shorthand for {@link Ext.JSON#encode}
 * @member Ext
 * @method encode
 * @inheritdoc Ext.JSON#encode
 */
Ext.encode = Ext.JSON.encode;
/**
 * Shorthand for {@link Ext.JSON#decode}
 * @member Ext
 * @method decode
 * @inheritdoc Ext.JSON#decode
 */
Ext.decode = Ext.JSON.decode;

// @tag extras,core
// @require misc/JSON.js
// @define Ext

/**
 * @class Ext
 *
 * The Ext namespace (global object) encapsulates all classes, singletons, and
 * utility methods provided by Sencha's libraries.
 *
 * Most user interface Components are at a lower level of nesting in the namespace,
 * but many common utility functions are provided as direct properties of the Ext namespace.
 *
 * Also many frequently used methods from other classes are provided as shortcuts
 * within the Ext namespace. For example {@link Ext#getCmp Ext.getCmp} aliases
 * {@link Ext.ComponentManager#get Ext.ComponentManager.get}.
 *
 * Many applications are initiated with {@link Ext#onReady Ext.onReady} which is
 * called once the DOM is ready. This ensures all scripts have been loaded,
 * preventing dependency issues. For example:
 *
 *     Ext.onReady(function(){
 *         new Ext.Component({
 *             renderTo: document.body,
 *             html: 'DOM ready!'
 *         });
 *     });
 *
 * For more information about how to use the Ext classes, see:
 *
 * - <a href="http://www.sencha.com/learn/">The Learning Center</a>
 * - <a href="http://www.sencha.com/learn/Ext_FAQ">The FAQ</a>
 * - <a href="http://www.sencha.com/forum/">The forums</a>
 *
 * @singleton
 */
Ext.apply(Ext, {
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    windowId: 'ext-window',
    documentId: 'ext-document',

    /**
     * True when the document is fully initialized and ready for action
     */
    isReady: false,

    /**
     * True to automatically uncache orphaned Ext.Elements periodically
     */
    enableGarbageCollector: true,

    /**
     * True to automatically purge event listeners during garbageCollection.
     */
    enableListenerCollection: true,

    /**
     * @property {Object} rootHierarchyState the top level hierarchy state to which
     * all other hierarchy states are chained.  If there is a viewport instance,
     * this object becomes the viewport's heirarchyState. See also
     * {@link Ext.AbstractComponent#getHierarchyState}
     * @private
     */
    rootHierarchyState: {},

    addCacheEntry: function(id, el, dom) {
        dom = dom || el.dom;

        if (!dom) {
            // Without the DOM node we can't GC the entry
            Ext.Error.raise('Cannot add an entry to the element cache without the DOM node');
        }

        var cache = Ext.cache,
            key = id || (el && el.id) || dom.id,
            entry = cache[key] || (cache[key] = {
                data: {},
                events: {},

                dom: dom,

                // Skip garbage collection for special elements (window, document, iframes)
                skipGarbageCollection: !!(dom.getElementById || dom.navigator)
            });

        if (el) {
            el.$cache = entry;
            // Inject the back link from the cache in case the cache entry
            // had already been created by Ext.fly. Ext.fly creates a cache entry with no el link.
            entry.el = el;
        }

        return entry;
    },

    updateCacheEntry: function(cacheItem, dom){
        cacheItem.dom = dom;
        if (cacheItem.el) {
            cacheItem.el.dom = dom;
        }
        return cacheItem;
    },

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @param {HTMLElement/Ext.Element} [el] The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    id: function(el, prefix) {
        var me = this,
            sandboxPrefix = '';
        el = Ext.getDom(el, true) || {};
        if (el === document) {
            el.id = me.documentId;
        }
        else if (el === window) {
            el.id = me.windowId;
        }
        if (!el.id) {
            if (me.isSandboxed) {
                sandboxPrefix = Ext.sandboxName.toLowerCase() + '-';
            }
            el.id = sandboxPrefix + (prefix || "ext-gen") + (++Ext.idSeed);
        }
        return el.id;
    },

    escapeId: (function(){
        var validIdRe = /^[a-zA-Z_][a-zA-Z0-9_\-]*$/i,
            escapeRx = /([\W]{1})/g,
            leadingNumRx = /^(\d)/g,
            escapeFn = function(match, capture){
                return "\\" + capture;
            },
            numEscapeFn = function(match, capture){
                return '\\00' + capture.charCodeAt(0).toString(16) + ' ';
            };

        return function(id) {
            return validIdRe.test(id)
                ? id
                // replace the number portion last to keep the trailing ' '
                // from being escaped
                : id.replace(escapeRx, escapeFn)
                    .replace(leadingNumRx, numEscapeFn);
        };
    }()),

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return {Ext.Element} The document body
     */
    getBody: (function() {
        var body;
        return function() {
            return body || (body = Ext.get(document.body));
        };
    }()),

    /**
     * Returns the current document head as an {@link Ext.Element}.
     * @return {Ext.Element} The document head
     * @method
     */
    getHead: (function() {
        var head;
        return function() {
            return head || (head = Ext.get(document.getElementsByTagName("head")[0]));
        };
    }()),

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return {Ext.Element} The document
     */
    getDoc: (function() {
        var doc;
        return function() {
            return doc || (doc = Ext.get(document));
        };
    }()),

    /**
     * Returns the current orientation of the mobile device
     * @return {String} Either 'portrait' or 'landscape'
     */
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}, but any subclass of
     * {@link Ext.util.Observable} can be passed in.  Any number of elements and/or components can be
     * passed into this function in a single call as separate arguments.
     *
     * @param {Ext.dom.Element/Ext.util.Observable/Ext.dom.Element[]/Ext.util.Observable[]...} args
     * Any number of elements or components, or an Array of either of these to destroy.
     */
    destroy: function() {
        var ln = arguments.length,
        i, arg;

        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                } else if (arg.isStore) {
                    arg.destroyStore();
                } else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                } else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    },

    /**
     * Execute a callback function in a particular scope. If `callback` argument is a
     * function reference, that is called. If it is a string, the string is assumed to
     * be the name of a method on the given `scope`. If no function is passed the call
     * is ignored.
     *
     * For example, these calls are equivalent:
     *
     *      var myFunc = this.myFunc;
     *
     *      Ext.callback('myFunc', this, [arg1, arg2]);
     *      Ext.callback(myFunc, this, [arg1, arg2]);
     *
     *      Ext.isFunction(myFunc) && this.myFunc(arg1, arg2);
     *
     * @param {Function} callback The callback to execute
     * @param {Object} [scope] The scope to execute in
     * @param {Array} [args] The arguments to pass to the function
     * @param {Number} [delay] Pass a number to delay the call by a number of milliseconds.
     * @return The value returned by the callback or `undefined` (if there is a `delay`
     * or if the `callback` is not a function).
     */
    callback: function (callback, scope, args, delay) {
        var fn, ret;

        if (Ext.isFunction(callback)){
            fn = callback;
        } else if (scope && Ext.isString(callback)) {
            fn = scope[callback];
            if (!fn) {
                Ext.Error.raise('No method named "' + callback + '"');
            }
        }

        if (fn) {
            args = args || [];
            scope = scope || window;
            if (delay) {
                Ext.defer(fn, delay, scope, args);
            } else {
                ret = fn.apply(scope, args);
            }
        }

        return ret;
    },
    
    /**
     * @private
     */
    resolveMethod: function(fn, scope) {
        if (Ext.isFunction(fn)) {
            return fn;
        }
        
        if (!Ext.isObject(scope) || !Ext.isFunction(scope[fn])) {
            Ext.Error.raise('No method named "' + fn + '"');
        }
        
        return scope[fn];
    },

    /**
     * Alias for {@link Ext.String#htmlEncode}.
     * @inheritdoc Ext.String#htmlEncode
     * @ignore
     */
    htmlEncode : function(value) {
        return Ext.String.htmlEncode(value);
    },

    /**
     * Alias for {@link Ext.String#htmlDecode}.
     * @inheritdoc Ext.String#htmlDecode
     * @ignore
     */
    htmlDecode : function(value) {
         return Ext.String.htmlDecode(value);
    },

    /**
     * Alias for {@link Ext.String#urlAppend}.
     * @inheritdoc Ext.String#urlAppend
     * @ignore
     */
    urlAppend : function(url, s) {
        return Ext.String.urlAppend(url, s);
    }
});


Ext.ns = Ext.namespace;

// for old browsers
window.undefined = window.undefined;

/**
 * @class Ext
 */
(function(){
/*
FF 3.6      - Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.17) Gecko/20110420 Firefox/3.6.17
FF 4.0.1    - Mozilla/5.0 (Windows NT 5.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1
FF 5.0      - Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0

IE6         - Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1;)
IE7         - Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1;)
IE8         - Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)
IE9         - Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)]
IE10        - Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; MS-RTC LM 8)

Chrome 11   - Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.60 Safari/534.24

Safari 5    - Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1

Opera 11.11 - Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11
*/
    var check = function(regex){
            return regex.test(Ext.userAgent);
        },
        isStrict = document.compatMode == "CSS1Compat",
        version = function (is, regex) {
            var m;
            return (is && (m = regex.exec(Ext.userAgent))) ? parseFloat(m[1]) : 0;
        },
        docMode = document.documentMode,
        isOpera = check(/opera/),
        isOpera10_5 = isOpera && check(/version\/10\.5/),
        isChrome = check(/\bchrome\b/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isSafari5_0 = isSafari && check(/version\/5\.0/),
        isSafari5 = isSafari && check(/version\/5/),
        isIE = !isOpera && check(/msie/),
        isIE7 = isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9 && docMode != 10) || docMode == 7),
        isIE8 = isIE && ((check(/msie 8/) && docMode != 7 && docMode != 9 && docMode != 10) || docMode == 8),
        isIE9 = isIE && ((check(/msie 9/) && docMode != 7 && docMode != 8 && docMode != 10) || docMode == 9),
        isIE10 = isIE && ((check(/msie 10/) && docMode != 7 && docMode != 8 && docMode != 9) || docMode == 10),
        isIE6 = isIE && check(/msie 6/),
        isGecko = !isWebKit && check(/gecko/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isGecko4 = isGecko && check(/rv:2\.0/),
        isGecko5 = isGecko && check(/rv:5\./),
        isGecko10 = isGecko && check(/rv:10\./),
        isFF3_0 = isGecko3 && check(/rv:1\.9\.0/),
        isFF3_5 = isGecko3 && check(/rv:1\.9\.1/),
        isFF3_6 = isGecko3 && check(/rv:1\.9\.2/),
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isLinux = check(/linux/),
        scrollbarSize = null,
        chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/),
        firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/),
        ieVersion = version(isIE, /msie (\d+\.\d+)/),
        operaVersion = version(isOpera, /version\/(\d+\.\d+)/),
        safariVersion = version(isSafari, /version\/(\d+\.\d+)/),
        webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/),
        isSecure = /^https/i.test(window.location.protocol),
        nullLog;

    // remove css image flicker
    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(e) {}


    var primitiveRe = /string|number|boolean/;
    function dumpObject (object) {
        var member, type, value, name,
            members = [];

        // Cannot use Ext.encode since it can recurse endlessly (if we're lucky)
        // ...and the data could be prettier!
        for (name in object) {
            if (object.hasOwnProperty(name)) {
                value = object[name];

                type = typeof value;
                if (type == "function") {
                    continue;
                }

                if (type == 'undefined') {
                    member = type;
                } else if (value === null || primitiveRe.test(type) || Ext.isDate(value)) {
                    member = Ext.encode(value);
                } else if (Ext.isArray(value)) {
                    member = '[ ]';
                } else if (Ext.isObject(value)) {
                    member = '{ }';
                } else {
                    member = type;
                }
                members.push(Ext.encode(name) + ': ' + member);
            }
        }

        if (members.length) {
            return ' \nData: {\n  ' + members.join(',\n  ') + '\n}';
        }
        return '';
    }

    function log (message) {
        var options, dump,
            con = Ext.global.console,
            level = 'log',
            indent = log.indent || 0,
            stack,
            out,
            max;

        log.indent = indent;

        if (typeof message != 'string') {
            options = message;
            message = options.msg || '';
            level = options.level || level;
            dump = options.dump;
            stack = options.stack;

            if (options.indent) {
                ++log.indent;
            } else if (options.outdent) {
                log.indent = indent = Math.max(indent - 1, 0);
            }

            if (dump && !(con && con.dir)) {
                message += dumpObject(dump);
                dump = null;
            }
        }

        if (arguments.length > 1) {
            message += Array.prototype.slice.call(arguments, 1).join('');
        }

        message = indent ? Ext.String.repeat(' ', log.indentSize * indent) + message : message;
        // w/o console, all messages are equal, so munge the level into the message:
        if (level != 'log') {
            message = '[' + level.charAt(0).toUpperCase() + '] ' + message;
        }

        // Not obvious, but 'console' comes and goes when Firebug is turned on/off, so
        // an early test may fail either direction if Firebug is toggled.
        //
        if (con) { // if (Firebug-like console)
            if (con[level]) {
                con[level](message);
            } else {
                con.log(message);
            }

            if (dump) {
                con.dir(dump);
            }

            if (stack && con.trace) {
                // Firebug's console.error() includes a trace already...
                if (!con.firebug || level != 'error') {
                    con.trace();
                }
            }
        } else {
            if (Ext.isOpera) {
                opera.postError(message);
            } else {
                out = log.out;
                max = log.max;

                if (out.length >= max) {
                    // this formula allows out.max to change (via debugger), where the
                    // more obvious "max/4" would not quite be the same
                    Ext.Array.erase(out, 0, out.length - 3 * Math.floor(max / 4)); // keep newest 75%
                }

                out.push(message);
            }
        }

        // Mostly informational, but the Ext.Error notifier uses them:
        ++log.count;
        ++log.counters[level];
    }

    function logx (level, args) {
        if (typeof args[0] == 'string') {
            args.unshift({});
        }
        args[0].level = level;
        log.apply(this, args);
    }

    log.error = function () {
        logx('error', Array.prototype.slice.call(arguments));
    };
    log.info = function () {
        logx('info', Array.prototype.slice.call(arguments));
    };
    log.warn = function () {
        logx('warn', Array.prototype.slice.call(arguments));
    };

    log.count = 0;
    log.counters = { error: 0, warn: 0, info: 0, log: 0 };
    log.indentSize = 2;
    log.out = [];
    log.max = 750;
    log.show = function () {
        window.open('','extlog').document.write([
            '<html><head><script type="text/javascript">',
                'var lastCount = 0;',
                'function update () {',
                    'var ext = window.opener.Ext,',
                        'extlog = ext && ext.log;',
                    'if (extlog && extlog.out && lastCount != extlog.count) {',
                        'lastCount = extlog.count;',
                        'var s = "<tt>" + extlog.out.join("~~~").replace(/[&]/g, "&amp;").replace(/[<]/g, "&lt;").replace(/[ ]/g, "&#160;").replace(/\\~\\~\\~/g, "<br/>") + "</tt>";',
                        'document.body.innerHTML = s;',
                    '}',
                    'setTimeout(update, 1000);',
                '}',
                'setTimeout(update, 1000);',
            '</script></head><body></body></html>'].join(''));
    };

    nullLog = function () {};
    nullLog.info = nullLog.warn = nullLog.error = Ext.emptyFn;

    // also update Version.js
    Ext.setVersion('extjs', '4.2.1.883');
    Ext.apply(Ext, {
        /**
         * @property {String} SSL_SECURE_URL
         * URL to a blank file used by Ext when in secure mode for iframe src and onReady src
         * to prevent the IE insecure content warning (`'about:blank'`, except for IE
         * in secure mode, which is `'javascript:""'`).
         */
        SSL_SECURE_URL : isSecure && isIE ? 'javascript:\'\'' : 'about:blank',

        /**
         * @property {Boolean} enableFx
         * True if the {@link Ext.fx.Anim} Class is available.
         */

        plainTableCls: Ext.buildSettings.baseCSSPrefix + 'table-plain', 

        plainListCls: Ext.buildSettings.baseCSSPrefix + 'list-plain', 

        /**
         * @property {Boolean} enableNestedListenerRemoval
         * **Experimental.** True to cascade listener removal to child elements when an element
         * is removed. Currently not optimized for performance.
         */
        enableNestedListenerRemoval : false,

        /**
         * @property {Boolean} USE_NATIVE_JSON
         * Indicates whether to use native browser parsing for JSON methods.
         * This option is ignored if the browser does not support native JSON methods.
         *
         * **Note:** Native JSON methods will not work with objects that have functions.
         * Also, property names must be quoted, otherwise the data will not parse.
         */
        USE_NATIVE_JSON : false,

        /**
         * Returns the dom node for the passed String (id), dom node, or Ext.Element.
         * Optional 'strict' flag is needed for IE since it can return 'name' and
         * 'id' elements by using getElementById.
         *
         * Here are some examples:
         *
         *     // gets dom node based on id
         *     var elDom = Ext.getDom('elId');
         *     // gets dom node based on the dom node
         *     var elDom1 = Ext.getDom(elDom);
         *
         *     // If we don&#39;t know if we are working with an
         *     // Ext.Element or a dom node use Ext.getDom
         *     function(el){
         *         var dom = Ext.getDom(el);
         *         // do something with the dom node
         *     }
         *
         * **Note:** the dom node to be found actually needs to exist (be rendered, etc)
         * when this method is called to be successful.
         *
         * @param {String/HTMLElement/Ext.Element} el
         * @return HTMLElement
         */
        getDom : function(el, strict) {
            if (!el || !document) {
                return null;
            }
            if (el.dom) {
                return el.dom;
            } else {
                if (typeof el == 'string') {
                    var e = Ext.getElementById(el);
                    // IE returns elements with the 'name' and 'id' attribute.
                    // we do a strict check to return the element with only the id attribute
                    if (e && isIE && strict) {
                        if (el == e.getAttribute('id')) {
                            return e;
                        } else {
                            return null;
                        }
                    }
                    return e;
                } else {
                    return el;
                }
            }
        },

        /**
         * Removes a DOM node from the document.
         *
         * Removes this element from the document, removes all DOM event listeners, and
         * deletes the cache reference. All DOM event listeners are removed from this element.
         * If {@link Ext#enableNestedListenerRemoval Ext.enableNestedListenerRemoval} is
         * `true`, then DOM event listeners are also removed from all child nodes.
         * The body node will be ignored if passed in.
         *
         * @param {HTMLElement} node The node to remove
         * @method
         */
        removeNode : isIE6 || isIE7 || isIE8
            ? (function() {
                var d;
                return function(n){
                    if(n && n.tagName.toUpperCase() != 'BODY'){
                        (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                        var cache = Ext.cache,
                            id = n.id;

                        if (cache[id]) {
                            delete cache[id].dom;
                            delete cache[id];
                        }

                        if (isIE8 && n.parentNode) {
                            n.parentNode.removeChild(n);
                        }
                        d = d || document.createElement('div');
                        d.appendChild(n);
                        d.innerHTML = '';
                    }
                };
            }())
            : function(n) {
                if (n && n.parentNode && n.tagName.toUpperCase() != 'BODY') {
                    (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                    var cache = Ext.cache,
                        id = n.id;

                    if (cache[id]) {
                        delete cache[id].dom;
                        delete cache[id];
                    }

                    n.parentNode.removeChild(n);
                }
            },

        isStrict: isStrict,

        // IE10 quirks behaves like Gecko/WebKit quirks, so don't include it here
        isIEQuirks: isIE && (!isStrict && (isIE6 || isIE7 || isIE8 || isIE9)),

        /**
         * True if the detected browser is Opera.
         * @type Boolean
         */
        isOpera : isOpera,

        /**
         * True if the detected browser is Opera 10.5x.
         * @type Boolean
         */
        isOpera10_5 : isOpera10_5,

        /**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,

        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,

        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,

        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,

        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,

        /**
         * True if the detected browser is Safari 5.x.
         * @type Boolean
         */
        isSafari5 : isSafari5,

        /**
         * True if the detected browser is Safari 5.0.x.
         * @type Boolean
         */
        isSafari5_0 : isSafari5_0,


        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,

        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,

        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,

        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,

        /**
         * True if the detected browser is Internet Explorer 7.x or lower.
         * @type Boolean
         */
        isIE7m : isIE6 || isIE7,

        /**
         * True if the detected browser is Internet Explorer 7.x or higher.
         * @type Boolean
         */
        isIE7p : isIE && !isIE6,

        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,

        /**
         * True if the detected browser is Internet Explorer 8.x or lower.
         * @type Boolean
         */
        isIE8m : isIE6 || isIE7 || isIE8,

        /**
         * True if the detected browser is Internet Explorer 8.x or higher.
         * @type Boolean
         */
        isIE8p : isIE && !(isIE6 || isIE7),

        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,

        /**
         * True if the detected browser is Internet Explorer 9.x or lower.
         * @type Boolean
         */
        isIE9m : isIE6 || isIE7 || isIE8 || isIE9,

        /**
         * True if the detected browser is Internet Explorer 9.x or higher.
         * @type Boolean
         */
        isIE9p : isIE && !(isIE6 || isIE7 || isIE8),
        
        /**  
         * True if the detected browser is Internet Explorer 10.x.
         * @type Boolean
         */
        isIE10 : isIE10, 
 
        /**
         * True if the detected browser is Internet Explorer 10.x or lower.
         * @type Boolean
         */
        isIE10m : isIE6 || isIE7 || isIE8 || isIE9 || isIE10,
 
        /**
         * True if the detected browser is Internet Explorer 10.x or higher.
         * @type Boolean
         */
        isIE10p : isIE && !(isIE6 || isIE7 || isIE8 || isIE9),

        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,

        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * True if the detected browser uses a Gecko 2.0+ layout engine (e.g. Firefox 4.x).
         * @type Boolean
         */
        isGecko4 : isGecko4,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko5 : isGecko5,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko10 : isGecko10,

        /**
         * True if the detected browser uses FireFox 3.0
         * @type Boolean
         */
        isFF3_0 : isFF3_0,

        /**
         * True if the detected browser uses FireFox 3.5
         * @type Boolean
         */
        isFF3_5 : isFF3_5,

        /**
         * True if the detected browser uses FireFox 3.6
         * @type Boolean
         */
        isFF3_6 : isFF3_6,

        /**
         * True if the detected browser uses FireFox 4
         * @type Boolean
         */
        isFF4 : 4 <= firefoxVersion && firefoxVersion < 5,

        /**
         * True if the detected browser uses FireFox 5
         * @type Boolean
         */
        isFF5 : 5 <= firefoxVersion && firefoxVersion < 6,

        /**
         * True if the detected browser uses FireFox 10
         * @type Boolean
         */
        isFF10 : 10 <= firefoxVersion && firefoxVersion < 11,

        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,

        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,

        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,

        /**
         * The current version of Chrome (0 if the browser is not Chrome).
         * @type Number
         */
        chromeVersion: chromeVersion,

        /**
         * The current version of Firefox (0 if the browser is not Firefox).
         * @type Number
         */
        firefoxVersion: firefoxVersion,

        /**
         * The current version of IE (0 if the browser is not IE). This does not account
         * for the documentMode of the current page, which is factored into {@link #isIE7},
         * {@link #isIE8} and {@link #isIE9}. Thus this is not always true:
         *
         *     Ext.isIE8 == (Ext.ieVersion == 8)
         *
         * @type Number
         */
        ieVersion: ieVersion,

        /**
         * The current version of Opera (0 if the browser is not Opera).
         * @type Number
         */
        operaVersion: operaVersion,

        /**
         * The current version of Safari (0 if the browser is not Safari).
         * @type Number
         */
        safariVersion: safariVersion,

        /**
         * The current version of WebKit (0 if the browser does not use WebKit).
         * @type Number
         */
        webKitVersion: webKitVersion,

        /**
         * True if the page is running over SSL
         * @type Boolean
         */
        isSecure: isSecure,

        /**
         * URL to a 1x1 transparent gif image used by Ext to create inline icons with
         * CSS background images. In older versions of IE, this defaults to
         * "http://sencha.com/s.gif" and you should change this to a URL on your server.
         * For other browsers it uses an inline data URL.
         * @type String
         */
        BLANK_IMAGE_URL : (isIE6 || isIE7) ? '/' + '/www.sencha.com/s.gif' : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

        /**
         * Utility method for returning a default value if the passed value is empty.
         *
         * The value is deemed to be empty if it is:
         *
         * - null
         * - undefined
         * - an empty array
         * - a zero length string (Unless the `allowBlank` parameter is `true`)
         *
         * @param {Object} value The value to test
         * @param {Object} defaultValue The value to return if the original value is empty
         * @param {Boolean} [allowBlank=false] true to allow zero length strings to qualify as non-empty.
         * @return {Object} value, if non-empty, else defaultValue
         * @deprecated 4.0.0 Use {@link Ext#valueFrom} instead
         */
        value : function(v, defaultValue, allowBlank){
            return Ext.isEmpty(v, allowBlank) ? defaultValue : v;
        },

        /**
         * Escapes the passed string for use in a regular expression.
         * @param {String} str
         * @return {String}
         * @deprecated 4.0.0 Use {@link Ext.String#escapeRegex} instead
         */
        escapeRe : function(s) {
            return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        },

        /**
         * Applies event listeners to elements by selectors when the document is ready.
         * The event name is specified with an `@` suffix.
         *
         *     Ext.addBehaviors({
         *         // add a listener for click on all anchors in element with id foo
         *         '#foo a@click' : function(e, t){
         *             // do something
         *         },
         *
         *         // add the same listener to multiple selectors (separated by comma BEFORE the @)
         *         '#foo a, #bar span.some-class@mouseover' : function(){
         *             // do something
         *         }
         *     });
         *
         * @param {Object} obj The list of behaviors to apply
         */
        addBehaviors : function(o){
            if(!Ext.isReady){
                Ext.onReady(function(){
                    Ext.addBehaviors(o);
                });
            } else {
                var cache = {}, // simple cache for applying multiple behaviors to same selector does query multiple times
                    parts,
                    b,
                    s;
                for (b in o) {
                    if ((parts = b.split('@'))[1]) { // for Object prototype breakers
                        s = parts[0];
                        if(!cache[s]){
                            cache[s] = Ext.select(s);
                        }
                        cache[s].on(parts[1], o[b]);
                    }
                }
                cache = null;
            }
        },

        /**
         * Returns the size of the browser scrollbars. This can differ depending on
         * operating system settings, such as the theme or font size.
         * @param {Boolean} [force] true to force a recalculation of the value.
         * @return {Object} An object containing scrollbar sizes.
         * @return {Number} return.width The width of the vertical scrollbar.
         * @return {Number} return.height The height of the horizontal scrollbar.
         */
        getScrollbarSize: function (force) {
            if (!Ext.isReady) {
                return {};
            }

            if (force || !scrollbarSize) {
                var db = document.body,
                    div = document.createElement('div');

                div.style.width = div.style.height = '100px';
                div.style.overflow = 'scroll';
                div.style.position = 'absolute';

                db.appendChild(div); // now we can measure the div...

                // at least in iE9 the div is not 100px - the scrollbar size is removed!
                scrollbarSize = {
                    width: div.offsetWidth - div.clientWidth,
                    height: div.offsetHeight - div.clientHeight
                };

                db.removeChild(div);
            }

            return scrollbarSize;
        },

        /**
         * Utility method for getting the width of the browser's vertical scrollbar. This
         * can differ depending on operating system settings, such as the theme or font size.
         *
         * This method is deprected in favor of {@link #getScrollbarSize}.
         *
         * @param {Boolean} [force] true to force a recalculation of the value.
         * @return {Number} The width of a vertical scrollbar.
         * @deprecated
         */
        getScrollBarWidth: function(force){
            var size = Ext.getScrollbarSize(force);
            return size.width + 2; // legacy fudge factor
        },

        /**
         * Copies a set of named properties fom the source object to the destination object.
         *
         * Example:
         *
         *     ImageComponent = Ext.extend(Ext.Component, {
         *         initComponent: function() {
         *             this.autoEl = { tag: 'img' };
         *             MyComponent.superclass.initComponent.apply(this, arguments);
         *             this.initialBox = Ext.copyTo({}, this.initialConfig, 'x,y,width,height');
         *         }
         *     });
         *
         * Important note: To borrow class prototype methods, use {@link Ext.Base#borrow} instead.
         *
         * @param {Object} dest The destination object.
         * @param {Object} source The source object.
         * @param {String/String[]} names Either an Array of property names, or a comma-delimited list
         * of property names to copy.
         * @param {Boolean} [usePrototypeKeys] Defaults to false. Pass true to copy keys off of the
         * prototype as well as the instance.
         * @return {Object} The modified object.
         */
        copyTo : function(dest, source, names, usePrototypeKeys){
            if(typeof names == 'string'){
                names = names.split(/[,;\s]/);
            }

            var n,
                nLen = names? names.length : 0,
                name;

            for(n = 0; n < nLen; n++) {
                name = names[n];

                if(usePrototypeKeys || source.hasOwnProperty(name)){
                    dest[name] = source[name];
                }
            }

            return dest;
        },

        /**
         * Attempts to destroy and then remove a set of named properties of the passed object.
         * @param {Object} o The object (most likely a Component) who's properties you wish to destroy.
         * @param {String...} args One or more names of the properties to destroy and remove from the object.
         */
        destroyMembers : function(o){
            for (var i = 1, a = arguments, len = a.length; i < len; i++) {
                Ext.destroy(o[a[i]]);
                delete o[a[i]];
            }
        },

        /**
         * Logs a message. If a console is present it will be used. On Opera, the method
         * "opera.postError" is called. In other cases, the message is logged to an array
         * "Ext.log.out". An attached debugger can watch this array and view the log. The
         * log buffer is limited to a maximum of "Ext.log.max" entries (defaults to 250).
         * The `Ext.log.out` array can also be written to a popup window by entering the
         * following in the URL bar (a "bookmarklet"):
         *
         *     javascript:void(Ext.log.show());
         *
         * If additional parameters are passed, they are joined and appended to the message.
         * A technique for tracing entry and exit of a function is this:
         *
         *     function foo () {
         *         Ext.log({ indent: 1 }, '>> foo');
         *
         *         // log statements in here or methods called from here will be indented
         *         // by one step
         *
         *         Ext.log({ outdent: 1 }, '<< foo');
         *     }
         *
         * This method does nothing in a release build.
         *
         * @param {String/Object} [options] The message to log or an options object with any
         * of the following properties:
         *
         *  - `msg`: The message to log (required).
         *  - `level`: One of: "error", "warn", "info" or "log" (the default is "log").
         *  - `dump`: An object to dump to the log as part of the message.
         *  - `stack`: True to include a stack trace in the log.
         *  - `indent`: Cause subsequent log statements to be indented one step.
         *  - `outdent`: Cause this and following statements to be one step less indented.
         *
         * @param {String...} [message] The message to log (required unless specified in
         * options object).
         *
         * @method
         */
        log :
            log ||
            nullLog,

        /**
         * Partitions the set into two sets: a true set and a false set.
         *
         * Example 1:
         *
         *     Ext.partition([true, false, true, true, false]);
         *     // returns [[true, true, true], [false, false]]
         *
         * Example 2:
         *
         *     Ext.partition(
         *         Ext.query("p"),
         *         function(val){
         *             return val.className == "class1"
         *         }
         *     );
         *     // true are those paragraph elements with a className of "class1",
         *     // false set are those that do not have that className.
         *
         * @param {Array/NodeList} arr The array to partition
         * @param {Function} truth (optional) a function to determine truth.
         * If this is omitted the element itself must be able to be evaluated for its truthfulness.
         * @return {Array} [array of truish values, array of falsy values]
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        partition : function(arr, truth){
            var ret = [[],[]],
                a, v,
                aLen = arr.length;

            for (a = 0; a < aLen; a++) {
                v = arr[a];
                ret[ (truth && truth(v, a, arr)) || (!truth && v) ? 0 : 1].push(v);
            }

            return ret;
        },

        /**
         * Invokes a method on each item in an Array.
         *
         * Example:
         *
         *     Ext.invoke(Ext.query("p"), "getAttribute", "id");
         *     // [el1.getAttribute("id"), el2.getAttribute("id"), ..., elN.getAttribute("id")]
         *
         * @param {Array/NodeList} arr The Array of items to invoke the method on.
         * @param {String} methodName The method name to invoke.
         * @param {Object...} args Arguments to send into the method invocation.
         * @return {Array} The results of invoking the method on each item in the array.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        invoke : function(arr, methodName){
            var ret  = [],
                args = Array.prototype.slice.call(arguments, 2),
                a, v,
                aLen = arr.length;

            for (a = 0; a < aLen; a++) {
                v = arr[a];

                if (v && typeof v[methodName] == 'function') {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            }

            return ret;
        },

        /**
         * Zips N sets together.
         *
         * Example 1:
         *
         *     Ext.zip([1,2,3],[4,5,6]); // [[1,4],[2,5],[3,6]]
         *
         * Example 2:
         *
         *     Ext.zip(
         *         [ "+", "-", "+"],
         *         [  12,  10,  22],
         *         [  43,  15,  96],
         *         function(a, b, c){
         *             return "$" + a + "" + b + "." + c
         *         }
         *     ); // ["$+12.43", "$-10.15", "$+22.96"]
         *
         * @param {Array/NodeList...} arr This argument may be repeated. Array(s)
         * to contribute values.
         * @param {Function} zipper (optional) The last item in the argument list.
         * This will drive how the items are zipped together.
         * @return {Array} The zipped set.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        zip : function(){
            var parts = Ext.partition(arguments, function( val ){ return typeof val != 'function'; }),
                arrs = parts[0],
                fn = parts[1][0],
                len = Ext.max(Ext.pluck(arrs, "length")),
                ret = [],
                i,
                j,
                aLen;

            for (i = 0; i < len; i++) {
                ret[i] = [];
                if(fn){
                    ret[i] = fn.apply(fn, Ext.pluck(arrs, i));
                }else{
                    for (j = 0, aLen = arrs.length; j < aLen; j++){
                        ret[i].push( arrs[j][i] );
                    }
                }
            }
            return ret;
        },

        /**
         * Turns an array into a sentence, joined by a specified connector - e.g.:
         *
         *     Ext.toSentence(['Adama', 'Tigh', 'Roslin']); //'Adama, Tigh and Roslin'
         *     Ext.toSentence(['Adama', 'Tigh', 'Roslin'], 'or'); //'Adama, Tigh or Roslin'
         *
         * @param {String[]} items The array to create a sentence from
         * @param {String} connector The string to use to connect the last two words.
         * Usually 'and' or 'or' - defaults to 'and'.
         * @return {String} The sentence string
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        toSentence: function(items, connector) {
            var length = items.length,
                head,
                tail;

            if (length <= 1) {
                return items[0];
            } else {
                head = items.slice(0, length - 1);
                tail = items[length - 1];

                return Ext.util.Format.format("{0} {1} {2}", head.join(", "), connector || 'and', tail);
            }
        },

        /**
         * Sets the default font-family to use for components that support a `glyph` config.
         * @param {String} fontFamily The name of the font-family
         */
        setGlyphFontFamily: function(fontFamily) {
            Ext._glyphFontFamily = fontFamily;
        },

        /**
         * @property {Boolean} useShims
         * By default, Ext intelligently decides whether floating elements should be shimmed.
         * If you are using flash, you may want to set this to true.
         */
        useShims: isIE6
    });
}());

/**
 * Loads Ext.app.Application class and starts it up with given configuration after the
 * page is ready.
 *
 * See `Ext.app.Application` for details.
 *
 * @param {Object/String} config Application config object or name of a class derived from Ext.app.Application.
 */
Ext.application = function(config) {
    var App, paths, ns;
    
    if (typeof config === "string") {
        Ext.require(config, function(){
            App = Ext.ClassManager.get(config);
        });
    }
    else {
        // We have to process `paths` before creating Application class,
        // or `requires` won't work.
        Ext.Loader.setPath(config.name, config.appFolder || 'app');
        
        if (paths = config.paths) {
            for (ns in paths) {
                if (paths.hasOwnProperty(ns)) {
                    Ext.Loader.setPath(ns, paths[ns]);
                }
            }
        }
        
        config['paths processed'] = true;
        
        // Let Ext.define do the hard work but don't assign a class name.
        //
        Ext.define(config.name + ".$application", Ext.apply({
                extend: 'Ext.app.Application' // can be replaced by config!
            }, config),
            // call here when the App class gets full defined
            function () {
                App = this;
            });
    }

    Ext.onReady(function() {
        // this won't be called until App has been created and its requires have been
        // met...
        Ext.app.Application.instance = new App();
    });
};

// @tag extras,core
// @require ../Ext-more.js
// @define Ext.util.Format

/**
 * @class Ext.util.Format
 *  
 * This class is a centralized place for formatting functions. It includes
 * functions to format various different types of data, such as text, dates and numeric values.
 *  
 * ## Localization
 *
 * This class contains several options for localization. These can be set once the library has loaded,
 * all calls to the functions from that point will use the locale settings that were specified.
 *
 * Options include:
 *
 * - thousandSeparator
 * - decimalSeparator
 * - currenyPrecision
 * - currencySign
 * - currencyAtEnd
 *
 * This class also uses the default date format defined here: {@link Ext.Date#defaultFormat}.
 *
 * ## Using with renderers
 *
 * There are two helper functions that return a new function that can be used in conjunction with
 * grid renderers:
 *  
 *     columns: [{
 *         dataIndex: 'date',
 *         renderer: Ext.util.Format.dateRenderer('Y-m-d')
 *     }, {
 *         dataIndex: 'time',
 *         renderer: Ext.util.Format.numberRenderer('0.000')
 *     }]
 *  
 * Functions that only take a single argument can also be passed directly:
 *
 *     columns: [{
 *         dataIndex: 'cost',
 *         renderer: Ext.util.Format.usMoney
 *     }, {
 *         dataIndex: 'productCode',
 *         renderer: Ext.util.Format.uppercase
 *     }]
 *  
 * ## Using with XTemplates
 *
 * XTemplates can also directly use Ext.util.Format functions:
 *  
 *     new Ext.XTemplate([
 *         'Date: {startDate:date("Y-m-d")}',
 *         'Cost: {cost:usMoney}'
 *     ]);
 *
 * @singleton
 */
(function() {
    Ext.ns('Ext.util');

    var UtilFormat     = Ext.util.Format = {},
        stripTagsRE    = /<\/?[^>]+>/gi,
        stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe        = /\r?\n/g,
        allHashes      = /^#+$/,

        // Match a format string characters to be able to detect remaining "literal" characters
        formatPattern = /[\d,\.#]+/,

        // A RegExp to remove from a number format string, all characters except digits and '.'
        formatCleanRe  = /[^\d\.#]/g,

        // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
        // Created on first use. The local decimal separator character must be initialized for this to be created.
        I18NFormatCleanRe,

        // Cache ofg number formatting functions keyed by format string
        formatFns = {};

    Ext.apply(UtilFormat, {
        //<locale>
        /**
         * @property {String} thousandSeparator
         * The character that the {@link #number} function uses as a thousand separator.
         *
         * This may be overridden in a locale file.
         */
        thousandSeparator: ',',
        //</locale>

        //<locale>
        /**
         * @property {String} decimalSeparator
         * The character that the {@link #number} function uses as a decimal point.
         *
         * This may be overridden in a locale file.
         */
        decimalSeparator: '.',
        //</locale>

        //<locale>
        /**
         * @property {Number} currencyPrecision
         * The number of decimal places that the {@link #currency} function displays.
         *
         * This may be overridden in a locale file.
         */
        currencyPrecision: 2,
        //</locale>

         //<locale>
        /**
         * @property {String} currencySign
         * The currency sign that the {@link #currency} function displays.
         *
         * This may be overridden in a locale file.
         */
        currencySign: '$',
        //</locale>

        //<locale>
        /**
         * @property {Boolean} currencyAtEnd
         * This may be set to <code>true</code> to make the {@link #currency} function
         * append the currency sign to the formatted value.
         *
         * This may be overridden in a locale file.
         */
        currencyAtEnd: false,
        //</locale>

        /**
         * Checks a reference and converts it to empty string if it is undefined.
         * @param {Object} value Reference to check
         * @return {Object} Empty string if converted, otherwise the original value
         */
        undef : function(value) {
            return value !== undefined ? value : "";
        },

        /**
         * Checks a reference and converts it to the default value if it's empty.
         * @param {Object} value Reference to check
         * @param {String} [defaultValue=""] The value to insert of it's undefined.
         * @return {String}
         */
        defaultValue : function(value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        /**
         * Returns a substring from within an original string.
         * @param {String} value The original text
         * @param {Number} start The start index of the substring
         * @param {Number} length The length of the substring
         * @return {String} The substring
         * @method
         */
        substr : 'ab'.substr(-1) != 'b'
        ? function (value, start, length) {
            var str = String(value);
            return (start < 0)
                ? str.substr(Math.max(str.length + start, 0), length)
                : str.substr(start, length);
        }
        : function(value, start, length) {
            return String(value).substr(start, length);
        },

        /**
         * Converts a string to all lower case letters.
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        lowercase : function(value) {
            return String(value).toLowerCase();
        },

        /**
         * Converts a string to all upper case letters.
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        uppercase : function(value) {
            return String(value).toUpperCase();
        },

        /**
         * Format a number as US currency.
         * @param {Number/String} value The numeric value to format
         * @return {String} The formatted currency string
         */
        usMoney : function(v) {
            return UtilFormat.currency(v, '$', 2);
        },

        /**
         * Format a number as a currency.
         * @param {Number/String} value The numeric value to format
         * @param {String} [sign] The currency sign to use (defaults to {@link #currencySign})
         * @param {Number} [decimals] The number of decimals to use for the currency
         * (defaults to {@link #currencyPrecision})
         * @param {Boolean} [end] True if the currency sign should be at the end of the string
         * (defaults to {@link #currencyAtEnd})
         * @return {String} The formatted currency string
         */
        currency: function(v, currencySign, decimals, end) {
            var negativeSign = '',
                format = ",0",
                i = 0;
            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }
            decimals = Ext.isDefined(decimals) ? decimals : UtilFormat.currencyPrecision;
            format += (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = UtilFormat.number(v, format);
            if ((end || UtilFormat.currencyAtEnd) === true) {
                return Ext.String.format("{0}{1}{2}", negativeSign, v, currencySign || UtilFormat.currencySign);
            } else {
                return Ext.String.format("{0}{1}{2}", negativeSign, currencySign || UtilFormat.currencySign, v);
            }
        },

        /**
         * Formats the passed date using the specified format pattern.
         * @param {String/Date} value The value to format. If a string is passed, it is converted to a Date
         * by the Javascript's built-in Date#parse method.
         * @param {String} [format] Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {String} The formatted date string.
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Ext.Date.dateFormat(v, format || Ext.Date.defaultFormat);
        },

        /**
         * Returns a date rendering function that can be reused to apply a date format multiple times efficiently.
         * @param {String} format Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {Function} The date formatting function
         */
        dateRenderer : function(format) {
            return function(v) {
                return UtilFormat.date(v, format);
            };
        },

        /**
         * Strips all HTML tags.
         * @param {Object} value The text from which to strip tags
         * @return {String} The stripped text
         */
        stripTags : function(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },

        /**
         * Strips all script tags.
         * @param {Object} value The text from which to strip script tags
         * @return {String} The stripped text
         */
        stripScripts : function(v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },

        /**
         * Simple format for a file size (xxx bytes, xxx KB, xxx MB).
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSize : (function(){
            var byteLimit = 1024,
                kbLimit = 1048576,
                mbLimit = 1073741824;
                
            return function(size) {
                var out;
                if (size < byteLimit) {
                    if (size === 1) {
                        out = '1 byte';    
                    } else {
                        out = size + ' bytes';
                    }
                } else if (size < kbLimit) {
                    out = (Math.round(((size*10) / byteLimit))/10) + ' KB';
                } else if (size < mbLimit) {
                    out = (Math.round(((size*10) / kbLimit))/10) + ' MB';
                } else {
                    out = (Math.round(((size*10) / mbLimit))/10) + ' GB';
                }
                return out;
            };
        })(),

        /**
         * It does simple math for use in a template, for example:
         *
         *     var tpl = new Ext.Template('{value} * 10 = {value:math("* 10")}');
         *
         * @return {Function} A function that operates on the passed value.
         * @method
         */
        math : (function(){
            var fns = {};

            return function(v, a){
                if (!fns[a]) {
                    fns[a] = Ext.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }()),

        /**
         * Rounds the passed number to the required decimal precision.
         * @param {Number/String} value The numeric value to round.
         * @param {Number} precision The number of decimal places to which to round the first parameter's value.
         * @return {Number} The rounded value.
         */
        round : function(value, precision) {
            var result = Number(value);
            if (typeof precision == 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            }
            return result;
        },

        /**
         * Formats the passed number according to the passed format string.
         *
         * The number of digits after the decimal separator character specifies the number of
         * decimal places in the resulting string. The *local-specific* decimal character is
         * used in the result.
         *
         * The *presence* of a thousand separator character in the format string specifies that
         * the *locale-specific* thousand separator (if any) is inserted separating thousand groups.
         *
         * By default, "," is expected as the thousand separator, and "." is expected as the decimal separator.
         *
         * ## New to Ext JS 4
         *
         * Locale-specific characters are always used in the formatted output when inserting
         * thousand and decimal separators.
         *
         * The format string must specify separator characters according to US/UK conventions ("," as the
         * thousand separator, and "." as the decimal separator)
         *
         * To allow specification of format strings according to local conventions for separator characters, add
         * the string `/i` to the end of the format string.
         *
         * examples (123456.789):
         * 
         * - `0` - (123456) show only digits, no precision
         * - `0.00` - (123456.78) show only digits, 2 precision
         * - `0.0000` - (123456.7890) show only digits, 4 precision
         * - `0,000` - (123,456) show comma and digits, no precision
         * - `0,000.00` - (123,456.78) show comma and digits, 2 precision
         * - `0,0.00` - (123,456.78) shortcut method, show comma and digits, 2 precision
         * - `0.####` - (123,456,789) Allow maximum 4 decimal places, but do not right pad with zeroes
         *
         * @param {Number} v The number to format.
         * @param {String} format The way you would like to format this text.
         * @return {String} The formatted number.
         */
        number : function(v, formatString) {
            if (!formatString) {
                return v;
            }
            var formatFn = formatFns[formatString];

            // Generate formatting function to be cached and reused keyed by the format string.
            // This results in a 100% performance increase over analyzing the format string each invocation.
            if (!formatFn) {

                var originalFormatString = formatString,
                    comma = UtilFormat.thousandSeparator,
                    decimalSeparator = UtilFormat.decimalSeparator,
                    hasComma,
                    splitFormat,
                    extraChars,
                    precision = 0,
                    multiplier,
                    trimTrailingZeroes,
                    code;

                // The "/i" suffix allows caller to use a locale-specific formatting string.
                // Clean the format string by removing all but numerals and the decimal separator.
                // Then split the format string into pre and post decimal segments according to *what* the
                // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
                if (formatString.substr(formatString.length - 2) == '/i') {
                    if (!I18NFormatCleanRe) {
                        I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']','g');
                    }
                    formatString = formatString.substr(0, formatString.length - 2);
                    hasComma = formatString.indexOf(comma) != -1;
                    splitFormat = formatString.replace(I18NFormatCleanRe, '').split(decimalSeparator);
                } else {
                    hasComma = formatString.indexOf(',') != -1;
                    splitFormat = formatString.replace(formatCleanRe, '').split('.');
                }
                extraChars = formatString.replace(formatPattern, '');

                if (splitFormat.length > 2) {
                    Ext.Error.raise({
                        sourceClass: "Ext.util.Format",
                        sourceMethod: "number",
                        value: v,
                        formatString: formatString,
                        msg: "Invalid number format, should have no more than 1 decimal"
                    });
                } else if (splitFormat.length === 2) {
                    precision = splitFormat[1].length;

                    // Formatting ending in .##### means maximum 5 trailing significant digits
                    trimTrailingZeroes = allHashes.test(splitFormat[1]);
                }
                
                // The function we create is called immediately and returns a closure which has access to vars and some fixed values; RegExes and the format string.
                code = [
                    'var utilFormat=Ext.util.Format,extNumber=Ext.Number,neg,fnum,parts' +
                        (hasComma ? ',thousandSeparator,thousands=[],j,n,i' : '') +
                        (extraChars  ? ',formatString="' + formatString + '",formatPattern=/[\\d,\\.#]+/' : '') +
                        (trimTrailingZeroes ? ',trailingZeroes=/\\.?0+$/;' : ';') +
                    'return function(v){' +
                    'if(typeof v!=="number"&&isNaN(v=extNumber.from(v,NaN)))return"";' +
                    'neg=v<0;',
                    'fnum=Ext.Number.toFixed(Math.abs(v), ' + precision + ');'
                ];

                if (hasComma) {
                    // If we have to insert commas...
                    
                    // split the string up into whole and decimal parts if there are decimals
                    if (precision) {
                        code[code.length] = 'parts=fnum.split(".");';
                        code[code.length] = 'fnum=parts[0];';
                    }
                    code[code.length] =
                        'if(v>=1000) {';
                            code[code.length] = 'thousandSeparator=utilFormat.thousandSeparator;' +
                            'thousands.length=0;' +
                            'j=fnum.length;' +
                            'n=fnum.length%3||3;' +
                            'for(i=0;i<j;i+=n){' +
                                'if(i!==0){' +
                                    'n=3;' +
                                '}' +
                                'thousands[thousands.length]=fnum.substr(i,n);' +
                            '}' +
                            'fnum=thousands.join(thousandSeparator);' + 
                        '}';
                    if (precision) {
                        code[code.length] = 'fnum += utilFormat.decimalSeparator+parts[1];';
                    }
                    
                } else if (precision) {
                    // If they are using a weird decimal separator, split and concat using it
                    code[code.length] = 'if(utilFormat.decimalSeparator!=="."){' +
                        'parts=fnum.split(".");' +
                        'fnum=parts[0]+utilFormat.decimalSeparator+parts[1];' +
                    '}';
                }

                if (trimTrailingZeroes) {
                    code[code.length] = 'fnum=fnum.replace(trailingZeroes,"");';
                }

                /*
                 * Edge case. If we have a very small negative number it will get rounded to 0,
                 * however the initial check at the top will still report as negative. Replace
                 * everything but 1-9 and check if the string is empty to determine a 0 value.
                 */
                code[code.length] = 'if(neg&&fnum!=="' + (precision ? '0.' + Ext.String.repeat('0', precision) : '0') + '")fnum="-"+fnum;';

                code[code.length] = 'return ';

                // If there were extra characters around the formatting string, replace the format string part with the formatted number.
                if (extraChars) {
                    code[code.length] = 'formatString.replace(formatPattern, fnum);';
                } else {
                    code[code.length] = 'fnum;';
                }
                code[code.length] = '};'

                formatFn = formatFns[originalFormatString] = Ext.functionFactory('Ext', code.join(''))(Ext);
            }
            return formatFn(v);
        },

        /**
         * Returns a number rendering function that can be reused to apply a number format multiple
         * times efficiently.
         *
         * @param {String} format Any valid number format string for {@link #number}
         * @return {Function} The number formatting function
         */
        numberRenderer : function(format) {
            return function(v) {
                return UtilFormat.number(v, format);
            };
        },

        /**
         * Formats an object of name value properties as HTML element attribute values suitable for using when creating textual markup.
         * @param {Object} attributes An object containing the HTML attributes as properties eg: `{height:40, vAlign:'top'}`
         */
        attributes: function(attributes) {
            if (typeof attributes === 'object') {
                var result = [],
                    name;

                for (name in attributes) {
                    result.push(name, '="', name === 'style' ? Ext.DomHelper.generateStyles(attributes[name]) : Ext.htmlEncode(attributes[name]), '"');
                }
                attributes = result.join('');
            }
            return attributes||'';
        },

        /**
         * Selectively do a plural form of a word based on a numeric value. For example, in a template,
         * `{commentCount:plural("Comment")}`  would result in `"1 Comment"` if commentCount was 1 or
         * would be `"x Comments"` if the value is 0 or greater than 1.
         *
         * @param {Number} value The value to compare against
         * @param {String} singular The singular form of the word
         * @param {String} [plural] The plural form of the word (defaults to the singular with an "s")
         */
        plural : function(v, s, p) {
            return v +' ' + (v == 1 ? s : (p ? p : s+'s'));
        },

        /**
         * Converts newline characters to the HTML tag `<br/>`
         *
         * @param {String} v The string value to format.
         * @return {String} The string with embedded `<br/>` tags in place of newlines.
         */
        nl2br : function(v) {
            return Ext.isEmpty(v) ? '' : v.replace(nl2brRe, '<br/>');
        },

        /**
         * Alias for {@link Ext.String#capitalize}.
         * @method
         * @inheritdoc Ext.String#capitalize
         */
        capitalize: Ext.String.capitalize,

        /**
         * Alias for {@link Ext.String#ellipsis}.
         * @method
         * @inheritdoc Ext.String#ellipsis
         */
        ellipsis: Ext.String.ellipsis,

        /**
         * Alias for {@link Ext.String#format}.
         * @method
         * @inheritdoc Ext.String#format
         */
        format: Ext.String.format,

        /**
         * Alias for {@link Ext.String#htmlDecode}.
         * @method
         * @inheritdoc Ext.String#htmlDecode
         */
        htmlDecode: Ext.String.htmlDecode,

        /**
         * Alias for {@link Ext.String#htmlEncode}.
         * @method
         * @inheritdoc Ext.String#htmlEncode
         */
        htmlEncode: Ext.String.htmlEncode,

        /**
         * Alias for {@link Ext.String#leftPad}.
         * @method
         * @inheritdoc Ext.String#leftPad
         */
        leftPad: Ext.String.leftPad,

        /**
         * Alias for {@link Ext.String#trim}.
         * @method
         * @inheritdoc Ext.String#trim
         */
        trim : Ext.String.trim,

        /**
         * Parses a number or string representing margin sizes into an object.
         * Supports CSS-style margin declarations (e.g. 10, "10", "10 10", "10 10 10" and
         * "10 10 10 10" are all valid options and would return the same result).
         *
         * @param {Number/String} v The encoded margins
         * @return {Object} An object with margin sizes for top, right, bottom and left
         */
        parseBox : function(box) {
            box = box || 0;

            if (typeof box === 'number') {
                return {
                    top   : box,
                    right : box,
                    bottom: box,
                    left  : box
                };
             }

            var parts  = box.split(' '),
                ln = parts.length;

            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            }
            else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            }
            else if (ln == 3) {
                parts[3] = parts[1];
            }

            return {
                top   :parseInt(parts[0], 10) || 0,
                right :parseInt(parts[1], 10) || 0,
                bottom:parseInt(parts[2], 10) || 0,
                left  :parseInt(parts[3], 10) || 0
            };
        },

        /**
         * Escapes the passed string for use in a regular expression.
         * @param {String} str
         * @return {String}
         */
        escapeRegex : function(s) {
            return s.replace(/([\-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        }
    });
}());

// @tag extras,core
// @require Format.js

/**
 * Provides the ability to execute one or more arbitrary tasks in a asynchronous manner.
 * Generally, you can use the singleton {@link Ext.TaskManager} instead, but if needed,
 * you can create separate instances of TaskRunner. Any number of separate tasks can be
 * started at any time and will run independently of each other.
 * 
 * Example usage:
 *
 *      // Start a simple clock task that updates a div once per second
 *      var updateClock = function () {
 *          Ext.fly('clock').update(new Date().format('g:i:s A'));
 *      }
 *
 *      var runner = new Ext.util.TaskRunner();
 *      var task = runner.start({
 *          run: updateClock,
 *          interval: 1000
 *      }
 *
 * The equivalent using TaskManager:
 *
 *      var task = Ext.TaskManager.start({
 *          run: updateClock,
 *          interval: 1000
 *      });
 *
 * To end a running task:
 * 
 *      task.destroy();
 *
 * If a task needs to be started and stopped repeated over time, you can create a
 * {@link Ext.util.TaskRunner.Task Task} instance.
 *
 *      var task = runner.newTask({
 *          run: function () {
 *              // useful code
 *          },
 *          interval: 1000
 *      });
 *      
 *      task.start();
 *      
 *      // ...
 *      
 *      task.stop();
 *      
 *      // ...
 *      
 *      task.start();
 *
 * A re-usable, one-shot task can be managed similar to the above:
 *
 *      var task = runner.newTask({
 *          run: function () {
 *              // useful code to run once
 *          },
 *          repeat: 1
 *      });
 *      
 *      task.start();
 *      
 *      // ...
 *      
 *      task.start();
 *
 * See the {@link #start} method for details about how to configure a task object.
 *
 * Also see {@link Ext.util.DelayedTask}. 
 * 
 * @constructor
 * @param {Number/Object} [interval=10] The minimum precision in milliseconds supported by this
 * TaskRunner instance. Alternatively, a config object to apply to the new instance.
 */
Ext.define('Ext.util.TaskRunner', {
    /**
     * @cfg {Boolean} [fireIdleEvent=true]
     * This may be configured `false` to inhibit firing of the {@link Ext.EventManager#idleEvent idle event} after task invocation.
     */

    /**
     * @cfg interval
     * The timer resolution.
     */
    interval: 10,

    /**
     * @property timerId
     * The id of the current timer.
     * @private
     */
    timerId: null,

    constructor: function (interval) {
        var me = this;

        if (typeof interval == 'number') {
            me.interval = interval;
        } else if (interval) {
            Ext.apply(me, interval);
        }

        me.tasks = [];
        me.timerFn = Ext.Function.bind(me.onTick, me);
    },

    /**
     * Creates a new {@link Ext.util.TaskRunner.Task Task} instance. These instances can
     * be easily started and stopped.
     * @param {Object} config The config object. For details on the supported properties,
     * see {@link #start}.
     */
    newTask: function (config) {
        var task = new Ext.util.TaskRunner.Task(config);
        task.manager = this;
        return task;
    },

    /**
     * Starts a new task.
     *
     * Before each invocation, Ext injects the property `taskRunCount` into the task object
     * so that calculations based on the repeat count can be performed.
     * 
     * The returned task will contain a `destroy` method that can be used to destroy the
     * task and cancel further calls. This is equivalent to the {@link #stop} method.
     *
     * @param {Object} task A config object that supports the following properties:
     * @param {Function} task.run The function to execute each time the task is invoked. The
     * function will be called at each interval and passed the `args` argument if specified,
     * and the current invocation count if not.
     * 
     * If a particular scope (`this` reference) is required, be sure to specify it using
     * the `scope` argument.
     * 
     * @param {Function} task.onError The function to execute in case of unhandled
     * error on task.run.
     *
     * @param {Boolean} task.run.return `false` from this function to terminate the task.
     *
     * @param {Number} task.interval The frequency in milliseconds with which the task
     * should be invoked.
     *
     * @param {Object[]} task.args An array of arguments to be passed to the function
     * specified by `run`. If not specified, the current invocation count is passed.
     *
     * @param {Object} task.scope The scope (`this` reference) in which to execute the
     * `run` function. Defaults to the task config object.
     *
     * @param {Number} task.duration The length of time in milliseconds to invoke the task
     * before stopping automatically (defaults to indefinite).
     *
     * @param {Number} task.repeat The number of times to invoke the task before stopping
     * automatically (defaults to indefinite).
     * @return {Object} The task
     */
    start: function(task) {
        var me = this,
            now = Ext.Date.now();

        if (!task.pending) {
            me.tasks.push(task);
            task.pending = true; // don't allow the task to be added to me.tasks again
        }

        task.stopped = false; // might have been previously stopped...
        task.taskStartTime = now;
        task.taskRunTime = task.fireOnStart !== false ? 0 : task.taskStartTime;
        task.taskRunCount = 0;

        if (!me.firing) {
            if (task.fireOnStart !== false) {
                me.startTimer(0, now);
            } else {
                me.startTimer(task.interval, now);
            }
        }

        return task;
    },

    /**
     * Stops an existing running task.
     * @param {Object} task The task to stop
     * @return {Object} The task
     */
    stop: function(task) {
        // NOTE: we don't attempt to remove the task from me.tasks at this point because
        // this could be called from inside a task which would then corrupt the state of
        // the loop in onTick
        if (!task.stopped) {
            task.stopped = true;

            if (task.onStop) {
                task.onStop.call(task.scope || task, task);
            }
        }

        return task;
    },

    /**
     * Stops all tasks that are currently running.
     */
    stopAll: function() {
        // onTick will take care of cleaning up the mess after this point...
        Ext.each(this.tasks, this.stop, this);
    },

    //-------------------------------------------------------------------------

    firing: false,

    nextExpires: 1e99,

    // private
    onTick: function () {
        var me = this,
            tasks = me.tasks,
            now = Ext.Date.now(),
            nextExpires = 1e99,
            len = tasks.length,
            expires, newTasks, i, task, rt, remove;

        me.timerId = null;
        me.firing = true; // ensure we don't startTimer during this loop...

        // tasks.length can be > len if start is called during a task.run call... so we
        // first check len to avoid tasks.length reference but eventually we need to also
        // check tasks.length. we avoid repeating use of tasks.length by setting len at
        // that time (to help the next loop)
        for (i = 0; i < len || i < (len = tasks.length); ++i) {
            task = tasks[i];

            if (!(remove = task.stopped)) {
                expires = task.taskRunTime + task.interval;

                if (expires <= now) {
                    rt = 1; // otherwise we have a stale "rt"
                    try {
                        rt = task.run.apply(task.scope || task, task.args || [++task.taskRunCount]);
                    } catch (taskError) {
                        try {
                            Ext.log({
                                msg: taskError,
                                level: 'error'
                            });
                            if (task.onError) {
                                rt = task.onError.call(task.scope || task, task, taskError);
                            }
                        } catch (ignore) { }
                        }
                    task.taskRunTime = now;
                    if (rt === false || task.taskRunCount === task.repeat) {
                        me.stop(task);
                        remove = true;
                    } else {
                        remove = task.stopped; // in case stop was called by run
                        expires = now + task.interval;
                    }
                }

                if (!remove && task.duration && task.duration <= (now - task.taskStartTime)) {
                    me.stop(task);
                    remove = true;
                }
            }

            if (remove) {
                task.pending = false; // allow the task to be added to me.tasks again

                // once we detect that a task needs to be removed, we copy the tasks that
                // will carry forward into newTasks... this way we avoid O(N*N) to remove
                // each task from the tasks array (and ripple the array down) and also the
                // potentially wasted effort of making a new tasks[] even if all tasks are
                // going into the next wave.
                if (!newTasks) {
                    newTasks = tasks.slice(0, i);
                    // we don't set me.tasks here because callbacks can also start tasks,
                    // which get added to me.tasks... so we will visit them in this loop
                    // and account for their expirations in nextExpires...
                }
            } else {
                if (newTasks) {
                    newTasks.push(task); // we've cloned the tasks[], so keep this one...
                }

                if (nextExpires > expires) {
                    nextExpires = expires; // track the nearest expiration time
                }
            }
        }

        if (newTasks) {
            // only now can we copy the newTasks to me.tasks since no user callbacks can
            // take place
            me.tasks = newTasks;
        }

        me.firing = false; // we're done, so allow startTimer afterwards

        if (me.tasks.length) {
            // we create a new Date here because all the callbacks could have taken a long
            // time... we want to base the next timeout on the current time (after the
            // callback storm):
            me.startTimer(nextExpires - now, Ext.Date.now());
        }
        
        // After a tick
        if (me.fireIdleEvent !== false) {
            Ext.EventManager.idleEvent.fire();
        }
   },

    // private
    startTimer: function (timeout, now) {
        var me = this,
            expires = now + timeout,
            timerId = me.timerId;

        // Check to see if this request is enough in advance of the current timer. If so,
        // we reschedule the timer based on this new expiration.
        if (timerId && me.nextExpires - expires > me.interval) {
            clearTimeout(timerId);
            timerId = null;
        }

        if (!timerId) {
            if (timeout < me.interval) {
                timeout = me.interval;
            }

            me.timerId = setTimeout(me.timerFn, timeout);
            me.nextExpires = expires;
        }
    }
},
function () {
    var me = this,
        proto = me.prototype;

    /**
     * Destroys this instance, stopping all tasks that are currently running.
     * @method destroy
     */
    proto.destroy = proto.stopAll;

    // Documented in TaskManager.js
    Ext.util.TaskManager = Ext.TaskManager = new me();

    /**
     * Instances of this class are created by {@link Ext.util.TaskRunner#newTask} method.
     * 
     * For details on config properties, see {@link Ext.util.TaskRunner#start}.
     * @class Ext.util.TaskRunner.Task
     */
    me.Task = new Ext.Class({
        isTask: true,

        /**
         * This flag is set to `true` by {@link #stop}.
         * @private
         */
        stopped: true, // this avoids the odd combination of !stopped && !pending

        /**
         * Override default behavior
         */
        fireOnStart: false,

        constructor: function (config) {
            Ext.apply(this, config);
        },

        /**
         * Restarts this task, clearing it duration, expiration and run count.
         * @param {Number} [interval] Optionally reset this task's interval.
         */
        restart: function (interval) {
            if (interval !== undefined) {
                this.interval = interval;
            }

            this.manager.start(this);
        },

        /**
         * Starts this task if it is not already started.
         * @param {Number} [interval] Optionally reset this task's interval.
         */
        start: function (interval) {
            if (this.stopped) {
                this.restart(interval);
            }
        },

        /**
         * Stops this task.
         */
        stop: function () {
            this.manager.stop(this);
        }
    });

    proto = me.Task.prototype;

    /**
     * Destroys this instance, stopping this task's execution.
     * @method destroy
     */
    proto.destroy = proto.stop;
});










// @tag extras,core
/**
 * A static {@link Ext.util.TaskRunner} instance that can be used to start and stop
 * arbitrary tasks. See {@link Ext.util.TaskRunner} for supported methods and task
 * config properties.
 *
 *    // Start a simple clock task that updates a div once per second
 *    var task = {
 *       run: function(){
 *           Ext.fly('clock').update(new Date().format('g:i:s A'));
 *       },
 *       interval: 1000 //1 second
 *    }
 *
 *    Ext.TaskManager.start(task);
 *
 * See the {@link #start} method for details about how to configure a task object.
 */
Ext.define('Ext.util.TaskManager', {
    extend:  Ext.util.TaskRunner ,

    alternateClassName: [
        'Ext.TaskManager'
    ],

    singleton: true
});

// @tag extras,core
// @require ../util/TaskManager.js

/**
 * @class Ext.perf.Accumulator
 * @private
 */
Ext.define('Ext.perf.Accumulator', (function () {
    var currentFrame = null,
        khrome = Ext.global['chrome'],
        formatTpl,
        // lazy init on first request for timestamp (avoids infobar in IE until needed)
        // Also avoids kicking off Chrome's microsecond timer until first needed
        getTimestamp = function () {

            getTimestamp = function () {
                return new Date().getTime();
            };
            
            var interval, toolbox;

            // If Chrome is started with the --enable-benchmarking switch
            if (Ext.isChrome && khrome && khrome.Interval) {
                interval = new khrome.Interval();
                interval.start();
                getTimestamp = function () {
                    return interval.microseconds() / 1000;
                };
            } else if (window.ActiveXObject) {
                try {
                    // the above technique is not very accurate for small intervals...
                    toolbox = new ActiveXObject('SenchaToolbox.Toolbox');
                    Ext.senchaToolbox = toolbox; // export for other uses
                    getTimestamp = function () {
                        return toolbox.milliseconds;
                    };
                } catch (e) {
                    // ignore
                }
            } else if (Date.now) {
                getTimestamp = Date.now;
            }

            Ext.perf.getTimestamp = Ext.perf.Accumulator.getTimestamp = getTimestamp;
            return getTimestamp();
        };

    function adjustSet (set, time) {
        set.sum += time;
        set.min = Math.min(set.min, time);
        set.max = Math.max(set.max, time);
    }

    function leaveFrame (time) {
        var totalTime = time ? time : (getTimestamp() - this.time), // do this first
            me = this, // me = frame
            accum = me.accum;

        ++accum.count;
        if (! --accum.depth) {
            adjustSet(accum.total, totalTime);
        }
        adjustSet(accum.pure, totalTime - me.childTime);

        currentFrame = me.parent;
        if (currentFrame) {
            ++currentFrame.accum.childCount;
            currentFrame.childTime += totalTime;
        }
    }

    function makeSet () {
        return {
            min: Number.MAX_VALUE,
            max: 0,
            sum: 0
        };
    }

    function makeTap (me, fn) {
        return function () {
            var frame = me.enter(),
                ret = fn.apply(this, arguments);

            frame.leave();
            return ret;
        };
    }

    function round (x) {
        return Math.round(x * 100) / 100;
    }

    function setToJSON (count, childCount, calibration, set) {
        var data = {
            avg: 0,
            min: set.min,
            max: set.max,
            sum: 0
        };

        if (count) {
            calibration = calibration || 0;
            data.sum = set.sum - childCount * calibration;
            data.avg = data.sum / count;
            // min and max cannot be easily corrected since we don't know the number of
            // child calls for them.
        }

        return data;
    }

    return {
        constructor: function (name) {
            var me = this;

            me.count = me.childCount = me.depth = me.maxDepth = 0;
            me.pure = makeSet();
            me.total = makeSet();
            me.name = name;
        },

        statics: {
            getTimestamp: getTimestamp
        },

        format: function (calibration) {
            if (!formatTpl) {
                formatTpl = new Ext.XTemplate([
                        '{name} - {count} call(s)',
                        '<tpl if="count">',
                            '<tpl if="childCount">',
                                ' ({childCount} children)',
                            '</tpl>',
                            '<tpl if="depth - 1">',
                                ' ({depth} deep)',
                            '</tpl>',
                            '<tpl for="times">',
                                ', {type}: {[this.time(values.sum)]} msec (',
                                     //'min={[this.time(values.min)]}, ',
                                     'avg={[this.time(values.sum / parent.count)]}',
                                     //', max={[this.time(values.max)]}',
                                     ')',
                            '</tpl>',
                        '</tpl>'
                    ].join(''), {
                        time: function (t) {
                            return Math.round(t * 100) / 100;
                        }
                    });
            }

            var data = this.getData(calibration);
            data.name = this.name;
            data.pure.type = 'Pure';
            data.total.type = 'Total';
            data.times = [data.pure, data.total];
            return formatTpl.apply(data);
        },

        getData: function (calibration) {
            var me = this;

            return {
                count: me.count,
                childCount: me.childCount,
                depth: me.maxDepth,
                pure: setToJSON(me.count, me.childCount, calibration, me.pure),
                total: setToJSON(me.count, me.childCount, calibration, me.total)
            };
        },

        enter: function () {
            var me = this,
                frame = {
                    accum: me,
                    leave: leaveFrame,
                    childTime: 0,
                    parent: currentFrame
                };

            ++me.depth;
            if (me.maxDepth < me.depth) {
                me.maxDepth = me.depth;
            }

            currentFrame = frame;
            frame.time = getTimestamp(); // do this last
            return frame;
        },

        monitor: function (fn, scope, args) {
            var frame = this.enter();
            if (args) {
                fn.apply(scope, args);
            } else {
                fn.call(scope);
            }
            frame.leave();
        },

        report: function () {
            Ext.log(this.format());
        },

        tap: function (className, methodName) {
            var me = this,
                methods = typeof methodName == 'string' ? [methodName] : methodName,
                klass, statik, i, parts, length, name, src,
                tapFunc;

            tapFunc = function(){
                if (typeof className == 'string') {
                    klass = Ext.global;
                    parts = className.split('.');
                    for (i = 0, length = parts.length; i < length; ++i) {
                        klass = klass[parts[i]];
                    }
                } else {
                    klass = className;
                }

                for (i = 0, length = methods.length; i < length; ++i) {
                    name = methods[i];
                    statik = name.charAt(0) == '!';

                    if (statik) {
                        name = name.substring(1);
                    } else {
                        statik = !(name in klass.prototype);
                    }

                    src = statik ? klass : klass.prototype;
                    src[name] = makeTap(me, src[name]);
                }
            };

            Ext.ClassManager.onCreated(tapFunc, me, className);

            return me;
        }
    };
}()),

function () {
    Ext.perf.getTimestamp = this.getTimestamp;
});

// @tag extras,core
// @require Accumulator.js

/**
 * @class Ext.perf.Monitor
 * @singleton
 * @private
 */
Ext.define('Ext.perf.Monitor', {
    singleton: true,
    alternateClassName: 'Ext.Perf',

               
                              
      

    constructor: function () {
        this.accumulators = [];
        this.accumulatorsByName = {};
    },

    calibrate: function () {
        var accum = new Ext.perf.Accumulator('$'),
            total = accum.total,
            getTimestamp = Ext.perf.Accumulator.getTimestamp,
            count = 0,
            frame,
            endTime,
            startTime;

        startTime = getTimestamp();

        do {
            frame = accum.enter();
            frame.leave();
            ++count;
        } while (total.sum < 100);

        endTime = getTimestamp();

        return (endTime - startTime) / count;
    },

    get: function (name) {
        var me = this,
            accum = me.accumulatorsByName[name];

        if (!accum) {
            me.accumulatorsByName[name] = accum = new Ext.perf.Accumulator(name);
            me.accumulators.push(accum);
        }

        return accum;
    },

    enter: function (name) {
        return this.get(name).enter();
    },

    monitor: function (name, fn, scope) {
        this.get(name).monitor(fn, scope);
    },

    report: function () {
        var me = this,
            accumulators = me.accumulators,
            calibration = me.calibrate();

        accumulators.sort(function (a, b) {
            return (a.name < b.name) ? -1 : ((b.name < a.name) ? 1 : 0);
        });

        me.updateGC();

        Ext.log('Calibration: ' + Math.round(calibration * 100) / 100 + ' msec/sample');
        Ext.each(accumulators, function (accum) {
            Ext.log(accum.format(calibration));
        });
    },

    getData: function (all) {
        var ret = {},
            accumulators = this.accumulators;

        Ext.each(accumulators, function (accum) {
            if (all || accum.count) {
                ret[accum.name] = accum.getData();
            }
        });

        return ret;
    },

    reset: function(){
        Ext.each(this.accumulators, function(accum){
            var me = accum;
            me.count = me.childCount = me.depth = me.maxDepth = 0;
            me.pure = {
                min: Number.MAX_VALUE,
                max: 0,
                sum: 0
            };
            me.total = {
                min: Number.MAX_VALUE,
                max: 0,
                sum: 0
            };
        });
    },

    updateGC: function () {
        var accumGC = this.accumulatorsByName.GC,
            toolbox = Ext.senchaToolbox,
            bucket;

        if (accumGC) {
            accumGC.count = toolbox.garbageCollectionCounter || 0;

            if (accumGC.count) {
                bucket = accumGC.pure;
                accumGC.total.sum = bucket.sum = toolbox.garbageCollectionMilliseconds;
                bucket.min = bucket.max = bucket.sum / accumGC.count;
                bucket = accumGC.total;
                bucket.min = bucket.max = bucket.sum / accumGC.count;
            }
        }
    },

    watchGC: function () {
        Ext.perf.getTimestamp(); // initializes SenchaToolbox (if available)

        var toolbox = Ext.senchaToolbox;

        if (toolbox) {
            this.get("GC");
            toolbox.watchGarbageCollector(false); // no logging, just totals
        }
    },

    setup: function (config) {
        if (!config) {
            config = {
                /*insertHtml: {
                    'Ext.dom.Helper': 'insertHtml'
                },*/
                /*xtplCompile: {
                    'Ext.XTemplateCompiler': 'compile'
                },*/
//                doInsert: {
//                    'Ext.Template': 'doInsert'
//                },
//                applyOut: {
//                    'Ext.XTemplate': 'applyOut'
//                },
                render: {
                    'Ext.AbstractComponent': 'render'
                },
//                fnishRender: {
//                    'Ext.AbstractComponent': 'finishRender'
//                },
//                renderSelectors: {
//                    'Ext.AbstractComponent': 'applyRenderSelectors'
//                },
//                compAddCls: {
//                    'Ext.AbstractComponent': 'addCls'
//                },
//                compRemoveCls: {
//                    'Ext.AbstractComponent': 'removeCls'
//                },
//                getStyle: {
//                    'Ext.core.Element': 'getStyle'
//                },
//                setStyle: {
//                    'Ext.core.Element': 'setStyle'
//                },
//                addCls: {
//                    'Ext.core.Element': 'addCls'
//                },
//                removeCls: {
//                    'Ext.core.Element': 'removeCls'
//                },
//                measure: {
//                    'Ext.layout.component.Component': 'measureAutoDimensions'
//                },
//                moveItem: {
//                    'Ext.layout.Layout': 'moveItem'
//                },
//                layoutFlush: {
//                    'Ext.layout.Context': 'flush'
//                },
                layout: {
                    'Ext.layout.Context': 'run'
                }
            };
        }

        this.currentConfig = config;

        var key, prop,
            accum, className, methods;
        for (key in config) {
            if (config.hasOwnProperty(key)) {
                prop = config[key];
                accum = Ext.Perf.get(key);

                for (className in prop) {
                    if (prop.hasOwnProperty(className)) {
                        methods = prop[className];
                        accum.tap(className, methods);
                    }
                }
            }
        }

        this.watchGC();
    }
});

// @tag extras,core
// @require perf/Monitor.js
// @define Ext.Supports

/**
 * @class Ext.is
 * 
 * Determines information about the current platform the application is running on.
 * 
 * @singleton
 */
Ext.is = {
    init : function(navigator) {
        var platforms = this.platforms,
            ln = platforms.length,
            i, platform;

        navigator = navigator || window.navigator;

        for (i = 0; i < ln; i++) {
            platform = platforms[i];
            this[platform.identity] = platform.regex.test(navigator[platform.property]);
        }

        /**
         * @property Desktop True if the browser is running on a desktop machine
         * @type {Boolean}
         */
        this.Desktop = this.Mac || this.Windows || (this.Linux && !this.Android);
        /**
         * @property Tablet True if the browser is running on a tablet (iPad)
         */
        this.Tablet = this.iPad;
        /**
         * @property Phone True if the browser is running on a phone.
         * @type {Boolean}
         */
        this.Phone = !this.Desktop && !this.Tablet;
        /**
         * @property iOS True if the browser is running on iOS
         * @type {Boolean}
         */
        this.iOS = this.iPhone || this.iPad || this.iPod;
        
        /**
         * @property Standalone Detects when application has been saved to homescreen.
         * @type {Boolean}
         */
        this.Standalone = !!window.navigator.standalone;
    },
    
    /**
     * @property iPhone True when the browser is running on a iPhone
     * @type {Boolean}
     */
    platforms: [{
        property: 'platform',
        regex: /iPhone/i,
        identity: 'iPhone'
    },
    
    /**
     * @property iPod True when the browser is running on a iPod
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /iPod/i,
        identity: 'iPod'
    },
    
    /**
     * @property iPad True when the browser is running on a iPad
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /iPad/i,
        identity: 'iPad'
    },
    
    /**
     * @property Blackberry True when the browser is running on a Blackberry
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Blackberry/i,
        identity: 'Blackberry'
    },
    
    /**
     * @property Android True when the browser is running on an Android device
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Android/i,
        identity: 'Android'
    },
    
    /**
     * @property Mac True when the browser is running on a Mac
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Mac/i,
        identity: 'Mac'
    },
    
    /**
     * @property Windows True when the browser is running on Windows
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Win/i,
        identity: 'Windows'
    },
    
    /**
     * @property Linux True when the browser is running on Linux
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Linux/i,
        identity: 'Linux'
    }]
};

Ext.is.init();

/**
 * @class Ext.supports
 *
 * Determines information about features are supported in the current environment
 * 
 * @singleton
 */
(function(){

    // this is a local copy of certain logic from (Abstract)Element.getStyle
    // to break a dependancy between the supports mechanism and Element
    // use this instead of element references to check for styling info
    var getStyle = function(element, styleName){
        var view = element.ownerDocument.defaultView,
            style = (view ? view.getComputedStyle(element, null) : element.currentStyle) || element.style;
        return style[styleName];
    },
    supportsVectors = {
        'IE6-quirks':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
        'IE6-strict':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0],
        'IE7-quirks':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
        'IE7-strict':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,1,0,0,1,0,1,0,0,0],
        'IE8-quirks':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
        'IE8-strict':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,1,0,1,0,0,1],
        'IE9-quirks':  [0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
        'IE9-strict':  [0,1,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,1],
        'IE10-quirks': [1,1,0,0,1,1,1,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,1],
        'IE10-strict': [1,1,0,0,1,1,1,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,1]
    };

function getBrowserKey() {
    var browser = Ext.isIE6 ? 'IE6' : Ext.isIE7 ? 'IE7' : Ext.isIE8 ? 'IE8' :
        Ext.isIE9 ? 'IE9': Ext.isIE10 ? 'IE10' : '';

    return browser ? browser + (Ext.isStrict ? '-strict' : '-quirks') : '';
}

Ext.supports = {
    /**
     * Runs feature detection routines and sets the various flags. This is called when
     * the scripts loads (very early) and again at {@link Ext#onReady}. Some detections
     * are flagged as `early` and run immediately. Others that require the document body
     * will not run until ready.
     *
     * Each test is run only once, so calling this method from an onReady function is safe
     * and ensures that all flags have been set.
     * @markdown
     * @private
     */
    init : function() {
        var me = this,
            doc = document,
            toRun = me.toRun || me.tests,
            n = toRun.length,
            div = n && Ext.isReady && doc.createElement('div'),
            notRun = [],
            browserKey = getBrowserKey(),
            test, vector, value;

        if (div) {
            div.innerHTML = [
                '<div style="height:30px;width:50px;">',
                    '<div style="height:20px;width:20px;"></div>',
                '</div>',
                '<div style="width: 200px; height: 200px; position: relative; padding: 5px;">',
                    '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>',
                '</div>',
                '<div style="position: absolute; left: 10%; top: 10%;"></div>',
                '<div style="float:left; background-color:transparent;"></div>'
            ].join('');

            doc.body.appendChild(div);
        }

        vector = supportsVectors[browserKey];
        while (n--) {
            test = toRun[n];
            value = vector && vector[n];
            if (value !== undefined) {
                me[test.identity] = value;
            } else if (div || test.early) {
                me[test.identity] = test.fn.call(me, doc, div);
            } else {
                notRun.push(test);
            }
        }

        if (div) {
            doc.body.removeChild(div);
        }

        me.toRun = notRun;
    },

    /**
     * Generates a support vector for the current browser/mode.  The result can be
     * added to supportsVectors to eliminate feature detection at startup time.
     * @private
     */
    generateVector: function() {
        var tests = this.tests,
            vector = [],
            i = 0,
            ln = tests.length,
            test;

        for (; i < ln; i++) {
            test = tests[i];
            vector.push(this[test.identity] ? 1 : 0);
        }
        return vector;
    },

    /**
     * @property PointerEvents True if document environment supports the CSS3 pointer-events style.
     * @type {Boolean}
     */
    PointerEvents: 'pointerEvents' in document.documentElement.style,

    // IE10/Win8 throws "Access Denied" accessing window.localStorage, so this test
    // needs to have a try/catch
    /**
     * @property LocalStorage True if localStorage is supported
     */
    LocalStorage: (function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    })(),

    /**
     * @property CSS3BoxShadow True if document environment supports the CSS3 box-shadow style.
     * @type {Boolean}
     */
    CSS3BoxShadow: 'boxShadow' in document.documentElement.style || 'WebkitBoxShadow' in document.documentElement.style || 'MozBoxShadow' in document.documentElement.style,

    /**
     * @property ClassList True if document environment supports the HTML5 classList API.
     * @type {Boolean}
     */
    ClassList: !!document.documentElement.classList,

    /**
     * @property OrientationChange True if the device supports orientation change
     * @type {Boolean}
     */
    OrientationChange: ((typeof window.orientation != 'undefined') && ('onorientationchange' in window)),

    /**
     * @property DeviceMotion True if the device supports device motion (acceleration and rotation rate)
     * @type {Boolean}
     */
    DeviceMotion: ('ondevicemotion' in window),

    /**
     * @property Touch True if the device supports touch
     * @type {Boolean}
     */
    // is.Desktop is needed due to the bug in Chrome 5.0.375, Safari 3.1.2
    // and Safari 4.0 (they all have 'ontouchstart' in the window object).
    Touch: ('ontouchstart' in window) && (!Ext.is.Desktop),

    /**
     * @property TimeoutActualLateness True if the browser passes the "actualLateness" parameter to
     * setTimeout. See: https://developer.mozilla.org/en/DOM/window.setTimeout
     * @type {Boolean}
     */
    TimeoutActualLateness: (function(){
        setTimeout(function(){
            Ext.supports.TimeoutActualLateness = arguments.length !== 0;
        }, 0);
    }()),

    tests: [
        /**
         * @property Transitions True if the device supports CSS3 Transitions
         * @type {Boolean}
         */
        {
            identity: 'Transitions',
            fn: function(doc, div) {
                var prefix = [
                        'webkit',
                        'Moz',
                        'o',
                        'ms',
                        'khtml'
                    ],
                    TE = 'TransitionEnd',
                    transitionEndName = [
                        prefix[0] + TE,
                        'transitionend', //Moz bucks the prefixing convention
                        prefix[2] + TE,
                        prefix[3] + TE,
                        prefix[4] + TE
                    ],
                    ln = prefix.length,
                    i = 0,
                    out = false;

                for (; i < ln; i++) {
                    if (getStyle(div, prefix[i] + "TransitionProperty")) {
                        Ext.supports.CSS3Prefix = prefix[i];
                        Ext.supports.CSS3TransitionEnd = transitionEndName[i];
                        out = true;
                        break;
                    }
                }
                return out;
            }
        },

        /**
         * @property RightMargin True if the device supports right margin.
         * See https://bugs.webkit.org/show_bug.cgi?id=13343 for why this is needed.
         * @type {Boolean}
         */
        {
            identity: 'RightMargin',
            fn: function(doc, div) {
                var view = doc.defaultView;
                return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px');
            }
        },

        /**
         * @property DisplayChangeInputSelectionBug True if INPUT elements lose their
         * selection when their display style is changed. Essentially, if a text input
         * has focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Safari 4.0.4 and older, and appears to be fixed
         * in Safari 5. It's not clear if Safari 4.1 has the bug, but it has the same WebKit
         * version number as Safari 5 (according to http://unixpapa.com/js/gecko.html).
         */
        {
            identity: 'DisplayChangeInputSelectionBug',
            early: true,
            fn: function() {
                var webKitVersion = Ext.webKitVersion;
                // WebKit but older than Safari 5 or Chrome 6:
                return 0 < webKitVersion && webKitVersion < 533;
            }
        },

        /**
         * @property DisplayChangeTextAreaSelectionBug True if TEXTAREA elements lose their
         * selection when their display style is changed. Essentially, if a text area has
         * focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Chrome 10 and Safari 5 and older, and appears to
         * be fixed in Chrome 11.
         */
        {
            identity: 'DisplayChangeTextAreaSelectionBug',
            early: true,
            fn: function() {
                var webKitVersion = Ext.webKitVersion;

                /*
                Has bug w/textarea:

                (Chrome) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US)
                            AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.127
                            Safari/534.16
                (Safari) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us)
                            AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5
                            Safari/533.21.1

                No bug:

                (Chrome) Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7)
                            AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57
                            Safari/534.24
                */
                return 0 < webKitVersion && webKitVersion < 534.24;
            }
        },

        /**
         * @property TransparentColor True if the device supports transparent color
         * @type {Boolean}
         */
        {
            identity: 'TransparentColor',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor != 'transparent');
            }
        },

        /**
         * @property ComputedStyle True if the browser supports document.defaultView.getComputedStyle()
         * @type {Boolean}
         */
        {
            identity: 'ComputedStyle',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return view && view.getComputedStyle;
            }
        },

        /**
         * @property Svg True if the device supports SVG
         * @type {Boolean}
         */
        {
            identity: 'Svg',
            fn: function(doc) {
                return !!doc.createElementNS && !!doc.createElementNS( "http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect;
            }
        },

        /**
         * @property Canvas True if the device supports Canvas
         * @type {Boolean}
         */
        {
            identity: 'Canvas',
            fn: function(doc) {
                return !!doc.createElement('canvas').getContext;
            }
        },

        /**
         * @property Vml True if the device supports VML
         * @type {Boolean}
         */
        {
            identity: 'Vml',
            fn: function(doc) {
                var d = doc.createElement("div");
                d.innerHTML = "<!--[if vml]><br/><br/><![endif]-->";
                return (d.childNodes.length == 2);
            }
        },

        /**
         * @property Float True if the device supports CSS float
         * @type {Boolean}
         */
        {
            identity: 'Float',
            fn: function(doc, div) {
                return !!div.lastChild.style.cssFloat;
            }
        },

        /**
         * @property AudioTag True if the device supports the HTML5 audio tag
         * @type {Boolean}
         */
        {
            identity: 'AudioTag',
            fn: function(doc) {
                return !!doc.createElement('audio').canPlayType;
            }
        },

        /**
         * @property History True if the device supports HTML5 history
         * @type {Boolean}
         */
        {
            identity: 'History',
            fn: function() {
                var history = window.history;
                return !!(history && history.pushState);
            }
        },

        /**
         * @property CSS3DTransform True if the device supports CSS3DTransform
         * @type {Boolean}
         */
        {
            identity: 'CSS3DTransform',
            fn: function() {
                return (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'));
            }
        },

		/**
         * @property CSS3LinearGradient True if the device supports CSS3 linear gradients
         * @type {Boolean}
         */
        {
            identity: 'CSS3LinearGradient',
            fn: function(doc, div) {
                var property = 'background-image:',
                    webkit   = '-webkit-gradient(linear, left top, right bottom, from(black), to(white))',
                    w3c      = 'linear-gradient(left top, black, white)',
                    moz      = '-moz-' + w3c,
                    ms       = '-ms-' + w3c,
                    opera    = '-o-' + w3c,
                    options  = [property + webkit, property + w3c, property + moz, property + ms, property + opera];

                div.style.cssText = options.join(';');

                return (("" + div.style.backgroundImage).indexOf('gradient') !== -1) && !Ext.isIE9;
            }
        },

        /**
         * @property CSS3BorderRadius True if the device supports CSS3 border radius
         * @type {Boolean}
         */
        {
            identity: 'CSS3BorderRadius',
            fn: function(doc, div) {
                var domPrefixes = ['borderRadius', 'BorderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'OBorderRadius', 'KhtmlBorderRadius'],
                    pass = false,
                    i;
                for (i = 0; i < domPrefixes.length; i++) {
                    if (document.body.style[domPrefixes[i]] !== undefined) {
                        return true;
                    }
                }
                return pass;
            }
        },

        /**
         * @property GeoLocation True if the device supports GeoLocation
         * @type {Boolean}
         */
        {
            identity: 'GeoLocation',
            fn: function() {
                // Use the in check for geolocation, see https://github.com/Modernizr/Modernizr/issues/513
                return (typeof navigator != 'undefined' && 'geolocation' in navigator) || (typeof google != 'undefined' && typeof google.gears != 'undefined');
            }
        },
        /**
         * @property MouseEnterLeave True if the browser supports mouseenter and mouseleave events
         * @type {Boolean}
         */
        {
            identity: 'MouseEnterLeave',
            fn: function(doc, div){
                return ('onmouseenter' in div && 'onmouseleave' in div);
            }
        },
        /**
         * @property MouseWheel True if the browser supports the mousewheel event
         * @type {Boolean}
         */
        {
            identity: 'MouseWheel',
            fn: function(doc, div) {
                return ('onmousewheel' in div);
            }
        },
        /**
         * @property Opacity True if the browser supports normal css opacity
         * @type {Boolean}
         */
        {
            identity: 'Opacity',
            fn: function(doc, div){
                // Not a strict equal comparison in case opacity can be converted to a number.
                if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                    return false;
                }
                div.firstChild.style.cssText = 'opacity:0.73';
                return div.firstChild.style.opacity == '0.73';
            }
        },
        /**
         * @property Placeholder True if the browser supports the HTML5 placeholder attribute on inputs
         * @type {Boolean}
         */
        {
            identity: 'Placeholder',
            fn: function(doc) {
                return 'placeholder' in doc.createElement('input');
            }
        },

        /**
         * @property Direct2DBug True if when asking for an element's dimension via offsetWidth or offsetHeight,
         * getBoundingClientRect, etc. the browser returns the subpixel width rounded to the nearest pixel.
         * @type {Boolean}
         */
        {
            identity: 'Direct2DBug',
            fn: function() {
                return Ext.isString(document.body.style.msTransformOrigin) && Ext.isIE10m;
            }
        },
        /**
         * @property BoundingClientRect True if the browser supports the getBoundingClientRect method on elements
         * @type {Boolean}
         */
        {
            identity: 'BoundingClientRect',
            fn: function(doc, div) {
                return Ext.isFunction(div.getBoundingClientRect);
            }
        },
        /**
         * @property RotatedBoundingClientRect True if the BoundingClientRect is
         * rotated when the element is rotated using a CSS transform.
         * @type {Boolean}
         */
        {
            identity: 'RotatedBoundingClientRect',
            fn: function() {
                var body = document.body,
                    supports = false,
                    el = document.createElement('div'),
                    style = el.style;

                if (el.getBoundingClientRect) {
                    style.WebkitTransform = style.MozTransform =
                        style.OTransform = style.transform = 'rotate(90deg)';
                    style.width = '100px';
                    style.height = '30px';
                    body.appendChild(el)

                    supports = el.getBoundingClientRect().height !== 100;
                    body.removeChild(el);
                }
               
                return supports;
            }
        },
        {
            identity: 'IncludePaddingInWidthCalculation',
            fn: function(doc, div){
                return div.childNodes[1].firstChild.offsetWidth == 210;
            }
        },
        {
            identity: 'IncludePaddingInHeightCalculation',
            fn: function(doc, div){
                return div.childNodes[1].firstChild.offsetHeight == 210;
            }
        },

        /**
         * @property ArraySort True if the Array sort native method isn't bugged.
         * @type {Boolean}
         */
        {
            identity: 'ArraySort',
            fn: function() {
                var a = [1,2,3,4,5].sort(function(){ return 0; });
                return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
            }
        },
        /**
         * @property Range True if browser support document.createRange native method.
         * @type {Boolean}
         */
        {
            identity: 'Range',
            fn: function() {
                return !!document.createRange;
            }
        },
        /**
         * @property CreateContextualFragment True if browser support CreateContextualFragment range native methods.
         * @type {Boolean}
         */
        {
            identity: 'CreateContextualFragment',
            fn: function() {
                var range = Ext.supports.Range ? document.createRange() : false;

                return range && !!range.createContextualFragment;
            }
        },

        /**
         * @property WindowOnError True if browser supports window.onerror.
         * @type {Boolean}
         */
        {
            identity: 'WindowOnError',
            fn: function () {
                // sadly, we cannot feature detect this...
                return Ext.isIE || Ext.isGecko || Ext.webKitVersion >= 534.16; // Chrome 10+
            }
        },

        /**
         * @property TextAreaMaxLength True if the browser supports maxlength on textareas.
         * @type {Boolean}
         */
        {
            identity: 'TextAreaMaxLength',
            fn: function(){
                var el = document.createElement('textarea');
                return ('maxlength' in el);
            }
        },
        /**
         * @property GetPositionPercentage True if the browser will return the left/top/right/bottom
         * position as a percentage when explicitly set as a percentage value.
         * @type {Boolean}
         */
        // Related bug: https://bugzilla.mozilla.org/show_bug.cgi?id=707691#c7
        {
            identity: 'GetPositionPercentage',
            fn: function(doc, div){
               return getStyle(div.childNodes[2], 'left') == '10%';
            }
        },
        /**
         * @property {Boolean} PercentageHeightOverflowBug
         * In some browsers (IE quirks, IE6, IE7, IE9, chrome, safari and opera at the time
         * of this writing) a percentage-height element ignores the horizontal scrollbar
         * of its parent element.  This method returns true if the browser is affected
         * by this bug.
         *
         * @private
         */
        {
            identity: 'PercentageHeightOverflowBug',
            fn: function(doc) {
                var hasBug = false,
                    style, el;

                if (Ext.getScrollbarSize().height) {
                    // must have space-consuming scrollbars for bug to be possible
                    el = doc.createElement('div');
                    style = el.style;
                    style.height = '50px';
                    style.width = '50px';
                    style.overflow = 'auto';
                    style.position = 'absolute';
                    
                    el.innerHTML = [
                        '<div style="display:table;height:100%;">',
                            // The element that causes the horizontal overflow must be 
                            // a child of the element with the 100% height, otherwise
                            // horizontal overflow is not triggered in webkit quirks mode
                            '<div style="width:51px;"></div>',
                        '</div>'
                    ].join('');
                    doc.body.appendChild(el);
                    if (el.firstChild.offsetHeight === 50) {
                        hasBug = true;
                    }
                    doc.body.removeChild(el);
                }
                
                return hasBug;
            }
        },
        /**
         * @property {Boolean} xOriginBug
         * In Chrome 24.0, an RTL element which has vertical overflow positions its right X origin incorrectly.
         * It skips a non-existent scrollbar which has been moved to the left edge due to the RTL setting.
         *
         * http://code.google.com/p/chromium/issues/detail?id=174656
         *
         * This method returns true if the browser is affected by this bug.
         *
         * @private
         */
        {
            identity: 'xOriginBug',
            fn: function(doc, div) {
               div.innerHTML = '<div id="b1" style="height:100px;width:100px;direction:rtl;position:relative;overflow:scroll">' +
                    '<div id="b2" style="position:relative;width:100%;height:20px;"></div>' +
                    '<div id="b3" style="position:absolute;width:20px;height:20px;top:0px;right:0px"></div>' +
                '</div>';

                var outerBox = document.getElementById('b1').getBoundingClientRect(),
                    b2 = document.getElementById('b2').getBoundingClientRect(),
                    b3 = document.getElementById('b3').getBoundingClientRect();

                return (b2.left !== outerBox.left && b3.right !== outerBox.right);
            }
        },

        /**
         * @property {Boolean} ScrollWidthInlinePaddingBug
         * In some browsers the right padding of an overflowing element is not accounted
         * for in its scrollWidth.  The result can vary depending on whether or not
         * The element contains block-level children.  This method tests the effect
         * of padding on scrollWidth when there are no block-level children inside the
         * overflowing element.
         * 
         * This method returns true if the browser is affected by this bug.
         */
        {
            identity: 'ScrollWidthInlinePaddingBug',
            fn: function(doc) {
                var hasBug = false,
                    style, el;

                el = doc.createElement('div');
                style = el.style;
                style.height = '50px';
                style.width = '50px';
                style.padding = '10px';
                style.overflow = 'hidden';
                style.position = 'absolute';
                
                el.innerHTML =
                    '<span style="display:inline-block;zoom:1;height:60px;width:60px;"></span>';
                doc.body.appendChild(el);
                if (el.scrollWidth === 70) {
                    hasBug = true;
                }
                doc.body.removeChild(el);
                
                return hasBug;
            }
        }
    ]
};
}());

Ext.supports.init(); // run the "early" detections now

// @tag dom,core
// @require ../Support.js
// @define Ext.util.DelayedTask

/**
 * @class Ext.util.DelayedTask
 * 
 * The DelayedTask class provides a convenient way to "buffer" the execution of a method,
 * performing setTimeout where a new timeout cancels the old timeout. When called, the
 * task will wait the specified time period before executing. If durng that time period,
 * the task is called again, the original call will be cancelled. This continues so that
 * the function is only called a single time for each iteration.
 * 
 * This method is especially useful for things like detecting whether a user has finished
 * typing in a text field. An example would be performing validation on a keypress. You can
 * use this class to buffer the keypress events for a certain number of milliseconds, and
 * perform only if they stop for that amount of time.  
 * 
 * ## Usage
 * 
 *     var task = new Ext.util.DelayedTask(function(){
 *         alert(Ext.getDom('myInputField').value.length);
 *     });
 *     
 *     // Wait 500ms before calling our function. If the user presses another key
 *     // during that 500ms, it will be cancelled and we'll wait another 500ms.
 *     Ext.get('myInputField').on('keypress', function() {
 *         task.{@link #delay}(500);
 *     });
 * 
 * Note that we are using a DelayedTask here to illustrate a point. The configuration
 * option `buffer` for {@link Ext.util.Observable#addListener addListener/on} will
 * also setup a delayed task for you to buffer events.
 * 
 * @constructor The parameters to this constructor serve as defaults and are not required.
 * @param {Function} fn (optional) The default function to call. If not specified here, it must be specified during the {@link #delay} call.
 * @param {Object} scope (optional) The default scope (The **`this`** reference) in which the
 * function is called. If not specified, `this` will refer to the browser window.
 * @param {Array} args (optional) The default Array of arguments.
 * @param {Boolean} [cancelOnDelay=true] By default, each call to {@link #delay} cancels any pending invocation and reschedules a new
 * invocation. Specifying this as `false` means that calls to {@link #delay} when an invocation is pending just update the call settings,
 * `newDelay`, `newFn`, `newScope` or `newArgs`, whichever are passed.
 */
Ext.util.DelayedTask = function(fn, scope, args, cancelOnDelay) {
    var me = this,
        delay,
        call = function() {
            clearInterval(me.id);
            me.id = null;
            fn.apply(scope, args || []);
            Ext.EventManager.idleEvent.fire();
        };

    cancelOnDelay = typeof cancelOnDelay === 'boolean' ? cancelOnDelay : true;

    /**
     * @property {Number} id
     * The id of the currently pending invocation.  Will be set to `null` if there is no
     * invocation pending.
     */
    me.id = null;

    /**
     * By default, cancels any pending timeout and queues a new one.
     *
     * If the `cancelOnDelay` parameter was specified as `false` in the constructor, this does not cancel and
     * reschedule, but just updates the call settings, `newDelay`, `newFn`, `newScope` or `newArgs`, whichever are passed.
     *
     * @param {Number} newDelay The milliseconds to delay
     * @param {Function} newFn (optional) Overrides function passed to constructor
     * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
     * is specified, <code>this</code> will refer to the browser window.
     * @param {Array} newArgs (optional) Overrides args passed to constructor
     */
    me.delay = function(newDelay, newFn, newScope, newArgs) {
        if (cancelOnDelay) {
            me.cancel();
        }
        delay = newDelay || delay,
        fn    = newFn    || fn;
        scope = newScope || scope;
        args  = newArgs  || args;
        if (!me.id) {
            me.id = setInterval(call, delay);
        }
    };

    /**
     * Cancel the last queued timeout
     */
    me.cancel = function() {
        if (me.id) {
            clearInterval(me.id);
            me.id = null;
        }
    };
};

// @tag dom,core
/**
 * Represents single event type that an Observable object listens to.
 * All actual listeners are tracked inside here.  When the event fires,
 * it calls all the registered listener functions.
 *
 * @private
 */
Ext.define('Ext.util.Event', function() {
  var arraySlice = Array.prototype.slice,
      arrayInsert = Ext.Array.insert,
      toArray = Ext.Array.toArray,
      DelayedTask = Ext.util.DelayedTask;

  return {
                                     

    /**
     * @property {Boolean} isEvent
     * `true` in this class to identify an object as an instantiated Event, or subclass thereof.
     */
    isEvent: true,
    
    // Private. Event suspend count
    suspended: 0,

    noOptions: {},

    constructor: function(observable, name) {
        this.name = name;
        this.observable = observable;
        this.listeners = [];
    },

    addListener: function(fn, scope, options) {
        var me = this,
            listeners, listener, priority, isNegativePriority, highestNegativePriorityIndex,
            hasNegativePriorityIndex, length, index, i, listenerPriority;

        scope = scope || me.observable;

        if (!fn) {
            Ext.Error.raise({
                sourceClass: Ext.getClassName(this.observable),
                sourceMethod: "addListener",
                msg: "The specified callback function is undefined"
            });
        }

        if (!me.isListening(fn, scope)) {
            listener = me.createListener(fn, scope, options);
            if (me.firing) {
                // if we are currently firing this event, don't disturb the listener loop
                me.listeners = me.listeners.slice(0);
            }
            listeners = me.listeners;
            index = length = listeners.length;
            priority = options && options.priority;
            highestNegativePriorityIndex = me._highestNegativePriorityIndex;
            hasNegativePriorityIndex = (highestNegativePriorityIndex !== undefined);
            if (priority) {
                // Find the index at which to insert the listener into the listeners array,
                // sorted by priority highest to lowest.
                isNegativePriority = (priority < 0);
                if (!isNegativePriority || hasNegativePriorityIndex) {
                    // If the priority is a positive number, or if it is a negative number
                    // and there are other existing negative priority listenrs, then we
                    // need to calcuate the listeners priority-order index.
                    // If the priority is a negative number, begin the search for priority
                    // order index at the index of the highest existing negative priority
                    // listener, otherwise begin at 0
                    for(i = (isNegativePriority ? highestNegativePriorityIndex : 0); i < length; i++) {
                        // Listeners created without options will have no "o" property
                        listenerPriority = listeners[i].o ? listeners[i].o.priority||0 : 0;
                        if (listenerPriority < priority) {
                            index = i;
                            break;
                        }
                    }
                } else {
                    // if the priority is a negative number, and there are no other negative
                    // priority listeners, then no calculation is needed - the negative
                    // priority listener gets appended to the end of the listeners array.
                    me._highestNegativePriorityIndex = index;
                }
            } else if (hasNegativePriorityIndex) {
                // listeners with a priority of 0 or undefined are appended to the end of
                // the listeners array unless there are negative priority listeners in the
                // listeners array, then they are inserted before the highest negative
                // priority listener.
                index = highestNegativePriorityIndex;
            }

            if (!isNegativePriority && index <= highestNegativePriorityIndex) {
                me._highestNegativePriorityIndex ++;
            }
            if (index === length) {
                me.listeners[length] = listener;
            } else {
                arrayInsert(me.listeners, index, [listener]);
            }
        }
    },

    createListener: function(fn, scope, o) {
        scope = scope || this.observable;

        var me = this,
            listener = {
                fn: fn,
                scope: scope,
                ev: me
            },
            handler = fn;

        // The order is important. The 'single' wrapper must be wrapped by the 'buffer' and 'delayed' wrapper
        // because the event removal that the single listener does destroys the listener's DelayedTask(s)
        if (o) {
            listener.o = o;
            if (o.single) {
                handler = me.createSingle(handler, listener, o, scope);
            }
            if (o.target) {
                handler = me.createTargeted(handler, listener, o, scope);
            }
            if (o.delay) {
                handler = me.createDelayed(handler, listener, o, scope);
            }
            if (o.buffer) {
                handler = me.createBuffered(handler, listener, o, scope);
            }
        }

        listener.fireFn = handler;
        return listener;
    },

    findListener: function(fn, scope) {
        var listeners = this.listeners,
        i = listeners.length,
        listener,
        s;

        while (i--) {
            listener = listeners[i];
            if (listener) {
                s = listener.scope;

                // Compare the listener's scope with *JUST THE PASSED SCOPE* if one is passed, and only fall back to the owning Observable if none is passed.
                // We cannot use the test (s == scope || s == this.observable)
                // Otherwise, if the Observable itself adds Ext.emptyFn as a listener, and then Ext.emptyFn is added under another scope, there will be a false match.
                if (listener.fn == fn && (s == (scope || this.observable))) {
                    return i;
                }
            }
        }

        return - 1;
    },

    isListening: function(fn, scope) {
        return this.findListener(fn, scope) !== -1;
    },

    removeListener: function(fn, scope) {
        var me = this,
            index,
            listener,
            highestNegativePriorityIndex,
            k;
        index = me.findListener(fn, scope);
        if (index != -1) {
            listener = me.listeners[index];
            highestNegativePriorityIndex = me._highestNegativePriorityIndex;

            if (me.firing) {
                me.listeners = me.listeners.slice(0);
            }

            // cancel and remove a buffered handler that hasn't fired yet
            if (listener.task) {
                listener.task.cancel();
                delete listener.task;
            }

            // cancel and remove all delayed handlers that haven't fired yet
            k = listener.tasks && listener.tasks.length;
            if (k) {
                while (k--) {
                    listener.tasks[k].cancel();
                }
                delete listener.tasks;
            }

            // Remove this listener from the listeners array
            // We can use splice directly. The IE8 bug which Ext.Array works around only affects *insertion*
            // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/
            me.listeners.splice(index, 1);

            // if the listeners array contains negative priority listeners, adjust the
            // internal index if needed.
            if (highestNegativePriorityIndex) {
                if (index < highestNegativePriorityIndex) {
                    me._highestNegativePriorityIndex --;
                } else if (index === highestNegativePriorityIndex && index === me.listeners.length) {
                    delete me._highestNegativePriorityIndex;
                }
            }
            return true;
        }

        return false;
    },

    // Iterate to stop any buffered/delayed events
    clearListeners: function() {
        var listeners = this.listeners,
            i = listeners.length;

        while (i--) {
            this.removeListener(listeners[i].fn, listeners[i].scope);
        }
    },

    suspend: function() {
        this.suspended += 1;
    },

    resume: function() {
        if (this.suspended) {
            this.suspended--;
        }
    },

    fire: function() {
        var me = this,
            listeners = me.listeners,
            count = listeners.length,
            i,
            args,
            listener,
            len;

        if (!me.suspended && count > 0) {
            me.firing = true;
            args = arguments.length ? arraySlice.call(arguments, 0) : []
            len = args.length;
            for (i = 0; i < count; i++) {
                listener = listeners[i];
                if (listener.o) {
                    args[len] = listener.o;
                }
                if (listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
                    return (me.firing = false);
                }
            }
        }
        me.firing = false;
        return true;
    },

    createTargeted: function (handler, listener, o, scope) {
        return function(){
            if (o.target === arguments[0]){
                handler.apply(scope, arguments);
            }
        };
    },

    createBuffered: function (handler, listener, o, scope) {
        listener.task = new DelayedTask();
        return function() {
            listener.task.delay(o.buffer, handler, scope, toArray(arguments));
        };
    },

    createDelayed: function (handler, listener, o, scope) {
        return function() {
            var task = new DelayedTask();
            if (!listener.tasks) {
                listener.tasks = [];
            }
            listener.tasks.push(task);
            task.delay(o.delay || 10, handler, scope, toArray(arguments));
        };
    },

    createSingle: function (handler, listener, o, scope) {
        return function() {
            var event = listener.ev;

            if (event.removeListener(listener.fn, scope) && event.observable) {
                // Removing from a regular Observable-owned, named event (not an anonymous
                // event such as Ext's readyEvent): Decrement the listeners count
                event.observable.hasListeners[event.name]--;
            }

            return handler.apply(scope, arguments);
        };
    }
  };
});

// @tag dom,core
// @require util/Event.js
// @define Ext.EventManager

/**
 * @class Ext.EventManager
 * Registers event handlers that want to receive a normalized EventObject instead of the standard browser event and provides
 * several useful events directly.
 *
 * See {@link Ext.EventObject} for more details on normalized event objects.
 * @singleton
 */
Ext.EventManager = new function() {
    var EventManager = this,
        doc = document,
        win = window,
        escapeRx = /\\/g,
        prefix = Ext.baseCSSPrefix,
        // IE9strict addEventListener has some issues with using synthetic events
        supportsAddEventListener = !Ext.isIE9 && 'addEventListener' in doc,
        readyEvent,
        initExtCss = function() {
            // find the body element
            var bd = doc.body || doc.getElementsByTagName('body')[0],
                cls = [prefix + 'body'],
                htmlCls = [],
                supportsLG = Ext.supports.CSS3LinearGradient,
                supportsBR = Ext.supports.CSS3BorderRadius,
                html;

            if (!bd) {
                return false;
            }

            html = bd.parentNode;

            function add (c) {
                cls.push(prefix + c);
            }

            //Let's keep this human readable!
            if (Ext.isIE && Ext.isIE9m) {
                add('ie');

                // very often CSS needs to do checks like "IE7+" or "IE6 or 7". To help
                // reduce the clutter (since CSS/SCSS cannot do these tests), we add some
                // additional classes:
                //
                //      x-ie7p      : IE7+      :  7 <= ieVer
                //      x-ie7m      : IE7-      :  ieVer <= 7
                //      x-ie8p      : IE8+      :  8 <= ieVer
                //      x-ie8m      : IE8-      :  ieVer <= 8
                //      x-ie9p      : IE9+      :  9 <= ieVer
                //      x-ie78      : IE7 or 8  :  7 <= ieVer <= 8
                //
                if (Ext.isIE6) {
                    add('ie6');
                } else { // ignore pre-IE6 :)
                    add('ie7p');

                    if (Ext.isIE7) {
                        add('ie7');
                    } else {
                        add('ie8p');

                        if (Ext.isIE8) {
                            add('ie8');
                        } else {
                            add('ie9p');

                            if (Ext.isIE9) {
                                add('ie9');
                            }
                        }
                    }
                }

                if (Ext.isIE7m) {
                    add('ie7m');
                }
                if (Ext.isIE8m) {
                    add('ie8m');
                }
                if (Ext.isIE9m) {
                    add('ie9m');
                }
                if (Ext.isIE7 || Ext.isIE8) {
                    add('ie78');
                }
            }
            
            if (Ext.isIE10) {
                add('ie10');
            }
            
            if (Ext.isGecko) {
                add('gecko');
                if (Ext.isGecko3) {
                    add('gecko3');
                }
                if (Ext.isGecko4) {
                    add('gecko4');
                }
                if (Ext.isGecko5) {
                    add('gecko5');
                }
            }
            if (Ext.isOpera) {
                add('opera');
            }
            if (Ext.isWebKit) {
                add('webkit');
            }
            if (Ext.isSafari) {
                add('safari');
                if (Ext.isSafari2) {
                    add('safari2');
                }
                if (Ext.isSafari3) {
                    add('safari3');
                }
                if (Ext.isSafari4) {
                    add('safari4');
                }
                if (Ext.isSafari5) {
                    add('safari5');
                }
                if (Ext.isSafari5_0) {
                    add('safari5_0')
                }
            }
            if (Ext.isChrome) {
                add('chrome');
            }
            if (Ext.isMac) {
                add('mac');
            }
            if (Ext.isLinux) {
                add('linux');
            }
            if (!supportsBR) {
                add('nbr');
            }
            if (!supportsLG) {
                add('nlg');
            }

            // add to the parent to allow for selectors x-strict x-border-box, also set the isBorderBox property correctly
            if (html) {
                if (Ext.isStrict && (Ext.isIE6 || Ext.isIE7)) {
                    Ext.isBorderBox = false;
                }
                else {
                    Ext.isBorderBox = true;
                }

                if(!Ext.isBorderBox) {
                    htmlCls.push(prefix + 'content-box');
                }
                if (Ext.isStrict) {
                    htmlCls.push(prefix + 'strict');
                } else {
                    htmlCls.push(prefix + 'quirks');
                }
                Ext.fly(html, '_internal').addCls(htmlCls);
            }

            Ext.fly(bd, '_internal').addCls(cls);
            return true;
        };

    Ext.apply(EventManager, {
        /**
         * Check if we have bound our global onReady listener
         * @private
         */
        hasBoundOnReady: false,

        /**
         * Check if fireDocReady has been called
         * @private
         */
        hasFiredReady: false,

        /**
         * Additionally, allow the 'DOM' listener thread to complete (usually desirable with mobWebkit, Gecko)
         * before firing the entire onReady chain (high stack load on Loader) by specifying a delay value.
         * Defaults to 1ms.
         * @private
         */
        deferReadyEvent : 1,

        /*
         * diags: a list of event names passed to onReadyEvent (in chron order)
         * @private
         */
        onReadyChain : [],

        /**
         * Holds references to any onReady functions
         * @private
         */
        readyEvent:
            (function () {
                readyEvent = new Ext.util.Event();
                readyEvent.fire = function () {
                    Ext._beforeReadyTime = Ext._beforeReadyTime || new Date().getTime();
                    readyEvent.self.prototype.fire.apply(readyEvent, arguments);
                    Ext._afterReadytime = new Date().getTime();
                };
                return readyEvent;
            }()),

        /**
         * Fires when an event handler finishes its run, just before returning to browser control.
         * 
         * This includes DOM event handlers, Ajax (including JSONP) event handlers, and {@link Ext.util.TaskRunner TaskRunners}
         * 
         * This can be useful for performing cleanup, or update tasks which need to happen only
         * after all code in an event handler has been run, but which should not be executed in a timer
         * due to the intervening browser reflow/repaint which would take place.
         *
         */
        idleEvent: new Ext.util.Event(),

        /**
         * detects whether the EventManager has been placed in a paused state for synchronization
         * with external debugging / perf tools (PageAnalyzer)
         * @private
         */
        isReadyPaused: function(){
            return (/[?&]ext-pauseReadyFire\b/i.test(location.search) && !Ext._continueFireReady);
        },

        /**
         * Binds the appropriate browser event for checking if the DOM has loaded.
         * @private
         */
        bindReadyEvent: function() {
            if (EventManager.hasBoundOnReady) {
                return;
            }

            // Test scenario where Core is dynamically loaded AFTER window.load
            if ( doc.readyState == 'complete'  ) {  // Firefox4+ got support for this state, others already do.
                EventManager.onReadyEvent({
                    type: doc.readyState || 'body'
                });
            } else {
                doc.addEventListener('DOMContentLoaded', EventManager.onReadyEvent, false);
                win.addEventListener('load', EventManager.onReadyEvent, false);
                EventManager.hasBoundOnReady = true;
            }
        },

        onReadyEvent : function(e) {
            if (e && e.type) {
                EventManager.onReadyChain.push(e.type);
            }

            if (EventManager.hasBoundOnReady) {
                doc.removeEventListener('DOMContentLoaded', EventManager.onReadyEvent, false);
                win.removeEventListener('load', EventManager.onReadyEvent, false);
            }

            if (!Ext.isReady) {
                EventManager.fireDocReady();
            }
        },

        /**
         * We know the document is loaded, so trigger any onReady events.
         * @private
         */
        fireDocReady: function() {
            if (!Ext.isReady) {
                Ext._readyTime = new Date().getTime();
                Ext.isReady = true;

                Ext.supports.init();
                EventManager.onWindowUnload();
                readyEvent.onReadyChain = EventManager.onReadyChain;    //diags report

                if (Ext.isNumber(EventManager.deferReadyEvent)) {
                    Ext.Function.defer(EventManager.fireReadyEvent, EventManager.deferReadyEvent);
                    EventManager.hasDocReadyTimer = true;
                } else {
                    EventManager.fireReadyEvent();
                }
            }
        },

        /**
         * Fires the ready event
         * @private
         */
        fireReadyEvent: function() {

            // Unset the timer flag here since other onReady events may be
            // added during the fire() call and we don't want to block them
            EventManager.hasDocReadyTimer = false;
            EventManager.isFiring = true;

            // Ready events are all single: true, if we get to the end
            // & there are more listeners, it means they were added
            // inside some other ready event
            while (readyEvent.listeners.length && !EventManager.isReadyPaused()) {
                readyEvent.fire();
            }
            EventManager.isFiring = false;
            EventManager.hasFiredReady = true;
            Ext.EventManager.idleEvent.fire();
        },

        /**
         * Adds a listener to be notified when the document is ready (before onload and before images are loaded).
         *
         * {@link Ext#onDocumentReady} is an alias for {@link Ext.EventManager#onDocumentReady}.
         *
         * @param {Function} fn The method the event invokes.
         * @param {Object} [scope] The scope (`this` reference) in which the handler function executes.
         * Defaults to the browser window.
         * @param {Object} [options] Options object as passed to {@link Ext.Element#addListener}.
         */
        onDocumentReady: function(fn, scope, options) {
            options = options || {};
            // force single, only ever fire it once
            options.single = true;
            readyEvent.addListener(fn, scope, options);

            // If we're in the middle of firing, or we have a deferred timer
            // pending, drop out since the event will be fired  later
            if (!(EventManager.isFiring || EventManager.hasDocReadyTimer)) {
                if (Ext.isReady) {
                    EventManager.fireReadyEvent();
                } else {
                    EventManager.bindReadyEvent();
                }
            }
        },

        // --------------------- event binding ---------------------

        /**
         * Contains a list of all document mouse downs, so we can ensure they fire even when stopEvent is called.
         * @private
         */
        stoppedMouseDownEvent: new Ext.util.Event(),

        /**
         * Options to parse for the 4th argument to addListener.
         * @private
         */
        propRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|freezeEvent)$/,

        /**
         * Get the id of the element. If one has not been assigned, automatically assign it.
         * @param {HTMLElement/Ext.Element} element The element to get the id for.
         * @return {String} id
         */
        getId : function(element) {
            var id;

            element = Ext.getDom(element);

            if (element === doc || element === win) {
                id = element === doc ? Ext.documentId : Ext.windowId;
            }
            else {
                id = Ext.id(element);
            }

            if (!Ext.cache[id]) {
                Ext.addCacheEntry(id, null, element);
            }

            return id;
        },

        /**
         * Convert a "config style" listener into a set of flat arguments so they can be passed to addListener
         * @private
         * @param {Object} element The element the event is for
         * @param {Object} event The event configuration
         * @param {Object} isRemove True if a removal should be performed, otherwise an add will be done.
         */
        prepareListenerConfig: function(element, config, isRemove) {
            var propRe = EventManager.propRe,
                key, value, args;

            // loop over all the keys in the object
            for (key in config) {
                if (config.hasOwnProperty(key)) {
                    // if the key is something else then an event option
                    if (!propRe.test(key)) {
                        value = config[key];
                        // if the value is a function it must be something like click: function() {}, scope: this
                        // which means that there might be multiple event listeners with shared options
                        if (typeof value == 'function') {
                            // shared options
                            args = [element, key, value, config.scope, config];
                        } else {
                            // if its not a function, it must be an object like click: {fn: function() {}, scope: this}
                            args = [element, key, value.fn, value.scope, value];
                        }

                        if (isRemove) {
                            EventManager.removeListener.apply(EventManager, args);
                        } else {
                            EventManager.addListener.apply(EventManager, args);
                        }
                    }
                }
            }
        },

        mouseEnterLeaveRe: /mouseenter|mouseleave/,

        /**
         * Normalize cross browser event differences
         * @private
         * @param {Object} eventName The event name
         * @param {Object} fn The function to execute
         * @return {Object} The new event name/function
         */
        normalizeEvent: function(eventName, fn) {
            if (EventManager.mouseEnterLeaveRe.test(eventName) && !Ext.supports.MouseEnterLeave) {
                if (fn) {
                    fn = Ext.Function.createInterceptor(fn, EventManager.contains);
                }
                eventName = eventName == 'mouseenter' ? 'mouseover' : 'mouseout';
            } else if (eventName == 'mousewheel' && !Ext.supports.MouseWheel && !Ext.isOpera) {
                eventName = 'DOMMouseScroll';
            }
            return {
                eventName: eventName,
                fn: fn
            };
        },

        /**
         * Checks whether the event's relatedTarget is contained inside (or <b>is</b>) the element.
         * @private
         * @param {Object} event
         */
        contains: function(event) {
            event = event.browserEvent || event;
            var parent = event.currentTarget,
                child = EventManager.getRelatedTarget(event);

            if (parent && parent.firstChild) {
                while (child) {
                    if (child === parent) {
                        return false;
                    }
                    child = child.parentNode;
                    if (child && (child.nodeType != 1)) {
                        child = null;
                    }
                }
            }
            return true;
        },

        /**
         * Appends an event handler to an element.  The shorthand version {@link #on} is equivalent.
         * Typically you will use {@link Ext.Element#addListener} directly on an Element in favor of
         * calling this version.
         * 
         * {@link Ext.EventManager#on} is an alias for {@link Ext.EventManager#addListener}.
         *
         * @param {String/Ext.Element/HTMLElement/Window} el The html element or id to assign the event handler to.
         *
         * @param {String} eventName The name of the event to listen for.
         *
         * @param {Function/String} handler The handler function the event invokes. A String parameter
         * is assumed to be method name in `scope` object, or Element object if no scope is provided.
         * @param {Ext.EventObject} handler.event The {@link Ext.EventObject EventObject} describing the event.
         * @param {Ext.dom.Element} handler.target The Element which was the target of the event.
         * Note that this may be filtered by using the `delegate` option.
         * @param {Object} handler.options The options object from the addListener call.
         *
         * @param {Object} [scope] The scope (`this` reference) in which the handler function is executed.
         * Defaults to the Element.
         *
         * @param {Object} [options] An object containing handler configuration properties.
         * This may contain any of the following properties (See {@link Ext.Element#addListener}
         * for examples of how to use these options.):
         * @param {Object} options.scope The scope (`this` reference) in which the handler function is executed. Defaults to the Element.
         * @param {String} options.delegate A simple selector to filter the target or look for a descendant of the target
         * @param {Boolean} options.stopEvent True to stop the event. That is stop propagation, and prevent the default action.
         * @param {Boolean} options.preventDefault True to prevent the default action
         * @param {Boolean} options.stopPropagation True to prevent event propagation
         * @param {Boolean} options.normalized False to pass a browser event to the handler function instead of an Ext.EventObject
         * @param {Number} options.delay The number of milliseconds to delay the invocation of the handler after te event fires.
         * @param {Boolean} options.single True to add a handler to handle just the next firing of the event, and then remove itself.
         * @param {Number} options.buffer Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
         * by the specified number of milliseconds. If the event fires again within that time, the original
         * handler is *not* invoked, but the new handler is scheduled in its place.
         * @param {Ext.dom.Element} options.target Only call the handler if the event was fired on the target Element,
         * *not* if the event was bubbled up from a child node.
         */
        addListener: function(element, eventName, fn, scope, options) {
            // Check if we've been passed a "config style" event.
            if (typeof eventName !== 'string') {
                EventManager.prepareListenerConfig(element, eventName);
                return;
            }

            var dom = element.dom || Ext.getDom(element),
                hasAddEventListener, bind, wrap, cache, id, cacheItem, capture;
            
            if (typeof fn === 'string') {
                fn = Ext.resolveMethod(fn, scope || element);
            }

            if (!fn) {
                Ext.Error.raise({
                    sourceClass: 'Ext.EventManager',
                    sourceMethod: 'addListener',
                    targetElement: element,
                    eventName: eventName,
                    msg: 'Error adding "' + eventName + '\" listener. The handler function is undefined.'
                });
            }

            // create the wrapper function
            options = options || {};

            bind = EventManager.normalizeEvent(eventName, fn);
            wrap = EventManager.createListenerWrap(dom, eventName, bind.fn, scope, options);
            
            // add all required data into the event cache
            cache = EventManager.getEventListenerCache(element.dom ? element : dom, eventName);
            eventName = bind.eventName;

            // In IE9 we prefer to use attachEvent but it's not available for some Elements (SVG)
            hasAddEventListener = supportsAddEventListener || (Ext.isIE9 && !dom.attachEvent);
            
            if (!hasAddEventListener) {
                id = EventManager.normalizeId(dom);
                // If there's no id we don't have any events bound, so we never
                // need to clone at this point.
                if (id) {
                    cacheItem = Ext.cache[id][eventName];
                    if (cacheItem && cacheItem.firing) {
                        // If we're in the middle of firing we want to update the class
                        // cache reference so it is different to the array we referenced
                        // when we started firing the event. Though this is a more difficult
                        // way of not mutating the collection while firing, a vast majority of
                        // the time we won't be adding listeners for the same element/event type
                        // while firing the same event.
                        cache = EventManager.cloneEventListenerCache(dom, eventName);
                    }
                }
            }

            capture = !!options.capture;
            cache.push({
                fn: fn,
                wrap: wrap,
                scope: scope,
                capture: capture 
            });

            if (!hasAddEventListener) {
                // If cache length is 1, it means we're binding the first event
                // for this element for this type
                if (cache.length === 1) {
                    id = EventManager.normalizeId(dom, true);
                    fn = Ext.Function.bind(EventManager.handleSingleEvent, EventManager, [id, eventName], true);
                    Ext.cache[id][eventName] = {
                        firing: false,
                        fn: fn
                    };
                    dom.attachEvent('on' + eventName, fn);
                }
            } else {
                dom.addEventListener(eventName, wrap, capture);
            }

            if (dom == doc && eventName == 'mousedown') {
                EventManager.stoppedMouseDownEvent.addListener(wrap);
            }
        },
        
        // Handle the case where the window/document already has an id attached.
        // In this case we still want to return our custom window/doc id.
        normalizeId: function(dom, force) {
            var id;
            if (dom === document) {
                id = Ext.documentId;
            } else if (dom === window) {
                id = Ext.windowId;
            } else {
                id = dom.id;
            }
            if (!id && force) {
                id = EventManager.getId(dom);
            }
            return id;
        },
        
        handleSingleEvent: function(e, id, eventName) {
            // Don't create a copy here, since we fire lots of events and it's likely
            // that we won't add an event during a fire. Instead, we'll handle this during
            // the process of adding events 
            var listenerCache = EventManager.getEventListenerCache(id, eventName),
                attachItem = Ext.cache[id][eventName],
                len, i;
                
            // Typically this will never occur, however, the framework allows the creation
            // of synthetic events in Ext.EventObject. As such, it makes it possible to fire
            // off the same event on the same element during this method.
            if (attachItem.firing) {
                return;
            }
                
            attachItem.firing = true;
            for (i = 0, len = listenerCache.length; i < len; ++i) {
                listenerCache[i].wrap(e);
            }
            attachItem.firing = false;
            
        },

        /**
         * Removes an event handler from an element.  The shorthand version {@link #un} is equivalent.  Typically
         * you will use {@link Ext.Element#removeListener} directly on an Element in favor of calling this version.
         *
         * {@link Ext.EventManager#on} is an alias for {@link Ext.EventManager#addListener}.
         *
         * @param {String/Ext.Element/HTMLElement/Window} el The id or html element from which to remove the listener.
         * @param {String} eventName The name of the event.
         * @param {Function} fn The handler function to remove. **This must be a reference to the function passed
         * into the {@link #addListener} call.**
         * @param {Object} scope If a scope (`this` reference) was specified when the listener was added,
         * then this must refer to the same object.
         */
        removeListener : function(element, eventName, fn, scope) {
            // handle our listener config object syntax
            if (typeof eventName !== 'string') {
                EventManager.prepareListenerConfig(element, eventName, true);
                return;
            }

            var dom = Ext.getDom(element),
                id, el = element.dom ? element : Ext.get(dom),
                cache = EventManager.getEventListenerCache(el, eventName),
                bindName = EventManager.normalizeEvent(eventName).eventName,
                i = cache.length, j, cacheItem, hasRemoveEventListener,
                listener, wrap;
                
            if (!dom) {
                return;
            }

            // In IE9 we prefer to use detachEvent but it's not available for some Elements (SVG)
            hasRemoveEventListener = supportsAddEventListener || (Ext.isIE9 && !dom.detachEvent);
            
            if (typeof fn === 'string') {
                fn = Ext.resolveMethod(fn, scope || element);
            }

            while (i--) {
                listener = cache[i];

                if (listener && (!fn || listener.fn == fn) && (!scope || listener.scope === scope)) {
                    wrap = listener.wrap;

                    // clear buffered calls
                    if (wrap.task) {
                        clearTimeout(wrap.task);
                        delete wrap.task;
                    }

                    // clear delayed calls
                    j = wrap.tasks && wrap.tasks.length;
                    if (j) {
                        while (j--) {
                            clearTimeout(wrap.tasks[j]);
                        }
                        delete wrap.tasks;
                    }

                    if (!hasRemoveEventListener) {
                        // if length is 1, we're removing the final event, actually
                        // unbind it from the element
                        id = EventManager.normalizeId(dom, true);
                        cacheItem = Ext.cache[id][bindName];
                        if (cacheItem && cacheItem.firing) {
                            // See code in addListener for why we create a copy
                            cache = EventManager.cloneEventListenerCache(dom, bindName);
                        }
                        
                        if (cache.length === 1) {
                            fn = cacheItem.fn;
                            delete Ext.cache[id][bindName];
                            dom.detachEvent('on' + bindName, fn);
                        }
                    } else {
                        dom.removeEventListener(bindName, wrap, listener.capture);
                    }

                    if (wrap && dom == doc && eventName == 'mousedown') {
                        EventManager.stoppedMouseDownEvent.removeListener(wrap);
                    }

                    // remove listener from cache
                    Ext.Array.erase(cache, i, 1);
                }
            }
        },

        /**
         * Removes all event handers from an element.  Typically you will use {@link Ext.Element#removeAllListeners}
         * directly on an Element in favor of calling this version.
         * @param {String/Ext.Element/HTMLElement/Window} el The id or html element from which to remove all event handlers.
         */
        removeAll : function(element) {
            var id = (typeof element === 'string') ? element : element.id,
                cache, events, eventName;

            // If the element does not have an ID or a cache entry for its ID, then this is a no-op
            if (id && (cache = Ext.cache[id])) {
                events = cache.events;
    
                for (eventName in events) {
                    if (events.hasOwnProperty(eventName)) {
                        EventManager.removeListener(element, eventName);
                    }
                }
                cache.events = {};
             }
        },

        /**
         * Recursively removes all previous added listeners from an element and its children. Typically you will use {@link Ext.Element#purgeAllListeners}
         * directly on an Element in favor of calling this version.
         * @param {String/Ext.Element/HTMLElement/Window} el The id or html element from which to remove all event handlers.
         * @param {String} eventName (optional) The name of the event.
         */
        purgeElement : function(element, eventName) {
            var dom = Ext.getDom(element),
                i = 0, len, childNodes;

            if (eventName) {
                EventManager.removeListener(element, eventName);
            } else {
                EventManager.removeAll(element);
            }

            if (dom && dom.childNodes) {
                childNodes = dom.childNodes;
                for (len = childNodes.length; i < len; i++) {
                    EventManager.purgeElement(childNodes[i], eventName);
                }
            }
        },

        /**
         * Create the wrapper function for the event
         * @private
         * @param {HTMLElement} dom The dom element
         * @param {String} ename The event name
         * @param {Function} fn The function to execute
         * @param {Object} scope The scope to execute callback in
         * @param {Object} options The options
         * @return {Function} the wrapper function
         */
        createListenerWrap : function(dom, ename, fn, scope, options) {
            options = options || {};

            var f, gen, wrap = function(e, args) {
                // Compile the implementation upon first firing
                if (!gen) {
                    f = ['if(!' + Ext.name + ') {return;}'];

                    if (options.buffer || options.delay || options.freezeEvent) {
                        if (options.freezeEvent) {
                            // If we're freezing, we still want to update the singleton event object
                            // as well as returning a frozen copy
                            f.push('e = X.EventObject.setEvent(e);');
                        }
                        f.push('e = new X.EventObjectImpl(e, ' + (options.freezeEvent ? 'true' : 'false' ) + ');');
                    } else {
                        f.push('e = X.EventObject.setEvent(e);');
                    }

                    if (options.delegate) {
                        // double up '\' characters so escape sequences survive the
                        // string-literal translation
                        f.push('var result, t = e.getTarget("' + (options.delegate + '').replace(escapeRx, '\\\\') + '", this);');
                        f.push('if(!t) {return;}');
                    } else {
                        f.push('var t = e.target, result;');
                    }

                    if (options.target) {
                        f.push('if(e.target !== options.target) {return;}');
                    }

                    if (options.stopEvent) {
                        f.push('e.stopEvent();');
                    } else {
                        if(options.preventDefault) {
                            f.push('e.preventDefault();');
                        }
                        if(options.stopPropagation) {
                            f.push('e.stopPropagation();');
                        }
                    }

                    if (options.normalized === false) {
                        f.push('e = e.browserEvent;');
                    }

                    if (options.buffer) {
                        f.push('(wrap.task && clearTimeout(wrap.task));');
                        f.push('wrap.task = setTimeout(function() {');
                    }

                    if (options.delay) {
                        f.push('wrap.tasks = wrap.tasks || [];');
                        f.push('wrap.tasks.push(setTimeout(function() {');
                    }

                    // finally call the actual handler fn
                    f.push('result = fn.call(scope || dom, e, t, options);');

                    if (options.single) {
                        f.push('evtMgr.removeListener(dom, ename, fn, scope);');
                    }

                    // Fire the global idle event for all events except mousemove which is too common, and
                    // fires too frequently and fast to be use in tiggering onIdle processing. Do not fire on page unload.
                    if (ename !== 'mousemove' && ename !== 'unload') {
                        f.push('if (evtMgr.idleEvent.listeners.length) {');
                        f.push('evtMgr.idleEvent.fire();');
                        f.push('}');
                    }

                    if (options.delay) {
                        f.push('}, ' + options.delay + '));');
                    }

                    if (options.buffer) {
                        f.push('}, ' + options.buffer + ');');
                    }
                    f.push('return result;');

                    gen = Ext.cacheableFunctionFactory('e', 'options', 'fn', 'scope', 'ename', 'dom', 'wrap', 'args', 'X', 'evtMgr', f.join('\n'));
                }

                return gen.call(dom, e, options, fn, scope, ename, dom, wrap, args, Ext, EventManager);
            };
            return wrap;
        },
        
        /**
         * Gets the event cache object for a particular element
         * @private
         * @param {HTMLElement} element The element
         * @return {Object} The event cache object
         */
        getEventCache: function(element) {
            var elementCache, eventCache, id;
            
            if (!element) {
                return [];
            }

            if (element.$cache) {
                elementCache = element.$cache;
            } else {
                // getId will populate the cache for this element if it isn't already present
                if (typeof element === 'string') {
                    id = element;
                } else {
                    id = EventManager.getId(element);
                }
                elementCache = Ext.cache[id];
            }
            eventCache = elementCache.events || (elementCache.events = {});
            return eventCache;
        },

        /**
         * Get the event cache for a particular element for a particular event
         * @private
         * @param {HTMLElement} element The element
         * @param {Object} eventName The event name
         * @return {Array} The events for the element
         */
        getEventListenerCache : function(element, eventName) {
            var eventCache = EventManager.getEventCache(element);
            return eventCache[eventName] || (eventCache[eventName] = []);
        },
        
        /**
         * Clones the event cache for a particular element for a particular event
         * @private
         * @param {HTMLElement} element The element
         * @param {Object} eventName The event name
         * @return {Array} The cloned events for the element
         */
        cloneEventListenerCache: function(element, eventName){
            var eventCache = EventManager.getEventCache(element),
                out;
                
            if (eventCache[eventName]) {
                out = eventCache[eventName].slice(0);
            } else {
                out = [];
            }
            eventCache[eventName] = out;
            return out;
        },

        // --------------------- utility methods ---------------------
        mouseLeaveRe: /(mouseout|mouseleave)/,
        mouseEnterRe: /(mouseover|mouseenter)/,

        /**
         * Stop the event (preventDefault and stopPropagation)
         * @param {Event} event The event to stop
         */
        stopEvent: function(event) {
            EventManager.stopPropagation(event);
            EventManager.preventDefault(event);
        },

        /**
         * Cancels bubbling of the event.
         * @param {Event} event The event to stop bubbling.
         */
        stopPropagation: function(event) {
            event = event.browserEvent || event;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        /**
         * Prevents the browsers default handling of the event.
         * @param {Event} event The event to prevent the default
         */
        preventDefault: function(event) {
            event = event.browserEvent || event;
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
                // Some keys events require setting the keyCode to -1 to be prevented
                try {
                  // all ctrl + X and F1 -> F12
                  if (event.ctrlKey || event.keyCode > 111 && event.keyCode < 124) {
                      event.keyCode = -1;
                  }
                } catch (e) {
                    // see this outdated document http://support.microsoft.com/kb/934364/en-us for more info
                }
            }
        },

        /**
         * Gets the related target from the event.
         * @param {Object} event The event
         * @return {HTMLElement} The related target.
         */
        getRelatedTarget: function(event) {
            event = event.browserEvent || event;
            var target = event.relatedTarget;
            if (!target) {
                if (EventManager.mouseLeaveRe.test(event.type)) {
                    target = event.toElement;
                } else if (EventManager.mouseEnterRe.test(event.type)) {
                    target = event.fromElement;
                }
            }
            return EventManager.resolveTextNode(target);
        },

        /**
         * Gets the x coordinate from the event
         * @param {Object} event The event
         * @return {Number} The x coordinate
         */
        getPageX: function(event) {
            return EventManager.getPageXY(event)[0];
        },

        /**
         * Gets the y coordinate from the event
         * @param {Object} event The event
         * @return {Number} The y coordinate
         */
        getPageY: function(event) {
            return EventManager.getPageXY(event)[1];
        },

        /**
         * Gets the x & y coordinate from the event
         * @param {Object} event The event
         * @return {Number[]} The x/y coordinate
         */
        getPageXY: function(event) {
            event = event.browserEvent || event;
            var x = event.pageX,
                y = event.pageY,
                docEl = doc.documentElement,
                body = doc.body;

            // pageX/pageY not available (undefined, not null), use clientX/clientY instead
            if (!x && x !== 0) {
                x = event.clientX + (docEl && docEl.scrollLeft || body && body.scrollLeft || 0) - (docEl && docEl.clientLeft || body && body.clientLeft || 0);
                y = event.clientY + (docEl && docEl.scrollTop  || body && body.scrollTop  || 0) - (docEl && docEl.clientTop  || body && body.clientTop  || 0);
            }
            return [x, y];
        },

        /**
         * Gets the target of the event.
         * @param {Object} event The event
         * @return {HTMLElement} target
         */
        getTarget: function(event) {
            event = event.browserEvent || event;
            return EventManager.resolveTextNode(event.target || event.srcElement);
        },

        // technically no need to browser sniff this, however it makes
        // no sense to check this every time, for every event, whether
        // the string is equal.
        /**
         * Resolve any text nodes accounting for browser differences.
         * @private
         * @param {HTMLElement} node The node
         * @return {HTMLElement} The resolved node
         */
        resolveTextNode: Ext.isGecko ?
            function(node) {
                if (node) {
                    // work around firefox bug, https://bugzilla.mozilla.org/show_bug.cgi?id=101197
                    var s = HTMLElement.prototype.toString.call(node);
                    if (s !== '[xpconnect wrapped native prototype]' && s !== '[object XULElement]') {
                        return node.nodeType == 3 ? node.parentNode: node;
                    }
                }
            }
            :
            function(node) {
                return node && node.nodeType == 3 ? node.parentNode: node;
            },

        // --------------------- custom event binding ---------------------

        // Keep track of the current width/height
        curWidth: 0,
        curHeight: 0,

        /**
         * Adds a listener to be notified when the browser window is resized and provides resize event buffering (100 milliseconds),
         * passes new viewport width and height to handlers.
         * @param {Function} fn      The handler function the window resize event invokes.
         * @param {Object}   scope   The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
         * @param {Boolean}  [options] Options object as passed to {@link Ext.Element#addListener}
         */
        onWindowResize: function(fn, scope, options) {
            var resize = EventManager.resizeEvent;

            if (!resize) {
                EventManager.resizeEvent = resize = new Ext.util.Event();
                EventManager.on(win, 'resize', EventManager.fireResize, null, {buffer: 100});
            }
            resize.addListener(fn, scope, options);
        },

        /**
         * Fire the resize event.
         * @private
         */
        fireResize: function() {
            var w = Ext.Element.getViewWidth(),
                h = Ext.Element.getViewHeight();

             //whacky problem in IE where the resize event will sometimes fire even though the w/h are the same.
             if (EventManager.curHeight != h || EventManager.curWidth != w) {
                 EventManager.curHeight = h;
                 EventManager.curWidth = w;
                 EventManager.resizeEvent.fire(w, h);
             }
        },

        /**
         * Removes the passed window resize listener.
         * @param {Function} fn        The method the event invokes
         * @param {Object}   scope    The scope of handler
         */
        removeResizeListener: function(fn, scope) {
            var resize = EventManager.resizeEvent;
            if (resize) {
                resize.removeListener(fn, scope);
            }
        },

        /**
         * Adds a listener to be notified when the browser window is unloaded.
         * @param {Function} fn      The handler function the window unload event invokes.
         * @param {Object}   scope   The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
         * @param {Boolean}  options Options object as passed to {@link Ext.Element#addListener}
         */
        onWindowUnload: function(fn, scope, options) {
            var unload = EventManager.unloadEvent;

            if (!unload) {
                EventManager.unloadEvent = unload = new Ext.util.Event();
                EventManager.addListener(win, 'unload', EventManager.fireUnload);
            }
            if (fn) {
                unload.addListener(fn, scope, options);
            }
        },

        /**
         * Fires the unload event for items bound with onWindowUnload
         * @private
         */
        fireUnload: function() {
            // wrap in a try catch, could have some problems during unload
            try {
                // relinquish references.
                doc = win = undefined;

                var gridviews, i, ln,
                    el, cache;

                EventManager.unloadEvent.fire();
                // Work around FF3 remembering the last scroll position when refreshing the grid and then losing grid view
                if (Ext.isGecko3) {
                    gridviews = Ext.ComponentQuery.query('gridview');
                    i = 0;
                    ln = gridviews.length;
                    for (; i < ln; i++) {
                        gridviews[i].scrollToTop();
                    }
                }
                // Purge all elements in the cache
                cache = Ext.cache;

                for (el in cache) {
                    if (cache.hasOwnProperty(el)) {
                        EventManager.removeAll(el);
                    }
                }
            } catch(e) {
            }
        },

        /**
         * Removes the passed window unload listener.
         * @param {Function} fn        The method the event invokes
         * @param {Object}   scope    The scope of handler
         */
        removeUnloadListener: function(fn, scope) {
            var unload = EventManager.unloadEvent;
            if (unload) {
                unload.removeListener(fn, scope);
            }
        },

        /**
         * note 1: IE fires ONLY the keydown event on specialkey autorepeat
         * note 2: Safari < 3.1, Gecko (Mac/Linux) & Opera fire only the keypress event on specialkey autorepeat
         * (research done by Jan Wolter at http://unixpapa.com/js/key.html)
         * @private
         */
        useKeyDown: Ext.isWebKit ?
                       parseInt(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1], 10) >= 525 :
                       !((Ext.isGecko && !Ext.isWindows) || Ext.isOpera),

        /**
         * Indicates which event to use for getting key presses.
         * @return {String} The appropriate event name.
         */
        getKeyEvent: function() {
            return EventManager.useKeyDown ? 'keydown' : 'keypress';
        }
    });

    // route "< ie9-Standards" to a legacy IE onReady implementation
    if(!supportsAddEventListener && document.attachEvent) {
        Ext.apply( EventManager, {
            /* Customized implementation for Legacy IE.  The default implementation is configured for use
             *  with all other 'standards compliant' agents.
             *  References: http://javascript.nwbox.com/IEContentLoaded/
             *  licensed courtesy of http://developer.yahoo.com/yui/license.html
             */

            /**
             * This strategy has minimal benefits for Sencha solutions that build themselves (ie. minimal initial page markup).
             * However, progressively-enhanced pages (with image content and/or embedded frames) will benefit the most from it.
             * Browser timer resolution is too poor to ensure a doScroll check more than once on a page loaded with minimal
             * assets (the readystatechange event 'complete' usually beats the doScroll timer on a 'lightly-loaded' initial document).
             */
            pollScroll : function() {
                var scrollable = true;

                try {
                    document.documentElement.doScroll('left');
                } catch(e) {
                    scrollable = false;
                }

                // on IE8, when running within an iFrame, document.body is not immediately available
                if (scrollable && document.body) {
                    EventManager.onReadyEvent({
                        type:'doScroll'
                    });
                } else {
                    /*
                     * minimize thrashing --
                     * adjusted for setTimeout's close-to-minimums (not too low),
                     * as this method SHOULD always be called once initially
                     */
                    EventManager.scrollTimeout = setTimeout(EventManager.pollScroll, 20);
                }

                return scrollable;
            },

            /**
             * Timer for doScroll polling
             * @private
             */
            scrollTimeout: null,

            /* @private
             */
            readyStatesRe  : /complete/i,

            /* @private
             */
            checkReadyState: function() {
                var state = document.readyState;

                if (EventManager.readyStatesRe.test(state)) {
                    EventManager.onReadyEvent({
                        type: state
                    });
                }
            },

            bindReadyEvent: function() {
                var topContext = true;

                if (EventManager.hasBoundOnReady) {
                    return;
                }

                //are we in an IFRAME? (doScroll ineffective here)
                try {
                    topContext = window.frameElement === undefined;
                } catch(e) {
                    // If we throw an exception, it means we're probably getting access denied,
                    // which means we're in an iframe cross domain.
                    topContext = false;
                }

                if (!topContext || !doc.documentElement.doScroll) {
                    EventManager.pollScroll = Ext.emptyFn;   //then noop this test altogether
                }

                // starts doScroll polling if necessary
                if (EventManager.pollScroll() === true) {
                    return;
                }

                // Core is loaded AFTER initial document write/load ?
                if (doc.readyState == 'complete' )  {
                    EventManager.onReadyEvent({type: 'already ' + (doc.readyState || 'body') });
                } else {
                    doc.attachEvent('onreadystatechange', EventManager.checkReadyState);
                    window.attachEvent('onload', EventManager.onReadyEvent);
                    EventManager.hasBoundOnReady = true;
                }
            },

            onReadyEvent : function(e) {
                if (e && e.type) {
                    EventManager.onReadyChain.push(e.type);
                }

                if (EventManager.hasBoundOnReady) {
                    document.detachEvent('onreadystatechange', EventManager.checkReadyState);
                    window.detachEvent('onload', EventManager.onReadyEvent);
                }

                if (Ext.isNumber(EventManager.scrollTimeout)) {
                    clearTimeout(EventManager.scrollTimeout);
                    delete EventManager.scrollTimeout;
                }

                if (!Ext.isReady) {
                    EventManager.fireDocReady();
                }
            },

            //diags: a list of event types passed to onReadyEvent (in chron order)
            onReadyChain : []
        });
    }


    /**
     * Adds a function to be called when the DOM is ready, and all required classes have been loaded.
     * 
     * If the DOM is ready and all classes are loaded, the passed function is executed immediately.
     * @member Ext
     * @method onReady
     * @param {Function} fn The function callback to be executed
     * @param {Object} scope The execution scope (`this` reference) of the callback function
     * @param {Object} options The options to modify the listener as passed to {@link Ext.util.Observable#addListener addListener}.
     */
    Ext.onReady = function(fn, scope, options) {
        Ext.Loader.onReady(fn, scope, true, options);
    };

    /**
     * @member Ext
     * @method onDocumentReady
     * @inheritdoc Ext.EventManager#onDocumentReady
     */
    Ext.onDocumentReady = EventManager.onDocumentReady;

    /**
     * @member Ext.EventManager
     * @method on
     * @inheritdoc Ext.EventManager#addListener
     */
    EventManager.on = EventManager.addListener;

    /**
     * @member Ext.EventManager
     * @method un
     * @inheritdoc Ext.EventManager#removeListener
     */
    EventManager.un = EventManager.removeListener;

    Ext.onReady(initExtCss);
};

// @tag core
/**
 * Base class that provides a common interface for publishing events. Subclasses are expected to to have a property
 * "events" with all the events defined, and, optionally, a property "listeners" with configured listeners defined.
 *
 * For example:
 *
 *     Ext.define('Employee', {
 *         mixins: {
 *             observable: 'Ext.util.Observable'
 *         },
 *
 *         constructor: function (config) {
 *             // The Observable constructor copies all of the properties of `config` on
 *             // to `this` using {@link Ext#apply}. Further, the `listeners` property is
 *             // processed to add listeners.
 *             //
 *             this.mixins.observable.constructor.call(this, config);
 *
 *             this.addEvents(
 *                 'fired',
 *                 'quit'
 *             );
 *         }
 *     });
 *
 * This could then be used like this:
 *
 *     var newEmployee = new Employee({
 *         name: employeeName,
 *         listeners: {
 *             quit: function() {
 *                 // By default, "this" will be the object that fired the event.
 *                 alert(this.name + " has quit!");
 *             }
 *         }
 *     });
 */
Ext.define('Ext.util.Observable', function(Observable) {

    // Private Destroyable class which removes listeners
    var emptyArray = [],
        arrayProto = Array.prototype,
        arraySlice = arrayProto.slice,
        ExtEvent = Ext.util.Event,
        ListenerRemover = function(observable) {

            // Passed a ListenerRemover: return it
            if (observable instanceof ListenerRemover) {
                return observable;
            }

            this.observable = observable;

            // Called when addManagedListener is used with the event source as the second arg:
            // (owner, eventSource, args...)
            if (arguments[1].isObservable) {
                this.managedListeners = true;
            }
            this.args = arraySlice.call(arguments, 1);
        };

    ListenerRemover.prototype.destroy = function() {
        this.observable[this.managedListeners ? 'mun' : 'un'].apply(this.observable, this.args);
    };

    return {

        /* Begin Definitions */

                                                         

        statics: {
            /**
            * Removes **all** added captures from the Observable.
            *
            * @param {Ext.util.Observable} o The Observable to release
            * @static
            */
            releaseCapture: function(o) {
                o.fireEventArgs = this.prototype.fireEventArgs;
            },

            /**
            * Starts capture on the specified Observable. All events will be passed to the supplied function with the event
            * name + standard signature of the event **before** the event is fired. If the supplied function returns false,
            * the event will not fire.
            *
            * @param {Ext.util.Observable} o The Observable to capture events from.
            * @param {Function} fn The function to call when an event is fired.
            * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed. Defaults to
            * the Observable firing the event.
            * @static
            */
            capture: function(o, fn, scope) {
                // We're capturing calls to fireEventArgs to avoid duplication of events;
                // however fn expects fireEvent's signature so we have to convert it here.
                // To avoid unnecessary conversions, observe() below is aware of the changes
                // and will capture fireEventArgs instead.
                var newFn = function(eventName, args) {
                    return fn.apply(scope, [eventName].concat(args));
                }
                
                this.captureArgs(o, newFn, scope);
            },
            
            /**
             * @private
             */
            captureArgs: function(o, fn, scope) {
                o.fireEventArgs = Ext.Function.createInterceptor(o.fireEventArgs, fn, scope);
            },

            /**
            * Sets observability on the passed class constructor.
            *
            * This makes any event fired on any instance of the passed class also fire a single event through
            * the **class** allowing for central handling of events on many instances at once.
            *
            * Usage:
            *
            *     Ext.util.Observable.observe(Ext.data.Connection);
            *     Ext.data.Connection.on('beforerequest', function(con, options) {
            *         console.log('Ajax request made to ' + options.url);
            *     });
            *
            * @param {Function} c The class constructor to make observable.
            * @param {Object} listeners An object containing a series of listeners to add. See {@link #addListener}.
            * @static
            */
            observe: function(cls, listeners) {
                if (cls) {
                    if (!cls.isObservable) {
                        Ext.applyIf(cls, new this());
                        this.captureArgs(cls.prototype, cls.fireEventArgs, cls);
                    }
                    if (Ext.isObject(listeners)) {
                        cls.on(listeners);
                    }
                }
                return cls;
            },

            /**
            * Prepares a given class for observable instances. This method is called when a
            * class derives from this class or uses this class as a mixin.
            * @param {Function} T The class constructor to prepare.
            * @private
            */
            prepareClass: function (T, mixin) {
                // T.hasListeners is the object to track listeners on class T. This object's
                // prototype (__proto__) is the "hasListeners" of T.superclass.

                // Instances of T will create "hasListeners" that have T.hasListeners as their
                // immediate prototype (__proto__).

                if (!T.HasListeners) {
                    // We create a HasListeners "class" for this class. The "prototype" of the
                    // HasListeners class is an instance of the HasListeners class associated
                    // with this class's super class (or with Observable).
                    var HasListeners = function () {},
                        SuperHL = T.superclass.HasListeners || (mixin && mixin.HasListeners) ||
                                Observable.HasListeners;

                    // Make the HasListener class available on the class and its prototype:
                    T.prototype.HasListeners = T.HasListeners = HasListeners;

                    // And connect its "prototype" to the new HasListeners of our super class
                    // (which is also the class-level "hasListeners" instance).
                    HasListeners.prototype = T.hasListeners = new SuperHL();
                }
            }
        },

        /* End Definitions */

        /**
        * @cfg {Object} listeners
        *
        * A config object containing one or more event handlers to be added to this object during initialization. This
        * should be a valid listeners config object as specified in the {@link #addListener} example for attaching multiple
        * handlers at once.
        *
        * **DOM events from Ext JS {@link Ext.Component Components}**
        *
        * While _some_ Ext JS Component classes export selected DOM events (e.g. "click", "mouseover" etc), this is usually
        * only done when extra value can be added. For example the {@link Ext.view.View DataView}'s **`{@link
        * Ext.view.View#itemclick itemclick}`** event passing the node clicked on. To access DOM events directly from a
        * child element of a Component, we need to specify the `element` option to identify the Component property to add a
        * DOM listener to:
        *
        *     new Ext.panel.Panel({
        *         width: 400,
        *         height: 200,
        *         dockedItems: [{
        *             xtype: 'toolbar'
        *         }],
        *         listeners: {
        *             click: {
        *                 element: 'el', //bind to the underlying el property on the panel
        *                 fn: function(){ console.log('click el'); }
        *             },
        *             dblclick: {
        *                 element: 'body', //bind to the underlying body property on the panel
        *                 fn: function(){ console.log('dblclick body'); }
        *             }
        *         }
        *     });
        */

        /**
        * @property {Boolean} isObservable
        * `true` in this class to identify an object as an instantiated Observable, or subclass thereof.
        */
        isObservable: true,

        /**
        * @private
        * Initial suspended call count. Incremented when {@link #suspendEvents} is called, decremented when {@link #resumeEvents} is called.
        */
        eventsSuspended: 0,

        /**
        * @property {Object} hasListeners
        * @readonly
        * This object holds a key for any event that has a listener. The listener may be set
        * directly on the instance, or on its class or a super class (via {@link #observe}) or
        * on the {@link Ext.app.EventBus MVC EventBus}. The values of this object are truthy
        * (a non-zero number) and falsy (0 or undefined). They do not represent an exact count
        * of listeners. The value for an event is truthy if the event must be fired and is
        * falsy if there is no need to fire the event.
        * 
        * The intended use of this property is to avoid the expense of fireEvent calls when
        * there are no listeners. This can be particularly helpful when one would otherwise
        * have to call fireEvent hundreds or thousands of times. It is used like this:
        * 
        *      if (this.hasListeners.foo) {
        *          this.fireEvent('foo', this, arg1);
        *      }
        */

        constructor: function(config) {
            var me = this;

            Ext.apply(me, config);

            // The subclass may have already initialized it.
            if (!me.hasListeners) {
                me.hasListeners = new me.HasListeners();
            }

            me.events = me.events || {};
            if (me.listeners) {
                me.on(me.listeners);
                me.listeners = null; //Set as an instance property to pre-empt the prototype in case any are set there.
            }

            if (me.bubbleEvents) {
                me.enableBubble(me.bubbleEvents);
            }
        },

        onClassExtended: function (T) {
            if (!T.HasListeners) {
                // Some classes derive from us and some others derive from those classes. All
                // of these are passed to this method.
                Observable.prepareClass(T);
            }
        },

        // @private
        // Matches options property names within a listeners specification object  - property names which are never used as event names.
        eventOptionsRe : /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|element|destroyable|vertical|horizontal|freezeEvent|priority)$/,

        /**
        * Adds listeners to any Observable object (or Ext.Element) which are automatically removed when this Component is
        * destroyed.
        *
        * @param {Ext.util.Observable/Ext.Element} item The item to which to add a listener/listeners.
        * @param {Object/String} ename The event name, or an object containing event name properties.
        * @param {Function} fn (optional) If the `ename` parameter was an event name, this is the handler function.
        * @param {Object} scope (optional) If the `ename` parameter was an event name, this is the scope (`this` reference)
        * in which the handler function is executed.
        * @param {Object} options (optional) If the `ename` parameter was an event name, this is the
        * {@link Ext.util.Observable#addListener addListener} options.
        * @return {Object} **Only when the `destroyable` option is specified. **
        *
        *  A `Destroyable` object. An object which implements the `destroy` method which removes all listeners added in this call. For example:
        *
        *     this.btnListeners =  = myButton.mon({
        *         destroyable: true
        *         mouseover:   function() { console.log('mouseover'); },
        *         mouseout:    function() { console.log('mouseout'); },
        *         click:       function() { console.log('click'); }
        *     });
        *
        * And when those listeners need to be removed:
        *
        *     Ext.destroy(this.btnListeners);
        *
        * or
        *
        *     this.btnListeners.destroy();
        */
        addManagedListener: function(item, ename, fn, scope, options, /* private */ noDestroy) {
            var me = this,
                managedListeners = me.managedListeners = me.managedListeners || [],
                config, passedOptions;

            if (typeof ename !== 'string') {
                // When creating listeners using the object form, allow caller to override the default of
                // using the listeners object as options.
                // This is used by relayEvents, when adding its relayer so that it does not contibute
                // a spurious options param to the end of the arg list.
                passedOptions = arguments.length > 4 ? options : ename;

                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!me.eventOptionsRe.test(ename)) {
                            // recurse, but pass the noDestroy parameter as true so that lots of individual Destroyables are not created.
                            // We create a single one at the end if necessary.
                            me.addManagedListener(item, ename, config.fn || config, config.scope || options.scope || scope, config.fn ? config : passedOptions, true);
                        }
                    }
                }
                if (options && options.destroyable) {
                    return new ListenerRemover(me, item, options);
                }
            }
            else {
                if (typeof fn === 'string') {
                    scope = scope || me;
                    fn = Ext.resolveMethod(fn, scope);
                }
                
                managedListeners.push({
                    item: item,
                    ename: ename,
                    fn: fn,
                    scope: scope,
                    options: options
                });

                item.on(ename, fn, scope, options);

                // The 'noDestroy' flag is sent if we're looping through a hash of listeners passing each one to addManagedListener separately
                if (!noDestroy && options && options.destroyable) {
                    return new ListenerRemover(me, item, ename, fn, scope);
                }
            }
        },

        /**
        * Removes listeners that were added by the {@link #mon} method.
        *
        * @param {Ext.util.Observable/Ext.Element} item The item from which to remove a listener/listeners.
        * @param {Object/String} ename The event name, or an object containing event name properties.
        * @param {Function} fn (optional) If the `ename` parameter was an event name, this is the handler function.
        * @param {Object} scope (optional) If the `ename` parameter was an event name, this is the scope (`this` reference)
        * in which the handler function is executed.
        */
        removeManagedListener: function(item, ename, fn, scope) {
            var me = this,
                options,
                config,
                managedListeners,
                length,
                i, func;

            if (typeof ename !== 'string') {
                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!me.eventOptionsRe.test(ename)) {
                            me.removeManagedListener(item, ename, config.fn || config, config.scope || options.scope || scope);
                        }
                    }
                }
            } else {
                managedListeners = me.managedListeners ? me.managedListeners.slice() : [];
                
                if (typeof fn === 'string') {
                    scope = scope || me;
                    fn = Ext.resolveMethod(fn, scope);
                }

                for (i = 0, length = managedListeners.length; i < length; i++) {
                    me.removeManagedListenerItem(false, managedListeners[i], item, ename, fn, scope);
                }
            }
        },

        /**
        * Fires the specified event with the passed parameters (minus the event name, plus the `options` object passed
        * to {@link #addListener}).
        *
        * An event may be set to bubble up an Observable parent hierarchy (See {@link Ext.Component#getBubbleTarget}) by
        * calling {@link #enableBubble}.
        *
        * @param {String} eventName The name of the event to fire.
        * @param {Object...} args Variable number of parameters are passed to handlers.
        * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
        */
        fireEvent: function(eventName) {
            return this.fireEventArgs(eventName, arraySlice.call(arguments, 1));
        },

        /**
        * Fires the specified event with the passed parameter list.
        *
        * An event may be set to bubble up an Observable parent hierarchy (See {@link Ext.Component#getBubbleTarget}) by
        * calling {@link #enableBubble}.
        *
        * @param {String} eventName The name of the event to fire.
        * @param {Object[]} args An array of parameters which are passed to handlers.
        * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
        */
        fireEventArgs: function(eventName, args) {
            eventName = eventName.toLowerCase();
            var me = this,
                events = me.events,
                event = events && events[eventName],
                ret = true;

            // Only continue firing the event if there are listeners to be informed.
            // Bubbled events will always have a listener count, so will be fired.
            if (event && me.hasListeners[eventName]) {
                ret = me.continueFireEvent(eventName, args || emptyArray, event.bubble);
            }
            return ret;
        },

        /**
        * Continue to fire event.
        * @private
        *
        * @param {String} eventName
        * @param {Array} args
        * @param {Boolean} bubbles
        */
        continueFireEvent: function(eventName, args, bubbles) {
            var target = this,
                queue, event,
                ret = true;

            do {
                if (target.eventsSuspended) {
                    if ((queue = target.eventQueue)) {
                        queue.push([eventName, args, bubbles]);
                    }
                    return ret;
                } else {
                    event = target.events[eventName];
                    // Continue bubbling if event exists and it is `true` or the handler didn't returns false and it
                    // configure to bubble.
                    if (event && event !== true) {
                        if ((ret = event.fire.apply(event, args)) === false) {
                            break;
                        }
                    }
                }
            } while (bubbles && (target = target.getBubbleParent()));
            return ret;
        },

        /**
        * Gets the bubbling parent for an Observable
        * @private
        * @return {Ext.util.Observable} The bubble parent. null is returned if no bubble target exists
        */
        getBubbleParent: function() {
            var me = this, parent = me.getBubbleTarget && me.getBubbleTarget();
            if (parent && parent.isObservable) {
                return parent;
            }
            return null;
        },

        /**
        * Appends an event handler to this object.  For example:
        *
        *     myGridPanel.on("mouseover", this.onMouseOver, this);
        *
        * The method also allows for a single argument to be passed which is a config object
        * containing properties which specify multiple events. For example:
        *
        *     myGridPanel.on({
        *         cellClick: this.onCellClick,
        *         mouseover: this.onMouseOver,
        *         mouseout: this.onMouseOut,
        *         scope: this // Important. Ensure "this" is correct during handler execution
        *     });
        *
        * One can also specify options for each event handler separately:
        *
        *     myGridPanel.on({
        *         cellClick: {fn: this.onCellClick, scope: this, single: true},
        *         mouseover: {fn: panel.onMouseOver, scope: panel}
        *     });
        *
        * *Names* of methods in a specified scope may also be used. Note that
        * `scope` MUST be specified to use this option:
        *
        *     myGridPanel.on({
        *         cellClick: {fn: 'onCellClick', scope: this, single: true},
        *         mouseover: {fn: 'onMouseOver', scope: panel}
        *     });
        *
        * @param {String/Object} eventName The name of the event to listen for.
        * May also be an object who's property names are event names.
        *
        * @param {Function} [fn] The method the event invokes, or *if `scope` is specified, the *name* of the method within
        * the specified `scope`.  Will be called with arguments
        * given to {@link Ext.util.Observable#fireEvent} plus the `options` parameter described below.
        *
        * @param {Object} [scope] The scope (`this` reference) in which the handler function is
        * executed. **If omitted, defaults to the object which fired the event.**
        *
        * @param {Object} [options] An object containing handler configuration.
        *
        * **Note:** Unlike in ExtJS 3.x, the options object will also be passed as the last
        * argument to every event handler.
        *
        * This object may contain any of the following properties:
        *
        * @param {Object} options.scope
        *   The scope (`this` reference) in which the handler function is executed. **If omitted,
        *   defaults to the object which fired the event.**
        *
        * @param {Number} options.delay
        *   The number of milliseconds to delay the invocation of the handler after the event fires.
        *
        * @param {Boolean} options.single
        *   True to add a handler to handle just the next firing of the event, and then remove itself.
        *
        * @param {Number} options.buffer
        *   Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
        *   by the specified number of milliseconds. If the event fires again within that time,
        *   the original handler is _not_ invoked, but the new handler is scheduled in its place.
        *
        * @param {Ext.util.Observable} options.target
        *   Only call the handler if the event was fired on the target Observable, _not_ if the event
        *   was bubbled up from a child Observable.
        *
        * @param {String} options.element
        *   **This option is only valid for listeners bound to {@link Ext.Component Components}.**
        *   The name of a Component property which references an element to add a listener to.
        *
        *   This option is useful during Component construction to add DOM event listeners to elements of
        *   {@link Ext.Component Components} which will exist only after the Component is rendered.
        *   For example, to add a click listener to a Panel's body:
        *
        *       new Ext.panel.Panel({
        *           title: 'The title',
        *           listeners: {
        *               click: this.handlePanelClick,
        *               element: 'body'
        *           }
        *       });
        *
        * @param {Boolean} [options.destroyable=false]
        *   When specified as `true`, the function returns A `Destroyable` object. An object which implements the `destroy` method which removes all listeners added in this call.
        *   
        * @param {Number} [options.priority]
        *   An optional numeric priority that determines the order in which event handlers
        *   are run. Event handlers with no priority will be run as if they had a priority
        *   of 0. Handlers with a higher priority will be prioritized to run sooner than
        *   those with a lower priority.  Negative numbers can be used to set a priority
        *   lower than the default. Internally, the framework uses a range of 1000 or
        *   greater, and -1000 or lesser for handers that are intended to run before or
        *   after all others, so it is recommended to stay within the range of -999 to 999
        *   when setting the priority of event handlers in application-level code.
        *
        * **Combining Options**
        *
        * Using the options argument, it is possible to combine different types of listeners:
        *
        * A delayed, one-time listener.
        *
        *     myPanel.on('hide', this.handleClick, this, {
        *         single: true,
        *         delay: 100
        *     });
        *
        * @return {Object} **Only when the `destroyable` option is specified. **
        *
        *  A `Destroyable` object. An object which implements the `destroy` method which removes all listeners added in this call. For example:
        *
        *     this.btnListeners =  = myButton.on({
        *         destroyable: true
        *         mouseover:   function() { console.log('mouseover'); },
        *         mouseout:    function() { console.log('mouseout'); },
        *         click:       function() { console.log('click'); }
        *     });
        *
        * And when those listeners need to be removed:
        *
        *     Ext.destroy(this.btnListeners);
        *
        * or
        *
        *     this.btnListeners.destroy();
        */
        addListener: function(ename, fn, scope, options) {
            var me = this,
                config, event,
                prevListenerCount = 0;

            // Object listener hash passed
            if (typeof ename !== 'string') {
                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!me.eventOptionsRe.test(ename)) {
                            /* This would be an API change so check removed until https://sencha.jira.com/browse/EXTJSIV-7183 is fully implemented in 4.2
                            // Test must go here as well as in the simple form because of the attempted property access here on the config object.
                            if (!config || (typeof config !== 'function' && !config.fn)) {
                                Ext.Error.raise('No function passed for event ' + me.$className + '.' + ename);
                            }
                            */
                            me.addListener(ename, config.fn || config, config.scope || options.scope, config.fn ? config : options);
                        }
                    }
                }
                if (options && options.destroyable) {
                    return new ListenerRemover(me, options);
                }
            }
            // String, function passed
            else {
                ename = ename.toLowerCase();
                event = me.events[ename];
                if (event && event.isEvent) {
                    prevListenerCount = event.listeners.length;
                } else {
                    me.events[ename] = event = new ExtEvent(me, ename);
                }
                if (!fn) {
                    Ext.Error.raise('No function passed for event ' + me.$className + '.' + ename);
                }

                // Allow listeners: { click: 'onClick', scope: myObject }
                if (typeof fn === 'string') {
                    scope = scope || me;
                    fn = Ext.resolveMethod(fn, scope);
                }
                event.addListener(fn, scope, options);

                // If a new listener has been added (Event.addListener rejects duplicates of the same fn+scope)
                // then increment the hasListeners counter
                if (event.listeners.length !== prevListenerCount) {
                    me.hasListeners._incr_(ename);
                }
                if (options && options.destroyable) {
                    return new ListenerRemover(me, ename, fn, scope, options);
                }
            }
        },

        /**
        * Removes an event handler.
        *
        * @param {String} eventName The type of event the handler was associated with.
        * @param {Function} fn The handler to remove. **This must be a reference to the function passed into the
        * {@link Ext.util.Observable#addListener} call.**
        * @param {Object} scope (optional) The scope originally specified for the handler. It must be the same as the
        * scope argument specified in the original call to {@link Ext.util.Observable#addListener} or the listener will not be removed.
        */
        removeListener: function(ename, fn, scope) {
            var me = this,
                config,
                event,
                options;

            if (typeof ename !== 'string') {
                options = ename;
                for (ename in options) {
                    if (options.hasOwnProperty(ename)) {
                        config = options[ename];
                        if (!me.eventOptionsRe.test(ename)) {
                            me.removeListener(ename, config.fn || config, config.scope || options.scope);
                        }
                    }
                }
            } else {
                ename = ename.toLowerCase();
                event = me.events[ename];
                if (event && event.isEvent) {
                    if (typeof fn === 'string') {
                        scope = scope || me;
                        fn = Ext.resolveMethod(fn, scope);
                    }
                    
                    if (event.removeListener(fn, scope)) {
                        me.hasListeners._decr_(ename);
                    }
                }
            }
        },

        /**
        * Removes all listeners for this object including the managed listeners
        */
        clearListeners: function() {
            var events = this.events,
                hasListeners = this.hasListeners,
                event,
                key;

            for (key in events) {
                if (events.hasOwnProperty(key)) {
                    event = events[key];
                    if (event.isEvent) {
                        delete hasListeners[key];
                        event.clearListeners();
                    }
                }
            }

            this.clearManagedListeners();
        },

        purgeListeners : function() {
            if (Ext.global.console) {
                Ext.global.console.warn('Observable: purgeListeners has been deprecated. Please use clearListeners.');
            }
            return this.clearListeners.apply(this, arguments);
        },

        /**
        * Removes all managed listeners for this object.
        */
        clearManagedListeners : function() {
            var managedListeners = this.managedListeners || [],
                i = 0,
                len = managedListeners.length;

            for (; i < len; i++) {
                this.removeManagedListenerItem(true, managedListeners[i]);
            }

            this.managedListeners = [];
        },

        /**
        * Remove a single managed listener item
        * @private
        * @param {Boolean} isClear True if this is being called during a clear
        * @param {Object} managedListener The managed listener item
        * See removeManagedListener for other args
        */
        removeManagedListenerItem: function(isClear, managedListener, item, ename, fn, scope){
            if (isClear || (managedListener.item === item && managedListener.ename === ename && (!fn || managedListener.fn === fn) && (!scope || managedListener.scope === scope))) {
                managedListener.item.un(managedListener.ename, managedListener.fn, managedListener.scope);
                if (!isClear) {
                    Ext.Array.remove(this.managedListeners, managedListener);
                }
            }
        },

        purgeManagedListeners : function() {
            if (Ext.global.console) {
                Ext.global.console.warn('Observable: purgeManagedListeners has been deprecated. Please use clearManagedListeners.');
            }
            return this.clearManagedListeners.apply(this, arguments);
        },

        /**
        * Adds the specified events to the list of events which this Observable may fire.
        *
        * @param {Object/String...} eventNames Either an object with event names as properties with
        * a value of `true`. For example:
        *
        *     this.addEvents({
        *         storeloaded: true,
        *         storecleared: true
        *     });
        *
        * Or any number of event names as separate parameters. For example:
        *
        *     this.addEvents('storeloaded', 'storecleared');
        *
        */
        addEvents: function(o) {
            var me = this,
                events = me.events || (me.events = {}),
                arg, args, i;

            if (typeof o == 'string') {
                for (args = arguments, i = args.length; i--; ) {
                    arg = args[i];
                    if (!events[arg]) {
                        events[arg] = true;
                    }
                }
            } else {
                Ext.applyIf(me.events, o);
            }
        },

        /**
        * Checks to see if this object has any listeners for a specified event, or whether the event bubbles. The answer
        * indicates whether the event needs firing or not.
        *
        * @param {String} eventName The name of the event to check for
        * @return {Boolean} `true` if the event is being listened for or bubbles, else `false`
        */
        hasListener: function(ename) {
            return !!this.hasListeners[ename.toLowerCase()];
        },

        /**
        * Suspends the firing of all events. (see {@link #resumeEvents})
        *
        * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
        * after the {@link #resumeEvents} call instead of discarding all suspended events.
        */
        suspendEvents: function(queueSuspended) {
            this.eventsSuspended += 1;
            if (queueSuspended && !this.eventQueue) {
                this.eventQueue = [];
            }
        },

        /**
         * Suspends firing of the named event(s).
         *
         * After calling this method to suspend events, the events will no longer fire when requested to fire.
         *
         * **Note that if this is called multiple times for a certain event, the converse method
         * {@link #resumeEvent} will have to be called the same number of times for it to resume firing.**
         *
         * @param  {String...} eventName Multiple event names to suspend.
         */
        suspendEvent: function(eventName) {
            var len = arguments.length,
                i, event;

            for (i = 0; i < len; i++) {
                event = this.events[arguments[i]];

                // If it exists, and is an Event object (not still a boolean placeholder), suspend it
                if (event && event.suspend) {
                    event.suspend();
                }
            }
        },

        /**
         * Resumes firing of the named event(s).
         *
         * After calling this method to resume events, the events will fire when requested to fire.
         *
         * **Note that if the {@link #suspendEvent} method is called multiple times for a certain event,
         * this converse method will have to be called the same number of times for it to resume firing.**
         *
         * @param  {String...} eventName Multiple event names to resume.
         */
        resumeEvent: function() {
            var len = arguments.length,
                i, event;

            for (i = 0; i < len; i++) {

                // If it exists, and is an Event object (not still a boolean placeholder), resume it
                event = this.events[arguments[i]];
                if (event && event.resume) {
                    event.resume();
                }
            }
        },

        /**
        * Resumes firing events (see {@link #suspendEvents}).
        *
        * If events were suspended using the `queueSuspended` parameter, then all events fired
        * during event suspension will be sent to any listeners now.
        */
        resumeEvents: function() {
            var me = this,
                queued = me.eventQueue,
                qLen, q;

            if (me.eventsSuspended && ! --me.eventsSuspended) {
                delete me.eventQueue;

                if (queued) {
                    qLen = queued.length;
                    for (q = 0; q < qLen; q++) {
                        me.continueFireEvent.apply(me, queued[q]);
                    }
                }
            }
        },

        /**
        * Relays selected events from the specified Observable as if the events were fired by `this`.
        *
        * For example if you are extending Grid, you might decide to forward some events from store.
        * So you can do this inside your initComponent:
        *
        *     this.relayEvents(this.getStore(), ['load']);
        *
        * The grid instance will then have an observable 'load' event which will be passed the
        * parameters of the store's load event and any function fired with the grid's load event
        * would have access to the grid using the `this` keyword.
        *
        * @param {Object} origin The Observable whose events this object is to relay.
        * @param {String[]} events Array of event names to relay.
        * @param {String} [prefix] A common prefix to prepend to the event names. For example:
        *
        *     this.relayEvents(this.getStore(), ['load', 'clear'], 'store');
        *
        * Now the grid will forward 'load' and 'clear' events of store as 'storeload' and 'storeclear'.
        *
        * @return {Object} A `Destroyable` object. An object which implements the `destroy` method which, when destroyed, removes all relayers. For example:
        *
        *     this.storeRelayers = this.relayEvents(this.getStore(), ['load', 'clear'], 'store');
        *
        * Can be undone by calling
        *
        *     Ext.destroy(this.storeRelayers);
        *
        * or
        *     this.store.relayers.destroy();
        */
        relayEvents : function(origin, events, prefix) {
            var me = this,
                len = events.length,
                i = 0,
                oldName,
                relayers = {};

            for (; i < len; i++) {
                oldName = events[i];

                // Build up the listener hash.
                relayers[oldName] = me.createRelayer(prefix ? prefix + oldName : oldName);
            }
            // Add the relaying listeners as ManagedListeners so that they are removed when this.clearListeners is called (usually when _this_ is destroyed)
            // Explicitly pass options as undefined so that the listener does not get an extra options param
            // which then has to be sliced off in the relayer.
            me.mon(origin, relayers, null, null, undefined);

            // relayed events are always destroyable.
            return new ListenerRemover(me, origin, relayers);
        },

        /**
        * @private
        * Creates an event handling function which refires the event from this object as the passed event name.
        * @param {String} newName The name under which to refire the passed parameters.
        * @param {Array} beginEnd (optional) The caller can specify on which indices to slice.
        * @returns {Function}
        */
        createRelayer: function(newName, beginEnd) {
            var me = this;
            return function() {
                return me.fireEventArgs.call(me, newName, beginEnd ? arraySlice.apply(arguments, beginEnd) : arguments);
            };
        },

        /**
        * Enables events fired by this Observable to bubble up an owner hierarchy by calling `this.getBubbleTarget()` if
        * present. There is no implementation in the Observable base class.
        *
        * This is commonly used by Ext.Components to bubble events to owner Containers.
        * See {@link Ext.Component#getBubbleTarget}. The default implementation in Ext.Component returns the
        * Component's immediate owner. But if a known target is required, this can be overridden to access the
        * required target more quickly.
        *
        * Example:
        *
        *     Ext.define('Ext.overrides.form.field.Base', {
        *         override: 'Ext.form.field.Base',
        *
        *         //  Add functionality to Field's initComponent to enable the change event to bubble
        *         initComponent: function () {
        *             this.callParent();
        *             this.enableBubble('change');
        *         }
        *     });
        *
        *     var myForm = Ext.create('Ext.form.Panel', {
        *         title: 'User Details',
        *         items: [{
        *             ...
        *         }],
        *         listeners: {
        *             change: function() {
        *                 // Title goes red if form has been modified.
        *                 myForm.header.setStyle('color', 'red');
        *             }
        *         }
        *     });
        *
        * @param {String/String[]} eventNames The event name to bubble, or an Array of event names.
        */
        enableBubble: function(eventNames) {
            if (eventNames) {
                var me = this,
                    names = (typeof eventNames == 'string') ? arguments : eventNames,
                    length = names.length,
                    events = me.events,
                    ename, event, i;

                for (i = 0; i < length; ++i) {
                    ename = names[i].toLowerCase();
                    event = events[ename];

                    if (!event || typeof event == 'boolean') {
                        events[ename] = event = new ExtEvent(me, ename);
                    }

                    // Event must fire if it bubbles (We don't know if anyone up the
                    // bubble hierarchy has listeners added)
                    me.hasListeners._incr_(ename);

                    event.bubble = true;
                }
            }
        }
    };
}, function() {
    var Observable = this,
        proto = Observable.prototype,
        HasListeners = function () {},
        prepareMixin = function (T) {
            if (!T.HasListeners) {
                var proto = T.prototype;

                // Classes that use us as a mixin (best practice) need to be prepared.
                Observable.prepareClass(T, this);

                // Now that we are mixed in to class T, we need to watch T for derivations
                // and prepare them also.
                T.onExtended(function (U) {
                    Ext.classSystemMonitor && Ext.classSystemMonitor('extend mixin', arguments);
                    
                    Observable.prepareClass(U);
                });

                // Also, if a class uses us as a mixin and that class is then used as
                // a mixin, we need to be notified of that as well.
                if (proto.onClassMixedIn) {
                    // play nice with other potential overrides...
                    Ext.override(T, {
                        onClassMixedIn: function (U) {
                            prepareMixin.call(this, U);
                            this.callParent(arguments);
                        }
                    });
                } else {
                    // just us chickens, so add the method...
                    proto.onClassMixedIn = function (U) {
                        prepareMixin.call(this, U);
                    };
                }
            }
        },
        globalEvents;

    HasListeners.prototype = {
        //$$: 42  // to make sure we have a proper prototype
        _decr_: function (ev) {
            if (! --this[ev]) {
                // Delete this entry, since 0 does not mean no one is listening, just
                // that no one is *directly* listening. This allows the eventBus or
                // class observers to "poke" through and expose their presence.
                delete this[ev];
            }
        },
        _incr_: function (ev) {
            if (this.hasOwnProperty(ev)) {
                // if we already have listeners at this level, just increment the count...
                ++this[ev];
            } else {
                // otherwise, start the count at 1 (which hides whatever is in our prototype
                // chain)...
                this[ev] = 1;
            }
        }
    };

    proto.HasListeners = Observable.HasListeners = HasListeners;

    Observable.createAlias({
        /**
         * @method
         * Shorthand for {@link #addListener}.
         * @inheritdoc Ext.util.Observable#addListener
         */
        on: 'addListener',
        /**
         * @method
         * Shorthand for {@link #removeListener}.
         * @inheritdoc Ext.util.Observable#removeListener
         */
        un: 'removeListener',
        /**
         * @method
         * Shorthand for {@link #addManagedListener}.
         * @inheritdoc Ext.util.Observable#addManagedListener
         */
        mon: 'addManagedListener',
        /**
         * @method
         * Shorthand for {@link #removeManagedListener}.
         * @inheritdoc Ext.util.Observable#removeManagedListener
         */
        mun: 'removeManagedListener'
    });

    //deprecated, will be removed in 5.0
    Observable.observeClass = Observable.observe;

    /**
     * @member Ext
     * @property {Ext.util.Observable} globalEvents
     * An instance of `{@link Ext.util.Observable}` through which Ext fires global events.
     *
     * This Observable instance fires the following events:
     *
     * *  **`idle`**
     *
     *    Fires when an event handler finishes its run, just before returning to browser control.
     *
     *    This includes DOM event handlers, Ajax (including JSONP) event handlers, and {@link Ext.util.TaskRunner TaskRunners}
     *
     *    This can be useful for performing cleanup, or update tasks which need to happen only
     *    after all code in an event handler has been run, but which should not be executed in a timer
     *    due to the intervening browser reflow/repaint which would take place.
     *
     * * **`ready`**
     *
     *    Fires when the DOM is ready, and all required classes have been loaded. Functionally
     *    the same as {@link Ext#onReady}, but must be called with the `single` option:
     *
     *         Ext.on({
     *             ready: function() {
     *                 console.log('document is ready!');
     *             },
     *             single: true
     *         }); 
     *
     * * **`resumelayouts`**
     *
     *    Fires after global layout processing has been resumed in {@link Ext.AbstractComponent#resumeLayouts}.
     */
    Ext.globalEvents = globalEvents = new Observable({
        events: {
            idle: Ext.EventManager.idleEvent,
            ready: Ext.EventManager.readyEvent
        }
    });

    /**
     * @member Ext
     * @method on
     * Shorthand for the {@link Ext.util.Observable#addListener} method of the
     * {@link Ext#globalEvents} Observable instance.
     * @inheritdoc Ext.util.Observable#addListener
     */
    Ext.on = function() {
        return globalEvents.addListener.apply(globalEvents, arguments);
    };

    /**
     * @member Ext
     * @method
     * Shorthand for the {@link Ext.util.Observable#removeListener} method of the
     * {@link Ext#globalEvents} Observable instance.
     * @inheritdoc Ext.util.Observable#removeListener
     */
    Ext.un = function() {
        return globalEvents.removeListener.apply(globalEvents, arguments);
    };

    // this is considered experimental (along with beforeMethod, afterMethod, removeMethodListener?)
    // allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
    // private
    function getMethodEvent(method){
        var e = (this.methodEvents = this.methodEvents || {})[method],
            returnValue,
            v,
            cancel,
            obj = this,
            makeCall;

        if (!e) {
            this.methodEvents[method] = e = {};
            e.originalFn = this[method];
            e.methodName = method;
            e.before = [];
            e.after = [];

            makeCall = function(fn, scope, args){
                if((v = fn.apply(scope || obj, args)) !== undefined){
                    if (typeof v == 'object') {
                        if(v.returnValue !== undefined){
                            returnValue = v.returnValue;
                        }else{
                            returnValue = v;
                        }
                        cancel = !!v.cancel;
                    }
                    else
                        if (v === false) {
                            cancel = true;
                        }
                        else {
                            returnValue = v;
                        }
                }
            };

            this[method] = function(){
                var args = Array.prototype.slice.call(arguments, 0),
                    b, i, len;
                returnValue = v = undefined;
                cancel = false;

                for(i = 0, len = e.before.length; i < len; i++){
                    b = e.before[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }

                if((v = e.originalFn.apply(obj, args)) !== undefined){
                    returnValue = v;
                }

                for(i = 0, len = e.after.length; i < len; i++){
                    b = e.after[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }
                return returnValue;
            };
        }
        return e;
    }

    Ext.apply(proto, {
        onClassMixedIn: prepareMixin,

        // these are considered experimental
        // allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
        // adds an 'interceptor' called before the original method
        beforeMethod : function(method, fn, scope){
            getMethodEvent.call(this, method).before.push({
                fn: fn,
                scope: scope
            });
        },

        // adds a 'sequence' called after the original method
        afterMethod : function(method, fn, scope){
            getMethodEvent.call(this, method).after.push({
                fn: fn,
                scope: scope
            });
        },

        removeMethodListener: function(method, fn, scope){
            var e = this.getMethodEvent(method),
                i, len;
            for(i = 0, len = e.before.length; i < len; i++){
                if(e.before[i].fn == fn && e.before[i].scope == scope){
                    Ext.Array.erase(e.before, i, 1);
                    return;
                }
            }
            for(i = 0, len = e.after.length; i < len; i++){
                if(e.after[i].fn == fn && e.after[i].scope == scope){
                    Ext.Array.erase(e.after, i, 1);
                    return;
                }
            }
        },

        toggleEventLogging: function(toggle) {
            Ext.util.Observable[toggle ? 'capture' : 'releaseCapture'](this, function(en) {
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.log(en, arguments);
                }
            });
        }
    });
});

// @tag dom,core
// @require EventManager.js
// @define Ext.EventObject

/**
 * @class Ext.EventObject

Just as {@link Ext.Element} wraps around a native DOM node, Ext.EventObject
wraps the browser's native event-object normalizing cross-browser differences,
such as which mouse button is clicked, keys pressed, mechanisms to stop
event-propagation along with a method to prevent default actions from taking place.

For example:

    function handleClick(e, t){ // e is not a standard event object, it is a Ext.EventObject
        e.preventDefault();
        var target = e.getTarget(); // same as t (the target HTMLElement)
        ...
    }

    var myDiv = {@link Ext#get Ext.get}("myDiv");  // get reference to an {@link Ext.Element}
    myDiv.on(         // 'on' is shorthand for addListener
        "click",      // perform an action on click of myDiv
        handleClick   // reference to the action handler
    );

    // other methods to do the same:
    Ext.EventManager.on("myDiv", 'click', handleClick);
    Ext.EventManager.addListener("myDiv", 'click', handleClick);

 * @singleton
 * @markdown
 */
Ext.define('Ext.EventObjectImpl', {
                             

    /** Key constant @type Number */
    BACKSPACE: 8,
    /** Key constant @type Number */
    TAB: 9,
    /** Key constant @type Number */
    NUM_CENTER: 12,
    /** Key constant @type Number */
    ENTER: 13,
    /** Key constant @type Number */
    RETURN: 13,
    /** Key constant @type Number */
    SHIFT: 16,
    /** Key constant @type Number */
    CTRL: 17,
    /** Key constant @type Number */
    ALT: 18,
    /** Key constant @type Number */
    PAUSE: 19,
    /** Key constant @type Number */
    CAPS_LOCK: 20,
    /** Key constant @type Number */
    ESC: 27,
    /** Key constant @type Number */
    SPACE: 32,
    /** Key constant @type Number */
    PAGE_UP: 33,
    /** Key constant @type Number */
    PAGE_DOWN: 34,
    /** Key constant @type Number */
    END: 35,
    /** Key constant @type Number */
    HOME: 36,
    /** Key constant @type Number */
    LEFT: 37,
    /** Key constant @type Number */
    UP: 38,
    /** Key constant @type Number */
    RIGHT: 39,
    /** Key constant @type Number */
    DOWN: 40,
    /** Key constant @type Number */
    PRINT_SCREEN: 44,
    /** Key constant @type Number */
    INSERT: 45,
    /** Key constant @type Number */
    DELETE: 46,
    /** Key constant @type Number */
    ZERO: 48,
    /** Key constant @type Number */
    ONE: 49,
    /** Key constant @type Number */
    TWO: 50,
    /** Key constant @type Number */
    THREE: 51,
    /** Key constant @type Number */
    FOUR: 52,
    /** Key constant @type Number */
    FIVE: 53,
    /** Key constant @type Number */
    SIX: 54,
    /** Key constant @type Number */
    SEVEN: 55,
    /** Key constant @type Number */
    EIGHT: 56,
    /** Key constant @type Number */
    NINE: 57,
    /** Key constant @type Number */
    A: 65,
    /** Key constant @type Number */
    B: 66,
    /** Key constant @type Number */
    C: 67,
    /** Key constant @type Number */
    D: 68,
    /** Key constant @type Number */
    E: 69,
    /** Key constant @type Number */
    F: 70,
    /** Key constant @type Number */
    G: 71,
    /** Key constant @type Number */
    H: 72,
    /** Key constant @type Number */
    I: 73,
    /** Key constant @type Number */
    J: 74,
    /** Key constant @type Number */
    K: 75,
    /** Key constant @type Number */
    L: 76,
    /** Key constant @type Number */
    M: 77,
    /** Key constant @type Number */
    N: 78,
    /** Key constant @type Number */
    O: 79,
    /** Key constant @type Number */
    P: 80,
    /** Key constant @type Number */
    Q: 81,
    /** Key constant @type Number */
    R: 82,
    /** Key constant @type Number */
    S: 83,
    /** Key constant @type Number */
    T: 84,
    /** Key constant @type Number */
    U: 85,
    /** Key constant @type Number */
    V: 86,
    /** Key constant @type Number */
    W: 87,
    /** Key constant @type Number */
    X: 88,
    /** Key constant @type Number */
    Y: 89,
    /** Key constant @type Number */
    Z: 90,
    /** Key constant @type Number */
    CONTEXT_MENU: 93,
    /** Key constant @type Number */
    NUM_ZERO: 96,
    /** Key constant @type Number */
    NUM_ONE: 97,
    /** Key constant @type Number */
    NUM_TWO: 98,
    /** Key constant @type Number */
    NUM_THREE: 99,
    /** Key constant @type Number */
    NUM_FOUR: 100,
    /** Key constant @type Number */
    NUM_FIVE: 101,
    /** Key constant @type Number */
    NUM_SIX: 102,
    /** Key constant @type Number */
    NUM_SEVEN: 103,
    /** Key constant @type Number */
    NUM_EIGHT: 104,
    /** Key constant @type Number */
    NUM_NINE: 105,
    /** Key constant @type Number */
    NUM_MULTIPLY: 106,
    /** Key constant @type Number */
    NUM_PLUS: 107,
    /** Key constant @type Number */
    NUM_MINUS: 109,
    /** Key constant @type Number */
    NUM_PERIOD: 110,
    /** Key constant @type Number */
    NUM_DIVISION: 111,
    /** Key constant @type Number */
    F1: 112,
    /** Key constant @type Number */
    F2: 113,
    /** Key constant @type Number */
    F3: 114,
    /** Key constant @type Number */
    F4: 115,
    /** Key constant @type Number */
    F5: 116,
    /** Key constant @type Number */
    F6: 117,
    /** Key constant @type Number */
    F7: 118,
    /** Key constant @type Number */
    F8: 119,
    /** Key constant @type Number */
    F9: 120,
    /** Key constant @type Number */
    F10: 121,
    /** Key constant @type Number */
    F11: 122,
    /** Key constant @type Number */
    F12: 123,
    /**
     * The mouse wheel delta scaling factor. This value depends on browser version and OS and
     * attempts to produce a similar scrolling experience across all platforms and browsers.
     *
     * To change this value:
     *
     *      Ext.EventObjectImpl.prototype.WHEEL_SCALE = 72;
     *
     * @type Number
     * @markdown
     */
    WHEEL_SCALE: (function () {
        var scale;

        if (Ext.isGecko) {
            // Firefox uses 3 on all platforms
            scale = 3;
        } else if (Ext.isMac) {
            // Continuous scrolling devices have momentum and produce much more scroll than
            // discrete devices on the same OS and browser. To make things exciting, Safari
            // (and not Chrome) changed from small values to 120 (like IE).

            if (Ext.isSafari && Ext.webKitVersion >= 532.0) {
                // Safari changed the scrolling factor to match IE (for details see
                // https://bugs.webkit.org/show_bug.cgi?id=24368). The WebKit version where this
                // change was introduced was 532.0
                //      Detailed discussion:
                //      https://bugs.webkit.org/show_bug.cgi?id=29601
                //      http://trac.webkit.org/browser/trunk/WebKit/chromium/src/mac/WebInputEventFactory.mm#L1063
                scale = 120;
            } else {
                // MS optical wheel mouse produces multiples of 12 which is close enough
                // to help tame the speed of the continuous mice...
                scale = 12;
            }

            // Momentum scrolling produces very fast scrolling, so increase the scale factor
            // to help produce similar results cross platform. This could be even larger and
            // it would help those mice, but other mice would become almost unusable as a
            // result (since we cannot tell which device type is in use).
            scale *= 3;
        } else {
            // IE, Opera and other Windows browsers use 120.
            scale = 120;
        }

        return scale;
    }()),

    /**
     * Simple click regex
     * @private
     */
    clickRe: /(dbl)?click/,
    // safari keypress events for special keys return bad keycodes
    safariKeys: {
        3: 13, // enter
        63234: 37, // left
        63235: 39, // right
        63232: 38, // up
        63233: 40, // down
        63276: 33, // page up
        63277: 34, // page down
        63272: 46, // delete
        63273: 36, // home
        63275: 35 // end
    },
    // normalize button clicks, don't see any way to feature detect this.
    btnMap: Ext.isIE ? {
        1: 0,
        4: 1,
        2: 2
    } : {
        0: 0,
        1: 1,
        2: 2
    },
    
    /**
     * @property {Boolean} ctrlKey
     * True if the control key was down during the event.
     * In Mac this will also be true when meta key was down.
     */
    /**
     * @property {Boolean} altKey
     * True if the alt key was down during the event.
     */
    /**
     * @property {Boolean} shiftKey
     * True if the shift key was down during the event.
     */

    constructor: function(event, freezeEvent){
        if (event) {
            this.setEvent(event.browserEvent || event, freezeEvent);
        }
    },

    setEvent: function(event, freezeEvent){
        var me = this, button, options;

        if (event === me || (event && event.browserEvent)) { // already wrapped
            return event;
        }
        me.browserEvent = event;
        if (event) {
            // normalize buttons
            button = event.button ? me.btnMap[event.button] : (event.which ? event.which - 1 : -1);
            if (me.clickRe.test(event.type) && button == -1) {
                button = 0;
            }
            options = {
                type: event.type,
                button: button,
                shiftKey: event.shiftKey,
                // mac metaKey behaves like ctrlKey
                ctrlKey: event.ctrlKey || event.metaKey || false,
                altKey: event.altKey,
                // in getKey these will be normalized for the mac
                keyCode: event.keyCode,
                charCode: event.charCode,
                // cache the targets for the delayed and or buffered events
                target: Ext.EventManager.getTarget(event),
                relatedTarget: Ext.EventManager.getRelatedTarget(event),
                currentTarget: event.currentTarget,
                xy: (freezeEvent ? me.getXY() : null)
            };
        } else {
            options = {
                button: -1,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
                keyCode: 0,
                charCode: 0,
                target: null,
                xy: [0, 0]
            };
        }
        Ext.apply(me, options);
        return me;
    },

    /**
     * Stop the event (preventDefault and stopPropagation)
     */
    stopEvent: function(){
        this.stopPropagation();
        this.preventDefault();
    },

    /**
     * Prevents the browsers default handling of the event.
     */
    preventDefault: function(){
        if (this.browserEvent) {
            Ext.EventManager.preventDefault(this.browserEvent);
        }
    },

    /**
     * Cancels bubbling of the event.
     */
    stopPropagation: function(){
        var browserEvent = this.browserEvent;

        if (browserEvent) {
            if (browserEvent.type == 'mousedown') {
                Ext.EventManager.stoppedMouseDownEvent.fire(this);
            }
            Ext.EventManager.stopPropagation(browserEvent);
        }
    },

    /**
     * Gets the character code for the event.
     * @return {Number}
     */
    getCharCode: function(){
        return this.charCode || this.keyCode;
    },

    /**
     * Returns a normalized keyCode for the event.
     * @return {Number} The key code
     */
    getKey: function(){
        return this.normalizeKey(this.keyCode || this.charCode);
    },

    /**
     * Normalize key codes across browsers
     * @private
     * @param {Number} key The key code
     * @return {Number} The normalized code
     */
    normalizeKey: function(key){
        // can't feature detect this
        return Ext.isWebKit ? (this.safariKeys[key] || key) : key;
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getX}
     */
    getPageX: function(){
        return this.getX();
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     * @deprecated 4.0 Replaced by {@link #getY}
     */
    getPageY: function(){
        return this.getY();
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     */
    getX: function() {
        return this.getXY()[0];
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     */
    getY: function() {
        return this.getXY()[1];
    },

    /**
     * Gets the page coordinates of the event.
     * @return {Number[]} The xy values like [x, y]
     */
    getXY: function() {
        if (!this.xy) {
            // same for XY
            this.xy = Ext.EventManager.getPageXY(this.browserEvent);
        }
        return this.xy;
    },

    /**
     * Gets the target for the event.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getTarget : function(selector, maxDepth, returnEl){
        if (selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.target) : this.target;
    },

    /**
     * Gets the related target.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/HTMLElement} maxDepth (optional) The max depth to search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement}
     */
    getRelatedTarget : function(selector, maxDepth, returnEl){
        if (selector && this.relatedTarget) {
            return Ext.fly(this.relatedTarget).findParent(selector, maxDepth, returnEl);
        }
        return returnEl ? Ext.get(this.relatedTarget) : this.relatedTarget;
    },

    /**
     * Correctly scales a given wheel delta.
     * @param {Number} delta The delta value.
     */
    correctWheelDelta : function (delta) {
        var scale = this.WHEEL_SCALE,
            ret = Math.round(delta / scale);

        if (!ret && delta) {
            ret = (delta < 0) ? -1 : 1; // don't allow non-zero deltas to go to zero!
        }

        return ret;
    },

    /**
     * Returns the mouse wheel deltas for this event.
     * @return {Object} An object with "x" and "y" properties holding the mouse wheel deltas.
     */
    getWheelDeltas : function () {
        var me = this,
            event = me.browserEvent,
            dx = 0, dy = 0; // the deltas

        if (Ext.isDefined(event.wheelDeltaX)) { // WebKit has both dimensions
            dx = event.wheelDeltaX;
            dy = event.wheelDeltaY;
        } else if (event.wheelDelta) { // old WebKit and IE
            dy = event.wheelDelta;
        } else if (event.detail) { // Gecko
            dy = -event.detail; // gecko is backwards

            // Gecko sometimes returns really big values if the user changes settings to
            // scroll a whole page per scroll
            if (dy > 100) {
                dy = 3;
            } else if (dy < -100) {
                dy = -3;
            }

            // Firefox 3.1 adds an axis field to the event to indicate direction of
            // scroll.  See https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
            if (Ext.isDefined(event.axis) && event.axis === event.HORIZONTAL_AXIS) {
                dx = dy;
                dy = 0;
            }
        }

        return {
            x: me.correctWheelDelta(dx),
            y: me.correctWheelDelta(dy)
        };
    },

    /**
     * Normalizes mouse wheel y-delta across browsers. To get x-delta information, use
     * {@link #getWheelDeltas} instead.
     * @return {Number} The mouse wheel y-delta
     */
    getWheelDelta : function(){
        var deltas = this.getWheelDeltas();

        return deltas.y;
    },

    /**
     * Returns true if the target of this event is a child of el.  Unless the allowEl parameter is set, it will return false if if the target is el.
     * Example usage:<pre><code>
// Handle click on any child of an element
Ext.getBody().on('click', function(e){
    if(e.within('some-el')){
        alert('Clicked on a child of some-el!');
    }
});

// Handle click directly on an element, ignoring clicks on child nodes
Ext.getBody().on('click', function(e,t){
    if((t.id == 'some-el') && !e.within(t, true)){
        alert('Clicked directly on some-el!');
    }
});
</code></pre>
     * @param {String/HTMLElement/Ext.Element} el The id, DOM element or Ext.Element to check
     * @param {Boolean} [related] `true` to test if the related target is within el instead of the target
     * @param {Boolean} [allowEl] `true` to also check if the passed element is the target or related target
     * @return {Boolean}
     */
    within : function(el, related, allowEl){
        if(el){
            var t = related ? this.getRelatedTarget() : this.getTarget(),
                result;

            if (t) {
                result = Ext.fly(el, '_internal').contains(t);
                if (!result && allowEl) {
                    result = t == Ext.getDom(el);
                }
                return result;
            }
        }
        return false;
    },

    /**
     * Checks if the key pressed was a "navigation" key
     * @return {Boolean} True if the press is a navigation keypress
     */
    isNavKeyPress : function(){
        var me = this,
            k = this.normalizeKey(me.keyCode);

       return (k >= 33 && k <= 40) ||  // Page Up/Down, End, Home, Left, Up, Right, Down
       k == me.RETURN ||
       k == me.TAB ||
       k == me.ESC;
    },

    /**
     * Checks if the key pressed was a "special" key
     * @return {Boolean} True if the press is a special keypress
     */
    isSpecialKey : function(){
        var k = this.normalizeKey(this.keyCode);
        return (this.type == 'keypress' && this.ctrlKey) ||
        this.isNavKeyPress() ||
        (k == this.BACKSPACE) || // Backspace
        (k >= 16 && k <= 20) || // Shift, Ctrl, Alt, Pause, Caps Lock
        (k >= 44 && k <= 46);   // Print Screen, Insert, Delete
    },

    /**
     * Returns a point object that consists of the object coordinates.
     * @return {Ext.util.Point} point
     */
    getPoint : function(){
        var xy = this.getXY();
        return new Ext.util.Point(xy[0], xy[1]);
    },

   /**
    * Returns true if the control, meta, shift or alt key was pressed during this event.
    * @return {Boolean}
    */
    hasModifier : function(){
        return this.ctrlKey || this.altKey || this.shiftKey || this.metaKey;
    },

    /**
     * Injects a DOM event using the data in this object and (optionally) a new target.
     * This is a low-level technique and not likely to be used by application code. The
     * currently supported event types are:
     * <p><b>HTMLEvents</b></p>
     * <ul>
     * <li>load</li>
     * <li>unload</li>
     * <li>select</li>
     * <li>change</li>
     * <li>submit</li>
     * <li>reset</li>
     * <li>resize</li>
     * <li>scroll</li>
     * </ul>
     * <p><b>MouseEvents</b></p>
     * <ul>
     * <li>click</li>
     * <li>dblclick</li>
     * <li>mousedown</li>
     * <li>mouseup</li>
     * <li>mouseover</li>
     * <li>mousemove</li>
     * <li>mouseout</li>
     * </ul>
     * <p><b>UIEvents</b></p>
     * <ul>
     * <li>focusin</li>
     * <li>focusout</li>
     * <li>activate</li>
     * <li>focus</li>
     * <li>blur</li>
     * </ul>
     * @param {Ext.Element/HTMLElement} target (optional) If specified, the target for the event. This
     * is likely to be used when relaying a DOM event. If not specified, {@link #getTarget}
     * is used to determine the target.
     */
    injectEvent: (function () {
        var API,
            dispatchers = {}, // keyed by event type (e.g., 'mousedown')
            crazyIEButtons;

        // Good reference: http://developer.yahoo.com/yui/docs/UserAction.js.html

        // IE9 has createEvent, but this code causes major problems with htmleditor (it
        // blocks all mouse events and maybe more). TODO

        if (!Ext.isIE9m && document.createEvent) { // if (DOM compliant)
            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEvent('HTMLEvents');

                    event.initEvent(type, bubbles, cancelable);
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEvent('MouseEvents'),
                        view = doc.defaultView || window;

                    if (event.initMouseEvent) {
                        event.initMouseEvent(type, bubbles, cancelable, view, detail,
                                    clientX, clientY, clientX, clientY, ctrlKey, altKey,
                                    shiftKey, metaKey, button, relatedTarget);
                    } else { // old Safari
                        event = doc.createEvent('UIEvents');
                        event.initEvent(type, bubbles, cancelable);
                        event.view = view;
                        event.detail = detail;
                        event.screenX = clientX;
                        event.screenY = clientY;
                        event.clientX = clientX;
                        event.clientY = clientY;
                        event.ctrlKey = ctrlKey;
                        event.altKey = altKey;
                        event.metaKey = metaKey;
                        event.shiftKey = shiftKey;
                        event.button = button;
                        event.relatedTarget = relatedTarget;
                    }

                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEvent('UIEvents'),
                        view = doc.defaultView || window;

                    event.initUIEvent(type, bubbles, cancelable, view, detail);
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.dispatchEvent(event);
                },

                fixTarget: function (target) {
                    // Safari3 doesn't have window.dispatchEvent()
                    if (target == window && !target.dispatchEvent) {
                        return document;
                    }

                    return target;
                }
            };
        } else if (document.createEventObject) { // else if (IE)
            crazyIEButtons = { 0: 1, 1: 4, 2: 2 };

            API = {
                createHtmlEvent: function (doc, type, bubbles, cancelable) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                createMouseEvent: function (doc, type, bubbles, cancelable, detail,
                                            clientX, clientY, ctrlKey, altKey, shiftKey, metaKey,
                                            button, relatedTarget) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    event.detail = detail;
                    event.screenX = clientX;
                    event.screenY = clientY;
                    event.clientX = clientX;
                    event.clientY = clientY;
                    event.ctrlKey = ctrlKey;
                    event.altKey = altKey;
                    event.shiftKey = shiftKey;
                    event.metaKey = metaKey;
                    event.button = crazyIEButtons[button] || button;
                    event.relatedTarget = relatedTarget; // cannot assign to/fromElement
                    return event;
                },

                createUIEvent: function (doc, type, bubbles, cancelable, detail) {
                    var event = doc.createEventObject();
                    event.bubbles = bubbles;
                    event.cancelable = cancelable;
                    return event;
                },

                fireEvent: function (target, type, event) {
                    target.fireEvent('on' + type, event);
                },

                fixTarget: function (target) {
                    if (target == document) {
                        // IE6,IE7 thinks window==document and doesn't have window.fireEvent()
                        // IE6,IE7 cannot properly call document.fireEvent()
                        return document.documentElement;
                    }

                    return target;
                }
            };
        }

        //----------------
        // HTMLEvents

        Ext.Object.each({
                load:   [false, false],
                unload: [false, false],
                select: [true, false],
                change: [true, false],
                submit: [true, true],
                reset:  [true, false],
                resize: [true, false],
                scroll: [true, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createHtmlEvent(name, bubbles, cancelable);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //----------------
        // MouseEvents

        function createMouseEventDispatcher (type, detail) {
            var cancelable = (type != 'mousemove');
            return function (targetEl, srcEvent) {
                var xy = srcEvent.getXY(),
                    e = API.createMouseEvent(targetEl.ownerDocument, type, true, cancelable,
                                detail, xy[0], xy[1], srcEvent.ctrlKey, srcEvent.altKey,
                                srcEvent.shiftKey, srcEvent.metaKey, srcEvent.button,
                                srcEvent.relatedTarget);
                API.fireEvent(targetEl, type, e);
            };
        }

        Ext.each(['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'],
            function (eventName) {
                dispatchers[eventName] = createMouseEventDispatcher(eventName, 1);
            });

        //----------------
        // UIEvents

        Ext.Object.each({
                focusin:  [true, false],
                focusout: [true, false],
                activate: [true, true],
                focus:    [false, false],
                blur:     [false, false]
            },
            function (name, value) {
                var bubbles = value[0], cancelable = value[1];
                dispatchers[name] = function (targetEl, srcEvent) {
                    var e = API.createUIEvent(targetEl.ownerDocument, name, bubbles, cancelable, 1);
                    API.fireEvent(targetEl, name, e);
                };
            });

        //---------
        if (!API) {
            // not even sure what ancient browsers fall into this category...

            dispatchers = {}; // never mind all those we just built :P

            API = {
                fixTarget: Ext.identityFn
            };
        }

        function cannotInject (target, srcEvent) {
            // TODO log something
        }

        return function (target) {
            var me = this,
                dispatcher = dispatchers[me.type] || cannotInject,
                t = target ? (target.dom || target) : me.getTarget();

            t = API.fixTarget(t);
            dispatcher(t, me);
        };
    }()) // call to produce method

}, function() {

Ext.EventObject = new Ext.EventObjectImpl();

});


// @tag dom,core
// @require ../EventObject.js

/**
 * @class Ext.dom.AbstractQuery
 * @private
 */
Ext.define('Ext.dom.AbstractQuery', {
    /**
     * Selects a group of elements.
     * @param {String} selector The selector/xpath query (can be a comma separated list of selectors)
     * @param {HTMLElement/String} [root] The start of the query (defaults to document).
     * @return {HTMLElement[]} An Array of DOM elements which match the selector. If there are
     * no matches, and empty Array is returned.
     */
    select: function(q, root) {
        var results = [],
            nodes,
            i,
            j,
            qlen,
            nlen;

        root = root || document;

        if (typeof root == 'string') {
            root = document.getElementById(root);
        }

        q = q.split(",");

        for (i = 0,qlen = q.length; i < qlen; i++) {
            if (typeof q[i] == 'string') {
                
                //support for node attribute selection
                if (typeof q[i][0] == '@') {
                    nodes = root.getAttributeNode(q[i].substring(1));
                    results.push(nodes);
                } else {
                    nodes = root.querySelectorAll(q[i]);

                    for (j = 0,nlen = nodes.length; j < nlen; j++) {
                        results.push(nodes[j]);
                    }
                }
            }
        }

        return results;
    },

    /**
     * Selects a single element.
     * @param {String} selector The selector/xpath query
     * @param {HTMLElement/String} [root] The start of the query (defaults to document).
     * @return {HTMLElement} The DOM element which matched the selector.
     */
    selectNode: function(q, root) {
        return this.select(q, root)[0];
    },

    /**
     * Returns true if the passed element(s) match the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String/HTMLElement/Array} el An element id, element or array of elements
     * @param {String} selector The simple selector to test
     * @return {Boolean}
     */
    is: function(el, q) {
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        return this.select(q).indexOf(el) !== -1;
    }

});

// @tag dom,core
// @require AbstractQuery.js

/**
 * Abstract base class for {@link Ext.dom.Helper}.
 * @private
 */
Ext.define('Ext.dom.AbstractHelper', {
    emptyTags : /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
    confRe : /^(?:tag|children|cn|html|tpl|tplData)$/i,
    endRe : /end/i,
    styleSepRe: /\s*(?::|;)\s*/,

    // Since cls & for are reserved words, we need to transform them
    attributeTransform: { cls : 'class', htmlFor : 'for' },

    closeTags: {},

    decamelizeName : (function () {
        var camelCaseRe = /([a-z])([A-Z])/g,
            cache = {};

        function decamel (match, p1, p2) {
            return p1 + '-' + p2.toLowerCase();
        }

        return function (s) {
            return cache[s] || (cache[s] = s.replace(camelCaseRe, decamel));
        };
    }()),

    generateMarkup: function(spec, buffer) {
        var me = this,
            specType = typeof spec,
            attr, val, tag, i, closeTags;

        if (specType == "string" || specType == "number") {
            buffer.push(spec);
        } else if (Ext.isArray(spec)) {
            for (i = 0; i < spec.length; i++) {
                if (spec[i]) {
                    me.generateMarkup(spec[i], buffer);
                }
            }
        } else {
            tag = spec.tag || 'div';
            buffer.push('<', tag);

            for (attr in spec) {
                if (spec.hasOwnProperty(attr)) {
                    val = spec[attr];
                    if (!me.confRe.test(attr)) {
                        if (typeof val == "object") {
                            buffer.push(' ', attr, '="');
                            me.generateStyles(val, buffer).push('"');
                        } else {
                            buffer.push(' ', me.attributeTransform[attr] || attr, '="', val, '"');
                        }
                    }
                }
            }

            // Now either just close the tag or try to add children and close the tag.
            if (me.emptyTags.test(tag)) {
                buffer.push('/>');
            } else {
                buffer.push('>');

                // Apply the tpl html, and cn specifications
                if ((val = spec.tpl)) {
                    val.applyOut(spec.tplData, buffer);
                }
                if ((val = spec.html)) {
                    buffer.push(val);
                }
                if ((val = spec.cn || spec.children)) {
                    me.generateMarkup(val, buffer);
                }

                // we generate a lot of close tags, so cache them rather than push 3 parts
                closeTags = me.closeTags;
                buffer.push(closeTags[tag] || (closeTags[tag] = '</' + tag + '>'));
            }
        }

        return buffer;
    },

    /**
     * Converts the styles from the given object to text. The styles are CSS style names
     * with their associated value.
     * 
     * The basic form of this method returns a string:
     * 
     *      var s = Ext.DomHelper.generateStyles({
     *          backgroundColor: 'red'
     *      });
     *      
     *      // s = 'background-color:red;'
     *
     * Alternatively, this method can append to an output array.
     * 
     *      var buf = [];
     *
     *      ...
     *
     *      Ext.DomHelper.generateStyles({
     *          backgroundColor: 'red'
     *      }, buf);
     *
     * In this case, the style text is pushed on to the array and the array is returned.
     * 
     * @param {Object} styles The object describing the styles.
     * @param {String[]} [buffer] The output buffer.
     * @return {String/String[]} If buffer is passed, it is returned. Otherwise the style
     * string is returned.
     */
    generateStyles: function (styles, buffer) {
        var a = buffer || [],
            name;

        for (name in styles) {
            if (styles.hasOwnProperty(name)) {
                a.push(this.decamelizeName(name), ':', styles[name], ';');
            }
        }

        return buffer || a.join('');
    },

    /**
     * Returns the markup for the passed Element(s) config.
     * @param {Object} spec The DOM object spec (and children)
     * @return {String}
     */
    markup: function(spec) {
        if (typeof spec == "string") {
            return spec;
        }

        var buf = this.generateMarkup(spec, []);
        return buf.join('');
    },

    /**
     * Applies a style specification to an element.
     * @param {String/HTMLElement} el The element to apply styles to
     * @param {String/Object/Function} styles A style specification string e.g. 'width:100px', or object in the form {width:'100px'}, or
     * a function which returns such a specification.
     */
    applyStyles: function(el, styles) {
        if (styles) {
            var i = 0,
                len;

            el = Ext.fly(el, '_applyStyles');
            if (typeof styles == 'function') {
                styles = styles.call();
            }
            if (typeof styles == 'string') {
                styles = Ext.util.Format.trim(styles).split(this.styleSepRe);
                for (len = styles.length; i < len;) {
                    el.setStyle(styles[i++], styles[i++]);
                }
            } else if (Ext.isObject(styles)) {
                el.setStyle(styles);
            }
        }
    },

    /**
     * Inserts an HTML fragment into the DOM.
     * @param {String} where Where to insert the html in relation to el - beforeBegin, afterBegin, beforeEnd, afterEnd.
     *
     * For example take the following HTML: `<div>Contents</div>`
     *
     * Using different `where` values inserts element to the following places:
     *
     * - beforeBegin: `<HERE><div>Contents</div>`
     * - afterBegin: `<div><HERE>Contents</div>`
     * - beforeEnd: `<div>Contents<HERE></div>`
     * - afterEnd: `<div>Contents</div><HERE>`
     *
     * @param {HTMLElement/TextNode} el The context element
     * @param {String} html The HTML fragment
     * @return {HTMLElement} The new node
     */
    insertHtml: function(where, el, html) {
        var hash = {},
            setStart,
            range,
            frag,
            rangeEl;

        where = where.toLowerCase();

        // add these here because they are used in both branches of the condition.
        hash['beforebegin'] = ['BeforeBegin', 'previousSibling'];
        hash['afterend'] = ['AfterEnd', 'nextSibling'];

        range = el.ownerDocument.createRange();
        setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
        if (hash[where]) {
            range[setStart](el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, where == 'beforebegin' ? el : el.nextSibling);
            return el[(where == 'beforebegin' ? 'previous' : 'next') + 'Sibling'];
        }
        else {
            rangeEl = (where == 'afterbegin' ? 'first' : 'last') + 'Child';
            if (el.firstChild) {
                range[setStart](el[rangeEl]);
                frag = range.createContextualFragment(html);
                if (where == 'afterbegin') {
                    el.insertBefore(frag, el.firstChild);
                }
                else {
                    el.appendChild(frag);
                }
            }
            else {
                el.innerHTML = html;
            }
            return el[rangeEl];
        }

        throw 'Illegal insertion point -> "' + where + '"';
    },

    /**
     * Creates new DOM element(s) and inserts them before el.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} [returnElement] true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertBefore: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforebegin');
    },

    /**
     * Creates new DOM element(s) and inserts them after el.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object} o The DOM object spec (and children)
     * @param {Boolean} [returnElement] true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertAfter: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterend', 'nextSibling');
    },

    /**
     * Creates new DOM element(s) and inserts them as the first child of el.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} [returnElement] true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertFirst: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterbegin', 'firstChild');
    },

    /**
     * Creates new DOM element(s) and appends them to el.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} [returnElement] true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    append: function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforeend', '', true);
    },

    /**
     * Creates new DOM element(s) and overwrites the contents of el with them.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} [returnElement] true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    overwrite: function(el, o, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.markup(o);
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    doInsert: function(el, o, returnElement, pos, sibling, append) {
        var newNode = this.insertHtml(pos, Ext.getDom(el), this.markup(o));
        return returnElement ? Ext.get(newNode, true) : newNode;
    }

});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.AbstractElement_static', {
    override: 'Ext.dom.AbstractElement',

    inheritableStatics: {
        unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
        camelRe: /(-[a-z])/gi,
        msRe: /^-ms-/,
        cssRe: /([a-z0-9\-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*)?;?/gi,
        opacityRe: /alpha\(opacity=(.*)\)/i,
        propertyCache: {},
        defaultUnit : "px",
        borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
        paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
        margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},
        /**
        * Test if size has a unit, otherwise appends the passed unit string, or the default for this Element.
        * @param size {Object} The size to set
        * @param units {String} The units to append to a numeric size value
        * @private
        * @static
        */
        addUnits: function(size, units) {
            // Most common case first: Size is set to a number
            if (typeof size == 'number') {
                return size + (units || this.defaultUnit || 'px');
            }

            // Size set to a value which means "auto"
            if (size === "" || size == "auto" || size === undefined || size === null) {
                return size || '';
            }

            // Otherwise, warn if it's not a valid CSS measurement
            if (!this.unitRe.test(size)) {
                if (Ext.isDefined(Ext.global.console)) {
                    Ext.global.console.warn("Warning, size detected as NaN on Element.addUnits.");
                }
                return size || '';
            }

            return size;
        },

        /**
        * @static
        * @private
        */
        isAncestor: function(p, c) {
            var ret = false;

            p = Ext.getDom(p);
            c = Ext.getDom(c);
            if (p && c) {
                if (p.contains) {
                    return p.contains(c);
                } else if (p.compareDocumentPosition) {
                    return !!(p.compareDocumentPosition(c) & 16);
                } else {
                    while ((c = c.parentNode)) {
                        ret = c == p || ret;
                    }
                }
            }
            return ret;
        },

        /**
        * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
        * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
        * @static
        * @param {Number/String} box The encoded margins
        * @return {Object} An object with margin sizes for top, right, bottom and left
        */
        parseBox: function(box) {
            box = box || 0;
            
            var type = typeof box,
                parts,
                ln;

            if (type === 'number') {
                return {
                    top   : box,
                    right : box,
                    bottom: box,
                    left  : box
                };
             } else if (type !== 'string') {
                 // If not a number or a string, assume we've been given a box config.
                 return box;
             }

            parts  = box.split(' ');
            ln = parts.length;

            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            } else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            } else if (ln == 3) {
                parts[3] = parts[1];
            }

            return {
                top   :parseFloat(parts[0]) || 0,
                right :parseFloat(parts[1]) || 0,
                bottom:parseFloat(parts[2]) || 0,
                left  :parseFloat(parts[3]) || 0
            };
        },

        /**
         * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
         * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
         * @static
         * @param {Number/String/Object} box The encoded margins, or an object with top, right,
         * bottom, and left properties
         * @param {String} units The type of units to add
         * @return {String} An string with unitized (px if units is not specified) metrics for top, right, bottom and left
         */
        unitizeBox: function(box, units) {
            var a = this.addUnits,
                b = this.parseBox(box);

            return a(b.top, units) + ' ' +
                   a(b.right, units) + ' ' +
                   a(b.bottom, units) + ' ' +
                   a(b.left, units);

        },

        // private
        camelReplaceFn: function(m, a) {
            return a.charAt(1).toUpperCase();
        },

        /**
        * Normalizes CSS property keys from dash delimited to camel case JavaScript Syntax.
        * For example:
        *
        * - border-width -> borderWidth
        * - padding-top -> paddingTop
        *
        * @static
        * @param {String} prop The property to normalize
        * @return {String} The normalized string
        */
        normalize: function(prop) {
            // TODO: Mobile optimization?
            if (prop == 'float') {
                prop = Ext.supports.Float ? 'cssFloat' : 'styleFloat';
            }
            // For '-ms-foo' we need msFoo
            return this.propertyCache[prop] || (this.propertyCache[prop] = prop.replace(this.msRe, 'ms-').replace(this.camelRe, this.camelReplaceFn));
        },

        /**
        * Retrieves the document height
        * @static
        * @return {Number} documentHeight
        */
        getDocumentHeight: function() {
            return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
        },

        /**
        * Retrieves the document width
        * @static
        * @return {Number} documentWidth
        */
        getDocumentWidth: function() {
            return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
        },

        /**
        * Retrieves the viewport height of the window.
        * @static
        * @return {Number} viewportHeight
        */
        getViewportHeight: function(){
            return window.innerHeight;
        },

        /**
        * Retrieves the viewport width of the window.
        * @static
        * @return {Number} viewportWidth
        */
        getViewportWidth: function() {
            return window.innerWidth;
        },

        /**
        * Retrieves the viewport size of the window.
        * @static
        * @return {Object} object containing width and height properties
        */
        getViewSize: function() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        },

        /**
        * Retrieves the current orientation of the window. This is calculated by
        * determing if the height is greater than the width.
        * @static
        * @return {String} Orientation of window: 'portrait' or 'landscape'
        */
        getOrientation: function() {
            if (Ext.supports.OrientationChange) {
                return (window.orientation == 0) ? 'portrait' : 'landscape';
            }

            return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
        },

        /**
        * Returns the top Element that is located at the passed coordinates
        * @static
        * @param {Number} x The x coordinate
        * @param {Number} y The y coordinate
        * @return {String} The found Element
        */
        fromPoint: function(x, y) {
            return Ext.get(document.elementFromPoint(x, y));
        },

        /**
        * Converts a CSS string into an object with a property for each style.
        *
        * The sample code below would return an object with 2 properties, one
        * for background-color and one for color.
        *
        *     var css = 'background-color: red;color: blue; ';
        *     console.log(Ext.dom.Element.parseStyles(css));
        *
        * @static
        * @param {String} styles A CSS string
        * @return {Object} styles
        */
        parseStyles: function(styles){
            var out = {},
                cssRe = this.cssRe,
                matches;

            if (styles) {
                // Since we're using the g flag on the regex, we need to set the lastIndex.
                // This automatically happens on some implementations, but not others, see:
                // http://stackoverflow.com/questions/2645273/javascript-regular-expression-literal-persists-between-function-calls
                // http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
                cssRe.lastIndex = 0;
                while ((matches = cssRe.exec(styles))) {
                    out[matches[1]] = matches[2]||'';
                }
            }
            return out;
        }
    }
},
function () {
    var doc = document,
        activeElement = null,
        isCSS1 = doc.compatMode == "CSS1Compat";

    // If the browser does not support document.activeElement we need some assistance.
    // This covers old Safari 3.2 (4.0 added activeElement along with just about all
    // other browsers). We need this support to handle issues with old Safari.
    if (!('activeElement' in doc) && doc.addEventListener) {
        doc.addEventListener('focus',
            function (ev) {
                if (ev && ev.target) {
                    activeElement = (ev.target == doc) ? null : ev.target;
                }
            }, true);
    }

    /*
     * Helper function to create the function that will restore the selection.
     */
    function makeSelectionRestoreFn (activeEl, start, end) {
        return function () {
            activeEl.selectionStart = start;
            activeEl.selectionEnd = end;
        };
    }

    this.addInheritableStatics({
        /**
         * Returns the active element in the DOM. If the browser supports activeElement
         * on the document, this is returned. If not, the focus is tracked and the active
         * element is maintained internally.
         * @return {HTMLElement} The active (focused) element in the document.
         */
        getActiveElement: function () {
            var active;
            // In IE 6/7, calling activeElement can sometimes throw an Unspecified Error,
            // so we need to wrap it in a try catch
            
            try {
                active = doc.activeElement;
            } catch(e) {}
            
            // Default to the body if we can't find anything
            // https://developer.mozilla.org/en-US/docs/DOM/document.activeElement
            active = active || activeElement;
            if (!active) {
                active = activeElement = document.body;
            }
            return active;
        },

        /**
         * Creates a function to call to clean up problems with the work-around for the
         * WebKit RightMargin bug. The work-around is to add "display: 'inline-block'" to
         * the element before calling getComputedStyle and then to restore its original
         * display value. The problem with this is that it corrupts the selection of an
         * INPUT or TEXTAREA element (as in the "I-beam" goes away but ths focus remains).
         * To cleanup after this, we need to capture the selection of any such element and
         * then restore it after we have restored the display style.
         *
         * @param {Ext.dom.Element} target The top-most element being adjusted.
         * @private
         */
        getRightMarginFixCleaner: function (target) {
            var supports = Ext.supports,
                hasInputBug = supports.DisplayChangeInputSelectionBug,
                hasTextAreaBug = supports.DisplayChangeTextAreaSelectionBug,
                activeEl,
                tag,
                start,
                end;

            if (hasInputBug || hasTextAreaBug) {
                activeEl = doc.activeElement || activeElement; // save a call
                tag = activeEl && activeEl.tagName;

                if ((hasTextAreaBug && tag == 'TEXTAREA') ||
                    (hasInputBug && tag == 'INPUT' && activeEl.type == 'text')) {
                    if (Ext.dom.Element.isAncestor(target, activeEl)) {
                        start = activeEl.selectionStart;
                        end = activeEl.selectionEnd;

                        if (Ext.isNumber(start) && Ext.isNumber(end)) { // to be safe...
                            // We don't create the raw closure here inline because that
                            // will be costly even if we don't want to return it (nested
                            // function decls and exprs are often instantiated on entry
                            // regardless of whether execution ever reaches them):
                            return makeSelectionRestoreFn(activeEl, start, end);
                        }
                    }
                }
            }

            return Ext.emptyFn; // avoid special cases, just return a nop
        },

        getViewWidth: function(full) {
            return full ? Ext.dom.Element.getDocumentWidth() : Ext.dom.Element.getViewportWidth();
        },

        getViewHeight: function(full) {
            return full ? Ext.dom.Element.getDocumentHeight() : Ext.dom.Element.getViewportHeight();
        },

        getDocumentHeight: function() {
            return Math.max(!isCSS1 ? doc.body.scrollHeight : doc.documentElement.scrollHeight, Ext.dom.Element.getViewportHeight());
        },

        getDocumentWidth: function() {
            return Math.max(!isCSS1 ? doc.body.scrollWidth : doc.documentElement.scrollWidth, Ext.dom.Element.getViewportWidth());
        },

        getViewportHeight: function(){
            return Ext.isIE9m ?
                   (Ext.isStrict ? doc.documentElement.clientHeight : doc.body.clientHeight) :
                   self.innerHeight;
        },

        getViewportWidth: function() {
            return (!Ext.isStrict && !Ext.isOpera) ? doc.body.clientWidth :
                   Ext.isIE9m ? doc.documentElement.clientWidth : self.innerWidth;
        },

        /**
         * Serializes a DOM form into a url encoded string
         * @param {Object} form The form
         * @return {String} The url encoded form
         */
        serializeForm: function(form) {
            var fElements = form.elements || (document.forms[form] || Ext.getDom(form)).elements,
                hasSubmit = false,
                encoder   = encodeURIComponent,
                data      = '',
                eLen      = fElements.length,
                element, name, type, options, hasValue, e,
                o, oLen, opt;

            for (e = 0; e < eLen; e++) {
                element = fElements[e];
                name    = element.name;
                type    = element.type;
                options = element.options;

                if (!element.disabled && name) {
                    if (/select-(one|multiple)/i.test(type)) {
                        oLen = options.length;
                        for (o = 0; o < oLen; o++) {
                            opt = options[o];
                            if (opt.selected) {
                                hasValue = opt.hasAttribute ? opt.hasAttribute('value') : opt.getAttributeNode('value').specified;
                                data += Ext.String.format("{0}={1}&", encoder(name), encoder(hasValue ? opt.value : opt.text));
                            }
                        }
                    } else if (!(/file|undefined|reset|button/i.test(type))) {
                        if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                            data += encoder(name) + '=' + encoder(element.value) + '&';
                            hasSubmit = /submit/i.test(type);
                        }
                    }
                }
            }
            return data.substr(0, data.length - 1);
        }
    });
});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.AbstractElement_insertion', {
    override: 'Ext.dom.AbstractElement',

    /**
     * Appends the passed element(s) to this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object} el The id or element to insert or a DomHelper config
     * The id of the node, a DOM Node or an existing Element.
     * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.AbstractElement
     * @return {Ext.dom.AbstractElement} The inserted Element.
     */
    appendChild: function(el, returnDom) {
        var me = this,
            insertEl,
            eLen, e, oldUseDom;

        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            me.dom.appendChild(el);
            return !returnDom ? Ext.get(el) : el;
        } else if (el.length) {
            // append all elements to a documentFragment
            insertEl = Ext.fly(document.createDocumentFragment(), '_internal');
            eLen = el.length;

            // DocumentFragments cannot accept innerHTML
            Ext.DomHelper.useDom = true;
            for (e = 0; e < eLen; e++) {
                insertEl.appendChild(el[e], returnDom);
            }
            Ext.DomHelper.useDom = oldUseDom;
            me.dom.appendChild(insertEl.dom);
            return returnDom ? insertEl.dom : insertEl;
        }
        else { // dh config
            return me.createChild(el, null, returnDom);
        }
    },

    /**
     * Appends this element to the passed element
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The new parent element.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    appendTo: function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    /**
     * Inserts this element before the passed element in the DOM
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element before which this element will be inserted.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    insertBefore: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    /**
     * Inserts this element after the passed element in the DOM
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element to insert after.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    insertAfter: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    /**
     * Inserts (or creates) an element (or DomHelper config) as the first child of this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object} el The id or element to insert or a DomHelper config
     * to create and insert
     * @return {Ext.dom.AbstractElement} The new child
     */
    insertFirst: function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { // dh config
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    /**
     * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object/Array} el The id, element to insert or a DomHelper config
     * to create and insert *or* an array of any of those.
     * @param {String} [where='before'] 'before' or 'after'
     * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.AbstractElement
     * @return {Ext.dom.AbstractElement} The inserted Element. If an array is passed, the last inserted element is returned.
     */
    insertSibling: function(el, where, returnDom) {
        var me        = this,
            DomHelper = Ext.core.DomHelper,
            oldUseDom = DomHelper.useDom,
            isAfter   = (where || 'before').toLowerCase() == 'after',
            rt, insertEl, eLen, e;

        if (Ext.isArray(el)) {
            // append all elements to a documentFragment
            insertEl = Ext.fly(document.createDocumentFragment(), '_internal');
            eLen = el.length;

            // DocumentFragments cannot accept innerHTML
            DomHelper.useDom = true;
            for (e = 0; e < eLen; e++) {
                rt = insertEl.appendChild(el[e], returnDom);
            }
            DomHelper.useDom = oldUseDom;

            // Insert fragment into document
            me.dom.parentNode.insertBefore(insertEl.dom, isAfter ? me.dom.nextSibling : me.dom);
            return rt;
        }

        el = el || {};

        if (el.nodeType || el.dom) {
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        } else {
            if (isAfter && !me.dom.nextSibling) {
                rt = DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    /**
     * Replaces the passed element with this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element to replace.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    replace: function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    /**
     * Replaces this element with the passed element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object} el The new element (id of the node, a DOM Node
     * or an existing Element) or a DomHelper config of an element to create
     * @return {Ext.dom.AbstractElement} This element
     */
    replaceWith: function(el){
        var me = this;

        if (el.nodeType || el.dom || typeof el == 'string') {
            el = Ext.get(el);
            me.dom.parentNode.insertBefore(el.dom, me.dom);
        } else {
            el = Ext.core.DomHelper.insertBefore(me.dom, el);
        }

        delete Ext.cache[me.id];
        Ext.removeNode(me.dom);
        me.id = Ext.id(me.dom = el);
        Ext.dom.AbstractElement.addToCache(me.isFlyweight ? new Ext.dom.AbstractElement(me.dom) : me);
        return me;
    },

    /**
     * Creates the passed DomHelper config and appends it to this element or optionally inserts it before the passed child element.
     * @param {Object} config DomHelper element config object.  If no tag is specified (e.g., {tag:'input'}) then a div will be
     * automatically generated with the specified attributes.
     * @param {HTMLElement} [insertBefore] a child element of this element
     * @param {Boolean} [returnDom=false] true to return the dom node instead of creating an Element
     * @return {Ext.dom.AbstractElement} The new child element
     */
    createChild: function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.core.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.core.DomHelper.append(this.dom, config,  returnDom !== true);
        }
    },

    /**
     * Creates and wraps this element with another element
     * @param {Object} [config] DomHelper element config object for the wrapper element or null for an empty div
     * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.AbstractElement
     * @param {String} [selector] A {@link Ext.dom.Query DomQuery} selector to select a descendant node within the created element to use as the wrapping element.
     * @return {HTMLElement/Ext.dom.AbstractElement} The newly created wrapper element
     */
    wrap: function(config, returnDom, selector) {
        var newEl = Ext.core.DomHelper.insertBefore(this.dom, config || {tag: "div"}, true),
            target = newEl;
        
        if (selector) {
            target = Ext.DomQuery.selectNode(selector, newEl.dom);
        }

        target.appendChild(this.dom);
        return returnDom ? newEl.dom : newEl;
    },

    /**
     * Inserts an html fragment into this element
     * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * See {@link Ext.dom.Helper#insertHtml} for details.
     * @param {String} html The HTML fragment
     * @param {Boolean} [returnEl=false] True to return an Ext.dom.AbstractElement
     * @return {HTMLElement/Ext.dom.AbstractElement} The inserted node (or nearest related if more than 1 inserted)
     */
    insertHtml: function(where, html, returnEl) {
        var el = Ext.core.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.AbstractElement_style', {

    override: 'Ext.dom.AbstractElement'

}, function() {
    // local style camelizing for speed
    var Element = this,
        wordsRe = /\w/g,
        spacesRe = /\s+/,
        transparentRe = /^(?:transparent|(?:rgba[(](?:\s*\d+\s*[,]){3}\s*0\s*[)]))$/i,
        // In some browsers, currently IE10 and older chrome versions, when ClassList is 
        // supported most elements will have the classList attribute, but some svg elements
        // will still not have it present, so in a small amount of cases we'll still need
        // to check at run time whether we can use it.
        hasClassList = Ext.supports.ClassList,
        PADDING = 'padding',
        MARGIN = 'margin',
        BORDER = 'border',
        LEFT_SUFFIX = '-left',
        RIGHT_SUFFIX = '-right',
        TOP_SUFFIX = '-top',
        BOTTOM_SUFFIX = '-bottom',
        WIDTH = '-width',
        // special markup used throughout Ext when box wrapping elements
        borders = {l: BORDER + LEFT_SUFFIX + WIDTH, r: BORDER + RIGHT_SUFFIX + WIDTH, t: BORDER + TOP_SUFFIX + WIDTH, b: BORDER + BOTTOM_SUFFIX + WIDTH},
        paddings = {l: PADDING + LEFT_SUFFIX, r: PADDING + RIGHT_SUFFIX, t: PADDING + TOP_SUFFIX, b: PADDING + BOTTOM_SUFFIX},
        margins = {l: MARGIN + LEFT_SUFFIX, r: MARGIN + RIGHT_SUFFIX, t: MARGIN + TOP_SUFFIX, b: MARGIN + BOTTOM_SUFFIX},
        internalFly = new Element.Fly();


    Ext.override(Element, {

        /**
         * This shared object is keyed by style name (e.g., 'margin-left' or 'marginLeft'). The
         * values are objects with the following properties:
         *
         *  * `name` (String) : The actual name to be presented to the DOM. This is typically the value
         *      returned by {@link #normalize}.
         *  * `get` (Function) : A hook function that will perform the get on this style. These
         *      functions receive "(dom, el)" arguments. The `dom` parameter is the DOM Element
         *      from which to get ths tyle. The `el` argument (may be null) is the Ext.Element.
         *  * `set` (Function) : A hook function that will perform the set on this style. These
         *      functions receive "(dom, value, el)" arguments. The `dom` parameter is the DOM Element
         *      from which to get ths tyle. The `value` parameter is the new value for the style. The
         *      `el` argument (may be null) is the Ext.Element.
         *
         * The `this` pointer is the object that contains `get` or `set`, which means that
         * `this.name` can be accessed if needed. The hook functions are both optional.
         * @private
         */
        styleHooks: {},

        // private
        addStyles : function(sides, styles){
            var totalSize = 0,
                sidesArr = (sides || '').match(wordsRe),
                i,
                len = sidesArr.length,
                side,
                styleSides = [];

            if (len == 1) {
                totalSize = Math.abs(parseFloat(this.getStyle(styles[sidesArr[0]])) || 0);
            } else if (len) {
                for (i = 0; i < len; i++) {
                    side = sidesArr[i];
                    styleSides.push(styles[side]);
                }
                //Gather all at once, returning a hash
                styleSides = this.getStyle(styleSides);

                for (i=0; i < len; i++) {
                    side = sidesArr[i];
                    totalSize += Math.abs(parseFloat(styleSides[styles[side]]) || 0);
                }
            }

            return totalSize;
        },

        /**
         * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
         * @param {String/String[]} className The CSS classes to add separated by space, or an array of classes
         * @return {Ext.dom.Element} this
         * @method
         */
        addCls: (function(){
            var addWithClassList = function(className) {
                if (String(className).indexOf('undefined') > -1) {
                    Ext.Logger.warn("called with an undefined className: " + className);
                }
                var me = this,
                    dom = me.dom,
                    trimRe = me.trimRe,
                    origClassName = className,
                    classList,
                    newCls,
                    i,
                    len,
                    cls;

                if (typeof(className) == 'string') {
                    // split string on spaces to make an array of className
                    className = className.replace(trimRe, '').split(spacesRe);
                }

                // the gain we have here is that we can skip parsing className and use the
                // classList.contains method, so now O(M) not O(M+N)
                if (dom && className && !!(len = className.length)) {
                    if (!dom.className) {
                        dom.className = className.join(' ');
                    } else {
                        classList = dom.classList;
                        if (classList) {
                            for (i = 0; i < len; ++i) {
                                cls = className[i];
                                if (cls) {
                                    if (!classList.contains(cls)) {
                                        if (newCls) {
                                            newCls.push(cls);
                                        } else {
                                            newCls = dom.className.replace(trimRe, '');
                                            newCls = newCls ? [newCls, cls] : [cls];
                                        }
                                    }
                                }
                            }

                            if (newCls) {
                                dom.className = newCls.join(' '); // write to DOM once
                            }
                        } else {
                            addWithoutClassList(origClassName);
                        }
                    }
                }
                return me;
            }, addWithoutClassList = function(className) {
                if (String(className).indexOf('undefined') > -1) {
                    Ext.Logger.warn("called with an undefined className: '" + className + "'");
                }
                var me = this,
                    dom = me.dom,
                    elClasses;

                if (dom && className && className.length) {
                    elClasses = Ext.Element.mergeClsList(dom.className, className);
                    if (elClasses.changed) {
                        dom.className = elClasses.join(' '); // write to DOM once
                    }
                }
                return me;
            };
            
            return hasClassList ? addWithClassList : addWithoutClassList;
        })(),


        /**
         * Removes one or more CSS classes from the element.
         * @param {String/String[]} className The CSS classes to remove separated by space, or an array of classes
         * @return {Ext.dom.Element} this
         */
        removeCls: function(className) {
            var me = this,
                dom = me.dom,
                classList,
                len,
                elClasses;

            if (typeof(className) == 'string') {
                // split string on spaces to make an array of className
                className = className.replace(me.trimRe, '').split(spacesRe);
            }

            if (dom && dom.className && className && !!(len = className.length)) {
                classList = dom.classList;
                if (len === 1 && classList) {
                    if (className[0]) {
                        classList.remove(className[0]); // one DOM write
                    }
                } else {
                    elClasses = Ext.Element.removeCls(dom.className, className);
                    if (elClasses.changed) {
                        dom.className = elClasses.join(' ');
                    }
                }
            }
            return me;
        },

        /**
         * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
         * @param {String/String[]} className The CSS class to add, or an array of classes
         * @return {Ext.dom.Element} this
         */
        radioCls: function(className) {
            var cn = this.dom.parentNode.childNodes,
                v,
                i, len;
            className = Ext.isArray(className) ? className: [className];
            for (i = 0, len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType == 1) {
                    internalFly.attach(v).removeCls(className);
                }
            }
            return this.addCls(className);
        },

        /**
         * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
         * @param {String} className The CSS class to toggle
         * @return {Ext.dom.Element} this
         * @method
         */
        toggleCls: (function(){
            var toggleWithClassList = function(className){
                var me = this,
                    dom = me.dom,
                    classList;

                if (dom) {
                    className = className.replace(me.trimRe, '');
                    if (className) {
                        classList = dom.classList;
                        if (classList) {
                            classList.toggle(className);
                        } else {
                            toggleWithoutClassList(className);
                        }
                    }
                }

                return me;
            }, toggleWithoutClassList = function(className){
                return this.hasCls(className) ? this.removeCls(className) : this.addCls(className);
            };
            
            return hasClassList ? toggleWithClassList :  toggleWithoutClassList;
        })(),

        /**
         * Checks if the specified CSS class exists on this element's DOM node.
         * @param {String} className The CSS class to check for
         * @return {Boolean} True if the class exists, else false
         * @method
         */
        hasCls: (function(){
            var hasClsWithClassList = function(className) {
                var dom = this.dom,
                    out = false,
                    classList;
                    
                if (dom && className) {
                    classList = dom.classList;
                    if (classList) {
                        out = classList.contains(className);
                    } else {
                        out = hasClsWithoutClassList(className);
                    }
                }
                return out;
            }, hasClsWithoutClassList = function(className){
                var dom = this.dom;
                return dom ? className && (' '+dom.className+' ').indexOf(' '+className+' ') !== -1 : false;
            };
            
            return hasClassList ? hasClsWithClassList : hasClsWithoutClassList;
        })(),

        /**
         * Replaces a CSS class on the element with another.  If the old name does not exist, the new name will simply be added.
         * @param {String} oldClassName The CSS class to replace
         * @param {String} newClassName The replacement CSS class
         * @return {Ext.dom.Element} this
         */
        replaceCls: function(oldClassName, newClassName){
            return this.removeCls(oldClassName).addCls(newClassName);
        },

        /**
         * Checks if the current value of a style is equal to a given value.
         * @param {String} style property whose value is returned.
         * @param {String} value to check against.
         * @return {Boolean} true for when the current value equals the given value.
         */
        isStyle: function(style, val) {
            return this.getStyle(style) == val;
        },

        /**
         * Returns a named style property based on computed/currentStyle (primary) and
         * inline-style if primary is not available.
         *
         * @param {String/String[]} property The style property (or multiple property names
         * in an array) whose value is returned.
         * @param {Boolean} [inline=false] if `true` only inline styles will be returned.
         * @return {String/Object} The current value of the style property for this element
         * (or a hash of named style values if multiple property arguments are requested).
         * @method
         */
        getStyle: function (property, inline) {
            var me = this,
                dom = me.dom,
                multiple = typeof property != 'string',
                hooks = me.styleHooks,
                prop = property,
                props = prop,
                len = 1,
                domStyle, camel, values, hook, out, style, i;

            if (multiple) {
                values = {};
                prop = props[0];
                i = 0;
                if (!(len = props.length)) {
                    return values;
                }
            }

            if (!dom || dom.documentElement) {
                return values || '';
            }

            domStyle = dom.style;

            if (inline) {
                style = domStyle;
            } else {
                // Caution: Firefox will not render "presentation" (ie. computed styles) in
                // iframes that are display:none or those inheriting display:none. Similar
                // issues with legacy Safari.
                //
                style = dom.ownerDocument.defaultView.getComputedStyle(dom, null);

                // fallback to inline style if rendering context not available
                if (!style) {
                    inline = true;
                    style = domStyle;
                }
            }

            do {
                hook = hooks[prop];

                if (!hook) {
                    hooks[prop] = hook = { name: Element.normalize(prop) };
                }

                if (hook.get) {
                    out = hook.get(dom, me, inline, style);
                } else {
                    camel = hook.name;
                    out = style[camel];
                }

                if (!multiple) {
                   return out;
                }

                values[prop] = out;
                prop = props[++i];
            } while (i < len);

            return values;
        },

        getStyles: function () {
            var props = Ext.Array.slice(arguments),
                len = props.length,
                inline;

            if (len && typeof props[len-1] == 'boolean') {
                inline = props.pop();
            }

            return this.getStyle(props, inline);
        },

        /**
         * Returns true if the value of the given property is visually transparent. This
         * may be due to a 'transparent' style value or an rgba value with 0 in the alpha
         * component.
         * @param {String} prop The style property whose value is to be tested.
         * @return {Boolean} True if the style property is visually transparent.
         */
        isTransparent: function (prop) {
            var value = this.getStyle(prop);
            return value ? transparentRe.test(value) : false;
        },

        /**
         * Wrapper for setting style properties, also takes single object parameter of multiple styles.
         * @param {String/Object} property The style property to be set, or an object of multiple styles.
         * @param {String} [value] The value to apply to the given property, or null if an object was passed.
         * @return {Ext.dom.Element} this
         */
        setStyle: function(prop, value) {
            var me = this,
                dom = me.dom,
                hooks = me.styleHooks,
                style = dom.style,
                name = prop,
                hook;

            // we don't promote the 2-arg form to object-form to avoid the overhead...
            if (typeof name == 'string') {
                hook = hooks[name];
                if (!hook) {
                    hooks[name] = hook = { name: Element.normalize(name) };
                }
                value = (value == null) ? '' : value;
                if (hook.set) {
                    hook.set(dom, value, me);
                } else {
                    style[hook.name] = value;
                }
                if (hook.afterSet) {
                    hook.afterSet(dom, value, me);
                }
            } else {
                for (name in prop) {
                    if (prop.hasOwnProperty(name)) {
                        hook = hooks[name];
                        if (!hook) {
                            hooks[name] = hook = { name: Element.normalize(name) };
                        }
                        value = prop[name];
                        value = (value == null) ? '' : value;
                        if (hook.set) {
                            hook.set(dom, value, me);
                        } else {
                            style[hook.name] = value;
                        }
                        if (hook.afterSet) {
                            hook.afterSet(dom, value, me);
                        }
                    }
                }
            }

            return me;
        },

        /**
         * Returns the offset height of the element
         * @param {Boolean} [contentHeight] true to get the height minus borders and padding
         * @return {Number} The element's height
         */
        getHeight: function(contentHeight) {
            var dom = this.dom,
                height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
            return height > 0 ? height: 0;
        },

        /**
         * Returns the offset width of the element
         * @param {Boolean} [contentWidth] true to get the width minus borders and padding
         * @return {Number} The element's width
         */
        getWidth: function(contentWidth) {
            var dom = this.dom,
                width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
            return width > 0 ? width: 0;
        },

        /**
         * Set the width of this Element.
         * @param {Number/String} width The new width. This may be one of:
         *
         * - A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).
         * - A String used to set the CSS width style. Animation may **not** be used.
         *
         * @return {Ext.dom.Element} this
         */
        setWidth: function(width) {
            var me = this;
                me.dom.style.width = Element.addUnits(width);
            return me;
        },

        /**
         * Set the height of this Element.
         *
         *     // change the height to 200px and animate with default configuration
         *     Ext.fly('elementId').setHeight(200, true);
         *
         *     // change the height to 150px and animate with a custom configuration
         *     Ext.fly('elId').setHeight(150, {
         *         duration : 500, // animation will have a duration of .5 seconds
         *         // will change the content to "finished"
         *         callback: function(){ this.{@link #update}("finished"); }
         *     });
         *
         * @param {Number/String} height The new height. This may be one of:
         *
         * - A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels.)
         * - A String used to set the CSS height style. Animation may **not** be used.
         *
         * @return {Ext.dom.Element} this
         */
        setHeight: function(height) {
            var me = this;
                me.dom.style.height = Element.addUnits(height);
            return me;
        },

        /**
         * Gets the width of the border(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing `'lr'` would get the border **l**eft width + the border **r**ight width.
         * @return {Number} The width of the sides passed added together
         */
        getBorderWidth: function(side){
            return this.addStyles(side, borders);
        },

        /**
         * Gets the width of the padding(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
         * passing `'lr'` would get the padding **l**eft + the padding **r**ight.
         * @return {Number} The padding of the sides passed added together
         */
        getPadding: function(side){
            return this.addStyles(side, paddings);
        },

        margins : margins,

        /**
         * More flexible version of {@link #setStyle} for setting style properties.
         * @param {String/Object/Function} styles A style specification string, e.g. "width:100px", or object in the form {width:"100px"}, or
         * a function which returns such a specification.
         * @return {Ext.dom.Element} this
         */
        applyStyles: function(styles) {
            if (styles) {
                var i,
                    len,
                    dom = this.dom;

                if (typeof styles == 'function') {
                    styles = styles.call();
                }
                if (typeof styles == 'string') {
                    styles = Ext.util.Format.trim(styles).split(/\s*(?::|;)\s*/);
                    for (i = 0, len = styles.length; i < len;) {
                        dom.style[Element.normalize(styles[i++])] = styles[i++];
                    }
                }
                else if (typeof styles == 'object') {
                    this.setStyle(styles);
                }
            }
        },

        /**
         * Set the size of this Element. If animation is true, both width and height will be animated concurrently.
         * @param {Number/String} width The new width. This may be one of:
         *
         * - A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).
         * - A String used to set the CSS width style. Animation may **not** be used.
         * - A size object in the format `{width: widthValue, height: heightValue}`.
         *
         * @param {Number/String} height The new height. This may be one of:
         *
         * - A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels).
         * - A String used to set the CSS height style. Animation may **not** be used.
         *
         * @return {Ext.dom.Element} this
         */
        setSize: function(width, height) {
            var me = this,
                style = me.dom.style;

            if (Ext.isObject(width)) {
                // in case of object from getSize()
                height = width.height;
                width = width.width;
            }

            style.width = Element.addUnits(width);
            style.height = Element.addUnits(height);
            return me;
        },

        /**
         * Returns the dimensions of the element available to lay content out in.
         *
         * If the element (or any ancestor element) has CSS style `display: none`, the dimensions will be zero.
         *
         * Example:
         *
         *     var vpSize = Ext.getBody().getViewSize();
         *
         *     // all Windows created afterwards will have a default value of 90% height and 95% width
         *     Ext.Window.override({
         *         width: vpSize.width * 0.9,
         *         height: vpSize.height * 0.95
         *     });
         *     // To handle window resizing you would have to hook onto onWindowResize.
         *
         * getViewSize utilizes clientHeight/clientWidth which excludes sizing of scrollbars.
         * To obtain the size including scrollbars, use getStyleSize
         *
         * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
         *
         * @return {Object} Object describing width and height.
         * @return {Number} return.width
         * @return {Number} return.height
         */
        getViewSize: function() {
            var doc = document,
                dom = this.dom;

            if (dom == doc || dom == doc.body) {
                return {
                    width: Element.getViewportWidth(),
                    height: Element.getViewportHeight()
                };
            }
            else {
                return {
                    width: dom.clientWidth,
                    height: dom.clientHeight
                };
            }
        },

        /**
         * Returns the size of the element.
         * @param {Boolean} [contentSize] true to get the width/size minus borders and padding
         * @return {Object} An object containing the element's size:
         * @return {Number} return.width
         * @return {Number} return.height
         */
        getSize: function(contentSize) {
            var dom = this.dom;
            return {
                width: Math.max(0, contentSize ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth),
                height: Math.max(0, contentSize ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight)
            };
        },

        /**
         * Forces the browser to repaint this element
         * @return {Ext.dom.Element} this
         */
        repaint: function() {
            var dom = this.dom;
            this.addCls(Ext.baseCSSPrefix + 'repaint');
            setTimeout(function(){
                internalFly.attach(dom).removeCls(Ext.baseCSSPrefix + 'repaint');
            }, 1);
            return this;
        },

        /**
         * Returns an object with properties top, left, right and bottom representing the margins of this element unless sides is passed,
         * then it returns the calculated width of the sides (see getPadding)
         * @param {String} [sides] Any combination of l, r, t, b to get the sum of those sides
         * @return {Object/Number}
         */
        getMargin: function(side){
            var me = this,
                hash = {t:"top", l:"left", r:"right", b: "bottom"},
                key,
                o,
                margins;

            if (!side) {
                margins = [];
                for (key in me.margins) {
                    if(me.margins.hasOwnProperty(key)) {
                        margins.push(me.margins[key]);
                    }
                }
                o = me.getStyle(margins);
                if(o && typeof o == 'object') {
                    //now mixin nomalized values (from hash table)
                    for (key in me.margins) {
                        if(me.margins.hasOwnProperty(key)) {
                            o[hash[key]] = parseFloat(o[me.margins[key]]) || 0;
                        }
                    }
                }

                return o;
            } else {
                return me.addStyles(side, me.margins);
            }
        },

        /**
         * Puts a mask over this element to disable user interaction. Requires core.css.
         * This method can only be applied to elements which accept child nodes.
         * @param {String} [msg] A message to display in the mask
         * @param {String} [msgCls] A css class to apply to the msg element
         */
        mask: function(msg, msgCls, transparent) {
            var me = this,
                dom = me.dom,
                data = (me.$cache || me.getCache()).data,
                el = data.mask,
                mask,
                size,
                cls = '',
                prefix = Ext.baseCSSPrefix;

            me.addCls(prefix + 'masked');
            if (me.getStyle("position") == "static") {
                me.addCls(prefix + 'masked-relative');
            }
            if (el) {
                el.remove();
            }
            if (msgCls && typeof msgCls == 'string' ) {
                cls = ' ' + msgCls;
            }
            else {
                cls = ' ' + prefix + 'mask-gray';
            }

            mask = me.createChild({
                cls: prefix + 'mask' + ((transparent !== false) ? '' : (' ' + prefix + 'mask-gray')),
                html: msg ? ('<div class="' + (msgCls || (prefix + 'mask-message')) + '">' + msg + '</div>') : ''
            });

            size = me.getSize();

            data.mask = mask;

            if (dom === document.body) {
                size.height = window.innerHeight;
                if (me.orientationHandler) {
                    Ext.EventManager.unOrientationChange(me.orientationHandler, me);
                }

                me.orientationHandler = function() {
                    size = me.getSize();
                    size.height = window.innerHeight;
                    mask.setSize(size);
                };

                Ext.EventManager.onOrientationChange(me.orientationHandler, me);
            }
            mask.setSize(size);
            if (Ext.is.iPad) {
                Ext.repaint();
            }
        },

        /**
         * Removes a previously applied mask.
         */
        unmask: function() {
            var me = this,
                data = (me.$cache || me.getCache()).data,
                mask = data.mask,
                prefix = Ext.baseCSSPrefix;

            if (mask) {
                mask.remove();
                delete data.mask;
            }
            me.removeCls([prefix + 'masked', prefix + 'masked-relative']);

            if (me.dom === document.body) {
                Ext.EventManager.unOrientationChange(me.orientationHandler, me);
                delete me.orientationHandler;
            }
        }
    });


    Ext.onReady(function () {
        var supports = Ext.supports,
            styleHooks,
            colorStyles, i, name, camel;

        function fixTransparent (dom, el, inline, style) {
            var value = style[this.name] || '';
            return transparentRe.test(value) ? 'transparent' : value;
        }

        function fixRightMargin (dom, el, inline, style) {
            var result = style.marginRight,
                domStyle, display;

            // Ignore cases when the margin is correctly reported as 0, the bug only shows
            // numbers larger.
            if (result != '0px') {
                domStyle = dom.style;
                display = domStyle.display;
                domStyle.display = 'inline-block';
                result = (inline ? style : dom.ownerDocument.defaultView.getComputedStyle(dom, null)).marginRight;
                domStyle.display = display;
            }

            return result;
        }

        function fixRightMarginAndInputFocus (dom, el, inline, style) {
            var result = style.marginRight,
                domStyle, cleaner, display;

            if (result != '0px') {
                domStyle = dom.style;
                cleaner = Element.getRightMarginFixCleaner(dom);
                display = domStyle.display;
                domStyle.display = 'inline-block';
                result = (inline ? style : dom.ownerDocument.defaultView.getComputedStyle(dom, '')).marginRight;
                domStyle.display = display;
                cleaner();
            }

            return result;
        }

        styleHooks = Element.prototype.styleHooks;

        // Ext.supports needs to be initialized (we run very early in the onready sequence),
        // but it is OK to call Ext.supports.init() more times than necessary...
        if (supports.init) {
            supports.init();
        }

        // Fix bug caused by this: https://bugs.webkit.org/show_bug.cgi?id=13343
        if (!supports.RightMargin) {
            styleHooks.marginRight = styleHooks['margin-right'] = {
                name: 'marginRight',
                // TODO - Touch should use conditional compilation here or ensure that the
                //      underlying Ext.supports flags are set correctly...
                get: (supports.DisplayChangeInputSelectionBug || supports.DisplayChangeTextAreaSelectionBug) ?
                    fixRightMarginAndInputFocus : fixRightMargin
            };
        }

        if (!supports.TransparentColor) {
            colorStyles = ['background-color', 'border-color', 'color', 'outline-color'];
            for (i = colorStyles.length; i--; ) {
                name = colorStyles[i];
                camel = Element.normalize(name);

                styleHooks[name] = styleHooks[camel] = {
                    name: camel,
                    get: fixTransparent
                };
            }
        }
    });

});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.AbstractElement_traversal', {
    override: 'Ext.dom.AbstractElement',

    /**
     * Looks at this node and then at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} [limit]
     * The max depth to search as a number or an element which causes the upward traversal to stop
     * and is <b>not</b> considered for inclusion as the result. (defaults to 50 || document.documentElement)
     * @param {Boolean} [returnEl=false] True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParent: function(simpleSelector, limit, returnEl) {
        var target = this.dom,
            topmost = document.documentElement,
            depth = 0,
            stopEl;

        limit = limit || 50;
        if (isNaN(limit)) {
            stopEl = Ext.getDom(limit);
            limit = Number.MAX_VALUE;
        }
        while (target && target.nodeType == 1 && depth < limit && target != topmost && target != stopEl) {
            if (Ext.DomQuery.is(target, simpleSelector)) {
                return returnEl ? Ext.get(target) : target;
            }
            depth++;
            target = target.parentNode;
        }
        return null;
    },

    /**
     * Looks at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} [limit]
     * The max depth to search as a number or an element which causes the upward traversal to stop
     * and is <b>not</b> considered for inclusion as the result. (defaults to 50 || document.documentElement)
     * @param {Boolean} [returnEl=false] True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParentNode: function(simpleSelector, limit, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, limit, returnEl) : null;
    },

    /**
     * Walks up the DOM looking for a parent node that matches the passed simple selector (e.g. div.some-class or span:first-child).
     * This is a shortcut for findParentNode() that always returns an Ext.dom.Element.
     * @param {String} selector The simple selector to test
     * @param {Number/String/HTMLElement/Ext.Element} [limit]
     * The max depth to search as a number or an element which causes the upward traversal to stop
     * and is <b>not</b> considered for inclusion as the result. (defaults to 50 || document.documentElement)
     * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element
     * @return {Ext.Element} The matching DOM node (or null if no match was found)
     */
    up: function(simpleSelector, limit, returnDom) {
        return this.findParentNode(simpleSelector, limit, !returnDom);
    },

    /**
     * Creates a {@link Ext.CompositeElement} for child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} [unique] True to create a unique Ext.Element for each element. Defaults to a shared flyweight object.
     * @return {Ext.CompositeElement} The composite element
     */
    select: function(selector, composite) {
        return Ext.dom.Element.select(selector, this.dom, composite);
    },

    /**
     * Selects child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {HTMLElement[]} An array of the matched nodes
     */
    query: function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    /**
     * Selects a single child at any depth below this element based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element
     * @return {HTMLElement/Ext.dom.Element} The child Ext.dom.Element (or DOM node if returnDom = true)
     */
    down: function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    /**
     * Selects a single *direct* child based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element.
     * @return {HTMLElement/Ext.dom.Element} The child Ext.dom.Element (or DOM node if returnDom = true)
     */
    child: function(selector, returnDom) {
        var node,
            me = this,
            id;

        // Pull the ID from the DOM (Ext.id also ensures that there *is* an ID).
        // If this object is a Flyweight, it will not have an ID
        id = Ext.id(me.dom);
        // Escape "invalid" chars
        id = Ext.escapeId(id);
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     /**
     * Gets the parent node for this element, optionally chaining up trying to match a selector
     * @param {String} [selector] Find a parent node that matches the passed simple selector
     * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The parent node or null
     */
    parent: function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     /**
     * Gets the next sibling, skipping text nodes
     * @param {String} [selector] Find the next sibling that matches the passed simple selector
     * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The next sibling or null
     */
    next: function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    /**
     * Gets the previous sibling, skipping text nodes
     * @param {String} [selector] Find the previous sibling that matches the passed simple selector
     * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The previous sibling or null
     */
    prev: function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    /**
     * Gets the first child, skipping text nodes
     * @param {String} [selector] Find the next sibling that matches the passed simple selector
     * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The first child or null
     */
    first: function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    /**
     * Gets the last child, skipping text nodes
     * @param {String} [selector] Find the previous sibling that matches the passed simple selector
     * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The last child or null
     */
    last: function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode: function(dir, start, selector, returnDom) {
        if (!this.dom) {
            return null;
        }

        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    },

    isAncestor: function(element) {
        return this.self.isAncestor.call(this.self, this.dom, element);
    }
});

// @tag dom,core
// @require Ext.Supports

/**
 * @private
 */
Ext.define('Ext.dom.AbstractElement', {
               
                           
                                         
                                            
                                        
                                           
      

    trimRe: /^\s+|\s+$/g,
    whitespaceRe: /\s/,
    
    inheritableStatics: {
        trimRe: /^\s+|\s+$/g,
        whitespaceRe: /\s/,

        /**
         * Retrieves Ext.dom.Element objects. {@link Ext#get} is alias for {@link Ext.dom.Element#get}.
         *
         * **This method does not retrieve {@link Ext.Component Component}s.** This method retrieves Ext.dom.Element
         * objects which encapsulate DOM elements. To retrieve a Component by its ID, use {@link Ext.ComponentManager#get}.
         * 
         * When passing an id, it should not include the `#` character that is used for a css selector.
         * 
         *     // For an element with id 'foo'
         *     Ext.get('foo'); // Correct
         *     Ext.get('#foo'); // Incorrect
         *
         * Uses simple caching to consistently return the same object. Automatically fixes if an object was recreated with
         * the same id via AJAX or DOM.
         *
         * @param {String/HTMLElement/Ext.Element} el The id of the node, a DOM Node or an existing Element.
         * @return {Ext.dom.Element} The Element object (or null if no matching element was found)
         * @static
         * @inheritable
         */
        get: function(el) {
            var me = this,
                document = window.document,
                El = Ext.dom.Element,
                cacheItem,
                docEl,
                extEl,
                dom,
                id;

            if (!el) {
                return null;
            }

            // Ext.get(flyweight) must return an Element instance, not the flyweight
            if (el.isFly) {
                el = el.dom;
            }

            if (typeof el == "string") { // element id
                if (el == Ext.windowId) {
                    return El.get(window);
                } else if (el == Ext.documentId) {
                    return El.get(document);
                }
                
                cacheItem = Ext.cache[el];
                // This code is here to catch the case where we've got a reference to a document of an iframe
                // It getElementById will fail because it's not part of the document, so if we're skipping
                // GC it means it's a window/document object that isn't the default window/document, which we have
                // already handled above
                if (cacheItem && cacheItem.skipGarbageCollection) {
                    extEl = cacheItem.el;
                    return extEl;
                }
                
                if (!(dom = document.getElementById(el))) {
                    return null;
                }

                if (cacheItem && cacheItem.el) {
                    extEl = Ext.updateCacheEntry(cacheItem, dom).el;
                } else {
                    // Force new element if there's a cache but no el attached
                    extEl = new El(dom, !!cacheItem);
                }
                return extEl;
            } else if (el.tagName) { // dom element
                if (!(id = el.id)) {
                    id = Ext.id(el);
                }
                cacheItem = Ext.cache[id];
                if (cacheItem && cacheItem.el) {
                    extEl = Ext.updateCacheEntry(cacheItem, el).el;
                } else {
                    // Force new element if there's a cache but no el attached
                    extEl = new El(el, !!cacheItem);
                }
                return extEl;
            } else if (el instanceof me) {
                if (el != me.docEl && el != me.winEl) {
                    id = el.id;
                    // refresh dom element in case no longer valid,
                    // catch case where it hasn't been appended
                    cacheItem = Ext.cache[id];
                    if (cacheItem) {
                        Ext.updateCacheEntry(cacheItem, document.getElementById(id) || el.dom);
                    }
                }
                return el;
            } else if (el.isComposite) {
                return el;
            } else if (Ext.isArray(el)) {
                return me.select(el);
            } else if (el === document) {
                // create a bogus element object representing the document object
                if (!me.docEl) {
                    docEl = me.docEl = Ext.Object.chain(El.prototype);
                    docEl.dom = document;
                    // set an "el" property on the element that references itself.
                    // This allows Ext.util.Positionable methods to operate on
                    // this.el.dom since it gets mixed into both Element and Component
                    docEl.el = docEl;
                    docEl.id = Ext.id(document);
                    me.addToCache(docEl);
                }
                return me.docEl;
            } else if (el === window) {
                if (!me.winEl) {
                    me.winEl = Ext.Object.chain(El.prototype);
                    me.winEl.dom = window;
                    me.winEl.id = Ext.id(window);
                    me.addToCache(me.winEl);
                }
                return me.winEl;
            }
            return null;
        },

        addToCache: function(el, id) {
            if (el) {
                Ext.addCacheEntry(id, el);
            }
            return el;
        },

        addMethods: function() {
            this.override.apply(this, arguments);
        },

        /**
         * <p>Returns an array of unique class names based upon the input strings, or string arrays.</p>
         * <p>The number of parameters is unlimited.</p>
         * <p>Example</p><pre><code>
// Add x-invalid and x-mandatory classes, do not duplicate
myElement.dom.className = Ext.core.Element.mergeClsList(this.initialClasses, 'x-invalid x-mandatory');
</code></pre>
         * @param {Mixed} clsList1 A string of class names, or an array of class names.
         * @param {Mixed} clsList2 A string of class names, or an array of class names.
         * @return {Array} An array of strings representing remaining unique, merged class names. If class names were added to the first list, the <code>changed</code> property will be <code>true</code>.
         * @static
         * @inheritable
         */
        mergeClsList: function() {
            var clsList, clsHash = {},
                i, length, j, listLength, clsName, result = [],
                changed = false,
                trimRe = this.trimRe,
                whitespaceRe = this.whitespaceRe;

            for (i = 0, length = arguments.length; i < length; i++) {
                clsList = arguments[i];
                if (Ext.isString(clsList)) {
                    clsList = clsList.replace(trimRe, '').split(whitespaceRe);
                }
                if (clsList) {
                    for (j = 0, listLength = clsList.length; j < listLength; j++) {
                        clsName = clsList[j];
                        if (!clsHash[clsName]) {
                            if (i) {
                                changed = true;
                            }
                            clsHash[clsName] = true;
                        }
                    }
                }
            }

            for (clsName in clsHash) {
                result.push(clsName);
            }
            result.changed = changed;
            return result;
        },

        /**
         * <p>Returns an array of unique class names deom the first parameter with all class names
         * from the second parameter removed.</p>
         * <p>Example</p><pre><code>
// Remove x-invalid and x-mandatory classes if present.
myElement.dom.className = Ext.core.Element.removeCls(this.initialClasses, 'x-invalid x-mandatory');
</code></pre>
         * @param {Mixed} existingClsList A string of class names, or an array of class names.
         * @param {Mixed} removeClsList A string of class names, or an array of class names to remove from <code>existingClsList</code>.
         * @return {Array} An array of strings representing remaining class names. If class names were removed, the <code>changed</code> property will be <code>true</code>.
         * @static
         * @inheritable
         */
        removeCls: function(existingClsList, removeClsList) {
            var clsHash = {},
                i, length, clsName, result = [],
                changed = false,
                whitespaceRe = this.whitespaceRe;

            if (existingClsList) {
                if (Ext.isString(existingClsList)) {
                    existingClsList = existingClsList.replace(this.trimRe, '').split(whitespaceRe);
                }
                for (i = 0, length = existingClsList.length; i < length; i++) {
                    clsHash[existingClsList[i]] = true;
                }
            }
            if (removeClsList) {
                if (Ext.isString(removeClsList)) {
                    removeClsList = removeClsList.split(whitespaceRe);
                }
                for (i = 0, length = removeClsList.length; i < length; i++) {
                    clsName = removeClsList[i];
                    if (clsHash[clsName]) {
                        changed = true;
                        delete clsHash[clsName];
                    }
                }
            }
            for (clsName in clsHash) {
                result.push(clsName);
            }
            result.changed = changed;
            return result;
        },

        /**
         * @property {Number}
         * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}. 
         * Use the CSS 'visibility' property to hide the element.
         *
         * Note that in this mode, {@link Ext.dom.Element#isVisible isVisible} may return true
         * for an element even though it actually has a parent element that is hidden. For this
         * reason, and in most cases, using the {@link #OFFSETS} mode is a better choice.
         * @static
         * @inheritable
         */
        VISIBILITY: 1,

        /**
         * @property {Number}
         * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}. 
         * Use the CSS 'display' property to hide the element.
         * @static
         * @inheritable
         */
        DISPLAY: 2,

        /**
         * @property {Number}
         * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}. 
         * Use CSS absolute positioning and top/left offsets to hide the element.
         * @static
         * @inheritable
         */
        OFFSETS: 3,

        /**
         * @property {Number}
         * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}. 
         * Add or remove the {@link Ext.Layer#visibilityCls} class to hide the element.
         * @static
         * @inheritable
         */
        ASCLASS: 4
    },

    constructor: function(element, forceNew) {
        var me = this,
            dom = typeof element == 'string'
                ? document.getElementById(element)
                : element,
            id;

        // set an "el" property that references "this".  This allows
        // Ext.util.Positionable methods to operate on this.el.dom since it
        // gets mixed into both Element and Component
        me.el = me;

        if (!dom) {
            return null;
        }

        id = dom.id;
        if (!forceNew && id && Ext.cache[id]) {
            // element object already exists
            return Ext.cache[id].el;
        }

        /**
         * @property {HTMLElement} dom
         * The DOM element
         */
        me.dom = dom;

        /**
         * @property {String} id
         * The DOM element ID
         */
        me.id = id || Ext.id(dom);

        me.self.addToCache(me);
    },

    /**
     * Sets the passed attributes as attributes of this element (a style attribute can be a string, object or function)
     * @param {Object} o The object with the attributes
     * @param {Boolean} [useSet=true] false to override the default setAttribute to use expandos.
     * @return {Ext.dom.Element} this
     */
    set: function(o, useSet) {
         var el = this.dom,
             attr,
             value;

         for (attr in o) {
             if (o.hasOwnProperty(attr)) {
                 value = o[attr];
                 if (attr == 'style') {
                     this.applyStyles(value);
                 }
                 else if (attr == 'cls') {
                     el.className = value;
                 }
                 else if (useSet !== false) {
                     if (value === undefined) {
                         el.removeAttribute(attr);
                     } else {
                        el.setAttribute(attr, value);
                     }
                 }
                 else {
                     el[attr] = value;
                 }
             }
         }
         return this;
     },

    /**
     * @property {String} defaultUnit
     * The default unit to append to CSS values where a unit isn't provided.
     */
    defaultUnit: "px",

    /**
     * Returns true if this element matches the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @return {Boolean} True if this element matches the selector, else false
     */
    is: function(simpleSelector) {
        return Ext.DomQuery.is(this.dom, simpleSelector);
    },

    /**
     * Returns the value of the "value" attribute
     * @param {Boolean} asNumber true to parse the value as a number
     * @return {String/Number}
     */
    getValue: function(asNumber) {
        var val = this.dom.value;
        return asNumber ? parseInt(val, 10) : val;
    },

    /**
     * Removes this element's dom reference. Note that event and cache removal is handled at {@link Ext#removeNode
     * Ext.removeNode}
     */
    remove: function() {
        var me = this,
            dom = me.dom;
            
        if (me.isAnimate) {
            me.stopAnimation();
        }

        if (dom) {
            Ext.removeNode(dom);
            delete me.dom;
        }
    },

    /**
     * Returns true if this element is an ancestor of the passed element
     * @param {HTMLElement/String} el The element to check
     * @return {Boolean} True if this element is an ancestor of el, else false
     */
    contains: function(el) {
        if (!el) {
            return false;
        }

        var me = this,
            dom = el.dom || el;

        // we need el-contains-itself logic here because isAncestor does not do that:
        return (dom === me.dom) || Ext.dom.AbstractElement.isAncestor(me.dom, dom);
    },

    /**
     * Returns the value of an attribute from the element's underlying DOM node.
     * @param {String} name The attribute name
     * @param {String} [namespace] The namespace in which to look for the attribute
     * @return {String} The attribute value
     */
    getAttribute: function(name, ns) {
        var dom = this.dom;
        return dom.getAttributeNS(ns, name) || dom.getAttribute(ns + ":" + name) || dom.getAttribute(name) || dom[name];
    },

    /**
     * Update the innerHTML of this element
     * @param {String} html The new HTML
     * @return {Ext.dom.Element} this
     */
    update: function(html) {
        if (this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },


    /**
    * Set the innerHTML of this element
    * @param {String} html The new HTML
    * @return {Ext.Element} this
     */
    setHTML: function(html) {
        if(this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },

    /**
     * Returns the innerHTML of an Element or an empty string if the element's
     * dom no longer exists.
     */
    getHTML: function() {
        return this.dom ? this.dom.innerHTML : '';
    },

    /**
     * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    hide: function() {
        this.setVisible(false);
        return this;
    },

    /**
     * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    show: function() {
        this.setVisible(true);
        return this;
    },

    /**
     * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
     * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
     * @param {Boolean} visible Whether the element is visible
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setVisible: function(visible, animate) {
        var me = this,
            statics = me.self,
            mode = me.getVisibilityMode(),
            prefix = Ext.baseCSSPrefix;

        switch (mode) {
            case statics.VISIBILITY:
                me.removeCls([prefix + 'hidden-display', prefix + 'hidden-offsets']);
                me[visible ? 'removeCls' : 'addCls'](prefix + 'hidden-visibility');
            break;

            case statics.DISPLAY:
                me.removeCls([prefix + 'hidden-visibility', prefix + 'hidden-offsets']);
                me[visible ? 'removeCls' : 'addCls'](prefix + 'hidden-display');
            break;

            case statics.OFFSETS:
                me.removeCls([prefix + 'hidden-visibility', prefix + 'hidden-display']);
                me[visible ? 'removeCls' : 'addCls'](prefix + 'hidden-offsets');
            break;
        }

        return me;
    },

    getVisibilityMode: function() {
        // Only flyweights won't have a $cache object, by calling getCache the cache
        // will be created for future accesses. As such, we're eliminating the method
        // call since it's mostly redundant
        var data = (this.$cache || this.getCache()).data,
            visMode = data.visibilityMode;

        if (visMode === undefined) {
            data.visibilityMode = visMode = this.self.DISPLAY;
        }
        
        return visMode;
    },

    /**
     * Use this to change the visibility mode between {@link #VISIBILITY}, {@link #DISPLAY}, {@link #OFFSETS} or {@link #ASCLASS}.
     */
    setVisibilityMode: function(mode) {
        (this.$cache || this.getCache()).data.visibilityMode = mode;
        return this;
    },
    
    getCache: function() {
        var me = this,
            id = me.dom.id || Ext.id(me.dom);

        // Note that we do not assign an ID to the calling object here.
        // An Ext.dom.Element will have one assigned at construction, and an Ext.dom.Element.Fly must not have one.
        // We assign an ID to the DOM element if it does not have one.
        me.$cache = Ext.cache[id] || Ext.addCacheEntry(id, null, me.dom);
            
        return me.$cache;
    }
},
function() {
    var AbstractElement = this;

    /**
     * @private
     * @member Ext
     */
    Ext.getDetachedBody = function () {
        var detachedEl = AbstractElement.detachedBodyEl;

        if (!detachedEl) {
            detachedEl = document.createElement('div');
            AbstractElement.detachedBodyEl = detachedEl = new AbstractElement.Fly(detachedEl);
            detachedEl.isDetachedBody = true;
        }

        return detachedEl;
    };

    /**
     * @private
     * @member Ext
     */
    Ext.getElementById = function (id) {
        var el = document.getElementById(id),
            detachedBodyEl;

        if (!el && (detachedBodyEl = AbstractElement.detachedBodyEl)) {
            el = detachedBodyEl.dom.querySelector('#' + Ext.escapeId(id));
        }

        return el;
    };

    /**
     * @member Ext
     * @method get
     * @inheritdoc Ext.dom.Element#get
     */
    Ext.get = function(el) {
        return Ext.dom.Element.get(el);
    };

    this.addStatics({
        /**
         * @class Ext.dom.Element.Fly
         * @alternateClassName Ext.dom.AbstractElement.Fly
         * @extends Ext.dom.Element
         *
         * A non-persistent wrapper for a DOM element which may be used to execute methods of {@link Ext.dom.Element}
         * upon a DOM element without creating an instance of {@link Ext.dom.Element}.
         *
         * A **singleton** instance of this class is returned when you use {@link Ext#fly}
         *
         * Because it is a singleton, this Flyweight does not have an ID, and must be used and discarded in a single line.
         * You should not keep and use the reference to this singleton over multiple lines because methods that you call
         * may themselves make use of {@link Ext#fly} and may change the DOM element to which the instance refers.
         */
        Fly: new Ext.Class({
            // Although here the class is extending from AbstractElement,
            // the class will be overwritten by Element definition with
            // a class extending from Element instead.
            // Therefore above we document it as extending Ext.Element.
            extend: AbstractElement,

            /**
             * @property {Boolean} isFly
             * This is `true` to identify Element flyweights
             */
            isFly: true,

            constructor: function(dom) {
                this.dom = dom;
                // set an "el" property that references "this".  This allows
                // Ext.util.Positionable methods to operate on this.el.dom since it
                // gets mixed into both Element and Component
                this.el = this;
            },

            /**
             * @private
             * Attach this fliyweight instance to the passed DOM element.
             *
             * Note that a flightweight does **not** have an ID, and does not acquire the ID of the DOM element.
             */
            attach: function (dom) {

                // Attach to the passed DOM element. The same code as in Ext.Fly
                this.dom = dom;
                // Use cached data if there is existing cached data for the referenced DOM element,
                // otherwise it will be created when needed by getCache.
                this.$cache = dom.id ? Ext.cache[dom.id] : null;
                return this;
            }
        }),

        _flyweights: {},

        /**
         * Gets the singleton {@link Ext.dom.Element.Fly flyweight} element, with the passed node as the active element.
         * 
         * Because it is a singleton, this Flyweight does not have an ID, and must be used and discarded in a single line.
         * You may not keep and use the reference to this singleton over multiple lines because methods that you call
         * may themselves make use of {@link Ext#fly} and may change the DOM element to which the instance refers.
         *  
         * {@link Ext#fly} is alias for {@link Ext.dom.AbstractElement#fly}.
         *
         * Use this to make one-time references to DOM elements which are not going to be accessed again either by
         * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link
         * Ext#get Ext.get} will be more appropriate to take advantage of the caching provided by the Ext.dom.Element
         * class.
         *
         * @param {String/HTMLElement} dom The dom node or id
         * @param {String} [named] Allows for creation of named reusable flyweights to prevent conflicts (e.g.
         * internally Ext uses "_global")
         * @return {Ext.dom.Element.Fly} The singleton flyweight object (or null if no matching element was found)
         * @static
         * @member Ext.dom.AbstractElement
         */
        fly: function(dom, named) {
            var fly = null,
                _flyweights = AbstractElement._flyweights;

            named = named || '_global';

            dom = Ext.getDom(dom);

            if (dom) {
                fly = _flyweights[named] || (_flyweights[named] = new AbstractElement.Fly());

                // Attach to the passed DOM element.
                // This code performs the same function as Fly.attach, but inline it for efficiency
                fly.dom = dom;
                // Use cached data if there is existing cached data for the referenced DOM element,
                // otherwise it will be created when needed by getCache.
                fly.$cache = dom.id ? Ext.cache[dom.id] : null;
            }
            return fly;
        }
    });

    /**
     * @member Ext
     * @method fly
     * @inheritdoc Ext.dom.AbstractElement#fly
     */
    Ext.fly = function() {
        return AbstractElement.fly.apply(AbstractElement, arguments);
    };

    (function (proto) {
        /**
         * @method destroy
         * @member Ext.dom.AbstractElement
         * @inheritdoc Ext.dom.AbstractElement#remove
         * Alias to {@link #remove}.
         */
        proto.destroy = proto.remove;

        /**
         * Returns a child element of this element given its `id`.
         * @method getById
         * @member Ext.dom.AbstractElement
         * @param {String} id The id of the desired child element.
         * @param {Boolean} [asDom=false] True to return the DOM element, false to return a
         * wrapped Element object.
         */
        if (document.querySelector) {
            proto.getById = function (id, asDom) {
                // for normal elements getElementById is the best solution, but if the el is
                // not part of the document.body, we have to resort to querySelector
                var dom = document.getElementById(id) ||
                    this.dom.querySelector('#'+Ext.escapeId(id));
                return asDom ? dom : (dom ? Ext.get(dom) : null);
            };
        } else {
            proto.getById = function (id, asDom) {
                var dom = document.getElementById(id);
                return asDom ? dom : (dom ? Ext.get(dom) : null);
            };
        }
    }(this.prototype));
});

// @tag dom,core
// @define Ext.DomHelper

// @define Ext.core.DomHelper

/**
 * @class Ext.DomHelper
 * @extends Ext.dom.Helper
 * @alternateClassName Ext.core.DomHelper
 * @singleton
 *
 * The DomHelper class provides a layer of abstraction from DOM and transparently supports creating elements via DOM or
 * using HTML fragments. It also has the ability to create HTML fragment templates from your DOM building code.
 *
 * # DomHelper element specification object
 *
 * A specification object is used when creating elements. Attributes of this object are assumed to be element
 * attributes, except for 4 special attributes:
 *
 * - **tag** - The tag name of the element.
 * - **children** or **cn** - An array of the same kind of element definition objects to be created and appended.
 *   These can be nested as deep as you want.
 * - **cls** - The class attribute of the element. This will end up being either the "class" attribute on a HTML
 *   fragment or className for a DOM node, depending on whether DomHelper is using fragments or DOM.
 * - **html** - The innerHTML for the element.
 *
 * **NOTE:** For other arbitrary attributes, the value will currently **not** be automatically HTML-escaped prior to
 * building the element's HTML string. This means that if your attribute value contains special characters that would
 * not normally be allowed in a double-quoted attribute value, you **must** manually HTML-encode it beforehand (see
 * {@link Ext.String#htmlEncode}) or risk malformed HTML being created. This behavior may change in a future release.
 *
 * # Insertion methods
 *
 * Commonly used insertion methods:
 *
 * - **{@link #append}**
 * - **{@link #insertBefore}**
 * - **{@link #insertAfter}**
 * - **{@link #overwrite}**
 * - **{@link #createTemplate}**
 * - **{@link #insertHtml}**
 *
 * # Example
 *
 * This is an example, where an unordered list with 3 children items is appended to an existing element with
 * id 'my-div':
 *
 *     var dh = Ext.DomHelper; // create shorthand alias
 *     // specification object
 *     var spec = {
 *         id: 'my-ul',
 *         tag: 'ul',
 *         cls: 'my-list',
 *         // append children after creating
 *         children: [     // may also specify 'cn' instead of 'children'
 *             {tag: 'li', id: 'item0', html: 'List Item 0'},
 *             {tag: 'li', id: 'item1', html: 'List Item 1'},
 *             {tag: 'li', id: 'item2', html: 'List Item 2'}
 *         ]
 *     };
 *     var list = dh.append(
 *         'my-div', // the context element 'my-div' can either be the id or the actual node
 *         spec      // the specification object
 *     );
 *
 * Element creation specification parameters in this class may also be passed as an Array of specification objects. This
 * can be used to insert multiple sibling nodes into an existing container very efficiently. For example, to add more
 * list items to the example above:
 *
 *     dh.append('my-ul', [
 *         {tag: 'li', id: 'item3', html: 'List Item 3'},
 *         {tag: 'li', id: 'item4', html: 'List Item 4'}
 *     ]);
 *
 * # Templating
 *
 * The real power is in the built-in templating. Instead of creating or appending any elements, {@link #createTemplate}
 * returns a Template object which can be used over and over to insert new elements. Revisiting the example above, we
 * could utilize templating this time:
 *
 *     // create the node
 *     var list = dh.append('my-div', {tag: 'ul', cls: 'my-list'});
 *     // get template
 *     var tpl = dh.createTemplate({tag: 'li', id: 'item{0}', html: 'List Item {0}'});
 *
 *     for(var i = 0; i < 5, i++){
 *         tpl.append(list, [i]); // use template to append to the actual node
 *     }
 *
 * An example using a template:
 *
 *     var html = '<a id="{0}" href="{1}" class="nav">{2}</a>';
 *
 *     var tpl = new Ext.DomHelper.createTemplate(html);
 *     tpl.append('blog-roll', ['link1', 'http://www.edspencer.net/', "Ed's Site"]);
 *     tpl.append('blog-roll', ['link2', 'http://www.dustindiaz.com/', "Dustin's Site"]);
 *
 * The same example using named parameters:
 *
 *     var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';
 *
 *     var tpl = new Ext.DomHelper.createTemplate(html);
 *     tpl.append('blog-roll', {
 *         id: 'link1',
 *         url: 'http://www.edspencer.net/',
 *         text: "Ed's Site"
 *     });
 *     tpl.append('blog-roll', {
 *         id: 'link2',
 *         url: 'http://www.dustindiaz.com/',
 *         text: "Dustin's Site"
 *     });
 *
 * # Compiling Templates
 *
 * Templates are applied using regular expressions. The performance is great, but if you are adding a bunch of DOM
 * elements using the same template, you can increase performance even further by {@link Ext.Template#compile
 * "compiling"} the template. The way "{@link Ext.Template#compile compile()}" works is the template is parsed and
 * broken up at the different variable points and a dynamic function is created and eval'ed. The generated function
 * performs string concatenation of these parts and the passed variables instead of using regular expressions.
 *
 *     var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';
 *
 *     var tpl = new Ext.DomHelper.createTemplate(html);
 *     tpl.compile();
 *
 *     //... use template like normal
 *
 * # Performance Boost
 *
 * DomHelper will transparently create HTML fragments when it can. Using HTML fragments instead of DOM can significantly
 * boost performance.
 *
 * Element creation specification parameters may also be strings. If {@link #useDom} is false, then the string is used
 * as innerHTML. If {@link #useDom} is true, a string specification results in the creation of a text node. Usage:
 *
 *     Ext.DomHelper.useDom = true; // force it to use DOM; reduces performance
 *
 */
Ext.define('Ext.dom.Helper', (function() {

// kill repeat to save bytes
var afterbegin = 'afterbegin',
    afterend = 'afterend',
    beforebegin = 'beforebegin',
    beforeend = 'beforeend',
    ts = '<table>',
    te = '</table>',
    tbs = ts+'<tbody>',
    tbe = '</tbody>'+te,
    trs = tbs + '<tr>',
    tre = '</tr>'+tbe,
    detachedDiv = document.createElement('div'),
    bbValues = ['BeforeBegin', 'previousSibling'],
    aeValues = ['AfterEnd', 'nextSibling'],
    bb_ae_PositionHash = {
        beforebegin: bbValues,
        afterend: aeValues
    },
    fullPositionHash = {
        beforebegin: bbValues,
        afterend: aeValues,
        afterbegin: ['AfterBegin', 'firstChild'],
        beforeend: ['BeforeEnd', 'lastChild']
    };

/**
 * @class Ext.dom.Helper
 * @extends Ext.dom.AbstractHelper
 * @requires Ext.dom.AbstractElement
 * 
 * The actual class of which {@link Ext.DomHelper} is instance of.
 * 
 * Use singleton {@link Ext.DomHelper} instead.
 * 
 * @private
 */
return {
    extend:  Ext.dom.AbstractHelper ,
                                         

    tableRe: /^(?:table|thead|tbody|tr|td)$/i,

    tableElRe: /td|tr|tbody|thead/i,

    /**
     * @property {Boolean} useDom
     * True to force the use of DOM instead of html fragments.
     */
    useDom : false,

    /**
     * Creates new DOM element(s) without inserting them to the document.
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @return {HTMLElement} The new uninserted node
     */
    createDom: function(o, parentNode){
        var el,
            doc = document,
            useSet,
            attr,
            val,
            cn,
            i, l;

        if (Ext.isArray(o)) {                       // Allow Arrays of siblings to be inserted
            el = doc.createDocumentFragment(); // in one shot using a DocumentFragment
            for (i = 0, l = o.length; i < l; i++) {
                this.createDom(o[i], el);
            }
        } else if (typeof o == 'string') {         // Allow a string as a child spec.
            el = doc.createTextNode(o);
        } else {
            el = doc.createElement(o.tag || 'div');
            useSet = !!el.setAttribute; // In IE some elements don't have setAttribute
            for (attr in o) {
                if (!this.confRe.test(attr)) {
                    val = o[attr];
                    if (attr == 'cls') {
                        el.className = val;
                    } else {
                        if (useSet) {
                            el.setAttribute(attr, val);
                        } else {
                            el[attr] = val;
                        }
                    }
                }
            }
            Ext.DomHelper.applyStyles(el, o.style);

            if ((cn = o.children || o.cn)) {
                this.createDom(cn, el);
            } else if (o.html) {
                el.innerHTML = o.html;
            }
        }
        if (parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    },

    ieTable: function(depth, openingTags, htmlContent, closingTags){
        detachedDiv.innerHTML = [openingTags, htmlContent, closingTags].join('');

        var i = -1,
            el = detachedDiv,
            ns;

        while (++i < depth) {
            el = el.firstChild;
        }
        // If the result is multiple siblings, then encapsulate them into one fragment.
        ns = el.nextSibling;

        if (ns) {
            ns = el;
            el = document.createDocumentFragment();
            
            while (ns) {
                 nx = ns.nextSibling;
                 el.appendChild(ns);
                 ns = nx;
            }
        }
        return el;
    },

    /**
     * @private
     * Nasty code for IE's broken table implementation
     */
    insertIntoTable: function(tag, where, destinationEl, html) {
        var node,
            before,
            bb = where == beforebegin,
            ab = where == afterbegin,
            be = where == beforeend,
            ae = where == afterend;

        if (tag == 'td' && (ab || be) || !this.tableElRe.test(tag) && (bb || ae)) {
            return null;
        }
        before = bb ? destinationEl :
                 ae ? destinationEl.nextSibling :
                 ab ? destinationEl.firstChild : null;

        if (bb || ae) {
            destinationEl = destinationEl.parentNode;
        }

        if (tag == 'td' || (tag == 'tr' && (be || ab))) {
            node = this.ieTable(4, trs, html, tre);
        } else if (((tag == 'tbody' || tag == 'thead') && (be || ab)) ||
                (tag == 'tr' && (bb || ae))) {
            node = this.ieTable(3, tbs, html, tbe);
        } else {
            node = this.ieTable(2, ts, html, te);
        }
        destinationEl.insertBefore(node, before);
        return node;
    },

    /**
     * @private
     * Fix for IE9 createContextualFragment missing method
     */
    createContextualFragment: function(html) {
        var fragment = document.createDocumentFragment(),
            length, childNodes;

        detachedDiv.innerHTML = html;
        childNodes = detachedDiv.childNodes;
        length = childNodes.length;

        // Move nodes into fragment, don't clone: http://jsperf.com/create-fragment
        while (length--) {
            fragment.appendChild(childNodes[0]);
        }
        return fragment;
    },

    applyStyles: function(el, styles) {
        if (styles) {
            if (typeof styles == "function") {
                styles = styles.call();
            }
            if (typeof styles == "string") {
                styles = Ext.dom.Element.parseStyles(styles);
            }
            if (typeof styles == "object") {
                Ext.fly(el, '_applyStyles').setStyle(styles);
            }
        }
    },

    /**
     * Alias for {@link #markup}.
     * @inheritdoc Ext.dom.AbstractHelper#markup
     */
    createHtml: function(spec) {
        return this.markup(spec);
    },

    doInsert: function(el, o, returnElement, pos, sibling, append) {
        
        el = el.dom || Ext.getDom(el);

        var newNode;

        if (this.useDom) {
            newNode = this.createDom(o, null);

            if (append) {
                el.appendChild(newNode);
            }
            else {
                (sibling == 'firstChild' ? el : el.parentNode).insertBefore(newNode, el[sibling] || el);
            }

        } else {
            newNode = this.insertHtml(pos, el, this.markup(o));
        }
        return returnElement ? Ext.get(newNode, true) : newNode;
    },

    /**
     * Creates new DOM element(s) and overwrites the contents of el with them.
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} [returnElement] true to return an Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    overwrite: function(el, html, returnElement) {
        var newNode;

        el = Ext.getDom(el);
        html = this.markup(html);

        // IE Inserting HTML into a table/tbody/tr requires extra processing: http://www.ericvasilik.com/2006/07/code-karma.html
        if (Ext.isIE && this.tableRe.test(el.tagName)) {
            // Clearing table elements requires removal of all elements.
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
            if (html) {
                newNode = this.insertHtml('afterbegin', el, html);
                return returnElement ? Ext.get(newNode) : newNode;
            }
            return null;
        }
        el.innerHTML = html;
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    insertHtml: function(where, el, html) {
        var hashVal,
            range,
            rangeEl,
            setStart,
            frag;

        where = where.toLowerCase();

        // Has fast HTML insertion into existing DOM: http://www.w3.org/TR/html5/apis-in-html-documents.html#insertadjacenthtml
        if (el.insertAdjacentHTML) {

            // IE's incomplete table implementation: http://www.ericvasilik.com/2006/07/code-karma.html
            if (Ext.isIE && this.tableRe.test(el.tagName) && (frag = this.insertIntoTable(el.tagName.toLowerCase(), where, el, html))) {
                return frag;
            }

            if ((hashVal = fullPositionHash[where])) {

                if (Ext.global.MSApp && Ext.global.MSApp.execUnsafeLocalFunction) {
                    //ALLOW MS TO EXECUTE THIS CODE FOR NATIVE WINDOWS 8 DESKTOP APPS
                    MSApp.execUnsafeLocalFunction(function () {
                        el.insertAdjacentHTML(hashVal[0], html);
                    });
                } else {
                    el.insertAdjacentHTML(hashVal[0], html);
                }

                return el[hashVal[1]];
            }
            // if (not IE and context element is an HTMLElement) or TextNode
        } else {
            // we cannot insert anything inside a textnode so...
            if (el.nodeType === 3) {
                where = where === 'afterbegin' ? 'beforebegin' : where;
                where = where === 'beforeend' ? 'afterend' : where;
            }
            range = Ext.supports.CreateContextualFragment ? el.ownerDocument.createRange() : undefined;
            setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
            if (bb_ae_PositionHash[where]) {
                if (range) {
                    range[setStart](el);
                    frag = range.createContextualFragment(html);
                } else {
                    frag = this.createContextualFragment(html);
                }
                el.parentNode.insertBefore(frag, where == beforebegin ? el : el.nextSibling);
                return el[(where == beforebegin ? 'previous' : 'next') + 'Sibling'];
            } else {
                rangeEl = (where == afterbegin ? 'first' : 'last') + 'Child';
                if (el.firstChild) {
                    if (range) {
                        range[setStart](el[rangeEl]);
                        frag = range.createContextualFragment(html);
                    } else {
                        frag = this.createContextualFragment(html);
                    }

                    if (where == afterbegin) {
                        el.insertBefore(frag, el.firstChild);
                    } else {
                        el.appendChild(frag);
                    }
                } else {
                    el.innerHTML = html;
                }
                return el[rangeEl];
            }
        }
        Ext.Error.raise({
            sourceClass: 'Ext.DomHelper',
            sourceMethod: 'insertHtml',
            htmlToInsert: html,
            targetElement: el,
            msg: 'Illegal insertion point reached: "' + where + '"'
        });
    },

    /**
     * Creates a new Ext.Template from the DOM object spec.
     * @param {Object} o The DOM object spec (and children)
     * @return {Ext.Template} The new template
     */
    createTemplate: function(o) {
        var html = this.markup(o);
        return new Ext.Template(html);
    }

};
})(), function() {
    Ext.ns('Ext.core');
    Ext.DomHelper = Ext.core.DomHelper = new this;
});

// @tag core
/**
 * Represents an HTML fragment template. Templates may be {@link #compile precompiled} for greater performance.
 *
 * An instance of this class may be created by passing to the constructor either a single argument, or multiple
 * arguments:
 *
 * # Single argument: String/Array
 *
 * The single argument may be either a String or an Array:
 *
 * - String:
 *
 *       var t = new Ext.Template("<div>Hello {0}.</div>");
 *       t.{@link #append}('some-element', ['foo']);
 *
 * - Array:
 *
 *   An Array will be combined with `join('')`.
 *
 *       var t = new Ext.Template([
 *           '<div name="{id}">',
 *               '<span class="{cls}">{name:trim} {value:ellipsis(10)}</span>',
 *           '</div>',
 *       ]);
 *       t.{@link #compile}();
 *       t.{@link #append}('some-element', {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'});
 *
 * # Multiple arguments: String, Object, Array, ...
 *
 * Multiple arguments will be combined with `join('')`.
 *
 *     var t = new Ext.Template(
 *         '<div name="{id}">',
 *             '<span class="{cls}">{name} {value}</span>',
 *         '</div>',
 *         // a configuration object:
 *         {
 *             compiled: true,      // {@link #compile} immediately
 *         }
 *     );
 *
 * # Notes
 *
 * - For a list of available format functions, see {@link Ext.util.Format}.
 * - `disableFormats` reduces `{@link #apply}` time when no formatting is required.
 */
Ext.define('Ext.Template', {

    /* Begin Definitions */

                                                    

    inheritableStatics: {
        /**
         * Creates a template from the passed element's value (_display:none_ textarea, preferred) or innerHTML.
         * @param {String/HTMLElement} el A DOM element or its id
         * @param {Object} config (optional) Config object
         * @return {Ext.Template} The created template
         * @static
         * @inheritable
         */
        from: function(el, config) {
            el = Ext.getDom(el);
            return new this(el.value || el.innerHTML, config || '');
        }
    },

    /* End Definitions */

    /**
     * Creates new template.
     * 
     * @param {String...} html List of strings to be concatenated into template.
     * Alternatively an array of strings can be given, but then no config object may be passed.
     * @param {Object} config (optional) Config object
     */
    constructor: function(html) {
        var me = this,
            args = arguments,
            buffer = [],
            i = 0,
            length = args.length,
            value;

        me.initialConfig = {};
        
        // Allow an array to be passed here so we can
        // pass an array of strings and an object
        // at the end
        if (length === 1 && Ext.isArray(html)) {
            args = html;
            length = args.length;
        }

        if (length > 1) {
            for (; i < length; i++) {
                value = args[i];
                if (typeof value == 'object') {
                    Ext.apply(me.initialConfig, value);
                    Ext.apply(me, value);
                } else {
                    buffer.push(value);
                }
            }
        } else {
            buffer.push(html);
        }

        // @private
        me.html = buffer.join('');

        if (me.compiled) {
            me.compile();
        }
    },

    /**
     * @property {Boolean} isTemplate
     * `true` in this class to identify an object as an instantiated Template, or subclass thereof.
     */
    isTemplate: true,

    /**
     * @cfg {Boolean} compiled
     * True to immediately compile the template. Defaults to false.
     */

    /**
     * @cfg {Boolean} disableFormats
     * True to disable format functions in the template. If the template doesn't contain
     * format functions, setting disableFormats to true will reduce apply time. Defaults to false.
     */
    disableFormats: false,

    re: /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,

    /**
     * Returns an HTML fragment of this template with the specified values applied.
     *
     * @param {Object/Array} values The template values. Can be an array if your params are numeric:
     *
     *     var tpl = new Ext.Template('Name: {0}, Age: {1}');
     *     tpl.apply(['John', 25]);
     *
     * or an object:
     *
     *     var tpl = new Ext.Template('Name: {name}, Age: {age}');
     *     tpl.apply({name: 'John', age: 25});
     *
     * @return {String} The HTML fragment
     */
    apply: function(values) {
        var me = this,
            useFormat = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me,
            ret;

        if (me.compiled) {
            return me.compiled(values).join('');
        }

        function fn(m, name, format, args) {
            if (format && useFormat) {
                if (args) {
                    args = [values[name]].concat(Ext.functionFactory('return ['+ args +'];')());
                } else {
                    args = [values[name]];
                }
                if (format.substr(0, 5) == "this.") {
                    return tpl[format.substr(5)].apply(tpl, args);
                }
                else {
                    return fm[format].apply(fm, args);
                }
            }
            else {
                return values[name] !== undefined ? values[name] : "";
            }
        }

        ret = me.html.replace(me.re, fn);
        return ret;
    },

    /**
     * Appends the result of this template to the provided output array.
     * @param {Object/Array} values The template values. See {@link #apply}.
     * @param {Array} out The array to which output is pushed.
     * @return {Array} The given out array.
     */
    applyOut: function(values, out) {
        var me = this;

        if (me.compiled) {
            out.push.apply(out, me.compiled(values));
        } else {
            out.push(me.apply(values));
        }

        return out;
    },

    /**
     * @method applyTemplate
     * @member Ext.Template
     * Alias for {@link #apply}.
     * @inheritdoc Ext.Template#apply
     */
    applyTemplate: function () {
        return this.apply.apply(this, arguments);
    },

    /**
     * Sets the HTML used as the template and optionally compiles it.
     * @param {String} html
     * @param {Boolean} compile (optional) True to compile the template.
     * @return {Ext.Template} this
     */
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     * @return {Ext.Template} this
     */
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useFormat = me.disableFormats !== true,
            body, bodyReturn;

        function fn(m, name, format, args) {
            if (format && useFormat) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.' + format.substr(5) + '(';
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }

        bodyReturn = me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn);
        body = "this.compiled = function(values){ return ['" + bodyReturn + "'];};";
        eval(body);
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) after el.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    /**
     * Applies the supplied `values` to the template and appends the new node(s) to the specified `el`.
     *
     * For example usage see {@link Ext.Template Ext.Template class docs}.
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return an Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnElement) {
        var newNode = Ext.DomHelper.insertHtml(where, Ext.getDom(el), this.apply(values));
        return returnElement ? Ext.get(newNode) : newNode;
    },

    /**
     * Applies the supplied values to the template and overwrites the content of el with the new node(s).
     *
     * @param {String/HTMLElement/Ext.Element} el The context element
     * @param {Object/Array} values The template values. See {@link #applyTemplate} for details.
     * @param {Boolean} returnElement (optional) true to return a Ext.Element.
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    overwrite: function(el, values, returnElement) {
        var newNode = Ext.DomHelper.overwrite(Ext.getDom(el), this.apply(values));
        return returnElement ? Ext.get(newNode) : newNode;
    }
});

// @tag core
/**
 * This class parses the XTemplate syntax and calls abstract methods to process the parts.
 * @private
 */
Ext.define('Ext.XTemplateParser', {
    constructor: function (config) {
        Ext.apply(this, config);
    },

    /**
     * @property {Number} level The 'for' or 'foreach' loop context level. This is adjusted
     * up by one prior to calling {@link #doFor} or {@link #doForEach} and down by one after
     * calling the corresponding {@link #doEnd} that closes the loop. This will be 1 on the
     * first {@link #doFor} or {@link #doForEach} call.
     */

    /**
     * This method is called to process a piece of raw text from the tpl.
     * @param {String} text
     * @method doText
     */
    // doText: function (text)

    /**
     * This method is called to process expressions (like `{[expr]}`).
     * @param {String} expr The body of the expression (inside "{[" and "]}").
     * @method doExpr
     */
    // doExpr: function (expr)

    /**
     * This method is called to process simple tags (like `{tag}`).
     * @method doTag
     */
    // doTag: function (tag)

    /**
     * This method is called to process `<tpl else>`.
     * @method doElse
     */
    // doElse: function ()

    /**
     * This method is called to process `{% text %}`.
     * @param {String} text
     * @method doEval
     */
    // doEval: function (text)

    /**
     * This method is called to process `<tpl if="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doIf
     */
    // doIf: function (action, actions)

    /**
     * This method is called to process `<tpl elseif="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doElseIf
     */
    // doElseIf: function (action, actions)

    /**
     * This method is called to process `<tpl switch="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doSwitch
     */
    // doSwitch: function (action, actions)

    /**
     * This method is called to process `<tpl case="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doCase
     */
    // doCase: function (action, actions)

    /**
     * This method is called to process `<tpl default>`.
     * @method doDefault
     */
    // doDefault: function ()

    /**
     * This method is called to process `</tpl>`. It is given the action type that started
     * the tpl and the set of additional actions.
     * @param {String} type The type of action that is being ended.
     * @param {Object} actions The other actions keyed by the attribute name (such as 'exec').
     * @method doEnd
     */
    // doEnd: function (type, actions) 

    /**
     * This method is called to process `<tpl for="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doFor
     */
    // doFor: function (action, actions)

    /**
     * This method is called to process `<tpl foreach="action">`. If there are other
     * attributes, these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name (such as 'exec').
     * @method doForEach
     */
    // doForEach: function (action, actions)

    /**
     * This method is called to process `<tpl exec="action">`. If there are other attributes,
     * these are passed in the actions object.
     * @param {String} action
     * @param {Object} actions Other actions keyed by the attribute name.
     * @method doExec
     */
    // doExec: function (action, actions)

    /**
     * This method is called to process an empty `<tpl>`. This is unlikely to need to be
     * implemented, so a default (do nothing) version is provided.
     * @method
     */
    doTpl: Ext.emptyFn,

    parse: function (str) {
        var me = this,
            len = str.length,
            aliases = { elseif: 'elif' },
            topRe = me.topRe,
            actionsRe = me.actionsRe,
            index, stack, s, m, t, prev, frame, subMatch, begin, end, actions,
            prop;

        me.level = 0;
        me.stack = stack = [];

        for (index = 0; index < len; index = end) {
            topRe.lastIndex = index;
            m = topRe.exec(str);

            if (!m) {
                me.doText(str.substring(index, len));
                break;
            }

            begin = m.index;
            end = topRe.lastIndex;

            if (index < begin) {
                me.doText(str.substring(index, begin));
            }

            if (m[1]) {
                end = str.indexOf('%}', begin+2);
                me.doEval(str.substring(begin+2, end));
                end += 2;
            } else if (m[2]) {
                end = str.indexOf(']}', begin+2);
                me.doExpr(str.substring(begin+2, end));
                end += 2;
            } else if (m[3]) { // if ('{' token)
                me.doTag(m[3]);
            } else if (m[4]) { // content of a <tpl xxxxxx xxx> tag
                actions = null;
                while ((subMatch = actionsRe.exec(m[4])) !== null) {
                    s = subMatch[2] || subMatch[3];
                    if (s) {
                        s = Ext.String.htmlDecode(s); // decode attr value
                        t = subMatch[1];
                        t = aliases[t] || t;
                        actions = actions || {};
                        prev = actions[t];

                        if (typeof prev == 'string') {
                            actions[t] = [prev, s];
                        } else if (prev) {
                            actions[t].push(s);
                        } else {
                            actions[t] = s;
                        }
                    }
                }

                if (!actions) {
                    if (me.elseRe.test(m[4])) {
                        me.doElse();
                    } else if (me.defaultRe.test(m[4])) {
                        me.doDefault();
                    } else {
                        me.doTpl();
                        stack.push({ type: 'tpl' });
                    }
                }
                else if (actions['if']) {
                    me.doIf(actions['if'], actions);
                    stack.push({ type: 'if' });
                }
                else if (actions['switch']) {
                    me.doSwitch(actions['switch'], actions);
                    stack.push({ type: 'switch' });
                }
                else if (actions['case']) {
                    me.doCase(actions['case'], actions);
                }
                else if (actions['elif']) {
                    me.doElseIf(actions['elif'], actions);
                }
                else if (actions['for']) {
                    ++me.level;

                    // Extract property name to use from indexed item
                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doFor(actions['for'], actions);
                    stack.push({ type: 'for', actions: actions });
                }
                else if (actions['foreach']) {
                    ++me.level;

                    // Extract property name to use from indexed item
                    if (prop = me.propRe.exec(m[4])) {
                        actions.propName = prop[1] || prop[2];
                    }
                    me.doForEach(actions['foreach'], actions);
                    stack.push({ type: 'foreach', actions: actions });
                }
                else if (actions.exec) {
                    me.doExec(actions.exec, actions);
                    stack.push({ type: 'exec', actions: actions });
                }
                /*
                else {
                    // todo - error
                }
                */
            } else if (m[0].length === 5) {
                // if the length of m[0] is 5, assume that we're dealing with an opening tpl tag with no attributes (e.g. <tpl>...</tpl>)
                // in this case no action is needed other than pushing it on to the stack
                stack.push({ type: 'tpl' });
            } else {
                frame = stack.pop();
                me.doEnd(frame.type, frame.actions);
                if (frame.type == 'for' || frame.type == 'foreach') {
                    --me.level;
                }
            }
        }
    },

    // Internal regexes
    
    topRe:     /(?:(\{\%)|(\{\[)|\{([^{}]+)\})|(?:<tpl([^>]*)\>)|(?:<\/tpl>)/g,
    actionsRe: /\s*(elif|elseif|if|for|foreach|exec|switch|case|eval|between)\s*\=\s*(?:(?:"([^"]*)")|(?:'([^']*)'))\s*/g,
    propRe:    /prop=(?:(?:"([^"]*)")|(?:'([^']*)'))/,
    defaultRe: /^\s*default\s*$/,
    elseRe:    /^\s*else\s*$/
});

// @tag core
/**
 * This class compiles the XTemplate syntax into a function object. The function is used
 * like so:
 * 
 *      function (out, values, parent, xindex, xcount) {
 *          // out is the output array to store results
 *          // values, parent, xindex and xcount have their historical meaning
 *      }
 *
 * @markdown
 * @private
 */
Ext.define('Ext.XTemplateCompiler', {
    extend:  Ext.XTemplateParser ,

    // Chrome really likes "new Function" to realize the code block (as in it is
    // 2x-3x faster to call it than using eval), but Firefox chokes on it badly.
    // IE and Opera are also fine with the "new Function" technique.
    useEval: Ext.isGecko,

    // See http://jsperf.com/nige-array-append for quickest way to append to an array of unknown length
    // (Due to arbitrary code execution inside a template, we cannot easily track the length in  var)
    // On IE6 to 8, myArray[myArray.length]='foo' is better. On other browsers myArray.push('foo') is better.
    useIndex: Ext.isIE8m,

    useFormat: true,
    
    propNameRe: /^[\w\d\$]*$/,

    compile: function (tpl) {
        var me = this,
            code = me.generate(tpl);

        // When using "new Function", we have to pass our "Ext" variable to it in order to
        // support sandboxing. If we did not, the generated function would use the global
        // "Ext", not the "Ext" from our sandbox (scope chain).
        //
        return me.useEval ? me.evalTpl(code) : (new Function('Ext', code))(Ext);
    },

    generate: function (tpl) {
        var me = this,
            // note: Ext here is properly sandboxed
            definitions = 'var fm=Ext.util.Format,ts=Object.prototype.toString;',
            code;

        // Track how many levels we use, so that we only "var" each level's variables once
        me.maxLevel = 0;

        me.body = [
            'var c0=values, a0=' + me.createArrayTest(0) + ', p0=parent, n0=xcount, i0=xindex, k0, v;\n'
        ];
        if (me.definitions) {
            if (typeof me.definitions === 'string') {
                me.definitions = [me.definitions, definitions ];
            } else {
                me.definitions.push(definitions);
            }
        } else {
            me.definitions = [ definitions ];
        }
        me.switches = [];

        me.parse(tpl);

        me.definitions.push(
            (me.useEval ? '$=' : 'return') + ' function (' + me.fnArgs + ') {',
                me.body.join(''),
            '}'
        );

        code = me.definitions.join('\n');

        // Free up the arrays.
        me.definitions.length = me.body.length = me.switches.length = 0;
        delete me.definitions;
        delete me.body;
        delete me.switches;

        return code;
    },

    //-----------------------------------
    // XTemplateParser callouts

    doText: function (text) {
        var me = this,
            out = me.body;

        text = text.replace(me.aposRe, "\\'").replace(me.newLineRe, '\\n');
        if (me.useIndex) {
            out.push('out[out.length]=\'', text, '\'\n');
        } else {
            out.push('out.push(\'', text, '\')\n');
        }
    },

    doExpr: function (expr) {
        var out = this.body;
        out.push('if ((v=' + expr + ') != null) out');

        // Coerce value to string using concatenation of an empty string literal.
        // See http://jsperf.com/tostringvscoercion/5
        if (this.useIndex) {
             out.push('[out.length]=v+\'\'\n');
        } else {
             out.push('.push(v+\'\')\n');
        }
    },

    doTag: function (tag) {
        var expr = this.parseTag(tag);
        if (expr) {
            this.doExpr(expr);
        } else {
            // if we cannot match on tagRe handle as plain text
            this.doText('{' + tag + '}');
        }
    },

    doElse: function () {
        this.body.push('} else {\n');
    },

    doEval: function (text) {
        this.body.push(text, '\n');
    },

    doIf: function (action, actions) {
        var me = this;

        // If it's just a propName, use it directly in the if
        if (action === '.') {
            me.body.push('if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('if (', me.parseTag(action), ') {\n');
        }
        // Otherwise, it must be an expression, and needs to be returned from an fn which uses with(values)
        else {
            me.body.push('if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },

    doElseIf: function (action, actions) {
        var me = this;

        // If it's just a propName, use it directly in the else if
        if (action === '.') {
            me.body.push('else if (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('} else if (', me.parseTag(action), ') {\n');
        }
        // Otherwise, it must be an expression, and needs to be returned from an fn which uses with(values)
        else {
            me.body.push('} else if (', me.addFn(action), me.callFn, ') {\n');
        }
        if (actions.exec) {
            me.doExec(actions.exec);
        }
    },

    doSwitch: function (action) {
        var me = this;

        // If it's just a propName, use it directly in the switch
        if (action === '.') {
            me.body.push('switch (values) {\n');
        } else if (me.propNameRe.test(action)) {
            me.body.push('switch (', me.parseTag(action), ') {\n');
        }
        // Otherwise, it must be an expression, and needs to be returned from an fn which uses with(values)
        else {
            me.body.push('switch (', me.addFn(action), me.callFn, ') {\n');
        }
        me.switches.push(0);
    },

    doCase: function (action) {
        var me = this,
            cases = Ext.isArray(action) ? action : [action],
            n = me.switches.length - 1,
            match, i;

        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }

        for (i = 0, n = cases.length; i < n; ++i) {
            match = me.intRe.exec(cases[i]);
            cases[i] = match ? match[1] : ("'" + cases[i].replace(me.aposRe,"\\'") + "'");
        }

        me.body.push('case ', cases.join(': case '), ':\n');
    },

    doDefault: function () {
        var me = this,
            n = me.switches.length - 1;

        if (me.switches[n]) {
            me.body.push('break;\n');
        } else {
            me.switches[n]++;
        }

        me.body.push('default:\n');
    },

    doEnd: function (type, actions) {
        var me = this,
            L = me.level-1;

        if (type == 'for' || type == 'foreach') {
            /*
            To exit a for or foreach loop we must restore the outer loop's context. The
            code looks like this (which goes with that produced by doFor or doForEach):

                    for (...) { // the part generated by doFor or doForEach
                        ...  // the body of the for loop

                        // ... any tpl for exec statement goes here...
                    }
                    parent = p1;
                    values = r2;
                    xcount = n1;
                    xindex = i1
            */
            if (actions.exec) {
                me.doExec(actions.exec);
            }

            me.body.push('}\n');
            me.body.push('parent=p',L,';values=r',L+1,';xcount=n'+L+';xindex=i',L,'+1;xkey=k',L,';\n');
        } else if (type == 'if' || type == 'switch') {
            me.body.push('}\n');
        }
    },

    doFor: function (action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L-1,
            parentAssignment;

        // If it's just a propName, use it directly in the switch
        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        }
        // Otherwise, it must be an expression, and needs to be returned from an fn which uses with(values)
        else {
            s = me.addFn(action) + me.callFn;
        }

        /*
        We are trying to produce a block of code that looks like below. We use the nesting
        level to uniquely name the control variables.

            // Omit "var " if we have already been through level 2
            var i2 = 0,
                n2 = 0,
                c2 = values['propName'],
                    // c2 is the context object for the for loop
                a2 = Array.isArray(c2);
                r2 = values,
                    // r2 is the values object 
                p2, // p2 is the parent context (of the outer for loop)
                k2; // object key - not used by for loop but doEnd needs this to be declared 

            // If iterating over the current data, the parent is always set to c2
            p2 = parent = c2;
            // If iterating over a property in an object, set the parent to the object
            p2 = parent = a1 ? c1[i1] : c1 // set parent
            if (c2) {
                if (a2) {
                    n2 = c2.length;
                } else if (c2.isMixedCollection) {
                    c2 = c2.items;
                    n2 = c2.length;
                } else if (c2.isStore) {
                    c2 = c2.data.items;
                    n2 = c2.length;
                } else {
                    c2 = [ c2 ];
                    n2 = 1;
                }
            }
            // i2 is the loop index and n2 is the number (xcount) of this for loop
            for (xcount = n2; i2 < n2; ++i2) {
                values = c2[i2]           // adjust special vars to inner scope
                xindex = i2 + 1           // xindex is 1-based

        The body of the loop is whatever comes between the tpl and /tpl statements (which
        is handled by doEnd).
        */

        // Declare the vars for a particular level only if we have not already declared them.
        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }
        
        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }
        
        me.body.push('i',L,'=0,n', L, '=0,c',L,'=',s,',a',L,'=', me.createArrayTest(L),',r',L,'=values,p',L,',k',L,';\n',
            'p',L,'=parent=',parentAssignment,'\n',
            'if (c',L,'){if(a',L,'){n', L,'=c', L, '.length;}else if (c', L, '.isMixedCollection){c',L,'=c',L,'.items;n',L,'=c',L,'.length;}else if(c',L,'.isStore){c',L,'=c',L,'.data.items;n',L,'=c',L,'.length;}else{c',L,'=[c',L,'];n',L,'=1;}}\n',
            'for (xcount=n',L,';i',L,'<n'+L+';++i',L,'){\n',
            'values=c',L,'[i',L,']');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }
        me.body.push('\n',
            'xindex=i',L,'+1\n');
        
        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("',actions.between,'"); } \n');
        }
    },

    doForEach: function (action, actions) {
        var me = this,
            s,
            L = me.level,
            up = L-1,
            parentAssignment;

        // If it's just a propName, use it directly in the switch
        if (action === '.') {
            s = 'values';
        } else if (me.propNameRe.test(action)) {
            s = me.parseTag(action);
        }
        // Otherwise, it must be an expression, and needs to be returned from an fn which uses with(values)
        else {
            s = me.addFn(action) + me.callFn;
        }

        /*
        We are trying to produce a block of code that looks like below. We use the nesting
        level to uniquely name the control variables.

            // Omit "var " if we have already been through level 2
            var i2 = -1,
                n2 = 0,
                c2 = values['propName'], // c2 is the context object for the for loop
                a2 = Array.isArray(c2);
                r2 = values, // r2 is the values object
                p2, // p2 is the parent context (of the outer for loop)
                k2; // k2 is the object key while looping

            // If iterating over the current data, the parent is always set to c2
            p2 = parent = c2;
            // If iterating over a property in an object, set the parent to the object
            p2 = parent = a1 ? c1[i1] : c1 // set parent

            for(k2 in c2){
                xindex = ++i + 1; // xindex is 1-based
                xkey = k2;
                values = c2[k2]; // values is the property value


        The body of the loop is whatever comes between the tpl and /tpl statements (which
        is handled by doEnd).
        */

        // Declare the vars for a particular level only if we have not already declared them.
        if (me.maxLevel < L) {
            me.maxLevel = L;
            me.body.push('var ');
        }
        
        if (action == '.') {
            parentAssignment = 'c' + L;
        } else {
            parentAssignment = 'a' + up + '?c' + up + '[i' + up + ']:c' + up;
        }
        
        me.body.push('i',L,'=-1,n',L,'=0,c',L,'=',s,',a',L,'=',me.createArrayTest(L),',r',L,'=values,p',L,',k',L,';\n',
            'p',L,'=parent=',parentAssignment,'\n',
            'for(k',L,' in c',L,'){\n',
                'xindex=++i',L,'+1;\n',
                'xkey=k',L,';\n',
                'values=c',L,'[k',L,'];');
        if (actions.propName) {
            me.body.push('.', actions.propName);
        }
        
        if (actions.between) {
            me.body.push('if(xindex>1){ out.push("',actions.between,'"); } \n');
        }
    },

    createArrayTest: ('isArray' in Array) ? function(L) {
        return 'Array.isArray(c' + L + ')';
    } : function(L) {
        return 'ts.call(c' + L + ')==="[object Array]"';
    },

    doExec: function (action, actions) {
        var me = this,
            name = 'f' + me.definitions.length;

        me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                            ' try { with(values) {',
                            '  ' + action,
                            ' }} catch(e) {',
                            'Ext.log("XTemplate Error: " + e.message);',
                            '}',
                      '}');

        me.body.push(name + me.callFn + '\n');
    },

    //-----------------------------------
    // Internal

    addFn: function (body) {
        var me = this,
            name = 'f' + me.definitions.length;

        if (body === '.') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                            ' return values',
                       '}');
        } else if (body === '..') {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                            ' return parent',
                       '}');
        } else {
            me.definitions.push('function ' + name + '(' + me.fnArgs + ') {',
                            ' try { with(values) {',
                            '  return(' + body + ')',
                            ' }} catch(e) {',
                            'Ext.log("XTemplate Error: " + e.message);',
                            '}',
                       '}');
        }

        return name;
    },

    parseTag: function (tag) {
        var me = this,
            m = me.tagRe.exec(tag),
            name, format, args, math, v;

        if (!m) {
            return null;
        }

        name = m[1];
        format = m[2];
        args = m[3];
        math = m[4];

        // name = "." - Just use the values object.
        if (name == '.') {
            // filter to not include arrays/objects/nulls
            if (!me.validTypes) {
                me.definitions.push('var validTypes={string:1,number:1,boolean:1};');
                me.validTypes = true;
            }
            v = 'validTypes[typeof values] || ts.call(values) === "[object Date]" ? values : ""';
        }
        // name = "#" - Use the xindex
        else if (name == '#') {
            v = 'xindex';
        }
        // name = "$" - Use the xkey
        else if (name == '$') {
            v = 'xkey';
        }
        else if (name.substr(0, 7) == "parent.") {
            v = name;
        }
        // compound Javascript property name (e.g., "foo.bar")
        else if (isNaN(name) && name.indexOf('-') == -1 && name.indexOf('.') != -1) {
            v = "values." + name;
        }
        // number or a '-' in it or a single word (maybe a keyword): use array notation
        // (http://jsperf.com/string-property-access/4)
        else {    
            v = "values['" + name + "']";
        }

        if (math) {
            v = '(' + v + math + ')';
        }

        if (format && me.useFormat) {
            args = args ? ',' + args : "";
            if (format.substr(0, 5) != "this.") {
                format = "fm." + format + '(';
            } else {
                format += '(';
            }
        } else {
            return v;
        }

        return format + v + args + ')';
    },

    // @private
    evalTpl: function ($) {

        // We have to use eval to realize the code block and capture the inner func we also
        // don't want a deep scope chain. We only do this in Firefox and it is also unhappy
        // with eval containing a return statement, so instead we assign to "$" and return
        // that. Because we use "eval", we are automatically sandboxed properly.
        eval($);
        return $;
    },

    newLineRe: /\r\n|\r|\n/g,
    aposRe: /[']/g,
    intRe:  /^\s*(\d+)\s*$/,
    tagRe:  /^([\w-\.\#\$]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?$/

}, function () {
    var proto = this.prototype;

    proto.fnArgs = 'out,values,parent,xindex,xcount,xkey';
    proto.callFn = '.call(this,' + proto.fnArgs + ')';
});

// @tag core
/**
 * A template class that supports advanced functionality like:
 *
 * - Autofilling arrays using templates and sub-templates
 * - Conditional processing with basic comparison operators
 * - Basic math function support
 * - Execute arbitrary inline code with special built-in template variables
 * - Custom member functions
 * - Many special tags and built-in operators that aren't defined as part of the API, but are supported in the templates that can be created
 *
 * XTemplate provides the templating mechanism built into {@link Ext.view.View}.
 *
 * The {@link Ext.Template} describes the acceptable parameters to pass to the constructor. The following examples
 * demonstrate all of the supported features.
 *
 * # Sample Data
 *
 * This is the data object used for reference in each code example:
 *
 *     var data = {
 *         name: 'Don Griffin',
 *         title: 'Senior Technomage',
 *         company: 'Sencha Inc.',
 *         drinks: ['Coffee', 'Water', 'More Coffee'],
 *         kids: [
 *             { name: 'Aubrey',  age: 17 },
 *             { name: 'Joshua',  age: 13 },
 *             { name: 'Cale',    age: 10 },
 *             { name: 'Nikol',   age: 5 },
 *             { name: 'Solomon', age: 0 }
 *         ]
 *     };
 *
 * # Auto filling of arrays
 *
 * The **tpl** tag and the **for** operator are used to process the provided data object:
 *
 * - If the value specified in for is an array, it will auto-fill, repeating the template block inside the tpl
 *   tag for each item in the array.
 * - If for="." is specified, the data object provided is examined.
 * - If between="..." is specified, the provided value will be inserted between the items.
 *   This is also supported in the "foreach" looping template.
 * - While processing an array, the special variable {#} will provide the current array index + 1 (starts at 1, not 0).
 *
 * Examples:
 *
 *     <tpl for=".">...</tpl>       // loop through array at root node
 *     <tpl for="foo">...</tpl>     // loop through array at foo node
 *     <tpl for="foo.bar">...</tpl> // loop through array at foo.bar node
 *     <tpl for="." between=",">...</tpl> // loop through array at root node and insert ',' between each item
 *
 * Using the sample data above:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Kids: ',
 *         '<tpl for=".">',       // process the data.kids node
 *             '<p>{#}. {name}</p>',  // use current array index to autonumber
 *         '</tpl></p>'
 *     );
 *     tpl.overwrite(panel.body, data.kids); // pass the kids property of the data object
 *
 * An example illustrating how the **for** property can be leveraged to access specified members of the provided data
 * object to populate the template:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Title: {title}</p>',
 *         '<p>Company: {company}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',     // interrogate the kids property within the data
 *             '<p>{name}</p>',
 *         '</tpl></p>'
 *     );
 *     tpl.overwrite(panel.body, data);  // pass the root node of the data object
 *
 * Flat arrays that contain values (and not objects) can be auto-rendered using the special **`{.}`** variable inside a
 * loop. This variable will represent the value of the array at the current index:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>{name}\'s favorite beverages:</p>',
 *         '<tpl for="drinks">',
 *             '<div> - {.}</div>',
 *         '</tpl>'
 *     );
 *     tpl.overwrite(panel.body, data);
 *
 * When processing a sub-template, for example while looping through a child array, you can access the parent object's
 * members via the **parent** object:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<tpl if="age &gt; 1">',
 *                 '<p>{name}</p>',
 *                 '<p>Dad: {parent.name}</p>',
 *             '</tpl>',
 *         '</tpl></p>'
 *     );
 *     tpl.overwrite(panel.body, data);
 *     
 * The **foreach** operator is used to loop over an object's properties.  The following
 * example demonstrates looping over the main data object's properties:
 * 
 *     var tpl = new Ext.XTemplate(
 *         '<dl>',
 *             '<tpl foreach=".">',
 *                 '<dt>{$}</dt>', // the special **`{$}`** variable contains the property name
 *                 '<dd>{.}</dd>', // within the loop, the **`{.}`** variable is set to the property value
 *             '</tpl>',
 *         '</dl>'
 *     );
 *     tpl.overwrite(panel.body, data);
 *
 * # Conditional processing with basic comparison operators
 *
 * The **tpl** tag and the **if** operator are used to provide conditional checks for deciding whether or not to render
 * specific parts of the template.
 *
 * Using the sample data above:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<tpl if="age &gt; 1">',
 *                 '<p>{name}</p>',
 *             '</tpl>',
 *         '</tpl></p>'
 *     );
 *     tpl.overwrite(panel.body, data);
 *
 * More advanced conditionals are also supported:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<p>{name} is a ',
 *             '<tpl if="age &gt;= 13">',
 *                 '<p>teenager</p>',
 *             '<tpl elseif="age &gt;= 2">',
 *                 '<p>kid</p>',
 *             '<tpl else>',
 *                 '<p>baby</p>',
 *             '</tpl>',
 *         '</tpl></p>'
 *     );
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<p>{name} is a ',
 *             '<tpl switch="name">',
 *                 '<tpl case="Aubrey" case="Nikol">',
 *                     '<p>girl</p>',
 *                 '<tpl default>',
 *                     '<p>boy</p>',
 *             '</tpl>',
 *         '</tpl></p>'
 *     );
 *
 * A `break` is implied between each case and default, however, multiple cases can be listed
 * in a single &lt;tpl&gt; tag.
 *
 * # Using double quotes
 *
 * Examples:
 *
 *     var tpl = new Ext.XTemplate(
 *         "<tpl if='age &gt; 1 && age &lt; 10'>Child</tpl>",
 *         "<tpl if='age &gt;= 10 && age &lt; 18'>Teenager</tpl>",
 *         "<tpl if='this.isGirl(name)'>...</tpl>",
 *         '<tpl if="id == \'download\'">...</tpl>',
 *         "<tpl if='needsIcon'><img src='{icon}' class='{iconCls}'/></tpl>",
 *         "<tpl if='name == \"Don\"'>Hello</tpl>"
 *     );
 *
 * # Basic math support
 *
 * The following basic math operators may be applied directly on numeric data values:
 *
 *     + - * /
 *
 * For example:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<tpl if="age &gt; 1">',  // <-- Note that the > is encoded
 *                 '<p>{#}: {name}</p>',  // <-- Auto-number each item
 *                 '<p>In 5 Years: {age+5}</p>',  // <-- Basic math
 *                 '<p>Dad: {parent.name}</p>',
 *             '</tpl>',
 *         '</tpl></p>'
 *     );
 *     tpl.overwrite(panel.body, data);
 *
 * # Execute arbitrary inline code with special built-in template variables
 *
 * Anything between `{[ ... ]}` is considered code to be executed in the scope of the template.
 * The expression is evaluated and the result is included in the generated result. There are
 * some special variables available in that code:
 *
 * - **out**: The output array into which the template is being appended (using `push` to later
 *   `join`).
 * - **values**: The values in the current scope. If you are using scope changing sub-templates,
 *   you can change what values is.
 * - **parent**: The scope (values) of the ancestor template.
 * - **xindex**: If you are in a "for" or "foreach" looping template, the index of the loop you are in (1-based).
 * - **xcount**: If you are in a "for" looping template, the total length of the array you are looping.
 * - **xkey**: If you are in a "foreach" looping template, the key of the current property
 * being examined.
 *
 * This example demonstrates basic row striping using an inline code block and the xindex variable:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Company: {[values.company.toUpperCase() + ", " + values.title]}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<div class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
 *             '{name}',
 *             '</div>',
 *         '</tpl></p>'
 *      );
 *
 * Any code contained in "verbatim" blocks (using "{% ... %}") will be inserted directly in
 * the generated code for the template. These blocks are not included in the output. This
 * can be used for simple things like break/continue in a loop, or control structures or
 * method calls (when they don't produce output). The `this` references the template instance.
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Company: {[values.company.toUpperCase() + ", " + values.title]}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '{% if (xindex % 2 === 0) continue; %}',
 *             '{name}',
 *             '{% if (xindex > 100) break; %}',
 *             '</div>',
 *         '</tpl></p>'
 *      );
 *
 * # Template member functions
 *
 * One or more member functions can be specified in a configuration object passed into the XTemplate constructor for
 * more complex processing:
 *
 *     var tpl = new Ext.XTemplate(
 *         '<p>Name: {name}</p>',
 *         '<p>Kids: ',
 *         '<tpl for="kids">',
 *             '<tpl if="this.isGirl(name)">',
 *                 '<p>Girl: {name} - {age}</p>',
 *             '<tpl else>',
 *                 '<p>Boy: {name} - {age}</p>',
 *             '</tpl>',
 *             '<tpl if="this.isBaby(age)">',
 *                 '<p>{name} is a baby!</p>',
 *             '</tpl>',
 *         '</tpl></p>',
 *         {
 *             // XTemplate configuration:
 *             disableFormats: true,
 *             // member functions:
 *             isGirl: function(name){
 *                return name == 'Aubrey' || name == 'Nikol';
 *             },
 *             isBaby: function(age){
 *                return age < 1;
 *             }
 *         }
 *     );
 *     tpl.overwrite(panel.body, data);
 */
Ext.define('Ext.XTemplate', {
    extend:  Ext.Template ,

                                      

    /**
     * @private
     */
    emptyObj: {},

    /**
     * @cfg {Boolean} compiled
     * Only applies to {@link Ext.Template}, XTemplates are compiled automatically on the
     * first call to {@link #apply} or {@link #applyOut}.
     * @hide
     */

    /**
     * @cfg {String/Array} definitions
     * Optional. A statement, or array of statements which set up `var`s which may then
     * be accessed within the scope of the generated function.
     */

    apply: function(values, parent) {
        return this.applyOut(values, [], parent).join('');
    },

    applyOut: function(values, out, parent) {
        var me = this,
            compiler;

        if (!me.fn) {
            compiler = new Ext.XTemplateCompiler({
                useFormat: me.disableFormats !== true,
                definitions: me.definitions
            });

            me.fn = compiler.compile(me.html);
        }

        try {
            me.fn(out, values, parent || me.emptyObj, 1, 1);
        } catch (e) {
            Ext.log('Error: ' + e.message);
        }

        return out;
    },

    /**
     * Does nothing. XTemplates are compiled automatically, so this function simply returns this.
     * @return {Ext.XTemplate} this
     */
    compile: function() {
        return this;
    },

    statics: {
        /**
         * Gets an `XTemplate` from an object (an instance of an {@link Ext#define}'d class).
         * Many times, templates are configured high in the class hierarchy and are to be
         * shared by all classes that derive from that base. To further complicate matters,
         * these templates are seldom actual instances but are rather configurations. For
         * example:
         *
         *      Ext.define('MyApp.Class', {
         *          extraCls: 'extra-class',
         *
         *          someTpl: [
         *              '<div class="{%this.emitClass(out)%}"></div>',
         *          {
         *              // Member fn - outputs the owing class's extra CSS class
         *              emitClass: function(out) {
         *                  out.push(this.owner.extraCls);
         *              }
         *          }]
         *      });
         *
         * The goal being to share that template definition with all instances and even
         * instances of derived classes, until `someTpl` is overridden. This method will
         * "upgrade" these configurations to be real `XTemplate` instances *in place* (to
         * avoid creating one instance per object).
         *
         * The resulting XTemplate will have an `owner` reference injected which refers back
         * to the owning object whether that is an object which has an *own instance*, or a
         * class prototype. Through this link, XTemplate member functions will be able to access
         * prototype properties of its owning class.
         *
         * @param {Object} instance The object from which to get the `XTemplate` (must be
         * an instance of an {@link Ext#define}'d class).
         * @param {String} name The name of the property by which to get the `XTemplate`.
         * @return {Ext.XTemplate} The `XTemplate` instance or null if not found.
         * @protected
         * @static
         */
        getTpl: function (instance, name) {
            var tpl = instance[name], // go for it! 99% of the time we will get it!
                owner;

            if (tpl && !tpl.isTemplate) { // tpl is just a configuration (not an instance)
                // create the template instance from the configuration:
                tpl = Ext.ClassManager.dynInstantiate('Ext.XTemplate', tpl);

                // and replace the reference with the new instance:
                if (instance.hasOwnProperty(name)) { // the tpl is on the instance
                    owner = instance;
                } else { // must be somewhere in the prototype chain
                    for (owner = instance.self.prototype; owner && !owner.hasOwnProperty(name); owner = owner.superclass) {
                    }
                }
                owner[name] = tpl;
                tpl.owner = owner;
            }
            // else !tpl (no such tpl) or the tpl is an instance already... either way, tpl
            // is ready to return

            return tpl || null;
        }
    }
});

// @tag dom,core
// @require Helper.js
// @define Ext.dom.Query
// @define Ext.core.DomQuery
// @define Ext.DomQuery

/*
 * This is code is also distributed under MIT license for use
 * with jQuery and prototype JavaScript libraries.
 */
/**
 * @class Ext.dom.Query
 * @alternateClassName Ext.DomQuery
 * @alternateClassName Ext.core.DomQuery
 * @singleton
 *
 * Provides high performance selector/xpath processing by compiling queries into reusable functions. New pseudo classes
 * and matchers can be plugged. It works on HTML and XML documents (if a content node is passed in).
 *
 * DomQuery supports most of the [CSS3 selectors spec][1], along with some custom selectors and basic XPath.
 *
 * All selectors, attribute filters and pseudos below can be combined infinitely in any order. For example
 * `div.foo:nth-child(odd)[@foo=bar].bar:first` would be a perfectly valid selector. Node filters are processed
 * in the order in which they appear, which allows you to optimize your queries for your document structure.
 *
 * ## Element Selectors:
 *
 *   - **`*`** any element
 *   - **`E`** an element with the tag E
 *   - **`E F`** All descendent elements of E that have the tag F
 *   - **`E > F`** or **E/F** all direct children elements of E that have the tag F
 *   - **`E + F`** all elements with the tag F that are immediately preceded by an element with the tag E
 *   - **`E ~ F`** all elements with the tag F that are preceded by a sibling element with the tag E
 *
 * ## Attribute Selectors:
 *
 * The use of `@` and quotes are optional. For example, `div[@foo='bar']` is also a valid attribute selector.
 *
 *   - **`E[foo]`** has an attribute "foo"
 *   - **`E[foo=bar]`** has an attribute "foo" that equals "bar"
 *   - **`E[foo^=bar]`** has an attribute "foo" that starts with "bar"
 *   - **`E[foo$=bar]`** has an attribute "foo" that ends with "bar"
 *   - **`E[foo*=bar]`** has an attribute "foo" that contains the substring "bar"
 *   - **`E[foo%=2]`** has an attribute "foo" that is evenly divisible by 2
 *   - **`E[foo!=bar]`** attribute "foo" does not equal "bar"
 *
 * ## Pseudo Classes:
 *
 *   - **`E:first-child`** E is the first child of its parent
 *   - **`E:last-child`** E is the last child of its parent
 *   - **`E:nth-child(_n_)`** E is the _n_th child of its parent (1 based as per the spec)
 *   - **`E:nth-child(odd)`** E is an odd child of its parent
 *   - **`E:nth-child(even)`** E is an even child of its parent
 *   - **`E:only-child`** E is the only child of its parent
 *   - **`E:checked`** E is an element that is has a checked attribute that is true (e.g. a radio or checkbox)
 *   - **`E:first`** the first E in the resultset
 *   - **`E:last`** the last E in the resultset
 *   - **`E:nth(_n_)`** the _n_th E in the resultset (1 based)
 *   - **`E:odd`** shortcut for :nth-child(odd)
 *   - **`E:even`** shortcut for :nth-child(even)
 *   - **`E:contains(foo)`** E's innerHTML contains the substring "foo"
 *   - **`E:nodeValue(foo)`** E contains a textNode with a nodeValue that equals "foo"
 *   - **`E:not(S)`** an E element that does not match simple selector S
 *   - **`E:has(S)`** an E element that has a descendent that matches simple selector S
 *   - **`E:next(S)`** an E element whose next sibling matches simple selector S
 *   - **`E:prev(S)`** an E element whose previous sibling matches simple selector S
 *   - **`E:any(S1|S2|S2)`** an E element which matches any of the simple selectors S1, S2 or S3
 *   - **`E:visible(true)`** an E element which is deeply visible according to {@link Ext.dom.Element#isVisible}
 *
 * ## CSS Value Selectors:
 *
 *   - **`E{display=none}`** css value "display" that equals "none"
 *   - **`E{display^=none}`** css value "display" that starts with "none"
 *   - **`E{display$=none}`** css value "display" that ends with "none"
 *   - **`E{display*=none}`** css value "display" that contains the substring "none"
 *   - **`E{display%=2}`** css value "display" that is evenly divisible by 2
 *   - **`E{display!=none}`** css value "display" that does not equal "none"
 * 
 * ## XML Namespaces:
 *   - **`ns|E`** an element with tag E and namespace prefix ns
 *
 * [1]: http://www.w3.org/TR/2005/WD-css3-selectors-20051215/#selectors
 */
Ext.ns('Ext.core');

Ext.dom.Query = Ext.core.DomQuery = Ext.DomQuery = (function() {
    var DQ,
        doc = document,
        cache = {},
        simpleCache = {},
        valueCache = {},
        useClassList = !!doc.documentElement.classList,
        useElementPointer = !!doc.documentElement.firstElementChild,
        useChildrenCollection = (function() {
            var d = doc.createElement('div');
            d.innerHTML = '<!-- -->text<!-- -->';
            return d.children && (d.children.length === 0);
        })(),
        nonSpace = /\S/,
        trimRe = /^\s+|\s+$/g,
        tplRe = /\{(\d+)\}/g,
        modeRe = /^(\s?[\/>+~]\s?|\s|$)/,
        tagTokenRe = /^(#)?([\w\-\*\|\\]+)/,
        nthRe = /(\d*)n\+?(\d*)/,
        nthRe2 = /\D/,
        startIdRe = /^\s*#/,
        // This is for IE MSXML which does not support expandos.
        // IE runs the same speed using setAttribute, however FF slows way down
        // and Safari completely fails so they need to continue to use expandos.
        isIE = window.ActiveXObject ? true : false,
        key = 30803,
        longHex = /\\([0-9a-fA-F]{6})/g,
        shortHex = /\\([0-9a-fA-F]{1,6})\s{0,1}/g,
        nonHex = /\\([^0-9a-fA-F]{1})/g,
        escapes = /\\/g,
        num, hasEscapes,
        // True if the browser supports the following syntax:
        // document.getElementsByTagName('namespacePrefix:tagName')
        supportsColonNsSeparator = (function () {
            var xmlDoc,
                xmlString = '<r><a:b xmlns:a="n"></a:b></r>';

            if (window.DOMParser) {
                xmlDoc = (new DOMParser()).parseFromString(xmlString, "application/xml");
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.loadXML(xmlString);
            }

            return !!xmlDoc.getElementsByTagName('a:b').length;
        })(),

        // replaces a long hex regex match group with the appropriate ascii value
        // $args indicate regex match pos
        longHexToChar = function($0, $1) {
            return String.fromCharCode(parseInt($1, 16));
        },

        // converts a shortHex regex match to the long form
        shortToLongHex = function($0, $1) {
            while ($1.length < 6) {
                $1 = '0' + $1;
            }
            return '\\' + $1;
        },

        // converts a single char escape to long escape form
        charToLongHex = function($0, $1) {
            num = $1.charCodeAt(0).toString(16);
            if (num.length === 1) {
                num = '0' + num;
            }
            return '\\0000' + num;
        },

        // Un-escapes an input selector string.  Assumes all escape sequences have been
        // normalized to the css '\\0000##' 6-hex-digit style escape sequence :
        // will not handle any other escape formats
        unescapeCssSelector = function(selector) {
            return (hasEscapes) ? selector.replace(longHex, longHexToChar) : selector;
        },

        // checks if the path has escaping & does any appropriate replacements
        setupEscapes = function(path) {
            hasEscapes = (path.indexOf('\\') > -1);
            if (hasEscapes) {
                path = path
                    .replace(shortHex, shortToLongHex)
                    .replace(nonHex, charToLongHex)
                    .replace(escapes, '\\\\');  // double the '\' for js compilation
            }
            return path;
        };

    // this eval is stop the compressor from
    // renaming the variable to something shorter
    eval("var batch = 30803, child, next, prev, byClassName;");

    // Retrieve the child node from a particular
    // parent at the specified index.
    child = useChildrenCollection ?
        function child(parent, index) {
            return parent.children[index];
        } :
        function child(parent, index) {
            var i = 0,
                n = parent.firstChild;
            while (n) {
                if (n.nodeType == 1) {
                    if (++i == index) {
                        return n;
                    }
                }
                n = n.nextSibling;
            }
            return null;
        };

    // retrieve the next element node
    next = useElementPointer ?
        function(n) {
            return n.nextElementSibling;
        } :
        function(n) {
            while ((n = n.nextSibling) && n.nodeType != 1);
            return n;
        };

    // retrieve the previous element node
    prev = useElementPointer ?
        function(n) {
            return n.previousElementSibling;
        } :
        function(n) {
            while ((n = n.previousSibling) && n.nodeType != 1);
            return n;
        };

    // Mark each child node with a nodeIndex skipping and
    // removing empty text nodes.
    function children(parent) {
        var n = parent.firstChild,
            nodeIndex = -1,
            nextNode;

        while (n) {
            nextNode = n.nextSibling;
            // clean worthless empty nodes.
            if (n.nodeType == 3 && !nonSpace.test(n.nodeValue)) {
                parent.removeChild(n);
            } else {
                // add an expando nodeIndex
                n.nodeIndex = ++nodeIndex;
            }
            n = nextNode;
        }
        return this;
    }

    // nodeSet - array of nodes
    // cls - CSS Class
    byClassName = useClassList ? // Use classList API where available: http://jsperf.com/classlist-vs-old-school-check/
        function (nodeSet, cls) {
            cls = unescapeCssSelector(cls);
            if (!cls) {
                return nodeSet;
            }
            var result = [], ri = -1,
                i, ci, classList;

            for (i = 0; ci = nodeSet[i]; i++) {
                classList = ci.classList;
                if (classList) {
                    if (classList.contains(cls)) {
                        result[++ri] = ci;
                    }
                } else if ((' ' + ci.className + ' ').indexOf(cls) !== -1) {
                    // Some elements types (SVG) may not always have a classList
                    // in some browsers, so fallback to the old style here
                    result[++ri] = ci;
                }
            }
            return result;
        } :
        function (nodeSet, cls) {
            cls = unescapeCssSelector(cls);
            if (!cls) {
                return nodeSet;
            }
            var result = [], ri = -1,
                i, ci;

            for (i = 0; ci = nodeSet[i]; i++) {
                if ((' ' + ci.className + ' ').indexOf(cls) !== -1) {
                    result[++ri] = ci;
                }
            }
            return result;
        };

    function attrValue(n, attr) {
        // if its an array, use the first node.
        if (!n.tagName && typeof n.length != "undefined") {
            n = n[0];
        }
        if (!n) {
            return null;
        }

        if (attr == "for") {
            return n.htmlFor;
        }
        if (attr == "class" || attr == "className") {
            return n.className;
        }
        return n.getAttribute(attr) || n[attr];

    }

    // ns - nodes
    // mode - false, /, >, +, ~
    // tagName - defaults to "*"
    function getNodes(ns, mode, tagName) {
        var result = [], ri = -1, cs,
            i, ni, j, ci, cn, utag, n, cj;
        if (!ns) {
            return result;
        }
        tagName = tagName.replace('|', ':') || "*";
        // convert to array
        if (typeof ns.getElementsByTagName != "undefined") {
            ns = [ns];
        }

        // no mode specified, grab all elements by tagName
        // at any depth
        if (!mode) {
            tagName = unescapeCssSelector(tagName);
            if (!supportsColonNsSeparator && DQ.isXml(ns[0]) &&
                tagName.indexOf(':') !== -1) {
                // Some browsers (e.g. WebKit and Opera do not support the following syntax
                // in xml documents: getElementsByTagName('ns:tagName'). To work around
                // this, we remove the namespace prefix from the tagName, get the elements
                // by tag name only, and then compare each element's tagName property to
                // the tagName with namespace prefix attached to ensure that the tag is in
                // the proper namespace.
                for (i = 0; ni = ns[i]; i++) {
                    cs = ni.getElementsByTagName(tagName.split(':').pop());
                    for (j = 0; ci = cs[j]; j++) {
                        if (ci.tagName === tagName) {
                            result[++ri] = ci;
                        }
                    }
                }
            } else {
                for (i = 0; ni = ns[i]; i++) {
                    cs = ni.getElementsByTagName(tagName);
                    for (j = 0; ci = cs[j]; j++) {
                        result[++ri] = ci;
                    }
                }
            }
            // Direct Child mode (/ or >)
            // E > F or E/F all direct children elements of E that have the tag
        } else if (mode == "/" || mode == ">") {
            utag = tagName.toUpperCase();
            for (i = 0; ni = ns[i]; i++) {
                cn = ni.childNodes;
                for (j = 0; cj = cn[j]; j++) {
                    if (cj.nodeName == utag || cj.nodeName == tagName || tagName == '*') {
                        result[++ri] = cj;
                    }
                }
            }
            // Immediately Preceding mode (+)
            // E + F all elements with the tag F that are immediately preceded by an element with the tag E
        } else if (mode == "+") {
            utag = tagName.toUpperCase();
            for (i = 0; n = ns[i]; i++) {
                while ((n = n.nextSibling) && n.nodeType != 1);
                if (n && (n.nodeName == utag || n.nodeName == tagName || tagName == '*')) {
                    result[++ri] = n;
                }
            }
            // Sibling mode (~)
            // E ~ F all elements with the tag F that are preceded by a sibling element with the tag E
        } else if (mode == "~") {
            utag = tagName.toUpperCase();
            for (i = 0; n = ns[i]; i++) {
                while ((n = n.nextSibling)) {
                    if (n.nodeName == utag || n.nodeName == tagName || tagName == '*') {
                        result[++ri] = n;
                    }
                }
            }
        }
        return result;
    }

    function concat(a, b) {
        a.push.apply(a, b);
        return a;
    }

    function byTag(cs, tagName) {
        if (cs.tagName || cs === doc) {
            cs = [cs];
        }
        if (!tagName) {
            return cs;
        }
        var result = [], ri = -1,
            i, ci;
        tagName = tagName.toLowerCase();
        for (i = 0; ci = cs[i]; i++) {
            if (ci.nodeType == 1 && ci.tagName.toLowerCase() == tagName) {
                result[++ri] = ci;
            }
        }
        return result;
    }

    function byId(cs, id) {
        id = unescapeCssSelector(id);
        if (cs.tagName || cs === doc) {
            cs = [cs];
        }
        if (!id) {
            return cs;
        }
        var result = [], ri = -1,
            i, ci;
        for (i = 0; ci = cs[i]; i++) {
            if (ci && ci.id == id) {
                result[++ri] = ci;
                return result;
            }
        }
        return result;
    }

    // operators are =, !=, ^=, $=, *=, %=, |= and ~=
    // custom can be "{"
    function byAttribute(cs, attr, value, op, custom) {
        var result = [],
            ri = -1,
            useGetStyle = custom == "{",
            fn = DQ.operators[op],
            a,
            xml,
            hasXml,
            i, ci;

        value = unescapeCssSelector(value);

        for (i = 0; ci = cs[i]; i++) {
            // skip non-element nodes.
            if (ci.nodeType === 1) {
                // only need to do this for the first node
                if (!hasXml) {
                    xml = DQ.isXml(ci);
                    hasXml = true;
                }

                // we only need to change the property names if we're dealing with html nodes, not XML
                if (!xml) {
                    if (useGetStyle) {
                        a = DQ.getStyle(ci, attr);
                    } else if (attr == "class" || attr == "className") {
                        a = ci.className;
                    } else if (attr == "for") {
                        a = ci.htmlFor;
                    } else if (attr == "href") {
                        // getAttribute href bug
                        // http://www.glennjones.net/Post/809/getAttributehrefbug.htm
                        a = ci.getAttribute("href", 2);
                    } else {
                        a = ci.getAttribute(attr);
                    }
                } else {
                    a = ci.getAttribute(attr);
                }
                if ((fn && fn(a, value)) || (!fn && a)) {
                    result[++ri] = ci;
                }
            }
        }
        return result;
    }

    function byPseudo(cs, name, value) {
        value = unescapeCssSelector(value);
        return DQ.pseudos[name](cs, value);
    }

    function nodupIEXml(cs) {
        var d = ++key,
            r,
            i, len, c;
        cs[0].setAttribute("_nodup", d);
        r = [cs[0]];
        for (i = 1, len = cs.length; i < len; i++) {
            c = cs[i];
            if (!c.getAttribute("_nodup") != d) {
                c.setAttribute("_nodup", d);
                r[r.length] = c;
            }
        }
        for (i = 0, len = cs.length; i < len; i++) {
            cs[i].removeAttribute("_nodup");
        }
        return r;
    }

    function nodup(cs) {
        if (!cs) {
            return [];
        }
        var len = cs.length, c, i, r = cs, cj, ri = -1, d, j;
        if (!len || typeof cs.nodeType != "undefined" || len == 1) {
            return cs;
        }
        if (isIE && typeof cs[0].selectSingleNode != "undefined") {
            return nodupIEXml(cs);
        }
        d = ++key;
        cs[0]._nodup = d;
        for (i = 1; c = cs[i]; i++) {
            if (c._nodup != d) {
                c._nodup = d;
            } else {
                r = [];
                for (j = 0; j < i; j++) {
                    r[++ri] = cs[j];
                }
                for (j = i + 1; cj = cs[j]; j++) {
                    if (cj._nodup != d) {
                        cj._nodup = d;
                        r[++ri] = cj;
                    }
                }
                return r;
            }
        }
        return r;
    }

    function quickDiffIEXml(c1, c2) {
        var d = ++key,
            r = [],
            i, len;
        for (i = 0, len = c1.length; i < len; i++) {
            c1[i].setAttribute("_qdiff", d);
        }
        for (i = 0, len = c2.length; i < len; i++) {
            if (c2[i].getAttribute("_qdiff") != d) {
                r[r.length] = c2[i];
            }
        }
        for (i = 0, len = c1.length; i < len; i++) {
            c1[i].removeAttribute("_qdiff");
        }
        return r;
    }

    function quickDiff(c1, c2) {
        var len1 = c1.length,
            d = ++key,
            r = [],
            i, len;
        if (!len1) {
            return c2;
        }
        if (isIE && typeof c1[0].selectSingleNode != "undefined") {
            return quickDiffIEXml(c1, c2);
        }
        for (i = 0; i < len1; i++) {
            c1[i]._qdiff = d;
        }
        for (i = 0, len = c2.length; i < len; i++) {
            if (c2[i]._qdiff != d) {
                r[r.length] = c2[i];
            }
        }
        return r;
    }

    function quickId(ns, mode, root, id) {
        if (ns == root) {
            id = unescapeCssSelector(id);
            var d = root.ownerDocument || root;
            return d.getElementById(id);
        }
        ns = getNodes(ns, mode, "*");
        return byId(ns, id);
    }

    return DQ = {
        getStyle: function(el, name) {
            return Ext.fly(el, '_DomQuery').getStyle(name);
        },
        /**
         * Compiles a selector/xpath query into a reusable function. The returned function
         * takes one parameter "root" (optional), which is the context node from where the query should start.
         * @param {String} selector The selector/xpath query
         * @param {String} [type="select"] Either "select" or "simple" for a simple selector match
         * @return {Function}
         */
        compile: function(path, type) {
            type = type || "select";

            // setup fn preamble
            var fn = ["var f = function(root) {\n var mode; ++batch; var n = root || document;\n"],
                lastPath,
                matchers = DQ.matchers,
                matchersLn = matchers.length,
                modeMatch,
                // accept leading mode switch
                lmode = path.match(modeRe),
                tokenMatch, matched, j, t, m;

            path = setupEscapes(path);

            if (lmode && lmode[1]) {
                fn[fn.length] = 'mode="' + lmode[1].replace(trimRe, "") + '";';
                path = path.replace(lmode[1], "");
            }

            // strip leading slashes
            while (path.substr(0, 1) == "/") {
                path = path.substr(1);
            }

            while (path && lastPath != path) {
                lastPath = path;
                tokenMatch = path.match(tagTokenRe);
                if (type == "select") {
                    if (tokenMatch) {
                        // ID Selector
                        if (tokenMatch[1] == "#") {
                            fn[fn.length] = 'n = quickId(n, mode, root, "' + tokenMatch[2] + '");';
                        } else {
                            fn[fn.length] = 'n = getNodes(n, mode, "' + tokenMatch[2] + '");';
                        }
                        path = path.replace(tokenMatch[0], "");
                    } else if (path.substr(0, 1) != '@') {
                        fn[fn.length] = 'n = getNodes(n, mode, "*");';
                    }
                    // type of "simple"
                } else {
                    if (tokenMatch) {
                        if (tokenMatch[1] == "#") {
                            fn[fn.length] = 'n = byId(n, "' + tokenMatch[2] + '");';
                        } else {
                            fn[fn.length] = 'n = byTag(n, "' + tokenMatch[2] + '");';
                        }
                        path = path.replace(tokenMatch[0], "");
                    }
                }
                while (!(modeMatch = path.match(modeRe))) {
                    matched = false;
                    for (j = 0; j < matchersLn; j++) {
                        t = matchers[j];
                        m = path.match(t.re);
                        if (m) {
                            fn[fn.length] = t.select.replace(tplRe, function(x, i) {
                                return m[i];
                            });
                            path = path.replace(m[0], "");
                            matched = true;
                            break;
                        }
                    }
                    // prevent infinite loop on bad selector
                    if (!matched) {
                        Ext.Error.raise({
                            sourceClass:'Ext.DomQuery',
                            sourceMethod:'compile',
                            msg:'Error parsing selector. Parsing failed at "' + path + '"'
                        });
                    }
                }
                if (modeMatch[1]) {
                    fn[fn.length] = 'mode="' + modeMatch[1].replace(trimRe, "") + '";';
                    path = path.replace(modeMatch[1], "");
                }
            }
            // close fn out
            fn[fn.length] = "return nodup(n);\n}";

            // eval fn and return it
            eval(fn.join(""));
            return f;
        },

        /**
         * Selects an array of DOM nodes using JavaScript-only implementation.
         *
         * Use {@link #select} to take advantage of browsers built-in support for CSS selectors.
         * @param {String} selector The selector/xpath query (can be a comma separated list of selectors)
         * @param {HTMLElement/String} [root=document] The start of the query.
         * @return {HTMLElement[]} An Array of DOM elements which match the selector. If there are
         * no matches, and empty Array is returned.
         */
        jsSelect: function(path, root, type) {
            // set root to doc if not specified.
            root = root || doc;

            if (typeof root == "string") {
                root = doc.getElementById(root);
            }
            var paths = path.split(","),
                results = [],
                i, len, subPath, result;

            // loop over each selector
            for (i = 0, len = paths.length; i < len; i++) {
                subPath = paths[i].replace(trimRe, "");
                // compile and place in cache
                if (!cache[subPath]) {
                    // When we compile, escaping is handled inside the compile method
                    cache[subPath] = DQ.compile(subPath, type);
                    if (!cache[subPath]) {
                        Ext.Error.raise({
                            sourceClass:'Ext.DomQuery',
                            sourceMethod:'jsSelect',
                            msg:subPath + ' is not a valid selector'
                        });
                    }
                } else {
                    // If we've already compiled, we still need to check if the
                    // selector has escaping and setup the appropriate flags
                    setupEscapes(subPath);
                }
                result = cache[subPath](root);
                if (result && result !== doc) {
                    results = results.concat(result);
                }
            }

            // if there were multiple selectors, make sure dups
            // are eliminated
            if (paths.length > 1) {
                return nodup(results);
            }
            return results;
        },

        isXml: function(el) {
            var docEl = (el ? el.ownerDocument || el : 0).documentElement;
            return docEl ? docEl.nodeName !== "HTML" : false;
        },

        /**
         * Selects an array of DOM nodes by CSS/XPath selector.
         *
         * Uses [document.querySelectorAll][0] if browser supports that, otherwise falls back to
         * {@link Ext.dom.Query#jsSelect} to do the work.
         *
         * Aliased as {@link Ext#query}.
         *
         * [0]: https://developer.mozilla.org/en/DOM/document.querySelectorAll
         *
         * @param {String} path The selector/xpath query
         * @param {HTMLElement} [root=document] The start of the query.
         * @return {HTMLElement[]} An array of DOM elements (not a NodeList as returned by `querySelectorAll`).
         * @param {String} [type="select"] Either "select" or "simple" for a simple selector match (only valid when
         * used when the call is deferred to the jsSelect method)
         * @param {Boolean} [single] Pass `true` to select only the first matching node using `document.querySelector` (where available)
         * @method
         */
        select : doc.querySelectorAll ? function(path, root, type, single) {
            root = root || doc;
            if (!DQ.isXml(root)) {
                try {
                    /*
                     * This checking here is to "fix" the behaviour of querySelectorAll
                     * for non root document queries. The way qsa works is intentional,
                     * however it's definitely not the expected way it should work.
                     * When descendant selectors are used, only the lowest selector must be inside the root!
                     * More info: http://ejohn.org/blog/thoughts-on-queryselectorall/
                     * So we create a descendant selector by prepending the root's ID, and query the parent node.
                     * UNLESS the root has no parent in which qsa will work perfectly.
                     *
                     * We only modify the path for single selectors (ie, no multiples),
                     * without a full parser it makes it difficult to do this correctly.
                     */
                    if (root.parentNode && (root.nodeType !== 9) && path.indexOf(',') === -1 && !startIdRe.test(path)) {
                        path = '#' + Ext.escapeId(Ext.id(root)) + ' ' + path;
                        root = root.parentNode;
                    }
                    return single ? [ root.querySelector(path) ]
                        : Ext.Array.toArray(root.querySelectorAll(path));
                }
                catch (e) {
                }
            }
            return DQ.jsSelect.call(this, path, root, type);
        } : function(path, root, type) {
            return DQ.jsSelect.call(this, path, root, type);
        },

        /**
         * Selects a single element.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} [root=document] The start of the query.
         * @return {HTMLElement} The DOM element which matched the selector.
         */
        selectNode : function(path, root){
            return Ext.DomQuery.select(path, root, null, true)[0];
        },

        /**
         * Selects the value of a node, optionally replacing null with the defaultValue.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} [root=document] The start of the query.
         * @param {String} [defaultValue] When specified, this is return as empty value.
         * @return {String}
         */
        selectValue: function(path, root, defaultValue) {
            path = path.replace(trimRe, "");
            if (!valueCache[path]) {
                valueCache[path] = DQ.compile(path, "select");
            } else {
                setupEscapes(path);
            }

            var n = valueCache[path](root),
                v;

            n = n[0] ? n[0] : n;

            // overcome a limitation of maximum textnode size
            // Rumored to potentially crash IE6 but has not been confirmed.
            // http://reference.sitepoint.com/javascript/Node/normalize
            // https://developer.mozilla.org/En/DOM/Node.normalize
            if (typeof n.normalize == 'function') {
                n.normalize();
            }

            v = (n && n.firstChild ? n.firstChild.nodeValue : null);
            return ((v === null || v === undefined || v === '') ? defaultValue : v);
        },

        /**
         * Selects the value of a node, parsing integers and floats.
         * Returns the defaultValue, or 0 if none is specified.
         * @param {String} selector The selector/xpath query
         * @param {HTMLElement} [root=document] The start of the query.
         * @param {Number} [defaultValue] When specified, this is return as empty value.
         * @return {Number}
         */
        selectNumber: function(path, root, defaultValue) {
            var v = DQ.selectValue(path, root, defaultValue || 0);
            return parseFloat(v);
        },

        /**
         * Returns true if the passed element(s) match the passed simple selector
         * (e.g. `div.some-class` or `span:first-child`)
         * @param {String/HTMLElement/HTMLElement[]} el An element id, element or array of elements
         * @param {String} selector The simple selector to test
         * @return {Boolean}
         */
        is: function(el, ss) {
            if (typeof el == "string") {
                el = doc.getElementById(el);
            }
            var isArray = Ext.isArray(el),
                result = DQ.filter(isArray ? el : [el], ss);
            return isArray ? (result.length == el.length) : (result.length > 0);
        },

        /**
         * Filters an array of elements to only include matches of a simple selector
         * (e.g. `div.some-class` or `span:first-child`)
         * @param {HTMLElement[]} el An array of elements to filter
         * @param {String} selector The simple selector to test
         * @param {Boolean} nonMatches If true, it returns the elements that DON'T match the selector instead of the
         * ones that match
         * @return {HTMLElement[]} An Array of DOM elements which match the selector. If there are no matches, and empty
         * Array is returned.
         */
        filter: function(els, ss, nonMatches) {
            ss = ss.replace(trimRe, "");
            if (!simpleCache[ss]) {
                simpleCache[ss] = DQ.compile(ss, "simple");
            } else {
                setupEscapes(ss);
            }

            var result = simpleCache[ss](els);
            return nonMatches ? quickDiff(result, els) : result;
        },

        /**
         * Collection of matching regular expressions and code snippets.
         * Each capture group within `()` will be replace the `{}` in the select
         * statement as specified by their index.
         */
        matchers: [{
            re: /^\.([\w\-\\]+)/,
            select: useClassList ? 'n = byClassName(n, "{1}");' : 'n = byClassName(n, " {1} ");'
        }, {
            re: /^\:([\w\-]+)(?:\(((?:[^\s>\/]*|.*?))\))?/,
            select: 'n = byPseudo(n, "{1}", "{2}");'
        },  {
            re: /^(?:([\[\{])(?:@)?([\w\-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]\}])/,
            select: 'n = byAttribute(n, "{2}", "{4}", "{3}", "{1}");'
        }, {
            re: /^#([\w\-\\]+)/,
            select: 'n = byId(n, "{1}");'
        }, {
            re: /^@([\w\-\.]+)/,
            select: 'return {firstChild:{nodeValue:attrValue(n, "{1}")}};'
        }],

        /**
         * Collection of operator comparison functions.
         * The default operators are `=`, `!=`, `^=`, `$=`, `*=`, `%=`, `|=` and `~=`.
         *
         * New operators can be added as long as the match the format *c*`=` where *c*
         * is any character other than space, `>`, or `<`.
         *
         * Operator functions are passed the following parameters:
         *
         * * `propValue` : The property value to test.
         * * `compareTo` : The value to compare to.
         */
        operators: {
            "=": function(a, v) {
                return a == v;
            },
            "!=": function(a, v) {
                return a != v;
            },
            "^=": function(a, v) {
                return a && a.substr(0, v.length) == v;
            },
            "$=": function(a, v) {
                return a && a.substr(a.length - v.length) == v;
            },
            "*=": function(a, v) {
                return a && a.indexOf(v) !== -1;
            },
            "%=": function(a, v) {
                return (a % v) === 0;
            },
            "|=": function(a, v) {
                return a && (a == v || a.substr(0, v.length + 1) == v + '-');
            },
            "~=": function(a, v) {
                return a && (' ' + a + ' ').indexOf(' ' + v + ' ') != -1;
            }
        },

        /**
         * Object hash of "pseudo class" filter functions which are used when filtering selections.
         * Each function is passed two parameters:
         *
         * - **c** : Array
         *     An Array of DOM elements to filter.
         *
         * - **v** : String
         *     The argument (if any) supplied in the selector.
         *
         * A filter function returns an Array of DOM elements which conform to the pseudo class.
         * In addition to the provided pseudo classes listed above such as `first-child` and `nth-child`,
         * developers may add additional, custom psuedo class filters to select elements according to application-specific requirements.
         *
         * For example, to filter `a` elements to only return links to __external__ resources:
         *
         *     Ext.DomQuery.pseudos.external = function(c, v) {
         *         var r = [], ri = -1;
         *         for(var i = 0, ci; ci = c[i]; i++) {
         *             // Include in result set only if it's a link to an external resource
         *             if (ci.hostname != location.hostname) {
         *                 r[++ri] = ci;
         *             }
         *         }
         *         return r;
         *     };
         *
         * Then external links could be gathered with the following statement:
         *
         *     var externalLinks = Ext.select("a:external");
         */
        pseudos: {
            "first-child": function(c) {
                var r = [], ri = -1, n,
                    i, ci;
                for (i = 0; (ci = n = c[i]); i++) {
                    while ((n = n.previousSibling) && n.nodeType != 1);
                    if (!n) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "last-child": function(c) {
                var r = [], ri = -1, n,
                    i, ci;
                for (i = 0; (ci = n = c[i]); i++) {
                    while ((n = n.nextSibling) && n.nodeType != 1);
                    if (!n) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "nth-child": function(c, a) {
                var r = [], ri = -1,
                    m = nthRe.exec(a == "even" && "2n" || a == "odd" && "2n+1" || !nthRe2.test(a) && "n+" + a || a),
                    f = (m[1] || 1) - 0, l = m[2] - 0,
                    i, n, j, cn, pn;
                for (i = 0; n = c[i]; i++) {
                    pn = n.parentNode;
                    if (batch != pn._batch) {
                        j = 0;
                        for (cn = pn.firstChild; cn; cn = cn.nextSibling) {
                            if (cn.nodeType == 1) {
                                cn.nodeIndex = ++j;
                            }
                        }
                        pn._batch = batch;
                    }
                    if (f == 1) {
                        if (l === 0 || n.nodeIndex == l) {
                            r[++ri] = n;
                        }
                    } else if ((n.nodeIndex + l) % f === 0) {
                        r[++ri] = n;
                    }
                }

                return r;
            },

            "only-child": function(c) {
                var r = [], ri = -1,
                    i, ci;
                for (i = 0; ci = c[i]; i++) {
                    if (!prev(ci) && !next(ci)) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "empty": function(c) {
                var r = [], ri = -1,
                    i, ci, cns, j, cn, empty;
                for (i = 0; ci = c[i]; i++) {
                    cns = ci.childNodes;
                    j = 0;
                    empty = true;
                    while (cn = cns[j]) {
                        ++j;
                        if (cn.nodeType == 1 || cn.nodeType == 3) {
                            empty = false;
                            break;
                        }
                    }
                    if (empty) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "contains": function(c, v) {
                var r = [], ri = -1,
                    i, ci;
                for (i = 0; ci = c[i]; i++) {
                    if ((ci.textContent || ci.innerText || ci.text || '').indexOf(v) != -1) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "nodeValue": function(c, v) {
                var r = [], ri = -1,
                    i, ci;
                for (i = 0; ci = c[i]; i++) {
                    if (ci.firstChild && ci.firstChild.nodeValue == v) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "checked": function(c) {
                var r = [], ri = -1,
                    i, ci;
                for (i = 0; ci = c[i]; i++) {
                    if (ci.checked === true) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "not": function(c, ss) {
                return DQ.filter(c, ss, true);
            },

            "any": function(c, selectors) {
                var ss = selectors.split('|'),
                    r = [], ri = -1, s,
                    i, ci, j;
                for (i = 0; ci = c[i]; i++) {
                    for (j = 0; s = ss[j]; j++) {
                        if (DQ.is(ci, s)) {
                            r[++ri] = ci;
                            break;
                        }
                    }
                }
                return r;
            },

            "odd": function(c) {
                return this["nth-child"](c, "odd");
            },

            "even": function(c) {
                return this["nth-child"](c, "even");
            },

            "nth": function(c, a) {
                return c[a - 1] || [];
            },

            "first": function(c) {
                return c[0] || [];
            },

            "last": function(c) {
                return c[c.length - 1] || [];
            },

            "has": function(c, ss) {
                var s = DQ.select,
                    r = [], ri = -1,
                    i, ci;
                for (i = 0; ci = c[i]; i++) {
                    if (s(ss, ci).length > 0) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "next": function(c, ss) {
                var is = DQ.is,
                    r = [], ri = -1,
                    i, ci, n;
                for (i = 0; ci = c[i]; i++) {
                    n = next(ci);
                    if (n && is(n, ss)) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            "prev": function(c, ss) {
                var is = DQ.is,
                    r = [], ri = -1,
                    i, ci, n;
                for (i = 0; ci = c[i]; i++) {
                    n = prev(ci);
                    if (n && is(n, ss)) {
                        r[++ri] = ci;
                    }
                }
                return r;
            },

            focusable: function(candidates) {
                var len = candidates.length,
                    results = [],
                    i = 0,
                    c;

                for (; i < len; i++) {
                    c = candidates[i];
                    if (Ext.fly(c, '_DomQuery').isFocusable()) {
                        results.push(c);
                    }
                }

                return results;
            },
            
            visible: function(candidates, deep) {
                var len = candidates.length,
                    results = [],
                    i = 0,
                    c;

                for (; i < len; i++) {
                    c = candidates[i];
                    if (Ext.fly(c, '_DomQuery').isVisible(deep)) {
                        results.push(c);
                    }
                }

                return results;
            }
        }
    };
}());

/**
* Shorthand of {@link Ext.dom.Query#select}
* @member Ext
* @method query
* @inheritdoc Ext.dom.Query#select
*/
Ext.query = Ext.DomQuery.select;

// @tag dom,core
/* ================================
 * A Note About Wrapped Animations
 * ================================
 * A few of the effects below implement two different animations per effect, one wrapping
 * animation that performs the visual effect and a "no-op" animation on this Element where
 * no attributes of the element itself actually change. The purpose for this is that the
 * wrapper is required for the effect to work and so it does the actual animation work, but
 * we always animate `this` so that the element's events and callbacks work as expected to
 * the callers of this API.
 * 
 * Because of this, we always want each wrap animation to complete first (we don't want to
 * cut off the visual effect early). To ensure that, we arbitrarily increase the duration of
 * the element's no-op animation, also ensuring that it has a decent minimum value -- on slow
 * systems, too-low durations can cause race conditions between the wrap animation and the
 * element animation being removed out of order. Note that in each wrap's `afteranimate`
 * callback it will explicitly terminate the element animation as soon as the wrap is complete,
 * so there's no real danger in making the duration too long.
 * 
 * This applies to all effects that get wrapped, including slideIn, slideOut, switchOff and frame.
 */

/**
 */
Ext.define('Ext.dom.Element_anim', {
    override: 'Ext.dom.Element',

    /**
     * Performs custom animation on this Element.
     *
     * The following properties may be specified in `from`, `to`, and `keyframe` objects:
     *
     *   - `x` - The page X position in pixels.
     *
     *   - `y` - The page Y position in pixels
     *
     *   - `left` - The element's CSS `left` value. Units must be supplied.
     *
     *   - `top` - The element's CSS `top` value. Units must be supplied.
     *
     *   - `width` - The element's CSS `width` value. Units must be supplied.
     *
     *   - `height` - The element's CSS `height` value. Units must be supplied.
     *
     *   - `scrollLeft` - The element's `scrollLeft` value.
     *
     *   - `scrollTop` - The element's `scrollTop` value.
     *
     *   - `opacity` - The element's `opacity` value. This must be a value between `0` and `1`.
     *
     * **Be aware** that animating an Element which is being used by an Ext Component without in some way informing the
     * Component about the changed element state will result in incorrect Component behaviour. This is because the
     * Component will be using the old state of the element. To avoid this problem, it is now possible to directly
     * animate certain properties of Components.
     *
     * @param {Object} config  Configuration for {@link Ext.fx.Anim}.
     * Note that the {@link Ext.fx.Anim#to to} config is required.
     * @return {Ext.dom.Element} this
     */
    animate: function(config) {
        var me = this,
            listeners,
            anim,
            animId = me.dom.id || Ext.id(me.dom);

        if (!Ext.fx.Manager.hasFxBlock(animId)) {
            // Bit of gymnastics here to ensure our internal listeners get bound first
            if (config.listeners) {
                listeners = config.listeners;
                delete config.listeners;
            }
            if (config.internalListeners) {
                config.listeners = config.internalListeners;
                delete config.internalListeners;
            }
            anim = new Ext.fx.Anim(me.anim(config));
            if (listeners) {
                anim.on(listeners);
            }
            Ext.fx.Manager.queueFx(anim);
        }
        return me;
    },

    // @private - process the passed fx configuration.
    anim: function(config) {
        if (!Ext.isObject(config)) {
            return (config) ? {} : false;
        }

        var me = this,
            duration = config.duration || Ext.fx.Anim.prototype.duration,
            easing = config.easing || 'ease',
            animConfig;

        if (config.stopAnimation) {
            me.stopAnimation();
        }

        Ext.applyIf(config, Ext.fx.Manager.getFxDefaults(me.id));

        // Clear any 'paused' defaults.
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: 0
        });

        animConfig = {
            // Pass the DOM reference. That's tested first so will be converted to an Ext.fx.Target fastest.
            target: me.dom,
            remove: config.remove,
            alternate: config.alternate || false,
            duration: duration,
            easing: easing,
            callback: config.callback,
            listeners: config.listeners,
            iterations: config.iterations || 1,
            scope: config.scope,
            block: config.block,
            concurrent: config.concurrent,
            delay: config.delay || 0,
            paused: true,
            keyframes: config.keyframes,
            from: config.from || {},
            to: Ext.apply({}, config)
        };
        Ext.apply(animConfig.to, config.to);

        // Anim API properties - backward compat
        delete animConfig.to.to;
        delete animConfig.to.from;
        delete animConfig.to.remove;
        delete animConfig.to.alternate;
        delete animConfig.to.keyframes;
        delete animConfig.to.iterations;
        delete animConfig.to.listeners;
        delete animConfig.to.target;
        delete animConfig.to.paused;
        delete animConfig.to.callback;
        delete animConfig.to.scope;
        delete animConfig.to.duration;
        delete animConfig.to.easing;
        delete animConfig.to.concurrent;
        delete animConfig.to.block;
        delete animConfig.to.stopAnimation;
        delete animConfig.to.delay;
        return animConfig;
    },

    /**
     * Slides the element into view. An anchor point can be optionally passed to set the point of origin for the slide
     * effect. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * {@link Ext.fx.Anim} class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element in from the top
     *     el.slideIn();
     *
     *     // custom: slide the element in from the right with a 2-second duration
     *     el.slideIn('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideIn('t', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} anchor (optional) One of the valid {@link Ext.fx.Anim} anchor positions (defaults to top: 't')
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @param {Boolean} options.preserveScroll Set to true if preservation of any descendant elements'
     * `scrollTop` values is required. By default the DOM wrapping operation performed by `slideIn` and
     * `slideOut` causes the browser to lose all scroll positions.
     * @return {Ext.dom.Element} The Element
     */
    slideIn: function(anchor, obj, slideOut) {
        var me = this,
            dom = me.dom,
            elStyle = dom.style,
            beforeAnim,
            wrapAnim,
            restoreScroll,
            wrapDomParentNode;

        anchor = anchor || "t";
        obj = obj || {};

        beforeAnim = function() {
            var animScope = this,
                listeners = obj.listeners,
                el = Ext.fly(dom, '_anim'),
                box, originalStyles, anim, wrap;

            if (!slideOut) {
                el.fixDisplay();
            }

            box = el.getBox();
            if ((anchor == 't' || anchor == 'b') && box.height === 0) {
                box.height = dom.scrollHeight;
            }
            else if ((anchor == 'l' || anchor == 'r') && box.width === 0) {
                box.width = dom.scrollWidth;
            }

            originalStyles = el.getStyles('width', 'height', 'left', 'right', 'top', 'bottom', 'position', 'z-index', true);
            el.setSize(box.width, box.height);

            // Cache all descendants' scrollTop & scrollLeft values if configured to preserve scroll.
            if (obj.preserveScroll) {
                restoreScroll = el.cacheScrollValues();
            }

            wrap = el.wrap({
                id: Ext.id() + '-anim-wrap-for-' + el.dom.id,
                style: {
                    visibility: slideOut ? 'visible' : 'hidden'
                }
            });
            wrapDomParentNode = wrap.dom.parentNode;
            wrap.setPositioning(el.getPositioning(true));
            if (wrap.isStyle('position', 'static')) {
                wrap.position('relative');
            }
            el.clearPositioning('auto');
            wrap.clip();

            // The wrap will have reset all descendant scrollTops. Restore them if we cached them.
            if (restoreScroll) {
                restoreScroll();
            }

            // This element is temporarily positioned absolute within its wrapper.
            // Restore to its default, CSS-inherited visibility setting.
            // We cannot explicitly poke visibility:visible into its style because that overrides the visibility of the wrap.
            el.setStyle({
                visibility: '',
                position: 'absolute'
            });
            if (slideOut) {
                wrap.setSize(box.width, box.height);
            }

            switch (anchor) {
                case 't':
                    anim = {
                        from: {
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    break;
                case 'l':
                    anim = {
                        from: {
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    me.anchorAnimX(anchor);
                    break;
                case 'r':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: box.height + 'px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    me.anchorAnimX(anchor);
                    break;
                case 'b':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: box.width + 'px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    break;
                case 'tl':
                    anim = {
                        from: {
                            x: box.x,
                            y: box.y,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    me.anchorAnimX('l');
                    break;
                case 'bl':
                    anim = {
                        from: {
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    me.anchorAnimX('l');
                    break;
                case 'br':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            y: box.y + box.height,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            y: box.y,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    me.anchorAnimX('r');
                    break;
                case 'tr':
                    anim = {
                        from: {
                            x: box.x + box.width,
                            width: '0px',
                            height: '0px'
                        },
                        to: {
                            x: box.x,
                            width: box.width + 'px',
                            height: box.height + 'px'
                        }
                    };
                    elStyle.bottom = '0px';
                    me.anchorAnimX('r');
                    break;
            }

            wrap.show();
            wrapAnim = Ext.apply({}, obj);
            delete wrapAnim.listeners;
            wrapAnim = new Ext.fx.Anim(Ext.applyIf(wrapAnim, {
                target: wrap,
                duration: 500,
                easing: 'ease-out',
                from: slideOut ? anim.to : anim.from,
                to: slideOut ? anim.from : anim.to
            }));

            // In the absence of a callback, this listener MUST be added first
            wrapAnim.on('afteranimate', function() {
                var el = Ext.fly(dom, '_anim');
                
                el.setStyle(originalStyles);
                if (slideOut) {
                    if (obj.useDisplay) {
                        el.setDisplayed(false);
                    } else {
                        el.hide();
                    }
                }
                if (wrap.dom) {
                    if (wrap.dom.parentNode) {
                        wrap.dom.parentNode.insertBefore(el.dom, wrap.dom);
                    } else {
                        wrapDomParentNode.appendChild(el.dom);
                    }
                    wrap.remove();
                }
                // The unwrap will have reset all descendant scrollTops. Restore them if we cached them.
                if (restoreScroll) {
                    restoreScroll();
                }
                // kill the no-op element animation created below
                animScope.end();
            });
            // Add configured listeners after
            if (listeners) {
                wrapAnim.on(listeners);
            }
        };

        me.animate({
            // See "A Note About Wrapped Animations" at the top of this class:
            duration: obj.duration ? Math.max(obj.duration, 500) * 2 : 1000,
            listeners: {
                beforeanimate: beforeAnim // kick off the wrap animation
            }
        });
        return me;
    },


    /**
     * Slides the element out of view. An anchor point can be optionally passed to set the end point for the slide
     * effect. When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will
     * still take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. This function automatically handles wrapping the element with a fixed-size container if needed. See the
     * {@link Ext.fx.Anim} class overview for valid anchor point options. Usage:
     *
     *     // default: slide the element out to the top
     *     el.slideOut();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.slideOut('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.slideOut('t', {
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {String} anchor (optional) One of the valid {@link Ext.fx.Anim} anchor positions (defaults to top: 't')
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    slideOut: function(anchor, o) {
        return this.slideIn(anchor, o, true);
    },

    /**
     * Fades the element out while slowly expanding it in all directions. When the effect is completed, the element will
     * be hidden (visibility = 'hidden') but block elements will still take up space in the document. Usage:
     *
     *     // default
     *     el.puff();
     *
     *     // common config options shown with default values
     *     el.puff({
     *         easing: 'easeOut',
     *         duration: 500,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    puff: function(obj) {
        var me = this,
            dom = me.dom,
            beforeAnim,
            box = me.getBox(),
            originalStyles = me.getStyles('width', 'height', 'left', 'right', 'top', 'bottom', 'position', 'z-index', 'font-size', 'opacity', true);

       obj = Ext.applyIf(obj || {}, {
            easing: 'ease-out',
            duration: 500,
            useDisplay: false
        });

        beforeAnim = function() {
            var el = Ext.fly(dom, '_anim');
            
            el.clearOpacity();
            el.show();
            this.to = {
                width: box.width * 2,
                height: box.height * 2,
                x: box.x - (box.width / 2),
                y: box.y - (box.height /2),
                opacity: 0,
                fontSize: '200%'
            };
            this.on('afteranimate',function() {
                var el = Ext.fly(dom, '_anim');
                if (el) {
                    if (obj.useDisplay) {
                        el.setDisplayed(false);
                    } else {
                        el.hide();
                    }
                    el.setStyle(originalStyles);
                    Ext.callback(obj.callback, obj.scope);
                }
            });
        };

        me.animate({
            duration: obj.duration,
            easing: obj.easing,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            }
        });
        return me;
    },

    /**
     * Blinks the element as if it was clicked and then collapses on its center (similar to switching off a television).
     * When the effect is completed, the element will be hidden (visibility = 'hidden') but block elements will still
     * take up space in the document. The element must be removed from the DOM using the 'remove' config option if
     * desired. Usage:
     *
     *     // default
     *     el.switchOff();
     *
     *     // all config options shown with default values
     *     el.switchOff({
     *         easing: 'easeIn',
     *         duration: .3,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    switchOff: function(obj) {
        var me = this,
            dom = me.dom,
            beforeAnim;

        obj = Ext.applyIf(obj || {}, {
            easing: 'ease-in',
            duration: 500,
            remove: false,
            useDisplay: false
        });

        beforeAnim = function() {
            var el = Ext.fly(dom, '_anim'),
                animScope = this,
                size = el.getSize(),
                xy = el.getXY(),
                keyframe, position;
                
            el.clearOpacity();
            el.clip();
            position = el.getPositioning();

            keyframe = new Ext.fx.Animator({
                target: dom,
                duration: obj.duration,
                easing: obj.easing,
                keyframes: {
                    33: {
                        opacity: 0.3
                    },
                    66: {
                        height: 1,
                        y: xy[1] + size.height / 2
                    },
                    100: {
                        width: 1,
                        x: xy[0] + size.width / 2
                    }
                }
            });
            keyframe.on('afteranimate', function() {
                var el = Ext.fly(dom, '_anim');
                if (obj.useDisplay) {
                    el.setDisplayed(false);
                } else {
                    el.hide();
                }
                el.clearOpacity();
                el.setPositioning(position);
                el.setSize(size);
                // kill the no-op element animation created below
                animScope.end();
            });
        };
        
        me.animate({
            // See "A Note About Wrapped Animations" at the top of this class:
            duration: (Math.max(obj.duration, 500) * 2),
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            },
            callback: obj.callback,
            scope: obj.scope
        });
        return me;
    },

    /**
     * Shows a ripple of exploding, attenuating borders to draw attention to an Element. Usage:
     *
     *     // default: a single light blue ripple
     *     el.frame();
     *
     *     // custom: 3 red ripples lasting 3 seconds total
     *     el.frame("#ff0000", 3, { duration: 3000 });
     *
     *     // common config options shown with default values
     *     el.frame("#C3DAF9", 1, {
     *         duration: 1000 // duration of each individual ripple.
     *         // Note: Easing is not configurable and will be ignored if included
     *     });
     *
     * @param {String} [color='#C3DAF9'] The hex color value for the border.
     * @param {Number} [count=1] The number of ripples to display.
     * @param {Object} [options] Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    frame : function(color, count, obj){
        var me = this,
            dom = me.dom,
            beforeAnim;

        color = color || '#C3DAF9';
        count = count || 1;
        obj = obj || {};

        beforeAnim = function() {
            var el = Ext.fly(dom, '_anim'),
                animScope = this,
                box,
                proxy, proxyAnim;
                
            el.show();
            box = el.getBox();
            proxy = Ext.getBody().createChild({
                id: el.dom.id + '-anim-proxy',
                style: {
                    position : 'absolute',
                    'pointer-events': 'none',
                    'z-index': 35000,
                    border : '0px solid ' + color
                }
            });
            
            proxyAnim = new Ext.fx.Anim({
                target: proxy,
                duration: obj.duration || 1000,
                iterations: count,
                from: {
                    top: box.y,
                    left: box.x,
                    borderWidth: 0,
                    opacity: 1,
                    height: box.height,
                    width: box.width
                },
                to: {
                    top: box.y - 20,
                    left: box.x - 20,
                    borderWidth: 10,
                    opacity: 0,
                    height: box.height + 40,
                    width: box.width + 40
                }
            });
            proxyAnim.on('afteranimate', function() {
                proxy.remove();
                // kill the no-op element animation created below
                animScope.end();
            });
        };

        me.animate({
            // See "A Note About Wrapped Animations" at the top of this class:
            duration: (Math.max(obj.duration, 500) * 2) || 2000,
            listeners: {
                beforeanimate: {
                    fn: beforeAnim
                }
            },
            callback: obj.callback,
            scope: obj.scope
        });
        return me;
    },

    /**
     * Slides the element while fading it out of view. An anchor point can be optionally passed to set the ending point
     * of the effect. Usage:
     *
     *     // default: slide the element downward while fading out
     *     el.ghost();
     *
     *     // custom: slide the element out to the right with a 2-second duration
     *     el.ghost('r', { duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.ghost('b', {
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {String} anchor (optional) One of the valid {@link Ext.fx.Anim} anchor positions (defaults to bottom: 'b')
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    ghost: function(anchor, obj) {
        var me = this,
            dom = me.dom,
            beforeAnim;

        anchor = anchor || "b";
        beforeAnim = function() {
            var el = Ext.fly(dom, '_anim'),
                width = el.getWidth(),
                height = el.getHeight(),
                xy = el.getXY(),
                position = el.getPositioning(),
                to = {
                    opacity: 0
                };
            switch (anchor) {
                case 't':
                    to.y = xy[1] - height;
                    break;
                case 'l':
                    to.x = xy[0] - width;
                    break;
                case 'r':
                    to.x = xy[0] + width;
                    break;
                case 'b':
                    to.y = xy[1] + height;
                    break;
                case 'tl':
                    to.x = xy[0] - width;
                    to.y = xy[1] - height;
                    break;
                case 'bl':
                    to.x = xy[0] - width;
                    to.y = xy[1] + height;
                    break;
                case 'br':
                    to.x = xy[0] + width;
                    to.y = xy[1] + height;
                    break;
                case 'tr':
                    to.x = xy[0] + width;
                    to.y = xy[1] - height;
                    break;
            }
            this.to = to;
            this.on('afteranimate', function () {
                var el = Ext.fly(dom, '_anim');
                if (el) {
                    el.hide();
                    el.clearOpacity();
                    el.setPositioning(position);
                }
            });
        };

        me.animate(Ext.applyIf(obj || {}, {
            duration: 500,
            easing: 'ease-out',
            listeners: {
                beforeanimate: beforeAnim
            }
        }));
        return me;
    },

    /**
     * Highlights the Element by setting a color (applies to the background-color by default, but can be changed using
     * the "attr" config option) and then fading back to the original color. If no original color is available, you
     * should provide the "endColor" config option which will be cleared after the animation. Usage:
     *
     *     // default: highlight background to yellow
     *     el.highlight();
     *
     *     // custom: highlight foreground text to blue for 2 seconds
     *     el.highlight("0000ff", { attr: 'color', duration: 2000 });
     *
     *     // common config options shown with default values
     *     el.highlight("ffff9c", {
     *         attr: "backgroundColor", //can be any valid CSS property (attribute) that supports a color value
     *         endColor: (current color) or "ffffff",
     *         easing: 'easeIn',
     *         duration: 1000
     *     });
     *
     * @param {String} color (optional) The highlight color. Should be a 6 char hex color without the leading #
     * (defaults to yellow: 'ffff9c')
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.dom.Element} The Element
     */
    highlight: function(color, o) {
        var me = this,
            dom = me.dom,
            from = {},
            restore, to, attr, lns, event, fn;

        // Cannot set bckground-color on table elements. Find div elements to highlight.
        if (dom.tagName.match(me.tableTagRe)) {
            return me.select('div').highlight(color, o);
        }

        o = o || {};
        lns = o.listeners || {};
        attr = o.attr || 'backgroundColor';
        from[attr] = color || 'ffff9c';

        if (!o.to) {
            to = {};
            to[attr] = o.endColor || me.getColor(attr, 'ffffff', '');
        }
        else {
            to = o.to;
        }

        // Don't apply directly on lns, since we reference it in our own callbacks below
        o.listeners = Ext.apply(Ext.apply({}, lns), {
            beforeanimate: function() {
                restore = dom.style[attr];
                var el = Ext.fly(dom, '_anim');
                el.clearOpacity();
                el.show();

                event = lns.beforeanimate;
                if (event) {
                    fn = event.fn || event;
                    return fn.apply(event.scope || lns.scope || window, arguments);
                }
            },
            afteranimate: function() {
                if (dom) {
                    dom.style[attr] = restore;
                }

                event = lns.afteranimate;
                if (event) {
                    fn = event.fn || event;
                    fn.apply(event.scope || lns.scope || window, arguments);
                }
            }
        });

        me.animate(Ext.apply({}, o, {
            duration: 1000,
            easing: 'ease-in',
            from: from,
            to: to
        }));
        return me;
    },

   /**
    * Creates a pause before any subsequent queued effects begin. If there are no effects queued after the pause it will
    * have no effect. Usage:
    *
    *     el.pause(1);
    *
    * @deprecated 4.0 Use the `delay` config to {@link #animate} instead.
    * @param {Number} seconds The length of time to pause (in seconds)
    * @return {Ext.Element} The Element
    */
    pause: function(ms) {
        var me = this;
        Ext.fx.Manager.setFxDefaults(me.id, {
            delay: ms
        });
        return me;
    },

    /**
     * Fade an element in (from transparent to opaque). The ending opacity can be specified using the `opacity`
     * config option. Usage:
     *
     *     // default: fade in from opacity 0 to 100%
     *     el.fadeIn();
     *
     *     // custom: fade in from opacity 0 to 75% over 2 seconds
     *     el.fadeIn({ opacity: .75, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeIn({
     *         opacity: 1, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.Element} The Element
     */
    fadeIn: function(o) {
        var me = this,
            dom = me.dom;
            
        me.animate(Ext.apply({}, o, {
            opacity: 1,
            internalListeners: {
                beforeanimate: function(anim){
                    // restore any visibility/display that may have 
                    // been applied by a fadeout animation
                    var el = Ext.fly(dom, '_anim');
                    if (el.isStyle('display', 'none')) {
                        el.setDisplayed('');
                    } else {
                        el.show();
                    } 
                }
            }
        }));
        return this;
    },

    /**
     * Fade an element out (from opaque to transparent). The ending opacity can be specified using the `opacity`
     * config option. Note that IE may require `useDisplay:true` in order to redisplay correctly.
     * Usage:
     *
     *     // default: fade out from the element's current opacity to 0
     *     el.fadeOut();
     *
     *     // custom: fade out from the element's current opacity to 25% over 2 seconds
     *     el.fadeOut({ opacity: .25, duration: 2000});
     *
     *     // common config options shown with default values
     *     el.fadeOut({
     *         opacity: 0, //can be any value between 0 and 1 (e.g. .5)
     *         easing: 'easeOut',
     *         duration: 500,
     *         remove: false,
     *         useDisplay: false
     *     });
     *
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.Element} The Element
     */
    fadeOut: function(o) {
        var me = this,
            dom = me.dom;
            
        o = Ext.apply({
            opacity: 0,
            internalListeners: {
                afteranimate: function(anim){
                    if (dom && anim.to.opacity === 0) {
                        var el = Ext.fly(dom, '_anim');
                        if (o.useDisplay) {
                            el.setDisplayed(false);
                        } else {
                            el.hide();
                        }
                    }         
                }
            }
        }, o);
        me.animate(o);
        return me;
    },

    /**
     * Animates the transition of an element's dimensions from a starting height/width to an ending height/width. This
     * method is a convenience implementation of {@link #shift}. Usage:
     *
     *     // change height and width to 100x100 pixels
     *     el.scale(100, 100);
     *
     *     // common config options shown with default values.  The height and width will default to
     *     // the element's existing values if passed as null.
     *     el.scale(
     *         [element's width],
     *         [element's height], {
     *             easing: 'easeOut',
     *             duration: 350
     *         }
     *     );
     *
     * @deprecated 4.0 Just use {@link #animate} instead.
     * @param {Number} width The new width (pass undefined to keep the original width)
     * @param {Number} height The new height (pass undefined to keep the original height)
     * @param {Object} options (optional) Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.Element} The Element
     */
    scale: function(w, h, o) {
        this.animate(Ext.apply({}, o, {
            width: w,
            height: h
        }));
        return this;
    },

    /**
     * Animates the transition of any combination of an element's dimensions, xy position and/or opacity. Any of these
     * properties not specified in the config object will not be changed. This effect requires that at least one new
     * dimension, position or opacity setting must be passed in on the config object in order for the function to have
     * any effect. Usage:
     *
     *     // slide the element horizontally to x position 200 while changing the height and opacity
     *     el.shift({ x: 200, height: 50, opacity: .8 });
     *
     *     // common config options shown with default values.
     *     el.shift({
     *         width: [element's width],
     *         height: [element's height],
     *         x: [element's x position],
     *         y: [element's y position],
     *         opacity: [element's opacity],
     *         easing: 'easeOut',
     *         duration: 350
     *     });
     *
     * @deprecated 4.0 Just use {@link #animate} instead.
     * @param {Object} options Object literal with any of the {@link Ext.fx.Anim} config options
     * @return {Ext.Element} The Element
     */
    shift: function(config) {
        this.animate(config);
        return this;
    },

    /**
     * @private
     */
    anchorAnimX: function(anchor) {
        var xName = (anchor === 'l') ? 'right' : 'left';
        this.dom.style[xName] = '0px';
    }
});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.Element_dd', {
    override: 'Ext.dom.Element',

    /**
     * Initializes a {@link Ext.dd.DD} drag drop object for this element.
     * @param {String} group The group the DD object is member of
     * @param {Object} config The DD config object
     * @param {Object} overrides An object containing methods to override/implement on the DD object
     * @return {Ext.dd.DD} The DD object
     */
    initDD : function(group, config, overrides){
        var dd = new Ext.dd.DD(Ext.id(this.dom), group, config);
        return Ext.apply(dd, overrides);
    },

    /**
     * Initializes a {@link Ext.dd.DDProxy} object for this element.
     * @param {String} group The group the DDProxy object is member of
     * @param {Object} config The DDProxy config object
     * @param {Object} overrides An object containing methods to override/implement on the DDProxy object
     * @return {Ext.dd.DDProxy} The DDProxy object
     */
    initDDProxy : function(group, config, overrides){
        var dd = new Ext.dd.DDProxy(Ext.id(this.dom), group, config);
        return Ext.apply(dd, overrides);
    },

    /**
     * Initializes a {@link Ext.dd.DDTarget} object for this element.
     * @param {String} group The group the DDTarget object is member of
     * @param {Object} config The DDTarget config object
     * @param {Object} overrides An object containing methods to override/implement on the DDTarget object
     * @return {Ext.dd.DDTarget} The DDTarget object
     */
    initDDTarget : function(group, config, overrides){
        var dd = new Ext.dd.DDTarget(Ext.id(this.dom), group, config);
        return Ext.apply(dd, overrides);
    }
});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.Element_fx', {
    override: 'Ext.dom.Element'
},
function() {

var Element         = Ext.dom.Element,
    VISIBILITY      = "visibility",
    DISPLAY         = "display",
    NONE            = "none",
    HIDDEN          = 'hidden',
    VISIBLE         = 'visible',
    OFFSETS         = "offsets",
    ASCLASS         = "asclass",
    NOSIZE          = 'nosize',
    ORIGINALDISPLAY = 'originalDisplay',
    VISMODE         = 'visibilityMode',
    ISVISIBLE       = 'isVisible',
    OFFSETCLASS     = Ext.baseCSSPrefix + 'hide-offsets',
    getDisplay = function(el) {
        var data = (el.$cache || el.getCache()).data,
            display = data[ORIGINALDISPLAY];
            
        if (display === undefined) {
            data[ORIGINALDISPLAY] = display = '';
        }
        return display;
    },
    getVisMode = function(el){
        var data = (el.$cache || el.getCache()).data,
            visMode = data[VISMODE];
            
        if (visMode === undefined) {
            data[VISMODE] = visMode = Element.VISIBILITY;
        }
        return visMode;
    };

Element.override({
    /**
     * The element's default display mode.
     */
    originalDisplay : "",
    visibilityMode : 1,

    /**
     * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
     * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
     * @param {Boolean} visible Whether the element is visible
     * @param {Boolean/Object} [animate] True for the default animation, or a standard Element animation config object
     * @return {Ext.dom.Element} this
     */
    setVisible : function(visible, animate) {
        var me = this,
            dom = me.dom,
            visMode = getVisMode(me);

        // hideMode string override
        if (typeof animate == 'string') {
            switch (animate) {
                case DISPLAY:
                    visMode = Element.DISPLAY;
                    break;
                case VISIBILITY:
                    visMode = Element.VISIBILITY;
                    break;
                case OFFSETS:
                    visMode = Element.OFFSETS;
                    break;
                case NOSIZE:
                case ASCLASS:
                    visMode = Element.ASCLASS;
                    break;
            }
            me.setVisibilityMode(visMode);
            animate = false;
        }

        if (!animate || !me.anim) {
            if (visMode == Element.DISPLAY) {
                return me.setDisplayed(visible);
            } else if (visMode == Element.OFFSETS) {
                me[visible?'removeCls':'addCls'](OFFSETCLASS);
            } else if (visMode == Element.VISIBILITY) {
                me.fixDisplay();
                // Show by clearing visibility style. Explicitly setting to "visible" overrides parent visibility setting
                dom.style.visibility = visible ? '' : HIDDEN;
            } else if (visMode == Element.ASCLASS) {
                me[visible?'removeCls':'addCls'](me.visibilityCls || Element.visibilityCls);
            }
        } else {
            // closure for composites
            if (visible) {
                me.setOpacity(0.01);
                me.setVisible(true);
            }
            if (!Ext.isObject(animate)) {
                animate = {
                    duration: 350,
                    easing: 'ease-in'
                };
            }
            me.animate(Ext.applyIf({
                callback: function() {
                    if (!visible) {
                        
                        // Grab the dom again, since the reference may have changed if we use fly
                        Ext.fly(dom, '_internal').setVisible(false).setOpacity(1);
                    }
                },
                to: {
                    opacity: (visible) ? 1 : 0
                }
            }, animate));
        }
        (me.$cache || me.getCache()).data[ISVISIBLE] = visible;
        return me;
    },

    /**
     * @private
     * Determine if the Element has a relevant height and width available based
     * upon current logical visibility state
     */
    hasMetrics  : function(){
        var visMode = getVisMode(this);
        return this.isVisible() || (visMode == Element.OFFSETS) || (visMode == Element.VISIBILITY);
    },

    /**
     * Toggles the element's visibility or display, depending on visibility mode.
     * @param {Boolean/Object} [animate] True for the default animation, or a standard Element animation config object
     * @return {Ext.dom.Element} this
     */
    toggle : function(animate){
        var me = this;
        me.setVisible(!me.isVisible(), me.anim(animate));
        return me;
    },

    /**
     * Sets the CSS display property. Uses originalDisplay if the specified value is a boolean true.
     * @param {Boolean/String} value Boolean value to display the element using its default display, or a string to set the display directly.
     * @return {Ext.dom.Element} this
     */
    setDisplayed : function(value) {
        if(typeof value == "boolean"){
           value = value ? getDisplay(this) : NONE;
        }
        this.setStyle(DISPLAY, value);
        return this;
    },

    // private
    fixDisplay : function(){
        var me = this;
        if (me.isStyle(DISPLAY, NONE)) {
            me.setStyle(VISIBILITY, HIDDEN);
            me.setStyle(DISPLAY, getDisplay(me)); // first try reverting to default
            if (me.isStyle(DISPLAY, NONE)) { // if that fails, default to block
                me.setStyle(DISPLAY, "block");
            }
        }
    },

    /**
     * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element animation config object
     * @return {Ext.dom.Element} this
     */
    hide : function(animate){
        // hideMode override
        if (typeof animate == 'string'){
            this.setVisible(false, animate);
            return this;
        }
        this.setVisible(false, this.anim(animate));
        return this;
    },

    /**
     * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element animation config object
     * @return {Ext.dom.Element} this
     */
    show : function(animate){
        // hideMode override
        if (typeof animate == 'string'){
            this.setVisible(true, animate);
            return this;
        }
        this.setVisible(true, this.anim(animate));
        return this;
    }
});

});

// @tag dom,core
/**
 */
Ext.define('Ext.dom.Element_position', {
    override: 'Ext.dom.Element'
},
function() {

var flyInstance,
    Element = this,
    LEFT = "left",
    RIGHT = "right",
    TOP = "top",
    BOTTOM = "bottom",
    POSITION = "position",
    STATIC = "static",
    RELATIVE = "relative",
    ZINDEX = "z-index",
    BODY = 'BODY',

    PADDING = 'padding',
    BORDER = 'border',
    SLEFT = '-left',
    SRIGHT = '-right',
    STOP = '-top',
    SBOTTOM = '-bottom',
    SWIDTH = '-width',
    // special markup used throughout Ext when box wrapping elements
    borders = {l: BORDER + SLEFT + SWIDTH, r: BORDER + SRIGHT + SWIDTH, t: BORDER + STOP + SWIDTH, b: BORDER + SBOTTOM + SWIDTH},
    paddings = {l: PADDING + SLEFT, r: PADDING + SRIGHT, t: PADDING + STOP, b: PADDING + SBOTTOM},
    paddingsTLRB = [paddings.l, paddings.r, paddings.t, paddings.b],
    bordersTLRB = [borders.l,  borders.r,  borders.t,  borders.b],
    round = Math.round,
    doc = document,
    fly = function (el) {
        if (!flyInstance) {
            flyInstance = new Ext.Element.Fly();
        }
        flyInstance.attach(el);
        return flyInstance;
    };

    Element.override({

        pxRe: /^\d+(?:\.\d*)?px$/i,

        inheritableStatics: {
            getX: function(el) {
                return Element.getXY(el)[0];
            },

            getXY: function(el) {
                var bd = doc.body,
                    docEl = doc.documentElement,
                    leftBorder = 0,
                    topBorder = 0,
                    ret = [0,0],
                    box,
                    scroll;

                el = Ext.getDom(el);

                if(el != doc && el != bd){
                    // IE has the potential to throw when getBoundingClientRect
                    // is called on an element not attached to dom
                    if (Ext.isIE) {
                        try {
                            box = el.getBoundingClientRect();
                            // In some versions of IE, the documentElement (HTML element)
                            // will have a 2px border that gets included, so subtract it off
                            topBorder = docEl.clientTop || bd.clientTop;
                            leftBorder = docEl.clientLeft || bd.clientLeft;
                        } catch (ex) {
                            box = { left: 0, top: 0 };
                        }
                    } else {
                        box = el.getBoundingClientRect();
                    }

                    scroll = fly(doc).getScroll();
                    ret = [
                        round(box.left + scroll.left - leftBorder),
                        round(box.top + scroll.top - topBorder)
                    ];
                }
                return ret;
            },

            getY: function(el) {
                return Element.getXY(el)[1];
            },

            setX: function(el, x) {
                Element.setXY(el, [x, false]);
            },

            setXY: function(el, xy) {
                (el = Ext.fly(el, '_setXY')).position();

                var pts = el.translatePoints(xy),
                    style = el.dom.style,
                    pos;

                // right position may have been previously set by rtlSetXY or
                // rtlSetLocalXY so clear it here just in case.
                style.right = 'auto';
                for (pos in pts) {
                    if (!isNaN(pts[pos])) {
                        style[pos] = pts[pos] + "px";
                    }
                }
            },

            setY: function(el, y) {
                Element.setXY(el, [false, y]);
            }
        },

        /**
         * Centers the Element in either the viewport, or another Element.
         * @param {String/HTMLElement/Ext.dom.Element} centerIn element in
         * which to center the element.
         */
        center: function(centerIn){
            return this.alignTo(centerIn || doc, 'c-c');
        },

        /**
         * Clears positioning back to the default when the document was loaded.
         * @param {String} [value=''] The value to use for the left, right, top, bottom.
         * You could use 'auto'.
         * @return {Ext.dom.Element} this
         */
        clearPositioning: function(value) {
            value = value || '';
            return this.setStyle({
                left : value,
                right : value,
                top : value,
                bottom : value,
                'z-index' : '',
                position : STATIC
            });
        },

        getAnchorToXY: function(el, anchor, local, mySize) {
            return el.getAnchorXY(anchor, local, mySize);
        },

        /**
         * Gets the bottom Y coordinate of the element (element Y position + element height)
         * @param {Boolean} local True to get the local css position instead of page
         * coordinate
         * @return {Number}
         * @deprecated
         */
        getBottom: function(local) {
            return (local ? this.getLocalY() : this.getY()) + this.getHeight();
        },

        getBorderPadding: function() {
            var paddingWidth = this.getStyle(paddingsTLRB),
                bordersWidth = this.getStyle(bordersTLRB);

            return {
                beforeX: (parseFloat(bordersWidth[borders.l]) || 0) + (parseFloat(paddingWidth[paddings.l]) || 0),
                afterX: (parseFloat(bordersWidth[borders.r]) || 0) + (parseFloat(paddingWidth[paddings.r]) || 0),
                beforeY: (parseFloat(bordersWidth[borders.t]) || 0) + (parseFloat(paddingWidth[paddings.t]) || 0),
                afterY: (parseFloat(bordersWidth[borders.b]) || 0) + (parseFloat(paddingWidth[paddings.b]) || 0)
            };
        },

        /**
         * Calculates the x, y to center this element on the screen
         * @return {Number[]} The x, y values [x, y]
         * @deprecated
         */
        getCenterXY: function(){
            return this.getAlignToXY(doc, 'c-c');
        },

        /**
         * Gets the left X coordinate
         * @param {Boolean} local True to get the local css position instead of
         * page coordinate
         * @return {Number}
         * @deprecated Use {@link #getX} or {@link #getLocalX}
         */
        getLeft: function(local) {
            return local ? this.getLocalX() : this.getX();
        },

        /**
         * Gets the local CSS X position for the element
         *
         * @return {Number}
         */
        getLocalX: function() {
            var me = this,
                offsetParent = me.dom.offsetParent,
                x = me.getStyle('left');

            if (!x || x === 'auto') {
                x = 0;
            } else if (me.pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();
                if (offsetParent) {
                    x -= Element.getX(offsetParent);
                }
            }

            return x;
        },

        /**
         * Gets the local CSS X and Y position for the element
         *
         * @return {Array} [x, y]
         */
        getLocalXY: function() {
            var me = this,
                offsetParent = me.dom.offsetParent,
                style = me.getStyle(['left', 'top']),
                x = style.left,
                y = style.top;

            if (!x || x === 'auto') {
                x = 0;
            } else if (me.pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();
                if (offsetParent) {
                    x -= Element.getX(offsetParent);
                }
            }

            if (!y || y === 'auto') {
                y = 0;
            } else if (me.pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();
                if (offsetParent) {
                    y -= Element.getY(offsetParent);
                }
            }

            return [x, y];
        },

        /**
         * Gets the local CSS Y position for the element
         *
         * @return {Number}
         */
        getLocalY: function() {
            var me = this,
                offsetParent = me.dom.offsetParent,
                y = me.getStyle('top');

            if (!y || y === 'auto') {
                y = 0;
            } else if (me.pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();
                if (offsetParent) {
                    y -= Element.getY(offsetParent);
                }
            }

            return y;
        },

        /**
         * Returns an object defining the area of this Element which can be passed to
         * {@link Ext.util.Positionable#setBox} to set another Element's size/location to match this element.
         *
         * @param {Boolean} [asRegion] If true an Ext.util.Region will be returned
         * @return {Object/Ext.util.Region} box An object in the following format:
         *
         *     {
         *         left: <Element's X position>,
         *         top: <Element's Y position>,
         *         width: <Element's width>,
         *         height: <Element's height>,
         *         bottom: <Element's lower bound>,
         *         right: <Element's rightmost bound>
         *     }
         *
         * The returned object may also be addressed as an Array where index 0 contains
         * the X position and index 1 contains the Y position. So the result may also be
         * used for {@link #setXY}
         * @deprecated use {@link Ext.util.Positionable#getBox} to get a box object, and
         * {@link Ext.util.Positionable#getRegion} to get a {@link Ext.util.Region Region}.
         */
        getPageBox: function(getRegion) {
            var me = this,
                dom = me.dom,
                isDoc = dom.nodeName == BODY,
                w = isDoc ? Ext.Element.getViewWidth() : dom.offsetWidth,
                h = isDoc ? Ext.Element.getViewHeight() : dom.offsetHeight,
                xy = me.getXY(),
                t = xy[1],
                r = xy[0] + w,
                b = xy[1] + h,
                l = xy[0];

            if (getRegion) {
                return new Ext.util.Region(t, r, b, l);
            }
            else {
                return {
                    left: l,
                    top: t,
                    width: w,
                    height: h,
                    right: r,
                    bottom: b
                };
            }
        },

        /**
         * Gets an object with all CSS positioning properties. Useful along with
         * #setPostioning to get snapshot before performing an update and then restoring
         * the element.
         * @param {Boolean} [autoPx=false] true to return pixel values for "auto" styles.
         * @return {Object}
         */
        getPositioning: function(autoPx){
            var styles = this.getStyle(['left', 'top', 'position', 'z-index']),
                dom = this.dom;

            if(autoPx) {
                if(styles.left === 'auto') {
                    styles.left = dom.offsetLeft + 'px';
                }
                if(styles.top === 'auto') {
                    styles.top = dom.offsetTop + 'px';
                }
            }

            return styles;
        },

        /**
         * Gets the right X coordinate of the element (element X position + element width)
         * @param {Boolean} local True to get the local css position instead of page
         * coordinates
         * @return {Number}
         * @deprecated
         */
        getRight: function(local) {
            return (local ? this.getLocalX() : this.getX()) + this.getWidth();
        },

        /**
         * Gets the top Y coordinate
         * @param {Boolean} local True to get the local css position instead of page
         * coordinates
         * @return {Number}
         * @deprecated Use {@link #getY} or {@link #getLocalY}
         */
        getTop: function(local) {
            return local ? this.getLocalY() : this.getY();
        },

        /**
         * Gets element X position in page coordinates
         *
         * @return {Number}
         */
        getX: function() {
            return Element.getX(this.dom);
        },

        /**
         * Gets element X and Y positions in page coordinates
         *
         * @return {Array} [x, y]
         */
        getXY: function() {
            return Element.getXY(this.dom);
        },

        /**
         * Gets element Y position in page coordinates
         *
         * @return {Number}
         */
        getY: function() {
            return Element.getY(this.dom);
        },

        /**
         * Sets the position of the element in page coordinates.
         * @param {Number} x X value for new position (coordinates are page-based)
         * @param {Number} y Y value for new position (coordinates are page-based)
         * @param {Boolean/Object} [animate] True for the default animation, or a standard
         * Element animation config object
         * @return {Ext.dom.Element} this
         * @deprecated Use {@link #setXY} instead.
         */
        moveTo: function(x, y, animate) {
            return this.setXY([x, y], animate);
        },

        /**
         * Initializes positioning on this element. If a desired position is not passed,
         * it will make the the element positioned relative IF it is not already positioned.
         * @param {String} [pos] Positioning to use "relative", "absolute" or "fixed"
         * @param {Number} [zIndex] The zIndex to apply
         * @param {Number} [x] Set the page X position
         * @param {Number} [y] Set the page Y position
         */
        position: function(pos, zIndex, x, y) {
            var me = this;

            if (!pos && me.isStyle(POSITION, STATIC)) {
                me.setStyle(POSITION, RELATIVE);
            } else if (pos) {
                me.setStyle(POSITION, pos);
            }
            if (zIndex) {
                me.setStyle(ZINDEX, zIndex);
            }
            if (x || y) {
                me.setXY([x || false, y || false]);
            }
        },

        /**
         * Sets the element's CSS bottom style.
         * @param {Number/String} bottom Number of pixels or CSS string value to set as
         * the bottom CSS property value
         * @return {Ext.dom.Element} this
         * @deprecated
         */
        setBottom: function(bottom) {
            this.dom.style[BOTTOM] = this.addUnits(bottom);
            return this;
        },

        /**
         * Sets the element's position and size in one shot. If animation is true then
         * width, height, x and y will be animated concurrently.
         *
         * @param {Number} x X value for new position (coordinates are page-based)
         * @param {Number} y Y value for new position (coordinates are page-based)
         * @param {