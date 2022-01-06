"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display panel header.
 *
 * @module js/aw-panel-header.directive
 */
define(['app', //
'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * Directive to display panel header.
   *
   * @example <aw-panel-header></aw-panel-header>
   *
   * @member aw-panel-header
   * @memberof NgElementDirectives
   */

  app.directive('awPanelHeader', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="aw-layout-panelHeader" ng-transclude></div>',
      controller: ['$scope', function ($scope) {
        var declViewModel = viewModelSvc.getViewModel($scope, true);

        if (declViewModel) {
          $scope.conditions = declViewModel.getConditionStates();
        }
      }],
      replace: true
    };
  }]);
});