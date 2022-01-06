"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define
 */

/**
 * Commands map service
 *
 * @module js/commandsMapService
 */
define(['app', 'js/logger'], function (app, logger) {
  'use strict';
  /**
   * This service performs actions to retrieve data
   *
   * @memberof NgServices
   * @member commandsMapService
   */

  app.service('commandsMapService', function () {
    var self = this;
    /**
     * Returns command handler overlay object for a given command id from factory.
     *
     * @param {Object} commandJsonObj - command JSON object which is give in declarative view model
     * @param {String} commandId - command id
     *
     * @return {Object} command handler overlay object for given command id.
     */

    self.getCommandOverlay = function () {
      logger.error('commandsMapService#getCommandOverlay is not supported, Use commandService.getCommand instead');
      return {};
    };
    /**
     * Returns True if this type is child of the give type.
     *
     * TODO: This should be a utility somewhere in CDM - has nothing to do with commands
     *
     * @param {String} typeName - name of class
     * @param {Object} modelType - view model object's model type.
     *
     * @return {Boolean} true if this type is child of the give type.
     */


    self.isInstanceOf = function (typeName, modelType) {
      return modelType && (typeName === modelType.name || modelType.typeHierarchyArray && modelType.typeHierarchyArray.indexOf(typeName) > -1);
    };
  });
});