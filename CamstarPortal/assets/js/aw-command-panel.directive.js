"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a command panel
 * <P>
 * Note: Typical children of aw-command-panel are aw-panel-header, aw-panel-body, aw-panel-footer
 *
 * @module js/aw-command-panel.directive
 */
define(['app', 'angular', 'jquery', 'js/eventBus', 'js/ngUtils', 'lodash', 'js/logger', //
'js/aw-command-sub-panel.directive', 'js/aw-navigate-panel.directive', //
'js/viewModelService', 'js/uwPropertyService', 'js/aw-icon-button.directive', 'js/appCtxService', 'js/aw-command-bar.directive'], //
function (app, ngModule, $, eventBus, ngUtils, _, logger) {
  'use strict';
  /**
   * Directive to display a command panel
   * <P>
   * Note: Typical children of aw-command-panel are aw-panel-header, aw-panel-body, aw-panel-footer The "caption"
   * doesn't accept plain text. Need define the caption text in view model i18n or data section.
   *
   * Bind to localization text:
   *
   * @example <aw-command-panel caption="i18n.myPanelCaption">...</aw-command-panel>
   *
   * Bind to non-localization text:
   * @example <aw-command-panel caption="data.myPanelCaption">...</aw-command-panel>
   *
   * @member aw-command-panel
   * @memberof NgElementDirectives
   */

  app.directive('awCommandPanel', //
  ['viewModelService', 'uwPropertyService', 'appCtxService', //
  function (viewModelSvc, uwPropertySvc, appCtxSvc) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        caption: '=',
        hideTitle: '=?',
        commands: '=?',
        anchor: '=?',
        context: '=?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-command-panel.directive.html',
      controller: ['$scope', function ($scope) {
        var declViewModel = viewModelSvc.getViewModel($scope, true);
        viewModelSvc.bindConditionStates(declViewModel, $scope);
        $scope.conditions = declViewModel.getConditionStates(); // initialize all default command condition to true

        _.forEach($scope.commands, function (command) {
          if (command.condition === undefined) {
            command.condition = true;
          }
        });
      }],
      link: function link($scope, $element, attr) {
        var _navigateFunc = function _navigateFunc(context) {
          if (context.id && context.id !== attr.id) {
            return;
          }

          appCtxSvc.updateCtx('panelContext', context);

          if (context && context.destPanelId) {
            var panelId = context.destPanelId;
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            var subPanel = declViewModel.getSubPanel(panelId);

            if (context.typeRefResults) {
              var contextResult = context.typeRefResults;
              var viewProp = declViewModel.typeRef;
              var selectedUid = contextResult[0].uid;
              uwPropertySvc.setValue(viewProp, selectedUid);
              var displayName = uwPropertySvc.getDisplayName(selectedUid);
              uwPropertySvc.setDisplayValue(viewProp, displayName);
              uwPropertySvc.setDirty(viewProp, true);
              $scope.$apply();
            } // insert the new sub panel dynamically if it doesn't exist


            if (!subPanel || context.recreatePanel) {
              $scope.originalCaption = $scope.caption; // remove the old panel and recreate a new one

              if (subPanel || context.recreatePanel) {
                var subPanelBody = $('form[panel-id=' + panelId + ']'); // In isolate Mode the declViewModel we receive here is the main parent panel ViewModel
                // Not subPanel viewModel. Hence not required to remove the panel from wrong declViewModel.

                if (!context.isolateMode) {
                  var childPanels = subPanelBody.find('form[name=subPanelForm]');

                  _.forEach(childPanels, function (childPanel) {
                    if (childPanel) {
                      var childPanelId = childPanel.getAttribute('panel-id');

                      if (childPanelId) {
                        declViewModel.removeSubPanel(childPanelId);
                      }
                    }
                  });

                  declViewModel.removeSubPanel(panelId);
                }

                var subPanelContent = $('div[dest-panel-id=' + panelId + ']');

                if (subPanelContent.scope()) {
                  // Destroying scope on subpanel scope will in-turn clean up all the child scopes.
                  subPanelContent.scope().$destroy();
                }
              }

              $('div[dest-panel-id=' + panelId + ']').remove();
              $('div[panel-id=' + panelId + ']').remove();
              $('form[panel-id=' + panelId + ']').remove();
              var $ele = null;

              if (context.supportGoBack) {
                $ele = ngModule.element('<aw-navigate-panel/>');
                $ele.attr('pre-panel-id', declViewModel.activeView);
                $ele.attr('dest-panel-id', panelId);
                $ele.attr('back-button-title', context.title);

                if (context.isolateMode) {
                  $ele.attr('isolate-mode', context.isolateMode.toString());
                }
              } else {
                $ele = ngModule.element('<aw-command-sub-panel/>');
                $ele.attr('panel-id', panelId);
                $ele.attr('visible-when', 'data.activeView==\'' + panelId + '\'');
              }

              var parent = $element.find('div.aw-layout-panelContent');

              if (context.id) {
                parent = $(document.getElementById(context.id)).find('div.aw-layout-panelContent');
              }

              $(parent[0]).append($ele[0]);
              ngUtils.include(parent[0], $ele);
            } else {
              // set pristine state for the subsequent wizard panels
              var activePanel = declViewModel.getSubPanel(declViewModel.activeView);

              if (activePanel && activePanel.contextChanged) {
                var subPanelElems = $element.find('.aw-layout-subPanelContent');

                for (var i = 0; i < subPanelElems.length; i++) {
                  var subPanelElem = ngModule.element(subPanelElems[i]);
                  var subPanel2 = declViewModel.getSubPanel(subPanelElem.attr('panel-id'));

                  if (subPanel2 && subPanel2.id > activePanel.id) {
                    var childScope = subPanelElem.scope();

                    if (childScope && childScope.subPanelForm) {
                      childScope.subPanelForm.$setPristine();
                    }
                  }
                } // reset contextChanged to false after set subsequent panels to pristine


                activePanel.contextChanged = false;
              }
            } // update main panel caption during panel navigation


            if (context.mainPanelCaption) {
              $scope.caption = context.mainPanelCaption;
            } else {
              $scope.caption = $scope.originalCaption;
            }

            _.defer(function () {
              declViewModel.previousView = declViewModel.activeView;
              declViewModel.activeView = panelId;
              $scope.$apply();
            });
          }
        };

        var onNavigateListener = eventBus.subscribe('awPanel.navigate', _navigateFunc, 'viewModelService');
        $scope.$on('awProperty.addObject', function (event, context) {
          event.stopPropagation();

          _navigateFunc(context);
        });
        var onNavigateBackListener = eventBus.subscribe('complete.subPanel', function (eventData) {
          var declViewModel = viewModelSvc.getViewModel($scope, true);

          if (declViewModel.activeView === eventData.source) {
            _.defer(function () {
              declViewModel.activeView = declViewModel.previousView;
              declViewModel.previousView = '';
              $scope.caption = $scope.originalCaption;
              $scope.$apply();
            });
          }
        }); // And remove it when the scope is destroyed

        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(onNavigateListener);
          eventBus.unsubscribe(onNavigateBackListener);
        });
        eventBus.publish('awPanel.reveal', {
          scope: $scope
        });
      },
      replace: true
    };
  }]);
});