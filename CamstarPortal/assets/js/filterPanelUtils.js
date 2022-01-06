"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/filterPanelUtils
 */
define(['app', 'jquery', 'js/logger', 'lodash', 'js/appCtxService', 'js/dateTimeService', 'js/uwPropertyService', 'js/uwDirectiveDateTimeService', 'js/messagingService', 'js/localeService', 'soa/preferenceService'], function (app, $, logger, _) {
  'use strict';

  var exports = {};
  var _appCtxSvc = null;
  var _dateTimeSvc = null;
  var _uwDirectiveDateTimeSvc = null;
  var _preferenceSvc = null;
  var _messagingSvc = null;
  var _invalidDateText = '';
  var _invalidRangeText = '';
  var _invalidPrefilter = '';
  exports.HIERARCHICAL_FACET_SEPARATOR = '/';
  exports.PRESET_CATEGORY = 'WorkspaceObject.object_type';
  exports.DATE_FILTER = 'DateFilter';
  exports.INTERNAL_DATE_FILTER = '_DateFilter_';
  exports.DATE_RANGE_FILTER = 'DateRangeFilter';
  exports.DATE_DRILLDOWN_FILTER = 'DrilldownDateFilter';
  exports.NUMERIC_RANGE_FILTER = 'NumericRangeFilter';
  exports.INTERNAL_NUMERIC_FILTER = '_NumericFilter_';
  exports.INTERNAL_OBJECT_FILTER = '_ObjectFilter_';
  exports.INTERNAL_NUMERIC_RANGE = '_NumericRange_';
  exports.NUMERIC_FILTER = 'NumericFilter';
  exports.NUMERIC_RANGE = 'NumericRange';
  exports.NumericRangeBlankStart = 'NumericRangeBlankStart';
  exports.NumericRangeBlankEnd = 'NumericRangeBlankEnd';
  var INTERNAL_TO = '_TO_';
  exports.NO_STARTDATE = '*';
  exports.NO_ENDDATE = '2100-12-31';
  exports.NO_STARTRANGE = '';
  exports.NO_ENDRANGE = '';
  exports.BEGINNING_OF_TIME = '0001-01-01T00:00:00';
  exports.ENDING_OF_TIME = '2100-12-31T23:59:59';
  var START_OF_DAY = '00:00:00';
  var _presetFilters = true;
  var _hasTypeFilter = false;
  var _incontextFlag = false;
  var _colorValue = false;
  var customPropValueColorMap = {};
  /**
   * Returns a date object.
   *
   * @function getDate
   * @memberOf filterPanelUtils
   *
   * @param {String}dateString - date string to be converted to date object
   *
   * @return {JsDate} a date object.
   */

  exports.getDate = function (dateString) {
    var dateStr = dateString.substring(0, 10);
    var date; // change open start/end date to null dates

    if (_.startsWith(dateStr, '0001-01-0') || _.startsWith(dateStr, '2100-12-3')) {
      date = _dateTimeSvc.getNullDate();
    } else {
      var timeStr = dateString.substring(11, dateString.length - 6);

      if (timeStr.indexOf('59') !== -1) {
        dateStr = dateString.replace(timeStr, START_OF_DAY);
      } else {
        dateStr = dateString;
      }

      date = new Date(dateStr);
    }

    return date;
  };
  /**
   * Returns a UTC date object.
   *
   * @function convertToUTC
   * @memberOf filterPanelUtils
   *
   * @param {Object}date - date object
   *
   * @return {JsDate} a UTC date object.
   */


  function convertToUTC(date) {
    var gmtTime = date.getTime();
    var offset = date.getTimezoneOffset();
    var jsDate = new Date(gmtTime + offset * 60 * 1000);
    return new Date(jsDate.getTime());
  }
  /**
   * Check if a date is null. The dateTimeService.isNullDate is not adequate, as the blank date from date widget can
   * sometimes be 0-0-0 0:0:0, or 0-0-0 23:59:XX, or 0-0-1 0:0:0, etc, only the first case is evaluated to true by the
   * dateTimeService.isNullDate.
   *
   * @function isNullDate
   * @memberOf filterPanelUtils
   *
   * @param {Object} dateToTest - a Date object.
   * @returns {Boolean} - true if it's a null date.
   */


  exports.isNullDate = function (dateToTest) {
    if (!dateToTest) {
      return true;
    }

    return dateToTest.getFullYear() <= 1;
  };
  /**
   * Validate dates for category date range.
   *
   * @function validateDates
   * @memberOf filterPanelUtils
   *
   * @param {Object}category - category. This object is modified in this function.
   * @param {Object}startDate - startDate
   * @param {Object}origStartDate - origStartDate
   * @param {Object}endDate - endDate
   * @param {Object}origEndDate - origEndDate
   */


  exports.validateDates = function (category, startDate, origStartDate, endDate, origEndDate) {
    category.showSearch = true;
    var cStartDate = category.daterange.startDate;
    var eEndDate = category.daterange.endDate;

    if (category.daterange.dateRangeSelected && !cStartDate.valueUpdated && !eEndDate.valueUpdated) {
      category.showSearch = false;
      return;
    } // The blank date in date range widget sometimes show up as 0-0-0 23:59:58 which is the end of the day,
    // which makes the isNullDate return false. Need to move to start of day then do the isNullDate check.


    var tmpStartDate = moveDateToStartOfDay(startDate);
    var tmpEndDate = moveDateToStartOfDay(endDate);

    var noStartDate = _dateTimeSvc.isNullDate(tmpStartDate);

    var noEndDate = _dateTimeSvc.isNullDate(tmpEndDate); // if both dates are not set, disable search button


    if (noStartDate && noEndDate) {
      category.showSearch = false;
      return;
    }

    var temp1 = _dateTimeSvc.compare(startDate, endDate); // if start date is later than end date, disable search button


    if (!noStartDate && !noEndDate && startDate !== null && temp1 === 1) {
      _messagingSvc.showError(_invalidDateText);

      category.showSearch = false;
      return;
    }

    var disable; // check if dates vary from previous search to avoid enabling search

    var tmpOrigEndDate = moveDateToStartOfDay(origEndDate);

    if (noStartDate) {
      // check if there is no startdate and if end date is same, disable search button
      disable = category.daterange.startDate === null && _dateTimeSvc.compare(tmpEndDate, tmpOrigEndDate) === 0;
    } else if (noEndDate) {
      // check if there is no enddate and  start date is same, disable search button
      disable = category.daterange.endDate === null && _dateTimeSvc.compare(startDate, category.daterange.startDate.dateApi.dateObject) === 0;
    } else {
      // if the dates are same as previous search, disable search button
      var compare1 = _dateTimeSvc.compare(startDate, origStartDate) === 0;
      var compare2 = _dateTimeSvc.compare(endDate, tmpOrigEndDate) === 0;
      disable = compare1 && compare2;
    }

    category.showSearch = !disable;
  };
  /**
   * get date range filter.
   *
   * @function getDateRangeString
   * @memberOf filterPanelUtils
   *
   * @param {Object}startDate - startDate
   * @param {Object}endDate - endDate
   *
   * @return {String} a string that represents the date range.
   */


  exports.getDateRangeString = function (startDate, endDate) {
    var noStartDate = exports.isNullDate(startDate);
    var noEndDate = exports.isNullDate(endDate);
    var fromDateString = noStartDate ? exports.NO_STARTDATE : _dateTimeSvc.formatUTC(startDate);

    if (noEndDate) {
      endDate = new Date(exports.NO_ENDDATE);
    }

    var toDateString = _dateTimeSvc.formatUTC(moveDateToEndOfDay(endDate));

    return exports.INTERNAL_DATE_FILTER + fromDateString + INTERNAL_TO + toDateString;
  };
  /**
   * get filter of date range.
   *
   * @function getDateRangeString
   * @memberOf filterPanelUtils
   *
   * @param {String}filter - filter
   *
   * @return {Object} a filter object of date range for the filter string.
   */


  exports.getDateRangeFilter = function (filter) {
    var searchFilter = {};
    var sArr = filter.split(INTERNAL_TO);
    searchFilter.searchFilterType = 'DateFilter';
    sArr[0] = sArr[0] === exports.NO_STARTDATE ? _dateTimeSvc.NULLDATE : _dateTimeSvc.formatUTC(sArr[0]);
    searchFilter.startDateValue = sArr[0];
    searchFilter.endDateValue = sArr[1];
    return searchFilter;
  };
  /**
   * get a date range filter with display name and category type.
   *
   * @function getDateRangeDisplayString
   * @memberOf filterPanelUtils
   *
   * @param {String}startDate - startDate
   * @param {String}endDate - endDate
   *
   * @return {Object} a date range filter with display name and category type.
   */


  exports.getDateRangeDisplayString = function (startDate, endDate) {
    var dateRangeFilter = {};

    var noStartDate = _dateTimeSvc.isNullDate(startDate);

    var noEndDate = _dateTimeSvc.isNullDate(endDate);

    var dateRangeString;

    if (noStartDate) {
      dateRangeString = 'To ' + _uwDirectiveDateTimeSvc.formatDate(new Date(endDate)).substring(0, 11);
    } else if (noEndDate) {
      dateRangeString = 'From ' + _uwDirectiveDateTimeSvc.formatDate(new Date(startDate)).substring(0, 11);
    } else {
      dateRangeString = _uwDirectiveDateTimeSvc.formatDate(new Date(startDate)).substring(0, 11) + ' - ' + _uwDirectiveDateTimeSvc.formatDate(new Date(endDate)).substring(0, 11);
    }

    dateRangeFilter.displayName = dateRangeString;
    dateRangeFilter.categoryType = exports.DATE_RANGE_FILTER;
    return dateRangeFilter;
  };
  /**
   * Simple check to validate the given category numeric range.
   *
   * @function checkIfValidRange
   * @memberOf filterPanelUtils
   *
   * @param {String}category - category
   * @param {Number}startRange - startRange
   * @param {Number}endRange - endRange
   *
   * @return {Boolean} true if valid range.
   */


  exports.checkIfValidRange = function (category, startRange, endRange) {
    category.showSearch = true;

    if (startRange !== null && endRange !== null && startRange > endRange) {
      var errorValue = startRange + '-' + endRange;

      var msg = _invalidRangeText.replace('{0}', errorValue);

      _messagingSvc.showError(msg);

      category.showSearch = false;
      return false;
    }

    return true;
  };
  /**
   * Validate the given category numeric range if the range is selected.
   *
   * @function validateNumericRangeSelected
   * @memberOf filterPanelUtils
   *
   * @param {String}category - category
   * @param {Number}startRange - startRange
   * @param {Number}endRange - endRange
   * @param {Number}cStartRange - current startRange
   * @param {Number}cEndRange - current endRange
   * @return {Boolean} true if valid range.
   */


  exports.validateNumericRangeSelected = function (category, startRange, endRange, cStartRange, cEndRange) {
    var hasValidated = false;
    var oStartRange = category.numericrange.filter.startNumericValue;
    var oEndRange = category.numericrange.filter.endNumericValue;
    var pStartRange = parseFloat(cStartRange);
    var pEndRange = parseFloat(cEndRange);
    var invalidStart = cStartRange === oStartRange || pStartRange === oStartRange || isNaN(pStartRange) && oStartRange === exports.NO_STARTRANGE; // when the start range goes from blank to 0, it's a real change, so the search button should be enabled.

    if (category.numericrange.filter.startEndRange === exports.NumericRangeBlankStart) {
      invalidStart = isNaN(pStartRange);
    }

    var invalidEnd = cEndRange === oEndRange || pEndRange === oEndRange || isNaN(pEndRange) && oEndRange === exports.NO_ENDRANGE;

    if (category.numericrange.filter.startEndRange === exports.NumericRangeBlankEnd) {
      invalidEnd = isNaN(pEndRange);
    } // when the end range goes from blank to 0, it's a real change, so the search button should be enabled.


    if (invalidStart && invalidEnd) {
      category.showSearch = false;
      hasValidated = true;
    }

    return hasValidated;
  };
  /**
   * Validate ranges for category numeric range.
   *
   * @function validateNumericRange
   * @memberOf filterPanelUtils
   *
   * @param {String} category - category
   * @param {String} startRange - startRange
   * @param {String} endRange - endRange
   *
   */


  exports.validateNumericRange = function (category, startRange, endRange) {
    category.showSearch = true; // Validate values to be numbers

    var cStartRange = category.numericrange.startValue.dbValue;
    var cEndRange = category.numericrange.endValue.dbValue;
    var oStartRange = null;
    var oEndRange = null;

    if (category.numericrange.numericRangeSelected && exports.validateNumericRangeSelected(category, startRange, endRange, cStartRange, cEndRange)) {
      return;
    }

    var noStartRange = cStartRange === undefined || cStartRange === null || cStartRange === '';
    var noEndRange = cEndRange === undefined || cEndRange === null || cEndRange === ''; // if both numbers are not set, disable search button

    if (noStartRange && noEndRange) {
      category.showSearch = false;
      return;
    }

    var disable = false;

    if (noStartRange) {
      disable = oStartRange === null && endRange === oEndRange || isNaN(endRange);
    } else if (noEndRange) {
      // check if there is no endRange and  start number is same, disable search button
      disable = oEndRange === null && startRange === oStartRange || isNaN(startRange);
    } else {
      disable = !isFinite(startRange) || isNaN(startRange) || !isFinite(endRange) || isNaN(endRange);
    }

    category.showSearch = !disable;
  };
  /**
   * get numeric range filter string.
   *
   * @function getNumericRangeString
   * @memberOf filterPanelUtils
   *
   * @param {String}startRange - startRange
   * @param {String}endRange - endRange
   *
   * @return {String} a numeric range string.
   */


  exports.getNumericRangeString = function (startRange, endRange) {
    var fromValue = startRange && startRange.toString();

    if (fromValue === undefined || fromValue.length === 0 || isNaN(fromValue)) {
      fromValue = exports.NO_STARTRANGE;
    }

    var toValue = endRange && endRange.toString();

    if (toValue === undefined || toValue.length === 0 || isNaN(toValue)) {
      toValue = exports.NO_ENDRANGE;
    }

    return exports.INTERNAL_NUMERIC_RANGE + fromValue + INTERNAL_TO + toValue;
  };
  /**
   * get numeric range filter from a filter string.
   *
   * @function getDateRangeDisplayString
   * @memberOf filterPanelUtils
   *
   * @param {String}filter - filter
   *
   * @return {Object} a numeric range filter.
   */


  exports.getNumericRangeFilter = function (filter) {
    var searchFilter = {};
    var sArr = filter.split(INTERNAL_TO);
    searchFilter.searchFilterType = exports.NUMERIC_FILTER;
    searchFilter.startNumericValue = parseFloat(sArr[0]);
    searchFilter.endNumericValue = parseFloat(sArr[1]);

    if (isNaN(searchFilter.startNumericValue)) {
      searchFilter.startEndRange = exports.NumericRangeBlankStart;
    } else if (isNaN(searchFilter.endNumericValue)) {
      searchFilter.startEndRange = exports.NumericRangeBlankEnd;
    } else {
      searchFilter.startEndRange = exports.NUMERIC_RANGE;
    }

    return searchFilter;
  };
  /**
   * get a numeric range filter.
   *
   * @function getNumericRangeDisplayString
   * @memberOf filterPanelUtils
   *
   * @param {Number}startRange - startRange
   * @param {Number}endRange - endRange
   * @param {String}startEndRange - startEndRange
   *
   * @return {Object} a numeric range filter with display name and category type.
   */


  exports.getNumericRangeDisplayString = function (startRange, endRange, startEndRange) {
    var numericRangeFilter = {};
    var noStartRange = startEndRange === exports.NumericRangeBlankStart || startRange !== 0 && !startRange;
    var noEndRange = startEndRange === exports.NumericRangeBlankEnd || endRange !== 0 && !endRange;
    var numericRangeString;

    if (noStartRange) {
      numericRangeString = 'To ' + endRange.toString();
    } else if (noEndRange) {
      numericRangeString = 'From ' + startRange.toString();
    } else {
      numericRangeString = startRange.toString() + ' - ' + endRange.toString();
    }

    numericRangeFilter.displayName = numericRangeString;
    numericRangeFilter.categoryType = exports.NUMERIC_RANGE_FILTER;
    return numericRangeFilter;
  };
  /**
   * get a real filter.
   *
   * @function getRealFilterWithNoFilterType
   * @memberOf filterPanelUtils
   *
   * @param {String}filter - filter
   *
   * @return {Object} the real filter stripped off the identifiers.
   */


  exports.getRealFilterWithNoFilterType = function (filter) {
    var realFilter = filter;

    if (!filter.hasOwnProperty('property')) {
      realFilter = filter.replace(exports.INTERNAL_NUMERIC_FILTER, '').replace(exports.INTERNAL_OBJECT_FILTER, '');
    }

    return realFilter;
  };
  /**
   * get filter type from filter value.
   *
   * @function getFilterTypeFromFilterValue
   * @memberOf filterPanelUtils
   *
   * @param {String}filter - filter
   *
   * @return {String} filter type, if it can be derived.
   */


  exports.getFilterTypeFromFilterValue = function (filter) {
    var filterType;

    if (!filter.hasOwnProperty('property')) {
      if (_.startsWith(filter, exports.INTERNAL_OBJECT_FILTER)) {
        filterType = 'ObjectFilter';
      } else if (_.startsWith(filter, exports.INTERNAL_NUMERIC_FILTER)) {
        filterType = 'NumericFilter';
      }
    } else {
      filterType = 'DateFilter';
    }

    return filterType;
  };
  /**
   * Get the selection for toggle command
   *
   * @return the selection state for command
   */

  /**
   * Get the selection for toggle command.
   *
   * @function getDateRangeDisplayString
   * @memberOf filterPanelUtils
   *
   * @param {Object}prefVals - preferences
   *
   * @return {Boolean} the selection state for command.
   */


  exports.getToggleCommandSelection = function (prefVals) {
    var prefVal = prefVals.AWC_ColorFiltering[0];
    _colorValue = false;
    var isCommandfHighlighted = 'false';

    if (prefVal === 'false') {
      isCommandfHighlighted = 'true';
      _colorValue = true;
    }

    _appCtxSvc.updatePartialCtx('decoratorToggle', _colorValue); // update data section with latest value


    prefVals.AWC_ColorFiltering[0] = isCommandfHighlighted;
    return isCommandfHighlighted;
  };
  /**
   * Get the value of color toggle
   *
   * @return {String} the color toggle
   */


  exports.getColorToggleVal = function () {
    return _colorValue;
  };
  /**
   * /** Return date to start of the day
   *
   * @param {Date} date a given date
   * @return {Date} date
   */


  function moveDateToStartOfDay(date) {
    if (!_dateTimeSvc.isNullDate(date)) {
      date.setHours(0, 0, 0);
      return date;
    }

    return date;
  }
  /**
   * Return date to start of the day
   *
   * @param {Date} date a given date
   * @return {Date} date
   */


  function moveDateToEndOfDay(date) {
    if (!_dateTimeSvc.isNullDate(date)) {
      date.setHours(23, 59, 59);
      return date;
    }

    return date;
  }
  /**
   * Returns true if preset filters are hidden
   *
   * @returns {Object} preset filter flag
   */


  exports.isPresetFilters = function () {
    return _presetFilters;
  };
  /**
   * Sets preset filters flag
   *
   * @param {Object} flag flag
   */


  exports.setPresetFilters = function (flag) {
    _presetFilters = flag;
  };
  /**
   * Returns true if preset filters are hidden
   *
   * @returns {Object} preset filter flag
   */


  exports.getHasTypeFilter = function () {
    return _hasTypeFilter;
  };
  /**
   * Sets preset filters flag
   *
   * @param {Object} flag preset filter flag
   */


  exports.setHasTypeFilter = function (flag) {
    _hasTypeFilter = flag;
  };
  /**
   * Sets incontext flag
   *
   * @param {Object} flag incontext flag
   */


  exports.setIncontext = function (flag) {
    _incontextFlag = flag;
  };
  /**
   * Gets incontext flag
   *
   * @returns {Object} incontext flag
   */


  exports.getIncontext = function () {
    return _incontextFlag;
  };
  /**
   * Sets scroll info into context
   *
   */


  exports.setScrollPosition = function () {
    var scrollBar = $('.aw-layout-panelBody')[0];
    $(scrollBar).scrollTop(0);
  };
  /**
   * Sets scroll info into context
   *
   * @param {Object} selectedNodeOffset to the selected node
   *
   */


  exports.updateScrollInfo = function (selectedNodeOffset) {
    var scrollBarOffset = $('.aw-layout-panelBody')[0].offsetTop;
    var scrollInfo = {};
    scrollInfo.nodeOffset = selectedNodeOffset - scrollBarOffset;

    var ctx = _appCtxSvc.getCtx('searchResponseInfo');

    if (ctx) {
      ctx.scrollInfo = scrollInfo;

      _appCtxSvc.updateCtx('searchResponseInfo', ctx);
    }
  };
  /**
   * Save source filter map in appcontext for incontext
   *
   * @param {Object} data data
   */


  exports.saveIncontextFilterMap = function (data) {
    var appCtxSvc = app.getInjector().get('appCtxService');
    appCtxSvc.unRegisterCtx('searchIncontextInfo');
    var searchCtx = {};

    if (exports.getHasTypeFilter()) {
      // Create a filter value for each category value
      var tmpValues = data.searchFilterMap[exports.PRESET_CATEGORY];
      var inContextMap = {};
      inContextMap[exports.PRESET_CATEGORY] = tmpValues;
      searchCtx.inContextMap = inContextMap;
    }

    appCtxSvc.registerCtx('searchIncontextInfo', searchCtx);
  };
  /**
   * Returns category internal name
   * @param {Object} category category
   * @returns {Object} The category internal name
   */


  exports.getCategoryInternalName = function (category) {
    return category.internalName;
  };
  /**
   * Returns current category
   *
   * @param {Object} response the response from the search SOA
   * @returns {Object} The current category
   */


  exports.getCurrentCategory = function (response) {
    return response.groupedObjectsList[0].internalPropertyName;
  };
  /**
   * Returns filter values for a category to be shown in panel
   *
   * @param {Object} category the category to get values for
   *
   * @returns {ObjectArray} The array of filters to show in panel
   */


  exports.getPropGroupValues = function (category) {
    exports.getPreferenceValue();
    var values = [];

    for (var i = 0; i < category.filterValues.length; i++) {
      var categoryValue = category.filterValues[i];

      if (categoryValue !== undefined && (i < 9 || categoryValue.color !== undefined)) {
        values.push(exports.getPropGroupValue(category.type, category.drilldown, categoryValue));
      }
    }

    return values;
  };
  /**
   * Returns filter values for a category to be shown in panel
   * @param {String} categoryType categoryType
   * @param {Integer} categoryDrillDown category Drill Down
   * @param {String} categoryValue categoryValue
   * @returns {Object} filter value
   */


  exports.getPropGroupValue = function (categoryType, categoryDrillDown, categoryValue) {
    var pos = categoryValue.categoryName.indexOf('.');
    var propertyName;

    if (pos) {
      propertyName = categoryValue.categoryName.slice(pos + 1);
    } else {
      propertyName = categoryValue.categoryName;
    }

    var mapKey = propertyName + '.' + categoryValue.name;
    var filterValue = {};

    if (categoryValue.color && customPropValueColorMap[mapKey]) {
      filterValue.propertyGroupID = categoryValue.color;
      var rgbColorValue = exports.getFilterColorRGBValueForColor(categoryValue.color);
      filterValue.colorValue = rgbColorValue;
    } else {
      filterValue.propertyGroupID = exports.getFilterColorValue(categoryValue.colorIndex);
      filterValue.colorValue = exports.getFilterColorRGBValue(categoryValue.colorIndex);
    }

    if (categoryType === 'DateFilter') {
      if (categoryValue.colorIndex >= categoryDrillDown) {
        if (categoryValue.internalName !== '$NONE') {
          filterValue.startValue = categoryValue.startDateValue;
          filterValue.endValue = categoryValue.endDateValue;
        } else {
          filterValue.startValue = '$NONE';
        }
      }
    } else {
      filterValue.startValue = categoryValue.internalName;
      filterValue.endValue = '';
    }

    return filterValue;
  };
  /**
   * Returns filter RGB values for a category to be shown in viewer
   *
   * @returns {Object} filter value
   */


  exports.getFilterColorRGBValueForColor = function (color) {
    var colorBlock = '.' + color;
    var colorBlockElement = $(colorBlock);
    var rgbColorValue;

    if (colorBlockElement && colorBlockElement.length > 0) {
      var element = window.getComputedStyle(colorBlockElement[0], null);
      rgbColorValue = element.getPropertyValue('background-color');
    } else {
      rgbColorValue = exports.getHiddenFilterColorRGBValue(color);
    }

    return rgbColorValue;
  };
  /**
   * Returns filter RGB values for a category to be shown in viewer
   * @param {Integer} index index
   * @returns {Object} filter Color RGB value
   */


  exports.getHiddenFilterColorRGBValue = function (color) {
    var colorBlockTemp = 'aw-charts-chartColor1';
    var colorBlockTemp2 = 'filterLabelColorBlock1';
    var chartColorBlockHidden = color;
    var filterLabelColorBlockHidden = color;
    var colorBlock = '.aw-charts-chartColor1';
    var colorBlockElement = $(colorBlock);

    if (colorBlockElement && colorBlockElement.length > 0) {
      var p = colorBlockElement[0];

      for (var key in p) {
        try {
          if (p[key]) {
            var stringified = JSON.stringify(p[key]);

            if (stringified && (stringified.indexOf(colorBlockTemp) > -1 || stringified.indexOf(colorBlockTemp2) > -1)) {
              stringified = stringified.replace(colorBlockTemp, chartColorBlockHidden);
              stringified = stringified.replace(colorBlockTemp2, filterLabelColorBlockHidden);
              var jsonObject = JSON.parse(stringified);
              p[key] = jsonObject;
            }
          }
        } catch (e) {//Do nothing
        }
      }

      var style2 = window.getComputedStyle(p, null).getPropertyValue('background-color');
      return style2;
    }

    return '';
  };
  /**
   * Returns filter RGB values for a category to be shown in viewer
   * @param {Integer} index index
   * @returns {Object} filter Color RGB value
   */


  exports.getFilterColorRGBValue = function (index) {
    var colorBlock = '.aw-charts-chartColor' + (index % 9 + 1);
    var colorBlockElement = $(colorBlock);

    if (colorBlockElement && colorBlockElement.length > 0) {
      return window.getComputedStyle(colorBlockElement[0], null).getPropertyValue('background-color');
    }

    return '';
  };
  /**
   * Returns filter values for a category to be shown in panel
   * @param {Integer} index index
   * @returns {Object} filter value
   */


  exports.getFilterColorValue = function (index) {
    return index > -1 ? 'aw-charts-chartColor' + (index % 9 + 1) : '';
  };
  /**
   * publish event to select category header
   * @param {Object} category category
   * @param {Object} filter filter
   */


  exports.updateFiltersInContext = function (category, filter) {
    var searchResponseInfo = _appCtxSvc.getCtx('searchIncontextInfo');

    if (searchResponseInfo) {
      var searchResultFilters = searchResponseInfo.searchResultFilters;

      if (searchResultFilters === undefined) {
        searchResultFilters = [];
      } // Remove the filter from application context if it is unselected


      if (!filter.selected) {
        searchResultFilters.forEach(function (ctxFilter) {
          if (ctxFilter.searchResultCategoryInternalName === filter.categoryName) {
            _.pull(ctxFilter.filterValues, filter);
          } // If no more filters left in this category, then remove category itself


          if (ctxFilter.filterValues.length === 0) {
            _.pull(searchResultFilters, ctxFilter);
          }
        });
      } else {
        var found = false;
        searchResultFilters.forEach(function (ctxFilter) {
          if (ctxFilter.searchResultCategoryInternalName === filter.categoryName) {
            if (ctxFilter.filterValues.indexOf(filter) === -1) {
              ctxFilter.filterValues.push(filter);
            }

            found = true;
          }
        });

        if (!found) {
          var selectedFilterVals = [];
          selectedFilterVals.push(filter);
          var searchResultFilter = {
            searchResultCategory: filter.categoryName,
            searchResultCategoryInternalName: filter.categoryName,
            filterValues: selectedFilterVals
          };
          searchResultFilters.push(searchResultFilter);
        }
      }
    }
  };
  /**
   * Get property name from filter name.
   *
   * @param {String} filterName - The filter name
   * @return {propName} property name
   */


  exports.getPropertyFromFilter = function (filterName) {
    var propName = filterName;
    var YEAR_SUFFIX = '_0Z0_year';
    var YEAR_MONTH_SUFFIX = '_0Z0_year_month';
    var WEEK_SUFFIX = '_0Z0_week';
    var YEAR_MONTH_DAY_SUFFIX = '_0Z0_year_month_day';

    if (_.endsWith(filterName, YEAR_MONTH_DAY_SUFFIX) === true) {
      propName = filterName.replace(YEAR_MONTH_DAY_SUFFIX, '');
    }

    if (_.endsWith(filterName, WEEK_SUFFIX) === true) {
      propName = filterName.replace(WEEK_SUFFIX, '');
    }

    if (_.endsWith(filterName, YEAR_MONTH_SUFFIX) === true) {
      propName = filterName.replace(YEAR_MONTH_SUFFIX, '');
    }

    if (_.endsWith(filterName, YEAR_SUFFIX) === true) {
      propName = filterName.replace(YEAR_SUFFIX, '');
    }

    return propName;
  };
  /**
   * Get formatted date.
   *
   * @param {String} dateString - input date
   *
   * @param {Boolean} isDateRangeToDate - indicate if it's an end date in a date range
   *
   * @return {formattedDate} formatted date
   */


  exports.getFormattedFilterDate = function (dateString, isDateRangeToDate) {
    var formattedDate;

    if (dateString === '*') {
      if (isDateRangeToDate) {
        formattedDate = exports.ENDING_OF_TIME;
      } else {
        formattedDate = exports.BEGINNING_OF_TIME;
      }
    } else {
      try {
        var date = convertToUTC(new Date(dateString));
        formattedDate = _dateTimeSvc.formatUTC(date);
      } catch (e) {
        logger.error('The specified date is invalid and will be ignored for the search:', dateString);
        return null;
      }
    }

    return formattedDate;
  };
  /**
   * Get formatted numeric range filter.
   *
   * @param {String} filterValue - filterValue
   *
   * @return {formattedNumber} formatted filter
   */


  exports.getFormattedFilterNumber = function (filterValue) {
    var formattedFilter = {};
    var startToEnd = filterValue.split(' TO ');
    var startNumber = parseFloat(startToEnd[0]);
    var endNumber = parseFloat(startToEnd[1]);

    if (isNaN(startNumber) && isNaN(endNumber)) {
      logger.error('The specified range is invalid and will be ignored for the search:', filterValue);
      return null;
    } else if (startToEnd[0] === '*') {
      formattedFilter = {
        searchFilterType: 'NumericFilter',
        startNumericValue: 0,
        endNumericValue: endNumber,
        startEndRange: exports.NumericRangeBlankStart
      };
    } else if (startToEnd[1] === '*') {
      formattedFilter = {
        searchFilterType: 'NumericFilter',
        startNumericValue: startNumber,
        endNumericValue: 0,
        startEndRange: exports.NumericRangeBlankEnd
      };
    } else {
      if (isNaN(startNumber) || isNaN(endNumber)) {
        logger.error('The specified range is invalid and will be ignored for the search:', filterValue);
        return null;
      }

      formattedFilter = {
        searchFilterType: 'NumericFilter',
        startNumericValue: startNumber,
        endNumericValue: endNumber,
        startEndRange: exports.NUMERIC_RANGE
      };
    }

    return formattedFilter;
  };
  /**
   * Get Range Filter.
   *
   * @param {String} filterType - filter type
   *
   * @param {String} filterValue - filter value
   *
   * @return {searchFilter} Search Filter
   */


  exports.getRangeSearchFilter = function (filterType, filterValue) {
    // range search.
    var searchFilter;
    var startToEnd = filterValue.split(' TO ');

    if (filterType === 'NumericFilter') {
      searchFilter = exports.getFormattedFilterNumber(filterValue);
    } else if (filterType === 'DateFilter') {
      var startDate = exports.getFormattedFilterDate(startToEnd[0].trim(), false);
      var endDate = exports.getFormattedFilterDate(startToEnd[1].trim(), true);

      if (startDate && endDate) {
        searchFilter = {
          searchFilterType: filterType,
          startDateValue: startDate,
          endDateValue: endDate
        };
      }
    } else {
      // String type, but string type should not support range search,
      // so treat the " TO " as just part of the filter value
      searchFilter = {
        searchFilterType: filterType,
        stringValue: filterValue
      };
    }

    return searchFilter;
  };
  /**
   * Get Single Filter.
   *
   * @param {String} filterType - filter type
   *
   * @param {String} filterValue - filter value
   *
   * @return {searchFilter} Search Filter
   */


  exports.getSingleSearchFilter = function (filterType, filterValue) {
    // range search.
    var searchFilter;

    if (filterType === 'NumericFilter') {
      try {
        var formattedNumber = parseFloat(filterValue);

        if (isNaN(formattedNumber)) {
          logger.error('The specified number is invalid and will be ignored for the search:', filterValue);
        } else {
          searchFilter = {
            searchFilterType: filterType,
            startNumericValue: formattedNumber,
            endNumericValue: formattedNumber,
            stringValue: filterValue
          };
        }
      } catch (e) {
        logger.error('The specified number is invalid and will be ignored for the search:', filterValue);
      }
    } else {
      // Date type is also treated as String, if it's not date range.
      searchFilter = {
        searchFilterType: 'StringFilter',
        stringValue: filterValue
      };
    }

    return searchFilter;
  };
  /**
   * Get filter type based on the value type.
   *
   * @param {Integer} valueType - The valueType for this property
   *
   * @return {filterType} filter type based off the integer value of valueType (String/Double/char etc.)
   */


  exports.getFilterType = function (valueType) {
    var filterType;

    switch (valueType) {
      case 2:
        filterType = 'DateFilter';
        break;

      case 3:
      case 4:
      case 5:
      case 7:
        filterType = 'NumericFilter';
        break;

      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
        // filterType = 'ObjectFilter';
        // ObjectFilter will be treated as StringFilter for the searchInput of performSearch SOA.
        filterType = 'StringFilter';
        break;

      default:
        filterType = 'StringFilter';
        break;
    }

    return filterType;
  };
  /**
   * Display search prefilter error
   *
   * @param {String} prefilter - The search prefilter
   *
   */


  exports.displayPrefilterError = function (prefilter) {
    var msg = _invalidPrefilter.replace('{0}', prefilter);

    _messagingSvc.showError(msg);
  };
  /**
   * This function reads the “AWC_CustomPropValueColor” preference value and populates the customPropValueColorMap.
   * This is used to overide filter color in filter panel.
   * Preference value is in formate <propertyname>.<value>:<colorValue>
   */


  exports.getPreferenceValue = function () {
    var prefNames = ['AWC_CustomPropValueColor'];

    _preferenceSvc.getStringValues(prefNames).then(function (values) {
      if (values && values[0] !== null) {
        for (var i = 0; i < values.length; i++) {
          var prefVal = values[i];
          var pos = prefVal.indexOf(':');
          var color = prefVal.slice(pos + 1);
          var property = prefVal.slice(0, pos);
          customPropValueColorMap[property] = color;
        }
      }
    });
  };
  /**
   * get filter color
   *
   * @param propertyName filter name
   *
   * @returns color color code need to be applied for filter
   */


  exports.getCustomPropValueColorMap = function (propertyName) {
    var color = customPropValueColorMap[propertyName];
    return color;
  };
  /**
   * set filter color
   *
   * @param propertyName filter name
   *
   * @param color color code need to be applied for filter
   */


  exports.setCustomPropValueColorMap = function (propertyName, color) {
    customPropValueColorMap[propertyName] = color;
  };
  /**
   * This function reads the “AWC_CustomPropValueColor” preference value and applies the color to the filter.
   */


  exports.applyCustomColor = function (categoryName, categoryValue, filterValue) {
    var pos = categoryName.indexOf('.');
    var propertyName;

    if (pos) {
      propertyName = categoryName.slice(pos + 1);
    } else {
      propertyName = categoryName;
    }

    var mapKey = propertyName + '.' + categoryValue.stringValue; //Overriding the filter color based on preference AWC_CustomPropValueColor value if this property's color is defined in this preference

    if (customPropValueColorMap[mapKey]) {
      if (categoryValue.colorValue) {
        //This scenario will be hit in the cases where color value is being populated by server response - searchFilter3 or later
        filterValue.color = categoryValue.colorValue;
      } else {
        //This scenario will be hit in the cases where color value is not being populated by server response
        filterValue.color = customPropValueColorMap[mapKey];
      }
    }
  };
  /**
   * This function arranges the searchFilterMap to show the selected ones at the top ( but only shows the top 100 )
   * @param {Object} searchFilterMap - the search response info filter map
   * @param {Object} category - the current category
   */


  exports.arrangeFilterMap = function (searchFilterMap, category) {
    var selectedFilters = {};
    var nonSelectedFilters = {};
    var selectedFiltersIndex = 0;
    var nonSelectedFiltersIndex = 0;

    _.forEach(searchFilterMap[category.internalName], function (eachFilterValue) {
      if (eachFilterValue.selected === true) {
        selectedFilters[selectedFiltersIndex++] = eachFilterValue;
      } else {
        nonSelectedFilters[nonSelectedFiltersIndex++] = eachFilterValue;
      }
    });

    var updatedFilterMap = [];

    for (var index1 = 0; index1 < Object.keys(selectedFilters).length; index1++) {
      updatedFilterMap.push(selectedFilters[index1]);
    }

    var numberOfUnselectedFiltersToShow = 100 - selectedFiltersIndex;

    for (var index2 = 0; index2 < numberOfUnselectedFiltersToShow; index2++) {
      updatedFilterMap.push(nonSelectedFilters[index2]);
    }

    var searchResponseInfoCtx = _appCtxSvc.getCtx('searchResponseInfo');

    if (searchResponseInfoCtx) {
      searchResponseInfoCtx.searchFilterMap[category.internalName] = updatedFilterMap;

      _appCtxSvc.updatePartialCtx('searchResponseInfo.searchFilterMap', searchResponseInfoCtx.searchFilterMap);
    }
  };
  /**
   * @memberof NgServices
   * @member filterPanelUtils
   * @param {appCtxService} appCtxService - Service to use.
   * @param {dateTimeService} dateTimeService - Service to use.
   * @param {messagingService} messagingService - Service to use.
   * @param {localeService} localeSvc - Service to use.
   * @param {uwDirectiveDateTimeService} uwDirectiveDateTimeSvc - Service to use.
   * @param {soa_preferenceService} preferenceSvc - Service to use
   * @returns {exports} Instance of this service.
   */


  app.factory('filterPanelUtils', ['appCtxService', 'dateTimeService', 'messagingService', 'localeService', 'uwDirectiveDateTimeService', 'soa_preferenceService', function (appCtxService, dateTimeService, messagingService, localeSvc, uwDirectiveDateTimeSvc, preferenceSvc) {
    _appCtxSvc = appCtxService;
    _dateTimeSvc = dateTimeService;
    _uwDirectiveDateTimeSvc = uwDirectiveDateTimeSvc;
    _messagingSvc = messagingService;
    _preferenceSvc = preferenceSvc;
    localeSvc.getTextPromise('UIMessages').then(function (localTextBundle) {
      _invalidDateText = localTextBundle.invalidDate;
      _invalidRangeText = localTextBundle.invalidRange;
      _invalidPrefilter = localTextBundle.invalidPrefilter;
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'filterPanelUtils'
  };
});