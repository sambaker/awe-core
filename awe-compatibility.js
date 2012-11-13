/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */

// IE8
if(!Date.now) { Date.now = function() { return new Date().getTime(); } }

// IE
if(typeof(console) == "undefined") { console = {}; } 
if(typeof(console.log) == "undefined") { console.log = function(str) { }; } 
if(typeof(console.trace) == "undefined") { console.trace = function() { }; } 
