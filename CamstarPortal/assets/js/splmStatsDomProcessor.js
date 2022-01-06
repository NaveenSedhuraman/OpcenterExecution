"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * Dom Processor - Provides performance metrics in relation to the DOM
 *
 * @module js/splmStatsDomProcessor
 *
 * @publishedApolloService
 *
 */
define([//
'lodash', 'js/browserUtils', 'js/logger', 'js/splmStatsUtils'], function (_, browserUtils, logger, splmStatsUtils) {
  'use strict';
  /**
   * Instances of this class represent a profiler for DOM Information
   *
   * @class SPLMStatsDomProcessor
   */

  function SPLMStatsDomProcessor() {
    var self = this;
    var _processingTime = 0;
    var _startProcessorTime = 0;
    var _endProcessorTime = 0;

    self.start = function () {
      _startProcessorTime = window.performance.now();
      _endProcessorTime = window.performance.now();
      _processingTime += _endProcessorTime - _startProcessorTime;
    };

    self.stop = function () {
      _startProcessorTime = window.performance.now();
      _endProcessorTime = window.performance.now();
      _processingTime += _endProcessorTime - _startProcessorTime;
    };
    /**
     * @returns {Object} DOM Object contains element count on page, DOM Tree Depth, and # of costly widgets on page
     * Definition of costly: N >= 6 depth OR N >= 50 watchers on the DOM structure ( element and children )
     */


    self.getMetrics = function () {
      return {
        DOM: {
          elemCount: splmStatsUtils.getDomElementsCount(),
          DOMTreeDepth: splmStatsUtils.getDomTreeDepth(document, 0),
          DOMCostlyWidgets: splmStatsUtils.getCostlyWidgets()
        }
      };
    };
    /**
     * @returns {Object} Total processing time for DOM Metrics
     */


    self.getProcessingTime = function () {
      var _time = _processingTime;
      _processingTime = 0;
      return {
        DOMProcessorOverhead: _time
      };
    };

    return self;
  }

  return SPLMStatsDomProcessor;
});