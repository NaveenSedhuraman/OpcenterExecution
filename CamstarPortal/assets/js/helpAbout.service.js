"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines {@link helpAbout.service} which provides services for the help about command
 *
 * @module js/helpAbout.service
 */
define(['app', 'js/localStorage', 'js/appCtxService', 'js/messagingService', 'js/configurationService'], function (app) {
  'use strict';
  /** object to export */

  var exports = {};
  /** Reference to _appCtxService service */

  var _appCtxService;

  var _messagingSvc = null;
  var _cfgSvc = null;
  var _localeSvc = null;
  /**
   * Display the "Help About" Information popup
   */

  exports.showHelpAbout = function () {
    _cfgSvc.getCfg('versionConstants').then(function (versionConstants) {
      _localeSvc.getTextPromise('UIElementsMessages').then(function (textBundle) {
        var helpAboutStr = versionConstants.name + '@' + versionConstants.version + ' (' + versionConstants.description + ')<br>';

        if (versionConstants.afx) {
          helpAboutStr += versionConstants.afx.name + '@' + versionConstants.afx.version + ' (' + versionConstants.afx.description + ')<br>';
        }

        helpAboutStr += textBundle.clientBuild + ': ' + versionConstants.buildTime + '<br>';
        helpAboutStr += _appCtxService.ctx.tcSessionData.serverVersion + '<br>';
        helpAboutStr = helpAboutStr.replace('\n', '<br>');

        if (_appCtxService.ctx.tcSessionData.logFile) {
          helpAboutStr += textBundle.logFile + ': ' + _appCtxService.ctx.tcSessionData.logFile;
        }

        _messagingSvc.showInfo(helpAboutStr);
      });
    });
  };
  /**
   * @class helpAbout.service
   */


  app.service('helpAbout.service', ['appCtxService', 'messagingService', 'configurationService', 'localeService', function (appCtxService, messagingSvc, cfgSvc, localeSvc) {
    _appCtxService = appCtxService;
    _messagingSvc = messagingSvc;
    _cfgSvc = cfgSvc;
    _localeSvc = localeSvc;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'helpAbout.service'
  };
});