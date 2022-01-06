"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a textarea styling.
 *
 * @module js/aw-textarea.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-property-text-area-val.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a textarea styling.
   *
   * @example <aw-textarea prop="data.xxx"></aw-textarea>
   *
   * @member aw-textarea
   * @memberof NgElementDirectives
   */

  app.directive('awTextarea', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-textarea.directive.html'
    };
  }]);
});