"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Constants for plTable
 *
 * @module js/splmTableConstants
 *
 */
define([], function () {
  'use strict';

  var exports = {};
  /** ******************************* CSS CLASS *********************************************/
  // Grid

  exports.CLASS_TABLE = 'aw-splm-table';
  exports.CLASS_TABLE_CONTAINER = 'aw-splm-table-container';
  exports.CLASS_WIDGET_GRID = 'aw-jswidgets-grid';
  exports.CLASS_LAYOUT_COLUMN = 'aw-layout-flexColumn';
  exports.CLASS_WIDGET_TABLE_DROP = 'aw-widgets-droptable';
  exports.CLASS_SELECTION_ENABLED = 'aw-jswidgets-selectionEnabled'; // Container

  exports.CLASS_PIN_CONTAINER = 'aw-splm-table-pinned-container';
  exports.CLASS_PIN_CONTAINER_LEFT = 'aw-splm-table-pinned-container-left';
  exports.CLASS_SCROLL_CONTAINER = 'aw-splm-table-scroll-container'; // Header

  exports.CLASS_HEADER_ROW = 'aw-splm-table-header-row';
  exports.CLASS_COLUMN_DEF = 'aw-splm-table-column-def-anchor';
  exports.CLASS_COLUMN_MENU_POINTER_UP = 'aw-splm-table-column-menu-pointer-up';
  exports.CLASS_COLUMN_MENU_POINTER_DOWN = 'aw-splm-table-column-menu-pointer-down';
  exports.CLASS_COLUMN_MENU_ENABLED = 'aw-splm-table-column-menu-enabled';
  exports.CLASS_HEADER_CELL = 'aw-splm-table-header-cell';
  exports.CLASS_HEADER_CELL_CONTENT = 'aw-splm-table-header-cell-contents';
  exports.CLASS_HEADER_CLEARFIX = 'aw-splm-table-clearfix';
  exports.CLASS_HEADER_CELL_LABEL = 'aw-splm-table-header-cell-label';
  exports.CLASS_HEADER_CELL_SPLITTER = 'aw-splm-table-header-cell-splitter';
  exports.CLASS_HEADER_CELL_SORT_ICON = 'aw-splm-table-header-cell-sort-icon';
  exports.CLASS_HEADER_CELL_FILTER_ICON = 'aw-splm-table-header-cell-filter-icon';
  exports.CLASS_HEADER_CELL_FILTER_APPLIED_ICON = 'aw-splm-table-header-cell-filter-applied-icon';
  exports.CLASS_HEADER_MENU_ITEM_SELECTED = 'aw-splm-table-menu-item-selected'; // Content

  exports.CLASS_CANVAS = 'aw-splm-table-canvas';
  exports.CLASS_VIEWPORT = 'aw-splm-table-viewport';
  exports.CLASS_SCROLL_CONTENTS = 'aw-splm-table-scroll-contents';
  exports.CLASS_TOP_SPACE = 'aw-splm-table-top-space';
  exports.CLASS_CELL_CONTENTS = 'aw-splm-table-cell-contents'; // Row
  // Note: leave this as ui-grid since most of them are defined by us

  exports.CLASS_ROW = 'ui-grid-row';
  exports.CLASS_ROW_ICON = 'aw-row-icon';
  exports.CLASS_ROW_SELECTED = 'ui-grid-row-selected';
  exports.CLASS_ROW_HOVER = 'aw-splm-table-hoverRow';
  exports.CLASS_COLUMN_RESIZE_GRIP = 'aw-splm-table-column-resize-grip';
  exports.CLASS_STATE_SELECTED = 'aw-state-selected';
  exports.CLASS_CELL = 'ui-grid-cell';
  exports.CLASS_CELL_SELECTED = 'ui-grid-cell-selected';
  exports.CLASS_CELL_COMMAND_BAR = 'aw-splm-command-bar-present';
  exports.CLASS_CELL_CHECK_MARK = 'aw-splm-table-check-mark-present';
  exports.CLASS_WIDGET_TABLE_CELL = 'aw-jswidgets-tablecell';
  exports.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS = 'aw-splm-table-propertyValueLinks';
  exports.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED = 'aw-splm-table-propertyValueLinks-disabled';
  exports.CLASS_TABLE_CELL_TOP = 'aw-splm-table-cellTop';
  exports.CLASS_WIDGET_TABLE_NON_EDIT_CONTAINER = 'aw-jswidgets-tableNonEditContainer';
  exports.CLASS_WIDGET_TABLE_CELL_TEXT = 'aw-splm-table-cellText';
  exports.CLASS_WIDGET_TABLE_CELL_DRAG_HANDLE = 'aw-jswidgets-draghandle';
  exports.CLASS_WIDGET_TREE_NODE_TOGGLE_CMD = 'aw-jswidgets-treeExpandCollapseCmd';
  exports.CLASS_TABLE_EDIT_CELL_TOP = 'aw-splm-table-edit-cellTop';
  exports.CLASS_TABLE_EDIT_CELL_NON_ARRAY = 'aw-splm-table-edit-non-array';
  exports.CLASS_TABLE_NON_EDIT_CELL_LIST = 'aw-jswidgets-arrayNonEditValueCellList';
  exports.CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM = 'aw-jswidgets-arrayValueCellListItem';
  exports.CLASS_WIDGET_UI_NON_EDIT_CELL = 'aw-jswidgets-uiNonEditCell';
  exports.CLASS_TREE_ROW_HEADER_BUTTONS = 'ui-grid-tree-base-row-header-buttons';
  exports.CLASS_TREE_BASE_HEADER = 'ui-grid-tree-base-header';
  exports.CLASS_GRID_CELL_COLOR_CONTAINER = 'aw-widgets-gridCellColorContainer';
  exports.CLASS_TREE_COLOR_CONTAINER = 'aw-widgets-treeTableColorContainer';
  exports.CLASS_CELL_INTERACTION = 'aw-widgets-cellInteraction';
  exports.CLASS_GRID_CELL_IMAGE = 'aw-widgets-dataGridCellImage';
  exports.CLASS_AW_TREE_COMMAND_CELL = 'aw-splm-table-tree-command-cell';
  exports.CLASS_NATIVE_CELL_COMMANDS = 'aw-splm-table-gridCellCommands';
  exports.CLASS_COMPILED_ELEMENT = 'aw-splm-table-compiled-element';
  exports.CLASS_LAYOUT_ROW_CONTAINER = 'aw-layout-flexRowContainer';
  exports.CLASS_ICON_BASE = 'aw-base-icon';
  exports.CLASS_ICON_TYPE = 'aw-type-icon';
  exports.CLASS_SPLM_TABLE_ICON = 'aw-splm-table-icon';
  exports.CLASS_SPLM_TABLE_ICON_CONTAINER = 'aw-splm-table-icon-container';
  exports.CLASS_SPLM_TABLE_ICON_CELL = 'aw-splm-table-icon-cell';
  exports.CLASS_ICON_SORT_ASC = 'aw-splm-table-icon-up-dir';
  exports.CLASS_ICON_SORT_DESC = 'aw-splm-table-icon-down-dir';
  exports.CLASS_ICON_NON_SORTABLE = 'aw-splm-table-icon-blank';
  exports.CLASS_ICON_SORTABLE = 'aw-splm-table-icon-sortable';
  exports.COLUMN_ICON = 'icon'; // Menu

  exports.CLASS_TABLE_MENU_CONTAINER = 'aw-splm-table-menu-container';
  exports.CLASS_TABLE_MENU_POPUP = 'aw-splm-table-menu-popup';
  exports.CLASS_TABLE_MENU_ITEM = 'aw-splm-table-menu-item';
  exports.CLASS_TABLE_MENU_INPUT = 'aw-splm-table-menu-input';
  exports.CLASS_TABLE_MENU_POINTER = 'aw-splm-table-menu-pointer';
  exports.CLASS_TABLE_MENU = 'aw-splm-table-menu';
  exports.CLASS_TABLE_MENU_BUTTON = 'aw-splm-table-menu-button';
  exports.CLASS_TABLE_SCROLLED = 'aw-splm-table-scrolled';
  exports.CLASS_AW_POPUP = 'aw-layout-popup';
  exports.CLASS_AW_POPUP_OVERLAY = 'aw-layout-popupOverlay';
  exports.CLASS_AW_CELL_LIST_ITEM = 'aw-widgets-cellListItem';
  exports.CLASS_AW_CELL_TOP = 'aw-widgets-cellTop';
  exports.CLASS_AW_JS_CELL_TOP = 'aw-jswidgets-cellTop';
  exports.CLASS_AW_EDIT_CONTAINER = 'aw-jswidgets-tableEditContainer';
  exports.CLASS_AW_IS_EDITING = 'aw-jswidgets-isEditing';
  exports.CLASS_AW_EDITABLE_CELL = 'aw-jswidgets-editableGridCell';
  exports.CLASS_AW_ROOT_ELEMENT = 'aw-layout-mainView';
  exports.CLASS_AW_CELL_COMMANDS = 'aw-jswidgets-gridCellCommands';
  exports.CLASS_AW_OLD_TEXT = 'aw-jswidgets-oldText';
  exports.CLASS_AW_CHANGED_TEXT = 'aw-jswidgets-change';
  exports.CLASS_AW_DISABLED_MENU_ITEM = 'aw-widgets-disabled-menu-item';
  exports.CLASS_ICON_FREEZE = 'aw-splm-table-icon-freeze'; // Cell Changed

  exports.CLASS_CELL_CHANGED = 'changed'; // Tooltip

  exports.CLASS_AW_TOOLTIP_POPUP = 'aw-propertyrenderjs-tooltipPopup';
  exports.CLASS_TOOLTIP_POPUP = 'aw-splm-table-tooltipPopup'; // Decorators

  exports.CLASS_AW_SHOW_DECORATORS = 'aw-widgets-showDecorators';
  exports.CLASS_AW_CELL_COLOR_INDICATOR = 'aw-widgets-gridCellColorIndicator';
  exports.CLASS_CELL_COLOR_INDICATOR = 'aw-splm-table-cellColorIndicator'; // RTF

  exports.CLASS_TABLE_RTF_CELL_ITEM = 'aw-splm-table-rtf-cell-item';
  /** ******************************* Constant *********************************************/

  exports.WIDTH_COLUMN_SPLITTER = 5;
  exports.WIDTH_MINIMUM_EXTRA_SPACE = 45;
  exports.WIDTH_ALLOWED_MINIMUM_WIDTH = 25;
  exports.WIDTH_DEFAULT_ICON_COLUMN_WIDTH = 40;
  exports.WIDTH_DEFAULT_MINIMUM_WIDTH = 150;
  exports.WIDTH_DEFAULT_MENU_WIDTH = 175; // LCS-138303 - Performance tuning for 14 Objectset Table case - implementation
  // Define header and row height here to save computed CSS reading

  exports.HEIGHT_HEADER = 24;
  exports.HEIGHT_COMPACT_ROW = 24;
  exports.HEIGHT_ROW = 32; // Should be same as .aw-splm-table-column-menu-pointer-down and up before/after

  exports.COLUMN_MENU_POINTER_HEIGHT = 10;
  exports.ELEMENT_STRING_EDIT_BOX = 'textarea';
  exports.ELEMENT_CONTEXT_MENU = 'aw-popup-command-bar';
  exports.ELEMENT_AW_ICON = 'aw-icon';
  exports.ELEMENT_AW_COMMAND = 'aw-command';
  exports.ELEMENT_TABLE = exports.CLASS_TABLE;
  exports.EVENT_ON_ELEM_DRAG_START = 'onElementDragStart';
  exports.EVENT_ON_ELEM_DRAG_END = 'onElementDragEnd';
  exports.EVENT_ON_ELEM_DRAG = 'onElementDrag';
  exports.EVENT_ON_ELEM_CLICK = 'onElementClick';
  exports.EVENT_ON_ELEM_DOUBLE_CLICK = 'onElementDoubleClick';
  return {
    const: exports
  };
});