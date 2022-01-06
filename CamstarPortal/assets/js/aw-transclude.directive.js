"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to perform transclusion.
 *
 * @module js/aw-transclude.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to perform transclusion.
   *
   * @example <div aw-transclude>
   *
   * @member aw-transclude
   * @memberof NgAttributeDirectives
   */

  app.directive('awTransclude', [function () {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs, ctrl, $transclude) {
        $transclude(scope, function (clone) {
          element.append(clone);
        });
      }
    };
  }]);
});