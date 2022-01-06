"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-contents.directive
 */
define(['app', //
'js/declUtils', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/aw-repeat.directive', //
'js/filterPanelService'], //
function (app, declUtils) {
  'use strict';
  /**
   * Directive to display search category filters
   *
   * @example <aw-filter-category-contents search-action="searchAction" filter="item" category= "category"
   *          ng-repeat="item in category.filterValues | limitTo: category.showMoreFilter ? category.count+1 :
   *          category.filterValues.length"> </aw-filter-category-contents >
   *
   * @member aw-filter-category-contents
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategoryContents', ['viewModelService', 'filterPanelService', function (viewModelSvc, filterPanelSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        filter: '=',
        category: '=',
        searchAction: '='
      },
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);
        /**
         * publish event to select category header
         *
         */

        $scope.select = function (category, filter, $event) {
          filterPanelSvc.updateScrollInfo($event.currentTarget.offsetTop); // call 'selectFilter' actin from json

          var declViewModel = viewModelSvc.getViewModel($scope, true);
          declViewModel.selectedFilterVal = filter;
          viewModelSvc.executeCommand(declViewModel, $scope.searchAction, declUtils.cloneData($scope));
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-contents.directive.html'
    };
  }]);
});