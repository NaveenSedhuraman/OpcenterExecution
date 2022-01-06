"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * Listener for click events
 *
 * @module js/splmStatsClickListener
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'lodash', 'js/splmStatsUtils'], function (app, _, SPLMStatsUtils) {
  'use strict';
  /**
   * Instances of this class represent click listener
   *
   * @class SPLMStatsMonitor
   */

  function SPLMStatsClickListener() {
    var self = this;
    var _monitor = null;

    var _clickHandler = function _clickHandler() {
      _monitor.run();
    };

    self.start = function (monitor) {
      _monitor = monitor;
      document.addEventListener('mousedown', _clickHandler);
      document.addEventListener('click', _clickHandler);
    };

    self.stop = function (monitor) {
      document.removeEventListener('mousedown', _clickHandler);
      document.removeEventListener('click', _clickHandler);
      _monitor = null;
    };

    return self;
  }

  return SPLMStatsClickListener;
});