"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgElementDirectives.aw-global-navigation}
 *
 * @module js/aw-global-navigation.directive
 */
define(['app', 'js/aw-row.directive', 'js/aw-column.directive', 'js/aw-include.directive', 'js/aw-sidenav.directive'], function (app) {
  'use strict';
  /**
   * Directive to display the global navigation toolbar.
   * @example <aw-global-navigation></aw-global-navigation>
   *
   * @member aw-global-navigation
   * @memberof NgElementDirectives
   */

  app.directive('awGlobalNavigation', //
  ['appCtxService', '$timeout', function (appCtxService, $timeout) {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        toolbarView: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-global-navigation.directive.html',
      link: function link($scope, elem, attr) {
        $scope.sideNavData = {
          slide: 'FLOAT',
          direction: 'LEFT_TO_RIGHT',
          animation: true,
          width: 'STANDARD',
          height: 'FULL',
          isPinnable: true
        };
      },
      controller: ['$scope', function ($scope) {
        $scope.ctx = appCtxService.ctx;
      }]
    };
  }]);
});