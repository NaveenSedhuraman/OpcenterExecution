"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service is used for adding balloon popup to aw-commands in aw-command-bar and aw-command-panel.
 *
 * @module js/balloonPopupService
 *
 * @publishedApolloService
 */
define(['app', 'js/eventBus', 'jquery', 'angular', 'js/aw-balloon-popup-panel.directive'], function (app, eventBus, $, ngModule) {
  'use strict';
  /**
   * Return an Object
   *
   * @param {$rootScope} $rootScope - Service to use.
   * @param {$injector} $injector - Service to use.
   * @param {$timeout} $timeout - Service to use.
   *
   * @returns {balloonPopupService} Reference to service API Object.
   */

  app.factory('balloonPopupService', ['$rootScope', '$injector', '$timeout', function ($rootScope, $injector, $timeout) {
    var exports = {};
    /**
     * Typically, this service would be used inside an action in ViewModel json to set the attributes of the balloon-popup before opening it.
     * For example:
     * ===========
     *         "<Action-Name-That-Trigger-Balloon-Popup>": {
     *            "actionType": "JSFunction",
     *            "method": "openBalloonPopup",
     *            "inputData": {
     *                "view": "buttonBalloonPopup",
     *                "popuporientation": "BOTTOM_CENTER",
     *                "popupheight": "200px",
     *                "popupwidth": "500px",
     *                "popupclosebutton": "false",
     *                "popupMinHeight": "50px",
     *                "popupMinWidth": "100px"
     *            },
     *            "deps": "js/balloonPopupService"
     *         }
     *
     * @param {String} view - html view of popup
     * @param {String} elementDimension - selected element dimension
     * @param {String} popupOrientation - orientation of popup
     * e.g. BOTTOM_RIGHT, BOTTOM_CENTER, BOTTOM_LEFT, TOP_RIGHT, TOP_CENTER, TOP_LEFT, RIGHT_TOP, RIGHT_CENTER, RIGHT_BOTTOM, LEFT_TOP, LEFT_CENTER, LEFT_BOTTOM
     * @param {String} popupHeight - height of popup in px
     * @param {String} popupWidth - width of popup in px
     * @param {String} popupCloseButton - String with Boolean Value to control visibility of close button for popup
     */

    exports.openBalloonPopup = function (view, elementDimension, popupOrientation, popupHeight, popupWidth, popupCloseButton, popupMinHeight, popupMinWidth, extendedTooltipContent) {
      $injector.invoke(['$compile', function ($compile) {
        var eventData = {
          elementObject: [elementDimension],
          orientation: popupOrientation,
          height: popupHeight,
          width: popupWidth,
          closebutton: popupCloseButton,
          popupMinHeight: popupMinHeight,
          popupMinWidth: popupMinWidth,
          popupType: elementDimension.popupType
        }; // Create balloon popup ID using View panel

        var popupId;
        var loadContentListener;
        var html;

        if (elementDimension.popupId === undefined) {
          popupId = view + 'BalloonPopup';
        } else {
          // we can also provide ID for balloon popup using element Dimension
          // if popupId present in element Dimension , then use this ID for balloon popup
          popupId = elementDimension.popupId + 'BalloonPopup';
        } // Adding balloon popup ID into event data


        eventData.balloonPopupId = popupId;
        var scope = $rootScope.$new(); // append html for balloon popup to command element Dimension

        if (elementDimension.popupType === 'extendedTooltip') {
          if (!extendedTooltipContent) {
            //when view file is available for extended tooltip
            html = '<aw-balloon-popup-panel class="extended-tooltip-label" id=' + popupId + '><aw-include name="' + view + '"></aw-include></aw-balloon-popup-panel>';
          } else {
            // when there is no view file, its just has a vanilla content like string
            html = '<aw-balloon-popup-panel id=' + popupId + '>' + view + '</aw-balloon-popup-panel>';
          }
        } else {
          //for balloon popup
          html = '<aw-balloon-popup-panel id=' + popupId + '><div class="aw-base-scrollPanel"> <aw-include name="' + view + '"></aw-include></div></aw-balloon-popup-panel>';
        } // Step 1: parse HTML into DOM element Dimension


        var template = ngModule.element(html); // Step 2: compile the template

        var linkFn = $compile(template); // Step 3: link the compiled template with the scope.

        var linkElement = linkFn(scope);
        var body = ngModule.element(document).find('body');
        body.append(linkElement); // wait for complete digest scope.

        $timeout(function () {
          // eventBus.publish( "balloonPopup.Open", eventData );
          var popupUpElement = $('body').find('aw-balloon-popup-panel#' + popupId);
          var popupElemScope = ngModule.element(popupUpElement).scope();
          /* for extended-tooltip container uses the aw-include . As aw-include does not now when the data gets loaded
             consumer fire the contentLoaded and where we set the loading falg false and then ask the balloon popup to load
             the content by firing balloonPopup.showcontentLoaded
           */

          loadContentListener = eventBus.subscribe('balloonPopup.contentLoaded', function () {
            popupElemScope.loading = false;
            eventBus.publish('balloonPopup.showcontentLoaded');
          }); // emit the event to aw-balloonpopup-panel for show the popup

          popupElemScope.$emit('awBalloonPopupWidget.open', eventData);
          var popupPanelData = $('body').find('aw-balloon-popup-panel#' + popupId);

          var hideLinkPopUp = function hideLinkPopUp(event) {
            if (eventData.closebutton === 'false') {
              event.stopPropagation();
              var parent = event.target;

              while (parent && parent.className !== 'aw-layout-popup aw-layout-popupOverlay') {
                parent = parent.parentNode;
              }

              if (!parent) {
                eventBus.publish('balloonPopup.Close', eventData);
                popupElemScope.$broadcast('awPopupWidget.close', eventData);
                popupPanelData.detach();
              }
            }

            eventBus.unsubscribe(loadContentListener);
          };

          exports.hideLinkPopUp = hideLinkPopUp; // Override the aw-popup-panel hideLinkPopup

          popupUpElement.scope().hideLinkPopUp = hideLinkPopUp;
          eventBus.publish('balloonPopup.Open', eventData); // closePopUp : function handles close popup call

          popupElemScope.closePopUp = function () {
            eventBus.publish('balloonPopup.Close', eventData);
            popupPanelData.detach();
          }; // On window  resize : All opened balloon popup will get closed
          // publish event for all balloonPopup Close created here for window resize


          scope.$on('windowResize', function () {
            eventBus.publish('balloonPopupWindow.Resize', eventData);
          });

          var scrollEventListener = function scrollEventListener(event) {
            // Check scrolled happened on windows OR inside balloon Popup
            // if result is  -1 , then scroll happened on window and NOT inside balloon Popup => Close ALL balloon popup
            // if result is greater than ZERO, then scroll happened inside balloon Popup => NOT close balloon popup
            // event.path is for Chrome, event.composedPath is for FireFox, since for IE no function to get the event path in dom event bubbling, add a composedPath() function for IE
            var path = event.path || event.composedPath && event.composedPath() || composedPath(event.target);
            var result = $.inArray($('body').find('aw-balloon-popup-panel')[0], path);

            if (result === -1) {
              // publish event for all balloonPopup windows Scroll
              eventBus.publish('balloonPopupWindow.Scroll', eventData);
              $timeout(function () {
                $('body').find('aw-balloon-popup-panel').detach(); // Remove an Event Listener on scroll

                document.removeEventListener('scroll', scrollEventListener, true);
              });
            }
          }; // Attach an Event Listener on scroll


          document.addEventListener('scroll', scrollEventListener, {
            capture: true,
            passive: true
          });
        });
      }]);
    }; // just for IE, same use as event.path in chrome and event.composedPath() in firefox, to get the event path in dom event bubbling


    var composedPath = function composedPath(el) {
      var path = [];

      while (el) {
        path.push(el);

        if (el.tagName === 'HTML') {
          path.push(document);
          path.push(window);
          return path;
        }

        el = el.parentElement;
      }
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'balloonPopupService'
  };
});