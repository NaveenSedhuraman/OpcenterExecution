"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * This SWAC Service provides a way for a SWAC Component to show a notification message.
 * @module "js/mom.swac.notification.service"
 * @name "MOM.UI.Notification"
 * @requires app
 * @require js/NotyModule
 */
define(['app', 'js/NotyModule', 'js/mom.utils.service'], //
function (app) {
  'use strict';

  var exports = {};

  var _notificationService;

  var _momUtilsService;
  /**
   * Shows a notification message.
   * @param {String} title The title of the message _(currently not processed)_.
   * @param {String} message The message to show. it may contain HTML code.
   * @param {Object} opts Additional options _(currently not processed)_.
   */


  exports.show = function (title, message, opts) {
    var options = opts || {};

    _notificationService.showInfo(message, options.data);
  };
  /**
   * Hides all currently-displayed messages.
   */


  exports.hide = function () {
    _momUtilsService.closeMessages();
  };

  app.factory('momSwacNotificationService', ['notyService', 'momUtilsService', function (notificationService, momUtilsService) {
    _notificationService = notificationService;
    _momUtilsService = momUtilsService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacNotificationService'
  };
});