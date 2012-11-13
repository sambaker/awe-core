/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */

// IE8
if(!Date.now) { Date.now = function() { return new Date().getTime(); } }

// IE
if(typeof(console) == "undefined") { console = {}; } 
if(typeof(console.log) == "undefined") { console.log = function(str) { }; } 
if(typeof(console.trace) == "undefined") { console.trace = function() { }; } 

// window.requestAnimationFrame / cancelAnimationFrame
// Based on http://bit.ly/QpI1yI (Paul Irish, et. al.)
(function() {
  if(typeof(window.requestAnimationFrame) == "undefined") {
    var lastTime = 0;
    var vendors = ['webkit', 'ms', 'moz', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
    }
  }
}());