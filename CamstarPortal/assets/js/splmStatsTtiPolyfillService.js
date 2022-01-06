"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * A modified version of tti-profill done by BigClayClay - Handles the 'handling' for Ttipolyfill
 * 
 * https://github.com/GoogleChromeLabs/tti-polyfill
 *
 * @module js/splmStatsTtiPolyfillService
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'lodash', 'js/logger', 'js/eventBus', 'js/splmStatsXhrService', 'js/splmStatsConstants', 'js/splmStatsTtiPolyfill'], function (app, _, logger, eventBus, splmStatsXhrService, _t, splmStatsTtiPolyfill) {
  'use strict';

  var exports = {};
  var _ttiPolyfill = null;
  var _deferredPromise = null;

  exports.getCurrentPromise = function () {
    return _deferredPromise;
  };

  exports.isRunning = function () {
    if (_ttiPolyfill && _ttiPolyfill.isRunning()) {
      return true;
    }

    return false;
  };

  exports.waitForPageToLoad = function () {
    if (!_ttiPolyfill) {
      _deferredPromise = null;
      _ttiPolyfill = new splmStatsTtiPolyfill();
      _deferredPromise = _ttiPolyfill.waitForPageToLoad();

      _deferredPromise.then(function () {
        _ttiPolyfill = null;
      });
    }

    return _deferredPromise;
  };

  exports.resetPingBusyDebounce = function () {
    if (exports.isRunning()) {
      _ttiPolyfill.resetPingBusyDebounce();
    }
  };

  return exports;
});