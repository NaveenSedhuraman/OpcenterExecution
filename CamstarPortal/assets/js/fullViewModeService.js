"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * Defines {@link fullViewModeService} which manages the Universal Viewer full screen/view layout
 *
 * @module js/fullViewModeService
 */
define(['app', 'jquery', 'js/eventBus', //
'js/appCtxService', 'js/commandHandlerService', 'js/command.service'], //
function (app, $, eventBus) {
  'use strict';

  var exports = {};
  var appCtxSvc = null;
  var commandService = null;
  var cmdHdlrService = null;
  /**
   * Class names to reference elements for full screen mode
   */

  var classesToHide = [".aw-layout-headerPanel", ".aw-layout-globalToolbarPanel", ".aw-layout-subLocationTitles", ".aw-layout-workareaTitle"];
  /**
   * Determines if Full View Mode is currently active
   *
   * @param cssClass {String} - The class name to identify hidden content
   * @function isFullViewModeActive
   * @memberOf NgServices.fullViewModeService
   */

  exports.isFullViewModeActive = function (cssClass) {
    var header = $(".aw-layout-headerPanel");

    if (header && header.hasClass(cssClass)) {
      return true;
    }

    return false;
  };
  /**
   * Removes specified CSS class name from elements
   *
   * @function removeClass
   * @param cssClass {String} - The class name to remove
   * @memberOf NgServices.fullViewModeService
   */


  exports.removeClass = function (cssClass) {
    var elements = $('.' + cssClass);

    if (elements && elements.length) {
      for (var inx = 0; inx < elements.length; inx++) {
        $(elements[inx]).removeClass(cssClass);
      }
    }
  };
  /**
   * Toggles command states
   *
   * @param commandId {String} - ID of target command
   * @param isEnabled {boolean} - True is command is enabled, false otherwise
   * @param isSelected {boolean} - True is command is selected, false otherwise
   * @function toggleCommandStates
   * @memberOf NgServices.fullViewModeService
   */


  exports.toggleCommandStates = function (commandId, isEnabled, isSelected) {
    commandService.getCommand(commandId).then(function (command) {
      if (command) {
        cmdHdlrService.setIsEnabled(command, isEnabled);
        cmdHdlrService.setIsVisible(command, isEnabled);
        cmdHdlrService.setSelected(command, isSelected);
      }
    });
  };
  /**
   * Updates context for viewer command visibility
   *
   * @param commandId {String} - ID of target command
   * @param isVisible {boolean} - True if target command is visible, false otherwise
   * @function updateViewerCommandContext
   * @memberOf NgServices.fullViewModeService
   */


  exports.updateViewerCommandContext = function (commandId, isVisible) {
    var context = appCtxSvc.getCtx('viewerContext');

    if (context && context.commands) {
      var command = context.commands[commandId];
      var narrowModeActive = $(document).width() < 460;

      if (narrowModeActive) {
        command.visible = narrowModeActive;
      } else {
        command.visible = isVisible;
      }
    }
  };
  /**
   * Updates context for command visibility
   *
   * @param commandId {String} - ID of target command
   * @param isVisible {boolean} - True if target command is visible, false otherwise
   * @function updateApplicationCommandContext
   * @memberOf NgServices.fullViewModeService
   */


  exports.updateApplicationCommandContext = function () {
    //  var contextFullScreen = appCtxSvc.ctx.fullscreen;
    var narrowModeActive = $(document).width() < 460;

    if (narrowModeActive) {
      appCtxSvc.registerCtx('fullscreen', narrowModeActive);
    } else {
      eventBus.publish('commandBarResized', {});
    }
  };
  /**
   * Toggles Full View Mode for Application. All other columns/sections other than Secondary workarea section will
   * be hidden/displayed based on current view state.
   *
   * @function toggleApplicationFullScreenMode
   * @memberOf NgServices.fullViewModeService
   */


  exports.toggleApplicationFullScreenMode = function () {
    // Check if One Step Full Screen command is active
    var fullViewModeActive = appCtxSvc.getCtx('fullscreen');
    var enabled = appCtxSvc.ctx.fullscreen && !appCtxSvc.ctx.isInHostedMode;

    if (fullViewModeActive) {
      // Exit full screen mode -- addition
      exports.removeClass("aw-viewerjs-hideContent"); // Update viewer command context

      var isFullScreenActive = exports.isFullViewModeActive("hidden");
      exports.updateViewerCommandContext("fullViewMode", !isFullScreenActive); //Update application command context based on Selection and UiConfig Mode

      exports.updateApplicationCommandContext();
      exports.toggleCommandStates('Awp0FullScreen', enabled, false);
      exports.toggleCommandStates('Awp0ExitFullScreen', !enabled, false); // Update full screen command enabled state

      appCtxSvc.registerCtx('fullscreen', !fullViewModeActive);
    } else {
      /**
       * Class names to reference elements for full screen mode
       *
       * aw-layout-headerPanel", ".aw-layout-globalToolbarPanel",".aw-layout-subLocationTitles",
       * ".aw-commandId-Awp0ModelObjListDisplayToggles" These classes visibility are handled through ng-class.
       *
       * Update full screen command enabled state
       */
      exports.toggleCommandStates('Awp0FullScreen', enabled, false);
      exports.toggleCommandStates('Awp0ExitFullScreen', !enabled, true); //Update application command context

      exports.updateApplicationCommandContext();
      appCtxSvc.registerCtx('fullscreen', !fullViewModeActive);
      exports.updateViewerCommandContext("fullViewMode", false);
    }
  };
  /**
   * Switch to full screen mode via universal viewer's fullscreen. It doesn't toggle as the exit fullscreen
   * functionality is overridden via
   *
   * @function toggleViewerFullScreenMode
   * @memberOf NgServices.fullViewModeService
   */


  exports.toggleViewerFullScreenMode = function () {
    // Switch to full screen mode via universal viewer's fullscreen
    for (var counter = 0; counter < classesToHide.length; counter++) {
      $(classesToHide[counter]).addClass("aw-viewerjs-hideContent");
    } // hide the panel section title and tab container if it is in SWA


    $("aw-sublocation-body").find('.aw-layout-panelSectionTitle').addClass("aw-viewerjs-hideContent");
    $("aw-sublocation-body").find(".aw-xrt-tabsContainer").addClass("aw-viewerjs-hideContent"); // Hide the primary work area only when secondary work area is visible

    if (!$(".aw-layout-secondaryWorkarea").hasClass("hidden")) {
      $(".aw-layout-primaryWorkarea").addClass("aw-viewerjs-hideContent");
    } // Hide the Toggle Display Commands


    $(".aw-commandbar-container .aw-commands-commandBarHorizontalLeft button#Awp0ModelObjListDisplayToggles").addClass("aw-viewerjs-hideContent"); // Hide sections excluding the one that contains viewer gallery

    var allColumns = $(".aw-xrt-columnContentPanel");

    if (allColumns && allColumns.length > 0) {
      for (var col = 0; col < allColumns.length; col++) {
        var checkViewIsPresent = $(allColumns[col]).find(".aw-viewer-gallery");

        if (checkViewIsPresent && checkViewIsPresent.length) {
          $(allColumns[col]).addClass('aw-viewerjs-fullViewActive');
        } else {
          $(allColumns[col]).addClass('aw-viewerjs-hideContent');
        }
      }
    }

    appCtxSvc.registerCtx('fullscreen', true); // Update full screen command enabled state

    exports.toggleCommandStates('Awp0FullScreen', false, false);
    exports.toggleCommandStates('Awp0ExitFullScreen', true, true); // Update viewer command context

    exports.updateViewerCommandContext("fullViewMode", false);
  };
  /**
   * The full view mode service
   *
   * @member fullViewModeService
   * @memberOf NgServices.fullViewModeService
   */


  app.factory('fullViewModeService', ['appCtxService', 'commandService', 'commandHandlerService', function (appContextService, _commandService, commandHandlerService) {
    // Initialize context variables
    appCtxSvc = appContextService;
    commandService = _commandService;
    cmdHdlrService = commandHandlerService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'fullViewModeService'
  };
});