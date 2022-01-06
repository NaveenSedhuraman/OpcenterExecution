"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a panel section.
 *
 * @module js/aw-command-panel-section.directive
 */
define(['app', 'lodash', 'js/eventBus', //
'js/aw-icon-button.directive', 'js/visible-when.directive', 'js/aw-command-bar.directive', 'js/aw-property-image.directive', //
'js/viewModelService', 'js/localeService'], //
function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display a panel section.
   *
   * @example <aw-command-panel caption="i18n.Workflow_Title">
   *
   * @member aw-command-panel-section
   * @memberof NgElementDirectives
   */

  app.directive('awCommandPanelSection', //
  ['viewModelService', 'localeService', //
  function (viewModelSvc, localeSvc) {
    //
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        caption: '@?',
        name: '@?',
        commands: '=?',
        anchor: '=?',
        context: '=?',
        collapsed: '@?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-command-panel-section.directive.html',
      replace: true,
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true); // initialize all default command condition to true

        _.forEach($scope.commands, function (command) {
          if (command.condition === undefined) {
            command.condition = true;
          }
        });

        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.expand = localTextBundle.EXPAND;
          $scope.collapse = localTextBundle.COLLAPSE;
        });

        $scope.flipSectionDisplay = function () {
          $scope.$evalAsync(function () {
            if ($scope.isCollapsible) {
              $scope.collapsed = $scope.collapsed === 'true' ? 'false' : 'true';
              eventBus.publish('awCommandPanelSection.collapse', {
                isCollapsed: $scope.collapsed === 'true',
                name: $scope.name,
                caption: $scope.caption
              });
            }
          });
        };
      }],
      link: function link($scope) {
        $scope.$evalAsync(function () {
          $scope.isCollapsible = $scope.collapsed && $scope.collapsed.length > 0;
        }); // caption not have to be in "i18n.xxx" format

        if (_.startsWith($scope.caption, 'i18n.')) {
          $scope.$watch('data.' + $scope.caption, function (value) {
            _.defer(function () {
              // if the i18n text is not available, assign the key to caption
              $scope.caption = value !== undefined ? value : $scope.caption.slice(5); // eslint-disable-line no-negated-condition

              $scope.$apply();
            });
          });
        }
      }
    };
  }]);
});