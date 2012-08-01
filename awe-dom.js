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

  Awe.env.transformPropertyName = "";
  if (navigator.userAgent.match(/MSIE 9|MSIE 10/)) { Awe.env.transformPropertyName = "msTransform"; }
  if (navigator.userAgent.match(/Safari|iPad|iPhone|iPod|Chrome/)) { Awe.env.transformPropertyName = "WebkitTransform"; }
  if (navigator.userAgent.match(/Opera/)) { Awe.env.transformPropertyName = "OTransform"; }
  if (navigator.userAgent.match(/Firefox/)) { Awe.env.transformPropertyName = "MozTransform"; }
  // TODO: add Android transform name
  
  Awe.addEventListener = function( element, eventName, callback, doCapture ) {
    doCapture = doCapture || false;
    
    if (element.addEventListener) {
      element.addEventListener( eventName, callback, doCapture );
      return;
    }
    
    element.attachEvent && element.attachEvent( "on" + eventName, callback );
  }

  Awe.removeEventListener = function( element, eventName, callback, doCapture ) {
    doCapture = doCapture || false;
    
    if (element.removeEventListener) {
      element.removeEventListener( eventName, callback, doCapture );
      return;
    }
    
    element.detachEvent && element.detachEvent( "on" + eventName, callback );
  }
  
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

  Awe.injectJS = function(jsUrl, jsOnload, addRandomParam) {
      var scriptTag = null;

      var callbackName = "jsonp" + Awe.getGuidNumeric();

      _headTag = window._headTag || document.getElementsByTagName("HEAD")[0];

      window[callbackName] = function(data) {
          if (jsOnload)
          {
             jsOnload(data);
          }
          _headTag.removeChild(scriptTag);
          window[callbackName] = null;
      }

      if (jsUrl.indexOf('?') < 0) {
          jsUrl += '?';
      } else {
          jsUrl += '&';
      }
      jsUrl += "callback="+callbackName;

      scriptTag = document.createElement("SCRIPT");
      scriptTag.type = 'text/javascript';

      if ( addRandomParam )
      {
          jsUrl += "&randomParam=" + Math.round(Math.random() * 100000);
      }

      scriptTag.src = jsUrl;
      _headTag.appendChild(scriptTag);
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

  // returns true if element has a whole word className of cls
  Awe.hasClass = function(ele,cls)
  {
    patt = new RegExp( "\\b" + cls + "\\b", "g" );
    return ele.className.match(patt);
  }
  
  // removes a whole word className from element's class string
  Awe.removeClass = function(ele,cls)
  {
    patt = new RegExp( "\\b" + cls + "\\b", "g" );
    ele.className = trim(ele.className.replace(patt,""));
  }
  
  // adds a className to an element's class string without redundancy
  Awe.addClass = function(ele,cls)
  {
    removeClass(ele,cls);
    ele.className += " " + cls;
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
  
  // gets or sets the relative X pixel offset from parent
  Awe.relX = function(domNode,x) {
    if (x !== undefined) { 
      domNode.floatX = x;
      domNode.style.left = x + "px";
      return x;
    }
    
    if (domNode.floatX !== undefined) {
      return domNode.floatX;
    }
    
    domNode.floatX = domNode.offsetLeft;
    return domNode.offsetLeft;
  }
  
  // gets or sets the relative Y pixel offset from parent
  Awe.relY = function(domNode,y) {
    if (y !== undefined) {
      domNode.floatY = y;
      domNode.style.top = y + "px";
      return y;
    }
    
    if (domNode.floatY) {
      return domNode.floatY;
    }
    
    domNode.floatY = domNode.offsetTop;
    return domNode.offsetTop;
  }
  
  // gets or sets the relative X and Y pixel offset from parent
  Awe.relXY = function(domNode,x,y) {
    if (x !== undefined && y !== undefined) {
      domNode.style.left = x + "px";
      domNode.style.top = y + "px";
      domNode.floatX = x;
      domNode.floatY = y;
      return { x: x, y: y }
    }
    
    if (domNode.floatX !== undefined && domNode.floatY !== undefined) {
      return { x : domNode.floatX, y : domNode.floatY }
    }
    
    domNode.floatX = domNode.offsetLeft;
    domNode.floatY = domNode.offsetTop;
    return { x: domNode.offsetLeft, y: domNode.offsetTop }
  }
  
  // gets or sets the width of a DOM node
  Awe.width = function(domNode,w) {
    if (w !== undefined) {
      domNode.style.width = w + "px";
      domNode.floatW = w;
      return w;
    }
    
    if (domNode.floatW !== undefined) {
      return domNode.floatW;
    }
    
    domNode.floatW = domNode.offsetWidth;
    return domNode.offsetWidth;
  }
  
  // gets or sets the height of a DOM node
  Awe.height = function(domNode,h) {
    if (h !== undefined) {
      domNode.style.height = h + "px";
      domNode.floatH = h;
      return h;
    }
    
    if (domNode.floatH !== undefined) {
      return domNode.floatH;
    }
    
    domNode.floatH = domNode.offsetHeight;
    return domNode.offsetHeight;
  }
  
  
})(Awe, this, document);

