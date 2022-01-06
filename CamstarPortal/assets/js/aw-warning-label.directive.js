"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show a warning label
 *
 * @module js/aw-warning-label.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to show a warning label
   *
   * @member aw-warning-label
   * @memberof NgAttributeDirectives
   */

  app.directive('awWarningLabel', [function () {
    return {
      restrict: 'E',
      scope: {
        text: '@'
      },
      template: '<div class="aw-widgets-propertyWarningLabel">{{text}}</div>'
    };
  }]);
});