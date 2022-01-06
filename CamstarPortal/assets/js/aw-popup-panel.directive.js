"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/aw-popup-panel.directive
 * aw-popup-panel directives does not manage height and width,to specify it parent directive needs to handle it through CSS.
 */
define(['app', 'lodash', 'jquery', 'js/eventBus', 'js/popupService'], function (app, _, $, eventBus) {
  'use strict';

  app.directive('awPopupPanel', [function () {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-popup-panel.directive.html',
      controller: ['$scope', '$element', '$timeout', 'popupService', function ($scope, $element, $timeout, popupSvc) {
        $scope.showpopup = false;

        $scope.getAbsoluteTop = function (elem) {
          // Get an object top position from the upper left viewport corner
          if (elem.length > 0) {
            var objElem = elem[0];
            var objElemTop = objElem.offsetTop;
            var objElemParent;

            while (objElem.offsetParent !== null) {
              objElemParent = objElem.offsetParent; // Get parent object reference

              objElemTop += objElemParent.offsetTop; // Add parent top position

              objElem = objElemParent;
            }

            return objElemTop;
          }
        };

        $scope.setMaxHeight = function () {
          if ($('.popupContent .aw-base-scrollPanel').length > 0) {
            $scope.scrollerElem = $('.popupContent .aw-base-scrollPanel');
            var popupContent = $element.find('.popupContent');
            var clientHight = $(window).height();
            var MAX_SIZE = clientHight - $scope.getAbsoluteTop(popupContent);

            _.forEach($scope.scrollerElem, function (elem) {
              elem.style.maxHeight = MAX_SIZE + 'px';
            });
          }
        };

        $scope.hideLinkPopUp = function (event) {
          event.stopPropagation();
          var parent = event.target;

          while (parent && parent.className !== 'aw-layout-popup aw-layout-popupOverlay') {
            parent = parent.parentNode;
          }

          if (!parent && $scope.enablePopupClose !== false) {
            $scope.$emit('awPopupWidget.close');
          }
        };

        $scope.closePopup = function () {
          $scope.$evalAsync(function () {
            $scope.showpopup = false;
            $('body').off('click', $scope.hideLinkPopUp);
          });
        };

        $scope.showPopupWidget = function (eventData, currElement, originalEvent) {
          $scope.showpopup = true;
          $timeout(function () {
            if (originalEvent) {
              $scope.setPosAtCurrElement(currElement, originalEvent);
            } else {
              $scope.repositionPopupWidgetEvent(eventData);
            }

            $scope.$on('windowResize', function () {
              eventBus.publish('awPopupWidget.close');
            });
            eventBus.publish('awPopupWidget.positionComplete');
          });
        };

        $scope.repositionPopupWidgetEvent = function (eventData) {
          if (eventData.popupUpLevelElement) {
            var popupWidgetElem = eventData.popupUpLevelElement.find('.aw-layout-popup.aw-layout-popupOverlay')[0];

            if (popupWidgetElem) {
              var offsetWidth = popupWidgetElem.offsetWidth; // the drop down's offset height

              var offsetHeight = popupWidgetElem.offsetHeight;
              popupSvc.setPopupPosition(eventData.popupUpLevelElement, popupWidgetElem, offsetWidth, offsetHeight);
              $scope.$apply();
            }
          }
        };

        $scope.setPosAtCurrElement = function (currElement, event) {
          $scope.$apply();
          var popups = $(currElement).find('.aw-layout-popup.aw-layout-popupOverlay');
          var height = popups[0].offsetHeight; // Check if context menu would go outside of visible window, and move up if needed

          var maxYNeeded = event.clientY ? event.clientY + height : event.touches[0].clientY + height;

          if (maxYNeeded >= window.innerHeight) {
            popups.css('top', (event.clientY ? event.clientY - height : event.touches[0].clientY - height) - $(currElement).offset().top);
          } else {
            popups.css('top', (event.clientY ? event.clientY : event.touches[0].clientY) - $(currElement).offset().top);
          }

          popups.css('left', (event.clientX ? event.clientX : event.touches[0].clientY) - $(currElement).offset().left);
        };

        $scope.$watch('showpopup', function _watchShowPopup(newValue, oldValue) {
          if (!(_.isNull(newValue) || _.isUndefined(newValue)) && newValue !== oldValue) {
            if (newValue === true) {
              $timeout(function () {
                $('body').on('click touchstart', $scope.hideLinkPopUp);
                $scope.setMaxHeight();
              }, 200);
            } else {
              $timeout(function () {
                $('body').off('click touchstart', $scope.hideLinkPopUp);
              }, 200);
            }
          }
        }, true);
      }],
      link: function link(scope) {
        // Add listener to show the popup
        scope.$on('awPopupWidget.open', function _onPopupOpen(event, eventData, currElement, originalEvent) {
          scope.showPopupWidget(eventData, currElement, originalEvent);
        }); // Add listener to close the popup

        scope.$on('awPopupWidget.close', function _onPopupClose(event, eventData) {
          scope.closePopup(eventData);
        }); // Add listener to readjust the popup

        scope.$on('awPopupWidget.reposition', function _onPopupReposition(event, eventData) {
          scope.showPopupWidget(eventData);
        }); // subscribe event

        var closePopupEvent = eventBus.subscribe('awPopupWidget.close', function () {
          scope.$emit('awPopupWidget.close');
        }); // And remove it when the scope is destroyed

        scope.$on('$destroy', function () {
          eventBus.unsubscribe(closePopupEvent);
        });
      }
    };
  }]);
});