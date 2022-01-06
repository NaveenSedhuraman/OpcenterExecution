"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show command bar within a popup. Same as aw-command-bar but uses different view.
 *
 * @module js/aw-popup-command-bar.directive
 */
define(['app', 'js/eventBus', // Requirejs injection
'js/aw-popup-command-cell.directive', 'js/aw-popup-panel.directive', 'js/aw-scrollpanel.directive', // View dependencies
'js/aw-command-bar.controller', 'js/appCtxService', 'js/command.service', 'js/localeService' // Angular dependencies
], function (app, eventBus) {
  'use strict';
  /**
   * Time to wait before starting the animation
   * 
   * Should be kept in sync with aw-progress-indicator
   */

  var _animationWaitTime = 1000;
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Directive to display a command bar in a popup.
   *
   * Parameters:<br>
   * anchor - The anchor to use when pulling commands from the command service<br>
   * context - Additional context to use in command evaluation<br>
   * ownPopup - One way data bound variable to display its own popup panel<br>
   * closeOnClick - Two way data bound variable to close the popup on selecting an option
   *
   * @example <aw-popup-command-bar anchor="aw_userLink" ><aw-popup-command-bar>
   * @example <aw-popup-command-bar anchor="aw_userLink" own-popup="true" close-on-click="true"><aw-popup-command-bar>
   *
   * @member aw-popup-command-bar
   * @memberof NgElementDirectives
   */

  app.directive('awPopupCommandBar', ['$timeout', 'appCtxService', 'commandService', 'localeService', function ($timeout, appCtxService, commandService, localeService) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-popup-command-bar.directive.html',
      scope: {
        anchor: '@',
        context: '=?',
        ownPopup: '<?',
        closeOnClick: '=?'
      },
      link: function link($scope, $element, $attrs, $controller) {
        /**
         * Load the localized text
         */
        localeService.getTextPromise().then(function (localTextBundle) {
          $scope.noCommandsError = localTextBundle.NO_COMMANDS_TEXT;
        });
        /**
         * Don't use any alignment
         */

        $scope.alignment = ''; // Create a new isolated scope to evaluate commands in

        var commandScope = null;
        commandScope = $scope.$new(true);
        commandScope.ctx = appCtxService.ctx;
        commandScope.commandContext = $scope.context;
        /**
         * Load the static commands
         */

        var loadCommands = function loadCommands() {
          if ($scope.anchor) {
            $scope.loading = true;
            var showLoadingTimer = $timeout(function () {
              return $scope.showLoadingIndicator = true;
            }, _animationWaitTime); // Get the command overlays

            commandService.getCommands($scope.anchor, commandScope).then($controller.updateStaticCommands).then(function () {
              $timeout.cancel(showLoadingTimer);
              $scope.showLoadingIndicator = false;
              $scope.loading = false;
              $scope.$emit('visibleChildCommandsChanged');
            });
          }
        };
        /**
         * When the anchor or includeGlobal options change reload the static commands
         */


        $scope.$watch('anchor', loadCommands);
        var configChangeSub = eventBus.subscribe('configurationChange.commandsViewModel', loadCommands);
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(configChangeSub);
        });

        if (!$scope.ownPopup) {
          /**
           * When the visible commands change for the popup to reposition
           *
           * Ugly but necessary because of how the popup service works -
           * instead of placing based on the aw-command element it places it based
           * on the size what is in the popup
           */
          $scope.$watchCollection('visibleCommands', function () {
            $scope.$emit('visibleChildCommandsChanged');
          });
        }
      },
      controller: 'awCommandBarController'
    };
  }]);
});