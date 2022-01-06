"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-tab.directive
 */
define(['app', 'js/analyticsService', 'js/aw-tab.controller'], //
function (app, analyticsSvc) {
  'use strict';
  /**
   * Inner tab directive that builds the tab list.
   *
   * @example <aw-tab tab-model="model"></aw-tab>
   *
   * @member aw-tab
   * @memberof NgElementDirectives
   *
   * @return {Object} Directive's definition object.
   */

  app.directive('awTab', ['$timeout', function ($timeout) {
    return {
      restrict: 'E',
      require: '^?awTabContainer',
      templateUrl: app.getBaseUrlPath() + '/html/aw-tab.directive.html',
      scope: {
        tabModel: '='
      },
      link: function link(scope, $element, attrs, tabContainerCtrl) {
        $timeout(function () {
          if (scope.tabModel && scope.tabModel.selectedTab === true) {
            if (tabContainerCtrl !== null) {
              tabContainerCtrl.updateSelectedTab(scope.tabModel);
            }
          } // tabContainerCtrl.checkInitialSelection();
          // Updates the selected tab
          // The change will be picked up by the watch


          scope.selectCurrentTab = function () {
            scope.tabModel.selectedTab = true;

            if (tabContainerCtrl !== null) {
              tabContainerCtrl.updateSelectedTab(scope.tabModel); // Publish the Tab Selection event to analytics

              var sanEventData = {
                sanAnalyticsType: 'Tab',
                sanCommandId: scope.tabModel.id,
                sanCommandTitle: scope.tabModel.name
              };
              analyticsSvc.logCommands(sanEventData);
            }
          };
        }, 0, false);
        scope.$on('$destroy', function () {
          $element.remove(); // $element = null;
        });
      }
    };
  }]);
});