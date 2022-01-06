"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * This utility module provides low-level support for JS Injection.
 * 
 * NOTE: This module will be installed at bootStrap before angularJS is initialized
 *
 * @module js/splmStatsJsService
 */
define(['app', 'lodash', 'js/splmStatsUtils', 'js/browserUtils'], function (app, _, splmStatsUtils, browserUtils) {
  'use strict';

  var exports = {};
  var _procs = [];
  var _enabled = false;
  var _setTimeout = null; // var _realAddEventListener = null;
  // var _realRemoveEventListener = null;
  // var _eventListenerTimer = 0;
  // var _events = [];

  /**
   * Very complex logic here...
   * 1) We replace window.setTimeout with our own function that will track the time from the function argument and add it to our total time
   *  - This gives us the ability to track the scripting time of any async function run-time as setTimeout is the path to scheduling any of them in the event queue
   * 2) We replace EventTarget/Element.addEventListener to always track the handler function run-time. This will take care of almost all of the run-time events in the system,
   *  - The only scripting we are missing here is when elements are created and explicitly given events (Ex: row.onclick = someFunction )
   *  - Maybe catch this with MutationObserver whenever add/delete an element, check for event like onclick, onhover, etc. and replace it like we are here. That
   *  will undoubtedly add more complexity.
   * 3) We replace removeEventListener and have functionality to look in our cache of real and wrapped functions in order to remove properly from the element.
   *  - We get the real function as an argument obviously from the code, we need to check which of our wrapped functions corresponds to real function and remove the
   *  wrapped one from our element. 
   */

  exports.install = function () {
    if (!_enabled) {
      _setTimeout = window.setTimeout;

      window.setTimeout = function () {
        var _realFunc = arguments[0];
        arguments[0] = exports.wrapFunction(null, _realFunc);
        return _setTimeout.apply(this, arguments);
      };
      /*
      LCS-218179 - ATDD Failure11x: Hover and Selection does not work in Traceability Matrix
      comment event listener injection for Beta, will add it back before end of 1905
       var _target = !browserUtils.isIE ? EventTarget : Element;
      _realAddEventListener = _target.prototype.addEventListener;
      _realRemoveEventListener = _target.prototype.removeEventListener;
       _target.prototype.addEventListener = null;
      _target.prototype.addEventListener = function() {
          var _realCallback = arguments[1];
          var fakeFunc = function( event ) {
              var t1 = window.performance.now();
              _realCallback( event );
              var t2 = window.performance.now();
              _eventListenerTimer += t2 - t1;
          };
          arguments[1] = fakeFunc;
          _events.push( { thisArg: this, eventName: arguments[0], handlerFunction: _realCallback, wrappedFunction: fakeFunc } );
          _realAddEventListener.apply( this, arguments );
      };
       _target.prototype.removeEventListener = null;
      _target.prototype.removeEventListener = function( type, handler, useCapture ) {
          var thisArg = this;
          var slices = [];
          _.forEach( _events, function( e, i ) {
              if( thisArg === e.thisArg && type === e.eventName && handler === e.handlerFunction ) {
                  _realRemoveEventListener.call( thisArg, type, e.wrappedFunction, useCapture );
              } else{
                  slices.push( e );
              }
          } );
          _events = slices;
      };
      */


      _enabled = true;
    }
  };
  /**
   * Wrapping JS function with plStats injection
   * 
   * @param {Object} thisArg - Explicit passing of the "this" object for whatever function we are replacing
   * @param {Function} func - Function we are replacing
   * @param {String} name - the name (if any) of the function/object we are replacing
   * 
   * @returns {Object} result - The result of whatever function we are replacing. Must be careful to return this value for functions (not setTimeout) that
   * are expecting a return value
   */


  exports.wrapFunction = function (thisArg, func, name) {
    return function _splmStatsJsWrapperFunction() {
      if (exports.enabled() && _procs.length > 0) {
        var startTime = window.performance.now();
        var res = func.apply(thisArg, arguments);
        var endTime = window.performance.now();
        /*
        TODO: move this logic to proc later as 'heavy JS function processor'
        if ( name ) {
            var gap = endTime - startTime;
            if ( gap > 150 ) {
                console.log( name + ' -> ' +  gap.toFixed( 3 ).toString() + 'ms' );
            }
        }
        */

        try {
          _.forEach(_procs, function (proc) {
            proc({
              name: name,
              startTime: startTime,
              endTime: endTime
            });
          });
        } catch (ex) {// TODO: Do nothing for now, will fill it up before EOD 1905
        }

        return res;
      }

      return func.apply(thisArg, arguments);
    };
  };
  /**
   * @returns {Boolean} Has JSService already underwent wrapping? If so we dont want to do it again
   */


  exports.enabled = function () {
    return _enabled;
  };
  /**
   * Angular caches setTimeout after it is initialized so this doesn't do anything
   */


  exports.uninstall = function () {
    if (_enabled) {
      window.setTimeout = _setTimeout;
      _setTimeout = null;
      _enabled = false;
    }
  };

  exports.addProc = function (proc) {
    _procs.push(proc);
  };

  exports.removeProc = function (proc) {
    _procs = _.filter(_procs, function (procObj) {
      return proc !== procObj;
    });
  };

  return exports;
});