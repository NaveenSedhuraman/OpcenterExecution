"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgElementDirectives.aw-header-subtitle}
 *
 * @module js/aw-header-subtitle.directive
 * @requires app
 */
define(['app', 'js/aw-include.directive', 'js/aw-header-context.directive', 'js/aw-repeat.directive'], function (app) {
  'use strict';
  /**
   * Directive to display the header subtitle for User/Group/Role etc.
   *
   * @example <aw-header-subtitle></aw-header-subtitle>
   *
   * @member aw-header-subtitle
   * @memberof NgElementDirectives
   */

  app.directive('awHeaderSubtitle', [function () {
    return {
      restrict: 'E',
      scope: {},
      controller: ['$scope', function ($scope) {}],
      templateUrl: app.getBaseUrlPath() + '/html/aw-header-subtitle.directive.html'
    };
  }]);
});