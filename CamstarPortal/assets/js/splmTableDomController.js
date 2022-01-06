"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for simpletabe as Dom Controller, play table row/cell instead of DOM Structure
 *
 * @module js/splmTableDomController
 *
 * DOM Structure
 * <aw-splm-table>
 *   CLASS_TABLE|aw-splm-table
 *     CLASS_TABLE_CONTAINER|aw-splm-table-container
 *       CLASS_COLUMN_RESIZE_GRIP|aw-splm-table-column-resize-grip -> grip for resize
 *       CLASS_PIN_CONTAINER|aw-splm-table-pinned-container
 *           CLASS_HEADER_ROW|aw-splm-table-header-row
 *             CLASS_HEADER_CELL|aw-splm-table-header-cell
 *               CLASS_HEADER_CELL_CONTENT|aw-splm-table-header-cell-contents
 *                 CLASS_HEADER_CELL_LABEL|aw-splm-table-header-cell-label
 *                 CLASS_HEADER_CELL_SORT_ICON|aw-splm-table-header-cell-sort-icon
 *                 CLASS_HEADER_CELL_MENU_ICON|aw-splm-table-header-cell-menu-icon
 *               CLASS_HEADER_CELL_SPLITTER|aw-splm-table-header-cell-splitter
 *           CLASS_VIEWPORT|aw-splm-table-viewport
 *             CLASS_ROW|aw-splm-table-row
 *               CLASS_CELL|ui-grid-cell
 *       CLASS_SCROLL_CONTAINER|aw-splm-table-scroll-container
 *           CLASS_HEADER_ROW|ui-grid-header-cell-row
 *             CLASS_HEADER_CELL|aw-splm-table-header-cell
 *               CLASS_HEADER_CELL_CONTENT|aw-splm-table-header-cell-contents
 *                 CLASS_HEADER_CELL_LABEL|aw-splm-table-header-cell-label
 *                 CLASS_HEADER_CELL_SORT_ICON|aw-splm-table-header-cell-sort-icon
 *                 CLASS_HEADER_CELL_MENU_ICON|aw-splm-table-header-cell-menu-icon
 *                 CLASS_HEADER_CELL_SPLITTER|aw-splm-table-header-cell-splitter
 *           CLASS_VIEWPORT|aw-splm-table-viewport
 *             CLASS_ROW|aw-splm-table-row
 *             CLASS_CELL|ui-grid-cell
 *     CLASS_TABLE_MENU_CONTAINER|aw-splm-table-menu-container
 *       CLASS_TABLE_MENU|aw-splm-table-menu
 *
 *
 * CLASS_TABLE_MENU_CONTAINER|aw-splm-table-menu-container
 *   CLASS_TABLE_MENU|aw-splm-table-menu
 *     CLASS_TABLE_MENU_ITEM|aw-splm-table-menu-item
 *
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'js/splmTableTraversal', 'js/splmTableColumnResizer', 'js/splmTableCellRenderer'], function (app, _, eventBus, logger, _t, splmTableColumnResizer, splmTableCellRenderer) {
  'use strict'; // Bootstrap for _t to make coding pattern consistent

  _t.Cell = splmTableCellRenderer;
  /**
   * Instances of this class represent a column resizer for PL Table
   *
   * @class SimpleTableDomController
   * @param {DOMElement} tableElem - HTML DOM Element for table
   * @param {Array} columnDefs - Array of Column Definitions
   */

  var SPLMTableDomController = function SPLMTableDomController(tableElem, columnDefs, tableEditor) {
    // Class definition   //Dummy comment
    var self = this;
    var _table = tableElem;

    var _trv = new _t.Trv(tableElem);

    var _menuService = _t.util.getTableMenuService(tableElem);

    var _columnDefs = columnDefs;
    var _grip = null; // Pin/freeze context

    var _pinColumnCount = 0;
    var _pinContainerWidth = 0;
    var _scrollContainerWidth = 0;
    var _scrollColumnsInView = {
      start: null,
      end: null
    }; // ////////////////////////////////////////////////
    // Internal
    // ////////////////////////////////////////////////

    var _getSortClassName = function _getSortClassName(sortType) {
      if (typeof sortType === 'string') {
        sortType = sortType.toUpperCase();

        if (sortType === 'ASC') {
          return _t.const.CLASS_ICON_SORT_ASC;
        } else if (sortType === 'DESC') {
          return _t.const.CLASS_ICON_SORT_DESC;
        } else if (sortType === '') {
          return _t.const.CLASS_ICON_SORTABLE;
        }
      }

      return _t.const.CLASS_ICON_NON_SORTABLE;
    };

    self.setPinContext = function (lastPinIndex) {
      // Get the right most pinnedLeft option then set pinCount
      if (lastPinIndex !== undefined && lastPinIndex !== null) {
        _pinColumnCount = lastPinIndex + 1;
      } else {
        var rightMostPinIdx = -1;

        _.forEach(_columnDefs, function (column, idx) {
          if (column.pinnedLeft === true) {
            rightMostPinIdx = idx;
          }
        }); // _pinColumnCount will be greater than zero if any column is pinned or frozen by the user.
        // We should not reset this value if it is greater than zero.


        if (_pinColumnCount === 0) {
          _pinColumnCount = rightMostPinIdx + 1;
        }
      }

      _pinContainerWidth = 0;
      _scrollContainerWidth = 0;

      for (var i = 0; i < _columnDefs.length; i++) {
        if (i < _pinColumnCount) {
          _columnDefs[i].pinnedLeft = true;
          _columnDefs[i].startPosition = _pinContainerWidth;
          _pinContainerWidth += _columnDefs[i].drawnWidth;
        } else {
          _columnDefs[i].pinnedLeft = false;
          _columnDefs[i].startPosition = _scrollContainerWidth;
          _scrollContainerWidth += _columnDefs[i].drawnWidth;
        }
      }
    };
    /**
     * @memberOf js/splmTableDomController
     *
     * Get pin column count in the table
     *
     * @return {Number} pin column count in the table
     */


    self.getPinColumnCount = function () {
      return _pinColumnCount;
    };
    /**
     * New design decided in 20180724:
     *   1. If width=<number>, we use it.
     *   2. If width = *, we make it as minWidth + 25%* minWidth.
     *   3. If minWidth + 25% > maxWidth, use maxWidth.
     *   4. Don't use ui-grid column splitter design, put the splitter at the right side of the
     *      column. Adapt CSS properly
     *
     * For the issue we faced in real autoWidth design:
     *   1. Horizontal Scroll bar will appear/disappear randomly when sum(cellWidth) == canvasWidth.
     *      - This should be resolved by new design but will rehearsal if it is not.
     *
     *   2. The listener for resize when autoWidth exist.
     *      - This is not needed for new design.
     */


    self.initializeColumnWidths = function () {
      _.forEach(_columnDefs, function (column) {
        var width = 0;

        if (column.name === 'icon') {
          width = _t.util.getTableRowHeight(_table._tableInstance.gridOptions, _t.const.WIDTH_DEFAULT_ICON_COLUMN_WIDTH);

          if (width !== _t.const.WIDTH_DEFAULT_ICON_COLUMN_WIDTH) {
            /** We have some pedding in icon rendering column and to render the complete icon, we need to
             increase width of icon renderer by 8 units **/
            width += 8;
          }
        } else if (column.width > 0) {
          width = column.width;
        } else {
          width = column.minWidth > 0 ? column.minWidth : _t.const.WIDTH_DEFAULT_MINIMUM_WIDTH;
          width = Math.floor(1.25 * width);
          width = column.maxWidth > 0 && column.maxWidth < width ? column.maxWidth : width;
        }

        column.width = width;
        column.drawnWidth = width;
      });
    }; // Scroll content width must be at least 1px to ensure pin/scroll syncing keeps working
    // when there are no columns in either of the containers


    var _setScrollContentMinWidth = function _setScrollContentMinWidth(scrollContentElement, width) {
      var adjustedWidth = width > 0 ? width : 1;
      scrollContentElement.style.minWidth = adjustedWidth + 'px';
    };

    var _setPinHeaderWidth = function _setPinHeaderWidth(width) {
      var headerElem = _trv.getPinHeaderElementFromTable();

      var pinContentElem = _trv.getPinContentElementFromTable();

      headerElem.style.minWidth = String(width) + 'px';

      _setScrollContentMinWidth(pinContentElem, width);
    };

    var _setScrollHeaderWidth = function _setScrollHeaderWidth(width) {
      var headerElem = _trv.getScrollHeaderElementFromTable();

      var scrollContentElem = _trv.getScrollContentElementFromTable();

      headerElem.style.minWidth = String(width) + 'px';
      var scrollContentMinWidth = parseInt(width, 10) - parseInt(scrollContentElem.style.paddingLeft, 10);

      _setScrollContentMinWidth(scrollContentElem, scrollContentMinWidth);
    };

    var _setHeaderColumnWidth = function _setHeaderColumnWidth(columnIdx, width) {
      var headerCellElem = _trv.getHeaderCellElementFromTable(columnIdx); // update current cell width


      headerCellElem.style.width = String(width) + 'px';
    };

    var _setContentRowWidth = function _setContentRowWidth(rowElem, width) {
      rowElem.style.minWidth = String(width) + 'px';
    };

    var _getContentRowCount = function _getContentRowCount() {
      var _length = 0;

      var rows = _trv.getScrollContentRowElementsFromTable();

      if (rows) {
        _length = rows.length;
      }

      return _length;
    };

    var _setContentColumnWidth = function _setContentColumnWidth(columnIdx, width) {
      var rowCnt = _getContentRowCount();

      for (var i = 0; i < rowCnt; i++) {
        var rowCellElem = _trv.getContentCellFromTable(i, columnIdx);

        var prevWidth = self.getColumnWidth(columnIdx);

        if (columnIdx < _pinColumnCount) {
          var pinRowElem = _trv.getPinContentRowElementFromTable(i);

          _setContentRowWidth(pinRowElem, _pinContainerWidth + width - prevWidth);
        } else {
          var scrollRowElem = _trv.getScrollContentRowElementFromTable(i);

          _setContentRowWidth(scrollRowElem, _scrollContainerWidth + width - prevWidth);
        }

        rowCellElem.style.width = String(width) + 'px';
      }
    };
    /**
     * Set the class and title for the filter icon element.
     *
     * @param {HTMLElement} iconElement - Filter icon element
     * @param {Object} filter - filter object from column
     */


    var _applyFilterIcon = function _applyFilterIcon(iconElement, filter) {
      iconElement.classList.add(_t.const.CLASS_HEADER_CELL_FILTER_APPLIED_ICON);
      iconElement.title = filter.summaryText;
    };

    var _createHeaderCellElement = function _createHeaderCellElement(column, width, sortDirection) {
      var columnElem = document.createElement('div');
      columnElem.classList.add(_t.const.CLASS_COLUMN_DEF);
      columnElem.classList.add(_t.const.CLASS_CELL_CONTENTS);
      columnElem.classList.add(_t.const.CLASS_HEADER_CLEARFIX);
      columnElem.classList.add(_t.const.CLASS_HEADER_CELL_CONTENT);
      columnElem.style.width = String(width) + 'px';
      columnElem.columnDef = column;

      if (column.headerTooltip !== false) {
        if (column.headerTooltip === true) {
          columnElem.title = column.displayName;
        } // else logic for headerTooltip String values

      }

      var labelElem = document.createElement('div');
      labelElem.classList.add(_t.const.CLASS_HEADER_CELL_LABEL);
      labelElem.textContent = column.displayName;
      columnElem.appendChild(labelElem);
      var sortElem = document.createElement('i');
      sortElem.classList.add(_t.const.CLASS_HEADER_CELL_SORT_ICON);
      sortElem.classList.add(_getSortClassName(sortDirection));
      sortElem.title = '';
      columnElem.appendChild(sortElem);
      var filterElem = document.createElement('i');
      filterElem.classList.add(_t.const.CLASS_HEADER_CELL_FILTER_ICON);

      if (column.filter && column.filter.isFilterApplied) {
        _applyFilterIcon(filterElem, column.filter);
      } else {
        filterElem.title = '';
      }

      columnElem.appendChild(filterElem);

      if (column.enableColumnMenu === true) {
        columnElem.classList.add(_t.const.CLASS_COLUMN_MENU_ENABLED);
        columnElem.addEventListener('click', _menuService.columnMenuHandler(columnElem));
      } // Without this level, overflow will not happen, the width will stuck in content width


      var columnContainerElem = document.createElement('div');
      columnContainerElem.classList.add(_t.const.CLASS_HEADER_CELL); // Splitter for resize
      // Firefox limitation: element must be appended on left if it has 'float:right'

      var resizeElem = document.createElement('div');
      resizeElem.classList.add(_t.const.CLASS_HEADER_CELL_SPLITTER);

      if (column.enableColumnResizing) {
        columnContainerElem.appendChild(resizeElem);
        columnContainerElem.appendChild(columnElem);
        splmTableColumnResizer.applyColumnResizeHandler(self, resizeElem, _menuService);
      } else {
        columnContainerElem.appendChild(columnElem);
      }

      return columnContainerElem;
    };

    var _insertColumnHeaders = function _insertColumnHeaders(headerElement, startIdx, endIdx) {
      var columnDefs = _columnDefs;
      var totalColumnHeaderWidth = 0;

      for (var idx = startIdx; idx < endIdx; idx++) {
        var column = columnDefs[idx];
        var width = column.drawnWidth;
        var sortDirection = null;

        if (_table._tableInstance.gridOptions.enableSorting !== false && column.enableSorting) {
          if (column.sort && column.sort.direction) {
            sortDirection = column.sort.direction;
          } else {
            sortDirection = '';
          }
        }

        var columnElem = _createHeaderCellElement(column, width, sortDirection);

        column.startPosition = totalColumnHeaderWidth;
        totalColumnHeaderWidth += width;
        headerElement.appendChild(columnElem);
      }

      headerElement.style.minWidth = String(totalColumnHeaderWidth) + 'px';
    };

    var _createGrip = function _createGrip() {
      _grip = document.createElement('div');

      _grip.classList.add(_t.const.CLASS_COLUMN_RESIZE_GRIP);

      _grip.style.position = 'absolute';
      _grip.style.height = '100%'; // Try to make border in the middle

      var subGrip = document.createElement('div');
      subGrip.style.borderLeft = '1px solid';
      subGrip.style.marginLeft = '30px';
      subGrip.style.height = '100%';

      _grip.appendChild(subGrip);

      _grip.style.zIndex = '1000';
      _grip.style.cursor = 'col-resize';
      _grip.style.outline = '20px transparent';
      _grip.style.width = '60px';
      _grip.style.display = 'none';
      return _grip;
    };

    var removeHoverClassFromRows = function removeHoverClassFromRows() {
      var rows = _trv.getTableContainerElementFromTable().getElementsByClassName('ui-grid-row');

      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.remove(_t.const.CLASS_ROW_HOVER);
      }
    };

    var removeHoverClassesRaf = function removeHoverClassesRaf() {
      requestAnimationFrame(function () {
        removeHoverClassFromRows();
      });
    };

    var _constructTableElement = function _constructTableElement() {
      var columnDefs = _columnDefs; // Table Container

      var tableContainer = document.createElement('div');
      tableContainer.classList.add(_t.const.CLASS_TABLE_CONTAINER);

      _table.appendChild(tableContainer);

      self.initializeColumnWidths(); // Do pin initialization after eval column width so we could
      // Dummy Comment
      // collect container size together

      self.setPinContext(); // Create dragging grip.

      tableContainer.appendChild(_createGrip());
      var pinContainer = document.createElement('div');
      pinContainer.classList.add(_t.const.CLASS_PIN_CONTAINER);
      pinContainer.classList.add(_t.const.CLASS_PIN_CONTAINER_LEFT);
      var pinHeaderElem = document.createElement('div');
      pinHeaderElem.classList.add(_t.const.CLASS_HEADER_ROW);

      _insertColumnHeaders(pinHeaderElem, 0, _pinColumnCount);

      pinContainer.appendChild(pinHeaderElem);
      var pinScrollContainer = document.createElement('div');
      pinScrollContainer.classList.add(_t.const.CLASS_CANVAS);
      pinScrollContainer.classList.add(_t.const.CLASS_VIEWPORT);
      var pinScrollContents = document.createElement('div');
      pinScrollContents.addEventListener('mouseleave', function () {
        removeHoverClassesRaf();
      });
      pinScrollContents.classList.add(_t.const.CLASS_SCROLL_CONTENTS);

      _setScrollContentMinWidth(pinScrollContents, parseInt(pinHeaderElem.style.minWidth, 10));

      pinScrollContainer.appendChild(pinScrollContents);
      pinContainer.appendChild(pinScrollContainer);
      tableContainer.appendChild(pinContainer);
      var scrollContainer = document.createElement('div');
      scrollContainer.classList.add(_t.const.CLASS_SCROLL_CONTAINER);
      scrollContainer.style.marginLeft = String(_pinContainerWidth) + 'px'; // Create Columns in memory

      var scrollHeaderElem = document.createElement('div');
      scrollHeaderElem.classList.add(_t.const.CLASS_HEADER_ROW);

      _insertColumnHeaders(scrollHeaderElem, _pinColumnCount, columnDefs.length);

      scrollContainer.appendChild(scrollHeaderElem); // Create row Contents in memory

      var rowsContainer = document.createElement('div');
      rowsContainer.classList.add(_t.const.CLASS_VIEWPORT);
      rowsContainer.classList.add(_t.const.CLASS_CANVAS);
      var scrollContents = document.createElement('div');
      scrollContents.addEventListener('mouseleave', function () {
        removeHoverClassesRaf();
      });
      scrollContents.classList.add(_t.const.CLASS_SCROLL_CONTENTS);

      _setScrollContentMinWidth(scrollContents, parseInt(scrollHeaderElem.style.minWidth, 10));

      rowsContainer.appendChild(scrollContents);
      scrollContainer.appendChild(rowsContainer);
      tableContainer.appendChild(scrollContainer);
    };
    /**
     * @memberOf js/aw-splm-table.directive
     *
     * Creates and returns a DOMElement for the propertyCell of the passed in view model object (vmo) which defines the row
     * and the given column (columnInfo )
     * @param {Object} column - Declarative columnInfo object
     * @param {Object} vmo - Declarative view model object (e.g. row)
     * @param {Number} columnWidth - Width of the iconCellColumn
     * @param {DOMElement} rowElem - row DOMElement
     * @return {Object} The newly created DOMElement for the property cell
     */


    var _createPropertyCell = function _createPropertyCell(column, vmo, columnWidth, rowElem) {
      var cell = _t.util.createElement('div', _t.const.CLASS_CELL);

      cell.appendChild(_t.Cell.createElement(column, vmo, tableElem, rowElem));
      cell.style.width = String(columnWidth) + 'px';

      var ctx = _t.util.getTableInstance(tableElem).ctx;

      var defaultRowHeight = ctx.layout === 'compact' ? _t.const.HEIGHT_COMPACT_ROW : _t.const.HEIGHT_ROW;

      var rowHeight = _t.util.getTableRowHeight(_table._tableInstance.gridOptions, defaultRowHeight);

      cell.style.height = rowHeight + 'px';
      cell.propName = column.field;
      cell.columnDef = column;

      if (vmo.props) {
        cell.prop = vmo.props[column.field];
      }

      if (cell.getElementsByClassName('aw-splm-table-cellTop').length > 0) {
        _t.util.addCSSClassForRowHeight(cell.getElementsByClassName('aw-splm-table-cellTop')[0], _table._tableInstance.gridOptions);
      }

      var idxNum = document.createAttribute('data-indexNumber');
      idxNum.value = column.index;

      if (column.index >= _pinColumnCount) {
        idxNum.value = column.index - _pinColumnCount;
      }

      cell.setAttributeNode(idxNum);
      return cell;
    };
    /**
     * Creates and returns a DOMElement for the TableRow of the passed in view model object (vmo) which defines the row
     * <p>Will Create cells for each column using the vmo properties associated by propertyName.  Also will prepend an
     * iconCell at the beginning of the row.  Appropriate rowSelection callback will be added too.
     */


    var _createContentRowElement = function _createContentRowElement(vmo, rowSelectionHandler, rowHeight, startIdx, endIdx) {
      var columnDefs = _columnDefs;

      var row = _t.util.createElement('div', _t.const.CLASS_ROW, _t.const.CLASS_ROW_ICON);

      var rowWidth = 0;
      row.vmo = vmo;
      row.onclick = rowSelectionHandler;
      row.oncontextmenu = _menuService.contextSelectionHandler;
      row.draggable = true;
      row.addEventListener('mouseenter', function (event) {
        var hoveredRow = event.currentTarget;
        requestAnimationFrame(function () {
          removeHoverClassFromRows();

          var index = _t.util.getIndexInParent(hoveredRow);

          var scrollRow = _trv.getScrollContentRowElementFromTable(index);

          var pinRow = _trv.getPinContentRowElementFromTable(index);

          scrollRow.classList.add(_t.const.CLASS_ROW_HOVER);
          pinRow.classList.add(_t.const.CLASS_ROW_HOVER);
        });
      });

      for (var i = startIdx; i <= endIdx; i++) {
        var column = columnDefs[i];
        var cell = null;
        var _width = column.drawnWidth;
        cell = _createPropertyCell(column, vmo, _width, row);

        if (row.vmo.props && row.vmo.props[column.field]) {
          row.vmo.props[column.field].renderingHint = column.renderingHint;
        }

        rowWidth += _width;
        row.appendChild(cell);
      }

      row.style.minWidth = String(rowWidth) + 'px';
      row.style.minHeight = String(rowHeight) + 'px';
      return row;
    };
    /**
     * Remove the class and title from the filter icon element.
     *
     * @param {HTMLElement} iconElement - Filter icon element
     */


    var _removeFilterIcon = function _removeFilterIcon(iconElement) {
      iconElement.classList.remove(_t.const.CLASS_HEADER_CELL_FILTER_APPLIED_ICON);
      iconElement.title = '';
    };

    self.updateScrollColumnsInView = function (scrollLeft, scrollContainerWidth) {
      var headerCells = _trv.getScrollHeaderElementFromTable().children; // Find start and end visible columns


      var extraColumns = 3;
      var start = null;
      var end = null;
      var totalHeaderCells = headerCells.length; // Return all columns as in view if container width given is null or undefined

      if (scrollContainerWidth === null || scrollContainerWidth === undefined || scrollContainerWidth === 0) {
        _scrollColumnsInView = {
          start: 0,
          end: totalHeaderCells - 1
        };
        return;
      }

      for (var i = 0; i < totalHeaderCells; i++) {
        var column = headerCells[i].getElementsByClassName(_t.const.CLASS_COLUMN_DEF)[0].columnDef;
        var columnStartPosition = column.startPosition;

        if (columnStartPosition <= scrollLeft) {
          start = i;
        }

        if (columnStartPosition <= scrollLeft + scrollContainerWidth) {
          end = i;
        }
      }

      start = start - extraColumns < 0 ? 0 : start - extraColumns;
      end = end + extraColumns > totalHeaderCells - 1 ? totalHeaderCells - 1 : end + extraColumns;
      _scrollColumnsInView = {
        start: start,
        end: end
      };
    };

    self.updateVisibleCells = function (rowParentElem) {
      var startColumnIdx = _scrollColumnsInView.start;
      var endColumnIdx = _scrollColumnsInView.end;
      rowParentElem = rowParentElem.childNodes;

      var headerCells = _trv.getScrollHeaderElementFromTable().children;

      var minWidth = 0;

      for (var i = startColumnIdx; i < headerCells.length; i++) {
        var column = headerCells[i].getElementsByClassName(_t.const.CLASS_COLUMN_DEF)[0].columnDef;

        if (startColumnIdx !== null) {
          minWidth += column.drawnWidth;
        }
      }

      var paddingLeft = null;

      var scrollContentElem = _trv.getScrollContentElementFromTable();

      var scrollHeaderElemMinWidth = _trv.getScrollHeaderElementFromTable().style.minWidth;

      if (startColumnIdx > 0) {
        var paddingLeftColumnDef = headerCells[startColumnIdx - 1].getElementsByClassName(_t.const.CLASS_COLUMN_DEF)[0].columnDef;
        paddingLeft = paddingLeftColumnDef.startPosition + paddingLeftColumnDef.drawnWidth + 'px';
        scrollContentElem.style.paddingLeft = paddingLeft;
        var scrollContentMinWidth = parseInt(scrollHeaderElemMinWidth, 10) - parseInt(paddingLeft, 10);

        _setScrollContentMinWidth(scrollContentElem, scrollContentMinWidth);
      } else {
        paddingLeft = '0px';
        scrollContentElem.style.paddingLeft = paddingLeft;
      } // Update cell visibility


      var scrollRows = rowParentElem;

      for (var j = 0; j < scrollRows.length; j++) {
        var rowCells = scrollRows[j].children;

        if (rowCells.length === 0) {
          continue;
        }

        var row = scrollRows[j];
        row.style.minWidth = minWidth + 'px';
        var currentStartIndex = rowCells[0].columnDef.index;
        var currentEndIndex = rowCells[rowCells.length - 1].columnDef.index;
        var trueStartColumnIndex = startColumnIdx + _pinColumnCount;
        var trueEndColumnIndex = endColumnIdx + _pinColumnCount;

        for (var k = rowCells.length - 1; k >= 0; k--) {
          var cell = rowCells[k];
          var colIndex = cell.columnDef.index; // Remove out of view cells

          if (colIndex < trueStartColumnIndex || colIndex > trueEndColumnIndex) {
            _t.util.destroyChildNgElements(cell);

            cell.parentElement.removeChild(cell);
          }
        }

        for (var l = currentStartIndex - 1; l >= trueStartColumnIndex; l--) {
          var newCellInsertBefore = _createPropertyCell(_columnDefs[l], row.vmo, _columnDefs[l].drawnWidth, row);

          row.insertBefore(newCellInsertBefore, row.children[0]);
          tableEditor.updateEditStatusForCell(newCellInsertBefore);
        }

        for (var m = currentEndIndex + 1; m <= trueEndColumnIndex; m++) {
          var newCellInsertAfter = _createPropertyCell(_columnDefs[m], row.vmo, _columnDefs[m].drawnWidth, row);

          row.appendChild(newCellInsertAfter);
          tableEditor.updateEditStatusForCell(newCellInsertAfter);
        }
      }
    };

    var _removeAllSortDirectionClasses = function _removeAllSortDirectionClasses(sortElement) {
      sortElement.classList.remove(_t.const.CLASS_ICON_SORT_ASC);
      sortElement.classList.remove(_t.const.CLASS_ICON_SORT_DESC);
      sortElement.classList.remove(_t.const.CLASS_ICON_NON_SORTABLE);
      sortElement.classList.remove(_t.const.CLASS_ICON_SORTABLE);
    }; // ////////////////////////////////////////////////
    // Public method
    // ////////////////////////////////////////////////


    self.getColumnMinWidth = function (columnIdx) {
      return _columnDefs[columnIdx].minWidth;
    };

    self.getColumnMaxWidth = function (columnIdx) {
      return _columnDefs[columnIdx].maxWidth;
    };

    self.getColumnWidth = function (columnIdx) {
      return _columnDefs[columnIdx].drawnWidth;
    };

    var updateColumnStartPositions = function updateColumnStartPositions() {
      var pinContainerWidth = 0;
      var scrollContainerWidth = 0;

      for (var i = 0; i < _columnDefs.length; i++) {
        if (i < _pinColumnCount) {
          _columnDefs[i].startPosition = pinContainerWidth;
          pinContainerWidth += _columnDefs[i].drawnWidth;
        } else {
          _columnDefs[i].startPosition = scrollContainerWidth;
          scrollContainerWidth += _columnDefs[i].drawnWidth;
        }
      }
    };
    /**
     * @memberOf js/splmTableDomController
     *
     * This method is used for updating the column width
     * This method is also called from resetColumnDefs with 0,0 arguments which needs to be corrected.
     * @param {Number} columnIdx - column index
     * @param {Number} deltaWidth - delta width
     */


    self.updateColumnWidth = function (columnIdx, deltaWidth) {
      var width = self.getColumnWidth(columnIdx) + deltaWidth;

      _setHeaderColumnWidth(columnIdx, width);

      _setContentColumnWidth(columnIdx, width);

      if (columnIdx < _pinColumnCount) {
        // Set container
        _pinContainerWidth += deltaWidth;

        _setPinHeaderWidth(_pinContainerWidth);

        _trv.getScrollContainerElementFromTable().style.marginLeft = String(_pinContainerWidth) + 'px';
      } else {
        // Set container
        _scrollContainerWidth += deltaWidth;

        _setScrollHeaderWidth(_scrollContainerWidth);
      } // Update columnDef start positions


      if (deltaWidth !== 0) {
        _columnDefs[columnIdx].drawnWidth = width;
        eventBus.publish('plTable.columnsResized_' + _table.id, {
          name: _columnDefs[columnIdx].name,
          delta: deltaWidth
        });
      }

      updateColumnStartPositions();

      var scrollCanvasElement = _trv.getScrollCanvasElementFromTable();

      self.updateScrollColumnsInView(scrollCanvasElement.scrollLeft, scrollCanvasElement.offsetWidth);

      if (deltaWidth !== 0) {
        self.updateVisibleCells(_trv.getScrollContentElementFromTable());
      }
    };
    /**
     * Update the filter icon for the header of the column name given.
     *
     * @param {String} columnName - column name for the header to update
     */


    self.updateFilterIcon = function (columnName) {
      var headerCells = _trv.getHeaderCellElementsFromTable();

      for (var i = 0; i < headerCells.length; i++) {
        var columnDef = headerCells[i].getElementsByClassName(_t.const.CLASS_COLUMN_DEF)[0].columnDef;
        var filterIconElement = headerCells[i].getElementsByClassName(_t.const.CLASS_HEADER_CELL_FILTER_ICON)[0];

        if (columnDef && columnDef.filter && filterIconElement && columnDef.field === columnName) {
          if (columnDef.filter.isFilterApplied) {
            _applyFilterIcon(filterIconElement, columnDef.filter);
          } else {
            _removeFilterIcon(filterIconElement);
          }

          break;
        }
      }
    };
    /**
     * Update the filter icon for all column headers.
     */


    self.updateAllFilterIcons = function () {
      var headerCells = _trv.getHeaderCellElementsFromTable();

      for (var i = 0; i < headerCells.length; i++) {
        var columnDef = headerCells[i].getElementsByClassName(_t.const.CLASS_COLUMN_DEF)[0].columnDef;
        var filterIconElement = headerCells[i].getElementsByClassName(_t.const.CLASS_HEADER_CELL_FILTER_ICON)[0];

        if (columnDef && columnDef.filter && filterIconElement) {
          if (columnDef.filter.isFilterApplied) {
            _applyFilterIcon(filterIconElement, columnDef.filter);
          } else {
            _removeFilterIcon(filterIconElement);
          }
        }
      }
    };
    /**
     * Fit column width with content in canvas
     * NOTE: This mentod will read computed CSS which may cause reflow
     *
     * @param {Number} columnIdx - Last column index.
     *
     */


    self.fitColumnWidth = function (columnIdx) {
      var treeNavigation = _columnDefs[columnIdx].isTreeNavigation;

      var cellElems = _trv.queryRowColumnCellElementsFromTable(columnIdx);

      var maxWidth = 0;

      var headerTextElement = _trv.getHeaderCellElementFromTable(columnIdx).getElementsByClassName(_t.const.CLASS_HEADER_CELL_LABEL)[0];

      maxWidth = _t.util.getElementTextWidth(headerTextElement); // This is the space occupied after the column name which includes column menu, splitter, resizeGrip etc.

      maxWidth += _t.const.WIDTH_MINIMUM_EXTRA_SPACE;
      cellElems.forEach(function (cellElem) {
        var actualWidth; // Tree navigation cell

        if (treeNavigation) {
          // pass entire cellElem into getCellTextWidth because it calculates
          // What the width of an unobstructed element with height and width set to auto will be
          // This will give width of entire cell up until the end of the text for tree nav cells
          actualWidth = _t.util.getElementTextWidth(cellElem);
          maxWidth = actualWidth > maxWidth ? actualWidth : maxWidth;
        } else {
          // cover text and link for now.
          var valueElems = cellElem.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_CELL_TEXT);

          if (valueElems.length === 0) {
            valueElems = cellElem.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS);
          }

          for (var i = 0; i < valueElems.length; i++) {
            actualWidth = _t.util.getElementTextWidth(valueElems[i]);
            maxWidth = actualWidth > maxWidth ? actualWidth : maxWidth;
          }
        }
      });

      if (maxWidth > 0) {
        var currentWidth = self.getColumnWidth(columnIdx);
        var validWidth = self.getValidColumnWidth(columnIdx, maxWidth);

        if (currentWidth !== validWidth) {
          self.updateColumnWidth(columnIdx, validWidth - currentWidth);
        }
      }
    };

    var _updateCellColumnIndexes = function _updateCellColumnIndexes() {
      var cellElements = _trv.getContentCellElementsFromTable();

      for (var i = 0; i < cellElements.length; i++) {
        var cellElement = cellElements[i];
        var column = cellElement.columnDef;
        var idxNum = document.createAttribute('data-indexNumber');
        idxNum.value = column.index;

        if (column.index >= _pinColumnCount) {
          idxNum.value = column.index - _pinColumnCount;
        }

        cellElement.setAttributeNode(idxNum);
        updateColumnStartPositions();
      }
    };

    var _pinHeader = function _pinHeader(columnIdx) {
      // Check existing column index
      var newPinCount = columnIdx + 1;
      var oldPinCount = _pinColumnCount; // Update Existing DOM

      var headerCellElements = _trv.getHeaderCellElementsFromTable();

      var moveFragment = document.createDocumentFragment();
      var deltaWidth = 0;

      if (oldPinCount < newPinCount) {
        // Update Header
        for (var i = oldPinCount; i < newPinCount; i++) {
          moveFragment.appendChild(headerCellElements[oldPinCount]);
          deltaWidth += self.getColumnWidth(i);
        }

        var pinHeaderElem = _trv.queryPinContainerFromTable().toHeader().getElement();

        pinHeaderElem.appendChild(moveFragment);

        _setPinHeaderWidth(_pinContainerWidth + deltaWidth);

        _setScrollHeaderWidth(_scrollContainerWidth - deltaWidth);

        _trv.getScrollContainerElementFromTable().style.marginLeft = String(_pinContainerWidth + deltaWidth) + 'px';
      } else if (oldPinCount > newPinCount) {
        // Update Header
        for (var j = newPinCount; j < oldPinCount; j++) {
          moveFragment.appendChild(headerCellElements[newPinCount]);
          deltaWidth += self.getColumnWidth(j);
        }

        var scrollHeaderElem = _trv.queryScrollContainerFromTable().toHeader().getElement();

        scrollHeaderElem.insertBefore(moveFragment, scrollHeaderElem.childNodes[0]);

        _setPinHeaderWidth(_pinContainerWidth - deltaWidth);

        _setScrollHeaderWidth(_scrollContainerWidth + deltaWidth);

        _trv.getScrollContainerElementFromTable().style.marginLeft = String(_pinContainerWidth - deltaWidth) + 'px';
      }
    };

    var _pinContent = function _pinContent(columnIdx) {
      // Check existing column index
      var newPinCount = columnIdx + 1;
      var oldPinCount = _pinColumnCount; // Update Existing DOM

      var moveFragment = document.createDocumentFragment();

      var pinContentRowElements = _trv.queryPinContainerFromTable().getContentRowElements();

      var scrollContentRowElements = _trv.queryScrollContainerFromTable().getContentRowElements();

      var count = pinContentRowElements.length;
      var deltaWidth = 0;

      if (oldPinCount < newPinCount) {
        for (var i = 0; i < count; i++) {
          deltaWidth = 0;

          for (var j = oldPinCount; j < newPinCount; j++) {
            moveFragment.appendChild(scrollContentRowElements[i].children[0]);
            deltaWidth += self.getColumnWidth(j);
          }

          pinContentRowElements[i].appendChild(moveFragment);

          _setContentRowWidth(pinContentRowElements[i], _pinContainerWidth + deltaWidth);

          _setContentRowWidth(scrollContentRowElements[i], _scrollContainerWidth - deltaWidth);
        }
      } else if (oldPinCount > newPinCount) {
        for (var k = 0; k < count; k++) {
          deltaWidth = 0;

          for (var l = newPinCount; l < oldPinCount; l++) {
            moveFragment.appendChild(pinContentRowElements[k].children[newPinCount]);
            deltaWidth += self.getColumnWidth(l);
          }

          scrollContentRowElements[k].insertBefore(moveFragment, scrollContentRowElements[k].childNodes[0]);

          _setContentRowWidth(pinContentRowElements[k], _pinContainerWidth - deltaWidth);

          _setContentRowWidth(scrollContentRowElements[k], _scrollContainerWidth + deltaWidth);
        }
      }
    };
    /**
     * Pin the table from column 0 to specific column
     *
     * @param {Number} columnIdx - Last column index.
     *
     */


    self.pinToColumn = function (columnIdx) {
      // Bring back all cells that were virtualized before moving cells to proper container
      var scrollCanvasElement = _trv.getScrollCanvasElementFromTable();

      self.updateScrollColumnsInView(scrollCanvasElement.scrollLeft);
      self.updateVisibleCells(_trv.getScrollContentElementFromTable());

      _pinHeader(columnIdx);

      _pinContent(columnIdx);

      self.setPinContext(columnIdx);

      _updateCellColumnIndexes(); // Virtualize cells


      self.updateScrollColumnsInView(scrollCanvasElement.scrollLeft, scrollCanvasElement.offsetWidth);
      self.updateVisibleCells(_trv.getScrollContentElementFromTable());
    };
    /**
     * Finds the current columns that are pinned in the table
     *
     * @returns {Array} all the columns that are pinned
     */


    var _findPinnedColumns = function _findPinnedColumns() {
      var results = [];

      if (_columnDefs && _columnDefs.length) {
        for (var i = 0; i < _columnDefs.length; i++) {
          if (_columnDefs[i].pinnedLeft === true) {
            results.push(_columnDefs[i]);
          }
        }
      }

      return results;
    };
    /**
     * Checks new columns for any previous pinned columns, then returns index of first found.
     *
     * @param {*} newColumns The new columns coming into the table
     * @param {*} pinnedColumns The old pinned columns that were pinned
     * @returns {Number} the first index of an incoming column
     */


    var findPinIndex = function findPinIndex(newColumns, pinnedColumns) {
      var pinIndex;

      if (_.isArray(pinnedColumns) && _.isArray(newColumns)) {
        for (var i = pinnedColumns.length - 1; i >= 0; i--) {
          for (var j = 0; j < newColumns.length; j++) {
            if (pinnedColumns[i].name && (pinnedColumns[i].name === newColumns[j].name || pinnedColumns[i].name === newColumns[j].field)) {
              pinIndex = newColumns[j].index;
              break;
            }
          }

          if (pinIndex) {
            break;
          }
        }
      }

      return pinIndex;
    };

    self.resetColumnDefs = function (columnDefs) {
      var previouslyPinnedColumns = _findPinnedColumns();

      var currentPinIndex = findPinIndex(columnDefs, previouslyPinnedColumns);
      _columnDefs = columnDefs;
      self.initializeColumnWidths();
      self.setPinContext(currentPinIndex);

      var pinContainerElem = _trv.getPinContainerElementFromTable();

      var pinHeaderElem = _trv.getPinHeaderElementFromTable();

      var pinContentElem = _trv.getPinContentElementFromTable();

      pinHeaderElem.innerHTML = '';

      _insertColumnHeaders(pinHeaderElem, 0, _pinColumnCount);

      pinContainerElem.replaceChild(pinHeaderElem, pinContainerElem.children[0]);

      _setScrollContentMinWidth(pinContentElem, parseInt(pinHeaderElem.style.minWidth, 10));

      var scrollContainerElem = _trv.getScrollContainerElementFromTable();

      var scrollHeaderElem = _trv.getScrollHeaderElementFromTable();

      var scrollContentElem = _trv.getScrollContentElementFromTable();

      scrollHeaderElem.innerHTML = '';

      _insertColumnHeaders(scrollHeaderElem, _pinColumnCount, _columnDefs.length);

      var scrollContentMinWidth = parseInt(scrollHeaderElem.style.minWidth, 10) - parseInt(scrollContentElem.style.paddingLeft, 10);

      _setScrollContentMinWidth(scrollContentElem, scrollContentMinWidth);

      if (scrollContainerElem.children.length === 0) {
        scrollContainerElem.appendChild(scrollHeaderElem);
      }

      self.updateColumnWidth(0, 0);
    };

    self.isColumnWidthChangeValid = function (columnIdx, deltaWidth) {
      var targetWidth = self.getColumnWidth(columnIdx) + deltaWidth;
      return self.getValidColumnWidth(columnIdx, targetWidth) === targetWidth;
    };

    self.getValidColumnWidth = function (columnIdx, targetWidth) {
      var maxWidth = self.getColumnMaxWidth(columnIdx);
      var minWidth = self.getColumnMinWidth(columnIdx);
      minWidth = minWidth > _t.const.WIDTH_ALLOWED_MINIMUM_WIDTH ? minWidth : _t.const.WIDTH_ALLOWED_MINIMUM_WIDTH;

      if (minWidth && targetWidth < minWidth) {
        targetWidth = minWidth;
      } else if (maxWidth && targetWidth > maxWidth) {
        targetWidth = maxWidth;
      } else {// Do nothing
      }

      return targetWidth;
    };

    self.isColumnSplitterDraggable = function (columnIdx) {
      return _columnDefs[columnIdx].enableColumnResizing !== false;
    };

    self.getTotalColumnWidth = function (columnIdx) {
      var width = 0;
      var sum = columnIdx + 1;

      for (var i = 0; i < sum; i++) {
        width += self.getColumnWidth(i);
      }

      return width;
    };

    self.getIdxFromColumnName = function (columnField) {
      for (var i = 0; i < _columnDefs.length; i++) {
        if (_columnDefs[i].field === columnField || _columnDefs[i].name === columnField) {
          return i;
        }
      }

      return -1;
    };

    self.setHeaderCellSortDirection = function (oldColumnIdx, newColumnIdx, sortDirection) {
      var sortElem;

      if (oldColumnIdx > -1) {
        sortElem = _trv.getHeaderCellSortIconElementFromTable(oldColumnIdx);

        _removeAllSortDirectionClasses(sortElem);

        sortElem.classList.add(_getSortClassName(''));
      }

      sortElem = _trv.getHeaderCellSortIconElementFromTable(newColumnIdx);

      _removeAllSortDirectionClasses(sortElem);

      sortElem.classList.add(_getSortClassName(sortDirection));
    };

    self.getScrollCanvasScrollLeftPosition = function () {
      return _trv.getScrollCanvasElementFromTable().scrollLeft * -1;
    };

    self.getPinCanvasScrollLeftPosition = function () {
      return _trv.getPinCanvasElementFromTable().scrollLeft * -1;
    };
    /**
     * @memberOf js/aw-splm-table.directive
     *
     * Creates and returns the DOMElement containing all the table row elements.  Uses the Declarative DataProvider
     * as defined by the Gridid on the scope.
     *
     * @param {Object} columnHeadersA - DOMElement containing the columnHeadersA (required for scrolling horizontal synchronization)
     * @return {Object} DOMElement that represents all the current row DOMElements in memory
     */


    var _constructContentElement = function _constructContentElement(vmos, startIndex, rowSelectionHandler, rowHeight, startColumnIdx, endColumnIdx, isPin) {
      var c = document.createDocumentFragment();

      _.forEach(vmos, function rows(vmo, keyIdx) {
        var rowIndex = keyIdx + startIndex;
        var row = null;

        if (isPin === true) {
          row = _createContentRowElement(vmo, rowSelectionHandler, rowHeight, startColumnIdx, endColumnIdx);
        } else {
          if (_scrollColumnsInView.start !== null && _scrollColumnsInView.end !== null) {
            startColumnIdx = _scrollColumnsInView.start + _pinColumnCount;
            endColumnIdx = _scrollColumnsInView.end + _pinColumnCount;
          }

          row = _createContentRowElement(vmo, rowSelectionHandler, rowHeight, startColumnIdx, endColumnIdx);
        }

        var idxNum = document.createAttribute('data-indexNumber');
        idxNum.value = rowIndex;
        row.setAttributeNode(idxNum);
        c.appendChild(row);

        if (isPin !== true && _scrollColumnsInView.start !== null && _scrollColumnsInView.end !== null) {
          self.updateVisibleCells(c);
        }
      });

      return c;
    };

    self.constructContentElement = function (vmos, startIndex, rowSelectionHandler, rowHeight, isPin) {
      if (isPin === true) {
        return _constructContentElement(vmos, startIndex, rowSelectionHandler, rowHeight, 0, _pinColumnCount - 1, isPin);
      }

      return _constructContentElement(vmos, startIndex, rowSelectionHandler, rowHeight, _pinColumnCount, _columnDefs.length - 1, isPin);
    };

    var _removeContentElement = function _removeContentElement(parent, upperCountIdx, lowerCounterIdx) {
      var parentElement = parent.getElement();
      var children = parent.getContentRowElements();
      var uCountIdx = upperCountIdx || children.length - 1;
      var lCountIdx = lowerCounterIdx || 0;

      if (children && children.length > 0) {
        for (; uCountIdx >= lCountIdx; uCountIdx--) {
          // Clean up edit cell scope if needed
          var editCell = children[uCountIdx].getElementsByClassName(_t.const.CLASS_TABLE_EDIT_CELL_TOP)[0];

          if (editCell !== undefined) {
            editCell.parentElement.prop.isEditing = false;
          } // Clean up all angularJS Element


          _t.util.destroyChildNgElements(children[uCountIdx]);

          parentElement.removeChild(children[uCountIdx]);
        }
      }
    };

    self.removeContentElement = function (upperCountIdx, lowerCounterIdx) {
      _removeContentElement(_trv.queryPinContentFromTable(), upperCountIdx, lowerCounterIdx);

      _removeContentElement(_trv.queryScrollContentFromTable(), upperCountIdx, lowerCounterIdx);
    };

    self.clearScrollContents = function () {
      _trv.getScrollContentElementFromTable().innerHTML = '';
    };

    self.setSelectable = function (selectable) {
      if (selectable) {
        _table.classList.add(_t.const.CLASS_SELECTION_ENABLED);
      } else {
        _table.classList.remove(_t.const.CLASS_SELECTION_ENABLED);
      }
    };

    self.setDraggable = function (draggable) {
      var rowElements = _table.getElementsByClassName(_t.const.CLASS_ROW);

      for (var i = 0; i < rowElements.length; i++) {
        rowElements[i].draggable = draggable;
      }
    }; // /////////////////////////////////////////////
    // Column Resize Grip
    // /////////////////////////////////////////////


    self.showColumnGrip = function (posX) {
      self.setColumnGripPosition(posX);

      _grip.style.removeProperty('display');
    };

    self.setColumnGripPosition = function (posX) {
      _grip.style.marginLeft = String(posX - 30
      /* match with width*/
      ) + 'px';
    };

    self.hideColumnGrip = function () {
      _grip.style.display = 'none';
    };

    _constructTableElement();

    self.updateColorIndicatorElements = function (updateVMOs) {
      var pinRows = _trv.getPinContentRowElementsFromTable();

      _.forEach(pinRows, function (pinRow) {
        var rowVmo = pinRow.vmo;

        if (updateVMOs.includes(rowVmo)) {
          var colorIndicatorElement = pinRow.getElementsByClassName(_t.const.CLASS_AW_CELL_COLOR_INDICATOR)[0];

          if (colorIndicatorElement) {
            var newColorIndicatorElement = _t.util.createColorIndicatorElement(rowVmo);

            colorIndicatorElement.parentElement.replaceChild(newColorIndicatorElement, colorIndicatorElement);
          }
        }
      });
    };

    return self;
  }; // set myself to _t


  _t.Ctrl = SPLMTableDomController;
  return _t;
});