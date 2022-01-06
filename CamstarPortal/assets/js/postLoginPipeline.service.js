"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/*
 global
 define
 */

/**
 * Defines {@link NgServices.subLocationService} which provides access to the SubLocationService from native code
 *
 * @module js/postLoginPipeline.service
 * @requires app
 */
define(['app', 'lodash', 'js/localStorage', 'js/contribution.service'], function (app, _, localStrg) {
  'use strict';

  var exports = {};
  /**
   * get the Post Login Stages from server
   *
   * @return all the Post Login Stages
   */

  exports.getPostLoginStages = function () {
    var postLoginStages = [];
    var postLoginStagesString = localStrg.get('postLoginStagesKey');

    if (postLoginStagesString && postLoginStagesString.length > 0) {
      postLoginStages = JSON.parse(postLoginStagesString);
    }

    return postLoginStages;
  };
  /**
   *
   * Reset Post Login Stages while signing in
   *
   */


  exports.resetPostLoginStages = function () {
    var postLoginStagesString = localStrg.get('postLoginStagesKey');

    if (postLoginStagesString && postLoginStagesString.length > 0) {
      localStrg.removeItem('postLoginStagesKey');
    }
  };
  /**
   * sorts the post login stages
   *
   * @param {list} get the list of step Definition from each contribution
   *
   * @return sorted pipeline steps
   */


  exports.sortPostLoginPipeline = function (contributors) {
    var postLoginStages = exports.getPostLoginStages();
    var pipeLineStepsUnsorted = [];

    _.forEach(contributors, function (contrib) {
      var step = contrib.getPipelineStepDefinition();

      for (var stageIndex = 0; stageIndex < postLoginStages.length; stageIndex++) {
        if (step.name === postLoginStages[stageIndex].name) {
          step.priority = stageIndex;
          step.status = postLoginStages[stageIndex].status;
          pipeLineStepsUnsorted.push(step);
          break;
        }
      }
    });

    var pipeLineSteps = [];

    if (pipeLineStepsUnsorted.length > 0) {
      pipeLineSteps = _.sortBy(pipeLineStepsUnsorted, function (step) {
        return step.priority;
      });
    }

    return pipeLineSteps;
  };
  /**
   * Check for Post Login Authenticated Stages
   *
   * @return {Object} with a boolean flag if all post login stages are authenticated
   */


  exports.checkPostLoginAuthenticatedStages = function () {
    var allStagesAuthenticated = true;
    var postLoginStageString = localStrg.get('postLoginStagesKey');

    if (postLoginStageString && postLoginStageString.length > 0) {
      var postLoginStages = JSON.parse(postLoginStageString);

      for (var stageIndex = 0; stageIndex < postLoginStages.length; stageIndex++) {
        if (!postLoginStages[stageIndex].status) {
          allStagesAuthenticated = false;
          break;
        }
      }
    }

    return allStagesAuthenticated;
  };
  /**
   * Provides access to the postLoginPipelineservices from native code
   *
   * @class postLoginPipelineservice
   * @memberOf NgServices
   */


  app.service('postLoginPipelineservice', [function () {
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'postLoginPipelineservice'
  };
});