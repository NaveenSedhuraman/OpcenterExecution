"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Definition for the (aw-tile-group) directive.
 *
 * @module js/aw-tile-group.directive
 */
define(['app', 'js/aw-tile.directive'], function (app) {
  'use strict';
  /**
   * Definition for the (aw-tile-group) directive.
   *
   * @example <aw-tile-group tile-group="tileGroup"></aw-tile-group>
   *
   * @member aw-tile-group
   * @memberof NgElementDirectives
   *
   * @returns {Object} - Directive's declaration details
   */

  app.directive('awTileGroup', function () {
    return {
      restrict: 'E',
      scope: {
        tileGroup: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-tile-group.directive.html'
    };
  });
});