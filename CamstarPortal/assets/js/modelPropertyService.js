"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/modelPropertyService
 */
define(['app', 'lodash', //
'js/uwDirectiveBaseUtils', 'js/uwPropertyService', 'soa/kernel/clientDataModel', 'js/propAPIService'], //
function (app, _) {
  'use strict';
  /**
   * Cached reference to the View Model Property Object service
   */

  var _uwPropertySvc = null;
  var _propAPISvc = null;
  var exports = {};
  /**
   * Update the property in the 'target' object with the same value as the 'source' object based on the given
   * 'path' to that property.
   *
   * @param {String} parentPath - Property path to the holder of the value in the 'source' & 'target' Objects.
   *
   * @param {String} attrHolderPropName - Name of the property in the 'propAttrHolder' class to apply.
   *
   * @param {ViewModelObject} sourceObject - The 'source' of the value to apply.
   *
   * @param {ViewModelObject} targetObject - The 'target' the value will be applies to.
   */

  exports.updateProperty = function (parentPath, attrHolderPropName, sourceObject, targetObject) {
    var paths = [];
    var prefix = parentPath + '.';

    switch (attrHolderPropName) {
      case 'dbValue':
        paths.push(prefix + 'dbValues');
        paths.push(prefix + 'dbValue');
        paths.push(prefix + 'value');
        break;

      case 'displayName':
        paths.push(prefix + 'propertyName');
        paths.push(prefix + 'propertyDisplayName');
        break;

      case 'dispValue':
        paths.push(prefix + 'displayValues');
        paths.push(prefix + 'uiValue');
        paths.push(prefix + 'uiValues');
        break;

      case 'isArray':
        paths.push(prefix + 'isArray');
        break;

      case 'isEditable':
        paths.push(prefix + 'isEditable');
        break;

      case 'isRequired':
        paths.push(prefix + 'isRequired');
        break;

      case 'labelPosition':
        paths.push(prefix + 'propertyLabelDisplay');
        break;

      case 'requiredText':
        paths.push(prefix + 'requiredText');
        break;

      case 'type':
        paths.push(prefix + 'type');
        break;
    }

    _.forEach(paths, function (path) {
      var newValue = _.get(sourceObject, path);

      _.set(targetObject, path, newValue);
    });
  };
  /**
   * @param {Object} propAttrHolder - An object that holds the following attributes:
   *
   * <pre>
   *           - {String} displayName - Display name of the property.
   *           - {String} type - {'STRING', 'INTEGER', 'BOOLEAN', 'DATE', 'FLOAT', 'CHAR'}
   *           - {Boolean} isRequired - If the property is required or not
   *           - {Boolean} isEditable - If the Property is editable or not
   *           - {Object} dbValue - Default value
   *           - {String} dispValue - Display Value
   *           - {Object} labelPosition - Position on panel.
   *           - {Boolean} isArray - If the Property is an array or not
   *           - {String} requiredText - The text to display in the required field     *
   * </pre>
   *
   * @return {ViewModelProperty} returns newly created ViewModelProperty
   */


  exports.createViewModelProperty = function (propAttrHolder) {
    // eslint-disable-line

    /**
     * Use the given 'propName' if 'propAttrHolder' has one, else, use the 'displayName' as the 'propName'.
     */
    var displayName = _.isUndefined(propAttrHolder.displayName) ? '' : propAttrHolder.displayName;
    var propName = _.isUndefined(propAttrHolder.propName) ? displayName : propAttrHolder.propName;
    var type = propAttrHolder.type;
    var hasLov = false;
    var isArray = _.isBoolean(propAttrHolder.isArray) ? propAttrHolder.isArray : propAttrHolder.isArray === 'true';
    var isAutoAssignable = false;
    var isEditable = _.isBoolean(propAttrHolder.isEditable) ? propAttrHolder.isEditable : propAttrHolder.isEditable !== 'false';
    var isRequired = _.isBoolean(propAttrHolder.isRequired) ? propAttrHolder.isRequired : propAttrHolder.isRequired === 'true';
    var isLocalizable = false;
    var isNull = false;
    var maxArraySize = -1;
    var maxLength = -1;
    var isRichText = false;
    var displayValues = [];
    var error = null;
    var renderingHint = '';
    var numberOfCharacters = -1;
    var numberOfLines = -1;
    var uw_dbValue = propAttrHolder.dbValue;
    var requiredText = propAttrHolder.requiredText;
    var isSelectOnly = false;

    if (!uw_dbValue && type === 'DATE' || propAttrHolder.type === 'DATETIME') {
      if (uw_dbValue !== '' && !isNaN(Date.parse(uw_dbValue))) {
        var date = new Date(uw_dbValue);
        uw_dbValue = date.getTime();
      }

      type = 'DATE';
    }

    if (!_.isUndefined(propAttrHolder.dispValue)) {
      if (_.isArray(propAttrHolder.dispValue)) {
        displayValues = propAttrHolder.dispValue;
      } else {
        displayValues.push(propAttrHolder.dispValue);
      }
    }
    /**
     * If this is an array property, and the type does not contain the 'ARRAY' postfix, add it automatically.
     */


    if (isArray && type && type.search('ARRAY') === -1) {
      type += 'ARRAY';
    }

    if (propAttrHolder.hasLov) {
      hasLov = true;
    }

    if (propAttrHolder.isSelectOnly && propAttrHolder.hasLov) {
      isSelectOnly = true;
    }

    var viewProp = _uwPropertySvc.createViewModelProperty(propName, displayName, type, uw_dbValue, displayValues);

    _uwPropertySvc.setHasLov(viewProp, hasLov, true);

    _uwPropertySvc.setIsArray(viewProp, isArray, true);

    _uwPropertySvc.setIsAutoAssignable(viewProp, isAutoAssignable, true);

    _uwPropertySvc.setIsEditable(viewProp, isEditable, true);

    _uwPropertySvc.setIsRichText(viewProp, isRichText, true);

    _uwPropertySvc.setIsEnabled(viewProp, isEditable, true);

    _uwPropertySvc.setIsLocalizable(viewProp, isLocalizable, true);

    _uwPropertySvc.setIsNull(viewProp, isNull, true);

    _uwPropertySvc.setIsRequired(viewProp, isRequired, true);

    _uwPropertySvc.setLength(viewProp, maxLength, true);

    _uwPropertySvc.setRenderingHint(viewProp, renderingHint, true);

    _uwPropertySvc.setError(viewProp, error);

    _uwPropertySvc.setNumberOfCharacters(viewProp, numberOfCharacters);

    _uwPropertySvc.setNumberOfLines(viewProp, numberOfLines);

    _uwPropertySvc.setArrayLength(viewProp, maxArraySize);

    if (isSelectOnly) {
      _uwPropertySvc.setIsSelectOnly(viewProp, isSelectOnly, true);
    } // only override if requiredText is provided


    if (requiredText) {
      _uwPropertySvc.setPlaceHolderText(viewProp, requiredText);
    }

    _propAPISvc.createPropAPI(viewProp);

    if (type === 'DATE') {
      viewProp.dateApi = viewProp.dateApi || {};
      viewProp.dateApi.isDateEnabled = true;
      viewProp.dateApi.isTimeEnabled = false;

      if (propAttrHolder.type === 'DATETIME') {
        viewProp.dateApi.isTimeEnabled = true;
      }
    }

    if (type === 'DATETIME') {
      viewProp.dateApi = viewProp.dateApi || {};
      viewProp.dateApi.isDateEnabled = true;
      viewProp.dateApi.isTimeEnabled = true;
    }

    if (propAttrHolder.dbValue) {
      viewProp.dbValues = propAttrHolder.dbValue;
    } else {
      viewProp.dbValues = [];
    }

    if (propAttrHolder.dispValue) {
      viewProp.uiValues = displayValues;
    } else {
      viewProp.uiValues = [];
    }

    if (viewProp.uiValues.length > 0) {
      viewProp.uiValue = viewProp.uiValues.join();
    } else {
      viewProp.uiValue = '';
    }

    viewProp.initialize = false;

    if (propAttrHolder.labelPosition) {
      _uwPropertySvc.setPropertyLabelDisplay(viewProp, propAttrHolder.labelPosition, true);

      if (propAttrHolder.labelPosition === 'PROPERTY_LABEL_AT_SIDE') {
        viewProp.editLayoutSide = true;
      }
    } // Add pattern information


    if (propAttrHolder.patterns) {
      viewProp.patterns = propAttrHolder.patterns;

      if (propAttrHolder.preferredPattern) {
        viewProp.preferredPattern = propAttrHolder.preferredPattern;
      }

      if (propAttrHolder.condition) {
        viewProp.condition = propAttrHolder.condition;
      }
    }

    return viewProp;
  };
  /**
   * Service to define for creating the model data in view model format in panel.
   *
   * @member modelPropertyService
   * @memberof NgServices
   */


  app.factory('modelPropertyService', //
  ['uwPropertyService', 'propAPIService', //
  function (uwPropertySvc, propAPISvc) {
    _uwPropertySvc = uwPropertySvc;
    _propAPISvc = propAPISvc;
    return exports;
  }]);
});