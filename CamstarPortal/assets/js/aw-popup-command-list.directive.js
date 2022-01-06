"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to create the command list
 *
 * @module js/aw-popup-command-list.directive
 */
define(['app', 'jquery', 'js/eventBus', 'js/aw-command.directive', 'js/aw-popup-command-cell.directive'], //
function (app, $, eventBus) {
  'use strict';
  /**
   * Directive to display list of items
   *
   * @example <aw-popup-command-list prop="prop"></aw-popup-command-list>
   *
   * @member aw-popup-command-list
   * @memberof NgElementDirectives
   */

  app.directive('awPopupCommandList', //
  [//
  function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        prop: '='
      },
      templateUrl: function templateUrl(elem, attrs) {
        return app.getBaseUrlPath() + '/html/aw-popup-command-list.directive.html';
      },
      controller: ['$scope', function ($scope) {}]
    };
  }]); // End RequireJS Define
});