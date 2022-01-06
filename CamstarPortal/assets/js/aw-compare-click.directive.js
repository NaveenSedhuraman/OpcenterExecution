"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for mouse left click.
 *
 * @module js/aw-compare-click.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive for mouse left click.
   *
   * @example TODO
   *
   * @member aw-compare-click
   * @memberof NgElementDirectives
   */

  app.directive('awCompareClick', function () {
    return function (scope, element) {
      element.bind('click', function (event) {
        var rowRef = scope.row.entity;
        rowRef.onClickEvent(event);
      });
    };
  });
});