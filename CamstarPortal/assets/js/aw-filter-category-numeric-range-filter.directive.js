"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-numeric-range-filter.directive
 */
define(['app', //
'js/declUtils', //
'js/eventBus', //
'js/viewModelService', //
'js/uwPropertyService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/aw-repeat.directive', //
'js/aw-date.directive', //
'js/localeService', //
'js/filterPanelService', //
'js/filterPanelUtils', //
'js/dateTimeService', //
'js/aw-numeric.directive', //
'js/aw-filter-category-contents.directive' //
], function (app, declUtils, eventBus) {
  'use strict';
  /**
   * Directive to display numeric range filter
   *
   * @example <aw-filter-category-numeric-range-filter ng-if="category.showNumericRangeFilter"
   *          search-action="searchAction" category= "category" > </aw-filter-category-numeric-range-filter >
   *
   * @member aw-filter-category-numeric-range-filter
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategoryNumericRangeFilter', ['viewModelService', 'uwPropertyService', 'localeService', 'filterPanelService', 'filterPanelUtils', function (viewModelSvc, uwPropertyService, localeSvc, filterPanelSvc, filterPanelUtils) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        id: '@',
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

        $scope.toggleFilters = function () {
          $scope.category.showMoreFilter = !$scope.category.showMoreFilter;
          var context = {
            category: $scope.category
          };
          eventBus.publish('toggleFilters', context);
        };

        $scope.select = function (category, id) {
          if (id === category.displayName) {
            // call 'selectNumericRange' actin from json
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            viewModelSvc.executeCommand(declViewModel, 'selectNumericRange', declUtils.cloneData($scope));
          }
        };

        $scope.validateRange = function (category, startRange, endRange) {
          filterPanelUtils.validateNumericRange(category, startRange, endRange);
        };

        $scope.isPropValid = function (prop) {
          if (prop.error && prop.error.length > 0) {
            return false;
          }

          return true;
        };

        $scope.evalKeyup = function ($event) {
          var startProp = $scope.category.numericrange.startValue;
          var endProp = $scope.category.numericrange.endValue;

          if ($event.key === 'Enter' || startProp.valueUpdated || endProp.valueUpdated) {
            $scope.validateRange($scope.category, startProp.dbValue, endProp.dbValue);
          }
        }; // startRange


        $scope.changeEventListener1 = $scope.$watch(function () {
          return $scope.category.numericrange.startValue.dbValue;
        }, function (newValue, oldValue) {
          if (newValue !== oldValue && $scope.isPropValid($scope.category.numericrange.startValue)) {
            var startRange = parseFloat(newValue);
            var endRange = parseFloat($scope.category.numericrange.endValue.dbValue);
            $scope.validateRange($scope.category, startRange, endRange);
          } else {
            $scope.category.showSearch = false;
          }
        }); // endRange

        $scope.changeEventListener2 = $scope.$watch(function () {
          return $scope.category.numericrange.endValue.dbValue;
        }, function (newValue, oldValue) {
          if (newValue !== oldValue && $scope.isPropValid($scope.category.numericrange.endValue)) {
            var startRange = parseFloat($scope.category.numericrange.startValue.dbValue);
            var endRange = parseFloat(newValue);
            $scope.validateRange($scope.category, startRange, endRange);
          } else {
            $scope.category.showSearch = false;
          }
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-numeric-range-filter.directive.html'
    };
  }]);
});