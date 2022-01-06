"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the primary service used to create, test and manage the internal properties of ViewModelProperty Objects used
 * throughout the UniversalWidget (et al.) areas of AW. Views can create custom view models by creating a
 * ViewModelObject and adding ViewModelProperty Objects created by this service to it.
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/uwPropertyService
 */
define([//
'app', //
'angular', //
'jquery', //
'lodash', //
'js/declUtils', //
'js/dateTimeService', //
'js/localeService', //
'soa/kernel/clientDataModel', //
'soa/dataManagementService'], //
function (app, ngModule, $, _, declUtils) {
  'use strict';
  /**
   * Editable State of the property object
   *
   * @private
   */

  var PROP_EDITABLE = 'editable';
  /**
   * Value of the property object
   *
   * @private
   */

  var PROP_VALUE = 'value';
  /**
   * Validation error of property object
   *
   * @private
   */

  var PROP_ERROR = 'error';
  /**
   * Required state of property object
   *
   * @private
   */

  var PROP_REQUIRED = 'required';
  /**
   * Overlay type 'viewModelPropertyOverlay', which defines that the overlay has real data(i.e
   * IViewModelProperty).
   *
   * @private
   */

  var VIEW_MODEL_PROPERTY = 'viewModelPropertyOverlay';
  /**
   * Overlay type 'widgetOverlay', which defines that the overlay has widget data.
   *
   * @private
   */

  var WIDGET = 'widgetOverlay';
  /**
   * Integer minimum value, which is equal to Java Integer's minimum value
   */

  var _integerMinValue = -2147483648;
  /**
   * Integer maximum value, which is equal to Java Integer's maximum value
   */


  var _integerMaxValue = 2147483647;
  /**
   * Cache document ng element to retrieve the scope and trigger digest cycle.
   *
   * @private
   */

  var _docNgElement = ngModule.element(document.body);
  /**
   * Cache $q promise service.
   *
   * @private
   */


  var _$q = null;
  /**
   * {dateTimeService} Cached reference to injected AngularJS service.
   *
   * @private
   */

  var _dateTimeSvc = null;
  /**
   * {localeService} Cached reference to injected AngularJS service.
   *
   * @private
   */

  var _localeSvc = null;
  /**
   * {clientDataModel} Cached reference to injected AngularJS service.
   *
   * @private
   */

  var _clientDataModel = null;
  /**
   * {dataManagementService} Cached reference to injected AngularJS service.
   *
   * @private
   */

  var _dmSvc = null;
  /**
   * {$rootScope} Cached reference to the 'root' scope associated with the top level (i.e. document) DOM Element.
   */

  var _documentScope = null;
  /**
   * {StringMap} Cached 'basic' locale text bundle.
   */

  var _localTextBundle;
  /**
   * {Array} Promise that need to be resolved when debounced function executes eventually
   */


  var _pingDeferred = null;
  /**
   * @param {String} stringValue -
   *
   * @return {boolean} TRUE if given value is not NULL and equals 'true', 'TRUE' or '1'.
   */

  var _isPropertyValueTrue = function _isPropertyValueTrue(stringValue) {
    return stringValue && stringValue !== '0' && (String(stringValue).toUpperCase() === 'TRUE' || stringValue === '1');
  };
  /**
   * Set locale specific string used for array UI.
   *
   * @param {ViewModelProperty} vmProp - Object to update.
   * @param {StringMap} localTextBundle - Text bundles to use.
   */


  function _setArrayText(vmProp, localTextBundle) {
    if (!vmProp.isRequired) {
      vmProp.propertyRequiredText = localTextBundle.ARRAY_PLACEHOLDER_TEXT;
    } // Set array button's tool tips


    vmProp.moveUpButtonTitle = localTextBundle.MOVE_UP_BUTTON_TITLE;
    vmProp.moveDownButtonTitle = localTextBundle.MOVE_DOWN_BUTTON_TITLE;
    vmProp.removeButtonTitle = localTextBundle.REMOVE_BUTTON_TITLE;
  } // _setArrayText

  /**
   * Set locale specific string used for radio button UI.
   *
   * @param {ViewModelProperty} vmProp - Object to update.
   * @param {StringMap} localTextBundle - Text bundles to use.
   */


  function _setRadioText(vmProp, localTextBundle) {
    if (!vmProp.propertyRadioTrueText) {
      vmProp.propertyRadioTrueText = localTextBundle.RADIO_TRUE;
    }

    if (!vmProp.propertyRadioFalseText) {
      vmProp.propertyRadioFalseText = localTextBundle.RADIO_FALSE;
    }
    /**
     * Handles setting of custom labels and vertical alignment attributes when directives are used natively
     */


    if (vmProp.radioBtnApi) {
      if (vmProp.radioBtnApi.customTrueLabel) {
        vmProp.propertyRadioTrueText = vmProp.radioBtnApi.customTrueLabel;
      }

      if (vmProp.radioBtnApi.customFalseLabel) {
        vmProp.propertyRadioFalseText = vmProp.radioBtnApi.customFalseLabel;
      }

      if (vmProp.radioBtnApi.vertical) {
        vmProp.vertical = vmProp.radioBtnApi.vertical;
      }
    }
  }
  /**
   * Helper function to avoid multiple calls to load objects by using lodash debounce
   */


  var _pingLoadObjects = _.debounce(function (uidsArray, vmProp) {
    _dmSvc.loadObjects(uidsArray).then(function () {
      exports.setValue(vmProp, vmProp.dbValue);

      if (vmProp.propApi && vmProp.propApi.fireValueChangeEvent) {
        vmProp.propApi.fireValueChangeEvent();
      }

      if (_pingDeferred) {
        _pingDeferred.resolve();

        _pingDeferred = null;
      }
    }, function (error) {
      if (vmProp.propApi && vmProp.propApi.fireUIValidationErrorEvent) {
        vmProp.uiValue = '';
        vmProp.error = error.message;
        vmProp.clientValidationError = error.message;
        vmProp.hasServerValidationError = true;
        vmProp.propApi.fireUIValidationErrorEvent(error.message);
      }

      if (_pingDeferred) {
        _pingDeferred.reject(error);

        _pingDeferred = null;
      }
    });
  }, 250);
  /**
   * Constructor for a ViewModelProperty used to hold all Teamcenter property description and view state.
   * <P>
   * Note: Unless otherwise noted, the various parameters are simply set, unmodified and with the same name, as
   * properties on the resulting object created by this constructor. Parameters what have a suffix of 'In' are
   * modified in some way before being set as properties.
   * <P>
   * Note: The properties shown below in the 'members' section are defined, understood and created by this class
   * constructor.
   * <P>
   * Note: The properties shown below in the 'properties' section are marked as '(Optional)' and are defined and
   * understood, but not created by this class constructor. The are defined as needed by the various APIs of the
   * uwPropertyService.
   *
   * @class ViewModelProperty
   *
   * @memberof module:js/uwPropertyService
   *
   * @param {String} propertyName - The name/id of the property. Has to be unique within the object
   * @param {String} propertyDisplayName - User displayable name of the property
   * @param {String} dataType - Data type of the property
   * @param {Array} dbValue - Real value of the property. The internal (database) representation of the property's
   *            value.
   * @param {StringArray} displayValuesIn - Display value of the property. Arrays of string representing the
   *            current user displayable value(s) of the property.
   *
   * @return {ViewModelProperty} A new instance of this class.
   *
   * @property {String} inputType - (Optional) input type
   *
   * @property {Object} sourceObjectLastSavedDate - (Optional) source object last saved date
   *
   * @property {String} propertyRadioTrueText - (Optional) Used for boolean Radio button 'true' label
   *
   * @property {String} propertyRadioFalseText - (Optional) Used for boolean Radio button 'false' label
   *
   * @property {boolean} vertical - (Optional) Used for boolean radio button. TRUE to show the layout of the radio
   *           button vertically. FALSE for horizontal layout.
   *
   * @property {ObjectArray} displayValsModel - (Optional) This is only used for arrays so that we can maintain
   *           the selection of the rows in array widget.
   *
   * @property {String} parentUid - (Optional) This is the UID of the original IModelObject (in the client data
   *           model cache) that was used to originate this ViewModelProperty.
   *
   * @property {Object} newValue - (Optional) new value
   *
   * @property {Object} propApi - (Optional) property API
   *
   * @property {Object} oldValue - (Optional) old value
   *
   * @property {ObjectArray} oldValues - (Optional) old values
   *
   * @property {String} propertyRequiredText - (Optional) Localized text seen as the placeholder text in a field
   *           when the property is 'Required'.
   *
   * @property {Number} maxLength - (Optional) If not equal to '-1' or '0', this parameter specifies the maximum
   *           number of characters allowed in a string type property.
   *
   * @property {Number} numberOfCharacters - (Optional) If not equal to '-1' or '0', this parameter specifies the
   *           number of characters in a string type property.
   *
   * @property {Number} numberOfLines - (Optional) If not equal to '-1' or '0', this parameter specifies the
   *           number of lines allowed in a property.
   *
   * @property {String} moveUpButtonTitle - (Optional) Localized title for 'move-up' button in array widget.
   *
   * @property {String} moveDownButtonTitle - (Optional) Localized title for 'move-down' button in array widget.
   *
   * @property {String} removeButtonTitle - (Optional) Localized title for 'remove' button used only for array
   *           widget.
   *
   * @property {String} referenceTypeName - (Optional) reference type name
   *
   * @property {String} clientValidationError - (Optional) client validation error
   *
   * @property {String} hasServerValidationError - (Optional) has server validation error?
   *
   * @property {boolean} hasLov - (Optional) TRUE if the property has a specific list of values associated with
   *           it.
   *
   * @property {String} renderingHint - (Optional) Depending on the type, this string indicates some variation in
   *           how the property's value should be displayed (e.g. For 'BOOLEAN' type, valid values include
   *           'radiobutton', 'togglebutton', 'checkbox'. For 'STRING' type, valid values include 'label',
   *           'textbox', 'textfield', 'textarea', 'longtext').
   *
   * @property {boolean} autofocus - (Optional) auto focus?
   *
   * @property {boolean} dirty - (Optional) TRUE if the value of the property has changed (been edited) since it
   *           was initially displayed.
   *
   * @property {Number} maxRowCount - (Optional) Used only for array widget. If != -1, then the array widget will
   *           only show the scroll bar after max row count is reached.
   *
   * @property {StringArray} newDisplayValues - (Optional) new display values
   *
   * @property {Object} propertyDescriptor - (Optional) property descriptor
   *
   * @property {boolean} initialize - (Optional) initialize?
   */


  var ViewModelProperty = function ViewModelProperty(propertyName, propertyDisplayName, dataType, dbValue, displayValuesIn) {
    // eslint-disable-line complexity
    var vmProp = this;
    var displayValuesFinal = displayValuesIn || [];
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property propertyName
     *
     * {String} Internal name of the property.
     */

    vmProp.propertyName = propertyName;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property propertyDisplayName
     *
     * {String} User displayable name of the property (a.k.a. the property's 'label').
     */

    vmProp.propertyDisplayName = propertyDisplayName;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property type
     *
     * {String} Data type of the property. Valid values are: 'CHAR', 'DATE', 'DOUBLE', 'FLOAT', 'INTEGER',
     * 'BOOLEAN', 'SHORT', 'STRING' & 'OBJECT'.
     */

    vmProp.type = dataType;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property dbValue
     *
     * {Object} The internal (database) representation of the property's value.
     * <P>
     * Note: For 'DATE' type properties, the 'dbValueIn' is assumed to be of type 'double' and represents the
     * number of milliseconds since UNIX 'epoch' (January 1, 1970 00:00:00 GMT).
     */

    vmProp.dbValue = dbValue;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property displayValues
     *
     * {StringArray} Array of strings representing the current user displayable value(s) of the property.
     */

    vmProp.displayValues = displayValuesFinal;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isNull
     *
     * {boolean} TRUE if the current property value is 'no value'. FALSE if the value is valid as is.
     * <P>
     * Note: This option is used in cases when the property's value has not been set yet but that there is no
     * way to represent this state in a simple string (e.g. Is the string 'empty' or not yet set? Is the 'empty'
     * string an indication of an integer value of '0'?).
     */

    vmProp.isNull = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property editable
     *
     * {boolean} TRUE if the user should have the ability to change the property's value. FALSE if the value is
     * read-only.
     */

    vmProp.editable = true;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isEnabled
     *
     * {boolean} TRUE if the property's value should be shown normally and (if also editable) react to user
     * input. FALSE if the property's value should be shown 'greyed out' and not react to user input (even if
     * editable).
     */

    vmProp.isEnabled = true;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isRichText
     *
     * {boolean} TRUE if the string value of the property is in HTML format and should be displayed using HTML
     * formatting rules and edited with the 'rich text' editor.
     */

    vmProp.isRichText = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isRequired
     *
     * {boolean} TRUE if the property's value is required to successfully complete some operation that uses it.
     * FALSE if the property's value is optional.
     */

    vmProp.isRequired = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isLocalizable
     *
     * {boolean} TRUE if the property value's UI should include the option to allow any user entered value to be
     * converted from local language (as entered) into some other system language. Note: The UI necessary for
     * translating the value is not currently supported in Active Workspace 2.4.
     */

    vmProp.isLocalizable = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isDisplayable
     *
     * {boolean} is displayable?
     */

    vmProp.isDisplayable = true;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isAutoAssignable
     *
     * {boolean} TRUE if the property's value can/should be assigned automatically by Teamcenter. FALSE if the
     * property's value is not normally assigned/controlled by Teamcenter.
     * <P>
     * Note: The UI necessary for assigning this value is not currently supported in Active Workspace 2.4.
     */

    vmProp.isAutoAssignable = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property hasInitialValue
     *
     * {boolean} has initial value?
     */

    vmProp.hasInitialValue = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isArray
     *
     * {boolean} TRUE if the property can have more than one value in an ordered list. FALSE if the property can
     * have only a single value.
     * <P>
     * Note: The UI necessary for displaying/editing the multiple value is not currently supported in Active
     * Workspace 2.4.
     */

    vmProp.isArray = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property valueUpdated
     *
     * {boolean} value updated?
     */

    vmProp.valueUpdated = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property displayValueUpdated
     *
     * {boolean} display value updated?
     */

    vmProp.displayValueUpdated = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property editableInViewModel
     *
     * {boolean} editable in view model?
     */

    vmProp.editableInViewModel = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isPropertyModifiable
     *
     * {boolean} TRUE if the user should have the ability to change the property's value. FALSE if the value is
     * read-only.
     */

    vmProp.isPropertyModifiable = true;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property isEditable
     *
     * {boolean} TRUE if the user should have the ability to change the property's value. FALSE if the value is
     * read-only.
     */

    vmProp.isEditable = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property arrayLength
     *
     * {Number} array length
     */

    vmProp.arrayLength = -1;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property error
     *
     * {String} The message that should be displayed when some aspect of the property's value is not correct.
     * This value must be 'null' or an empty string to not have the error be displayed.
     */

    vmProp.error = null;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property propertyLabelDisplay
     *
     * {String} property label display
     */

    vmProp.propertyLabelDisplay = 'PROPERTY_LABEL_AT_SIDE';
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property editLayoutSide
     *
     * {boolean} edit layout side
     */

    vmProp.editLayoutSide = false;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property uiValue
     *
     * {String} (Derived) A 'non-null' string containing comma separated values as specified in the
     * 'displayValuesIn' parameter given in the constructor.
     */

    vmProp.uiValue = exports.getUiValue(displayValuesFinal);
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property overlayType
     *
     * {String} overlay type
     */

    vmProp.overlayType = VIEW_MODEL_PROPERTY;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property value
     *
     * {Object} database value
     */

    vmProp.value = _.cloneDeep(dbValue); // for the purposes of lovs with initial values, we are expecting prevDisplayValue
    // to be same as uiOriginalValue. This dependency is a bit of a historical accident
    // that needs to be addressed as part of a vmProp re-organization.
    // for now, re-introducing the intialization of this param.

    vmProp.prevDisplayValues = displayValuesFinal;
    /**
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property prevDisplayValues
     *
     * {StringArray} previous display values
     */

    vmProp.prevDisplayValues;
    /**
     * @private
     *
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property dateApi
     *
     * {Object} (Extra/Optional) An 'internal decoration' object and property created when the ViewModelProperty
     * is created by a Universal Widget and of type "DATE".
     *
     * @property dateApi.isDateEnabled
     *
     * {boolean} TRUE if the "DATE" type Universal Widget should display a date field.
     *
     * @property dateApi.isTimeEnabled
     *
     * {boolean} TRUE if the "DATE" type Universal Widget should display a time field.
     */

    vmProp.dateApi = {
      isDateEnabled: true,
      isTimeEnabled: true
    };
    /**
     * @private
     *
     * @memberof module:js/uwPropertyService.ViewModelProperty
     * @property radioBtnApi
     *
     * {Object} (Extra/Optional) An 'internal decoration' object and property created when the ViewModelProperty
     * is created by a Universal Widget and of a type displayed as a groupd of 'radio buttons'.
     */

    vmProp.radioBtnApi = {};
    /**
     * -----------------------------------------------------------------------<BR>
     * -----------------------------------------------------------------------<BR>
     * Finish initialization of class properties <BR>
     * -----------------------------------------------------------------------<BR>
     * -----------------------------------------------------------------------<BR>
     */

    /**
     */

    var vmPropType = vmProp.type;

    if (vmPropType === 'STRING' || vmPropType === 'STRINGARRAY' || vmPropType === 'CHAR') {
      vmProp.inputType = 'text';
    } else if (vmPropType === 'OBJECT' || vmPropType === 'INTEGER') {// Nothing to do
    } else if (vmPropType === 'BOOLEAN' || vmPropType === 'BOOLEANARRAY') {
      if (declUtils.isNil(dbValue)) {
        vmProp.dbValue = null;
        vmProp.value = null; // Note: If the server had no opinion on this boolean, neither does the 'value' property.
      } else if (_.isString(dbValue)) {
        vmProp.dbValue = _isPropertyValueTrue(vmProp.dbValue);
        vmProp.value = vmProp.dbValue;
      } else if (_.isArray(dbValue)) {
        var booleanDbValues = [];

        for (var k = 0; k < dbValue.length; k++) {
          booleanDbValues[k] = _isPropertyValueTrue(dbValue[k]);
        }

        vmProp.dbValue = booleanDbValues;
        vmProp.value = _.cloneDeep(booleanDbValues);
      }

      if (_localTextBundle) {
        _setRadioText(vmProp, _localTextBundle);
      } else {
        _localeSvc.getTextPromise().then(function (localTextBundle) {
          _localTextBundle = localTextBundle;

          _setRadioText(vmProp, _localTextBundle);
        });
      }
    } else if (vmPropType === 'DATE' || vmPropType === 'DATEARRAY') {
      if (_.isString(dbValue)) {
        vmProp.dbValue = new Date(dbValue).getTime();
        vmProp.value = vmProp.dbValue;
      } else if (_.isNumber(dbValue)) {
        if (dbValue !== 0) {
          vmProp.dbValue = new Date(dbValue).getTime();
          vmProp.value = vmProp.dbValue;
        }
      } else if (_.isArray(dbValue)) {
        var dateDbValues = [];

        for (var j = 0; j < dbValue.length; j++) {
          dateDbValues[j] = new Date(dbValue[j]).getTime();
        }

        vmProp.dbValue = dateDbValues;
        vmProp.value = _.cloneDeep(dateDbValues);
      }
    } else if (vmPropType === 'DOUBLE' || vmPropType === 'DOUBLEARRAY') {
      if (dbValue) {
        if (_.isString(dbValue)) {
          vmProp.dbValue = Number(dbValue);
          vmProp.value = vmProp.dbValue;
        } else if (_.isArray(dbValue)) {
          var doubleDbValues = [];

          for (var i = 0; i < dbValue.length; i++) {
            if (dbValue[i]) {
              doubleDbValues.push(Number(dbValue[i]));
            } else if (dbValue[i] === '') {
              doubleDbValues.push(dbValue[i]);
            }
          }

          vmProp.dbValue = doubleDbValues;
          vmProp.value = _.cloneDeep(doubleDbValues);
        } else if (dbValue) {
          vmProp.dbValue = dbValue;
          vmProp.value = vmProp.dbValue;
        }
      }
    }
  };
  /**
   * Define the base object used to provide all of this module's external API.
   *
   * @private
   */


  var exports = {};
  /**
   * @param {StringArray} uiValues - UI/display value array
   * @returns {String} UI value
   */

  exports.getUiValue = function (uiValues) {
    if (!uiValues || uiValues.length === 0) {
      return '';
    }

    if (uiValues.length > 1) {
      var uiValue = uiValues[0];

      for (var ndx = 1; ndx < uiValues.length && ndx < 4; ndx++) {
        uiValue += ', ' + uiValues[ndx];
      }

      if (ndx < uiValues.length) {
        uiValue += ', ...';
      }

      return uiValue;
    }

    return uiValues[0];
  };
  /**
   * Constructor for a ViewModelProperty used to hold all Teamcenter property description and view state.
   * <P>
   * Note: Unless otherwise noted, the various parameters are simply set, unmodified and with the same name, as
   * properties on the resulting object created by this constructor. Parameters what have a suffix of 'In' are
   * modified in some way before being set as properties.
   *
   * @param {String} propertyName - the name/id of the property. Has to be unique within the object
   * @param {String} propertyDisplayName - user displayable name of the property
   * @param {String} dataType - data type of the property
   * @param {Object} dbValue - real value of the property. The internal (database) representation of the
   *            property's value.
   * @param {StringArray} displayValuesIn - display value of the property. Arrays of string representing the
   *            current user displayable value(s) of the property.
   *
   * @return {ViewModelProperty} A new instance of this class.
   */


  exports.createViewModelProperty = function (propertyName, propertyDisplayName, dataType, dbValue, displayValuesIn) {
    return new ViewModelProperty(propertyName, propertyDisplayName, dataType, dbValue, displayValuesIn);
  };
  /**
   * Update the model data. The view model should use this method to update property data
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Object} value - real value of the property. The internal (database) representation of the property's
   *            value.
   * @param {StringArray} displayValues - display value of the property. Array of strings representing the current
   *            user displayable value(s) of the property.
   * @param {Boolean} isNull - is the property value null
   * @param {Boolean} isEditable - TRUE if the user should have the ability to change the property's value. FALSE
   *            if the value is read-only.
   * @param {Boolean} isModifiable - TRUE if the property is modifiable
   * @param {Object} sourceObjectLastSavedDate
   */


  exports.updateModelData = function (vmProp, value, displayValues, isNull, isEditable, isModifiable, sourceObjectLastSavedDate) {
    var displayValuesFinal = displayValues === null ? [] : displayValues;
    vmProp.displayValues = displayValuesFinal;
    vmProp.isNull = isNull;
    vmProp.editable = isEditable;
    vmProp.isPropertyModifiable = isModifiable;
    vmProp.uiValue = exports.getUiValue(displayValuesFinal);
    vmProp.sourceObjectLastSavedDate = sourceObjectLastSavedDate || vmProp.sourceObjectLastSavedDate;

    if (_.isArray(value) && !vmProp.isArray) {
      vmProp.value = value.slice(0);
    } else {
      vmProp.value = value;
    }

    if (vmProp.prevDisplayValues) {
      vmProp.prevDisplayValues = _.clone(vmProp.displayValues);
    }

    if (vmProp.isArray) {
      vmProp.displayValsModel = [];

      for (var i = 0; i < vmProp.displayValues.length; i++) {
        vmProp.displayValsModel.push({
          displayValue: vmProp.displayValues[i],
          selected: false
        });
      }
    }

    if (!exports.isModified(vmProp)) {
      vmProp.dbValue = _.cloneDeep(value);
    }
  };
  /**
   * Copy the model data. The view model should use this method to copy model data
   *
   * @param {ViewModelProperty} targetProperty - ViewModelProperty object that will be updated.
   * @param {ViewModelProperty} updatedProperty - ViewModelProperty that has the updated information.
   */


  exports.copyModelData = function (targetProperty, updatedProperty) {
    exports.updateModelData(targetProperty, updatedProperty.value, updatedProperty.displayValues, updatedProperty.isNull, updatedProperty.editable, updatedProperty.isPropertyModifiable, updatedProperty.sourceObjectLastSavedDate);

    if (updatedProperty.dbValues && updatedProperty.dbValues.length > 0) {
      targetProperty.dbValues = updatedProperty.dbValues.slice(0);
    } else {
      targetProperty.dbValues = [];
    }
  };
  /**
   * Set's the parent object uid in view model property.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty
   * @param {String} sourceObjectUid - source object UID
   */


  exports.setSourceObjectUid = function (vmProp, sourceObjectUid) {
    vmProp.parentUid = sourceObjectUid;
  };
  /**
   * Retrieve the source object uid from the property, if no intermediate object, then from the parent object.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.getSourceObjectUid = function (vmProp) {
    var sourceObjectUid = vmProp.parentUid;

    if (!_.isEmpty(vmProp.intermediateObjectUids)) {
      sourceObjectUid = vmProp.intermediateObjectUids[vmProp.intermediateObjectUids.length - 1];
    }

    return sourceObjectUid;
  };
  /**
   * Retrieve the relation object uid from the property, if no intermediate object, then from the parent object.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.getRelationObjectUid = function (vmProp) {
    var sourceObjectUid = vmProp.parentUid;

    if (vmProp.intermediateObjectUids && vmProp.intermediateObjectUids.length > 0) {
      sourceObjectUid = vmProp.intermediateObjectUids[0];
    }

    return sourceObjectUid;
  };
  /**
   * Returns the property name as defined in the source object for this view model property .
   *
   * For e.g. this method would return "object_name" for a view Model property with name
   * REF(items_tag,Item).object_name
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object
   */


  exports.getPropertyNameInSourceObject = function (vmProp) {
    var sourcePropertyName = vmProp.propertyName;

    if (vmProp.isDCP || !_.isEmpty(vmProp.intermediateObjectUids)) {
      if (sourcePropertyName.indexOf('.') > 0) {
        sourcePropertyName = sourcePropertyName.split('.').slice(-1).pop();
      }
    }

    return sourcePropertyName;
  };
  /**
   * Trigger digest cycle of root scope so that widgets get reflected to the overlay object updates.
   */


  exports.triggerDigestCycle = function () {
    // trigger angular digest cycle on root scope so that value updates get reflected
    if (_documentScope) {
      _documentScope.$evalAsync();
    } else if (_docNgElement && _docNgElement.scope()) {
      _documentScope = _docNgElement.scope();

      _documentScope.$evalAsync();
    }
  };
  /**
   * Set the internal value of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Object} value - real value of the property. The internal (database) representation of the property's
   *            value.
   */


  exports.setValue = function (vmProp, value) {
    var sameAsOriginal = _.isEqual(value, vmProp.value);

    if (!sameAsOriginal || vmProp.valueUpdated && !_.isEqual(value, vmProp.newValue)) {
      vmProp.valueUpdated = true;
      /**
       * This happens in case of CasCade Suggestive LOV, When user changes value in first LOV, for dependent
       * LOV value comes as [""] ( array of empty string) and it causes JSON parsing error for soa call.
       */

      if (!vmProp.isArray && _.isArray(value) && value.length > 0) {
        vmProp.dbValue = value[0];
      } else {
        vmProp.dbValue = value;
      }

      if (_.isArray(value) && !vmProp.isArray) {
        vmProp.newValue = _.cloneDeep(value[0]);
      } else {
        vmProp.newValue = _.cloneDeep(value);
      }

      vmProp.error = null; // Always update display values
      // Do this first in case property change listeners want to change to something else

      exports.updateDisplayValues(vmProp, exports.getDisplayValues(vmProp)); // TODO: Everything that the setWidgetData() function in ValueBinder.java does should be done from here to remove GWT dependency
      // This will need to be cleaned up in 3.4 - too risky in 3.3

      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_VALUE);
      }
    }
  };
  /**
   * Set the old value of the ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Object} oldValues - Old Value of property.
   */


  exports.setOldValues = function (vmProp, oldValues) {
    var oldValuesFinal = oldValues === null ? [] : oldValues;
    vmProp.oldValues = oldValuesFinal;
    vmProp.oldValue = exports.getUiValue(oldValuesFinal);
  };
  /**
   * Set display values of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {StringArray} displayValues - display value of the property. Array of strings representing the current
   *            user displayable value(s) of the property.
   */


  exports.setDisplayValue = function (vmProp, displayValues) {
    var sameAsOriginal = !vmProp.prevDisplayValues || _.isEqual(displayValues, vmProp.prevDisplayValues);

    if (!vmProp.displayValueUpdated && !sameAsOriginal || vmProp.displayValueUpdated && !_.isEqual(displayValues, vmProp.newDisplayValues)) {
      vmProp.displayValueUpdated = !sameAsOriginal;
      vmProp.error = null;
      exports.updateDisplayValues(vmProp, displayValues);

      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_VALUE);
      }
    }
  };
  /**
   * Set widget display values of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {StringArray} displayValues - display value of the property. Array of strings representing the current
   *            user displayable value(s) of the property.
   */


  exports.setWidgetDisplayValue = function (vmProp, displayValues) {
    var sameAsOriginal = _.isEqual(displayValues, vmProp.displayValues);

    if (!sameAsOriginal) {
      exports.updateDisplayValues(vmProp, displayValues);
    }
  };
  /**
   * Set 'isEnabled' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isEnabled - TRUE if the property's value should be shown normally and (if also editable)
   *            react to user input. FALSE if the property's value should be shown 'greyed out' and not react to
   *            user input (even if editable).
   */


  exports.setIsEnabled = function (vmProp, isEnabled) {
    vmProp.isEnabled = isEnabled;
  };
  /**
   * Set 'isRichText' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isRichText - TRUE if the string value of the property is in HTML format and should be
   *            displayed using HTML formatting rules and edited with the 'rich text' editor.
   */


  exports.setIsRichText = function (vmProp, isRichText) {
    vmProp.isRichText = isRichText;
  };
  /**
   * Set 'isNull' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isNull - TRUE if the current property value is 'no value'. FALSE if the value is valid as
   *            is.
   */


  exports.setIsNull = function (vmProp, isNull) {
    vmProp.isNull = isNull;
  };
  /**
   * Set 'isRequired' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isRequired - TRUE if the property's value is required to sucessfully complete some operation
   *            that uses it. FALSE if the property's value is optional.
   */


  exports.setIsRequired = function (vmProp, isRequired) {
    if (vmProp.isRequired !== isRequired) {
      vmProp.isRequired = isRequired;

      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_REQUIRED);
      } // Set required place holder text if 'isRequired' flag is true


      if (vmProp.isRequired) {
        if (_localTextBundle) {
          vmProp.propertyRequiredText = _localTextBundle.REQUIRED_TEXT;
        } else {
          _localeSvc.getTextPromise().then(function (localTextBundle) {
            _localTextBundle = localTextBundle;
            vmProp.propertyRequiredText = _localTextBundle.REQUIRED_TEXT;
          });
        }
      } else {
        vmProp.propertyRequiredText = '';
      }
    }
  };
  /**
   * Set the place holder text on the ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} placeHolderText - The place holder text
   */


  exports.setPlaceHolderText = function (vmProp, placeHolderText) {
    vmProp.propertyRequiredText = placeHolderText;
  };
  /**
   * Set 'isLocalizable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} isLocalizable - TRUE if the property value's UI should include the option to alow any user
   *            entered value to be converted from local language (as entered) into some other system language.
   */


  exports.setIsLocalizable = function (vmProp, isLocalizable) {
    vmProp.isLocalizable = isLocalizable;
  };
  /**
   * Set 'isDisplayable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} isDisplayable - isDisplayable state of ViewModelProperty.
   */


  exports.setIsDisplayable = function (vmProp, isDisplayable) {
    vmProp.isDisplayable = isDisplayable;
  };
  /**
   * Set 'isAutoAssignable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} isAutoAssignable - TRUE if the property's value can/should be assigned automatically by
   *            Teamcenter. FALSE if the property's value is not normally assigned/controlled by Teamcenter.
   */


  exports.setIsAutoAssignable = function (vmProp, isAutoAssignable) {
    vmProp.isAutoAssignable = isAutoAssignable;
  };
  /**
   * Set 'hasInitialValue' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} hasInitialValue - TRUE if the property has initial value. FALSE if the property does not
   *            have initial value.
   */


  exports.setHasInitialValue = function (vmProp, hasInitialValue) {
    vmProp.hasInitialValue = hasInitialValue;
  };
  /**
   * Set 'maxLength' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Number} maxLength - If not equal to '-1' or '0', this parameter specifies the maximum number of
   *            characters allowed in a string type property.
   */


  exports.setLength = function (vmProp, maxLength) {
    if (maxLength !== -1 && maxLength !== 0) {
      vmProp.maxLength = maxLength;
    }
  };
  /**
   * Set 'numberOfCharacters' of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Number} numberOfCharacters - If not equal to '-1' or '0', this parameter specifies the number of
   *            characters in a string type property.
   */


  exports.setNumberOfCharacters = function (vmProp, numberOfCharacters) {
    if (numberOfCharacters !== -1 && numberOfCharacters !== 0) {
      vmProp.numberOfCharacters = numberOfCharacters;
    }
  };
  /**
   * Set 'numberOfLines' of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Number} numberOfLines - If not equal to '-1' or '0', this parameter specifies the number of lines
   *            allowed in a property.
   */


  exports.setNumberOfLines = function (vmProp, numberOfLines) {
    if (numberOfLines !== -1 && numberOfLines !== 0) {
      vmProp.numberOfLines = numberOfLines;
    }
  };
  /**
   * Set 'isArray' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isArray - TRUE if the property can have more than one value in an ordered list. FALSE if the
   *            property can have only a single value.
   */


  exports.setIsArray = function (vmProp, isArray) {
    if (vmProp.isArray !== isArray) {
      vmProp.isArray = isArray; // Set array place holder text if 'isArray' flag is true and the property is not required.

      if (vmProp.isArray) {
        if (!_.isArray(vmProp.dbValue)) {
          vmProp.dbValue = [];
          vmProp.value = [];
        }

        if (_localTextBundle) {
          _setArrayText(vmProp, _localTextBundle);
        } else {
          _localeSvc.getTextPromise().then(function (localTextBundle) {
            _localTextBundle = localTextBundle;

            _setArrayText(vmProp, _localTextBundle);
          });
        }
      }

      vmProp.displayValsModel = [];
      var nVal = vmProp.displayValues.length;

      for (var i = 0; i < nVal; i++) {
        vmProp.displayValsModel.push({
          displayValue: vmProp.displayValues[i],
          selected: false
        });
      }
    }
  };
  /**
   * Set 'arrayLength' state of ViewModelProperty. Applies only if the property is an array
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Number} arrayLength - set the array length. Set "-1" if unlimited array.
   */


  exports.setArrayLength = function (vmProp, arrayLength) {
    vmProp.arrayLength = arrayLength;
  };
  /**
   * Set 'referenceTypeName' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} typeName - set reference type name of ViewModelProperty.
   */


  exports.setReferenceType = function (vmProp, typeName) {
    vmProp.referenceTypeName = typeName;
  };
  /**
   * Set data type of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} dataType - data type of ViewModelProperty.
   */


  exports.setDataType = function (vmProp, dataType) {
    vmProp.type = dataType;
  };
  /**
   * Set 'error' of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} error - The message that should be displayed when some aspect of the property's value is not
   *            correct. This value must be 'null' or an empty string to not have the error be displayed.
   */


  exports.setError = function (vmProp, error) {
    if (vmProp.error !== error) {
      vmProp.error = error;

      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_ERROR);
      }
    }
  };
  /**
   * Set client validation error of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} clientValidationError - set client validation error of ViewModelProperty.
   */


  exports.setClientValidationError = function (vmProp, clientValidationError) {
    vmProp.clientValidationError = clientValidationError;
  };
  /**
   * Set server validation error flag of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} hasServerValidationError - set server validation error flag of ViewModelProperty.
   */


  exports.setServerValidationError = function (vmProp, hasServerValidationError) {
    vmProp.hasServerValidationError = hasServerValidationError;
  };
  /**
   * Set property display name of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} propertyDisplayName - user displayable name of ViewModelProperty.
   */


  exports.setPropertyDisplayName = function (vmProp, propertyDisplayName) {
    vmProp.propertyDisplayName = propertyDisplayName;
  };
  /**
   * Set property label display of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} propertyLabelDisplay - String value of property label display.
   */


  exports.setPropertyLabelDisplay = function (vmProp, propertyLabelDisplay) {
    vmProp.propertyLabelDisplay = propertyLabelDisplay;
  };
  /**
   * Reset updates which converts back to original value.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.resetUpdates = function (vmProp) {
    var fireEvent = false;

    if (vmProp.valueUpdated) {
      vmProp.valueUpdated = false;
      fireEvent = true;
    }

    if (vmProp.displayValueUpdated) {
      vmProp.displayValueUpdated = false;
      fireEvent = true;
    }

    if (vmProp.error) {
      vmProp.error = null;

      if (!fireEvent && vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_ERROR);
      }
    }

    if (fireEvent) {
      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_VALUE);
      }

      exports.resetValues(vmProp);
    }
  };
  /**
   * Sets the value and displayValues with the updated 'new' values.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.replaceValuesWithNewValues = function (vmProp) {
    if (vmProp.valueUpdated) {
      vmProp.value = _.cloneDeep(vmProp.newValue);
    }

    if (vmProp.displayValueUpdated) {
      if (vmProp.prevDisplayValues) {
        vmProp.prevDisplayValues = _.clone(vmProp.displayValues);
      }

      vmProp.displayValues = _.clone(vmProp.newDisplayValues);
    }
  };
  /**
   * Reset updates which converts back to original value.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.resetProperty = function (vmProp) {
    var fireEvent = false;

    if (vmProp.valueUpdated) {
      vmProp.valueUpdated = false;
      fireEvent = true;
    }

    if (vmProp.displayValueUpdated) {
      vmProp.displayValueUpdated = false;
      fireEvent = true;
    }

    if (vmProp.error) {
      vmProp.error = null;

      if (!fireEvent && vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_ERROR);
      }
    }

    if (fireEvent) {
      if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
        vmProp.propApi.notifyPropChange(PROP_VALUE);
      }
    }
  };
  /**
   * Reset db values and display values back to original value.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.resetValues = function (vmProp) {
    if (_.isArray(vmProp.value)) {
      vmProp.dbValue = vmProp.value.slice(0);
    } else {
      vmProp.dbValue = _.cloneDeep(vmProp.value);
    }

    if (vmProp.prevDisplayValues) {
      vmProp.displayValues = _.clone(vmProp.prevDisplayValues);
    }

    vmProp.uiValue = exports.getUiValue(vmProp.displayValues);

    if (vmProp.isArray) {
      vmProp.displayValsModel = [];

      for (var i = 0; i < vmProp.displayValues.length; i++) {
        vmProp.displayValsModel.push({
          displayValue: vmProp.displayValues[i],
          selected: false
        });
      }
    }
  };
  /**
   * Set edit state of ViewModelProperty. If the property is editable and editable in view model then the
   * 'isEditable' flag is set to true which shows the properties as editable.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} editable - set edit state of ViewModelProperty.
   *
   * @param {Boolean} override - TRUE if the editing state should be updated an announced even if not currently
   *            different than the desired state.
   */


  exports.setEditState = function (vmProp, editable, override) {
    if (vmProp.editableInViewModel !== editable || override) {
      vmProp.editableInViewModel = editable;
      vmProp.error = null;
      vmProp.isEditable = vmProp.editable && vmProp.editableInViewModel && vmProp.isPropertyModifiable;
      exports.setEditLayoutSide(vmProp);

      if (vmProp.propApi) {
        if (vmProp.propApi.setLOVValueProvider) {
          vmProp.propApi.setLOVValueProvider();
        }

        if (vmProp.propApi.setAutoAssignHandler) {
          vmProp.propApi.setAutoAssignHandler();
        }

        if (vmProp.propApi.setObjectLinkPropertyHandler) {
          vmProp.propApi.setObjectLinkPropertyHandler();
        }

        if (vmProp.propApi && vmProp.propApi.notifyPropChange) {
          vmProp.propApi.notifyPropChange(PROP_EDITABLE);
        }
      }

      if (vmProp.isEditable && (!vmProp.prevDisplayValues || vmProp.prevDisplayValues !== vmProp.displayValues)) {
        vmProp.prevDisplayValues = _.clone(vmProp.displayValues);
      }
    }
  };
  /**
   * Set 'editable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} editable - set editable state of ViewModelProperty.
   */


  exports.setEditable = function (vmProp, editable) {
    vmProp.editable = editable;
  };
  /**
   * Set 'isEditable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isEditable - TRUE if the user should have the ability to change the property's value. FALSE
   *            if the value is read-only.
   */


  exports.setIsEditable = function (vmProp, isEditable) {
    if (vmProp.isEditable !== isEditable) {
      vmProp.isEditable = isEditable;
      exports.setEditLayoutSide(vmProp);
    }
  };
  /**
   * Set 'isPropertyModifiable' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isPropertyModifiable - TRUE if the user should have the ability to change the property's
   *            value. FALSE if the value is read-only.
   */


  exports.setIsPropertyModifiable = function (vmProp, isPropertyModifiable) {
    if (vmProp.isPropertyModifiable !== isPropertyModifiable) {
      vmProp.isPropertyModifiable = isPropertyModifiable; // set is editable flag whenever property modifiable state is changed

      vmProp.isEditable = vmProp.editable && vmProp.editableInViewModel && vmProp.isPropertyModifiable;
      exports.setEditLayoutSide(vmProp);
    }
  };
  /**
   * Set edit layout side state of ViewModelProperty. For 'Boolean' and 'Object' based properties which doesn't
   * have LOV's this flag is set to true.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.setEditLayoutSide = function (vmProp) {
    if (vmProp.type === 'BOOLEAN' || vmProp.type === 'OBJECT') {
      vmProp.editLayoutSide = vmProp.isEditable && !vmProp.hasLov;
    }
  };
  /**
   * Set 'hasLov' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} hasLov - TRUE if the property has a specific list of values associated with it.
   */


  exports.setHasLov = function (vmProp, hasLov) {
    if (vmProp.hasLov !== hasLov) {
      vmProp.hasLov = hasLov;
      exports.setEditLayoutSide(vmProp);
    }
  };
  /**
   * Set 'isSelectOnly' state of ViewModelProperty.
   * This property allows the selected lov entry to be select only, i.e, user cannot type in the widget after selecting the lov entry.
   * This change is to support isSelectOnly in aw-widget used as a list box.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} isSelectOnly - TRUE/FALSE. Default is false, allows user to edit value in input box.
   */


  exports.setIsSelectOnly = function (vmProp, isSelectOnly) {
    if (vmProp.isSelectOnly !== isSelectOnly) {
      vmProp.isSelectOnly = isSelectOnly;
    }
  };
  /**
   * Set 'renderingHint' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} renderingHint - Depending on the type, this string indicates some variation in how the
   *            property's value should be displayed (e.g. For 'BOOLEAN' type, valid values include 'radiobutton',
   *            'togglebutton', 'checkbox'. For 'STRING' type, valid values include 'label', 'textbox',
   *            'textfield', 'textarea', 'longtext').
   */


  exports.setRenderingHint = function (vmProp, renderingHint) {
    vmProp.renderingHint = renderingHint;
  };
  /**
   * Set 'overlayType' of ViewModelProperty. 'viewModelPropertyOverlay' - which defines that the overlay has real
   * data(i.e IViewModelProperty). 'widgetOverlay' - which defines that the overlay has widget data.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {String} overlayType - set overlay type of ViewModelProperty.
   */


  exports.setOverlayType = function (vmProp, overlayType) {
    vmProp.overlayType = overlayType;
  };
  /**
   * Set 'autofocus' state of ViewModelProperty. Which defines whether the widget needs to be autofocused or NOT
   * bound to this property.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} autofocus - set autofocus state of ViewModelProperty.
   */


  exports.setAutoFocus = function (vmProp, autofocus) {
    vmProp.autofocus = autofocus;
  };
  /**
   * Set 'dirty' state of ViewModelProperty. Which defines whether the widget needs to be dirty or NOT.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} dirty - set dirty state of ViewModelProperty.
   */


  exports.setDirty = function (vmProp, dirty) {
    vmProp.dirty = dirty;
  };
  /**
   * Set array max row count of ViewModelProperty. Number of visible rows for array widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Number} maxRowCount - set array max row count of ViewModelProperty.
   */


  exports.setMaxRowCount = function (vmProp, maxRowCount) {
    if (maxRowCount !== -1 && maxRowCount !== 0 && vmProp.maxRowCount !== maxRowCount) {
      vmProp.maxRowCount = maxRowCount;
    }
  };
  /**
   * Set minimum date of ViewModelProperty. Only applicable for date widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Date} dateToSet - Date object that represents the earliest date/time this widget should allow.
   */


  exports.setMinimumDate = function (vmProp, dateToSet) {
    if (vmProp && vmProp.dateApi) {
      vmProp.dateApi.minDate = dateToSet;
    }
  };
  /**
   * Set maximum date of ViewModelProperty. Only applicable for date widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Date} dateToSet - Date object that represents the latest date/time this widget should allow.
   */


  exports.setMaximumDate = function (vmProp, dateToSet) {
    if (vmProp && vmProp.dateApi) {
      vmProp.dateApi.maxDate = dateToSet;
    }
  };
  /**
   * Set date Enabled state of ViewModelProperty. Which defines whether the date should be shown in date widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} enabled TRUE if date is enabled
   */


  exports.setDateEnabled = function (vmProp, enabled) {
    if (vmProp && vmProp.dateApi) {
      vmProp.dateApi.isDateEnabled = enabled;
    }
  };
  /**
   * Set time Enabled state of ViewModelProperty. Which defines whether the time should be shown in date widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {Boolean} enabled TRUE if time is enabled.
   */


  exports.setTimeEnabled = function (vmProp, enabled) {
    if (vmProp && vmProp.dateApi) {
      vmProp.dateApi.isTimeEnabled = enabled;
    }
  };
  /**
   * Set vertical state of ViewModelProperty. Which defines whether the radio button should show vertical or not.
   * Only applicable for radio button widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {Boolean} vertical TRUE if radio button need to be shown vertically.
   */


  exports.setRadioButtonVertical = function (vmProp, vertical) {
    if (vmProp && vmProp.radioBtnApi) {
      vmProp.radioBtnApi.vertical = vertical;
    }
  };
  /**
   * Set radio button's custom true label of ViewModelProperty. Only applicable for radio button widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} customTrueLabel custom true label for radio button.
   */


  exports.setRadioButtonCustomTrueLabel = function (vmProp, customTrueLabel) {
    if (vmProp && vmProp.radioBtnApi) {
      vmProp.radioBtnApi.customTrueLabel = customTrueLabel;
    }
  };
  /**
   * Set radio button's custom false label of ViewModelProperty. Only applicable for radio button widget.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   *
   * @param {String} customFalseLabel custom false label for radio button.
   */


  exports.setRadioButtonCustomFalseLabel = function (vmProp, customFalseLabel) {
    if (vmProp && vmProp.radioBtnApi) {
      vmProp.radioBtnApi.customFalseLabel = customFalseLabel;
    }
  };
  /**
   * Has this property been modified in the view model
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {Boolean} TRUE if the property is modified in the view model.
   */


  exports.isModified = function (vmProp) {
    return vmProp.valueUpdated || vmProp.displayValueUpdated;
  };
  /**
   * Get the Display Value for Property. View uses Display Value for rendering if the property is not in edit
   * state. <br>
   * View uses Display Value for rendering if the property is not in edit state. If it is edit state, it has to
   * use the value.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {StringArray} Array of display values
   */


  exports.getDisplayValues = function (vmProp) {
    /**
     * Return new display values when ViewModelProperty display values are updated.
     */
    if (vmProp.displayValueUpdated) {
      return vmProp.newDisplayValues;
    }
    /**
     * Return the display value as per the real value when they are out of sync. If valueUpdated is true but
     * displayValueUpdated is false, then it means they are out of sync.
     */


    var vmPropType = vmProp.type;

    if (vmProp.valueUpdated && vmProp.newValue !== null && vmProp.newValue !== undefined) {
      var displayValues = [];

      if (vmProp.isArray) {
        var indx;

        if (vmPropType === 'DATEARRAY') {
          for (indx = 0; indx < vmProp.newValue.length; indx++) {
            displayValues.push(_dateTimeSvc.formatSessionDateTime(vmProp.newValue[indx]));
          }
        } else if (vmPropType === 'OBJECTARRAY') {
          for (indx = 0; indx < vmProp.newValue.length; indx++) {
            displayValues.push(exports.getDisplayName(vmProp.newValue[indx]));
          }
        } else {
          /**
           * For LOVs use property display values which are already set by LOV widget.
           */
          if (vmProp.hasLov) {
            for (indx = 0; indx < vmProp.displayValues.length; indx++) {
              displayValues.push(vmProp.displayValues[indx].toString());
            }
          } else {
            for (indx = 0; indx < vmProp.newValue.length; indx++) {
              displayValues.push(vmProp.newValue[indx].toString());
            }
          }
        }
      } else {
        if (vmPropType === 'DATE') {
          if (!vmProp.dateApi.isTimeEnabled && vmProp.dateApi.isDateEnabled) {
            displayValues.push(_dateTimeSvc.formatSessionDate(vmProp.newValue));
          } else if (vmProp.dateApi.isTimeEnabled && !vmProp.dateApi.isDateEnabled) {
            displayValues.push(_dateTimeSvc.formatSessionTime(vmProp.newValue));
          } else {
            displayValues.push(_dateTimeSvc.formatSessionDateTime(vmProp.newValue));
          }
        } else if (vmPropType === 'OBJECT') {
          /**
           * This is for the case where view model property is created in GWT. Once we have all all GWT
           * code converted to native, this condition will go away
           */
          if (vmProp.propApi) {
            displayValues.push(exports.getDisplayName(vmProp.newValue));
          } else {
            // If view model property is created in native code. e.g. declarative
            if (!declUtils.isNil(vmProp.uiValue)) {
              displayValues.push(vmProp.uiValue);
            }
          }
        } else if (vmProp.hasLov) {
          /**
           * For LOVs use property uiValue which is already set by LOV widget.
           */
          if (!declUtils.isNil(vmProp.uiValue)) {
            displayValues.push(vmProp.uiValue.toString());
          }
        } else {
          /**
           * when the type is integer or string, if value is 0 or empty string, framework is not allowing
           * the display value to be updated with those values previously.
           */
          if (!declUtils.isNil(vmProp.newValue)) {
            displayValues.push(vmProp.newValue.toString());
          }
        }
      }

      return displayValues;
    }

    return vmProp.prevDisplayValues;
  };
  /**
   * Returns the object type name for which this property is defined.
   *
   * @return {String } object type name for which this property is defined.
   */


  exports.getOwningTypeName = function (vmProp) {
    if (vmProp.propertyDescriptor && vmProp.propertyDescriptor.srcObjectTypeName) {
      // use the source object type name for dcp properties
      return vmProp.propertyDescriptor.srcObjectTypeName;
    } else if (vmProp.parentUid && _clientDataModel.getObject(vmProp.parentUid)) {
      return _clientDataModel.getObject(vmProp.parentUid).type;
    } // return null if no information of the owning object is found


    return null;
  };
  /**
   * Get the display name of the selected type reference object
   *
   * @param {String} uid - The UID of the selected object
   */


  exports.getDisplayName = function (uid) {
    var displayName = null;

    var modelObject = _clientDataModel.getObject(uid);

    if (modelObject && modelObject.props.object_string) {
      displayName = modelObject.props.object_string.uiValues[0];
    }

    return displayName;
  };
  /**
   * Get string of the Property value.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {StringArray} Array of display values
   */


  exports.getValueStrings = function (vmProp) {
    var values = [];

    if (vmProp.isArray) {
      if (vmProp.type === 'DATEARRAY') {
        for (var indx = 0; indx < vmProp.dbValue.length; indx++) {
          values.push(_dateTimeSvc.formatUTC(vmProp.dbValue[indx]));
        }
      } else {
        for (var indx2 = 0; indx2 < vmProp.dbValue.length; indx2++) {
          values.push(String(vmProp.dbValue[indx2] !== null ? vmProp.dbValue[indx2] : ''));
        }
      }
    } else {
      if (vmProp.type === 'DATE') {
        values.push(_dateTimeSvc.formatUTC(vmProp.dbValue));
      } else {
        values.push(String(vmProp.dbValue !== null ? vmProp.dbValue : ''));
      }
    }

    return values;
  };
  /**
   * Returns TRUE if the internal value of the property is a number.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {Boolean} TRUE if the dbValue of the property overlay is a number.
   */


  exports.isDbValueNumber = function (vmProp) {
    if (vmProp.valueUpdated) {
      return $.isNumeric(vmProp.newValue);
    }

    return $.isNumeric(vmProp.value);
  };
  /**
   * Returns TRUE if the internal value of the property is a boolean.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {Boolean} TRUE if the dbValue of the property overlay is a boolean.
   */


  exports.isDbValueBoolean = function (vmProp) {
    if (vmProp.valueUpdated) {
      return _.isBoolean(vmProp.newValue);
    }

    return _.isBoolean(vmProp.value);
  };
  /**
   * Returns TRUE if the overlayType is widgetOverlay.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {Boolean} TRUE if the overlay type is widgetOverlay.
   */


  exports.isOverlayTypeWidget = function (vmProp) {
    return vmProp.overlayType && vmProp.overlayType === WIDGET;
  };
  /**
   * Set 'initialize' state of ViewModelProperty.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   */


  exports.initialize = function (vmProp) {
    vmProp.initialize = true;
  };
  /**
   * Updates property display values
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @param {StringArray} displayValues - display value of the property. Array of strings representing the current
   *            user displayable value(s) of the property.
   */


  exports.updateDisplayValues = function (vmProp, displayValues) {
    var displayValuesFinal = displayValues ? displayValues : [];
    vmProp.isNull = displayValuesFinal && displayValuesFinal.length === 0;
    vmProp.displayValues = displayValuesFinal;
    vmProp.newDisplayValues = displayValuesFinal;
    vmProp.uiValue = exports.getUiValue(vmProp.displayValues);

    if (vmProp.isArray) {
      vmProp.displayValsModel = [];

      for (var i = 0; i < vmProp.displayValues.length; i++) {
        vmProp.displayValsModel.push({
          displayValue: vmProp.displayValues[i],
          selected: false
        });
      }
    }
  };
  /**
   * Returns the base property name of the dynamic compound property.
   *
   * @param {String} propertyName - property name to be evaluated.
   * @return {String} Base property name.
   */


  exports.getBasePropertyName = function (propertyName) {
    var baseProperty = propertyName;
    var lastPeriod = baseProperty.lastIndexOf('.');
    baseProperty = baseProperty.substr(lastPeriod + 1);
    return baseProperty;
  };
  /**
   * Updates ViewModelProperty with updated values. Added a return of promise in case of async call to load
   * objects which is required for OBJECT or OBJECTARRAY property types. The promise is resolved or rejected based
   * on execution of the load objects api.
   *
   * @param {ViewModelProperty} vmProp - ViewModelProperty object that will be updated.
   * @return {Promise} A non-null promise is returned when the input vmProp.type is an OBJECT or OBJECTARRAY. This
   *         promise will be 'resolved' or 'rejected' when the loadObject operation of data management service is
   *         invoked and its response data is available. In case the input vmProp.type is not OBJECT or
   *         OBJECTARRAY, then promise returned is null. Caller should explicitly do a null check on the promise
   *         before invoking any functions on it.
   */


  exports.updateViewModelProperty = function (vmProp) {
    var isValid = false;
    var vmPropType = vmProp.type;

    if (vmPropType === 'INTEGER') {
      if (isFinite(vmProp.dbValue)) {
        if (vmProp.dbValue !== null && vmProp.dbValue !== '') {
          vmProp.dbValue = Number(vmProp.dbValue);

          if (vmProp.dbValue >= _integerMinValue && vmProp.dbValue <= _integerMaxValue) {
            isValid = true;
          }
        } else {
          isValid = true;
        }
      }
    } else if (vmPropType === 'DOUBLE' || vmPropType === 'DATE') {
      if (isFinite(vmProp.dbValue)) {
        if (vmProp.dbValue !== null && vmProp.dbValue !== '') {
          vmProp.dbValue = Number(vmProp.dbValue);
        }

        isValid = true;
      }
    } else {
      isValid = true;
    }

    if (isValid) {
      if (vmPropType !== 'OBJECT' && vmPropType !== 'OBJECTARRAY') {
        exports.setValue(vmProp, vmProp.dbValue);

        if (vmProp.propApi && vmProp.propApi.fireValueChangeEvent) {
          vmProp.propApi.fireValueChangeEvent();
        }
      } else {
        var uidsArray = vmProp.dbValue;

        if (!vmProp.isArray) {
          uidsArray = [];

          if (vmProp.dbValue !== null && vmProp.dbValue !== undefined && vmProp.dbValue !== '') {
            uidsArray.push(vmProp.dbValue);
          } else if (vmProp.uiValue) {
            uidsArray.push(vmProp.uiValue);
          }
        }

        if (!_pingDeferred) {
          _pingDeferred = _$q.defer();
        }

        _pingLoadObjects(uidsArray, vmProp);

        return _pingDeferred.promise;
      }
    } else {
      /**
       * Change isNull flag to false, if dbValue & uiValue exists and even though its NOT valid.
       */
      if (vmProp.isNull && vmProp.dbValue && vmProp.uiValue) {
        vmProp.isNull = false;
      }
      /**
       * Change valueUpdated flag to true, if dbValue & uiValue exists and even though its NOT valid.
       */


      if (vmProp.dbValue && vmProp.uiValue) {
        vmProp.valueUpdated = true;
      }
    }

    return null;
  };
  /**
   * Test if the given object 'is-a' ViewModelProperty created by this service.
   *
   * @param {Object} objectToTest - Object to check prototype history of.
   * @return {Boolean} TRUE if the given object is a ViewModelProperty.
   */


  exports.isViewModelProperty = function (objectToTest) {
    return objectToTest instanceof ViewModelProperty;
  };
  /**
   * Retrieve the cdm's modelObject from a property's source object uid.
   *
   * @param {ViewModelProperty} vmProp - Property to retrieve source object
   */


  exports.getSourceModelObject = function (vmProp) {
    var sourceObjectUid = exports.getSourceObjectUid(vmProp);
    return _clientDataModel.getObject(sourceObjectUid);
  };
  /**
   * This is the primary service used to create, test and manage the properties of ViewModelProperty Objects used
   * throughout the UniversalWidget (et al.) areas of AW.
   *
   * @memberof NgServices
   * @member uwPropertyService
   */


  app.factory('uwPropertyService', //
  ['$q', 'dateTimeService', 'localeService', 'soa_kernel_clientDataModel', 'soa_dataManagementService', //
  function ($q, dateTimeSvc, localeSvc, clientDataModel, dmSvc) {
    _$q = $q;
    _dateTimeSvc = dateTimeSvc;
    _localeSvc = localeSvc;
    _clientDataModel = clientDataModel;
    _dmSvc = dmSvc;
    return exports;
  }]);
});