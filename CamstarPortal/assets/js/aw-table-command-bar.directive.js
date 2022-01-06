"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show command bar within a cell. Same as aw-command-bar but uses different view.
 *
 * @module js/aw-table-command-bar.directive
 */
define(['app', //
'js/aw-command-bar.controller', 'js/aw-command.directive', 'js/aw-icon.directive', //
'js/localeService', 'js/appCtxService', 'js/command.service'], function (app) {
  'use strict'; // eslint-disable-next-line valid-jsdoc

  /**
   * Directive to display a command bar in a cell.
   *
   * Parameters:<br>
   * anchor - The anchor to use when pulling commands from the command service<br>
   * context - Additional context to use in command evaluation<br>
   *
   * @example <aw-table-command-bar anchor="aw_oneStep"><aw-table-command-bar>
   *
   * @member aw-table-command-bar
   * @memberof NgElementDirectives
   */

  app.directive('awTableCommandBar', ['$document', '$window', 'localeService', 'appCtxService', 'commandService', function ($document, $window, localeService, appCtxService, commandService) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-table-command-bar.directive.html',
      scope: {
        anchor: '@',
        context: '=?'
      },
      link: function link($scope, $element, $attrs, $controller) {
        /**
         * Capture clicks that happen within this element. Click event cannot reach table as it would trigger selection.
         */
        $element.on('click', function (e) {
          e.stopPropagation();
        });
        /**
         * Always use horizontal alignment
         */

        $scope.alignment = ''; // Create a new isolated scope to evaluate commands in

        var commandScope = null;
        commandScope = $scope.$new(true);
        commandScope.ctx = appCtxService.ctx;
        /**
         * Load the localized text
         */

        localeService.getTextPromise().then(function (localTextBundle) {
          $scope.expandText = localTextBundle.MORE_LINK_TEXT;
          $scope.collapseText = localTextBundle.LESS_LINK_TEXT;
        });
        /**
         * Load the static commands
         */

        var loadCommands = function loadCommands() {
          if ($scope.anchor) {
            commandScope.commandContext = $scope.context; // Get the command overlays

            commandService.getCommands($scope.anchor, commandScope).then($controller.updateStaticCommands);
          }
        };
        /**
         * When the anchor or includeGlobal options change reload the static commands
         */


        $scope.$watchGroup(['anchor', 'context.vmo'], loadCommands);
      },
      controller: 'awCommandBarController'
    };
  }]);
});