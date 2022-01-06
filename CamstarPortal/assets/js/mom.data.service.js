"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2019 Siemens AG

/**
 * Provides a set of utility methods that can be used to manipulate data and produce ViewModelProperty objects.
 * @module "js/mom.data.service"
 * @requires app
 * @requires jquery
 * @requires lodash
 * @requires js/logger
 * @requires js/declUtils
 * @requires js/uwPropertyService
 * @requires js/dateTimeService
 * @requires js/actionService
 */

/* eslint-disable valid-jsdoc */

/*global
 define
 */
define(['app', 'jquery', 'lodash', 'js/logger', 'js/declUtils', 'js/uwPropertyService', 'js/dateTimeService', 'js/actionService'], //
function (app, $, _, logger, declUtils) {
  'use strict';

  var exports = {};

  var _uwPropertySvc;

  var _dateTimeSvc;

  var _actionSvc;

  var innerReduceFunction = function innerReduceFunction(acc, curr) {
    var currentDataType = getScalarDataType(curr);

    if (acc === currentDataType) {
      return acc;
    }

    if (acc === 'INTEGER' && currentDataType === 'DOUBLE' || acc === 'DOUBLE' && currentDataType === 'INTEGER') {
      return 'DOUBLE';
    }

    return 'OBJECT';
  };

  var getScalarDataType = function getScalarDataType(value) {
    var dataType = 'OBJECT';

    if (_typeof(value) === _typeof('')) {
      //TODO: ensure that char is really used, may be better to return always string?
      dataType = 'STRING';
    } else if (_typeof(value) === _typeof(true)) {
      dataType = 'BOOLEAN';
    } else if (Object.prototype.toString.call(value) === '[object Date]' && Boolean(Date.parse(value))) {
      //TODO: when data belongs to "DATETIME" type?
      dataType = "DATE";
    } else if ($.isNumeric(value)) {
      if (Number.isInteger(value)) {
        dataType = "INTEGER";
      } else {
        dataType = "DOUBLE";
      }
    }

    return dataType;
  };

  var getPropertyValues = function getPropertyValues(propType, propVal, propDispVal) {
    var objToReturn = {
      value: null,
      displayValue: null
    };

    switch (propType) {
      case 'DATE':
        {
          objToReturn.value = new Date(propVal).getTime();
          objToReturn.displayValue = _dateTimeSvc.formatDate(new Date(propDispVal).getTime());
          break;
        }

      case 'DATETIME':
        {
          objToReturn.value = new Date(propVal).getTime();
          objToReturn.displayValue = _dateTimeSvc.formatSessionDateTime(new Date(propDispVal).getTime());
          break;
        }

      case 'INTEGER':
      case 'DOUBLE':
        {
          objToReturn.value = new Number(propVal);

          if (_.isString(propDispVal)) {
            objToReturn.displayValue = propDispVal;
          } else {
            objToReturn.displayValue = new String(propDispVal);
          }

          break;
        }

      default:
        {
          objToReturn.value = propVal;
          objToReturn.displayValue = propDispVal;
          break;
        }
    }

    return objToReturn;
  };
  /**
   *  Determines the type of **value** and returns its Apollo type.
   *  @param {*} value - The argument wich type has to be detected. It could be either a scalar or vector.
   *  @returns {String } A type identifier recognized by Apollo.
   */


  exports.getType = function (value) {
    // These are all the types found in the Apollo source code, some of them will be not managed...
    // "OBJECT", "STRING", "CHAR", "BOOLEAN", "DATE", <<"DATETIME">>, <<"FLOAT">>, "INTEGER", "DOUBLE"
    // "DATEARRAY", "INTEGERARRAY", "DOUBLEARRAY", "BOOLEANARRAY", "OBJECTARRAY"
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new RangeError("When the value is an array, it has to contain at least an item.");
      }

      return value.reduce(innerReduceFunction, getScalarDataType(value[0])) + 'ARRAY';
    }

    return getScalarDataType(value);
  };
  /* eslint-disable complexity */

  /**
   * Creates a ViewModelProperty object.
   *
   * The following fields have some *smart defaults*:
   *
   * * **propertyDisplayName** &mdash; Defaults to the **name** of the property.
   * * **uiValue** &mdash; Defaults to the **value** of the property.
   * * **type** &mdash; Inferred automatically by calling the [getType](#.getType) method.
   * * **isArray** &mdash; Set to **true** if the value is an array.
   * * **isEnabled** &mdash; Set to **true** by default.
   * * **isEditable** &mdash; Set to **true** by default.
   * * **isPropertyModifiable** &mdash; Set to **false** by default.
   * * **isRequired** &mdash; Set to **false** by default.
   *
   * > **Tip:** For more informations on what fields can be configured for ViewModelProperty objects, see the [ViewModelProperty Object Reference](https://gitlab.industrysoftware.automation.siemens.com/mom/mom-ui/wikis/ViewModelProperty-object-reference) page on the MOM UI wiki.
   * @param {String} name The name/identifier of the property.
   * @param {*} value The value of the property.
   * @param {Object} def An object containing additional ViewModelProperty fields to be added to the property.
   * @param {DeclViewModel} vm A reference to the current ViewModel (necessary only if the **dataProvider** field is specified).
   * @returns {ViewModelProperty} A valid ViewModelProperty object.
   */


  exports.vmProp = function (name, value, def, vm) {
    var definition = def || {};
    var propName = name;
    var propDisplayName = definition.propertyDisplayName || definition.displayName || definition.name || name;
    var val = value || definition.dbValue || definition.value;
    var displayVal = definition.uiValue || definition.displayValue || new String(val);
    var modifiable = definition.isPropertyModifiable || definition.isModifiable;
    var propType = definition.type || exports.getType(value);
    var values = getPropertyValues(propType, val, displayVal);

    if (definition.isArray === true) {
      values.value = _.isArray(values.value) ? values.value : [values.value];
    }

    values.displayValue = _.isArray(values.displayValue) ? values.displayValue : [values.displayValue];

    var prop = _uwPropertySvc.createViewModelProperty(propName, propDisplayName, propType, values.value, values.displayValue);

    if (propType === 'DATE') {
      prop.dateApi = prop.dateApi || {};
      prop.dateApi.isDateEnabled = true;
      prop.dateApi.isTimeEnabled = false;
    } else if (propType === 'DATETIME') {
      prop.dateApi = prop.dateApi || {};
      prop.dateApi.isDateEnabled = true;
      prop.dateApi.isTimeEnabled = true;
    }

    _uwPropertySvc.setHasLov(prop, definition.hasLOV === true);

    _uwPropertySvc.setIsArray(prop, val instanceof Array || definition.isArray === true);

    _uwPropertySvc.setIsRequired(prop, definition.isRequired === true);

    if (definition.renderingHint) {
      _uwPropertySvc.setRenderingHint(prop, definition.renderingHint);
    }

    var isEnabled = _.isUndefined(definition.isEnabled) ? true : !(definition.isEnabled === false);

    _uwPropertySvc.setIsEnabled(prop, isEnabled);

    var maxLength = _.isUndefined(definition.maxLength) ? 0 : definition.maxLength;

    _uwPropertySvc.setLength(prop, maxLength);

    var isEditable = _.isUndefined(definition.isEditable) ? false : definition.isEditable;

    _uwPropertySvc.setIsEditable(prop, isEditable);

    var isModifiable = _.isUndefined(modifiable) ? true : modifiable;

    _uwPropertySvc.setIsPropertyModifiable(prop, isModifiable);

    if (definition.dataProvider) {
      prop.dataProvider = definition.dataProvider;

      _uwPropertySvc.setHasLov(prop, true);

      prop.emptyLOVEntry = _.isUndefined(definition.emptyLOVEntry) ? true : definition.emptyLOVEntry;
      prop.isSelectOnly = definition.isSelectOnly;

      prop.getViewModel = function () {
        return vm;
      };
    } // Set all properties specified via the definition (overriding defaults)


    Object.keys(definition).forEach(function (field) {
      prop[field] = definition[field];
    });
    return prop;
  };
  /**
   * Converts an object **obj** into a dictionary of ViewModelProperty objects by applying the property definition object **def** to each
   *  value, and automatically setting each property name to the corresponding object key.
   * @param {Object} obj The object to convert.
   * @param {Object} def An object containing additional ViewModelProperty fields to be added to each property.
   * @param {DeclViewModel} vm A reference to the current ViewModel (necessary only if the **dataProvider** field is specified).
   * @returns {Object.<string, ViewModelProperty>} A dictionary of ViewModelProperty objects.
   */


  exports.vmPropObj = function (obj, def, vm) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
      result[key] = exports.vmProp(key, obj[key], def || {}, vm);
    });
    return result;
  };
  /**
   * Sets the edit state of ViewModelProperty. If the property is editable and editable in view model then the
   * **isEditable** flag is set to true which shows the properties as editable.
   *
   * @param {ViewModelProperty} vmProp A ViewModelProperty object that will be updated.
   * @param {Boolean} editable Sets edit state of ViewModelProperty.
   * @param {Boolean} override TRUE if the editing state should be updated an announced even if not currently
   *            different than the desired state.
   */


  exports.setEditState = function (vmProp, editable, override) {
    return _uwPropertySvc.setEditState(vmProp, editable, override);
  };
  /**
   * Resets the value of a property to its original value.
   *
   * @param {ViewModelProperty} vmProp A ViewModelProperty object that will be updated.
   */


  exports.resetUpdates = function (vmProp) {
    return _uwPropertySvc.resetUpdates(vmProp);
  };
  /**
   * Set the **error** field of a ViewModelProperty object and notifies changes.
   *
   * @param {ViewModelProperty} vmProp A ViewModelProperty object that will be updated.
   * @param {String} error - The message that should be displayed when some aspect of the property's value is not
   *            correct. This value must be 'null' or an empty string to not have the error be displayed.
   */


  exports.setError = function (vmProp, error) {
    return _uwPropertySvc.setError(vmProp, error);
  };
  /**
   * Set the value of a ViewModelProperty object along with all related fields, and notifies changes.
   *
   * @param {ViewModelProperty} vmProp A ViewModelProperty object that will be updated.
   * @param {*} value The new value of the property.
   * @returns {ViewModelProperty} The input ViewModelProperty object with the new value set.
   */


  exports.setValue = function (vmProp, value) {
    return _uwPropertySvc.setValue(vmProp, value);
  };
  /**
   * Iterates over the keys of the **values** object and sets each value as te new value of the ViewModelProperty object stored
   * at the corresponding key of the **obj** object.
   * @param {Object.<string, ViewModelProperty>} obj A dictionary of ViewModelProperty objects.
   * @param {Object.<string, *>} values A dictionary of values to set for **obj** properties.
   * @returns {Object.<string, ViewModelProperty>} The input dictionary of ViewModelProperty objects with the new values set.
   */


  exports.setObjectValues = function (obj, values) {
    Object.keys(values).forEach(function (key) {
      _uwPropertySvc.setValue(obj[key], values[key]);
    });
    return obj;
  };

  app.factory('momDataService', ['uwPropertyService', 'dateTimeService', 'actionService', function (uwPropertyService, dateTimeService, actionService) {
    _uwPropertySvc = uwPropertyService;
    _dateTimeSvc = dateTimeService;
    _actionSvc = actionService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momDataService'
  };
});