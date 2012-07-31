/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */

(function(Awe, global, document, undefined) {

  // ** {{{ Awe.env }}} **
  //
  // An object describing the current environment
  //
  // |=field|=description|
  // |{{{inputTouch}}}|{{{true}}} if the current environment is a touch input device|
  // |{{{inputMouse}}}|{{{true}}} if the current environment is a mouse input device, opposite of {{{inputTouch}}}|  
  // |eventDragStart|The event name for drag start events on this platform, for example mousedown or touchstart|
  // |eventDragMove|The event name for drag move events on this platform|
  // |eventDragEnd|The event name for drag move events on this platform|
  // |eventClick|The event name for click events on this platform|
  Awe.env = {};
  Awe.env.inputTouch = "ontouchstart" in global;
  Awe.env.inputMouse = !Awe.env.inputTouch;
  
  Awe.env.eventDragStart = Awe.env.inputTouch ? "touchstart" : "mousedown";
  Awe.env.eventDragMove = Awe.env.inputTouch ? "touchmove" : "mousemove";
  Awe.env.eventDragEnd = Awe.env.inputTouch ? "touchend" : "mouseup";
  Awe.env.eventClick = "click";

  /* Create an HTML element of the given type and attach to the given parent if not null.
   * The config object can contain styles, attrs, a class and a background sprite to apply
   * to the element
   */
  Awe.createElement = function(type, parent, config) {
    var k;
    var el = document.createElement(type);
    config = config || {};
    if (config.id) {
      el.id = config.id;
    }
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
  
  // ** {{{ Awe.addAnimationCallback(callback, [config]) }}} **
  //
  // Begins an animation loop, calling the supplied callback each frame until the callback returns true to signify completion or
  // until {{{Awe.cancelAnimationCallback(handle)}}} is called to cancel the animation. This method will use the browser's
  // {{{requestAnimationFrame}}} function if possible which is optimized for rendering and animation callbacks and generally runs
  // at 60fps if practical.
  //
  // |=param|=description|
  // |{{{callback}}}|a function to call on an interval. Its parameters will be {{{callback(deltaTime, totalTime, iteration)}}}|
  // |{{{config.interval}}}|callback interval in seconds. Don't use this unless you need a specific interval since modern browsers will pick the optimal animation callback interval by default|
  // |{{{config.onCancel}}}|function to call when this animation is cancelled|
  // |{{{config.onEnd}}}|function to call when this animation has ended|
  //
  // **Returns** a handle that can be passed to {{{Awe.cancelAnimationCallback(handle)}}}
  Awe.addAnimationCallback = function(callback, config) {
    var config = config || {};
    var startTime = Date.now();
    var lastTime = startTime;
    var handle = {};
    var cancelled = false;
    var iteration = 0;
    
    if (config.interval === undefined) {
      requestAnimationFrameShim(function wrapper() {
        time = Date.now();
        if (!cancelled && !callback(time - lastTime, time - startTime, iteration++)) {
          requestAnimationFrameShim(wrapper);
        } else {
          if (cancelled) {
            config.onCancel && config.onCancel();
          } else {
            config.onEnd && config.onEnd();
          }
        }
        lastTime = time;
      })
      handle.cancel = function() {
        cancelled = true;
      }
    } else {
      var intervalId = setInterval(function () {
        time = Date.now();
        if (callback(time - lastTime, time - startTime, iteration++)) {
          config.onEnd && config.onEnd();
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
        lastTime = time;
      }, config.interval);
      handle.cancel = function() {
        if (intervalId) {
          config.onCancel && config.onCancel();
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }
    
    return handle;
  }
  
  // ** {{{ Awe.cancelAnimationCallback(handle) }}} **
  //
  // Cancels an animation requested with {{{Awe.addAnimationCallback}}}.
  //
  // |=param|=description|
  // |{{{handle}}}|an animation handle returned by {{{Awe.addAnimationCallback}}}|
  Awe.cancelAnimationCallback = function(handle) {
    handle && handle.cancel();
  }

  // Cancels an event to stop propagation. Use this to swallow events in listeners.
  Awe.cancelEvent = function(e) {
  
    e = e || global.event;

    if (!e) return;
  
    e.stopPropagation && e.stopPropagation();
    e.preventDefault && e.preventDefault();
    
    e.cancelBubble = true;
    e.returnValue = false;   
    return false;
  }

  // gets the absolute X pixel offset from upper-left of document
  Awe.absX = function(domNode) {
    var retVal = 0;
    
    while(domNode) {
      retVal += domNode.offsetLeft;
      retVal -= domNode.scrollLeft;
      domNode = domNode.offsetParent;
    }
    
    return retVal;
  }
 
  // gets the absolute Y pixel offset from upper-left of document 
  Awe.absY = function(domNode) {
    var retVal = 0;
    
    while(domNode) {
      retVal += domNode.offsetTop;
      retVal -= domNode.scrollTop;
      domNode = domNode.offsetParent;
    }
    
    return retVal;
  }
  
  // gets/sets the relative X pixel offset from parent
  Awe.relX = function(domNode,x) {
    if (x) { 
      domNode.floatX = x;
      domNode.style.left = x + "px";
      return x;
    }
    
    if (domNode.floatX) {
      return domNode.floatX;
    }
    
    return domNode.offsetLeft;
  }
  
  // gets/sets the relative Y pixel offset from parent
  Awe.relY = function(domNode,y) {
    if (y) {
      domNode.floatY = y;
      domNode.style.top = y + "px";
      return y;
    }
    
    if (domNode.floatY) {
      return domNode.floatY;
    }
    
    return domNode.offsetTop;
  }
  
  
})(Awe, this, document);
