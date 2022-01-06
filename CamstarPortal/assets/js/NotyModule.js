"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define requirejs */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/NotyModule
 */
define(['app', 'js/eventBus', 'js/iconService', 'js/theme.service', 'js/sanitizer', 'soa/preferenceService'], function (app, eventBus) {
  'use strict';
  /**
   * @memberof NgServices
   * @member notyService
   */

  app.factory('notyService', ['sanitizer', 'soa_preferenceService', 'iconService', 'themeService', function (sanitizer, prefSvc, iconSvc, themeSvc) {
    var exports = {
        timeout: 6000,
        speed: 10
    };
    /**
     * @param {String} notyMessage - noty message
     */

    function renderMessage(notyMessage) {
      // don't load jquery.noty.customized until it's actually needed
      requirejs(['js/jquery.noty.customized'], function (notyRenderer) {
        if (notyMessage && notyMessage.type !== 'warning') {
          eventBus.subscribe('removeMessages', function () {
            notyRenderer.close();
          });
        }

        notyRenderer.setIconService(iconSvc);
        notyRenderer.init(notyMessage);
      });
    }
    /**
     * setting notification timeout's preference value
     *
     * @return {Promise} promise
     */


    function getTimeoutfromPref() {
      return prefSvc.getStringValue('AWC_Notification_Timeout').then(function (result) {
        var timeout;

        if (result) {
          result = parseInt(result);

          if (!isNaN(result) && result > 0) {
            timeout = result * 1000;
          } else if (result <= 0) {
            timeout = 0;
          }

          exports.timeout = timeout;
          eventBus.unsubscribe('bulkPreferencesLoaded');
          return true;
        }

        return false;
      });
    }
    /**
     * HTML-escapes a string, but does not double-escape HTML-entities already present in the string.
     *
     * @param {String} message - Message to parse.
     * @return {String} Returns escaped and safe HTML.
     */


    function parseMessage(message) {
      var escapedStr = '';
      var parsedHtml = null;

      if (message) {
        escapedStr = message.replace(/(<br|<\/br)\s*[/]?>/gi, '\n');
        parsedHtml = sanitizer.htmlEscapeAllowEntities(escapedStr, true, true);
        return parsedHtml;
      }

      return message;
    }

    getTimeoutfromPref().then(function (result) {
      if (!result) {
        // sets the notification timeout's preference value only after preference get loaded
        eventBus.subscribe('bulkPreferencesLoaded', function () {
          getTimeoutfromPref();
        });
      }
    });
    /**
     * Report an 'informational' type pop up message using 'NotyJS' API.
     *
     * @param {String} message - Message to display.
     * @param {String} messageData - data to pass along with noty message
     */

    exports.showInfo = function (message, messageData) {
      var sanitizedMessage = sanitizer.sanitizeHtmlValue(message);
      var parsedHtml = parseMessage(sanitizedMessage);
      var currentTheme = themeSvc.getTheme() ? themeSvc.getTheme() : 'lightTheme';
      var notyMessage = {
        layout: 'bottom',
        theme: currentTheme,
        type: 'information',
        // Do not pass in escaped or safe html string in case of custom message.
        text: messageData ? sanitizedMessage : parsedHtml,
        dismissQueue: true,
        maxVisible: 3,
        closeWith: ['X', 'stayOnClick'],
        animation: {
          open: {
            height: 'toggle'
          },
          close: {
            height: 'toggle'
          },
          easing: 'swing',
          speed: exports.speed
        },
        timeout: exports.timeout,
        messageData: messageData
      };
      renderMessage(notyMessage);
    };
    /**
     * Report an 'alert' type pop up message using 'NotyJS' API.
     *
     * @param {String} message - Message to display.
     * @param {String} messageData - data to pass along with noty message
     */


    exports.showAlert = function (message, messageData) {
      var sanitizedMessage = sanitizer.sanitizeHtmlValue(message);
      var parsedHtml = parseMessage(sanitizedMessage);
      var currentTheme = themeSvc.getTheme() ? themeSvc.getTheme() : 'lightTheme';
      var notyMessage = {
        layout: 'bottom',
        theme: currentTheme,
        type: 'alert',
        // Do not pass in escaped or safe html string in case of custom message.
        text: messageData ? sanitizedMessage : parsedHtml,
        dismissQueue: true,
        maxVisible: 3,
        closeWith: ['X', 'stayOnClick'],
        animation: {
          open: {
            height: 'toggle'
          },
          close: {
            height: 'toggle'
          },
          easing: 'swing',
          speed: exports.speed
        },
        timeout: exports.timeout,
        messageData: messageData
      };
      renderMessage(notyMessage);
    };
    /**
     * Report an 'warning' type pop up message using 'NotyJS' API.
     *
     * @param {String} message - Message to display.
     * @param {Object} buttonsArr - Array of buttons as user options
     * @param {String} messageData - data to pass along with noty message
     */


    exports.showWarning = function (message, buttonsArr, messageData) {
      var sanitizedMessage = sanitizer.sanitizeHtmlValue(message);
      var parsedHtml = parseMessage(sanitizedMessage);
      var currentTheme = themeSvc.getTheme() ? themeSvc.getTheme() : 'lightTheme';
      var notyMessage = {
        layout: 'bottom',
        theme: currentTheme,
        type: 'warning',
        // Do not pass in escaped or safe html string in case of custom message.
        text: messageData ? sanitizedMessage : parsedHtml,
        dismissQueue: true,
        modal: true,
        buttons: buttonsArr,
        animation: {
          open: {
            height: 'toggle'
          },
          close: {
            height: 'toggle'
          },
          easing: 'swing',
          speed: exports.speed
        },
        timeout: false,
        messageData: messageData
      };
      renderMessage(notyMessage);
    };
    /**
     * Report an 'error' type pop up message using 'NotyJS' API.
     *
     * @param {String} message - Message to display.
     * @param {String} messageData - data to pass along with noty message
     */


    exports.showError = function (message, messageData) {
      var sanitizedMessage = sanitizer.sanitizeHtmlValue(message);
      var parsedHtml = parseMessage(sanitizedMessage);
      var currentTheme = themeSvc.getTheme() ? themeSvc.getTheme() : 'lightTheme';
      var notyMessage = {
        layout: 'bottom',
        theme: currentTheme,
        type: 'error',
        // Do not pass in escaped or safe html string in case of custom message.
        text: messageData ? sanitizedMessage : parsedHtml,
        dismissQueue: true,
        maxVisible: 3,
        modal: false,
        closeWith: ['X', 'stayOnClick'],
        animation: {
          open: {
            height: 'toggle'
          },
          close: {
            height: 'toggle'
          },
          easing: 'swing',
          speed: exports.speed
        },
        timeout: exports.timeout * 10,
        messageData: messageData
      };
      renderMessage(notyMessage);
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'notyService'
  };
});