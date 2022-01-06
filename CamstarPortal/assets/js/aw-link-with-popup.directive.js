"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a popup-widget by clicking on the link, and showing up the transcluded stuff in the popup
 * widget.
 *
 * @module js/aw-link-with-popup.directive
 */
define(['app', 'jquery', 'js/aw-link.directive', 'js/aw-icon.directive', 'js/aw-popup-panel.directive', 'js/aw-property-image.directive'], //
function (app, $) {
  'use strict';
  /**
   * Directive to display a popup-widget by clicking on the link and show the transcluded stuff in the popup widget.
   *
   * @example <aw-link-with-popup prop = "data.textLink"></aw-link-with-popup>
   *
   * @member aw-link-with-popup
   * @memberof NgElementDirectives
   */

  app.directive('awLinkWithPopup', [function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        prop: '=',
        id: '@',
        useIcon: '<?',
        disabled: '<'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-link-with-popup.directive.html',
      link: function link($scope, element) {
        $scope.showLinkPopUp = function (event) {
          // eslint-disable-line no-unused-vars
          if (!$scope.disabled) {
            var eventData = {
              popupUpLevelElement: $(element.find('aw-popup-panel')[0])
            };
            $scope.$emit('awPopupWidget.init', eventData);
            $scope.$broadcast('awPopupWidget.open', eventData);
          }
        };
      }
    };
  }]);
});