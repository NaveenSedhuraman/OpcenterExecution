"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/viewMode.service
 */
define(['app', 'lodash', 'js/appCtxService'], //
function (app, _) {
  'use strict';
  /**
   * View mode service
   *
   * @memberof NgServices
   */

  app.service('viewModeService', ['appCtxService', function (appCtxService) {
    var _viewModeContext = this._viewModeContext = 'ViewModeContext';

    var _availableViewModeContext = 'supportedViewModes';

    var _getViewModeContext = function _getViewModeContext() {
      var ctx = appCtxService.getCtx(_viewModeContext);
      return ctx ? ctx : {};
    };
    /**
     * Change view mode
     *
     * @param {String} newViewMode - View mode key to change to.
     */


    this.changeViewMode = function (viewMode) {
      var currentCtx = _getViewModeContext();

      currentCtx[_viewModeContext] = viewMode;
      appCtxService.registerCtx(_viewModeContext, currentCtx);
    };
    /**
     * Get the current view mode
     *
     * @return {String} The current view mode
     */


    this.getViewMode = function () {
      return _getViewModeContext()[_viewModeContext];
    };
    /**
     * Update which view modes are supported
     *
     * @param {String[]} viewModes - View modes that are available. Converted to Object to make conditions easier.
     */


    this.setAvailableViewModes = function (viewModes) {
      var currentCtx = _getViewModeContext(); // Convert array to object - makes declarative conditions simpler


      currentCtx[_availableViewModeContext] = {};

      if (_.isArray(viewModes)) {
        viewModes.map(function (x) {
          currentCtx[_availableViewModeContext][x] = {};
        });
      }

      appCtxService.updateCtx(_viewModeContext, currentCtx);
    };
    /**
     * Get the available view modes
     *
     * @return {String[]} The supported view modes
     */


    this.getAvailableViewModes = function () {
      var viewModes = _getViewModeContext()[_availableViewModeContext];

      return viewModes ? Object.keys(viewModes) : [];
    };
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'viewModeService'
  };
});