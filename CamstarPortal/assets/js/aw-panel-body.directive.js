"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display panel body.
 *
 * @module js/aw-panel-body.directive
 */
define(['app', //
'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * Directive to display panel body.
   *
   * @example <aw-panel-body></aw-panel-body>
   *
   * @member aw-panel-body
   * @memberof NgElementDirectives
   */

  app.directive('awPanelBody', ['viewModelService', function (viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      template: '<form name="awPanelBody"  class="aw-layout-panelBody aw-base-scrollPanel" ng-class="{\'aw-layout-flexColumn\': noScroll}" ng-transclude novalidate></form>',
      controller: ['$scope', function ($scope) {
        var declViewModel = viewModelSvc.getViewModel($scope, true);
        $scope.conditions = declViewModel.getConditionStates();
      }],
      link: function link(scope, element, attr) {
        if (attr.scrollable === 'false') {
          scope.noScroll = true;
        } else {
          scope.noScroll = false;
        }
      },
      replace: true
    };
  }]);
});