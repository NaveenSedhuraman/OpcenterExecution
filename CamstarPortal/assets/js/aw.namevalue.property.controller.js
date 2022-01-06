"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw.namevalue.property.controller
 */
define(['app', 'jquery', 'js/localeService'], //
function (app, $) {
  'use strict';
  /**
   * Defines the name value property controller
   *
   * @member awNamevaluePropertyController
   * @memberof NgControllers
   */

  app.controller('awNamevaluePropertyController', //
  ['$scope', '$element', 'localeService', //
  function ($scope, $element, localeService) {
    var self = this;
    /**
     * Set overlay of container
     *
     * @memberof NgControllers.awNamevaluePropertyController
     * @param {Object} gridOverlay - overlay
     */

    self.setOverlay = function (gridOverlay) {
      $scope.prop = gridOverlay;
    };
    /**
     * Remove Row from the grid
     *
     * @memberof NgControllers.awNamevaluePropertyController
     *
     * @param {Object} event - event object
     */


    $scope.removeSelectedRow = function () {
      if ($scope.prop && $scope.prop.api.removeRows) {
        $scope.expanded = false;
        $scope.prop.api.removeRows();
      }
    };
    /**
     * Add Row to the Grid
     *
     * @memberof NgControllers.awNamevaluePropertyController
     *
     * @param {Object} event - event object
     */


    $scope.getNameValueTypes = function () {
      if ($scope.prop && $scope.prop.api.addNameValue) {
        $scope.prop.api.addNameValue();
      }
    };
    /**
     * Add title to the Remove button
     *
     * @memberof NgControllers.awNamevaluePropertyController
     *
     * @param {Object} event - event object
     */


    $scope.getRemoveTitle = function (event) {
      localeService.getTextPromise().then(function (localTextBundle) {
        $(event.currentTarget).attr('title', localTextBundle.REMOVE_BUTTON_TITLE);
      });
    };
    /**
     * Add title to the Add button
     *
     * @memberof NgControllers.awNamevaluePropertyController
     *
     * @param {Object} event - event object
     */


    $scope.getAddTitle = function (event) {
      localeService.getTextPromise().then(function (localTextBundle) {
        $(event.currentTarget).attr('title', localTextBundle.ADD_BUTTON_TITLE);
      });
    };
  }]); // awNameValuePropertyController
});