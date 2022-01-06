"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-link-with-popup-and-icon.directive
 */
define(['app', 'js/aw-link-with-popup-and-icon.controller', 'js/aw-icon-button.directive'], function (app) {
  'use strict';
  /**
   * Directive to display a link with a popup
   *
   * @example <aw-link-with-popup-and-icon prop="data.xxx" />
   *
   * @member aw-link-with-popup-and-icon
   * @memberof NgElementDirectives
   */

  app.directive('awLinkWithPopupAndIcon', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: 'awLinkWithPopupAndIconController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-link-with-popup-and-icon.directive.html',
      replace: true
    };
  }]);
});