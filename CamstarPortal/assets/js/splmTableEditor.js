"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module defines the edit function for PL Table.
 *
 * @module js/splmTableEditor
 */
define(['lodash', 'js/splmTableTraversal', 'js/splmTableFillDown', 'js/eventBus', 'js/logger' //
], function (_, _t, SPLMTableFillDown, eventBus, logger) {
  'use strict';

  var SPLMTableEditor = function SPLMTableEditor(tableElem, directiveElem) {
    var _trv = new _t.Trv(tableElem);

    var _ctx = _t.util.getCtxObject(directiveElem);

    var _fillDown = new SPLMTableFillDown(tableElem);

    var editCellElement = null;
    var _lovValueChangedEventSubs = {};
    var self = this; // eslint-disable-line no-invalid-this

    var destroyLovEventListeners = function destroyLovEventListeners() {
      _.forEach(_lovValueChangedEventSubs, function (subscription) {
        eventBus.unsubscribe(subscription);
      });

      _lovValueChangedEventSubs = {};
    };

    self.updateEditStatus = function () {
      var cellElems = _trv.getContentCellElementsFromTable();

      _.forEach(cellElems, function (elem) {
        self.updateEditStatusForCell(elem);
      });

      if (!_t.util.isEditing(tableElem)) {
        destroyLovEventListeners();
      }
    };

    var toggleLinkStyle = function toggleLinkStyle(element, isLinkStyle) {
      if (isLinkStyle) {
        // disabled to active link
        var linkElements = element.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED);

        for (var i = linkElements.length; i > 0; i--) {
          var linkElem = linkElements[i - 1];

          if (linkElem && linkElem.classList) {
            linkElem.classList.add(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS);
            linkElem.classList.remove(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED);
          }
        }
      } else {
        // active to disabled links
        linkElements = element.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS);

        for (var j = linkElements.length; j > 0; j--) {
          var linkElem1 = linkElements[j - 1];

          if (linkElem1 && linkElem1.classList) {
            linkElem1.classList.add(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED);
            linkElem1.classList.remove(_t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS);
          }
        }
      }
    };

    var updateCellChangedClass = function updateCellChangedClass(prop, element) {
      if (element) {
        if (prop.valueUpdated === true || prop.dirty === true && prop.type === 'OBJECT') {
          prop.dirty = true;
          element.classList.add(_t.const.CLASS_CELL_CHANGED);
        } else {
          prop.dirty = false;
          element.classList.remove(_t.const.CLASS_CELL_CHANGED);
        }
      }
    };
    /**
     * Ensure the drag handle is the last element in the parent container.
     *
     * @param {DOMElement} cell - cell with drag handle to re-append
     */


    var ensureDragHandleLastChild = function ensureDragHandleLastChild(cell) {
      var dragHandleElements = cell.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_CELL_DRAG_HANDLE);

      if (dragHandleElements.length > 0) {
        dragHandleElements[0].parentElement.appendChild(dragHandleElements[0]);
      }
    };

    var reverseEditCell = function reverseEditCell(cell, vmo, column) {
      if (cell.parentElement === null) {
        return;
      }

      cell.tabIndex = parseInt(cell.parentElement.getAttribute('data-indexNumber')) + 1;
      var editCells = cell.getElementsByClassName(_t.const.CLASS_TABLE_EDIT_CELL_TOP);
      var isErrorProperty = false;

      var cellTopElement = _t.Cell.createElement(column, vmo, tableElem, cell.parentElement);

      if (editCells.length > 0) {
        var editCell = editCells[0];
        editCell.parentElement.removeChild(editCell);
        setTimeout(function () {
          var propertyErrorElements = editCell.getElementsByClassName('aw-widgets-propertyError');

          if (propertyErrorElements.length > 0) {
            isErrorProperty = true;
          }

          if (isErrorProperty) {
            cellTopElement.classList.add('aw-widgets-propertyError');
          }

          _t.util.destroyNgElement(editCell);
        }, 1000);
      }

      cell.classList.remove(_t.const.CLASS_AW_IS_EDITING);
      cell.appendChild(cellTopElement);
      var cellTopElements = cell.getElementsByClassName(_t.const.CLASS_TABLE_CELL_TOP);

      if (cellTopElements.length > 0) {
        cellTopElements[0].classList.add(_t.const.CLASS_AW_EDITABLE_CELL);
      }

      ensureDragHandleLastChild(cell);
    };

    var addEditStatus = function addEditStatus(cellElem, cellElemProperty, vmo) {
      if (cellElem.children[0]) {
        cellElem.children[0].classList.add(_t.const.CLASS_AW_EDITABLE_CELL);

        var tableInstance = _t.util.getTableInstance(tableElem);

        var rowHeight = _t.util.getTableRowHeight(tableInstance.gridOptions, undefined);

        if (rowHeight !== undefined) {
          cellElem.children[0].style.height = rowHeight + 'px';
        }
      } else {
        logger.debug(cellElem.propName + ' has no child');
      }

      cellElem.tabIndex = parseInt(cellElem.parentElement.getAttribute('data-indexNumber')) + 1;

      cellElem.onclick = function (event) {
        if (cellElemProperty.isEditing !== true) {
          cellElem.classList.add(_t.const.CLASS_AW_IS_EDITING);
          self.editCell(event, vmo, cellElem.columnDef, cellElemProperty);
        }
      };

      cellElem.onfocus = function (event) {
        var eventData = {
          columnInfo: cellElem.columnDef,
          gridId: tableElem.id,
          vmo: vmo
        };
        eventBus.publish(tableElem.id + '.cellStartEdit', eventData); // REFACTOR: Use startEdit instead of calling click event

        cellElem.click();
      };

      if (!cellElemProperty.isArray) {
        _fillDown.enableFillDown(cellElem);
      }

      toggleLinkStyle(cellElem, false); // for saved cells in partial edit status

      var cellTop = cellElem.getElementsByClassName(_t.const.CLASS_TABLE_CELL_TOP)[0] || cellElem.getElementsByClassName(_t.const.CLASS_TABLE_EDIT_CELL_TOP)[0];
      updateCellChangedClass(cellElemProperty, cellTop);
    };

    var removeEditStatus = function removeEditStatus(cellElem, cellElemProperty, vmo) {
      if (cellElem.getElementsByClassName(_t.const.CLASS_TABLE_EDIT_CELL_TOP)[0]) {
        _trv.getRootElement().click();
      }

      var cellTopElem = cellElem.getElementsByClassName(_t.const.CLASS_TABLE_CELL_TOP);

      if (cellTopElem.length > 0 && cellTopElem[0].classList.contains(_t.const.CLASS_AW_EDITABLE_CELL)) {
        if (!cellElemProperty.isArray) {
          _fillDown.disableFillDown(cellElem);
        }

        cellElem.removeChild(cellTopElem[0]);
        reverseEditCell(cellElem, vmo, cellElem.columnDef);
        cellElem.children[0].classList.remove(_t.const.CLASS_AW_EDITABLE_CELL);
        cellElem.onclick = null;
      }

      cellElem.removeAttribute('tabIndex');
      toggleLinkStyle(cellElem, true);
    };

    self.updateEditStatusForCell = function (cellElem) {
      var cellElemProperty = cellElem.prop;

      var vmo = _t.util.getViewModelObjectByCellElement(cellElem);

      if (cellElem.propName && cellElemProperty && cellElem.columnDef.isTreeNavigation !== true) {
        // LCS-142669 - read modifiable besides of isEditable
        if (cellElemProperty.isEditable && cellElem.columnDef.modifiable !== false) {
          addEditStatus(cellElem, cellElemProperty, vmo);
        } else {
          removeEditStatus(cellElem, cellElemProperty, vmo);
        }
      }
    };
    /**
     * Subscribe to lovValueChangedEvent. Update dependent cells
     */


    var subscribeToLovValueChangedEvent = function subscribeToLovValueChangedEvent(cell, vmo, prop) {
      return eventBus.subscribe(prop.propertyName + '.lovValueChanged', function () {
        // Update dependent LOVS only
        if (!prop.lovApi || !prop.lovApi.result || prop.lovApi.result.behaviorData.style !== 'Interdependent') {
          return;
        }

        prop.lovApi.result.behaviorData.dependendProps.forEach(function (propertyName) {
          // Only update cells for other props
          if (prop.propertyName !== propertyName) {
            var row = cell.parentElement; // Find the cell

            _.forEach(row.children, function (cellElem) {
              if (cellElem.propName === propertyName) {
                // Update cell content
                var oldCellTop = cellElem.children[0];

                var newCellTop = _t.Cell.createElement(cellElem.columnDef, row.vmo, tableElem, row);

                newCellTop.classList.add(_t.const.CLASS_AW_EDITABLE_CELL);
                cellElem.replaceChild(newCellTop, oldCellTop);
                return false;
              }

              return true;
            });
          }
        });
      });
    };

    self.editCell = function (event, vmo, column, prop) {
      if (!_t.util.isEditing(tableElem)) {
        return;
      }

      var cell = event.currentTarget;
      editCellElement = cell;
      prop.tabIndex = parseInt(editCellElement.parentElement.getAttribute('data-indexNumber')) + 1;
      editCellElement.removeAttribute('tabIndex');
      var lovValueChangedEventSub = subscribeToLovValueChangedEvent(cell, vmo, prop);
      var oldLovSubscr = _lovValueChangedEventSubs[prop.parentUid + prop.propertyName];

      if (oldLovSubscr) {
        eventBus.unsubscribe(oldLovSubscr);
        delete _lovValueChangedEventSubs[prop.parentUid + prop.propertyName];
      }

      _lovValueChangedEventSubs[prop.parentUid + prop.propertyName] = lovValueChangedEventSub;
      var editableGridCells = cell.getElementsByClassName(_t.const.CLASS_TABLE_CELL_TOP);

      if (editableGridCells.length > 0) {
        cell.removeChild(editableGridCells[0]);
      }

      var editNonArrayClass = prop.isArray ? '' : ' ' + _t.const.CLASS_TABLE_EDIT_CELL_NON_ARRAY;
      var html = '<div class="aw-splm-table-edit-cellTop' + editNonArrayClass + '"><div class="aw-jswidgets-tableEditContainer aw-jswidgets-cellTop">' + '<aw-property-val prop="prop" hint="hint" in-table-cell="true"/></div></div>';
      var originAutoFocus = prop.autofocus;
      prop.autofocus = true;
      prop.isEditing = true;
      var cellScope = {
        prop: prop,
        hint: column.renderingHint
      };

      var compiledElem = _t.util.createNgElement(html, cell, cellScope);

      updateCellChangedClass(prop, compiledElem.getElementsByClassName(_t.const.CLASS_AW_JS_CELL_TOP)[0]);
      cell.insertBefore(compiledElem, cell.childNodes[0]);
      cell.removeAttribute('onclick');
      cell.onclick = null;
      var isCellInEdit = true;

      cell.onclick = function () {
        isCellInEdit = true;
      };

      var blurHandler = function blurHandler() {
        if (!isCellInEdit) {
          if (_ctx.panelContext && _ctx.panelContext.addTypeRef === true) {
            // If clicking on different cell close the panel else leave it open
            if (editCellElement.propName !== prop.propertyName || editCellElement.parentElement.vmo.uid !== prop.parentUid) {
              eventBus.publish('completed', {
                source: 'toolAndInfoPanel'
              });
            } else {
              return;
            }
          }

          _trv.getRootElement().removeEventListener('click', blurHandler);

          cell.onclick = function (event) {
            cell.classList.add(_t.const.CLASS_AW_IS_EDITING);
            self.editCell(event, vmo, column, prop);
          };

          if (editCellElement === cell) {
            editCellElement = null;
          }

          reverseEditCell(cell, vmo, column);
          prop.autofocus = originAutoFocus;
          prop.isEditing = false;
        } else {
          updateCellChangedClass(prop, compiledElem.getElementsByClassName(_t.const.CLASS_AW_JS_CELL_TOP)[0]);
        }

        isCellInEdit = false;
      };

      _trv.getRootElement().addEventListener('click', blurHandler);
    };
  };

  return SPLMTableEditor;
});