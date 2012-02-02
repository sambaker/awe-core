/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact
 */
(function(global, document, namespace, undefined) {
  namespace = namespace || "Awe";

  // Create and export Awe
  var Awe = {}

  // Helpers
  Awe.isArray = function(o) {
    return o.constructor == Array.prototype.constructor;
  }

  Awe.isArrayOrString = function(o) {
    return o.constructor == Array.prototype.constructor || o.constructor == String.prototype.constructor;
  }

  Awe.isType = function(o, type) {
    return o.constructor == type.prototype.constructor;
  }

  // Environment-specific vars
  Awe.env = {};
  Awe.env.inputTouch = "ontouchstart" in global;
  Awe.env.inputMouse = !Awe.env.inputTouch;
  
  Awe.env.eventDragStart = Awe.env.inputTouch ? "touchstart" : "mousedown";
  Awe.env.eventDragMove = Awe.env.inputTouch ? "touchmove" : "mousemove";
  Awe.env.eventDragEnd = Awe.env.inputTouch ? "touchend" : "mouseup";
  Awe.env.eventClick = Awe.env.inputTouch ? "touchend" : "click";
  
  // Clamp a number between min/max
  Awe.clamp = function(n, min, max) {
    return Math.min(Math.max(n, min), max);
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
  
  // Create an HTML element of the given type and attach to the given parent if not null.
  // The config object can contain styles, attrs, a class and a background sprite to apply
  // to the element
  Awe.createElement = function(type, parent, config) {
    var k;
    var el = document.createElement(type);
    config = config || {};
    if (config.backgroundSprite) {
      // TODO:
      throw("TODO:");
      //setBackgroundSprite(el, config.backgroundSprite);
    }
    for (k in (config.styles || {})) {
      el.style[k] = config.styles[k];
    }
    for (k in (config.attrs || {})) {
      el[k] = config.attrs[k];
    }
    for (k in (config.setAttrs || {})) {
      el.setAttribute(k, config.setAttrs[k]);
    }
  
    if (parent)
      parent.appendChild(el);
  
    if (config.className)
      el.className = config.className;
      
    return el;
  }
  
  Awe.objectToString = function(o) {
    // Do something more interesting in the future?
    return JSON.stringify(o);
  }

  Awe.requestAnimationFrame = (function() {
    return  global.requestAnimationFrame       ||
            global.webkitRequestAnimationFrame || 
            global.mozRequestAnimationFrame    || 
            global.oRequestAnimationFrame      || 
            global.msRequestAnimationFrame     || 
            function( callback ){
              global.setTimeout(callback, 1000 / 60);
            };
  })();

  // Cancels an event to stop propogation. Use this to swallow events in listeners.
  Awe.cancelEvent = function(e) {
    if (e == null) {
      e = global.event;
    }
  
    if (!e) {
      return;
    }
  
    if (!global.attachEvent) {

      if (e.stopPropagation) {
        e.stopPropagation();
      }
      e.preventDefault();    
      return false
    }
    
    e.cancelBubble = true;
    e.returnValue = false;
    
    return false;
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

  // Allow the script URL to override the namespace, naming the library Monkey instead of Awe etc
  var scripts = document.getElementsByTagName('script');
  var scriptUrl = scripts && scripts.length && scripts[scripts.length - 1].src;
  var overrideNamespace = scriptUrl && Awe.getQueryParam("namespace", scriptUrl);

  global[overrideNamespace || namespace] = Awe;

})(this, document)
