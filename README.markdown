AWE (Artefact Web Extensions) Core library
==========================================

Overview
--------

The purpose of this library is to share the Javascript functionality that is common to most of Artefact's web app projects in a single repo.

The initial feature set will be anything that is in common use and duplicated between our projects and over time more features will be added.

We will not be supporting all browsers. The expected supported browser set is:

* IE7+
* Safari 4+
* Chrome
* Opera
* Mobile Safari

There are no external dependencies besides having a sufficiently compliant browser.

Including as a submodule
------------------------

If you have a git project and you want to include this repository as a submodule run these commands:

    git submodule add https://github.com/sambaker/awe-core.git [destination folder]
    git submodule init
    git submodule update

Preliminary documentation
-------------------------

    // Helper functions
    Awe.isArray(object)
    Awe.isArrayOrString(object)
    Awe.isFunction(object)
    Awe.isType(object, type)
    Awe.getQueryParam(name, [url = window.location.href])
    Awe.forEach(array, callback, [thisArg = window])
    Awe.cancelEvent(event)
    Awe.objectToString(obj) - convert an object into a readable string for logging
    Awe.addAnimationCallback(callback, [intervalMs])
      - returns a handle that can be passed to Awe.cancelAnimationCallback(handle)
      - uses requestAnimationFrame (or setInterval if the interval parameter is supplied) to call the supplied callback continuously
        until the callback returns true to signal its completion. The callback receives two parameters: the time elapsed since it was last called and
        the total time elapsed (both in millseconds). Example use is:
              
        Awe.addAnimationCallback(function(delta, elapsed) {
          console.log("Delta",delta,"Elapsed",elapsed);
          if (elapsed > 10) {
            return true;
          }
        });
    Awe.cancelAnimationCallback(handle) - cancels an animation started previously
    
    Awe.getGuid() - gets a session-unique string identifier
    Awe.getGuidNumeric() - gets a session-unique numeric identifier > 0
    
    // Math
    Awe.clamp(num, min, max)
    Awe.acosSafe(num) - doesn't throw an exception if num is out of the range -1 to 1 but clamps num to that range instead
    
    // Environment helpers (sample contents)
    Awe.env = {
    	inputTouch: true,
    	inputMouse: false,
    	eventDragStart: "touchstart",
    	eventDragMove: "touchmove",
    	eventDragEnd: "touchend",
    	eventClick: "touchend"
    }
    
    // DOM helpers
    Awe.createElement(type, parent, config)
    Awe.enableDrag(element, config)
    Awe.disableDrag(element)
    
    // Classes
    Awe.Color Ð example, color = Awe.Color("#f8f8f8")
