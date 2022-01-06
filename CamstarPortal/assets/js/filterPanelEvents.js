"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/filterPanelEvents
 */
define(['app', 'jquery', 'lodash', 'js/eventBus', 'js/analyticsService', 'js/appCtxService', 'js/dateTimeService', 'js/uwPropertyService', 'js/uwDirectiveDateTimeService', 'js/messagingService', 'js/localeService', 'js/filterPanelUtils', 'js/aw.searchFilter.service'], //
function (app, $, _, eventBus, analyticsSvc) {
  'use strict';

  var exports = {};
  var _filterPanelUtils = null;
  var _appCtxService = null;
  var _searchFilterSvc = null;
  /**
   * publish event to select category header
   *
   * @function selectCategory
   * @memberOf filterPanelEvents
   *
   * @param {Object}category - filter category
   *
   */

  exports.selectCategory = function (category) {
    var propValues = _filterPanelUtils.getPropGroupValues(category);

    var context = {
      source: 'filterPanel',
      currentCategory: category.currentCategory,
      internalPropertyNameToGroupOn: category.internalName,
      propGroupingValues: propValues,
      category: category
    };

    var ctx = _appCtxService.getCtx('searchResponseInfo');

    if (ctx) {
      ctx.objectsGroupedByProperty.groupedObjectsMap = null;
      ctx.propGroupingValues = propValues;
      ctx.objectsGroupedByProperty.internalPropertyName = category.internalName;

      _appCtxService.updateCtx('searchResponseInfo', ctx);
    }

    var searchCurrentFilterCategories = _appCtxService.getCtx('searchResponseInfo.searchCurrentFilterCategories');

    if (searchCurrentFilterCategories === undefined) {
      exports.rememberCategoryFilterState(context);
    }

    eventBus.publish('selectCategoryHeader', context);
  };
  /**
   * publish event to select hierarchy category
   *
   * @function selectHierarchyCategory
   * @memberOf filterPanelEvents
   *
   * @param {Object}category - filter category
   *
   */


  exports.selectHierarchyCategory = function (category) {
    // if there is a hierarchy filter selected, clear it. Otherwise do the default category selection
    if (!_.isUndefined(category.filterValues.parentnodes[0]) && category.filterValues.parentnodes[0].selected) {
      var interName = _filterPanelUtils.INTERNAL_OBJECT_FILTER + category.filterValues.parentnodes[0].stringValue;

      _searchFilterSvc.addOrRemoveFilter(category.internalName, interName, undefined, 'ObjectFilter');
    } else {
      // Nothing selected, trigger the default category selection logic.
      exports.selectCategory(category);
    }
  };
  /**
   * publish event to select Hierarhcy filter
   *
   * @function selectHierarchyFilter
   * @memberOf filterPanelEvents
   *
   * @param {Object} category - the category of the selected filter
   * @param {Object} node - the selected hierarhcy node (same structure as search filter)
   */


  exports.selectHierarchyFilter = function (category, node) {
    var interName = _filterPanelUtils.INTERNAL_OBJECT_FILTER + node.stringValue;
    /*
     * The logic in 'filterSelected' is to handle the case when the user has selected the current parent node.
     * 'isLast' is used to determine if the user has clicked the parent node. In this case we want to deselect the
     * filter. Setting 'selected' to true forces the 'clearFilter' method to be called in
     * SearchFilterCommandHandler.java
     */

    if (node.isLast || node.selected) {
      _searchFilterSvc.addOrRemoveFilter(category.internalName, interName, undefined, 'ObjectFilter');
    } else if (!node.selected) {
      _searchFilterSvc.addOrRemoveFilter(category.internalName, interName, true, 'ObjectFilter');
    }
  };
  /**
   * publish event to select filter
   *
   * @function selectFilter
   * @memberOf filterPanelEvents
   *
   * @param {Object} category - the category of the selected filter
   * @param {Object} filter - the selected filter
   */


  exports.selectFilter = function (category, filter) {
    _filterPanelUtils.updateFiltersInContext(category, filter);

    var categoryName = filter.categoryName ? filter.categoryName : category.internalName;
    var interName = filter.internalName;

    if (category.type === 'NumericFilter') {
      interName = _filterPanelUtils.INTERNAL_NUMERIC_FILTER + filter.internalName;
    }

    var searchCurrentFilterCategories = _appCtxService.getCtx('searchResponseInfo.searchCurrentFilterCategories');

    if (searchCurrentFilterCategories === undefined) {
      var context = {
        category: category
      };
      exports.rememberCategoryFilterState(context);
    } // Get the active filters


    var newParams = _searchFilterSvc.getFilters(); // Check if the filter already exists to determine if adding or removing filter


    var idx = newParams[categoryName] ? newParams[categoryName].indexOf(interName) : -1; // Publish filter panel event to AW analytics

    var sanEvent = {};
    sanEvent.sanAnalyticsType = 'Commands'; // Null filter would also return -1 for index so make sure a filter is specified

    if (idx === -1 && interName) {
      sanEvent.sanCommandId = 'addSearchFilter';
      sanEvent.sanCommandTitle = 'Add Search Filter';
    } else {
      sanEvent.sanCommandId = 'removeSearchFilter';
      sanEvent.sanCommandTitle = 'Remove Search Filter';
    }

    sanEvent.sanCmdLocation = 'primarySearchPanel'; // Publish event to AW analytics

    analyticsSvc.logCommands(sanEvent);

    _searchFilterSvc.addOrRemoveFilter(categoryName, interName, undefined, category.type);
  };
  /**
   * publish event to select date range
   *
   * @function selectDateRange
   * @memberOf filterPanelEvents
   *
   * @param {Object} category - the category of the selected filter
   */


  exports.selectDateRange = function (category) {
    var startValue = category.daterange.startDate.dateApi.dateObject;
    var endValue = category.daterange.endDate.dateApi.dateObject;

    var internalName = _filterPanelUtils.getDateRangeString(startValue, endValue);

    _searchFilterSvc.addOrRemoveFilter(category.internalName, internalName, undefined, 'DateRange');
  };
  /**
   * publish event to select numeric range
   *
   * @function selectNumericRange
   * @memberOf filterPanelEvents
   *
   * @param {Object} category - the category of the selected filter
   */


  exports.selectNumericRange = function (category) {
    var startRange = parseFloat(category.numericrange.startValue.dbValue);

    if (isNaN(startRange)) {
      startRange = undefined;
    }

    var endRange = parseFloat(category.numericrange.endValue.dbValue);

    if (isNaN(endRange)) {
      endRange = undefined;
    }

    if (_filterPanelUtils.checkIfValidRange(category, startRange, endRange)) {
      var internalName = _filterPanelUtils.getNumericRangeString(startRange, endRange);

      _searchFilterSvc.addOrRemoveFilter(category.internalName, internalName, undefined, 'NumericRange');
    }
  };
  /**
   * put the current category's expand/show more/etc into context
   *
   * @function rememberCategoryFilterState
   * @memberOf filterPanelEvents
   *
   * @param {Object} context - context
   */


  exports.rememberCategoryFilterState = function (context) {
    var searchCurrentFilterCategories = _appCtxService.getCtx('searchResponseInfo.searchCurrentFilterCategories');

    if (searchCurrentFilterCategories === undefined) {
      searchCurrentFilterCategories = [];

      var ctx = _appCtxService.getCtx('searchResponseInfo');

      if (ctx) {
        searchCurrentFilterCategories.push(context.category);
        ctx.searchCurrentFilterCategories = searchCurrentFilterCategories;

        _appCtxService.updateCtx('searchResponseInfo', ctx);
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

      _appCtxService.updatePartialCtx('searchResponseInfo.searchCurrentFilterCategories', searchCurrentFilterCategories);
    }
  };
  /**
   *
   * @memberof NgServices
   * @member filterPanelEvents
   * @param {appCtxService} appCtxService - Service to use.
   * @param {dateTimeService} dateTimeService - Service to use.
   * @param {messagingService} messagingService - Service to use.
   * @param {localeService} localeSvc - Service to use.
   * @param {filterPanelUtils} filterPanelUtils - Service to use.
   * @param {searchFilterService} searchFilterSvc - Service to use.
   * @returns {exports} Instance of this service.
   */


  app.factory('filterPanelEvents', ['appCtxService', 'dateTimeService', 'messagingService', 'localeService', 'filterPanelUtils', 'searchFilterService', function (appCtxService, dateTimeService, messagingService, localeSvc, filterPanelUtils, searchFilterSvc) {
    _filterPanelUtils = filterPanelUtils;
    _appCtxService = appCtxService;
    _searchFilterSvc = searchFilterSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'filterPanelEvents'
  };
});