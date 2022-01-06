"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive to show command bar
 *
 * @module js/aw-command-bar.directive
 */
define(['app', 'lodash', 'angular', 'js/eventBus', // requirejs injection
'js/aw-command-bar.controller', 'js/appCtxService', 'js/command.service', 'js/localeService', // angular injection
'js/aw-command.directive', 'js/aw-icon.directive' // view dependencies
], function (app, _, ngModule, eventBus) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Directive to display a command bar.
   *
   * Parameters:<br>
   * alignment - The alignment of the nested aw-commands<br>
   * anchor - The anchor to use when pulling commands from the command service<br>
   * reverse - Reverse the command order<br>
   * showCommandLabels - Whether to show the command labels
   *
   * @example <aw-command-bar anchor="aw_oneStep" include-global="true" include-dynamic="true" reverse
   *          alignment="HORIZONTAL"><aw-command-bar>
   *
   * @member aw-command-bar
   * @memberof NgElementDirectives
   */

  app.directive('awCommandBar', ['$document', '$window', 'localeService', 'appCtxService', 'commandService', function ($document, $window, localeService, appCtxService, commandService) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-command-bar.directive.html',
      scope: {
        alignment: '@?',
        anchor: '@',
        reverse: '=?',
        showCommandLabels: '=?',
        context: '=?'
      },
      link: function link($scope, $element, $attrs, $controller) {
        // Create a new isolated scope to evaluate commands in
        var commandScope = null;
        commandScope = $scope.$new(true);
        commandScope.ctx = appCtxService.ctx;
        commandScope.commandContext = $scope.context;
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
            // Get the command overlays
            commandService.getCommands($scope.anchor, commandScope).then($controller.updateStaticCommands);
          }
        };
        /**
         * Automatically set the necessary CSS classes on $element based on alignment
         *
         * @param {String} newVal - New alignment
         * @param {String} oldVal - Old alignment
         */


        var setAlignmentClass = function setAlignmentClass(newVal, oldVal) {
          var alignmentToClass = {
            VERTICAL: 'aw-commands-commandBarVertical',
            HORIZONTAL: 'aw-commands-commandBarHorizontal'
          };

          if (alignmentToClass[oldVal]) {
            $element.removeClass(alignmentToClass[oldVal]);
          }

          if (alignmentToClass[newVal]) {
            $element.addClass(alignmentToClass[oldVal]);
          }
        };
        /**
         * When alignment changes update the css class
         */


        $scope.$watch('alignment', setAlignmentClass);
        /**
         * When labels are shown/hidden update the command limit
         */

        $scope.$watch('showCommandLabels', $controller.updateCommandLimit);
        /**
         * When the anchor or includeGlobal options change reload the static commands
         */

        $scope.$watch('anchor', loadCommands);
        var configChangeSub = eventBus.subscribe('configurationChange.commandsViewModel', loadCommands);
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(configChangeSub);
        });
        /**
         * Recalculate command limit on window resize.
         */

        (function handleWindowResize() {
          // Add listener
          $scope.$on('windowResize', $controller.updateCommandLimit);
        })();
        /**
         * When user clicks on something outside of the command bar make sure overflow is hidden
         */


        (function handleBodyClick() {
          // Add listener
          var bodyClickListener = function bodyClickListener(event) {
            // if click on the command-bar section , it shouldn't hidden the overflow
            var eventListen = true;

            if ($element.find(event.target).length > 0) {
              eventListen = false;
            }

            if (eventListen) {
              $scope.showDownArrow = false;
            }
          };

          ngModule.element($document[0].body).on('click', bodyClickListener); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            ngModule.element($document[0].body).off('click', bodyClickListener);
          });
        })();
        /**
         * When the command bar is resized (labels shown, fullscreen toggle) update the command limit.
         */


        (function handleCommandBarResizedListener() {
          // Add listener
          var subDef = eventBus.subscribe('commandBarResized', function () {
            $scope.$evalAsync($controller.updateCommandLimit);
          }); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            eventBus.unsubscribe(subDef);
          });
        })();
      },
      controller: 'awCommandBarController'
    };
  }]);
});