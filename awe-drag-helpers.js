i/* misc helpers to be used with dragging 
  *
  */

(function(Awe, global, document, undefined) {

  Awe.HorizontalDragUpdater = function() {
    var _i = this;
    _i.move = function(el, evt) {
      el.style.left = xLeft(el) + evt.delta.x + "px";
    }
  }

})(Awe, this, document);

