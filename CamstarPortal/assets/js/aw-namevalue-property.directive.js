"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Responsible for the name value grid
 *
 * @module js/aw-namevalue-property.directive
 */
define(['app', 'js/aw.namevalue.property.controller', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-namevalue-property) directive.
   * Directive to display name value grid
   *
   * @member aw-namevalue-property
   * @memberof NgElementDirectives
   */

  app.directive('awNamevalueProperty', function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: 'awNamevaluePropertyController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-namevalue-property.directive.html'
    };
  });
});