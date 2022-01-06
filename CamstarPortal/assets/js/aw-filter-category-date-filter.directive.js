"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-date-filter.directive
 */
define(['app', //
'js/eventBus', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/aw-repeat.directive', //
'js/localeService', //
'js/aw-filter-category-date-range-filter.directive', //
'js/aw-filter-category-date-contents.directive' //
], function (app, eventBus) {
  'use strict';
  /**
   * Directive to display search categories
   *
   * @example <aw-filter-category-date-filter category="category" filter-action="filterAction"
   *          search-action="searchAction"> </aw-filter-category-date-filter>
   *
   * @member aw-filter-category-date-filter
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategoryDateFilter', ['viewModelService', 'localeService', function (viewModelSvc, localeSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        filterAction: '=',
        searchAction: '=',
        category: '='
      },
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);
        var temp1 = $scope.category.defaultFilterValueDisplayCount + $scope.category.drilldown;
        $scope.category.visibleFilterCount = $scope.category.showMoreFilter ? temp1 : $scope.category.filterValues.length;
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.moreText = localTextBundle.MORE_LINK_TEXT;
          $scope.lessText = localTextBundle.LESS_LINK_TEXT;
          $scope.filterText = localTextBundle.FILTER_TEXT;
        });

        $scope.toggleFilters = function (isMore) {
          $scope.category.showMoreFilter = !$scope.category.showMoreFilter;

          if (isMore) {
            $scope.category.visibleFilterCount = $scope.category.filterValues.length;
          } else {
            var temp2 = $scope.category.defaultFilterValueDisplayCount + $scope.category.drilldown;
            $scope.category.visibleFilterCount = $scope.category.showMoreFilter ? temp2 : $scope.category.filterValues.length;
          }

          var context = {
            category: $scope.category
          };
          eventBus.publish('toggleFilters', context);
        };
      }],
      link: function link($scope) {
        $scope.$watch('data.' + $scope.item, function (value) {
          $scope.item = value;
        });
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-date-filter.directive.html'
    };
  }]);
});