"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Attribute directive to drive loading more values on scroll.
 *
 * @module js/aw-when-scrolled.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Attribute directive to drive loading more values on scroll.
   *
   * @example TODO
   *
   * @member aw-when-scrolled
   * @memberof NgAttributeDirectives
   */

  app.directive('awWhenScrolled', function () {
    return {
      restrict: 'A',
      link: function link(scope, $element, attrs) {
        var raw = $element[0];
        $element.on('scroll.lov', function () {
          if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
            scope.$evalAsync(attrs.awWhenScrolled);
          }
        });
      }
    };
  });
});