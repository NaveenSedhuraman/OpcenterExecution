"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for header click.
 *
 * @module js/aw-compare-header-click.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive for header click.
   *
   * @example TODO
   *
   * @member aw-compare-header-click
   * @memberof NgElementDirectives
   */

  app.directive('awCompareHeaderClick', function () {
    return function (scope, element) {
      element.bind('click', function (event) {
        var headRef = scope.col.colDef;
        headRef.onHeaderClickEvent(event);
      });
    };
  });
});