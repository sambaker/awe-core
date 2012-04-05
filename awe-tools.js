/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  var xyTrace = function(evt) {
    console.log("point:( " + evt.x + ", " + evt.y + " ) of " + evt.currentTarget.id);
  }
  
  /* 
   * method: Awe.enableCTrace
   *
   * Attach a mousemove handler to the element with the given ID and trace x,y
   * coordinates for that element when the mouse is being moved.
   */
  Awe.enableCTrace = function(elementId) {
    var e = document.getElementById(elementId);
    e.addEventListener("mousemove", xyTrace);
  }

  /* 
   * method: Awe.disableCTrace
   *
   * Reverts the effect of enableCTrace.
   */
  Awe.disableCTrace = function(elementId) {
    var e = document.getElementById(elementId);
    e.removeEventListener("mousemove", xyTrace);
  }
  
})(Awe, this, document);