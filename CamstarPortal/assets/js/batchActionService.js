"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module provides a way for declarative framework to do outgoing calls in batch
 *
 * @module js/batchActionService
 *
 * @namespace batchActionService
 */
define(['app', 'lodash', 'js/declUtils', 'js/logger', 'js/appCtxService', 'js/conditionService', 'js/declarativeDataCtxService', 'js/actionService'], function (app, _, declUtils, logger) {
  'use strict';
  /**
   * The service to perform batch call of service
   *
   * @member batchActionService
   * @memberof NgServices
   *
   * @param {$q} $q - Service to use.
   * @param {appCtxService} appCtxSvc - Service to use.
   * @param {conditionService} conditionSvc - Service to use.
   * @param {declarativeDataCtxService} declarativeDataCtxService - Service to use.
   *
   * @returns {batchActionService} Instance of the service API object.
   */

  app.factory('batchActionService', ['$q', 'appCtxService', 'conditionService', 'declarativeDataCtxService', function ($q, appCtxSvc, conditionSvc, declarativeDataCtxService) {
    /**
     * Define public API
     */
    var exports = {};
    /**
     * Execute the given 'all actions in Steps' using the given related parameters
     *
     * @param {DeclViewModel} declViewModel - The DeclViewModel the DeclAction is a member of.
     * @param {DeclAction} batchActions - The DeclAction to execute.
     * @param {Object} dataCtxNode - The data context to use during execution.
     *
     */

    exports.executeBatchActions = function (declViewModel, batchActions, dataCtxNode) {
      // To avoid cyclic dependency (actionService->batchActionService->actionservice).
      var actionService = app.getInjector().get('actionService');

      if (!declUtils.isValidModelAndDataCtxNode(declViewModel, dataCtxNode)) {
        return;
      }

      if (batchActions.steps) {
        _executeAction(declViewModel, batchActions.steps[0], dataCtxNode, 0, batchActions.steps, actionService, null);
      }
    };
    /**
     * Execute the given 'action' using the given related parameters
     *
     * @param {DeclViewModel} declViewModel - The DeclViewModel the DeclAction is a member of.
     * @param {DeclAction} step - The DeclAction to execute.
     * @param {Object} dataCtxNode - The data context to use during execution.
     * @param {Object} index - The current index of action in Steps
     * @param {Object[]} steps - The steps under 'batch' action type
     * @param {Object} actionService - The referance to action service
     * @param {Object} actionResp - the action Response
     *
     */


    var _executeAction = function _executeAction(declViewModel, step, dataCtxNode, index, steps, actionService, actionResp) {
      var action = null;
      var outputFlag = false;
      var inputArgs = null;

      if (declViewModel._internal.actions) {
        action = declViewModel._internal.actions[step.action];
      }

      var conditionResult = false;

      if (step.outputArg) {
        outputFlag = true;
        action.outputArg = _.cloneDeep(step.outputArg);
      }

      if (step.condition) {
        var conditionExpression = declUtils.getConditionExpression(declViewModel, step.condition);

        if (conditionExpression !== null) {
          conditionResult = conditionSvc.evaluateCondition({
            data: declViewModel,
            ctx: appCtxSvc.ctx,
            response: actionResp
          }, conditionExpression);
        } // if conditionResult is undefined or null we should consider result as false.


        if (!conditionResult) {
          conditionResult = false;
        }
      }

      var isEventExecutable = step.condition && conditionResult || !step.condition;

      if (isEventExecutable) {
        if (step.inputArg) {
          inputArgs = _.cloneDeep(step.inputArg);

          try {
            declarativeDataCtxService.applyScope(declViewModel, inputArgs, null, actionResp, null);
          } catch (error) {
            throw new Error(error);
          }

          if (dataCtxNode && dataCtxNode.scope) {
            dataCtxNode.scope.parameters = inputArgs ? inputArgs : null;
          } else {
            dataCtxNode = {
              data: declViewModel,
              ctx: appCtxSvc.ctx,
              parameters: inputArgs ? inputArgs : null
            };
          }
        }

        if (action.deps) {
          /** action ID will be used for better logging */
          action.actionId = step.action;

          var doAction = function doAction(depModuleObj) {
            if (declViewModel.isDestroyed()) {
              logger.warn('Attempt to execute a command after its DeclViewModel was destroyed...' + '\n' + 'Action was therefore not executed...continuing.' + '\n' + //
              'DeclViewModel: ' + declViewModel + '\n' + //
              'Action       : ' + step.action);
            } else {
              /**
               * Check if the $scope we need has been destroyed (due to DOM manipulation) since the action
               * event processing was started.
               */
              var localDataCtx = declUtils.resolveLocalDataCtx(declViewModel, dataCtxNode); // _deps will be undefined when try to load viewModelService inside itself

              var _depModuleObj = depModuleObj;
              actionService.executeAction(declViewModel, action, localDataCtx, _depModuleObj, outputFlag).then(function (data) {
                _callBack(index, steps, _executeAction, declViewModel, localDataCtx, actionService, data);
              }, function (actionError) {
                _callBack(index, steps, _executeAction, declViewModel, localDataCtx, actionService, actionError);
              });
            }
          };

          var depModuleObj = declUtils.getDependentModule(action.deps, app.getInjector());

          if (depModuleObj) {
            doAction(depModuleObj);
          } else {
            declUtils.loadDependentModule(action.deps, $q, app.getInjector()).then(doAction);
          }
        } else {
          actionService.executeAction(declViewModel, action, dataCtxNode, null, outputFlag).then(function (data) {
            _callBack(index, steps, _executeAction, declViewModel, dataCtxNode, actionService, data);
          }, function (actionError) {
            _callBack(index, steps, _executeAction, declViewModel, dataCtxNode, actionService, actionError);
          });
        }
      } else {
        _callBack(index, steps, _executeAction, declViewModel, dataCtxNode, actionService, actionResp);
      }
    };
    /**
     *  the given related parameters
     *
     * @param {Object} index - The current index of action in Steps
     * @param {Object[]} steps - The steps under 'batch' action type
     * @param {callbackFuntion} _executeAction - The recursive callback function
     * @param {DeclViewModel} declViewModel - The DeclViewModel the DeclAction is a member of.
     * @param {Object} dataCtxNode - The data context to use during execution.
     * @param {Object} actionService - The referance to action service
     * @param {Object} actionResp -(Optional) the action response
     *
     */


    var _callBack = function _callBack(index, steps, _executeAction, declViewModel, dataCtxNode, actionService, actionResp) {
      if (index < steps.length - 1) {
        _executeAction(declViewModel, steps[index + 1], dataCtxNode, index + 1, steps, actionService, actionResp);
      }
    };

    return exports;
  }]);
});