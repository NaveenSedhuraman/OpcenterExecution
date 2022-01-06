"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw.table.property.controller
 */
define(['app', 'jquery', //
'js/localeService'], //
function (app, $) {
  'use strict';
  /**
   * Defines the table property controller
   *
   * @memberof NgControllers
   * @member awTablePropertyController
   */

  app.controller('awTablePropertyController', //
  ['$scope', '$element', 'localeService', //
  function ($scope, $element, localeSvc) {
    var self = this;

    self.setOverlay = function (gridOverlay) {
      $scope.prop = gridOverlay;
    };

    $scope.removeSelectedRow = function () {
      if ($scope.prop && $scope.prop.api.removeRows) {
        $scope.prop.api.removeRows();
      }
    };

    $scope.addTableRow = function () {
      if ($scope.prop && $scope.prop.api.addNewRow) {
        $scope.prop.api.addNewRow();
      }
    };

    $scope.getRemoveTitle = function (event) {
      localeSvc.getTextPromise().then(function (localTextBundle) {
        $(event.currentTarget).attr('title', localTextBundle.REMOVE_BUTTON_TITLE);
      });
    };

    $scope.getAddTitle = function (event) {
      localeSvc.getTextPromise().then(function (localTextBundle) {
        $(event.currentTarget).attr('title', localTextBundle.ADD_BUTTON_TITLE);
      });
    };
  }]);
});