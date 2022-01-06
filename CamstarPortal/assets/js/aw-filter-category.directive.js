"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category.directive
 */
define(['app', //
'js/eventBus', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/aw-numeric.directive', //
'js/visible-when.directive', //
'js/aw-filter-category-string-filter.directive', //
'js/aw-filter-category-numeric-filter.directive', //
'js/aw-filter-category-date-filter.directive', //
'js/aw-filter-category-toggle-filter.directive', //
'js/aw-filter-category-contents.directive', //
'js/aw-hierarchical-navigation.directive', //
'js/aw-transclude.directive', //
'js/filterPanelService'], //
function (app, eventBus) {
  'use strict';
  /**
   * Directive to display search categories
   *
   * @example <aw-filter-category category-action="'selectCategory'" filter-action="filterSearchText"
   *          search-action="'selectFilter'" category="item" aw-repeat="item : data.categories track by $index" >
   *          </aw-filter-category>
   *
   * @member aw-filter-category
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategory', ['viewModelService', 'filterPanelService', function (viewModelSvc, filterPanelSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        categoryAction: '@',
        filterAction: '@',
        searchAction: '@',
        category: '='
      },
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);

        $scope.toggleExpansion = function () {
          $scope.category.expand = !$scope.category.expand;
          var context = {
            source: 'filterPanel',
            category: $scope.category,
            expand: $scope.category.expand
          };
          eventBus.publish('toggleExpansion', context);
        };
        /**
         * publish event to select category header
         *
         */


        $scope.select = function ($event) {
          filterPanelSvc.updateScrollInfo($event.currentTarget.offsetTop); // Call selectCategory action from json file

          var declViewModel = viewModelSvc.getViewModel($scope, true);

          if ($scope.category && $scope.category.filterValues !== undefined && $scope.category.filterValues) {
            viewModelSvc.executeCommand(declViewModel, $scope.categoryAction, $scope);
          }
        };

        $scope.toggleExpansionSoa = function () {
          $scope.category.isSelected = true;
          $scope.category.expand = !$scope.category.expand;

          if ($scope.ctx.search === undefined) {
            $scope.ctx.search = {};
          }

          $scope.ctx.search.valueCategory = $scope.category;
          var context = {
            source: 'filterPanel',
            category: $scope.category,
            expand: $scope.category.expand
          };
          eventBus.publish('toggleExpansionUnpopulated', context);
        };
      }],
      link: function link($scope, element) {
        $scope.$watch('data.' + $scope.item, function (value) {
          $scope.item = value;
        });
        $scope.$watch('data.' + $scope.action, function (value) {
          $scope.action = value;
        });
        element.addClass('aw-ui-categoryWrapper');
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category.directive.html'
    };
  }]);
});