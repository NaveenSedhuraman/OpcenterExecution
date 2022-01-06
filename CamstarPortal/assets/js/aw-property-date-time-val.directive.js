"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-date-time-val) directive
 *
 * @module js/aw-property-date-time-val.directive
 */
define(['app', //
'js/uwDirectiveDateTimeService', //
'js/aw-property-date-val.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-property-time-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-date-time-val) directive
   *
   * @member aw-property-date-time-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyDateTimeVal', //
  ['uwDirectiveDateTimeService', //
  function (uwDirectiveDateTimeSvc) {
    /**
     * Note: We need to include 'uwDirectiveDateTimeService' since there is initialization that occurs during the
     * load.
     */
    uwDirectiveDateTimeSvc.assureDateTimeLocale();
    return {
      restrict: 'E',
      scope: {
        // prop comes from the parent controller's scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-date-time-val.directive.html'
    };
  }]);
});