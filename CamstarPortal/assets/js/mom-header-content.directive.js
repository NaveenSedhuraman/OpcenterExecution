"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/**
 * @module js/mom-header-content.directive
 */
define(['app', 'js/eventBus', //
'js/aw-include.directive', 'js/aw-command-bar.directive', 'js/aw-row.directive', 'js/aw-column.directive', 'js/appCtxService'], //
function (app, eventBus) {
  'use strict';

  app.directive('awGlobalSearch', ['appCtxService', function (appCtxService) {
    return {
      restrict: 'E',
      scope: {},
      controller: ['$state', '$scope', function ($state, $scope) {
        $scope.viewBase = $state.current.data && $state.current.data.headerCustomContent || appCtxService.ctx.headerCustomContent;
        var headerCustomContentSubscription = eventBus.subscribe("appCtx.*", function (data) {
          if (data.name === 'headerCustomContent') {
            $scope.viewBase = data.value;
          }
        });
        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(headerCustomContentSubscription);
        });
      }],
      templateUrl: app.getBaseUrlPath() + '/html/mom-header-content.directive.html'
    };
  }]);
});