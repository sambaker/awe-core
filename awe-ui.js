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
   * Attach pop-up behavior to the given element and ensure it is visible. this
   * means that clicking anywhere outside the given element will cause the element
   * to be hidden and dismissedCallback, if one is provided will be invoked.
   *
   * Popups can be nested by specifying a parentPopup.
   *
   * If no parentPopup is provided, this method will cause any and all previously
   * shown popups to be automatically dismissed, and for their respective 
   * dismissedCallbacks be invoked.
   *
   * If current top-most popup is not the parentPopup, the popup stack will be 
   * popped and dismissed until a popup matching the given parent is found or until
   * no more popups are visible.
   */
  Awe.showPopup = function(element, dismissedCallback, parentPopup) {
  
    element = ensureElement(element);
                        
    parentPopup = ensureElement(parentPopup);
    
    var top = (_popupStack.length > 0) ? _popupStack[_popupStack.length-1] : null;
  
    while(top && top.element != parentPopup) {
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
        if (!xHasPoint(element, e.pageX, e.pageY)) {
          Awe.hidePopup(element, true);
        }
        return;
      });
    
      if(window.event && window.event.type == "click") Awe.cancelEvent(window.event); 
    }
  }
  
  /* 
   * method: Awe.hidePopup
   *
   * If element is the current top-most popup, hide it. Otherwise, hide all popups 
   * in the current stack starting from the top upto the element. If element is not
   * in the stack, has the side-effect of dimissing all popups.
   */
  Awe.hidePopup = function(element, dismissing) {
    
    element = ensureElement(element);
    
    var top = (_popupStack.length > 0) ? _popupStack[_popupStack.length-1] : null;

    while(top && top.element != element) {
      top.element.style.visibility = "hidden";
      if(top.dismissedCallback) top.dismissedCallback();
      document.onclick = top.previousOnClickCb;
      top = _popupStack.pop();
    }
       
    if(element.style.visibility != "hidden") {
      element.style.visibility = "hidden";
      if(top.dismissedCallback) top.dismissedCallback();
      document.onclick = _popupStack.pop().previousOnClickCb;
    }
  
    if(!dismissing && window.event && window.event.type == "click") Awe.cancelEvent(window.event);
    return;
  }
    
})(Awe, this, document)
