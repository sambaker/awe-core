/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */

/**
 * Awe namespace
 */
(function(Awe, global, document, undefined) {
  
  /**
   * Enables drag on an HTML element
   * @param  {Object} el     The element that's draggable
   * @param  {Object} config config options
   */
  Awe.enableDrag = function(el, config) {
  
    config = config || {};
    var listenToDocument = config.listenToDocument || !Awe.env.inputTouch;
    var filters = config.filters;
    var updater = config.updater;
    var hasAnimatingFilter = false;
    var cancelEvents = config.cancelEvents === undefined ? true : config.cancelEvents;
    
    // Convert a single drag filter
    if (filters) {
      if (!Awe.isArray(filters)) {
        filters = [filters];
      }
      Awe.forEach(filters, function(filter) {
        if (filter.animates) {
          hasAnimatingFilter = true;
        }
      });
    } else {
      filters = [];
    }

    // Drag state
    var touch = {};

    // Animation state is an object used during filter-controlled animations containing:
    //  - animationTime
    //  - velocity
    //  - pos
    var animationState = {};
    
    function getClientPos(evt)
    {
      var p;
      if (Awe.env.inputTouch)
      {
        // TODO: Use correct touch (lookup by touch start ID instead of always using index 0)
        p = { x: evt.changedTouches[0].clientX, y: evt.changedTouches[0].clientY };
      } else {
        p = { x: evt.clientX, y: evt.clientY };
      }
      p.x += touch.anchor.x;
      p.y += touch.anchor.y;
      return p
    }
  
    function updateAnimationState(evt) {
      if (hasAnimatingFilter) {
        if (touch.dragging) {
          animationState._last = Date.now() * 0.001;
          animationState.animationTime = 0;
          animationState.deltaTime = 0;
          animationState.velocity = evt.velocity;
          animationState.pos = evt.pos;
        } else {
          var t = Date.now() * 0.001;
          animationState.deltaTime = t - animationState._last;
          animationState.animationTime += animationState.deltaTime;
          animationState._last = t;
        }
      }
    }
    
    function processDrag(clientPos, pos, evt) {
      if (touch.now) {
        touch.maxDistanceSquared = Math.max(touch.maxDistanceSquared, (touch.now.x - touch.start.x) * (touch.now.x - touch.start.x) + (touch.now.y - touch.start.y) * (touch.now.y - touch.start.y));
      } else {
        touch.maxDistanceSquared = 0;
      }
  
      // Create the new drag state
      var newDrag = {
        clientPos: { x: clientPos.x, y: clientPos.y },
        pos: { x: pos.x, y: pos.y },
        dragTime: (Date.now() - touch.startTime) * 0.001,
        maxDistanceSquared: touch.maxDistanceSquared,
        velocity: { x: 0, y: 0 },
        event: evt
      }
      if (touch.lastDrag) {
        newDrag.clientDelta = {
          x: newDrag.clientPos.x - touch.lastDrag.clientPos.x,
          y: newDrag.clientPos.y - touch.lastDrag.clientPos.y
        }
        newDrag.delta = {
          x: newDrag.pos.x - touch.lastDrag.pos.x,
          y: newDrag.pos.y - touch.lastDrag.pos.y
        }
        var dt = newDrag.dragTime - touch.lastDrag.dragTime;
        if (dt) {
          newDrag.velocity.x = newDrag.delta.x / dt;
          newDrag.velocity.y = newDrag.delta.y / dt;
        }
      } else {
        newDrag.clientDelta = { x: 0, y: 0 };
        newDrag.delta = { x: 0, y: 0 };
      }
      
      
      // Copy current drag state to last
      touch.lastDrag = {
        clientPos: { x: newDrag.clientPos.x, y: newDrag.clientPos.y },
        pos: { x: newDrag.pos.x, y: newDrag.pos.y },
        delta: { x: newDrag.delta.x, y: newDrag.delta.y },
        clientDelta: { x: newDrag.clientDelta.x, y: newDrag.clientDelta.y },
        velocity: { x: newDrag.velocity.x, y: newDrag.velocity.y },
        dragTime: newDrag.dragTime,
        maxDistanceSquared: newDrag.maxDistanceSquared
      }
      
      updateAnimationState(newDrag);
      
      return newDrag;
    }
    
    function updateDrag() {
      return touch.lastDrag && {
        clientPos: touch.lastDrag.clientPos,
        pos: touch.lastDrag.pos,
        velocity: touch.lastDrag.velocity,
        clientDelta: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        dragTime: (Date.now() - touch.startTime) * 0.001,
        maxDistanceSquared: touch.lastDrag.maxDistanceSquared
      }
    }
    
    function endAnimation() {
      if (touch.updateIntervalId) {
        // Call end on any remaining animating filters
        Awe.forEach(filters, function(filter) {
          if (filter.animates && filter.end) {
            filter.end();
          }
        });

        if (updater.end) {
          updater.end();
        }
        clearInterval(touch.updateIntervalId);
        touch.updateIntervalId = null;
      }
    }
    
    // Per-frame updates
    
    function dragUpdateAnimating() {
      updateAnimationState();
      var animationsRunning = false;
      Awe.forEach(filters, function(filter) {
        if (filter.animates) {
          animationsRunning = animationsRunning || !filter.animate(animationState);
        }
      });

      if (animationsRunning) {
        var pos = { x: animationState.pos.x, y: animationState.pos.y };
        var drag = processDrag(pos, pos);
        updater.move(el, drag);
        // TODO: Should this callback be called after release?
        //config.onDragMove(processDrag(clientPos, pos));
      } else {
        // Animation is done
        endAnimation();
      }
    }

    function dragUpdateDragging() {
      var clientPos = touch.now || touch.start;
      clientPos = { x: clientPos.x, y: clientPos.y };
      var drag = updateDrag();
      if (drag) {
        if (config.onDragUpdate) {
          config.onDragUpdate(drag);
        }
      }
    }
    
    function dragUpdate(evt) {
      if (touch.dragging) {
        dragUpdateDragging();
      } else {
        dragUpdateAnimating();
      }
    }
      
    function dragMove(evt) {
      cancelEvents && Awe.cancelEvent(evt);
      touch.now = getClientPos(evt);
      var pos = applyFilters(touch.now);
      var drag = processDrag(touch.now, pos, evt);
      if (updater && updater.move) {
        updater.move(el, drag);
      }
      if (config.onDragMove) {
        config.onDragMove(drag);
      }
    }
    
    function dragEnd(evt, immediate) {
      if (!touch.dragging) {
        return;
      }
      touch.dragging = false;
      cancelEvents && evt && Awe.cancelEvent(evt);
      xRemoveEventListener(listenToDocument ? document : el, Awe.env.eventDragMove, dragMove);
      xRemoveEventListener(listenToDocument ? document : el, Awe.env.eventDragEnd, dragEnd);
      // TODO Check for animating filters before cancelling event bits
      Awe.forEach(filters, function(filter) {
        if ((immediate || !filter.animates) && filter.end) {
          filter.end();
        }
      });
      if (!hasAnimatingFilter && updater.end) {
        updater.end();
      }
      // TODO: Figure out how whether release events are still appropriate here when there's an
      // animating filter
      if (config.onDragEnd && evt) {
        var pos = getClientPos(evt);
        config.onDragEnd(processDrag(pos, pos, evt));
      }
      if (touch.updateIntervalId && !hasAnimatingFilter) {
        clearInterval(touch.updateIntervalId);
        touch.updateIntervalId = null;
      }
    }
    
    function applyFilters(pos) {
      Awe.forEach(filters, function(filter) {
        pos = filter.move(el, pos) || pos;
      });
      return pos;
    }
    
    function dragStart(evt) {
      cancelEvents && Awe.cancelEvent(evt);
      
      // Cancel any existing animation
      endAnimation();
      
      touch.dragging = true;
      touch.anchor = { x: 0, y: 0 }
      // Calculate the position without the anchor
      touch.now = getClientPos(evt);
      // Calculate the anchor position
      if (config.anchor) {
        touch.anchor = config.anchor.getAnchor(el, touch.now);
        // Get the client position again, taking the anchor into account
        touch.now = getClientPos(evt);
      }
      touch.lastDrag = null;
      touch.start = getClientPos(evt);
      touch.startTime = Date.now();
      touch.maxDistanceSquared = 0;
      
      var pos = touch.start;
      Awe.forEach(filters, function(filter) {
        if (filter.start) {
          pos = filter.start(el, pos) || pos;
        }
      });

      var pos = applyFilters(touch.now);
      
      var drag = processDrag(touch.now, pos, evt);

      if (updater.start) {
        updater.start(el, drag);
      }

      if (config.onDragStart) {
        config.onDragStart(drag);
      }

      xAddEventListener(listenToDocument ? document : el, Awe.env.eventDragMove, dragMove);
      xAddEventListener(listenToDocument ? document : el, Awe.env.eventDragEnd, dragEnd);
      
//      if (config.onDragUpdate) {
      touch.updateIntervalId = setInterval(dragUpdate, config.dragUpdateInterval || 16);
//      }
    }
    
    xAddEventListener(el, Awe.env.eventDragStart, dragStart);
    
    el._disableDrag = function() {
      xRemoveEventListener(el, Awe.env.eventDragStart, dragStart);
      // Make sure any in-progress drags have their listeners removed
      dragEnd(null, true);
    }
  }
  
  // Awe.left = function(el, value) {
  //   if (el.style && el.style.left !== undefined) {
  //     if (value === undefined) {
  //       value = parseInt(el.style.left)
  //       if (isNaN(value)) value = xGetComputedStyle(el, "left", 1);
  //       if (isNaN(value)) value = 0;
  //     } else {
  //       el.style.left = value + "px";
  //     }
  //   } else if (el.style && el.style.pixelLeft !== undefined) {
  //     if (value === undefined) {
  //       value = el.style.pixelLeft;
  //     } else {
  //       el.style.pixelLeft = value;
  //     }
  //   }
  //   return value;
  // }

  /*
   * method: Awe.disableDrag
   * 
   * purpose: disable drag on a DOM element
   *
   */
  Awe.disableDrag = function(el) {
    if (el._disableDrag) {
      el._disableDrag();
      el._disableDrag = null;
    }
  }
  
  Awe.DragAnchorTopLeft = function(anchorEl) {
    var _i = this;
    
    _i.getAnchor = function(el, pos) {
      el = anchorEl || el;
      return { x: xLeft(el) - pos.x, y: xTop(el) - pos.y }
    }
  }
  
  Awe.DragFilterLimitAxes = function(minX, maxX, minY, maxY) {
    var _i = this;
    
    _i.move = function(el, pos) {
      var x = Awe.clamp(pos.x, minX, maxX);
      var y = Awe.clamp(pos.y, minY, maxY);
      return { x: x, y: y };
    }
  }
  
/*
  // To be continued...
  Awe.DragFilterLimitAxesNoSpring = function(minX, maxX, minY, maxY) {
    var _i = this;
    
    _i.move = function(el, pos) {
      var x = Awe.clamp(pos.x, minX, maxX);
      var y = Awe.clamp(pos.y, minY, maxY);
      return { x: x, y: y };
    }
  }
*/
  
  Awe.DragFilterMomentum = function() {
    var _i = this;
    
    _i.start = function(el, pos) {
      _i.lastPos = null;
      _i.vel = { x: 0, y: 0 };
    }
    
    _i.move = function(el, pos) {
      if (_i.lastPos) {
        var deltaTime = (Date.now() - _i.lastTime) * 0.001;
        _i.vel.x = (pos.x - _i.lastPos.x) / deltaTime;
        _i.vel.y = (pos.y - _i.lastPos.y) / deltaTime;
      }
      _i.lastPos = { x: pos.x, y: pos.y };
      // TODO: Make drag time available to this function
      _i.lastTime = Date.now();

      return pos;
    }

    _i.animates = true;

    _i.animate = function(animationState) {
      // Apply velocity and acceleration
      animationState.velocity.x *= 0.8;
      animationState.velocity.y *= 0.8;

      var dx = animationState.velocity.x * animationState.deltaTime;
      var dy = animationState.velocity.y * animationState.deltaTime;
      
      if ((dx * dx + dy * dy) > 1) {
        animationState.pos.x += dx;
        animationState.pos.y += dy;
        
        return false;
      }
      // Done
      return true;
    }
  }
  
  Awe.DragUpdaterTopLeft = function() {
    var _i = this;
    
    _i.move = function(el, evt) {
      var left = evt.pos.x;
      var top = evt.pos.y;
      el.style.left = left + "px";
      el.style.top = top + "px";
    }
  }

})(Awe, this, document);
