// xAnimation.size r3, Copyright 2006-2010 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
// modified for width only
xAnimation.prototype.numbers = function(startVal,endVal,t,a,b,oe,userOnRun)
{
  var i = this;
  i.axes(1);
  i.a[0].i = startVal; // initial size
  i.a[0].t = endVal; // target size
  i.init(null,t,o,o,oe,a,b);
  i.run();
  function o(i) 
  { 
    curVal = Math.round(i.a[0].v);
    userOnRun(curVal);
  } // onRun and onTarget
};
