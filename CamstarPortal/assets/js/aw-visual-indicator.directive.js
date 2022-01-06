"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support visual indicator implementation.
 *
 * @module js/aw-visual-indicator.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive for visual indicator implementation.
   *
   * @example <aw-visual-indicator vmo="model"></aw-visual-indicator>
   *
   * @member aw-visual-indicator
   * @memberof NgElementDirectives
   */

  app.directive('awVisualIndicator', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-visual-indicator.directive.html'
    };
  }]);
});