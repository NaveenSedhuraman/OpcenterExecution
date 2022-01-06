"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines {@link NgServices.async} which provides a set of utilities for handling async methods
 *
 * @module js/async.service
 * @requires app
 */
define(['app', 'Debug'], function (app, Debug) {
  'use strict';

  var trace = new Debug('async');
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * A set of utilities for handling async methods
   *
   * @class async
   * @memberOf NgServices
   */

  app.service('async', ['$q', '$timeout', function AsyncService($q, $timeout) {
    /**
     * Get an api capable of executing the given api async
     *
     * @param {Function<List<a>>} methodToExecute Method to call. Input will be a list of a where a is the input to the debounced method
     * @param {Number} debounceTime How long to debounce method calls
     * @param {Lock} lock A "lock" with a "isUnlocked" function. Allows external control of call on top of debounce
     * @returns {Function<a>} A debounced version of the method that supports individual calls
     */
    var debouncePromise = function debouncePromise(methodToExecute, debounceTime, lock) {
      /**
       * Promise tracking any currently active batch.
       *
       * Resolved once the method is actually executed.
       */
      var deferred = null;
      /**
       * The current active timer. If allowed to complete the method will be executed.
       */

      var debounceTimer = null;
      /**
       * Items to pass to the network
       */

      var items = [];
      /**
       * Flag tracking if the service was previously locked
       */

      var wasLocked = false;
      /**
       * Actually execute the action
       *
       * @returns {Promise} Promise resolved after execution
       */

      var doAction = function doAction() {
        // Clear the reference to current batch - set to null to prevent additions to current batch post timeout
        var currentDefer = deferred;
        var currentItems = items;
        deferred = null;
        items = []; // Actually do the method

        return methodToExecute(currentItems).then(currentDefer.resolve);
      };
      /**
       * Add a new item to batch
       *
       * Returns a promise resolved when the method is actually executed.
       *
       * @param {a} item The item to add
       * @returns {Promise} Promise resolved when action is actually executed
       */


      return function (item) {
        // If a batch is not already active create a new one
        if (!deferred) {
          deferred = $q.defer();
        } // If the timer is running cancel it


        if (debounceTimer) {
          $timeout.cancel(debounceTimer);
        } // Add item to batch and start a new timer


        items.push(item);

        var timerComplete = function timerComplete() {
          if (lock) {
            if (lock.isUnlocked()) {
              if (!wasLocked) {
                trace('Debounce is unlocked doing action', debounceTime); // Debounce after unlock has finished, safe to do action

                doAction();
              } else {
                trace('Debounce is unlocked restarting timer', debounceTime);
                wasLocked = false; // Unlock just happened, restart regular debounce

                debounceTimer = $timeout(timerComplete, debounceTime);
              }
            } else {
              trace('Debounce is locked', debounceTime);
              wasLocked = true; // Locked, reset timer and check again after debounce

              debounceTimer = $timeout(timerComplete, debounceTime);
            }
          } else {
            // No extra lock, just do the action
            doAction();
          }
        };

        trace('New item added resetting timer', debounceTime, item);
        debounceTimer = $timeout(timerComplete, debounceTime); // Return the "shared" promise

        return deferred.promise;
      };
    };

    this.debouncePromise = debouncePromise;
  }]);
});