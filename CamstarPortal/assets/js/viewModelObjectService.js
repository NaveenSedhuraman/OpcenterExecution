"use strict";

/* eslint-disable max-lines */
// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module provides access to service APIs that help to convert the model object to view model object
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/viewModelObjectService
 */
define(['app', 'jquery', 'lodash', 'js/logger', 'js/declUtils', 'js/parsingUtils', 'js/eventBus', 'js/visualIndicatorService', 'soa/kernel/clientDataModel', 'js/uwPropertyService', 'js/lovService', 'js/colorDecoratorService', 'soa/kernel/clientMetaModel', 'soa/kernel/soaService', 'js/awIconService'], function (app, $, _, logger, declUtils, parsingUtils, eventBus) {
  'use strict';

  var _$q;

  var _vmPropSvc;

  var _cdm;

  var _lovSvc;

  var _visualIndicatorSvc;

  var _colorDecoratorSvc;

  var _cmm;

  var _soaSvc;

  var _awIconSvc;
  /**
   * Get view model property type based on the value type and array flag.
   *
   * @private
   *
   * @param {Integer} valueType - The valueType for this property
   * @param {Boolean} isArray - array flag
   *
   * @return {propertyType} propertyType based off the integer value of valueType (String/Double/char etc.)
   */


  var getClientPropertyType = function getClientPropertyType(valueType, isArray) {
    // eslint-disable-line complexity
    var propertyType;

    switch (valueType) {
      case 1:
        if (isArray) {
          propertyType = 'STRINGARRAY';
        } else {
          propertyType = 'CHAR';
        }

        break;

      case 2:
        if (isArray) {
          propertyType = 'DATEARRAY';
        } else {
          propertyType = 'DATE';
        }

        break;

      case 3:
      case 4:
        if (isArray) {
          propertyType = 'DOUBLEARRAY';
        } else {
          propertyType = 'DOUBLE';
        }

        break;

      case 5:
        if (isArray) {
          propertyType = 'INTEGERARRAY';
        } else {
          propertyType = 'INTEGER';
        }

        break;

      case 6:
        if (isArray) {
          propertyType = 'BOOLEANARRAY';
        } else {
          propertyType = 'BOOLEAN';
        }

        break;

      case 7:
        if (isArray) {
          propertyType = 'INTEGERARRAY';
        } else {
          propertyType = 'SHORT';
        }

        break;

      case 8:
        if (isArray) {
          propertyType = 'STRINGARRAY';
        } else {
          propertyType = 'STRING';
        }

        break;

      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
        if (isArray) {
          propertyType = 'OBJECTARRAY';
        } else {
          propertyType = 'OBJECT';
        }

        break;

      default:
        propertyType = 'UNKNOWN';
        break;
    }

    return propertyType;
  };
  /**
   * Update this model object's awp cell properties which are stored as key/value inside an array property
   * awp0CellProperties.
   *
   * @param {ViewModelObject} viewModelObject - The object to update properties on.
   */


  var updateCellProperties = function updateCellProperties(viewModelObject) {
    /**
     * Pull any cell properties out of their encoded string and have them as 1st class properties of the
     * ViewModelObject.
     */
    if (viewModelObject.props && viewModelObject.props.awp0CellProperties) {
      // We should look up for dbValue always,'dbValues' is redundant and need to cleanup any dependency on that
      // dbValue could be array or string based on the mode object
      var dbValue = viewModelObject.props.awp0CellProperties.dbValue;
      viewModelObject.cellProperties = {};

      for (var ii = 0; ii < dbValue.length; ii++) {
        var keyValue = dbValue[ii].split('\\:');
        var value = keyValue[1] || '';
        value = value.replace('{__UTC_DATE_TIME}', '');

        if (ii === 0) {
          viewModelObject.cellHeader1 = value;
        } else if (ii === 1) {
          viewModelObject.cellHeader2 = value;
        } else if (value) {
          var key = keyValue[0];
          viewModelObject.cellProperties[key] = {
            key: key,
            value: value
          };
        }
      }
    }
  };
  /**
   * Update this model object's Thumbnail URL based on the FMS ticket stored in the awp0ThumbnailImageTicket property
   *
   * @param {ViewModelObject} viewModelObject - The object to update properties on.
   */


  var updateIcons = function updateIcons(viewModelObject) {
    if (viewModelObject && viewModelObject.props) {
      viewModelObject.thumbnailURL = _awIconSvc.getThumbnailFileUrl(viewModelObject);
      viewModelObject.typeIconURL = _awIconSvc.getTypeIconFileUrl(viewModelObject);

      if (viewModelObject.thumbnailURL) {
        viewModelObject.hasThumbnail = true;
      } else {
        viewModelObject.hasThumbnail = false;
      }
    }
  };
  /**
   * Update this model object's status indicators
   *
   * @param {ViewModelObject} viewModelObject - The object to update properties on.
   */


  var updateStatusIndicators = function updateStatusIndicators(viewModelObject) {
    if (viewModelObject.props) {
      // Since we dont want to add another dependency in _visualIndicatorSvc on cdm, we are passing callback here
      // This will be called from _visualIndicatorSvc when there is a need to get model object from UID.
      var getObjCb = getModelObject;
      var adaptedVmo = viewModelObject;

      if (viewModelObject.type === 'Awp0XRTObjectSetRow') {
        // Get underlying target object's UID if 'awp0Target' property exists
        if (viewModelObject.props && viewModelObject.props.awp0Target) {
          var targetUID = viewModelObject.props.awp0Target.dbValue;

          var targetMO = _cdm.getObject(targetUID);

          if (targetMO) {
            adaptedVmo = exports.createViewModelObjectForProps(targetMO.uid, 'EDIT');
          }
        }
      }

      var indicators = _visualIndicatorSvc.getVisualIndicators(adaptedVmo, getObjCb);

      viewModelObject.indicators = indicators;
    }
  };
  /**
   * Get Model object from uid
   *
   * @param {String} uid - The UID of the object whose Model object is required
   */


  var getModelObject = function getModelObject(uid) {
    return _cdm.getObject(uid);
  };
  /**
   * Update this model object's status indicators
   *
   * @param {ViewModelObject|ViewModelObjectArray} vmoIn - The object(s) to update properties on.
   * @param {Boolean} skipEvent - if true will skip event.
   */


  var updateColorDecorators = function updateColorDecorators(vmoIn, skipEvent) {
    _colorDecoratorSvc.setDecoratorStyles(vmoIn, skipEvent);
  };
  /**
   * @param {Object} prop -
   * @param {String} propName -
   * @param {String} operationName -
   * @param {ViewModelObject} refModelObject -
   * @param {ViewModelObject} owningObj -
   * @param {String} owningObjUid -
   * @param {Object} serverVMO -
   *
   * @returns {ViewModelProperty} New object initialized with the given data.
   */


  var createViewModelPropertyFromModelObjectProperty = function createViewModelPropertyFromModelObjectProperty(prop, propName, operationName, refModelObject, // eslint-disable-line
  owningObj, owningObjUid, serverVMO) {
    var hasServerVMO = serverVMO && serverVMO.props && serverVMO.props.hasOwnProperty(propName);
    var propDesc = prop.propertyDescriptor;
    var isArray = false;
    var propType;
    var displayName;
    var initialValue;
    var isEditable = false;
    var isModifable = false;
    var isRequired = false;
    var isAutoAssignable = false;
    var isRichText = false;
    var isEnabled = true; // default value

    var referenceTypeName = ''; // default value

    var maxLength = 0;
    var hasLov; // We can't rely on prop.hasLOV for object based LOVs, the decision there is to render LOV widget based on
    // propDesc.lovCategory

    if (!declUtils.isNil(prop.hasLOV)) {
      hasLov = prop.hasLOV;
    } else {
      hasLov = propDesc && propDesc.lovCategory > 0;
    }

    if (hasServerVMO) {
      isArray = prop.isArray === true;
      propType = getClientPropertyType(prop.type, isArray);
      displayName = prop.propertyDisplayName ? prop.propertyDisplayName : null;
      maxLength = prop.maxLength;
      initialValue = prop.initialValue ? prop.initialValue : null;
      isEditable = prop.isEditable === true;
      isModifable = prop.isModifiable === true;
      isRequired = prop.required === true;
      isAutoAssignable = prop.isAutoAssignable === true;
      isRichText = prop.isRichText === true;
      isEnabled = !(prop.isEnabled === false);
      referenceTypeName = prop.ReferencedTypeName ? prop.ReferencedTypeName : '';
    } else {
      var constantsMap;

      if (propDesc) {
        isArray = propDesc.anArray;
        propType = getClientPropertyType(propDesc.valueType, isArray);
        displayName = propDesc.displayName;
        maxLength = propDesc.maxLength;
        constantsMap = propDesc.constantsMap;
      }

      if (constantsMap) {
        initialValue = constantsMap.initialValue;
        isEditable = constantsMap.editable === '1';
        isModifable = constantsMap.modifiable === '1';
        isRequired = constantsMap.required === '1';
        isAutoAssignable = constantsMap.autoassignable === '1';
        isRichText = constantsMap.Fnd0RichText === '1';
        isEnabled = constantsMap.editable ? constantsMap.editable === '1' : true;
        referenceTypeName = constantsMap.ReferencedTypeName || '';
      }
    }

    if (operationName && _.isString(operationName)) {
      if (/^(EDIT|REVISE|CREATE)$/i.test(operationName)) {
        isEditable = prop.modifiable === true;
      } // Set isEnabled flag to 'true' for all properties for SaveAs ,Revise and Create operations.
      // <P>
      // Note: Create panel would require the below change when its converted to declarative.


      if (/^(REVISE|CREATE)$/i.test(operationName)) {
        isEnabled = true;
      }
    }

    var isLocalizable = false;
    var isNull = false;
    var maxArraySize = propDesc && propDesc.maxArraySize ? propDesc.maxArraySize : -1;
    var error = '';
    var renderingHint = '';
    var numberOfCharacters = -1;
    var numberOfLines = -1;
    var uw_dbValue = null;

    if (initialValue && initialValue !== '') {
      uw_dbValue = initialValue;
    }

    var inputDbValues = null;
    var displayValues = null;

    if (prop.isDCP) {
      inputDbValues = prop && prop.dbValues || [];
      displayValues = prop && prop.uiValues || [];
    } else {
      var srcObjProp = getSourceObjectProp(prop, propName, refModelObject);
      inputDbValues = srcObjProp && srcObjProp.dbValues || [];
      displayValues = srcObjProp && srcObjProp.uiValues || [];
    }

    var date;

    if (inputDbValues && inputDbValues.length > 0) {
      if (isArray) {
        uw_dbValue = [];

        for (var i = 0; i < inputDbValues.length; i++) {
          var isCharArray = false;
          /**
           * For character data types, TC server returns character ASCII values as the property internal
           * value. Since AW doesn't differentiate between character and string types, the property object
           * needs to created with display values as internal values. So passing the UI values as internal
           * value.
           */

          if (propType === 'STRINGARRAY') {
            var valueType = !hasServerVMO ? prop.propertyDescriptor.valueType : prop.type;
            isCharArray = valueType === 1;
          }

          if (propType === 'DATEARRAY') {
            date = new Date(inputDbValues[i]);
            uw_dbValue[i] = date.getTime();
          } else if ((propType === 'DOUBLEARRAY' || propType === 'INTEGERARRAY') && inputDbValues[i]) {
            uw_dbValue[i] = Number(inputDbValues[i]);
          } else if (isCharArray && displayValues[i]) {
            uw_dbValue[i] = displayValues[i];
          } else {
            uw_dbValue[i] = inputDbValues[i];
          }
        }
      } else {
        if (propType === 'DATE') {
          // eslint-disable-line no-lonely-if
          date = new Date(inputDbValues[0]);
          uw_dbValue = date.getTime();
        } else if ((propType === 'DOUBLE' || propType === 'INTEGER') && inputDbValues[0]) {
          uw_dbValue = Number(inputDbValues[0]);
        } else if (propType === 'CHAR' && displayValues[0]) {
          uw_dbValue = displayValues[0];
        } else {
          uw_dbValue = inputDbValues[0];
        }
      }
    }

    if (propType === 'CHAR' || (propDesc && propDesc.valueType === 1 || prop.type === 1) && propType === 'STRINGARRAY') {
      maxLength = 1;
    }

    var viewProp = _vmPropSvc.createViewModelProperty(propName, displayName, propType, uw_dbValue, displayValues);

    if (propType === 'STRING' || propType === 'STRINGARRAY') {
      viewProp.inputType = 'text';
    }

    _vmPropSvc.setHasLov(viewProp, hasLov);

    _vmPropSvc.setIsArray(viewProp, isArray);

    _vmPropSvc.setIsAutoAssignable(viewProp, isAutoAssignable);

    _vmPropSvc.setIsEditable(viewProp, isEditable);

    _vmPropSvc.setIsRichText(viewProp, isRichText);

    _vmPropSvc.setIsEnabled(viewProp, isEnabled);

    _vmPropSvc.setIsLocalizable(viewProp, isLocalizable);

    _vmPropSvc.setIsNull(viewProp, isNull);

    _vmPropSvc.setIsRequired(viewProp, isRequired);

    _vmPropSvc.setLength(viewProp, maxLength);

    _vmPropSvc.setRenderingHint(viewProp, renderingHint);

    _vmPropSvc.setError(viewProp, error);

    _vmPropSvc.setNumberOfCharacters(viewProp, numberOfCharacters);

    _vmPropSvc.setNumberOfLines(viewProp, numberOfLines);

    _vmPropSvc.setArrayLength(viewProp, maxArraySize);

    _vmPropSvc.setIsPropertyModifiable(viewProp, isModifable);

    _vmPropSvc.setReferenceType(viewProp, referenceTypeName);

    viewProp.dbValues = inputDbValues;
    viewProp.uiValues = displayValues;
    viewProp.isDCP = prop.isDCP || false;
    viewProp.intermediateObjectUids = prop.intermediateObjectUids;
    viewProp.sourceObjectLastSavedDate = prop.srcObjLsd;
    viewProp.uiValue = _vmPropSvc.getUiValue(viewProp.uiValues);
    viewProp.srcObjectTypeName = prop.srcObjectTypeName;
    viewProp.initialize = false;

    if (propDesc) {
      owningObj.propertyDescriptors[propName] = propDesc;
    }

    viewProp.propertyDescriptor = prop.propertyDescriptor;
    viewProp.parentUid = owningObj.uid;

    if (!viewProp.lovApi && hasLov) {
      _lovSvc.initNativeCellLovApi(viewProp, null, operationName, owningObj, owningObjUid);
    }

    if (!viewProp.propApi) {
      viewProp.propApi = {};
    }

    return viewProp;
  }; // createViewModelPropertyFromModelObjectProperty

  /**
   * Create and return the viewModelPropert from logical property and descriptor.
   *
   * @param {ViewModelObject} viewModelObject - view model object
   * @param {ObjectArray} logicalProperties - logical properties
   * @param {ObjectArray} logicalPropertyDescriptors - logical property descriptors
   * @param {String} operationName - operation name
   *
   * @returns {ViewModelProperty} viewModelProperty build from logical property
   */


  var createViewModelPropertiesWithDescriptors = function createViewModelPropertiesWithDescriptors(viewModelObject, logicalProperties, logicalPropertyDescriptors, operationName) {
    var propertiesWithDescriptors = [];
    var missingPropertyDescriptors = [];
    var logicalPropertyDescriptorsMap = {};

    if (logicalPropertyDescriptors) {
      $.each(logicalPropertyDescriptors, function (index, propertyDescription) {
        logicalPropertyDescriptorsMap[propertyDescription.propertyName] = propertyDescription;
      });
    }

    if ($.isArray(logicalProperties)) {
      $.each(logicalProperties, function (pIndex, property) {
        var viewModelProperty = null;

        if (logicalPropertyDescriptorsMap[property.propertyName]) {
          viewModelProperty = createViewModelPropertyFromLogicalProperty(viewModelObject, property, // eslint-disable-line no-use-before-define
          logicalPropertyDescriptorsMap[property.propertyName], operationName);
        } else {
          viewModelProperty = createViewModelPropertyFromLogicalProperty(viewModelObject, property, // eslint-disable-line no-use-before-define
          null, operationName);
          missingPropertyDescriptors.push(property.propertyName);
        }

        if (viewModelProperty) {
          propertiesWithDescriptors.push(viewModelProperty);
        }
      });
    }

    if (missingPropertyDescriptors.length > 0) {
      logger.info('viewModelObject.createViewModelPropertiesWithDescriptors: ' + 'property descriptor missing for: ' + missingPropertyDescriptors);
    }

    return propertiesWithDescriptors;
  };
  /**
   * Create and return the viewModelProperty from logical property and descriptor.
   *
   * @param {ViewModelObject} viewModelObject - view model object
   * @param {Object} logicalProperty - logical property
   * @param {Object} logicalPropertyDescriptor - logical property descriptor
   * @param {String} operationName - operation name
   *
   * @returns {ViewModelProperty} viewModelProperty build from logical property
   */


  var createViewModelPropertyFromLogicalProperty = function createViewModelPropertyFromLogicalProperty(viewModelObject, logicalProperty, // eslint-disable-line complexity
  logicalPropertyDescriptor, operationName) {
    var currentPropertyDescriptor = null;
    var isAutoAssignable = false;
    var isEnabled = true;
    var isLocalizable = false;
    var isNull = false;
    var isRichText = false;
    var displayValues = [];
    var error = '';
    var renderingHint = '';
    var numberOfCharacters = -1;
    var numberOfLines = -1;
    var maxArraySize = -1;
    var propType = 'UNKNOWN';
    var displayName = logicalProperty.propertyName;
    var hasLov = false;
    var isArray = false;
    var isModifable = logicalProperty.isModifiable === true;
    var isEditable = false;
    var isRequired = false;
    var maxLength = 0;
    var uw_dbValue = null;
    var isDisplayable = true;
    var isDCP = false;
    var referenceTypeName = '';
    var srcObj = null;
    var propertyName = logicalProperty.propertyName;

    if (viewModelObject.props && viewModelObject.props[logicalProperty.propertyName]) {
      currentPropertyDescriptor = viewModelObject.props[logicalProperty.propertyName].propertyDescriptor;
    }

    if (logicalPropertyDescriptor) {
      isDCP = logicalPropertyDescriptor.propConstants !== null && logicalPropertyDescriptor.propConstants.isDCP === 'true';
    } // Only use the new logical property descriptor if DCP property There is a problem with the SOA request only
    // sending back property descriptors for a column, not cell Cell property descriptors are needed for properties
    // that have different valueTypes in the same column


    if (isDCP) {
      currentPropertyDescriptor = logicalPropertyDescriptor;
      viewModelObject.propertyDescriptors[currentPropertyDescriptor.propertyName] = currentPropertyDescriptor;
      isArray = logicalPropertyDescriptor.isArray || isArray;
      propType = getClientPropertyType(logicalPropertyDescriptor.valueType, isArray) || propType;
      displayName = logicalPropertyDescriptor.displayName || displayName;
      hasLov = logicalPropertyDescriptor.lov !== null && logicalPropertyDescriptor.lov.objectID !== '';
      maxLength = logicalPropertyDescriptor.maxLength || maxLength;

      if (logicalPropertyDescriptor.propConstants !== null) {
        isDisplayable = logicalPropertyDescriptor.propConstants.displayable === 'true';
        isRequired = logicalPropertyDescriptor.propConstants.required === 'true';
        isRichText = logicalPropertyDescriptor.propConstants.Fnd0RichText === 'true';
        isEnabled = logicalPropertyDescriptor.propConstants.editable === 'true';
        referenceTypeName = logicalPropertyDescriptor.propConstants.ReferencedTypeName;
      }
    } else {
      // For Non DCP properties get the source object from cdm.
      if (!_.isEmpty(logicalProperty.intermediateObjectUids)) {
        srcObj = _cdm.getObject(logicalProperty.intermediateObjectUids[0]);
      } else {
        srcObj = _cdm.getObject(viewModelObject.uid);
      } // In case of relation properties , the logical property name would be something like
      // "Mat1UsesSubstance.mat1composition" . we need to only read the "mat1composition" property from the
      // srcObj.


      if (propertyName.indexOf('.') > 0) {
        propertyName = propertyName.split('.').slice(-1).pop();
      } // if the property descriptor is not available then grab it from the source object.


      if (!currentPropertyDescriptor && srcObj && srcObj.props && srcObj.props.hasOwnProperty(propertyName)) {
        currentPropertyDescriptor = srcObj.props[propertyName].propertyDescriptor;
      }

      if (currentPropertyDescriptor) {
        viewModelObject.propertyDescriptors[currentPropertyDescriptor.name] = currentPropertyDescriptor; // Since we are creating a logical property, we need the descriptor to be like a logical descriptor

        currentPropertyDescriptor.isArray = currentPropertyDescriptor.anArray;
        currentPropertyDescriptor.propertyName = currentPropertyDescriptor.name;
        currentPropertyDescriptor.propConstants = currentPropertyDescriptor.constantsMap;
        isArray = currentPropertyDescriptor.anArray || isArray;
        propType = getClientPropertyType(currentPropertyDescriptor.valueType, isArray) || propType;
        displayName = currentPropertyDescriptor.displayName || displayName;
        hasLov = currentPropertyDescriptor.lovCategory > 0;
        maxLength = currentPropertyDescriptor.maxLength || maxLength;
        var constantsMap = currentPropertyDescriptor.constantsMap;

        if (constantsMap) {
          isDisplayable = constantsMap.displayable === '1';
          isRequired = constantsMap.required === '1';
          isRichText = constantsMap.Fnd0RichText === '1';
          isEnabled = constantsMap.editable === '1';
          referenceTypeName = constantsMap.ReferencedTypeName;
        }
      }
    } // The view model property structure is different for performSearhViewModel and getStyleSheet3. Temporarily
    // adding a fix to support both.
    // <P>
    // The view Model Property structure in getStyleSheet3 response should be made similar to the one in
    // performviewModelSearch .


    var dbValues = null;

    if (isDCP) {
      dbValues = logicalProperty.values || logicalProperty.dbValues || [];
      displayValues = logicalProperty.displayValues || logicalProperty.uiValues || [];
      hasLov = logicalPropertyDescriptor.lov !== null && logicalPropertyDescriptor.lov.objectID !== '';
    } else {
      // For non-DCP property, get the property values from model object
      if (srcObj && srcObj.props.hasOwnProperty(propertyName)) {
        var prop = srcObj.props[propertyName];
        dbValues = prop.dbValues;
        displayValues = prop.uiValues || [];
        hasLov = prop.propertyDescriptor.lovCategory > 0;
      }
    }

    var date;

    if (dbValues && dbValues.length > 0) {
      if (isArray) {
        uw_dbValue = [];

        for (var i = 0; i < dbValues.length; i++) {
          if (propType === 'DATEARRAY') {
            date = new Date(dbValues[i]);
            uw_dbValue[i] = date.getTime();
          } else if (currentPropertyDescriptor && currentPropertyDescriptor.valueType === 1 && displayValues[i]) {
            // ValueType = 1 indicates  a character property For character property dbValues are in ASCII
            // code and so use the display values instead .
            uw_dbValue[i] = displayValues[i];
          } else if ((propType === 'DOUBLEARRAY' || propType === 'INTEGERARRAY') && dbValues[i]) {
            uw_dbValue[i] = Number(dbValues[i]);
          } else {
            uw_dbValue[i] = dbValues[i];
          }
        }
      } else {
        if (propType === 'DATE') {
          // eslint-disable-line no-lonely-if
          date = new Date(dbValues[0]);
          uw_dbValue = date.getTime();
        } else if ((propType === 'DOUBLE' || propType === 'INTEGER') && dbValues[0]) {
          uw_dbValue = Number(dbValues[0]);
        } else if (currentPropertyDescriptor && currentPropertyDescriptor.valueType === 1 && displayValues[0]) {
          // ValueType = 1 indicates  a character property For character property dbValues are in ASCII code
          // and so use the display values instead .
          uw_dbValue = displayValues[0];
        } else {
          uw_dbValue = dbValues[0];
        }
      }
    } // Setting max length to 1 for character and character array types


    if (propType === 'CHAR' || logicalPropertyDescriptor && logicalPropertyDescriptor.valueType === 1 && propType === 'STRINGARRAY') {
      maxLength = 1;
    }

    var viewModelProperty = _vmPropSvc.createViewModelProperty(logicalProperty.propertyName, displayName, propType, uw_dbValue, displayValues);

    if (propType === 'STRING' || propType === 'STRINGARRAY') {
      viewModelProperty.inputType = 'text';
    }

    _vmPropSvc.setHasLov(viewModelProperty, hasLov);

    _vmPropSvc.setIsArray(viewModelProperty, isArray);

    _vmPropSvc.setIsAutoAssignable(viewModelProperty, isAutoAssignable);

    _vmPropSvc.setIsPropertyModifiable(viewModelProperty, isModifable);

    _vmPropSvc.setIsEditable(viewModelProperty, isEditable);

    _vmPropSvc.setIsRichText(viewModelProperty, isRichText);

    _vmPropSvc.setIsEnabled(viewModelProperty, isEnabled);

    _vmPropSvc.setIsDisplayable(viewModelProperty, isDisplayable);

    _vmPropSvc.setIsLocalizable(viewModelProperty, isLocalizable);

    _vmPropSvc.setIsNull(viewModelProperty, isNull);

    _vmPropSvc.setIsRequired(viewModelProperty, isRequired);

    _vmPropSvc.setLength(viewModelProperty, maxLength);

    _vmPropSvc.setError(viewModelProperty, error);

    _vmPropSvc.setRenderingHint(viewModelProperty, renderingHint);

    _vmPropSvc.setNumberOfCharacters(viewModelProperty, numberOfCharacters);

    _vmPropSvc.setNumberOfLines(viewModelProperty, numberOfLines);

    _vmPropSvc.setArrayLength(viewModelProperty, maxArraySize);

    _vmPropSvc.setReferenceType(viewModelProperty, referenceTypeName);

    viewModelProperty.dbValues = dbValues;
    viewModelProperty.uiValues = displayValues;
    viewModelProperty.isDCP = isDCP;
    viewModelProperty.intermediateObjectUids = logicalProperty.intermediateObjectUids;
    viewModelProperty.sourceObjectLastSavedDate = logicalProperty.srcObjLsd;
    viewModelProperty.uiValue = _vmPropSvc.getUiValue(viewModelProperty.uiValues);
    viewModelProperty.initialize = false;
    viewModelProperty.propertyDescriptor = currentPropertyDescriptor;
    viewModelProperty.parentUid = viewModelObject.uid;

    if (!viewModelProperty.lovApi && hasLov) {
      _lovSvc.initNativeCellLovApi(viewModelProperty, null, operationName, viewModelObject);
    }

    return viewModelProperty;
  };
  /**
   * Adds the logical properties to the viewModelObject.
   *
   * @param {ViewModelObject} viewModelObject - viewModelObject to attach properties
   * @param {ObjectArray} logicalProperties - logical properties
   */


  var addPropertiesToViewModelObject = function addPropertiesToViewModelObject(viewModelObject, logicalProperties) {
    if (!viewModelObject.props) {
      viewModelObject.props = {};
    }

    if ($.isArray(logicalProperties)) {
      $.each(logicalProperties, function (index, value) {
        if (value.propertyName) {
          viewModelObject.props[value.propertyName] = value;
        }
      });
    }
  };

  var exports = {};
  /**
   * This is added to handle relational property specified in objectset. prop specified as "relName.relProp", need to
   * extract the actual prop name to extract value from the refModel Object
   *
   * @param {Object} prop - The IViewModelPropObject of an IViewModelObject (from serverVMO or modelObject property)
   * @param {String} propName - The property name
   * @param {IModelObject} refModelObject - The actual IModelObject for which we are creating ViewModelObject
   *
   * @return {ModelObjectProperty|null} The Result.
   */

  var getSourceObjectProp = function getSourceObjectProp(prop, propName, refModelObject) {
    var srcObj = null;

    if (!_.isEmpty(prop.intermediateObjectUids)) {
      srcObj = _cdm.getObject(prop.intermediateObjectUids[prop.intermediateObjectUids.length - 1]);
    } else {
      srcObj = refModelObject;
    }

    var srcObjProp = srcObj ? srcObj.props[propName] : null;

    if (!srcObjProp && /\./.test(propName)) {
      var actualPropName = _vmPropSvc.getBasePropertyName(propName);

      srcObjProp = srcObj ? srcObj.props[actualPropName] : null;
    }

    return srcObjProp;
  };
  /**
   * Class used to help view specific state information.
   *
   * @constructor
   *
   * @param {IModelObject} modelObject - The IModelObject to create a ViewModelObject for.
   * @param {String} operationName - The intended purpose for the new ViewModelOject (e.g. 'edit').
   * @param {String} owningObjUid - The UID of owning object.
   * @param {Object} serverVMO - (Optional) A property map from the server with values to include on the returned VMO.
   */


  var ViewModelObject = function ViewModelObject(modelObject, operationName, owningObjUid, serverVMO, skipIconUpdate) {
    // eslint-disable-line complexity
    var self = this; // eslint-disable-line no-invalid-this

    self.props = {};
    self.propertyDescriptors = {};
    self.visible = true;
    /**
     *
     */

    if (modelObject) {
      self.operationName = operationName;

      if (serverVMO) {
        self.uid = serverVMO.uid || modelObject.uid;
        self.type = serverVMO.type || modelObject.type;
        self.modelType = serverVMO.modelType || modelObject.modelType;

        if (!self.modelType) {
          self.modelType = _cmm.getType(self.type);
        }

        var vmoProps = serverVMO.props;
        var moProps = modelObject.props;

        _.forEach(moProps, function (propValue, propName) {
          if (propValue) {
            if (vmoProps[propName]) {
              var moPropValueClone = _.clone(propValue);

              _.merge(moPropValueClone, vmoProps[propName]);

              self.props[propName] = createViewModelPropertyFromModelObjectProperty(moPropValueClone, propName, operationName, modelObject, self, owningObjUid, serverVMO);
            } else {
              self.props[propName] = createViewModelPropertyFromModelObjectProperty(propValue, propName, operationName, modelObject, self, owningObjUid, null);
            }
          }
        });
        /**
         * Check for the case of the serverVMO having a property NOT currently in the modelObject.
         * <P>
         * Note: Not sure when this could happen, but need to handle it.
         */


        _.forEach(vmoProps, function (propValue, propName) {
          if (propValue && !moProps[propName]) {
            self.props[propName] = createViewModelPropertyFromModelObjectProperty(propValue, propName, operationName, modelObject, self, owningObjUid, serverVMO);
          }
        });
      } else {
        self.uid = modelObject.uid;
        self.type = modelObject.type;
        self.modelType = modelObject.modelType;

        if (!self.modelType) {
          self.modelType = _cmm.getType(self.type);
        }

        _.forEach(modelObject.props, function (propValue, propName) {
          if (propValue) {
            self.props[propName] = createViewModelPropertyFromModelObjectProperty(propValue, propName, operationName, modelObject, self, owningObjUid, null);
          }
        });
      }
    }

    updateCellProperties(self);

    if (!skipIconUpdate) {
      updateIcons(self);
      updateStatusIndicators(self);
      updateColorDecorators(self, true);
    }
  };
  /**
   * @return {String|Object} Displayable 'id' of this ViewModelObject (if possible, else the UID or '???' is
   *         returned).
   */


  ViewModelObject.prototype.toString = function () {
    if (this.cellHeader1) {
      return this.cellHeader1;
    } else if (this.props.object_string && this.props.object_string.uiValues[0]) {
      return this.props.object_string.uiValues[0];
    } else if (this.uid) {
      return this.uid;
    }

    return '???';
  };
  /**
   * Return array propertyNameValue objects (property name + real prop values) of the properties that have been
   * modified.
   *
   * @return {StringArray} Array of property names.
   */


  ViewModelObject.prototype.getDirtyProps = function () {
    var propertyNameValues = [];

    for (var prop in this.props) {
      if (this.props.hasOwnProperty(prop)) {
        if (_vmPropSvc.isModified(this.props[prop])) {
          var propNameValue = {};
          propNameValue.name = prop;
          propNameValue.values = _vmPropSvc.getValueStrings(this.props[prop]);
          propertyNameValues.push(propNameValue);
        }
      }
    }

    return propertyNameValues;
  };
  /**
   * Return array propertyNameValue objects (property name + real prop values) of the properties that have been
   * modified. The return objects can be passed to SOA without any further conversion.
   *
   * @return {StringArray} Array of property names.
   */


  ViewModelObject.prototype.getSaveableDirtyProps = function () {
    var propertyNameValues = this.getDirtyProps();

    _.forEach(propertyNameValues, function (propObject) {
      var propVals = propObject.values;

      for (var i = 0; i < propVals.length; i++) {
        propVals[i] = String(propVals[i]);
      }
    });

    return propertyNameValues;
  };
  /**
   * Resets the 'isEditable' on the view model (and 'modifiable' flags on the backing model object) for all view
   * properties.
   *
   * @param {Boolean} skipDigest - (Optional) TRUE if the 'triggerDigestCycle' function should NOT be called<BR> FALSE
   *            if it SHOULD be called when there is a value change.
   */


  ViewModelObject.prototype.clearEditiableStates = function (skipDigest) {
    _.forEach(this.props, function (prop2) {
      _vmPropSvc.resetUpdates(prop2);

      _vmPropSvc.setIsEditable(prop2, false);
    });

    if (!skipDigest) {
      _vmPropSvc.triggerDigestCycle();
    }
  };
  /**
   * Sets the 'isEditable' of viewModelProperties if property in the associated IModelObject can be modified.
   *
   * @param {Boolean} editable - TRUE if the properties are to be marked as 'editable'.
   * @param {Boolean} override - TRUE if the editing state should be updated an announced even if not currently
   *            different than the desired state.
   * @param {Boolean} skipDigest - (Optional) TRUE if the 'triggerDigestCycle' function should NOT be called.
   */


  ViewModelObject.prototype.setEditableStates = function (editable, override, skipDigest) {
    exports.setEditableStates(this, editable, override, skipDigest);
  };
  /**
   * Retrieves the id of the object, currently set to uid.
   *
   * Could change in future if each vmo (with cardinality) has their own unique id instead of 'uid'.
   *
   * @returns {String} The ID.
   */


  ViewModelObject.prototype.getId = function () {
    return this.uid;
  };
  /**
   * Retrieve the ViewModelProperty object with the same basePropertyName and sourceObjectUid as the parameters.
   *
   * @param {String} basePropertyName - the base property name trying to be matched
   * @param {String} uid - unique id
   *
   * @returns {ViewModelProperty} The found property.
   */


  ViewModelObject.prototype.retrievePropertyWithBasePropertyName = function (basePropertyName, uid) {
    var foundProperty = null;

    _.forEach(this.props, function (currentProperty, key) {
      var currentBasePropertyName = _vmPropSvc.getBasePropertyName(key);

      if (currentBasePropertyName === basePropertyName) {
        var sourceObjectUid = _vmPropSvc.getSourceObjectUid(currentProperty);

        if (sourceObjectUid === uid) {
          foundProperty = currentProperty;
          return false;
        }
      }
    });

    return foundProperty;
  };
  /**
   * Sets the 'isEditable' of viewModelProperties if property in the associated IModelObject can be modified.
   *
   * @param {ViewModelObject} vmo - The viewModelObject containing the 'props' to be checked.
   * @param {Boolean} editable - TRUE if the properties are to be marked as 'editable'.
   * @param {Boolean} override - TRUE if the editing state should be updated an announced even if not currently
   *            different than the desired state.
   * @param {Boolean} skipDigest - (Optional) TRUE if the 'triggerDigestCycle' function should NOT be called.
   */


  exports.setEditableStates = function (vmo, editable, override, skipDigest) {
    var modelObject = _cdm.getObject(vmo.uid);

    var changed = false;
    var isEditableNil = declUtils.isNil(editable);

    _.forEach(vmo.props, function (propValue, propName) {
      if (propValue) {
        if (isEditableNil) {
          var modelProp = modelObject.props[propName];

          if (modelProp) {
            propValue.isEditable = modelProp.modifiable;

            _vmPropSvc.setEditable(propValue, modelProp.modifiable);
            /**
             * Note : _vmPropSvc.setEditable method does not fire any property change event, Calling
             * _vmPropSvc.setEditState instead. No need to set viewProp.editableInViewModel separately as it
             * will be taken care by setEditStates method. This change is done as part of handling upload
             * dataset use case.
             */


            _vmPropSvc.setEditState(propValue, modelProp.modifiable, true);

            changed = true;
          }
        } else {
          propValue.isEditable = editable;

          _vmPropSvc.setEditable(propValue, editable);
          /**
           * Note : _vmPropSvc.setEditable method does not fire any property change event, Calling
           * _vmPropSvc.setEditState instead . No need to set viewProp.editableInViewModel separately as it
           * will be taken care by setEditStates method. This changes is done as part of handling upload
           * dataset use case.
           */


          _vmPropSvc.setEditState(propValue, editable, override, true);

          changed = true;
        }
      }
    });

    if (changed && !skipDigest) {
      _vmPropSvc.triggerDigestCycle();
    }
  };
  /**
   * @param {IModelObject} modelObject - An existing IModelObject to create a ViewModelObject wrapper for.
   *
   * @param {String} operationName - if "EDIT", then the VMO is modifiable. (null is acceptable)
   *
   * @return {ViewModelObject} Newly created ViewModelObject wrapper initialized with properties from the given
   *         inputs.
   */


  exports.createViewModelObjectFromModelObject = function (modelObject, operationName) {
    return new ViewModelObject(modelObject, operationName);
  };
  /**
   * @param {String|Object} input - UID of the ModelObject to create a ViewModelObject wrapper for OR model object
   * @param {String} operationName - if "EDIT", then the VMO is modifiable. (null is acceptable)
   * @param {String} owningObjUid - The UID of owning object
   * @param {ViewModelObject} serverVMO -
   *
   * @return {ViewModelObject} Newly created ViewModelObject wrapper initialized with properties from the given
   *         inputs.
   */


  exports.createViewModelObject = function (input, operationName, owningObjUid, serverVMO) {
    var modelObject = input;

    if (_.isString(input)) {
      modelObject = _cdm.getObject(input);
    } else if (input && input.uid && !serverVMO) {
      modelObject = _cdm.getObject(input.uid);
    }

    if (!modelObject) {
      logger.error('viewModelObject.createViewModelObject: ' + 'Unable to locate ModelObject in the clientDataModel with UID=' + input);
      return null;
    }

    return new ViewModelObject(modelObject, operationName, owningObjUid, serverVMO);
  };
  /**
   * @param {String|Object} input - UID of the ModelObject to create a ViewModelObject wrapper for OR model object
   * @param {String} operationName - if "EDIT", then the VMO is modifiable. (null is acceptable)
   * @param {String} owningObjUid - The UID of owning object
   * @param {ViewModelObject} serverVMO -
   *
   * @return {ViewModelObject} Newly created ViewModelObject wrapper initialized with properties from the given
   *         inputs.
   */


  exports.createViewModelObjectForProps = function (input, operationName, owningObjUid, serverVMO) {
    var modelObject = input;

    if (_.isString(input)) {
      modelObject = _cdm.getObject(input);
    } else if (input && input.uid && !serverVMO) {
      modelObject = _cdm.getObject(input.uid);
    }

    if (!modelObject) {
      logger.error('viewModelObject.createViewModelObject: ' + 'Unable to locate ModelObject in the clientDataModel with UID=' + input);
      return null;
    }

    return new ViewModelObject(modelObject, operationName, owningObjUid, serverVMO, true);
  };
  /**
   * Creates and returns a new ViewModelObject wrapper initialized with properties from the given inputs.
   *
   * @param {Object} logicalObject - logical object
   * @param {ObjectArray} logicalPropertyDescriptors - logical property descriptors
   * @param {String} operationName - operation name
   *
   * @return {ViewModelObject} created from logical object
   */


  exports.createViewModelObjectFromLogicalObject = function (logicalObject, logicalPropertyDescriptors, operationName) {
    var modelObject = _cdm.getObject(logicalObject.modelObject.uid);

    if (!modelObject) {
      logger.error('viewModelObject.createViewModelObjectFromLogicalObject: ' + 'Unable to retrieve ModelObject from logical object');
      return null;
    }

    var p_operationName = operationName || 'Edit';
    var viewModelObject = new ViewModelObject(modelObject, p_operationName);
    var viewModelProperties = createViewModelPropertiesWithDescriptors(viewModelObject, logicalObject.viewModelProperties, logicalPropertyDescriptors, p_operationName);
    addPropertiesToViewModelObject(viewModelObject, viewModelProperties);
    return viewModelObject;
  };
  /**
   * @param {String} uid - UID of the ModelObject to create a ViewModelObject wrapper for.
   * @param {String} p_operationName - ...
   *
   * @return {ViewModelObject} A new {ViewModelObject}.
   */


  exports.createViewModelObjectById = function (uid, p_operationName) {
    var modelObject = _cdm.getObject(uid);

    if (!modelObject) {
      logger.info('viewModelObject.createViewModelObject: ' + 'Unable to locate ModelObject in the clientDataModel with UID=' + uid); // Creating a dummy model object as Upload dataset operation uses object type as uid to create generic view
      // model object .

      modelObject = {};
      modelObject.uid = uid;
      modelObject.props = [];
    }

    var operationName = p_operationName || 'Edit';
    return new ViewModelObject(modelObject, operationName);
  };
  /**
   * Creates the view model properties from logical object and adds it to the view model object.
   *
   * @param {Object} viewModelObject - view model object to update.
   * @param {Object} logicalObject - logical object
   * @param {ObjectArray} logicalPropertyDescriptors - logical property descriptors
   * @param {String} operationName - operation name
   */


  function addPropertiesToViewModelObjectFromLogicalObject(viewModelObject, logicalObject, logicalPropertyDescriptors, operationName) {
    var viewModelPropertiesToAdd = [];

    if (viewModelObject && logicalObject && logicalObject.viewModelProperties) {
      _.forEach(logicalObject.viewModelProperties, function (logicalProperty) {
        if (viewModelObject.props && !viewModelObject.props.hasOwnProperty(logicalProperty.propertyName)) {
          viewModelPropertiesToAdd.push(logicalProperty);
        }
      });

      if (viewModelPropertiesToAdd.length > 0) {
        var p_operationName = operationName || 'Edit';
        var viewModelProperties = createViewModelPropertiesWithDescriptors(viewModelObject, viewModelPropertiesToAdd, logicalPropertyDescriptors, p_operationName);
        addPropertiesToViewModelObject(viewModelObject, viewModelProperties);
      }
    }
  }
  /**
   * Extracts the view model properties from response and updates the corresponding viewmodelObject
   *
   * @param {ViewModelObject[]} viewModelObjects - view model object to update.
   * @param {Object} response - response
   */


  function processViewModelObjectsFromResponse(viewModelObjects, response) {
    // update the view model object with the view model properties.
    if (response && response.output && response.output.objects) {
      var logicalObjectsInResponse = response.output.objects;
      var propertyDescriptors = response.output.propDescriptors;

      _.forEach(viewModelObjects, function (viewModelObject) {
        var objectUpdated = false;

        if (viewModelObject) {
          _.forEach(logicalObjectsInResponse, function (logicalObject) {
            if (!objectUpdated && logicalObject.modelObject && logicalObject.modelObject.uid === viewModelObject.uid) {
              addPropertiesToViewModelObjectFromLogicalObject(viewModelObject, logicalObject, propertyDescriptors);
              objectUpdated = true;
            }
          });
        }
      });
    }
  }
  /**
   * Extracts the view model properties from response and updates the corresponding viewmodelObject
   *
   * @param {ViewModelObject[]} viewModelObjects - view model object to update.
   * @param {Object} response - response
   */


  function processViewModelObjectsFromJsonResponse(viewModelObjects, response) {
    // update the view model object with the view model properties.
    if (response.viewModelJSON && !response.viewModelPropertiesJsonString) {
      // remove after SOA is updated
      response.viewModelPropertiesJsonString = response.viewModelJSON;
    }

    if (response && response.viewModelPropertiesJsonString) {
      var responseObject = parsingUtils.parseJsonString(response.viewModelPropertiesJsonString);
      var objectsInResponse = responseObject.objects;

      _.forEach(viewModelObjects, function (viewModelObject) {
        var objectUpdated = false;

        if (viewModelObject) {
          _.forEach(objectsInResponse, function (currentObject) {
            if (!objectUpdated && currentObject && currentObject.uid === viewModelObject.uid) {
              exports.mergeObjects(viewModelObject, currentObject);
              objectUpdated = true;
            }
          });
        }
      });
    }
  }
  /**
   * Cache of promises for getProperties to "reuse" if the same request comes in before the first response has
   * completed.
   *
   * @private
   */


  var _getPropertiesPromises = [];
  /**
   * Ensures that the specified properties are loaded into the cache. If they are not already loaded a server call is
   * made to load them.
   *
   * @param {ObjectArray} viewModelObjects - array of view model object
   * @param {StringArray} propNames - array of property names
   * @returns {Promise} This promise will be 'resolved' or 'rejected' when the service is invoked and its response
   *          data is available.
   */

  exports.getViewModelProperties = function (viewModelObjects, propNames) {
    var objects = [];

    _.forEach(viewModelObjects, function (viewModelObject) {
      if (viewModelObject) {
        var modelObjAdded = false; // Cached model object

        _.forEach(propNames, function (propName) {
          if (!viewModelObject.props || !viewModelObject.props.hasOwnProperty(propName)) {
            if (!modelObjAdded) {
              // Valid property for this model type AND property not cached
              objects.push(viewModelObject);
              modelObjAdded = true;
            }
          }
        });
      }
    });

    if (objects.length > 0) {
      var input = {
        objects: objects,
        attributes: propNames
      };
      var promise = null;

      _.forEach(_getPropertiesPromises, function (promiseLp) {
        if (!promise && _.isEqual(input.attributes, promiseLp.input.attributes) && objects.length === promiseLp.input.objects.length) {
          promise = promiseLp; // assume a match

          for (var ii = 0; ii < objects.length; ii++) {
            if (objects[ii].uid !== promiseLp.input.objects[ii].uid) {
              promise = null; // invalid assumption

              break;
            }
          }
        }
      });

      if (!promise) {
        promise = _soaSvc.post('Internal-AWS2-2017-06-DataManagement', 'getViewModelProperties', input).then(function (response) {
          _getPropertiesPromises.splice(_getPropertiesPromises.indexOf(promise), 1);

          processViewModelObjectsFromResponse(viewModelObjects, response);
          return response;
        });

        _getPropertiesPromises.push(promise);

        promise.input = input;
      }

      return promise;
    }

    return _$q.resolve();
  };
  /**
   * This is a preProcessor to 'updateSourceObjectPropertiesByViewModelObject' to trivially ignore updating existing
   * (loaded) VMOs in the given collection.
   *
   * @param {ViewModelObjectArray} loadedVMOs - Collection of viewModelObjects to consider for updating.
   *
   * @param {IModelObjectArray} updatedCDMObjects - CDM Objects that have been reported as updated or modified.
   */


  exports.updateViewModelObjectCollection = function (loadedVMOs, updatedCDMObjects) {
    /**
     * Check if there is nothing to work on or with.
     */
    if (_.isEmpty(loadedVMOs) || _.isEmpty(updatedCDMObjects)) {
      return;
    }
    /**
     * Create a map containing the unique UID of all the loaded viewModelObjects so that we can trivially ignore any
     * changed CDM objects NOT in this viewModelCollection.
     * <P>
     * Note: The map needs to consider all the different UIDs a modified object could be referenced by it. The UID
     * checks mirror the check made in 'updateSourceObjectPropertiesByViewModelObject'.
     */


    var vmoMap = {};

    _.forEach(loadedVMOs, function _cdmHandlerCheck(vmo) {
      if (vmo.uid) {
        vmoMap[vmo.uid] = true;

        if (!_.isEmpty(vmo.props)) {
          if (vmo.type === 'Awp0XRTObjectSetRow' && vmo.props.awp0Target && vmo.props.awp0Target.dbValue) {
            vmoMap[vmo.props.awp0Target.dbValue] = true;
          }

          _.forEach(vmo.props, function (vmProp) {
            var sourceObjectUid = _vmPropSvc.getSourceObjectUid(vmProp);

            if (sourceObjectUid) {
              vmoMap[sourceObjectUid] = true;
            }

            if (vmProp.parentUid) {
              vmoMap[vmProp.parentUid] = true;
            }
          });
        }
      }
    });
    /**
     * Check if we ended up with NO viewModelObjects.
     */


    if (_.isEmpty(vmoMap)) {
      return;
    }
    /**
     * Loop for each modified object and update any VMOs effected by it.
     */


    _.forEach(updatedCDMObjects, function _updateViewModelCollection(updatedObj) {
      if (updatedObj.uid && vmoMap[updatedObj.uid]) {
        var updatedVmo = exports.createViewModelObject(updatedObj, 'EDIT');

        if (updatedVmo && updatedVmo.props) {
          exports.updateSourceObjectPropertiesByViewModelObject(updatedVmo, loadedVMOs);
        }
      }
    });
  };
  /**
   * Updates all the viewModelObjects with the updatedVMO, depending on the property's sourceUid.
   *
   * @param {ViewModelObject} updatedVMO - view model object with updated information
   * @param {ViewModelObjectArray} origVMOs - all the view model objects that need to be updated
   */


  exports.updateSourceObjectPropertiesByViewModelObject = function (updatedVMO, origVMOs) {
    if (updatedVMO && updatedVMO.props && origVMOs) {
      var updatedUid = updatedVMO.uid;
      var updatedProps = {};

      _.forEach(origVMOs, function (vmo) {
        if (vmo && vmo.props) {
          var vmoChanged = false;

          if (vmo.type === 'Awp0XRTObjectSetRow' && vmo.props.awp0Target && vmo.props.awp0Target.dbValue === updatedUid) {
            _.forEach(vmo.props, function (vmProp, key) {
              var updatedProp = updatedVMO.props[key];

              if (updatedProp) {
                _vmPropSvc.copyModelData(vmProp, updatedProp);

                if (updatedProps[vmo.uid] === undefined) {
                  updatedProps[vmo.uid] = [];
                }

                updatedProps[vmo.uid].push(vmProp.propertyName);
                vmoChanged = true;
              }
            });
          }

          _.forEach(vmo.props, function (vmProp) {
            var sourceObjectUid = _vmPropSvc.getSourceObjectUid(vmProp); // Need to handle both situations, where a DCP property is passed through the DCP object, or the
            // original object containing the property


            if (sourceObjectUid === updatedUid || vmProp.parentUid === updatedUid) {
              var propertyNameLookup = vmProp.propertyName;

              if (sourceObjectUid === updatedUid && sourceObjectUid !== vmProp.parentUid) {
                propertyNameLookup = _vmPropSvc.getBasePropertyName(propertyNameLookup);
              }

              var updatedProp = updatedVMO.props[propertyNameLookup];

              if (updatedProp) {
                var updatedPropSourceUid = _vmPropSvc.getSourceObjectUid(updatedProp);

                if (sourceObjectUid === updatedPropSourceUid) {
                  _vmPropSvc.copyModelData(vmProp, updatedProp);

                  if (updatedProps[vmo.uid] === undefined) {
                    updatedProps[vmo.uid] = [];
                  }

                  updatedProps[vmo.uid].push(vmProp.propertyName);
                  vmoChanged = true;
                }
              }
            }
          });

          if (vmoChanged) {
            updateCellProperties(vmo);
            updateStatusIndicators(vmo);
            updateColorDecorators(vmo);
            updateIcons(vmo);
          }
        }
      });

      eventBus.publish('viewModelObject.propsUpdated', updatedProps);
    }
  };
  /**
   * Update all existing VMO properties from the underlying CDM object's property value (with the same name).
   *
   * <pre>
   * </pre>
   *
   * @param {Object} vmo view model object
   */


  exports.updateVMOProperties = function (vmo) {
    if (!vmo.uid) {
      return;
    }

    var modelObj = _cdm.getObject(vmo.uid);

    if (!modelObj || !modelObj.props) {
      return;
    }

    _.forEach(vmo.props, function (vmoProp, propName) {
      if (modelObj.props.hasOwnProperty(propName)) {
        var moProp = modelObj.props[propName];
        vmoProp.dbValues = moProp.dbValues;
        vmoProp.uiValues = moProp.uiValues;
        vmoProp.uiValue = moProp.getDisplayValue();

        if (moProp.uiValues) {
          vmoProp.displayValues = moProp.uiValues;
        } else {
          vmoProp.displayValues = [];
        }

        vmoProp.isEditable = moProp.propertyDescriptor.constantsMap.editable === '1' && moProp.modifiable;
      }
    });

    updateCellProperties(vmo);
    updateStatusIndicators(vmo);
    updateColorDecorators(vmo);
    updateIcons(vmo);
  };
  /**
   * Test if the given object 'is-a' TreeLoadInput created by this service.
   *
   * @param {Object} objectToTest - Object to check prototype history of.
   * @return {Boolean} TRUE if the given object is a TreeLoadInput.
   */


  exports.isViewModelObject = function (objectToTest) {
    return objectToTest instanceof ViewModelObject;
  };
  /**
   * Create a view model object from partial serverVMO and model object from cdm.
   *
   * @param {Object} serverVMO - VMO from server with some properties (including dcp), not all
   *
   * @returns {ViewModelObject} A new object initialized from the given input.
   */


  exports.createViewModelObjectFromPartialServerVMO = function (serverVMO) {
    var modelObject = _cdm.getObject(serverVMO.uid);

    return exports.createViewModelObject(modelObject, 'EDIT', null, serverVMO);
  };
  /**
   * Merges the properties of a view model object and either another view model object, or a server view model object
   * from the SOA response.
   *
   * @param {ViewModelObject} targetViewModelObject - target object to merge to.
   * @param {ViewModelObject|Object} sourceViewModelObject - source object to merge values (overrides target values)
   */


  exports.mergeObjects = function (targetViewModelObject, sourceViewModelObject) {
    var responseViewModelObject = sourceViewModelObject;

    if (!exports.isViewModelObject(sourceViewModelObject)) {
      responseViewModelObject = exports.createViewModelObjectFromPartialServerVMO(sourceViewModelObject);
    }

    var visible = targetViewModelObject.visible;

    _.merge(targetViewModelObject, responseViewModelObject);

    targetViewModelObject.visible = visible;
  };
  /**
   * Ensures that the specified properties are loaded into the cache. New SOA supports DCP.
   *
   * @param {ViewModelTreeNodeArray} vmNodes - Array of {ViewModelTreeNode}.
   * @param {Object} context - ...
   *
   * @returns {Promise} This promise will be 'resolved' or 'rejected' when the service is invoked and its response
   *          data is available.
   */


  exports.getTableViewModelProperties = function getTableViewModelProperties(vmNodes, context) {
    var missingUids = [];
    var clientScope = context.clientScopeURI ? context.clientScopeURI : '';
    var clientName = context.clientName ? context.clientName : '';
    var typesForArrange = context.typesForArrange ? context.typesForArrange : [];
    var columnsToExclude = context.columnsToExclude ? context.columnsToExclude : [];

    _.forEach(vmNodes, function (vmNode) {
      // check cache before fetching?
      missingUids.push(vmNode.uid);
    });

    var input = {
      input: {
        objectUids: missingUids,
        columnConfigInput: {
          clientName: clientName,
          hostingClientName: '',
          clientScopeURI: clientScope,
          operationType: 'Union',
          columnsToExclude: columnsToExclude
        },
        requestPreference: {
          typesToInclude: typesForArrange
        }
      }
    };

    if (missingUids.length > 0) {
      return _soaSvc.post('Internal-AWS2-2017-12-DataManagement', 'getTableViewModelProperties', input).then(function (response) {
        // process DCPs
        processViewModelObjectsFromJsonResponse(vmNodes, response.output);
        return response;
      });
    } // no op


    return _$q.resolve();
  };
  /**
   * This service provides view model object
   *
   * @memberof NgServices
   * @member viewModelObjectService
   *
   * @param {$q} $q - Service to use.
   * @param {uwPropertyService} uwPropertySvc - Service to use.
   * @param {soa_kernel_clientDataModel} cdm  - Service to use.
   * @param {lovService} lovService - Service to use.
   * @param {visualIndicatorService} visualIndicatorSvc - Service to use.
   * @param {colorDecoratorService} colorDecoratorSvc - Service to use.
   * @param {soa_kernel_clientMetaModel} cmm - Service to use.
   * @param {soa_kernel_soaService} soaSvc - Service to use.
   * @param {awIconService} awIconSvc - Service to use.
   *
   * @return {viewModelObjectService} Reference to service API.
   */


  app.factory('viewModelObjectService', ['$q', 'uwPropertyService', 'soa_kernel_clientDataModel', 'lovService', 'visualIndicatorService', 'colorDecoratorService', 'soa_kernel_clientMetaModel', 'soa_kernel_soaService', 'awIconService', function ($q, uwPropertySvc, cdm, lovService, visualIndicatorSvc, colorDecoratorSvc, cmm, soaSvc, awIconSvc) {
    _$q = $q;
    _vmPropSvc = uwPropertySvc;
    _cdm = cdm;
    _lovSvc = lovService;
    _visualIndicatorSvc = visualIndicatorSvc;
    _colorDecoratorSvc = colorDecoratorSvc;
    _cmm = cmm;
    _soaSvc = soaSvc;
    _awIconSvc = awIconSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'viewModelObjectService'
  };
});