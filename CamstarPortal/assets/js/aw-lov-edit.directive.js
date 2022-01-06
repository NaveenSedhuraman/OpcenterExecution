"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * TODO
 *
 * @module js/aw-lov-edit.directive
 */
define(['app', 'js/localeService', 'js/aw-property-lov-val.directive', 'js/aw-command-bar.directive', 'js/aw-lov-edit.controller'], //
function (app) {
  'use strict';
  /**
   * TODO
   *
   * @example TODO
   *
   * @member aw-lov-edit
   * @memberof NgElementDirectives
   */

  app.directive('awLovEdit', [//
  function () {
    return {
      restrict: 'E',
      scope: {
        prop: '='
      },
      controller: 'awLovEditController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-lov-edit.directive.html'
    };
  }]);
});