"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/**
 * Directive to display ordered steps.
 *
 * @module js/aw-step-progress.directive
 */
define(['app', 'lodash', 'js/eventBus', 'angular', 'js/aw-widget.directive', 'js/exist-when.directive', 'js/aw-property.directive', 'js/viewModelService', 'js/aw-repeat.directive'], function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display ordered steps.
   * @returns {Object} return
   */

  app.directive('awStepProgress', [function () {
    return {
      restrict: 'E',
      scope: {
        clickable: '=?',
        steps: '=',
        currentStep: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-step-progress.directive.html',
      link: function link($scope, attrs) {
        var _stepCompletedDef;
        /**
         * Function to mark a step as completed
         * @param {Object} aStep step
         */


        function markCompleted(aStep) {
          aStep.isCompleted = true;
          aStep.isCurrentActive = false;
          aStep.isInProgress = false;
        }
        /**
         * Function to mark a step in progress
         * @param {Object} aStep step
         */


        function markInProgressStep(aStep) {
          aStep.isCompleted = false;
          aStep.isCurrentActive = true;
          aStep.isInProgress = true;
        }
        /**
         * Function to mark a step as current active
         * @param {Object} aStep step
         */


        function markCurrentActiveStep(aStep) {
          aStep.isCurrentActive = true;
        }
        /**
         * Function to reset a current active step
         * @param {Object} aStep step
         */


        function resetCurrentActiveStep(aStep) {
          aStep.isCurrentActive = false;
        }
        /**
         * Function to check equality of two steps
         * @param {Object} aStep step
         * @param {Object} bStep step
         * @returns {Object} boolean
         */


        function isEqual(aStep, bStep) {
          if (aStep.dbValue && bStep.dbValue && aStep.dbValue === bStep.dbValue) {
            return true;
          }

          if (aStep.uiValue && bStep.uiValue && aStep.uiValue === bStep.uiValue) {
            return true;
          }

          return false;
        }

        _stepCompletedDef = eventBus.subscribe(attrs[0].id + '.stepCompleted', function (eventData) {
          if (eventData) {
            if (eventData.completedStep) {
              var completedStep = _.find($scope.steps, function (aStep) {
                if (isEqual(aStep, eventData.completedStep)) {
                  return true;
                }
              });

              if (completedStep) {
                markCompleted(completedStep);
              }
            }

            if (eventData.currentStep) {
              var currentStep = _.find($scope.steps, function (aStep) {
                if (isEqual(aStep, eventData.currentStep)) {
                  return true;
                }
              });

              if (currentStep) {
                markInProgressStep(currentStep);
                $scope.currentStep = currentStep;
              }
            }
          }
        });

        if ($scope.clickable) {
          $scope.doIt = function ($event, selectedStep) {
            resetCurrentActiveStep($scope.currentStep);
            markCurrentActiveStep(selectedStep);
            $scope.currentStep = selectedStep;
            eventBus.publish(attrs[0].id + '.stepSelectionChanged', {
              selectedStep: selectedStep
            });
          };
        }

        $scope.$on('$destroy', function () {
          if (_stepCompletedDef) {
            eventBus.unsubscribe(_stepCompletedDef);
            _stepCompletedDef = null;
          }
        });
      }
    };
  }]);
});