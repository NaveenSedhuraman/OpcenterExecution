"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for simpletabe as Column Filter Utility
 *
 * @module js/awColumnFilterUtility
 *
 */
define(['lodash'], function (_) {
  'use strict';

  var exports = {};
  exports.OPERATION_TYPE = {
    RANGE: 'range',
    GREATER: 'gt',
    GREATER_EQUALS: 'gte',
    LESS: 'lt',
    LESS_EQUALS: 'lte',
    EQUALS: 'equals',
    CONTAINS: 'contains'
  };
  /**
   * Adds the new column filter tot he columnFilters input.
   *
   * @param {Array} columnFilters - Collection of all the column filters
   * @param {Object} newColumnFilter - The new column filter to apply
   *
   * @returns {Array} columnFilters
   */

  exports.addOrReplaceColumnFilter = function (columnFilters, newColumnFilter) {
    if (newColumnFilter.columnName) {
      columnFilters = columnFilters || [];
      exports.removeColumnFilter(columnFilters, newColumnFilter.columnName);
      columnFilters.push(newColumnFilter);
    }

    return columnFilters;
  };
  /**
   * Removes the column filters that are applied to the column by name.
   *
   * @param {Array} columnFilters - Collection of all the column filters
   * @param {String} columnName - The name of the column
   */


  exports.removeColumnFilter = function (columnFilters, columnName) {
    var isFilterRemoved = false;

    if (columnFilters && columnFilters.length && columnName) {
      _.remove(columnFilters, function (currentFilter) {
        if (currentFilter.columnName === columnName) {
          isFilterRemoved = true;
          return true;
        }

        return false;
      });
    }

    return isFilterRemoved;
  };
  /**
   * Builds a basic column filter used for all filter types.
   *
   * @param {String} columnName - Column name the filter is applied to
   * @param {Array} values - Filter values
   *
   * @returns {Object} filter object
   */


  exports.createBasicColumnFilter = function (columnName, values) {
    var returnFilter = {
      columnName: columnName
    };
    var filterValues = [];

    _.forEach(values, function (currentValue) {
      var stringValue = _(currentValue).toString();

      filterValues.push(stringValue);
    });

    returnFilter.values = filterValues;
    return returnFilter;
  };
  /**
   * Create a filter based on the operation and values.
   *
   * @param {String} operation - operation name of the filter
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createFilter = function (operation, columnName, values) {
    var containsColumnFilter = exports.createBasicColumnFilter(columnName, values);
    containsColumnFilter.operation = operation;
    return containsColumnFilter;
  };
  /**
   * Create a 'Contains' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createContainsFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.CONTAINS, columnName, values);
  };
  /**
   * Create a 'Range' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createRangeFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.RANGE, columnName, values);
  };
  /**
   * Create a 'Less Than or Equals' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createLessThanEqualsFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.LESS_EQUALS, columnName, values);
  };
  /**
   * Create a 'Less Than' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createLessThanFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.LESS, columnName, values);
  };
  /**
   * Create a 'Greater Than Equals' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createGreaterThanEqualsFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.GREATER_EQUALS, columnName, values);
  };
  /**
   * Create a 'Greater Than' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createGreaterThanFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.GREATER, columnName, values);
  };
  /**
   * Create a 'Equals' filter object.
   *
   * @param {String} columnName - column name of the grid
   * @param {Array} values - values of filter input
   *
   * @returns {Object} Filter object
   */


  exports.createEqualsFilter = function (columnName, values) {
    return exports.createFilter(exports.OPERATION_TYPE.EQUALS, columnName, values);
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Range'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidRangeColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 2 && columnFilter.operation === exports.OPERATION_TYPE.RANGE;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Contains'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidContainsColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.CONTAINS;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Equals'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidEqualsColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.EQUALS;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Less Than'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidLessThanColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.LESS;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Less Than or Equals'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidLessThanEqualsColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.LESS_EQUALS;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Greater Than'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidGreaterThanColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.GREATER;
  };
  /**
   * Test the column filter object to make sure it has the valid information for 'Greater Than or Equals'.
   *
   * @param {Object} columnFilter - Column filter information being tested
   *
   * @returns {Boolean} true is input filter object is valid
   */


  exports.isValidGreaterThanEqualsColumnFilter = function (columnFilter) {
    return columnFilter && columnFilter.values && columnFilter.values.length === 1 && columnFilter.operation === exports.OPERATION_TYPE.GREATER_EQUALS;
  };

  return exports;
});