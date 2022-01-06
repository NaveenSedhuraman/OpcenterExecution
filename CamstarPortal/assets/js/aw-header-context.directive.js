"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines the {@link NgElementDirectives.aw-header-context}
 *
 * @module js/aw-header-context.directive
 */
define(['app', 'js/aw-context-control.directive', 'js/appCtxService', 'js/aw-popup-command-bar.directive', 'js/aw-include.directive', 'js/aw-repeat.directive'], function (app) {
  'use strict';
  /**
   * Directive to display the header context for User/Group/Role etc.
   *
   *
   * @example <aw-header-context></aw-header-context>
   *
   * @member aw-header-context
   * @memberof NgElementDirectives
   */

  app.directive('awHeaderContext', ['appCtxService', function (appctxSvc) {
    return {
      restrict: 'E',
      scope: {
        subTitle: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-header-context.directive.html',
      controller: ['$scope', function ($scope) {
        /*
         * once the view model gets populated with the data , flag gets the value true
         */
        $scope.ctx = appctxSvc.ctx;
      }]
    };
  }]);
});