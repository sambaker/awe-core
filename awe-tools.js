/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  /*
   * method: Schedule a timeout that prints out the mouse coordinates only after 
   * mousemove has stopped
   */
  var onmousemove = function(evt) {
    clearTimeout(mousemoveTimer);
    mousemoveEvent = evt;
    mousemoveElementId = evt.currentTarget.id;
    mousemoveTimer = setTimeout(onmousestop, 250);
  }
  
  var onmouseout = function(evt) {
    clearTimeout(mousemoveTimer);
  }

  var onmousestop = function() {
    console.log("point:( " + mousemoveEvent.x + ", " + mousemoveEvent.y + " ) of " + mousemoveElementId);
  }

  var mousemoveEvent;
  var mousemoveElementId;
  var mousemoveTimer;
  
  /* 
   * method: Awe.enableCTrace
   *
   * Attach a mousemove handler to the element with the given ID and trace x,y
   * coordinates for that element when the mouse is being moved.
   */
  Awe.enableCTrace = function(elementId) {
    var e = document.getElementById(elementId);
    e.addEventListener("mousemove", onmousemove);
    e.addEventListener("mouseout", onmouseout);
  }

  /* 
   * method: Awe.disableCTrace
   *
   * Reverts the effect of enableCTrace.
   */
  Awe.disableCTrace = function(elementId) {
    var e = document.getElementById(elementId);
    e.removeEventListener("mousemove", onmousemove);
    e.removeEventListener("mouseout", onmouseout);
  }
  
})(Awe, this, document);