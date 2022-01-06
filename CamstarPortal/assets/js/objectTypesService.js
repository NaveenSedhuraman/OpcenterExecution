"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to query recent model types and available model types form server
 *
 * @module js/objectTypesService
 */
define(['app', 'lodash', 'js/logger', //
'soa/preferenceService', 'soa/kernel/soaService'], function (app, _, logger) {
  'use strict';

  var exports = {};
  var _$q = null;

  var _prefSvc;

  var _soaSvc;

  var _prefMap = null;
  var MRU_MODEL_TYPES_PREFERENCE = 'Create_WORKSPACE_OBJECT_mru_list';
  var MAX_NUMBER_OF_MRU_MODEL_TYPES_PREFERENCE = 'Create_WorkspaceObject_mru_max';
  var DEFAULT_MRU_MAX = 5;
  /**
   * Get the most recent used types.
   *
   * @param {Number} maxRecentCountIn - max recent count
   * @return {Promise} promise object
   */

  exports.getRecentModelTypes = function (maxRecentCountIn) {
    return _prefSvc.getMultiStringValues([MRU_MODEL_TYPES_PREFERENCE, MAX_NUMBER_OF_MRU_MODEL_TYPES_PREFERENCE]).then(function (prefs) {
      _prefMap = prefs;
      var maxRecent = maxRecentCountIn;

      if (!maxRecent || !_.isNumber(maxRecent)) {
        maxRecent = DEFAULT_MRU_MAX;
        var maxRecentTypeCount = prefs[MAX_NUMBER_OF_MRU_MODEL_TYPES_PREFERENCE];

        if (maxRecentTypeCount && maxRecentTypeCount.length > 0) {
          try {
            maxRecent = parseInt(maxRecentTypeCount[0]);
          } catch (exception) {
            logger.error('Invalid Create_WorkspaceObject_mru_max preference value.');
          }
        }
      }

      var recentUsedTypeNames = prefs[MRU_MODEL_TYPES_PREFERENCE];

      var recentTypesToLoad = _.uniq(recentUsedTypeNames).slice(0, maxRecent);

      return _soaSvc.ensureModelTypesLoaded(recentTypesToLoad).then(function () {
        return recentTypesToLoad;
      });
    });
  };
  /**
   * Update the recent model types preference
   *
   * @return {Object} the promise object
   */


  exports.updateRecentModelTypes = function (recentTypeName) {
    if (!recentTypeName) {
      return null;
    }

    var existingMruTypeNames = null;

    if (_prefMap) {
      existingMruTypeNames = _prefMap[MRU_MODEL_TYPES_PREFERENCE];
    }

    var mruTypeNames = [];
    mruTypeNames.push(recentTypeName);

    if (existingMruTypeNames) {
      mruTypeNames = _.union(mruTypeNames, existingMruTypeNames);
    }

    mruTypeNames = _.uniq(mruTypeNames);
    return _prefSvc.setStringValue(MRU_MODEL_TYPES_PREFERENCE, mruTypeNames);
  };
  /**
   * This service performs actions to retrieve data
   *
   * @memberof NgServices
   * @member objectTypesService
   */


  app.factory('objectTypesService', //
  ['$q', 'soa_preferenceService', 'soa_kernel_soaService', //
  function ($q, prefSvc, soaSvc) {
    _$q = $q;
    _prefSvc = prefSvc;
    _soaSvc = soaSvc;
    return exports;
  }]);
});