"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support default cell implementation.
 *
 * @module js/aw-default-cell.directive
 */
define(['app', //
'js/aw-model-icon.directive', 'js/aw-default-cell-content.directive'], //
function (app) {
  'use strict';
  /**
   * Directive for default cell implementation.
   *
   * @example <aw-default-cell vmo="model"></aw-default-cell>
   * @example <aw-default-cell vmo="model" hideoverlay="true"></aw-default-cell>
   *
   * @member aw-default-cell
   * @memberof NgElementDirectives
   */

  app.directive('awDefaultCell', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '=',
        hideoverlay: '<?'
      },
      transclude: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-default-cell.directive.html'
    };
  }]);
});