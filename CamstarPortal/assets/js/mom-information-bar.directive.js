"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/* eslint-disable valid-jsdoc */

/**
 * A module exposing a custom element representing an information bar.
 * @module "js/mom-information-bar.directive"
 */
define(['app', //
'js/aw-command-bar.directive', 'js/viewModelService'], //
function (app) {
  'use strict';
  /**
   * A custom element representing an information bar to show notes, help, success, warning, and errors.
   * @typedef "mom-information-bar"
   * @property {String} [icon=""] The name of a command icon (without the **cmd** prefix).
   * @property {String} [label=""] An optional title for the information bar.
   * @property {String} [type="note"] The type of information bar (one of the following: note, help, success, warning, error).
   * @property {String} [link-text=""] The text of the optional link to add at the end of the information bar.
   * @property {String} [link-action=""] The name of an action to execute when the optional link is clicked.
   * @implements {Element}
   * @example
   * <mom-information-bar
   *      icon="Info"
   *      type="help"
   *      linkAction="showExtraInfo"
   *      linkText="More information..."
   *      label="Markdown Support">
   *  You can use the Markdown markup language in the field below.
   * </mom-information-bar>
   */

  app.directive('momInformationBar', ['viewModelService', 'iconService', '$sce', function (vmSvc, iconSvc, $sce) {
    return {
      restrict: 'E',
      scope: {
        icon: '@',
        type: '@',
        linkText: '@',
        linkAction: '@',
        label: '@'
      },
      transclude: true,
      controller: ['$scope', function ($scope) {
        $scope.type = $scope.type || 'note';

        if (!$scope.icon) {
          $scope.iconSvg = null;
        } else {
          $scope.iconSvg = $sce.trustAsHtml(iconSvc.getCmdIcon($scope.icon.replace(/^cmd/, '')));
        }

        $scope.execute = function (action) {
          if (action) {
            var declViewModel = vmSvc.getViewModel($scope, true);
            vmSvc.executeCommand(declViewModel, action, $scope);
          }
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/mom-information-bar.html'
    };
  }]);
});