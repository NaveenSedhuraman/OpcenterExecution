"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive to display the header.
 *
 * @module js/aw-showobject-header.directive
 * @requires app
 */
define(['app', 'angular', 'lodash', 'js/eventBus', 'js/logger', 'js/analyticsService', 'js/localeService', 'js/locationNavigation.service', 'js/aw-icon.directive', 'js/aw-model-icon.directive', 'js/aw-header-subtitle.directive', 'js/aw-global-search.directive', 'js/aw-header-props.directive', 'js/aw-visual-indicator.directive', 'js/aw-header-title.directive', 'js/aw-workarea-title.directive', 'js/appCtxService', 'js/aw.searchFilter.service', 'js/breadCrumbService', 'js/aw-logo.directive', 'js/aw-include.directive', 'js/configurationService', 'js/conditionService', 'js/commandConfiguration.command-provider', 'js/aw-progress-indicator.directive', 'js/exist-when.directive'], function (app, ngModule, _, eventBus, logger, analyticsSvc) {
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
   * @attribute subPanelContext - Used to pass information to child layout
    * @member aw-header
   * @memberof NgElementDirectives
   */

  app.directive('awShowobjectHeader', ['$state', 'localeService', 'locationNavigationService', 'appCtxService', 'searchFilterService', 'breadCrumbService', 'configurationService', 'conditionService', function ($state, localeSvc, locationNavigationSvc, appCtxService, searchFilterService, breadCrumbSvc, configurationSvc, conditionSvc) {
    return {
      restrict: 'E',
      scope: {
        headerVMO: '=?headervmo',
        headerTitle: '=headertitle',
        headerProperties: '=?headerproperties',
        subLocationTabs: '=?sublocationtabs',
        api: '=?api',
        subPanelContext: '=?subPanelContext'
      },
      link: function link($scope) {
        $scope.ctx = appCtxService.ctx;
        localeSvc.getLocalizedText('UIMessages', 'backBtn').then(function (result) {
          $scope.backBtnTitle = result;
        }); // Listen for event for clearing header properties

        var eventReg = eventBus.subscribe('clear.default.header', function (data) {
          if (data.name === 'clear.default.header') {
            // Header properties to be cleared here.
            logger.info('Header properties to be cleared here');
          }
        }); // And remove the event registration when the scope is destroyed

        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(eventReg);
        });
      },
      controller: ['$scope', function ($scope) {
        var ctrl = this;
        /**
         * {SubscriptionDefeninitionArray} Cached eventBus subscriptions.
         */

        var _eventBusSubDefs = []; // Action when Back button is clicked

        $scope.onBack = function () {
          if (locationNavigationSvc) {
            locationNavigationSvc.goBack();
          }

          var prevLocationEvent = {};
          prevLocationEvent.sanAnalyticsType = 'Previous Locations';
          prevLocationEvent.sanCommandId = 'sanPreviousLocation';
          prevLocationEvent.sanCommandTitle = 'Previous Location';
          analyticsSvc.logCommands(prevLocationEvent);
        }; // Action when Narrow Summary Title is clicked


        $scope.onClickNarrowSummaryTitle = function () {
          // Fire event
          eventBus.publish('narrowSummaryLocationTitleClickEvent', {});
        };
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
          $scope.provider.params = ngModule.copy($state.params);
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
          var breadCrumbConfig = _.get($scope, 'subPanelContext.provider.breadcrumbConfig', null);

          $scope.breadcrumbConfig = breadCrumbConfig ? breadCrumbConfig : appCtxService.getCtx('breadCrumbConfig');
        };
        /**
         * Refresh the breadcrumb provider
         *
         * @function refreshBreadcrumbProvider
         * @memberOf NgControllers.NativeSubLocationCtrl
         */


        ctrl.refreshBreadcrumbProvider = function () {
          $scope.breadcrumbConfig = appCtxService.getCtx('breadCrumbConfig');
        };

        var _evaluateHeaderContributions = function _evaluateHeaderContributions() {
          configurationSvc.getCfg('headerContributions').then(function (contributedHeaders) {
            contributedHeaders = _.sortBy(contributedHeaders, [function (o) {
              return o.priority;
            }]);
            contributedHeaders.reverse();
            $scope.$watch(function _watchHeaderContributionVisibility() {
              for (var indx in contributedHeaders) {
                if (contributedHeaders[indx].visibleWhen) {
                  var condition = conditionSvc.evaluateCondition({
                    ctx: appCtxService.ctx,
                    selection: $scope.selection,
                    subPanelContext: $scope.subPanelContext
                  }, contributedHeaders[indx].visibleWhen);

                  if (condition) {
                    return contributedHeaders[indx];
                  }
                }
              }

              return null;
            }, function (activeHeader) {
              if (activeHeader) {
                $scope.$evalAsync(function () {
                  $scope.headerContributedView = activeHeader.view;
                });
              } else {
                $scope.$evalAsync(function () {
                  $scope.headerContributedView = null;
                });
              }
            });
          });
        };

        _evaluateHeaderContributions();

        _eventBusSubDefs.push(eventBus.subscribe('appCtx.register', function (eventData) {
          if (eventData) {
            if (eventData.name && eventData.name === 'breadCrumbConfig') {
              ctrl.refreshBreadcrumbProvider();
            }
          }
        })); // Remove the supported view modes on destroy


        $scope.$on('$destroy', function () {
          // Remove listeners on destroy
          _.forEach(_eventBusSubDefs, function (subDef) {
            eventBus.unsubscribe(subDef);
          });
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-showobject-header.directive.html'
    };
  }]);
});