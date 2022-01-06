"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Definition for the (aw-tile) directive.
 *
 * @module js/aw-tile.directive
 */
define(['app', 'js/aw-tile.controller', 'js/aw-icon.directive', 'js/aw-tile-icon.directive', 'js/aw-right-click.directive', 'js/aw-long-press.directive'], function (app) {
  'use strict';
  /**
   * Definition for the (aw-tile) directive.
   *
   * @example <aw-tile tile="tile"></aw-tile>
   *
   * @member aw-tile
   * @memberof NgElementDirectives
   *
   * @returns {Object} - Directive's declaration details
   */

  app.directive('awTile', function () {
    return {
      restrict: 'E',
      scope: {
        tile: '='
      },
      controller: 'awTileController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-tile.directive.html'
    };
  });
});