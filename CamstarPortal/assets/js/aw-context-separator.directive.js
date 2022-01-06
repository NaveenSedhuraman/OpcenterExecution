"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a separator.
 *
 * @module js/aw-context-separator.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to display a separator.
   *
   * @member aw-context-separator
   * @memberof NgElementDirectives
   */

  app.directive('awContextSeparator', //
  [function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        token: '@'
      },
      template: '<span class="aw-seperator-style visible">{{token}}</span>',
      replace: true
    };
  }]);
});