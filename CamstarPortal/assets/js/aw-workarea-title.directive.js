"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-workarea-title.directive
 */
define(['app', 'js/aw-search-breadcrumb.directive', 'js/aw-navigate-breadcrumb.directive', 'js/exist-when.directive'], function (app) {
  'use strict';
  /**
   * Definition for the (aw-workarea-title) directive.
   *
   * @member aw-workarea-title
   * @memberof NgElementDirectives
   */

  app.directive('awWorkareaTitle', [//
  function () {
    return {
      restrict: 'E',
      scope: {
        provider: '=',
        // BreadCrumbProvider
        breadcrumbConfig: '='
      },
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-workarea-title.directive.html'
    };
  }]);
});