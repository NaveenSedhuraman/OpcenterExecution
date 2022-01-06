"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display the selection summary of multiple model objects.
 *
 * @module js/aw-base-sublocation.directive
 * @requires app
 */
define(['app', 'js/aw.base.sublocation.controller', 'js/aw-sublocation.directive', 'js/aw-transclude-replace.directive'], function (app) {
  'use strict';
  /**
   * Directive to display the selection summary of multiple model objects.
   *
   * @example <aw-base-sublocation>My content here!</aw-base-sublocation>
   *
   * @member aw-base-sublocation
   * @memberof NgElementDirectives
   */

  app.directive('awBaseSublocation', [function () {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-base-sublocation.directive.html',
      transclude: true,
      scope: {
        provider: '=',
        baseSelection: '=?'
      },
      controller: 'BaseSubLocationCtrl'
    };
  }]);
});