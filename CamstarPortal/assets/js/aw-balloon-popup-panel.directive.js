"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a balloon popup widget by clicking on the element, and showing up the transcluded stuff in the popup
 * Widget.
 *
 * @module js/aw-balloon-popup-panel.directive
 */
define(['app', 'js/eventBus', 'jquery', 'lodash', 'js/aw-popup-panel.directive', 'js/popupService', 'js/aw-balloon-popup-panel.controller', 'js/localeService', 'js/exist-when.directive'], function (app, eventBus, $, _) {
  'use strict';
  /**
   * Directive to display a balloon popup widget by clicking on the element and show the transcluded stuff in the popup widget.
   *
   * @example    <aw-balloon-popup-panel> </aw-balloon-popup-panel>
   *
   * @member  aw-balloon-popup-panel
   * @memberof NgElementDirectives
   */

  app.directive('awBalloonPopupPanel', ['$timeout', 'localeService', function ($timeout, localeSvc) {
    return {
      restrict: 'E',
      controller: 'awBalloonPopupPanelController',
      transclude: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-balloon-popup-panel.directive.html',
      link: function link(scope, element) {
        // Add listener to show the popup
        localeSvc.getTextPromise().then(function (localTextBundle) {
          scope.loadingMsg = localTextBundle.LOADING_TEXT;
        });
        scope.loading = 'disabled';
        scope.$on('awBalloonPopupWidget.open', function _onPopupOpen(event, eventData) {
          // Override the aw-popup-panel hideLinkPopUp
          var popupPanelData = {
            popupUpLevelElement: $(element.find('aw-popup-panel')[0])
          }; // When close button is present [true], then clicking on the close button explicitly will be required to close the popup
          // When the close button is NOT chosen to be present - clicking outside the popup shall close the popup.

          if (eventData.closebutton === 'true') {
            popupPanelData.popupUpLevelElement.scope().hideLinkPopUp = function () {// Override the aw-popup-panel hideLinkPopUp
            };

            scope.closebutton = 'true';
          } else {
            scope.closebutton = 'false';
          } //set popup type


          popupPanelData.popupType = eventData.popupType; // Controller function for creating BalloonPopup with speech bubble

          var originalOri = eventData.orientation;
          scope.createBalloonPopup(eventData, popupPanelData); // Broadcast the event to aw-popup-panel for show the popup

          scope.$emit('awPopupWidget.init', popupPanelData);
          scope.$broadcast('awPopupWidget.open', popupPanelData); // timeout for popup panel body to load in DOM, then attach the speech bubble to popup

          var resizePopup = function resizePopup() {
            var elementContentObject = element.find('aw-include');

            if (elementContentObject.length === 0) {
              elementContentObject = element.find('div.aw-layout-flexColumnContainer');
            }

            if (_.has(popupPanelData.popupUpLevelElement, 'element.defaultSize')) {
              eventData.height = elementContentObject.height() + 32 > 360 ? 360 : elementContentObject.height() + 16;
              eventData.width = elementContentObject.width() + 32 > 360 ? 360 : elementContentObject.width() + 32;
            }

            popupPanelData.popupUpLevelElement.height = eventData.height;
            popupPanelData.popupUpLevelElement.width = eventData.width;
            popupPanelData.popupUpLevelElement.orientation = eventData.orientation = originalOri;
            popupPanelData.popupUpLevelElement.popupType = 'extendedTooltip';
            scope.createBalloonPopup(eventData, popupPanelData);
            scope.createPopupSpeechBubble(eventData);
            scope.$broadcast('awPopupWidget.reposition', popupPanelData);
            eventBus.subscribe('awPopupWidget.positionComplete', function () {
              element.css('visibility', 'visible');
            });
            var tooltipContainer = element.find('div.aw-layout-flexColumnContainer');
            $(tooltipContainer[0]).attr('style', 'margin:' + 8 + 'px' + ' ' + 16 + 'px');
          };

          if (popupPanelData.popupType === 'extendedTooltip') {
            element.css('visibility', 'hidden');
            var timeId = $timeout(resizePopup, 400);
            var loadContentListener = eventBus.subscribe('balloonPopup.showcontentLoaded', function () {
              $timeout.cancel(timeId);
              resizePopup();
            });
            var startContentListener = eventBus.subscribe('balloonPopup.startcontentLoaded', function () {
              scope.loading = true;
            });
            scope.$on('awPopupWidget.close', function () {
              eventBus.unsubscribe(loadContentListener);
              eventBus.unsubscribe(startContentListener);
            });
          } else {
            // timeout for popup panel body to load in DOM, then attach the speech bubble to popup
            $timeout(function () {
              scope.createPopupSpeechBubble(eventData);
            });
          }
        }); // Add listener to close the popup

        scope.closePopUp = function () {
          // Broadcast the aw-popup-panel close event,
          var popupPanelData = {
            popupUpLevelElement: $(element.find('aw-popup-panel')[0])
          };
          scope.$broadcast('awPopupWidget.close', popupPanelData);
        };
      }
    };
  }]);
});