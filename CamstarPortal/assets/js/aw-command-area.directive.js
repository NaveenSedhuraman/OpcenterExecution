"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-command-area.directive
 */
define(['app', 'js/eventBus', 'js/aw-command-area.controller', 'js/appCtxService', 'js/aw-include.directive'], function (app, eventBus) {
  'use strict';
  /**
   * Defines the aw-command-area directive.
   *
   * @example <aw-command-area area="navigation"></aw-command-area area>
   *
   * @member aw-command-area
   * @memberof NgElementDirectives
   */

  app.directive('awCommandArea', ['appCtxService', function (appCtxService) {
    return {
      restrict: 'E',
      scope: {
        area: '@'
      },
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-command-area.directive.html',
      controller: 'awCommandAreaController',
      link: function link($scope, $element, $attrs, $controller) {
        var initialCommand = appCtxService.getCtx($controller._commandContext);

        if (initialCommand) {
          $controller.updateCommand(initialCommand);
        } // When the active command context changes update the command display


        var subDef = eventBus.subscribe('appCtx.register', function (data) {
          if (data.name === $controller._commandContext) {
            $controller.updateCommand(data.value);
          }
        }); // Remove listener when scope is destroyed

        $scope.$on('$destroy', function () {
          if ($scope.command) {
            $scope.command.isSelected = false;
            $scope.command = null;
          }

          eventBus.unsubscribe(subDef);
        });
      }
    };
  }]);
});