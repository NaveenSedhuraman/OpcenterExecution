"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgControllers.RootController}
 *
 * @module js/aw.root.controller
 * @requires app
 */
define(['app', 'js/appCtxService'], function (app) {
  'use strict';

  app.controller('RootController', ['$scope', 'appCtxService', function ($scope, appCtxService) {
    $scope.ctx = appCtxService.ctx;
  }]);
});