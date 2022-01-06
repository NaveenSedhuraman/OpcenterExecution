"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module provides a way for declarative framework to manage AngularJS Scope
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/declarativeDataCtxService
 */
define([//
'app', //
'assert', //
'lodash', //
'js/declUtils', //
'js/parsingUtils', //
'js/logger', //
'js/appCtxService', //
//
'js/dynamicPropertyService', //
'js/awConstantsService', //
'js/adapterService' //
], function (app, assert, _, declUtils, parsingUtils, logger, appCtxService) {
  'use strict';
  /**
   * Cached reference to dependent services
   */

  var _dynamicPropertySvc = null;
  var _awConstantsSvc = null;
  var _$interpolate = null;
  /**
   * Cached reference to adapter service
   */

  var _adapterSvc = null;
  var _$q = null;
  /**
   * {Boolean} TRUE if use of the $interpolate API should be logged.
   */

  var _debug_logInterpolatingActivity;

  var _appCtxSvc = null;
  /**
   * {Boolean} TRUE if we are NOT able to find a property on the $scope when referenced in a data binding expression.
   */

  var _debug_logMissingProperties;
  /**
   * Define the base object used to provide all of this module's external API on.
   *
   * @private
   */


  var exports = {};

  var parametersList = function parametersList(funcToCall, $scope) {
    var funcParams = funcToCall.parameters;
    var params = [];
    var i;

    if (funcParams) {
      for (i = 0; i < funcParams.length; i++) {
        var param = funcParams[i];
        var results2 = param.match(parsingUtils.REGEX_DATABINDING);

        if (results2 && results2.length === 4) {
          var newParam = results2[2];
          var realizedFuncParam = parsingUtils.parentGet($scope, newParam);
          params.push(realizedFuncParam);
        } else {
          params.push(param);
        }
      }
    }

    return params;
  };
  /**
   * Apply the scope object of the input.
   *
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context the operation is being performed within.
   *
   * @param {Object} inputDataToUpdate - The 'inputData' from an 'action' who's properties are to be updated with
   *            current values from the 'declViewModel' and/or dependent function calls.
   *
   * @param {Object} functionsList - List of functions read from JSON
   *
   * @param {Object} $scope - The AngularJS $scope context of this operation.
   *
   * @param {Object} depModuleObj - Dependent module object on which the 'apply' method of any named functions will be
   *            called (action.deps).
   */


  exports.applyScope = function (declViewModel, inputDataToUpdate, functionsList, $scope, depModuleObj) {
    if (!declUtils.isValidModelAndDataCtxNode(declViewModel, $scope)) {
      return;
    }

    assert(inputDataToUpdate, 'Missing "inputDataToUpdate" parameter');

    _.forEach(inputDataToUpdate, function (propValue, propName) {
      // eslint-disable-line complexity
      if (!propValue) {
        return true;
      }

      var propValueType = _typeof(propValue);
      /**
       * Check if propValue is undefined or a simple string
       */


      if (propValueType === 'string') {
        /**
         * Check if it is a replacement case
         * <P>
         * Note: The regex will only extract 4 segments w/the following for [1] & [3]<BR>
         * results[1] === '{{' && results[3] === '}}'
         */
        var results = propValue.match(parsingUtils.REGEX_DATABINDING);

        if (results && results.length === 4) {
          var newVal = results[2];

          if (!/^(function:|dataParseDefinitions:|Constants.)/.test(newVal)) {
            var val2 = parsingUtils.parentGet($scope, newVal);
            inputDataToUpdate[propName] = val2;

            if (_debug_logMissingProperties && val2 === undefined) {
              logger.warn('Unable to find property on the current $scope: ' + newVal);
            }
          } else if (_.startsWith(newVal, 'function:')) {
            var functionName = newVal.replace('function:', '');
            var funcToCall = functionsList[functionName];

            if (!funcToCall) {
              assert(funcToCall, 'Missing function: ' + functionName);
            }

            var params = parametersList(funcToCall, $scope);

            if (depModuleObj) {
              if (depModuleObj[funcToCall.functionName]) {
                inputDataToUpdate[propName] = depModuleObj[funcToCall.functionName].apply(depModuleObj, params);
              } else {
                _.forEach(depModuleObj, function (value, key) {
                  if (funcToCall.deps.includes(key)) {
                    inputDataToUpdate[propName] = depModuleObj[key][funcToCall.functionName].apply(depModuleObj[key], params);
                  }
                });
              }
            }
          } else if (_.startsWith(newVal, 'dataParseDefinitions:')) {
            if (declViewModel._internal.dataParseDefinitions) {
              var parseDefName = newVal.replace('dataParseDefinitions:', '');

              var dynmData = _.get(declViewModel._internal.dataParseDefinitions, parseDefName);

              if (dynmData) {
                inputDataToUpdate[propName] = _dynamicPropertySvc.processDataParseDefination(dynmData, $scope);
              }
            }
          } else if (_.startsWith(newVal, 'Constants.')) {
            var val = _awConstantsSvc.getConstant(newVal);

            if (val) {
              inputDataToUpdate[propName] = val;
            }
          }
        } else if (propValue === 'undefined') {
          inputDataToUpdate[propName] = undefined;
        } else if (propValue.match(/\{\{.*}}/g)) {
          if (_debug_logInterpolatingActivity) {
            logger.info('Interpolating ' + propName + ': ' + propValue);
          } // If * was used to intentionally trigger interpolation remove it


          if (propValue.charAt(0) === '*') {
            propValue = propValue.substr(1);
          }

          inputDataToUpdate[propName] = _$interpolate(propValue)($scope);
        }
      } else if (propValueType === 'object') {
        /**
         * Recurse to handle lower levels of {{ }} replacements
         */
        exports.applyScope(declViewModel, propValue, functionsList, $scope, depModuleObj);
      } else {
        return true;
      }
    });
  };
  /**
   * Resolve a specific response value based on the input parameters.
   *
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context to process response into.
   *
   * @param {Object} response - The 'response' from a previous operation that will be used to determine the returned
   *            value based on the given input expression..
   *
   * @param {String} inputExpression - The expression that identifies where/how to determine the returned value (e.g.
   *            "{{function:processTemplates}}" "{{templatesOutput[0].workflowTemplates}}",
   *            "{{dataParseDefinitions:xxxxxxxx}}")
   *
   * @param {Object} depModuleObj - Module object that contains any functions to execute based on the
   *            'inputExpression' contents.
   *
   * @return {Object} The resolved value based on the given input parameters.
   */


  exports.getOutput = function (declViewModel, response, inputExpression, depModuleObj) {
    var expression = parsingUtils.getStringBetweenDoubleMustaches(inputExpression);

    if (_.startsWith(expression, 'function:')) {
      var functionName = expression.replace('function:', '');
      var functionsList = declViewModel._internal.functions;

      if (functionsList) {
        var funcToCall = functionsList[functionName];

        if (!funcToCall) {
          return depModuleObj[functionName](response);
        }

        var params = parametersList(funcToCall, {
          data: declViewModel,
          ctx: _appCtxSvc.ctx
        });
        params.unshift(response); // evaluate function

        if (depModuleObj && depModuleObj[funcToCall.functionName]) {
          return depModuleObj[funcToCall.functionName].apply(depModuleObj, params);
        } else if (depModuleObj) {
          var funcDependancies = Object.keys(depModuleObj);

          for (var index = 0; index < funcDependancies.length; index++) {
            var key = funcDependancies[index];

            if (funcToCall.deps && funcToCall.deps.includes(key)) {
              return depModuleObj[key][funcToCall.functionName].apply(depModuleObj, params);
            }
          }
        }
      } // evaluate function


      return depModuleObj[functionName](response);
    } else if (_.startsWith(expression, 'dataParseDefinitions:')) {
      if (declViewModel._internal.dataParseDefinitions) {
        var parseDefName = expression.replace('dataParseDefinitions:', '');

        var dynmData = _.get(declViewModel._internal.dataParseDefinitions, parseDefName);

        if (dynmData) {
          return _dynamicPropertySvc.processDataParseDefination(dynmData, declViewModel, response);
        }
      }
    } else if (_.startsWith(expression, 'json:')) {
      var jsonStringVariable = expression.replace('json:', '');

      var jsonString = _.get(response, jsonStringVariable);

      return parsingUtils.parseJsonString(jsonString);
    }

    if (_.isString(inputExpression)) {
      return _.get(response, inputExpression);
    } // support plain primitive JavaScript type in expression


    return inputExpression;
  };
  /**
   * Apply an expression object of inout.
   *
   * @param {Object} inputDataToUpdate - The object containing an expression.(e.g. "$adapt" : "{{ctx.mselected}}")
   *
   * @return {Promise} A promise object resolved with the results of the action.
   */


  exports.applyExpression = function (inputDataToUpdate) {
    var adaptedPromises = {};

    if (inputDataToUpdate) {
      _.forEach(inputDataToUpdate, function (paramVal, paramKey) {
        if (_typeof(paramVal) === 'object' && paramVal !== undefined && paramVal) {
          if (paramVal.$adapt !== undefined) {
            var input = [];

            if (Array.isArray(paramVal.$adapt)) {
              input = paramVal.$adapt;
            } else {
              input.push(paramVal.$adapt);
            }

            var path = null;

            if (paramVal.path !== undefined) {
              path = paramVal.path;
            }

            var adaptPlaceHolder = {
              paramKey: paramKey,
              paramPath: path,
              paramValArray: Array.isArray(paramVal.$adapt)
            };
            adaptedPromises[JSON.stringify(adaptPlaceHolder)] = _adapterSvc.getAdaptedObjects(input, paramVal.isFullyAdapted);
          }
        }
      });
    } else {
      inputDataToUpdate = {};
    }

    return _$q.all(adaptedPromises).then(function (results) {
      _.forEach(results, function (resultVal, resultKey) {
        var resultKeyObj = JSON.parse(resultKey);

        if (resultVal && resultVal.length > 0) {
          if (resultKeyObj.paramPath) {
            var assignedValues = [];

            _.forEach(resultVal, function (resultObj) {
              assignedValues.push(_.get(resultObj, resultKeyObj.paramPath));
            });

            inputDataToUpdate[resultKeyObj.paramKey] = resultKeyObj.paramValArray ? assignedValues : assignedValues[0];
          } else {
            inputDataToUpdate[resultKeyObj.paramKey] = resultKeyObj.paramValArray ? resultVal : resultVal[0];
          }
        } else {
          delete inputDataToUpdate[resultKeyObj.paramKey];
        }
      });

      return;
    });
  };
  /**
   * The service to perform for declarative framework to manage AngularJS Scope.
   *
   * @member declarativeDataCtxService
   * @memberof NgServices
   */


  app.factory('declarativeDataCtxService', //
  ['dynamicPropertyService', 'awConstantsService', '$interpolate', 'adapterService', '$q', 'appCtxService', //
  function (dynamicPropertySvc, awConstantsSvc, $interpolate, adapterService, $q, appCtxService) {
    _dynamicPropertySvc = dynamicPropertySvc;
    _awConstantsSvc = awConstantsSvc;
    _$interpolate = $interpolate;
    _adapterSvc = adapterService;
    _$q = $q;
    _appCtxSvc = appCtxService;
    return exports;
  }]);
});