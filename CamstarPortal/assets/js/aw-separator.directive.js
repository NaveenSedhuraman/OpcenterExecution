"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a break xrt styling.
 *
 * @module js/aw-separator.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to display a break xrt styling.
   *
   * @example <aw-separator></aw-separator>
   *
   * @member aw-separator
   * @memberof NgElementDirectives
   */

  app.directive('awSeparator', [function () {
    return {
      restrict: 'E',
      template: '<div class="aw-xrt-separator aw-theme-separator"></div>',
      replace: true
    };
  }]);
});