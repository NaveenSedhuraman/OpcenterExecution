"use strict";

/* Copyright 2019 Siemens Product Lifecycle Management Software Inc. */

/*global
 define
 */

/**
 * Directive to display notification cell
 *
 * @module js/aw-notification-cell.directive
 */
define(['app', 'jquery', 'js/eventBus', 'js/aw-row.directive', 'js/aw-click.directive', 'js/aw-cell-command-bar.directive', 'js/aw-clickable-title.directive', 'js/aw-include.directive', 'js/aw-repeat.directive', 'js/aw-class.directive', 'js/aw-icon.directive'], function (app, $, eventBus) {
  /**
   * Directive to display notification cell
   *
   * @example <aw-notification-cell vmo = "item"> </aw-notification-cell>
   *
   * @member aw-notification-cell
   */
  app.directive('awNotificationCell', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '<'
      },
      controller: ['$scope', function ($scope) {
        var notificationLevels = {
          high: 'high',
          medium: 'medium',
          low: 'low'
        };
        $scope.isHighNotificationlevel = $scope.vmo.notificationLevel === notificationLevels.high;
        $scope.isMediumNotificationlevel = $scope.vmo.notificationLevel === notificationLevels.medium;
        $scope.isLowNotificationlevel = $scope.vmo.notificationLevel === notificationLevels.low;
        $scope.isIconIncluded = $scope.vmo.typeIconURL !== undefined;
        $scope.isCustomViewIncluded = $scope.vmo.viewName !== undefined;

        $scope.onNotificationClickAction = function (selectedObject) {
          selectedObject.notificationRead = true;
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-notification-cell.directive.html'
    };
  }]);
});