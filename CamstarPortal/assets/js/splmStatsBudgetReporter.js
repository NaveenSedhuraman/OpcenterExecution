"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Budgeting reporter that compares expected performance values vs. actual performance values
 *
 * @module js/splmStatsBudgetReporter
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'js/logger', 'lodash', 'js/splmStatsConstants'], function (app, logger, _, _t) {
  'use strict';
  /**
   * Instances of this class represent a reporter for budgeting expected vs. actual
   *
   * @class SPLMStatsBudgetReporter
   */

  function SPLMStatsBudgetReporter() {
    var self = this;
    var _passRate = 0;
    var _total = 0;
    var _budgetOps = {
      AngularJS: function AngularJS(o) {
        return {
          expected: {
            DigestCycles: _t.const.BUDGET_NG_DIGEST_CYCLES_COUNT,
            watcherDifference: _t.const.BUDGET_NG_WATCHERS_DIFFERENCE
          },
          actual: {
            DigestCycles: o.DigestCycles,
            watcherDifference: o.watcherDifference
          },
          delta: {
            DigestCycles: _t.const.DELTA_NG_DIGEST_CYCLES_COUNT,
            watcherDifference: _t.const.DELTA_NG_WATCHERS_DIFFERENCE
          }
        };
      },
      DOM: function DOM(o) {
        return {
          expected: {
            DOMTreeDepth: _t.const.BUDGET_DOM_TREE_DEPTH,
            elemCount: _t.const.BUDGET_DOM_NODE_COUNT
          },
          actual: {
            DOMTreeDepth: o.DOMTreeDepth,
            elemCount: o.elemCount
          },
          delta: {
            DOMTreeDepth: _t.const.DELTA_DOM_TREE_DEPTH,
            elemCount: _t.const.DELTA_DOM_NODE_COUNT
          }
        };
      },
      MemoryConsumption: function MemoryConsumption(o) {
        return {
          expected: {
            MemoryConsumption: _t.const.BUDGET_MEMORY_USAGE
          },
          actual: {
            MemoryConsumption: o
          },
          delta: {
            MemoryConsumption: _t.const.DELTA_MEMORY_USAGE
          }
        };
      },
      TTI: function TTI(o) {
        return {
          expected: {
            TTI: _t.const.BUDGET_TTI
          },
          actual: {
            TTI: o
          },
          delta: {
            TTI: o - _t.const.DELTA_TTI
          }
        };
      },
      XHR: function XHR(o) {
        return {
          expected: {
            HttpRequestCount: _t.const.BUDGET_HTTP_REQUEST_COUNT,
            HttpRequestSize: _t.const.BUDGET_HTTP_REQUEST_SIZE
          },
          actual: {
            HttpRequestCount: o.details.length,
            HttpRequestSize: o.totalSize
          },
          delta: {
            HttpRequestCount: _t.const.DELTA_HTTP_REQUEST_COUNT,
            HttpRequestSize: _t.const.DELTA_HTTP_REQUEST_SIZE
          }
        };
      },
      networkTime: function networkTime(o) {
        return {
          expected: {
            networkTime: _t.const.BUDGET_HTTP_REQUEST_TIME
          },
          actual: {
            networkTime: o
          },
          delta: {
            networkTime: _t.const.DELTA_HTTP_REQUEST_TIME
          }
        };
      }
    };
    /**
     * Checks expected vs. actual and returns both plus the delta, logs an error if delta is too large (performance is bad)
     * 
     * @param {Object} _results - Checks expected vs. actual and returns both plus the delta
     * 
     * @return {Object} Expected, actual, delta from current input
     */

    var _processResults = function _processResults(_results) {
      _.forEach(_results.expected, function (val, key) {
        var newDelta = _results.actual[key] - _results.expected[key];

        if (newDelta > _results.delta[key]) {
          _results.success = false;
          var rStr = 'Expected[ ' + key + ' ]: ' + _results.expected[key];
          rStr += '\nActual[ ' + key + ' ]: ' + _results.actual[key];
          rStr += '\nDelta[ ' + key + ' ]: ' + '+' + newDelta + ' ( +' + (newDelta / _results.expected[key]).toFixed(2) * 100 + '% )';
          logger.warn(rStr);
        } else {
          _results.success = true;
        }

        _results.delta[key] = newDelta;
      });

      return _results;
    };
    /**
     * Checks expected vs. actual and prints performance regressions to console -> logger.warn
     * 
     * @param {Object} _budgetSet - Raw performance data
     */


    self.report = function (_budgetSet) {
      _passRate = 0;
      _total = 0;
      var _budgetResults = {};
      _budgetSet = _.pickBy(_budgetSet, function (val, key) {
        return _budgetOps[key];
      });

      _.forEach(_budgetSet, function (val, key) {
        _budgetResults[key] = _processResults(_budgetOps[key](val));
      });
    };

    return self;
  }

  return SPLMStatsBudgetReporter;
});