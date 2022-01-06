"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This utility module provides helpful functions intended to efficiently manipulate pltable contents.
 *
 * @module js/splmTableUtils
 */
define(['lodash', 'js/splmTableConstants', 'js/ngUtils', 'js/browserUtils'], //
function (_, _t, ngUtils, browserUtils) {
  var exports = {};
  /**
   * Locate the closest element including self
   * http://stackoverflow.com/a/24107550/888165
   *
   * @param {DOMElement} element element to start search
   *
   * @param {String} selector css selector to use in locating closest element
   *
   * @param {Int} maxLevelsUp the maximum levels up to search
   *
   * @returns {DOMElement} the closest element
   */

  exports.closestElement = function (element, selector, maxLevelsUp) {
    if (element && element.matches && element.matches(selector)) {
      return element;
    } else if (element && element.msMatchesSelector && element.msMatchesSelector(selector)) {
      return element;
    }

    return ngUtils.closestElement(element, selector, maxLevelsUp);
  };
  /**
   * Returns the index of the node in its parent
   *
   * @param {DOMElement} node - The node to find the index of
   *
   * @return {Number} the index of the node
   */


  exports.getIndexInParent = function (node) {
    var i = 0;

    while (node.previousElementSibling) {
      node = node.previousElementSibling;
      i++;
    }

    return i;
  };
  /**
   * Get all table content cell in specific column.
   *
   * @param {DOMElement} tableElement - The DOMElement for table
   *
   * @param {Number} columnIndex - The column index
   *
   * @return {Array} List of DOMElements for table content cells.
   */


  exports.getColumnContentCellElementsByIndex = function (tableElement, columnIndex) {
    var returnCellElements = [];
    var cellElements = tableElement.getElementsByClassName(_t.const.CLASS_CELL);

    _.forEach(cellElements, function (cellElement) {
      if (cellElement.columnDef) {
        if (cellElement.columnDef.index === columnIndex) {
          returnCellElements.push(cellElement);
        }
      }
    });

    return returnCellElements;
  };
  /**
   * Get property object/view model for specific table content cell element
   *
   * @param {DOMElement} cellElement - The table content cell element
   *
   * @return {Object} The property object to this cell.
   */


  exports.getPropertyByCellElement = function (cellElement) {
    var rowElement = exports.closestElement(cellElement, '.' + _t.const.CLASS_ROW);

    if (rowElement.vmo && rowElement.vmo.props) {
      return rowElement.vmo.props[cellElement.columnDef.field];
    }

    return null;
  };
  /**
   * Get view model object for specific table content cell element
   *
   * @param {DOMElement} cellElement - The table content cell element
   *
   * @return {Object} The property object to this cell.
   */


  exports.getViewModelObjectByCellElement = function (cellElement) {
    return cellElement.parentElement.vmo;
  };
  /**
   * Get cell element by object UID and property name
   *
   * @param {DOMElement} tableElement - The DOMElement for table
   *
   * @param {String} propertyName - The property name
   *
   * @param {String} vmoUid - The uid to view model object
   *
   * @return {DOMElement} The DOMElement to table content cell which presents specific property of the vmo.
   */


  exports.getCellElementsByPropertyAndUid = function (tableElement, propertyName, vmoUid) {
    var returnCellElements = [];
    var rowElements = tableElement.getElementsByClassName(_t.const.CLASS_ROW);

    for (var i = 0; i < rowElements.length; i++) {
      if (rowElements[i].vmo && rowElements[i].vmo.uid === vmoUid) {
        var cellElements = rowElements[i].getElementsByClassName(_t.const.CLASS_CELL);

        for (var j = 0; j < cellElements.length; j++) {
          if (cellElements[j].columnDef && cellElements[j].columnDef.field === propertyName) {
            returnCellElements.push(cellElements[j]);
          }
        }
      }
    }

    return returnCellElements;
  };
  /**
   * Create DOMElement based on AngularJS HTML Template for PL Table.
   * - Only single nest HTML description is supported.
   * - When use it inside a cell, it will be recycled automatically by row virtual rendering.
   * - When use it inside a table, it will be recycled when table is getting destroyed.
   *
   * @param {String} htmlContent - The HTML Content/AngularJS Template string needs to compile
   *
   * @param {DOMElement} parentElement - Parent DOMElement in PLTable as Context, could be direct parent or PL Table Element
   *            If parent DOMElement is not in table yet, please use table element.
   *
   * @param {Object} [scopeData] - Arbitrary object to be set as the primary '$scope' (i.e. 'context') of the new
   *            AngularJS controller.
   *
    * @param {DeclViewModel} [declViewModel] - The object to set as the 'data' property on the controller's '$scope'.
   *
   * @return {DOMElement} Compiled DOM Element from AngularJS HTML Template input
   */


  exports.createNgElement = function (htmlContent, parentElement, scopeData, declViewModel) {
    var tableElement = null;
    var appCtx = null;

    if (parentElement) {
      if (parentElement.tagName.toLowerCase() === _t.const.ELEMENT_TABLE) {
        tableElement = parentElement;
      } else {
        tableElement = exports.closestElement(parentElement, _t.const.ELEMENT_TABLE);
      }

      var ctxObj = exports.getElementScope(tableElement, true).ctx;
      appCtx = {
        ctx: ctxObj
      };
    }

    var currentElement = ngUtils.element(htmlContent);
    var compiledResult = ngUtils.compile(tableElement, currentElement, appCtx, declViewModel, scopeData); // more than 1 element is not supported

    if (compiledResult && compiledResult.length === 1) {
      compiledResult[0].classList.add(_t.const.CLASS_COMPILED_ELEMENT);
      return compiledResult[0];
    } else if (compiledResult && compiledResult.length > 1) {
      compiledResult.scope().$destroy();
    }

    return undefined;
  };
  /**
   * Destroys and removes the passed in angularJS DOMElement
   *
   * @param {DOMElement} element - DOMElement that has an angular scope
   */


  exports.destroyNgElement = function (element) {
    ngUtils.destroyNgElement(element);
  };
  /**
   * Destroys and removes the passed in angularJS DOMElements based under input DOM Element
   *
   * @param {DOMElement} element - DOMElement that has anuglarJS DOM Elements as child elements
   */


  exports.destroyChildNgElements = function (element) {
    ngUtils.destroyChildNgElements(element, _t.const.CLASS_COMPILED_ELEMENT);
  };
  /**
   * Get AngularJS Scope Variable for Element compiled from AngularJS Template
   *
   * @param {DOMElement} element - DOMElement which is compiled from AngularJS Template.
   *
   * @param {Boolean} isIsolated - if true returns isolate scope.
   *
   * @return {Object} Scope object for specific AngularJS Element
   */


  exports.getElementScope = function (element, isIsolated) {
    return ngUtils.getElementScope(element, isIsolated);
  };
  /**
   * Get width for element text content
   * https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
   *
   * @param {DOMElement} element - DOMElement in table.
   *
   * @return {Number} Font size as number
   */


  exports.getElementTextWidth = function (element) {
    var width = 0;
    var cloneElem = element.cloneNode(true);
    cloneElem.style.position = 'absolute';
    cloneElem.style.visibility = 'hidden';
    cloneElem.style.height = 'auto';
    cloneElem.style.width = 'auto';
    cloneElem.style.whiteSpace = 'nowrap';

    if (element.parentElement) {
      element.parentElement.appendChild(cloneElem); // Plus 10 blindly for possible container styling

      width = Math.round(cloneElem.clientWidth) + 10;
      element.parentElement.removeChild(cloneElem);
    }

    return width;
  };
  /**
   * Create DOM Element with CSS Class Definitions
   *
   * @param {String} elementName - DOMElement name.
   *
   * @param {...String} var_args - CSS Class Names.
   *
   * @return {DOMElement} created DOMElement
   */


  exports.createElement = function () {
    var elem = document.createElement(arguments[0]);

    for (var i = 1; i < arguments.length; i++) {
      elem.classList.add(arguments[i]);
    }

    return elem;
  };
  /**
   * Update attribute on DOM element
   *
   * @param {String} elem - DOMElement name.
   * @param {String} attribute -   attribute name.
   * @param {String} attrValue -   attribute value.
   * @return {DOMElement} updated DOMElement
   */


  exports.addAttributeToDOMElement = function (elem, attribute, attrValue) {
    var att = document.createAttribute(attribute);
    att.value = attrValue;
    elem.setAttributeNode(att);
    return elem;
  };
  /**
   * Create Color Indicator Element based on vmo information
   *
   * @param {Object} vmo - View model object
   *
   * @return {DOMElement} created DOMElement
   */


  exports.createColorIndicatorElement = function (vmo) {
    var colorIndicatorElement = null; // Create color indicator element with proper classes

    if (vmo.gridDecoratorStyle) {
      colorIndicatorElement = _t.util.createElement('span', vmo.gridDecoratorStyle, _t.const.CLASS_AW_CELL_COLOR_INDICATOR, _t.const.CLASS_CELL_COLOR_INDICATOR);
    } else {
      colorIndicatorElement = _t.util.createElement('span', _t.const.CLASS_AW_CELL_COLOR_INDICATOR, _t.const.CLASS_CELL_COLOR_INDICATOR);
    } // Add title


    if (vmo.colorTitle) {
      colorIndicatorElement.title = vmo.colorTitle;
    }

    return colorIndicatorElement;
  };
  /**
   * Create custom event. Mainly for IE
   *
   * @param {String} eventName - Name of the event
   *
   * @param {Object} eventDetail - Object for event detail
   *
   * @return {DOMElement} created DOMElement
   */


  exports.createCustomEvent = function (eventName, eventDetail) {
    if (browserUtils.isNonEdgeIE) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(eventName, false, false, eventDetail);
      return evt;
    }

    return new CustomEvent(eventName, {
      detail: eventDetail
    });
  };
  /**
   * Get Table Control Object from Table Element. A Simple Encapsulation
   *
   * @param {DOMElement} tableElement - Table DomElement.
   *
   * @return {Object} Controller object for current table.
   */


  exports.getTableController = function (tableElement) {
    return exports.getTableInstance(tableElement).controller;
  };
  /**
   * Get Menu Service from Table Element. A Simple Encapsulation
   *
   * @param {DOMElement} tableElement - Table DomElement.
   *
   * @return {Object} Menu Utils object for current table.
   */


  exports.getTableMenuService = function (tableElement) {
    return exports.getTableInstance(tableElement).menuService;
  };
  /**
   * Get Table Instance Object from Table Element. A Simple Encapsulation
   *
   * @param {DOMElement} tableElement - Table DomElement.
   *
   * @return {Object} Controller object for current table.
   */


  exports.getTableInstance = function (tableElement) {
    return tableElement._tableInstance;
  };
  /**
   * Returns the isEditing value for the given table.
   *
   * @param {DOMElement} tableElement - Table DomElement.
   *
   * @return {Boolean} True if table is in editing mode
   */


  exports.isEditing = function (tableElement) {
    return exports.getTableInstance(tableElement).isEditing;
  };
  /**
   * Sets the isEditing value for the given table's instance.
   *
   * @param {DOMElement} tableElement - Table DomElement.
   *
   * @param {Boolean} isEditing - the isEditing value
   */


  exports.setIsEditing = function (tableElement, isEditing) {
    exports.getTableInstance(tableElement).isEditing = isEditing;
  };
  /**
   * Get Ctx Object for PL Table.
   *
   * @param {DOMElement} element - Any DomElement in PL Table.
   *
   * @return {Object} Controller object for current table.
   */


  exports.getCtxObject = function (element) {
    var ctx = null;

    if (element) {
      var tableElement = exports.closestElement(element, _t.const.ELEMENT_TABLE);
      var elementScope = exports.getElementScope(tableElement, true);

      if (elementScope) {
        ctx = elementScope.ctx;
      }
    }

    return ctx;
  };
  /**
   * Create objects with all arguments pass in. No use currently but put it here for a while
   * https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
   *
   * @param {String} elementName - DOMElement name.
   *
   * @param {...String} var_args - CSS Class Names.
   *
   * @return {DOMElement} created DOMElement
   */


  exports.createObjectWithArgs = function (Something) {
    return function () {
      var F = function F(args) {
        return Something.apply(this, args);
      };

      F.prototype = Something.prototype;
      return function () {
        return new F(arguments);
      };
    }();
  };

  exports.showHideElement = function (element, showElement) {
    if (showElement) {
      element.classList.remove('hiddenUtility');
    } else {
      element.classList.add('hiddenUtility');
    }
  };

  var getTableAttributes = function getTableAttributes(gridOptions) {
    var rowHeight = gridOptions.rowHeight;
    var results = {
      isOptionValid: false,
      rowHeight: null,
      iconCellRendererHeight: null,
      classes: null
    };

    switch (rowHeight) {
      case 'small oversize':
        results.rowHeight = 56;
        results.iconCellRendererHeight = 48;
        results.isOptionValid = true;
        results.classes = rowHeight.split(' ');
        break;

      case 'medium oversize':
        results.rowHeight = 72;
        results.iconCellRendererHeight = 64;
        results.isOptionValid = true;
        results.classes = rowHeight.split(' ');
        break;

      case 'large oversize':
        results.rowHeight = 88;
        results.iconCellRendererHeight = 80;
        results.isOptionValid = true;
        results.classes = rowHeight.split(' ');
        break;
    }

    return results;
  };
  /**
   * This API accepts configured grid options and validates whether configured grid options are valid or not.
   * Returns true if they are valid and return false if they are not valid.
   * @param {*} gridOptions : grid options configured in splmtable json.
   */


  exports.validateRowHeightGridOption = function (gridOptions) {
    var results = getTableAttributes(gridOptions);

    if (results.isOptionValid === true) {
      return true;
    }

    return false;
  };
  /**
   * This API returns table row height based on configured grid option.
   * @param {*} gridOptions : grid options configured in splm table json.
   * @param {*} defaultValue : default value which will be return if grid options does not have any predefined height.
   */


  exports.getTableRowHeight = function (gridOptions, defaultValue) {
    var results = getTableAttributes(gridOptions);

    if (results.rowHeight === null) {
      return defaultValue;
    }

    return results.rowHeight;
  };
  /**
   * This API returns table row height for icon cell renderer based on configured grid option.
   * @param {*} gridOptions : grid options configured in splm table json.
   * @param {*} defaultValue : default value which will be return if grid options does not have any predefined height.
   */


  exports.getTableRowHeightForIconCellRenderer = function (gridOptions, defaultValue) {
    var results = getTableAttributes(gridOptions);

    if (results.iconCellRendererHeight === null) {
      return defaultValue;
    }

    return results.iconCellRendererHeight;
  };
  /**
   * This API adds class to css class list of the element based on row height grid option.
   * @param {*} element elements in which we need to add css class.
   * @param {*} gridOptions grid options configured in json.
   */


  exports.addCSSClassForRowHeight = function (element, gridOptions) {
    var results = getTableAttributes(gridOptions);

    if (results.isOptionValid) {
      var classes = results.classes;

      for (var index = 0; index < classes.length; index++) {
        element.classList.add(classes[index]);
      }
    }
  };
  /**
   * Get number from string
   *
   * @param {String} prop - number string
   *
   * @return {Number} number parse from string
   */


  exports.numericProperty = function (prop) {
    var value = !prop ? undefined : parseInt(prop);
    return isNaN(value) ? undefined : value;
  };
  /**
   *
   * Returns the String CSS class name for the passed in columnName based on the passed in sort criteria
   *
   * @param {Object} columnDef - columnDef object
   *
   * @param { Object } columnProvider - The column provider
   *
   * @return {Object} Object to define sort criteria
   */


  exports.getSortCriteria = function (columnDef, columnProvider) {
    var sortCriteria = columnProvider.sortCriteria;

    var foundCriteria = _.find(sortCriteria, function (o) {
      return o.fieldName === columnDef.name || o.fieldName === columnDef.field;
    });

    if (foundCriteria) {
      return foundCriteria;
    }

    return {};
  };
  /**
   *
   * Sets the sort criteria on the dataProvider columns
   *
   * @param { Object } columnProvider - The column provider
   *
   * @param { Object } dataProvider - The data provider
   */


  exports.setSortCriteriaOnColumns = function (columnProvider, dataProvider) {
    columnProvider.sortCriteria = columnProvider.getSortCriteria();
    var _length = dataProvider.cols.length;

    for (var i = 0; i < _length; i++) {
      var columnDef = dataProvider.cols[i];
      dataProvider.cols[i].sortDirection = exports.getSortCriteria(columnDef, columnProvider).sortDirection;
    }
  };

  exports.getImgURL = function (vmo) {
    var url = '';

    if (vmo.hasThumbnail) {
      url = vmo.thumbnailURL;
    } else if (vmo.typeIconURL) {
      url = vmo.typeIconURL;
    } else if (vmo.iconURL) {
      url = vmo.iconURL;
    }

    return url;
  };

  _t.util = exports;
  return _t;
});