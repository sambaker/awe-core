/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */

(function(Awe, global, document, undefined) {

  // Awe.env
  // ---------------------------------------------------------------------
  //
  // An object describing the current environment
  //
  // ### fields
  // `inputTouch` : true if the current environment is a touch input device
  // `inputMouse` : true if the current environment is a mouse input device
  // `eventDragStart` : the event name used for a drag start, for example mousedown or touchstart
  // `eventDragMove` : the event name for drag move events
  // `eventDragEnd` : the event name for drag end events
  // `eventClick` : the event name for click events
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
  /* TODO: add Android transform name */

  // Awe.addEventListener( element, eventName, callback, doCapture )
  // ---------------------------------------------------------------
  //
  // Add event handler to element using attachEvent for IE7 and IE8
  //
  // ### params
  // `element` - the DOM node to add handler to
  // `eventName` - the event type to handle
  // `callback` - the event sink
  // `doCapture` - boolean for event capture
  // 
  // ### returns
  // void
  Awe.addEventListener = function( element, eventName, callback, doCapture ) {
    doCapture = doCapture || false;
    
    if (element.addEventListener) {
      element.addEventListener( eventName, callback, doCapture );
      return;
    }
    
    element.attachEvent && element.attachEvent( "on" + eventName, callback );
  }

  // Awe.removeEventListener( element, eventName, callback, doCapture )
  // ------------------------------------------------------------------
  //
  // Remove an event handler that was previously and use detachEvent for IE7 and IE8
  //
  // ### params
  // `element` - the DOM node to add handler to
  // `eventName` - the event type to handle
  // `callback` - the event sink
  // `doCapture` - boolean for event capture
  // 
  // ### returns
  // void
  // 
  // ### notes
  // The parameters must exactly match the previously added event handler
  Awe.removeEventListener = function( element, eventName, callback, doCapture ) {
    doCapture = doCapture || false;
    
    if (element.removeEventListener) {
      element.removeEventListener( eventName, callback, doCapture );
      return;
    }
    
    element.detachEvent && element.detachEvent( "on" + eventName, callback );
  }
  
  // Awe.createElement( type, [parent], config )
  //
  // Create an HTML element of the given type and attach to the given parent if not null.
  // The config object can contain styles, attrs, a class and a background sprite to apply
  // to the element
  //
  // ### params
  // `type` - the element type to create for example `DIV` or `INPUT`
  // `parent` - null or optional parent node to attach new element to
  // `config` - object specifying styles and attributes for new element 
  //
  // ### returns
  // object - the newly created element 
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

  // Awe.injectJS( jsUrl, jsOnload, [addRandomParam] )
  // ------------------------------------------------------------------
  //
  // gets a JSONP callback from a web service
  //
  // ### params
  // `jsUrl` - the url of the resource
  // `jsOnload` - callback function that receives the returned data
  // `addRandomParam` - pass true to add unique param
  // 
  // ### returns
  // void
  // 
  // ### notes
  // Depending on the scenario you may need the addRandomParam
  // to add a unique parameter to the URL so the request
  // is not cached.  However, some APIs will not allow non-API
  // params and the call will fail.
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

  // var requestAnimationFrameShim
  // ------------------------------------------------------------------
  //
  // variable that gives the native animation synchronization function or a
  // simulation of it on browsers like Safari that do not have it
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
  
  // Awe.addAnimationCallback( callback, [config] )
  // ----------------------------------------------------------------
  //
  // Begins an animation loop, calling the supplied callback each frame until the callback returns true to signify completion or
  // until `Awe.cancelAnimationCallback(handle)` is called to cancel the animation. This method will use the browser's
  // `requestAnimationFrame` function if possible which is optimized for rendering and animation callbacks and generally runs
  // at 60fps if practical.
  //
  // ### params
  // `callback` - the function to call at each animation frame.  Its parameters will be `callback(deltaTime, totalTime, iteration)`
  // `config.interval` - callback interval in seconds.  Don't use this unless you need a specific interval instead of optimized interval
  // `config.onCancel` - function to call when animation is cancelled
  // `config.onEnd` - function to call when animation has ended
  //
  // ### returns
  // a handle that can be passed to `Awe.cancelAnimationCallback(handle)`
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
  
  // Awe.cancelAnimationCallback( handle )
  // -----------------------------------------------------------------
  //
  // Cancels an animation requested with `Awe.addAnimationCallback`
  //
  // ### params
  // `handle` - the animation handle returned by the previously
  //  requested `Awe.addAnimationCallback`
  Awe.cancelAnimationCallback = function(handle) {
    handle && handle.cancel();
  }

  // Awe.cancelEvent( e )
  // ------------------------------------------------------------------
  //
  // Cancel an event
  //
  // ### params
  // `e` - the event to be cancelled
  // 
  // ### returns
  // void
  // 
  // ### notes
  // Used for example, to suppress disallowed keystrokes
  Awe.cancelEvent = function(e) { 
    e = e || global.event;

    if (!e) return;
  
    e.stopPropagation && e.stopPropagation();
    e.preventDefault && e.preventDefault();
    
    e.cancelBubble = true;
    e.returnValue = false;   
    return false;
  }

  // Awe.hasClass( ele, cls )
  // ------------------------------------------------------------------
  //
  // Query a DOM node class to see if it has a given class name
  //
  // ### params
  // `ele` - DOM element to query
  // `cls` - case-sensitive class name to be queried
  // 
  // ### returns
  // `true` if 'ele.class' contains the class name
  Awe.hasClass = function(ele,cls)
  {
    patt = new RegExp( "\\b" + cls + "\\b", "g" );
    return ele.className.match(patt);
  }
  
  // Awe.removeClass( ele, cls )
  // ------------------------------------------------------------------
  //
  // Remove a class name from an element's class property
  //
  // ### params
  // `ele` - DOM element to query
  // `cls` - case-sensitive class name to be removed
  // 
  // ### returns
  // void
  Awe.removeClass = function(ele,cls)
  {
    patt = new RegExp( "\\b" + cls + "\\b", "g" );
    ele.className = Awe.trim(ele.className.replace(patt,""));
  }
  
  // Awe.addClass( ele, cls )
  // ------------------------------------------------------------------
  //
  // Add a unique class name to an element's class property
  //
  // ### params
  // `ele` - DOM element to query
  // `cls` - case-sensitive class name to be removed
  // 
  // ### returns
  // void
  //
  // ### notes
  // Ensures that the added class name occurs only once
  Awe.addClass = function(ele,cls)
  {
    removeClass(ele,cls);
    ele.className += " " + cls;
  }

  // Awe.absX( ele )
  // ------------------------------------------------------------------
  //
  // Get the absolute X position of a domNode relative to the upper-left
  // corner of the document and account for scrolling
  //
  // ### params
  // `ele` - DOM element to query
  // 
  // ### returns
  // integer specifying pixel offset
  //
  // ### notes
  // Accessing layout properties is a relatively slow operation
  Awe.absX = function(domNode) {
    var retVal = 0;
    
    while(domNode) {
      retVal += domNode.offsetLeft;
      retVal -= domNode.scrollLeft;
      domNode = domNode.offsetParent;
    }
    
    return retVal;
  }
 
  // Awe.absY( ele )
  // ------------------------------------------------------------------
  //
  // Get the absolute Y position of a domNode relative to the upper-left
  // corner of the document and account for scrolling
  //
  // ### params
  // `ele` - DOM element to query
  // 
  // ### returns
  // integer specifying pixel offset
  //
  // ### notes
  // Accessing layout properties is a relatively slow operation
  Awe.absY = function(domNode) {
    var retVal = 0;
    
    while(domNode) {
      retVal += domNode.offsetTop;
      retVal -= domNode.scrollTop;
      domNode = domNode.offsetParent;
    }
    
    return retVal;
  }
  
  // Awe.relX( ele, [x] )
  // ------------------------------------------------------------------
  //
  // Get or set the relative X position of a domNode
  //
  // ### params
  // `ele` - DOM element to query
  // `x` - optional float or integer to set
  //
  // ### returns
  // get - integer specifying relative pixel offset
  // set - returns x value
  //
  // ### notes
  // Set is a fast operation.  Get is a relatively slow operation
  // but gives a correct value, regardless of units.  If the
  // style units are in `%` for example, get will give 
  // you the resulting integer pixel offset.  Get will give
  // you the offset even if there is no style property set.
  Awe.relX = function(domNode,x) {
    if (x !== undefined) { 
      domNode.style.left = x + "px";
      return x;
    }
    
    return domNode.offsetLeft;
  }
  
  // Awe.relY( ele, [y] )
  // ------------------------------------------------------------------
  //
  // Get or set the relative Y position of a domNode
  //
  // ### params
  // `ele` - DOM element to query
  // `y` - optional float or integer to set
  //
  // ### returns
  // get - integer specifying relative pixel offset
  // set - returns y value
  //
  // ### notes
  // Set is a fast operation.  Get is a relatively slow operation
  // but gives a correct value, regardless of units.  If the
  // style units are in `%` for example, get will give 
  // you the resulting integer pixel offset.  Get will give
  // you the offset even if there is no style property set.
  Awe.relY = function(domNode,y) {
    if (y !== undefined) {
      domNode.style.top = y + "px";
      return y;
    }
    
    return domNode.offsetTop;
  }
  
  // Awe.relXY( ele, [x, y] )
  // ------------------------------------------------------------------
  //
  // Get or set the relative X and Y position of a domNode
  //
  // ### params
  // `ele` - DOM element to query
  // `x` - optional float or integer to set
  // `y` - optional float or integer to set
  //
  // ### returns
  // get - object with properties x and y specifying relative pixel offset
  // set - object with x,y parameters
  //
  // ### notes
  // Set is a fast operation.  Get is a relatively slow operation
  // but gives a correct value, regardless of units.  If the
  // style units are in `%` for example, get will give 
  // you the resulting integer pixel offset
  Awe.relXY = function(domNode,x,y) {
    if (x !== undefined && y !== undefined) {
      domNode.style.left = x + "px";
      domNode.style.top = y + "px";
      return { x: x, y: y }
    }
    
    return { x: domNode.offsetLeft, y: domNode.offsetTop }
  }
  
  // Awe.width( ele, [w] )
  // ------------------------------------------------------------------
  //
  // Get or set the width of a domNode
  //
  // ### params
  // `ele` - DOM element to query
  // `w` - optional float or integer to set
  //
  // ### returns
  // get - integer pixel width of the element
  // set - width parameter
  //
  // ### notes
  // Set is a fast operation.  Get is a relatively slow operation
  // but gives a correct value, regardless of units.  If the
  // style units are in `%` for example, get will give 
  // you the resulting integer
  Awe.width = function(domNode,w) {
    if (w !== undefined) {
      domNode.style.width = w + "px";
      return w;
    }
    
    return domNode.offsetWidth;
  }
  
  // Awe.height( ele, [h] )
  // ------------------------------------------------------------------
  //
  // Get or set the height of a domNode
  //
  // ### params
  // `ele` - DOM element to query
  // `h` - optional float or integer to set
  //
  // ### returns
  // get - integer pixel height of the element
  // set - width parameter
  //
  // ### notes
  // Set is a fast operation.  Get is a relatively slow operation
  // but gives a correct value, regardless of units.  If the
  // style units are in `%` for example, get will give 
  // you the resulting integer
  Awe.height = function(domNode,h) {
    if (h !== undefined) {
      domNode.style.height = h + "px";
      return h;
    }
    
    return domNode.offsetHeight;
  }
  
  
})(Awe, this, document);

