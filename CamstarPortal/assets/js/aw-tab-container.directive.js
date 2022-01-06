"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-tab-container.directive
 */
define(['app', 'jquery', 'lodash', 'js/logger', 'js/browserUtils', //
'js/uwUtilService', 'js/aw-tab-container.controller', 'js/aw-property-image.directive'], function (app, $, _, logger, browserUtils) {
  'use strict'; // For unknown reason, AW4.0 has regression in case SWA table when compare with AW3.4 in IE.
  // By tuning debounce value below, the number reduce back to AW3.4 value. For aw4.0.0528 it
  // shows 19s vs 10s.
  // For now limits it to IE only

  var _sizeCheckDebounceTime = browserUtils.isNonEdgeIE ? 2000 : 1000; // eslint-disable-next-line valid-jsdoc

  /**
   * Outer Tab Container directive that builds enclosing DIV and Arrow SPAN.
   *
   * @example <aw-tab-container tab-container-model="models" callback="clickHandler"></aw-tab-container>
   *
   * @member aw-tab-container
   * @memberof NgElementDirectives
   */


  app.directive('awTabContainer', ['$timeout', '$window', 'uwUtilService', function ($timeout, $window, utilsSvc) {
    return {
      priority: 0,
      transclude: true,
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-tab-container.directive.html',
      scope: {
        tabsModel: '=?tabContainerModel',
        callback: '='
      },
      controller: 'awTabContainerController',
      link: function link(scope, $element, attrs, tabContainerCtrl) {
        if ($element && $element[0]) {
          scope.tabBarContentElement = $element.find('div.aw-jswidget-tabBarContent')[0];
        }

        if (!scope.tabBarContentElement) {
          return;
        }

        var _debug_logTabResizeActivity = false;
        scope.isClicked = false;
        scope.lastSelected = null;
        scope.showArrow = false;
        scope.resizePromise = null;
        scope.leafTab = {};
        scope._clientWidth = 0; // secondary work area width when object is selected in pwa and summary is loaded in swa

        scope.subLocContentPanel = $element.closest('.aw-layout-sublocationContent');

        if (!scope.subLocContentPanel || !scope.subLocContentPanel[0]) {
          // sublocation width when object opened in show object sublocation
          scope.subLocContentPanel = $element.closest('.aw-layout-subLocation');

          if (!scope.subLocContentPanel || !scope.subLocContentPanel[0]) {
            // sublocation width when object opened in show object sublocation uxrefresh
            scope.subLocContentPanel = $element.closest('.aw-layout-subLocationTitles');
          }
        }
        /**
         * Setup to delay query of 'subLocContentPanel' width until $watch (below) settles down a bit.
         */


        scope._pingSizeCheck = _.debounce(function pingSizeCheck() {
          if (scope.subLocContentPanel && scope.subLocContentPanel[0]) {
            scope._clientWidth = scope.subLocContentPanel[0].clientWidth;
          } else if (scope.subLocContentPanel.context) {
            scope._clientWidth = scope.subLocContentPanel.context.clientWidth;
          } else {
            scope._clientWidth = 0;
          }

          if (_debug_logTabResizeActivity) {
            logger.info('aw-tab-container.directive: ._clientWidth=' + scope._clientWidth);
          }
          /**
           * Check if width changed since the last time we looked.<BR>
           * If so: Resize tabs to the new width.
           */


          if (scope._clientWidth !== scope._clientWidthPrev) {
            scope._clientWidthPrev = scope._clientWidth;

            if (scope.isClicked) {
              scope.isClicked = false;
              scope.removeClickEvent();
            }

            scope.checkResize();
          }
        }, _sizeCheckDebounceTime, {
          maxWait: 20000,
          trailing: true,
          leading: false
        }); //      causing reflow so removed

        /**
         * Select the tab and ultimately fire the select API in AW.
         */

        scope.setSelectedTab = function () {
          scope.displaySelection();
          scope.selectedObject.tab.selectedTab = true;
          scope.refreshTabsBar();
          scope.lastSelected = scope.selectedObject.tab;

          if (scope.tabApi) {
            scope.tabApi(parseInt(scope.selectedObject.tab.pageId, 10), scope.selectedObject.tab.name);
          } else if (scope.$parent && scope.$parent.tabApiFn) {
            scope.$parent.tabApiFn.updateTabClick(parseInt(scope.selectedObject.tab.pageId, 10), scope.selectedObject.tab.name);
          }
        };
        /**
         * Set the new selected TAB to selected CSS state and revert last selected item to unselected.
         */


        scope.displaySelection = function () {
          if (scope.selectedObject.tab !== scope.lastSelected && scope.lastSelected) {
            scope.lastSelected.selectedTab = false;
          }

          scope.lastSelected = scope.selectedObject.tab;
        };
        /**
         * Refresh the tabs, sizing those visible in the viewable area.
         */


        scope.refreshTabsBar = function () {
          if (scope.$parent && scope.$parent.visibleTabs) {
            scope.tabsModel = scope.$parent.visibleTabs;
          }

          for (var i = 0; i < scope.tabsModel.length; i++) {
            var tabModel = scope.tabsModel[i];
            tabModel.displayTab = true;
            tabModel.width = '100%';
          }

          scope.showArrow = false;
          scope.$evalAsync(); // $timeout is necessary to guarantee the digest has ended and
          // the DOM reflects the model.

          $timeout(function _watchTabTimeout2() {
            var childWidths = 0;
            var tabContainerDomEl = scope.tabBarContentElement;

            if (tabContainerDomEl) {
              scope.tabBarWidth = tabContainerDomEl.clientWidth;

              if (tabContainerDomEl.children.length > 0 && scope.tabBarWidth > 0) {
                // Process what tabs are visible and for overflown tabs set displayTab property to false
                // if last selected tab is in overflown tabs, make it visible
                var visibleTabIndex = 0;

                for (var tabNdx = 0; tabNdx < scope.tabsModel.length; tabNdx++) {
                  var tabModel = scope.tabsModel[tabNdx];
                  var tabEl = $(tabContainerDomEl.children[tabNdx]);

                  if (!tabEl.find('li')[0]) {
                    continue;
                  }

                  var childWidth = tabEl[0].offsetWidth;
                  var tabContainerDomElChild = tabContainerDomEl.children[tabNdx];
                  var tabAnchorElWidth = $(tabContainerDomElChild).find('a')[0].clientWidth;

                  if (childWidths + tabAnchorElWidth >= scope.tabBarWidth || tabAnchorElWidth > scope.tabBarWidth) {
                    var unUsedPixcels = scope.tabBarWidth - childWidths; // if there is some vacant space left in tab bar, store it in leafTabWidth for precise use of space

                    if (unUsedPixcels > 0) {
                      scope.leafTabWidth += unUsedPixcels;
                    }

                    if (tabModel === scope.lastSelected) {
                      scope.makeLastSelectedTabVisible(tabModel);
                    } else {
                      tabModel.displayTab = false;
                    }
                  } else {
                    scope.leafTab = tabModel;
                    scope.leafTabWidth = childWidth;
                    visibleTabIndex++;
                  }

                  childWidths += childWidth;
                }

                if (scope.tabsModel && scope.tabsModel.length > visibleTabIndex) {
                  scope.showArrow = true;
                }

                scope.$evalAsync();
              }
            }
          }, 0, false);
        };
        /**
         * Opens the overflow popup
         *
         * @param {MouseEvent} event - The MouseEvent when chevron is clicked
         * @return {void}
         */


        scope.openOverflowPopup = function (event) {
          $timeout(function _watchTabOverflowTimeout() {
            // Stop event bubbling
            event.stopPropagation(); // Toggle popup display with isClicked

            scope.isClicked = !scope.isClicked;

            if (scope.isClicked) {
              // updated local variable since not used any where
              var windowHeight = $(window).height();
              scope.registerClickedEvent(); // Set the popup position below chevron

              scope.leftPosition = event.clientX - 160;
              scope.popupHeight = windowHeight - event.clientY - 25;
            } else {
              scope.removeClickEvent();
            }
          });
        };
        /**
         * select overflown tab from popup
         */


        scope.selectOverflownTab = function () {
          scope.isClicked = false;
          scope.removeClickEvent();
          scope.leafTab.displayTab = false;
          scope.leafTab.isLeafTab = false;
          scope.leafTab.width = '100%';
          this.tabModel.displayTab = true;
          scope.leafTab = this.tabModel;
          scope.leafTab.isLeafTab = true; // to show the ellipses on leaf tab name, width must be in pixels

          scope.leafTab.width = scope.leafTabWidth - 2 + 'px';

          if (tabContainerCtrl !== null) {
            tabContainerCtrl.updateSelectedTab(this.tabModel);
          }
        };
        /**
         * Select last selected tab from overflow popup and replace the leaf tab with this to make it
         * visible
         *
         * @param {Object} tabModel - Last selected tab which is overflowing
         */


        scope.makeLastSelectedTabVisible = function (tabModel) {
          scope.leafTab.displayTab = false;
          scope.leafTab.isLeafTab = false;
          tabModel.displayTab = true;
          scope.leafTab = tabModel;
          scope.leafTab.isLeafTab = true; // to show the ellipses on leaf tab name, width must be in pixels

          scope.leafTab.width = scope.leafTabWidth - 2 + 'px';
          scope.selectedObject.tab = tabModel;

          if (tabContainerCtrl !== null) {
            tabContainerCtrl.updateSelectedTab(tabModel);
          }
        };
        /**
         * Adds a click handler on document so that popup is closed when user clicks anywhere else than
         * popup $return {void}
         */


        scope.registerClickedEvent = function () {
          $('body').on('click touchstart', function (event) {
            if (!(event && event.target && ($(event.target).hasClass('aw-widgets-cellListItem') || $(event.target.parentElement).hasClass('aw-jswidget-controlArrow aw-layoutjs-tabsContainerChevron')))) {
              if (scope.isClicked) {
                scope.isClicked = false;
                scope.$apply();
                $('body').off('click touchstart');
              }
            }
          });
          utilsSvc.handleScroll(scope, $element, 'handleTabOverflowPopup', function () {
            scope.$scrollPanel.off('scroll.handleTabOverflowPopup');
            scope.$scrollPanel = null;
            scope.isClicked = false;
            scope.$apply();
          });
        };
        /**
         * Removes the click and touchstart event listeners
         */


        scope.removeClickEvent = function () {
          $('body').off('click touchstart');
        };
        /**
         * Refreshes the tab container and adjusts the width so as to conditionally display tab overflow
         */


        scope.checkResize = function () {
          if ($element) {
            scope.refreshTabsBar(); // causing reflow so removed out
          }
        };
        /**
         * Allow tabs variable to be set from child scope. Sets up interval polling for container resize.
         *
         * @memberof NgControllers.awTabContainerController
         */


        scope.setTabs = function () {
          scope.resizeTabs();
        };
        /**
         * Helper function used by resizeTabs so as to provide for debounce and resize tabs only once
         */


        scope.resizeTimer = function () {
          scope.resizePromise = $timeout(function _watchTabResizeTimeout() {
            scope.checkResize();
          }, 500);
        };
        /**
         * Helper function to ensure that tabs are resized only once in case user is manually resizing the
         * window which results into multiple calls Provides a debounce mechanism to ensure that resize is
         * called only once at the end
         */


        scope.resizeTabs = function () {
          if (scope.resizePromise) {
            $timeout.cancel(scope.resizePromise);
          }

          scope.resizeTimer();
        }; // Watch for width changes. This will happen when the tools-n-info or navigation panel
        // opens shrinking the pwa or swa width


        scope.$watch(function _watchSizeCheck() {
          if (_debug_logTabResizeActivity) {
            logger.info('aw-tab-container.directive: $watch _clientWidth=' + scope._clientWidth);
          }

          scope._pingSizeCheck();
        });
        scope.$on('$destroy', function () {
          scope._pingSizeCheck.cancel();

          scope.tabBarContentElement = null;
          scope.subLocContentPanel = null;
          scope.isClicked = false;
          scope.lastSelected = null;
          scope.showArrow = false;
          scope.resizePromise = null;
          scope.leafTab = null;

          if ($element) {
            $element.remove();
            $element = null;
          }
        }); // invoke set tabs at the end of link function

        scope.setTabs();
      }
    };
  }]);
});