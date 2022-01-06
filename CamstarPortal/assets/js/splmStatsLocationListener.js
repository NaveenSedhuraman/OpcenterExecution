"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * Location Listener Trigger for monitor
 *
 * @module js/splmStatsLocationListener
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'lodash', 'js/browserUtils', 'js/splmStatsUtils'], function (app, _, browserUtils, SPLMStatsUtils) {
  'use strict';
  /**
   * Location Listener Trigger for monitor
   *
   * @class SPLMStatsMonitor
   */

  function SPLMStatsLocationListener() {
    var self = this;
    var _listener = null;

    self.start = function (_monitor) {
      var rootScope = app.getInjector().get('$rootScope');
      _listener = rootScope.$on('$locationChangeStart', function (event, next, current) {
        _monitor.setTitle(browserUtils.getWindowLocation().hash);

        _monitor.run();
      });
    };

    self.stop = function () {
      _listener();
    };

    return self;
  }

  return SPLMStatsLocationListener;
});