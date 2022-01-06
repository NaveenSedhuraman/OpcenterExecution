"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to create the command cell which can be shown in a popup container
 *
 * @module js/aw-popup-command-cell.directive
 */
define(['app', 'angular', 'lodash', 'jquery', 'js/eventBus', 'js/analyticsService', 'js/aw-command.directive', 'js/extended-tooltip.directive'], //
function (app, ngModule, _, $, eventBus, analyticsSvc) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Display for a command within a popup
   *
   * @example <aw-popup-command-cell prop="prop"></aw-popup-command-cell>
   *
   * @member aw-popup-command-cell
   * @memberof NgElementDirectives
   */

  app.directive('awPopupCommandCell', [function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        prop: '=',
        closeOnClick: '=?'
      },
      templateUrl: function templateUrl() {
        return app.getBaseUrlPath() + '/html/aw-popup-command-cell.directive.html';
      },
      controllerAs: 'ctrl',
      controller: ['$scope', '$q', function AwPopupCommandCellController($scope, $q) {
        var execPromise = null;
        /**
         * if the command is child command in the popup list, then do excuteGroupChildCommand function
         *
         * @param {Event} $event - event object which is passed from angular template
         * @param {Object} command - command to execute
         */

        this.executeGroupChildCommand = function ($event, command) {
          $event.stopPropagation();

          if (command.callbackApi) {
            if (!execPromise) {
              // Trigger command handlers execute method
              // Emit an event to tell aw-command to prevent close of the popup
              eventBus.publish(command.parentGroupId + '.popupCommandExecuteStart', command.commandId);
              execPromise = $q.resolve(command.callbackApi.execute()).then(function () {
                // Allow the popup to close
                execPromise = null;
                eventBus.publish(command.parentGroupId + '.popupCommandExecuteEnd', command.commandId);

                if ($scope.closeOnClick !== false) {
                  eventBus.publish('awPopupWidget.close', $event);
                }
              }).catch(function () {
                // Allow the popup to close
                execPromise = null;
                eventBus.publish(command.parentGroupId + '.popupCommandExecuteEnd', command.commandId);

                if ($scope.closeOnClick !== false) {
                  eventBus.publish('awPopupWidget.close', $event);
                }
              });
            }
          } else {
            eventBus.publish('aw-popup-selectionChange', command);
          } // Log the popup command details to Analytics


          var sanPopupCmdLogData = {
            sanAnalyticsType: 'Popup Commands',
            sanCommandId: command.commandId,
            sanCommandTitle: command.title
          };
          eventBus.publish('aw-command-logEvent', sanPopupCmdLogData);
          analyticsSvc.logCommands(sanPopupCmdLogData);
        };
      }]
    };
  }]); // End RequireJS Define
});