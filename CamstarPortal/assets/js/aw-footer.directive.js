"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show footer
 *
 * @module js/aw-footer.directive
 * @requires app
 * @requires lodash
 * @requires jquery
 * @requires angular
 * @requires js/eventBus
 * @requires js/aw-command-bar.controller
 * @requires js/aw-command.directive
 * @requires js/aw-icon.directive
 * @requires js/appCtxService
 * @requires js/command.service
 * @requires js/localeService
 */
define(['app', 'lodash', 'jquery', 'angular', 'js/eventBus', 'js/aw-command-bar.controller', 'js/aw-command.directive', 'js/aw-icon.directive', 'js/appCtxService', 'js/command.service', 'js/localeService'], function (app, _, $, ngModule, eventBus) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Directive to display the footer. This is just a differently style command bar.
   *
   * Parameters: anchor - The anchor to use when pulling commands from the command service
   *
   * @example <aw-footer anchor="aw_footer"></aw-footer>
   *
   * @member aw-footer
   * @memberof NgElementDirectives
   */

  app.directive('awFooter', ['$document', '$window', 'localeService', 'appCtxService', 'commandService', function ($document, $window, localeService, appCtxService, commandService) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-footer.directive.html',
      scope: {
        anchor: '@'
      },
      link: function link($scope, $element, $attrs, $controller) {
        // Create a new isolated scope to evaluate commands in
        var commandScope = null;
        commandScope = $scope.$new(true);
        commandScope.ctx = appCtxService.ctx;
        /**
         * Load the localized text
         */

        localeService.getTextPromise().then(function (localTextBundle) {
          $scope.expandText = localTextBundle.MORE_LINK_TEXT;
          $scope.collapseText = localTextBundle.MORE_LINK_TEXT;
        });
        /**
         * Load the static commands
         */

        var loadCommands = function loadCommands() {
          if ($scope.anchor) {
            // Get the command overlays
            commandService.getCommands($scope.anchor, commandScope).then($controller.updateStaticCommands);
          }
        };
        /**
         * When the anchor option changes reload the static commands
         */


        $scope.$watch('anchor', loadCommands);
        var configChangeSub = eventBus.subscribe('configurationChange.commandsViewModel', loadCommands);
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(configChangeSub);
        });
        /**
         * When the overflow is displayed/hidden add/remove the faded class to the page.
         */

        $scope.$watch('showDownArrow', function () {
          var overlayClass = 'aw-layout-fadeInOut';
          var locationPanel = $('.aw-layout-locationPanel');

          if (locationPanel) {
            if ($scope.showDownArrow && !locationPanel.hasClass(overlayClass)) {
              if (!locationPanel.hasClass(overlayClass)) {
                locationPanel.addClass(overlayClass);
              }
            } else if (locationPanel.hasClass(overlayClass)) {
              locationPanel.removeClass(overlayClass);
            }
          }
        });
        /**
         * When a command is executed close the overflow.
         */

        $scope.$on('aw-command-executeCommand', function () {
          $scope.showDownArrow = false;
        });
        /**
         * When user leaves narrow mode reset overflow.
         */

        (function handleNarrowChange() {
          // Add listener
          var onNarrowModeChangeListener = eventBus.subscribe('narrowModeChangeEvent', function (data) {
            if (!data.isEnterNarrowMode) {
              $scope.$evalAsync(function () {
                $scope.showDownArrow = false;
              });
            }
          }); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            eventBus.unsubscribe(onNarrowModeChangeListener);
          });
        })();
        /**
         * When user clicks on something outside of the command bar hide the overflow
         */


        (function handleBodyClick() {
          // Add listener
          var bodyClickListener = function bodyClickListener() {
            $scope.$evalAsync(function () {
              $scope.showDownArrow = false;
            });
          };

          ngModule.element($document[0].body).on('click', bodyClickListener); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            ngModule.element($document[0].body).off('click', bodyClickListener);
          });
        })();
      },

      /**
       * The directive logic is close enough to aw-command-bar to just reuse the whole controller.
       */
      controller: 'awCommandBarController'
    };
  }]);
});