"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-category-toggle-filter.directive
 */
define(['app', //
'js/viewModelService', //
'js/aw-icon.directive', //
'js/visible-when.directive', //
'js/aw-repeat.directive', //
'js/localeService', //
'js/aw-filter-category-searchbox.directive', //
'js/aw-radiobutton.directive', //
'js/aw-filter-category-contents.directive' //
], function (app) {
  'use strict';
  /**
   * Directive to display search categories
   *
   * @example <aw-filter-category-toggle-filter category="category" filter-action="filterAction"
   *          search-action="searchAction"> </aw-filter-category-toggle-filter>
   *
   * @member aw-filter-category-toggle-filter
   * @memberof NgElementDirectives
   */

  app.directive('awFilterCategoryToggleFilter', ['viewModelService', function (viewModelSvc) {
    return {
      transclude: true,
      restrict: 'E',
      scope: {
        filterAction: '=',
        searchAction: '=',
        category: '=',
        filter: '=',
        action: '@'
      },
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-filter-category-toggle-filter.directive.html'
    };
  }]);
});