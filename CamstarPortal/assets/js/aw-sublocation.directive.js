"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the aw-sublocation directive.
 *
 * @module js/aw-sublocation.directive
 */
define(['app', 'js/aw-command-bar.directive', 'js/aw-sidenav.directive', 'js/aw-footer.directive', 'js/aw-transclude-replace.directive', 'js/aw-progress-indicator.directive', 'js/appCtxService'], function (app) {
  'use strict';
  /**
   * Definition for the <aw-sublocation> directive.
   *
   * @example <aw-sublocation include-global-commands="false"></aw-sublocation>
   * @attribute subLocationPreference - This will make visibility of command areas or footer configurable
   * @member aw-sublocation
   * @memberof NgElementDirectives
   */

  app.directive('awSublocation', ['appCtxService', function (appCtxSvc) {
    return {
      restrict: 'E',
      // Any overrides the sublocation needs
      // Ex gateway needs to hide global commands
      scope: {
        includeGlobalCommands: '=?',
        fullScreen: '=?fullscreen',
        context: '=?',
        subLocationPreference: '<'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-sublocation.directive.html',
      // Multiple transclusion slots
      transclude: {
        // Workarea title container
        title: '?awSublocationTitle',
        // Workarea body
        body: 'awSublocationBody'
      },
      link: function link($scope, $element) {
        // Default to including all global commands
        if (!$scope.hasOwnProperty('includeGlobalCommands')) {
          $scope.includeGlobalCommands = true;
        }

        $scope.hideRightWall = appCtxSvc.getCtx('hideRightWall'); // This is replacing the top level div in the sublocation views
        // That div has these classes - add them to the element directly instead
        // TODO: update to use element based selector instead (requires cucumber changes)

        $element.addClass('aw-layout-defaultSublocation aw-layout-flexColumn');
        $scope.toolsAndInfoConfig = {
          slide: 'FLOAT',
          direction: 'RIGHT_TO_LEFT',
          animation: false
        };
        $scope.navigationConfig = {
          slide: 'PUSH',
          direction: 'LEFT_TO_RIGHT',
          animation: false
        };
      }
    };
  }]);
});