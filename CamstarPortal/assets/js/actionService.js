"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module provides a way for declarative framework to do outgoing calls like SOA or REST.
 *
 * @module js/actionService
 *
 * @namespace actionService
 */
define(['app', 'lodash', 'assert', 'js/eventBus', 'js/browserUtils', 'js/parsingUtils', 'js/declUtils', 'js/logger', 'soa/kernel/soaService', 'js/declarativeDataCtxService', 'soa/kernel/propertyPolicyService', 'js/appCtxService', 'js/messagingService', 'js/conditionService', 'js/localeService', 'js/clipboardService', 'js/navigationService', 'js/adapterService', 'js/dataMapperService', 'js/configurationService', 'js/batchActionService', 'js/wysiwygModeService'], function (app, _, assert, eventBus, browserUtils, parsingUtils, declUtils, logger) {
  'use strict';
  /**
   * The service to perform SOA or REST calls.
   *
   * @member actionService
   * @memberof NgServices
   *
   * @param {Object} $http - Service to use.
   * @param {Object} $q - Service to use.
   * @param {Object} soaSvc - Service to use.
   * @param {Object} declarativeDataCtxSvc - Service to use.
   * @param {Object} propertyPolicySvc - Service to use.
   * @param {Object} appCtxSvc - Service to use.
   * @param {Object} messagingSvc - Service to use.
   * @param {Object} conditionSvc - Service to use.
   * @param {Object} localeSvc - Service to use.
   * @param {Object} clipboardService - Service to use.
   * @param {Object} navigationService - Service to use.
   * @param {Object} adapterSvc - Service to use.
   * @param {Object} dataMapperSvc - Service to use.
   * @param {Object} cfgSvc - configuration service
   * @param {Object} batchActionService - batch action service
   * @returns {Object} Instance of the service API object.
   */

  app.factory('actionService', ['$http', '$q', 'soa_kernel_soaService', 'declarativeDataCtxService', 'soa_kernel_propertyPolicyService', 'appCtxService', 'messagingService', 'conditionService', 'localeService', 'clipboardService', 'navigationService', 'adapterService', 'dataMapperService', 'configurationService', 'batchActionService', 'wysModeSvc', function ($http, $q, soaSvc, declarativeDataCtxSvc, propertyPolicySvc, appCtxSvc, messagingSvc, conditionSvc, localeSvc, clipboardService, navigationService, adapterSvc, dataMapperSvc, cfgSvc, batchActionService, wysModeSvc) {
    /**
     * {StringAray} Props to include when logging the properties of a dseclAction.
     */
    var _actionPropsToLog = ['actionId', 'actionType', 'method', 'serviceName', 'deps', 'actionId'];
    /**
     * {Boolean} TRUE if 'action' activity should be logged to the log service.
     * <P>
     * Note: This flag is controlled by the existence of the 'logActionActivity' attribute in the current document's
     * URL.
     */

    var _logActionActivity = browserUtils.getUrlAttributes().logActionActivity !== undefined;
    /**
     * {Boolean} TRUE if 'action' event activity should be logged to the log service.
     * <P>
     * Note: This flag is controlled by the existence of the 'logActionEventActivity' attribute in the current
     * document's URL.
     */


    var _logActionEventActivity = browserUtils.getUrlAttributes().logActionEventActivity !== undefined;
    /**
     * Define public API
     */


    var exports = {};
    /**
     * Makes SOA call with given action and inputData. return the promise object.
     *
     * @param {Object} action - The 'declAction' object.
     * @param {Object} inputData - The 'inputData' object.
     *
     * @return {Promise} A promise object resolved with the results of the SOA call (or rejected if there is a
     *         problem).
     */

    var _callSOA = function _callSOA(action, inputData) {
      var promise = null;

      if (action.actionType === 'TcSoaService') {
        if (action.serviceName) {
          if (action.inputData) {
            promise = soaSvc.postUnchecked(action.serviceName, action.method, inputData);
          } else {
            promise = $q.reject('No TcSoaService input data specified');
          }
        } else {
          promise = $q.reject('No TcSoaService service specified');
        }
      } else {
        promise = $q.reject('Unknown action type: ' + action.actionType);
      }

      return promise;
    };
    /**
     * Perform a SOA action. Support calling SOA service, return the response object.
     *
     * @param {Object} action - The 'declAction' to be executed.
     * @return {Promise} A promise object resolved with the results of the action (or rejected if there is a
     *         problem).
     */


    exports.performSOAAction = function (action) {
      var deferred = $q.defer();

      _callSOA(action, action.inputData).then(function (actionResponseObj) {
        if (!declUtils.isNil(actionResponseObj)) {
          var err = null;

          if (actionResponseObj.partialErrors || actionResponseObj.PartialErrors) {
            err = soaSvc.createError(actionResponseObj);
          }

          if (actionResponseObj.ServiceData && actionResponseObj.ServiceData.partialErrors) {
            err = soaSvc.createError(actionResponseObj.ServiceData);
          }

          if (err) {
            deferred.reject(err);
          } else if (!_.isEmpty(action.outputData)) {
            deferred.resolve(actionResponseObj);
          }
        }
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };
    /**
     * @param {DeclViewModel} declViewModel - Model that owns the action.
     * @param {DeclAction} action - Action to 'finish'.
     * @param {Object} dataCtxNode - The context in which to evaluate any conditions/bindings.
     * @param {Object} depModuleObj - (Optional) Reference to any extra module used to finish the action.
     * @param {Object} actionResponseObj - The 'raw' object returned from the action itself.
     * @param {DeferredResolution} deferred - Deferred action resolved when the action is finished.
     */


    var _finishAction = function _finishAction(declViewModel, action, dataCtxNode, depModuleObj, actionResponseObj, deferred) {
      var err = null;

      if (!_.isEmpty(actionResponseObj)) {
        if (actionResponseObj.partialErrors || actionResponseObj.PartialErrors) {
          err = soaSvc.createError(actionResponseObj);
        }

        if (actionResponseObj.ServiceData && actionResponseObj.ServiceData.partialErrors) {
          err = soaSvc.createError(actionResponseObj.ServiceData);
        }
      }

      if (err) {
        _processError(err, declViewModel, action, dataCtxNode, depModuleObj);

        deferred.reject(err);
      } else {
        _processSuccess(declViewModel, action, dataCtxNode, depModuleObj);

        deferred.resolve(actionResponseObj);
      }
    };

    var loadCustomActionDependentModule = function loadCustomActionDependentModule(customAction) {
      var depModuleObj = declUtils.getDependentModule(customAction.deps, app.getInjector());

      if (depModuleObj) {
        return $q.resolve(depModuleObj);
      }

      return declUtils.loadDependentModule(customAction.deps, $q, app.getInjector()).then(function success(depModuleObj) {
        return $q.resolve(depModuleObj);
      }, function reject(error) {
        return $q.reject(error);
      });
    };
    /**
     * Perform a action. Support calling SOA service, JavaScript function and RESTful API. A promise object will be
     * returned.
     *
     * @param {DeclViewModel} declViewModel - The 'declViewModel' context the operation is being performed within.
     * @param {Object} action - The 'declAction' to be executed.
     * @param {FunctionArray} functionsList - An array of functions that can be used when applying the $scope.
     * @param {Object} $scope - The AngularJS $scope context of this operation.
     * @param {ModuleObject} depModuleObj - The dependent module of the 'action' containing any functions to be
     *            executed.
     * @return {Promise} A promise object resolved with the results of the action (or rejected if there is a
     *         problem).
     */


    var _performAction = function _performAction(declViewModel, action, functionsList, $scope, depModuleObj) {
      if (!action) {
        return $q.reject('Missing action parameter');
      }

      if (!action.actionType) {
        return $q.reject('Missing action type for actionId: ' + action.actionId);
      }

      var inputData = null;
      var inputError = null;
      /**
       * If an 'alternate' set of 'inputData' is specified, use it as-is without applying the scope.
       * <P>
       * Note: This 'alternate' is used to handle async operations where the $scope can change between the time
       * the action is queued to be executed and when we get here.
       */

      if (action.altInputData) {
        inputData = action.altInputData;
      } else {
        if (action.inputData) {
          inputData = _.cloneDeep(action.inputData);
        } else if (action.navigationParams) {
          if (typeof action.navigationParams === 'string') {
            inputData = {
              navigationParams: action.navigationParams
            };
          } else {
            inputData = _.cloneDeep(action.navigationParams);
          }
        } // if $scope.paramter does not exist, we can assume action is not fired from event or event-data does not exist.
        // In that case we need to process the scope.parameter section to get default value for the parameters
        // We might have some inputdata, which is referring to parameters section.
        // The below code scans the action.inputData for "{{parameters" keyword as value in action.inputdata.
        // {action: parameters: { "param1": "{{data.xyz}}"}, inputdata : { "key1":"{{parameter.param1}}"}}
        //  and replaces them with the default value specified in parameters in action.inputdata : { "key1":"{{data.param1}}"
        // later we resolve the inputData, this helps us not to use applyScope twice.


        if (!$scope.parameters && action.parameters) {
          var keySequence = [];
          var pattern = /^{{parameters/;

          _.forEach(action.inputData, function processInputData(value, key) {
            if (value && _.isObject(value)) {
              keySequence.push(key);

              _.forEach(value, processInputData);

              keySequence.pop();
            } else if (value && _.isString(value)) {
              if (pattern.test(value)) {
                keySequence.push(key);
                var eventMapKey = keySequence.join('.');
                var parameterKey = parsingUtils.getStringBetweenDoubleMustaches(value);

                _.set(inputData, eventMapKey, _.get(action, parameterKey, null));

                keySequence.pop();
              }
            }
          });
        }

        if (inputData) {
          try {
            declarativeDataCtxSvc.applyScope(declViewModel, inputData, functionsList, $scope, depModuleObj);
          } catch (error) {
            inputError = error;
          }
        }
      }
      /**
       * Now that any binding has happened, log the current action (if necessary)
       */


      if (_logActionActivity) {
        logger.info('action: ' + '\n' + JSON.stringify(action, _actionPropsToLog, 2));

        if (action.actionType === 'RESTService') {
          logger.info('RESTService.inputData: ' + '\n' + JSON.stringify(inputData, null, 2));
        } else if (action.actionType === 'GraphQL') {
          logger.info('GraphQL.inputData: ' + '\n' + JSON.stringify(inputData, null, 2));

          if (action.outputData) {
            logger.info('GraphQL.outputData: ' + '\n' + JSON.stringify(action.outputData, null, 2));
          }
        } else if (action.actionType === 'JSFunctionAsync' && action.method === 'callGraphQL') {
          logger.info('GraphQL.inputData: ' + '\n' + JSON.stringify(inputData, null, 2));

          if (action.outputData) {
            logger.info('GraphQL.outputData: ' + '\n' + JSON.stringify(action.outputData, null, 2));
          }
        }
      }
      /**
       * Check for an input error
       */


      var promise = null;
      var deferred;

      if (inputError) {
        promise = $q.reject({
          errorCode: inputError
        });
        return promise;
      }

      return declarativeDataCtxSvc.applyExpression(inputData).then(function () {
        // eslint-disable-line complexity
        if (action.actionType === 'dataProvider') {
          promise = exports.performDataProviderAction(declViewModel, action, $scope);
        } else if (action.actionType === 'TcSoaService') {
          if (logger.isDeclarativeLogEnabled()) {
            logger.declarativeLog('DECLARATIVE TRACE - Action: TcSoaService ' + action.serviceName + ':' + action.method + ', inputData: %O', inputData);
          }

          promise = _callSOA(action, inputData);
        } else if (action.actionType === 'RESTService') {
          if (logger.isDeclarativeLogEnabled()) {
            logger.declarativeLog('DECLARATIVE TRACE - Action: RESTService, inputData: %O', inputData);
          }

          promise = $http(inputData.request);
        } else if (action.actionType === 'Event') {
          if (action.inputData) {
            deferred = $q.defer();
            setTimeout(function () {
              /**
               * Check if the $scope we need has been destroyed (due to DOM manipulation) since
               * the action event processing was started.
               */
              var localDataCtx = declUtils.resolveLocalDataCtx(declViewModel, $scope);

              if (!declUtils.isValidModelAndDataCtxNode(declViewModel, localDataCtx)) {
                logger.warn('Action was not processed due to previously destroyed resource(s)');
                return;
              }
              /**
               * Loop for each 'event' type action and publish the ones who's conditions are
               * currently TRUE.
               */


              _.forEach(action.inputData.events, function (event) {
                var evaluationEnv = {
                  data: declViewModel,
                  ctx: parsingUtils.parentGet(localDataCtx, 'ctx'),
                  conditions: declViewModel._internal.conditionStates
                };
                var conditionValue = true;

                if (event.condition) {
                  conditionValue = declUtils.evaluateCondition(declViewModel, event.condition, evaluationEnv, depModuleObj, app.getInjector());
                }

                if (conditionValue) {
                  if (_logActionEventActivity) {
                    logger.info('action: ' + '\n' + JSON.stringify(action, _actionPropsToLog, 2) + '\n' + 'ActionEvent: ' + event.name);
                  }

                  var eventDataToPublish = {};

                  if (event.eventData) {
                    eventDataToPublish = _.cloneDeep(event.eventData);
                    declarativeDataCtxSvc.applyScope(declViewModel, eventDataToPublish, functionsList, localDataCtx, depModuleObj);
                  }

                  eventDataToPublish._source = declViewModel._internal.modelId;

                  if (event.excludeLocalDataCtx !== true) {
                    eventDataToPublish.scope = localDataCtx;
                  }

                  if (logger.isDeclarativeLogEnabled()) {
                    logger.declarativeLog('DECLARATIVE TRACE - Event: ' + event.name + ', eventData: %O', eventDataToPublish);
                  }

                  eventBus.publish(event.name, eventDataToPublish);
                }
              });

              deferred.resolve();
            }, 0);
            promise = deferred.promise;
          }
        } else if (action.actionType === 'JSFunction' || action.actionType === 'JSFunctionAsync') {
          deferred = $q.defer();
          promise = deferred.promise;
          /**
           * Collect function parameters from input data
           */

          var params = [];

          _.forEach(inputData, function (param) {
            params.push(param);
          });

          if (action.actionType === 'JSFunction') {
            try {
              if (logger.isDeclarativeLogEnabled()) {
                logger.declarativeLog('DECLARATIVE TRACE - Action: JSFunction ' + action.method + ', parameters: %O', params);
              }

              var ret = depModuleObj[action.method].apply(depModuleObj, params);
              deferred.resolve(ret);
            } catch (error2) {
              deferred.reject({
                errorCode: error2
              });
            }
          } else {
            // JSFunctionAsync
            try {
              if (logger.isDeclarativeLogEnabled()) {
                logger.declarativeLog('DECLARATIVE TRACE - Action: JSFunctionAsync ' + action.method + ', parameters: %O', params);
              }

              depModuleObj[action.method].apply(depModuleObj, params).then(function (resolved) {
                deferred.resolve(resolved);
              }, function (err) {
                deferred.reject(err);
              });
            } catch (error3) {
              deferred.reject({
                errorCode: error3
              });
            }
          }
        } else if (action.actionType === 'Test') {
          /**
           * This actionType is meant to allow automated testing without the need for a live server to
           * load dependent modules. The resolved data for the deferred action is just the same object
           * that was given as the 'inputData'.
           */
          deferred = $q.defer();
          promise = deferred.promise;
          deferred.resolve(inputData);
        } else if (action.actionType === 'Copy') {
          /**
           * This actionType is needed when we are dealing with OS commands like copying to clipboard
           * which needs to run without any defer mechanism. Since document.execCommand('copy') will
           * be successful only when it runs through a user click event and not with defer and digest
           * cycle event. we can use this actionType for other copy command too apart from shareURL
           * since it calls the same document.execCommand('copy') function after copying it to
           * awclipboard.
           */

          /**
           * There will be two copyTypes: one is copying URL to clipboard, other is copying an object.
           */
          if (inputData.copyType === 'URL') {
            var adaptedObjects = adapterSvc.getAdaptedObjectsSync(inputData.objectToCopy);
            clipboardService.copyUrlToClipboard(adaptedObjects);
            promise = $q.when();
          } else if (inputData.copyType === 'Object') {
            clipboardService.copyHyperlinkToClipboard(inputData.objectToCopy);
            promise = $q.when();
          }
        } else if (action.actionType === 'Navigate') {
          if (action.navigateTo) {
            if (inputData.navigationParams) {
              inputData = inputData.navigationParams;
            }

            if (logger.isDeclarativeLogEnabled()) {
              logger.declarativeLog('DECLARATIVE TRACE - Action: Navigate' + ', inputData:%O', inputData);
            }

            promise = navigationService.navigate(action, inputData);
          } else {
            return $q.reject('Missing navigate to in action type: ' + action.actionType + ' for actionId: ' + action.actionId);
          }
        } else if (action.actionType === 'Edit') {
          if (logger.isDeclarativeLogEnabled()) {
            logger.declarativeLog('DECLARATIVE TRACE - Action: Edit');
          }

          var methods = ['startEdit', 'saveEdits', 'cancelEdits', 'isDirty'];

          if (action.method && methods.indexOf(action.method) !== -1) {
            promise = declViewModel[action.method].apply(declViewModel);
          } else {
            return $q.reject('Not a valid edit action : ' + action.method);
          }
        } else if (action.actionType === 'batchJob') {
          batchActionService.executeBatchActions(declViewModel, action, $scope);
        } else {
          // process custom Action Type
          deferred = $q.defer();
          promise = deferred.promise;
          cfgSvc.getCfg('actionTemplateDefs').then(function (actionTemplateDefs) {
            if (actionTemplateDefs[action.actionType]) {
              var customAction = _.cloneDeep(actionTemplateDefs[action.actionType]); // resolver for inputData defined at successive action template defs that include ctx, data and inputData


              var resolver = {
                inputData: inputData,
                ctx: appCtxSvc.ctx,
                data: declViewModel
              }; // load the dependent modules if deps is specified

              if (customAction.deps) {
                var depModuleObjPromise = loadCustomActionDependentModule(customAction);
                depModuleObjPromise.then(function (depModuleObj) {
                  return deferred.resolve(_performAction(declViewModel, customAction, functionsList, resolver, depModuleObj));
                });
              } else {
                return deferred.resolve(_performAction(declViewModel, customAction, functionsList, resolver, depModuleObj));
              }
            } else {
              logger.error('error :: action type ->' + action.actionType + ' is missing.');
              return $q.reject('Unknown action type: ' + action.actionType);
            }
          });
        } // end of custom action


        return promise;
      });
    };
    /**
     * Execute the given 'action' using the given related parameters
     *
     * @param {DeclViewModel} declViewModel - The DeclViewModel the DeclAction is a member of.
     * @param {DeclAction} action - The DeclAction to execute.
     * @param {Object} dataCtxNode - The data context to use during execution.
     * @param {ModuleObject} depModuleObj - (Optional) Reference to a module containing 'glue code' to assist in the
     *            execution.
     * @param {Object} mapDataOnAction - (Optional) True if outputData of action should not map on viewModel/ctx.
     *
     * @return {Promise} A promise resolved with an 'actionResponseObj' when the action is completed.
     */


    exports.executeAction = function (declViewModel, action, dataCtxNode, depModuleObj, mapDataOnAction) {
      declUtils.assertValidModelDataCtxNodeAndAction(declViewModel, dataCtxNode, action);
      var deferred = $q.defer();
      var functionsList = declViewModel._internal.functions;
      var actionPolicyId = null;

      if (action.policy && action.actionType === 'TcSoaService') {
        var policy = _.cloneDeep(action.policy);

        declarativeDataCtxSvc.applyScope(declViewModel, policy, functionsList, dataCtxNode, depModuleObj);
        actionPolicyId = propertyPolicySvc.register(policy, action.method + '_Policy');
      } // load function deps


      var functionDeps = declUtils.getFunctionDeps(action, functionsList); // Filter already loaded deps

      _.forEach(depModuleObj, function (funcValue, funcKey) {
        var loaded = _.find(functionDeps, function (funcDep) {
          return funcDep.includes(funcKey);
        });

        if (loaded) {
          _.remove(functionDeps, function (funcDep) {
            return funcDep === loaded;
          });
        }
      });

      declUtils.loadDependentModules(functionDeps, $q, app.getInjector()).then(function (functionDependancies) {
        _.forEach(functionDependancies, function (funcDepVal, funcDepKey) {
          depModuleObj[funcDepKey] = funcDepVal;
        });

        var promise = _performAction(declViewModel, action, functionsList, dataCtxNode, depModuleObj);

        if (!promise) {
          return;
        }

        promise.then(function (actionResponseObj) {
          if (actionPolicyId) {
            propertyPolicySvc.unregister(actionPolicyId);
          }
          /**
           * Check if the declViewModel got destroyed while we were waiting for the action to complete. This can
           * happen, for example, when multiple subscribers are listening to a common event like 'selection' and
           * one of them (I'm looking at you GWT) causes the panel the declViewModel is associated with to close
           * (thus destroying the $scope and the declViewModel associated with it).
           * <P>
           * If so: There is nothing more that can be done with the declViewModel and we just want to log a
           * warning about the situation and reject the returned 'promise'.
           */


          if (declViewModel.isDestroyed()) {
            /**
             * If the action is trying to actually do something with the response and the view model is destroyed
             * log an error
             */
            if (actionResponseObj) {
              var errorMsg = //
              'Attempt to finish processing an action after its DeclViewModel was destroyed...' + '\n' + //
              'Action was therefore not finished.' + '\n' + //
              'DeclViewModel: ' + declViewModel + '\n' + //
              'Action:' + '\n' + //
              JSON.stringify(action, _actionPropsToLog, 2);
              logger.warn(errorMsg);
              deferred.reject(errorMsg);
            } else {
              // Otherwise do nothing
              deferred.resolve();
            }

            return;
          }
          /**
           * Check if we have a response and an output data map to work with.<BR>
           * If so: Process all the action output definitions and stick them on the dataCtxNode.
           * <P>
           * Note: We must use the logic of 'declUtils.isNil' instead of Lodash's 'isEmpty' for the action object
           * to handle boolean or number type object responses (D-47571).
           */


          if (!declUtils.isNil(actionResponseObj) && !_.isEmpty(action.outputData)) {
            var deferredAssignments = {};
            /* If dataParsers are defined, then run the actionResponseObj through them
             * before pipelining to outPutData.
             */

            if (_.isArray(action.dataParsers)) {
              actionResponseObj = dataMapperSvc.applyDataParseDefinitions(actionResponseObj, declViewModel, action.dataParsers, dataCtxNode, depModuleObj);
            }
            /**
             * Loop for each mapping in the 'outputData' spec
             */


            var index = 0;

            _.forEach(action.outputData, function (fromPath, toPath) {
              var fromObj;

              if (mapDataOnAction && action.outputArg) {
                toPath = action.outputArg[index];
              }

              if (_.isBoolean(fromPath)) {
                fromObj = fromPath;
              } else if (_.isEmpty(fromPath)) {
                /**
                 * To support action as JS function call, assign function return value as the result when
                 * empty value expression specified
                 */
                fromObj = actionResponseObj;
              } else if (_.isString(fromPath) && fromPath.indexOf('result.') === 0) {
                /**
                 * If fromPath has a 'result.' prefix, parse the expression within fromPath to get the
                 * correct value.
                 */
                var fromResultPath = fromPath.split('result.')[1];
                fromObj = _.get(actionResponseObj, fromResultPath);
              } else {
                /**
                 * If fromPath is defined, parse the expression within fromPath to get the correct value.
                 */
                fromObj = declarativeDataCtxSvc.getOutput(declViewModel, actionResponseObj, fromPath, depModuleObj);
              }
              /**
               * If the toPath starts with ctx. update the appCtxService
               */


              if (toPath.indexOf('ctx.') === 0) {
                var toCtxName = toPath.split('ctx.')[1];
                appCtxSvc.updatePartialCtx(toCtxName, fromObj);
              } else {
                // The function can return a promise object. So delegating to $q.when
                // to handle the case in cleaner way
                deferredAssignments[toPath] = $q.when(fromObj);
              }

              index += 1;
            });

            $q.all(deferredAssignments).then(function (resolvedAssignments) {
              if (mapDataOnAction) {
                var data = {
                  actionData: []
                };

                _.forEach(resolvedAssignments, function (fromPath, toPath) {
                  _.set(data.actionData, toPath, fromPath);
                });

                _finishAction(declViewModel, action, dataCtxNode, depModuleObj, data, deferred);
              } else {
                _.forEach(resolvedAssignments, function (fromPath, toPath) {
                  _.set(declViewModel, toPath, fromPath);
                }); // Update binding when data changed


                _.defer(function () {
                  if (dataCtxNode && dataCtxNode.$apply) {
                    dataCtxNode.$apply();
                  }

                  _finishAction(declViewModel, action, dataCtxNode, depModuleObj, actionResponseObj, deferred);
                });
              }
            });
          } else {
            _finishAction(declViewModel, action, dataCtxNode, depModuleObj, actionResponseObj, deferred);
          }
        }, function (err) {
          if (actionPolicyId) {
            propertyPolicySvc.unregister(actionPolicyId);
          }

          _processError(err, declViewModel, action, dataCtxNode, depModuleObj); // eslint-disable-line no-use-before-define


          deferred.reject(err);
        });
      });
      return deferred.promise;
    };
    /**
     * Execute the given 'dataprovider action' using the given related parameters
     *
     * @param {DeclViewModel} declViewModel - The DeclViewModel the DeclAction is a member of.
     * @param {DeclAction} action - The DeclAction to execute.
     * @param {Object} dataCtxNode - The data context to use during execution.
     *
     * @return {Promise} A promise resolved with an 'dataprovider action' when it is completed.
     */


    exports.performDataProviderAction = function (declViewModel, action, dataCtxNode) {
      var dataProviderArray = [];

      var createDataProviderInput = function createDataProviderInput(dataProvider, action) {
        return {
          dataProvider: dataProvider,
          action: action ? action : 'initialize'
        };
      };

      if (action.methods && _.isArray(action.methods)) {
        _.forEach(action.methods, function (method) {
          var dataProvider = declViewModel.dataProviders[method];
          var dpAction = action.inputData && action.inputData.action ? action.inputData.action : 'initialize';

          if (dataProvider) {
            dataProviderArray.push(createDataProviderInput(dataProvider, dpAction));
          }
        });
      } else if (action.method) {
        var dpAction = action.inputData && action.inputData.action ? action.inputData.action : 'initialize';
        dataProviderArray.push(createDataProviderInput(declViewModel.dataProviders[action.method], dpAction));
      } else {
        logger.warn('Missing action method(s) name for action type dataProvider');
      }

      if (!_.isEmpty(dataProviderArray)) {
        return _processAllDataProvider(dataProviderArray, declViewModel, dataCtxNode);
      }
    };
    /**
     * Process the events of the executed action
     *
     * @param {DeclViewModel} declViewModel - The declarative view model
     * @param {DeclAction} action - The declarative action.
     * @param {Object} events - The events of an action object on the View model
     * @param {Object} evaluationEnv - The environment on which to evaluate event conditions
     * @param {Object} dataCtxNode - The data context
     * @param {ModuleObject} depModuleObj - The dependent module object
     * @param {Boolean} isSuccess - TRUE if we are processing 'success' of the action. FALSE if processing action
     *            'failure'.
     */


    var _processActionEvents = function _processActionEvents(declViewModel, action, events, evaluationEnv, dataCtxNode, depModuleObj, isSuccess) {
      var functionsList = declViewModel._internal.functions;

      _.forEach(events, function (event) {
        /**
         * Fire event when condition value is true
         */
        var conditionValue = true;

        if (event.condition) {
          conditionValue = conditionSvc.evaluateCondition(declViewModel, event.condition, evaluationEnv, depModuleObj);
        }

        if (conditionValue) {
          if (_logActionEventActivity) {
            if (isSuccess) {
              logger.info('action: ' + '\n' + JSON.stringify(action, _actionPropsToLog, 2) + '\n' + 'SuccessEvent: ' + event.name);
            } else {
              logger.info('action: ' + '\n' + JSON.stringify(action, _actionPropsToLog, 2) + '\n' + 'FailureEvent: ' + event.name);
            }
          }

          if (event.eventData) {
            var eventData = _.cloneDeep(event.eventData);

            declarativeDataCtxSvc.applyScope(declViewModel, eventData, functionsList, dataCtxNode, depModuleObj);

            if (event.excludeLocalDataCtx !== true) {
              eventData.scope = dataCtxNode;
            }

            eventData._source = declViewModel._internal.modelId;

            if (logger.isDeclarativeLogEnabled()) {
              logger.declarativeLog('DECLARATIVE TRACE - Event: ' + event.name + ', eventData: %O', eventData);
            }

            eventBus.publish(event.name, eventData);
          } else {
            eventBus.publish(event.name, {
              scope: dataCtxNode,
              _source: declViewModel._internal.modelId
            });
          }
        }
      });
    };
    /**
     * Process the 'Success' part of the executed action
     *
     * @param {Object} declViewModel - The declarative view model
     * @param {Object} action - The action object on the View model
     * @param {Object} dataCtxNode - The data context
     * @param {ModuleObject} depModuleObj - The dependent module object
     */


    var _processSuccess = function _processSuccess(declViewModel, action, dataCtxNode, depModuleObj) {
      var events = action.events;
      var actionMessages = action.actionMessages;
      var allMessages;

      if (events && events.success) {
        var evaluationEnv = {
          data: declViewModel,
          ctx: appCtxSvc.ctx
        };

        _processActionEvents(declViewModel, action, events.success, evaluationEnv, dataCtxNode, depModuleObj, true);
      }

      if (actionMessages && actionMessages.success) {
        _.forEach(actionMessages.success, function (successMessage) {
          if (successMessage) {
            var condValue = true;

            if (successMessage.condition) {
              var evaluationEnv = {
                data: declViewModel,
                ctx: appCtxSvc.ctx
              };
              condValue = conditionSvc.evaluateCondition(declViewModel, successMessage.condition, evaluationEnv, depModuleObj);
            }

            if (condValue) {
              if (!allMessages) {
                allMessages = _.cloneDeep(declViewModel._internal.messages);
              }

              messagingSvc.reportNotyMessage(declViewModel, allMessages, successMessage.message, dataCtxNode);
            }
          } else {
            logger.error('Invalid action successMessage:' + successMessage);
          }
        });
      }
    };
    /**
     * Process the error and the 'Failure' part of the executed action
     *
     * @param {Object} err - JavaScript Error object
     * @param {Object} declViewModel - The declarative view model
     * @param {Object} action - The action object on the View model
     * @param {Object} dataCtxNode - The data context
     * @param {ModuleObject} depModuleObj - The dependent module object
     */


    var _processError = function _processError(err, declViewModel, action, dataCtxNode, depModuleObj) {
      // eslint-disable-line complexity
      var events = action.events;
      var actionMessages = action.actionMessages;
      var allMessages;
      var evaluationEnv = {
        data: declViewModel,
        ctx: appCtxSvc.ctx
      };

      if (events && events.failure) {
        if (err.cause && err.cause.partialErrors) {
          /**
           * Add the error in the evaluation env for each of the events
           */
          _.forEach(events.failure, function (failureEvt) {
            _.forEach(err.cause.partialErrors, function (partialError) {
              if (partialError.errorValues) {
                _.forEach(partialError.errorValues, function (errorValue) {
                  if (errorValue.code) {
                    evaluationEnv.errorCode = errorValue;

                    if (!evaluationEnv.errorCodes) {
                      evaluationEnv.errorCodes = [];
                    }

                    evaluationEnv.errorCodes.push(errorValue);
                  }
                });
              }
            });

            _processActionEvents(declViewModel, action, [failureEvt], evaluationEnv, dataCtxNode, depModuleObj, false);
          }); // If REST call is failed with error

        } else if (err.status) {
          // Add the error in the evaluation env for each of the events
          evaluationEnv.errorCode = err;

          _processActionEvents(declViewModel, action, events.failure, evaluationEnv, dataCtxNode, depModuleObj, false);
        } else {
          // Process all events in bulk
          _processActionEvents(declViewModel, action, events.failure, evaluationEnv, dataCtxNode, depModuleObj, false);
        }
      }

      var isReported = false;

      if (actionMessages && actionMessages.failure) {
        if (err.cause && err.cause.partialErrors) {
          // Notify error message when condition matched
          if (actionMessages.failure.length > 0) {
            var matchingMessages = [];
            var scopedAllMessages = [];

            var reportError = function reportError(failureErr, idx) {
              messagingSvc.reportNotyMessage(declViewModel, scopedAllMessages[idx], failureErr.message, dataCtxNode);
            };

            _.forEach(err.cause.partialErrors, function (partialError) {
              if (partialError.errorValues) {
                _.forEach(partialError.errorValues, function (errorValue) {
                  if (errorValue.code) {
                    _.forEach(actionMessages.failure, function (failureErr) {
                      var condValue = true;

                      if (failureErr.condition) {
                        evaluationEnv.errorCode = errorValue;
                        condValue = conditionSvc.evaluateCondition(declViewModel, failureErr.condition, evaluationEnv, depModuleObj);
                      }

                      if (condValue) {
                        isReported = true;

                        if (!allMessages) {
                          allMessages = _.cloneDeep(declViewModel._internal.messages);
                        }

                        if (matchingMessages.indexOf(failureErr) === -1) {
                          matchingMessages.push(failureErr);
                          scopedAllMessages.push(allMessages);
                        }
                      }
                    });
                  }
                });
              }
            });

            matchingMessages.forEach(function (message, index) {
              reportError(message, index);
            });
          } else {
            /**
             * Notify SOA error message when no condition specified
             */
            var errMessage = messagingSvc.getSOAErrorMessage(err);
            isReported = true;
            wysModeSvc.isWysiwygMode(dataCtxNode) ? logger.info(errMessage) : messagingSvc.showError(errMessage);
          }
        } else if (err.cause && err.cause.messages) {
          _.forEach(err.cause.messages, function (message) {
            if (message.code) {
              _.forEach(actionMessages.failure, function (failureErr) {
                evaluationEnv.errorCode = message.code;

                if (failureErr.condition && conditionSvc.evaluateCondition(declViewModel, failureErr.condition, evaluationEnv, depModuleObj)) {
                  isReported = true;

                  if (!allMessages) {
                    allMessages = _.cloneDeep(declViewModel._internal.messages);
                  }

                  messagingSvc.reportNotyMessage(declViewModel, allMessages, failureErr.message, failureErr.message, dataCtxNode);
                }
              });
            }
          });
        } else if (err.errorCode || err.status) {
          /**
           * Notify error raised by a JS function call
           */
          _.forEach(actionMessages.failure, function (failureErr) {
            var condValue = true;

            if (failureErr.condition) {
              if (err.status) {
                // In case failure is from REST call
                evaluationEnv.errorCode = err;
              } else {
                evaluationEnv.errorCode = err.errorCode;
              }

              condValue = conditionSvc.evaluateCondition(declViewModel, failureErr.condition, evaluationEnv, depModuleObj);
            }

            if (condValue) {
              isReported = true;

              if (!allMessages) {
                allMessages = _.cloneDeep(declViewModel._internal.messages);
              }

              messagingSvc.reportNotyMessage(declViewModel, allMessages, failureErr.message, dataCtxNode, depModuleObj);
            }
          });
        }
      }

      if (!isReported && _typeof(err) === 'object') {
        var errInfo = null;

        if (err.config && err.status && (err.status < 200 || err.status > 299)) {
          /**
           * Error from Angular's $http service.
           */
          errInfo = {
            url: err.config.url,
            method: err.config.method,
            status: err.status,
            statusText: err.statusText
          };
        } else if (err.cause && err.cause.config) {
          /**
           * Error due to lost network connectivity, server crash etc.
           */
          errInfo = {
            url: err.cause.config.url,
            method: err.cause.config.method,
            status: err.cause.status,
            statusText: err.cause.statusText
          };
        }

        if (errInfo !== null) {
          var errMsg = 'The HTTP "' + errInfo.method + '" method to url "' + errInfo.url + '" failed';

          if (_.isString(errInfo.statusText) && errInfo.statusText.length > 0) {
            errMsg = errMsg + ' (status = "' + errInfo.statusText + '").';
          } else {
            errMsg = errMsg + ' (status = "' + errInfo.status + '").';
          }

          isReported = true;
          localeSvc.getTextPromise().then(function (localTextBundle) {
            messagingSvc.showError(localTextBundle.SERVER_ERROR);
          });
          logger.error(errMsg);
        }
      }
      /**
       * Fall back, report error if not raised till this point
       */


      if (!isReported) {
        var msg = null;
        var level = 1;

        if (_.isString(err)) {
          msg = err;
          level = 3;
        } else if (err && err.message) {
          msg = err.message.replace(/\n/g, '<br>');
          level = err.level ? err.level : 3;
        } else {
          msg = 'Unknown error message type for action ' + action.method;
          level = 3;
          logger.error(err);
        }

        if (level <= 1) {
          wysModeSvc.isWysiwygMode(dataCtxNode) ? logger.info(msg) : messagingSvc.showInfo(msg);
        } else {
          wysModeSvc.isWysiwygMode(dataCtxNode) ? logger.info(msg) : messagingSvc.showError(msg);
        }
      }
    };

    var _processAllDataProvider = function _processAllDataProvider(dataProviderArray, declViewModel, dataCtxNode) {
      var promises = [];

      _.forEach(dataProviderArray, function (providerObj) {
        var provider = providerObj.dataProvider;
        /**
         * Check if the provider specifies specific objects to display on the 1st page<BR>
         * If so: Load those viewModelObjects into an array and update the dataProvider with them.<BR>
         * If not: Just initialize the dataProvider and let it decide what to load.
         */

        if (provider.json.firstPage) {
          var firstPageObjs = [];

          _.forEach(provider.json.firstPage, function (uid) {
            var vmos = declViewModel.objects[uid];

            if (Array.isArray(vmos)) {
              Array.prototype.push.apply(firstPageObjs, vmos);
            } else if (vmos !== undefined) {
              // LCS-165693 vmos will be undefined in case of dcp n cardinality and we don't want to add undefined vmos here.
              firstPageObjs.push(vmos);
            }
          });
          /**
           * This code evaluates the page size to determine if we need to increment total. This is necessary
           * for object sets, as we do not know the totalFound.
           */


          var maxToLoad;

          if (provider.action && provider.action.inputData) {
            var actionInputData = provider.action.inputData;

            if (actionInputData.searchInput) {
              maxToLoad = actionInputData.searchInput.maxToLoad;
            }
          }

          var totalFound = firstPageObjs.length > 0 ? firstPageObjs.length + 1 : 0;

          if (maxToLoad) {
            totalFound = firstPageObjs.length === maxToLoad ? firstPageObjs.length + 1 : firstPageObjs.length;
          }

          provider.update(firstPageObjs, totalFound);
        } else {
          // promises.push( provider.initialize( dataCtxNode, declViewModel ) );
          var args = [dataCtxNode, declViewModel];
          promises.push(provider[providerObj.action].apply(provider, args));
        }
      });

      return $q.all(promises);
    };

    return exports;
  }]);
});