"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the command handler for open in NewTab
 *
 * @module js/openInNewWindowCommandHandler
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
   * Initialize the command handler service
   *
   */


  exports.init = function () {// no-op
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
    var width = window.outerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var height = window.outerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var url = navigationUtils.urlProcessing(vmo);
    var openLink = window.open('', '_blank', 'top=10,left=10,height=' + height + ',width=' + width + ',location=yes,menubar=yes,titlebar=yes,toolbar=yes,resizable=yes,scrollbars=yes');
    openLink.location = url;
  };
  /**
   * Open in new window command handler service which sets the visibility of the command in cell list based off object
   * type. This command is visible for all the object types.
   *
   * @memberof NgServices
   * @member viewFileCommandHandler
   */


  app.factory('openInNewWindowCommandHandler', ['commandsMapService', //
  function (commandsMapSvc) {
    _commandsMapSvc = commandsMapSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'openInNewWindowCommandHandler'
  };
});