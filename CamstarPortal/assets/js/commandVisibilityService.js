"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service is used to manage command visibility.
 *
 * @module js/commandVisibilityService
 */
define(['app', 'js/declUtils', 'lodash', 'js/eventBus', 'js/logger', 'js/configurationService', 'js/appCtxService', 'js/functionalUtility.service'], function (app, declUtils, _, eventBus, logger) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * @memberof NgServices
   * @member commandVisibilityService
   */

  app.factory('commandVisibilityService', ['$q', '$injector', '$timeout', 'configurationService', 'appCtxService', 'functionalUtilityService', function CommandVisibilityService($q, $injector, $timeout, configurationService, appCtxService, functional) {
    var exports = {};
    /**
     * Get any usages of "visibleServerCommands" context from the condition string
     *
     * @param {String} s The string condition to check
     * @return {String[]} Values in visibleServerCommands that are checked
     */

    exports.getServerConditions = function (s) {
      var re = /ctx\.visibleServerCommands\.([a-zA-Z]\w*)(\W*|$)/g;
      var result = [];
      var m = re.exec(s);

      while (m) {
        result.push(m[1]);
        m = re.exec(s);
      }

      return result;
    };
    /**
     * Get the commands that have server visibility
     *
     * @param {Object} commandsViewModel (Optional) Commands view model to check for server visibility. Uses main CVM if not provided.
     * @returns {Promise} Promise that will contain the map of command ids
     */


    exports.getServerVisibleCommands = function (commandsViewModel) {
      return (commandsViewModel ? $q.resolve(commandsViewModel) : configurationService.getCfg('commandsViewModel')).then(function (viewModelJson) {
        // Get the actual condition expressions
        var conditions = _.map(viewModelJson.conditions, function (cond) {
          return cond.expression;
        }); // Get all of the command ids referenced from a string based condition


        var conditionStrings = conditions.filter(function (cond) {
          return typeof cond === 'string';
        });
        /**
         * Checking the entire object recursively using condition string parsing works for all existing usages
         *
         * It will not work for nested queries such as
         * {
         *     $source: 'ctx.visibleServerCommands',
         *     $query: {
         *         $source: 'MyCommandId',
         *         $query: {
         *             $eq: true
         *         }
         *     }
         * }
         * Hopefully that format is not used as it would make detecting server visible commands much more difficult
         */

        var conditionObjects = conditions.filter(function (cond) {
          return _typeof(cond) === 'object';
        });

        for (var i = 0; i < conditionObjects.length; i++) {
          var nxt = conditionObjects[i];

          if (nxt) {
            Object.keys(nxt).forEach(function (key) {
              var val = nxt[key];

              if (typeof val === 'string') {
                // If value is a string it just needs to be checked like a normal condition
                conditionStrings.push(val);
              } else if (_typeof(val) === 'object') {
                // If value is an object it needs to be recursed on
                conditionObjects.push(val);
              }
            });
          }
        }

        return conditionStrings.map(exports.getServerConditions).reduce(functional.concat).reduce(functional.toBooleanMap, {});
      });
    };
    /**
     * Get the delegate command visibility service.
     *
     * @return {Promise} Promise that will be resolved with the delegate service
     */


    exports.getDelegateService = function () {
      return configurationService.getCfg('solutionDef').then(function (solutionDef) {
        if (solutionDef.commandVisibility) {
          return declUtils.getDependentModule(solutionDef.commandVisibility, $injector) || declUtils.loadDependentModule(solutionDef.commandVisibility, $q, $injector);
        }

        return $q.reject('No command visibility service configured');
      });
    };
    /**
     * Start a command visibility service designed to work with previous background pattern instead of loading on demand
     *
     * @param {Service} delegateService The delegate service to start in the background
     * @returns {Promise} promise resolve when done setting up
     */


    var initializeDelegateService = function initializeDelegateService(delegateService) {
      return exports.getServerVisibleCommands().then(function (serverVisibleCommands) {
        var eventSubDefs = []; // Set context - sorted to make it look nicer

        appCtxService.registerCtx('commandsWithServerVisibility', Object.keys(serverVisibleCommands).sort()); // Initialize the delegate service

        delegateService.init();
        /**
         * Debounced function to update visibleServerCommands context
         */

        var evaluateCommandVisibility = _.debounce(function () {
          return delegateService.getVisibleCommands().then(function (visibleCommands) {
            appCtxService.updateCtx('visibleServerCommands', visibleCommands);
          }, function () {
            appCtxService.updateCtx('visibleServerCommands', {});
          });
        }, 5, {
          trailing: true,
          leading: false
        });
        /**
         * Function to handle context changes
         *
         * @param {Object} contextData - Context data
         */


        var contextChangeHandler = function contextChangeHandler(contextData) {
          if (delegateService.hasCommandContextChanged(contextData)) {
            evaluateCommandVisibility();
          }
        };
        /**
         * Do initial update immediately
         *
         * Timeout has been removed - application specific service now decides when to call SOA
         */


        contextChangeHandler({
          name: 'mselected',
          value: appCtxService.getCtx('mselected')
        });
        /**
         * Global subscriber for command context update. Triggers server command visibility checks.
         */

        eventSubDefs.push(eventBus.subscribe('appCtx.register', contextChangeHandler));
        /**
         * Global subscriber for command context update. Triggers server command visibility checks.
         */

        eventSubDefs.push(eventBus.subscribe('appCtx.update', contextChangeHandler));
      });
    };
    /**
     * Initialize the command visbility service
     *
     * @return {Promise} Promise resolved when initialization is complete
     */


    exports.init = function () {
      return exports.getDelegateService().then(function (delegateService) {
        if (delegateService) {
          if (delegateService.init) {
            return initializeDelegateService(delegateService);
          }

          if (delegateService.loadServerVisibility) {
            // Lazy load of delegate service means it is not necessary to run service in background
            return $q.resolve();
          }
        }

        return $q.reject();
      }).catch(function (e) {
        logger.warn('Unable to start command visibility service', e);
      });
    };
    /**
     * Load server visibility for any commands in the given commandsViewModel
     *
     * @param {Object} commandsViewModel CVM to check
     * @return {Promise} Promise resolved when visibility is loaded
     */


    var loadServerVisibility = function loadServerVisibility(commandsViewModel) {
      return exports.getDelegateService().then(function (delegateService) {
        return exports.getServerVisibleCommands(commandsViewModel).then(function (serverVisibleCommands) {
          return $q.all(Object.keys(serverVisibleCommands).map(delegateService.loadServerVisibility));
        });
      }).catch(function () {
        return $q.resolve();
      });
    };

    exports.loadServerVisibility = loadServerVisibility;
    /**
     * Unload server visibility for any commands in the given commandsViewModel
     *
     * @param {Object} commandsViewModel CVM to check
     * @return {Promise} Promise resolved when visibility is unloaded
     */

    var unloadServerVisibility = function unloadServerVisibility(commandsViewModel) {
      return exports.getDelegateService().then(function (delegateService) {
        return exports.getServerVisibleCommands(commandsViewModel).then(function (serverVisibleCommands) {
          return $q.all(Object.keys(serverVisibleCommands).map(delegateService.unloadServerVisibility));
        });
      }).catch(function () {
        return $q.resolve();
      });
    };

    exports.unloadServerVisibility = unloadServerVisibility;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'commandVisibilityService'
  };
});