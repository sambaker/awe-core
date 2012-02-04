/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  // State contains any of:
  //  allowOnly - array with 0 or more states (or null)
  //  doNotAllow - array with 1 or more states (or null)
  //  start function (or null)
  //  update function (or null)
  //  end function (or null)
  
  var StateMachine = Awe.StateMachine = function(name, stateMap, initialStateId) {
    var _i = this;
    
    StateMachine.stateMachines.push(_i);
  
    _i.name = name;
    _i.states = stateMap || [];
    _i.currentStateId = null;
      
    _i.addState = function(id, state) {
      if (_i.states[id]) {
        throw "Duplicate state added!";
      }
      _i.states[id] = state;
    }
    
    _i.getCurrentStateId = function() {
      return _i.currentStateId;
    }
  
    // Request a state that is assumed to be a transitional state and call the supplied callback on completion.
    // The callback will not be called if the transition state is interrupted, but you can prevent this by making
    // the transition state uninterruptable: pass an empty array in the transition states allowOnly field, which will
    // disallow any transitions while the state is active. The transitionCompleteCallback should then change state
    // once the transition is complete.
    _i.requestTransitionState = function(id) {
      
      if (typeof(arguments[arguments.length - 1]) != "function") {
        throw "Last argument of StateMachine.requestTransitionState must be an on-complete callback"
      }
      
      if (_i.requestState.apply(_i, arguments)) {
        _i.transitionCompleteCallback = arguments[arguments.length - 1];
  
        if (!_i.states[_i.currentStateId].update) {
          throw "ERROR: Transition states must have an update method, otherwise they will never be able to complete.";
        }
        return true;
      }
      
      // Remove the transition complete callback if the switch to the transition state was refused.
      _i.transitionCompleteCallback = null;
      return false;
    }
    
    // Request a change to the supplied state. If a current state exists that will be checked for any conditions that
    // disallow transition to the new state.
    _i.requestState = function(id) {
      
      var nextState = id && _i.states[id];
      
      if (id && !nextState) {
        return false;
      }
      
      if (_i.currentStateId) {
        var currentState = _i.states[_i.currentStateId];
        
        if (!_i.currentStateDone && currentState.allowOnly && !currentState.allowOnly.indexOf(id)) {
          return false;
        }
        if (!_i.currentStateDone && currentState.doNotAllow && currentState.doNotAllow.indexOf(id)) {
          return false;
        }
        
        if (currentState.end) {
          currentState.end.call(currentState, id);
        }
      }
      
      if (nextState) {
        nextState._startTime = Date.now();
        nextState.runTime = 0;
        if (nextState.start) {
          nextState.start.apply(nextState, [_i.currentState && _i.currentState.id].concat(Array.prototype.slice.call(arguments,1)));
        }
      }
      
      _i.currentStateId = id;
      
      return true;
    }
    
    _i.update = function() {
      var currentState = _i.states[_i.currentStateId];
      currentState.runTime = (Date.now() - currentState._startTime) * 0.001;
      if (currentState && currentState.update) {
        // Update the current state and if it's a transition state, call the transition state callback once the
        // transition state's update returns true to signify completion
        if (currentState.update.call(currentState) && _i.transitionCompleteCallback) {
          var callback = _i.transitionCompleteCallback;
          _i.transitionCompleteCallback = null;
          _i.currentStateDone = true;
          callback();
          _i.currentStateDone = false;
        }
      }
    }
      
    if (initialStateId) {
      _i.requestState(initialStateId);
    }
  
    return _i;
  }
  
  StateMachine.stateMachines = []
  StateMachine.update = function() {
    for (var i = 0; i < StateMachine.stateMachines.length; ++i) {
      StateMachine.stateMachines[i].update();
    }
  }
})(Awe, this, document)
