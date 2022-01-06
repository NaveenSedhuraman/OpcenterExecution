"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This module is used to adapt the functionality provided by NodeJS module, 'assert', to work within an AngularJS based
 * application.
 *
 * @module assert
 */
define(['js/logger'], function (logger) {
  'use strict';
  /**
   * This function throws an exception with the given message text if the given 'expression' evaluates to FALSE.
   *
   * @param {Object} condition - Expression to evaluate.
   * @param {string} message - Message text to use in any exception thrown.
   */

  return function (condition, message) {
    if (!condition) {
      logger.warn('assert failed: ' + message);
      throw new Error('assert failed: ' + message);
    }
  };
});