"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-primary-workarea.directive
 */
define(['app', 'js/aw-primary-workarea.controller', 'js/aw-include.directive', //
'js/aw-toolbar.directive', 'js/exist-when.directive', 'js/aw-in-content-search-box.directive'], function (app) {
  'use strict';
  /**
   * Definition for the <aw-primary-workarea> directive.
   *
   * @example <aw-primary-workarea view="'table'"></aw-primary-workarea>
   *
   * @member aw-primary-workarea
   * @memberof NgElementDirectives
   */

  app.directive('awPrimaryWorkarea', [function () {
    return {
      restrict: 'E',
      scope: {
        // Base name of the view models to use (ex 'inbox')
        viewBase: '=',
        // Name of the specific view that should be active (ex 'List')
        view: '=',
        // Additional context that should be passed to the view model (ex selection model)
        context: '=?',
        breadcrumbConfig: '='
      },
      controller: 'awPrimaryWorkareaCtrl',
      templateUrl: app.getBaseUrlPath() + '/html/aw-primary-workarea.directive.html'
    };
  }]);
});