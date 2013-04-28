/*
    JsonNET_Ref.js
    This is client side part for server side library current Json.NET (http://json.codeplex.com/)

    Petr Pokorny - bear's developer
    2013-03-10

    
    Inspirations:
    See http://dojotoolkit.org/reference-guide/1.8/dojox/json/ref.html
    See http://json.codeplex.com/


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    ATENTIONS:
        -USE YOUR OWN COPY. 
        -NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

if (typeof JSON.makeRef !== 'function') {
    JSON.makeRef = function makeRef($) {
        'use strict';

        // Make a deep copy of an object or array, assuring that there is at most
        // one instance of each object or array in the resulting structure. The
        // duplicate references (which might be forming cycles) are replaced with
        // an object of the form
        //      {$ref: PATH}
        // where the PATH is a JSONPath string that locates the first occurance.
        // So,
        //      var a = [];
        //      a[0] = a;
        //      return JSON.stringify(JSON.decycle(a));
        // produces the string '[{"$ref":"$"}]'.

        // JSONPath is used to locate the unique object. $ indicates the top level of
        // the object or array. [NUMBER] or [STRING] indicates a child member or
        // property.

        var RefIndex       // Ref index

        return (function derez(value) {

            // The derez recurses through the object, producing the deep copy.

            var i          // The loop counter

            var RefFactory = function (item) {
                if (typeof item === 'object' && item !== null &&
                    !(item instanceof Boolean) &&
                    !(item instanceof Date) &&
                    !(item instanceof Number) &&
                    !(item instanceof RegExp) &&
                    !(item instanceof String)) {

                    if (!item.$ref) {
                        if (item.$id) {
                            item = { $ref: value[i].$id }
                        } else {
                            item.$id = (RefIndex++).toString();
                            derez(item);
                        }
                    }
                }
            }

            // typeof null === 'object', so go on if this value is really an object but not
            // one of the weird builtin objects.

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        RefFactory(value[i]);
                    }
                } else {
                    for (name in value) {
                        RefFactory(value[name]);

                    }

                }
            }
        }($));
        return $;
    }
}
if (typeof JSON.replaceRef !== 'function') {
    JSON.replaceRef = function replaceRef($) {
        'use strict';

        // replaceRef an object that was reduced by decycle. Members whose values are
        // objects of the form
        //      {"$ref": "X"} where X is id number object instance - for example {"$ref":"1"}
        // are replaced with references to the value found by the value $id. This will
        // restore cycles. The object will be mutated.        
        // So,
        //      var s = '{"$ref":"1"}';
        //      return JSON.replaceRef(JSON.parse(s));
        // produces an object properties/array containing a single element which is the object/array itself.


        var px = /\d+$/, 
            idObjects = {};  // Keep a reference to each unique object/array by $Id


        (function rez(value) {

            // The rez function walks recursively through the object looking for $ref
            // properties. When it finds one that has a value that $ref, then it
            // replaces the $ref object with a reference to the value that is found by
            // idObjects properies.           

            var i, item, name, id, ref;            

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {                        
                        rez(value[i]);
                    }
                } else {
                    id = value.$id;
                    if (typeof id === "string" && px.test(id)) {
                        delete value.$id;
                        idObjects["ID" + id] = value;
                    }

                    for (name in value) {
                        item = value[name];
                        if (item && typeof item === 'object'){
                            ref = item.$ref;
                            if (typeof ref === 'string' && px.test(ref)) {
                                value[name] = idObjects["ID" + ref];
                            } else {
                                rez(item);
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
