/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  // Stack of saved document.onclick handlers
  var _savedDocumentOnClickCallbacks = [];
  
  /* 
   * purpose: Helper function to ensure that we have an element. Allows called 
   * of ui* functions to pass in either an HTML element object or an id string, 
   * in which case we will look it up by id.
   */
  var ensureElement = function(element) {
    if(typeof(element) == "string") {
      return document.getElementById(element);
    } else {
      return element;
    }
  }
  
  /* 
   * method: Awe.uiPopup
   *
   * purpose: Attach show/hide popup behavior to an element.
   *
   */
  Awe.uiPopup = function(element) {
  
    if ( !(this instanceof Awe.uiPopup) ) return new Awe.uiPopup(element);
      
    var _i = this;
    
    element = ensureElement(element);
    
    if(!element) throw "cannot find element with given id";
    
    _i.show = function(dismissedCallback) {
      if(element.style.visibility != "visible") {
        element.style.visibility = "visible";
        _savedDocumentOnClickCallbacks.push(document.onclick);
        document.onclick = (function(e) {
          e = e || window.event;
          if (!xHasPoint(element, e.x, e.y)) { // TODO Handle x dependency
            _i.hide(true);
            if(dismissedCallback) dismissedCallback();
          }
          return;
        });
        // if call context is a click handler
        if(window.event && window.event.type == "click") Awe.cancelEvent(window.event); 
      }
    }
    
    _i.hide = function(bubbleCurrentEvent) {
      if(element.style.visibility != "hidden") {
        element.style.visibility = "hidden";
        document.onclick = _savedDocumentOnClickCallbacks.pop();
      }
      if(!bubbleCurrentEvent && window.event && window.event.type == "click") Awe.cancelEvent(window.event);
      return;
    }    
  }
    
})(Awe, this, document)
