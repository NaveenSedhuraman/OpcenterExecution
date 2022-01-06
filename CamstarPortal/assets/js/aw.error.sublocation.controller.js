"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the {@link NgControllers.ErrorSubLocationCtrl}
 *
 * @module js/aw.error.sublocation.controller
 * @requires app
 * @requires js/localeService
 */
define(['app', 'js/localeService'], function (app) {
  'use strict';
  /**
   * Error sublocation controller. Just shows a localized error message.
   *
   * @class ErrorSubLocationCtrl
   * @param $scope {Object} - Directive scope
   * @param localeService {Object} - Locale service
   * @memberOf NgControllers
   */

  app.controller('ErrorSubLocationCtrl', ['$scope', 'localeService', function ($scope, localeService) {
    localeService.getLocalizedText('UIMessages', 'MissingPageText').then(function (result) {
      $scope.error = result;
    });
  }]);
});