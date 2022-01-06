"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display panel footer.
 *
 * @module js/aw-panel-footer.directive
 */
define(['app', //
'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * Directive to display panel footer.
   *
   * @example <aw-panel-footer></aw-panel-footer>
   *
   * @member aw-panel-footer
   * @memberof NgElementDirectives
   */

  app.directive('awPanelFooter', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="aw-layout-panelFooter" ng-transclude></div>',
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