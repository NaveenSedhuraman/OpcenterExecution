"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support arrange cell implementation.
 *
 * @module js/arrange-cell.directive
 */
define(['app', 'js/eventBus', 'js/aw-list.controller'], function (app, eventBus) {
  'use strict';
  /**
   * Directive for arrange cell implementation.
   *
   * @member arrangeCell
   * @memberof NgElementDirectives
   */

  app.directive('arrangeCell', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.$watch('vmo.visible', function watchColumnDefVisibility() {
          $scope.vmo.hiddenFlag = !$scope.vmo.visible;
          eventBus.publish('columnVisibilityChanged', $scope.vmo);
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/arrange-cell.directive.html'
    };
  }]);
});