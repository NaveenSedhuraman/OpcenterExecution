"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Definition for the (aw-tile-canvas) directive.
 *
 * @module js/aw-tile-canvas.directive
 */
define(['app', 'js/aw-tile-canvas.controller', 'js/aw-tile-group.directive'], function (app) {
  'use strict';
  /**
   * Definition for the (aw-tile-canvas) directive.
   *
   * @example <aw-tile-canvas tile-groups="tileGroups"></aw-tile-canvas>
   *
   * @member aw-tile-canvas
   * @memberof NgElementDirectives
   *
   * @returns {Object} - Directive's declaration details
   */

  app.directive('awTileCanvas', function () {
    return {
      restrict: 'E',
      scope: {
        tileGroups: '='
      },
      controller: 'awTileCanvasController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-tile-canvas.directive.html'
    };
  });
});