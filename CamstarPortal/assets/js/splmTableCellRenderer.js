"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module provides cell renderer customization mechanism in PL Table.
 *
 * - Below is the cell renderer pattern:
 *   {
 *       action: function( columnDef, vmo, tableElement ) {
 *           // return DOMStructure
 *       },
 *       condition: function( columnDef, vmo, tableElement ) {
 *           // return true to enable this renderer
 *       }
 *   }
 *
 * - Best practice is to make condition to be unique for your case.
 * - If the requirement is overlapping default behavior, just overlap the condition.
 * - If decoration to cell is needed, just write action, do your work without return
 *   value, but the decoration will only happens before OOTB cell renderer, not after.
 *
 * @module js/splmTableCellRenderer
 *
 */
define([//
'lodash', //
'js/eventBus', //
'js/logger', //
'js/splmTableTraversal'], function (_, eventBus, logger, _t) {
  'use strict';

  var exports = {};
  /**
   * Creates and returns a DOMElement for the propertyCell of the passed in view model object (vmo) which defines the row
   * and the given column (columnInfo )
   * @param {Object} column - Declarative columnInfo object
   * @param {Object} vmo - Declarative view model object (e.g. row)
   * @param {DOMElement} tableElem - Table DOMElement
   * @param {DOMElement} rowElem - Row DOMElement
   * @return {DOMElement} The newly created DOMElement for the property cell content
   */

  exports.createElement = function (column, vmo, tableElem, rowElem) {
    var contentElem = null;

    _.forEach(column.cellRenderers, function (renderer) {
      if (!renderer.processing && renderer.condition(column, vmo, tableElem, rowElem)) {
        // NOTE: When ASync rendering happens, this processing mechanism may have issue.
        // But for now the whole PL Table dosen't support ASync Rendering yet.
        renderer.processing = true;
        contentElem = renderer.action(column, vmo, tableElem, rowElem);
        delete renderer.processing;
      }

      return !contentElem;
    }); // Default cell renderer for PLTable


    if (!contentElem) {
      contentElem = document.createElement('div');
      contentElem.classList.add(_t.const.CLASS_TABLE_CELL_TOP);

      if (vmo.props && vmo.props[column.field] && !vmo.props[column.field].isArray && vmo.props[column.field].uiValue) {
        contentElem.title = vmo.props[column.field].uiValue;
      }

      var gridCellText = document.createElement('span');
      gridCellText.classList.add(_t.const.CLASS_WIDGET_TABLE_CELL_TEXT);
      gridCellText.textContent = vmo.props && vmo.props[column.field] ? vmo.props[column.field].uiValue : '';
      contentElem.appendChild(gridCellText);
    } // isDirty update


    if (contentElem && vmo.props && vmo.props[column.field] && vmo.props[column.field].valueUpdated) {
      contentElem.classList.add(_t.const.CLASS_CELL_CHANGED);
    }

    return contentElem;
  };

  return exports;
});