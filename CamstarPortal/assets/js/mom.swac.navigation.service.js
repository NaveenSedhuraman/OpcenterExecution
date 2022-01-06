"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way for a SWAC Component to navigate to another Apollo screen.
 * @module "js/mom.swac.navigation.service"
 * @name "MOM.UI.Navigation"
 * @requires app
 */
define(['app'], //
function (app) {
  'use strict';

  var exports = {};

  var _state;
  /**
   * Navigates to another state.
   * @param {String} state The ID of the state to navigate to.
   * @param {Object} [params={}] The parameters to pass to the state.
   * @param {Object} [options={}] Additional options. Currently the following properties are supported:
   * * **reload**: If set to **true**, forces the state to be reloaded even if not necessary (e.g. for a navigation to the current state).
   * * **notify**: If set to **false**, no internal events will be broadcasted when navigating to the new state.
   */


  exports.navigateTo = function (id, params, options) {
    _state.go(id, params, options);
  };

  app.factory('momSwacNavigationService', ['$state', function (state) {
    _state = state;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacNavigationService'
  };
});