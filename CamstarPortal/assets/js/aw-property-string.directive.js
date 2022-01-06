"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-string) directive.
 *
 * @module js/aw-property-string.directive
 */
define(['app', //
'js/aw-property-non-edit-val.directive', 'js/aw-property-string-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-string) directive.
   *
   * @example TODO
   *
   * @member aw-property-string
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyString', //
  function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-string.directive.html'
    };
  });
});