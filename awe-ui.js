/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  // Stack of saved document.onmousedown handlers
  var _popupStack = [];
  
  var _xa = new xAnimation();
  
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
   * purpose: safely get the top of _popupStack. Returns null if stack is empty.
   */
  var getTopOfPopupStack = function() {
    return (_popupStack.length > 0) ? _popupStack[_popupStack.length-1] : null;
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
    
    var top = getTopOfPopupStack();
    while(top && top.element != parentPopup) {
      top.element.style.visibility = "hidden";
      if(top.dismissedCallback) top.dismissedCallback();
      document.onmousedown = top.previousonmousedownCb;
      _popupStack.pop();
      top = getTopOfPopupStack();
    }
      
    element.style.visibility = "visible";
  
    _popupStack.push({
      element:element,
      opacity:element.style.opacity, // remember
      parentPopup:parentPopup,
      dismissedCallback:dismissedCallback,
      previousonmousedownCb:document.onmousedown
    });
  
    document.onmousedown = (function(e) {
      e = e || window.event;
      if (!xHasPoint(element, e.pageX, e.pageY)) {
        Awe.hidePopup(element, true);
      }
      return;
    });
  }
  
  /* 
   * method: Awe.hidePopup
   *
   * If element is the current top-most popup, hide it. Otherwise, hide all popups 
   * in the current stack starting from the top upto and including the element. 
   * If element is not in the stack, has the side-effect of dimissing all popups.
   */
  Awe.hidePopup = function(element, dismissing) {
    
    element = ensureElement(element);
    
    var top = getTopOfPopupStack();
    
    while(top && top.element != element) {
      top.element.style.visibility = "hidden";
      if(top.dismissedCallback) top.dismissedCallback();
      document.onmousedown = top.previousonmousedownCb;
      _popupStack.pop();
      top = getTopOfPopupStack();
    }

    if(!top) throw 'Element not found in the popup stack (Awe.hidePopup)';
    
    if(top.dismissedCallback) top.dismissedCallback();
    document.onmousedown = top.previousonmousedownCb;
    _popupStack.pop();

    _xa.opacity(element,0,300,0,0,function() {
      if(element.style.visibility != "hidden") {
        element.style.visibility = "hidden";
        element.style.opacity = top.opacity; // restore
      }
    });

    return;
  }
    
})(Awe, this, document)
