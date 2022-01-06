"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way to set and retrieve the current theme from a SWAC Component
 * @module "js/mom.swac.theme.service"
 * @name "MOM.UI.Theme"
 * @requires app
 * @requires js/theme.service
 */
define(['app', 'js/theme.service'], //
function (app) {
  'use strict';

  var exports = {};

  var _themeSvc;
  /**
   * Sets the current theme.
   * @param {String} theme The theme to apply. It can be set to **ui-lightTheme* or **ui-darkTheme**.
   */


  exports.set = function (theme) {
    if (theme.match(/dark/)) {
      _themeSvc.setTheme('ui-darkTheme');
    } else {
      _themeSvc.setTheme('ui-LightTheme');
    }
  };
  /**
   * Retrieves the ID of the current theme.
   * @returns {String} The ID of the current theme (**ui-lightTheme** or **ui-darkTheme**).
   */


  exports.get = function () {
    return _themeSvc.getTheme();
  };

  app.factory('momSwacThemeService', ['themeService', function (themeService) {
    _themeSvc = themeService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacThemeService'
  };
});