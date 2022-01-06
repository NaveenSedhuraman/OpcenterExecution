"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for plTable as Fill Down / Copy Down / Drag Down
 *
 * @module js/splmTableFillDown
 *
 * @publishedApolloService
 *
 */
define([//
'lodash', 'js/splmTableUtils', 'js/splmTableFillDownHelper'], function (_, _t, SPLMTableFillDownHelper) {
  'use strict';
  /**
   * Instances of this class represent a fill down helper for PL Table
   *
   * @class SPLMTableFillDown
   * @param {Object} tableElem PL Table DOMElement
   */

  function SPLMTableFillDown(tableElem) {
    var self = this;

    var _helper = new SPLMTableFillDownHelper(tableElem);
    /**
     * Enable FillDown on cell element
     *
     * @param {DOMElement} cellElement - DOMElement for Cell
     *
     */


    self.enableFillDown = function (cellElement) {
      var dragHandleElement = cellElement.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_CELL_DRAG_HANDLE)[0];

      if (!dragHandleElement) {
        dragHandleElement = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_DRAG_HANDLE);
        dragHandleElement.addEventListener('mouseover', _helper.initialize);
        cellElement.appendChild(dragHandleElement);
      }
    };
    /**
     * Disable FillDown on cell element
     *
     * @param {DOMElement} cellElement - DOMElement for Cell
     */


    self.disableFillDown = function (cellElement) {
      var dragHandleElement = cellElement.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_CELL_DRAG_HANDLE)[0];

      if (dragHandleElement) {
        cellElement.removeChild(dragHandleElement);
      }
    };

    return self;
  }

  return SPLMTableFillDown;
});