"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a numeric styling.
 *
 * @module js/aw-numeric.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-property-integer-val.directive', 'js/aw-property-double-val.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a numeric styling.
   *
   * @example <aw-numeric prop="data.xxx"></aw-numeric>
   *
   * @member aw-numeric
   * @memberof NgElementDirectives
   */

  app.directive('awNumeric', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-numeric.directive.html'
    };
  }]);
});