"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display back button.
 *
 * @module js/aw-back-button.directive
 */
define(['app', //
'js/localeService', //
'js/aw-icon-button.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display back button.
   *
   * @example <aw-back-button></aw-back-button>
   *
   * @member aw-back-button
   * @memberof NgElementDirectives
   */

  app.directive('awBackButton', ['localeService', function (localeSvc) {
    return {
      restrict: 'E',
      scope: {
        title: '@',
        prePanelId: '@?',
        action: '@?'
      },
      controller: ['$scope', function ($scope) {
        $scope.backCommand = {
          iconName: 'Back',
          tooltip: '',
          destPanelId: $scope.prePanelId ? $scope.prePanelId : '',
          action: $scope.action ? $scope.action : ''
        };
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.backCommand.tooltip = localTextBundle.BACK_BUTTON_TITLE;
        });
      }],
      template: '<div><aw-icon-button command="backCommand" class="aw-layout-left"></aw-icon-button><div class="aw-layout-panelSectionTitle"><label>{{ title }}</label></div></div>',
      replace: true
    };
  }]);
});