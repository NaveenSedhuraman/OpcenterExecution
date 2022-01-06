"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This represents controller for <aw-balloon-popup-panel></aw-balloon-popup-panel>
 *
 * @module js/aw-balloon-popup-panel.controller
 */
define(['app', 'jquery', 'Debug'], //
function (app, $, Debug) {
  'use strict';

  var trace = new Debug('aw-balloon-popup-panel.controller');
  var id = 1;
  /**
   * Defines awBalloonPopupPanel controller
   * @member awBalloonPopupPanelController
   * @memberof NgControllers
   */

  app.controller('awBalloonPopupPanelController', ['$scope', '$element', function (scope, element) {
    // Default popup width and height
    var MAX_POPUP_WIDTH = 110;
    var MAX_POPUP_HEIGHT = 50; // Scope variable for popupwidth

    scope.popupwidth;
    scope.popupHeight;
    scope.popupleft;
    scope.popupTop;
    scope.minPopupWidth;
    scope.minPopupHeight; // Scope variable for speech bubble with default values

    scope.speechBubbleWidth = 15;
    scope.speechBubbleHeight = 20;
    scope.speechBubbleAngle = 90;
    /**
     * @param  {} closeButtonPosition- will set the close button position inside the  Balloon Popup
     * @param  {} rotate - Will set rotation of speech bubble according to popup orientation
     * @param  {} speechBubbleTopForBefore - will set speech bubble top position for before element
     * @param  {} speechBubbleTopForAfter - will set speech bubble top position for after element
     * @param  {} speechBubbleLeftForBefore - will set speech bubble left position for before element
     * @param  {} speechBubbleLeftForAfter - will set speech bubble left position for after element
     * @param  {} popupHeight - Balloon Popup height for setting position of  speech bubble
     */

    scope.setPopupSpeechBubble = function (closeButtonPosition, rotate, speechBubbleTopForBefore, //
    speechBubbleTopForAfter, speechBubbleLeftForBefore, speechBubbleLeftForAfter, popupHeight) {
      var styleElembefore = document.head.appendChild(document.createElement('style'));
      var styleElemafter = document.head.appendChild(document.createElement('style'));
      var closeButton = document.head.appendChild(document.createElement('style')); // Create element ID for adding CSS properties to speech bubble of popup

      var elementId = 'awBaloonPopup' + id++; // Attach the speech bubble to popup and modify left, right position and rotation, According to popup orientation

      styleElembefore.innerHTML = '#' + elementId + ':before{left:' + speechBubbleLeftForBefore + 'px;transform: rotate(' + rotate + 'deg);top:' + speechBubbleTopForBefore + 'px}';
      styleElemafter.innerHTML = '#' + elementId + ':after{left:' + speechBubbleLeftForAfter + 'px;transform: rotate(' + rotate + 'deg);top:' + speechBubbleTopForAfter + 'px}';
      closeButton.innerHTML = '#' + elementId + '{float:' + closeButtonPosition + '}'; // Apply run time CSS changes to popup body

      var panelasdaBody = $(element.find('div.aw-base-scrollPanel.ng-scope')[0]);
      panelasdaBody.attr('style', 'min-height:' + (popupHeight - 30) + 'px !important');
      panelasdaBody.attr('style', 'height:' + (popupHeight - 30) + 'px');

      try {
        var popupCloseEle = $(element.find('span.aw-popup-close.ng-scope')[0])[0];

        if (popupCloseEle) {
          popupCloseEle.id = elementId;
        }

        var popupOverlayEle = $(element.find('div.aw-layout-popupOverlay.aw-layout-popup')[0])[0];

        if (popupOverlayEle) {
          popupOverlayEle.id = elementId;
        }
      } catch (e) {
        trace('Error in popup element selection', e, element);
      }

      $(element.find('div.aw-layout-flexColumnContainer')[0]).attr('style', 'margin:' + 16 + 'px');
    };
    /**
     * According to popup orientation, set position of speech bubble
     * @param  {} orientation -popup orientation
     */


    scope.createPopupSpeechBubble = function (eventData) {
      // According to popup orientation, set speech bubble position
      switch (eventData.orientation) {
        case 'left':
          scope.setPopupSpeechBubble('right', scope.speechBubbleAngle, scope.speechBubbleTop //
          , scope.speechBubbleTop + 1, scope.popupwidth, scope.popupwidth, scope.popupHeight);
          break;

        case 'right':
          scope.setPopupSpeechBubble('right', -scope.speechBubbleAngle, scope.speechBubbleTop, //
          scope.speechBubbleTop + 1, -scope.speechBubbleHeight, -(scope.speechBubbleHeight - 2), scope.popupHeight);
          break;

        case 'top':
          scope.setPopupSpeechBubble('right', scope.speechBubbleAngle * 2, scope.popupHeight, //
          scope.popupHeight, scope.speechBubbleleft, scope.speechBubbleleft + 1, scope.popupHeight);
          break;

        case 'bottom':
          scope.setPopupSpeechBubble('right', 0, -scope.speechBubbleHeight, -(scope.speechBubbleHeight - 2), //
          scope.speechBubbleleft, scope.speechBubbleleft + 1, scope.popupHeight);
          break;
      }
    };
    /**
     * Cerate Balloon popup according to orientation and dimensions of popup
     * @param  {} eventData- the ui object to position popup relative to
     * @param  {} popupPanelData - aw-popup-panel object
     */


    scope.createBalloonPopup = function (eventData, popupPanelData) {
      // calculate distance from the left, Right, Top and Bottom of window’s edge
      var windowRight = $(window).outerWidth() + $(window).scrollLeft();
      var windowLeft = $(window).scrollLeft();
      var windowTop = $(window).scrollTop();
      var windowBottom = $(window).scrollTop() + $(window).outerHeight(); // getting element object Height

      scope.elementObjectHeight = eventData.elementObject[0].offsetHeight; // Calculate distance from the left, Right, Top and Bottom edge of the UI object with respect to window's edge

      scope.distanceFromWindowRight = windowRight - (eventData.elementObject[0].offsetLeft + eventData.elementObject[0].offsetWidth);
      scope.distanceFromWindowLeft = eventData.elementObject[0].offsetLeft - windowLeft;
      scope.distanceFromWindowTop = eventData.elementObject[0].offsetTop - windowTop;
      scope.distanceToWindowBottom = windowBottom - (eventData.elementObject[0].offsetTop + eventData.elementObject[0].offsetHeight); // if popup width is NOT defined, then set popup width to DEFAULT value

      if (eventData.width === undefined || parseInt(eventData.width, 10) < MAX_POPUP_WIDTH && popupPanelData.popupType !== 'extendedTooltip') {
        scope.popupwidth = MAX_POPUP_WIDTH;
      } else {
        scope.popupwidth = parseInt(eventData.width, 10);
      } // If popup height is NOT defined, then set popup height to DEFAULT value


      if (eventData.height === undefined || parseInt(eventData.height, 10) < MAX_POPUP_HEIGHT && popupPanelData.popupType !== 'extendedTooltip') {
        scope.popupHeight = MAX_POPUP_HEIGHT;
      } else {
        scope.popupHeight = parseInt(eventData.height, 10);
      } // if popup min width is NOT defined , then set to MAX window's width that is windowRight


      if (eventData.popupMinWidth === undefined) {
        scope.minPopupWidth = windowRight;
      } else {
        scope.minPopupWidth = parseInt(eventData.popupMinWidth, 10);
      } // If popup min height is NOT defined , then set to MAX window's height that is windowBottom


      if (eventData.popupMinHeight === undefined) {
        scope.minPopupHeight = windowBottom;
      } else {
        scope.minPopupHeight = parseInt(eventData.popupMinHeight, 10);
      } // balloon popup orientation options


      var orientationOptions = ['RIGHT_TOP', 'RIGHT_CENTER', 'RIGHT_BOTTOM', 'LEFT_TOP', 'LEFT_CENTER', 'LEFT_BOTTOM', //
      'TOP_LEFT', 'TOP_RIGHT', 'TOP_CENTER', 'LEFT_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT'];
      var popupOrientation;
      var popupAlignment;

      if (eventData.orientation === undefined) {
        // If popup orientation is NOT defined then assign it to DEFAULT value that is "bottom"
        eventData.orientation = 'BOTTOM_RIGHT';
      } else if (orientationOptions.indexOf(eventData.orientation) !== -1) {
        // If popup  "eventData.orientation"  is present in orientationOptions , then assign popup Orientation and popup Alignment "
        popupOrientation = eventData.orientation.split('_')[0];
        popupAlignment = eventData.orientation.split('_')[1];
      } else {
        // If popup orientation is NOT present then assign DEFAULT popupOrientation and popupAlignment "
        popupOrientation = 'BOTTOM';
        popupAlignment = 'RIGHT';
      } // According to popup orientation, check if there is NOT enough space for popup height OR width,
      // then, find out the proper orientation for popup.


      if (popupOrientation === 'LEFT') {
        scope.speechBubbleTop = 0; // update popup orientation for further use

        eventData.orientation = 'left'; // check popup width, if popup width excessed the limit then assign proper values to it

        if (scope.popupwidth >= scope.distanceFromWindowLeft //
        && scope.minPopupWidth <= scope.distanceFromWindowLeft - scope.speechBubbleHeight) {
          scope.popupwidth = scope.distanceFromWindowLeft - scope.speechBubbleHeight;
        } else if (scope.popupwidth >= scope.distanceFromWindowLeft && scope.distanceFromWindowLeft <= scope.minPopupWidth //
        && scope.distanceFromWindowRight > scope.minPopupWidth) {
          // switch the LEFT position balloon popup to RIGHT position only if ,
          // 1] popupwidth >= distanceFromWindowLeft
          // 2] distanceFromWindowLeft < minPopupWidth
          // 3] distanceFromWindowRight > minPopupWidth
          // check popup width, if popup width excessed the limit then assign proper values to it
          if (scope.popupwidth >= scope.distanceFromWindowRight) {
            scope.popupwidth = scope.distanceFromWindowRight - eventData.elementObject[0].offsetWidth - //
            scope.speechBubbleHeight;
          } // update popup orientation for further use


          eventData.orientation = 'right';
        } // check popupHeight, if popup width excessed the limit then assign proper values to it


        if (scope.popupHeight >= windowBottom) {
          scope.popupHeight = windowBottom - scope.speechBubbleHeight;
        } // According to popupAlignment modify popuptop position


        if ('TOP' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + eventData.elementObject[0].offsetHeight / 2 - ( //
          scope.popupHeight - scope.speechBubbleHeight);
        } else if ('BOTTOM' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + eventData.elementObject[0].offsetHeight / 2 - //
          scope.speechBubbleHeight;
        } else if ('CENTER' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + eventData.elementObject[0].offsetHeight / 2 - //
          scope.popupHeight / 2;
        } // Reposition popup top, when popup width goes beyond window Bottom limit


        if (scope.popuptop + scope.popupHeight >= windowBottom) {
          scope.popuptop = scope.popuptop - (scope.popuptop + scope.popupHeight - windowBottom) - scope.speechBubbleWidth / 2;
        }

        if (scope.popuptop < 0) {
          scope.popuptop = windowTop;
        } // check if speechBubbleTop position needs to modify according to popup height


        scope.speechBubbleTop = eventData.elementObject[0].offsetTop - scope.popuptop + //
        eventData.elementObject[0].offsetHeight / 2 - scope.speechBubbleHeight / 2;
      } else if (popupOrientation === 'RIGHT') {
        scope.speechBubbleTop = 0; // update popup orientation for further use

        eventData.orientation = 'right'; // check popup width, if popup width excessed distanceFromWindowRight BUT NOT excessed minPopupWidth,then calculate avilable space for popup width and assign to popupWidth

        if (scope.popupwidth >= scope.distanceFromWindowRight //
        && scope.minPopupWidth <= scope.distanceFromWindowRight - eventData.elementObject[0].offsetWidth - //
        scope.speechBubbleHeight) {
          scope.popupwidth = scope.distanceFromWindowRight - eventData.elementObject[0].offsetWidth - //
          scope.speechBubbleHeight;
        } else if (scope.popupwidth >= scope.distanceFromWindowRight && scope.distanceFromWindowRight <= scope.minPopupWidth //
        && scope.distanceFromWindowLeft > scope.minPopupWidth) {
          // switch the RIGHT position balloon popup to LEFT position only if ,
          // 1] popupwidth >= distanceFromWindowRight
          // 2] distanceFromWindowRight < minPopupWidth
          // 3] distanceFromWindowLeft > minPopupWidth
          // check popup width, if popup width excessed the limit then assign proper values to it
          if (scope.popupwidth >= scope.distanceFromWindowLeft) {
            scope.popupwidth = scope.distanceFromWindowLeft - scope.speechBubbleHeight;
          } // update popup orientation for further use


          eventData.orientation = 'left';
        } // check popupHeight, if popup width excessed the limit then assign proper values to it


        if (scope.popupHeight >= windowBottom) {
          scope.popupHeight = windowBottom - scope.speechBubbleHeight;
        } // According to popupAlignment modify popuptop position


        if ('TOP' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + //
          eventData.elementObject[0].offsetHeight / 2 - (scope.popupHeight - scope.speechBubbleHeight);
        } else if ('BOTTOM' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + //
          eventData.elementObject[0].offsetHeight / 2 - scope.speechBubbleHeight;
        } else if ('CENTER' === popupAlignment) {
          scope.popuptop = eventData.elementObject[0].offsetTop + //
          eventData.elementObject[0].offsetHeight / 2 - scope.popupHeight / 2;
        } // reposition popup top, when popup width goes beyond windowBottom limit


        if (scope.popuptop + scope.popupHeight >= windowBottom) {
          scope.popuptop = scope.popuptop - (scope.popuptop + scope.popupHeight - windowBottom) - scope.speechBubbleWidth / 2;
        }

        if (scope.popuptop < 0) {
          scope.popuptop = windowTop;
        } // check if speechBubbleTop position needs to modify according to popup height


        scope.speechBubbleTop = eventData.elementObject[0].offsetTop - scope.popuptop + //
        eventData.elementObject[0].offsetHeight / 2 - scope.speechBubbleHeight / 2;
      } else if (popupOrientation === 'TOP') {
        scope.speechBubbleleft = 0; // update popup orientation for further use

        eventData.orientation = 'top'; // check popup width, if popup width excessed the limit then assign proper values to it

        if (scope.popupwidth >= windowRight) {
          scope.popupwidth = windowRight - scope.speechBubbleHeight;
        } // check popupHeight, if popup height excessed distanceFromWindowTop BUT NOT excessed minPopupHeight,then calculate avilable space for popup height and assign to popupHeight


        if (scope.popupHeight >= scope.distanceFromWindowTop && scope.minPopupHeight <= scope.distanceFromWindowTop - scope.speechBubbleHeight) {
          scope.popupHeight = scope.distanceFromWindowTop - scope.speechBubbleHeight;
        } else if (scope.popupHeight >= scope.distanceFromWindowTop && scope.distanceFromWindowTop <= scope.minPopupHeight //
        && scope.distanceToWindowBottom > scope.minPopupHeight) {
          // switch the TOP position balloon popup to BOTTOM position only if ,
          // 1] popupHeight >= scope.distanceFromWindowTop
          // 2] distanceFromWindowTop < minPopupHeight
          // 3] distanceToWindowBottom > minPopupHeight
          // check popupHeight, if popup height excessed the limit then assign proper values to it
          if (scope.popupHeight >= scope.distanceToWindowBottom) {
            scope.popupHeight = scope.distanceToWindowBottom - scope.speechBubbleHeight;
          } // update popup orientation for further use


          eventData.orientation = 'bottom';
        } // According to popupAlignment modify popupleft position


        if ('RIGHT' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + eventData.elementObject[0].offsetWidth / 2 - //
          scope.speechBubbleHeight;
        } else if ('LEFT' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + //
          eventData.elementObject[0].offsetWidth / 2 - (scope.popupwidth - scope.speechBubbleHeight);
        } else if ('CENTER' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + //
          eventData.elementObject[0].offsetWidth / 2 - scope.popupwidth / 2;
        } // reposition popup Left, when popup width goes beyond windowRight limit


        if (scope.popupleft + scope.popupwidth >= windowRight) {
          scope.popupleft = scope.popupleft - (scope.popupleft + scope.popupwidth - windowRight) - scope.speechBubbleWidth / 2;
        }

        if (scope.popupleft < 0) {
          scope.popupleft = windowLeft + scope.speechBubbleWidth / 2;
        } // check if speechBubbleleft position needs to modify according to popup popupwidth


        scope.speechBubbleleft = eventData.elementObject[0].offsetLeft - scope.popupleft + //
        eventData.elementObject[0].offsetWidth / 2 - scope.speechBubbleHeight / 2;
      } else if (popupOrientation === 'BOTTOM') {
        scope.speechBubbleleft = 0; // update popup orientation for further use

        eventData.orientation = 'bottom'; // check popup width, if popup width excessed the limit then assign proper values to it

        if (scope.popupwidth >= windowRight) {
          scope.popupwidth = windowRight - scope.speechBubbleHeight;
        } // check popupHeight, if popup height excessed distanceToWindowBottom BUT NOT excessed minPopupHeight,then calculate avilable space for popup height and assign to popupHeight


        if (scope.popupHeight >= scope.distanceToWindowBottom && scope.minPopupHeight <= scope.distanceToWindowBottom - scope.speechBubbleHeight) {
          // New popup Height must be greater then minPopupHeight
          scope.popupHeight = scope.distanceToWindowBottom - scope.speechBubbleHeight;
        } else if (scope.popupHeight >= scope.distanceToWindowBottom && scope.distanceToWindowBottom <= scope.minPopupHeight //
        && scope.distanceFromWindowTop > scope.minPopupHeight) {
          // switch the BOTTOM position balloon popup to TOP position only if ,
          // 1] popupHeight >= scope.distanceToWindowBottom
          // 2] distanceToWindowBottom < minPopupHeight
          // 3] distanceFromWindowTop > minPopupHeight
          // check popupHeight, if popup height excessed the limit then assign proper values to it
          if (scope.popupHeight >= scope.distanceFromWindowTop) {
            scope.popupHeight = scope.distanceFromWindowTop - scope.speechBubbleHeight;
          } // update popup orientation for further use


          eventData.orientation = 'top';
        } // According to popupAlignment modify popupleft position


        if ('RIGHT' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + //
          eventData.elementObject[0].offsetWidth / 2 - scope.speechBubbleHeight;
        } else if ('LEFT' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + //
          eventData.elementObject[0].offsetWidth / 2 - (scope.popupwidth - scope.speechBubbleHeight);
        } else if ('CENTER' === popupAlignment) {
          scope.popupleft = eventData.elementObject[0].offsetLeft + //
          eventData.elementObject[0].offsetWidth / 2 - scope.popupwidth / 2;
        } // reposition popup Left, when popup width goes beyond windowRight limit


        if (scope.popupleft + scope.popupwidth >= windowRight) {
          scope.popupleft = scope.popupleft - (scope.popupleft + scope.popupwidth - windowRight) - scope.speechBubbleWidth / 2;
        }

        if (scope.popupleft <= 0) {
          scope.popupleft = windowLeft + scope.speechBubbleWidth / 2;
        } // check if speechBubbleleft position needs to modify according to popup popupwidth


        scope.speechBubbleleft = eventData.elementObject[0].offsetLeft - scope.popupleft + //
        eventData.elementObject[0].offsetWidth / 2 - scope.speechBubbleHeight / 2;
      } // cross verification of negative values


      if (scope.popupHeight < 0) {
        scope.popupHeight = windowTop;
      }

      if (scope.popupwidth < 0) {
        scope.popupwidth = windowLeft;
      } // Pass balloon popup orientation, popupwidth, popupHeight and UI object information to aw-popup-panel


      popupPanelData.popupUpLevelElement.element = eventData.elementObject[0];
      popupPanelData.popupUpLevelElement.orientation = eventData.orientation;
      popupPanelData.popupUpLevelElement.width = scope.popupwidth;
      popupPanelData.popupUpLevelElement.height = scope.popupHeight;
      popupPanelData.popupUpLevelElement.popupleft = scope.popupleft;
      popupPanelData.popupUpLevelElement.popuptop = scope.popuptop;
    };
  }]);
});