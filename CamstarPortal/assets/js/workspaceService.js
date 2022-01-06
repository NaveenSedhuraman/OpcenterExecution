"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This file contains the utility methods for workspace management.
 *
 * @module js/workspaceService
 */
define(['app', 'lodash', 'js/logger', 'js/localeService', 'js/uwPropertyService', 'js/appCtxService', 'js/configurationService', 'js/workspaceInitService', 'js/workspaceValidationService'], function (app, _, logger) {
  'use strict';
  /**
   * Cached reference to the various AngularJS and AW services.
   */

  var _vmPropSvc;

  var _$q;

  var _cfgSvc;

  var _localeSvc;

  var _workspaceValSvc;

  var _appCtxService;

  var _awIconSvc;

  var exports = {};
  /**
   * Get all workspaces
   *
   * @return {Promise} Resolved with workspace list
   */

  exports.getAllWorkspaces = function () {
    var emptyFilterList = {};
    emptyFilterList.workspacesViewModel = '[]';
    return exports.getWorkspaces(emptyFilterList, true);
  };
  /**
   * Get filtered workspaces
   *
   * @param {Object} response - Contains list of workspace IDs based on which filtering needs to happen
   * @return {Promise} Resolved with workspace list
   */


  exports.getFilteredWorkspaces = function (response) {
    return exports.getWorkspaces(response, false);
  };
  /**
   * Get available commands for the given workspace
   *
   * @param {String} activeWorkSpaceId - active workspace ID
   * @return {Array} command list
   */


  exports.getWorkspaceCommands = function (activeWorkSpaceId) {
    var inKey = 'includedCommands';
    var exKey = 'excludedCommands';
    return _cfgSvc.getCfg('workspace').then(function (workspaceCfg) {
      var workspaceCommands = [];

      if (workspaceCfg) {
        var activeWorkspace = _.get(workspaceCfg, activeWorkSpaceId);
      }

      workspaceCommands[inKey] = activeWorkspace.includedCommands;
      workspaceCommands[exKey] = activeWorkspace.excludedCommands;
      return workspaceCommands;
    });
  };
  /**
   * Get available commands for the given workspace
   *
   * @param {String} commands - commands on page
   * @return {Array} filter command list
   */


  exports.getActiveWorkspaceCommands = function (commands) {
    var workspaceDefinition = _appCtxService.getCtx('workspace');

    if (!_workspaceValSvc.isExclusiveWorkspace(workspaceDefinition)) {
      return commands;
    }

    var inclusiveCmds = _appCtxService.getCtx('workspace.includedCommands');

    if (inclusiveCmds && inclusiveCmds.length === 0) {
      return null;
    }

    if (inclusiveCmds !== undefined) {
      var inclusiveCmdsOverlay = _.filter(commands, function (cmdOverlay) {
        return inclusiveCmds.includes(cmdOverlay.commandId);
      });
    }

    var includedcmds = inclusiveCmds === undefined ? commands : inclusiveCmdsOverlay;

    var exclusiveCmds = _appCtxService.getCtx('workspace.excludedCommands');

    if (exclusiveCmds !== undefined) {
      var cmdDiffArray = [];
      cmdDiffArray = inclusiveCmdsOverlay && inclusiveCmdsOverlay.length > 0 ? inclusiveCmdsOverlay : includedcmds;

      var exclusiveCmdsOverlay = _.filter(cmdDiffArray, function (cmdOverlay) {
        return !exclusiveCmds.includes(cmdOverlay.commandId);
      });

      return cmdDiffArray = exclusiveCmdsOverlay && exclusiveCmdsOverlay.length > 0 ? exclusiveCmdsOverlay : cmdDiffArray;
    }

    return includedcmds;
  };
  /**
   * Get available context configuration for the given workspace
   *
   * @param {String} activeWorkSpaceId - active workspace ID
   * @return {Array} page list
   */


  exports.getAvailableContexts = function (activeWorkSpaceId) {
    return _cfgSvc.getCfg('workspace').then(function (workspaceCfg) {
      if (workspaceCfg) {
        var activeWorkspace = _.get(workspaceCfg, activeWorkSpaceId);
      }

      return activeWorkspace.availableContextConfigurations;
    });
  };
  /**
   * Get available navigation configuration for the given workspace
   * @param {Object} activeWorkSpaceId - active workspace ID based on wworkspace
   * @return {Array} availableNavigations -navigation list
   */


  exports.getAvailableNavigations = function (activeWorkSpaceId) {
    var navigationConfigs;
    var availableNavigations = [];
    return _$q.all([_cfgSvc.getCfg('workspace').then(function (workspaceCfg) {
      navigationConfigs = _.cloneDeep(workspaceCfg);
      return true;
    })]).then(function () {
      if (navigationConfigs) {
        _.forEach(navigationConfigs, function (workspaceDefn) {
          if (activeWorkSpaceId === workspaceDefn.workspaceId && workspaceDefn.availableNavigations) {
            availableNavigations = workspaceDefn.availableNavigations;
          }

          if (availableNavigations.length > 0) {
            availableNavigations.sort();
          }
        });
      }

      return availableNavigations;
    });
  };
  /**
   * Get available workspaces
   *
   * @param {Object} response - Contains list of workspace IDs based on which filtering needs to happen
   * @param {Boolean} returnAll - true for getting all workspaces, false to filter workspaces
   * @return {Promise} Resolved with workspace list
   */


  exports.getWorkspaces = function (response, returnAll) {
    var workspace = {};
    var responseWorkspaceList = JSON.parse(response.workspacesViewModel);
    workspace.workspaceList = [];
    workspace.workspaceCount = 0;
    var viewModel;
    return _cfgSvc.getCfg('solutionDef').then(function (solutionDef) {
      return _cfgSvc.getCfg('workspace');
    }).then(function (workspaceCfg) {
      viewModel = _.cloneDeep(workspaceCfg);
      var workspaceNames = [];

      _.forEach(viewModel, function (workspaceDefn) {
        // Check whether it is a valid workspace definition. If so, lookup the workspace name
        if (workspaceDefn.workspaceName) {
          workspaceNames.push(workspaceDefn.workspaceName);
        }
      });

      return exports.getMultipleLocalizedText(workspaceNames);
    }).then(function (workspaceNameMap) {
      _.forEach(viewModel, function (workspaceDefn) {
        // Proceed only if this is a valid workspace
        if (workspaceDefn.workspaceId) {
          if (returnAll || _.includes(responseWorkspaceList, workspaceDefn.workspaceId)) {
            var workspaceObj = {};
            workspaceObj.uid = workspaceDefn.workspaceId;
            workspaceObj.props = {};
            var workspaceName;

            if (workspaceDefn.workspaceName.key) {
              workspaceName = workspaceNameMap[workspaceDefn.workspaceName.key];
            } else {
              workspaceName = workspaceDefn.workspaceName;
            }

            var viewProp = _vmPropSvc.createViewModelProperty('object_string', 'object_string', 'string', workspaceDefn.workspaceId, [workspaceName]);

            workspaceObj.props[viewProp.propertyName] = viewProp;
            workspaceObj.cellHeader1 = workspaceName;
            workspaceObj.cellHeader2 = workspaceDefn.workspaceId;
            workspaceObj.modelType = 'Awp0Workspace';
            workspaceObj.typeIconURL = _awIconSvc.getTypeIconFileUrl(workspaceObj); // Fake clear editable states for this mock vmo

            workspaceObj.clearEditiableStates = function () {
              return;
            };

            workspace.workspaceList.push(workspaceObj);
          }
        }
      });

      workspace.workspaceCount = workspace.workspaceList.length;
      return workspace;
    });
  };
  /**
   * Reload page
   */


  exports.reloadPage = function () {
    location.reload(false);
  };
  /**
   * Get available page
   *
   * @return {Array} page list
   */


  exports.getAvailablePages = function () {
    var generatedRoutes;
    var viewModel;
    return _$q.all([_cfgSvc.getCfg('workspace').then(function (workspaceCfg) {
      viewModel = _.cloneDeep(workspaceCfg);
      return true;
    }), _cfgSvc.getCfg('states').then(function (states) {
      generatedRoutes = states;
      return true;
    })]).then(function () {
      var workspace = {};
      workspace.pageList = [];
      workspace.pageCount = 0;

      if (viewModel) {
        _.forEach(viewModel, function (workspaceDefn) {
          var availablePages = [];

          if (workspaceDefn.availablePages && _workspaceValSvc.isExclusiveWorkspace(workspaceDefn)) {
            availablePages = workspaceDefn.availablePages;
          } else if (!_workspaceValSvc.isExclusiveWorkspace(workspaceDefn)) {
            availablePages = Object.keys(generatedRoutes);
          }

          availablePages.sort();

          _.forEach(availablePages, function (availablePage) {
            var pageObj = {};
            pageObj.props = {};
            pageObj.uid = availablePage;

            var viewProp = _vmPropSvc.createViewModelProperty('object_string', 'object_string', 'string', availablePage, [availablePage]);

            pageObj.props[viewProp.propertyName] = viewProp; // Fake clearEditable States

            pageObj.clearEditiableStates = function () {
              return;
            };

            if (_.has(generatedRoutes, availablePage)) {
              var routePageObject = generatedRoutes[availablePage];
              pageObj.cellHeader1 = availablePage;

              if (routePageObject.data) {
                if (routePageObject.data.label) {
                  _workspaceValSvc.getLocalizedText(routePageObject.data.label).then(function (result) {
                    pageObj.cellHeader1 = result;
                  });
                }
              }

              pageObj.cellHeader2 = availablePage;
              pageObj.modelType = 'pages';
              pageObj.typeIconURL = _awIconSvc.getTypeIconFileUrl(pageObj);

              if (!routePageObject.abstract && _.find(workspace.pageList, pageObj) === undefined) {
                workspace.pageList.push(pageObj);
              }
            }
          });
        });
      }

      workspace.pageCount = workspace.pageList.length;
      return workspace;
    });
  };
  /**
   * Get localized text for multiple labels.
   *
   * @param {Array} labels - If label is string, return as is. If it contains source and key, retrieve value from the
   *            locale file
   * @return {Promise} Which will resolve with map containing key to label mapping
   */


  exports.getMultipleLocalizedText = function (labels) {
    return _$q(function (resolve) {
      _.defer(function () {
        var promises = {};

        _.forEach(labels, function (label) {
          if (typeof label === 'string') {
            // If the label is a string just return it
            promises[label] = _$q.when(label);
          } else {
            // Otherwise get the label from the localized file
            promises[label.key] = _localeSvc.getLocalizedText(label.source, label.key);
          }
        });

        resolve(_$q.all(promises));
      });
    });
  };
  /**
   * Load the column configuration
   *
   * @param {Object} dataprovider - the data provider
   */


  exports.loadColumns = function (dataprovider) {
    dataprovider.columnConfig = {
      columns: [{
        name: 'object_string',
        displayName: 'object_string',
        typeName: 'WorkspaceObject',
        width: 150,
        pinnedLeft: true,
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false
      }]
    };
  };
  /**
   * This service provides necessary APIs to maintain various workspace objects and related objects.
   *
   * @memberof NgServices
   * @member workspaceService
   */


  app.factory('workspaceService', ['$q', 'localeService', 'uwPropertyService', 'configurationService', 'workspaceValidationService', 'appCtxService', 'awIconService', function ($q, localeSvc, uwPropertySvc, cfgSvc, workspaceValidationService, _appCtxSvc, awIconService) {
    _$q = $q;
    _localeSvc = localeSvc;
    _vmPropSvc = uwPropertySvc;
    _cfgSvc = cfgSvc;
    _workspaceValSvc = workspaceValidationService;
    _appCtxService = _appCtxSvc;
    _awIconSvc = awIconService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'workspaceService'
  };
});