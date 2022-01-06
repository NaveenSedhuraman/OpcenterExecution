"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display radio button.
 *
 * @module js/aw-radiobutton.directive
 */
define(['app', //
'js/aw-property-radio-button-val.directive', //
'js/aw-property-label.directive', 'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * Directive to display radio button.
   *
   * @example <aw-radiobutton></aw-radiobutton>
   *
   * @member aw-radiobutton
   * @memberof NgElementDirectives
   */

  app.directive('awRadiobutton', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      scope: {
        action: '@?',
        prop: '=',
        list: '=?'
      },
      controller: ['$scope', function ($scope) {
        if ($scope.action) {
          $scope.$watch('prop.dbValue', function (newValue) {
            if (newValue !== undefined) {
              var declViewModel = viewModelSvc.getViewModel($scope, true);
              viewModelSvc.executeCommand(declViewModel, $scope.action, $scope);
            }
          });
        }
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-radiobutton.directive.html'
    };
  }]);
});