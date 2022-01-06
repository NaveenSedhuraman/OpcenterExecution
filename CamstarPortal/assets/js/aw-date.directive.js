"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a ViewModelProperty of type date.
 *
 * @module js/aw-date.directive
 */
define(['app', //
'js/aw-property-date-time-val.directive', 'js/aw-property-label.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a ViewModelProperty of type date.
   *
   * @example <aw-date prop="data.xxx"></aw-date>
   *
   * @member aw-date
   * @memberof NgElementDirectives
   */

  app.directive('awDate', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.prop.dateApi.isDateEnabled = true;
        $scope.prop.dateApi.isTimeEnabled = false;
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-datetime.directive.html'
    };
  }]);
});