"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Image cell directive to be used within a cell list
 *
 * @module js/aw-image-cell.directive
 * @requires app
 * @requires js/aw-image-cell.controller
 * @requires js/aw-default-cell-content.directive
 */
define(['app', 'js/aw-image-cell.controller', 'js/aw-default-cell-content.directive'], function (app) {
  'use strict';
  /**
   * Image cell directive to be used within a cell list
   *
   * @example <aw-image-cell vmo="model"></aw-image-cell>
   *
   * @member aw-image-cell
   * @memberof NgElementDirectives
   */

  app.directive('awImageCell', [function () {
    return {
      restrict: 'E',
      scope: {
        vmo: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-image-cell.directive.html',
      controller: 'ImageCellCtrl',
      link: function link($scope, $element, $attr, $controller) {
        $scope.$watch('vmo', $controller.updateIcon);
      }
    };
  }]);
});