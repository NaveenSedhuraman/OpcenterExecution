"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-sidenav.controller
 */
define(['app', 'jquery', 'js/localStorage', 'js/appCtxService', 'js/commandHandlerService', 'js/command.service'], function (app, $, localStorage) {
  'use strict';

  app.controller('awSidenavController', ['$scope', '$attrs', 'appCtxService', 'commandHandlerService', 'commandService', function ($scope, $attrs, appCtx, commandHandlerSvc, commandService) {
    var localStorageTopicId = 'wysiwygChannel'; // Scope being used by the "background" command for the current panel

    var commandScope = null;
    var command = null; //Register activeToolsAndInfoCommand and activeNavigationCommand for backward compatibility
    //to support existing consumers in AW
    // Save the two location contexts here

    var currentLocationCtx = $attrs.id === 'aw_navigation' ? 'activeNavigationCommand' : $attrs.id === 'aw_toolsAndInfo' ? 'activeToolsAndInfoCommand' : null;
    var otherLocationCtx = $attrs.id === 'aw_navigation' ? 'activeToolsAndInfoCommand' : $attrs.id === 'aw_toolsAndInfo' ? 'activeNavigationCommand' : null;

    var handleCommand = function handleCommand(eventData) {
      if (eventData.command) {
        // If a panel in the other area is open, remove it's ctx value
        if (otherLocationCtx) {
          if (appCtx.getCtx(otherLocationCtx)) {
            appCtx.unRegisterCtx(otherLocationCtx);
          }
        }

        if (currentLocationCtx) {
          //Register current location ctx
          appCtx.registerCtx(currentLocationCtx, eventData.command);
        } // We need to evaluate command to catch the hideIfActive event


        if (eventData.command.closeWhenCommandHidden) {
          // Start evaluating the currently opened command in the background
          // When the command is hidden or disabled the panel will close even if command is not active anywhere else on page
          commandScope = $scope.$new();
          commandScope.ctx = appCtx.ctx; // Note: Command context cannot be handled generically as putting it somewhere this directive can reach it will result in a memory leak
          // Any command that opens a panel and needs command context must set "closeWhenCommandHidden" to true in command panel service action
          // and update their panel to know when to close

          commandScope.commandContext = null;
          commandService.getCommand(eventData.commandId, commandScope);
        } //Set the panel context


        commandHandlerSvc.setupDeclarativeView(eventData.command).then(function () {
          command = eventData.command;
        });
      }
    };
    /**
    * Close the currently opened command panel.
    *
    * @return {Promise} Promise resolved when panel has been closed
    */


    var removeCommandScope = function removeCommandScope() {
      if (command) {
        commandHandlerSvc.getPanelLifeCycleClose(command).then(function () {
          if (commandScope) {
            commandScope.$destroy();
            commandScope = null;
          }

          if (command) {
            command = null;
          }
        });
      }
    };

    var setSlideForPinnablePanel = function setSlideForPinnablePanel(sidenavOpened) {
      if ($scope.isPinnable) {
        if (sidenavOpened) {
          //Only required for primary navigation panel that can be pinned
          $scope.slide = $scope.pinned ? $scope.configProperties.push : $scope.configProperties.float;

          if ($scope.pinned) {
            $('.aw-layout-mainView').addClass('aw-global-navigationPanelPinned');
          }
        } else {
          //Need to make the slide revert to its initial state
          $scope.slide = $scope.configProperties.float;

          if ($scope.pinned) {
            $('.aw-layout-mainView').removeClass('aw-global-navigationPanelPinned');
          }
        }
      }
    };

    var toggleSidenav = function toggleSidenav(eventData) {
      if ($scope.currentCommandId !== eventData.commandId) {
        $scope.sidenavOpened = true;
        setSlideForPinnablePanel($scope.sidenavOpened);
        return;
      }

      $scope.sidenavOpened = !$scope.sidenavOpened;

      if (!$scope.sidenavOpened) {
        $scope.view = null;
      }

      setSlideForPinnablePanel($scope.sidenavOpened);
    };
    /**
     * This method will Create sidenav of type [ push OR float]
     * @param {object} eventData: Contain Active command Position
     *
     */


    $scope.createSidenav = function (eventData) {
      toggleSidenav(eventData);

      if (eventData.commandId) {
        if ($scope.sidenavOpened) {
          handleCommand(eventData);
          appCtx.registerCtx('sidenavCommandId', eventData.commandId); // Export env for wysiwyg

          if (localStorage.get(localStorageTopicId)) {
            localStorage.removeItem(localStorageTopicId);
          }

          localStorage.publish(localStorageTopicId, eventData.commandId);
        } else {
          removeCommandScope();

          if (currentLocationCtx) {
            appCtx.unRegisterCtx(currentLocationCtx);
          }

          appCtx.unRegisterCtx('sidenavCommandId');
        }
      }
    };

    $scope.closeSidenav = function (eventData) {
      if (!($scope.isPinnable && $scope.pinned)) {
        $scope.sidenavOpened = false;
        $scope.view = null;
      }

      if (!eventData.commandId) {
        if (appCtx.getCtx('sidenavCommandId')) {
          appCtx.unRegisterCtx('sidenavCommandId');
        }
      }

      removeCommandScope();
    };

    $scope.togglePinState = function () {
      $scope.pinned = !$scope.pinned;
      $('.aw-layout-mainView').toggleClass('aw-global-navigationPanelPinned');
      $scope.slide = $scope.pinned ? $scope.configProperties.push : $scope.configProperties.float;
    };

    $scope.configProperties = {
      large: 'LARGE',
      default: 'DEFAULT',
      full: 'FULL',
      standard: 'STANDARD',
      wide: 'WIDE',
      float: 'FLOAT',
      push: 'PUSH',
      right_to_left: 'RIGHT_TO_LEFT',
      left_to_right: 'LEFT_TO_RIGHT',
      isFloatPanel: function isFloatPanel() {
        return $scope.slide === this.float;
      },
      isPushPanel: function isPushPanel() {
        return $scope.slide === this.push;
      },
      isDefaultHeightPanel: function isDefaultHeightPanel() {
        return $scope.height === this.default;
      },
      isFullHeightPanel: function isFullHeightPanel() {
        return $scope.height === this.full;
      },
      isLargeHeightPanel: function isLargeHeightPanel() {
        return $scope.height === this.large;
      },
      isWideWidthPanel: function isWideWidthPanel() {
        return $scope.width === this.wide;
      },
      isStandardWidthPanel: function isStandardWidthPanel() {
        return $scope.width === this.standard;
      },
      isHeightWidthEqual: function isHeightWidthEqual() {
        return $scope.width === $scope.height;
      }
    };
  }]);
});