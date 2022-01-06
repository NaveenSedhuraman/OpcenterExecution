"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw.master.details.panel.controller
 */
define(['app', //
'js/eventBus'], function (app, eventBus) {
  'use strict';
  /**
   * Defines the masterDetailsPanel controller.
   *
   * @member awMasterDetailsPanelController
   * @memberof NgControllers
   */

  app.controller('awMasterDetailsPanelController', //
  ['$scope', function ($scope) {
    $scope.$on('dataProvider.selectionChangeEvent', function (event, data) {
      var newSelection = data.selected[0];
      eventBus.publish('detailsPanel.inputChangedEvent', {
        selectedObject: newSelection
      });
    });
    $scope.$on('$destroy', function () {
      eventBus.unsubscribe('detailsPanel');
    });
  }]);
});