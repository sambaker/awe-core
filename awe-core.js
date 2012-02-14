/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(global, document, namespace, undefined) {
  namespace = namespace || "Awe";

  // Create and export Awe
  var Awe = {}

  // Helpers
  Awe.isArray = function(o) {
    return o && o.constructor == Array.prototype.constructor;
  }

  Awe.isArrayOrString = function(o) {
    return o && o.constructor == Array.prototype.constructor || o.constructor == String.prototype.constructor;
  }

  Awe.isType = function(o, type) {
    return o && o.constructor == type.prototype.constructor;
  }
  
  Awe.isFunction = function(o) {
    return o && o.constructor == Function.prototype.constructor;
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

  // Return -1 if n < 0 or 1 otherwise
  Awe.sign = function(n) {
    return (n < 0) ? -1 : 1;
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
  
  /* Create an HTML element of the given type and attach to the given parent if not null.
   * The config object can contain styles, attrs, a class and a background sprite to apply
   * to the element
   */
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

  
  /*
   * method: Awe.enableDrag
   * 
   * purpose: enable drag on a DOM element
   *
   */  
  Awe.enableDrag = function(el, config) {
  
    config = config || {};
    var filters = config.filters;
    var updater = config.updater || new Awe.DragUpdaterTopLeft();
    
    // Convert a single drag filter
    if (filters) {
      if (!Awe.isArray(filters)) {
        filters = [filters];
      }
    } else {
      filters = [];
    }
  
    // Drag state
    var touch = {};

    function getClientPos(evt)
    {
      var p;
      if (Awe.env.inputTouch)
      {
        // TODO: Use correct touch (lookup by touch start ID instead of always using index 0)
        p = { x: evt.changedTouches[0].clientX, y: evt.changedTouches[0].clientY };
      } else {
        p = { x: evt.clientX, y: evt.clientY };
      }
      p.x += touch.anchor.x;
      p.y += touch.anchor.y;
      return p
    }
  
    function processDrag(clientPos, pos, start) {
      if (touch.now) {
        touch.maxDistanceSquared = Math.max(touch.maxDistanceSquared, (touch.now.x - touch.start.x) * (touch.now.x - touch.start.x) + (touch.now.y - touch.start.y) * (touch.now.y - touch.start.y));
      } else {
        touch.maxDistanceSquared = 0;
      }
  
      // Create the new drag state
      var newDrag = {
        clientPos: { x: clientPos.x, y: clientPos.y },
        pos: { x: pos.x, y: pos.y },
        dragTime: (Date.now() - touch.startTime) * 0.001,
        maxDistanceSquared: touch.maxDistanceSquared
      }
      if (touch.lastDrag) {
        newDrag.clientDelta = {
          x: newDrag.clientPos.x - touch.lastDrag.clientPos.x,
          y: newDrag.clientPos.y - touch.lastDrag.clientPos.y
        }
        newDrag.delta = {
          x: newDrag.pos.x - touch.lastDrag.pos.x,
          y: newDrag.pos.y - touch.lastDrag.pos.y
        }
      } else {
        newDrag.clientDelta = { x: 0, y: 0 };
        newDrag.delta = { x: 0, y: 0 };
      }
      
      // Copy current drag state to last
      touch.lastDrag = {
        clientPos: { x: newDrag.clientPos.x, y: newDrag.clientPos.y },
        pos: { x: newDrag.pos.x, y: newDrag.pos.y },
        delta: { x: newDrag.delta.x, y: newDrag.delta.y },
        clientDelta: { x: newDrag.clientDelta.x, y: newDrag.clientDelta.y },
        dragTime: newDrag.dragTime,
        maxDistanceSquared: newDrag.maxDistanceSquared
      }
      
      return newDrag;
    }
    
    function updateDrag() {
      return touch.lastDrag && {
        clientPos: touch.lastDrag.clientPos,
        pos: touch.lastDrag.pos,
        clientDelta: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        dragTime: (Date.now() - touch.startTime) * 0.001,
        maxDistanceSquared: touch.lastDrag.maxDistanceSquared
      }
    }
    
    // Per-frame updates
    function dragUpdate(evt) {
      var clientPos = touch.now || touch.start;
      clientPos = { x: clientPos.x, y: clientPos.y };
      var pos;
      Awe.forEach(filters, function(filter) {
        if (!pos && filter.animating) {
          pos = filter.animate();
        }
      });
      if (pos) {
        updater.move(el, pos);
        config.onChange(processDrag(clientPos, pos));
      }
      if (config.onUpdate) {
        var drag = updateDrag();
        drag && config.onUpdate(drag);
      }
    }
      
    function dragMove(evt) {
      Awe.cancelEvent(evt);
      touch.now = getClientPos(evt);
      var pos = applyFilters(touch.now);
      var drag = processDrag(touch.now, pos);
      if (config.onChange) {
        config.onChange(drag);
      }
    }
    
    function dragEnd(evt) {
      if (!touch.dragging) {
        return;
      }
      evt && Awe.cancelEvent(evt);
      xRemoveEventListener(Awe.env.inputTouch ? el : document, Awe.env.eventDragMove, dragMove);
      xRemoveEventListener(Awe.env.inputTouch ? el : document, Awe.env.eventDragEnd, dragEnd);
      // TODO Check for animating filters before cancelling event bits
      Awe.forEach(filters, function(filter) {
        if (filter.end) {
          filter.end();
        }
      });
      if (updater.end) {
        updater.end();
      }
      if (config.onRelease && evt) {
        var pos = getClientPos(evt);
        config.onRelease(processDrag(pos, pos));
      }
      if (touch.updateIntervalId) {
        clearInterval(touch.updateIntervalId);
        touch.updateIntervalId = null;
      }
    }
    
    function applyFilters(pos) {
      Awe.forEach(filters, function(filter) {
        pos = filter.move(el, pos) || pos;
      });
      return pos;
    }
    
    function dragStart(evt) {
      Awe.cancelEvent(evt);
      touch.dragging = true;
      touch.anchor = { x: 0, y: 0 }
      // Calculate the position without the anchor
      touch.now = getClientPos(evt);
      // Calculate the anchor position
      if (config.anchor) {
        touch.anchor = config.anchor.getAnchor(el, touch.now);
        // Get the client position again, taking the anchor into account
        touch.now = getClientPos(evt);
      }
      touch.lastDrag = null;
      touch.start = getClientPos(evt);
      touch.startTime = Date.now();
      touch.maxDistanceSquared = 0;
      
      var pos = touch.start;
      Awe.forEach(filters, function(filter) {
        pos = filter.start(el, pos) || pos;
      });
      if (updater.start) {
        updater.start(el, pos);
      }
  
      var pos = applyFilters(touch.now);
      
      var drag = processDrag(touch.now, pos);
      xAddEventListener(Awe.env.inputTouch ? el : document, Awe.env.eventDragMove, dragMove);
      xAddEventListener(Awe.env.inputTouch ? el : document, Awe.env.eventDragEnd, dragEnd);
      if (config.onUpdate) {
        touch.updateIntervalId = setInterval(dragUpdate, config.dragUpdateInterval || 33);
      }
    }
    
    xAddEventListener(el, Awe.env.eventDragStart, dragStart);
    
    el._disableDrag = function() {
      xRemoveEventListener(el, Awe.env.eventDragStart, dragStart);
      // Make sure any in-progress drags have their listeners removed
      dragEnd();
    }
  }
  
  /*
   * method: Awe.disableDrag
   * 
   * purpose: disable drag on a DOM element
   *
   */
  Awe.disableDrag = function(el) {
    if (el._disableDrag) {
      el._disableDrag();
      el._disableDrag = null;
    }
  }
  
  Awe.DragAnchorTopLeft = function() {
    var _i = this;
    
    _i.getAnchor = function(el, pos) {
      return { x: xLeft(el) - pos.x, y: xTop(el) - pos.y }
    }
  }
  
  Awe.DragFilterLimitAxes = function(minX, maxX, minY, maxY) {
    var _i = this;
    
    _i.start = function(el, pos) {
    }
    
    _i.move = function(el, pos) {
      var x = Awe.clamp(pos.x, minX, maxX);
      var y = Awe.clamp(pos.y, minY, maxY);
      return { x: x, y: y };
    }
  }
  
  // To be continued...
  /*
  Awe.DragFilterMomentum = function() {
    var _i = this;
    
    _i.start = function(el, pos) {
    }
    
    _i.move = function(el, pos) {
      _i.animating = true;
      return { x: x, y: y };
    }
    
    _i.animate = function() {
      // Apply velocity and acceleration
      if (vel == 0) {
        _i.animating = false;
    }
  }
  */
  
  Awe.DragUpdaterTopLeft = function() {
    var _i = this;
    
    _i.start = function(el, pos) {
    }
    
    _i.move = function(el, pos) {
      var left = pos.x;
      var top = pos.y;
      el.style.left = left + "px";
      el.style.top = top + "px";
      
      return pos;
    }
  }

  /*
   * method: Awe.objectToString
   * 
   * purpose: convert an arbitrary object to string representation for logging
   *
   */
  Awe.objectToString = function(o) {
    // Do something more interesting in the future?
    return JSON.stringify(o);
  }

  var requestAnimationFrameShim = (function() {
    return  global.requestAnimationFrame       ||
            global.webkitRequestAnimationFrame || 
            global.mozRequestAnimationFrame    || 
            global.oRequestAnimationFrame      || 
            global.msRequestAnimationFrame     || 
            function( callback ){
              global.setTimeout(callback, 1000 / 60);
            };
  })();
  
  // Specify a callback
  Awe.addAnimationCallback = function(callback, interval) {
    var startTime = Date.now();
    var lastTime = startTime;
    var handle = {};
    var cancelled = false;
    
    if (interval === undefined) {
      requestAnimationFrameShim(function wrapper() {
        time = Date.now();
        if (!cancelled && !callback(time - lastTime, time - startTime)) {
          requestAnimationFrameShim(wrapper);
        }
        lastTime = time;
      })
      handle.cancel = function() {
        cancelled = true;
      }
    } else {
      var intervalId = setInterval(function () {
        time = Date.now();
        if (callback(time - lastTime, time - startTime)) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
        lastTime = time;
      }, interval);
      handle.cancel = function() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }
    
    return handle;
  }
  
  Awe.cancelAnimationCallback = function(handle) {
    handle.cancel();
  }

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

  // Allow the script URL to override the namespace, naming the library Monkey instead of Awe etc
  // NOTE: This is not likely to ever be necessary, but it's an interesting theoretical exercise
  var scripts = document.getElementsByTagName('script');
  var scriptUrl = scripts && scripts.length && scripts[scripts.length - 1].src;
  var overrideNamespace = scriptUrl && Awe.getQueryParam("namespace", scriptUrl);

  global[overrideNamespace || namespace] = Awe;

})(this, document)
