"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/**
 * This utility module provides helpful functions intended to efficiently manipulate pltable contents.
 * TODO: Rename this to splmStatsFactory.js
 *
 * @module js/splmStatsService
 */
define(['app', 'lodash', 'js/browserUtils', 'js/configurationService', 'js/splmStatsJsService', // TARGET_AW42: Will refactor to other place
'js/splmStatsXhrProcessor', 'js/splmStatsDomProcessor', 'js/splmStatsMemProcessor', 'js/splmStatsNgProcessor', 'js/splmStatsJsProcessor', 'js/splmStatsAnalyticsReporter', 'js/splmStatsDebugReporter', 'js/splmStatsBudgetReporter', 'js/splmStatsMobileReporter', 'js/splmStatsCucumberReporter', 'js/splmStatsProfiler', 'js/splmStatsMonitor', 'js/splmStatsClickListener', 'js/splmStatsLocationListener', 'js/splmStatsCommandListener', 'js/splmStatsUtils'], function (app, _, browserUtils, cfgSvc, splmStatsJsService, // TARGET_AW42: Match with TARGET_AW42 above
SPLMStatsXhrProcessor, SPLMStatsDomProcessor, SPLMStatsMemProcessor, SPLMStatsNgProcessor, SPLMStatsJsProcessor, SPLMStatsAnalyticsReporter, SPLMStatsDebugReporter, SPLMStatsBudgetReporter, SPLMStatsMobileReporter, SPLMStatsCucumberReporter, SPLMStatsProfiler, SPLMStatsMonitor, SPLMStatsClickListener, SPLMStatsLocationListener, SPLMStatsCommandListener, SPLMStatsUtils) {
  'use strict';

  var exports = {};

  var _createDefaultProfiler = function _createDefaultProfiler() {
    var profiler = new SPLMStatsProfiler();
    profiler.addProcessor('XHR', new SPLMStatsXhrProcessor());
    profiler.addProcessor('DOM', new SPLMStatsDomProcessor());
    profiler.addProcessor('MEM', new SPLMStatsMemProcessor());
    profiler.addProcessor('NG', new SPLMStatsNgProcessor());
    profiler.addProcessor('JS', new SPLMStatsJsProcessor());
    profiler.includeProcessorTime();
    return profiler;
  };

  var _defaultAnalyticsConfig = {
    splmStatsConfiguration: {
      name: 'ActiveWorkspaceTest',
      appCtxValueFilters: ['com.siemens.splm.clientfx.tcui.xrt.', 'com.siemens.splm.client.search.', 'com.siemens.splm.client.', 'teamcenter.search.search', 'SubLocation', 'Location'],
      appCtxKeys: [{
        name: 'Sublocation',
        searchPaths: [['locationContext', 'ActiveWorkspace:SubLocation']]
      }, {
        name: 'ViewMode',
        searchPaths: [['ViewModeContext', 'ViewModeContext']]
      }, {
        name: 'PrimaryPage',
        searchPaths: [['xrtPageContext', 'primaryXrtPageID']]
      }, {
        name: 'SecondaryPage',
        searchPaths: [['xrtPageContext', 'secondaryXrtPageID']]
      }, {
        name: 'clientScopeURI',
        searchPaths: [['sublocation', 'clientScopeURI']]
      }, {
        name: 'SelectedObjectType',
        searchPaths: [['selected', 'type']]
      }],
      triggers: {
        commands: []
      }
    }
  };

  exports.createCucumberMonitor = function () {
    var profiler = _createDefaultProfiler();

    profiler.addReporter(new SPLMStatsCucumberReporter());
    profiler.addReporter(new SPLMStatsDebugReporter());
    var monitor = new SPLMStatsMonitor();
    monitor.addProfiler(profiler);
    monitor.addListener(new SPLMStatsClickListener());
    monitor.addListener(new SPLMStatsLocationListener());
    monitor.addListener(new SPLMStatsCommandListener());
    return monitor;
  };

  exports.createAnalyticsMonitor = function () {
    var profiler = _createDefaultProfiler();

    var monitor = new SPLMStatsMonitor();
    monitor.addProfiler(profiler);
    monitor.addListener(new SPLMStatsClickListener());
    monitor.addListener(new SPLMStatsLocationListener());
    monitor.addListener(new SPLMStatsCommandListener());
    return monitor;
  };

  exports.createCommandMonitor = function () {
    var profiler = _createDefaultProfiler();

    profiler.addReporter(new SPLMStatsDebugReporter());
    var monitor = new SPLMStatsMonitor();
    monitor.addProfiler(profiler);
    monitor.addListener(new SPLMStatsCommandListener());
    return monitor;
  };

  exports.createLocationMonitor = function () {
    var profiler = _createDefaultProfiler();

    profiler.addReporter(new SPLMStatsDebugReporter());
    var monitor = new SPLMStatsMonitor();
    monitor.addProfiler(profiler);
    monitor.addListener(new SPLMStatsLocationListener());
    return monitor;
  };

  exports.initProfiler = function () {
    var urlAttrs = browserUtils.getUrlAttributes();
    var usePLStats = urlAttrs.usePLStats !== undefined;
    var profileUrl = urlAttrs.profileUrl !== undefined;
    var profileCmd = urlAttrs.profileCmd !== undefined;

    if (usePLStats || !SPLMStatsUtils.isAnalyticsDisabled()) {
      // Enable a profiler by default 
      var testMonitor = exports.createAnalyticsMonitor();
      var analyticsReporter = new SPLMStatsAnalyticsReporter();
      analyticsReporter.enable();
      testMonitor.addReporter(analyticsReporter);

      if (usePLStats) {
        testMonitor.addReporter(new SPLMStatsDebugReporter());
      }

      if (browserUtils.isMobileOS) {
        testMonitor.addReporter(new SPLMStatsMobileReporter());
      }

      testMonitor.enable();
      testMonitor.run();

      if (profileUrl) {
        // Location Profiler 
        var locMonitor = exports.createLocationMonitor();
        locMonitor.enable();
      }

      if (profileCmd) {
        // Command Profiler
        var cmdMonitor = exports.createCommandMonitor();
        cmdMonitor.enable();
      }
    }
  };

  exports.installAnalyticsConfig = function () {
    if (!cfgSvc.getCfgCached('analytics.splmStatsConfiguration')) {
      cfgSvc.add('analytics', _defaultAnalyticsConfig);
    }
  };

  return exports;
});