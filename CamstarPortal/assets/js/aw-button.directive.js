"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a block button using xrt styling.
 *
 * @module js/aw-button.directive
 */
define(['app', 'js/analyticsService', //
'js/viewModelService', 'js/aw-click.directive'], //
function (app, analyticsSvc) {
  'use strict';
  /**
   * Directive to display a block button using xrt styling.
   *
   * @example <aw-button action="submit">Submit</aw-button>
   * @attribute action - the action will be called when clicked. This is a mandatory attribute.
   * @attribute default - for the default button.
   * @attribute buttonType - It takes one of the values ['sole', 'negative', 'disabled']. this is an optional attribute.
   * @attribute size - This is an optional attribute and can be used to dictate the horizontal layout. It can take one of the two value ['stretched', 'auto']. By default button is stretched.
   * @member aw-button
   * @memberof NgElementDirectives
   */

  app.directive('awButton', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        action: '@',
        default: '=?',
        buttonType: '@?',
        size: '@?'
      },
      controller: ['$scope', '$element', function ($scope, $element) {
        $scope.doit = function (action) {
          var declViewModel = viewModelSvc.getViewModel($scope, true); // get activeButtonDimension

          var elementPosition = $element[0].getBoundingClientRect();
          declViewModel.activeButtonDimension = {
            offsetHeight: elementPosition.height,
            offsetLeft: elementPosition.left,
            offsetTop: elementPosition.top,
            offsetWidth: elementPosition.width
          };
          viewModelSvc.executeCommand(declViewModel, action, $scope);
          var sanCommandData = {
            sanAnalyticsType: 'Button',
            sanCommandId: 'action_' + action,
            sanPanelID: declViewModel.getPanelId() && declViewModel.getPanelId() !== 'undefined' ? declViewModel.getPanelId() : ''
          };
          analyticsSvc.logCommands(sanCommandData);
        };

        if ($scope.default !== undefined && !$scope.default) {
          $element.addClass('aw-not-default-button');
        }
      }],
      link: function link($scope, $element) {
        if ($scope.buttonType === 'sole') {
          $element.addClass('aw-sole-button');
        } else if ($scope.buttonType === 'negative') {
          $element.addClass('aw-negative-button');
        } else if ($scope.buttonType === 'disabled') {
          $element.addClass('disabled');
        }

        $scope.isAuto = $scope.size === 'auto';
      },
      template: '<button class="aw-base-blk-button" ng-class="{\'aw-base-size-auto\':isAuto}" aw-click="doit(action)" aw-click-options="{ debounceDoubleClick: true }" ng-transclude ></button>',
      replace: true
    };
  }]);
});