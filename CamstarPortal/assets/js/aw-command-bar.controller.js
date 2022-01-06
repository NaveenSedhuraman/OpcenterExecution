"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines the {@link NgControllers.awCommandBarController}
 *
 * @module js/aw-command-bar.controller
 */
define(['app'], function (app) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * The controller for the aw-command-bar directive
   *
   * @class awCommandBarController
   * @memberof NgControllers
   */

  app.controller('awCommandBarController', ['$scope', '$timeout', '$element', '$attrs', function AwCommandBarController($scope, $timeout, $element, $attrs) {
    /**
     * Controller reference
     */
    var self = this;
    /**
     * Whether a resize is currently active. Used to debounce window resize.
     *
     * @private
     * @member _resizeActive
     * @memberOf NgControllers.awCommandBarController
     */

    var _resizeActive = false;
    /**
     * Whether to reverse the order of the commands. Reverse if directive has "reverse" attribute and it is not
     * explicitly false.
     *
     * @member reverse
     * @memberOf NgControllers.awCommandBarController
     */

    $scope.reverse = $attrs.hasOwnProperty('reverse') && $scope.reverse !== false;
    /**
     * The alignment to use for all child aw-commands.
     *
     * @member alignment
     * @memberOf NgControllers.awCommandBarController
     */

    $scope.alignment = $scope.alignment ? $scope.alignment : 'VERTICAL';
    /**
     * The full list of commands to display.
     *
     * @member commandsList
     * @memberOf NgControllers.awCommandBarController
     */

    $scope.commandsList = [];
    /**
     * Whether to show an up or down arrow
     *
     * @member showDownArrow
     * @memberOf NgControllers.awCommandBarController
     */

    $scope.showDownArrow = false;
    /**
     * How many commands can fit within the command bar currently. Initialized to a high value to prevent
     * overflow button flickering.
     *
     * @member commandLimit
     * @memberOf NgControllers.awCommandBarController
     */

    $scope.commandLimit = 999;
    /**
     * Toggle overflow when show overflow button is clicked
     *
     * @method toggleOverflow
     * @memberOf NgControllers.awCommandBarController
     *
     * @param {Event} event - Click event
     */

    $scope.toggleOverflow = function (event) {
      event.stopPropagation();
      $scope.showDownArrow = !$scope.showDownArrow;
    };
    /**
     * Update the static commands
     *
     * @method updateStaticCommands
     * @memberOf NgControllers.awCommandBarController
     *
     * @param {Object[]} newStaticCommands - New commands
     */


    self.updateStaticCommands = function (newStaticCommands) {
      newStaticCommands.forEach(function (cmd) {
        cmd.alignment = $scope.alignment;
      }); // And update the static commands

      $scope.commandsList = newStaticCommands; // Refresh the command limit

      self.updateCommandLimit();
    };
    /**
     * Recalculate how many commands can fit in the command bar before overflow occurs.
     *
     * @method updateCommandLimit
     * @memberOf NgControllers.awCommandBarController
     */


    self.updateCommandLimit = function () {
      // Overflow is currently limited to vertical command bars
      if ($scope.alignment === 'VERTICAL') {
        // Debounce resize events
        if (!_resizeActive) {
          _resizeActive = true; // Allow rendering to complete
          // Timeout needs to be greater than DefaultSubLocationView.EVENT_WAIT_TIME * 2 (to allow it to resize parent div)

          $timeout(function () {
            _resizeActive = false;
            var commandHeight = 32; // Default to 32px if not possible to retrieve correct height from aw-command

            var overflowButtonHeight = 32; // Default to 32px if not possible to find element

            var foundOverflowButton = false; // Try to find a visible command (hidden height will be 0)

            var commandElement = $element.find('aw-command > button:visible')[0]; // Try to find the overflow button

            var overflowButtonElement = $element.find('.aw-command-overflowIcon')[0];

            if (overflowButtonElement && overflowButtonElement.offsetHeight > 0) {
              // and retrieve the height
              overflowButtonHeight = overflowButtonElement.offsetHeight;
              foundOverflowButton = true;
            }

            if (commandElement && commandElement.offsetHeight > 0) {
              // retrieve the height
              commandHeight = commandElement.offsetHeight;
            } else if (foundOverflowButton) {
              commandHeight = overflowButtonHeight;
            } // if offsetParent is non-null, label element is visible
            // we don't have a good way of knowing how many commands have 2 lines of text
            // add a little buffer assuming some commands may have 2 lines

            if (commandElement && commandElement.querySelector('.aw-commands-commandIconButtonText') && commandElement.querySelector('.aw-commands-commandIconButtonText').offsetParent) {
              commandHeight += 2;
            } // Calculate the max number of commands that can fit


            var extraTopBottomSpace = 16; // to igonre top and bottom spacing of command bar

            $scope.commandLimit = Math.floor(Math.ceil($element.parent().height() - extraTopBottomSpace) / commandHeight);
            var visibleCmds = $scope.commandsList.filter(function (cmd) {
              return cmd.visible;
            });

            if ($scope.commandLimit < visibleCmds.length) {
              $scope.commandLimit = Math.floor(Math.ceil($element.parent().height() - (overflowButtonHeight + extraTopBottomSpace)) / commandHeight);
            }
          }, 500);
        }
      } else {
        $scope.commandLimit = $scope.commandsList.length;
      }
    };
  }]);
});