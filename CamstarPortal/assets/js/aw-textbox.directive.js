"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a textbox styling.
 *
 * @module js/aw-textbox.directive
 */
define(['app', //
'js/aw-property-label.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-property-text-box-val.directive', 'js/exist-when.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a textbox styling.
   *
   * @example <aw-textbox prop="data.xxx"></aw-textbox>
   *
   * @member aw-textbox
   * @memberof NgElementDirectives
   */

  app.directive('awTextbox', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-textbox.directive.html'
    };
  }]);
});