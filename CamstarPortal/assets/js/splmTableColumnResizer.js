"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for simpletabe as Column Resizer, all column resize logic are here for now
 *
 * @module js/splmTableColumnResizer
 *
 */
define(['lodash', 'js/eventBus', 'js/splmTableConstants', 'js/splmTableDragHandler' //
], function (_, eventBus, _t, splmTableDragHandler) {
  'use strict'; // Write it here for reuse purporse

  var exports = {};
  /**
   * @memberOf js/splmTableColumnResizer
   *
   * apply column resize logic to splitter
   * @param {Object} tableCtrl - PL Table Controller
   * @param {DOMElement} elem - Column header splitter element
   */

  exports.applyColumnResizeHandler = function (tableCtrl, elem, menuService) {
    var _startPageX = -1;

    var _gripPosX = -1;

    var _deltaWidth = -1;

    var columDef = elem.parentElement.children[1].columnDef;
    var _columnIdx = columDef.index;
    splmTableDragHandler.enableDragging(elem);
    elem.addEventListener(_t.const.EVENT_ON_ELEM_DRAG_START, function (customEvent) {
      var e = customEvent.detail;
      _startPageX = e.pageX;
      _deltaWidth = 0; // Clean up menu if exist

      menuService.ensureColumnMenuDismissed(); // Scroll left adjustment is not needed if the column is pinned

      var scrollLeft = columDef.pinnedLeft === true ? tableCtrl.getPinCanvasScrollLeftPosition() : tableCtrl.getScrollCanvasScrollLeftPosition();
      _gripPosX = tableCtrl.getTotalColumnWidth(_columnIdx) - (_t.const.WIDTH_COLUMN_SPLITTER - e.offsetX) + scrollLeft;
      tableCtrl.showColumnGrip(_gripPosX);
    });
    elem.addEventListener(_t.const.EVENT_ON_ELEM_DRAG, function (customEvent) {
      var e = customEvent.detail;
      var deltaWidth = e.pageX - _startPageX;

      if (tableCtrl.isColumnWidthChangeValid(_columnIdx, deltaWidth)) {
        _deltaWidth = deltaWidth;
        tableCtrl.setColumnGripPosition(_gripPosX + _deltaWidth);
      }
    });
    elem.addEventListener(_t.const.EVENT_ON_ELEM_DRAG_END, function () {
      tableCtrl.hideColumnGrip();
      tableCtrl.updateColumnWidth(_columnIdx, _deltaWidth);
    });
    elem.addEventListener('dblclick', function () {
      tableCtrl.fitColumnWidth(_columnIdx);
    });
  };

  return exports;
});