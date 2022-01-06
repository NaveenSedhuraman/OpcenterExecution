"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a break xrt styling.
 *
 * @module js/aw-break.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to display a break xrt styling.
   *
   * @example <aw-break></aw-break>
   *
   * @member aw-break
   * @memberof NgElementDirectives
   */

  app.directive('awBreak', [function () {
    return {
      restrict: 'E',
      template: '<div class="aw-xrt-sectionBreak"></div>',
      replace: true
    };
  }]);
});