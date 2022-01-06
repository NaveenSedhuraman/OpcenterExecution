"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines controller for <aw-command> directive.
 *
 * @module js/aw-command.controller
 */
define(['app', 'lodash', 'js/eventBus', 'js/analyticsService', // requirejs injection
'js/appCtxService', 'js/popupService', // angular injection
'js/aw-popup-command-list.directive', 'js/aw-popup-panel.directive' // view dependencies
], function (app, _, eventBus, analyticsSvc) {
  'use strict';
  /**
   * Defines awCommand controller
   *
   * @member awCommandController
   * @memberof NgControllers
   */

  app.controller('awCommandController', ['$scope', '$element', '$timeout', '$q', 'appCtxService', 'popupService', function AwCommandController($scope, $element, $timeout, $q, appCtxService, popupSvc) {
    $scope.popupOpen = false;
    $scope.$on('visibleChildCommandsChanged', function () {
      if ($scope.popupOpen) {
        $scope.$broadcast('awPopupWidget.reposition', {
          popupUpLevelElement: $element
        });
      }
    });
    var activeCommandExecution = null;

    var getExecutePromise = function getExecutePromise($event) {
      // get viewport Dimension Offset for icon button from aw-command
      var viewportOffset = $element.find('div.aw-commandIcon')[0].getBoundingClientRect();
      var commandDimension = {
        popupId: $element.find('button.aw-commands-commandIconButton')[0].id,
        offsetHeight: viewportOffset.height,
        offsetLeft: viewportOffset.left,
        offsetTop: viewportOffset.top,
        offsetWidth: viewportOffset.width
      };
      return $q.resolve($scope.command.callbackApi.execute(commandDimension)).then(function (execResult) {
        // Emit an event for the command bar
        $scope.$emit('aw-command-executeCommand', $scope.command.commandId); // Logging for Analytics

        var commandLogData = {
          sanAnalyticsType: 'Commands',
          sanCommandId: $scope.command.commandId,
          sanCommandTitle: $scope.command.title
        };
        analyticsSvc.logCommands(commandLogData);
        eventBus.publish('aw-command-logEvent', commandLogData);
        eventBus.publish('removeMessages', {});

        if (execResult && execResult.showPopup) {
          var eventData = {
            popupUpLevelElement: $element
          };

          if ($scope.popupOpen) {
            $scope.$broadcast('awPopupWidget.close', eventData);
            $event.stopPropagation();
          } else {
            var revealPopup = function revealPopup() {
              // Reposition before opening to help avoid the flicker
              $scope.$broadcast('awPopupWidget.reposition', {
                popupUpLevelElement: $element
              });
              $scope.$broadcast('awPopupWidget.open', eventData);
              $scope.popupOpen = true;

              if (!$scope.command.isGroupCommand) {
                $scope.command.isSelected = true;
              }

              var popupCloseListener = $scope.$on('awPopupWidget.close', function () {
                $scope.popupOpen = false;

                if (!$scope.command.isGroupCommand) {
                  $scope.command.isSelected = false;
                }

                popupCloseListener();
              }); // for different site of location , we need to set different position of the popup widget

              $timeout(function () {
                var popupWidgetElem = $element.find('.aw-layout-popup.aw-layout-popupOverlay')[0];

                if (popupWidgetElem) {
                  var offsetWidth = popupWidgetElem.offsetWidth; // the drop down's offset height

                  var offsetHeight = popupWidgetElem.offsetHeight;

                  if ($scope.command.alignment === 'VERTICAL') {
                    popupSvc.resetPopupPosition($element, popupWidgetElem, offsetWidth, offsetHeight);
                  }
                }
              });
            };

            if (execResult.view && $scope.popupName !== execResult.view) {
              $scope.popupName = execResult.view; // Necessary to ensure ng-if condition has revealed the popup div

              $timeout().then(revealPopup);
            } else {
              revealPopup();
            }
          }
        }
      }).catch(function () {
        return $q.resolve();
      });
    };
    /**
     * Execute callback which needs to be triggered back to command handler
     *
     * @param {Object} $event - The click event
     * @returns {Promise<Void>} Promise resolved when command finishes executing
     */


    this.executeCommand = function ($event) {
      if (!activeCommandExecution) {
        activeCommandExecution = getExecutePromise($event).then(function () {
          return activeCommandExecution = null;
        });
      }

      return activeCommandExecution;
    };
  }]);
});