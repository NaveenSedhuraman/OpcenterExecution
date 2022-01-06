"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-error) directive.
 *
 * @module js/aw-property-error.directive
 */
define(['app', //
'js/aw.property.error.controller'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-error) directive.
   *
   * @example TODO
   *
   * @member aw-property-error
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyError', function () {
    return {
      restrict: 'E',
      transclude: 'true',
      controller: 'awPropertyErrorController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-error.directive.html'
    };
  });
});