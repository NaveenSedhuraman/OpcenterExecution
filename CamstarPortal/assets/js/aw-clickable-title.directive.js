"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support configurable clickable cell title implementation.
 *
 * @module js/aw-clickable-title.directive
 */
define(['app', 'js/aw-property-non-edit-val.directive', 'js/exist-when.directive', 'js/configurationService', 'js/clickableTitleService'], function (app) {
  'use strict';
  /**
   * Directive for default cell content implementation.
   *
   * @example <aw-clickable-title title="Clicktable title text" id="CellTitle"></aw-clickable-title>
   * @example <aw-clickable-title prop="prop" id="CellTitle"></aw-clickable-title>
   *
   * @member aw-clickable-title
   * @memberof NgElementDirectives
   */
  // app.directive( 'awClickableTitle', [ 'configurationService', '$timeout', 'clickableTitleService',
  // function( configurationService, $timeout, clickableTitleService ) {

  app.directive('awClickableTitle', ['clickableTitleService', function (clickableTitleService) {
    return {
      replace: true,
      restrict: 'E',
      scope: {
        id: '@?',
        prop: '=?',
        source: '@',
        title: '@?',
        vmo: '='
      },
      transclude: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-clickable-title.directive.html',
      link: function link($scope) {
        $scope.commandContext = {
          vmo: $scope.vmo
        };
        $scope.isTitleClickable = clickableTitleService.hasClickableCellTitleActions();

        $scope.doIt = function ($event) {
          clickableTitleService.doIt($event, $scope);
        };
      }
    };
  }]);
});