"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module provides methods to process data parse configurations in the Declarative View Model
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined in this module is
 * injected by AngularJS.
 *
 * @module js/dataMapperService
 */
define(['app', 'assert', 'lodash', 'js/logger', 'js/declarativeDataCtxService', 'js/uwPropertyService', 'js/dateTimeService'], function (app, assert, _, logger) {
  'use strict';
  /**
   * Cached reference to dependent services
   */

  var _declarativeDataCtxSvc = null;
  var _uwPropertySvc = null;
  var _dateTimeSvc = null;
  /**
   * Define the base object used to provide all of this module's external API on.
   *
   * @private
   */

  var exports = {};
  /**
   * Check if valid prop type
   * @param {String} type - Property type string
   */

  var isValidPropType = function isValidPropType(type) {
    return /^(BOOLEAN|DATE|DATETIME|DOUBLE|INTEGER|STRING)$/.test(type);
  };
  /**
   * Check if valid array prop type
   * @param {String} type - Property type string
   */


  var isValidArrayPropType = function isValidArrayPropType(type) {
    return /^(BOOLEAN|DATE|DATETIME|DOUBLE|INTEGER|STRING)ARRAY$/.test(type);
  };
  /**
   * @param {String} propType - The property type
   * @param {Boolean} isArray - If the property is of array type
   * @returns {String} - The correct property type
   */


  var getPropertyType = function getPropertyType(propType, isArray) {
    propType = propType.toUpperCase();

    if (isArray) {
      if (isValidArrayPropType(propType)) {
        return propType;
      } else if (isValidPropType(propType)) {
        return propType + 'ARRAY';
      }
    } else {
      if (isValidPropType(propType)) {
        return propType;
      }
    }

    logger.warn('Unknown property type ' + propType);
    return 'UNKNOWN';
  };
  /**
   *
   * @param {String} propType - The property type
   * @param {*} propVal - The property value as defined in definition
   * @param {*} propDispVal - The property display value as defined in definition
   * @returns {Object} - Object containing value and display value
   */


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
          if (_.isArray(propVal) && propVal.length > 0 || isFinite(propVal) && propVal !== null && propVal !== '' && !_.isArray(propVal)) {
            objToReturn.value = new Number(propVal);

            if (_.isString(propDispVal)) {
              objToReturn.displayValue = propDispVal;
            } else {
              objToReturn.displayValue = new String(propDispVal);
            }
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
   * Convert one single response object to afx object
   *
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context.
   * @param {Object} dataParseDefinition - The data parse definition
   * @param {Object} dataCtxNode - The data context node.
   * @param {Object} depModuleObj - The dependent module
   * @returns {Object} - AfxObject containing view model properties
   */


  var convertResponseObjToAfxObj = function convertResponseObjToAfxObj(declViewModel, dataParseDefinition, dataCtxNode, depModuleObj) {
    var functionsList = declViewModel.getFunctions();

    var dataParseDef = _.cloneDeep(dataParseDefinition);

    _declarativeDataCtxSvc.applyScope(declViewModel, dataParseDef, functionsList, dataCtxNode, depModuleObj);

    var afxObject = {
      props: {}
    };

    _.forOwn(dataParseDef, function (val, key) {
      if (key === 'props') {
        _.forOwn(val, function (propDef, propId) {
          var propName = propDef.name;
          var propDisplayName = propDef.displayName || propDef.name;
          var propType = getPropertyType(propDef.type, propDef.isArray);
          var values = getPropertyValues(propType, propDef.value, propDef.displayValue);

          if (propType && propType === 'DATETIME') {
            propType = 'DATE';
          }

          if (propDef.isArray === true) {
            values.value = _.isArray(values.value) ? values.value : [values.value];
          }

          values.displayValue = _.isArray(values.displayValue) ? values.displayValue : [values.displayValue]; // Create the ViewModelProperty

          var vmProp = _uwPropertySvc.createViewModelProperty(propName, propDisplayName, propType, values.value, values.displayValue);

          if (propType === 'DATE') {
            vmProp.dateApi = vmProp.dateApi || {};
            vmProp.dateApi.isDateEnabled = true;
            vmProp.dateApi.isTimeEnabled = false;

            if (propDef.type === 'DATETIME') {
              vmProp.dateApi.isTimeEnabled = true;
            }
          } // Set the other attributes on the ViewModelProperty


          _uwPropertySvc.setHasLov(vmProp, propDef.hasLOV === true);

          _uwPropertySvc.setIsArray(vmProp, propDef.isArray === true);

          _uwPropertySvc.setIsRequired(vmProp, propDef.isRequired === true);

          if (propDef.renderingHint) {
            _uwPropertySvc.setRenderingHint(vmProp, propDef.renderingHint);
          }

          var isEnabled = _.isUndefined(propDef.isEnabled) ? true : !(propDef.isEnabled === false); // default value

          _uwPropertySvc.setIsEnabled(vmProp, isEnabled);

          var maxLength = _.isUndefined(propDef.maxLength) ? 0 : propDef.maxLength;

          _uwPropertySvc.setLength(vmProp, maxLength);

          var isEditable = _.isUndefined(propDef.isEditable) ? false : propDef.isEditable; // By default, each property is non-editable

          _uwPropertySvc.setIsEditable(vmProp, isEditable);

          var isModifiable = _.isUndefined(propDef.isModifiable) ? true : propDef.isModifiable; // By default, each property is modifiable

          _uwPropertySvc.setIsPropertyModifiable(vmProp, isModifiable); // If prop has a dataProvider ensure 'hasLov' is 'true' and set LOV-related properties.


          if (propDef.dataProvider) {
            vmProp.dataProvider = propDef.dataProvider;

            _uwPropertySvc.setHasLov(vmProp, true);

            vmProp.emptyLOVEntry = propDef.emptyLOVEntry;
            vmProp.isSelectOnly = propDef.isSelectOnly;
          }

          vmProp.getViewModel = function () {
            return declViewModel;
          };

          afxObject.props[propId] = vmProp;
        });
      } else {
        afxObject[key] = val;
      }
    }); // Identifier


    afxObject.uid = dataParseDef.identifier || Math.floor(Math.random() * 1000 + 1); // Set thumbnail flag

    afxObject.hasThumbnail = afxObject.thumbnailURL !== undefined;
    return afxObject;
  };
  /**
   * Apply the DataParseDefinitions to an array of response objects (as returned from a server).
   * This returns an array of objects which are consumable by various afx widgets.
   *
   * @param {Object} sourceObj - The object to apply dataParseDefinitions
   * @param {DeclViewModel} declViewModel - The 'declViewModel' context.
   * @param {ObjectArray} actionDataParsers - The dataParseDefinitions.
   * @param {Object} dataCtxNode - The data context node.
   * @param {Object} depModuleObj - The dependent module
   * @return {Object} - the modified sourceObj with dataParseDefinition applied
   */


  exports.applyDataParseDefinitions = function (sourceObj, declViewModel, actionDataParsers, dataCtxNode, depModuleObj) {
    if (!_.isArray(actionDataParsers)) {
      return sourceObj;
    }

    _.forEach(actionDataParsers, function (actionDpd) {
      var dataParseDefinition = declViewModel.getDataParseDefinition(actionDpd.id);

      if (_.isUndefined(dataParseDefinition)) {
        logger.warn('Missing DataParseDefinition with id ' + actionDpd.id + ' in DeclViewModel');
        return;
      } // Hold on to the path


      var responseObjsPath = actionDpd.responseObjs;

      var responseObjs = _.get(sourceObj, responseObjsPath);

      var afxObjects = null;

      if (_.isArray(responseObjs)) {
        if (afxObjects === null) {
          afxObjects = [];
        }

        _.forEach(responseObjs, function (responseObj) {
          dataCtxNode.response = responseObj;
          dataCtxNode.i18n = dataCtxNode.i18n || dataCtxNode.data.i18n;
          var afxObject = convertResponseObjToAfxObj(declViewModel, dataParseDefinition, dataCtxNode, depModuleObj);
          delete dataCtxNode.response;
          afxObjects.push(afxObject);
        });
      } else if (_.isObject(responseObjs)) {
        dataCtxNode.response = responseObjs;
        afxObjects = convertResponseObjToAfxObj(declViewModel, dataParseDefinition, dataCtxNode, depModuleObj);
        delete dataCtxNode.response;
      }

      _.set(sourceObj, responseObjsPath, afxObjects);
    });

    return sourceObj;
  };
  /**
   * The data mapper service
   *
   * @member dataMapperService
   * @memberof NgServices
   */


  app.factory('dataMapperService', ['declarativeDataCtxService', 'uwPropertyService', 'dateTimeService', function (declarativeDataCtxSvc, uwPropertySvc, dateTimeSvc) {
    _declarativeDataCtxSvc = declarativeDataCtxSvc;
    _uwPropertySvc = uwPropertySvc;
    _dateTimeSvc = dateTimeSvc;
    return exports;
  }]);
});