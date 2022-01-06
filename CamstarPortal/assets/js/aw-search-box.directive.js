"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-search-box.directive
 */
define(['app', 'js/eventBus', //
'js/viewModelService', 'js/aw-property-text-box-val.directive', 'js/aw-enter-key.directive', 'js/aw-icon.directive'], //
function (app, eventBus) {
  'use strict';
  /**
   * This is the directive for a search box. It takes a property to bind to the search string and an action as
   * parameters
   *
   * @example <aw-search-box prop="searchStringProperty" action="searchAction"></aw-search-box>
   *
   * @member aw-search-box
   * @memberof NgElementDirectives
   */

  app.directive('awSearchBox', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      scope: {
        action: '@',
        prop: '=',
        placeholder: '=',
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

        $scope.getPlaceHolder = function () {
          if ($scope.placeholder && $scope.placeholder.dbValue) {
            return $scope.placeholder.dbValue;
          }

          return '';
        };

        $scope.selectSearchBox = function () {
          var searchBox = $element.find('input')[0];

          if (searchBox) {
            searchBox.focus();
          }
        };

        var doSuggestionItemSelectionListener = eventBus.subscribe('search.selectSearchBox', function (eventData) {
          if (eventData.action && eventData.action === $scope.action) {
            $scope.selectSearchBox();
          }
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(doSuggestionItemSelectionListener);
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-search-box.directive.html'
    };
  }]);
});