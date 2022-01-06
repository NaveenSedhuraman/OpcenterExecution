"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property) directive.
 *
 * @module js/aw-property.directive
 */
define(['app', //
'js/aw.html.panel.property.controller', 'js/aw-property-label.directive', 'js/aw-property-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property) directive.
   *
   * @example TODO
   *
   * @member aw-property
   * @memberof NgElementDirectives
   */

  app.directive('awProperty', function () {
    return {
      restrict: 'E',
      scope: {
        prop: '=',
        hint: '@'
      },
      controller: 'awHtmlPanelPropertyController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-property.directive.html'
    };
  });
});