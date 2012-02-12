// xAnimation.size r3, Copyright 2006-2010 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
// modified for width only
xAnimation.prototype.width = function(e,w,t,a,b,oe,userOnRun)
{
  var i = this;
  i.axes(1);
  i.a[0].i = xWidth(e); // initial size
  i.a[0].t = Math.round(w); // target size
  i.init(e,t,o,o,oe,a,b);
  i.run();
  function o(i) 
  { 
    var curVal = Math.round(i.a[0].v);
    xWidth(i.e, curVal);

    if (userOnRun)
    {
      userOnRun(curVal);
    }
  } // onRun and onTarget
};
