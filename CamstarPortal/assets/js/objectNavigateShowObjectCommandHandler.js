"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 angular,
 define,
 document
 */

/**
 * This is the command handler for show object command which is contributed to cell list for ObjectNavigate.
 *
 * @module js/objectNavigateShowObjectCommandHandler
 */
define([//
'app', //
'js/eventBus', 'js/showObjectCommandHandler' //
], //
function (app, eventBus) {
  'use strict';

  var exports = {};
  /**
   * Cached CommandsMapService
   */

  var _showObjectCommandHandler = null;
  /**
   * Set command context for show object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  exports.setCommandContext = function (context, $scope) {
    _showObjectCommandHandler.setCommandContext2(context, $scope);
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
    _showObjectCommandHandler.addAndEdit(targetObject, sourceObjects, relationType, createdObject);
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
    _showObjectCommandHandler.execute(vmo, dataCtxNode, openInEditMode);
  };
  /**
   * Show object command handler service which sets the visibility of the command in cell list based off object type.
   * This command is visible for all the object types except 'Dataset' and 'Folder'.
   *
   * @memberof NgServices
   * @member showObjectCommandHandler
   */


  app.factory('objectNavigateShowObjectCommandHandler', ['showObjectCommandHandler', //
  function (showObjectCommandHandler) {
    _showObjectCommandHandler = showObjectCommandHandler;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'objectNavigateShowObjectCommandHandler'
  };
});