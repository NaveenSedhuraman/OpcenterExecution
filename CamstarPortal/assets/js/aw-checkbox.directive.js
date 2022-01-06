"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a checkbox styling.
 *
 * @module js/aw-checkbox.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-checkbox-val.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a checkbox styling.
   * It supports an optional property 'action' to specify the action to perform on check box value toggle.
   *
   * @example <aw-checkbox prop="data.xxx"></aw-checkbox>
   *
   * @member aw-checkbox
   * @memberof NgElementDirectives
   */

  app.directive('awCheckbox', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '=',
        action: '@?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-checkbox.directive.html'
    };
  }]);
});