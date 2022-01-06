"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-numeric) directive.
 *
 * @module js/aw-property-numeric.directive
 */
define(['app', //
'js/aw-property-non-edit-val.directive', 'js/aw-property-integer-val.directive', 'js/aw-property-double-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-numeric) directive.
   *
   * @example TODO
   *
   * @member aw-property-numeric
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyNumeric', //
  function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-numeric.directive.html'
    };
  });
});