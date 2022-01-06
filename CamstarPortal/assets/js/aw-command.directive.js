"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show commands inside a cell template of list.
 *
 * @module js/aw-command.directive
 */
define(['app', 'angular', 'lodash', 'js/eventBus', 'js/aw-command.controller', 'js/aw-popup-command-list.directive', 'js/aw-popup-panel.directive', 'js/aw-icon.directive', 'js/appCtxService', 'js/aw-include.directive', 'js/aw-click.directive', 'js/aw-popup-command-bar.directive', 'js/extended-tooltip.directive'], function (app, ngModule, _, eventBus) {
  'use strict';
  /**
   * Directive to show commands inside a cell template of list.
   *
   * @example <aw-command command="command" />
   *
   * @member awCommand
   * @memberof NgElementDirectives
   */

  app.directive('awCommand', ['$sce', '$compile', 'appCtxService', function ($sce, $compile, appCtx) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-command.directive.html',
      controllerAs: 'ctrl',
      controller: 'awCommandController',
      link: function link($scope, $element) {
        /**
         * {ObjectArray} Collection of eventBus subscription definitions to be un-subscribed from when
         * this controller's $scope is later destroyed.
         */
        var _eventBusSubDefs = [];
        /**
         * Set element title to command title. Done here instead of on button to
         * support title on disabled commands
         *
         * @param t Command title
         */

        $scope.$watch('command.title', function _updateElementTitle(t) {
          $element.prop('title', t);
        });
        /**
         * Updates the command icon
         *
         * @param newVal The new value of visible flag
         */

        $scope.$watch('command.icon', function _watchCommandIcon(newVal) {
          // Sanitize the command icon and set on scope
          $scope.safeIcon = $sce.trustAsHtml(newVal);
        });
        /**
         * Note: This relies on $scope.command.template already being set. Checking initially allows us to avoid a
         * watch that is only necessary in very specific cases. This will not work when aw-command is virtualized
         * (inside of a table for example)
         */

        if ($scope.command.template) {
          var childScope = null;
          var childElement = null;
          var templateParent = ngModule.element($element.find('#commandTemplate')[0]);
          $scope.$watch('command.template', function _watchCommandTemplate(childElementHtml) {
            // Clear out current contents and destroy child scope
            templateParent.empty();

            if (childScope) {
              childScope.$destroy();
            } // Compile the new contents with a new child scope


            childScope = $scope.$new();
            childScope.ctx = appCtx.ctx;
            childElement = $compile(childElementHtml)(childScope);
            templateParent.append(childElement);
          });
        }
        /**
         * Don't allow group command popup to close while a command is executing
         */


        _eventBusSubDefs.push(eventBus.subscribe($scope.command.commandId + '.popupCommandExecuteStart', function () {
          $scope.enablePopupClose = false;
        }));

        _eventBusSubDefs.push(eventBus.subscribe($scope.command.commandId + '.popupCommandExecuteEnd', function () {
          $scope.enablePopupClose = true;
        }));

        $scope.$on('$destroy', function () {
          _.forEach(_eventBusSubDefs, function (subDef) {
            eventBus.unsubscribe(subDef);
          });
        });
      }
    };
  }]);
});