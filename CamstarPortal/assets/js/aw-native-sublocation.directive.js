"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display the selection summary of multiple model objects.
 *
 * @module js/aw-native-sublocation.directive
 */
define(['app', 'angular', 'js/aw.native.sublocation.controller', 'js/aw-workarea-title.directive', 'js/aw-primary-workarea.directive', 'js/aw-secondary-workarea.directive', 'js/aw-sublocation.directive', 'js/aw-splitter.directive'], function (app, ngModule) {
  'use strict';
  /**
   * Directive to display the selection summary of multiple model objects.
   *
   * @example <aw-native-sublocation>My content here!</aw-native-sublocation>
   *
   * @member aw-native-sublocation
   * @memberof NgElementDirectives
   */

  app.directive('awNativeSublocation', [function () {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw.native.sublocation.html',
      transclude: true,
      scope: {
        provider: '=',
        baseSelection: '=?',
        showBaseSelection: '=?',
        controller: '@?'
      },
      controller: ['$scope', '$controller', function ($scope, $controller) {
        var ctrl = this;
        ngModule.extend(ctrl, $controller($scope.hasOwnProperty('controller') ? $scope.controller : 'NativeSubLocationCtrl', {
          $scope: $scope
        }));
      }]
    };
  }]);
});