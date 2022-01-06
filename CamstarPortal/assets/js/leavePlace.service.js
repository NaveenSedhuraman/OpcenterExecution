"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines the {@link NgServices.leavePlaceService}
 *
 * @module js/leavePlace.service
 */
define(['app', 'js/logger'], function (app, logger) {
  'use strict';

  var exports = {}; // service and module references

  var _$q = null;
  var _$state = null;
  var _$window = null;
  var _$location = null;
  /**
   * The currently registered handler.
   *
   * @private
   * @member _registeredAppHandler
   * @memberOf NgServices.leavePlaceService
   */

  var _registeredAppHandler = null;
  /**
   * Initialization function, sets up the event listeners for the $stateChangeStart and $locationChangeStart events.
   * If the event fires and there is a registered handler then we save the navigation target, prevent the navigation
   * event, and invoke the handler which returns a promise. Once the handler is done, the promise continuation will
   * trigger navigation to the original target.
   *
   * @private
   * @function initializeRootScope
   * @memberOf NgServices.leavePlaceService
   * @param {Object} $rootScope - $rootScope
   */

  var initializeRootScope = function initializeRootScope($rootScope) {
    /**
     * Why this code is not clean:
     *
     * <pre>
     * There are several different methods of changing state, and each of them has a different ordering of events.
     * 1. When using the $location service ($location.url, $location.path, etc - used by tiles currently):
     *
     *  Angular fires $locationChangeStart
     *  If it is prevented
     *      Nothing happens (the URL does not change)
     *  If it is not prevented
     *      The URL changes
     *      Angular fires $locationChangeSuccess
     *          ui-router listens for this event
     *          If the new URL is query parameter change
     *              ui-router updates the current $state parameters
     *          If the new URL is a new state
     *              ui-router fires $stateChangeStart
     *              If it is prevented
     *                  ui-router reverts to the previous URL (potentially breaking history)
     *              If it is not prevented
     *                  ui-router changes the view
     *                  ui-router fires the $stateChangeSuccess event
     * <br>
     *  This case is handled by the second set of resolve / reject functions in the '$locationChangeStart' listener.
     * <br>
     * 2. When using the $state service ($state.go, $state.transitionTo, etc - primary method of changing state):
     *  If the new state is just a query parameter change
     *      ui-router updates $state.params
     *      ui-router calls $location.path().search()
     *      Angular fires $locationChangeStart
     *          If it is prevented
     *              Nothing happens (the URL does not change)
     *          If it is not prevented
     *              The URL changes
     *              Angular fires $locationChangeSuccess
     *                  ui-router listens for this event but ignores in this case
     *  If the new state is a state change
     *      ui-router fires $stateChangeStart
     *      If it is prevented
     *          Nothing happens
     *      If it is not prevented
     *          ui-router changes state (parameters, view, etc)
     *          ui-router changes URL (with $location)
     *              Angular fires $locationChangeStart
     *                  If it is prevented
     *                      Nothing happens (the URL does not change)
     *                  If it is not prevented
     *                      The URL changes
     *                      Angular fires $locationChangeSuccess
     *                          ui-router listens for this event but ignores in this case
     * <br>
     * This'situation' is handled by the '$stateChangeStart' listener.
     * <br>
     *  3. When navigating manually (with brower back/forward buttons, typing in URL):
     *  The URL changes
     *  Angular fires $locationChangeStart
     *      If it is prevented
     *          Angular reverts the URL (breaking history and potentially causing a loop)
     *      If it is not prevented
     *          Angular fires $locationChangeSuccess
     *              ui-router listens for this event
     *              If the new URL is query parameter change
     *                  ui-router updates the current $state parameters
     *              If the new URL is a new state
     *                  ui-router fires $stateChangeStart
     *                  If it is prevented
     *                      ui-router reverts to the previous URL (potentially breaking history)
     *                  If it is not prevented
     *                      ui-router changes the view
     *                      ui-router fires the $stateChangeSuccess event
     * <br>
     *  This case is handled by the first set of resolve / reject functions in the '$locationChangeStart' listener.
     * <br>
     * </pre>
     */

    /**
     * Register the $stateChangeStart event handler. Because we also listen for "$locationChangeStart" events this
     * handler will only be triggered if the state changes without the URL changing (ex going from login to the
     * actual page).
     */
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
      if (_registeredAppHandler) {
        var targetNavDetails = {};
        targetNavDetails.toState = toState;
        targetNavDetails.toParams = toParams;
        targetNavDetails.options = options; // stop the initial event so the handler can process.

        event.preventDefault(); // invoke the handler and setup up the promise continuation

        _registeredAppHandler.okToLeave(targetNavDetails).then(function () {
          $rootScope.$evalAsync(function () {
            // clear the handler reference that ran to avoid recursion
            _registeredAppHandler = null; // navigate to the target state

            _$state.transitionTo(targetNavDetails.toState, targetNavDetails.toParams, targetNavDetails.options);
          });
        }, function (err) {
          // eslint-disable-line no-unused-vars
          logger.trace('Prevented navigation to ', targetNavDetails);
        });
      }
    });
    /**
     * Register the $locationChangeStart event handler
     */

    $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      // eslint-disable-line no-unused-vars
      if (_registeredAppHandler) {
        var targetNavDetails = {};
        targetNavDetails.targetPath = _$location.path();
        targetNavDetails.targetSearch = _$location.search();
        targetNavDetails.targetHash = _$location.hash(); // Functions to call after the okToLeave promise
        // okToLeaveSuccess must be set, okToLeaveFailure can be null

        var okToLeaveSuccess;
        var okToLeaveFailure; // Detect if the user has changed the URL manually (back button, forward button, manual change)

        if (_$window.location.href === newUrl) {
          // Calling event.preventDefault() causes Angular to revert the URL in a way that breaks history
          // instead catch any success events so ui-router (and any other listeners) are not notified that the URL has changed
          _$location.captureSuccess(); // If we were allowed to leave just release the success event.


          okToLeaveSuccess = function okToLeaveSuccess() {
            _$location.releaseSuccess();
          };

          var originalUrl = _$location.url(); // If we were not then we should revert the URL and dump the success event


          okToLeaveFailure = function okToLeaveFailure() {
            logger.trace('Prevented navigation to ', newUrl); // This will prevent a history loop but cause duplicate states in history
            // Currently not a problem as this case does not appear in the application.

            _$location.url(originalUrl).replace();

            $rootScope.$evalAsync(function () {
              _$location.dumpSuccess().releaseSuccess();
            });
          };
        } else {
          // Prevent angular from changing the URL in the first place
          event.preventDefault();

          okToLeaveSuccess = function okToLeaveSuccess() {
            // Assign the URL - creates a new state in the history
            _$location.path(targetNavDetails.targetPath).search(targetNavDetails.targetSearch).hash(targetNavDetails.targetHash);
          };

          okToLeaveFailure = function okToLeaveFailure() {
            // Don't clear handler when the promise is rejected
            logger.trace('Prevented navigation to ', newUrl);
          };
        } // Run the okToLeave handler


        _registeredAppHandler.okToLeave(targetNavDetails).then(function () {
          // Clear the handler
          _registeredAppHandler = null; // Allow angular to sync the URL in case of a manual change

          $rootScope.$evalAsync(function () {
            // Run the success function - will begin another $locationChangeStart event that goes through without handler
            okToLeaveSuccess();
          });
        }, okToLeaveFailure);
      }
    });
  };
  /**
   * Method used by application to create leave handler object from an api object that can perform the okToLeave check
   *
   * @function createAndRegisterLeaveHandler
   * @memberOf NgServices.leavePlaceService
   * @param {Object} api - The object for the leave handler. Must have a method "okToLeave" that is called with a
   *            promise when the user attempts to change location / state.
   */


  exports.createAndRegisterLeaveHandler = function (api) {
    var leaveHandler = {
      api: api
    };

    leaveHandler.okToLeave = function () {
      var deferred = _$q.defer();

      this.api.okToLeave(deferred);
      return deferred.promise;
    };

    exports.registerLeaveHandler(leaveHandler);
  };
  /**
   * Method used for service consumer to register their handler function. Upon navigation, the "okToLeave" function
   * will be invoked. The function must return a promise, and when the handler logic completes the promise should be
   * resolved to allow navigation to continue or rejected to prevent the navigation.
   *
   * @function registerLeaveHandler
   * @memberOf NgServices.leavePlaceService
   * @param {Object} handler - The leave handler Object function. Must have a "okToLeave" property which returns a
   *            promise.
   */


  exports.registerLeaveHandler = function (handler) {
    if (handler && !handler.okToLeave) {
      logger.error('Leave place handler', handler, 'does not have okToLeave property');
    } else {
      _registeredAppHandler = handler;
    }
  };
  /**
   * Service to manage the leave place handlers. Only a single handler can be active at once. When the
   * $locationChangeStart or $stateChangeStart events trigger the current leave place handler will be activated and
   * then cleared if the promise is resolved.
   *
   * @class leavePlaceService
   * @param $rootScope {Object} - $rootScope
   * @param $q {Object} - Promise service
   * @param $state {Object} - State service
   * @param $window {Object} - Global window object
   * @memberOf NgServices
   */


  app.factory('leavePlaceService', ['$rootScope', '$q', '$state', '$window', '$location', function ($rootScope, $q, $state, $window, $location) {
    _$q = $q;
    _$state = $state;
    _$window = $window;
    _$location = $location;
    initializeRootScope($rootScope);
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'leavePlaceService'
  };
});