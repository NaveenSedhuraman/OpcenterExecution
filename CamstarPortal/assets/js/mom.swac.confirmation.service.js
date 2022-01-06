"use strict";

// Copyright 2019 Siemens AG

/*global
 define,
 SWAC
 */

/**
 * This SWAC Service provides a way to show confirmation messages from a SWAC Component.
 * @module "js/mom.swac.confirmation.service"
 * @name "MOM.UI.Confirmation"
 * @requires app
 * @requires @swac/container
 * @requires js/eventBus
 * @requires js/NotyModule
 */
define(['app', '@swac/container', 'js/eventBus', 'js/NotyModule', 'js/mom.utils.service'], //
function (app, SWACKit) {
  'use strict';

  var exports = {};

  var _notyService;

  var _momUtilsService;

  var SWAC = new SWACKit();
  /**
   * The configuration of a confirmation button displayed in a confirmation message.
   * @typedef {Object} ConfirmationButton
   * @property {String} text The text to display in the button.
   * @property {String} id The ID that will be returned when the button is pressed
   */

  /**
   * Shows a confirmation message. By default, an **OK** button (id: **ok**) and a **Cancel** (id: **cancel**) button are displayed.
   * @param {String} title The title of the message _(currently not processed)_.
   * @param {String} message The message to show. it may contain HTML code.
   * @param {Object} opts Additional options and configuration. At present, only the **buttons** property
   * can be set to an array of [ConfirmationButton](#~ConfirmationButton) object.
   *
   * The default **buttons** configuration is the following:
   * ```
   * [
   *   {
   *     text: 'OK',
   *     id: 'ok'
   *   },
   *   {
   *     text: 'Cancel',
   *     id: 'cancel'
   *   }
   * ]
   * ```
   * @returns {Promise} A Promise fulfilled with an object containing the the **id** of the button that was pressed.
   *
   * Example: `{buttonId: 'ok'}`
   */

  exports.show = function (title, message, opts) {
    var options = opts || {};
    var defer = new SWAC.Defer();
    var i;
    var totalButtons;

    if (options.buttons) {
      totalButtons = options.buttons.length;

      for (i = 0; i < totalButtons; i++) {
        (function (index) {
          options.buttons[index].onClick = function ($noty) {
            $noty.close();
            defer.fulfill({
              buttonId: options.buttons[index].id
            });
          };

          options.buttons[index].text = options.buttons[index].text || options.buttons[index].displayName;
          options.buttons[index].addClass = "btn btn-notify";
        })(i);
      }

      _notyService.showWarning(message, options.buttons, options.data);
    } else {
      var buttons = [{
        "text": "OK",
        "onClick": function onClick($noty) {
          $noty.close();
          defer.fulfill({
            buttonId: 'ok'
          });
        },
        "addClass": "btn btn-notify"
      }, {
        "text": "Cancel",
        "onClick": function onClick($noty) {
          $noty.close();
          defer.fulfill({
            buttonId: 'cancel'
          });
        },
        "addClass": "btn btn-notify"
      }];

      _notyService.showWarning(message, buttons, options.data);
    }

    return defer.promise;
  };
  /**
   * Hides all currently-displayed messages.
   */


  exports.hide = function () {
    _momUtilsService.closeMessages();
  };

  app.factory('momSwacConfirmationService', ['notyService', 'momUtilsService', function (notyService, momUtilsService) {
    _notyService = notyService;
    _momUtilsService = momUtilsService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momSwacConfirmationService'
  };
});