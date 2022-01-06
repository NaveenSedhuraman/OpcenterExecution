"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the <aw-property-string-val> directive.
 *
 * @module js/aw-property-string-val.directive
 */
define(['app', //
'js/aw-property-lov-val.directive', 'js/aw-property-rendering-hint.directive', 'js/aw-property-rich-text-area-val.directive', 'js/aw-property-text-area-val.directive', 'js/aw-property-text-box-val.directive'], function (app) {
  'use strict';
  /**
   * Definition for the <aw-property-string-val> directive.
   *
   * @example TODO
   *
   * @member aw-property-string-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyStringVal', //
  function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '=',
        inTableCell: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-string-val.directive.html'
    };
  });
});