"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
define
*/

/**
 * @module js/defaultLocationService
 */
define(['app', 'lodash', 'js/eventBus', 'js/appCtxService', 'js/keyboardService'], function (app, _, eventBus) {
  'use strict';

  var exports = {};

  var _state;

  var _appCtxSvc;

  var _keyboardSvc;

  exports.getCurrentState = function () {
    return _state.current;
  };

  exports.normalizeStateName = function () {
    return this.getCurrentState().parent.replace(/_/g, '.');
  };

  exports.subscribeForLocationUnloadEvent = function (name) {
    var locContUnLoadedSub = eventBus.subscribe(name + '.contentUnloaded', function () {
      _appCtxSvc.unRegisterCtx('locationContext');

      _keyboardSvc.unRegisterKeyDownEvent();

      eventBus.unsubscribe(locContUnLoadedSub);
    });
  };

  exports.updateTabs = function (data) {
    if (_.isObject(data)) {
      var stateName = this.getCurrentState().name;
      data.subLocationTabCond = data.subLocationTabCond || {};
      data.subLocationTabCond.currentTab = stateName;
    }
  };
  /**
   * @memberof NgServices
   * @member defaultLocationService
   *
   */


  app.factory('defaultLocationService', ['$state', 'appCtxService', 'keyboardService', function ($state, appCtxService, keyboardService) {
    _state = $state;
    _appCtxSvc = appCtxService;
    _keyboardSvc = keyboardService;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'defaultLocationService'
  };
});