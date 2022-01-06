"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-boolean) directive.
 *
 * @module js/aw-property-boolean.directive
 */
define(['app', //
'js/aw-property-checkbox-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-property-radio-button-val.directive', 'js/aw-property-toggle-button-val.directive', 'js/aw-property-tri-state-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-boolean) directive.
   *
   * @example TODO
   *
   * @member aw-property-boolean
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyBoolean', //
  function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '=',
        hint: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-boolean.directive.html'
    };
  });
});