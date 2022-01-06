"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Edit Handler factory
 *
 * @module js/editUtilsService
 */
define(['app', 'lodash', 'js/declUtils', 'js/actionService', 'js/uwPropertyService', 'js/viewModelObjectService'], function (app, _, declUtils) {
  'use strict';
  /**
   * This factory creates an edit handler
   *
   * @memberof NgServices
   * @member editHandlerFactory
   */

  app.factory('editUtilsService', ['$q', 'actionService', 'uwPropertyService', 'viewModelObjectService', function ($q, actionService, uwPropertyService, viewModelObjectService) {
    var exports = {};
    /**
     * isDirty implementation of edit-handler interface.
     * @param {*} viewModelCollection collection of view model objects
     * @returns {*} $q promise with true/false
     */

    exports._isDirty = function (viewModelCollection) {
      var hasModifiedProperties = false;

      _.forEach(viewModelCollection, function (vmo) {
        _.forEach(vmo.props, function (vmoProp) {
          hasModifiedProperties = uwPropertyService.isModified(vmoProp);
          return !hasModifiedProperties;
        });

        return !hasModifiedProperties;
      });

      return $q.when(hasModifiedProperties);
    };
    /**
     * saveEdits implementation of edit - handler interface.
     * @param {*} dataCtxNode $scope or the data context node.
     * @param {*} declViewModel Declarative View Model, where edit actions are defined.
     * @param {*} viewModelCollection collection of view-model objects.
     * @param {*} editConfig standard edit configuration defined on dataprovider/declviewmodel
     * @returns {*} $q promise
     */


    exports._saveEdits = function (dataCtxNode, declViewModel, viewModelCollection, editConfig) {
      var getAllModifiedProperties = function getAllModifiedProperties() {
        var modifiedProperties = [];

        _.forEach(viewModelCollection, function (vmo) {
          _.forOwn(vmo.props, function (vmoProp) {
            if (uwPropertyService.isModified(vmoProp)) {
              modifiedProperties.push(vmoProp);
            }
          });
        });

        return modifiedProperties;
      };

      var getModifiedPropertiesMap = function getModifiedPropertiesMap() {
        var identifier = editConfig.identifier;
        var inputs = [];
        var inputRegistry = {};

        _.forEach(viewModelCollection, function (vmo) {
          var uid = vmo[identifier];

          _.forOwn(vmo.props, function (prop) {
            if (uwPropertyService.isModified(prop)) {
              var propObj = {
                propertyName: prop.propertyName,
                dbValues: prop.dbValues,
                uiValues: prop.uiValues,
                srcObjLsd: prop.srcObjLsd
              };
              inputRegistry[uid] = inputRegistry[uid] || {
                identifier: uid,
                props: []
              };
              var inputObj = inputRegistry[uid];
              inputObj.props.push(propObj);
            }
          });

          if (inputRegistry[uid]) {
            inputs.push(inputRegistry[uid]);
          }
        });

        return inputs;
      };

      return exports._isDirty(viewModelCollection).then(function (hasModifiedProps) {
        var saveSuccess = function saveSuccess(viewModelCollection) {
          var modifiedPropsArr = getAllModifiedProperties();
          viewModelCollection.map(function (vmo) {
            viewModelObjectService.setEditableStates(vmo, false, true, true);
          });
          modifiedPropsArr.map(function (modProp) {
            uwPropertyService.replaceValuesWithNewValues(modProp);
            uwPropertyService.resetProperty(modProp);
          });
          uwPropertyService.triggerDigestCycle();
          return $q.resolve();
        };

        if (hasModifiedProps) {
          var inputs = getModifiedPropertiesMap();
          var saveEditAction = editConfig.saveEditAction;
          var action = declViewModel._internal.actions[saveEditAction];

          if (action) {
            if (action.actionType === 'RESTService') {
              var requestData = action.inputData.request;
              requestData.data = requestData.data || {};
              requestData.data.saveInputs = inputs;
            } else {
              action.inputData = action.inputData || {};
              action.inputData.saveInputs = inputs;
            }

            return exports.executeAction(declViewModel, action, dataCtxNode).then(function () {
              return saveSuccess(viewModelCollection);
            }, function (error) {
              return $q.reject(error);
            });
          }
        }

        return saveSuccess(viewModelCollection);
      });
    };
    /**
     * This is the cancel edits implementation of edit-handler interface.
     * @param {*} dataCtxNode data ctx node ($scope)
     * @param {*} declViewModel declarative view model
     * @param {*} viewModelCollection collection of view model objects
     * @returns {* } $q when operation is completed.
     */


    exports._cancelEdits = function (dataCtxNode, declViewModel, viewModelCollection) {
      _.forEach(viewModelCollection, function (vmo) {
        _.forOwn(vmo.props, function (vmoProp) {
          uwPropertyService.resetUpdates(vmoProp);
          uwPropertyService.setIsEditable(vmoProp, false);
        });
      });

      uwPropertyService.triggerDigestCycle();
      return $q.resolve();
    };
    /**
     * This function merges the start edit action response back into the view model collect.
     * The response from start edit action should be an array of view model objects.
     *
     * @param {* } serverData response from the response
     * @param {* } vmCollection collection of view model objects
     * @param {* } editConfig edit configuration
     * @returns {* } $q when operation is completed.
     */


    exports._mergeStartEditResponse = function (serverData, vmCollection, editConfig) {
      try {
        var identifier = editConfig.identifier;
        var identiferToVMOMap = vmCollection.reduce(function (acc, eachObject) {
          var uid = eachObject[identifier];
          acc[uid] = eachObject;
          return acc;
        }, {});

        if (!editConfig.hasOwnProperty('mergeResponseFunction')) {
          _.forEach(serverData, function (updatedVMO) {
            var uid = updatedVMO[identifier];
            var targetVMO = identiferToVMOMap[uid] || null;

            if (targetVMO) {
              _.forOwn(updatedVMO.props, function (updatedProperty, propName) {
                var targetProperty = targetVMO.props[propName] || null;

                if (targetProperty) {
                  updatedProperty.value = updatedProperty.hasOwnProperty('value') ? updatedProperty.value : targetProperty.value;
                  updatedProperty.displayValues = updatedProperty.hasOwnProperty('displayValues') ? updatedProperty.displayValues : targetProperty.displayValues;
                  updatedProperty.isNull = updatedProperty.hasOwnProperty('isNull') ? updatedProperty.isNull : targetProperty.displayValues;
                  updatedProperty.editable = updatedProperty.hasOwnProperty('editable') ? updatedProperty.editable : targetProperty.editable;
                  updatedProperty.isPropertyModifiable = updatedProperty.hasOwnProperty('isPropertyModifiable') ? updatedProperty.isPropertyModifiable : targetProperty.isPropertyModifiable;
                  updatedProperty.sourceObjectLastSavedDate = updatedProperty.hasOwnProperty('sourceObjectLastSavedDate') ? updatedProperty.sourceObjectLastSavedDate : targetProperty.sourceObjectLastSavedDate;
                  uwPropertyService.copyModelData(targetProperty, updatedProperty);
                }
              });
            }
          });

          return $q.resolve();
        }

        var deps = 'js/editMergeService';
        return exports.loadDependentModule(deps).then(function (depModuleObj) {
          var args = [serverData, vmCollection, editConfig];
          return depModuleObj[editConfig.mergeResponseFunction].apply(null, args);
        });
      } catch (err) {
        return $q.reject(err);
      }
    };
    /**
     * This function loads the dependent module.
     * @param {*} deps name of the dependency files.
     * @returns {*} $q when module is loaded.
     */


    exports.loadDependentModule = function (deps) {
      var depModuleObj = declUtils.getDependentModule(deps, app.getInjector());

      if (depModuleObj) {
        return $q.resolve(depModuleObj);
      }

      return declUtils.loadDependentModule(deps, $q, app.getInjector()).then(function (depModuleObj) {
        return $q.resolve(depModuleObj);
      }, function (error) {
        return $q.reject(error);
      });
    };
    /**
     * This function executes any action defined in the view model.
     * @param {*} declViewModel Declarative View Model, where edit action is defined
     * @param {*} action start/save/cancel Edit action
     * @param {*} dataCtxNode $scope/data ctx object
     * @returns {*} $q promise
     */


    exports.executeAction = function (declViewModel, action, dataCtxNode) {
      if (action.deps) {
        return exports.loadDependentModule(action.deps).then(function (depModuleObj) {
          return actionService.executeAction(declViewModel, action, dataCtxNode, depModuleObj);
        });
      }

      return actionService.executeAction(declViewModel, action, dataCtxNode, null);
    };
    /**
     * This function implements the start edit function edit handler interface
     * @param {* } dataCtxNode data ctx Node.
     * @param {* } declViewModel declarative ViewModel.
     * @param {* } vmCollection collection of all view model objects.
     * @param {* } editConfig edit configuration
     * @returns {* } $q when module is loaded.
     */


    exports._startEdit = function (dataCtxNode, declViewModel, vmCollection, editConfig) {
      try {
        var identifier = editConfig.identifier;

        var setEditableStates = function setEditableStates() {
          if (vmCollection) {
            _.forEach(vmCollection, function (vmo) {
              viewModelObjectService.setEditableStates(vmo, true, true, true);
            });

            uwPropertyService.triggerDigestCycle();
          }
        };

        var inputs = vmCollection.map(function (eachObject) {
          var objInput = {};
          objInput[identifier] = eachObject[identifier];
          objInput.propertyNames = [];

          _.forOwn(eachObject.props, function (prop) {
            objInput.propertyNames.push(prop.propertyName);
          });

          return objInput;
        });
        var startEditActionName = editConfig.startEditAction;
        var startEditAction = declViewModel.getAction(startEditActionName);

        if (startEditAction) {
          if (startEditAction.actionType === 'RESTService') {
            var requestData = startEditAction.inputData.request;
            requestData.data = requestData.data || {};
            requestData.data.editInputs = inputs;
          } else {
            startEditAction.inputData = startEditAction.inputData || {};
            startEditAction.inputData.editInputs = inputs;
          }

          return exports.executeAction(declViewModel, startEditAction, dataCtxNode).then(function (responseObj) {
            responseObj = startEditAction.actionType === 'RESTService' ? responseObj.data : responseObj;

            if (editConfig.hasOwnProperty('startEditResponseKey')) {
              responseObj = responseObj[editConfig.startEditResponseKey];
            }

            return exports._mergeStartEditResponse(responseObj, vmCollection, editConfig).then(function () {
              setEditableStates();
              return $q.resolve();
            }, function (error) {
              return $q.reject(error);
            });
          });
        }

        return $q.reject('start edit action not defined');
      } catch (error) {
        return $q.reject(error);
      }
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'editUtilsService'
  };
});