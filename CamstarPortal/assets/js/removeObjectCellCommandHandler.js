"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 document
 */

/**
 * This is the command handler for remove object from cell list.
 *
 * @module js/removeObjectCellCommandHandler
 */
define(['app'], function (app) {
  'use strict';

  var exports = {};
  /**
   * Set command context for remove object cell command which evaluates isVisible and isEnabled flags
   *
   * @param {ViewModelObject} context - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */

  exports.setCommandContext = function (context, $scope) {
    $scope.cellCommandVisiblilty = true;
  };
  /**
   * Execute the command.
   * <P>
   * The command context should be setup before calling isVisible, isEnabled and execute.
   *
   * @param {ViewModelObject} vmo - Context for the command used in evaluating isVisible, isEnabled and during
   *            execution.
   * @param {Object} $scope - scope object in which isVisible and isEnabled flags needs to be set.
   */


  exports.execute = function (vmo, $scope) {
    $scope.$emit('awList.removeObjects', {
      toRemoveObjects: [vmo]
    });
  };
  /**
   * Remove object command handler service.
   *
   * @memberof NgServices
   * @member showObjectCommandHandler
   */


  app.factory('removeObjectCellCommandHandler', [//
  function () {
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'removeObjectCellCommandHandler'
  };
});