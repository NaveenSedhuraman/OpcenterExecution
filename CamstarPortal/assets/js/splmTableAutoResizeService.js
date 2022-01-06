"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service provides angular idle check to delay some critical watcher which impacts the performance
 *
 * @module js/splmTableAutoResizeService
 */
define(['app', 'lodash', 'js/eventBus', //
'js/awIdleWatcherService'], function (app, _, eventBus) {
  var _awIdleWatcherService = null;
  var exports = {};
  /**
   * NOTE: Please run classification tag while touch this file
   */

  exports.startResizeWatcher = function (tableScope, gridId) {
    _awIdleWatcherService.waitForPageToLoad().then(function () {
      var resizeCheckDebounce = _.debounce(function () {
        eventBus.publish(gridId + '.plTable.resizeCheck');
      }, 200);

      tableScope.$watch(function () {
        if (_awIdleWatcherService.isRunning() === false) {
          resizeCheckDebounce();
        }
      });
      tableScope.$on('$destroy', function () {
        resizeCheckDebounce.cancel();
      });
    });
  };

  app.factory('splmTableAutoResizeService', ['awIdleWatcherService', function (awIdleWatcherService) {
    _awIdleWatcherService = awIdleWatcherService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'splmTableAutoResizeService'
  };
});