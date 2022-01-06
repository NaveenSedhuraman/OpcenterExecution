"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-date-val) directive.
 *
 * @module js/aw-property-date-val.directive
 */
define(['app', 'js/aw.date.time.controller', 'js/aw-property-error.directive', 'js/aw-datebox.directive', 'js/aw-validator.directive', 'js/aw-widget-initialize.directive', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-date-val) directive.
   *
   * @example TODO
   *
   * @member aw-property-date-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyDateVal', function () {
    return {
      restrict: 'E',
      scope: {
        // prop comes from the parent controller's scope
        prop: '='
      },
      controller: 'awDateTimeController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-date-val.directive.html'
    };
  });
});