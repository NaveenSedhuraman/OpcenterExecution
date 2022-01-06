"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-string-filter.directive
 */
define(['app', //
'lodash', //
'js/eventBus', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/exist-when.directive', //
'js/aw-repeat.directive', //
'js/localeService', //
'js/aw-filter-category-contents.directive', //
'js/aw-filter-category-searchbox.directive', //
'js/filterPanelUtils' //
], function (app, _, eventBus) {
  'use strict'; // eslint-disable-next-line valid-jsdoc

  /**
   * Directive to display search categories
   *
   * @example <aw-filter-category-string-filter category="category" filter-action="filterAction"
   *          search-action="searchAction"> </aw-filter-category-string-filter>
   *
   * @member aw-filter-category-string-filter
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategoryStringFilter', ['viewModelService', 'localeService', 'filterPanelUtils', function (viewModelSvc, localeSvc, filterPanelUtils) {
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
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.moreText = localTextBundle.MORE_LINK_TEXT;
          $scope.lessText = localTextBundle.LESS_LINK_TEXT;
          $scope.filterText = localTextBundle.FILTER_TEXT;
        });
        $scope.category.moreFilterByClicks = 0;
        var booleanVar1 = $scope.category.showMoreFilter || $scope.filterAction || $scope.category.filterBy;
        $scope.category.visibleFilterCount = booleanVar1 ? $scope.category.defaultFilterValueDisplayCount : $scope.category.filterValues.length;

        $scope.numberOfFiltersShown = function (category) {
          var numToReturn = $scope.results.length;

          if (!category.visibleFilterCount && category.showMoreFilter || category.filterBy && category.moreFilterByClicks === 0 || category.showMoreFilter) {
            numToReturn = category.defaultFilterValueDisplayCount;
          }

          return numToReturn;
        };

        $scope.isMoreLinkVisible = function (category) {
          var isVisible = false;

          if (category.showMoreFilter || category.hasMoreFacetValues) {
            isVisible = true;
          }

          return isVisible;
        };

        $scope.isLessLinkVisible = function (category) {
          var isVisible = false;

          if ($scope.results.length > category.defaultFilterValueDisplayCount) {
            isVisible = true;
          }

          return isVisible;
        };

        $scope.toggleFilters = function () {
          $scope.category.showMoreFilter = !$scope.category.showMoreFilter;
          var context = {
            category: $scope.category
          };
          eventBus.publish('toggleFilters', context);
        };

        $scope.toggleFiltersSoa = function (isMore) {
          // handle 3 cases
          // if clicked on client 'More...' when not using filtering within filters
          if (isMore && $scope.category.showMoreFilter && !$scope.category.filterBy) {
            $scope.category.moreFilterByClicks = 0;
            $scope.category.moreFilterByClicks += 1;
            $scope.toggleFilters();
            $scope.category.visibleFilterCount = $scope.category.filterValues.length;
          } else if (isMore && !$scope.category.showMoreFilter && $scope.category.hasMoreFacetValues && $scope.category.moreFilterByClicks !== 0) {
            // if clicked on server 'More...'
            $scope.category.visibleFilterCount = $scope.category.filterValues.length;
            $scope.category.isMoreClicked = true;
            $scope.ctx.search.valueCategory = $scope.category;
            var context = {
              source: 'filterPanel',
              category: $scope.category,
              expand: $scope.category.expand
            };
            eventBus.publish('toggleExpansionUnpopulated', context);
          } else if ($scope.category.filterBy && isMore && (!$scope.category.hasMoreFacetValues || $scope.category.hasMoreFacetValues && !$scope.category.moreFilterByClicks)) {
            // if clicked on client More... when using filter in filters
            $scope.category.showMoreFilter = true;
            $scope.category.moreFilterByClicks += 1;
            $scope.toggleFilters();
            $scope.category.visibleFilterCount = $scope.category.filterValues.length;
          } else if (!isMore) {
            // if clicked on 'Less'
            $scope.toggleFilters();
            var numOfFacets = $scope.category.filterValues.length;

            if (numOfFacets > 100 && $scope.category.isServerSearch) {
              filterPanelUtils.arrangeFilterMap($scope.ctx.searchResponseInfo.searchFilterMap, $scope.category);
              $scope.category.hasMoreFacetValues = true;
              $scope.category.endIndex = 100;
              $scope.category.visibleFilterCount = 100;
              eventBus.publish('updateFilterPanel', {});
            }

            var booleanVar2 = $scope.category.showMoreFilter || $scope.filterAction || $scope.category.filterBy;
            $scope.category.visibleFilterCount = booleanVar2 ? $scope.category.defaultFilterValueDisplayCount : $scope.category.filterValues.length;
            $scope.category.moreFilterByClicks = 0;
          }
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-string-filter.directive.html'
    };
  }]);
});