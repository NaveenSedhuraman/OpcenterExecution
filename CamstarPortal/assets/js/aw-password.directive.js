"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to input password.
 *
 * @module js/aw-password.directive
 */
define(['app', 'js/aw-textbox.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to input password
   *
   * @example <aw-password prop="data.xxx"></aw-password>
   *
   * @member aw-password
   * @memberof NgElementDirectives
   */

  app.directive('awPassword', [function () {
    return {
      restrict: 'E',
      scope: {
        prop: '='
      },
      link: function link(scope) {
        scope.prop.inputType = 'password';
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-password.directive.html'
    };
  }]);
});