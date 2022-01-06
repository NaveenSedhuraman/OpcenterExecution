"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition of compare service
 *
 * @module js/compare.service
 */
define(['app', 'js/command.service', 'js/functionalUtility.service'], function (app) {
  'use strict';
  /**
   * Set of utilities used by aw-compare
   */

  app.service('compareService2', ['$q', 'commandService', 'functionalUtilityService', function CompareService($q, commandService, functional) {
    var self = this;
    /**
     * Get the grid options that are used in aw-compare. Includes everything besides "data" and "columnDefs"
     *
     * @returns {*} A ui-grid options object
     */

    self.getBaseGridOptions = function () {
      return {
        enableSorting: false,
        enableColumnMenus: false,
        enableRowSelection: false,
        enableMinHeightCheck: false,
        data: [],
        columnDefs: []
      };
    };
    /**
     * Create a ui grid column to use in compare
     *
     * @param {*} selectionModel Selection model to modify
     * @returns {*} A column usable by ui grid
     */


    self.getColumnBuilder = function (selectionModel) {
      return function getColumn(vmo) {
        return {
          // Required data checked by the cell
          awColMaster: vmo,
          field: vmo.uid,
          name: vmo.uid,
          // Custom cell and header templates
          cellTemplate: app.getBaseUrlPath() + '/html/aw-compare.cellTemplate.html',
          headerCellTemplate: app.getBaseUrlPath() + '/html/aw-compare.headerCellTemplate.html',
          // Header click handling
          onHeaderClickEvent: self.onClickEvent(selectionModel),
          // Standard compare column behavior
          allowCellFocus: false,
          enableColumnMoving: true,
          enableColumnResizing: true,
          enablePinning: false,
          minWidth: 100,
          type: 'object'
        };
      };
    };
    /**
     * Get a function which will build a row containing the information necessary to render compare columns.
     *
     * Because compare is "flipped" rows have to contain references back some column data
     *
     * @param {*} vmos View model objects displayed in the columns
     * @param {*} selectionModel Selection model to modify
     * @returns {*} A function to build rows that work with the given view model objects
     */


    self.getRowBuilder = function (vmos, selectionModel) {
      var cellData = vmos.reduce(function (acc, nxt) {
        acc[nxt.uid] = {
          data: nxt
        };
        return acc;
      }, {});
      /**
       * Build a ui-grid row from the given column
       *
       * @param {*} column - Column information
       * @return {*} Row that works with ui-grid
       */

      return function getRow(column) {
        return {
          facet: {
            displayName: column.displayName,
            key: column.name
          },
          rowDisplayName: function rowDisplayName() {
            return column.displayName;
          },
          cellData: cellData,
          onClickEvent: self.onClickEvent(selectionModel)
        };
      };
    };
    /**
     * Get a function to handle cell click events in compare
     *
     * @param {*} selectionModel Selection model to modify
     * @returns {*} Function to handle cell click events
     */


    self.onClickEvent = function (selectionModel) {
      return function (event, col, row) {
        // Try to enable multi select on a right click
        if (event.which === 3 && selectionModel.mode === 'multiple') {
          selectionModel.toggleSelection(col.colDef.awColMaster);
        } else {
          // Add / remove VMO from selection model
          //setSelection based on the current objectSelection
          if (!col.colDef.awColMaster.selected) {
            selectionModel.setSelection(col.colDef.awColMaster);
          } else {
            selectionModel.setSelection([]);
          }
        }
      };
    };
    /**
     * Get the first column for a compare grid
     *
     * @returns {*} The static first column used by compare
     */


    self.getFirstColumn = function () {
      return {
        name: '',
        field: 'rowDisplayName()',
        displayName: '',
        cellTemplate: '<div ng-mouseup="col.colDef.onClickEvent($event, col, row)" oncontextmenu="return false" class="ui-grid-cell-contents" title="{{row.entity.facet.displayName}}">{{row.entity.facet.displayName}}</div>',
        pinnedLeft: true,
        enableColumnMenu: false,
        enableColumnMoving: false,
        enableSorting: false,
        allowCellFocus: false,
        width: 125,
        headerCellTemplate: app.getBaseUrlPath() + '/html/aw-compare.headerCellTemplate.html',
        onClickEvent: self.onPropertyClickEvent
      };
    };
    /**
     * Handle a click on a property name. Previously this would have opened a popup with "Arrange".
     *
     * Could eventually be expanded to actually do something (like sorting)
     *
     * @param {*} event - The event (mouseup event currently)
     * @param {*} column - The column that was clicked (always the same)
     * @param {*} row - The row that was clicked (provides property information)
     */


    self.onPropertyClickEvent = function (event, column, row) {//
    };
    /**
     * Update the grid options to include the Arrange command.
     *
     * Async but does not have to be blocking
     *
     * @param {*} gridOptions ui grid options object
     * @param {*} commandsAnchor Commands anchor to use
     * @param {*} context Context the commands will work in
     * @returns {*} A promise that will be resolved once the update is complete
     */


    self.includeCommands = function (gridOptions, commandsAnchor, context) {
      gridOptions.enableGridMenu = true;
      gridOptions.gridMenuShowHideColumns = false;
      return commandService.getCommands(commandsAnchor, context).then(function (commands) {
        gridOptions.gridMenuCustomItems = commands.map(function (command) {
          return {
            title: command.title,
            // callbackApi.execute is not available immediately when getting commands, so it must be referenced instead of copied
            action: function action() {
              command.callbackApi.execute();
            }
          };
        });
      });
    };
  }]);
});