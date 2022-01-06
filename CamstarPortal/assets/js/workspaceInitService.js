"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service provides necessary APIs to initialize workspace.
 *
 * @module js/workspaceInitService
 */
define(['app', 'lodash', 'js/eventBus'], //
function (app, _, eventBus) {
  'use strict';

  var exports = {};
  var _workspaceId = null;
  var _isWorkspaceChange = false;
  var _totalWorkspaceCount = null;
  eventBus.subscribe('sessionInfo.updated', function (extraInfoOut) {
    if (_workspaceId !== extraInfoOut.WorkspaceId) {
      _isWorkspaceChange = true;
    }

    _workspaceId = extraInfoOut.WorkspaceId ? extraInfoOut.WorkspaceId : '';
    _totalWorkspaceCount = extraInfoOut.WorkspacesCount ? parseInt(extraInfoOut.WorkspacesCount) : 0;
  });
  /**
   * Get workspace Id
   *
   * @return {String} Workspace Id
   */

  exports.getWorkspaceId = function () {
    return _workspaceId;
  };
  /**
    * Get the flag for the workspace change
    *
    * @return {String} Workspace Id
    */


  exports.getisWorkspaceChange = function () {
    return _isWorkspaceChange;
  };
  /**
   * Get total workspace count
   *
   * @return {integer} Total workspace count
   */


  exports.getTotalWorkspaceCount = function () {
    return _totalWorkspaceCount;
  };
  /**
   * This service provides necessary APIs to initialize workspace.
   *
   * @memberof NgServices
   * @member workspaceInitService
   */


  app.factory('workspaceInitService', [function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'workspaceInitService'
  };
});