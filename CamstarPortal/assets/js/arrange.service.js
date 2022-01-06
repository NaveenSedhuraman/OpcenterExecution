"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/arrange.service
 */
define(['app', 'lodash', 'js/eventBus', 'js/appCtxService'], function (app, _, eventBus) {
  'use strict';

  var exports = {};

  var _appCtxSvc;
  /**
   * Mark arrange data as dirty when column visibility changed
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.columnVisibilityChanged = function (arrangeData) {
    var allColumnsVisible = true;
    var i = 0;

    for (i = 0; i < arrangeData.filteredColumnDefs.length; ++i) {
      // Name column is always visible
      if (arrangeData.filteredColumnDefs[i].displayName === 'Name' && !arrangeData.filteredColumnDefs[i].visible) {
        arrangeData.filteredColumnDefs[i].visible = true;
      }
    }

    for (i = 0; i < arrangeData.filteredColumnDefs.length; ++i) {
      if (!arrangeData.filteredColumnDefs[i].visible) {
        allColumnsVisible = false;
        break;
      }
    }

    arrangeData.allColumnsVisible = allColumnsVisible;
    this.markDirty(arrangeData);
  };
  /**
   * Filter and return list of column configs
   *
   * @param {viewModelJson} data - The view model data
   */


  exports.actionFilterList = function (data) {
    if (data.arrangeData.columnDefs === null) {
      data.arrangeData.columnConfigId = _appCtxSvc.ctx.ArrangeClientScopeUI.columnConfigId;
      data.arrangeData.objectSetUri = _appCtxSvc.ctx.ArrangeClientScopeUI.objectSetUri;
      data.arrangeData.operationType = _appCtxSvc.ctx.ArrangeClientScopeUI.operationType;
      data.arrangeData.name = _appCtxSvc.ctx.ArrangeClientScopeUI.name;
      data.arrangeData.useStaticFirstCol = _appCtxSvc.ctx.ArrangeClientScopeUI.useStaticFirstCol;
      data.arrangeData.columnDefs = [];
      data.arrangeData.orgColumnDefs = [];

      for (var i = 0; i < _appCtxSvc.ctx.ArrangeClientScopeUI.columns.length; ++i) {
        // Skip first column if useStaticFirstCol is true
        if (_appCtxSvc.ctx.ArrangeClientScopeUI.useStaticFirstCol && i === 0) {
          continue;
        }

        if (_appCtxSvc.ctx.ArrangeClientScopeUI.columns[i].displayName && _appCtxSvc.ctx.ArrangeClientScopeUI.columns[i].displayName !== '') {
          var column = _appCtxSvc.ctx.ArrangeClientScopeUI.columns[i];
          var columnDef = {
            name: column.name,
            displayName: column.displayName,
            visible: column.visible,
            columnOrder: column.columnOrder,
            hiddenFlag: !column.visible,
            isFilteringEnabled: column.isFilteringEnabled,
            pixelWidth: column.pixelWidth,
            propertyName: column.field ? column.field : column.name,
            sortDirection: column.sortDirection,
            sortPriority: column.sortPriority,
            typeName: column.typeName
          };
          data.arrangeData.columnDefs.push(columnDef);

          var orgColumnDef = _.clone(columnDef);

          data.arrangeData.orgColumnDefs.push(orgColumnDef);
        }
      }

      _appCtxSvc.unRegisterCtx('ArrangeClientScopeUI');

      if (!data.arrangeData.operationType && _appCtxSvc.ctx.searchResponseInfo && _appCtxSvc.ctx.searchResponseInfo.columnConfig && _appCtxSvc.ctx.searchResponseInfo.columnConfig.operationType) {
        data.arrangeData.operationType = _appCtxSvc.ctx.searchResponseInfo.columnConfig.operationType.toLowerCase();
      }
    }

    if (data.filterBox.dbValue) {
      data.arrangeData.filter = data.filterBox.dbValue;
    } else {
      data.arrangeData.filter = '';
    }

    data.arrangeData.filteredColumnDefs = [];

    for (i = 0; i < data.arrangeData.columnDefs.length; ++i) {
      if (data.arrangeData.filter !== '') {
        var displayName = data.arrangeData.columnDefs[i].displayName.toLocaleLowerCase().replace(/\\|\s/g, '');

        if (displayName.indexOf(data.arrangeData.filter.toLocaleLowerCase().replace(/\\|\s/g, '')) !== -1) {
          // Filter matches a column name
          data.arrangeData.filteredColumnDefs.push(data.arrangeData.columnDefs[i]);
        }
      } else {
        // No filter
        data.arrangeData.filteredColumnDefs.push(data.arrangeData.columnDefs[i]);
      }
    }

    eventBus.publish('columnVisibilityChanged');
  };
  /**
   * Toggle visibility of columns
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.selectAll = function (arrangeData) {
    var visible = !arrangeData.allColumnsVisible;

    for (var i = 0; i < arrangeData.filteredColumnDefs.length; ++i) {
      if (arrangeData.filteredColumnDefs[i].displayName !== 'Name' && arrangeData.filteredColumnDefs[i].visible !== visible) {
        arrangeData.filteredColumnDefs[i].visible = visible;
        arrangeData.filteredColumnDefs[i].hiddenFlag = !visible;
      }
    }

    eventBus.publish('columnVisibilityChanged');
  };
  /**
   * Select one column
   *
   * @param {viewModelJson} data - The view model data
   * @param {viewModelJson} eventData - Event data
   */


  exports.selectColumn = function (data, eventData) {
    if (eventData.selectedObjects.length > 0) {
      data.arrangeData.selectedColumn = eventData.selectedObjects[0];
    } else {
      data.arrangeData.selectedColumn = null;
    }
  };
  /**
   * Move selected column up
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.moveUp = function (arrangeData) {
    for (var i = 0; i < arrangeData.columnDefs.length; ++i) {
      if (arrangeData.columnDefs[i] === arrangeData.selectedColumn) {
        arrangeData.columnDefs[i] = arrangeData.columnDefs[i - 1];
        arrangeData.filteredColumnDefs[i] = arrangeData.columnDefs[i - 1];
        arrangeData.columnDefs[i - 1] = arrangeData.selectedColumn;
        arrangeData.filteredColumnDefs[i - 1] = arrangeData.selectedColumn;
        break;
      }
    }

    eventBus.publish('columnChanged');
  };
  /**
   * Move selected column down
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.moveDown = function (arrangeData) {
    for (var i = 0; i < arrangeData.columnDefs.length; ++i) {
      if (arrangeData.columnDefs[i] === arrangeData.selectedColumn) {
        arrangeData.columnDefs[i] = arrangeData.columnDefs[i + 1];
        arrangeData.filteredColumnDefs[i] = arrangeData.columnDefs[i + 1];
        arrangeData.columnDefs[i + 1] = arrangeData.selectedColumn;
        arrangeData.filteredColumnDefs[i + 1] = arrangeData.selectedColumn;
        break;
      }
    }

    eventBus.publish('columnChanged');
  };
  /**
   * Clear filter when operation type changes
   *
   * @param {viewModelJson} data - View model data
   */


  exports.operationTypeChanged = function (data) {
    data.filterBox.dbValue = '';
    this.markDirty(data.arrangeData);
  };
  /**
   * Arrange columns
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.arrange = function (arrangeData) {
    eventBus.publish('columnArrange', {
      name: arrangeData.name,
      arrangeType: 'saveColumnAndLoadAction',
      columns: arrangeData.columnDefs,
      operationType: arrangeData.operationType,
      objectSetUri: arrangeData.objectSetUri
    });

    var toolsAndInfoCommand = _appCtxSvc.getCtx('activeToolsAndInfoCommand');

    if (toolsAndInfoCommand) {
      eventBus.publish('awsidenav.openClose', {
        id: 'aw_toolsAndInfo',
        commandId: toolsAndInfoCommand.commandId
      });
    }

    _appCtxSvc.unRegisterCtx('activeToolsAndInfoCommand');
  };
  /**
   * Arrange column configs
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.reset = function (arrangeData) {
    eventBus.publish('columnArrange', {
      name: arrangeData.name,
      arrangeType: 'reset',
      columns: [],
      operationType: arrangeData.operationType,
      objectSetUri: arrangeData.objectSetUri
    });

    var toolsAndInfoCommand = _appCtxSvc.getCtx('activeToolsAndInfoCommand');

    if (toolsAndInfoCommand) {
      eventBus.publish('awsidenav.openClose', {
        id: 'aw_toolsAndInfo',
        commandId: toolsAndInfoCommand.commandId
      });
    }

    _appCtxSvc.unRegisterCtx('activeToolsAndInfoCommand');
  };
  /**
   * Update data provider and mark arrange data as dirty
   *
   * @param {viewModelJson} data - The arrange data
   */


  exports.updateColumns = function (data) {
    data.dataProviders.dataProviderColumnConfigs.update(data.arrangeData.filteredColumnDefs, data.arrangeData.filteredColumnDefs.length);
    this.markDirty(data.arrangeData);
  };
  /**
   * Mark arrange data as dirty
   *
   * @param {viewModelJson} arrangeData - The arrange data
   */


  exports.markDirty = function (arrangeData) {
    arrangeData.dirty = false;

    if (arrangeData.orgColumnDefs.length !== arrangeData.columnDefs.length) {
      arrangeData.dirty = true;
    } else {
      for (var i = 0; i < arrangeData.orgColumnDefs.length; ++i) {
        if (arrangeData.orgColumnDefs[i].name !== arrangeData.columnDefs[i].name || arrangeData.orgColumnDefs[i].visible !== arrangeData.columnDefs[i].visible) {
          arrangeData.dirty = true;
          break;
        }
      }
    } // Check if operation type has changed


    if (!arrangeData.dirty) {
      if (!arrangeData.originalOperationType && !arrangeData.objectSetUri) {
        var oldOperationType = 'configured';

        if (_appCtxSvc.ctx.searchResponseInfo && _appCtxSvc.ctx.searchResponseInfo.columnConfig && _appCtxSvc.ctx.searchResponseInfo.columnConfig.operationType) {
          oldOperationType = _appCtxSvc.ctx.searchResponseInfo.columnConfig.operationType.toLowerCase();
        }

        if (oldOperationType !== arrangeData.operationType) {
          arrangeData.dirty = true;
        }
      } else if (arrangeData.originalOperationType && arrangeData.originalOperationType !== arrangeData.operationType) {
        arrangeData.dirty = true;
      }
    }
  };
  /**
   * This factory creates a service and returns exports
   *
   * @member arrange.service
   */


  app.factory('arrange.service', ['appCtxService', function (appCtxSvc) {
    _appCtxSvc = appCtxSvc;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'arrange.service'
  };
});