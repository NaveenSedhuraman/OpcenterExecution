"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define requirejs require */

/**
 * Thue module defines helpful shared APIs and constants used throughout the DeclarativeUI code base.
 * <P>
 * Note: This modules does not create an injectable service.
 *
 * @module js/declUtils
 */
define(['app', 'jquery', 'assert', 'lodash', 'js/logger', 'js/parsingUtils'], function (app, $, assert, _, logger, parsingUtils) {
  'use strict';

  var exports = {};
  var MSG_1 = 'Required DeclViewModel not specified';
  var MSG_PREFIX_1 = 'Invalid to process with destroyed DeclViewModel: ';
  var MSG_PREFIX_2 = 'Invalid to process with destroyed DataContextNode: ';
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * an 'assert' failure will be thrown.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   */

  exports.assertValidModel = function (declViewModel) {
    assert(declViewModel, MSG_1);

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      assert(false, MSG_PREFIX_1 + declViewModel);
    }
  };
  /**
   * Clone scope without copying angular scope's internal properties.
   *
   * @param {Object} scope - Object to clone.
   *
   * @return {Object} an object that holds data from provided Object
   */


  exports.cloneData = function (scope) {
    var object = {};

    _.forOwn(scope, function (value, key) {
      if (!_.startsWith(key, '$')) {
        object[key] = value;
      }
    });

    return object;
  };
  /**
   * update data for fileData
   *
   * @param {Object} fileData - key string value the location of the file
   * @param {Object} data the view model data object
   */


  exports.updateFormData = function (fileData, data) {
    if (fileData && fileData.value) {
      var form = $('#fileUploadForm');
      data.formData = new FormData($(form)[0]);
      data.formData.append(fileData.key, fileData.value);
    }
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * an 'assert' failure will be thrown.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   */


  exports.assertValidModelWithOriginalJSON = function (declViewModel) {
    assert(declViewModel, MSG_1);

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      assert(false, MSG_PREFIX_1 + declViewModel);
    }

    assert(declViewModel._internal.origDeclViewModelJson, 'Required DeclViewModel JSON object not specified');
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * an 'assert' failure will be thrown.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   * @param {Object} dataCtxNode - The context object to test.
   */


  exports.assertValidModelAndDataCtxNode = function (declViewModel, dataCtxNode) {
    assert(declViewModel, MSG_1);

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      assert(false, MSG_PREFIX_1 + declViewModel);
    }

    if (!dataCtxNode || dataCtxNode.$$destroyed) {
      assert(false, MSG_PREFIX_2 + (dataCtxNode ? dataCtxNode.$id : '???') + ' DeclViewModel=' + declViewModel);
    }
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * a 'warning' will be logged and this function will return FALSE.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   * @param {Object} dataCtxNode - The context object to test.
   *
   * @returns {Boolean} FALSE  if any of the given parameters does not exist, has been destroyed or has invalid
   * properties set. TRUE otherwise.
   */


  exports.isValidModelAndDataCtxNode = function (declViewModel, dataCtxNode) {
    if (!declViewModel) {
      logger.warn(MSG_1);
      return false;
    }

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      logger.warn(MSG_PREFIX_1 + declViewModel);
      return false;
    }

    if (dataCtxNode && dataCtxNode.$$destroyed) {
      logger.warn(MSG_PREFIX_2 + (dataCtxNode ? dataCtxNode.$id : '???') + ' DeclViewModel=' + declViewModel);
      return false;
    }

    return true;
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * an 'assert' failure will be thrown.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   * @param {Object} dataCtxNode - The context object to test.
   * @param {DeclAction} action - The declAction object to test.
   */


  exports.assertValidModelDataCtxNodeAndAction = function (declViewModel, dataCtxNode, action) {
    assert(declViewModel, MSG_1);

    if (declViewModel._internal.isDestroyed) {
      assert(false, MSG_PREFIX_1 + declViewModel + ' actionType: ' + action.actionType + ' method: ' + action.method + ' deps: ' + action.deps);
    }

    if (!dataCtxNode || dataCtxNode.$$destroyed) {
      assert(false, MSG_PREFIX_2 + (dataCtxNode ? dataCtxNode.$id : '???') + ' DeclViewModel=' + declViewModel + ' actionType: ' + action.actionType + ' method: ' + action.method + ' deps: ' + action.deps);
    }
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * an 'assert' failure will be thrown.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   * @param {Object} eventData - The object used in an event to test. Any optional dataCtxNode will be tested for
   *            validity.
   */


  exports.assertValidModelAndEventData = function (declViewModel, eventData) {
    assert(declViewModel, MSG_1);

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      assert(false, MSG_PREFIX_1 + declViewModel);
    }

    if (eventData && eventData.scope && eventData.scope.$$destroyed) {
      assert(false, MSG_PREFIX_2 + (eventData.scope ? eventData.scope.$id : '???') + ' DeclViewModel=' + declViewModel);
    }
  };
  /**
   * Validate if any of the given parameters does not exist, has been destroyed or has invalid properties set. If so,
   * a 'warning' will be logged and this function will return FALSE.
   *
   * @param {DeclViewModel} declViewModel - The DeclViewModel to test.
   *
   * @param {Object} eventData - The object used in an event to test. Any optional dataCtxNode will be tested for
   *            validity.
   *
   * @returns {Boolean} FALSE  if any of the given parameters does not exist, has been destroyed or has invalid
   * properties set. TRUE otherwise.
   */


  exports.isValidModelAndEventData = function (declViewModel, eventData) {
    if (!declViewModel) {
      logger.warn(MSG_1);
      return false;
    }

    if (!declViewModel._internal || declViewModel._internal.isDestroyed) {
      logger.warn(MSG_PREFIX_1 + declViewModel);
      return false;
    }

    if (eventData && eventData.scope && eventData.scope.$$destroyed) {
      logger.warn(MSG_PREFIX_2 + (eventData.scope ? eventData.scope.$id : '???') + ' DeclViewModel=' + declViewModel);
      return false;
    }

    return true;
  };
  /**
   * Check if the given dataCtxNode we need has been destroyed (due to DOM manipulation?) since processing was
   * started.
   * <P>
   * If so: Use the dataCtxNode the DeclViewModel was originally created on.
   * <P>
   * Note: This case can happen when, say, an event is thrown by a 'source' data context that was destroyed before the
   * event was processed.
   *
   * @param {DeclViewModel} declViewModel - The {DeclDataModel} to check
   * @param {Object} dataCtxNode - The 'dataCtxNode' to return if NOT destroyed.
   *
   * @returns {Object} The dataCtxNode object to use.
   */


  exports.resolveLocalDataCtx = function (declViewModel, dataCtxNode) {
    if (dataCtxNode.$$destroyed) {
      return declViewModel._internal.origCtxNode;
    }

    return dataCtxNode;
  };
  /**
   * Return true if provided value is 'nil' (i.e. not null or undefined).
   *
   * @param {Object} value - The value to test.
   *
   * @returns {Boolean|null} true if provided value is 'nil' (i.e. not null or undefined).
   */


  exports.isNil = function (value) {
    return value === undefined || value === null;
  };
  /**
   * The function will attempt to locate the 'nearest' 'declViewModel' in the 'dataCtxTree' starting at the given
   * 'dataCtxNode'.
   *
   * @param {Object} dataCtxNode - The leaf 'dataCtxNode' (a.k.a AngularJS '$scope') in the 'dataCtxTree' to start the
   *            lookup of the 'declViewModel'.
   *
   * @param {Boolean} setInScope - TRUE if, when found, the 'declViewModel' and 'appCtxService.ctx' should be set as
   *            the 'data' and 'ctx' properties (respectively) on the given dataCtxNode object.
   *
   * @param {AppCtxService} appCtxSvc - A reference to the service to set on the 'dataCtxNode' IFF 'setInScope' is
   *            TRUE.
   *
   * @return {DeclViewModel} The 'declViewModel' found.
   */


  exports.findViewModel = function (dataCtxNode, setInScope, appCtxSvc) {
    /**
     * Check for the case where the declViewModel is already set on the given node.
     */
    if (dataCtxNode.data) {
      if (setInScope && appCtxSvc && !dataCtxNode.ctx) {
        dataCtxNode.ctx = appCtxSvc.ctx;
      }

      return dataCtxNode.data;
    }
    /**
     * Look for the model on a 'parent' node.
     */


    var currCtxNode = dataCtxNode;

    while (currCtxNode && !currCtxNode.data) {
      currCtxNode = currCtxNode.$parent;
    }

    if (currCtxNode) {
      if (setInScope) {
        dataCtxNode.data = currCtxNode.data;

        if (appCtxSvc) {
          dataCtxNode.ctx = appCtxSvc.ctx;
        }
        /**
         * Setup to clean up these references when this particular 'dataCtxNode' is later destroyed.
         */


        if (dataCtxNode.$on) {
          dataCtxNode.$on('$destroy', function (data) {
            data.currentScope.data = null;
            data.currentScope.ctx = null;
          });
        }
      }

      return currCtxNode.data;
    }

    return null;
  };
  /**
   * Consolidate the second object's properties into the first one
   *
   * @param {Object} targetObj - The 'target' object to merge to
   * @param {Object} sourceObj - The 'source' object to be merge from
   *
   * @return {Object} The 'target' object, updated (or a new object set to the 'source' if the 'target' did not exist.
   */


  exports.consolidateObjects = function (targetObj, sourceObj) {
    var returnObj = null;

    if (targetObj) {
      returnObj = targetObj;

      _.forEach(sourceObj, function (n, key) {
        returnObj[key] = n;
      });
    } else if (sourceObj) {
      returnObj = sourceObj;
    }

    return returnObj;
  };
  /**
   * Evaluate condition expression
   *
   * @param {DeclViewModel} declViewModel - (Not Used) The model to use when evaluating.
   * @param {String} expression expression {note: currently supporting ==,!=,&&,>,>=,<,<=}
   * @param {Object} evaluationEnv - the data environment for expression evaluation
   * @param {Object[]} depModuleObj - (Not Used) The array of function objects which can be used in expression
   * evaluation
   * @param {$injector} $injector - Service to use.
   *
   * @return {Boolean} the evaluated condition result
   */


  exports.evaluateCondition = function (declViewModel, expression, evaluationEnv, depModuleObj, $injector) {
    var $parse = $injector.get('$parse');
    return $parse(expression)(evaluationEnv);
  };
  /**
   * Evaluate condition expression
   *
   * @param {DeclViewModel} declViewModel - (Not Used) The model to use when evaluating.
   * @param {String} condition name of condition
   *
   * @return {String} the evaluated condition result
   */


  exports.getConditionExpression = function (declViewModel, condition) {
    var conditionExpression = null;

    if (_.startsWith(condition, 'conditions.')) {
      var conditionObject = _.get(declViewModel._internal, condition);

      conditionExpression = conditionObject.expression;
    }

    return conditionExpression;
  };
  /**
  * Evaluate condition name
  *
  * @param {String} conditionString name of condition
  *
  * @return {String} the evaluated condition result
  */


  exports.getConditionName = function (conditionString) {
    if (_.startsWith(conditionString, 'conditions.')) {
      var index = conditionString.indexOf('.');
      return conditionString.substr(index + 1);
    }

    return null;
  };
  /**
   * Get angular injected module if necessary
   *
   * @param {*} moduleObj - The loaded module
   * @param {*} $injector - Injector service
   * @return {Object} Updated dep module
   */


  var getAngularModule = function getAngularModule(moduleObj, $injector) {
    if (moduleObj && moduleObj.moduleServiceNameToInject && $injector.has(moduleObj.moduleServiceNameToInject)) {
      return $injector.get(moduleObj.moduleServiceNameToInject);
    }

    return moduleObj;
  };
  /**
   * Get a module synchronously. Returns null if module is not loaded.
   *
   * @param {*} depModuleName -
   * @param {*} $injector - Service to use.
   *
   * @returns {Object|null} Reference to module API object.
   */


  exports.getDependentModule = function (depModuleName, $injector) {
    if (require.defined(depModuleName)) {
      return getAngularModule(require(depModuleName), $injector);
    }

    return null;
  };
  /**
   * @param {String} depModule - The dependent module to load.
   * @param {Object} $q - Service to use.
   * @param {Object} $injector - Service to use.
   *
   * @return {Promise} This promise will be resolved with the service (or module) API object when the given module has
   * been loaded.
   */


  exports.loadDependentModule = function (depModule, $q, $injector) {
    return $q(function (resolve, reject) {
      if (depModule) {
        requirejs([depModule], function (depModule2) {
          resolve(getAngularModule(depModule2, $injector));
        }, reject);
      } else {
        resolve();
      }
    });
  };
  /**
   * @param {String[]} depModules - The dependent modules to load.
   * @param {$q} $q - Service to use.
   * @param {$injector} $injector - Service to use.
   * @return {Promise} This promise will be resolved when the given module has been loaded.
   */


  exports.loadDependentModules = function (depModules, $q, $injector) {
    return $q(function (resolve, reject) {
      if (depModules && depModules.length > 0) {
        requirejs(depModules, function () {
          var retModulesMap = {};

          _.forEach(arguments, function (arg) {
            if (arg.moduleServiceNameToInject) {
              retModulesMap[arg.moduleServiceNameToInject] = $injector.get(arg.moduleServiceNameToInject);
            } else {
              retModulesMap[arg.moduleServiceNameToInject] = $injector.get(arg);
            }
          });

          resolve(retModulesMap);
        }, reject);
      } else {
        resolve();
      }
    });
  };
  /**
   * Get dirty properties of the view model object
   *
   * @param {Object} vmo - the view model object
   *
   * @return {Array} the dirty properties of the view model object
   */


  exports.getAllModifiedValues = function (vmo) {
    var modifiedProperties = [];

    if (vmo) {
      modifiedProperties = vmo.getDirtyProps();
    }

    return modifiedProperties;
  };
  /**
   * Loading the imported JS
   *
   * @param {StringArray} moduleNames - Array of module's to 'import' (i.e. load using RequireJS).
   * @param {$q} $q - Service to use.
   *
   * @return {PromiseArray} Promise resolved with references to the module/service APIs of the given dependent
   *         modules.
   */


  exports.loadImports = function (moduleNames, $q) {
    return $q(function (resolve, reject) {
      if (moduleNames && moduleNames.length > 0) {
        requirejs(moduleNames, function () {
          var injector = app.getInjector();
          var moduleObjs = [];

          _.forEach(arguments, function (arg) {
            if (arg) {
              if (arg.moduleServiceNameToInject) {
                moduleObjs.push(injector.get(arg.moduleServiceNameToInject));
              } else {
                moduleObjs.push(arg);
              }
            }
          });

          resolve(moduleObjs);
        }, reject);
      } else {
        resolve();
      }
    });
  };
  /**
   * Update the properties of the view model property with new values
   *
   * @param {Object} value - view model object.
   * @param {Object} dataProperty - view model object  property.
   * @param {Object} dataPropertyValue - view model  object property value.
   *
   */


  exports.updatePropertyValues = function (dataObject, dataProperty, dataPropertyValue) {
    dataObject[dataProperty] = dataPropertyValue;
  };
  /**
   * Get Function dependancies
   *
   * @param {Object} action - The action object
   *
   * @param {Object} functions - The view model functions
   *
   * @return {Array} - The Array contains function dependancies to load.
   */


  exports.getFunctionDeps = function (action, functions) {
    var depsToLoad = [];
    var functionsUsedInActions = []; // get functions used in action input data

    if (action && action.inputData) {
      _.forEach(action.inputData.request, function (value) {
        if (typeof value === 'string') {
          var results = value.match(parsingUtils.REGEX_DATABINDING);

          if (results && results.length === 4) {
            var newVal = results[2];

            if (_.startsWith(newVal, 'function:')) {
              functionsUsedInActions.push(newVal.replace('function:', ''));
            }
          }
        }
      });
    }

    if (action && action.outputData) {
      _.forEach(action.outputData, function (value) {
        if (typeof value === 'string') {
          var results = value.match(parsingUtils.REGEX_DATABINDING);

          if (results && results.length === 4) {
            var newVal = results[2];

            if (_.startsWith(newVal, 'function:')) {
              functionsUsedInActions.push(newVal.replace('function:', ''));
            }
          }
        }
      });
    }

    if (functions) {
      _.forEach(functions, function (func) {
        if (func.deps && depsToLoad.includes(func.deps) === false && functionsUsedInActions.includes(func.functionName)) {
          depsToLoad.push(func.deps);
        }
      });
    }

    return depsToLoad;
  };

  return exports;
});