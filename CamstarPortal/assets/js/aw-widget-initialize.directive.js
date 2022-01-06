"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the 'aw-widget-initialize' directive used to initialize widget.
 *
 * @module js/aw-widget-initialize.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Definition for the 'aw-widget-initialize' directive used to initialize widget.
   *
   * @example TODO
   *
   * @member aw-widget-initialize
   * @memberof NgAttributeDirectives
   */

  app.directive('awWidgetInitialize', //
  function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function link($scope, $element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }

        $scope.$watch(function _watchParentProp() {
          return $scope.$parent.prop === undefined ? '' : $scope.$parent.prop.initialize;
        }, function (newValue) {
          if (newValue) {
            // when widget is initializing set pristine so that it clears out dirty flags
            ngModelCtrl.$setPristine();
            $scope.$parent.prop.initialize = false;
          }
        });
      }
    };
  });
});