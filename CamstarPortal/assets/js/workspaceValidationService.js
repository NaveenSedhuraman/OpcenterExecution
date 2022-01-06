"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This file contains the utility methods for workspace management.
 *
 * @module js/workspaceValidationService
 */
define(['app', 'lodash', 'js/appCtxService', 'js/workspaceInitService', 'js/configurationService', 'js/localeService'], function (app, _) {
  'use strict';
  /**
   * Cached reference to the various AngularJS and AW services.
   */

  var _$q;

  var _appCtxSvc;

  var _workspaceInitSvc;

  var _cfgSvc;

  var _localeSvc;

  var exports = {};
  /**
   * Check whether the passed page ID is a valid page
   *
   * @param {String} Page ID
   */

  exports.isValidPageAsync = function (pageId) {
    var workspaceDefinition = _appCtxSvc.getCtx('workspace');

    var isWorkspaceChange = _workspaceInitSvc.getisWorkspaceChange();

    if (workspaceDefinition && !isWorkspaceChange) {
      return _$q.resolve(exports.isValidPage(pageId));
    }

    return exports.setWorkspaceId().then(function () {
      return exports.isValidPage(pageId);
    });
  };
  /**
   * Check whether the passed page ID is a valid page
   *
   * @param {String} pageId - Page ID
   * @return {Boolean} is valid page?
   */


  exports.isValidPage = function (pageId) {
    var validPage = true;

    var workspaceDefinition = _appCtxSvc.getCtx('workspace');

    if (workspaceDefinition && workspaceDefinition.availablePages) {
      // Check the validity of the page only if it is exclusive workspace. For inclusive
      // workspace, all pages are valid pages
      if (exports.isExclusiveWorkspace(workspaceDefinition)) {
        validPage = _.includes(workspaceDefinition.availablePages, pageId);
      }
    }

    return validPage;
  };
  /**
   * Check whether the passed workspace is an exclusive workspace
   *
   * @param {Object} workspaceDefinition - Workspace definition
   * @return {Boolean} true for exclusive workspace, false otherwise
   */


  exports.isExclusiveWorkspace = function (workspaceDefinition) {
    return workspaceDefinition.workspaceType === 'Exclusive';
  };
  /**
   * Set the workspace ID
   *
   * @return {Promise} promise
   */


  exports.setWorkspaceId = function () {
    var totalWorkspaceCount = _workspaceInitSvc.getTotalWorkspaceCount();

    var solution;
    var workspaceId;
    return _cfgSvc.getCfg('solutionDef').then(function (solutionDef) {
      solution = solutionDef;
      workspaceId = _workspaceInitSvc.getWorkspaceId(); // If server has no workspace entry, set the default workspace and increment the workspace count
      // by 1 so that visibility of the WS link can be controlled correctly.

      if (!workspaceId && solution.defaultWorkspace) {
        workspaceId = solution.defaultWorkspace;
        totalWorkspaceCount++;
      } // If the workspace ID returned by server is different from solution default workspace, increment
      // workspace count by 1 because all users have acess to solution default WS. This way, the WS link
      // will be always shown.


      if (workspaceId !== solution.defaultWorkspace) {
        totalWorkspaceCount++;
      }

      return _cfgSvc.getCfg('workspace');
    }).then(function (workspaceCfg) {
      var allWorkspaceDefn = _.cloneDeep(workspaceCfg);

      var workspaceDefn = allWorkspaceDefn[workspaceId]; // If the workspace ID returned by server is not a valid one, revert the workspace increment. (This is a
      // very corner usecase and should never happen but adding a preventive check.)

      if (!workspaceDefn) {
        workspaceDefn = allWorkspaceDefn[solution.defaultWorkspace];
        totalWorkspaceCount--;
      }

      _appCtxSvc.registerCtx('totalWorkspaceCount', totalWorkspaceCount);

      _appCtxSvc.registerCtx('workspace', workspaceDefn);

      exports.getLocalizedText(workspaceDefn.workspaceName).then(function (result) {
        workspaceDefn.workspaceName = result;

        _appCtxSvc.updateCtx('workspace', workspaceDefn);
      });
      var defaultRoutePath = app.getInjector().get('defaultRoutePath');

      if (defaultRoutePath !== workspaceDefn.defaultPage) {
        // set the value
        app.constant('defaultRoutePath', workspaceDefn.defaultPage);

        _appCtxSvc.registerCtx('defaultRoutePath', workspaceDefn.defaultPage);
      }

      return workspaceDefn;
    });
  };
  /**
   * Get localized text.
   *
   * @param {Object} label - If label is string, return as is. If it contains source and key, retrieve value from the
   *            locale file
   * @return {String} localized text
   */


  exports.getLocalizedText = function (label) {
    if (_.isString(label)) {
      // If the label is a string just return it
      return _$q.resolve(label);
    } // Otherwise get the label from the localized file


    return _localeSvc.getLocalizedText(label.source, label.key);
  };
  /**
   * This service provides necessary APIs to validate workspace artifacts.
   *
   * @memberof NgServices
   * @member workspaceValidationService
   */


  app.factory('workspaceValidationService', ['$q', 'appCtxService', 'workspaceInitService', 'configurationService', 'localeService', function ($q, appCtxSvc, workspaceInitService, cfgSvc, localeSvc) {
    _$q = $q;
    _appCtxSvc = appCtxSvc;
    _workspaceInitSvc = workspaceInitService;
    _cfgSvc = cfgSvc;
    _localeSvc = localeSvc;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'workspaceValidationService'
  };
});