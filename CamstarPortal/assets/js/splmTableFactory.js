"use strict";

/* eslint-disable max-lines */
// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is the entry point for SPLM table. It initializes the table and renders it
 *
 * @module js/splmTableFactory
 */
define([//
'app', 'lodash', 'js/eventBus', 'js/splmTableNative', 'js/splmTableInfiniteScrollService', 'js/splmTableColumnRearrangement', //
'js/awColumnFilterService', 'js/selectionHelper', 'js/viewModelObjectService', 'js/dragAndDropService', 'js/appCtxService', 'js/uwPropertyService', 'js/awSPLMTableCellRendererFactory', 'js/localeService', 'js/commandPanel.service', 'js/splmTableMenuService'], function (app, _, eventBus, _t, SPLMTableInfiniteScrollService, SPLMTableColumnRearrangement) {
  'use strict';
  /**
   * Cached reference to the various AngularJS and AW services.
   */

  var exports = {};
  var _selectionHelper = null;
  var _viewModelObjectSvc = null;
  var _dragAndDropService = null;
  var _uwPropertyService = null;
  var _appCtxService = null;
  var _cellRendererFactory = null;
  var _localeService = null;
  var _splmTableMessages = null;
  var _commandPanelService = null;
  var _awTableStateService = null;
  var _awIconService = null;
  var _columnFilterService = null;
  var _eventBusSubDefs = {};
  var _tableInstances = {};
  var _defaultContentFilter = {
    isIdOfObject: function isIdOfObject(vmo, uid) {
      return vmo && vmo.uid && (vmo.uid === uid || vmo.uid.indexOf(uid) !== -1);
    }
  };
  /**
   * @memberOf js/aw-splm-table.directive
   *
   * Handles other select through selectionhandler
   *
   * @param {Object} event - event from the tap/click action
   * @param {Object} dataProvider - declarative dataProvider
   */

  var _handleNonContextMenuSelect = function _handleNonContextMenuSelect(rowVmoArray, selectionModel, event, dataProvider) {
    _selectionHelper.handleSelectionEvent(rowVmoArray, selectionModel, event, dataProvider);
  };
  /**
   * Check if we are using a 'gridid' in the closest 'declViewModel' in the scope tree.<BR>
   * If so: Use it to display the aw-table data<BR>
   *
   */


  exports.createTableObject = function (directiveElement, gridid, dataProvider, columnProvider, contentFilter, gridOptions, containerHeight, treeTableState) {
    // 20180920: put it to null so that it will error out when there is an code error
    var _tableColumns = null;

    var _contentFilter = contentFilter || _defaultContentFilter; // setup cell renderer


    var cellRenderer = _cellRendererFactory.createCellRenderer();

    var table = _t.util.createElement('div');

    var _trv = new _t.Trv(table);

    var tableCtrl = null;
    var tableEditor = null;
    var menuService = null;
    var _nodeExpansionInProgress = false; // LCS-138303 - Performance tuning for 14 Objectset Table case - implementation
    // Define header and row height here to save computed CSS reading

    var _rowBorderWidth = 1;

    var _rowHeight = _appCtxService.ctx.layout === 'compact' ? _t.const.HEIGHT_COMPACT_ROW : _t.const.HEIGHT_ROW;

    _rowHeight = _t.util.getTableRowHeight(gridOptions, _rowHeight);
    _tableInstances[gridid] = table;

    if (gridid) {
      var instanceEventSubcr = []; // Do essential table DOM Element initialization for further processing

      table.id = gridid;
      table.classList.add(_t.const.CLASS_TABLE);
      table.classList.add(_t.const.CLASS_WIDGET_GRID);
      table.classList.add(_t.const.CLASS_LAYOUT_COLUMN);
      table.classList.add(_t.const.CLASS_WIDGET_TABLE_DROP);
      table.classList.add(_t.const.CLASS_SELECTION_ENABLED);

      _t.util.setSortCriteriaOnColumns(columnProvider, dataProvider);

      var getContainerHeight = function getContainerHeight() {
        if (containerHeight !== undefined) {
          return containerHeight;
        }

        if (gridOptions.maxRowsToShow !== undefined) {
          return (_rowHeight + _rowBorderWidth) * gridOptions.maxRowsToShow + _t.const.HEIGHT_HEADER;
        }

        return undefined;
      };

      var tableScroll = new SPLMTableInfiniteScrollService(getContainerHeight());
      table._tableInstance = {
        ctx: _appCtxService.ctx,
        messages: _splmTableMessages,
        dataProvider: dataProvider,
        columnProvider: columnProvider,
        gridId: gridid,
        gridOptions: gridOptions,
        isEditing: false,
        renderer: tableScroll
      };
      menuService = new _t.MenuService(table, directiveElement, table._tableInstance);
      menuService.addColumnMenu();

      if (gridOptions.enableGridMenu) {
        menuService.addGridMenu(_awIconService);
      }

      if (gridOptions.showContextMenu === true) {
        menuService.addContextMenu(_selectionHelper);
      } // This updateColumnDefs function is called as part of the buildDynamicColumns.


      var _updateColumnDefs = function _updateColumnDefs() {
        var columns = dataProvider.cols;

        for (var i = 0; i < columns.length; i++) {
          columns[i].visible = !columns[i].hasOwnProperty('visible') || columns[i].visible;
        }

        _tableColumns = _.filter(columns, function (column) {
          if (column.visible) {
            return column;
          }

          return false;
        });

        _.forEach(_tableColumns, function (column, index) {
          column.index = index;

          if (!column.cellRenderers) {
            column.cellRenderers = [];
          }

          if (column.name === 'icon' && column.iconCellRenderer) {
            column.cellRenderers = column.cellRenderers.concat(column.iconCellRenderer);
          }

          column.cellRenderers = column.cellRenderers.concat(cellRenderer.getAwCellRenderers());
        });

        menuService.loadDefaultColumnMenus(_appCtxService);
      };

      _updateColumnDefs();

      tableEditor = new _t.Editor(table, directiveElement);
      tableCtrl = new _t.Ctrl(table, _tableColumns, tableEditor);
      table._tableInstance.controller = tableCtrl; // REFACTOR: Try to separate selection related logic to separate file
      // LCS-145673 - Make 'Show Children' command visible in table rows
      // We need to make the selection code be compatible with:
      // 1. When cellRenderer contains command cell by default
      // 2. When cellRenderer does not contains command cell
      // Code in this method work for both as design above

      var updateContentRowSelection = function updateContentRowSelection(selectionModel, columnDefs, pinRowElements, scrollRowElements) {
        if (pinRowElements === undefined || scrollRowElements === undefined) {
          pinRowElements = _trv.getPinContentRowElementsFromTable();
          scrollRowElements = _trv.getScrollContentRowElementsFromTable();
        }

        var cnt = pinRowElements.length;

        for (var i = 0; i < cnt; i++) {
          var rowElem = scrollRowElements[i];
          var pinElem = pinRowElements[i];
          var rowCells = Array.prototype.slice.call(pinElem.getElementsByClassName(_t.const.CLASS_CELL));
          rowCells = rowCells.concat(Array.prototype.slice.call(rowElem.getElementsByClassName(_t.const.CLASS_CELL)));

          if (rowElem.vmo) {
            if (selectionModel.isSelected(rowElem.vmo)) {
              rowElem.classList.add(_t.const.CLASS_ROW_SELECTED);
              rowElem.classList.add(_t.const.CLASS_STATE_SELECTED);
              pinElem.classList.add(_t.const.CLASS_ROW_SELECTED);
              pinElem.classList.add(_t.const.CLASS_STATE_SELECTED); // Add cell selected class to each cell

              _.forEach(rowCells, function (cell, idx) {
                cell.classList.add(_t.const.CLASS_CELL_SELECTED);

                if (columnDefs[idx].isTableCommand || columnDefs[idx].isTreeNavigation) {
                  var cellTop = cell.children[0];

                  if (columnDefs[idx].isTreeNavigation) {
                    cellTop = cell.getElementsByClassName('aw-jswidgets-tableNonEditContainer')[0];
                  }

                  cellRenderer.resetHoverCommandElement(); // process OOTB cmd cell

                  if (cellTop.lastChild && cellTop.lastChild.classList && cellTop.lastChild.classList.contains(_t.const.CLASS_NATIVE_CELL_COMMANDS)) {
                    _t.util.destroyNgElement(cellTop.lastChild);
                  } // process customize cmd cell


                  if (cellTop.lastChild && cellTop.lastChild.classList && cellTop.lastChild.classList.contains(_t.const.CLASS_AW_CELL_COMMANDS)) {
                    if (selectionModel.multiSelectEnabled) {
                      cellTop.lastChild.style.display = 'none';
                      cellTop.appendChild(_cellRendererFactory.createCheckMarkElement(columnDefs[idx], rowElem.vmo, table));
                    }
                  }

                  if (rowElem.vmo.props) {
                    if (!cellTop.lastChild || cellTop.lastChild && cellTop.lastChild.classList && !cellTop.lastChild.classList.contains(_t.const.CLASS_AW_CELL_COMMANDS)) {
                      if (!selectionModel.multiSelectEnabled && selectionModel.getCurrentSelectedCount() === 1) {
                        var markElem = _cellRendererFactory.createCellCommandElement(columnDefs[idx], rowElem.vmo, table, true);

                        cellTop.appendChild(markElem);
                      } else if (selectionModel.multiSelectEnabled) {
                        var markElem = _cellRendererFactory.createCheckMarkElement(columnDefs[idx], rowElem.vmo, table);

                        cellTop.appendChild(markElem);
                      }
                    }
                  } //dont hide any cell commands nor create and append checkMarkElement.

                }
              });
            } else {
              if (rowElem.classList.contains(_t.const.CLASS_ROW_SELECTED) || rowElem.classList.contains(_t.const.CLASS_STATE_SELECTED)) {
                rowElem.classList.remove(_t.const.CLASS_ROW_SELECTED);
                rowElem.classList.remove(_t.const.CLASS_STATE_SELECTED);
              }

              if (pinElem.classList.contains(_t.const.CLASS_ROW_SELECTED) || pinElem.classList.contains(_t.const.CLASS_STATE_SELECTED)) {
                pinElem.classList.remove(_t.const.CLASS_ROW_SELECTED);
                pinElem.classList.remove(_t.const.CLASS_STATE_SELECTED);
              } // remove cell selected class to each cell


              _.forEach(rowCells, function (cell, idx) {
                if (cell.classList.contains(_t.const.CLASS_CELL_SELECTED)) {
                  cell.classList.remove(_t.const.CLASS_CELL_SELECTED);
                }

                if (columnDefs[idx].isTableCommand || columnDefs[idx].isTreeNavigation) {
                  var cellTop = cell.children[0];

                  if (columnDefs[idx].isTreeNavigation) {
                    cellTop = cell.getElementsByClassName('aw-jswidgets-tableNonEditContainer')[0];
                  } // Process OOTB cmd cell


                  if (cellTop.lastChild && cellTop.lastChild.classList && cellTop.lastChild.classList.contains(_t.const.CLASS_NATIVE_CELL_COMMANDS)) {
                    _t.util.destroyNgElement(cellTop.lastChild);

                    cellRenderer.destroyHoverCommandElement();
                  } // Process customize cmd cell


                  if (cellTop.lastChild && cellTop.lastChild.classList && cellTop.lastChild.classList.contains(_t.const.CLASS_AW_CELL_COMMANDS)) {
                    cellTop.lastChild.style.removeProperty('display');
                  }
                }
              });
            }
          } else {
            rowElem.classList.remove(_t.const.CLASS_ROW_SELECTED);
            rowElem.classList.remove(_t.const.CLASS_STATE_SELECTED);
            pinElem.classList.remove(_t.const.CLASS_ROW_SELECTED);
            pinElem.classList.remove(_t.const.CLASS_STATE_SELECTED); // remove cell selected class to each cell

            _.forEach(rowCells, function (cell) {
              cell.classList.remove(_t.const.CLASS_CELL_SELECTED);
            });
          }
        }
      };
      /**
       * @memberOf js/aw-splm-table.directive
       *
       * Callback method when a table row gets selected/clicked
       *
       * @param {Object} event - event from the tap/click action
       * @param {Object} dataProvider - declarative dataProvider
       */


      var rowSelectionChanged = function rowSelectionChanged(event) {
        if (_t.util.isEditing(table)) {
          return;
        }

        var row = event.currentTarget;
        var selectionModel = dataProvider.selectionModel;

        if (selectionModel) {
          _handleNonContextMenuSelect([row.vmo], selectionModel, event, dataProvider);
          /**
           * If we already have row selected, then ctrl + select the same row, we need to update selected row to provide checkmark
           * Dataprovider watcher evaluates by checking if currently selected has changed. This wont catch for selecting same row in multi
           * instead of single
           */


          if (event.ctrlKey) {
            updateContentRowSelection(selectionModel, dataProvider.cols);
          }

          _t.util.getElementScope(table).$apply();
        } // This event is used to denote a selection performed by user click on a row.


        eventBus.publish(gridid + '.gridSelection', {
          selectedObjects: dataProvider.getSelectedObjects()
        });
      }; // LCS-13247 Pagination SOA performance issue for Objectset Table
      // - Put a debounce here to avoid possible sending traffic jam, the number
      //   is from _pingRedrawDebounce from aw.table.controller
      // - With debounce IE performance improves a lot and no impact to chrome performance,
      //   so leave the debounce for all


      var _loadMorePageDebounce = _.debounce(function (firstRenderedItem, lastRenderedItem) {
        eventBus.publish(gridid + '.plTable.loadMorePages', {
          firstRenderedItem: firstRenderedItem,
          lastRenderedItem: lastRenderedItem
        });
      }, 500);

      var pendingUpdatedProps = {};

      var updateRowContents = function updateRowContents(updatedPropsMaps) {
        var rowElements = _trv.queryAllRowCellElementsFromTable();

        _.forEach(updatedPropsMaps, function (updatedProps, vmoUid) {
          _.forEach(rowElements, function (rowElem) {
            if (rowElem.vmo && rowElem.vmo.uid === vmoUid) {
              _.forEach(rowElem.children, function (cellElem) {
                var needsUpdate = false;

                if (cellElem.columnDef.name === 'icon') {
                  var imgElem = cellElem.getElementsByTagName('img')[0];

                  if (imgElem && imgElem.getAttribute('src') !== _t.util.getImgURL(rowElem.vmo)) {
                    needsUpdate = true;
                  }
                } else {
                  for (var i = 0; i < updatedProps.length; i++) {
                    if (cellElem.propName === updatedProps[i]) {
                      needsUpdate = true;
                      break;
                    }
                  }
                }

                if (needsUpdate) {
                  var oldCellTop = cellElem.children[0];

                  var newCellTop = _t.Cell.createElement(cellElem.columnDef, rowElem.vmo, table, rowElem); // LCS-145046 - Launch workflow for schedule Task - Item selected does not show open cell command
                  // Move command cell to new cell if present
                  //
                  // LCS-164398 - ACE - adding child item in table mode, shows two show children icon
                  // For the case, which custom cell renderer complies its own command WITH CONDITION, there is
                  // a practice:
                  // 1. Select item which dose not match the CONDITION. In this case, we will compile a native cell
                  //    command for it. It will be dummy since the condition is not match in common case, but the DOM
                  //    structure is there.
                  // 2. After applying something (Add a child in ACE case), the CONDITION in custom cell renderer becomes
                  //    true. Then the custom cell renderer will generate the cell.
                  // 3. So for logic below, in this practice, we should not bring the old command - we should use the command
                  //    In custom cell.
                  // The only 2 cases which is going to have problem is select and hover for now - both of the should be fine
                  // here.
                  //
                  // LCS-166330 Regression caused by Fix for LCS-164398
                  // Be careful that all the DOM data structure are not OOTB JS type - in this case the classList is not array
                  // but DOMTokenList. so we can't use put empty array as default value and assume it has '.contains'.
                  //


                  var currentCellLastChildClassList = null;
                  var newCellCommandParentElem = null;
                  var oldCellCommandParentElem = null;

                  if (cellElem.columnDef.isTreeNavigation === true) {
                    newCellCommandParentElem = newCellTop.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_NON_EDIT_CONTAINER)[0];
                    oldCellCommandParentElem = oldCellTop.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_NON_EDIT_CONTAINER)[0];
                  } else {
                    newCellCommandParentElem = newCellTop;
                    oldCellCommandParentElem = oldCellTop;
                  }

                  currentCellLastChildClassList = newCellCommandParentElem.lastChild && newCellCommandParentElem.lastChild.classList ? newCellCommandParentElem.lastChild.classList : undefined;

                  if (!(currentCellLastChildClassList && currentCellLastChildClassList.contains(_t.const.CLASS_AW_CELL_COMMANDS)) && oldCellCommandParentElem.lastChild && oldCellCommandParentElem.lastChild.classList && oldCellCommandParentElem.lastChild.classList.contains(_t.const.CLASS_NATIVE_CELL_COMMANDS)) {
                    newCellCommandParentElem.appendChild(oldCellCommandParentElem.lastChild);
                  }

                  cellElem.replaceChild(newCellTop, oldCellTop);
                  tableEditor.updateEditStatusForCell(cellElem);
                }
              });
            }
          });
        });
      };

      var updatePendingProps = _.debounce(function () {
        updateRowContents(pendingUpdatedProps);
        pendingUpdatedProps = {};
      }, 250);

      instanceEventSubcr.push(eventBus.subscribe('viewModelObject.propsUpdated', function (updatedProps) {
        // Merge the updatedVmos into pendingUpdatedVmos
        for (var vmoUid in updatedProps) {
          if (pendingUpdatedProps[vmoUid] === undefined) {
            pendingUpdatedProps[vmoUid] = updatedProps[vmoUid];
          } else {
            for (var i = 0; i < updatedProps[vmoUid].length; i++) {
              var updatedPropName = updatedProps[vmoUid][i];

              if (pendingUpdatedProps[vmoUid].indexOf(updatedPropName) === -1) {
                pendingUpdatedProps[vmoUid].push(updatedPropName);
              }
            }
          }
        }

        updatePendingProps();
      }));
      /**
       * Finds VMOs with undefined props within the specified range.
       *
       * @param {int} startIndex - starting VMO index
       * @param {int} endIndex - edning VMO index
       */

      var findVMOsWithMissingProps = function findVMOsWithMissingProps(startIndex, endIndex) {
        var emptyVMOs = [];

        for (var i = startIndex; i <= endIndex; i++) {
          var vmo = dataProvider.viewModelCollection.loadedVMObjects[i];

          if (vmo.isPropLoading) {
            continue;
          } else if (!vmo.props) {
            emptyVMOs.push(vmo);
          } else {
            var keys = Object.keys(vmo.props);

            if (keys.length === 0) {
              emptyVMOs.push(vmo);
            }
          }
        }

        return emptyVMOs;
      };

      var loadProps = function loadProps(emptyVMOs) {
        eventBus.publish(gridid + '.plTable.loadProps', {
          VMOs: emptyVMOs
        });
      };

      var editCellElement;
      var columnRearrangementService = new SPLMTableColumnRearrangement(table); // 20180927: This is not related to global isEdit anymore, feel free
      // to refactor:)

      var updateEditStatusForTableCanvas = function updateEditStatusForTableCanvas(isEditing) {
        tableCtrl.setDraggable(!isEditing);
        tableEditor.updateEditStatus(isEditing);
      };

      var _setupTreeForEditing = function _setupTreeForEditing(isEditing) {
        tableScroll.setupTreeEditScroll(isEditing);
      };

      var updateEditState = function updateEditState(eventData) {
        // We should not start edit for any non table cases.
        // This should be started only for table cases and also based on the grid id you are on.
        // PWA case the dataSource is the dataProvider, thus has no .dataProviders property (we check if it is the dataProvider in scope with .name)
        // SWA case we have dataSource.dataProvider and can check with dataProviders[ dataProvider.name ]
        if (tableCtrl && eventData.dataSource && (eventData.dataSource.dataProviders && eventData.dataSource.dataProviders[dataProvider.name] || eventData.dataSource.name === dataProvider.name)) {
          var isEditing = eventData.state === 'partialSave' || eventData.state === 'starting';

          _t.util.setIsEditing(table, isEditing);

          tableCtrl.setSelectable(!isEditing);
          updateEditStatusForTableCanvas(isEditing);

          if (gridOptions.useTree) {
            _setupTreeForEditing(isEditing);
          }

          if (!isEditing) {
            var cellTopElements = _trv.getTableContainerElementFromTable().getElementsByClassName(_t.const.CLASS_TABLE_CELL_TOP);

            var failUids = eventData.failureUids || [];

            _.forEach(cellTopElements, function (elem) {
              if (!_.includes(failUids, elem.parentNode.parentNode.vmo.uid)) {
                elem.classList.remove(_t.const.CLASS_CELL_CHANGED);
              }
            });
          }
        }
      };

      instanceEventSubcr.push(eventBus.subscribe('plTable.editStateChange', function (eventData) {
        updateEditState(eventData);
      }));
      instanceEventSubcr.push(eventBus.subscribe('editHandlerStateChange', function (eventData) {
        updateEditState(eventData);
      }));

      var _updateAllRowsVisibilityDebounce = _.debounce(function () {
        var rowElements = _trv.queryAllRowCellElementsFromTable();

        _.forEach(rowElements, function (row) {
          if (row.vmo) {
            var cellTopElem = row.getElementsByClassName(_t.const.CLASS_SPLM_TABLE_ICON_CELL)[0];

            if (!cellTopElem) {
              cellTopElem = row.getElementsByClassName(_t.const.CLASS_AW_TREE_COMMAND_CELL)[0];
            }

            if (cellTopElem) {
              var iconCellElem = cellTopElem.parentElement;
              var columnDef = iconCellElem.columnDef;

              var newCellTop = _t.Cell.createElement(columnDef, row.vmo, table, row);

              iconCellElem.replaceChild(newCellTop, cellTopElem);
            }
          }
        });
      }, 100);
      /**
       * Subscribe to resetScroll. Clear the tables rendered items cache and scroll to top of table.
       */


      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.resetScroll', function () {
        if (tableScroll && tableScroll.isInitialized()) {
          tableScroll.resetInfiniteScroll();
        }
      }));
      /**
       * Subscribe to unsetScrollToRowIndex. Unset the initial row index for infinite scroll.
       */

      instanceEventSubcr.push(eventBus.subscribe(gridid + '.plTable.unsetScrollToRowIndex', function () {
        if (tableScroll && tableScroll.isInitialized()) {
          tableScroll.resetInitialRowIndex();
        }
      }));

      var verdict = _t.util.validateRowHeightGridOption(table._tableInstance.gridOptions);
      /**
       * Subscribe to LayoutChangeEvent. Update row height to correct value
       */


      if (verdict === false) {
        instanceEventSubcr.push(eventBus.subscribe('LayoutChangeEvent', function (data) {
          var oldHeight = _rowHeight;
          _rowHeight = data.rowHeight;

          if (oldHeight === _rowHeight) {
            return;
          }

          if (tableScroll.isInitialized()) {
            tableScroll.setRowHeight(_rowHeight + _rowBorderWidth);
            var newContainerHeight = getContainerHeight();

            if (newContainerHeight !== undefined) {
              tableScroll.setContainerHeight(newContainerHeight);
            } // Reinitialize properties so that the rendering calculations are valid


            tableScroll.initializeProperties();
            tableScroll.updateRowAlignment(); // Scroll to rows in that were in view before layout change

            var scrollContainer = _trv.getScrollCanvasElementFromTable();

            var oldScrollTop = scrollContainer.scrollTop;
            scrollContainer.scrollTop = oldScrollTop / oldHeight * _rowHeight;
            tableScroll.handleScroll();
          }
        }));
      }

      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.selectionChangeEvent', function () {
        updateContentRowSelection(dataProvider.selectionModel, dataProvider.cols);
      }));
      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.selectAll', function () {
        updateContentRowSelection(dataProvider.selectionModel, dataProvider.cols);
      }));
      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.selectNone', function () {
        updateContentRowSelection(dataProvider.selectionModel, dataProvider.cols);
      }));
      instanceEventSubcr.push(eventBus.subscribe(gridid + '.plTable.visibilityStateChanged', _updateAllRowsVisibilityDebounce));
      instanceEventSubcr.push(eventBus.subscribe('awFill.completeEvent_' + gridid, function (eventData) {
        // get the VMOs from the table
        var VMOs = dataProvider.viewModelCollection.loadedVMObjects;
        var targetProp;
        var $source = VMOs.filter(function (vmo) {
          return vmo.uid === eventData.source;
        });
        var sourceProp = $source[0].props[eventData.propertyName];
        var foundLastTarget = false;

        var copyPropertyToCellContent = function copyPropertyToCellContent(sourceProperty, vmoUid, tableElem) {
          var cellElements = _t.util.getCellElementsByPropertyAndUid(tableElem, sourceProperty.propertyName, vmoUid);

          for (var i = 0; i < cellElements.length; i++) {
            var cellElem = cellElements[i];
            var row = cellElem.parentElement;
            var oldCellTop = cellElem.children[0];

            var newCellTop = _t.Cell.createElement(cellElem.columnDef, row.vmo, table, row);

            newCellTop.classList.add(_t.const.CLASS_AW_EDITABLE_CELL);
            cellElem.replaceChild(newCellTop, oldCellTop);
          }
        };

        var copyFillDownProperty = function copyFillDownProperty(targetProperty, sourceProperty) {
          targetProperty.uiValue = sourceProperty.uiValue;
          targetProperty.dbValue = sourceProperty.dbValue;
          targetProperty.valueUpdated = true;

          _uwPropertyService.updateViewModelProperty(targetProperty);
        }; // start with the target furthest from the source and work back


        if (eventData.direction === 'up') {
          for (var idxUp = 0; idxUp < VMOs.length; idxUp++) {
            if (!foundLastTarget && VMOs[idxUp].uid === eventData.endTarget) {
              foundLastTarget = true;
            }

            targetProp = VMOs[idxUp].props[eventData.propertyName];

            if (foundLastTarget && targetProp.isPropertyModifiable && targetProp.editable) {
              if (VMOs[idxUp].uid === eventData.source) {
                // reached source, we are done
                break;
              } // update the target using the source


              copyFillDownProperty(targetProp, sourceProp);
              copyPropertyToCellContent(sourceProp, VMOs[idxUp].uid, table);
            }
          }
        } else {
          // direction is down; start from bottom and work up
          for (var idxDown = VMOs.length - 1; idxDown >= 0; idxDown--) {
            if (!foundLastTarget && VMOs[idxDown].uid === eventData.endTarget) {
              foundLastTarget = true;
            }

            targetProp = VMOs[idxDown].props[eventData.propertyName];

            if (foundLastTarget && targetProp.isPropertyModifiable && targetProp.editable) {
              if (VMOs[idxDown].uid === eventData.source) {
                // reached source, we are done
                break;
              } // update the target using the source


              copyFillDownProperty(targetProp, sourceProp);
              copyPropertyToCellContent(sourceProp, VMOs[idxDown].uid, table);
            }
          }
        }
      }));
      instanceEventSubcr.push(eventBus.subscribe(gridid + '.plTable.resizeCheck', function () {
        tableScroll.checkForResize();
      }));
      instanceEventSubcr.push(eventBus.subscribe('plTable.columnsRearranged_' + gridid, function (eventData) {
        // Get column position in relation to all columns, not just visible columns
        var originalPosition = eventData.originalPosition;
        var newPosition = null; // Get new position index

        _.forEach(dataProvider.cols, function (column) {
          if (eventData.name === column.name) {
            newPosition = column.index;
          }
        }); // Adjust for hidden columns


        _.forEach(dataProvider.cols, function (column, index) {
          if (column.hiddenFlag === true && index <= newPosition) {
            newPosition += 1;
          }

          if (column.hiddenFlag === true && index <= originalPosition) {
            originalPosition += 1;
          }
        }); // awColumnService adjusts the column positions when the icon column is not present.
        // By incrementing the positions by 1, we are able to ensure awColumnService still uses
        // the correct column positions. Once  UI-Grid is removed, we can remove this hack and update awColumnService
        // to not adjust positions when icon column is not present.


        if (dataProvider.cols[0].name !== 'icon') {
          originalPosition += 1;
          newPosition += 1;
        }

        if (originalPosition !== null && newPosition !== null) {
          columnProvider.columnOrderChanged(eventData.name, originalPosition, newPosition);
        }
      }));
      instanceEventSubcr.push(eventBus.subscribe('plTable.columnsResized_' + gridid, function (eventData) {
        columnProvider.columnSizeChanged(eventData.name, eventData.delta);
      }));

      var scrollToRow = function scrollToRow(gridId, rowUids) {
        var rowIndexes = [];

        for (var i = 0; i < rowUids.length; i++) {
          var uid = rowUids[i].uid ? rowUids[i].uid : rowUids[i];
          var rowIndex = dataProvider.viewModelCollection.findViewModelObjectById(uid);

          if (rowIndex !== -1) {
            rowIndexes.push(rowIndex);
          }
        }

        if (rowIndexes.length > 0 && gridid === gridId) {
          var scrollTriggered = tableScroll.scrollToRowIndex(rowIndexes);

          if (scrollTriggered === false) {
            dataProvider.scrollToRow = false;
          }
        }
      };

      instanceEventSubcr.push(eventBus.subscribe('plTable.scrollToRow', function (eventData) {
        scrollToRow(eventData.gridId, eventData.rowUids);
      }));
      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.plTable.maintainScrollPosition', function () {
        tableScroll.setScrollPositionToBeMaintained();
      }));

      var updateDecoratorVisibility = function updateDecoratorVisibility(isEnabled) {
        if (isEnabled === true && gridOptions.showDecorators !== false) {
          table.classList.add(_t.const.CLASS_AW_SHOW_DECORATORS);
        } else {
          table.classList.remove(_t.const.CLASS_AW_SHOW_DECORATORS);
        }
      };

      var decoratorToggle = 'decoratorToggle';

      var showDecorators = _appCtxService.getCtx(decoratorToggle);

      updateDecoratorVisibility(showDecorators);
      instanceEventSubcr.push(eventBus.subscribe('appCtx.register', function (event) {
        if (event.name === decoratorToggle) {
          updateDecoratorVisibility(event.value);
        }
      }));
      instanceEventSubcr.push(eventBus.subscribe('appCtx.update', function (event) {
        if (event.name === decoratorToggle) {
          updateDecoratorVisibility(event.value.decoratorToggle);
        }
      }));
      instanceEventSubcr.push(eventBus.subscribe('decoratorsUpdated', function (updateVMOs) {
        updateVMOs = updateVMOs.length === undefined ? [updateVMOs] : updateVMOs;
        tableCtrl.updateColorIndicatorElements(updateVMOs);
      }));
      /**
       * React to request for node expansions.
       */

      instanceEventSubcr.push(eventBus.subscribe(dataProvider.name + '.expandTreeNode', function (eventData) {
        if (eventData.parentNode) {
          var vmCollection = dataProvider.getViewModelCollection();
          var rowNdx = vmCollection.findViewModelObjectById(eventData.parentNode.id);

          if (rowNdx !== -1) {
            var vmo = vmCollection.getViewModelObject(rowNdx);

            if (vmo.isExpanded !== true) {
              vmo.isExpanded = true;
              eventBus.publish(table.id + '.plTable.toggleTreeNode', vmo);
            }
          }
        }
      }));
      var dragAndDropSelectionSubDef = null;
      var callbackAPIs = {
        getElementViewModelObjectFn: function getElementViewModelObjectFn(element, isTarget) {
          // eslint-disable-line

          /**
           * Merge event 'target' with any other objects currently selected.
           */
          var targetObjects = [];
          var elementRow = element.classList.contains(_t.const.CLASS_ROW) ? element : _t.util.closestElement(element, '.' + _t.const.CLASS_ROW);

          if (elementRow && elementRow.vmo) {
            targetObjects.push(elementRow.vmo);
            var targetUid = elementRow.vmo.uid;

            if (!isTarget) {
              var sourceObjects = _dragAndDropService.getSourceObjects(dataProvider, targetUid).filter(function (obj) {
                return targetObjects.indexOf(obj) === -1;
              });

              targetObjects = targetObjects.concat(sourceObjects);
            }

            return targetObjects;
          }

          return null;
        },
        clearSelectionFn: function clearSelectionFn(targetVMO) {
          // eslint-disable-line
          dataProvider.selectNone();
        },
        selectResultFn: function selectResultFn(targetElement, targetVMO) {
          // eslint-disable-line

          /**
           * Setup to listen when the 'drop' is complete
           */
          if (!dragAndDropSelectionSubDef) {
            dragAndDropSelectionSubDef = eventBus.subscribe('plTable.relatedModified', function () {
              /**
               * Stop listening
               */
              if (dragAndDropSelectionSubDef) {
                eventBus.unsubscribe(dragAndDropSelectionSubDef);
                dragAndDropSelectionSubDef = null;
              }

              var selectionModel = dataProvider.selectionModel;

              if (selectionModel) {
                _selectionHelper.handleSelectionEvent([targetVMO], selectionModel, null, dataProvider);

                updateContentRowSelection(selectionModel, dataProvider.cols);
              }
            });
          }
        }
      };
      _eventBusSubDefs[gridid] = instanceEventSubcr;
      directiveElement.appendChild(table); // Drag and drop service needs to be setup after table has been attached to the directive element so
      // that it can properly get the scope.

      if (gridOptions.enableDragAndDrop !== false) {
        _dragAndDropService.setupDragAndDrop(table, callbackAPIs, dataProvider);
      }
    }

    var getIconCellId = function getIconCellId(vmo) {
      if (vmo.loadingStatus) {
        return 'miscInProcessIndicator';
      } else if (vmo.isLeaf) {
        return 'typeBlankIcon';
      } else if (vmo.isExpanded) {
        return 'miscExpandedTree';
      }

      return 'miscCollapsedTree';
    };

    return {
      /**
       * Reset columns for PL Table
       * this method out of exports.initializeTable, cannot do it now since it depends on dataProvider
       * any other members whose scope is inside initializeTable.
       */
      resetColumns: function resetColumns() {
        _updateColumnDefs();

        _columnFilterService.removeStaleFilters(columnProvider, _tableColumns); // property loading has completed


        tableCtrl.resetColumnDefs(_tableColumns); // Table headers recreated, need to initialize column rearrangement

        columnRearrangementService.initialize(); // Trick for update scroll container position

        if (tableScroll.isInitialized()) {
          cellRenderer.resetHoverCommandElement();
          tableScroll.handleScroll();
        }
      },
      setNodeExpansionInProgress: function setNodeExpansionInProgress(isInProgress) {
        _nodeExpansionInProgress = isInProgress;
      },
      updateFilterIcons: function updateFilterIcons(columnName) {
        if (columnName) {
          tableCtrl.updateFilterIcon(columnName);
        } else {
          tableCtrl.updateAllFilterIcons();
        }
      },
      updateTreeCellIcon: function updateTreeCellIcon(vmo) {
        var rowContents = _trv.queryAllRowCellElementsFromTable();

        _.find(rowContents, function (rowElem) {
          if (rowElem.vmo) {
            var matchingId = _contentFilter.isIdOfObject(rowElem.vmo, vmo.uid);

            if (matchingId === true) {
              var iconContainerElement = rowElem.getElementsByTagName(_t.const.ELEMENT_AW_ICON)[0];

              if (iconContainerElement !== undefined) {
                var iconCellId = getIconCellId(vmo);
                iconContainerElement.id = iconCellId;
                iconContainerElement.title = vmo._twistieTitle;

                var iconHTML = _awIconService.getIconDef(iconCellId);

                iconContainerElement.innerHTML = iconHTML;
                return true;
              }
            }
          }

          return false;
        });
      },

      /**
       * Refreshes the content in the table with the data currently in the dataProvider
       */
      refresh: function refresh() {
        var columnAttrs = []; // attributesToInflate at server side cannot accept full name i.e typename.propertyname.

        _.forEach(dataProvider.cols, function (uwColumnInfo) {
          if (uwColumnInfo.field) {
            columnAttrs.push(uwColumnInfo.field);
          }
        });

        if (dataProvider && dataProvider.action && dataProvider.action.inputData) {
          dataProvider.action.inputData.searchInput = dataProvider.action.inputData.searchInput || {};
          var searchInput = dataProvider.action.inputData.searchInput;

          if (searchInput.attributesToInflate) {
            searchInput.attributesToInflate = _.union(searchInput.attributesToInflate, columnAttrs);
          } else {
            searchInput.attributesToInflate = columnAttrs;
          }
        } // REFACTOR: infinite scroll code should be refactor to follow:
        // 1. DOMElement should be the only interface for interaction between service and function
        // 2. Lot of code below should be pull out from anonymous function, a initialize grid which
        //    is taking 70 line of code is a bad smell.


        if (!tableScroll.isInitialized()) {
          // Set initial scroll index before table initializes
          if (dataProvider.isFocusedLoad) {
            var selection = dataProvider.getSelectedObjects();

            if (selection.length === 1) {
              scrollToRow(gridid, [selection[0].uid]);
            }
          }

          tableScroll.initializeGrid({
            tableElem: table,
            directiveElem: directiveElement,
            scrollViewportElem: _trv.getScrollCanvasElementFromTable(),
            pinViewportElem: _trv.getPinCanvasElementFromTable(),
            rowSelector: '.' + _t.const.CLASS_ROW,
            rowHeight: _rowHeight + _rowBorderWidth,
            headerHeight: _t.const.HEIGHT_HEADER,
            loadedVMObjects: dataProvider.viewModelCollection.loadedVMObjects,
            updateVisibleCells: function updateVisibleCells(rowParentElem) {
              tableCtrl.updateVisibleCells(rowParentElem);
            },
            updateScrollColumnsInView: function updateScrollColumnsInView(scrollLeft, scrollContainerWidth) {
              tableCtrl.updateScrollColumnsInView(scrollLeft, scrollContainerWidth);
            },
            onStartScroll: function onStartScroll() {
              if (!_t.util.isEditing(table) || !editCellElement) {
                return;
              } // Close drop down if it is open on the edit cell


              var cellListElement = editCellElement.getElementsByClassName('aw-jswidgets-popUpVisible')[0];

              if (cellListElement) {
                editCellElement.click();
              }
            },
            syncHeader: function syncHeader(isPin, scrollLeft) {
              var header = null;

              if (isPin === true) {
                header = _trv.getPinHeaderElementFromTable();
              } else {
                header = _trv.getScrollHeaderElementFromTable();
              }

              header.style.marginLeft = String(scrollLeft * -1) + 'px';
            },
            renderRows: function renderRows(startIndex, endIndex) {
              var subVMObjects = !dataProvider.viewModelCollection ? [] : dataProvider.viewModelCollection.loadedVMObjects.slice(startIndex, endIndex + 1); // Return if there is nothing to render

              if (subVMObjects.length === 0) {
                return;
              }

              if (gridOptions.useTree === true) {
                var isEditing = _t.util.isEditing(table);

                _.forEach(subVMObjects, function (vmo) {
                  if (gridOptions.textBundle) {
                    vmo._twistieTitle = vmo.isLeaf || isEditing ? '' : vmo.isExpanded ? gridOptions.textBundle.TwistieTooltipExpanded : gridOptions.textBundle.TwistieTooltipCollapsed;
                  } else {
                    vmo._twistieTitle = vmo.isLeaf || isEditing ? '' : vmo.isExpanded ? _splmTableMessages.TwistieTooltipExpanded : _splmTableMessages.TwistieTooltipCollapsed;
                  }
                });
              }

              var insertBefore = false;

              var scrollContents = _trv.getScrollContentElementFromTable();

              var pinContents = _trv.getPinContentElementFromTable();

              var firstPinElement = pinContents.childElementCount > 0 ? pinContents.childNodes[0] : 0;
              var firstScrollElement = scrollContents.childElementCount > 0 ? scrollContents.childNodes[0] : 0;

              if (firstScrollElement && firstScrollElement.getAttribute('data-indexNumber')) {
                var firstRowIdx = parseInt(firstScrollElement.getAttribute('data-indexNumber'));
                insertBefore = firstRowIdx > startIndex;
              }

              var pinContentElement = tableCtrl.constructContentElement(subVMObjects, startIndex, rowSelectionChanged, _rowHeight, true);
              var scrollContentElement = tableCtrl.constructContentElement(subVMObjects, startIndex, rowSelectionChanged, _rowHeight, false);
              updateContentRowSelection(dataProvider.selectionModel, dataProvider.cols, pinContentElement.childNodes, scrollContentElement.childNodes);

              if (insertBefore) {
                _trv.getPinContentElementFromTable().insertBefore(pinContentElement, firstPinElement);

                _trv.getScrollContentElementFromTable().insertBefore(scrollContentElement, firstScrollElement);
              } else {
                _trv.getPinContentElementFromTable().appendChild(pinContentElement);

                _trv.getScrollContentElementFromTable().appendChild(scrollContentElement);
              }
            },
            removeRows: function removeRows(upperCount, lowerCounter) {
              cellRenderer.resetHoverCommandElement();
              tableCtrl.removeContentElement(upperCount, lowerCounter);
            },
            afterGridRenderCallback: function afterGridRenderCallback(firstRenderedItem, lastRenderedItem) {
              var isEditing = _t.util.isEditing(table);

              if (isEditing) {
                updateEditStatusForTableCanvas(isEditing);
              }

              if (gridOptions.useTree === true) {
                if (_nodeExpansionInProgress === true) {
                  return;
                }

                var nonPlaceholderFound = false;

                for (var i = lastRenderedItem.index; i >= firstRenderedItem.index; i--) {
                  var vmo = dataProvider.viewModelCollection.loadedVMObjects[i];

                  if (dataProvider.focusAction) {
                    if (vmo._focusRequested) {
                      return;
                    }

                    if (vmo.isPlaceholder) {
                      // ...use .isPlaceholder or .isFocusParent instead
                      if (nonPlaceholderFound) {
                        delete vmo.isPlaceholder;
                        vmo._focusRequested = true;
                        eventBus.publish(table.id + '.plTable.doFocusPlaceHolder', {
                          vmo: vmo
                        });
                        return;
                      }
                    } else {
                      nonPlaceholderFound = true;
                    }
                  }
                } // Find and expand the first of any nodes that need to be expanded


                for (var j = firstRenderedItem.index; j <= lastRenderedItem.index; j++) {
                  var vmObject = dataProvider.viewModelCollection.loadedVMObjects[j];
                  var expandNode = false;

                  if (vmObject.isLeaf !== true && vmObject._expandRequested !== true && vmObject.isExpanded !== true) {
                    // Mark for expansion if the node was already expanded
                    if (treeTableState && _awTableStateService.isNodeExpanded(treeTableState, vmObject)) {
                      expandNode = true;
                    }
                  } // Expand the node


                  if (expandNode === true) {
                    vmObject.isExpanded = true;
                    eventBus.publish(table.id + '.plTable.toggleTreeNode', vmObject);
                    return;
                  }
                } // If any VMOs need props to be loaded, we will call for the props to be loaded and not
                // render the rows. The row rendering will then occur once they props have been loaded.


                var emptyVMOs = findVMOsWithMissingProps(firstRenderedItem.index, lastRenderedItem.index);

                if (emptyVMOs.length > 0) {
                  loadProps(emptyVMOs);
                }
              }

              if (!isEditing) {
                _loadMorePageDebounce(firstRenderedItem, lastRenderedItem);
              } // Set scrollToRow to false after row is scrolled to and all
              // visible nodes around the scrolled to row are expanded


              if (dataProvider.scrollToRow === true && tableScroll.isInitialRowIndexInView() === true) {
                dataProvider.scrollToRow = false;
              }
            }
          });
          tableScroll.renderInitialRows();
          var setContainerHeightEvent = eventBus.subscribe(gridid + '.plTable.containerHeightUpdated', function (heightVal) {
            tableScroll.setContainerHeight(heightVal);
            tableScroll.initializeProperties();
            tableScroll.handleScrollDown();
          });
          instanceEventSubcr.push(setContainerHeightEvent);
        } else {
          // Set the loaded view model objects
          tableScroll.setLoadedVMObjects(dataProvider.viewModelCollection.loadedVMObjects); // Render initial rows if at top of table

          if (_trv.getScrollCanvasElementFromTable().scrollTop === 0) {
            tableScroll.renderInitialRows();
          } else {
            tableScroll.handleScroll();
          }
        }
      }
    };
  };
  /**
   *  Release the resources occupied by SPLM table
   *
   * @param {String} gridId - Grid ID to be destroyed
   * @param {Element} tableElement - The table element
   * @param {Object} columnDefs - The column defs
   */


  exports.destroyTable = function (gridId, tableElement, columnDefs) {
    var instanceEventSubcr = _eventBusSubDefs[gridId];

    _.forEach(instanceEventSubcr, function (eventBusSub) {
      if (eventBusSub !== null) {
        eventBus.unsubscribe(eventBusSub);
      }
    });

    delete _eventBusSubDefs[gridId];

    for (var i = 0; i < columnDefs.length; i++) {
      var cellRenderers = columnDefs[i].cellRenderers;

      if (cellRenderers) {
        for (var j = 0; j < cellRenderers.length; j++) {
          if (_.isFunction(cellRenderers[j].destroy)) {
            cellRenderers[j].destroy();
          }
        }
      }
    } // Destroy the column/table menu


    var menu = document.getElementById(gridId + '_menuContainer');

    if (menu !== null) {
      document.body.removeChild(menu);
    } // NOTE: This is not need for now since we force every
    // angularJS Compile must based on table scope. But leave
    // it here for now by commenting it out.
    // var cellRenderer = _cellRendererDefs[gridId];
    // cellRenderer.destroyHoverCommandElement();
    // delete _cellRendererDefs[gridId];
    // Destroy table renderer (InfiniteScrollService)


    var table = _tableInstances[gridId];

    if (table && table._tableInstance) {
      table._tableInstance.renderer.destroyGrid();
    }

    delete _tableInstances[gridId];
    eventBus.publish('tableDestroyed');
  };
  /**
   * This service provides necessary APIs to navigate to a URL within AW.
   *
   * @memberof NgServices
   * @member splmTableFactory
   *
   * @returns {Object} Reference to SPLM table.
   */


  app.factory('splmTableFactory', ['selectionHelper', 'viewModelObjectService', 'dragAndDropService', 'appCtxService', 'uwPropertyService', 'localeService', 'awSPLMTableCellRendererFactory', 'commandPanelService', 'awTableStateService', 'awIconService', 'awColumnFilterService', function (selectionHelper, viewModelObjectSvc, dragAndDropService, appCtxService, uwPropertyService, localeService, awSPLMTableCellRendererFactory, commandPanelService, awTableStateService, awIconService, awColumnFilterService) {
    _selectionHelper = selectionHelper;
    _viewModelObjectSvc = viewModelObjectSvc;
    _dragAndDropService = dragAndDropService;
    _uwPropertyService = uwPropertyService;
    _cellRendererFactory = awSPLMTableCellRendererFactory;
    _localeService = localeService;
    _appCtxService = appCtxService;
    _commandPanelService = commandPanelService;
    _awTableStateService = awTableStateService;
    _awIconService = awIconService;
    _splmTableMessages = _localeService.getLoadedText('treeTableMessages');
    _columnFilterService = awColumnFilterService;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'splmTableFactory'
  };
});