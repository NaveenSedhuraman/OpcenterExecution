"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a toggle button styling.
 *
 * @module js/aw-togglebutton.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-toggle-button-val.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a toggle button styling.
   *
   * @example <aw-togglebutton prop="data.xxx"></aw-togglebutton>
   *
   * @member aw-togglebutton
   * @memberof NgElementDirectives
   */

  app.directive('awTogglebutton', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-togglebutton.directive.html'
    };
  }]);
});