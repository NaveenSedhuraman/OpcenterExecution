"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Constants for PLStats
 *
 * @module js/splmStatsConstants
 * 
 *
 */
define([], function () {
  'use strict';

  var exports = {}; // Budget 

  exports.BUDGET_HTTP_REQUEST_COUNT = 34; ////

  exports.BUDGET_HTTP_REQUEST_TIME = 1500;
  exports.BUDGET_HTTP_REQUEST_SIZE = 1000000; ////

  exports.BUDGET_DOM_NODE_COUNT = 1500;
  exports.BUDGET_NG_WATCHERS_DIFFERENCE = 2000;
  exports.BUDGET_NG_DIGEST_CYCLES_COUNT = 200; ////

  exports.BUDGET_MEMORY_USAGE = 20000000;
  exports.BUDGET_DOM_TREE_DEPTH = 32;
  exports.BUDGET_TTI = 2500;
  exports.PER_ELEMENT_WATCHER_LIMIT = 50; // Error

  exports.ERROR_HTTP_REQUEST_COUNT = 68;
  exports.ERROR_HTTP_REQUEST_TIME = 30000;
  exports.ERROR_HTTP_REQUEST_SIZE = 2000000;
  exports.ERROR_DOM_NODE_COUNT = 10000;
  exports.ERROR_NG_WATCHERS_DIFFERENCE = 5000;
  exports.ERROR_NG_DIGEST_CYCLES_COUNT = 500;
  exports.ERROR_MEMORY_USAGE = 200000000;
  exports.ERROR_DOM_TREE_DEPTH = 64;
  exports.ERROR_TTI = 30000;
  exports.ERROR_MAX_CAPTURE_TIME = 60000; // Delta - Actual reported by user vs. expected(budget values above)

  exports.DELTA_HTTP_REQUEST_COUNT = 10; ////

  exports.DELTA_HTTP_REQUEST_TIME = 1500;
  exports.DELTA_HTTP_REQUEST_SIZE = 250000; ////

  exports.DELTA_DOM_NODE_COUNT = 1000;
  exports.DELTA_NG_WATCHERS_DIFFERENCE = 1000;
  exports.DELTA_NG_DIGEST_CYCLES_COUNT = 100; ////

  exports.DELTA_MEMORY_USAGE = 100000;
  exports.DELTA_DOM_TREE_DEPTH = 8;
  exports.DELTA_TTI = 2000; // Cucumber

  exports.CUCUMBER_BUDGET_HTTP_REQUEST_COUNT = 34; ////

  exports.CUCUMBER_BUDGET_HTTP_REQUEST_TIME = 1500;
  exports.CUCUMBER_BUDGET_HTTP_REQUEST_SIZE = 1000000; ////

  exports.CUCUMBER_BUDGET_DOM_NODE_COUNT = 1500;
  exports.CUCUMBER_BUDGET_NG_WATCHERS_DIFFERENCE = 2000;
  exports.CUCUMBER_BUDGET_NG_DIGEST_CYCLES_COUNT = 200; ////

  exports.CUCUMBER_BUDGET_MEMORY_USAGE = 20000000;
  exports.CUCUMBER_BUDGET_DOM_TREE_DEPTH = 32;
  exports.CUCUMBER_BUDGET_TTI = 2500;
  exports.CUCUMBER_BUDGET_NETWORK_ERRORS = 0;
  exports.CUCUMBER_BUDGET_SCRIPTING_TIME = 2000; // Events

  exports.ANALYTICS_EVENT_NAME = 'PerformanceMetricsV1'; // Messages

  exports.ERROR_MAX_CAPTURE_TIME_LOG = 'ERROR - Maximum performance capture time exceeded';
  exports.CUCUMBER_PERFORMANCE_METRICS = 'CucumberPerformanceMetrics';
  return {
    const: exports
  };
});