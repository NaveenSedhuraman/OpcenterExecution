"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-table-property) directive.
 *
 * @module js/aw-table-property.directive
 */
define(['app', //
'js/aw.table.property.controller', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-table-property) directive.
   *
   * @example TODO
   *
   * @member aw-table-property
   * @memberof NgElementDirectives
   */

  app.directive('awTableProperty', function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: 'awTablePropertyController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-table-property.directive.html'
    };
  });
});