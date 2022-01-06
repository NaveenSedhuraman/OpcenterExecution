"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 requirejs
 */

/**
 * Service to manage native contributions using a registry object generated at build time. Uses requirejs to load pieces
 * defined in the registry on demand. Also defines the {@link NgServices.contributionService} which is accessible
 * through injection.
 *
 * @module js/contribution.service
 */
define(['app', 'lodash', 'Debug', 'js/logger', 'js/configurationService', 'config/contributions'], //
function (app, _, Debug, logger, cfgSvc) {
  'use strict';

  var trace = new Debug('contributionService');
  /**
   * Service to manage native contributions using a registry object generated at build time.
   *
   * @memberOf NgServices
   */

  app.service('contributionService', ['$q', '$injector', 'configurationService', function ($q, $injector, cfgSvc2) {
    var self = this;
    /**
     * Load the set of contributions that are mapped to the given key string.
     *
     * Each contribution should return a function. The function will be called with the key of the contribution
     * and a promise to resolve with the object. With this method contributions have the ability to get the
     * contribution dynamically instead of returning a static object.
     *
     * @param {String} key - The key that the contribution is mapped to
     * @return {Promise} A promise containing the objects that have been contributed.
     */

    self.require = function (key) {
      return cfgSvc2.getCfg('contributions').then(function (contributionProviders) {
        if (contributionProviders[key]) {
          return $q(function (resolve) {
            // Allow requirejs to manage the caching / registry
            trace('Loading contributions', key);
            requirejs(contributionProviders[key], function handleLoadedContribution() {
              trace('Contribution load complete', key); // Create a promise for each contribution function

              var promises = []; // Number of arguments is not known so have parse manually as array

              _.forEach(Array.prototype.slice.call(arguments), function (arg, index) {
                if (_.isFunction(arg)) {
                  var deferredLp = $q.defer();
                  arg(key, deferredLp, $injector);
                  promises.push(deferredLp.promise);
                } else {
                  logger.error(contributionProviders[key][index] + ' did not return a contribution function');
                }
              }); // And resolve the main promise once all are resolved


              resolve($q.all(promises));
            });
          });
        }

        logger.trace(key + ' not found in contribution registry');
        return [];
      });
    };
  }]);
  var exports = {};
  /**
   * Support a callback based pattern when angular is not loaded. This should only be used before the angular start.
   *
   * Async contributions are not supported with this pattern, so any contributions that support this method must
   * return the value directly.
   *
   * @param {String} key - The key that the contribution is mapped to
   * @param {Function} callback - A callback to call with the newly loaded contributions
   */

  exports.require = function (key, callback) {
    // The following fallback is to support the bootstrap usage.
    var contributionProviders = cfgSvc.getCfgCached('contributions');

    if (contributionProviders[key]) {
      // Allow requirejs to manage the caching / registry
      requirejs(contributionProviders[key], function () {
        var result = []; // Number of arguments is not known so have parse manually as array

        _.forEach(Array.prototype.slice.call(arguments), function (arg, index) {
          if (_.isFunction(arg)) {
            result.push(arg(key));
          } else {
            logger.error(contributionProviders[key][index] + ' did not return a contribution function');
          }
        });

        callback(result);
      });
    } else {
      logger.trace(key + ' not found in contribution registry');
      callback([]);
    }
  };

  return exports;
});