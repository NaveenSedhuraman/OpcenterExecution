"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/**
 *
 * @module js/splmStatsXhrService
 */
define(['app', 'lodash', 'js/logger', 'js/browserUtils', 'js/splmStatsJsService'], function (app, _, logger, browserUtils, splmStatsJsService) {
  'use strict';

  var exports = {};
  var _procs = [];
  var _xhrCounter = 0;
  var _realOpen = null;
  var _xhrSender = null;
  var _enabled = false;
  var _mainProc = null;

  exports.getCount = function () {
    return _xhrCounter;
  };

  exports.setMainProc = function (processor) {
    _mainProc = processor;
  };

  exports.install = function () {
    if (!_enabled) {
      _realOpen = XMLHttpRequest.prototype.open;

      XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        _xhrCounter++; //Try to add as early as possible to avoid pre-finishing pollyfill

        _realOpen.call(this, method, url, async, user, password);

        this.requestURL = url;
      };

      _xhrSender = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.send = function (data) {
        var xhr = this;
        _xhrCounter++; // Side Effect fix (helper) - More accurate to have +1 on open and +1 on send and then -2 on receive response

        xhr.addEventListener('readystatechange', function () {
          if (xhr.readyState === 4) {
            _xhrCounter -= 2;
          }
        });

        if (splmStatsJsService.enabled()) {
          xhr.onload = splmStatsJsService.wrapFunction(xhr, xhr.onload, xhr.requestURL);
        }

        try {
          if (_mainProc) {
            _mainProc(xhr, data);
          }
        } catch (error) {
          logger.warn(error);
        }

        _xhrSender.call(xhr, data);
      };

      _enabled = true;
    }
  };

  exports.uninstall = function () {
    return true;
  };

  exports.addProc = function (proc) {
    _procs.push(proc);
  };

  exports.removeProc = function (proc) {
    _procs = _.filter(_procs, function (procObj) {
      return proc !== procObj;
    });
  };

  exports.install();
  return exports;
});