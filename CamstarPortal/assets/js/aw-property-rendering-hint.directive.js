"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-rendering-hint) directive.
 *
 * @module js/aw-property-rendering-hint.directive
 */
define(['app', //
'js/aw-property-non-edit-val.directive', 'js/aw-property-text-area-val.directive', 'js/aw-property-text-box-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-rendering-hint) directive.
   *
   * @example TODO
   *
   * @member aw-property-rendering-hint
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyRenderingHint', //
  function () {
    return {
      restrict: 'E',
      scope: {
        // hint and prop are defined in the parent (i.e. controller's) scope
        hint: '=',
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-rendering-hint.directive.html'
    };
  });
});