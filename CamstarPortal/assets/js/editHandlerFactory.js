"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Edit Handler factory
 *
 * @module js/editHandlerFactory
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'js/parsingUtils', 'js/viewModelObjectService', 'soa/kernel/clientDataModel', 'soa/dataManagementService', 'soa/kernel/soaService', 'soa/kernel/propertyPolicyService', 'js/appCtxService', 'js/NotyModule', 'js/localeService', 'js/leavePlace.service', 'js/messagingService', 'js/saveHandlerService'], function (app, _, eventBus, logger, parsingUtils) {
  'use strict'; // Various services

  var _cdm = null;
  var _dms = null;
  var _soaSvc = null;
  var _policySvc = null;
  var _appCtxSvc = null;
  var _localeSvc = null;
  var _notySvc = null;
  var _leavePlaceService = null;
  var _vmsvc = null;
  var _$q = null;
  var _messagingSvc = null;
  var _saveHandlerService = null;
  var exports = {};
  /**
   * Create edit handler
   *
   * @param {Object} dataProvider - the data provider we're associating the edit handler with
   *
   * @return {Object} edit handler object
   */

  exports.createEditHandler = function (dataSource) {
    var editHandler = {
      // Mark this handler as native - checked from GWT jsni code
      isNative: true,
      _editing: false
    };
    var _singleLeaveConfirmation = null;
    var _multiLeaveConfirmation = null;
    var _saveTxt = null;
    var _discardTxt = null;
    var _validationError = null;
    var _xrtViewModelSvc = null;

    if (_localeSvc) {
      _localeSvc.getTextPromise('editHandlerMessages').then(function (textBundle) {
        _singleLeaveConfirmation = textBundle.navigationConfirmationSingle;
        _multiLeaveConfirmation = textBundle.navigationConfirmationMultiple;
        _saveTxt = textBundle.save;
        _discardTxt = textBundle.discard;
        _validationError = textBundle.validationError;
      });
    }
    /**
     * Notify the save state changes
     *
     * @param {String} stateName - edit state name ('starting', 'saved', 'cancelling')
     * @param {Boolean} fireEvents - fire modelObjectsUpdated events
     * @param {Array} failureUids - the object uids that failed to save
     * @param {Object} modifiedPropsMap - modified properties map
     */


    function _notifySaveStateChanged(stateName, fireEvents, failureUids, modifiedPropsMap) {
      dataSource.setSelectionEnabled(stateName !== 'starting');

      switch (stateName) {
        case 'starting':
          dataSource.checkEditableOnProperties();
          break;

        case 'saved':
          dataSource.saveEditiableStates();
          break;

        case 'canceling':
          dataSource.resetEditiableStates();
          break;

        case 'partialSave':
          dataSource.updatePartialEditState(failureUids, modifiedPropsMap);
          break;

        default:
          logger.error('Unexpected stateName value: ' + stateName);
      }

      if (fireEvents) {
        var dataProvider = dataSource.getDataProvider();

        if (dataProvider && dataProvider.viewModelCollection) {
          eventBus.publish(dataProvider.name + '.modelObjectsUpdated', {
            viewModelObjects: dataProvider.viewModelCollection.getLoadedViewModelObjects(),
            totalObjectsFound: dataProvider.viewModelCollection.getTotalObjectsLoaded()
          });
        }
      }

      editHandler._editing = stateName === 'starting' || stateName === 'partialSave'; // Add to the appCtx about the editing state

      _appCtxSvc.updateCtx('editInProgress', editHandler._editing);

      var context = {
        state: stateName
      };
      context.dataSource = dataSource.getSourceObject();
      context.failureUids = failureUids;
      eventBus.publish('editHandlerStateChange', context);
    }
    /**
     * Start editing
     */


    editHandler.startEdit = function () {
      var viewModelObjectList = dataSource.getLoadedViewModelObjects();
      dataSource.setSelectionEnabled(false); // Get list of UIDs

      var uidToVMMap = {};

      if (viewModelObjectList !== null) {
        _.forEach(viewModelObjectList, function (viewModelObject) {
          if (uidToVMMap[viewModelObject.uid]) {
            var existingVMOs = uidToVMMap[viewModelObject.uid];
            existingVMOs.push(viewModelObject);
          } else {
            uidToVMMap[viewModelObject.uid] = [viewModelObject];
          }
        });
      }

      var propMap = dataSource.getPropertyMap();
      var propPolicy = {
        types: [{
          name: 'BusinessObject',
          properties: [{
            name: 'is_modifiable'
          }]
        }]
      };

      var policyId = _policySvc.register(propPolicy, 'startEditHandler_Policy', 'selected');

      var input = {
        inputs: []
      };

      if (propMap) {
        _.forEach(propMap, function (value, key) {
          _dms.getLoadViewModelForEditingInput(input, key, value);
        });
      } // Register with leave place service


      _leavePlaceService.registerLeaveHandler({
        okToLeave: function okToLeave() {
          return editHandler.leaveConfirmation();
        }
      });

      return _dms.loadViewModelForEditing2(input.inputs).then(function (response) {
        processJsonStringResponse(response.viewModelObjectsJsonStrings, uidToVMMap);

        _notifySaveStateChanged('starting', true);

        _policySvc.unregister(policyId);

        return response;
      }, function (error) {
        _policySvc.unregister(policyId);
      });
    };
    /**
     * This function processes the response and replace the existing viewModelObject with the newly created VMO
     *
     */


    function processJsonStringResponse(viewModelObjectsInJsonString, uidToVMMap) {
      var loadedObjects = dataSource.getLoadedViewModelObjects();

      _.forEach(viewModelObjectsInJsonString, function (viewModelObjectJsonString) {
        var responseObject = parsingUtils.parseJsonString(viewModelObjectJsonString);

        if (responseObject && responseObject.objects && responseObject.objects.length > 0) {
          _.forEach(responseObject.objects, function (serverVMO) {
            var uid = serverVMO.uid;
            var exisitingVMOs = uidToVMMap[uid] ? uidToVMMap[uid] : loadedObjects;

            var updatedVMO = _vmsvc.createViewModelObjectFromPartialServerVMO(serverVMO);

            _vmsvc.updateSourceObjectPropertiesByViewModelObject(updatedVMO, exisitingVMOs);
          });
        }
      });
    }
    /**
     * Can we start editing?
     *
     * @return {Boolean} true if we can start editing
     */


    editHandler.canStartEdit = function () {
      return dataSource.canStartEdit();
    };
    /**
     * Is an edit in progress?
     *
     * @return {Boolean} true if we're editing
     */


    editHandler.editInProgress = function () {
      return this._editing;
    };
    /**
     * Cancel the current edit
     *
     * @param {Boolean} noPendingModifications - are there pending modifications? (optional)
     * @param {Boolean} ignoreLeaveHandler - don't remove leave handler
     */


    editHandler.cancelEdits = function (noPendingModifications, ignoreLeaveHandler) {
      if (!ignoreLeaveHandler) {
        _leavePlaceService.registerLeaveHandler(null);
      }

      _notifySaveStateChanged('canceling', !noPendingModifications);
    };
    /**
     * Perform the actions post Save Edit
     *
     * @param {Boolean} Whether the save edit was successful
     */


    editHandler.saveEditsPostActions = function (saveSuccess) {
      if (saveSuccess) {
        _leavePlaceService.registerLeaveHandler(null);
      }

      _notifySaveStateChanged('saved', saveSuccess);
    };
    /**
     * Save the current edits
     *
     * @return {Promise} Promise that is resolved when save edit is complete
     */


    editHandler.saveEdits = function () {
      // Do not save edit if there are validation errors
      dataSource.setSelectionEnabled(true);
      var hasValidationErrors = false;
      var editableViewModelProperties = dataSource.getAllEditableProperties();

      _.forEach(editableViewModelProperties, function (prop) {
        if (prop.error && prop.error.length > 0) {
          hasValidationErrors = true;
          return false;
        }
      });

      if (hasValidationErrors) {
        logger.error(_validationError);
        return _$q.reject(_validationError);
      } // Get all properties that are modified


      var modifiedViewModelProperties = dataSource.getAllModifiedProperties();
      var modifiedPropsMap = dataSource.getModifiedPropertiesMap(modifiedViewModelProperties); // Prepare the SOA input

      var inputs = [];

      _.forEach(modifiedPropsMap, function (modifiedObj) {
        var modelObject;
        var viewModelObject = modifiedObj.viewModelObject;

        if (viewModelObject && viewModelObject.uid) {
          modelObject = _cdm.getObject(viewModelObject.uid);
        }

        if (!modelObject) {
          modelObject = {
            uid: _cdm.NULL_UID,
            type: 'unknownType'
          };
        }

        var viewModelProps = modifiedObj.viewModelProps;

        var input = _dms.getSaveViewModelEditAndSubmitToWorkflowInput(modelObject);

        _.forEach(viewModelProps, function (props) {
          _dms.pushViewModelProperty(input, props);
        });

        inputs.push(input);
      });

      var saveHandlerPromise = _saveHandlerService.getSaveServiceHandlers([dataSource.getContextVMO()]);

      var saveHandler = null;
      return saveHandlerPromise.then(function (saveHandlers) {
        var appSaveHandler = saveHandlers ? saveHandlers[0] : [];

        if (appSaveHandler && appSaveHandler.saveEdits && appSaveHandler.isDirty) {
          saveHandler = appSaveHandler;
        }
      }).then(function () {
        if (saveHandler) {
          return saveHandler.isDirty(dataSource);
        }
      }).then(function (isDirty) {
        if (saveHandler && isDirty) {
          return saveHandler.saveEdits(dataSource, inputs);
        }
      }).then(function () {
        if (saveHandler) {
          editHandler.saveEditsPostActions(true);
          return false;
        }

        return true;
      }).then(function (saveHandlerActive) {
        if (saveHandlerActive && inputs.length > 0) {
          dataSource.registerPropPolicy();
          return _dms.saveViewModelEditAndSubmitWorkflow(inputs);
        }

        return;
      }).then(function (response) {
        if (response) {
          var error = null;

          if (response.partialErrors || response.PartialErrors) {
            error = _soaSvc.createError(response);
          } else if (response.ServiceData && response.ServiceData.partialErrors) {
            error = _soaSvc.createError(response.ServiceData);
          }

          if (error) {
            var failureUids = [];

            _.forEach(error.cause.partialErrors, function (partialError) {
              failureUids.push(partialError.clientId);
            });

            updateLsdForPartialSavedVmos(response.viewModelObjectsJsonString, modifiedPropsMap);

            _notifySaveStateChanged('partialSave', false, failureUids, modifiedPropsMap);

            var errMessage = _messagingSvc.getSOAErrorMessage(error);

            _messagingSvc.showError(errMessage);

            dataSource.unregisterPropPolicy();
            return _$q.resolve();
          }
        }

        editHandler.saveEditsPostActions(true);
        dataSource.unregisterPropPolicy();
        return _$q.resolve();
      }, function (error) {
        dataSource.unregisterPropPolicy();

        if (error) {
          return _$q.reject(error);
        }
      });
    };
    /**
         * In case of partial save, update the LSD for partiaqlly saved view model objects
         *
         * @param {String} viewModelObjectsJsonString - VMO JSON string
         * @param {Object} modifiedPropsMap - Map of modified properties
         */


    function updateLsdForPartialSavedVmos(viewModelObjectsJsonString, modifiedPropsMap) {
      _.forEach(viewModelObjectsJsonString, function (viewModelObjectJsonString) {
        var responseObject = parsingUtils.parseJsonString(viewModelObjectJsonString);

        if (responseObject && responseObject.objects && responseObject.objects.length > 0) {
          _.forEach(responseObject.objects, function (serverVMO) {
            var uid = serverVMO.uid;

            if (modifiedPropsMap[uid]) {
              var modifiedProps = modifiedPropsMap[uid].viewModelProps;

              _.forEach(modifiedProps, function _iterateModifiedVmoProps(modifiedProp) {
                var serverVmoProp = serverVMO.props[modifiedProp.propertyName];

                if (serverVmoProp) {
                  modifiedProp.sourceObjectLastSavedDate = serverVmoProp.srcObjLsd;
                }
              });
            }
          });
        }
      });
    }
    /**
     * Create noty button
     *
     * @param {String} label
     * @param {Function} callback
     *
     * @return {Object} button object
     */


    function createButton(label, callback) {
      return {
        addClass: 'btn btn-notify',
        text: label,
        onClick: callback
      };
    }
    /**
     * Check for dirty edits.
     *
     * @return {boolean} value based on viewmodel has some unsaved edits
     */


    editHandler.isDirty = function () {
      var self = this;
      var isDirty = false;

      if (self.editInProgress()) {
        var modifiedViewModelProperties = dataSource.getAllModifiedProperties();
        var gwtViewModels = dataSource.getGwtVMs();

        if (modifiedViewModelProperties && modifiedViewModelProperties.length > 0) {
          return _$q.when(true);
        }

        if (dataSource.hasxrtBasedViewModel() && !isDirty && gwtViewModels.length > 0 && _xrtViewModelSvc) {
          _.forEach(gwtViewModels, function (gwtVM) {
            isDirty = _xrtViewModelSvc.isViewModelDirty(gwtVM);

            if (isDirty) {
              return false; // to break the loop
            }
          });

          return _$q.when(isDirty);
        }

        var saveHandlerPromise = _saveHandlerService.getSaveServiceHandlers([dataSource.getContextVMO()]);

        return saveHandlerPromise.then(function (saveHandlers) {
          var appSaveHandler = saveHandlers ? saveHandlers[0] : null;

          if (appSaveHandler && appSaveHandler.saveEdits && appSaveHandler.isDirty) {
            return appSaveHandler;
          }
        }).then(function (saveHandler) {
          if (saveHandler) {
            return saveHandler.isDirty(dataSource);
          }

          return _$q.when(false);
        });
      }

      return _$q.when(false);
    };
    /**
     * get the datasource from the xrt
     *
     * @return {Object} dataSource - dataSource of the modified page
     */


    editHandler.getDataSource = function () {
      return dataSource;
    };
    /**
     * Display a notification message. Prevents duplicate popups from being active at the same time.
     *
     * @return {Promise} A promise resolved when option in popup is selected
     */


    var displayNotyMessage = function displayNotyMessage() {
      // If a popup is already active just return existing promise
      if (!editHandler._deferredPopup) {
        editHandler._deferredPopup = _$q.defer();
        var message = _multiLeaveConfirmation;
        var modifiedObject = null;
        var multipleObjects = false;
        var modifiedViewModelProperties = dataSource.getAllModifiedPropertiesWithVMO();

        if (modifiedViewModelProperties !== null) {
          _.forEach(modifiedViewModelProperties, function (modifiedProperty) {
            var currentModifiedObject = modifiedProperty.viewModelObject;

            if (modifiedObject === null) {
              modifiedObject = currentModifiedObject;
            } else if (modifiedObject !== null && modifiedObject !== currentModifiedObject) {
              multipleObjects = true;
            }
          });
        }

        if (!multipleObjects) {
          if (!modifiedObject) {
            modifiedObject = dataSource.getSourceObject().vmo;
          }
          /*
             In case of the objects where object_string is empty , make use of the object_name if it is present on the VMO.
             else it will show the defualt message.
          */


          if (modifiedObject) {
            var objectDataToReplace = modifiedObject.props.object_string && modifiedObject.props.object_string.uiValue || modifiedObject.props.object_name && modifiedObject.props.object_name.uiValue;

            if (objectDataToReplace) {
              message = _singleLeaveConfirmation.replace('{0}', objectDataToReplace);
            }
          }
        }

        var buttonArray = [];
        buttonArray.push(createButton(_saveTxt, function ($noty) {
          $noty.close();
          editHandler.saveEdits().then(function () {
            editHandler._deferredPopup.resolve();

            editHandler._deferredPopup = null;
          }, function () {
            editHandler._deferredPopup.resolve();

            editHandler._deferredPopup = null;
          });
        }));
        buttonArray.push(createButton(_discardTxt, function ($noty) {
          $noty.close();
          editHandler.cancelEdits();

          editHandler._deferredPopup.resolve();

          editHandler._deferredPopup = null;
        }));

        _notySvc.showWarning(message, buttonArray);

        return editHandler._deferredPopup.promise;
      }

      return editHandler._deferredPopup.promise;
    };
    /**
     *
     * Leave confirmation. If passed a callback will call the callback once it is ok to leave. Returns a promise
     * that is resolved when it is ok to leave.
     *
     * @param {Object} callback - async callback
     */


    editHandler.leaveConfirmation = function (callback) {
      var self = this;
      return self.isDirty().then(function (isDirty) {
        return isDirty;
      }).then(function (isDirty) {
        if (isDirty) {
          return displayNotyMessage().then(function () {
            if (_.isFunction(callback)) {
              callback();
            }
          });
        } else if (dataSource && dataSource.hasxrtBasedViewModel() && self.editInProgress()) {
          if (_xrtViewModelSvc && dataSource.getSourceObject().xrtData.xrtViewModel) {
            _xrtViewModelSvc.checkEditHandler(dataSource.getSourceObject().xrtData.xrtViewModel).then(function () {
              _notifySaveStateChanged('saved', false);

              if (_.isFunction(callback)) {
                callback();
              }
            });
          }
        } else {
          editHandler.cancelEdits(true);

          if (_.isFunction(callback)) {
            callback();
          }
        }

        return _$q.resolve();
      });
    };

    editHandler.canEditSubLocationObjects = function () {
      return true;
    };

    editHandler.getSelection = function () {
      var contextVMO = dataSource.getContextVMO();

      if (contextVMO) {
        return _cdm.getObject(contextVMO.uid);
      }

      return null;
    };

    editHandler.destroy = function () {
      _leavePlaceService.registerLeaveHandler(null);

      dataSource = null;
    };

    return editHandler;
  };
  /**
   * This factory creates an edit handler
   *
   * @memberof NgServices
   * @member editHandlerFactory
   */


  app.factory('editHandlerFactory', //
  ['$q', //
  'soa_kernel_clientDataModel', //
  'soa_dataManagementService', //
  'soa_kernel_soaService', //
  'soa_kernel_propertyPolicyService', //
  'appCtxService', //
  'localeService', //
  'notyService', //
  'leavePlaceService', //
  'viewModelObjectService', //
  'messagingService', //
  'saveHandlerService', function ($q, cdm, dms, soaSvc, policySvc, appCtxSvc, localeSvc, notySvc, leavePlaceService, vmsvc, messagingSvc, saveHandlerService) {
    _$q = $q;
    _cdm = cdm;
    _dms = dms;
    _soaSvc = soaSvc;
    _policySvc = policySvc;
    _appCtxSvc = appCtxSvc;
    _localeSvc = localeSvc;
    _notySvc = notySvc;
    _leavePlaceService = leavePlaceService;
    _vmsvc = vmsvc;
    _messagingSvc = messagingSvc;
    _saveHandlerService = saveHandlerService;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating
   * which service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'editHandlerFactory'
  };
});