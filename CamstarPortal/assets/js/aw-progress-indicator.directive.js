"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-progress-indicator.directive
 */
define(['app', 'js/eventBus'], //
function (app, eventBus) {
  'use strict';
  /**
   * Definition for the (aw-progress-indicator) directive.
   *
   * @example TODO
   *
   * @member aw-progress-indicator
   * @memberof NgElementDirectives
   */

  app.directive('awProgressIndicator', ['$timeout', //
  function ($timeout) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-progress-indicator.directive.html',
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
        $scope.showProgressBar = state;

        api.toggleProgressState = function (show) {
          /**
           * Time to wait before starting the animation
           */
          var _animationWaitTime = 1000;

          if (show) {
            api.animationWaitTimer = $timeout(function () {
              // And then check to make sure there are operations running and
              // the indicator is not already activated before starting it
              if (state !== progressRefCount > 0) {
                state = progressRefCount > 0;
                $scope.$evalAsync(function () {
                  $scope.showProgressBar = state;
                });
              }
            }, _animationWaitTime);
          } else {
            // Don't toggle showProgressBar if the state is already correct
            if (state !== progressRefCount > 0) {
              state = progressRefCount > 0;
              $scope.$evalAsync(function () {
                $scope.showProgressBar = state;
              });
            }
          }
        }; // Show / hide the progress indicator depending on network activity


        api.progressStartListener = eventBus.subscribe('progress.start', function () {
          progressRefCount++;
          api.toggleProgressState(true);
        });
        api.progressStopListener = eventBus.subscribe('progress.end', function () {
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