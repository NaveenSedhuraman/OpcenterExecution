"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgElementDirectives.aw-global-toolbar}
 *
 * @module js/aw-global-toolbar.directive
 */
define(['app', 'js/eventBus', 'js/logger', //
'js/configurationService', 'js/appCtxService', 'js/localStorage', 'js/localeService', //
'js/aw-progress-indicator.directive', 'js/aw-command-bar.directive', 'js/aw-icon.directive', 'js/aw-column.directive', 'js/aw-header-context.directive', 'js/aw-row.directive', 'js/aw-avatar.directive', 'js/aw-include.directive'], //
function (app, eventBus, logger) {
  'use strict';
  /**
   * Directive to display the global toolbar. Consists of a command bar with global commands and the Siemens logo. The
   * Siemens logo can be hidden with a UI configuration option. Clicking the logo will print debug information.
   *
   * @example <aw-global-toolbar></aw-global-toolbar>
   *
   * @member aw-global-toolbar
   * @memberof NgElementDirectives
   */

  app.directive('awGlobalToolbar', //
  ['configurationService', 'appCtxService', 'localStorage', 'localeService', //
  function (cfgSvc, appCtxSvc, localStrg, localeSvc) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        vmo: '=?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-global-toolbar.directive.html',
      link: function link($scope) {
        $scope.logoEnabled = true;
        var _globalTBState = 'globalTBState';
        $scope.ctx = appCtxSvc.ctx;
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.closeText = localTextBundle.CLOSE_PANEL;
          $scope.openText = localTextBundle.OPEN_PANEL;
        });

        if (localStrg.get(_globalTBState)) {
          $scope.ctx.globalToolbarExpanded = localStrg.get(_globalTBState) === 'true';
        } else {
          $scope.ctx.globalToolbarExpanded = false;
        }

        if (appCtxSvc.getCtx('aw_hosting_enabled')) {
          $scope.logoEnabled = appCtxSvc.getCtx('aw_hosting_config.ShowSiemensLogo');
        } // When a chevron in bread crumb is globalToolbarExpanded


        $scope.onChevronClick = function (selectedCrumb, event) {
          $scope.$evalAsync(function () {
            $scope.ctx.globalToolbarExpanded = !$scope.ctx.globalToolbarExpanded;
            localStrg.publish(_globalTBState, $scope.ctx.globalToolbarExpanded);
            $scope.ctx.globalToolbarOverlay = false;
          });
        };

        (function handleProPicClickEvent() {
          // Add listener
          var subDef = eventBus.subscribe('onProPicClick', function () {
            $scope.$evalAsync($scope.onProPicClick);
          }); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            eventBus.unsubscribe(subDef);
          });
        })();

        $scope.onProPicClick = function () {
          $scope.$evalAsync(function () {
            if (!$scope.ctx.globalToolbarExpanded) {
              $scope.ctx.globalToolbarExpanded = true;
              $scope.ctx.globalToolbarOverlay = true; // Fire commandBarResized event so that the command overflow can be recalculated

              eventBus.publish('commandBarResized');
            } else {
              $scope.ctx.globalToolbarExpanded = false;
              $scope.ctx.globalToolbarOverlay = false;
            }
          });
        }; // When a state parameter changes


        $scope.$on('$locationChangeSuccess', function () {
          if ($scope.ctx.globalToolbarOverlay) {
            $scope.ctx.globalToolbarExpanded = false;
            $scope.ctx.globalToolbarOverlay = false;
          }
        });
      }
    };
  }]);
});