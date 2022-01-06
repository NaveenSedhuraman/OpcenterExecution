"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to show command in aw-static-list
 *
 * @module js/aw-static-list-command.directive
 * @requires app
 * @requires js/aw-icon.directive
 * @requires js/aw-list-command.directive
 * @requires js/aw-cell-command-bar.directive
 */
define(['app', 'js/aw-list-command.directive', 'js/aw-cell-command-bar.directive', 'js/aw-icon.directive'], function (app) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Directive to display command for aw-static-list item. Just a simple wrapper for commandContext from performance consediration.
   *
   * @example <aw-static-list-command></aw-static-list-command>
   *
   * @member aw-static-list-command
   * @memberof NgElementDirectives
   */

  app.directive('awStaticListCommand', [function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-static-list-command.directive.html',
      link: function link($scope) {
        // Setup scope based on item
        $scope.context = {
          vmo: $scope.item
        };
      }
    };
  }]);
});