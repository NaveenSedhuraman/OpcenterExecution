"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module defines the primary classes used to manage the 'aw-table' directive (used by decl grid).
 *
 * DOM Structure:
 * - Cell Command
 *     CLASS_CELL|ui-grid-cell
 *       CLASS_TABLE_CELL_TOP|aw-splm-table-cellTop
 *         ( Content in CLASS_TABLE_CELL_TOP for all case above )
 *         CLASS_AW_CELL_COMMANDS|aw-jswidgets-gridCellCommands --> Custom command cell if exist
 *         CLASS_NATIVE_CELL_COMMANDS|aw-splm-table-gridCellCommands --> OOTB command cell, check mark
 *
 *
 * - Object/Object List:
 *     CLASS_CELL|ui-grid-cell
 *       CLASS_TABLE_NON_EDIT_CELL_LIST|aw-jswidgets-arrayNonEditValueCellList  --> ( <ul>, CLASS_TABLE_CELL_TOP )
 *         CLASS_TOOLTIP_POPUP|aw-splm-table-tooltipPopup
 *         CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM|aw-jswidgets-arrayValueCellListItem --> ( <li> )
 *           CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS|aw-splm-table-propertyValueLinks --> ( <a>, innerHTML from addHighlights )
 *           CLASS_AW_OLD_TEXT|aw-jswidgets-oldText --> ( <div>, innerHTML from addHighlights )
 *
 *
 * - Rich Text/Rich Text List:
 *     CLASS_CELL|ui-grid-cell
 *       CLASS_TABLE_NON_EDIT_CELL_LIST|aw-jswidgets-arrayNonEditValueCellList  --> ( <ul>, CLASS_TABLE_CELL_TOP )
 *         CLASS_TOOLTIP_POPUP|aw-splm-table-tooltipPopup
 *         CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM|aw-jswidgets-arrayValueCellListItem  --> ( <li> )
 *           CLASS_TABLE_RTF_CELL_ITEM|aw-splm-table-rtf-cell-item ( <div>, innerHTML from addHighlights )
 *           CLASS_AW_OLD_TEXT|aw-jswidgets-oldText --> ( <div>, innerHTML from addHighlights )
 *
 *
 * - Changed Text/Text List:
 *     CLASS_CELL|ui-grid-cell
 *       CLASS_TABLE_NON_EDIT_CELL_LIST|aw-jswidgets-arrayNonEditValueCellList  --> ( <ul>, CLASS_TABLE_CELL_TOP )
 *         CLASS_TOOLTIP_POPUP|aw-splm-table-tooltipPopup
 *         CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM|aw-jswidgets-arrayValueCellListItem --> ( <li> )
 *           CLASS_WIDGET_TABLE_CELL_TEXT|aw-splm-table-cellText --> ( <div>, innerHTML from addHighlights )
 *           CLASS_AW_OLD_TEXT|aw-jswidgets-oldText --> ( <div>, innerHTML from addHighlights )
 *
 * - Text:
 *     CLASS_CELL|ui-grid-cell
 *       CLASS_TABLE_CELL_TOP|aw-splm-table-cellTop --> ( <div> )
 *         CLASS_WIDGET_TABLE_CELL_TEXT|aw-splm-table-cellText --> ( <div>, innerHTML from addHighlights )
 *
 *
 * @module js/awSPLMTableCellRendererFactory
 */
define(['app', 'lodash', 'js/splmTableNative', 'js/eventBus', 'js/browserUtils', 'js/configurationService', 'js/declUtils', //
'js/awColumnService', 'js/viewModelObjectService', 'js/declModelRegistryService', 'js/uwPropertyService', 'js/appCtxService', 'js/command.service', 'js/clickableTitleService', 'soa/kernel/clientDataModel', 'js/navigationTokenService'], function (app, _, _t, eventBus, browserUtils, cfgSvc, declUtils) {
  'use strict';

  var exports = {};

  var _sanitizer;

  var _appCtxService;

  var _commandService;

  var _awIconService;

  var _clickableTitleService;

  var _cdm;

  var _propVsRenderingTemplate;

  var _$http = null;
  var _$q = null;
  var _$cacheFactory = null;

  var _navigationTokenService;
  /**
   * Method to render rows
   *
   * @param {Number} startIndex Start render index
   * @param {Number} endIndex End render Index
   */


  function generatePropRendererTemplateMap() {
    _propVsRenderingTemplate = {};

    var _contributedTemplates = cfgSvc.getCfgCached('propertyRendererTemplates');

    _.forEach(_contributedTemplates, function (contributedTemplate) {
      var isDefaultTemplate = false;

      if (_.isEmpty(contributedTemplate.grids)) {
        // default rendering template for property
        isDefaultTemplate = true;
      } // Get ModelTypes for this Indicator Json


      _.forEach(contributedTemplate.columns, function (column) {
        if (!_propVsRenderingTemplate[column]) {
          _.set(_propVsRenderingTemplate, [column], {
            specificRenderingTemplates: [],
            defaultPropRenderingTemplate: {}
          });
        }

        var renderingTemplatesForProp = _propVsRenderingTemplate[column];

        if (isDefaultTemplate) {
          _.set(renderingTemplatesForProp, 'defaultPropRenderingTemplate', contributedTemplate);
        } else {
          renderingTemplatesForProp.specificRenderingTemplates.push(contributedTemplate);
        }
      });
    });
  }

  var applyCommandCellScope = function applyCommandCellScope(cellCmdElem, column, vmo, extraDigest) {
    var scope = _t.util.getElementScope(cellCmdElem);

    scope.anchor = column.commandsAnchor;
    scope.commandContext = {
      vmo: vmo
    };

    if (vmo.props !== undefined) {
      scope.prop = vmo.props[column.field];
    }

    if (extraDigest) {
      scope.$evalAsync();
    }
  };

  var createCompiledCellCommandElement = function createCompiledCellCommandElement(tableElem) {
    var commandBarHtml = '<div class="aw-jswidgets-gridCellCommands aw-widgets-cellInteraction" ng-show="!prop.isEditable||prop.isArray">' + //
    '<div class="aw-layout-flexColumn aw-splm-command-bar-present aw-splm-table-flexRow">' + //
    '<aw-table-command-bar ng-if="anchor" anchor="{{anchor}}" context="commandContext" ' + //
    'class="aw-layout-flexRow"></aw-table-command-bar>' + //
    '</div>' + //
    '</div>';
    var cellScope = {};
    return _t.util.createNgElement(commandBarHtml, tableElem, cellScope);
  };
  /**
   * Creates the Icon cell for tree command cell.
   *
   * @param {DOMElement} tableElem tree table element
   * @param {Object} vmo the vmo for the cell
   *
   * @returns {DOMElement} icon element
   */


  var createIconElement = function createIconElement(tableElem, vmo) {
    var treeCellButtonHeaderCell = _t.util.createElement('div', _t.const.CLASS_TREE_ROW_HEADER_BUTTONS, _t.const.CLASS_TREE_BASE_HEADER);

    if (!vmo.isLeaf) {
      treeCellButtonHeaderCell.classList.add(_t.const.CLASS_WIDGET_TREE_NODE_TOGGLE_CMD);
    }

    var treeIndent = 28;
    treeCellButtonHeaderCell.style.paddingLeft = treeIndent * vmo.levelNdx + 'px';

    var iconContainerElement = _t.util.createElement('aw-icon');

    var iconCellId = vmo.loadingStatus ? 'miscInProcessIndicator' : vmo.isLeaf ? 'typeBlankIcon' : vmo.isExpanded ? 'miscExpandedTree' : 'miscCollapsedTree';
    iconContainerElement.id = iconCellId;
    iconContainerElement.title = vmo._twistieTitle;

    var iconHTML = _awIconService.getIconDef(iconCellId);

    iconContainerElement.innerHTML = iconHTML;
    treeCellButtonHeaderCell.appendChild(iconContainerElement);
    return treeCellButtonHeaderCell;
  };
  /**
   * Creates the cell decorator element for tree command cell.
   *
   * @param {DOMElement} tableElem tree table element
   * @param {Object} vmo the vmo for the cell
   *
   * @returns {DOMElement} cell decorator element
   */


  var createCellDecoratorElement = function createCellDecoratorElement(tableElem, vmo) {
    var cellColorContainerElement = _t.util.createElement('div', _t.const.CLASS_GRID_CELL_COLOR_CONTAINER, _t.const.CLASS_TREE_COLOR_CONTAINER);

    var cellColorElement = _t.util.createColorIndicatorElement(vmo);

    cellColorContainerElement.appendChild(cellColorElement);
    return cellColorContainerElement;
  };
  /**
   * Creates the cell image element for tree command cell.
   *
   * @param {DOMElement} tableElem tree table element
   * @param {Object} vmo the vmo for the cell
   *
   * @returns {DOMElement} cell image element
   */


  var createCellImageElement = function createCellImageElement(tableElem, vmo) {
    var cellImageContainerElement = _t.util.createElement('div', _t.const.CLASS_GRID_CELL_IMAGE);

    var cellImageElement = _t.util.createElement('img', _t.const.CLASS_ICON_BASE);

    cellImageElement.src = _t.util.getImgURL(vmo);
    cellImageContainerElement.appendChild(cellImageElement);
    return cellImageContainerElement;
  };

  var toggleTreeCellAction = function toggleTreeCellAction(vmo, tableElem, treeCellElement) {
    if (vmo.isExpanded || vmo.isInExpandBelowMode) {
      // collapse
      delete vmo.isExpanded;
      vmo.isInExpandBelowMode = false;
    } else {
      vmo.isExpanded = true; // Set icon cell to loading icon

      var iconContainerElement = treeCellElement.getElementsByTagName(_t.const.ELEMENT_AW_ICON)[0];

      if (iconContainerElement !== undefined) {
        var iconHTML = _awIconService.getIconDef('miscInProcessIndicator');

        iconContainerElement.innerHTML = iconHTML;
      }
    } // Prevent the selected row from being scrolled to if it goes out of view


    eventBus.publish(tableElem.id + '.plTable.unsetScrollToRowIndex');
    eventBus.publish(tableElem.id + '.plTable.toggleTreeNode', vmo);
  };

  var addClickableCellTitle = function addClickableCellTitle(element, vmo, value) {
    // make cell text clickable
    var clickableTextDiv = _t.util.createElement('div');

    var clickableText = _t.util.createElement('a', 'aw-uiwidgets-clickableTitle');

    clickableText.onclick = function (event) {
      var scope = {};
      scope.vmo = vmo;

      _clickableTitleService.doIt(event, scope);
    };

    clickableText.innerHTML = exports.addHighlights(value);
    clickableTextDiv.appendChild(clickableText);
    element.appendChild(clickableTextDiv);
  };
  /**
   * Creates the title and command container element for tree command cell.
   *
   * @param {DOMElement} tableElem tree table element
   * @param {Object} vmo the vmo for the cell
   * @param {Object} column the column associated with the cell
   *
   * @returns {DOMElement} title/command container element
   */


  var createTitleElement = function createTitleElement(tableElem, vmo, column) {
    var tableNonEditContainerElement = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_NON_EDIT_CONTAINER, _t.const.CLASS_LAYOUT_ROW_CONTAINER);

    var displayName = vmo.displayName;
    tableNonEditContainerElement.title = displayName;

    var gridCellText = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_TEXT);

    if ((column.isTableCommand || column.isTreeNavigation) && _clickableTitleService.hasClickableCellTitleActions()) {
      addClickableCellTitle(gridCellText, vmo, displayName);
    } else {
      gridCellText.innerText = displayName;
    }

    tableNonEditContainerElement.appendChild(gridCellText);
    return tableNonEditContainerElement;
  };
  /**
   * Show or hide the element based on 'isSelected'.
   *
   * @param {DOMElement} element DOM element to show/hide
   * @param {Boolean} isSelected used to either show or hide element
   */


  var toggleCellCommandVisibility = function toggleCellCommandVisibility(element, isSelected) {
    if (isSelected) {
      _t.util.showHideElement(element, false);
    } else {
      _t.util.showHideElement(element, true);
    }
  };
  /**
   * Add events to the tree command cell elements.
   *
   * @param {DOMElement} treeCellElement tree cell container element
   * @param {Object} vmo the vmo for the cell
   * @param {DOMElement} tableElem table element
   */


  var addTreeCommandCellEvents = function addTreeCommandCellEvents(treeCellElement, vmo, tableElem) {
    var tableInstance = _t.util.getTableInstance(tableElem);

    var dataProviderName = tableInstance.dataProvider.name;
    var treeCellButtonElement = treeCellElement.getElementsByClassName('ui-grid-tree-base-row-header-buttons')[0];

    if (treeCellButtonElement) {
      treeCellButtonElement.addEventListener('click', function (event) {
        if (!vmo.isLeaf) {
          event.cancelBubble = true;

          if (!_t.util.isEditing(tableElem)) {
            toggleTreeCellAction(vmo, tableElem, treeCellElement);
          }
        }
      });
    }

    var cellCommandBarElement = treeCellElement.getElementsByClassName('cellCommandBarContainer')[0];

    if (cellCommandBarElement) {
      var isSelected = tableInstance.dataProvider.selectionModel.multiSelectEnabled && vmo.selected;
      toggleCellCommandVisibility(cellCommandBarElement, isSelected);
      eventBus.subscribe(dataProviderName + '.selectionChangeEvent', function () {
        isSelected = tableInstance.dataProvider.selectionModel.multiSelectEnabled && vmo.selected;
        toggleCellCommandVisibility(cellCommandBarElement, isSelected);
      });
    }
  };
  /**
   * @memberOf js/awSPLMTableCellRendererFactory
   *
   * This method is used for creating cell commands internall for PL Table in AW usecase.
   *
   * @param {Object} column - column Definition
   * @param {Object} vmo - View model object
   * @param {DOMElement} tableElem - table DOMElement as context
   * @param {Boolean} [isInternal] - true if function being called from internal PL Table code
   * @param {Boolean} [extraDigest] - true if one extra digest is needed
   * @returns {DOMElement} DOMElement presents cell command bar
   *
   */


  var createCellCommandElementInternal = function createCellCommandElementInternal(column, vmo, tableElem, isInternal, extraDigest) {
    var elem = createCompiledCellCommandElement(tableElem);

    if (isInternal) {
      elem.classList.add(_t.const.CLASS_NATIVE_CELL_COMMANDS);
    }

    applyCommandCellScope(elem, column, vmo, extraDigest);
    return elem;
  };
  /**
   * @memberOf js/awSPLMTableCellRendererFactory
   *
   * This method is used for creating cell commands for PL Table in AW usecase.
   *
   * @param {Object} column - column Definition
   * @param {Object} vmo - View model object
   * @param {DOMElement} tableElem - table DOMElement as context
   * @param {Boolean} [isInternal] - true if function being called from internal PL Table code
   * @returns {DOMElement} DOMElement presents cell command bar
   *
   */


  exports.createCellCommandElement = function (column, vmo, tableElem, isInternal) {
    return createCellCommandElementInternal(column, vmo, tableElem, isInternal);
  };

  exports.createTreeCellCommandElement = function (column, vmo, tableElem) {
    // CELL CONTAINER
    var tableTreeCommandCell = _t.util.createElement('div', _t.const.CLASS_AW_TREE_COMMAND_CELL, _t.const.CLASS_WIDGET_TABLE_CELL);

    var treeCellTop = _t.util.createElement('div', _t.const.CLASS_AW_JS_CELL_TOP, _t.const.CLASS_WIDGET_UI_NON_EDIT_CELL);

    tableTreeCommandCell.appendChild(treeCellTop); // ICON

    var iconElement = createIconElement(tableElem, vmo);
    treeCellTop.appendChild(iconElement); // DECORATOR

    var cellDecoratorElement = createCellDecoratorElement(tableElem, vmo);
    treeCellTop.appendChild(cellDecoratorElement); // IMAGE

    var cellImageElement = createCellImageElement(tableElem, vmo);
    treeCellTop.appendChild(cellImageElement); // TITLE

    var tableNonEditContainerElement = createTitleElement(tableElem, vmo, column);
    treeCellTop.appendChild(tableNonEditContainerElement);
    addTreeCommandCellEvents(tableTreeCommandCell, vmo, tableElem);
    return tableTreeCommandCell;
  };

  var createCheckMarkElementInternal = function createCheckMarkElementInternal(tableElem) {
    var commandBarHtml = '<div class="aw-jswidgets-gridCellCommands aw-widgets-cellInteraction aw-splm-table-gridCellCommands" ng-show="!prop.isEditable||prop.isArray">' + //
    '<div class="aw-splm-table-flexRow aw-splm-table-check-mark-present">' + //
    '<a class="aw-commands-cellCommandCommon">' + //
    '<div class="aw-commands-svg">' + //
    '<aw-icon id="cmdCheckmark"></aw-icon>' + //
    '</div>' + //
    '</a>' + //
    '</div>' + //
    '</div>';
    var cellScope = {};
    return _t.util.createNgElement(commandBarHtml, tableElem, cellScope);
  }; // NOTE: By this design, the cell command will only be available for OOTB AW Cell.


  exports.createCheckMarkElement = function (column, vmo, tableElem) {
    var elem = createCheckMarkElementInternal(tableElem);
    applyCommandCellScope(elem, column, vmo);
    return elem;
  };

  exports.addHighlights = function (displayValue) {
    var ctx = _appCtxService.getCtx('highlighter');

    if (ctx && typeof displayValue === 'string') {
      return displayValue.replace(ctx.regEx, ctx.style);
    }

    return displayValue;
  }; // This function is called when we click on any object link
  // REFACTOR: Awp0ShowObjectCell is TC specific. Try to pull command ID from solution configuration
  // instead.


  var openObjectLink = function openObjectLink(propertyName, uid) {
    if (uid && uid.length > 0) {
      var modelObject = _cdm.getObject(uid);

      var vmo = {
        propertyName: propertyName,
        uid: uid
      };
      var commandContext = {
        vmo: modelObject || vmo,
        // vmo needed for gwt commands
        edit: false
      };

      _commandService.executeCommand('Awp0ShowObjectCell', null, null, commandContext);
    }
  }; // REFACTOR: The only meaning here to keep this is the _cellCmdElem mechanism, we can separate it out later.


  exports.createCellRenderer = function () {
    var _renderer = {};

    var _cellCmdElem;

    var _tooltipElement = _t.util.createElement('div', _t.const.CLASS_AW_POPUP, _t.const.CLASS_AW_TOOLTIP_POPUP, _t.const.CLASS_TOOLTIP_POPUP);

    var createCommandCellHandler = function createCommandCellHandler(cellTop, column, vmo, tableElem) {
      return function () {
        if (!cellTop.lastChild || cellTop.lastChild && !cellTop.lastChild.classList.contains(_t.const.CLASS_AW_CELL_COMMANDS)) {
          if (!_cellCmdElem) {
            // LCS-140017 - Follow up work for 14 table performance tuning
            // In the initialization case one extra digest is needed to make sure
            // anchor is getting compiled
            _cellCmdElem = createCellCommandElementInternal(column, vmo, tableElem, true, true);
          } else {
            applyCommandCellScope(_cellCmdElem, column, vmo, true);
          }

          cellTop.appendChild(_cellCmdElem);
        }
      };
    };

    var addCommandOnHover = function addCommandOnHover(commandHandlerParent, column, vmo, tableElem) {
      commandHandlerParent.addEventListener('mouseover', createCommandCellHandler(commandHandlerParent, column, vmo, tableElem));
    };

    var getTooltipHTML = function getTooltipHTML(values) {
      var tooltipInnerHTML = '<ul>';

      _.forEach(values, function (value) {
        tooltipInnerHTML += '<li>' + exports.addHighlights(value) + '</li>';
      });

      tooltipInnerHTML += '</ul>';
      return tooltipInnerHTML;
    };

    var containsOnlyEmptyStrings = function containsOnlyEmptyStrings(values) {
      if (values.length) {
        for (var i = 0; i < values.length; i++) {
          if (values[i] !== '') {
            return false;
          }
        }
      }

      return true;
    };

    var getNewValues = function getNewValues(prop) {
      var newValues = [];

      if (prop.isArray === true) {
        if (prop.displayValues && !containsOnlyEmptyStrings(prop.displayValues)) {
          newValues = prop.displayValues.slice();
        } else if (prop.uiValues && !containsOnlyEmptyStrings(prop.uiValues)) {
          newValues = prop.uiValues.slice();
        }
      } else if (!containsOnlyEmptyStrings([prop.uiValue])) {
        newValues = [prop.uiValue];
      }

      return newValues;
    };

    var getOldValues = function getOldValues(prop) {
      var oldValues = [];

      if (prop.isArray === true && prop.oldValues && !containsOnlyEmptyStrings(prop.oldValues)) {
        oldValues = prop.oldValues.slice();
      } else if (prop.oldValue && !containsOnlyEmptyStrings([prop.oldValue])) {
        oldValues = [prop.oldValue];
      }

      return oldValues;
    };

    var addOpenObjectLinkHandler = function addOpenObjectLinkHandler(objectElement, prop, index) {
      objectElement.addEventListener('click', function (e) {
        if (e.target && e.target.tagName.toLowerCase() === 'a' && e.target.href !== '') {
          return;
        }

        if (!prop.isEditable) {
          e.cancelBubble = true;
          openObjectLink(prop.propertyName, prop.dbValues[index]);
        }
      });
    };

    var createObjectListFragment = function createObjectListFragment(prop, addOldValue, scope) {
      var fragment = document.createDocumentFragment();
      var newValues = getNewValues(prop);
      var oldValues = getOldValues(prop);
      var index = 0;

      while (newValues.length > 0 || oldValues.length > 0) {
        var liForObjectLinks = _t.util.createElement('li', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM);

        var newValue = newValues.shift();
        var oldValue = oldValues.shift();

        if (newValue) {
          // use a different class when there is an object array.
          var objectElement;

          if (prop.isEditable) {
            objectElement = _t.util.createElement('a', _t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED);
          } else if (oldValue) {
            objectElement = _t.util.createElement('a', _t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS, _t.const.CLASS_AW_CHANGED_TEXT);
          } else {
            objectElement = _t.util.createElement('a', _t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS);
          } // associating every prop with href


          var uidToBeEvaluated = '';

          if (prop.isArray) {
            uidToBeEvaluated = prop.dbValue[index];
          } else {
            uidToBeEvaluated = prop.dbValue;
          }

          populateHrefContentPerPropValue(objectElement, scope, uidToBeEvaluated).then(function (response) {
            objectElement = _t.util.addAttributeToDOMElement(response.objectElement, 'href', response.url);
            objectElement = _t.util.addAttributeToDOMElement(objectElement, 'target', '_blank');
          });
          addOpenObjectLinkHandler(objectElement, prop, index);
          objectElement.innerHTML = exports.addHighlights(newValue);
          liForObjectLinks.appendChild(objectElement);
        }

        if (addOldValue && oldValue) {
          var oldCellTextElement = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_PROPERTY_VALUE_LINKS_DISABLED, _t.const.CLASS_AW_OLD_TEXT);

          oldCellTextElement.innerHTML = exports.addHighlights(oldValue);
          liForObjectLinks.appendChild(oldCellTextElement);
        }

        fragment.appendChild(liForObjectLinks); // Add cell text class to last li

        if (fragment.childNodes.length > 0) {
          fragment.childNodes[fragment.childNodes.length - 1].classList.add(_t.const.CLASS_WIDGET_TABLE_CELL_TEXT);
        }

        index++;
      }

      return fragment;
    };

    var addTooltipListeners = function addTooltipListeners(parentElement, tooltipContent, tableElement) {
      var tooltipTimeout = null;
      parentElement.addEventListener('mouseenter', function () {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(function () {
          var parentElementDimensions = parentElement.getBoundingClientRect();
          _tooltipElement.style.left = parentElementDimensions.left + 'px';
          _tooltipElement.style.top = parentElementDimensions.top + 'px';
          var tableBoundingBox = tableElement.getBoundingClientRect();
          _tooltipElement.style.maxWidth = tableBoundingBox.right - parentElementDimensions.left + 'px'; // Append elements or set innerHTML

          if (tooltipContent instanceof DocumentFragment || tooltipContent instanceof Element) {
            _tooltipElement.appendChild(tooltipContent);
          } else {
            _tooltipElement.innerHTML = tooltipContent;
          }

          parentElement.appendChild(_tooltipElement);
        }, 750);
      });
      parentElement.addEventListener('mouseleave', function () {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(function () {
          if (_tooltipElement.parentElement) {
            _tooltipElement.parentElement.removeChild(_tooltipElement);
          }

          while (_tooltipElement.firstChild) {
            _tooltipElement.removeChild(_tooltipElement.firstChild);
          }
        }, 750);
      });
      return _tooltipElement;
    };
    /**
     * Icon cell
     */


    var iconCellRenderer = {
      action: function action(column, vmo, tableElem) {
        var cell = _t.util.createElement('div', _t.const.CLASS_CELL_CONTENTS, _t.const.CLASS_SPLM_TABLE_ICON_CELL);

        var colorIndicatorElement = _t.util.createColorIndicatorElement(vmo);

        cell.appendChild(colorIndicatorElement);

        var cellImg = _t.util.createElement('img', _t.const.CLASS_ICON_BASE, _t.const.CLASS_ICON_TYPE, _t.const.CLASS_SPLM_TABLE_ICON);

        var rowHeight = _t.util.getTableRowHeightForIconCellRenderer(_t.util.getTableInstance(tableElem).gridOptions, undefined);

        if (rowHeight !== undefined) {
          cellImg.style.height = rowHeight + 'px';
          cellImg.style.width = rowHeight + 'px';
        }

        cellImg.src = _t.util.getImgURL(vmo);
        cell.appendChild(cellImg);
        return cell;
      },
      condition: function condition(column, vmo, tableElem) {
        return column.name === 'icon';
      }
    };
    /**
     * Command in cell
     */

    var commandCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var cellContent = _t.Cell.createElement(column, vmo, tableElem, rowElem);

        if (cellContent) {
          addCommandOnHover(cellContent, column, vmo, tableElem);
        }

        return cellContent;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return column.isTableCommand;
      }
    };
    /**
     * Tree Node
     */

    var treeTableCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var createTreeCellCommandElement = exports.createTreeCellCommandElement(column, vmo, tableElem);
        var commandHandlerParent = createTreeCellCommandElement.getElementsByClassName(_t.const.CLASS_WIDGET_TABLE_NON_EDIT_CONTAINER)[0];
        addCommandOnHover(commandHandlerParent, column, vmo, tableElem);
        return createTreeCellCommandElement;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return column.isTreeNavigation;
      }
    };
    /**
     * AW Object Reference
     */

    var objectCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var prop = vmo.props[column.field];

        var ulForObjectLinks = _t.util.createElement('ul', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST, _t.const.CLASS_TABLE_CELL_TOP); // Prevent wrapping for cells that could have a command


        if (column.isTableCommand === true) {
          ulForObjectLinks.style.flexWrap = 'nowrap';
          ulForObjectLinks.style.overflow = 'hidden';
        }

        var values = prop.displayValues || prop.uiValues; // Add tooltip

        var scope = _t.util.getElementScope(tableElem.parentElement, true);

        if (prop.isArray && values.length > 0) {
          var objectListDomFragment = createObjectListFragment(prop, null, scope);

          if (objectListDomFragment) {
            addTooltipListeners(ulForObjectLinks, objectListDomFragment, tableElem);
          }
        } else {
          ulForObjectLinks.title = prop.uiValue;
        }

        var contentDomFragment = createObjectListFragment(prop, true, scope);

        if (contentDomFragment) {
          ulForObjectLinks.appendChild(contentDomFragment);
        }

        return ulForObjectLinks;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return vmo.props && vmo.props[column.field] && (vmo.props[column.field].type === 'OBJECT' || vmo.props[column.field].type === 'OBJECTARRAY');
      }
    };

    var getCompiledFunctionFromCache = function getCompiledFunctionFromCache(templateUrl, htmlString) {
      // In order to stop loading/compiling same template again, template should be cached against its URL
      var renderingTemplateCache = _$cacheFactory.get('propRenderingTemplate');

      if (!renderingTemplateCache) {
        renderingTemplateCache = _$cacheFactory('propRenderingTemplate');
      }

      var compiledTemplateFn = renderingTemplateCache.get(templateUrl);

      if (!compiledTemplateFn && !_.isEmpty(htmlString)) {
        compiledTemplateFn = _.template(htmlString);
        renderingTemplateCache.put(templateUrl, compiledTemplateFn);
      }

      return compiledTemplateFn;
    };

    var loadTemplate = function loadTemplate(containerElement, vmo, templateUrl, dependentServices) {
      var deferred = _$q.defer();

      var compiledTemplateFn = getCompiledFunctionFromCache(templateUrl, null);

      if (compiledTemplateFn) {
        //If compiled function already exists for templateUrl, return
        deferred.resolve({
          containerElement: containerElement,
          templateUrl: templateUrl,
          vmo: vmo,
          htmlString: '',
          dependentServices: dependentServices
        });
      } else {
        _$http.get(templateUrl, {
          cache: true
        }).then(function (response) {
          var htmlString = response;

          if (htmlString) {
            deferred.resolve({
              containerElement: containerElement,
              templateUrl: templateUrl,
              vmo: vmo,
              htmlString: response.data,
              dependentServices: dependentServices
            });
          }
        });
      }

      return deferred.promise;
    };

    var populateHrefContentPerPropValue = function populateHrefContentPerPropValue(objectElement, scope, uidToBeEvaluated) {
      var deferred = _$q.defer();

      if (objectElement && scope && uidToBeEvaluated) {
        _navigationTokenService.getNavigationContent(scope, uidToBeEvaluated).then(function (url) {
          var hrefContent = url;

          if (hrefContent) {
            deferred.resolve({
              objectElement: objectElement,
              url: hrefContent
            });
          }
        });
      }

      return deferred.promise;
    };

    var updateContainerWithCellTemplate = function updateContainerWithCellTemplate(contaierElement, vmo, propName, tooltipProps, templateUrl, htmlString, depsToInject) {
      var injector = null;
      var dependentServices = [];

      if (!_.isEmpty(depsToInject)) {
        injector = app.getInjector();
      }

      _.forEach(depsToInject, function (depToInject) {
        dependentServices.push(injector.get(depToInject));
      });

      var compiledTemplateFn = getCompiledFunctionFromCache(templateUrl, htmlString);
      var generatedElement = compiledTemplateFn({
        vmo: vmo,
        propName: propName,
        tooltipProps: tooltipProps,
        basePath: app.getBaseUrlPath(),
        dependentServices: dependentServices
      });
      contaierElement.innerHTML = generatedElement.trim();
    };

    var getColRendererTemplateToUse = function getColRendererTemplateToUse(propName, tableElem) {
      var renderingTemplate = null;
      var propRenderTemplates = _propVsRenderingTemplate[propName];
      var gridId = tableElem.id;

      _.forEach(propRenderTemplates.specificRenderingTemplates, function (propRenderTemplate) {
        if (propRenderTemplate.grids.indexOf(gridId) >= 0) {
          renderingTemplate = propRenderTemplate;
          return;
        }
      });

      if (renderingTemplate === null) {
        // If specific template not found, check if default exists
        if (propRenderTemplates.defaultPropRenderingTemplate) {
          renderingTemplate = propRenderTemplates.defaultPropRenderingTemplate;
        }
      }

      return renderingTemplate;
    };

    var isGraphicalRenderrDefinedForProp = function isGraphicalRenderrDefinedForProp(propName) {
      if (_.isEmpty(_propVsRenderingTemplate)) {
        generatePropRendererTemplateMap();
      }

      if (propName && _propVsRenderingTemplate[propName]) {
        return true;
      }

      return false;
    };

    var customCellRenderer = {
      action: function action(column, vmo, tableElem) {
        var colRenderTemplateDef = getColRendererTemplateToUse(column.field, tableElem);
        var containerElement = null;

        if (!_.isEmpty(colRenderTemplateDef.template)) {
          //Template processing -> No need for async processing..
          containerElement = _t.util.createElement('div', _t.const.CLASS_TABLE_CELL_TOP);
          updateContainerWithCellTemplate(containerElement, vmo, column.field, colRenderTemplateDef.tooltip, colRenderTemplateDef.template, colRenderTemplateDef.template, colRenderTemplateDef.dependentServices);
        } else if (!_.isEmpty(colRenderTemplateDef.templateUrl)) {
          //Async loading for template once template is loaded
          containerElement = _t.util.createElement('div', _t.const.CLASS_TABLE_CELL_TOP);
          var templateUrl = app.getBaseUrlPath() + colRenderTemplateDef.templateUrl;
          loadTemplate(containerElement, vmo, templateUrl, colRenderTemplateDef.dependentServices).then(function (response) {
            updateContainerWithCellTemplate(response.containerElement, response.vmo, column.field, colRenderTemplateDef.tooltip, response.templateUrl, response.htmlString, response.dependentServices);
          });
        } else if (!_.isEmpty(colRenderTemplateDef.renderFunction)) {
          containerElement = _t.util.createElement('div', _t.const.CLASS_TABLE_CELL_TOP);
          declUtils.loadDependentModule(colRenderTemplateDef.deps, _$q, app.getInjector()).then(function (depModuleObj) {
            var args = [vmo, containerElement, column.field, colRenderTemplateDef.tooltip];
            return depModuleObj[colRenderTemplateDef.renderFunction].apply(null, args);
          });
        }

        return containerElement; // If container element is null, default rendering will happen
      },
      condition: function condition(column, vmo) {
        if (column.enableRendererContribution && isGraphicalRenderrDefinedForProp(column.field)) {
          //If propertyRenderer template defined for a given property, use it for rendering
          return true;
        }

        return false;
      }
    };
    /**
     * Rich Text Field
     */

    var richTextCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var prop = vmo.props[column.field];
        var newValues = getNewValues(prop);
        var oldValues = getOldValues(prop);

        var cellTop = _t.util.createElement('ul', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST, _t.const.CLASS_TABLE_CELL_TOP); // Add tooltip


        if (newValues.length > 0) {
          var tooltipHTML = getTooltipHTML(newValues);
          addTooltipListeners(cellTop, tooltipHTML, tableElem);
        }

        while (newValues.length > 0 || oldValues.length > 0) {
          var liElement = _t.util.createElement('li', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM);

          liElement.style.width = '100%';
          var rtfContainer;
          var newValue = newValues.shift();
          var oldValue = oldValues.shift();

          if (newValue) {
            if (oldValue) {
              rtfContainer = _t.util.createElement('div', _t.const.CLASS_TABLE_RTF_CELL_ITEM, _t.const.CLASS_AW_CHANGED_TEXT);
            } else {
              rtfContainer = _t.util.createElement('div', _t.const.CLASS_TABLE_RTF_CELL_ITEM);
            }

            rtfContainer.innerHTML = exports.addHighlights(newValue);
            liElement.appendChild(rtfContainer);
          }

          if (oldValue) {
            var oldCellTextElement = _t.util.createElement('div', _t.const.CLASS_AW_OLD_TEXT);

            oldCellTextElement.innerHTML = exports.addHighlights(oldValue);
            liElement.appendChild(oldCellTextElement);
          } // NOTE: For Firefox there is a limitation that the vertical scroll bar is not show up,
          // because of issue below:
          // https://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
          // there is a workaround by using { min-height: 0 }, I have not tested it yet and no plan to fix it
          // now.
          // It is not only an RTF issue, same problem for string list and object list
          // Dynamic styling for RTF


          if (rtfContainer && rtfContainer.childElementCount > 1 && newValues.length === 1) {
            liElement.style.height = '100%';
          }

          cellTop.appendChild(liElement);
        }

        return cellTop;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return vmo.props && vmo.props[column.field] && vmo.props[column.field].isRichText;
      }
    };
    /**
     * Plain Text
     */

    var simpleTextCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var prop = vmo.props[column.field];

        var cellTop = _t.util.createElement('div', _t.const.CLASS_TABLE_CELL_TOP);

        if (prop.uiValue) {
          var gridCellText = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_TEXT);

          cellTop.title = prop.uiValue;

          var parsedValue = _sanitizer.htmlEscapeAllowEntities(prop.uiValue, true, true);

          if ((column.isTableCommand || column.isTreeNavigation) && _clickableTitleService.hasClickableCellTitleActions()) {
            addClickableCellTitle(gridCellText, vmo, parsedValue);
          } else {
            gridCellText.innerHTML = exports.addHighlights(parsedValue);
          }

          cellTop.appendChild(gridCellText);
        }

        return cellTop;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return vmo.props && vmo.props[column.field] && !vmo.props[column.field].isRichText && !vmo.props[column.field].oldValue && !vmo.props[column.field].isArray;
      }
    };
    var plainTextCellRenderer = {
      action: function action(column, vmo, tableElem, rowElem) {
        var prop = vmo.props[column.field];
        var newValues = getNewValues(prop);
        var oldValues = getOldValues(prop);

        var ulElement = _t.util.createElement('ul', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST, _t.const.CLASS_TABLE_CELL_TOP); // Add tooltip


        if (prop.isArray) {
          if (newValues.length > 0) {
            var tooltipHTML = getTooltipHTML(newValues);
            addTooltipListeners(ulElement, tooltipHTML, tableElem);
          }
        } else {
          ulElement.title = prop.uiValue;
        }

        while (newValues.length > 0 || oldValues.length > 0) {
          var liElement = _t.util.createElement('li', _t.const.CLASS_TABLE_NON_EDIT_CELL_LIST_ITEM);

          var newValue = newValues.shift();
          var oldValue = oldValues.shift();

          if (newValue) {
            if (oldValue) {
              var textElem = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_TEXT, _t.const.CLASS_AW_CHANGED_TEXT);
            } else {
              var textElem = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_TEXT);
            }

            var parsedValue = _sanitizer.htmlEscapeAllowEntities(newValue, true, true);

            textElem.innerHTML = exports.addHighlights(parsedValue);
            liElement.appendChild(textElem);
          }

          if (oldValue) {
            var oldCellTextElement = _t.util.createElement('div', _t.const.CLASS_WIDGET_TABLE_CELL_TEXT, _t.const.CLASS_AW_OLD_TEXT);

            oldCellTextElement.innerHTML = exports.addHighlights(oldValue);
            liElement.appendChild(oldCellTextElement);
          }

          ulElement.appendChild(liElement);
        }

        return ulElement;
      },
      condition: function condition(column, vmo, tableElem, rowElem) {
        return vmo.props && vmo.props[column.field] && !vmo.props[column.field].isRichText && (vmo.props[column.field].isArray || vmo.props[column.field].oldValue);
      }
    };
    /**
     * exposed method
     */

    _renderer.resetHoverCommandElement = function () {
      if (_cellCmdElem && _cellCmdElem.parentElement) {
        _cellCmdElem.parentElement.removeChild(_cellCmdElem);
      }
    };

    _renderer.destroyHoverCommandElement = function () {
      if (_cellCmdElem) {
        _t.util.destroyNgElement(_cellCmdElem);
      }

      _cellCmdElem = null;
    };

    _renderer.getAwCellRenderers = function () {
      // NOTE: If the condition is not isolated, then the sequence matters.
      // Decorator renderers should be first in the array since they will call
      // _t.Cell.createElement to get cell content provided by the next valid renderer.
      return [commandCellRenderer, customCellRenderer, iconCellRenderer, treeTableCellRenderer, objectCellRenderer, simpleTextCellRenderer, plainTextCellRenderer, richTextCellRenderer];
    };

    return _renderer;
  };
  /**
   * This service provides necessary APIs to navigate to a URL within AW.
   *
   * @memberof NgServices
   * @member awSPLMTableCellRendererFactory
   *
   * @returns {Object} Reference to SPLM table.
   */


  app.factory('awSPLMTableCellRendererFactory', ['sanitizer', 'appCtxService', 'commandService', 'clickableTitleService', 'awIconService', 'soa_kernel_clientDataModel', '$http', '$q', '$cacheFactory', 'navigationTokenService', function (sanitizer, appCtxService, commandService, clickableTitleService, awIconService, cdm, $http, $q, $cacheFactory, navigationTokenService) {
    _sanitizer = sanitizer;
    _appCtxService = appCtxService;
    _commandService = commandService;
    _clickableTitleService = clickableTitleService;
    _awIconService = awIconService;
    _cdm = cdm;
    _$http = $http;
    _$q = $q;
    _$cacheFactory = $cacheFactory;
    _navigationTokenService = navigationTokenService;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'awSPLMTableCellRendererFactory'
  };
});