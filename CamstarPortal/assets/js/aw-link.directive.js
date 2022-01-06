"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a link element
 *
 * @module js/aw-link.directive
 */
define(['app', 'js/viewModelService', 'js/command.service', 'js/aw-transclude.directive'], function (app) {
  'use strict';
  /**
   * Directive to display a link element
   *
   * <pre>
   * {String} action - The action to be performed when the link is clicked
   * {Object} prop - The property to display in the link
   * {Object} selectedprop (optional) - The property to be set when a link is selected. Used when you have
   *            multiple links calling the same action.
   * </pre>
   *
   * @example <aw-link action="clickAction" prop="linkProp" selectedProp="selectedProp"></aw-navigation-widget>
   *
   * @member aw-navigation-widget
   * @memberof NgElementDirectives
   */

  app.directive('awLink', ['viewModelService', 'commandService', function (viewModelSvc, commandService) {
    return {
      restrict: 'E',
      scope: {
        action: '@',
        prop: '=',
        commandId: '@',
        context: '=?',
        selectedprop: '=?',
        tabindex: '=?'
      },
      controller: ['$scope', '$element', function ($scope, $element) {
        /*
         * This is used for the automation as automation need the unique id for the locator . If
         * parent is passing the ID and it will get assigned to the link . This is for the
         * internal purpose.
         */
        if ($scope.$parent && $scope.$parent.id) {
          $scope.id = $scope.$parent.id;
        }

        $scope.doit = function (action, selectedProp) {
          if ($scope.commandId) {
            $scope.commandContext = $scope.prop;
            commandService.executeCommand($scope.commandId, null, $scope, null);
          } else if (action) {
            $scope.selectedprop = selectedProp;
            var declViewModel = viewModelSvc.getViewModel($scope, true); // adding Active link dimension positions

            var elementPosition = $element[0].getBoundingClientRect();
            declViewModel.activeLinkDimension = {
              offsetHeight: elementPosition.height,
              offsetLeft: elementPosition.left,
              offsetTop: elementPosition.top,
              offsetWidth: elementPosition.width
            };
            viewModelSvc.executeCommand(declViewModel, action, $scope);
          }
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-link.directive.html',
      link: function link($scope, $element) {
        // "replace: true" could have helped us too, but doesn't work in this case
        $element.addClass('afx-base-childElement');
      }
    };
  }]);
});