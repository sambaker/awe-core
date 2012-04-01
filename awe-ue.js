/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {
    
  var _mailto;
  var _subject;
  var _ui;
  
  /* 
   * purpose: Helper function to create a mailto href with error information.
   */
  var getMailtoHref = function(message, details) {
    var body = "%0D%0D%0D%0D";
    body += "Thank you for reporting this error. Please use the space above to provide additional details about what you were doing when this error occured.";
    body += "%0D%0DReferring Page: " + document.referrer;
    body += "%0D%0DError Message:%0D-------------------------------------------%0D" + details;
    
    return 'mailto:' + _mailto + '?subject=' + _subject + " " + message + '&body=' + body;
  }
  
  /* 
   * purpose: display a minimal user interface to indicate that an error has 
   * occured and give the user the option to report it.
   */
  var showOnErrorPrompt = function(mailtoHref) {
    if(!_ui) {
      _ui = document.createElement("DIV");
      _ui.id = "aweOnErrorPrompt";
      _ui.className = "aweOnErrorPrompt";
      _ui.style.position = "absolute";
      _ui.style.top = "0px";
      _ui.style.left = "50px";
      _ui.style.width = "400px";
      _ui.style.height = "auto";
      _ui.style.margin = "0px";
      _ui.style.marginTop = "20px";
      _ui.style.padding = "10px";
      _ui.style.color = "#333";
      _ui.style.zIndex = "9999";
      _ui.style.lineHeight = "1.25";
      _ui.style.backgroundColor = "#f66";
      _ui.style.fontFamily = "Arial,Helvetica";      
    }
    
    document.body.appendChild(_ui);

    while (_ui.childNodes.length > 0 ) {
      _ui.removeChild(_ui.childNodes[0]);
    }
    
    var prompt = document.createElement("DIV");
    prompt.innerHTML = "Oops! There was an unexpected error on this page.";
    _ui.appendChild(prompt);

    var br1 = document.createElement("BR");
    _ui.appendChild(br1);
    
    var report = document.createElement("A");
    report.href = mailtoHref;
    report.innerHTML = "<strong>Click here to report this error via email. Thanks!</strong>";    
    _ui.appendChild(report);

    var br2 = document.createElement("BR");
    _ui.appendChild(br2);
    
    var closeThis = document.createElement("A");
    closeThis.href = "http://google.com";
    closeThis.innerHTML = "Close this error message";
    
    xAddEventListener( closeThis, "click", hideOnErrorPrompt, true );
    
    _ui.appendChild(closeThis);
  }
  
  /* 
   * purpose: hide the user interface show after detecting an unhandled error.
   */
  var hideOnErrorPrompt = function(evt) {
    Awe.cancelEvent(evt);
    document.body.removeChild(_ui);
  }
  
  /* 
   * purpose: window.onerror handler.
   */
  var handleError = function(message, url, linenumber) {
    showOnErrorPrompt(getMailtoHref(message, "Error: " + message + ", on line " + linenumber + " of " + url));
  }
  
  /* 
   * method: Awe.reportUnhandledErrors
   *
   * Attach a handler for the window.onerror event to cllect data about unhandled
   * script errors.
   */
  Awe.reportUnhandledErrors = function(mailto, subject) {
    _mailto = mailto;
    _subject = subject || "[js-error-report] ";
    window.onerror = handleError;
  }
  
})(Awe, this, document);
