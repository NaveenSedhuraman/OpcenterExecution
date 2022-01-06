"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-include.directive
 */
define(['app', 'js/eventBus', 'js/awLayoutService'], function (app, eventBus) {
  'use strict';
  /**
   * Defines aw-include element.
   * <P>
   * Define an element that is used to include other layout files. The "when" attribute is optional and may be used to
   * select layouts based on predefined condition names. The "sub-panel-context" attribute is also optional, and
   * should be used, when some information needs to be passed on to the child layout file.
   *
   * @example <aw-include name="main-header"></aw-include>
   * @example <aw-include name="default-layout" when="condition-1:layout-1, conditions-2:layout-2"></aw-include>
   * @example <aw-include name="main-header" sub-panel-context="dataForSubPanel"></aw-include>
   *
   * @memberof NgDirectives
   * @member aw-include
   */

  app.directive('awInclude', ['$compile', 'awLayoutService', function ($compile, awLayoutService) {
    return {
      restrict: 'E',
      scope: {
        name: '@',
        when: '@?',
        subPanelContext: '=?'
      },
      link: function link($scope, $element) {
        // Automatically add class to aw-include
        // Should probably be done with aw-include element selector instead
        $element.addClass('aw-layout-flexbox'); // The scope for the current view model

        var childScope = null; // The element for the current view

        var childElement = null; // The template that will be compiled with the view model scope

        var childElementHtml = '<div class="aw-layout-include aw-layout-flexbox"' + 'sub-panel-context="subPanelContext" data-ng-include="layoutViewName"></div>';
        /**
         * When the "name" changes do a full rebuild of the embedded view.
         *
         * This means destroy the child scope and any view models associated with it and then create a new
         * scope and attach the new view model to it.
         *
         * This works similar to ng-if. See the source of that directive for more information.
         */

        var renderCurrentView = function renderCurrentView() {
          // Clear out current contents and destroy child scope
          $element.empty();

          if (childScope) {
            childScope.$destroy();
            awLayoutService.removeLayoutElement(childElement);
          }

          if ($scope.name) {
            // Compile the new contents with a new child scope
            childScope = $scope.$new();
            childElement = $compile(childElementHtml)(childScope);
            $element.append(childElement); // And initialize "when" conditions and load view / view model

            awLayoutService.addLayoutElement(childScope, childElement, $scope.name, $scope.when);
          }
        };

        $scope.$watch('name', renderCurrentView);
        var configChangeSub = eventBus.subscribe('configurationChange.viewmodel', function (data) {
          var viewModelName = data.path.split('.')[1];

          if (viewModelName === $scope.name) {
            renderCurrentView();
          }
        });
        /**
         * Fire the ng-include "$includeContentLoaded" angular event into the event bus
         */

        $scope.$on('$includeContentLoaded', function ($event) {
          eventBus.publish(childScope.currentLayoutName + '.contentLoaded', {
            scope: childScope,
            _source: childScope.data._internal.modelId
          });
          $event.stopPropagation();
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(configChangeSub); // Clear child element contents and remove aw-include listeners

          if (childElement) {
            awLayoutService.removeLayoutElement(childElement);
          }

          if (childScope && childScope.data) {
            eventBus.publish(childScope.currentLayoutName + '.contentUnloaded', {
              _source: childScope.data._internal.modelId
            });
          }
        });
      }
    };
  }]);
});