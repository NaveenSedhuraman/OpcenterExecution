"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/* eslint-disable valid-jsdoc */

/**
 * A module exposing a custom element used to display a modal progress indicator.
 * @module "js/mom-modal-overlay.directive"
 * @ignore
 */
define(['app', 'js/eventBus'], //
function (app, eventBus) {
  'use strict';
  /**
   * A custom element used to display a modal progress indicator.
   * > **Note:** This element is already included in all location/sublocation templates and does not need to be added to views.
   * @typedef "mom-modal-overlay"
   * @implements {Element}
   * @example
   * <mom-modal-overlay
   *   start-event="modal.progress.start"
   *   end-event="modal.progress.end"
   *   content-class="mom-modal-overlay-spinner"></mom-modal-overlay>
   */

  app.directive('momModalOverlay', ['$timeout', //
  function ($timeout) {
    return {
      restrict: 'E',
      scope: {
        startEvent: '@',
        endEvent: '@',
        contentClass: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/mom-modal-overlay.directive.html',
      link: function link($scope) {
        /**
         * state of progress indicator
         */
        var state = false;
        /**
         * Ref count of progress event, only stop progress bar if ref count is zero
         */

        var progressRefCount = 0;
        var api = {};
        $scope.showProgressIndicator = state;

        api.toggleProgressState = function (show) {
          /**
           * Time to wait before starting the animation
           */
          var _animationWaitTime = 500;

          if (show) {
            api.animationWaitTimer = $timeout(function () {
              // And then check to make sure there are operations running and
              // the indicator is not already activated before starting it
              if (state !== progressRefCount > 0) {
                state = progressRefCount > 0;
                $scope.$evalAsync(function () {
                  $scope.showProgressIndicator = state;
                });
              }
            }, _animationWaitTime);
          } else {
            // Don't toggle showProgressIndicator if the state is already correct
            if (state !== progressRefCount > 0) {
              state = progressRefCount > 0;
              $scope.$evalAsync(function () {
                $scope.showProgressIndicator = state;
              });
            }
          }
        }; //Show / hide the progress indicator depending on network activity


        api.progressStartListener = eventBus.subscribe($scope.startEvent, function () {
          progressRefCount++;
          api.toggleProgressState(true);
        });
        api.progressStopListener = eventBus.subscribe($scope.endEvent, function () {
          progressRefCount--;

          if (progressRefCount < 0) {
            progressRefCount = 0;
          }

          if (progressRefCount === 0) {
            api.toggleProgressState(false);
          }
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(api.progressStartListener);
          eventBus.unsubscribe(api.progressStopListener);

          if (api.animationWaitTimer) {
            $timeout.cancel(api.animationWaitTimer);
          }
        });
      }
    };
  }]);
});