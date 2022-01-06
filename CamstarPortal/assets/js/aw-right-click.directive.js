"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Attribute directive to handle right click event.
 *
 * @module js/aw-right-click.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Attribute directive to to handle right click event.
   *
   * @example <div aw-right-click="handleRightClick($event)" />
   *
   * @member aw-right-click
   * @memberof NgAttributeDirectives
   */

  app.directive('awRightClick', [function () {
    return {
      restrict: 'A',
      link: function link($scope, $element, $attrs) {
        $element.bind('contextmenu', function (event) {
          event.preventDefault();
          $scope.$eval($attrs.awRightClick, {
            $event: event
          });
        });
      }
    };
  }]);
});