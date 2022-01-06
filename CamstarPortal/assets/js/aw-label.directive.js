"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a label styling.
 *
 * @module js/aw-label.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-non-edit-val.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a label styling.
   *
   * @example <aw-label prop="data.xxx"></aw-label> *
   *
   * @member aw-label
   * @memberof NgElementDirectives
   */

  app.directive('awLabel', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-label.directive.html'
    };
  }]);
});