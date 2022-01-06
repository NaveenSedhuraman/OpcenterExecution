"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Module for date parser utilities
 *
 * @module js/dateParserUtils
 */
define(['app', 'lodash', 'Debug'], function (app, _, Debug) {
  'use strict';

  var trace = new Debug('dateParserUtils');
  var exports = {};
  /**
   * Reference to uwDirectiveDateTimeService
   */

  var _uwDateTimeSvc;
  /**
   *Parsing of Dates
   *
   * @param {String} sourceVal - property value to compare with
   * @param {String} queryVal - condition value
   *
   * @return {Object} date object of sourceVal and queryVal
   */


  exports.getParsedDates = function (sourceVal, queryVal) {
    var dateParser = {};

    if (!_uwDateTimeSvc) {
      _uwDateTimeSvc = app.getInjector().get('uwDirectiveDateTimeService');
    }

    dateParser.sourceDate = _uwDateTimeSvc.convertDateToMsec(sourceVal);

    if (_.isArray(queryVal)) {
      dateParser.queryDate = [];

      for (var key in queryVal) {
        dateParser.queryDate[key] = _uwDateTimeSvc.convertDateToMsec(queryVal[key]);
      }
    } else {
      dateParser.queryDate = _uwDateTimeSvc.convertDateToMsec(queryVal);
    }

    return dateParser;
  };
  /**
   *Get widget type like  date/time/datetime
   *
   * @param {String} condition - condition value like "Date(08-Feb-2019)"
   *
   * @return {String}  conditionVal like "08-Feb-2019"
   */


  exports.getDateValue = function (condition) {
    try {
      var regExp = /\(([^)]+)\)/;
      var conditionVal = regExp.exec(condition)[1];
      return conditionVal;
    } catch (e) {
      trace('Error in condition', e, condition);
    }
  };
  /**
   *Get widget type like  date/time/datetime
   *
   * @param {object} value - date object
   * @param {String} expressionDataType - data type - Date
   * @return {object}  expression , date type along with date
   */


  exports.getExpressionDateValue = function (value, expressionDataType) {
    var key;
    var expression = {};

    if (expressionDataType === 'Date' && exports.isDate(value)) {
      if (_.isArray(value)) {
        expression.value = [];

        for (key in value) {
          expression.value[key] = exports.getDateValue(value[key]);
        }
      } else {
        expression.value = exports.getDateValue(value);
      }
    } else {
      expression.value = value;
    }

    return expression;
  };
  /**
   *get expression type is dat eor not
   *
   * @param {object} value - date object
   *
   * @return {boolean}  value is date or not
   */


  exports.isDate = function (value) {
    try {
      var regExp = /^Date\(\{\{/;
      return value && value.toString().match(regExp) !== null;
    } catch (e) {
      trace('Error in expression', e, value);
    }
  };

  return exports;
});