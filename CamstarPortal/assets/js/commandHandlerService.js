"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This is the primary service used to create, test and manage the internal properties of CommandHandler Objects used in
 * AW.
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/commandHandlerService
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'js/appCtxService', 'js/iconService'], function (app, _, eventBus, logger) {
  'use strict';
  /**
   * Define the base object used to provide all of this module's external API.
   *
   * @private
   */

  var exports = {};
  var _$q = null;
  var _appCtxService = null;
  var _iconService = null;
  /**
   * Hide the command panel if the handler is active
   *
   * @param {CommandHandler} commandHdlr - The command handler
   */

  var hideIfActive = function hideIfActive(commandHdlr) {
    var activeCommandContexts = ['activeNavigationCommand', 'activeToolsAndInfoCommand', 'sidenavCommandId'];
    var commandIdArray = [];
    activeCommandContexts.forEach(function (ctx) {
      // Zero compile commands share visibility which means the "open" command will only have same commandId
      var isCommandOpen = _appCtxService.getCtx(ctx + '.commandId') && _appCtxService.getCtx(ctx + '.commandId') === commandHdlr.commandId || _appCtxService.getCtx(ctx) && _appCtxService.getCtx(ctx) === commandHdlr.commandId;

      if (isCommandOpen) {
        var commandId = _appCtxService.getCtx(ctx + '.commandId') === commandHdlr.commandId ? _appCtxService.getCtx(ctx + '.commandId') : _appCtxService.getCtx(ctx);

        if (!commandIdArray.includes(commandId)) {
          eventBus.publish('awsidenav.openClose', {
            id: ctx === 'activeNavigationCommand' ? 'aw_navigation' : ctx === 'activeToolsAndInfoCommand' ? 'aw_toolsAndInfo' : null,
            commandId: commandId
          });
          commandIdArray.push(commandId);
        }
      }
    });
  };
  /**
   * Get and wrap command icon
   *
   * @param {String} iconId - Icon id
   * @param {String} commandId - Icon id
   * @returns {String} Icon wrapped in html
   */


  var getCommandIcon = function getCommandIcon(iconId, commandId) {
    if (iconId === '' || iconId === undefined) {
      logger.warn('Command ' + commandId + ' contributed via commandsViewModel should have an iconId.');
      return '';
    }

    return '<div class="aw-commands-svg">' + _iconService.getIcon(iconId) + '</div>';
  };

  exports.getCommandIcon = getCommandIcon;
  /**
   * Change the icon of a command handler
   *
   * @param {CommandHandler} commandHdlr Handler to update
   * @param {String} iconId Icon id
   */

  exports.setIcon = function (commandHdlr, iconId) {
    commandHdlr.iconId = iconId;
    commandHdlr.icon = getCommandIcon(iconId, commandHdlr.commandId);
  };
  /**
   * Set 'isVisible' state of command handler
   *
   * @param {CommandHandler} commandHdlr - command handler object that will be updated
   * @param {Boolean} isVisible - is visible flag
   */


  exports.setIsVisible = function (commandHdlr, isVisible) {
    if (commandHdlr.visible !== isVisible) {
      commandHdlr.visible = isVisible;

      if (!commandHdlr.visible) {
        hideIfActive(commandHdlr);
      }
    }
  };
  /**
   * Set 'isEnabled' state of command handler
   *
   * @param {CommandHandler} commandHdlr - command handler object that will be updated
   * @param {Boolean} isEnabled - is enabled flag
   */


  exports.setIsEnabled = function (commandHdlr, isEnabled) {
    if (commandHdlr.enabled !== isEnabled) {
      commandHdlr.enabled = isEnabled;

      if (!commandHdlr.enabled) {
        hideIfActive(commandHdlr);
      }
    }
  };
  /**
   * Set 'isSelected' state of the command
   *
   * @param {CommandHandler} commandHdlr - command handler object that will be updated
   * @param {boolean} isSelected - is selected flag
   */


  exports.setSelected = function (commandHdlr, isSelected) {
    commandHdlr.isSelected = isSelected;
  };
  /**
   * Set 'isGroupCommand' of command handler
   *
   * @param {CommandHandler} commandHdlr - command handler object that will be updated
   * @param {Boolean} nameToken - is group command flag
   * @returns {Promise} Promise resolved when done
   */


  exports.getPanelLifeCycleClose = function (commandHdlr, nameToken) {
    var deferred = _$q.defer();

    commandHdlr.callbackApi.getPanelLifeCycleClose(nameToken, deferred);
    return deferred.promise;
  };
  /**
   * Do any setup the command handler requires before creating the view
   *
   * @param {CommandHandler} commandHdlr - The command handler
   *
   * @return {Promise} A promise resolved when done
   */


  exports.setupDeclarativeView = function (commandHdlr) {
    var deferred = _$q.defer();

    commandHdlr.setupDeclarativeView(deferred);
    return deferred.promise;
  };
  /**
   * Change the icon/title that a toggle command is currently using
   *
   * @param {Object} commandExecuted - Whether the command was executed
   * @param {Object} selectionValueOnEvent - Whether the command was selected
   * @param {Object} outputCommand - Command overlay
   */


  exports.swapIconTitle = function (commandExecuted, selectionValueOnEvent, outputCommand) {
    var tempIconId;
    var tempTitle;
    var tempExtendedTitle;

    if (commandExecuted) {
      if (_.isUndefined(outputCommand.selectedIconId)) {
        tempIconId = outputCommand.iconIdWithoutSelection;
      } else {
        if (outputCommand.iconId === outputCommand.selectedIconId) {
          tempIconId = outputCommand.iconIdWithoutSelection;
        } else {
          tempIconId = outputCommand.selectedIconId;
        }
      }

      if (outputCommand.title === outputCommand.selectedTitle) {
        tempTitle = outputCommand.titleWithoutSelection;
      } else {
        tempTitle = outputCommand.selectedTitle ? outputCommand.selectedTitle : outputCommand.title;
      }
    } else {
      if (selectionValueOnEvent) {
        if (_.isUndefined(outputCommand.selectedIconId)) {
          tempIconId = outputCommand.iconIdWithoutSelection;
        } else {
          tempIconId = outputCommand.selectedIconId;
          tempTitle = outputCommand.selectedTitle ? outputCommand.selectedTitle : outputCommand.title;
          tempExtendedTitle = outputCommand.selectedExtendedTooltip;
        }

        if (_.isUndefined(outputCommand.selectedTitle)) {
          tempTitle = outputCommand.titleWithoutSelection;
        } else {
          tempTitle = outputCommand.selectedTitle;
          tempExtendedTitle = outputCommand.selectedExtendedTooltip;
        }
      } else {
        tempIconId = outputCommand.iconIdWithoutSelection;
        tempTitle = outputCommand.titleWithoutSelection;
        tempExtendedTitle = outputCommand.extendedtitleWithoutSelection;
      }
    }

    exports.setIcon(outputCommand, tempIconId);
    outputCommand.title = tempTitle;
    outputCommand.extendedTooltip = tempExtendedTitle !== undefined ? tempExtendedTitle : outputCommand.extendedTooltip;
  };
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * This is the primary service used to create, test and manage the properties of CommandHandler Objects used in
   * AW.
   *
   * @memberof NgServices
   * @member commandHandlerService
   */


  app.factory('commandHandlerService', ['$q', 'appCtxService', 'iconService', function ($q, appCtxService, iconService) {
    _$q = $q;
    _appCtxService = appCtxService;
    _iconService = iconService;
    return exports;
  }]);
});