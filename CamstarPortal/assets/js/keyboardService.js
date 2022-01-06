"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/keyboardService
 */
define(['app', 'lodash', 'jquery'], //
function (app, _, $) {
  'use strict';
  /**
   * Define public API
   */

  var exports = {};
  exports.keyCmdIdMap = {
    67: ['Awp0Copy'],
    86: ['Awp0Paste'],
    88: ['Awp0Cut', 'Awb0RemoveElement']
  };
  /**
   * register keydown event
   */

  exports.registerKeyDownEvent = function () {
    // unregister key down event before registering it.
    exports.unRegisterKeyDownEvent();
    $('body').on('keydown', function (event) {
      exports.checkForPressedKey(event);
    });
  };
  /**
   * unRegister keydown event
   */


  exports.unRegisterKeyDownEvent = function () {
    $('body').off('keydown');
  };
  /**
   * Get text selected in browser
   *
   * @return selectedText
   */


  exports.getSelectionText = function () {
    var selectedText = '';

    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    }

    return selectedText;
  };
  /**
   * Check if selection/range is valid to process hotkey
   */


  exports.isSelectionValid = function (event) {
    var selectedText = exports.getSelectionText();

    if (selectedText === '') {
      var targetCss = event.target.getAttribute('class');

      if (!targetCss || targetCss.indexOf('aw-widgets-propertyEditValue') === -1 && targetCss.indexOf('aw-uiwidgets-searchBox') === -1) {
        return true;
      }
    }

    return false;
  };
  /**
   * check for pressed key and do necessary actions
   */


  exports.checkForPressedKey = function (event) {
    var keyId = event.which || event.keyCode;
    var ctrl = event.ctrlKey;

    if (ctrl && keyId !== 17) {
      var proceed = exports.isSelectionValid(event);

      if (proceed && exports.keyCmdIdMap[keyId]) {
        var cmdIds = exports.keyCmdIdMap[keyId];

        for (var i = 0; i < cmdIds.length; i++) {
          if (document.getElementById(cmdIds[i])) {
            document.getElementById(cmdIds[i]).click();
            break;
          }
        }
      }
    }
  };
  /**
   * This service provides helpful APIs to register key down event and handles ctrl+c, ctrl+v and ctrl+x keyboard
   * shortcuts.
   *
   * @memberof NgServices
   * @member keyboardService
   */


  app.factory('keyboardService', [function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'keyboardService'
  };
});