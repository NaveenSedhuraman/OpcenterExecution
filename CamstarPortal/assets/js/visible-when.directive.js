"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Attribute Directive to change the visibility of an element based on a condition.
 *
 * @module js/visible-when.directive
 */
define(['app', 'js/wysiwygModeService'], //
function (app) {
  'use strict';
  /**
   * Attribute Directive to change the visibility of an element based on a condition.
   *
   * @example TODO
   *
   * @member visible-when
   * @memberof NgAttributeDirectives
   */

  app.directive('visibleWhen', //
  ['wysModeSvc', function (wysModeSvc) {
    return {
      restrict: 'A',
      replace: true,
      link: function link(scope, element, attr) {
        scope.$watch(attr.visibleWhen, function (value) {
          if (!wysModeSvc.isWysiwygMode(scope)) {
            if (value) {
              element.removeClass('hidden');
            } else {
              element.addClass('hidden');
            }
          }
        });
      }
    };
  }]);
});