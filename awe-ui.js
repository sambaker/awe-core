/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  // Stack of saved document.onclick handlers
  var _popupStack = [];
  
  /* 
   * purpose: Helper function to ensure that we have an element. Allows called 
   * of ui* functions to pass in either an HTML element object or an id string, 
   * in which case we will look it up by id.
   */
  var ensureElement = function(element) {
    if(typeof(element) == "string") {
      var el = document.getElementById(element);
      if(!el) throw "cannot find element with id '" + element + "'";
      return el;
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

    element = ensureElement(element);
      
    var _i = this;
            
    _i.show = function(dismissedCallback, parentPopup) {
      
      parentPopup = ensureElement(parentPopup);
      
      var top = _popupStack[_popupStack.length-1];
    
      while(top && top.element != parentPopup) {
        _TR("rolling back pop-ups");
        top.element.style.visibility = "hidden";
        if(top.dismissedCallback) top.dismissedCallback();
        document.onclick = top.previousOnClickCb;
        top = _popupStack.pop();
      }
      
      if(element.style.visibility != "visible") {
        element.style.visibility = "visible";
      
        _popupStack.push({
          element:element, 
          parentPopup:parentPopup,
          dismissedCallback:dismissedCallback,
          previousOnClickCb:document.onclick
        });
      
        document.onclick = (function(e) {
          e = e || window.event;
          if (!xHasPoint(element, e.x, e.y)) {
            _i.hide(true);
            if(dismissedCallback) dismissedCallback();
          }
          return;
        });
      
        if(window.event && window.event.type == "click") Awe.cancelEvent(window.event); 
      }
    }
    
    _i.hide = function(bubbleCurrentEvent) {
    
      if(element.style.visibility != "hidden") {
        element.style.visibility = "hidden";
        document.onclick = _popupStack.pop().previousOnClickCb;
      }
    
      if(!bubbleCurrentEvent && window.event && window.event.type == "click") Awe.cancelEvent(window.event);
      return;
    }    
  }
    
})(Awe, this, document)
