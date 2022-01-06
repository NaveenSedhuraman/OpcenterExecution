"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support standard layout implementation
 *
 * @module js/aw-master-details-panel.directive
 */
define(['app', 'lodash', 'angular', 'jquery', 'js/aw-column.directive', 'js/aw-splitter.directive', 'js/aw.master.details.panel.controller', 'js/aw-include.directive'], //
function (app) {
  'use strict';

  app.directive('awMasterDetailsPanel', [function () {
    return {
      restrict: 'E',
      scope: {
        master: '@',
        detailsPanel: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-master-details-panel.directive.html',
      controller: 'awMasterDetailsPanelController'
    };
  }]);
});