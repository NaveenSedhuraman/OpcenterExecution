"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display panel section.
 *
 * @module js/aw-panel-section.directive
 */
define(['app', 'lodash', 'js/eventBus', //
'js/aw-property-image.directive', //
'js/viewModelService', //
'js/localeService'], //
function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display panel section. Requires caption and name. The collapsed variable on scope is optional and by
   * default, all sections are set to collapsed = false in case the variable does not exist on the scope.
   *
   * @example <aw-panel-section caption="" name="" collapsed=""></aw-panel-section>
   *
   * @member aw-panel-section
   * @memberof NgElementDirectives
   */

  app.directive('awPanelSection', //
  ['viewModelService', 'localeService', //
  function (viewModelSvc, localeSvc) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        caption: '@?',
        name: '@?',
        collapsed: '@?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-panel-section.directive.html',
      replace: true,
      controller: ['$scope', function ($scope) {
        viewModelSvc.getViewModel($scope, true);
        localeSvc.getTextPromise().then(function (localTextBundle) {
          $scope.expand = localTextBundle.EXPAND;
          $scope.collapse = localTextBundle.COLLAPSE;
        });

        $scope.flipSectionDisplay = function () {
          $scope.$evalAsync(function () {
            if ($scope.isCollapsible) {
              $scope.collapsed = $scope.collapsed === 'true' ? 'false' : 'true';
              eventBus.publish('awPanelSection.collapse', {
                isCollapsed: $scope.collapsed === 'true',
                name: $scope.name,
                caption: $scope.caption
              });
            }
          });
        };
      }],
      link: function link($scope) {
        // developer test - collapse all sections by default. Will be deleted once getDeclarativeStylesheets
        // SOA starts providing this input
        // $scope.isCollapsed = true;
        $scope.$evalAsync(function () {
          $scope.isCollapsible = $scope.collapsed && $scope.collapsed.length > 0;
        }); // caption not have to be in "i18n.xxx" format

        if (_.startsWith($scope.caption, 'i18n.')) {
          $scope.$watch('data.' + $scope.caption, function _watchPanelCaption(value) {
            _.defer(function () {
              // if the i18n text is not available, assign the key to caption
              $scope.caption = value !== undefined ? value : $scope.caption.slice(5); // eslint-disable-line no-negated-condition

              $scope.$apply();
            });
          });
        } // add listener for panel section's title state update


        $scope.$on('captionTitleState.updated', function (event, eventData) {
          $scope.hideTitle = eventData.hideCaptionTitle;
        });
      }
    };
  }]);
});