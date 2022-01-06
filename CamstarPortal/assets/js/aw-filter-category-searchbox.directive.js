"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-searchbox.directive
 */
define(['app', //
'lodash', //
'js/declUtils', //
'js/eventBus', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/localeService', //
'js/filterPanelService'], //
function (app, _, declUtils, eventBus) {
  'use strict';
  /**
   * Directive to display search categories
   *
   * @example <aw-filter-category-searchbox index="category.index" visible-when="category.showFilterText"
   *          filter-action="filterAction" > </aw-filter-category-searchbox>
   *
   * @member aw-filter-category-searchbox
   * @memberof NgElementDirectives
   */

  app.filter('filterInFilters', ['$filter', function ($filter) {
    return function (items, text) {
      if (text === undefined || !text || text.length === 0) {
        return items;
      }

      var _text = text;

      if (_text.indexOf('*') > -1) {
        _text = _text.replace(/[*]/gi, ' ');
      } // split search text on space


      var searchTerms = _text.split(' '); // search for single terms.
      // this reduces the item list step by step


      searchTerms.forEach(function (term) {
        if (term && term.length) {
          items = $filter('filter')(items, {
            name: term
          });
        }
      });
      return items;
    };
  }]);
  app.directive('awFilterCategorySearchbox', ['viewModelService', 'localeService', function (viewModelSvc, localeSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        filterAction: '=',
        index: '=',
        prop1: '=',
        category: '='
      },
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.filterText = localTextBundle.FILTER_TEXT;
        });

        $scope.evalKeyup = function ($event) {
          if ($scope.filterAction) {
            // call custom action
            $scope.keyCode = $event.keyCode;
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            viewModelSvc.executeCommand(declViewModel, $scope.filterAction, declUtils.cloneData($scope));
          } else if ($scope.category.isServerSearch) {
            if ($scope.category.filterBy !== '' && $scope.category.prevFilterBy) {
              if ($scope.category.filterBy.indexOf($scope.category.prevFilterBy) > -1) {
                //it's a type-ahead (i.e., the old filterBy is part of the new filterBy ).
                $scope.category.prevFilterBy = $scope.category.filterBy;

                if (!$scope.category.hasMoreFacetValues) {
                  return;
                }
              }
            }

            $scope.category.prevFilterBy = $scope.category.filterBy; // clear existing filter values before call to server

            var categoryName = $scope.category.internalName;

            if ($scope.data.categories !== undefined && categoryName !== undefined) {
              for (var category in $scope.data.categories) {
                if ($scope.data.categories[category].internalName === categoryName) {
                  $scope.data.categories[category].filterValues = [];
                }
              }
            }

            $scope.executeServerFilterInFilter();
          }
        };
        /**
         * Perform filter in filter values on server side
        */


        $scope.executeServerFilterInFilter = _.debounce(function () {
          $scope.ctx.search.valueCategory = $scope.category;
          eventBus.publish('filterInFilter.serverFilter', $scope.ctx.search.valueCategory);
        }, 500);
      }],
      link: function link($scope) {
        $scope.$watch('data.' + $scope.item, function (value) {
          $scope.item = value;
        });
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-searchbox.directive.html'
    };
  }]);
});