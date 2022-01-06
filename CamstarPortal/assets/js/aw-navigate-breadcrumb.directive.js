"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display navigation breadcrumb.
 *
 * @module js/aw-navigate-breadcrumb.directive
 */
define(['app', 'js/aw-navigate-breadcrumb.controller', 'js/aw-property-image.directive', 'js/localeService', //
'js/aw-repeat.directive', 'js/exist-when.directive', 'js/aw-list.directive', 'js/aw-default-cell.directive', 'js/aw-popup-panel.directive', 'js/aw-scrollpanel.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display the navigation bread crumb
   *
   * @example <aw-navigate-breadcrumb></aw-navigate-breadcrumb>
   * @member aw-navigate-breadcrumb
   * @memberof NgElementDirectives
   */

  app.directive('awNavigateBreadcrumb', ['localeService', function (localeSvc) {
    return {
      restrict: 'E',
      scope: {
        provider: '=?',
        breadcrumbConfig: '=',
        compact: '@?'
      },
      link: function link(scope) {
        localeSvc.getTextPromise().then(function (localTextBundle) {
          scope.loadingMsg = localTextBundle.LOADING_TEXT;
        });
      },
      controller: 'awNavigateBreadcrumbController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-navigate-breadcrumb.directive.html'
    };
  }]);
});