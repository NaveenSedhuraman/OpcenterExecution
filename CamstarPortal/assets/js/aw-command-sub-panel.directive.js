"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a sub panel
 *
 * @module js/aw-command-sub-panel.directive
 */
define(['app', 'js/eventBus', //
'js/panelContentService', 'js/viewModelService'], //
function (app, eventBus) {
  'use strict';
  /**
   * Note: Moved outside directive to avoid formatter level wrapping issue.
   */

  var template = '<form name=\'subPanelForm\' class=\'aw-layout-panelBody aw-layout-subPanelContent aw-layout-flexColumn\'><form>';
  /**
   * Directive to display a sub panel
   *
   * @example "<aw-command-sub-panel panel-id='{panelId}' visible-when=\"data.selectedTab.panelId=='{panelId}'\" ></aw-command-sub-panel>";
   *
   * @member aw-command-sub-panel
   * @memberof NgElementDirectives
   */

  app.directive('awCommandSubPanel', //
  ['panelContentService', 'viewModelService', //
  function (panelContentSvc, viewModelSvc) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        panelId: '@',
        isolateMode: '@?' // boolean flag to isolate view model loaded by this sub panel or not. Default is false.

      },
      template: template,
      controller: ['$scope', '$element', function ($scope, $element) {
        if (!$scope.panelId) {
          return;
        } // Get the 'declViewModel' of the command panel when sub panel loaded in composite mode


        var declViewModelTarget = null;
        var isolateMode = $scope.isolateMode === true || $scope.isolateMode === 'true';

        if (!isolateMode) {
          declViewModelTarget = viewModelSvc.getViewModel($scope, true);

          if (!declViewModelTarget.activeView) {
            declViewModelTarget.activeView = $scope.panelId;
          }
        } // load sub panel content


        panelContentSvc.getPanelContent($scope.panelId).then(function (declViewModelUrls) {
          // Populate and insert the resolved 'declViewModel'
          var promise = viewModelSvc.populateViewModelPropertiesFromJson(declViewModelUrls.viewModel, declViewModelTarget, $scope.panelId);
          promise.then(function (declViewModel) {
            var parentElement = $element[0].parentElement;
            var ctrlElement = $element;
            viewModelSvc.bindConditionStates(declViewModel, $scope);
            $scope.conditions = declViewModel.getConditionStates();
            viewModelSvc.insertViewTemplate(declViewModel, declViewModelUrls.view, parentElement, ctrlElement, false, $scope.panelId).then(function () {
              /**
               * Announce (publish) that this panel is being revealed.
               */
              eventBus.publish('awPanel.reveal', {
                scope: $scope
              });
            });
          });
        });
      }],
      replace: true
    };
  }]);
});