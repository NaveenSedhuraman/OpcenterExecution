"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Selection helper service which handles single and multi selections for table.
 *
 * @module js/selectionHelper
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Helper service which handles different selection modes in table.
   *
   * @memberof NgServices
   * @member selectionService
   */

  app.service('selectionHelper', [//
  function () {
    var self = this;
    /**
     * Handles table single selection
     *
     * @param {Object} selectedObject - selected object
     * @param {Object} selectionModel - the selection model
     */

    self.handleSingleSelect = function (selectedObject, selectionModel) {
      if (!selectedObject.selected) {
        selectionModel.setSelection(selectedObject);
      } else {
        selectionModel.setSelection([]);
      }
    };
    /**
     * Handles table multi-selection
     *
     * @param {Object} selectedObject - selected object
     * @param {Object} selectionModel - the selection model
     */


    self.handleMultiSelect = function (selectedObject, selectionModel) {
      selectionModel.toggleSelection(selectedObject);
    };
    /**
     * Handles multi-selection with the shift key down for cell list
     *
     * @param {ModelObject[]} selectedObject - selected object
     * @param {Object} selectionModel - the selection model
     * @param {Object} dataProvider - The data provider
     */


    self.handleListShiftMultiSelect = function (selectedObject, selectionModel, dataProvider) {
      // If object is already selected ignore shift and just deselect
      if (selectedObject.selected) {
        selectionModel.removeFromSelection(selectedObject);
      } else {
        var uid = selectedObject.uid;
        var allLoadedObjects = dataProvider.viewModelCollection.getLoadedViewModelObjects(); // Get the index of the object that matches uid

        var start = allLoadedObjects.indexOf(allLoadedObjects.filter(function (vmo) {
          return vmo.uid === uid;
        })[0]); // Get the index of the object that matches last selected uid

        var end = allLoadedObjects.indexOf(allLoadedObjects.filter(function (vmo) {
          return selectionModel.getSelectedIndex(vmo) === selectionModel.getCurrentSelectedCount() - 1;
        })[0]); // Select everything in between

        if (start !== -1 && end !== -1) {
          dataProvider.changeObjectsSelection(start, end, true);
        }
      }
    };
    /**
     * Handle a event that should trigger a selection change
     *
     * @param {ModelObject[]} selectedObjects - selected objects
     * @param {Object} selectionModel - the selection model
     * @param {Object} event - The event
     * @param {Object} dataProvider - (Optional) Data provider. Necessary for handling shift select.
     */


    self.handleSelectionEvent = function (selectedObjects, selectionModel, event, dataProvider) {
      // Event is optional so default
      event = event ? event : {}; // If the model supports multiple selection

      if (selectionModel.mode === 'multiple') {
        // If shift key and something is selected do range selection
        if (event.shiftKey && selectionModel.getCurrentSelectedCount() > 0) {
          /**
           * Note: This handling is specific to list as ui-grid has handling for shift select built in - see
           * rowSelectionChangedBatch.
           */
          self.handleListShiftMultiSelect(selectedObjects[0], selectionModel, dataProvider);
        } else {
          // If right click or ctrl click (also implies single object clicked)
          // event.which =1 is for long press on touch devices & event.which=3 is for right click on desktop devices
          //right click should setSelect instead of  toggleSelection
          if (event.ctrlKey || event.srcElement && event.type === 'pointerdown' && event.which === 1 || selectionModel.multiSelectEnabled && event.which === 3 || event.shiftKey) {
            // If object is already selected
            selectionModel.toggleSelection(selectedObjects[0]);
          } else if (selectionModel.multiSelectEnabled) {
            if (!selectedObjects[0].selected) {
              selectionModel.addToSelection(selectedObjects[0]);
            } else {
              selectionModel.removeFromSelection(selectedObjects[0]);
            }
          } else {
            if (!selectedObjects[0].selected || selectionModel.getCurrentSelectedCount() > 1) {
              selectionModel.setSelection(selectedObjects[0]);
            } else {
              selectionModel.setSelection([]);
            }
          }
        }
      } else {
        self.handleSingleSelect(selectedObjects[0], selectionModel);
      }
    };

    return self;
  }]);
});