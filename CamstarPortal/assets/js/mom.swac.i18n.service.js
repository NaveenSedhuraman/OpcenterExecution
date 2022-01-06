"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way to set and retrieve the current locale from a SWAC Component
 * @module "js/mom.swac.i18n.service"
 * @name "MOM.UI.I18n"
 * @requires app
 * @requires js/eventBus
 * @requires js/localeService
 */
define(['app', 'js/eventBus', 'js/localeService'], //
function (app) {
  'use strict';

  var exports = {};

  var _localeService;
  /**
   * Sets the current locale.
   * @param {String} code A valid locale code (e.g. en, en_US, fr_FR, zh_CN, etc.).
   */


  exports.set = function (code) {
    _localeService.setLocale(code);
  };
  /**
   * Retrieves the current locale code.
   * @returns {String} The current locale code.
   */


  exports.get = function () {
    return _localeService.getLocale();
  };

  app.factory('momSwacI18nService', ['localeService', function (localeService) {
    _localeService = localeService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacI18nService'
  };
});