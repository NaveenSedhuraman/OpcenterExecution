"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the command handler service for show object 'Dataset' command which is contributed to cell list.
 *
 * @module js/showObjectDatasetCommandHandler
 */
define(['app', 'js/commandsMapService', 'js/adapterService'], function (app) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _commandsMapSvc = null;
  /**
   * Cached AdapterService
   */

  var _adapterSvc = null;
  /**
   * Set command context for show object dataset cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  function _setCommandContextIn(context, $scope) {
    $scope.cellCommandVisiblilty = _commandsMapSvc.isInstanceOf('Dataset', context.modelType);
  }
  /**
   * Internal function to execute the command.
   * <P>
   * The command context should be setup before calling isVisible, isEnabled and execute.
   *
   * @param {ViewModelObject} vmo - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} dataCtxNode - scope object in which isVisible and isEnabled flags needs to be set.
   * @param {Boolean} openInEditMode - Flag to indicate whether to open in edit mode.
   */


  function _executeAction(vmo, dataCtxNode, openInEditMode) {
    var $state = app.getInjector().get('$state');

    if (vmo && vmo.uid) {
      var showObject = 'com_siemens_splm_clientfx_tcui_xrt_showObject';
      var toParams = {};
      var options = {};
      toParams.uid = vmo.uid;

      if (openInEditMode) {
        toParams.edit = 'true';
      }

      options.inherit = false;
      $state.go(showObject, toParams, options);
    }
  }
  /**
   * Set command context for show object dataset cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  exports.setCommandContext = function (context, $scope) {
    if (context.type === 'Awp0XRTObjectSetRow') {
      var adaptedObjsPromise = _adapterSvc.getAdaptedObjects([$scope.vmo]);

      adaptedObjsPromise.then(function (adaptedObjs) {
        _setCommandContextIn(adaptedObjs[0], $scope);
      });
    } else {
      _setCommandContextIn(context, $scope);
    }
  };
  /**
   * Execute the command.
   * <P>
   * The command context should be setup before calling isVisible, isEnabled and execute.
   *
   * @param {ViewModelObject} vmo - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} dataCtxNode - scope object in which isVisible and isEnabled flags needs to be set.
   * @param {Boolean} openInEditMode - Flag to indicate whether to open in edit mode.
   */


  exports.execute = function (vmo, dataCtxNode, openInEditMode) {
    if (vmo.type === 'Awp0XRTObjectSetRow') {
      var adaptedObjsPromise = _adapterSvc.getAdaptedObjects([vmo]);

      adaptedObjsPromise.then(function (adaptedObjs) {
        _executeAction(adaptedObjs[0], dataCtxNode, openInEditMode);
      });
    } else {
      _executeAction(vmo, dataCtxNode, openInEditMode);
    }
  };
  /**
   * Show object Dataset command's handler service which sets the visibility of the command in cell list based off
   * object type. This command is visible if the object type is 'Dataset'.
   *
   * @memberof NgServices
   * @member showObjectDatasetCommandHandler
   */


  app.factory('showObjectDatasetCommandHandler', ['commandsMapService', 'adapterService', //
  function (commandsMapSvc, adapterSvc) {
    _commandsMapSvc = commandsMapSvc;
    _adapterSvc = adapterSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'showObjectDatasetCommandHandler'
  };
});