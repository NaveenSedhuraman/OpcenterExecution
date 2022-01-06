"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to load the allcontextsViewModel.json file from the consumption
 *
 * @module js/contextContributionService
 */
define([//
'app', //
'lodash', //
'js/eventBus', //
//
'js/viewModelService', //
'js/conditionService', //
'js/configurationService', //
'js/aw-context-control.directive' //
], function (app, _, eventBus) {
  'use strict';
  /**
   * @memberof NgServices
   * @member contextContributionService
   *
   * @param {viewModelService} viewModelSvc - Service to use.
   * @param {configurationService} cfgSvc - Service to use.
   * @param {conditionService} conditionService - Service to use.
   *
   * @returns {contextContributionService} Reference to service API object.
   */

  app.factory('contextContributionService', [//
  'viewModelService', //
  'configurationService', //
  'conditionService', //
  function (viewModelSvc, cfgSvc, conditionService) {
    var exports = {};
    /**
     * Find all  placement for the given context.
     *
     * @param {Object} allContexts - container to store the placements against context
     * @param {Object} placements - all placement
     * @param {Object} contextId - context view ID
     * @param {Object} $scope - Scope to execute the command with
     *
     * @return {Object} most appropriate active placement for context.
     */

    exports.getAllPlacements = function (allContexts, placements, contextId, $scope) {
      var dataOnCategoryType = _.filter(placements, {
        contextId: contextId
      }); // only single contribution


      if (dataOnCategoryType && dataOnCategoryType.length === 1) {
        return dataOnCategoryType[0];
      } // the active placement


      if (allContexts && allContexts.length > 0) {
        var activePlacement = _.filter(allContexts, {
          contextId: contextId
        });

        if (activePlacement) {
          return activePlacement;
        }
      } else {
        var placement = exports.findActivePlacement(dataOnCategoryType, $scope);
        allContexts[contextId] = placement;
        return placement;
      }
    };
    /**
     * Check the visibility of the active placement
     *
     * @param {Object} placement placement for the view
     * @param {Object} $scope - Scope to execute the command with
     *
     * @return {Object} most visibililty of placement.
     */


    exports.isPlacementVisible = function (placement, $scope) {
      var isValidCondition = true;

      if (placement.hasOwnProperty('visibleWhen')) {
        // Re-evaluate the visible when - condition change may have come from a different command bar
        if (placement.visibleWhen.condition) {
          var conditionExpression = _.get(placement, 'visibleWhen.condition');

          isValidCondition = conditionService.evaluateCondition($scope, conditionExpression);
        } else {
          isValidCondition = _.get(placement, 'visibleWhen');
        }
      }

      return isValidCondition;
    };
    /**
     * Find active placement for the given context..
     *
     * @param {Object} allPlacements - all placements for the view
     * @param {Object} $scope - Scope to execute the command with
     *
     * @return {Object} most appropriate active placement.
     */


    exports.findActivePlacement = function (allPlacements, $scope) {
      var mostAppropriateActionHandler = null;
      var mostAppropriateConditionLength = -1;

      _.forEach(allPlacements, function (placement) {
        var conditions = _.get(placement, 'activeWhen.condition');

        if (conditions) {
          var isValidCondition = conditionService.evaluateCondition($scope, conditions);
          var expressionLength = conditions.length;

          if (_.isObject(conditions)) {
            expressionLength = JSON.stringify(conditions).length;
          }

          if (isValidCondition && expressionLength > mostAppropriateConditionLength) {
            mostAppropriateConditionLength = expressionLength;
            mostAppropriateActionHandler = placement;
          }
        } else {
          mostAppropriateActionHandler = placement;
        }
      });

      return mostAppropriateActionHandler;
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'contextContributionService'
  };
});