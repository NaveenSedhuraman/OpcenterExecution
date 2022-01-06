"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define

 */

/**
 * This is the command handler for open in NewTab
 *
 * @module js/openInNewTabCommandHandler
 */
define([//
'app', //
'js/navigationUtils', //
'js/commandsMapService'], //
function (app, navigationUtils) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _commandsMapSvc = null;
  /**
   * Set command context for command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  exports.setCommandContext = function (context, $scope) {
    if (_commandsMapSvc.isInstanceOf('BusinessObject', context.modelType)) {
      $scope.cellCommandVisiblilty = true;
    } else {
      $scope.cellCommandVisiblilty = false;
    }
  };
  /**
   * Execute the command.
   * <P>
   * The command context should be setup before calling isVisible, isEnabled and execute.
   *
   * @param {ViewModelObject} vmo - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   */


  exports.execute = function (vmo) {
    var url = navigationUtils.urlProcessing(vmo);
    var openLink = window.open('', '_blank');
    openLink.location = url;
  };
  /**
   * Open in new tab command handler service which sets the visibility of the command in cell list based off object
   * type. This command is visible for all the object types
   *
   * @memberof NgServices
   * @member viewFileCommandHandler
   */


  app.factory('openInNewTabCommandHandler', ['commandsMapService', //
  function (commandsMapSvc) {
    _commandsMapSvc = commandsMapSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'openInNewTabCommandHandler'
  };
});