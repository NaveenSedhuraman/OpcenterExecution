"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Used for handling PL Table menus
 *
 * @module js/splmTableMenuService
 *
 */
define(['app', 'lodash', 'js/splmTableNative', 'js/eventBus'], function (app, _, _t, eventBus) {
  'use strict';

  var SPLMTableMenuService = function SPLMTableMenuService(table, directiveElement, tableInstance) {
    var self = this;
    var _table = table;
    var _tableInstance = tableInstance;
    var _dataProvider = _tableInstance.dataProvider;
    var _columnProvider = _tableInstance.columnProvider;
    var _gridId = _tableInstance.gridId;
    var _gridOptions = _tableInstance.gridOptions;
    var _splmTableMessages = _tableInstance.messages;
    var _directiveElement = directiveElement;

    var _trv = new _t.Trv(table);

    var _selectionHelper = null;
    var _contextMenuElem = null;
    var _gridMenuElem = null;
    var _gridMenuCommandElem = null;

    var _$timeout = app.getInjector().get('$timeout'); // Add menu service to table instance


    _tableInstance.menuService = self; // ////////////////////////////////////////////////
    // Grid Menu
    // ////////////////////////////////////////////////

    var createAwTableMenu = function createAwTableMenu() {
      var html = '<aw-popup-command-bar anchor="{{contextAnchor}}" context="commandContext" own-popup="true" class="grid-menu-command" alignment="HORIZONTAL"></aw-command-bar>';

      var isArrangeSupported = _columnProvider.isArrangeSupported();

      var cellScope = {
        contextAnchor: _dataProvider.json.gridMenuCommandsAnchor ? _dataProvider.json.gridMenuCommandsAnchor : 'aw_gridMenu',
        commandContext: {
          dataProvider: _dataProvider,
          columnProvider: _columnProvider,
          gridId: _gridId,
          gridOptions: _gridOptions,
          isArrangeSupported: isArrangeSupported
        },
        showpopup: true
      };
      return _t.util.createNgElement(html, _directiveElement, cellScope);
    };

    var loadGridMenuItems = function loadGridMenuItems() {
      _gridMenuElem = _trv.queryTableMenu(_gridId).getElement();
      _gridMenuCommandElem = createAwTableMenu();

      _gridMenuElem.appendChild(_gridMenuCommandElem);

      var gridMenuEventTimeStamp = 0;

      var loadGridMenu = function loadGridMenu(event) {
        event.preventDefault();
        var closingAction = false; // Check if this click is same as blur handler, if so we know grid should close

        if (gridMenuEventTimeStamp === event.timeStamp) {
          closingAction = true;
        }

        if (!closingAction) {
          // Clean up menu
          if (_gridMenuElem.children[0] !== _gridMenuCommandElem) {
            while (_gridMenuElem.children[0]) {
              _gridMenuElem.removeChild(_gridMenuElem.children[0]);
            }

            _gridMenuElem.appendChild(_gridMenuCommandElem);
          }

          _t.util.getElementScope(_gridMenuCommandElem).$broadcast('awPopupWidget.open', {
            popupUpLevelElement: _gridMenuCommandElem
          }, _gridMenuElem, event, 'gridMenu');

          _gridMenuElem.style.width = String(_t.const.WIDTH_DEFAULT_MENU_WIDTH) + 'px';

          var tableBoundingArea = _table.getBoundingClientRect();

          _gridMenuElem.style.left = String(tableBoundingArea.left + tableBoundingArea.width - _t.const.WIDTH_DEFAULT_MENU_WIDTH) + 'px';
          _gridMenuElem.style.top = String(tableBoundingArea.top + _t.const.COLUMN_MENU_POINTER_HEIGHT + _t.const.HEIGHT_HEADER) + 'px'; // Add the pointer for table menu

          _gridMenuElem.classList.add(_t.const.CLASS_TABLE_MENU_POINTER); // Define onBlur Handler


          var blurHandler = function blurHandler(event) {
            // firefox catches contextmenu clicks with blur, this checks, make sure not the starting click event
            if (event.button !== 2) {
              _gridMenuElem.style.display = 'none';

              _t.util.getElementScope(_gridMenuCommandElem).$broadcast('awPopupWidget.close', {
                popupUpLevelElement: _gridMenuCommandElem
              }); // Remove pointer from tableMenuElem


              _gridMenuElem.classList.remove(_t.const.CLASS_TABLE_MENU_POINTER); // De-Register onBlur Handler


              document.removeEventListener('click', blurHandler, true);

              _trv.getScrollCanvasElementFromTable().removeEventListener('scroll', blurHandler); // Set timestamp for reference to this event


              gridMenuEventTimeStamp = event.timeStamp;
            }
          }; // Register onBlur Handler


          document.addEventListener('click', blurHandler, true);

          _trv.getScrollCanvasElementFromTable().addEventListener('scroll', blurHandler); // Display table Menu


          if (_gridMenuElem.childElementCount > 0) {
            _gridMenuElem.style.removeProperty('display');
          }
        }
      };

      var settingsCommandElement = _table.getElementsByClassName('aw-splm-table-menu-button')[0];

      settingsCommandElement.addEventListener('click', loadGridMenu);
    };

    self.addGridMenu = function (awIconService) {
      var html = '' + '<div class="aw-commands-svg">' + '<button type="button" class="aw-commands-commandIconButton icon-override">' + awIconService.getIconDef('cmdSettings') + '</button>' + '</div>';

      var menu = _t.util.createElement('div', 'aw-splm-table-menu-button');

      menu.innerHTML = html;

      _table.insertBefore(menu, _table.children[0]);

      loadGridMenuItems();
    };

    self.addGridMenu = function (awIconService, appCtxService, commandPanelService, columnFilterService) {
      var html = '' + '<div class="aw-commands-svg">' + '<button type="button" class="aw-commands-commandIconButton icon-override">' + awIconService.getIconDef('cmdSettings') + '</button>' + '</div>';

      var menu = _t.util.createElement('div', 'aw-splm-table-menu-button');

      menu.innerHTML = html;

      _table.insertBefore(menu, _table.children[0]);

      loadGridMenuItems(appCtxService, commandPanelService, columnFilterService);
    }; // ////////////////////////////////////////////////
    // Context Menu
    // ////////////////////////////////////////////////


    var createContextMenu = function createContextMenu() {
      var html = '<aw-popup-command-bar anchor="{{contextAnchor}}" own-popup="true" close-on-click="true" ></aw-popup-command-bar>';
      var cellScope = {};
      cellScope.contextAnchor = _dataProvider.json.contextMenuCommandsAnchor ? _dataProvider.json.contextMenuCommandsAnchor : 'aw_contextMenu2';
      return _t.util.createNgElement(html, _directiveElement, cellScope);
    };

    var _handleContextMenuSingleSelect = function _handleContextMenuSingleSelect(rowVmoArray, selectionModel, event, dataProvider) {
      var currentMode = selectionModel.mode;
      selectionModel.setMode('single');

      _selectionHelper.handleSelectionEvent(rowVmoArray, selectionModel, event, dataProvider);

      selectionModel.setMode(currentMode);
    };

    self.addContextMenu = function (selectionHelper) {
      _selectionHelper = selectionHelper;
      _contextMenuElem = createContextMenu();

      _table.appendChild(_contextMenuElem);

      _table.insertBefore(_contextMenuElem, _table.children[0]);
    };

    self.contextSelectionHandler = function (event) {
      if (event.target.tagName.toLowerCase() === 'a' && event.target.href !== '') {
        return;
      }

      if (_gridOptions.showContextMenu !== true) {
        return;
      }

      event.preventDefault();
      event.cancelBubble = true;

      _t.util.getElementScope(_contextMenuElem).$broadcast('awPopupWidget.open', {
        popupUpLevelElement: _contextMenuElem
      }, _table, event, 'contextMenu'); // Close menu on scroll


      var blurHandler = function blurHandler(event) {
        _t.util.getElementScope(_contextMenuElem).$broadcast('awPopupWidget.close', {
          popupUpLevelElement: _contextMenuElem
        });

        document.removeEventListener('scroll', blurHandler, true);
      };

      document.addEventListener('scroll', blurHandler, true);
      var rowElement = event.currentTarget;
      /* if (right or left) click inside row we already have selected, we dont want to do another SOA call since commands already loaded,
      just move panel with to mouse location */

      if (rowElement.classList.contains('aw-state-selected') || rowElement.classList.contains('ui-grid-row-selected')) {
        return;
      }

      while (_table.getElementsByClassName('aw-state-selected').length > 0) {
        _table.getElementsByClassName('aw-state-selected')[0].classList.remove('aw-state-selected');

        _table.getElementsByClassName('ui-grid-row-selected')[0].classList.remove('ui-grid-row-selected');
      }

      var selectionModel = _dataProvider.selectionModel;

      _handleContextMenuSingleSelect([rowElement.vmo], selectionModel, event);
    };
    /**
     *
     * @param {AwColumnInfo} columnDef - The column Def
     * @param {String} tgtDir - Target Direction for sort
     * @param {appCtxService} appCtxService - The appCtxService
     */


    var columnSortChanged = function columnSortChanged(columnDef, tgtDir, appCtxService) {
      var tableCtrl = _t.util.getTableController(_table);

      if (_t.util.isEditing(_table)) {
        return;
      }

      var newColumnIdx = columnDef.index;
      var oldColumnIdx = -1;
      var columnField = columnDef.field;
      var targetDirection = tgtDir;

      if (_columnProvider.sortCriteria) {
        if (_columnProvider.sortCriteria.length > 0) {
          var oldSortCriteria = _columnProvider.sortCriteria[0];
          oldColumnIdx = tableCtrl.getIdxFromColumnName(oldSortCriteria.fieldName);

          if (oldColumnIdx === newColumnIdx && oldSortCriteria.fieldName === columnField && oldSortCriteria.sortDirection.toUpperCase() === tgtDir.toUpperCase()) {
            return;
          }
        }
      }

      if (!_columnProvider.sortCriteria) {
        _columnProvider.sortCriteria = [];
      } else {
        _columnProvider.sortCriteria.pop();
      }

      if (targetDirection !== '') {
        _columnProvider.sortCriteria.push({
          fieldName: columnField,
          sortDirection: targetDirection
        });
      } // Sets sort criteria on declColumnProviderJSON


      _columnProvider.setSortCriteria(_columnProvider.sortCriteria); // Update sort criteria in sublocation context


      var sublocationCtx = appCtxService.getCtx('sublocation');

      if (sublocationCtx) {
        // LCS-137109 - Sorting new AW table elements by column not working
        // Copy columnProvider.sortCriteria instead of using reference
        appCtxService.updatePartialCtx(sublocationCtx.clientScopeURI + '.sortCriteria', _.clone(_columnProvider.sortCriteria));
        appCtxService.ctx.sublocation.sortCriteria = _columnProvider.sortCriteria;
      }

      tableCtrl.setHeaderCellSortDirection(oldColumnIdx, newColumnIdx, targetDirection);

      if (_columnProvider.sortCallback) {
        _columnProvider.sortCallback();
      }
    };

    var getLargestFrozenColumnIndex = function getLargestFrozenColumnIndex(columns) {
      var largestFrozenIndex = 0;

      for (var i = 0; i < columns.length; i++) {
        // Check if frozen and for index of frozen column
        if (columns[i].index > largestFrozenIndex && columns[i].pinnedLeft) {
          largestFrozenIndex = columns[i].index;
        }
      }

      return largestFrozenIndex;
    };

    self.loadDefaultColumnMenus = function (appCtxService) {
      // Make default frozen column the highest index that is pinnedLeft from column config
      // Or default to 0/1 depending on icon column
      var columns = _dataProvider.cols;
      var largestFrozenIndex = getLargestFrozenColumnIndex(columns); // Set default frozen index to 1 or 0 based on if icon column is present

      var defaultFrozenIndex = _gridOptions.addIconColumn ? 1 : 0; // Use pinnedLeft if provided

      if (largestFrozenIndex > 0) {
        defaultFrozenIndex = largestFrozenIndex;
      } // Check if pinning is enabled


      var pinningEnabled;

      if (_gridOptions.enablePinning !== undefined) {
        pinningEnabled = _gridOptions.enablePinning;
      } else {
        pinningEnabled = true;
      } // Check if sorting is enabled overall


      var enableSorting;

      if (_gridOptions.enableSorting !== undefined) {
        enableSorting = _gridOptions.enableSorting;
      } else {
        enableSorting = true;
      }

      _.forEach(columns, function (column) {
        // Sort Menus
        var _sortAscMenu = {
          title: _splmTableMessages.sortAscending,
          action: function action() {
            columnSortChanged(column, 'ASC', appCtxService);
          },
          shown: function shown() {
            return enableSorting && column.enableSorting && !_t.util.isEditing(_table);
          },
          icon: _t.const.CLASS_ICON_SORT_ASC,
          selectionCheck: function selectionCheck(colInfo) {
            var criteria = _t.util.getSortCriteria(colInfo, _columnProvider);

            if (!_.isEmpty(criteria)) {
              return criteria.sortDirection === 'ASC';
            }

            return false;
          }
        };
        var _sortDescMenu = {
          title: _splmTableMessages.sortDescending,
          action: function action() {
            columnSortChanged(column, 'DESC', appCtxService);
          },
          shown: function shown() {
            return enableSorting && column.enableSorting && !_t.util.isEditing(_table);
          },
          icon: _t.const.CLASS_ICON_SORT_DESC,
          selectionCheck: function selectionCheck(colInfo) {
            var criteria = _t.util.getSortCriteria(colInfo, _columnProvider);

            if (!_.isEmpty(criteria)) {
              return criteria.sortDirection === 'DESC';
            }

            return false;
          }
        };
        var _removeSortMenu = {
          title: _splmTableMessages.removeSort,
          action: function action() {
            columnSortChanged(column, '', appCtxService);
          },
          shown: function shown() {
            return enableSorting && column.enableSorting && !_t.util.isEditing(_table);
          },
          icon: _t.const.CLASS_ICON_SORTABLE,
          selectionCheck: function selectionCheck(colInfo) {
            var criteria = _t.util.getSortCriteria(colInfo, _columnProvider);

            if (_.isEmpty(criteria)) {
              return true;
            }

            return false;
          }
        }; // Freeze Menus

        var _freezeMenu = {
          title: _splmTableMessages.freezeMenu,
          action: function action() {
            var tableCtrl = _t.util.getTableController(_table);

            tableCtrl.pinToColumn(column.index);
          },
          shown: function shown() {
            var tableCtrl = _t.util.getTableController(_table);

            return pinningEnabled && !(column.index + 1 === tableCtrl.getPinColumnCount());
          },
          icon: _t.const.CLASS_ICON_FREEZE
        }; // unfreeze menu definition - shows as Freeze but selected

        var _unfreezeMenu = {
          title: _splmTableMessages.freezeMenu,
          action: function action() {
            var tableCtrl = _t.util.getTableController(_table);

            tableCtrl.pinToColumn(defaultFrozenIndex);
          },
          shown: function shown() {
            var tableCtrl = _t.util.getTableController(_table);

            return pinningEnabled && column.index !== defaultFrozenIndex && column.index + 1 === tableCtrl.getPinColumnCount();
          },
          icon: _t.const.CLASS_ICON_FREEZE,
          selectionCheck: function selectionCheck() {
            return true;
          }
        };

        if (!column.menuItems) {
          column.menuItems = [];
        }

        column.menuItems.push(_sortAscMenu);
        column.menuItems.push(_sortDescMenu);
        column.menuItems.push(_removeSortMenu);
        column.menuItems.push(_freezeMenu);
        column.menuItems.push(_unfreezeMenu);
      });
    }; // ////////////////////////////////////////////////
    // Column Menu
    // ////////////////////////////////////////////////


    self.ensureColumnMenuDismissed = function () {
      var tableMenuElem = _trv.queryTableMenu(_table.id).getElement();

      if (tableMenuElem.style.display !== 'none') {
        document.dispatchEvent(new MouseEvent('click'));
      }
    };

    self.addColumnMenu = function () {
      var menu = document.createElement('div');
      menu.id = _table.id + '_menu';
      menu.classList.add(_t.const.CLASS_TABLE_MENU);
      menu.classList.add(_t.const.CLASS_TABLE_MENU_POPUP);
      menu.style.display = 'none';
      var menuContainer = document.createElement('div');
      menuContainer.id = _table.id + '_menuContainer';
      menuContainer.classList.add(_t.const.CLASS_TABLE_MENU_CONTAINER); // since this is inserted into the DOM outside of the content area, need to re-apply the content class

      menuContainer.classList.add('afx-content-background');
      menuContainer.appendChild(menu);
      document.body.appendChild(menuContainer);
    };

    self.columnMenuHandler = function (columnElem) {
      var timeStamp = 0;
      var columnDef = columnElem.columnDef;
      return function (event) {
        event.preventDefault();
        var closingAction = false; // Blur handler should set this to the event time. We check
        // this to see if this is same event as blur handler

        if (timeStamp === event.timeStamp) {
          closingAction = true;
        }

        var tableMenuElem = _trv.queryTableMenu(_table.id).getElement();

        if (!closingAction) {
          // Clean up menu
          tableMenuElem.innerHTML = ''; // Add pointer

          tableMenuElem.classList.add(_t.const.CLASS_COLUMN_MENU_POINTER_UP); // Define onBlur Handler

          var blurHandler = function blurHandler(event) {
            event = event || {};

            if (event.button !== 2) {
              // firefox catches contextmenu clicks with blur, this checks
              var targetMenuElement = _t.util.closestElement(event.target, '.aw-splm-table-menu-container, .ui-datepicker');

              var clickingInMenu = targetMenuElement || event.target && event.target.classList && event.target.classList.contains('ui-datepicker'); // If we are clicking in the menu, ignore blurHandler

              if (!clickingInMenu) {
                tableMenuElem.style.display = 'none'; // Remove pointer(s)

                tableMenuElem.classList.remove(_t.const.CLASS_COLUMN_MENU_POINTER_UP);
                tableMenuElem.classList.remove(_t.const.CLASS_COLUMN_MENU_POINTER_DOWN); // De-Register onBlur Handler

                document.removeEventListener('click', blurHandler, true);

                _trv.getScrollCanvasElementFromTable().removeEventListener('scroll', blurHandler);

                eventBus.unsubscribe('pltable.columnFilterApplied', blurHandler);

                if (columnDef.filter && columnDef.filter.view) {
                  eventBus.unsubscribe(columnDef.filter.view + '.contentLoaded');
                } // Set timestamp to this event timestamp so track this event


                timeStamp = event.timeStamp;
              }
            }
          }; // Add menu item


          _.forEach(columnDef.menuItems, function (item) {
            if (item.shown()) {
              var listElem = _t.util.createElement('li', _t.const.CLASS_AW_CELL_LIST_ITEM, _t.const.CLASS_AW_CELL_TOP);

              listElem.onclick = function () {
                item.action();
                blurHandler();
              };

              var iconElem = _t.util.createElement('i', item.icon);

              var textElem = _t.util.createElement('div');

              textElem.textContent = item.title;
              listElem.appendChild(iconElem);
              listElem.appendChild(textElem); // Show as selected

              if (item.selectionCheck && item.selectionCheck(columnDef)) {
                listElem.classList.add(_t.const.CLASS_HEADER_MENU_ITEM_SELECTED);
              }

              tableMenuElem.appendChild(listElem);
            }
          });

          var isFilterViewAdded = false;

          if (columnDef.filter && columnDef.filter.view && columnDef.isFilteringEnabled !== false && _table._tableInstance.gridOptions.isFilteringEnabled) {
            isFilterViewAdded = true;

            if (columnDef.menuItems.length > 0) {
              // Add horizontal bar
              var hr = _t.util.createElement('hr');

              tableMenuElem.appendChild(hr);
            } // COLUMN_FILTER_DEMO: Column Filter Control Container


            var filterBoxItemElem = _t.util.createElement('li', _t.const.CLASS_TABLE_MENU_ITEM, _t.const.CLASS_AW_CELL_TOP);

            filterBoxItemElem.onclick = function (event) {
              // don't call blurHandler
              event.cancelBubble = true;
            }; // compile an aw-include


            var viewStr = '<aw-include class="column-filter" name="' + columnDef.filter.view + '" sub-panel-context="context"/>';
            var filterScope = {
              context: {
                gridId: _table.id,
                column: columnDef
              }
            };

            var filterViewElem = _t.util.createNgElement(viewStr, table, filterScope);

            filterBoxItemElem.appendChild(filterViewElem);
            tableMenuElem.appendChild(filterBoxItemElem);
          }

          tableMenuElem.style.width = String(_t.const.WIDTH_DEFAULT_MENU_WIDTH) + 'px';
          var columnElemBoundingRect = columnElem.getBoundingClientRect();

          var tableCtrl = _t.util.getTableController(_table);

          tableMenuElem.style.left = String(columnElemBoundingRect.left + 0.06 * tableCtrl.getColumnWidth(columnDef.index)) + 'px';
          tableMenuElem.style.top = String(columnElemBoundingRect.top + _t.const.HEIGHT_HEADER + _t.const.COLUMN_MENU_POINTER_HEIGHT) + 'px'; // Register onBlur Handler

          document.addEventListener('click', blurHandler, true);

          _trv.getScrollCanvasElementFromTable().addEventListener('scroll', blurHandler);

          eventBus.subscribe('pltable.columnFilterApplied', blurHandler);

          var checkMenuPositioning = function checkMenuPositioning() {
            var menuBoundingRect = tableMenuElem.getBoundingClientRect();
            var maxYNeeded = menuBoundingRect.top + menuBoundingRect.height;

            if (maxYNeeded >= window.innerHeight) {
              // Column Menu would go outside screen, position upwards
              var newTop = String(columnElemBoundingRect.top - menuBoundingRect.height - _t.const.COLUMN_MENU_POINTER_HEIGHT) + 'px';
              tableMenuElem.style.top = newTop; // Remove the up pointer and add the down pointer

              tableMenuElem.classList.remove(_t.const.CLASS_COLUMN_MENU_POINTER_UP);
              tableMenuElem.classList.add(_t.const.CLASS_COLUMN_MENU_POINTER_DOWN);
            }
          }; // Display table Menu


          if (tableMenuElem.childElementCount > 0) {
            tableMenuElem.style.removeProperty('display'); // Check if table goes outside of screen

            if (isFilterViewAdded) {
              eventBus.subscribe(columnDef.filter.view + '.contentLoaded', function () {
                _$timeout(function () {
                  checkMenuPositioning();
                });
              });
            } else {
              checkMenuPositioning();
            }
          }
        }
      };
    };

    return self;
  };

  _t.MenuService = SPLMTableMenuService;
  return _t;
});