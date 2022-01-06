"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Container directive to add the contexts.
 *
 * @module js/aw-context-control.directive
 */
define(['app', 'lodash', 'js/eventBus', //
'js/appCtxService', 'js/conditionService', 'js/viewModelObjectService', 'js/contextContributionService', 'js/visible-when.directive', 'js/configurationService', 'js/workspaceService'], //
function (app, _, eventBus) {
  'use strict';
  /**
   * Container  directive to add the contexts.
   *
   * @example <aw-context-control></aw-context-control> *
   *
   * @member aw-context-control
   * @memberof NgElementDirectives
   */

  app.directive('awContextControl', ['appCtxService', 'viewModelObjectService', 'contextContributionService', 'configurationService', 'workspaceService', 'conditionService', function (appctxSvc, viewModelObjectSvc, contextSvc, cfgSvc, workSvc, conditionService) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        anchor: '@'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-context-control.directive.html',
      controller: ['$scope', function ($scope) {
        /*
         * once the view model gets populated with the data , flag gets the value true
         */
        $scope.ctx = appctxSvc.ctx;
        workSvc.getAvailableContexts(appctxSvc.ctx.workspace.workspaceId).then(function (workspaceContexts) {
          var filterContextList;
          var workSpaceFilterList = [];
          var allActivePlacements = [];
          var sortedActiveList;
          cfgSvc.getCfg('contextConfiguration').then(function (contextJson) {
            var AllContexts = {};

            if (contextJson.contexts) {
              var availContexts = Object.keys(contextJson.contexts);

              var allowedContexts = _.intersection(availContexts, workspaceContexts);

              if (allowedContexts && allowedContexts.length > 0) {
                filterContextList = allowedContexts;
              } else {
                filterContextList = availContexts;
              } // get only active sortedlist


              _.forEach(filterContextList, function (contextId) {
                var activePlacement = contextSvc.getAllPlacements(AllContexts, contextJson.placements, contextId, $scope);
                var isActivePlacementVisible = contextSvc.isPlacementVisible(activePlacement, $scope);

                if (isActivePlacementVisible) {
                  var activeView = _.get(contextJson.contexts, contextId);

                  var headerContri = _.assign(activePlacement, activeView);

                  allActivePlacements.push(headerContri);
                }
              });

              var anchorFilteredList = _.filter(allActivePlacements, {
                anchor: $scope.anchor
              });

              sortedActiveList = _.sortBy(anchorFilteredList, 'priority');
              $scope.$parent.contributedViews = _.map(sortedActiveList, 'view');
            }
          });
        });

        if ($scope.ctx.user && $scope.ctx.tcSessionData) {
          var userVMO = viewModelObjectSvc.createViewModelObject($scope.ctx.user);

          if (userVMO) {
            $scope.ctx.user = userVMO;
          }
        }

        if ($scope.ctx.userSession && $scope.ctx.userSession.uid) {
          $scope.ctx.userSession = viewModelObjectSvc.createViewModelObject($scope.ctx.userSession.uid, 'Edit');
        }

        $scope.$on('$destroy', function () {
          appctxSvc.unRegisterCtx('isNoProject');
          appctxSvc.unRegisterCtx('isCodeLovSet');
        });
      }]
    };
  }]);
});