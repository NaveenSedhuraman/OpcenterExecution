"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/aw.secondarySearch.service
 * @requires js/filterPanelUtils
 */
define(['app', 'angular', 'js/appCtxService', 'js/aw.searchFilter.service'], function (app) {
  'use strict';

  var exports = {};
  var $state = null;
  var appCtxService = null;
  var _searchFilterSvc = null;
  /**
   * Do an in-content search and keep the existing filters
   *
   * @function doInContentSearchKeepFilter
   * @memberOf NgServices.searchFilterService
   *
   * @param {String} targetState - Name of the state to go to. Defaults to '.' (current state)
   * @param {String} searchCriteria - secondary search criteria
   * @param {String} shapeSearchProviderActive - Whether we are executing search within shapeSearchProvider
   * @param {String} savedSearchUid - Uid of saved search used to determine if we are executing search while in context of the saved search
   */

  exports.doInContentSearchKeepFilter = function (targetState, searchCriteria, shapeSearchProviderActive, savedSearchUid) {
    // If we are in Shape Search or Saved Search context we do not want to keep the filters related to
    // either when we perform this search.
    var finalSearchCriteria = searchCriteria;
    var ctxSearchSearch = appCtxService.ctx.searchSearch;
    var ctxCriteria = appCtxService.ctx.search.criteria;

    if (ctxCriteria && ctxCriteria.searchString) {
      if (!ctxSearchSearch.searchStringSecondary && (searchCriteria === '' || searchCriteria.trim() === '')) {
        return;
      } // the searchCriteria that's passed in is secondary searchString and should be stored as such.


      if (ctxSearchSearch.searchStringSecondary) {
        // already has secondary searchString, this is to revise the secondary searchString
        if (searchCriteria === '' || searchCriteria.trim() === '') {
          finalSearchCriteria = ctxSearchSearch.searchStringPrimary;
          delete ctxSearchSearch.searchStringPrimary;
          delete ctxSearchSearch.searchStringSecondary;
          appCtxService.updateCtx('searchSearch', ctxSearchSearch);
        } else {
          ctxSearchSearch.searchStringSecondary = searchCriteria;
          finalSearchCriteria = ctxSearchSearch.searchStringPrimary + ' AND ' + ctxSearchSearch.searchStringSecondary;
        }
      } else {
        // first time secondary searchString
        ctxSearchSearch.searchStringPrimary = ctxCriteria.searchString;
        ctxSearchSearch.searchStringSecondary = searchCriteria;
        finalSearchCriteria = ctxSearchSearch.searchStringPrimary + ' AND ' + ctxSearchSearch.searchStringSecondary;
      }
    } else {
      // it's from non-Search location where the passed in searchCriteria is the final searchString
      finalSearchCriteria = searchCriteria;
    }

    if (shapeSearchProviderActive === 'true' || savedSearchUid && savedSearchUid !== null) {
      $state.go(targetState ? targetState : '.', {
        filter: _searchFilterSvc.buildFilterString(_searchFilterSvc.getFilters(false, undefined, undefined, undefined, true)),
        searchCriteria: finalSearchCriteria
      });
    } else {
      $state.go(targetState ? targetState : '.', {
        filter: _searchFilterSvc.buildFilterString(_searchFilterSvc.getFilters(false)),
        searchCriteria: finalSearchCriteria
      });
    }
  };
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * @memberof NgServices
   * @member secondarySearchService
   */


  app.factory('secondarySearchService', ['$state', 'appCtxService', 'searchFilterService', function ($state_, appCtxService_, searchFilterSvc) {
    $state = $state_;
    appCtxService = appCtxService_;
    _searchFilterSvc = searchFilterSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'secondarySearchService'
  };
});