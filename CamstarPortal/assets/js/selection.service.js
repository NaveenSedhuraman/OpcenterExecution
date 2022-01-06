"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines {@link NgServices.selectionService} which helps manage selection.
 *
 * @module js/selection.service
 */
define(['app', 'lodash', 'angular', 'js/eventBus', //
'js/appCtxService', 'soa/kernel/clientDataModel', 'js/viewModelObjectService'], function (app, _, ngModule, eventBus) {
  'use strict';
  /**
   * Set of utility functions to manage selection
   *
   * @member selectionService
   * @memberof NgServices
   *
   * @param {$q} $q - Service to use.
   * @param {appCtxService} appCtxService - Service to use.
   * @param {soa_kernel_clientDataModel} cdm - Service to use.
   */

  app.service('selectionService', ['$q', 'appCtxService', 'soa_kernel_clientDataModel', 'viewModelObjectService', function ($q, appCtxService, cdm, viewModelObjectSrv) {
    var self = this; // eslint-disable-line no-invalid-this

    /**
     * selection name space
     */

    var _selected = 'selected';
    /**
     * multi selection name space
     */

    var _mselected = 'mselected';
    /**
     * parent selection name space
     */

    var _pselected = 'pselected';
    /**
     * relation info name space
     */

    var _relationInfo = 'relationContext';
    /**
     * Update the selection context
     *
     * @function updateSelection
     * @memberOf NgServices.selectionService
     *
     * @param {Object | Object[]} selection - The new selection
     * @param {Object} parentSelection - The new parent selection
     * @param {Object[]} relationInformation - The new relation information
     *
     * @return {Promise} A promise resolved once selection and command context are updated.
     */

    self.updateSelection = function (selection, parentSelection, relationInformation) {
      var currentSelection = self.getSelection();
      var rInfo = relationInformation ? {
        relationInfo: relationInformation
      } : undefined;
      var singleSelection = null;
      var multiSelection = [];

      if (_.isArray(selection)) {
        singleSelection = selection[0];

        for (var i = 0; i < selection.length; i++) {
          multiSelection.push(selection[i]);
        }
      } else if (selection) {
        singleSelection = selection;
        multiSelection = [selection];
      }

      var contextChanged = false;

      if (!currentSelection.selected || !ngModule.equals(singleSelection, currentSelection.selected[0])) {
        appCtxService.registerCtx(_selected, singleSelection);
        contextChanged = true;
      }

      if (!ngModule.equals(multiSelection, currentSelection.selected)) {
        appCtxService.registerCtx(_mselected, multiSelection);
        contextChanged = true;
      }

      if (!ngModule.equals(parentSelection, currentSelection.parent)) {
        appCtxService.registerCtx(_pselected, parentSelection);
        contextChanged = true;
      }

      if (!ngModule.equals(rInfo, currentSelection.relationInfo)) {
        appCtxService.registerCtx(_relationInfo, rInfo);
        contextChanged = true;
      }

      if (contextChanged) {
        return self.updateCommandContext();
      }

      return $q.resolve();
    };
    /**
     * Get the selection from the context
     *
     * @function getSelection
     * @memberOf NgServices.selectionService
     *
     * @return {Object} An object containing the selection and the parent selection
     */


    self.getSelection = function () {
      return {
        selected: appCtxService.getCtx(_mselected),
        parent: appCtxService.getCtx(_pselected),
        relationInfo: appCtxService.getCtx(_relationInfo)
      };
    };
    /**
     * Returns the model objects based off input property objects
     *
     * @function getTargetModelObjects
     * @memberOf NgServices.selectionService
     *
     * @param {Array} propObjects - array of property objects
     *
     * @return {Array} array of alternate selected model objects containing the results
     */


    self.getAlternateSelectedObjects = function (propObjects) {
      var modelObjects = [];
      var uidsToLoad = [];

      if (propObjects) {
        _.forEach(propObjects, function (property) {
          if (property && property.dbValues) {
            _.forEach(property.dbValues, function (dbValue) {
              var modelObject = cdm.getObject(dbValue);

              if (modelObject && !_.isEmpty(modelObject.props)) {
                modelObjects.push(modelObject);
              } else {
                uidsToLoad.push(dbValue);
              }
            });
          }
        });

        if (!_.isEmpty(uidsToLoad)) {
          _.forEach(uidsToLoad, function (uid) {
            var modelObject = cdm.getObject(uid);
            modelObjects.push(modelObject);
          });
        }
      }

      return modelObjects;
    };
    /**
     * Update the command context
     *
     * @function updateCommandContext
     * @memberOf NgServices.selectionService
     *
     * @return {Promise} A promise resolved once command context is updated.
     */


    self.updateCommandContext = function () {
      return $q.resolve();
    };

    eventBus.subscribe('cdm.modified', function (event) {
      // Update the VMOs in context for the modified model objects
      var mSelectedInCtx = appCtxService.getCtx(_mselected);
      var selectedInCtx = appCtxService.getCtx(_selected);

      _.forEach(event.modifiedObjects, function _iterateModifiedObjects(updatedObj) {
        _.forEach(mSelectedInCtx, function _updateAppCtxSelection(selectedObj) {
          // Verifying the object is same. Also, we need to ensure that object is a View Model object.
          // For model objects, the data binding should be handled already. So we don't need this
          if (updatedObj.uid === selectedObj.uid && viewModelObjectSrv.isViewModelObject(selectedObj)) {
            var updatedVmo = viewModelObjectSrv.createViewModelObject(updatedObj, 'EDIT');

            if (updatedVmo && updatedVmo.props) {
              viewModelObjectSrv.updateSourceObjectPropertiesByViewModelObject(updatedVmo, mSelectedInCtx); // No need for object name check here because if 'mselected' is a VMO, 'selected' has to be VMO

              if (selectedInCtx.uid === selectedObj.uid) {
                viewModelObjectSrv.updateSourceObjectPropertiesByViewModelObject(updatedVmo, [selectedInCtx]);
              }
            }
          }
        });
      });
    });
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'selectionService'
  };
});