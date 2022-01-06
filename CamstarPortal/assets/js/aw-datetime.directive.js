"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a ViewModelProperty of type datetime.
 *
 * @module js/aw-datetime.directive
 */
define(['app', //
'js/aw-property-date-time-val.directive', 'js/aw-property-label.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a ViewModelProperty of type datetime.
   *
   * @example <aw-datetime prop="data.xxx"></aw-datetime>
   *
   * @member aw-datetime
   * @memberof NgElementDirectives
   */

  app.directive('awDatetime', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.prop.dateApi.isDateEnabled = true;
        $scope.prop.dateApi.isTimeEnabled = true;
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-datetime.directive.html'
    };
  }]);
});