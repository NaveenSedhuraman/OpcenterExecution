"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for search result filters.
 *
 * @module js/aw-search-result-filter.directive
 */
define(['app', 'lodash', 'js/eventBus', 'js/aw-icon.directive'], function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display a search result filter when user has filtered the search results.
   *
   * @example <aw-search-result-filter prop="data.resultMultiFilter"></aw-search-result-filter>
   *
   * @member aw-search-result-filter
   * @memberof NgElementDirectives
   */

  app.directive('awSearchResultFilter', [function () {
    return {
      restrict: 'E',
      scope: {
        prop: '=',
        action: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-search-result-filter.directive.html',
      controller: ['$scope', function ($scope) {
        $scope.removeObjectSet = function ($event, isCategory, filterValue) {
          var context = {
            prop: $scope.prop,
            filterValue: filterValue
          };
          eventBus.publish('awSearchTab.filtersRemoved', context);
        };

        $scope.openObjectRecipes = function () {
          if (!$scope.showObjectRecipes) {
            $scope.showObjectRecipes = false;
          }

          $scope.showObjectRecipes = !$scope.showObjectRecipes;
        };
      }]
    };
  }]);
});