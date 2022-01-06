"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * List populated by ng-repeat from controller's lov data and progressively loaded via the data services.
 *
 * @module js/aw-checkbox-list.directive
 */
define(['app', 'js/aw.checkbox.list.controller', 'js/aw-property-image.directive', 'js/aw-when-scrolled.directive', 'js/aw-property-checkbox-val.directive', 'js/aw-click.directive'], function (app) {
  'use strict';
  /**
   * List populated by ng-repeat from controller's lov data and progressively loaded via the data services.
   *
   * @example <aw-checkbox-list prop="prop"/>
   *
   * @member aw-checkbox-list
   * @memberof NgElementDirectives
   */

  app.directive('awCheckboxList', function () {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-checkbox-list.directive.html',
      controller: 'awCheckboxListController'
    };
  });
});