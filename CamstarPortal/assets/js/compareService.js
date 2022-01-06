"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module provides access to service APIs that helps to render compare Grid.
 *
 * @module js/compareService
 * @requires app
 */
define(['app', 'lodash', 'angular', 'js/logger', //
'js/adapterService', 'js/selectionHelper', 'js/appCtxService', 'js/command.service' //
], function (app, _, ngModule, logger) {
  'use strict';
  /**
   * Provides access to the compareService
   *
   * @class compareService
   * @memberOf NgServices
   */

  app.service('compareService', ['adapterService', 'selectionHelper', 'appCtxService', 'commandService', function (adapterSvc, selectionHelper, appCtxSvc, commandSvc) {
    var self = this;
    /**
     * utility function to get the scope reference (if set) on the controller under the parent element.
     */

    var getScopeForParent = function getScopeForParent(parentElement) {
      var scope = null; // assumes that the first child of parent is the controller element

      if (parentElement && parentElement.firstChild) {
        scope = ngModule.element(parentElement.firstChild).scope();
      }

      return scope;
    };
    /**
     * Update the selected object list
     *
     * @param {Element} parentElement - The DOM element for finding scope.
     * @param {Object} selectedIdList - The list of ids to be selected
     */


    var syncSelectionList = function syncSelectionList(parentElement, selectedIdList) {
      var ngScope = getScopeForParent(parentElement);

      if (ngScope && !ngScope.$$destroyed) {
        ngScope.syncSelectionList(selectedIdList);
      }
    };
    /**
     * Updates the field display names only if the field display names are empty.
     *
     * @param {Object} response - SOA response
     * @param {Array} fieldNames - array of field names
     *
     * @return {Array} field objects array which contains name and displayName properties.
     */


    self.retrieveFieldDisplayNames = function (response, fieldNames) {
      if (!response) {
        return;
      }

      var fields = [];

      var propertyDescriptors = _.get(response, 'output.propDescriptors'); // Using property descriptors, Update the fields with correct display name .


      if (propertyDescriptors) {
        var propDescMap = {};

        _.forEach(propertyDescriptors, function (propDesc) {
          if (propDesc) {
            var propName = propDesc.propertyName;
            propDescMap[propName] = propDesc;
          }
        });

        _.forEach(fieldNames, function (fieldName) {
          if (fieldName && propDescMap[fieldName]) {
            var field = {
              name: fieldName,
              displayName: propDescMap[fieldName].displayName
            };
            fields.push(field);
          }
        });
      }

      return fields;
    };
    /**
     * Presents the column config panel to arrange the columns
     *
     * @param {ObjectArray} columnDefs - Column definitions
     */


    self.arrangeColumns = function (columnDefs) {
      var grididSetting = {
        name: 'compareGridView',
        columns: columnDefs
      };
      appCtxSvc.registerCtx('ArrangeClientScopeUI', grididSetting); // Note: When "Awp0ColumnConfig" command is converted to zero compile this service must be modified to pass a $scope

      commandSvc.executeCommand('Awp0ColumnConfig');
    };
    /**
     * Clear the arrange scope ui
     *
     */


    self.clearArrangeScopeUI = function () {
      appCtxSvc.unRegisterCtx('ArrangeClientScopeUI');
    };
    /**
     * Handles single selection in compare grid
     *
     * @param {String} uid - uid of selected object
     * @param {Boolean} selectionState - selection state True/False
     * @param {Object} dataProvider - data provider for compare
     */


    self.onSingleSelection = function (uid, selectionState, dataProvider) {
      var selectedObject = null;
      var selIndex = null;

      if (dataProvider) {
        var loadedVMObjects = dataProvider.viewModelCollection.getLoadedViewModelObjects();

        if (loadedVMObjects && loadedVMObjects.length > 0) {
          var adapedObjsPromise = adapterSvc.getAdaptedObjects(loadedVMObjects);
          adapedObjsPromise.then(function (adaptedObjects) {
            _.forEach(adaptedObjects, function (adaptedObject, index) {
              if (adaptedObject && adaptedObject.uid === uid) {
                selIndex = index;
                return false;
              }
            });

            selectedObject = loadedVMObjects[selIndex];

            if (!selectedObject) {
              logger.error('Could not find matching IViewModelObj');
            }

            if (dataProvider && dataProvider.selectionModel && selectedObject) {
              selectionHelper.handleSingleSelect(selectedObject, dataProvider.selectionModel);
            }
          });
        }
      }
    };
    /**
     * Push selection to compare
     *
     * @param {Object} dataProvider - data provider for compare
     * @param {Element} parentElem - parent container element for compare
     */


    self.pushSelectionToCompare = function (dataProvider, parentElem) {
      if (dataProvider) {
        var selObjects = dataProvider.getSelectedObjects();

        if (selObjects && selObjects.length > 0) {
          var adapedObjsPromise = adapterSvc.getAdaptedObjects(selObjects);
          adapedObjsPromise.then(function (adaptedObjects) {
            // project the selected ids to a list for the Compare UI.  May be empty
            var selectedIdList = [];

            _.forEach(adaptedObjects, function (selected) {
              if (selected) {
                // this class is comparing UIDs for selection, this is the least risky fix
                // as this stage in aw3.2.  The right solution is for this class to be refactored
                // to only ever look at viewmodels and NEVER at modelobjects.  Note that even the javascript
                // is looking to the uid and not the ID for the viewmodel.
                selectedIdList.push(selected.uid);
              }
            });

            syncSelectionList(parentElem, selectedIdList);
          });
        }
      }
    };
    /**
     * Handle column position changed event
     *
     * @param {String} id - uid of object
     * @param {Number} originalPosition - original position
     * @param {Number} newPosition - new position
     */


    self.columnPositionChanged = function (id, originalPosition, newPosition) {
      logger.info('Compare: Column Position Changed from ' + originalPosition + ' to ' + newPosition);
    };
    /**
     * Bindable UI Collection
     *
     * @param {Object} data - data for bindable ui collection
     */


    var BindableUICollection = function BindableUICollection(data) {
      var bUIColSelf = this;
      bUIColSelf.api = {};
      bUIColSelf.data = data;
      bUIColSelf.events = {};
    };
    /**
     * Create bindable UI collection
     *
     * @param {Object} list - data for bindable ui collection
     */


    self.createBindableUICollection = function (list) {
      return new BindableUICollection(list);
    };
  }]);
});