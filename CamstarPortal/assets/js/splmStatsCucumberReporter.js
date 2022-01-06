"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Reporter to be used with cucumber/selenium 
 *
 * @module js/splmStatsCucumberReporter
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'lodash', 'js/eventBus', 'js/logger', 'js/splmStatsConstants'], function (app, _, eventBus, logger, _t) {
  'use strict';
  /**
   * Reporter to be used with cucumber/selenium
   *
   * @class SPLMStatsCucumberReporter
   */

  function SPLMStatsCucumberReporter() {
    var self = this;
    /**
     * @param {Object} obj - Performance object to be fired in event that cucumber java performance_helper.js is listening to
     */

    self.report = function (obj) {
      eventBus.publish(_t.const.CUCUMBER_PERFORMANCE_METRICS, obj);
    };

    return self;
  }

  return SPLMStatsCucumberReporter;
});