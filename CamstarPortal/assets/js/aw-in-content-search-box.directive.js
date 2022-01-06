"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-in-content-search-box.directive
 */
define(['app', 'js/eventBus', //
'js/viewModelService', 'js/aw-property-text-box-val.directive', 'js/aw-enter-key.directive', 'js/aw-icon.directive', 'js/localeService'], //
function (app, eventBus) {
  'use strict';
  /**
   * This is the directive for an in-content search box. It takes a property to bind to the search string and an action as
   * parameters
   *
   * @example <aw-in-content-search-box prop="searchStringProperty" action="searchAction"></aw-in-content-search-box>
   *
   * @member aw-in-content-search-box
   * @memberof NgElementDirectives
   */

  app.directive('awInContentSearchBox', //
  ['viewModelService', 'localeService', //
  function (viewModelSvc, localeSvc) {
    return {
      restrict: 'E',
      scope: {
        action: '@',
        prop: '=',
        selectAction: '@'
      },
      controller: ['$scope', '$element', function ($scope, $element) {
        $scope.focused = false;

        $scope.doit = function (action) {
          var declViewModel = viewModelSvc.getViewModel($scope, true);
          viewModelSvc.executeCommand(declViewModel, action, $scope);
        };

        $scope.searchBoxSelected = function ($event) {
          $event.target.select();
        };

        $scope.setFocus = function (isFocused) {
          $scope.focused = isFocused;

          if ($scope.$parent.focusEvent) {
            $scope.$parent.focusEvent(isFocused);
          }
        };

        localeSvc.getTextPromise('SearchMessages').then(function (localTextBundle) {
          $scope.inContentSearchPlaceHolder = localTextBundle.inContentSearchPlaceHolder;
        });

        $scope.selectSearchBox = function () {
          var searchBox = $element.find('input')[0];

          if (searchBox) {
            searchBox.focus();
          }
        };

        var clearSearchBoxListener = eventBus.subscribe('search.clearSearchBox', function () {
          $scope.prop.dbValue = '';
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(clearSearchBoxListener);
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-in-content-search-box.directive.html'
    };
  }]);
});