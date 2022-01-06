"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/awDuiLocalizationService
 */
define(['app', 'lodash', 'js/eventBus', 'js/localeService'], function (app, _, eventBus) {
  'use strict';
  /**
   * Cached reference to the angular $q or promise service
   *
   * @private
   */

  var _$q;
  /**
   * cached reference to the _locale service
   *
   * @private
   */


  var _localeSvc;
  /**
   * cached reference to the processed i18n map
   *
   * @private
   */


  var _cachedI18nMap = {};
  var exports = {};
  /**
   * When notified that the i18n has changed clear out the cache.
   *
   * This will make any following calls to the i18n provider call the configuration service again
   */

  eventBus.subscribe('configurationChange.i18n', function () {
    _cachedI18nMap = {};
  });
  /**
   * Populate I18n map.
   *
   * @param {Object} i18nObjects - I18n data from ViewModel json
   * @param {String} cacheI18nKey - (Optional) Key value which refers to processed i18n in cached i18n Map.
   * @returns {Promise} an angular promise
   */

  exports.populateI18nMap = function (i18nObjects, cacheI18nKey) {
    var deferred = _$q.defer();

    if (!i18nObjects) {
      deferred.resolve();
    }

    var i18n = {};
    var allPromises = [];
    /**
     * Only cache processed i18n, when there is a cacheI18nKey defined
     */

    if (cacheI18nKey && _.isString(cacheI18nKey)) {
      if (!_cachedI18nMap[cacheI18nKey]) {
        for (var key2 in i18nObjects) {
          var promise2 = getLocalizedText(key2, i18nObjects[key2]);
          then(i18n, key2, promise2);
          allPromises.push(promise2);
        }

        _$q.all(allPromises).then(function () {
          _cachedI18nMap[cacheI18nKey] = i18n;
          deferred.resolve(i18n);
        });
      } else {
        deferred.resolve(_cachedI18nMap[cacheI18nKey]);
      }
    } else {
      for (var key in i18nObjects) {
        var promise = getLocalizedText(key, i18nObjects[key]);
        then(i18n, key, promise);
        allPromises.push(promise);
      }

      _$q.all(allPromises).then(function () {
        deferred.resolve(i18n);
      });
    }

    return deferred.promise;
  };
  /**
   * A helper method to attach a then(...) to provided promise
   *
   * @param {Object} i18n - The object holding i18n key object map
   * @param {String} key - The key into key map
   * @param {Promise} promise - AngularJS promise object
   */


  var then = function then(i18n, key, promise) {
    promise.then(function (localizedText) {
      i18n[key] = localizedText;
    });
  };
  /**
   * Get a localized text for provided text from provided bundles
   *
   * @param {String} englishText - Key for lookup
   * @param {String|StringArray} bundles - Bundle(s) to look in.
   *
   * @returns {Promise} A promise resolved with the bundle object once loaded.
   */


  var getLocalizedText = function getLocalizedText(englishText, bundles) {
    var deferred = _$q.defer();

    if (_.isArray(bundles)) {
      getLocalizedTextFormBundlesRecursively(englishText, bundles.slice(0), deferred);
    } else {
      // to support inline localization text
      deferred.resolve(bundles);
    }

    return deferred.promise;
  };
  /**
   * Get a localized text for provided text from provided bundles, recursively if not found in previous bundle.
   *
   * @param {String} englishText - Key for lookup
   * @param {String|StringArray} bundles - Bundle(s) to look in.
   * @param {DeferredAction} deferred - Resolved then bundle object is loaded.
   */


  var getLocalizedTextFormBundlesRecursively = function getLocalizedTextFormBundlesRecursively(englishText, bundles, deferred) {
    if (bundles.length === 0) {
      deferred.resolve();
    } else {
      getLocalizedTextFromOneBundle(englishText, bundles.shift()).then(function (localizedText) {
        if (localizedText !== undefined) {
          deferred.resolve(localizedText);
        } else {
          getLocalizedTextFormBundlesRecursively(englishText, bundles, deferred);
        }
      });
    }
  };
  /**
   * Get a localized text for provided text from provided bundle.
   *
   * @param {String} englishText - Key for lookup
   * @param {String} bundle - Bundle to look in.
   *
   * @returns {Promise} A promise resolved with the bundle object once loaded.
   */


  var getLocalizedTextFromOneBundle = function getLocalizedTextFromOneBundle(englishText, bundle) {
    return _localeSvc.getLocalizedText(bundle, englishText);
  };
  /**
   * @memberof NgServices
   * @member awDuiLocalizationService
   *
   * @param {$q} $q - Service to use.
   * @param {localeService} localeSvc - Service to use.
   *
   * @returns {awDuiLocalizationService} Instance of the service API object.
   */


  app.factory('awDuiLocalizationService', [//
  '$q', //
  'localeService', //
  function ($q, localeSvc) {
    _$q = $q;
    _localeSvc = localeSvc;
    return exports;
  }]);
});