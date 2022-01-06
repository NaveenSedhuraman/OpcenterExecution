"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-time-val) directive.
 *
 * @module js/aw-property-time-val.directive
 */
define(['app', 'js/aw.date.time.controller', 'js/aw-property-error.directive', 'js/aw-property-lov-child.directive', 'js/aw-validator.directive', 'js/aw-when-scrolled.directive', 'js/aw-widget-initialize.directive', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-time-val) directive.
   *
   * @example TODO
   *
   * @member aw-property-time-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyTimeVal', function () {
    return {
      restrict: 'E',
      scope: {
        // prop comes from the parent controller's scope
        prop: '='
      },
      controller: 'awDateTimeController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-time-val.directive.html'
    };
  });
});