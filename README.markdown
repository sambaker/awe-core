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

Installing
----------

Copy the awe-*.js files to you project's javascript directory.

Currently, awe-ui depends on the *x* library from cross-browser.com. 
    
AWE and Rails Apps
------------------

There is a nifty gem that will make it easy to install AWE into the Rails 3.1 asset pipeline and keep it up to date. See https://github.com/shyam-habarakada/awe-rails

How to document
---------------

When adding Javascript files to the library, add those filenames to doc/index.html and document the functionality you add using Wiki Creole formatting
(http://www.wikicreole.org/).

Load doc/index.html into a browser to test the formatting of the docs.

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
    Awe.Color � example, color = Awe.Color("#f8f8f8")
