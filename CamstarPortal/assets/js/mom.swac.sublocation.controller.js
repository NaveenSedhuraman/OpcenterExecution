"use strict";

// Copyright 2019 Siemens AG

/* global define */

/**
 * Defines the controller that should be used for all MOM SWAC SubLocation states.
 *
 * @module js/mom.swac.sublocation.controller
 */
define(['app', 'angular', 'lodash', 'js/logger', 'js/browserUtils', 'js/eventBus', 'js/swac/swac-include.directive', 'js/aw-base-sublocation.directive', 'js/aw.native.sublocation.controller', 'js/mom.native.sublocation.controller', 'js/configurationService', 'js/mom.swac.compatibility.service'], function (app, ngModule, _, logger, browserUtils, eventBus) {
  'use strict';

  app.controller('MomSwacSubLocationCtrl', ['$scope', '$state', '$controller', 'momSwacCompatibilityService', 'configurationService', function ($scope, $state, $controller, momSwacCompatibilityService, configurationService) {
    var ctrl = this; //eslint-disable-line consistent-this, no-invalid-this

    var momSwacScreens = browserUtils.getUrlAttributes().momSwacScreens;
    ngModule.extend(ctrl, $controller('MomNativeSubLocationCtrl', {
      $scope: $scope
    }));
    momSwacCompatibilityService.init(); // SWAC Screen configuration

    configurationService.getCfg(momSwacScreens || 'mom-swac-screens').then(function (cfg) {
      $scope.screens = cfg.screens || {};
      $scope.defaultScreen = cfg.default;
      $scope.screen = $state.params.screen || $scope.defaultScreen;

      if (Object.keys($scope.screens).length === 0) {
        logger.error('No SWAC Screens defined in the mom-swac-screens.json configuration file.');
        return;
      }

      if (!$scope.screen) {
        logger.error('No SWAC Screen to display (no screen parameter specified and no default specified).');
        return;
      }

      if (cfg.componentUrl) {
        $scope.source = cfg.componentUrl;
      } else {
        $scope.source = $scope.screens[$scope.screen];
      }

      if (!$scope.source) {
        logger.error('Unknown SWAC Screen: ' + $scope.screen);
        return;
      }

      eventBus.publish('mom.swac.screen.loadStart', {
        name: $scope.screen
      });
      logger.info('Loading SWAC Screen: ' + $scope.screen + ' -> ' + $scope.source);
    });
  }]);
});