"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show commands inside a cell template of list.
 *
 * @module js/aw-list-command.directive
 */
define(['app', //
'js/conditionService', 'js/viewModelService', //
'js/aw-list-command.controller', 'js/aw-icon.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to show commands inside a cell template of list.
   *
   * @example <aw-list-command command="command" />
   *
   * @member aw-list-command
   * @memberof NgElementDirectives
   */

  app.directive('awListCommand', ['viewModelService', 'conditionService', '$sce', function (viewModelSvc, conditionSvc, $sce) {
    return {
      restrict: 'E',
      scope: {
        command: '=',
        vmo: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-list-command.directive.html',
      controller: 'awListCommandController',
      link: function link($scope, $element, attrs, ctrl) {
        ctrl.setCommandContext();

        if ($scope.command.action) {
          if ($scope.command.condition) {
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            var evaluationEnv = {
              data: declViewModel,
              ctx: $scope.ctx,
              conditions: declViewModel._internal.conditionStates
            };
            $scope.cellCommandVisiblilty = conditionSvc.evaluateCondition(declViewModel, $scope.command.condition, evaluationEnv);
          } else {
            $scope.cellCommandVisiblilty = true;
          }
        }
        /**
         * Listener for cell rendered event
         */


        $scope.$on('cell.rendered', function () {
          ctrl.setCommandContext();
        });
        /**
         * Updates the command icon
         *
         * @param newVal The new value of visible flag
         * @param oldVal The old value of visible flag
         */

        var commandIconLstnr = $scope.$watch('command.icon', function (newVal) {
          // Sanitize the command icon and set on scope
          $scope.safeIcon = $sce.trustAsHtml(newVal);
        });
        $scope.$on('$destroy', function () {
          if (commandIconLstnr) {
            commandIconLstnr();
          }
        });
      }
    };
  }]);
});