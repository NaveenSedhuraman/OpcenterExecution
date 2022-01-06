"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * This module defines and provides a set of utility APIs used to access the 'localStorage' APIs of the browser the
 * client is running within.
 *
 * @module js/localStorage
 * @publishedApolloService
 */
define(['app', 'jquery', 'js/browserUtils', 'js/eventBus'], function (app, $, browserUtils, eventBus) {
  'use strict';
  /** Build ID to ensure unique entry into the local storage */

  var _buildID = 1605212071291;
  /** Browser ID Suffix for local storage data */

  var _browserID = '_B_GUID_:';
  /** The id to include in the keys for all topics managed by this service. */

  var _localStorageId = _buildID;
  /** {Boolean} TRUE if running within an Internet Explorer type browser. */

  var _isIE = browserUtils.isIE;
  /** ID for this specific instance of the browser. */

  var _browserInstanceId = Date.now().toString();
  /**
   * @returns {String} Base URL for the current application's root 'document' without any protocol, machine, port or
   *          query attributes and (if otherwise valid) without a trailing '/'
   *
   * <pre>
   * (e.g. 'http://100.100.100.100:8888/awc/?locale=en_US#showHome' would return 'awc' ).
   * (e.g. 'http://cii6s072:7001/madev1016/#showHome' would return 'madev1016' ).
   * </pre>
   */


  var _getLocalStorageId = function _getLocalStorageId() {
    if (_localStorageId !== _buildID) {
      return _localStorageId;
    }

    if (window && window.location && window.location.pathname) {
      // Ensure a final slash if non-empty.
      _localStorageId = window.location.pathname;
      _localStorageId = _localStorageId.substring(0, _localStorageId.lastIndexOf('/') + 1);
    } else {
      /**
       * Support for non-Angular (NodeJS) run.
       * @ignore
       */
      _localStorageId = '';
    }

    return _localStorageId;
  };
  /**
   * @param {String} topic - local storage topic (key)
   *
   * @return {String} Unique local storage topic key.
   */


  function _getLSTopicKey(topic) {
    return topic + ':' + _getLocalStorageId();
  }
  /**
   * Subscribe to the 'ctrl-mouse' click on the Siemens logo to kick off the cleanup of obsolete local storage
   * artifacts.
   */


  eventBus.subscribe('cdm.logDiagnostics', function () {
    /** Regular expression used to cleanup older localStorage artifacts */
    var _regex = /[a-z]+:(\d)+$/g;
    var keys = Object.keys(localStorage);

    for (var i = 0; i < keys.length; i++) {
      if (keys[i].match(_regex)) {
        localStorage.removeItem(keys[i]);
      }
    }
  }, 'localStorage');
  var exports = {};
  /**
   * Subscribes to 'storage' event for given storage topic (key)
   *
   * @param {String} topic - local storage topic (key)
   * @param {Function} cb - event handler
   */

  exports.subscribe = function (topic, cb) {
    window.addEventListener('storage', function (event) {
      var ourEvent = $.extend({}, event); // Avoid issues with strict, and writing to read only fields on the event

      if (_isIE) {
        if (ourEvent.newValue) {
          var start = ourEvent.newValue.indexOf(_browserID);

          if (start > -1) {
            var browserID = ourEvent.newValue.substr(start + _browserID.length, ourEvent.newValue.length);
            ourEvent.newValue = ourEvent.newValue.substr(0, start);

            if (browserID === _browserInstanceId) {
              return;
            }

            start = ourEvent.oldValue.indexOf(_browserID);

            if (start > -1) {
              ourEvent.oldValue = ourEvent.oldValue.substr(0, start);
            }
          }
        }
      } // Ideally we wouldn't have to check for value change but IE doesn't seem to be working correctly.


      if (ourEvent.key === _getLSTopicKey(topic) && ourEvent.newValue !== ourEvent.oldValue) {
        cb(ourEvent);
      }
    }, false);
  };
  /**
   * Add data to local storage for given storage topic (key)
   *
   * @param {String} topic - local storage topic (key)
   * @param {String} data - data to add to local storage
   */


  exports.publish = function (topic, data) {
    var dataLocal = data;

    if (_isIE) {
      dataLocal += _browserID + _browserInstanceId;
    } // Ideally we wouldn't have to check for value change but IE doesn't seem to be working correctly.


    var topicKey = _getLSTopicKey(topic);

    var exists = localStorage.hasOwnProperty(topicKey);

    if (exists && dataLocal === undefined) {
      localStorage.removeItem(topicKey);
    } else if (!exists || localStorage[topicKey] !== dataLocal) {
      localStorage.setItem(topicKey, dataLocal);
    }
  };
  /**
   * Get the value of gven local storage topic (key)
   *
   * @param {String} topic - local storage topic (key)
   * @return {String} value of local storage (or NULL if the topic is not in the local storage).
   */


  exports.get = function (topic) {
    var topicKey = _getLSTopicKey(topic);

    if (localStorage.hasOwnProperty(topicKey)) {
      var item = localStorage.getItem(topicKey);

      if (_isIE) {
        var start = item.indexOf(_browserID);

        if (start > -1) {
          item = item.substr(0, start);
        }
      }

      return item;
    }

    return null;
  };
  /**
   * Remove the given local storage topic (key)
   *
   * @param {String} topic - The local storage topic (key) to remove.
   */


  exports.removeItem = function (topic) {
    var keyName = _getLSTopicKey(topic);

    localStorage.removeItem(keyName);
  };
  /**
   * Publish in angular to support testing
   *
   * @memberof NgServices
   * @member localStorage
   *
   * @returns {localStorage} Reference to API Object.
   */


  app.factory('localStorage', [function () {
    return exports;
  }]);
  return exports;
});