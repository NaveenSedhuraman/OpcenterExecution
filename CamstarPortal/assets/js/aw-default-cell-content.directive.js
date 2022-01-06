"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support default cell content implementation.
 *
 * @module js/aw-default-cell-content.directive
 */
define(['app', 'js/aw-visual-indicator.directive', 'js/aw-highlight-property-html.directive', 'js/aw-clickable-title.directive'], function (app) {
  'use strict';
  /**
   * Directive for default cell content implementation.
   *
   * @example <aw-default-cell-content vmo="model"></aw-default-cell-content>
   *
   * @member aw-default-cell-content
   * @memberof NgElementDirectives
   */

  app.directive('awDefaultCellContent', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-default-cell-content.directive.html'
    };
  }]);
});