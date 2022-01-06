"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive to display the header.
 *
 * @module js/aw-header.directive
 * @requires app
 */
define(['app', 'angular', 'lodash', 'js/eventBus', 'js/logger', 'js/localeService', 'js/locationNavigation.service', 'js/aw-icon.directive', 'js/aw-model-icon.directive', 'js/aw-header-subtitle.directive', 'js/aw-global-search.directive', 'js/aw-header-props.directive', 'js/aw-visual-indicator.directive', 'js/aw-header-title.directive', 'js/aw-workarea-title.directive', 'js/appCtxService', 'js/aw.searchFilter.service', 'js/aw.navigateBreadCrumbService', 'js/aw-logo.directive', 'js/aw-tab.directive', 'js/aw-tab-container.directive', 'js/breadCrumbService', 'js/aw-progress-indicator.directive'], function (app, ngModule, _, eventBus, logger) {
  'use strict';
  /**
   * Directive to display the header.
   *
   * The header presenter is a singleton so only one instance of this directive can be used at a time.
   *
   * Parameters: headerVMO - The header view model object used to show icon(left of the header title) and visual
   * indicator headerTitle - The title to set in the headeraw-base-summaryOnlyBackButton headerProperties - Any
   * properties to display in the header
   *
   * @example <aw-header headerTitle="Teamcenter" [headerProperties=""]></aw-header>
   *
   * @member aw-header
   * @memberof NgElementDirectives
   */

  app.directive('awHeader', ['$state', 'localeService', 'locationNavigationService', 'appCtxService', 'searchFilterService', 'aw.navigateBreadCrumbService', 'breadCrumbService', function ($state, localeSvc, locationNavigationSvc, appCtxService, searchFilterService, navBreadCrumbSvc, breadCrumbSvc) {
    return {
      restrict: 'E',
      scope: {
        headerVMO: '=?headervmo',
        headerTitle: '=headertitle',
        headerProperties: '=?headerproperties',
        subLocationTabs: '=?sublocationtabs'
      },
      link: function link(scope) {
        localeSvc.getLocalizedText('UIMessages', 'backBtn').then(function (result) {
          scope.backBtnTitle = result;
        });
      },
      controller: ['$scope', function ($scope) {
        var ctrl = this;
        $scope.ctx = appCtxService.ctx;
        /**
         * {SubscriptionDefeninitionArray} Cached eventBus subscriptions.
         */

        var _eventBusSubDefs = [];
        /**
         * Callback from the tab api. Changes state when a new tab is selected.
         *
         * @method api
         * @param pageId {Number} - pageId of the tab to select.
         * @param tabTitle {String} - The name of the tab to select.
         * @memberOf NgControllers.DefaultLocationCtrl
         */

        $scope.api = function (pageId, tabTitle) {
          var tabToSelect;

          if (tabTitle) {
            tabToSelect = $scope.subLocationTabs.filter(function (tab) {
              return tab.name === tabTitle;
            })[0];
          } else {
            // Should only happen when api is called before tapTitle is loaded from i18n file
            tabToSelect = $scope.subLocationTabs.filter(function (tab) {
              return tab.pageId === pageId;
            })[0];
          }

          if (tabToSelect) {
            // When the tab widget is forced to update after the state has already changed it will still trigger callback
            if (tabToSelect.state !== $state.current.name) {
              // If there is an active tab
              if ($scope.activeTab) {
                // Save the active parameters
                $scope.activeTab.params = ngModule.copy($state.params);
              } // Switch to the new state


              if (tabToSelect.params) {
                $state.go(tabToSelect.state, tabToSelect.params);
              } else {
                $state.go(tabToSelect.state);
              }
            }

            $scope.activeTab = tabToSelect;
          } else {
            logger.error('Missing tab was selected: ' + tabTitle);
          }
        }; // This controller can be used within the base sublocation directive
        // Or as controller for a state


        if (!$scope.provider) {
          $scope.provider = $state.current.data ? $state.current.data : {};
          $scope.provider.name = $state.current.name;
        } // Stick the $state parameters into the provider automatically


        $scope.provider.params = ngModule.copy($state.params); // When a state parameter changes

        $scope.$on('$locationChangeSuccess', function () {
          // Update the provider
          $scope.provider = $state.current.data ? $state.current.data : {};
          $scope.provider.name = $state.current.name;
          $scope.provider.params = ngModule.copy($state.params);
        }); // Handler for when sublocation changes without tab widget
        // ex back button is clicked

        $scope.$on('$stateChangeSuccess', function () {
          // If the tabs have not been updated but the state has changed
          if ($scope.activeTab) {
            if ($scope.activeTab.state !== $state.current.name) {
              // Sync the tab selection
              $scope.subLocationTabs.forEach(function (tab) {
                if (tab.state === $state.current.name && !tab.selectedTab) {
                  // Broadcast that the selected tab needs to be updated
                  $scope.$broadcast('NgTabSelectionUpdate', tab);
                }
              });
            }
          }
        });
        $scope.$evalAsync(function () {
          ctrl.resetBreadcrumbProvider();
        });
        /**
         * Reset the breadcrumb provider to loading
         *
         * @function resetBreadcrumbProvider
         * @memberOf NgControllers.NativeSubLocationCtrl
         */

        ctrl.resetBreadcrumbProvider = function () {
          $scope.breadcrumbConfig = appCtxService.getCtx('breadCrumbConfig');
          $scope.breadCrumbProvider = breadCrumbSvc.resetBreadcrumbProvider($scope.breadcrumbConfig);
        };
        /**
         * Refresh the breadcrumb provider
         *
         * @function refreshBreadcrumbProvider
         * @memberOf NgControllers.NativeSubLocationCtrl
         */


        ctrl.refreshBreadcrumbProvider = function (searchFilterCategories, searchFilterMap) {
          $scope.breadcrumbConfig = appCtxService.getCtx('breadCrumbConfig');
          $scope.breadCrumbProvider = breadCrumbSvc.refreshBreadcrumbProvider($scope.breadcrumbConfig, appCtxService.getCtx('mselected'), searchFilterCategories, searchFilterMap, $scope.provider.params.searchCriteria, $scope.provider.label, true);
          $scope.objFound = Boolean(appCtxService.getCtx('search.totalFound'));
        };
        /**
         * Refresh the providers for the breadcrumb.
         *
         * @function refreshSearchProviders
         * @memberOf NgControllers.NativeSubLocationCtrl
         */


        ctrl.refreshSearchProviders = _.debounce(function () {
          // Debounce as this will be called multiple times as context changes.
          var searchFilterMap = appCtxService.getCtx('search.filterMap');
          var searchFilterCategories = appCtxService.getCtx('search.filterCategories');
          ctrl._activeSearchFilterMap = searchFilterMap;
          ctrl._activeSearchFilterCategories = searchFilterCategories;
          eventBus.publish('updateFilterPanel', {});
          ctrl.refreshBreadcrumbProvider(searchFilterCategories, searchFilterMap);
        }, 100);

        _eventBusSubDefs.push(eventBus.subscribe('refreshBreadCrumb', function (data) {
          if (data) {
            ctrl.refreshBreadcrumbProvider(data.searchFilterCategories, data.searchFilterMap);
          }
        }));

        _eventBusSubDefs.push(eventBus.subscribe('appCtx.update', function (data) {
          if (data.name === 'search' && data.target) {
            ctrl.refreshSearchProviders();
          }
        })); // Remove the supported view modes on destroy


        $scope.$on('$destroy', function () {
          // Remove listeners on destroy
          _.forEach(_eventBusSubDefs, function (subDef) {
            eventBus.unsubscribe(subDef);
          });
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-header.directive.html'
    };
  }]);
});