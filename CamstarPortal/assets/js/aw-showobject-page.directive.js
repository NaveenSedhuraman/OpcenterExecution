"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgElementDirectives.aw-page}. This directive manages the global toolbar, header, tabs, and narrow
 * mode.
 *
 * @module js/aw-showobject-page.directive
 */
define(['app', 'js/eventBus', 'js/configurationService', 'js/appCtxService', 'js/aw-showobject-header.directive', 'js/aw-global-toolbar.directive', 'js/aw-tab.directive', 'js/aw-tab-container.directive', 'js/aw-command-bar.directive', 'js/aw.narrowMode.service', 'js/aw-logo.directive', 'js/aw-row.directive', 'js/aw-column.directive', 'js/aw-include.directive'], function (app, eventBus) {
  'use strict';
  /**
   *
   * Directive to display an Active Workspace page. All properties are optional and will be given a default value if
   * not set.
   *
   * <pre>
   * Parameters:
   * api The tab switch callback function. {@link NgTab.js}
   * browserSubTitle The browser sub title.  The tab title format is (browserTitle)[ - (browserSubTitle)].
   * browserTitle The browser title.  The tab title format is (browserTitle)[ - (browserSubTitle)].
   * headerTitle The title in the header.
   * layoutSummaryOnly Whether the narrow location summary should be visible.
   * locationPanelStyle The css class to apply to the location container
   * subLocationTabs The tabs to show in the tab widget. {@link NgTab.js}
   * viewModel The view model to pass to the header
   * </pre>
   *
   * @example <aw-page headerTitle="'My title'"> <span>Hello World!</span> </aw-page>
   *
   * @member aw-page
   * @memberof NgElementDirectives
   */

  app.directive('awShowobjectPage', ['$state', '$window', '$document', 'configurationService', 'appCtxService', 'narrowModeService', function ($state, $window, $document, cfgSvc, appCtxSvc, narrowModeSvc) {
    return {
      restrict: 'E',
      // TODO: really screwed this up initially - should be scope not $scope
      // because of typo it's currently sharing scope with whatever uses it
      $scope: {
        api: '=?',
        browserSubTitle: '=?browsersubTitle',
        browserTitle: '=?browserTitle',
        headerTitle: '=?headerTitle',
        layoutSummaryOnly: '=?layoutSummaryOnly',
        locationPanelStyle: '=?locationPanelStyle',
        subLocationTabs: '=?subLocationTabs',
        headerViewModel: '=?headerViewModel'
      },
      transclude: true,
      link: function link($scope) {
        // Clean the cache whenever a new page is revealed
        // Gettting the cachable object uids needs to be sync as native sublocations will start loading data before promise is resolved
        // The method will not be available on very first page reveal, but no reason to clean cache when going to the first page
        eventBus.publish('cdm.cleanCache', {});
        $scope.ctx = appCtxSvc.ctx; // Update the document title when the browserTitle or browserSubTitle changes

        $scope.$watchGroup(['browserTitle', 'browserSubTitle'], function () {
          if ($scope.browserTitle) {
            $document[0].title = $scope.browserTitle + ($scope.browserSubTitle ? ' - ' + $scope.browserSubTitle : '');
          }
        }); // Set title of the browser. Defaults to the solution name or 'Teamcenter' if the solution name is not defined

        if (!$scope.browserTitle) {
          cfgSvc.getCfg('solutionDef').then(function (solution) {
            $scope.browserTitle = solution ? solution.browserTitle : 'Teamcenter';
          });
        } // The style for the main location div.  Defaults to 'locationPanel'


        if (!$scope.locationPanelStyle) {
          $scope.locationPanelStyle = 'locationPanel';
        } // Toggle to only show the summary.  Initially false.


        if (!$scope.layoutSummaryOnly) {
          $scope.layoutSummaryOnly = false;
        } // Remember what the title was before narrow mode selection was made


        var preNarrowTitle = null; // Setup narrow svc

        narrowModeSvc.checkNarrowMode(); // On browser resize, check if we're in narrow mode

        $scope.$on('windowResize', function () {
          narrowModeSvc.checkNarrowMode();
        }); // Narrow mode related listeners

        var onSubLocationContentSelectionChangeListener = eventBus.subscribe('gwt.SubLocationContentSelectionChangeEvent', function (data) {
          if (data.isPrimaryWorkArea && data.haveObjectsSelected && $window.innerWidth < 460) {
            $scope.$evalAsync(function () {
              $scope.layoutSummaryOnly = true;
              var activeTab = $scope.subLocationTabs.filter(function (tab) {
                return tab.selectedTab;
              })[0];

              if (!activeTab) {
                activeTab = {
                  name: 'null'
                };
              }

              if (preNarrowTitle) {
                $scope.headerTitle = preNarrowTitle + ' (' + activeTab.name + ')';
              } else {
                preNarrowTitle = $scope.headerTitle;
                $scope.headerTitle = $scope.headerTitle + ' (' + activeTab.name + ')';
              }
            });
          }
        });
        var onNarrowModeChangeListener = eventBus.subscribe('narrowModeChangeEvent', function (data) {
          if (!data.isEnterNarrowMode) {
            $scope.$evalAsync(function () {
              $scope.layoutSummaryOnly = false;

              if (preNarrowTitle) {
                $scope.headerTitle = preNarrowTitle;
                preNarrowTitle = null;
              }
            });
          }
        });
        var onNarrowSummaryLocationTitleClickListener = eventBus.subscribe('narrowSummaryLocationTitleClickEvent', function () {
          $scope.$evalAsync(function () {
            $scope.layoutSummaryOnly = false;

            if (preNarrowTitle) {
              $scope.headerTitle = preNarrowTitle;
              preNarrowTitle = null;
            }
          });
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(onSubLocationContentSelectionChangeListener);
          eventBus.unsubscribe(onNarrowModeChangeListener);
          eventBus.unsubscribe(onNarrowSummaryLocationTitleClickListener);
        });
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-showobject-page.directive.html'
    };
  }]);
});