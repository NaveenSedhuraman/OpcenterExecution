"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive for the HTML panel, which is used to render CDATA in <htmlPanel> in XRT.
 *
 * @module js/aw-html-panel.directive
 */
define(['app', 'js/appCtxService', 'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * Directive for the HTML panel, which is used to render CDATA in <htmlPanel> in XRT.
   *
   * @member aw-html-panel
   * @memberof NgAttributeDirectives
   */

  app.directive('awHtmlPanel', //
  ['appCtxService', 'viewModelService', //
  function (appCtxSrv, viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      controller: ['$scope', function ($scope) {
        var ctx = appCtxSrv.ctx;
        var declViewModel = viewModelSvc.getViewModel($scope, true);

        if (declViewModel) {
          $scope.selected = {
            properties: declViewModel
          };
        } else {
          $scope.selected = {
            properties: ctx.selected.props
          };
        }

        $scope.session = {
          properties: ctx.session
        };
      }],
      template: '<div class="aw-jswidgets-htmlPanel" ng-transclude></div>',
      replace: true
    };
  }]);
});