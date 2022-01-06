"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Check list widget directive
 *
 * @module js/aw-check-list.directive
 */
define(['app', 'js/aw-check-list.controller'], //
function (app) {
  'use strict';
  /**
   * Directive to display a check list widget
   *
   * @example <aw-check-list prop="data.xxx"></aw-check-list>
   *
   * @member aw-check-list
   * @memberof NgElementDirectives
   */

  app.directive('awCheckList', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: 'awCheckListController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-check-list.directive.html'
    };
  }]);
});