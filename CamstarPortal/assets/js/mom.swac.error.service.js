"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way to show error messages from a SWAC Component.
 * @module "js/mom.swac.error.service"
 * @name "MOM.UI.Error"
 * @requires app
 * @requires js/messagingService
 */
define(['app', 'js/messagingService', 'js/mom.utils.service'], //
function (app) {
  'use strict';

  var exports = {};

  var _messagingService;

  var _momUtilsService;
  /**
   * Shows an error message.
   * @param {String} title The title of the message _(currently not processed)_.
   * @param {String} message The message to show. it may contain HTML code.
   * @param {Object} opts Additional options _(currently not processed)_.
   */


  exports.show = function (title, message, opts) {
    var options = opts || {};

    _messagingService.showError(message, options.data);
  };
  /**
   * Hides all currently-displayed messages.
   */


  exports.hide = function () {
    _momUtilsService.closeMessages();
  };

  app.factory('momSwacErrorService', ['messagingService', 'momUtilsService', function (messagingService, momUtilsService) {
    _messagingService = messagingService;
    _momUtilsService = momUtilsService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacErrorService'
  };
});