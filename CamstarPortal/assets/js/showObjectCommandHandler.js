"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This is the command handler for show object command which is contributed to cell list.
 *
 * @module js/showObjectCommandHandler
 */
define(['app', 'js/pasteService', 'js/commandsMapService', 'soa/kernel/clientDataModel', 'js/adapterService', 'js/command.service'], function (app) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _commandsMapSvc = null;
  var _cdm = null;
  var _pasteSvc = null;
  /**
   * Cached AdapterService
   */

  var _adapterSvc = null;
  var _commandSvc = null;
  /**
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  function _setCommandContextIn(context, $scope) {
    if (!_commandsMapSvc.isInstanceOf('Dataset', context.modelType) && !_commandsMapSvc.isInstanceOf('Folder', context.modelType)) {
      $scope.cellCommandVisiblilty = true;
    } else {
      $scope.cellCommandVisiblilty = false;
    }
  }
  /**
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  function _setCommandContextIn2(context, $scope) {
    if (!_commandsMapSvc.isInstanceOf('Folder', context.modelType)) {
      $scope.cellCommandVisiblilty = true;
    } else {
      $scope.cellCommandVisiblilty = false;
    }
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
    if (vmo && vmo.uid) {
      if (!openInEditMode) {
        var modelObject = _cdm.getObject(vmo.uid);

        var commandContext = {
          vmo: modelObject || vmo,
          // vmo needed for gwt commands
          edit: false
        };

        _commandSvc.executeCommand('Awp0ShowObjectCell', null, null, commandContext);
      } else {
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
    }
  }
  /**
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
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
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  exports.setCommandContext2 = function (context, $scope) {
    if (context.type === 'Awp0XRTObjectSetRow') {
      var adaptedObjsPromise = _adapterSvc.getAdaptedObjects([$scope.vmo]);

      adaptedObjsPromise.then(function (adaptedObjs) {
        _setCommandContextIn(adaptedObjs[0], $scope);
      });
    } else {
      _setCommandContextIn2(context, $scope);
    }
  };
  /**
   * Paste the 'sourceObjects' onto the 'targetObject' with the given 'relationType' and then open the 'createdObject'
   * in edit mode.
   *
   * @param {ModelObject} targetObject - The 'target' IModelObject for the paste.
   * @param {ModelObjectArray} sourceObjects - Array of 'source' IModelObjects to paste onto the 'target'
   *            IModelObject.
   * @param {String} relationType - Relation type name (object set property name)
   * @param {ViewModelObject} createdObject - Context for the command used in evaluating isVisible, isEnabled and
   *            during execution.
   * @param {Boolean} openInEditMode - Flag to indicate whether to open in edit mode.
   */


  exports.addAndEdit = function (targetObject, sourceObjects, relationType, createdObject) {
    _pasteSvc.execute(targetObject, sourceObjects, relationType).then(function () {
      exports.execute(createdObject, null, true);
    });
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
   * Show object command handler service which sets the visibility of the command in cell list based off object type.
   * This command is visible for all the object types except 'Dataset' and 'Folder'.
   *
   * @memberof NgServices
   * @member showObjectCommandHandler
   */


  app.factory('showObjectCommandHandler', ['commandsMapService', 'soa_kernel_clientDataModel', 'pasteService', 'adapterService', 'commandService', function (commandsMapSvc, cdm, pasteSvc, adapterSvc, commandSvc) {
    _commandsMapSvc = commandsMapSvc;
    _pasteSvc = pasteSvc;
    _cdm = cdm;
    _adapterSvc = adapterSvc;
    _commandSvc = commandSvc;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'showObjectCommandHandler'
  };
});