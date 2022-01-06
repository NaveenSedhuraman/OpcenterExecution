"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/aw-filter-in-filters-searchbox.directive
 */
define(['app', 'lodash', 'js/declUtils', 'js/viewModelService', 'js/aw-icon.directive', 'js/visible-when.directive', 'js/localeService', 'js/filterPanelService'], function (app, _, declUtils) {
  'use strict';
  /**
   * Filter in category by user typed text and order them by their display name
   */

  app.filter('filterInFiltersSearch', ['$filter', function ($filter) {
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
            displayName: term
          });
        }
      });
      return _.orderBy(items, 'displayName');
    };
  }]);
  /**
   * Directive to display searched categories
   *
   * @example <aw-filter-in-filters-searchbox index="category.index" visible-when="category.showFilterText"
   *          filter-action="filterAction" > </aw-filter-in-filters-searchbox>
   *
   * @member aw-filter-in-filters-searchbox
   * @memberof NgElementDirectives
   */

  app.directive('awFilterInFiltersSearchbox', ['viewModelService', 'localeService', function (viewModelSvc, localeSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        filterAction: '=',
        index: '=',
        prop: '=',
        category: '='
      },
      controller: ['$scope', function ($scope) {
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.filterText = localTextBundle.FILTER_BY_CATEGORY;
        });

        $scope.evalKeyup = function ($event) {
          if ($scope.filterAction) {
            // call custom action
            $scope.keyCode = $event.keyCode;
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            viewModelSvc.executeCommand(declViewModel, $scope.filterAction, declUtils.cloneData($scope));
          }
        };
      }],
      link: function link($scope) {
        $scope.$watch('data.' + $scope.item, function (value) {
          $scope.item = value;
        });
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-in-filters-searchbox.directive.html'
    };
  }]);
});