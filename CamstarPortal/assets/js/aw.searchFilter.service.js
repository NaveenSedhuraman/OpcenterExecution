"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/aw.searchFilter.service
 * @requires js/filterPanelUtils
 */
define(['app', 'angular', 'lodash', 'js/analyticsService', 'soa/kernel/clientMetaModel', 'soa/kernel/clientDataModel', 'js/localeService', 'js/appCtxService', 'js/filterPanelUtils'], function (app, ngModule, _, analyticsSvc) {
  'use strict';

  var exports = {};
  var $state = null;
  var $q = null;
  var localeService = null;
  var appCtxService = null;
  var filterPanelUtils = null;
  var cdm = null;
  var localTextBundle = null;
  var _local = 'local';
  var OWNING_SITE = 'OwningSite.owning_site';
  /**
   * Marker for date filters
   *
   * @member _dateFilterMarker
   * @memberOf NgServices.searchFilterService
   */

  exports._dateFilterMarker = '_0Z0_';
  /**
   * The hierarchy of date filters. If a filter on a higher level is removed all filters on the
   * levels below are also cleared.
   *
   * @member _dateFilterLevels
   * @memberOf NgServices.searchFilterService
   */

  exports._dateFilterLevels = ['year', 'year_month', 'week', 'year_month_day'];
  /**
   * The separator between filters
   *
   * @member _filterSeparator
   * @memberOf NgServices.searchFilterService
   */

  exports._filterSeparator = '~';
  /**
   * The separator between filter values
   *
   * @member _filterValueSeparator
   * @memberOf NgServices.searchFilterService
   */

  exports._filterValueSeparator = '^';
  /**
   * Convert a filter object to a string
   *
   * @function buildFilterString
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} filters - Filter object to convert. Keys are filter names, values are array
   *            of filter values
   *
   * @return {String} String representation of the filters
   */

  exports.buildFilterString = function (filters) {
    return _.map(filters, function (value, key) {
      return key + '=' + value.join(exports._filterValueSeparator);
    }).join(exports._filterSeparator);
  };
  /**
   * Determine if the filter is a hierachical child filter.
   * 0 level: 0/64RdN$eNqd$DyB
   * 1 level: 1/64RdN$eNqd$DyB/qyadN$eNqd$DyB
   * 2 level: 2/64RdN$eNqd$DyB/qyadN$eNqd$DyB/sUVdN$eNqd$DyB
   * we only care about 1 level and up, as the 0 level is same as string filter.
   *
   * @function isHierarchicalChildFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} filterString - Filter to be evaluated.
   *
   * @return {Boolean} true if it is a child filter.
   */


  exports.isHierarchicalChildFilter = function (filterString) {
    var isChildFilter = false;

    if (filterString) {
      var nodes = filterString.split(filterPanelUtils.HIERARCHICAL_FACET_SEPARATOR);

      if (nodes && nodes.length > 2 && !isNaN(nodes[0])) {
        var level = parseInt(nodes[0], 10);

        if (level > 0) {
          isChildFilter = true;
        }
      }
    }

    return isChildFilter;
  };
  /**
   * parse hierachical filters which results in multiple filters from one seed filter.
   * 0 level: 0/64RdN$eNqd$DyB
   * 1 level: 1/64RdN$eNqd$DyB/qyadN$eNqd$DyB
   * 2 level: 2/64RdN$eNqd$DyB/qyadN$eNqd$DyB/sUVdN$eNqd$DyB
   * we only care about 1 level and up, as the 0 level is same as string filter.
   *
   * @function parseHierarchicalChildFilters
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} filterString - Filter to be evaluated.
   *
   * @param {Boolean} keepIdentifier - Set to true to keep the filter type identifiers
   *
   * @return {Object} hierachical filter array .
   */


  exports.parseHierarchicalChildFilters = function (filterString, keepIdentifier) {
    var filterValues = [];
    var nodes = filterString.split(filterPanelUtils.HIERARCHICAL_FACET_SEPARATOR);

    if (!isNaN(nodes[0])) {
      var level = parseInt(nodes[0], 10);

      for (var i = 0; i <= level; i++) {
        var filterValue = i.toString();

        for (var j = 1; j <= i + 1; j++) {
          filterValue += filterPanelUtils.HIERARCHICAL_FACET_SEPARATOR + nodes[j];
        }

        if (keepIdentifier) {
          filterValues.push(filterPanelUtils.INTERNAL_OBJECT_FILTER + filterValue);
        } else {
          filterValues.push(filterValue);
        }
      }
    }

    return filterValues;
  };
  /**
   * Parse the 'filter' property on the state into an object.
   *
   * @function getFilters
   * @memberOf NgServices.searchFilterService
   *
   * @param {Boolean} groupByCategory - Set to true to automatically group by category
   *
   * @param {Boolean} sort - Set to true to sort the parameters
   *
   * @param {Boolean} checkHierarchy - Set to true to check for hierarchy filters
   *
   * @param {Boolean} keepHierarchyIdentifier - Set to true to keep the hierarchy identifiers
   *
   * @param {Boolean} isShapeOrSavedSearch - Set to true to skip Shape Search and Saved Search filters
   *
   *
   * @return {Object} Object where internal filter name is the key and value is the array of
   *         filters selected.
   */


  exports.getFilters = function (groupByCategory, sort, checkHierarchy, keepHierarchyIdentifier, isShapeOrSavedSearch) {
    var filterMap = {};

    if ($state.params.filter) {
      // Build the filter map
      $state.params.filter.split(exports._filterSeparator).map(function (filterVal) {
        var separatorIndex = filterVal.search('=');
        var key = filterVal.slice(0, separatorIndex);
        var valuePart = filterVal.slice(separatorIndex + 1);
        var filterPair = [];
        filterPair[0] = key;
        filterPair[1] = valuePart;

        if (filterPair.length === 2 && filterPair[1] !== '') {
          var realFilter = filterPanelUtils.getRealFilterWithNoFilterType(filterPair[1]);

          if (checkHierarchy && exports.isHierarchicalChildFilter(realFilter) && exports.checkIfObjectFilterType(filterPair[0])) {
            filterMap[filterPair[0]] = exports.parseHierarchicalChildFilters(realFilter, keepHierarchyIdentifier);
          } else if (isShapeOrSavedSearch) {
            if (filterPair[0] !== 'ShapeSearchProvider' && filterPair[0] !== 'Geolus Criteria' && filterPair[0] !== 'SS1shapeBeginFilter' && filterPair[0] !== 'SS1shapeEndFilter' && filterPair[0] !== 'SS1partShapeFilter' && filterPair[0] !== 'UpdatedResults.updated_results') {
              filterMap[filterPair[0]] = filterPair[1].split(exports._filterValueSeparator);
            }
          } else {
            filterMap[filterPair[0]] = filterPair[1].split(exports._filterValueSeparator);
          }
        }
      });
    }

    return groupByCategory ? exports.groupByCategory(filterMap) : sort ? exports.getSortedFilterMap(filterMap) : filterMap;
  };
  /**
   * Check if a given filter category is ObjectFilter type.
   *
   * @function checkIfObjectFilterType
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} filterCategoryName - Name of the filter category
   *
   * @return {Boolean} True if the filter category is of ObjectFilter type, false otherwise.
   */


  exports.checkIfObjectFilterType = function (filterCategoryName) {
    var isObjectFilterType = false;
    var responseFilterMap = appCtxService.getCtx('searchResponseInfo.searchFilterMap');

    if (responseFilterMap && filterCategoryName && responseFilterMap[filterCategoryName]) {
      var filters = [];
      filters = responseFilterMap[filterCategoryName];

      if (filters && filters.length > 0) {
        if (filters[0].searchFilterType === 'ObjectFilter') {
          isObjectFilterType = true;
        }
      }
    }

    return isObjectFilterType;
  };
  /**
   * Group the filters by the actual category. Date filter properties will be merged (ex
   * MyCategory_0Z0_year and MyCategory_0Z0_week will be merged into MyCategory)
   *
   * @function getSortedFilterMap
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} params - Object where internal filter name is the key and value is the array
   *            of filters selected.
   *
   * @return {Object} Same object with date filters merged
   */


  exports.getSortedFilterMap = function (params) {
    return _.reduce(params, function (acc, nxt, key) {
      var trueKey = key.split(exports._dateFilterMarker)[0];

      if (trueKey !== key) {
        _.forEach(nxt, function (nxtValue) {
          var decoratedNxt = {};
          decoratedNxt.property = key;
          decoratedNxt.filter = nxtValue;

          if (acc[trueKey]) {
            acc[trueKey].push(decoratedNxt);
          } else {
            acc[trueKey] = [];
            acc[trueKey].push(decoratedNxt);
          }
        });
      } else {
        if (acc[key]) {
          acc[key] = acc[key].concat(nxt);
        } else {
          acc[key] = nxt;
        }
      }

      return acc;
    }, {});
  };
  /**
   * put the current category's expand/show more/etc into context
   *
   * @function rememberCategoryFilterState
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} context - context
   */


  exports.rememberCategoryFilterState = function (context) {
    var searchCurrentFilterCategories = appCtxService.getCtx('searchResponseInfo.searchCurrentFilterCategories');

    if (searchCurrentFilterCategories === undefined) {
      searchCurrentFilterCategories = [];
      var ctx = appCtxService.getCtx('searchResponseInfo');

      if (ctx) {
        searchCurrentFilterCategories.push(context.category);
        ctx.searchCurrentFilterCategories = searchCurrentFilterCategories;
        appCtxService.updateCtx('searchResponseInfo', ctx);
      }
    } else {
      var index = _.findIndex(searchCurrentFilterCategories, function (category) {
        return category.internalName === context.category.internalName;
      });

      if (index < 0) {
        searchCurrentFilterCategories.push(context.category);
      } else {
        searchCurrentFilterCategories[index] = context.category;
      }

      appCtxService.updatePartialCtx('searchResponseInfo.searchCurrentFilterCategories', searchCurrentFilterCategories);
    }
  };
  /**
   * build search filter
   *
   * @function buildSearchFilters
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} context - search context to update with active filters
   * @returns {Object} updated search context
   */


  exports.buildSearchFilters = function (context) {
    // Initialize the search context if necessary
    var searchContext = ngModule.copy(appCtxService.getCtx('search'));
    searchContext = searchContext ? searchContext : {}; // Filter map and filter array are both required
    // Input to performSearch needs filter map

    searchContext.activeFilterMap = context && context.search && context.search.activeFilterMap ? ngModule.copy(context.search.activeFilterMap) : {}; // But order matters in some cases and so array is needed

    searchContext.activeFilters = []; // Build up filter map and array

    _.forEach(exports.getFilters(), function (value, key) {
      // If it's a valid filter
      // get filter type
      var filterType = 'StringFilter';

      if (key === OWNING_SITE) {
        filterType = 'RadioFilter';
        searchContext.activeFilterMap[key] = value.map(function (v1) {
          var filter = {};
          filter.searchFilterType = 'RadioFilter';
          filter.stringValue = v1;
          return filter;
        });
      } else {
        // Map is used directly by data provider
        searchContext.activeFilterMap[key] = value.map(function (v1) {
          var filter = {};

          if (_.startsWith(v1, filterPanelUtils.INTERNAL_DATE_FILTER)) {
            filter = filterPanelUtils.getDateRangeFilter(v1.substring(12, v1.length));
          } else if (_.startsWith(v1, filterPanelUtils.INTERNAL_NUMERIC_RANGE)) {
            filter = filterPanelUtils.getNumericRangeFilter(v1.substring(14, v1.length));
          } else if (_.startsWith(v1, filterPanelUtils.INTERNAL_NUMERIC_FILTER)) {
            filter.searchFilterType = 'NumericFilter';
            var numericValue = parseFloat(v1.substring(15, v1.length));

            if (!isNaN(numericValue)) {
              filter.startNumericValue = numericValue;
              filter.endNumericValue = numericValue;
            }

            filter.stringValue = v1.substring(15, v1.length);
          } else if (_.startsWith(v1, filterPanelUtils.INTERNAL_OBJECT_FILTER)) {
            // SOA handles object filters differently in aw4.0.
            // So we need to pass "StringFilter" until server side is changed to be the same as aw3.4
            // filter.searchFilterType = "ObjectFilter";
            filter.searchFilterType = 'StringFilter';
            filter.stringValue = v1.substring(14, v1.length);
          } else if (v1 === '$TODAY' || v1 === '$THIS_WEEK' || v1 === '$THIS_MONTH') {
            // For special Solr filters like TODAY, THIS_WEEK or THIS_MONTH, mark the filter as DateFilter but keep string values
            filter.searchFilterType = 'DateFilter';
            filter.stringValue = v1;
          } else {
            filter.searchFilterType = 'StringFilter';
            filter.stringValue = v1;
          }

          filterType = filter.searchFilterType;
          return filter;
        });
      } // Array to maintain the order


      searchContext.activeFilters.push({
        name: key,
        values: value,
        type: filterType
      });
    });

    return searchContext;
  };
  /**
   * Returns a displayable string representing the active search filter map
   *
   * @function getFilterStringFromActiveFilterMap
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} searchFilterMap - the active search filter map
   * @return {Object} Search filter string to be displayed to the user
   */


  exports.getFilterStringFromActiveFilterMap = function (searchFilterMap) {
    var searchRespContext = appCtxService.getCtx('searchResponseInfo');
    searchRespContext = searchRespContext ? searchRespContext : {};
    var searchFilterCategories = searchRespContext.searchFilterCategories; // For each of the current search params

    var searchParams = exports.getFilters(false);
    var displayString = '';

    _.map(searchParams, function (value, property) {
      var trueProperty = property.split(exports._dateFilterMarker)[0]; // If it's a valid filter

      var index = _.findIndex(searchFilterCategories, function (o) {
        return o.internalName === trueProperty;
      }); // Get the filter name first


      var filterName = '';

      if (index > -1) {
        filterName = searchFilterCategories[index].displayName;
      } else if (!searchFilterCategories || searchFilterCategories && searchFilterCategories.length < 1) {
        filterName = exports.getCategoryDisplayName(property);
      } else {
        return '';
      } // Get display name for all the filter values


      var filterValues = '';

      _.forEach(searchParams[property], function (filter) {
        var filterValue = exports.getBreadCrumbDisplayValue(searchFilterMap[property], filterPanelUtils.getRealFilterWithNoFilterType(filter), searchRespContext.searchFilterMap[property]);
        filterValues += filterValues === '' ? filterValue : ', ' + filterValue;
      });

      if (filterValues !== '') {
        var individualFilterString = filterName + '=' + filterValues;
        displayString += displayString === '' ? individualFilterString : ', ' + individualFilterString;
      }
    });

    return displayString;
  };
  /**
   * Returns filter map to be used by save search action
   *
   * @function convertFilterMapToSearchStringFilterMap
   * @memberOf NgServices.searchFilterService
   *
   * @return {Object} Modified filter map to be used by the save search operation
   */


  exports.convertFilterMapToSavedSearchFilterMap = function () {
    var searchContext = appCtxService.getCtx('search');
    var activeFilterMap = searchContext.activeFilterMap;
    var activeFilters = searchContext.activeFilters;
    var searchStringFilterMap = {};

    if (activeFilterMap) {
      _.forEach(activeFilterMap, function (value, key) {
        var filters = [];

        for (var indx = 0; indx < value.length; indx++) {
          var filter = {}; // Saved search object only store SearchStringFilter types

          filter.searchFilterType = 'SearchStringFilter';
          filter.startNumericValue = 0;
          filter.endNumericValue = 0;
          filter.startDateValue = 0;
          filter.endDateValue = 0; // Handle date range filters and numeric range filters

          if (value[indx].searchFilterType === 'DateFilter' && !value[indx].stringValue) {
            var dateParts1 = value[indx].startDateValue.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            var dateParts2 = value[indx].endDateValue.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

            if (dateParts1 && dateParts2) {
              var fromDate = new Date(dateParts1);
              var toDate = new Date(dateParts2);
              filter.stringValue = filterPanelUtils.getDateRangeString(fromDate, new Date(toDate));
            } else {
              continue;
            }
          } else if (value[indx].searchFilterType === 'NumericFilter') {
            if (!value[indx].stringValue) {
              filter.stringValue = filterPanelUtils.getNumericRangeString(value[indx].startNumericValue, value[indx].endNumericValue);
            } else {
              filter.stringValue = filterPanelUtils.INTERNAL_NUMERIC_FILTER.concat(value[indx].stringValue);
            }
          } else {
            // Currently NumericFilters are also being treated as String Filters
            // verify this filter is numeric filter by checking against activeFilters data structure
            var numericFilterIndex = _.findIndex(activeFilters, function (object) {
              if (object.name === key && object.values) {
                return _.startsWith(object.values[0], filterPanelUtils.INTERNAL_NUMERIC_FILTER) || _.startsWith(object.values[0], filterPanelUtils.INTERNAL_NUMERIC_RANGE);
              }
            });

            if (numericFilterIndex > -1) {
              filter.stringValue = filterPanelUtils.INTERNAL_NUMERIC_FILTER.concat(value[indx].stringValue);
            } else {
              filter.stringValue = value[indx].stringValue;
            }
          }

          filters.push(filter);
        }

        searchStringFilterMap[key] = filters;
      });
    }

    return searchStringFilterMap;
  };
  /**
   * Return displayble filter value
   *
   * @function getFilterDisplayValue
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} values - filter values
   * @param {String} value internal value
   * @returns {String} display value for the filter
   */


  exports.getFilterDisplayValue = function (values, value) {
    var dispValue = '';
    var filterValue = '';
    var dArray = [];

    if (_.startsWith(value, filterPanelUtils.INTERNAL_DATE_FILTER)) {
      filterValue = value.replace(filterPanelUtils.INTERNAL_DATE_FILTER, '');
      dArray = filterValue.split('_TO_');

      if (dArray.length > 1) {
        var startDate = new Date(dArray[0]);
        var endDate = new Date(dArray[1]);
        var dateRange = filterPanelUtils.getDateRangeDisplayString(startDate, endDate);
        dispValue = dateRange.displayName;
      }
    } else if (_.startsWith(value, filterPanelUtils.INTERNAL_NUMERIC_RANGE)) {
      filterValue = value.replace(filterPanelUtils.INTERNAL_NUMERIC_RANGE, '');
      dArray = filterValue.split('_TO_');

      if (dArray.length > 1) {
        var numericRange = filterPanelUtils.getNumericRangeDisplayString(dArray[0], dArray[1]);
        dispValue = numericRange.displayName;
      }
    } else {
      var ind = _.findIndex(values, function (o) {
        return o.stringValue === value;
      });

      if (ind > -1) {
        if (_.endsWith(values[ind].stringValue, '$NONE')) {
          dispValue = localTextBundle.noFilterValue;
        } else {
          dispValue = values[ind].stringDisplayValue;
        }
      }
    }

    return dispValue;
  };
  /**
   * Return display name for reserverd Search keywords
   *
   * @function getSpecialDisplayName
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} value property value
   * @returns {String} display value for the property value
   */


  exports.getSpecialDisplayName = function (value) {
    if (value === '$ME') {
      return cdm.getUserSession().props.user.uiValues[0];
    }

    if (value === '$TODAY') {
      return exports.getLocalTextBundle().searchFilterVariableToday;
    }

    if (value === '$THIS_WEEK') {
      return exports.getLocalTextBundle().searchFilterVariableThisWeek;
    }

    if (value === '$THIS_MONTH') {
      return exports.getLocalTextBundle().searchFilterVariableThisMonth;
    }

    if (value === '$MY_GROUP') {
      return exports.getLocalTextBundle().searchFilterVariableMyGroup;
    }

    return '';
  };

  exports.getLocalTextBundle = function () {
    return localTextBundle;
  };
  /**
   * Return displayable breadcrumb
   *
   * @function getBreadCrumbDisplayValue
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} values - filter values
   * @param {String} value internal value
   * @param {ObjectArray} searchFilters entire set of search filters
   * @returns {String} display value for the breadcrumb
   */


  exports.getBreadCrumbDisplayValue = function (values, value, searchFilters) {
    var dispValue = exports.getSpecialDisplayName(value);

    if (dispValue === '') {
      if (_.startsWith(value, filterPanelUtils.INTERNAL_DATE_FILTER)) {
        var startDate = filterPanelUtils.getDate(exports.processDateStringOffset(values[0].startDateValue));
        var endDate = filterPanelUtils.getDate(exports.processDateStringOffset(values[0].endDateValue));
        var dateRange = filterPanelUtils.getDateRangeDisplayString(startDate, endDate);
        dispValue = dateRange.displayName;
      } else if (_.startsWith(value, filterPanelUtils.INTERNAL_NUMERIC_RANGE)) {
        var startRange = values[0].startNumericValue;
        var endRange = values[0].endNumericValue;
        var startEndRange = values[0].startEndRange;
        var numericRange = filterPanelUtils.getNumericRangeDisplayString(startRange, endRange, startEndRange);
        dispValue = numericRange.displayName;
      } else {
        var ind = _.findIndex(values, function (o) {
          return o.stringValue === value;
        });

        if (ind > -1) {
          // some "$NONE" stringValue actually has non-empty stringDisplayValue, so we don't want to display the default "Unassigned" in that case.
          if (values[ind].stringDisplayValue) {
            dispValue = values[ind].stringDisplayValue;
          } else if (_.endsWith(value, '$NONE')) {
            dispValue = localTextBundle.noFilterValue;
          } else if (searchFilters) {
            var theFilter = _.find(searchFilters, function (o) {
              return o.stringValue === value;
            });

            if (theFilter && theFilter.stringDisplayValue) {
              dispValue = theFilter.stringDisplayValue;
            } else {
              dispValue = value;
            }
          } else {
            dispValue = value;
          }
        }
      }
    }

    return dispValue;
  };
  /**
   * IE needs the colon character (:) to separate hour and minutes in the timezeone offset part of a date string,
   * otherwise conversion to date fails
   * This function converts 'incompatible' date strings to IE compatible date strings
   *
   * @function parseDateStringOffset
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} dateString - Date string in the format - yyyy-mm-ddThh:mm:ss[offset value in minutes]
   * @returns {String} updated date string
   */


  exports.processDateStringOffset = function (dateString) {
    if (dateString.length > 19) {
      var offsetString = dateString.substring(19);

      if (offsetString.length > 4 && offsetString.indexOf(':') === -1) {
        var hour = offsetString.substring(0, offsetString.length - 2);
        var min = offsetString.substring(offsetString.length - 2);
        var newOffset = hour.concat(':', min);
        dateString = dateString.replace(offsetString, newOffset);
      }
    }

    return dateString;
  };
  /**
   * Group the filters by the actual category. Date filter properties will be merged (ex
   * MyCategory_0Z0_year and MyCategory_0Z0_week will be merged into MyCategory)
   *
   * @function groupByCategory
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} params - Object where internal filter name is the key and value is the array
   *            of filters selected.
   *
   * @return {Object} Same object with date filters merged
   */


  exports.groupByCategory = function (params) {
    return _.reduce(params, function (acc, nxt, key) {
      var trueKey = key.split(exports._dateFilterMarker)[0];

      if (trueKey !== key) {
        _.forEach(nxt, function (aFilter) {
          aFilter.startEndRange = key.substring(trueKey.length, key.length);
        });
      }

      if (acc[trueKey]) {
        acc[trueKey] = acc[trueKey].concat(nxt);
      } else {
        acc[trueKey] = nxt;
      }

      return acc;
    }, {});
  };
  /**
   * Create the filter string from the filters and update the 'filter' state parameter
   *
   * @function setSearchFilters
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} params - Object where internal filter name is the key and value is the value
   */


  exports.setFilters = function (params) {
    $state.go('.', {
      filter: exports.buildFilterString(params)
    });
  };
  /**
   * Add or remove a string filter from the newParams object. Not pure, modifies newParams.
   *
   * @param {Object} newParams - Parameter object to modify
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   * @param {Boolean} addRemoveOnly - True/false to only add/remove. Undefined will have no
   *            effect.
   */


  exports.addOrRemoveDateFilter = function (newParams, category, filter, addRemoveOnly) {
    // If we are removing a specific filter
    if (filter) {
      // If the category already exists in the parameters
      if (newParams[category]) {
        // Try to find the filter in the current filters for that category
        var idx = newParams[category].indexOf(filter); // If it is in the list

        if (idx !== -1) {
          // And we are not only adding parameters
          if (addRemoveOnly !== true) {
            if (category.split(exports._dateFilterMarker)[1] === 'year_month_day') {
              newParams[category].splice(idx, 1);
            } else {
              exports.removeDateFilter(newParams, category);
            }
          }
        } else {
          // If it is not in the list
          // And we are not only removing parameters
          if (addRemoveOnly !== false) {
            // Add it
            newParams[category].push(filter);
          }
        }
      } else {
        // If the category does not exist in the parameters create it and add the filter
        // Unless told to only remove parameters
        if (addRemoveOnly !== false) {
          newParams[category] = [filter];
        }
      }
    } else {
      // If we are removing a whole category (cannot add without filter value)
      // If the category exists and we are not only adding parameters
      if (newParams[category] && addRemoveOnly !== true) {
        exports.removeDateFilter(newParams, category);
      }
    }
  };
  /**
   * Add or remove a string filter from the newParams object. Not pure, modifies newParams.
   *
   * @param {Object} newParams - Parameter object to modify
   * @param {String} category - Internal name of the category
   */


  exports.removeDateFilter = function (newParams, category) {
    var base = category.split(exports._dateFilterMarker)[0];

    var level = exports._dateFilterLevels.indexOf(category.split(exports._dateFilterMarker)[1]);

    exports._dateFilterLevels.slice(level).map(function (levelCategory) {
      delete newParams[base + exports._dateFilterMarker + levelCategory];
    });
  };

  exports.addOrRemoveObjectFilter = function (newParams, category, filter, addRemoveOnly) {
    if (addRemoveOnly) {
      delete newParams[category];
      exports.addOrRemoveStringFilter(newParams, category, filter, addRemoveOnly, 'ObjectFilter');
    } else {
      delete newParams[category];
      var realFilter = filterPanelUtils.getRealFilterWithNoFilterType(filter);
      var nodes = realFilter.split('/'); // If we are removing the root node, the length will be 2. Otherwise we are removing an intermediate node.

      if (nodes.length > 2) {
        var level = (nodes[0] - 1).toString();

        for (var i = 1; i < nodes.length - 1; i++) {
          level += '/';
          level += nodes[i];
        }

        newParams[category] = [level];
      }
    }
  };
  /**
   * Add or remove a radio filter from the newParams object.
   *
   * @param {Object} newParams - Parameter object to modify
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   */


  exports.addRadioSiteFilter = function (newParams, category, filter) {
    // If we are removing a specific filter
    if (filter) {
      // If the category already exists in the parameters
      if (newParams[category]) {
        // it does not exist in the list )
        var idx = newParams[category].indexOf(filter);

        if (idx === -1) {
          /* Remove every other */
          for (var j in newParams) {
            delete newParams[j];
          }

          newParams[category] = [filter];
        }
      } else {
        // If the category does not exist in the parameters create it and add the filter
        // first search newParams is empty
        newParams[category] = [filter];
      }
    }
  };
  /**
   * Remove a radio filter from the newParams object.
   *
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   */


  exports.removeRadioSiteFilter = function (category, filter) {
    if (filter) {
      // If the category already exists in the parameters
      var newParams = exports.getFilters();

      if (newParams[category]) {
        // if it is already in the list (example: we are removing a filter from the breadcrumb )
        var idx = newParams[category].indexOf(filter);

        if (idx !== -1) {
          // it already exist in the list, so select the other option from radio button.
          var reponseFilterMap = appCtxService.getCtx('searchResponseInfo.searchFilterMap');

          if (reponseFilterMap) {
            // Remove everything first
            for (var i in newParams) {
              delete newParams[i];
            }

            var toggledRadioFilter; // Now add the other value from radio filter

            _.map(reponseFilterMap, function (value, key) {
              if (key === category) {
                _.forEach(value, function (currentfilter) {
                  if (currentfilter.stringValue !== filter) {
                    newParams[category] = [currentfilter.stringValue];
                    toggledRadioFilter = true;
                  }
                });
              }
            });

            if (!toggledRadioFilter) {
              newParams[category] = [_local];
            }
          }
        } // Update the parameters


        exports.setFilters(newParams);
      }
    }
  };
  /**
   * Add or remove a string filter from the newParams object. Not pure, modifies newParams.
   *
   * @param {Object} newParams - Parameter object to modify
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   * @param {Boolean} addRemoveOnly - True/false to only add/remove. Undefined will have no
   *            effect.
   * @param {String} filterType - filterType
   */


  exports.addOrRemoveStringFilter = function (newParams, category, filter, addRemoveOnly, filterType) {
    // If we are removing a specific filter
    if (filter) {
      var prefixedFilter = filter; // Try to find the filter in the current filters for that category

      if (filterType === 'NumericFilter' && !_.startsWith(filter, filterPanelUtils.INTERNAL_NUMERIC_FILTER)) {
        prefixedFilter = filterPanelUtils.INTERNAL_NUMERIC_FILTER.concat(filter);
      } // If the category already exists in the parameters


      if (newParams[category]) {
        var idx = newParams[category].indexOf(prefixedFilter);

        if (idx === -1) {
          // to handle the special case of prefilter "$ME".
          var me = cdm.getUserSession().props.user.uiValues[0];

          if (me.replace(/\s/g, '') === prefixedFilter.replace(/\s/g, '')) {
            idx = newParams[category].indexOf('$ME');
          }
        } // If it is in the list


        if (idx !== -1) {
          // And we are not only adding parameters
          if (addRemoveOnly !== true) {
            // Remove the filter
            newParams[category].splice(idx, 1); // If the category is not empty delete it

            if (newParams[category].length === 0) {
              delete newParams[category];
            }
          }
        } else {
          // If it is not in the list
          // there can only be one date range/numeric filter
          if (_.startsWith(prefixedFilter, filterPanelUtils.INTERNAL_DATE_FILTER)) {
            delete newParams[category];
            newParams[category] = [];
          } else if (_.startsWith(prefixedFilter, filterPanelUtils.INTERNAL_NUMERIC_RANGE)) {
            var index = _.findIndex(newParams[category], function (o) {
              return _.startsWith(o, filterPanelUtils.INTERNAL_NUMERIC_RANGE);
            });

            if (index > -1) {
              // Remove range from list of values
              newParams[category].splice(index, 1);
            }
          } // And we are not only removing parameters


          if (addRemoveOnly !== false) {
            // Add it
            newParams[category].push(prefixedFilter);
          }
        }
      } else {
        // If the category does not exist in the parameters create it and add the filter
        // Unless told to only remove parameters
        if (addRemoveOnly !== false) {
          newParams[category] = [prefixedFilter];
        }
      }
    } else {
      // If we are removing a whole category (cannot add without filter value)
      // If the category exists and we are not only adding parameters
      if (newParams[category] && addRemoveOnly !== true) {
        // Delete the category
        delete newParams[category];
      } // The category may be a date filter (with additional child filters)


      for (var i in newParams) {
        // So check if any remaining categories are that category with the date filter delimiter
        // If they are and we are not only adding parameters
        if (i.indexOf(exports._dateFilterMarker) !== -1 && i.split(exports._dateFilterMarker)[0] === category && addRemoveOnly !== true) {
          // Remove them
          delete newParams[i];
        }
      }
    }
  };
  /**
   * Add or remove a search filter. Adds the filter if it is not active, removes it if it is
   * active. If a filter is not given the same applies to the full category.
   *
   * @function addOrRemoveFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   * @param {Boolean} addRemoveOnly - True/false to only add/remove. Undefined will have no effect.
   * @param {String} filterType - Filter type.
   */


  exports.addOrRemoveFilter = function (category, filter, addRemoveOnly, filterType) {
    // Get the active filters
    var newParams = exports.getFilters(); // Modify the filter object

    if (filterType === 'RadioFilter') {
      exports.addRadioSiteFilter(newParams, category, filter);
    } else if (filterType === 'ObjectFilter') {
      exports.addOrRemoveObjectFilter(newParams, category, filter, addRemoveOnly);
    } else if (category.indexOf(exports._dateFilterMarker) !== -1) {
      exports.addOrRemoveDateFilter(newParams, category, filter, addRemoveOnly);
    } else {
      exports.addOrRemoveStringFilter(newParams, category, filter, addRemoveOnly, filterType);
    } // Update the parameters


    exports.setFilters(newParams);
  };
  /**
   * Add a search filter
   *
   * @function addFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   */


  exports.addFilter = function (category, filter) {
    exports.addOrRemoveFilter(category, filter, true);
  };
  /**
   * Remove a search filter
   *
   * @function removeFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} category - Internal name of the category
   * @param {String} filter - Filter value. Pass null to clear all options for category.
   */


  exports.removeFilter = function (category, filter) {
    exports.addOrRemoveFilter(category, filter, false);
  };
  /**
   * Get the extension that should be added to the internal name of the filter.
   *
   * @function getFilterExtension
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} filter - Filter object
   *
   * @return {String} The extension
   */


  exports.getFilterExtension = function (filter) {
    if (filter.startEndRange === '+1YEAR') {
      return exports._dateFilterMarker + exports._dateFilterLevels[0];
    }

    if (filter.startEndRange === '+1MONTH') {
      return exports._dateFilterMarker + exports._dateFilterLevels[1];
    }

    if (filter.startEndRange === '+7DAYS') {
      return exports._dateFilterMarker + exports._dateFilterLevels[2];
    }

    if (filter.startEndRange === '+1DAY') {
      return exports._dateFilterMarker + exports._dateFilterLevels[3];
    }

    return filter.startEndRange;
  };
  /**
   * Do a search with filters
   *
   * @function doSearch
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} targetState - Name of the state to go to. Defaults to '.' (current state)
   * @param {String} searchCriteria - New search criteria
   * @param {Object} filters - Object where internal filter name is the key and value is the value
   */


  exports.doSearch = function (targetState, searchCriteria, filters) {
    $state.go(targetState ? targetState : '.', {
      filter: exports.buildFilterString(filters),
      searchCriteria: searchCriteria
    });
  };
  /**
   * Do a search and keep the existing filters
   *
   * @function doSearchKeepFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} targetState - Name of the state to go to. Defaults to '.' (current state)
   * @param {String} searchCriteria - New search criteria
   * @param {String} shapeSearchProviderActive - Whether we are executing search within shapeSearchProvider
   * @param {String} savedSearchUid - Uid of saved search used to determine if we are executing search while in context of the saved search
   */


  exports.doSearchKeepFilter = function (targetState, searchCriteria, shapeSearchProviderActive, savedSearchUid) {
    // If we are in Shape Search or Saved Search context we do not want to keep the filters related to
    // either when we perform this search.
    if (shapeSearchProviderActive === 'true' || savedSearchUid && savedSearchUid !== null) {
      $state.go(targetState ? targetState : '.', {
        filter: exports.buildFilterString(exports.getFilters(false, undefined, undefined, undefined, true)),
        searchCriteria: searchCriteria
      });
    } else {
      $state.go(targetState ? targetState : '.', {
        filter: exports.buildFilterString(exports.getFilters(false)),
        searchCriteria: searchCriteria
      });
    }
  };
  /**
   * Load the clear breadcrumb button title
   *
   * @function loadBreadcrumbClearTitle
   * @memberOf NgServices.searchFilterService
   *
   *
   * @return {String} The localized clearBreadCrumb link title
   */


  exports.loadBreadcrumbClearTitle = function () {
    return localeService.getLocalizedText('UIMessages', 'clearBreadCrumb');
  };
  /**
   * Do a shape search
   *
   * @function doShapeSearch
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} targetState - Name of the state to go to. Defaults to '.' (current state)
   * @param {String} searchCriteria - Item Id of selected object
   * @param {String} filter - ShapeSearchProvider set to true and the Geolus Criteria (uid of
   *            selected object)
   */


  exports.doShapeSearch = function (targetState, searchCriteria, filter) {
    $state.go(targetState ? targetState : '.', {
      filter: filter,
      searchCriteria: searchCriteria
    });
  };
  /**
   * Get the title for a breadcrumb provider
   *
   * @function loadBreadcrumbTitle
   * @memberOf NgServices.searchFilterService
   *
   * @param {String|Object} label - String label of the breadcrumb or an object with the source
   *            and key of the file to load it from.
   * @param {Number} totalResultCount - The number of results found
   * @param {Object} selectionModel - Selection model to check
   * @returns {String} bread crumb title
   */


  exports.loadBreadcrumbTitle = function (label, totalResultCount, selectionModel) {
    // If no label is provided return the loading message
    var totalFound = appCtxService.getCtx('search.totalFound');
    var searchString = appCtxService.getCtx('search.criteria.searchString');

    if (!label || totalFound === undefined) {
      return localeService.getLocalizedText('UIMessages', 'loadingMsg');
    }

    return $q.all({
      label: typeof label === 'string' ? $q.when(label) : localeService.getLocalizedText(label.source, label.key),
      xrtMessages: localeService.getTextPromise('XRTMessages'),
      uiMessages: localeService.getTextPromise('UIMessages')
    }).then(function (localizedText) {
      // If no results return the no results message
      if (totalResultCount === 0) {
        if (searchString) {
          return localizedText.uiMessages.noSearchResultsWithSearchBox;
        }

        return localizedText.uiMessages.noSearchResults.format('', localizedText.label);
      }

      var resultsCountLabel;

      if (searchString) {
        resultsCountLabel = localizedText.uiMessages.resultsCountLabelWithSearchBox.format(totalResultCount);
      } else {
        resultsCountLabel = localizedText.uiMessages.resultsCountLabel.format(totalResultCount, '', localizedText.label);
      } // If not in multiselect mode return the result count message


      if (!selectionModel || !selectionModel.multiSelectEnabled) {
        return resultsCountLabel;
      } // Otherwise return the selection count message


      return localizedText.xrtMessages.selectionCountLabel.format(selectionModel.getCurrentSelectedCount(), resultsCountLabel);
    });
  };
  /**
   * Get the title for a breadcrumb provider
   *
   * @function loadInContentBreadcrumbTitle
   * @memberOf NgServices.searchFilterService
   *
   * @param {String|Object} label - String label of the breadcrumb or an object with the source
   *            and key of the file to load it from.
   * @param {Number} totalResultCount - The number of results found
   * @param {Object} selectionModel - Selection model to check
   * @returns {String} bread crumb title
   */


  exports.loadInContentBreadcrumbTitle = function (label, totalResultCount, selectionModel) {
    // If no label is provided return the loading message
    var totalFound = appCtxService.getCtx('search.totalFound');
    var searchString = appCtxService.getCtx('search.criteria.searchString');
    var ctxSearchSearch = appCtxService.ctx.searchSearch;

    if (!label || totalFound === undefined) {
      return localeService.getLocalizedText('UIMessages', 'loadingMsg');
    }

    return $q.all({
      label: typeof label === 'string' ? $q.when(label) : localeService.getLocalizedText(label.source, label.key),
      xrtMessages: localeService.getTextPromise('XRTMessages'),
      uiMessages: localeService.getTextPromise('UIMessages')
    }).then(function (localizedText) {
      // If no results return the no results message
      if (totalResultCount === 0) {
        if (searchString) {
          if (ctxSearchSearch && ctxSearchSearch.searchStringSecondary && searchString === ctxSearchSearch.searchStringPrimary + ' AND ' + ctxSearchSearch.searchStringSecondary) {
            return localizedText.uiMessages.noSearchResultsWithInContentSearch.format(ctxSearchSearch.searchStringPrimary, ctxSearchSearch.searchStringSecondary);
          }

          return localizedText.uiMessages.noSearchResultsWithoutInContentSearch.format(searchString);
        }

        return localizedText.uiMessages.noSearchResults.format('', localizedText.label);
      }

      var resultsCountLabel;

      if (searchString) {
        if (ctxSearchSearch && ctxSearchSearch.searchStringSecondary && searchString === ctxSearchSearch.searchStringPrimary + ' AND ' + ctxSearchSearch.searchStringSecondary) {
          // define a variable so that the line length does not exceed 207 max-len...
          var labelText = localizedText.uiMessages.resultsCountLabelWithInContentSearch;
          resultsCountLabel = labelText.format(totalResultCount, ctxSearchSearch.searchStringPrimary, ctxSearchSearch.searchStringSecondary);
        } else {
          resultsCountLabel = localizedText.uiMessages.resultsCountLabelWithoutInContentSearch.format(totalResultCount, searchString);
        }
      } else {
        resultsCountLabel = localizedText.uiMessages.resultsCountLabel.format(totalResultCount, '', localizedText.label);
      } // If not in multiselect mode return the result count message


      if (!selectionModel || !selectionModel.multiSelectEnabled) {
        return resultsCountLabel;
      } // Otherwise return the selection count message


      return localizedText.xrtMessages.selectionCountLabel.format(selectionModel.getCurrentSelectedCount(), resultsCountLabel);
    });
  };
  /**
   * Set new filters based on the selection in the search breadcrumbs
   *
   * @function setFiltersFromCrumbs
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} crumbs - array of crumbs
   * @param {Number} indexBreadCrumb - The index of the selected breadcrumb
   */


  exports.setFiltersFromCrumbs = function (crumbs, indexBreadCrumb) {
    var newCrumbs = _.dropRightWhile(crumbs, function (c) {
      return c.indexBreadCrumb > indexBreadCrumb;
    });

    var filterMap = {};

    _.forEach(newCrumbs, function (c) {
      if (filterMap[c.internalName]) {
        filterMap[c.internalName].push(c.internalValue);
      } else {
        filterMap[c.internalName] = [c.internalValue];
      }
    });

    var searchContext = appCtxService.getCtx('search');
    var reqFilters = searchContext.reqFilters;

    if (reqFilters) {
      _.forEach(reqFilters, function (value, key) {
        if (filterMap[key]) {
          filterMap[key].push(value);
        } else {
          filterMap[key] = [value];
        }
      });
    }

    exports.setFilters(filterMap);
  };
  /**
   * Set the breadcrumb provider for the sublocations that only shows the root breadcrumb, e.g.,
   * Advanced Search where it may have its own message for "results found" and "no results found".
   *
   * @function displayNoBreadCrumbProvider
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} breadcrumbConfig - breadcrumb config
   * @param {String} label - The root message of breadcrumb
   * @param {Number} totalResultCount - The number of results found
   * @param {Object} searchCriteria - searchCriteria
   * @return {Object} The breadcrumb provider with the updated title *
   */


  exports.displayNoBreadCrumbProvider = function (breadcrumbConfig, label, totalResultCount, searchCriteria) {
    var provider = {};
    $q.all({
      noCriteriaSpecifiedMessage: localeService.getLocalizedText(breadcrumbConfig.noCriteriaSpecifiedMessage.source, breadcrumbConfig.noCriteriaSpecifiedMessage.key),
      noResultsFoundMessage: localeService.getLocalizedText(breadcrumbConfig.noResultsFoundMessage.source, breadcrumbConfig.noResultsFoundMessage.key),
      resultsFoundMessage: localeService.getLocalizedText(breadcrumbConfig.resultsFoundMessage.source, breadcrumbConfig.resultsFoundMessage.key)
    }).then(function (localizedText) {
      if (!searchCriteria) {
        provider.title = localizedText.noCriteriaSpecifiedMessage.format();
      } else if (totalResultCount === undefined || totalResultCount === 0) {
        provider.title = localizedText.noResultsFoundMessage.format(label);
      } else {
        provider.title = localizedText.resultsFoundMessage.format(label);
      }
    });
    return provider;
  };
  /**
   * Get a breadcrumb provider
   *
   * @function getBreadcrumbProvider
   * @memberOf NgServices.searchFilterService
   * @returns {Object} bread crumb provider
   */


  exports.getBreadcrumbProvider = function () {
    return {
      crumbs: [],
      clear: function clear() {
        // Publish to AW analytics
        var sanEvent = {
          sanAnalyticsType: 'Commands',
          sanCommandId: 'clearSearchFilter',
          sanCommandTitle: 'Clear All Search Filters'
        };
        analyticsSvc.logCommands(sanEvent);
        var searchContext = appCtxService.getCtx('search');
        var reqFilters = searchContext.reqFilters;

        if (reqFilters) {
          exports.setFilters(reqFilters);
        } else {
          exports.setFilters([]);
        }
      },
      onRemove: function onRemove(crumb) {
        // Publish to analytics
        var sanEvent = {
          sanAnalyticsType: 'Commands',
          sanCommandId: 'removeSearchFilterCrumb',
          sanCommandTitle: 'Remove Crumb Filter',
          sanCmdLocation: 'primarySearchPanel'
        };
        analyticsSvc.logCommands(sanEvent);

        if (crumb.filterType === 'RadioFilter') {
          exports.removeRadioSiteFilter(crumb.internalName, crumb.internalValue);
        } else {
          exports.addOrRemoveFilter(crumb.internalName, crumb.internalValue, false, crumb.filterType);
        }
      },
      onSelect: function onSelect(crumb) {
        // Publish to analytics
        var sanEvent = {
          sanAnalyticsType: 'Commands',
          sanCommandId: 'clickSearchFilterCrumb',
          sanCommandTitle: 'Click Search Filter Crumb',
          sanCmdLocation: 'primarySearchPanel'
        };
        analyticsSvc.logCommands(sanEvent);
        exports.setFiltersFromCrumbs(this.crumbs, crumb.indexBreadCrumb);
      }
    };
  };
  /**
   * Set breadcrumb Value
   *
   * @function setBreadcrumbValue
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} newBreadcrumb - newBreadcrumb
   */


  exports.setBreadcrumbValue = function (newBreadcrumb) {
    if (newBreadcrumb.internalValue && newBreadcrumb.internalValue !== '' && newBreadcrumb.internalValue === newBreadcrumb.value) {
      var searchContext = appCtxService.getCtx('searchSearch');

      if (searchContext && searchContext.originalInputCategories) {
        var categoryId = _.findIndex(searchContext.originalInputCategories, function (aCat) {
          return newBreadcrumb.internalName === aCat.internalName;
        });

        if (searchContext.originalInputCategories[categoryId] && searchContext.originalInputCategories[categoryId].filterValues) {
          if (searchContext.originalInputCategories[categoryId].filterValues.parentnodes) {
            var foundFilter = _.findIndex(searchContext.originalInputCategories[categoryId].filterValues.parentnodes, function (aFilter) {
              return newBreadcrumb.internalValue === aFilter.stringValue;
            });

            newBreadcrumb.value = searchContext.originalInputCategories[categoryId].filterValues.parentnodes[foundFilter].stringDisplayValue;
          }
        }
      }
    }
  };
  /**
   * Set breadcrumb display name
   *
   * @function setBreadcrumbDisplayName
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} newBreadcrumb - newBreadcrumb
   * @param {ObjectArray} categoriesDisplayed - categoriesDisplayed
   */


  exports.setBreadcrumbDisplayName = function (newBreadcrumb, categoriesDisplayed) {
    var foundCategory = _.findIndex(categoriesDisplayed, function (aCategory) {
      return aCategory === newBreadcrumb.displayName;
    });

    if (foundCategory < 0) {
      categoriesDisplayed.push(newBreadcrumb.displayName);
    } else {
      newBreadcrumb.displayName = '';
    }
  };
  /**
   * Set breadcrumb provider title
   *
   * @function setBreadcrumbProviderTitle
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} provider - provider
   * @param {String|Object} label - String label of the breadcrumb or an object with the source
   *            and key of the file to load it from.
   * @param {Number} totalResultCount - The number of results found
   * @param {Object} selectionModel - Selection model to check
   * @param {Object} secondarySearchEnabled - true if secondary search is enabled
   */


  exports.setBreadcrumbProviderTitle = function (provider, label, totalResultCount, selectionModel, secondarySearchEnabled) {
    exports.loadBreadcrumbClearTitle().then(function (result) {
      provider.clearBreadCrumb = result;
    }); // Load and set the title async

    if (secondarySearchEnabled) {
      exports.loadInContentBreadcrumbTitle(label, totalResultCount, selectionModel).then(function (result) {
        provider.title = result;
      });
    } else {
      exports.loadBreadcrumbTitle(label, totalResultCount, selectionModel).then(function (result) {
        provider.title = result;
      });
    }
  };
  /**
   * Build a breadcrumb provider
   *
   * @function buildBreadcrumbProvider
   * @memberOf NgServices.searchFilterService
   *
   * @param {Object} breadcrumbConfig - bread crumb configuration object
   * @param {String|Object} label - String label of the breadcrumb or an object with the source
   *            and key of the file to load it from.
   * @param {Number} totalResultCount - The number of results found
   * @param {Object} selectionModel - Selection model to check
   * @param {Object} searchFilterCategories - The potential categories for the filter
   * @param {Object} searchFilterMap - The search filter map
   * @param {Object} secondarySearchEnabled - true if secondary search is enabled
   * @param {Object} searchCriteria - searchCriteria
   * @returns {Object} bread crumb provider
   */


  exports.buildBreadcrumbProvider = function (breadcrumbConfig, label, totalResultCount, selectionModel, searchFilterCategories, searchFilterMap, secondarySearchEnabled, searchCriteria) {
    if (breadcrumbConfig && breadcrumbConfig.noBreadCrumb === 'true') {
      return exports.displayNoBreadCrumbProvider(breadcrumbConfig, label, totalResultCount, searchCriteria);
    }

    var provider = exports.getBreadcrumbProvider(); // For each of the current search params

    var searchParams = exports.getFilters(false, true, true, true);
    var categoriesDisplayed = [];
    var indexBreadCrumb = -1;

    _.map(searchParams, function (value, property) {
      // If it's a valid filter
      var index = _.findIndex(searchFilterCategories, function (o) {
        return o.internalName === property;
      });

      var newBreadcrumb = {};

      _.forEach(searchParams[property], function (filter) {
        var origProperty = property;
        var origFilter = filterPanelUtils.getRealFilterWithNoFilterType(filter);
        var filterType = filterPanelUtils.getFilterTypeFromFilterValue(filter);

        if (filter.hasOwnProperty('property')) {
          origProperty = filter.property;
          origFilter = filter.filter;
        }

        if (index > -1) {
          // Make a breadcrumb for it
          newBreadcrumb = {
            displayName: searchFilterCategories[index].displayName + ':',
            displayNameHidden: searchFilterCategories[index].displayName + ':',
            internalName: origProperty,
            internalValue: origFilter,
            filterType: filterType
          };
        } else if (!searchFilterCategories || searchFilterCategories && searchFilterCategories.length < 1) {
          // Need still display the crumbs
          var categoryDisplayName = exports.getCategoryDisplayName(property);

          if (!categoryDisplayName) {
            return provider;
          }

          newBreadcrumb = {
            displayName: categoryDisplayName + ':',
            displayNameHidden: categoryDisplayName + ':',
            internalName: property,
            internalValue: origFilter,
            filterType: filterType
          };
        } else {
          return provider;
        }

        newBreadcrumb.value = exports.getBreadCrumbDisplayValue(searchFilterMap[origProperty], origFilter);

        if (newBreadcrumb.value && newBreadcrumb.value !== '') {
          exports.setBreadcrumbValue(newBreadcrumb);
          exports.setBreadcrumbDisplayName(newBreadcrumb, categoriesDisplayed);
          newBreadcrumb.indexBreadCrumb = ++indexBreadCrumb;
          provider.crumbs.push(newBreadcrumb);
        }

        if (newBreadcrumb.internalName === OWNING_SITE) {
          newBreadcrumb.filterType = 'RadioFilter';
        }
        /* the OwningSite.owning_site is a property which server side filters on to return local or remote objects.
        This property does not exists in DB. It's a hardcoded value that server side expects and returns.*/


        if (newBreadcrumb.internalName === OWNING_SITE && newBreadcrumb.internalValue === _local) {
          newBreadcrumb.showRemoveButton = false;
        } else {
          newBreadcrumb.showRemoveButton = true;
        }
      });
    });

    exports.setBreadcrumbProviderTitle(provider, label, totalResultCount, selectionModel, secondarySearchEnabled);
    return provider;
  }; // Return display name for a category


  exports.getCategoryDisplayName = function (property) {
    var categoryDisplayName = ''; // first check if it can be found in the prior search.

    var context = appCtxService.getCtx('searchSearch');

    if (context && context.originalInputCategories && context.originalInputCategories.length > 0) {
      var index = _.findIndex(context.originalInputCategories, function (o) {
        return o.internalName === property;
      });

      if (index > -1) {
        categoryDisplayName = context.originalInputCategories[index].displayName;
        return categoryDisplayName;
      }
    }

    var cmm = app.getInjector().get('soa_kernel_clientMetaModel');
    var aTypeProperty = property.split('.');

    if (aTypeProperty && aTypeProperty.length === 2) {
      var type = cmm.getType(aTypeProperty[0]);

      if (!type) {
        // Category.category
        var catName = aTypeProperty[1];
        categoryDisplayName = catName[0].toUpperCase() + catName.slice(1).toLowerCase();
      } else {
        var propName = filterPanelUtils.getPropertyFromFilter(aTypeProperty[1]);
        var pd = type.propertyDescriptorsMap[propName];

        if (!pd) {
          categoryDisplayName = aTypeProperty[1];
        } else {
          categoryDisplayName = pd.displayName;
        }
      }
    }

    return categoryDisplayName;
  };
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * @memberof NgServices
   * @member searchFilterService
   */


  app.factory('searchFilterService', ['$state', '$q', 'localeService', 'appCtxService', 'filterPanelUtils', 'soa_kernel_clientDataModel', function ($state_, $q_, localeService_, appCtxService_, filterPanelUtils_, cdm_) {
    $state = $state_;
    $q = $q_;
    localeService = localeService_;
    appCtxService = appCtxService_;
    filterPanelUtils = filterPanelUtils_;
    cdm = cdm_;
    localeService.getTextPromise('SearchMessages').then(function (localTextBundle_) {
      localTextBundle = localTextBundle_;
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'searchFilterService'
  };
});