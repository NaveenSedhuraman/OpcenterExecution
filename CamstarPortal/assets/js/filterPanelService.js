"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/filterPanelService
 */
define(['app', 'jquery', 'lodash', 'js/appCtxService', 'js/dateTimeService', 'js/uwPropertyService', 'js/messagingService', 'js/localeService', 'js/filterPanelUtils'], function (app, $, _) {
  'use strict';

  var exports = {};
  var _$state = null;
  var _appCtxSvc = null;
  var _dateTimeSvc = null;
  var _uwPropertySvc = null;
  var _filterPanelUtils = null;
  exports.DATA_RANGE_FILTER = 'DateRangeFilter';
  var YEAR_SUFFIX = '_0Z0_year';
  var YEAR_MONTH_SUFFIX = '_0Z0_year_month';
  var WEEK_SUFFIX = '_0Z0_week';
  var YEAR_MONTH_DAY_SUFFIX = '_0Z0_year_month_day';
  var _noFilterValue = '';
  var _fromTextValue = '';
  var _toTextValue = '';
  /**
   * Returns categories from search response
   *
   * @param {Object} response the response from the search SOA
   *
   * @returns {ObjectArray} The array of child node objects to be displayed.
   */

  exports.getCategories = function (response) {
    var categories = response.searchFilterCategories;
    var categoryValues = response.searchFilterMap;

    if (categoryValues && (categories === undefined || categories.length === 0)) {
      // Build filter recipe values to display.
      var searchResultFilters = [];

      var ctx = _appCtxSvc.getCtx('searchIncontextInfo');

      if (ctx) {
        var currentCategories = ctx.searchIncontextCategories;

        _.forEach(currentCategories, function (category) {
          if (category && category.internalName in categoryValues) {
            if (category.daterange && category.daterange.startDate) {
              category.daterange.dateRangeSelected = true;
            } else if (category.numericrange && category.numericrange.startValue) {
              category.numericrange.numericRangeSelected = true;
            } else {
              var values = categoryValues[category.internalName];

              _.forEach(values, function (value) {
                value.selected = true;
              });

              category.filterValues = values;
            }

            searchResultFilters = getSearchResultFilters(searchResultFilters, category);
          }
        });
      }

      ctx.searchResultFilters = searchResultFilters;

      _appCtxSvc.updateCtx('searchIncontextInfo', ctx);

      return;
    }

    var groupByProperty = response.objectsGroupedByProperty.internalPropertyName;

    _filterPanelUtils.setIncontext(true);

    return exports.getCategories2(categories, categoryValues, groupByProperty, false, true, true);
  };
  /**
   * Returns categories from "performSearchViewModel3"
   *
   * @param {Object} response The response from the search SOA
   *
   * @returns {ObjectArray} The array of child node objects to be displayed
   */


  exports.getSearchFilterCategories = function (response) {
    response.searchFilterMap = response.searchFilterMap5;
    return exports.getCategories(response);
  };
  /**
   * Parses boolean
   *
   * @param {String} value to evaluated
   *
   * @returns {Boolean} true or false.
   */


  exports.parseBoolean = function (value) {
    if (value === undefined || value === null) {
      return false;
    }

    return /^true$/i.test(value);
  };
  /**
   * Returns categories from search response
   *
   * @param {ObjectArray} categories categories
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @param {ObjectArray} currentCategories current categories
   * @param {Boolean} showRange true if to show range
   * @param {Boolean} incontext true if it's for in context search
   * @returns {ObjectArray} The array of child node objects to be displayed.
   */


  exports.updateCategories = function (categories, categoryValues, groupProperty, colorToggle, currentCategories, showRange, incontext) {
    _filterPanelUtils.setIncontext(incontext);

    exports.getCategories2(categories, categoryValues, groupProperty, colorToggle, showRange, incontext);

    _.forEach(categories, function (category) {
      var index = _.findIndex(currentCategories, function (cat) {
        return cat.internalName === category.internalName;
      });

      if (index > -1) {
        // retain state
        var currentCategory = currentCategories[index];
        category.showExpand = currentCategory.showExpand;
        category.expand = currentCategory.expand;

        if (currentCategory.showMoreFilter !== undefined) {
          category.showMoreFilter = currentCategory.showMoreFilter;
        }
      }
    });

    if (currentCategories === undefined) {
      exports.setScrollPosition();
    }

    return categories;
  };
  /**
   * Returns categories from search response
   *
   * @param {ObjectArray} categories categories
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @param {Boolean} showRange true if to show range
   * @param {Boolean} incontext true if it's for in context search
   * @returns {ObjectArray} The array of child node objects to be displayed.
   */


  exports.getCategories2 = function (categories, categoryValues, groupProperty, colorToggle, showRange, incontext) {
    if (categories === undefined) {
      return;
    } //This function reads the “AWC_CustomPropValueColor” preference value.
    //This is used to overide filter color in filter panel.


    _filterPanelUtils.getPreferenceValue();

    var _colorToggle = exports.parseBoolean(colorToggle);

    var searchResultFilters = [];
    categories.refineCategories = [];
    categories.navigateCategories = []; // Currently, shape search does not provide group property in performsearch call. It calls groupByProperties separately.
    // So default groupProperty to the first category

    if (groupProperty === undefined && categories.length > 0) {
      groupProperty = categories[0].internalName;
    }

    var defaultFilterFieldDisplayCount = 10;

    var searchResponseInfo = _appCtxSvc.getCtx('searchResponseInfo');

    if (searchResponseInfo !== undefined) {
      if (searchResponseInfo.defaultFilterFieldDisplayCount !== undefined) {
        defaultFilterFieldDisplayCount = searchResponseInfo.defaultFilterFieldDisplayCount;
      }
    }

    _.forEach(categories, function (category, index) {
      category.index = index;
      category.showExpand = true;
      category.currentCategory = '';
      category.showEnabled = false;
      category.showColor = _colorToggle;
      var catName = category.internalName;

      if (groupProperty.hasOwnProperty('internalPropertyName')) {
        groupProperty = groupProperty.internalPropertyName;
      }

      var i = groupProperty.indexOf('.');

      if (i === -1) {
        i = category.internalName.indexOf('.');
        catName = category.internalName.substring(i + 1, category.internalName.length);
      }

      if (catName === groupProperty) {
        category.currentCategory = groupProperty;
        category.showEnabled = true;
      } // category.expand = false;


      if (index < defaultFilterFieldDisplayCount && category.expand === undefined) {
        category.expand = true;
      }

      category.filterValues = getFiltersForCategory(category, categoryValues, groupProperty, _colorToggle);

      if (catName === _filterPanelUtils.PRESET_CATEGORY && incontext === true) {
        var selectedFilters = _.filter(category.filterValues, function (key) {
          return key.selected;
        });

        if (selectedFilters.length > category.defaultFilterValueDisplayCount * 2) {
          category.showFilterText = true;
        }
      } else if (category.filterValues.length > category.defaultFilterValueDisplayCount * 2) {
        category.showFilterText = true;
      }

      if (category.filterValues.length > category.defaultFilterValueDisplayCount + 1 && category.showMoreFilter === undefined) {
        category.showMoreFilter = true;
      }

      if (category.filterValues.length > 0) {
        if (category.type === 'StringFilter') {
          category.showStringFilter = true;
        } else if (category.type === 'DateFilter') {
          category.showDateFilter = true;
          category.showDateRangeFilter = showRange; // default

          if (showRange) {
            category.daterange = getDateRangeForCategory(category, categoryValues);
          } // get last drilldown filter and adjust count accordingly


          var drillDownValue = getDrilldownFilter(category);
          category.drilldown = drillDownValue.drilldown;
          category.startDate = '';
          category.endDate = '';
        } else if (category.type === 'NumericFilter') {
          category.showNumericFilter = true;
          category.showNumericRangeFilter = false;

          if (showRange) {
            category.numericrange = {}; // if values more than 1 or only value is numeric range, show range

            if (category.filterValues.length > 1 || category.filterValues.length === 1 && _.startsWith(category.filterValues[0].startEndRange, _filterPanelUtils.NUMERIC_RANGE)) {
              category.numericrange = getNumericRangeForCategory(category, categoryValues);
              category.showNumericRangeFilter = showRange; // default
            }
          }
        } else if (category.type === 'RadioFilter') {
          category.showRadioFilter = true;
        }
      }

      if (incontext) {
        searchResultFilters = getSearchResultFilters(searchResultFilters, category);
      }

      if (category.type === 'ObjectFilter') {
        categories.navigateCategories.push(category);
      } else {
        categories.refineCategories.push(category);
      }
    });

    if (incontext) {
      var ctx = _appCtxSvc.getCtx('searchIncontextInfo');

      if (ctx) {
        ctx.searchResultFilters = searchResultFilters;
        ctx.searchIncontextCategories = categories;

        _appCtxSvc.updateCtx('searchIncontextInfo', ctx);
      }
    }

    return categories;
  };
  /**
   * Returns search result filters for preset filters
   *
   * @param {Object} category - category
   * @returns {Object} search result filters
   */


  function getPresetResultFilters(category) {
    var selectedFilterVals = [];

    if (!_filterPanelUtils.getHasTypeFilter()) {
      return selectedFilterVals;
    } // remove filtervalues which are not in source map


    var ctx = _appCtxSvc.getCtx('searchIncontextInfo');

    if (ctx) {
      category.filterValues = _.filter(category.filterValues, function (filter) {
        var filters = ctx.inContextMap[_filterPanelUtils.PRESET_CATEGORY];

        var index = _.findIndex(filters, function (value) {
          return value.stringValue === filter.internalName;
        });

        if (index > -1) {
          return filter;
        }
      });
    } // remove all initial unselected preset filters


    if (_filterPanelUtils.isPresetFilters()) {
      category.filterValues = _.filter(category.filterValues, function (filter) {
        return filter.selected;
      });
    }

    for (var i in category.filterValues) {
      var filterVal = category.filterValues[i]; // if all filters are selected which happens for preset-category, reset the selected flag

      if (_filterPanelUtils.isPresetFilters()) {
        filterVal.selected = false;
      }

      if (filterVal.selected) {
        selectedFilterVals.push(filterVal);
      }
    }

    return selectedFilterVals;
  }
  /**
   * Returns search result filters for object filters
   *
   * @param {Object} category - category
   * @returns {Object} search result filters
   */


  function getSearchResultObjectFilters(category) {
    var selectedFilterVals = [];

    for (var ii in category.filterValues.parentnodes) {
      var filterVal = category.filterValues.parentnodes[ii];

      if (filterVal.selected) {
        filterVal.name = filterVal.stringDisplayValue;
        filterVal.internalName = filterVal.stringValue;
        selectedFilterVals.push(filterVal);
      }
    }

    return selectedFilterVals;
  }
  /**
   * Returns search result filters for date filters
   *
   * @param {Object} category - category
   * @returns {Object} search result filters
   */


  function getSearchResultDateFilters(category) {
    var selectedFilterVals = [];
    var startDate = category.daterange.startDate.dbValue;
    var endDate = category.daterange.endDate.dbValue;
    var filter = {};

    var dateRangeFilter = _filterPanelUtils.getDateRangeDisplayString(startDate, endDate);

    filter.name = dateRangeFilter.displayName;
    filter.categoryType = dateRangeFilter.categoryType;
    filter.type = category.type;
    selectedFilterVals.push(filter);
    return selectedFilterVals;
  }
  /**
   * Returns search result filters for numeric filters
   *
   * @param {Object} category - category
   * @returns {Object} search result filters
   */


  function getSearchResultNumericFilters(category) {
    var selectedFilterVals = [];
    var startRange = category.numericrange.startValue.dbValue;
    var endRange = category.numericrange.endValue.dbValue;
    var filter = {}; //        var startEndRange = values[0].startEndRange;
    //        var numericRange = filterPanelUtils.getNumericRangeDisplayString( startRange, endRange, startEndRange );

    var numericRangeFilter = _filterPanelUtils.getNumericRangeDisplayString(startRange, endRange);

    filter.name = numericRangeFilter.displayName;
    filter.categoryType = numericRangeFilter.categoryType;
    filter.type = category.type;
    selectedFilterVals.push(filter);
    return selectedFilterVals;
  }
  /**
   * @param {Object} searchResultFilters - search result filters
   * @param {Object} category - category
   * @returns {Object} search result filters
   */


  function getSearchResultFilters(searchResultFilters, category) {
    var selectedFilterVals = [];

    if (_filterPanelUtils.getHasTypeFilter() && category.internalName === _filterPanelUtils.PRESET_CATEGORY) {
      selectedFilterVals = getPresetResultFilters(category);
    } else {
      if (category.type === 'ObjectFilter') {
        selectedFilterVals = getSearchResultObjectFilters(category);
      } else {
        if (category.type === 'DateFilter' && category.daterange.dateRangeSelected) {
          selectedFilterVals = getSearchResultDateFilters(category);
        } else if (category.type === 'NumericFilter' && category.numericrange.numericRangeSelected) {
          selectedFilterVals = getSearchResultNumericFilters(category);
        }

        for (var ii2 in category.filterValues) {
          var filterVal12 = category.filterValues[ii2];

          if (filterVal12.selected) {
            if (!filterVal12.name) {
              filterVal12.name = filterVal12.stringDisplayValue ? filterVal12.stringDisplayValue : filterVal12.internalName;
            }

            selectedFilterVals.push(filterVal12);
          }
        }
      }
    }

    if (selectedFilterVals.length > 0) {
      var searchResultFilter = {
        searchResultCategory: category.displayName,
        searchResultCategoryInternalName: category.internalName,
        filterValues: selectedFilterVals
      };
      searchResultFilters.push(searchResultFilter);
    }

    return searchResultFilters;
  }
  /**
   * @param {Object} category - category
   * @returns {Object} filter
   */


  function getDrilldownFilter(category) {
    var tmpValue = category.filterValues[0];
    var count = category.defaultFilterValueDisplayCount; // drill down to see what is the last filter selected

    if (tmpValue.selected && tmpValue.internalName !== '$NONE' && _.endsWith(tmpValue.categoryName, YEAR_SUFFIX)) {
      // year selected
      count++;

      if (category.filterValues[1]) {
        tmpValue = category.filterValues[1];

        if (tmpValue.selected) {
          // month selected
          count++;

          if (category.filterValues[2]) {
            tmpValue = category.filterValues[2];

            if (tmpValue && tmpValue.selected) {
              // week selected
              count++;

              if (category.filterValues[3]) {
                tmpValue = category.filterValues[3];
              }
            }
          }
        }
      }
    }

    if (tmpValue) {
      tmpValue.drilldownCount = count;
    }

    return tmpValue;
  }
  /**
   * Returns the filter values for a category based on the type.
   *
   * @param {Object} category from the getCategoryValues
   * @param {Object} categoryValues from the getCategoryValues
   * @param {Object} groupProperty category grouped by
   * @param {Object} colorToggle true if color bar is shown
   *
   * @returns {ObjectArray} The array of filters for category
   */


  function getFiltersForCategory(category, categoryValues, groupProperty, colorToggle) {
    var filterValues = [];
    var internalName = category.internalName;
    var values = categoryValues[internalName];

    if (values && values.length > 0) {
      category.type = values[0].searchFilterType;

      if (category.type === 'StringFilter' || category.type === 'NumericFilter') {
        filterValues = getTypeFiltersForCategory(category, values, groupProperty, colorToggle);
      } else if (category.type === 'DateFilter') {
        filterValues = getDateFiltersForCategory(category, categoryValues, groupProperty, colorToggle);

        if (_.isEmpty(filterValues)) {
          // could be date range
          var filterValue = {};
          filterValues[0] = filterValue;
        }
      } else if (category.type === 'RadioFilter') {
        filterValues = getToggleFiltersForCategory(category, values);
      } else if (category.type === 'ObjectFilter') {
        filterValues = getObjectFilters(values);
      } else {
        throw 'Unsupported filter type ' + category.type + ' found for category ' + category.displayName;
      }
    }

    return filterValues;
  }
  /**
   * Returns filter values for a date category. List contains all years or selected year and months under it
   *
   * @param {Object} category from the getCategoryValues *
   * @param {ObjectArray} categoryValues from the getCategoryValues
   * @param {Object} groupProperty category grouped by
   * @param {Object} colorToggle true if color bar is shown
   *
   * @returns {ObjectArray} The array of filters for category
   */


  function getTypeFiltersForCategory(category, categoryValues, groupProperty, colorToggle) {
    var internalName = category.internalName;
    var catName = category.internalName;
    var i = groupProperty.indexOf('.');

    if (i === -1) {
      i = internalName.indexOf('.');
      catName = internalName.substring(i + 1, category.internalName.length);
    }

    var color = colorToggle && catName === groupProperty; // Set the color on the first "defaultFilterValueDisplayCount" values and any values that are selected (in that order)
    // Skip numeric range filters for coloring. The filter display count needs to be adjusted accordingly

    var filterDisplayCount = category.defaultFilterValueDisplayCount;
    var tmpValsToSetColor = categoryValues.filter(function (categoryValue, index) {
      if (categoryValue.startEndRange === 'NumericRange') {
        filterDisplayCount++;
      }

      return (index < filterDisplayCount || categoryValue.selected) && categoryValue.startEndRange !== 'NumericRange';
    });
    var valsToSetColor; // Colors can only be shown on first 9. Remove items as necessary

    if (tmpValsToSetColor.length < 9) {
      valsToSetColor = tmpValsToSetColor;
    } else {
      valsToSetColor = tmpValsToSetColor.filter(function (categoryValue, index) {
        return index < 9;
      });
    } // Create a filter value for each category value


    var filterValues = categoryValues.map(function (categoryValue) {
      // Pass -1 as index of category should not have a color
      var filterValue = getFilterValue(internalName, categoryValue, color, valsToSetColor.indexOf(categoryValue));

      if (category.type === 'NumericFilter') {
        filterValue.startNumericValue = categoryValue.startNumericValue;
        filterValue.endNumericValue = categoryValue.endNumericValue;
        filterValue.startEndRange = categoryValue.startEndRange;
      }

      return filterValue;
    }); // Put the selected filters first

    return filterValues.filter(function (val) {
      return val.selected;
    }).concat(filterValues.filter(function (val) {
      return !val.selected;
    }));
  }
  /**
   * @param {Object} categoryValue - category value
   * @return {String} filter display value
   */


  function getFilterDisplayName(categoryValue) {
    if (categoryValue.stringValue === '$NONE' && categoryValue.stringDisplayValue === '') {
      return _noFilterValue;
    }

    return categoryValue.stringDisplayValue;
  }
  /**
   * Parses & formats the object filters for display in the UI.
   *
   * @param {ObjectArray} values the filter values.
   * @returns {Object} the filter values formatted with parent and child nodes
   */


  function getObjectFilters(values) {
    var filterValue = {
      parentnodes: [],
      childnodes: []
    };

    _.forEach(values, function (value) {
      if (value.selected) {
        filterValue.parentnodes.push(value);
      } else {
        filterValue.childnodes.push(value);
      }
    });

    return filterValue;
  }
  /**
   * Returns filter values for a date range category.
   *
   * @param {Object} category from the getCategoryValues *
   * @param {Object} categoryValues from the getCategoryValues
   *
   * @returns {ObjectArray} The date range for category
   */


  function getDateRangeForCategory(category, categoryValues) {
    var internalName = category.internalName;
    var values = categoryValues[internalName];
    var selectedDateRange = isDateFilterSelected(values);
    var daterange = {};
    daterange.dateRangeSelected = false;

    var sDate = _dateTimeSvc.getNullDate();

    var eDate = _dateTimeSvc.getNullDate();

    if (selectedDateRange !== null) {
      daterange.dateRangeSelected = true;
      sDate = _filterPanelUtils.getDate(selectedDateRange.startDateValue);
      eDate = _filterPanelUtils.getDate(selectedDateRange.endDateValue);
    }

    var sDateStr = _dateTimeSvc.formatDate(sDate);

    var eDateStr = _dateTimeSvc.formatDate(eDate); // add start date property


    var startDateProperty = _uwPropertySvc.createViewModelProperty('', '', 'DATE', sDate.getTime(), '');

    startDateProperty.isEditable = true;
    startDateProperty.dateApi.isTimeEnabled = false;

    if (sDateStr.length === 0) {
      startDateProperty.dateApi.dateFormatPlaceholder = _dateTimeSvc.getDateFormatPlaceholder();
    } else {
      startDateProperty.dateApi.dateValue = sDateStr;
      startDateProperty.dateApi.dateObject = sDate;
    } // add end date property


    var endDateProperty = _uwPropertySvc.createViewModelProperty('', '', 'DATE', eDate.getTime(), '');

    endDateProperty.isEditable = true;
    endDateProperty.dateApi.isTimeEnabled = false;

    if (eDateStr.length === 0) {
      endDateProperty.dateApi.dateFormatPlaceholder = _dateTimeSvc.getDateFormatPlaceholder();
    } else {
      endDateProperty.dateApi.dateValue = eDateStr;
      endDateProperty.dateApi.dateObject = eDate;
    }

    daterange.startDate = startDateProperty;
    daterange.endDate = endDateProperty;
    return daterange;
  }
  /**
   * Returns filter values for a date range category.
   *
   * @param {Object} category from the getCategoryValues *
   * @param {Object} categoryValues from the getCategoryValues
   *
   * @returns {ObjectArray} The date range for category
   */


  function getNumericRangeForCategory(category) {
    var values = category.filterValues; // Find numeric range

    var numericRangeFilter = null;

    var index = _.findIndex(values, function (value) {
      return _.startsWith(value.startEndRange, _filterPanelUtils.NUMERIC_RANGE);
    });

    if (index > -1) {
      numericRangeFilter = values[index]; // Remove range from list of values

      values.splice(index, 1);
      category.filterValues = values;
    }

    var numericRange = {};
    numericRange.selected = false;
    var sRange;
    var eRange;

    if (numericRangeFilter !== null && numericRangeFilter.selected !== null) {
      numericRange.numericRangeSelected = true;
      numericRange.selected = true;
      sRange = numericRangeFilter.startNumericValue;

      if (numericRangeFilter.startEndRange === _filterPanelUtils.NumericRangeBlankStart) {
        sRange = undefined;
      }

      eRange = numericRangeFilter.endNumericValue;

      if (numericRangeFilter.startEndRange === _filterPanelUtils.NumericRangeBlankEnd) {
        eRange = undefined;
      }
    }

    var startRangeProperty = _uwPropertySvc.createViewModelProperty('', '', 'DOUBLE', sRange, '');

    startRangeProperty.isEditable = true;

    _uwPropertySvc.setPlaceHolderText(startRangeProperty, _fromTextValue); // add end range property


    var endRangeProperty = _uwPropertySvc.createViewModelProperty('', '', 'DOUBLE', eRange, '');

    endRangeProperty.isEditable = true;

    _uwPropertySvc.setPlaceHolderText(endRangeProperty, _toTextValue);

    numericRange.startValue = startRangeProperty;
    numericRange.endValue = endRangeProperty; // save current values

    numericRange.filter = numericRangeFilter;
    return numericRange;
  }
  /**
   * Returns filter values for a date category. List contains all years or selected year and months under it
   *
   * @param {Object} category category
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @returns {ObjectArray} The array of child node objects to be displayed.
   */


  function getDateFiltersForCategory(category, categoryValues, groupProperty, colorToggle) {
    var filterValues = [];
    var internalName = category.internalName + YEAR_SUFFIX;
    var color = colorToggle && internalName.indexOf(groupProperty) !== -1;
    var values = categoryValues[internalName];

    if (!values) {
      internalName = category.internalName + YEAR_MONTH_SUFFIX;
      values = categoryValues[internalName];

      if (!values) {
        internalName = category.internalName + WEEK_SUFFIX;
        values = categoryValues[internalName];
      }

      if (!values) {
        internalName = category.internalName + YEAR_MONTH_DAY_SUFFIX;
        values = categoryValues[internalName];
      }

      if (values) {
        filterValues = addAllDates(category, internalName, values, color, 0);
      }

      return filterValues;
    }

    var selectedYear = isDateFilterSelected(values);

    if (selectedYear === null) {
      // add all years
      filterValues = addAllDates(category, internalName, values, color, 0);
    } else {
      // add selected year and months for the year
      filterValues.push(getDateFilterValue(category, internalName, selectedYear, color, 0, 0));
      var monthValues = getDateFiltersForYear(category, categoryValues, groupProperty, colorToggle, selectedYear);

      for (var i = 0; i < monthValues.length; i++) {
        filterValues.push(monthValues[i]);
      }
    }

    return filterValues;
  }
  /**
   * Returns filter values for a date year category. List contains all months or selected month and weeks under it
   *
   * @param {Object} category category
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @param {Object} selectedYear Year currently selected
   * @returns {ObjectArray} The array of filters for category
   */


  function getDateFiltersForYear(category, categoryValues, groupProperty, colorToggle, selectedYear) {
    var filterValues = [];
    var internalName = category.internalName + YEAR_MONTH_SUFFIX;
    var color = colorToggle && internalName.indexOf(groupProperty) !== -1;
    var values = categoryValues[internalName];

    if (!values) {
      values = [];
    }

    var selectedMonth = isDateFilterSelected(values);

    if (selectedMonth === null) {
      // add all months
      filterValues = addAllDates(category, internalName, values, color, 1, selectedYear);
    } else {
      // add selected month and weeks for the month
      filterValues.push(getDateFilterValue(category, internalName, selectedMonth, color, 0, 1));
      var weekValues = getDateFiltersForYearMonth(category, categoryValues, groupProperty, colorToggle, selectedMonth);

      for (var i = 0; i < weekValues.length; i++) {
        filterValues.push(weekValues[i]);
      }
    }

    return filterValues;
  }
  /**
   * Returns filter values for a category. List contains all weeks or selected week and days under it
   *
   * @param {Object} category category
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @param {Object} selectedMonth Year-Month currently selected
   * @returns {ObjectArray} The array of filters for category
   */


  function getDateFiltersForYearMonth(category, categoryValues, groupProperty, colorToggle, selectedMonth) {
    var filterValues = [];
    var internalName = category.internalName + WEEK_SUFFIX;
    var color = colorToggle && internalName.indexOf(groupProperty) !== -1;
    var values = categoryValues[internalName];

    if (!values) {
      values = [];
    }

    var selectedWeek = isDateFilterSelected(values);

    if (selectedWeek === null) {
      // add all months
      filterValues = addAllDates(category, internalName, values, color, 2, selectedMonth);
    } else {
      // add selected week and days for the week
      filterValues.push(getDateFilterValue(category, internalName, selectedWeek, color, 0, 2));
      var dayValues = getDateFiltersForYearMonthDay(category, categoryValues, groupProperty, colorToggle, selectedWeek);

      for (var i = 0; i < dayValues.length; i++) {
        filterValues.push(dayValues[i]);
      }
    }

    return filterValues;
  }
  /**
   * Returns filter values for a category. List contains all days under the week
   *
   * @param {Object} category category
   * @param {ObjectArray} categoryValues category values
   * @param {String} groupProperty property to be grouped on
   * @param {Boolean} colorToggle true if to toggle color
   * @param {Object} selectedWeek Week currently selected
   * @returns {ObjectArray} The array of filters for category
   */


  function getDateFiltersForYearMonthDay(category, categoryValues, groupProperty, colorToggle, selectedWeek) {
    var filterValues = [];
    var internalName = category.internalName + YEAR_MONTH_DAY_SUFFIX;
    var color = colorToggle && internalName.indexOf(groupProperty) !== -1;
    var values = categoryValues[internalName];

    if (values) {
      if (typeof selectedWeek !== 'undefined') {
        var startTime = new Date(selectedWeek.startDateValue).getTime();
        var endTime = new Date(selectedWeek.endDateValue).getTime();
        values = values.filter(function (filterItem) {
          var startTimeForDay = new Date(filterItem.startDateValue).getTime();
          var endTimeForDay = new Date(filterItem.endDateValue).getTime();

          if (startTimeForDay >= startTime && endTimeForDay <= endTime) {
            return true;
          }

          return false;
        });
      }

      for (var i = 0; i < values.length; i++) {
        filterValues.push(getDateFilterValue(category, internalName, values[i], color, i, 3));
      }
    }

    return filterValues;
  }
  /**
   * Returns all dates for a given year, month or week.
   *
   * @param {Object} category - category
   * @param {String} internalName - internal name
   * @param {Array} values - set of dates
   * @param {String} color - color
   * @param {Object} drilldown - drill down
   * @param {Object} selectedDate - Currently selected year/month/week
   * @return {Object} filter
   */


  function addAllDates(category, internalName, values, color, drilldown, selectedDate) {
    var filterValuesToAdd = values;

    if (typeof selectedDate !== 'undefined') {
      var startTime = new Date(selectedDate.startDateValue).getTime();
      var endTime = new Date(selectedDate.endDateValue).getTime();
      filterValuesToAdd = filterValuesToAdd.filter(function (filterItem) {
        if (new Date(filterItem.startDateValue).getTime() >= startTime && new Date(filterItem.endDateValue).getTime() <= endTime) {
          return true;
        }

        return false;
      });
    } // Create a filter value for each category value


    return filterValuesToAdd.map(function (value, index) {
      // Pass -1 as index of category should not have a color
      return getDateFilterValue(category, internalName, value, color, index, drilldown);
    }) // Remove color from filters that should not have a filter
    .map(function (filter, index) {
      // dirty map, modifies data
      filter.color = index < category.defaultFilterValueDisplayCount ? filter.color : '';
      return filter;
    });
  }
  /**
   * Returns true if a a date is selected in the given list
   *
   * @param {ObjectArray} values set of dates.
   * @returns {Boolean} true if filter is selected.
   */


  function isDateFilterSelected(values) {
    return isFilterSelected(values, false);
  }
  /**
   * Returns true if a a date is selected in the given list
   *
   * @param {ObjectArray} values set of dates.
   * @param {Boolean} flag flag.
   * @returns {Boolean} true if filter is selected.
   */


  function isFilterSelected(values, flag) {
    var selectedValue = null;

    for (var i = 0; i < values.length; i++) {
      if (values[i].selected === true) {
        selectedValue = values[i];

        if (flag) {
          selectedValue.index = i;
        }

        break;
      }
    }

    return selectedValue;
  }
  /**
   * Returns a given date filter's value
   * @param {Object} category category
   * @param {String} categoryName category name
   * @param {Object} categoryValue category value
   * @param {String} color color
   * @param {Integer} index index
   * @param {Bollean} drilldown true if to drill down
   * @returns {Object} filter value
   */


  function getDateFilterValue(category, categoryName, categoryValue, color, index, drilldown) {
    var filterValue = {};
    var filterIndex = drilldown + index;
    filterValue = getFilterValue(categoryName, categoryValue, color, filterIndex);

    if (filterIndex >= category.defaultFilterValueDisplayCount + drilldown || filterIndex >= 9) {
      filterValue.colorIndex = -1;
    }

    filterValue.startDateValue = categoryValue.startDateValue;
    filterValue.endDateValue = categoryValue.endDateValue;
    filterValue.drilldown = drilldown;

    if (drilldown > 0) {
      filterValue.type = 'DrilldownDateFilter';
      filterValue.showDrilldown = true;
    } else {
      filterValue.type = 'DateFilter';
    }

    return filterValue;
  }
  /**
   * Returns a given filter's value
   * @param {String} categoryName category name
   * @param {Object} categoryValue category value
   * @param {String} color color
   * @param {Integer} index index
   * @returns {Object} filter value
   */


  function getFilterValue(categoryName, categoryValue, color, index) {
    var filterValue = {};
    filterValue.categoryName = categoryName;
    filterValue.internalName = categoryValue.stringValue;
    filterValue.name = getFilterDisplayName(categoryValue);
    filterValue.count = categoryValue.count;
    filterValue.selected = categoryValue.selected;
    filterValue.type = categoryValue.searchFilterType;
    filterValue.showCount = filterValue.count;
    filterValue.showSuffixIcon = false;
    filterValue.drilldown = 0;

    _filterPanelUtils.applyCustomColor(categoryName, categoryValue, filterValue); // if current category, set colors for first 5 items


    if (color) {
      filterValue.showColor = true;

      if (index > -1 && !filterValue.color) {
        filterValue.color = _filterPanelUtils.getFilterColorValue(index);
      }
    }

    filterValue.colorIndex = index;
    return filterValue;
  }
  /**
   * Returns filter values for a radio category. List contains all years or selected year and months under it
   *
   * @param {Object} category the category
   * @param {ObjectArray} categoryValues the category values
   *
   * @returns {ObjectArray} The array of radio filters for category
   */


  function getToggleFiltersForCategory(category, categoryValues) {
    var internalName = category.internalName; // Create a filter value for each category value

    return categoryValues.map(function (categoryValue) {
      return getFilterValue(internalName, categoryValue, null, null);
    });
  }
  /**
   * Simple wrapper around $state.go with new searchCriteria
   *
   * @param {String} searchCriteria search criteria
   * @param {String} searchState search state
   * @returns {Object} routing return.
   */


  exports.simpleSearch = function (searchCriteria, searchState) {
    return _$state.go(searchState ? searchState : '.', {
      searchCriteria: searchCriteria
    });
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
   * @param {Object} selectedNodeOffset selected Node Offset
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
   * Exposing the getSearchResulFilters method.
   */


  exports.getSearchResultFilters = getSearchResultFilters;
  /**
   *
   * @memberof NgServices
   * @member filterPanelService
   * @param {$state} $state - Service to use.
   * @param {appCtxService} appCtxService - Service to use.
   * @param {dateTimeService} dateTimeService - Service to use.
   * @param {uwPropertyService} uwPropertyService - Service to use.
   * @param {localeService} localeSvc - Service to use.
   * @param {filterPanelUtils} filterPanelUtils - Service to use.
   * @returns {exports} Instance of this service.
   */

  app.factory('filterPanelService', ['$state', 'appCtxService', 'dateTimeService', 'uwPropertyService', 'localeService', 'filterPanelUtils', function ($state, appCtxService, dateTimeService, uwPropertyService, localeSvc, filterPanelUtils) {
    _$state = $state;
    _appCtxSvc = appCtxService;
    _dateTimeSvc = dateTimeService;
    _uwPropertySvc = uwPropertyService;
    _filterPanelUtils = filterPanelUtils;
    localeSvc.getTextPromise('UIMessages').then(function (localTextBundle) {
      _noFilterValue = localTextBundle.noFilterValue;
      _fromTextValue = localTextBundle.fromText;
      _toTextValue = localTextBundle.toText;
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'filterPanelService'
  };
});