"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/* eslint-disable valid-jsdoc */

/**
 * A module exposing a custom element for a card to be used in home pages.
 * @module "js/mom-homepage-card.directive"
 */
define(['app', //
'js/aw-command-bar.directive', 'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * A custom element representing a card to be used in home pages.
   * @typedef "mom-homepage-card"
   * @property {Expression} image The path to an image to display in the card.
   * @property {Expression} anchor The anchor of the internal command bar that host the card commands.
   * @property {String} action The action to execute on click (overrides **anchor**).
   * @property {Expression} header The title of the card.
   * @implements {Element}
   * @example
   * <mom-homepage-card
   *      image="'path/to/image.png'"
   *      action="goToProjectHomePage"
   *      header="'Current Project'">
   *  This is the current project.
   * </mom-homepage-card>
   */

  app.directive('momHomepageCard', ['viewModelService', function (vmSvc) {
    return {
      restrict: 'E',
      scope: {
        image: '=',
        anchor: '=?',
        action: '@',
        header: '='
      },
      transclude: true,
      controller: ['$scope', function ($scope) {
        $scope.imageUrl = app.getBaseUrlPath() + '/image/' + $scope.image;

        $scope.execute = function (action) {
          if (action) {
            var declViewModel = vmSvc.getViewModel($scope, true);
            vmSvc.executeCommand(declViewModel, action, $scope);
          }
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/mom-homepage-card.html'
    };
  }]);
});