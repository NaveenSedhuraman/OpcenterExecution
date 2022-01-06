"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a popup-widget by clicking on the link, and showing up the list of items in the popup widget.
 *
 * @module js/aw-link-with-popup-menu.directive
 */
define(['app', 'lodash', 'js/eventBus', 'js/aw-link-with-popup-menu.controller', 'js/aw-link-with-popup.directive'], //
function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display a popup-widget by clicking on the link and show the list of items in the popup widget.
   *
   * @example <aw-link-with-popup-menu prop = "data.textLink" dataprovider= "data.revRule"></aw-link-with-popup-menu>
    *@attribute isCache : a consumer can specify true or false for the attribute.
   * If set to true/undefined : if the provided value is true, the dataProvider is initialized on the click of the link and it's response will be cached
   * and the this will be used in subsequent click on the link.
   * If set to false : if the provided value is false, the dataProvider is initialized on every click of the link.
   * <aw-link-with-popup-menu prop="ctx.userSession.props.awp0RevRule" dataprovider="data.dataProviders.revisionLink" is-cache="false"></aw-link-with-popup-menu>
   * @member aw-link-with-popup-menu
   * @memberof NgElementDirectives
   */
  // Map of property name as a key and initialization status as value

  var propertyinitializationMap = {};
  app.directive('awLinkWithPopupMenu', [function () {
    return {
      restrict: 'E',
      scope: {
        prop: '=',
        id: '@',
        dataprovider: '=',
        displayProperty: '@',
        useIcon: '<?',
        disable: '<',
        isCache: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-link-with-popup-menu.directive.html',
      controller: 'awLinkWithPopupMenuController',
      link: function link($scope) {
        if ($scope.prop && !propertyinitializationMap[$scope.prop.propertyName]) {
          var eventData = {
            property: $scope.prop
          };
          propertyinitializationMap[$scope.prop.propertyName] = true;
          eventBus.publish('awlinkPopup.initialized', eventData);
        }

        $scope.$watch('prop.uiValue', function (newValue) {
          _.defer(function () {
            if (newValue && newValue !== '' && newValue !== undefined) {
              $scope.prop.propertyDisplayName = newValue;
            }
          });
        });
        var unRegisterPopupInitEvent = $scope.$on('awPopupWidget.init', function () {
          if (!$scope.disable) {
            _.defer(function () {
              $scope.showLinkPopUp();
            });
          }
        }); // And remove it when the scope is destroyed

        $scope.$on('$destroy', function () {
          unRegisterPopupInitEvent();
        });
      }
    };
  }]);
});