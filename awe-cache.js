/*
 * Artefact Web Extensions
 *
 * Copyright 2012, Artefact Group LLC
 * Licensed under MIT.
 */
(function(Awe, global, document, undefined) {

  var prefix = "__awec_",
      identity_name = "",
      identity_key = null,
      defaultTtl = 3600000, // 1 hr
      gcInterval = 60000, // 1 min
      gcHandle = null,
      store = window.sessionStorage,
      disabled = typeof(window.sessionStorage) != "object" || window.location.search.indexOf("disable-awe-cache") > 0;

  function sweep() {
    // todo - implement
  }

  // create a cache object
  function createCO(value, ttl, timeStamp) {
    if(typeof(value) != "string") throw "only string values can be cached (for now)";
    var o = {};
    o.t = "string";
    o.e = Date.now() + ttl;
    o.ts = timeStamp ? timeStamp : 0;
    o.v = encrypt(value);
    return o;
  }

  function getKey(key) {
    return prefix + identity_name + key;
  }

  function encrypt(value) {
    // todo -- implement
    return value;
  }

  function decrypt(value) {
    // todo -- implement
    return value;
  }

  Awe.cacheEnableTrace = true;

  /*
   * Awe.cacheSetIdentity
   *
   * Initialize the cache with a user identity such that all cached data
   * is stored in a namespace unique to that user and the data is encrypted
   * using the given identity specific cache key.
   */
  Awe.cacheSetIdentity = function(name, key) {
    if(!name || !key) throw "invalid arguments. name and key are required";
    identity_name = name + "_";
    identity_key = key;
    console.log("[awe.cache.config] identity set to " + name);
  }

  /*
   * Awe.cacheRemoveIdentity
   * 
   * Remove all identity speficic cache data.
   */
  Awe.cacheClearIdentity = function() {
    if(identity_name == "") return;

    var kpfx = getKey(""),
        n = store.length,
        i,
        ck,
        keysToClear = [];
    for(i = 0; i < n; i++) {
      ck = store.key(i);
      if(ck.indexOf(kpfx) == 0) {
        keysToClear.push(ck);
      }
    }
    n = keysToClear.length;
    for(i = 0; i < n; i++) {
      store.removeItem(keysToClear[i]);
    }
    identity_name = "";
    identity_key = null;
  }

  /* 
   * method: Awe.cacheGet
   *
   * Get value for key from cache. Returned value is a string, or null.
   */
  Awe.cacheGet = function(key) {
    if(disabled) return null;
    var k = getKey(key);
    var cv = JSON.parse(store.getItem(k));
    if(cv && cv.t == "string" && cv.e > Date.now()) {
      if(Awe.cacheEnableTrace) console.log("[awe.cache.hit] " + key);
      return decrypt(cv.v);
    } else {
      if(Awe.cacheEnableTrace) console.log("[awe.cache.miss] " + key);
      store.removeItem(k);
      return null;
    }
  }

  /* 
   * method: Awe.cacheGetTimeStamp
   *
   * Get the time stamp for key from cache. Returns the timestamp, or null.
   */
  Awe.cacheGetTimeStamp = function(key) {
    if(disabled) return null;
    var k = getKey(key);
    var cv = JSON.parse(store.getItem(k));
    if(cv && cv.t == "string" && cv.e > Date.now()) {
      return cv.ts;
    } else {
      store.removeItem(k);
      return null;
    }
  }
  
  /* 
   * method: Awe.cacheSet
   *
   * Returns cached object for key, or null. If ttl is not specified,
   * a default ttl is used.
   */
  Awe.cacheSet = function(key, value, ttl, timeStamp) {
    if(disabled) return;
    if(!ttl) ttl = defaultTtl;
    store.setItem(getKey(key), JSON.stringify(createCO(value,ttl,timeStamp)));
    if(Awe.cacheEnableTrace) console.log("[awe.cache.write] " + key);
    return value;
  }

  /* 
   * method: Awe.cacheInvalidate
   *
   * Invalidate the cached value of key.
   */
  Awe.cacheInvalidate = function(key) {
    if(disabled) return;
    store.removeItem(getKey(key));
  }

  if(!disabled) {
    gcHandle = setInterval(sweep, gcInterval);
  } else {
    console.log("[awe.cache.info] disabled");
  }

})(Awe, this, document);
