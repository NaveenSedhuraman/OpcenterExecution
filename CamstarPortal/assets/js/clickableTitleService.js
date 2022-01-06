"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service for clickable cell titles
 *
 * @module js/clickableTitleService
 */
define(['app', 'js/configurationService', //
'js/appCtxService', 'js/command.service'], //
function (app, configurationSvc) {
  'use strict';
  /**
   * clickableTitleService factory
   */

  app.factory('clickableTitleService', ['$timeout', 'commandService', function ($timeout, commandService) {
    var exports = {};
    var timeoutPromise;
    var isDoubleClick;
    /**
     * Returns whether clickable cell title actions have been configured or not
     *
     * @return {Boolean} true if clickable cell title actions have been configured in the solution def
     */

    exports.hasClickableCellTitleActions = function () {
      return Boolean(exports.getClickableCellTitleActions());
    };
    /**
     * Get the commands configured against different types of clicks from the solution defintion
     * @return {Object} clickableCellTitleActions json object holding command id for different types of clicks
    -*/


    exports.getClickableCellTitleActions = function () {
      var solDef = configurationSvc.getCfgCached('solutionDef');
      return solDef ? solDef.clickableCellTitleActions : null;
    };
    /**
     * Executes appropriate action on click as configured in clickable cell title actions
     *
     * @param {Object} $event - click event
     * @param {Object} context - additional context to execute the command with
     */


    exports.doIt = function ($event, context) {
      $event.stopPropagation();
      var event = $event;

      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
        isDoubleClick = true;
      }

      var clickableCellTitleActions = exports.getClickableCellTitleActions();
      timeoutPromise = $timeout(function () {
        var clickType = isDoubleClick ? 'doubleClick' : event.ctrlKey ? 'ctrlClick' : event.shiftKey ? 'shiftClick' : 'click';
        isDoubleClick = false;
        timeoutPromise = null; // execute command for click or ctrl click or shift click or double click accordingly

        if (clickableCellTitleActions) {
          commandService.executeCommand(clickableCellTitleActions[clickType], null, null, context);
        }
      }, 300);
    };

    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'clickableTitleService'
  };
});