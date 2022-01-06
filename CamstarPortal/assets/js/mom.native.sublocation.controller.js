"use strict";

// Copyright 2019 Siemens AG

/* global define */

/**
 * Defines the controller that should be used for all MOM SubLocation states.
 *
 * @module js/mom.native.sublocation.controller
 */
define(['app', 'angular', 'lodash', 'js/eventBus', 'js/logger', 'js/aw-include.directive', 'js/aw.native.sublocation.controller', 'js/mom-secondary-workarea.directive', 'js/appCtxService'], function (app, ngModule, _, eventBus) {
  'use strict';

  app.controller('MomNativeSubLocationCtrl', ['$scope', '$q', '$controller', 'appCtxService', function ($scope, $q, $controller, appCtxSvc) {
    var ctrl = this; //eslint-disable-line consistent-this, no-invalid-this

    ngModule.extend(ctrl, $controller('NativeSubLocationCtrl', {
      $scope: $scope
    }));
    var ctxSubscription = eventBus.subscribe("appCtx.*", function (data) {
      if (data.name === 'ViewModeContext') {
        // Make ViewMode semi-persistent when navigating/reloading the same state.
        if (data.value && data.value.ViewModeContext && data.value.ViewModeContext !== 'None') {
          appCtxSvc.registerCtx('preferences.AW_SubLocation_Generic_ViewMode', [data.value.ViewModeContext]);
        }
      }
    });
    $scope.$on('$destroy', function () {
      eventBus.unsubscribe(ctxSubscription);
    });

    if ($scope.breadcrumbConfig) {
      $scope.breadcrumbConfig.vm = $scope.breadcrumbConfig.vm || 'momNavigateBreadcrumb';
      $scope.breadcrumbConfig.crumbDataProvider = $scope.breadcrumbConfig.crumbDataProvider || 'momBreadcrumbDataProvider';
    }
  }]);
});