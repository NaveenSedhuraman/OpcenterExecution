"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a ViewModelProperty of type time.
 *
 * @module js/aw-time.directive
 */
define(['app', //
'js/aw-property-date-time-val.directive', 'js/aw-property-label.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a ViewModelProperty of type time.
   *
   * @example <aw-time prop="data.xxx"></aw-time>
   *
   * @member aw-time
   * @memberof NgElementDirectives
   */

  app.directive('awTime', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.prop.dateApi.isDateEnabled = false;
        $scope.prop.dateApi.isTimeEnabled = true;
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-datetime.directive.html'
    };
  }]);
});