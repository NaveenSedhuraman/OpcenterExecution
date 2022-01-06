"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for right click.
 *
 * @module js/aw-compare-right-click.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive for right click.
   *
   * @member aw-compare-right-click
   * @memberof NgElementDirectives
   */

  app.directive('awCompareRightClick', function () {
    return function (scope, element) {
      element.bind('contextmenu', function (event) {
        var rowRef = scope.row.entity;
        event.preventDefault();
        rowRef.onRMBEvent(event);
      });
    };
  });
});