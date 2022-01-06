"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @deprecated : 'aw-title-link' is deprecated we should use <aw-link> instead.
 *
 * Directive to display a title link element
 *
 * @module js/aw-title-link.directive
 */
define(['app', 'js/viewModelService'], function (app) {
  'use strict';
  /**
   * Directive to display a title link element
   *
   * <pre>
   * {String} action - The action to be performed when the link is clicked
   * {Object} prop - The property to display in the link
   * </pre>
   *
   * @example <aw-title-link action="clickAction" prop="linkProp"></aw-title-link>
   *
   * @member aw-navigation-widget
   * @memberof NgElementDirectives
   */

  app.directive('awTitleLink', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      scope: {
        action: '@',
        prop: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.doit = function (action, selectedProp) {
          $scope.selectedprop = selectedProp;
          var declViewModel = viewModelSvc.getViewModel($scope, true);
          viewModelSvc.executeCommand(declViewModel, action, $scope);
        };
      }],
      template: '<div class="aw-layout-panelSectionTitle"> <a class="link-style-5" ng-click="doit(action, prop)">{{prop.propertyDisplayName}}</a></div>'
    };
  }]);
});