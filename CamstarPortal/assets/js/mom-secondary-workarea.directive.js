"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * Directive to display the secondary workarea.
 *
 * @module js/mom-secondary-workarea.directive
 */
define(['app', 'lodash', 'js/eventBus', 'js/aw-selection-summary.directive', 'js/editHandlerService', 'js/appCtxService' //
], function (app, _, eventBus) {
  'use strict';

  app.directive('momSecondaryWorkarea', ['editHandlerService', 'appCtxService', function (editHandlerService, appCtxSvc) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/mom-secondary-workarea.directive.html',
      scope: {
        viewBase: '=',
        selected: '=?' //The currently selected model objects

      },
      controller: ['$scope', function ($scope) {
        $scope.hasTcSessionData = !_.isUndefined(appCtxSvc.ctx.tcSessionData);
        $scope.momDetails = appCtxSvc.ctx.momDetails;
        $scope.momDisableEmptyComponent = appCtxSvc.ctx.momDisableEmptyComponent;
      }],
      link: function link($scope, $element) {
        var sash = $element.prev('.aw-layout-splitter');

        if (sash) {
          $scope.$watch(_.debounce(function updateInvisibleClass() {
            var width = $element.width();

            if (width < 300) {
              $element.addClass("invisible");
              sash.addClass("invisible");
            } else {
              $element.removeClass("invisible");
              sash.removeClass("invisible");
            }
          }), 250, {
            leading: false,
            trailing: true
          });
        } //Set selection source to secondary workarea


        $scope.$on('dataProvider.selectionChangeEvent', function (event, data) {
          data.source = 'secondaryWorkArea'; // Add secondaryWorkArea.selectionChangeEvent

          eventBus.publish('secondaryWorkArea.selectionChangeEvent', {
            selectionModel: data.selectionModel,
            dataCtxNode: $scope,
            dataProvider: data.dataProvider
          });
        });
      }
    };
  }]);
});