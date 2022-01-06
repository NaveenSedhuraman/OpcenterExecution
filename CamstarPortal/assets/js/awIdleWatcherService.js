"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service provides angular idle check to delay some critical watcher which impacts the performance
 *
 * @module js/awIdleWatcherService
 */
define(['app', 'lodash', 'js/splmStatsTtiPolyfillService' //'js/splmStatsTtiPolyfill' //
], function (app, _, SPLMStatsTtiPolyfillSvc) {
  'use strict';

  var exports = {};

  exports.isRunning = function () {
    return SPLMStatsTtiPolyfillSvc.isRunning();
  };
  /**
   * Returns a promise
   * @returns {Promise} - Promise that can be .then() attached to do any work after resolving/rejecting
   */


  exports.waitForPageToLoad = function () {
    return SPLMStatsTtiPolyfillSvc.waitForPageToLoad();
  };
  /**
   * This service provides helpful APIs to register/unregister/update variables used to hold application state.
   *
   * @memberof NgServices
   * @member awNgIdleService
   *
   *
   * @returns {awNgIdleService} Reference to service's API object.
   */


  app.factory('awIdleWatcherService', [//
  function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'awIdleWatcherService'
  };
});