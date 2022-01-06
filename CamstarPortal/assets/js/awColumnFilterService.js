"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for simpletable as Column Filter Service
 *
 * @module js/awColumnFilterService
 *
 */
define(['app', 'lodash', 'js/eventBus', 'js/ngUtils', 'js/awColumnFilterUtility', // end of native
'js/messagingService', 'js/dateTimeService', 'js/localeService'], function (app, _, eventBus, ngUtils, columnFilterUtility) {
  'use strict';

  var _dateTimeService;

  var _localeService;

  var _messagingService;

  var _localeTextBundle;

  var exports = {};
  /**
   * Determines if value is valid number to process.
   *
   * @param {Number|String} value - Number value
   *
   * @returns {Boolean} true if valid number
   */

  var isValidNumber = function isValidNumber(value) {
    return isFinite(value) && value !== null && value !== '';
  };
  /**
   * Validate the text information coming from the filter column menu UI.
   *
   * @param {Object} textValue - The text value coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   *
   * @returns {Boolean} true if textValue is valid
   */


  exports.doTextValidation = function (textValue, viewModelData) {
    if (viewModelData && viewModelData.context) {
      if (viewModelData.context.filterError) {
        delete viewModelData.context.filterError; // remove error if exists
      }

      if (viewModelData.context.filterNoAction) {
        delete viewModelData.context.filterNoAction;
      }
      /*
       * Have some validation condition
       * If it fails, set viewModelData.context.filterError = true;
       * call exports.showErrorMessage
        with some i18n message
       * return false
       */

    }

    return true;
  };
  /**
   * Validate the numeric information coming from the filter column menu UI.
   *
   * @param {Object} eventData - The event data coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   *
   * @returns {Boolean} true if numeric information is valid
   */


  exports.doNumericValidation = function (eventData, viewModelData) {
    if (viewModelData && viewModelData.context) {
      if (viewModelData.context.filterError) {
        delete viewModelData.context.filterError; // remove error if exists
      }

      if (viewModelData.context.filterNoAction) {
        delete viewModelData.context.filterNoAction;
      }
      /*
       * Have some validation condition
       * If it fails, set viewModelData.context.filterError = true;
       * call exports.showErrorMessage
        with some i18n message
       * return false
       */

    }

    return true;
  };
  /**
   * Add/remove the text filter information to the column provider.
   *
   * @param {Object} column - Column object
   * @param {Object} columnProvider - Column provider used to store the filters
   * @param {Object} eventData - The event data coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   */


  exports.doTextFiltering = function (column, columnProvider, eventData, viewModelData) {
    // client side validation
    if (exports.doTextValidation(eventData.textValue, viewModelData)) {
      // Set columnProvider.columnFilters so dataProvider/actions can use the information
      if (eventData.textValue) {
        var textColumnFilter = columnFilterUtility.createContainsFilter(eventData.columnName, [eventData.textValue]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, textColumnFilter);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(textColumnFilter, column.filter.view);
      } else {
        // Remove filter
        var isFilterRemoved = columnFilterUtility.removeColumnFilter(columnProvider.columnFilters, eventData.columnName);

        if (!isFilterRemoved) {
          viewModelData.context.filterNoAction = true;
        }

        exports.resetColumnFilter(column);
      }
    }
  };
  /**
   * Validate the date information coming from the filter column menu UI.
   *
   * @param {Object} eventData - The event data coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   *
   * @returns {Boolean} true if date is valid
   */


  exports.doDateValidation = function (eventData, viewModelData) {
    if (viewModelData && viewModelData.context) {
      if (viewModelData.context.filterError) {
        delete viewModelData.context.filterError; // remove error if exists
      }

      if (viewModelData.context.filterNoAction) {
        delete viewModelData.context.filterNoAction;
      }

      if (!_dateTimeService.isNullDate(eventData.startDate) && !_dateTimeService.isNullDate(eventData.endDate)) {
        var startDateTime = _.isNumber(eventData.startDate) ? eventData.startDate : new Date(eventData.startDate).getTime();
        var endDateTime = _.isNumber(eventData.endDate) ? eventData.endDate : new Date(eventData.endDate).getTime();

        if (startDateTime > endDateTime) {
          viewModelData.context.filterError = true;

          _messagingService.showError(viewModelData.i18n.invalidDate);
        }
      }

      return !viewModelData.context.filterError;
    }

    return true;
  };
  /**
   * Add/remove the date filter information to the column provider.
   *
   * @param {Object} column - Column object
   * @param {Object} columnProvider - Column provider used to store the filters
   * @param {Object} eventData - The event data coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   */


  exports.doDateFiltering = function (column, columnProvider, eventData, viewModelData) {
    if (exports.doDateValidation(eventData, viewModelData)) {
      // Client validation
      // Set columnProvider.columnFilters so dataProvider/actions can use the information
      if (!_dateTimeService.isNullDate(eventData.startDate) && !_dateTimeService.isNullDate(eventData.endDate)) {
        var startDateUtc = _dateTimeService.formatUTC(new Date(eventData.startDate));

        var endDate = new Date(eventData.endDate);

        var endDateUtc = _dateTimeService.formatUTC(endDate.setHours(23, 59, 59, 999));

        var rangeFilterColumn = columnFilterUtility.createRangeFilter(eventData.columnName, [startDateUtc, endDateUtc]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, rangeFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(rangeFilterColumn, column.filter.view);
      } else if (!_dateTimeService.isNullDate(eventData.startDate)) {
        startDateUtc = _dateTimeService.formatUTC(new Date(eventData.startDate));
        var gteFilterColumn = columnFilterUtility.createGreaterThanEqualsFilter(eventData.columnName, [startDateUtc]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, gteFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(gteFilterColumn, column.filter.view);
      } else if (!_dateTimeService.isNullDate(eventData.endDate)) {
        var endDate = new Date(eventData.endDate);
        endDateUtc = _dateTimeService.formatUTC(endDate.setHours(23, 59, 59, 999));
        var lteFilterColumn = columnFilterUtility.createLessThanEqualsFilter(eventData.columnName, [endDateUtc]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, lteFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(lteFilterColumn, column.filter.view);
      } else {
        // Remove filter
        var isFilterRemoved = columnFilterUtility.removeColumnFilter(columnProvider.columnFilters, eventData.columnName);

        if (!isFilterRemoved) {
          viewModelData.context.filterNoAction = true;
        }

        exports.resetColumnFilter(column);
      }
    }
  };
  /**
   * Add/remove the numeric filter information to the column provider.
   *
   * @param {Object} column - Column object
   * @param {Object} columnProvider - Column provider used to store the filters
   * @param {Object} eventData - The event data coming from the filter menu
   * @param {Object} viewModelData - The viewModel data used for validation
   */


  exports.doNumericFiltering = function (column, columnProvider, eventData, viewModelData) {
    if (exports.doNumericValidation(eventData, viewModelData)) {
      // Set columnProvider.columnFilters so dataProvider/actions can use the information
      if (eventData.operation === columnFilterUtility.OPERATION_TYPE.RANGE && isValidNumber(eventData.startNumber) && isValidNumber(eventData.endNumber)) {
        var rangeFilterColumn = columnFilterUtility.createRangeFilter(eventData.columnName, [eventData.startNumber, eventData.endNumber]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, rangeFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(rangeFilterColumn, column.filter.view);
      } else if (eventData.operation === columnFilterUtility.OPERATION_TYPE.RANGE && isValidNumber(eventData.startNumber)) {
        var gteFilterColumn = columnFilterUtility.createGreaterThanEqualsFilter(eventData.columnName, [eventData.startNumber]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, gteFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(gteFilterColumn, column.filter.view);
      } else if (eventData.operation === columnFilterUtility.OPERATION_TYPE.RANGE && isValidNumber(eventData.endNumber)) {
        var lteFilterColumn = columnFilterUtility.createLessThanEqualsFilter(eventData.columnName, [eventData.endNumber]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, lteFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(lteFilterColumn, column.filter.view);
      } else if (eventData.operation === columnFilterUtility.OPERATION_TYPE.GREATER && isValidNumber(eventData.numberValue)) {
        var gtFilterColumn = columnFilterUtility.createGreaterThanFilter(eventData.columnName, [eventData.numberValue]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, gtFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(gtFilterColumn, column.filter.view);
      } else if (eventData.operation === columnFilterUtility.OPERATION_TYPE.LESS && isValidNumber(eventData.numberValue)) {
        var ltFilterColumn = columnFilterUtility.createLessThanFilter(eventData.columnName, [eventData.numberValue]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, ltFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(ltFilterColumn, column.filter.view);
      } else if (eventData.operation === columnFilterUtility.OPERATION_TYPE.EQUALS && isValidNumber(eventData.numberValue)) {
        var equalsFilterColumn = columnFilterUtility.createEqualsFilter(eventData.columnName, [eventData.numberValue]);
        columnProvider.columnFilters = columnFilterUtility.addOrReplaceColumnFilter(columnProvider.columnFilters, equalsFilterColumn);
        column.filter.isFilterApplied = true;
        column.filter.summaryText = exports.createFilterSummary(equalsFilterColumn, column.filter.view);
      } else {
        // Remove filter
        var isFilterRemoved = columnFilterUtility.removeColumnFilter(columnProvider.columnFilters, eventData.columnName);

        if (!isFilterRemoved) {
          viewModelData.context.filterNoAction = true;
        }

        exports.resetColumnFilter(column);
      }
    }
  };
  /**
   * Find the type of filter to use by the column type.
   *
   * @param {String} columnType - Repersents the data type of the column
   *
   * @returns {String} The type of filter to use in the column menu
   */


  exports.getFilterTypeByColumnType = function (columnType) {
    var returnFilterType = 'textFilter';

    if (columnType) {
      if (_.isString(columnType)) {
        columnType = columnType.toUpperCase();
      }

      var columnTypeString = columnType.toString();

      switch (columnTypeString) {
        case 'DOUBLE':
        case 'INTEGER':
        case 'FLOAT':
        case '3': // Client Property Type

        case '4': // Client Property Type Double

        case '5': // Client Property Type Integer

        case '7':
          // Client Property Type Short
          returnFilterType = 'numericFilter';
          break;

        case 'DATE':
        case '2':
          // Client Property Type Date
          returnFilterType = 'dateFilter';
          break;

        case 'STRING':
        default:
          returnFilterType = 'textFilter';
      }
    }

    return returnFilterType;
  };
  /**
   * Add filter information to the column object.
   *
   * @param {Object} column - Column to add filter information to
   * @param {String} currentFilterView - Filter view
   * @param {Object} existingFilter - Existing filter view to reference
   */


  exports.addFilterValue = function (column, currentFilterView, existingFilter) {
    existingFilter = existingFilter || {};

    switch (currentFilterView) {
      case 'numericFilter':
        column.filter = {
          isFilterApplied: false,
          view: currentFilterView,
          summaryText: '',
          operation: {
            dbValue: 'Equals',
            hasLov: true,
            isEditable: true,
            isEnabled: true,
            propApi: {},
            propertyLabelDisplay: 'NO_PROPERTY_LABEL',
            propertyName: 'operation',
            type: 'STRING'
          },
          numberValue: {
            dbValue: '',
            isEnabled: true,
            type: 'DOUBLE',
            isRequired: false,
            isEditable: true,
            propertyLabelDisplay: 'NO_PROPERTY_LABEL'
          },
          startNumber: {
            dbValue: '',
            isEnabled: true,
            type: 'DOUBLE',
            isRequired: false,
            isEditable: true,
            propertyLabelDisplay: 'NO_PROPERTY_LABEL'
          },
          endNumber: {
            dbValue: '',
            isEnabled: true,
            type: 'DOUBLE',
            isRequired: false,
            isEditable: true,
            propertyLabelDisplay: 'NO_PROPERTY_LABEL'
          }
        };

        if (columnFilterUtility.isValidRangeColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = existingFilter.operation;
          column.filter.startNumber.dbValue = existingFilter.values[0];
          column.filter.endNumber.dbValue = existingFilter.values[1];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidGreaterThanEqualsColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = columnFilterUtility.OPERATION_TYPE.RANGE;
          column.filter.startNumber.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidLessThanEqualsColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = columnFilterUtility.OPERATION_TYPE.RANGE;
          column.filter.endNumber.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidGreaterThanColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = existingFilter.operation;
          column.filter.numberValue.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidLessThanColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = existingFilter.operation;
          column.filter.numberValue.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidEqualsColumnFilter(existingFilter)) {
          column.filter.operation.dbValue = existingFilter.operation;
          column.filter.numberValue.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        }

        break;

      case 'dateFilter':
        column.filter = {
          isFilterApplied: false,
          view: currentFilterView,
          summaryText: '',
          startDate: {
            dbValue: '',
            dateApi: {},
            isEnabled: true,
            type: 'DATE'
          },
          endDate: {
            dbValue: '',
            dateApi: {},
            isEnabled: true,
            type: 'DATE'
          }
        };

        if (columnFilterUtility.isValidRangeColumnFilter(existingFilter)) {
          var startDate = new Date(existingFilter.values[0]);
          var endDate = new Date(existingFilter.values[1]);
          column.filter.startDate.dbValue = startDate.getTime();
          column.filter.endDate.dbValue = endDate.getTime();
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidGreaterThanEqualsColumnFilter(existingFilter)) {
          startDate = new Date(existingFilter.values[0]);
          column.filter.startDate.dbValue = startDate.getTime();
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        } else if (columnFilterUtility.isValidLessThanEqualsColumnFilter(existingFilter)) {
          endDate = new Date(existingFilter.values[0]);
          column.filter.endDate.dbValue = endDate.getTime();
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        }

        break;

      case 'textFilter':
      default:
        column.filter = {
          isFilterApplied: false,
          view: currentFilterView,
          summaryText: '',
          textValue: {
            dbValue: '',
            isEnabled: true,
            inputType: 'text'
          }
        };

        if (columnFilterUtility.isValidContainsColumnFilter(existingFilter)) {
          column.filter.textValue.dbValue = existingFilter.values[0];
          column.filter.summaryText = exports.createFilterSummary(existingFilter, column.filter.view);
          column.filter.isFilterApplied = true;
        }

    }
  };
  /**
   * Update the column with filter information.
   *
   * @param {Object} column columnInfo
   * @param {Object} existingFilter existing column filter
   */


  exports.updateColumnFilter = function (column, existingFilter) {
    var currentFilterView = column.filterDefinition;

    if (!currentFilterView) {
      currentFilterView = exports.getFilterTypeByColumnType(column.dataType);
    }

    exports.addFilterValue(column, currentFilterView, existingFilter);
  };
  /**
   * Reset the column with default filter information.
   *
   * @param {Object} column columnInfo
   * @param {Object} existingFilter existing column filter
   */


  exports.resetColumnFilter = function (column) {
    exports.updateColumnFilter(column, null);
  };
  /**
   * Find and return the column provider based on the grid.
   *
   * @param {String} gridId - Id of the data grid
   * @param {Object} grids  - All of the data grids
   * @param {Object} columnProviders - All of the column providers
   *
   * @returns {Object} The found columnProvider
   */


  exports.findColumnProvider = function (gridId, grids, columnProviders) {
    if (gridId && grids && columnProviders) {
      var foundGrid = grids[gridId];

      if (foundGrid) {
        return columnProviders[foundGrid.columnProvider];
      }
    }
  };
  /**
   * Removes column filters that no longer apply to the table.
   *
   * @param {Object} columnProvider - Column provider used to store the filters
   * @param {Array} columns - columns in the table
   */


  exports.removeStaleFilters = function (columnProvider, columns) {
    if (columnProvider && columns && columns.length) {
      var columnFilters = columnProvider.getColumnFilters();

      if (columnFilters && columnFilters.length) {
        var newColumnFilters = _.filter(columnFilters, function (currentFilter) {
          var isValidFilter = false;

          _.forEach(columns, function (currentColumn) {
            if (currentFilter.columnName === currentColumn.propertyName) {
              if (!currentColumn.hiddenFlag) {
                isValidFilter = true;
                return false;
              }
            }
          });

          return isValidFilter;
        });

        columnProvider.setColumnFilters(newColumnFilters);
      }
    }
  };
  /**
   * Create a filter summary text of the applied filter.
   *
   * @param {Object} columnFilter - Column filter object that contains operation and values
   * @param {String} filterView - filter view in use
   *
   * @returns {String} returns the text summary of the applied filter
   */


  exports.createFilterSummary = function (columnFilter, filterView) {
    var filterSummary = '';
    var firstValue = columnFilter.values[0];
    var secondValue = columnFilter.values.length > 1 ? columnFilter.values[1] : ''; // Convert date values to readable strings

    if (filterView === 'dateFilter') {
      var firstValueDateTime = Date.parse(firstValue);

      if (firstValueDateTime) {
        var firstValueDate = new Date(firstValueDateTime);
        firstValue = firstValueDate.toLocaleDateString();
      }

      if (secondValue) {
        var secondValueDateTime = Date.parse(secondValue);

        if (secondValueDateTime) {
          var secondValueDate = new Date(secondValueDateTime);
          secondValue = secondValueDate.toLocaleDateString();
        }
      }
    } // Set the filter summary text based on the operation type


    switch (columnFilter.operation) {
      case columnFilterUtility.OPERATION_TYPE.RANGE:
        filterSummary += _localeTextBundle.greaterThanEqualsFilterTooltip;
        filterSummary += ' "' + firstValue + '" ';
        filterSummary += _localeTextBundle.andFilterTooltip + ' ';
        filterSummary += _localeTextBundle.lessThanEqualsFilterTooltip;
        filterSummary += ' "' + secondValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.GREATER:
        filterSummary += _localeTextBundle.greaterThanFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.GREATER_EQUALS:
        filterSummary += _localeTextBundle.greaterThanEqualsFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.LESS:
        filterSummary += _localeTextBundle.lessThanFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.LESS_EQUALS:
        filterSummary += _localeTextBundle.lessThanEqualsFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.EQUALS:
        filterSummary += _localeTextBundle.equalsFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;

      case columnFilterUtility.OPERATION_TYPE.CONTAINS:
        filterSummary += _localeTextBundle.containsFilterTooltip;
        filterSummary += ' "' + firstValue + '"';
        break;
    }

    return filterSummary;
  };

  exports.removeAllFilters = function (dataProvider, columnProvider, gridId) {
    var columns = dataProvider.cols;

    for (var i = 0; i < columns.length; i++) {
      exports.resetColumnFilter(columns[i]);
    }

    columnProvider.setColumnFilters([]);
    eventBus.publish('pltable.columnFilterApplied', {
      gridId: gridId
    });
  };

  exports.isColumnFilterApplied = function (dataProvider) {
    var columns = dataProvider.cols;

    for (var i = 0; i < columns.length; i++) {
      if (columns[i].filter && columns[i].filter.isFilterApplied) {
        return true;
      }
    }
  };

  app.factory('awColumnFilterService', ['messagingService', 'dateTimeService', 'localeService', //
  function (messagingService, dateTimeService, localeService) {
    _messagingService = messagingService;
    _dateTimeService = dateTimeService;
    _localeService = localeService;

    _localeService.getTextPromise('UIMessages').then(function (localeTextBundle) {
      _localeTextBundle = localeTextBundle;
    });

    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'awColumnFilterService'
  };
});