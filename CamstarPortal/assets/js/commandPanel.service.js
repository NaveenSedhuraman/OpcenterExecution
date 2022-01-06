"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines {@link NgServices.commandPanelService} which manages command panels.
 *
 * @module js/commandPanel.service
 */
define(['app', 'js/eventBus', 'js/appCtxService'], function (app, eventBus) {
  'use strict';
  /**
   * Command service to manage commands.
   *
   * @param appCtxService {Object} - App context service
   */

  app.service('commandPanelService', ['appCtxService', function (appCtxService) {
    /**
     * Activate a command. Closes any panel that is open in the opposite panel location. If the command jas the
     * same is as the command active at that location it will be closed. If any setup is required for the
     * command just wrap this service.
     *
     * @param {String} commandId - ID of the command to open. Should map to the view model to activate.
     * @param {String} location - Which panel to open the command in. "aw_navigation" (left edge of screen) or "aw_toolsAndInfo" (right edge of screen)
     * @param {Object} context - The panel context.
     * @param {Boolean} push - Optional parameter to push workarea content when opening command panel
     * @param {Boolean} closeWhenCommandHidden - Optional parameter to disable the automatic closing of the panel when a command is hidden. Defaults to true.
     * @param {Object} config - Optional parameter to override the configuration attributes of sidenav, which includes width, height and slide.
     */
    this.activateCommandPanel = function (commandId, location, context, push, closeWhenCommandHidden, config) {
      //Create event data for awsidenav.openClose event
      //Create config object for achieving slide push
      config = config || {};

      if (push !== undefined) {
        config.slide = push === true ? 'PUSH' : 'FLOAT';
      }

      var eventData = {
        id: location,
        commandId: commandId,
        includeView: commandId,
        command: {
          commandId: commandId,
          declarativeCommandId: commandId,
          closeWhenCommandHidden: closeWhenCommandHidden !== false,
          getDeclarativeCommandId: function getDeclarativeCommandId() {
            return commandId;
          },
          // Register panel context on activation of command
          setupDeclarativeView: function setupDeclarativeView(deferred) {
            if (context) {
              appCtxService.registerCtx('panelContext', context);
            }

            deferred.resolve();
          },
          // Unregister panel context on close of command
          callbackApi: {
            getPanelLifeCycleClose: function getPanelLifeCycleClose(_, deferred) {
              if (context) {
                appCtxService.unRegisterCtx('panelContext');
              }

              deferred.resolve();
            }
          }
        },
        config: config
      };
      eventBus.publish('awsidenav.openClose', eventData);
    };
  }]);
  return {
    moduleServiceNameToInject: 'commandPanelService'
  };
});