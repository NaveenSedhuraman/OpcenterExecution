"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/configuration#adding-new-configuration-point|Adding new configuration point}
 *
 * @module js/configurationService
 * @publishedApolloService
 */
define(['app', 'lodash', 'config/configurationMap', 'js/eventBus', 'js/localStorage'], function (app, _, configMap, eventBus) {
  'use strict';
  /**
   * Map of base config file to promise for retrieving JSON file.
   *
   * @type {Object}
   * @private
   */

  var _ongoing = {};
  var exports = {
    config: {},
    map: configMap
  };
  /**
   * @param {Path} path - path
   * @param {Object} data - Value to set at the 'path' location in the configuration.
   * @ignore
   */

  exports.add = function (path, data) {
    _.set(exports.config, path, data);
  };
  /**
   * Get cached configuration data.
   * This is only intended to be used by the bootstrap prior to NG module initialization.
   *
   * @param {String} path - path
   * @return {Object} request value if already cached
   * @ignore
   */


  exports.getCfgCached = function (path) {
    return _.get(exports.config, path);
  };
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * @memberof NgServices
   * @member configurationService
   *
   * @returns {configurationService} Reference to the service API object.
   */


  app.factory('configurationService', ['$q', '$http', 'localStorage', function ($q, $http, localStorage) {
    /**
     * @param {Object} obj1 - base object
     * @param {Object} obj2 - object merge into base object
     */
    function merge(obj1, obj2) {
      _.forEach(obj2, function (value, key) {
        if (!obj1[key]) {
          obj1[key] = value;
        } else {
          if (value && _typeof(value) === 'object' && !Array.isArray(value)) {
            merge(obj1[key], value);
          } else {
            obj1[key] = value;
          }
        }
      });
    }

    if (localStorage) {
      localStorage.subscribe('configurationChange', function (data) {
        var eventData = JSON.parse(data.newValue);
        notifyConfigChange(eventData.path, false);
      });
    }
    /**
     * Notify that a configuration piece has changed and the local cache should be cleared
     *
     * @param {String} path Name of the Configuration (e.g. 'solutionDef')
     * @param {Boolean} updateLocalStorage Whether to update local storage. Defaults to true.
     * @static
     */


    var notifyConfigChange = function notifyConfigChange(path, updateLocalStorage) {
      if (updateLocalStorage !== false) {
        localStorage.publish('configurationChange', JSON.stringify({
          path: path,
          date: Date.now()
        }));
      }

      var root = path.split('.')[0];
      delete exports.config[root];
      eventBus.publish('configurationChange.' + root, {
        path: path
      });
    };
    /**
     * Get configuration data for specified configuration path.
     *
     * @param {String} path Name of the Configuration (e.g. 'solutionDef')
     * @param {boolean} noCache Do not use cache
     * @return {Promise} promise This would resolve to configuration json
     * @static
     */


    var getCfg = function getCfg(path, noCache) {
      var ndx = path.indexOf('.');
      var basePath = ndx > -1 ? path.substring(0, ndx) : path;

      if (!noCache && (_.has(exports.config, path) || !(exports.map.bundle[basePath] || exports.map.default[basePath]) && _.has(exports.config, basePath))) {
        return $q.resolve(exports.getCfgCached(path));
      }

      var assetsPath = 'config/' + basePath;
      var mergePath;

      if (_.has(exports.map.bundle, path)) {
        assetsPath = 'config/' + _.get(exports.map.bundle, path);
        mergePath = basePath;
      } else if (exports.map.default[basePath]) {
        mergePath = path;
        assetsPath = exports.map.default[basePath].replace(/\*/, path.replace(/\./g, '/'));
      }

      if (!_ongoing[assetsPath]) {
        var httpGetPath = app.getBaseUrlPath() + '/' + assetsPath + '.json';
        _ongoing[assetsPath] = $http.get(httpGetPath).then(function (response) {
          if (response && response.data) {
            var mergePoint = exports.config;

            if (mergePath) {
              mergePath.split('.').forEach(function (elem) {
                if (!mergePoint[elem]) {
                  mergePoint[elem] = {};
                }

                mergePoint = mergePoint[elem];
              });
            }

            merge(mergePoint, response.data);
          }

          delete _ongoing[assetsPath]; // not needed any more

          return exports.getCfgCached(path);
        });
      }

      return $q(function (resolve, reject) {
        _ongoing[assetsPath].then(function () {
          resolve(exports.getCfgCached(path));
        }, reject);
      });
    };

    return {
      getCfg: getCfg,
      notifyConfigChange: notifyConfigChange,
      isDarsiEnabled: function isDarsiEnabled() {
        return exports.map.darsiEnabled;
      }
    };
  }]);

  exports.notifyConfigChange = function () {// notifyConfigChange is not usable outside of the Angular service due to local storage dependency
    // This is necessary because audit tooling is unable to handle file that exports methods using Angular and RequireJS
  };

  exports.moduleServiceNameToInject = 'configurationService';
  return exports;
});