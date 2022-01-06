"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for search result filters.
 *
 * @module js/aw-expandable-search-result-filter.directive
 */
define(['app', 'js/aw-search-result-filter.directive', 'js/aw-repeat.directive', 'js/localeService'], function (app) {
  'use strict';
  /**
   * Directive to display "More..." or "Less..." options for search result filter when user has filtered the
   * search results.
   *
   * @example <aw-expandable-search-result-filter filters="data.resultMultiFilter"></aw-expandable-search-result-filter>
   *
   * @member aw-expandable-search-result-filter
   * @memberof NgElementDirectives
   */

  app.directive('awExpandableSearchResultFilter', ['localeService', function (localeSvc) {
    return {
      restrict: 'E',
      scope: {
        filters: '=' // searchResponseInfo

      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-expandable-search-result-filter.directive.html',
      controller: ['$scope', function ($scope) {
        $scope.allFiltersVisible = true;
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.moreText = localTextBundle.MORE_LINK_TEXT;
          $scope.lessText = localTextBundle.LESS_LINK_TEXT;
        });

        $scope.isVisible = function ($index) {
          if ($index === undefined) {
            return true;
          }

          if ($scope.allFiltersVisible) {
            var temp;

            if ($index < 3) {
              temp = true;
            } else {
              temp = false;
            }
          } else {
            temp = true;
          }

          return temp;
        };

        $scope.toggleList = function () {
          $scope.allFiltersVisible = !$scope.allFiltersVisible;
        };
      }]
    };
  }]);
});