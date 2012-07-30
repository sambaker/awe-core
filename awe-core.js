/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(global, undefined) {
  // = awe-core =
  //
  // This is a library of all-purpose, general utility functions contained within
  // the {{{Awe}}} namespace.

  // Create Awe
  var Awe = {}

  // == Helpers ==
  
  // ** {{{ Awe.isArray(o) }}} **
  //
  // Tests whether object {{{o}}} is an array
  //
  // |=param|=description|
  // |{{{o}}}|The object to test|
  // 
  // **{{{returns}}}** {{{true}}} if {{{o}}} is an array, otherwise {{{false}}}
  Awe.isArray = function(o) {
    return o && o.constructor == Array.prototype.constructor;
  }

  // ** {{{ Awe.isArrayOrString(o) }}} **
  //
  // Tests whether object {{{o}}} is either an array or a string
  //
  // |=param|=description|
  // |{{{o}}}|The object to test|
  // 
  // **{{{returns}}}** {{{true}}} if {{{o}}} is an array or string, otherwise {{{false}}}
  Awe.isArrayOrString = function(o) {
    return o && (o.constructor == Array.prototype.constructor ||
      o.constructor == String.prototype.constructor);
  }

  // ** {{{ Awe.isType(o, type) }}} **
  //
  // Tests whether object {{{o}}} is a of type {{{type}}}
  //
  // |=param|=description|
  // |{{{o}}}|The object to test|
  // |{{{type}}}|The type to compare|
  // 
  // **{{{returns}}}** {{{true}}} if {{{o}}} is of type {{{type}}}, otherwise {{{false}}}
  Awe.isType = function(o, type) {
    return o && o.constructor == type.prototype.constructor;
  }
  
  // ** {{{ Awe.isFunction(o) }}} **
  //
  // Tests whether object {{{o}}} is a function
  //
  // |=param|=description|
  // |{{{o}}}|The object to test|
  // 
  // **{{{returns}}}** {{{true}}} if {{{o}}} is a function, otherwise {{{false}}}
  Awe.isFunction = function(o) {
    return o && o.constructor == Function.prototype.constructor;
  }

  // ** {{{ Awe.clamp(n, range1, range2 }}} **
  //
  // Clamps {{{n}}} between {{{range1}}} and {{{range2}}}
  //
  // |=param|=description|
  // |{{{n}}}|The number to be clamped|
  // |{{{range1}}}|An upper or lower limit to clamp to|
  // |{{{range2}}}|The other upper or lower limit to clamp to|
  // 
  // **{{{returns}}}** the clamped number
  Awe.clamp = function(n, range1, range2) {
    if (range2 < range1) {
      var t = range1;
      range1 = range2;
      range2 = t;
    }
    return Math.min(Math.max(n, range1), range2);
  }

  // Return -1 if n < 0 or 1 otherwise
  // ** {{{ Awe.sign(n) }}} **
  //
  // Returns the positive/negative direction of n
  //
  // |=param|=description|
  // |{{{n}}}|The number to return the sign of|
  // 
  // **{{{returns}}}** -1 if {{{n}}} < 0, otherwise, 1
  Awe.sign = function(n) {
    return (n < 0) ? -1 : 1;
  }
  
  // Ensure n is a positive value or zero.
  Awe.positiveOrZero = function(n) {
    return (n > 0) ? n : 0;
  }

  // Clamp a number between -1 and 1 before passing to Math.acos to prevent an exception.
  // Ensure that this makes sense for your parameters - it is assumed they will be close to
  // the clamped range but allows computational errors to be safely ignored.
  Awe.acosSafe = function(rad) {
    return Math.acos(Awe.clamp(rad, -1, 1));
  }

  // Get a query string parameter value by name
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

  if (Array.prototype.forEach) {
    Awe.forEach = function(array, callback, thisArg) {
      array.forEach(callback, thisArg);
    }
  } else {
    Awe.forEach = function(array, callback, thisArg) {
      var length = array.length;
      var i = 0;
      while (i < length) {
        callback.call(thisArg, array[i], i);
        ++i;
      }
    }
  }
  

  // ** {{{ Awe.objectToString(o) }}} **
  //
  // Convert an object to its string representation
  //
  // |=param|=description|
  // |{{{o}}}|object to turn to string|
  // 
  // **{{{returns}}}** a string representation suitable for console logging
  Awe.objectToString = function(o) {
    // Do something more interesting in the future?
    return JSON.stringify(o);
  }

  var _nextGuid = 0;
  
  // Returns a string unique to this session
  Awe.getGuid = function() {
    return "_guid_" + ++_nextGuid;
  }
  
  // Returns a unique positive integral number > 0
  Awe.getGuidNumeric = function() {
    return ++_nextGuid;
  }

  // Classes
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
    "f":15,"F":15,
  }
  
  // Color class parses CSS color specs in different formats ("#rrggbb", "rgb(r, g, b)" or "rgba(r, g, b, a)") and provides
  // accessors to r/g/b/a components and CSS color strings.
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
      return "rgba("+_i.r+","+_i.g+","+_i.b+")";
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