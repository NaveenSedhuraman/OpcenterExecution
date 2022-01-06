"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display search-prefilter.
 *
 * @module js/aw-search-prefilter.directive
 */
define(['app', 'js/aw-listbox.directive' //
], //
function (app) {
  'use strict';
  /**
   * Directive to display search-prefilter.
   *
   * @example <aw-search-prefilter></aw-search-prefilter>
   *
   * @member aw-search-prefilter
   * @memberof NgElementDirectives
   */

  app.directive('awSearchPrefilter', //
  [function () {
    return {
      restrict: 'E',
      scope: {
        prop: '=',
        list: '=',
        action: '@?',
        defaultSelectionValue: '@?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-search-prefilter.directive.html',
      link: function link($scope) {
        $scope.prop.defaultSelectionValue = $scope.defaultSelectionValue;
        $scope.prop.isSearchPrefilter = true;
      }
    };
  }]);
});