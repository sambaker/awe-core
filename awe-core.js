/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(global, undefined) {
  // This is a library of all-purpose, general utility functions contained within
  // the `Awe` namespace.

  // Create Awe
  var Awe = {}
  
  // Awe.isArray(o)
  // --------------
  //
  // Tests whether object `o` is an array
  //
  // ### params
  // `o` - the object to test
  // 
  // ### returns
  // `true` if `o` is an array, otherwise `false`
  Awe.isArray = function(o) {
    return o && o.constructor == Array.prototype.constructor;
  }

  // Awe.isArrayOrString(o)
  // ----------------------
  //
  // Tests whether object `o` is either an array or a string
  //
  // ### params
  // `o` - the object to test
  // 
  // ### returns
  // `true` if `o` is an array or string, otherwise `false`
  Awe.isArrayOrString = function(o) {
    return o && (o.constructor == Array.prototype.constructor ||
      o.constructor == String.prototype.constructor);
  }

  // Awe.isType(o, type)
  // -------------------
  //
  // Tests whether object `o` is of type `type`
  //
  // ### params
  // `o` - the object to test
  // `type` - the type to compare against
  // 
  // ### returns
  // `true` if `o` is of type `type`, otherwise `false`
  // 
  // ### example usage
  // `Awe.isType([], Array)         // true`
  // 
  // `Awe.isType(new Date(), Date)  // true`
  Awe.isType = function(o, type) {
    return o && o.constructor == type.prototype.constructor;
  }
  
  // Awe.isFunction(o)
  // -----------------
  //
  // Tests whether object `o` is a function
  //
  // ### params
  // `o` - the object to test
  // 
  // ### returns
  // `true` if `o` is a function, otherwise `false`
  Awe.isFunction = function(o) {
    return o && o.constructor == Function.prototype.constructor;
  }

  // Awe.clamp(n, range1, range2)
  // ----------------------------
  //
  // Clamps `n` between `range1` and `range2`
  //
  // ### params
  // `n` - The number to be clamped
  // `range1` - An upper or lower limit to clamp to
  // `range2` - An upper or lower limit to clamp to
  // 
  // ### returns
  // The clamped value
  Awe.clamp = function(n, range1, range2) {
    if (range2 < range1) {
      var t = range1;
      range1 = range2;
      range2 = t;
    }
    return Math.min(Math.max(n, range1), range2);
  }

  // Awe.sign(n)
  // ----------------------------
  //
  // Returns the positive/negative direction of n
  //
  // ### params
  // `n` - The number to return the sign of
  // 
  // ### returns
  // -1 if `n` < 0, otherwise, 1
  Awe.sign = function(n) {
    return (n < 0) ? -1 : 1;
  }
  
  // Awe.positiveOrZero(n)
  // ----------------------------
  //
  // Ensure n is a positive value or zero.
  //
  // ### params
  // `n` - The number to evaluate
  // 
  // ### returns
  // The value of n clamped to `(n >= 0)`
  Awe.positiveOrZero = function(n) {
    return (n > 0) ? n : 0;
  }

  // Awe.acosSafe(n)
  // ---------------
  // 
  // Clamp n between -1 and 1 before passing to Math.acos to prevent an exception.
  // Ensure that this makes sense for your parameters - it is assumed they will be close to
  // the clamped range but allows computational errors to be safely ignored.
  // 
  // ### params
  // `n` - The number to evaluate
  // 
  // ### returns
  // The value of `acos(n)` where n is clamped to the valid range of inputs
  Awe.acosSafe = function(n) {
    return Math.acos(Awe.clamp(n, -1, 1));
  }

  // Awe.getQueryParam(name, url)
  // ----------------------------
  // 
  // Pull a query parameter out of a url
  // 
  // ### params
  // `name` - The query param to retrieve
  // `url` - The url to pull from (optional, defaults to global.location.href)
  // 
  // ### returns
  // The value of the query param
  // 
  // ### example usage
  // `Awe.getQueryParam('username', 'http://webservice.com/auth?username=Bob Dylan')  // returns "Bob Dylan"`
  Awe.getQueryParam = function(name, url) {
    url = url || global.location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    if (!results)
      return "";
    return results[1];
  }

  // Awe.forEach(array, callback, thisArg)
  // -------------------------------------
  // 
  // Essentially same behavior as Array.prototype.forEach in https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
  // that uses native code when available, otherwise a javascript approximation.
  // 
  // ### params
  // `array` - the array to iterate over
  // `callback` - the callback to call for each element. The callback will receive three parameters for each iteration: the object, it's index and the array itself
  // `thisArg` - an optional scope that the callback will be able to access via `this`
  if (Array.prototype.forEach) {
    Awe.forEach = function(array, callback, thisArg) {
      array.forEach(callback, thisArg);
    }
  } else {
    Awe.forEach = function(array, callback, thisArg) {
      thisArg = thisArg || this;
      var length = array.length;
      var i = 0;
      while (i < length) {
        callback.call(thisArg, array[i], i, array);
        ++i;
      }
    }
  }

  // Awe.objectToString(o)
  // ---------------------
  //
  // Convert an object to its string representation
  //
  // ### params
  // `o` - object to turn to string
  // 
  // ### returns
  // A string representation suitable for console logging. Conversion fails gracefully in IE7 which lacks native JSON support.
  Awe.objectToString = function(o) {
    if (typeof(JSON) != "undefined") {
      return JSON.stringify(o);
    }
    return "Not supported";
  }

  var _nextGuid = 0;  
  // Awe.getUid()
  // -------------
  // 
  // Generate a unique string id
  // 
  // ### returns
  // a string that's unique to this session
  // 
  // ### example usage
  // 
  // `div.id = Awe.getUid();`
  Awe.getUid = Awe.getGuid = function() {
    return "_guid_" + ++_nextGuid;
  }
  
  // Awe.getUidNumeric()
  // -------------
  // 
  // Generate a unique numeric, integral id > 0
  // 
  // ### returns
  // a string that's unique to this session
  // 
  // ### example usage
  // 
  // `object.id = Awe.getUidNumeric();`
  Awe.getUidNumeric = Awe.getGuidNumeric = function() {
    return ++_nextGuid;
  }

  // Awe.trim(str)
  // -------------
  // 
  // Trim whitespace from a string
  // 
  // ### params
  // `str` - the string to trim
  // 
  // ### returns
  // A new copy of `str` with leading and trailing whitespace removed
  Awe.trim = function(str) {
    return str.replace(/^\s+|\s+$/, '');
  }

  var hexToInt = {
    "0":0,
    "1":1,
    "2":2,
    "3":3,
    "4":4,
    "5":5,
    "6":6,
    "7":7,
    "8":8,
    "9":9,
    "a":10,"A":10,
    "b":11,"B":11,
    "c":12,"C":12,
    "d":13,"D":13,
    "e":14,"E":14,
    "f":15,"F":15
  }
  
  // [CLASS] Awe.Color
  // -----------------
  // 
  // Color class parses CSS color specs in different formats ("#rrggbb", "rgb(r, g, b)" or "rgba(r, g, b, a)") and provides
  // accessors to r/g/b/a components and CSS color strings.
  // 
  // ### example usage
  // `var color = new Awe.Color("#8fdff4");`
  // 
  // Assigns "$8fdff4":
  // 
  // `el.style.color = color.toHex();`
  // 
  // Assigns "rgb(143,223,244)":
  // 
  // `el.style.color = color.toRGB();`
  // 
  // Assigns "rgba(143,223,244,1)":
  // 
  // `el.style.color = color.toRGBA();`
  // 
  // Assigns [143, 223, 244]:
  // 
  // `var rgb = [color.r, color.g, color.b];`
  Awe.Color = function(color) {
    var _i = this;
    
    _i.toHex = function() {
      return _i.hex;
    }
  
    _i.toRGBA = function(alpha) {
      if (alpha == undefined) {
        alpha = _i.a;
      }
      return "rgba("+_i.r+","+_i.g+","+_i.b+","+alpha+")";
    }
  
    _i.toRGB = function() {
      return "rgb("+_i.r+","+_i.g+","+_i.b+")";
    }
        
    if (color[0] == "#") {
      _i.hex = color;
      _i.r = (hexToInt[color[1]] << 4) + hexToInt[color[2]];
      _i.g = (hexToInt[color[3]] << 4) + hexToInt[color[4]];
      _i.b = (hexToInt[color[5]] << 4) + hexToInt[color[6]];
      _i.a = 1;
    } else {
      if (color.indexOf('rgb(') == 0) {
        color = color.substring(4,color.length-1);
      } else if (color.indexOf('rgba(') == 0) {
        color = color.substring(5,color.length-1);
      }
      var i;
      _i.r = parseInt(color);
      color = color.substring(color.indexOf(',')+1);
      _i.g = parseInt(color);
      color = color.substring(color.indexOf(',')+1);
      _i.b = parseInt(color);
      color = color.substring(color.indexOf(',')+1);
      if (color) {
        _i.a = parseFloat(color);
      } else {
        _i.a = 1;
      }
    }
  }

  global.Awe = Awe;

})(typeof exports === 'undefined' ? this : exports);
