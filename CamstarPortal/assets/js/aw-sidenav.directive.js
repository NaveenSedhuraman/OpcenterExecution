"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a sideNav
 *
 * @module js/aw-sidenav.directive
 */
define(['app', 'js/eventBus', 'js/logger', 'jquery', 'js/browserUtils', 'js/aw-sidenav.controller', 'js/appCtxService', 'js/aw-include.directive', 'js/aw-property-image.directive', 'js/exist-when.directive'], //
function (app, eventBus, logger, $, browserUtils) {
  'use strict';
  /**
   * Directive to display a sidenav
   *
   * @example <aw-sidenav id="sidenavPush" config="data.sideNavData"></aw-sidenav>
   * @attribute config: This will define the configuration attributes of the sidenav, which includes
   * direction, animation, slide, height, width and isPinnable(in case of global navigation)
   * width: STANDARD, WIDE (standard is 360px and wide is 480px in width for normal panels)
   * height: DEFAULT, LARGE, FULL (height can be equal to width by default, 75% or 100% of the container height)
   * direction can be left to right and right to left
   * animation by default is true
   * @member aw-sidenav
   * @memberof NgElementDirectives
   */

  app.directive('awSidenav', ['appCtxService', '$window', function (appCtx, $window) {
    return {
      restrict: 'E',
      scope: {
        config: '='
      },
      transclude: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-sidenav.directive.html',
      controller: 'awSidenavController',
      link: function link($scope, elem, attr) {
        $scope.pinned = false;
        var hasConfigChanged = false;

        var reCalcPanelPosition = function reCalcPanelPosition() {
          if ($scope.configProperties.isFloatPanel() && $scope.sidenavOpened || $scope.isPinnable && $scope.sidenavOpened) {
            if ($scope.configProperties.isFullHeightPanel()) {
              elem.css('height', $window.innerHeight - elem.offset().top + 'px');
            } else {
              elem.css('height', '');
            }
          } // The isMobileOS check is required for narrow mode devices, where the panel covers the whole screen


          if (!browserUtils.isMobileOS) {
            if (!$scope.isLeftToRight && $scope.configProperties.isFloatPanel() && $scope.sidenavOpened) {
              elem.css('right', $window.innerWidth - (elem.parent().width() + elem.parent().offset().left));
            }
          }
        };

        var setDefaultConfig = function setDefaultConfig() {
          // default placeholder height and width values
          $scope.width = $scope.config.width || $scope.configProperties.standard;
          $scope.height = $scope.config.height || $scope.configProperties.full;
          $scope.isPinnable = $scope.config.isPinnable || false;
          $scope.direction = $scope.config.direction || $scope.configProperties.left_to_right;
          $scope.slide = $scope.config.slide;
          $scope.animation = $scope.config.animation !== false;

          if ($scope.configProperties.isDefaultHeightPanel()) {
            $scope.height = $scope.width;
          } // push panels will always be full height


          if ($scope.configProperties.isPushPanel()) {
            $scope.height = $scope.configProperties.full;
          }

          $scope.isAnimationDisabled = !$scope.animation;
          $scope.isLeftToRight = $scope.direction === $scope.configProperties.left_to_right;
        }; // close global-naviagtion when click out side


        var autoCloseAble = function autoCloseAble(eventData) {
          if ($scope.isPinnable) {
            $('body').on('click touchstart', function (element) {
              // If the panel is already open and it is not pinned and user clicks outside of panel i.e. not on panel itself, then close the panel
              if ($scope.sidenavOpened && !$scope.pinned && $.contains(document, element.target) && $(element.target).closest('.autoclose').length === 0) {
                $scope.$applyAsync(function () {
                  $scope.sidenavOpened = $scope.currentCommandId !== eventData.commandId;

                  if (!$scope.sidenavOpened) {
                    appCtx.getCtx('sidenavCommandId') === eventData.commandId ? appCtx.unRegisterCtx('sidenavCommandId') : false;
                    $scope.view = null;
                  }
                });
                $('body').off('click touchstart');
              }
            });
          }
        };

        setDefaultConfig(); // subscribe event

        var sideNav = eventBus.subscribe('awsidenav.openClose', function (eventData) {
          // All consumers should be using id and eventData should be passed through
          if (!attr.id || !eventData) {
            logger.error('id attribute and eventData are required');
            return;
          }

          if (attr.id === eventData.id) {
            // If the command wants to configure sidenav with different params through eventData
            // it should be allowed and handled
            if (eventData.includeView) {
              $scope.view = eventData.includeView;
            }

            if (eventData.config) {
              $scope.width = eventData.config.width || $scope.config.width || $scope.configProperties.standard;
              $scope.height = eventData.config.height || $scope.config.height || $scope.configProperties.full;
              $scope.slide = eventData.config.slide || $scope.config.slide || $scope.configProperties.push;
              $scope.isPinnable = eventData.config.isPinnable || $scope.config.isPinnable || false;

              if ($scope.configProperties.isDefaultHeightPanel()) {
                $scope.height = $scope.width;
              }

              if ($scope.configProperties.isPushPanel()) {
                $scope.height = $scope.configProperties.full;
              }

              hasConfigChanged = true;
            } else if (hasConfigChanged) {
              setDefaultConfig();
              hasConfigChanged = false;
            }

            autoCloseAble(eventData);
            $scope.createSidenav(eventData, attr.id); // Preserve the current panel command id,
            // to keep the panel open if the same panel is opened with another command

            if ($scope.currentCommandId !== eventData.commandId) {
              $scope.currentCommandId = eventData.commandId;
            } // Recalculate panel position if its a float panel


            reCalcPanelPosition();
          } // pass keepOthersOpen to keep the other sidenavs open when the current sidenav is opened
          else if (!eventData.keepOthersOpen) {
              // Need to close all the other open panels not having this id
              $scope.closeSidenav(eventData);
            }
        }); // And remove it when the scope is destroyed

        $scope.$on('$destroy', function () {
          eventBus.unsubscribe(sideNav);
          var sidenavCmdId = appCtx.getCtx('sidenavCommandId');

          if (sidenavCmdId && sidenavCmdId === $scope.currentCommandId) {
            appCtx.unRegisterCtx('sidenavCommandId');
          }
        }); // On window resize : Side height should be update according to window size.

        $scope.$on('windowResize', function () {
          reCalcPanelPosition();
        });
      },
      replace: true
    };
  }]);
});