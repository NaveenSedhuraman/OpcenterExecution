"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 angular
 */

/**
 * @module js/popupService
 */
define(['app', 'angular', 'jquery', 'js/eventBus', 'lodash', 'Debug', //
'js/panelContentService', 'js/viewModelService', 'js/aw-popup.directive'], //
function (app, ngModule, $, eventBus, _, Debug) {
  'use strict';

  var trace = new Debug('popupService');
  var exports = {};
  var _rootScope = null;
  var _$injector = null;
  /**
   * Load view and view model for the provided panel ID and show the UI in a popup.
   *
   * @param {String} popupId - panel id
   */

  exports.showPopup = function (popupId, popUpHeight, popUpWidth) {
    exports.popupInfo = {};

    if (angular.isDefined(popUpHeight) || angular.isDefined(popUpWidth)) {
      exports.popupInfo = {
        height: popUpHeight,
        width: popUpWidth
      };
    }

    _$injector.invoke(['panelContentService', 'viewModelService', '$compile', function (panelContentService, panelViewModelService, compile) {
      panelContentService.getPanelContent(popupId).then(function (viewAndViewModelResponse) {
        panelViewModelService.populateViewModelPropertiesFromJson(viewAndViewModelResponse.viewModel).then(function (declarativeViewModel) {
          var scope = _rootScope.$new();

          panelViewModelService.setupLifeCycle(scope, declarativeViewModel);
          var body = $('body');
          var element = $(viewAndViewModelResponse.view);
          element.appendTo(body);
          compile(element)(scope);
        });
      });
    }]);
  };
  /**
   * check and reset the position of the popup , because sometimes the offsetWidth is not correct at the beginning
   *
   * @param {Object} relativeObject - the ui object to position relative to
   * @param {Object} popupWidgetElem - the ui popup object
   * @param {int} offsetWidth - offsetWidth the drop down's offset width
   * @param {int} offsetHeight - offsetHeight the drop down's offset height
   */


  exports.resetPopupPosition = function (relativeObject, popupWidgetElem, offsetWidth, offsetHeight) {
    var left = popupWidgetElem.offsetLeft;
    var parentEdgeToWindowsRight = popupWidgetElem.clientWidth + relativeObject[0].parentElement.clientWidth;
    var popupToLeft = $(window).outerWidth() + $(window).scrollLeft() - parentEdgeToWindowsRight;

    if (popupWidgetElem.offsetLeft > popupToLeft && popupToLeft > 0) {
      left = popupToLeft;
    } else if (popupWidgetElem.offsetLeft < relativeObject[0].parentElement.clientWidth && popupToLeft > 0) {
      left = relativeObject[0].parentElement.clientWidth;
    }

    popupWidgetElem.style.left = left + 'px';
  };
  /**
   * if the position has changed from left-aline to right-aline, then doubleCheck the position
   *
   * @param {Object} relativeObject - the ui object to position relative to
   * @param {Object} popupWidgetElem - the ui popup object
   * @param {int} left - current left value of the popup
   */


  exports.setPositionAfterAlineChange = function (relativeObject, popupWidgetElem, left) {
    var popupHeaderElem = relativeObject;
    var textBoxOffsetWidth = popupHeaderElem[0].offsetWidth;
    var offsetWidth = popupWidgetElem.offsetWidth;
    var offsetWidthDiff = offsetWidth - textBoxOffsetWidth;
    var RaletiveLeft = $(popupHeaderElem).offset().left;

    if (RaletiveLeft - left < offsetWidthDiff) {
      left = RaletiveLeft - offsetWidthDiff;
    }

    return left;
  };
  /**
   * set the position for the popup, using for group-command popup and link-with-popup
   *
   * @param {Object} relativeObject - the ui object to position relative to
   * @param {Object} popupWidgetElem - the ui popup object
   * @param {int} offsetWidth - offsetWidth the drop down's offset width
   * @param {int} offsetHeight - offsetHeight the drop down's offset height
   */


  exports.setPopupPosition = function (relativeObject, popupWidgetElem, offsetWidth, offsetHeight) {
    var popupHeaderElem = relativeObject; // Calculate left position for the popup. The computation for
    // the left position is bidi-sensitive.

    var textBoxOffsetWidth = popupHeaderElem[0].offsetWidth;
    var offsetWidthDiff = offsetWidth - textBoxOffsetWidth; // Calculate left position for the popup

    var left; // Left-align the popup.

    left = $(popupHeaderElem).offset().left;

    if (offsetWidthDiff > 0) {
      // Make sure scrolling is taken into account, since
      var windowRight = $(window).outerWidth() + $(window).scrollLeft();
      var windowLeft = $(window).scrollLeft(); // Distance from the left edge of the text box to the right edge
      // of the window

      var distanceToWindowRight = windowRight - left; // Distance from the left edge of the text box to the left edge of the
      // window

      var distanceFromWindowLeft = left - windowLeft; // If there is not enough space for the overflow of the popup's
      // width to the right of hte text box, and there IS enough space for the
      // overflow to the left of the text box, then right-align the popup.
      // However, if there is not enough space on either side, then stick with
      // left-alignment.

      if (distanceToWindowRight <= offsetWidth && distanceFromWindowLeft >= offsetWidthDiff) {
        if (left === $(popupHeaderElem)[0].offsetLeft) {
          // Align with the right edge of the text box.
          left -= offsetWidthDiff;
          popupWidgetElem.style.left = left + 'px';
          left = exports.setPositionAfterAlineChange(relativeObject, popupWidgetElem, left);
        } else {
          left = $(popupHeaderElem)[0].offsetLeft - offsetWidthDiff;
          popupWidgetElem.style.left = left + 'px';
        }
      } else {
        left = $(popupHeaderElem)[0].offsetLeft;
      }
    } // Calculate top position for the popup


    var top = $(popupHeaderElem).offset().top; // change offset().top to integer type, used for the following comparison

    var roundTop = Math.round(top); // Make sure scrolling is taken into account, since
    // box.getAbsoluteTop() takes scrolling into account.

    var windowTop = $(window).scrollTop();
    var windowBottom = $(window).scrollTop() + $(window).outerHeight(); // Distance from the top edge of the window to the top edge of the
    // text box

    var distanceFromWindowTop = top - windowTop; // Distance from the bottom edge of the window to the bottom edge of
    // the text box

    var distanceToWindowBottom = windowBottom - (top + popupHeaderElem[0].offsetHeight); // If there is not enough space for the popup's height below the text
    // box and there IS enough space for the popup's height above the text
    // box, then then position the popup above the text box. However, if there
    // is not enough space on either side, then stick with displaying the
    // popup below the text box.

    if (roundTop === $(popupHeaderElem)[0].offsetTop || Math.floor(top) === $(popupHeaderElem)[0].offsetTop || Math.ceil(top) === $(popupHeaderElem)[0].offsetTop) {
      if (distanceToWindowBottom < offsetHeight && distanceFromWindowTop >= offsetHeight) {
        top -= offsetHeight;
      } else {
        // Position above the text box
        top += popupHeaderElem[0].offsetHeight;
      }
    } else {
      var offsetTopTemp = $(popupHeaderElem)[0].offsetTop < roundTop ? $(popupHeaderElem)[0].offsetTop : roundTop;

      if (distanceToWindowBottom < offsetHeight && distanceFromWindowTop >= offsetHeight) {
        top = offsetTopTemp + popupHeaderElem[0].offsetHeight - offsetHeight;
      } else {
        // if there is enough space to put the popup, then show it according to the smaller one in case we have a scroll bar
        top = offsetTopTemp + popupHeaderElem[0].offsetHeight;
      }
    } // Check if orientation is present for popup.
    // If orientation is present then, left and top position of popup modify according to orientation


    if (relativeObject.orientation !== null) {
      // Get the width and Height of popup from relative Object
      var popupwidth = parseInt(relativeObject.width, 10);
      var popupHeight = parseInt(relativeObject.height, 10); // This updated popup top and left is used for reposition the popup according to popup height and width

      var popuptop = parseInt(relativeObject.popuptop, 10);
      var popupleft = parseInt(relativeObject.popupleft, 10);
      var speechBubbleHeight = 20;
      var speechBubbleWidth = 15; // These values are based on how the position of speech bubble
      // is set in createPopupSpeechBubble of aw-balloon-popup-panel.controller.js

      var popupSpeechBubbleOffset = 5; // calculate left and top position for the popup with respect to element

      if (relativeObject.orientation === 'left') {
        top = popuptop;
        left = relativeObject.element.offsetLeft - popupwidth - speechBubbleWidth;
      } else if (relativeObject.orientation === 'right') {
        top = popuptop;
        left = relativeObject.element.offsetLeft + relativeObject.element.offsetWidth + speechBubbleHeight / 2;
        left += popupSpeechBubbleOffset - 2;
      } else if (relativeObject.orientation === 'top') {
        top = relativeObject.element.offsetTop - popupHeight - speechBubbleHeight / 2;
        top -= popupSpeechBubbleOffset;
        left = popupleft;
      } else if (relativeObject.orientation === 'bottom') {
        top = relativeObject.element.offsetTop + speechBubbleHeight / 2 + relativeObject.element.offsetHeight;
        top += popupSpeechBubbleOffset;
        left = popupleft;
      } // Assign the width and height to popup from relative Object
      // if block needs to execute only if it is extended tooltip because we need to provide max height and width to popup whereas in other
      // popup flovors like balloonpopup their is no requirement of max limits its has its own width/height configuration.


      try {
        if (relativeObject.element.popupType && relativeObject.element.popupType === 'extendedTooltip') {
          popupWidgetElem.style.maxWidth = 360 + 'px';
          popupWidgetElem.style.maxHeight = 360 + 'px';
          popupWidgetElem.style.minWidth = 0 + 'px';
        } else {
          popupWidgetElem.style.width = popupwidth + 'px';
          popupWidgetElem.style.height = popupHeight + 'px';
        }
      } catch (e) {
        trace('Error in popup creation', e, relativeObject.element);
      }
    }

    popupWidgetElem.style.top = top + 'px';
    popupWidgetElem.style.left = left + 'px';
  };
  /**
   * close the popup widget on the event
   */


  exports.hidePopUp = function (event) {
    event.stopPropagation();
    var popupWidgetElem = event.data[0];
    var $scope = event.data[1]; // check if we click on the same link , or if we selected an item

    if (popupWidgetElem.find(event.target).length > 0 && popupWidgetElem.find(event.target)[0] === event.target && event.target.localName !== 'li') {
      return;
    } // if this time the selected item isn't the same with the previous one,then close the popup


    if ($scope.showPopup && (event.target.innerText !== $scope.previousSelect || !$scope.previousSelect)) {
      var eventData = {
        property: $scope.prop,
        previousSelect: $scope.previousSelect
      }; // only if we select an item (and not the same with previous selected one), we publish the "awPopupItem.selected" event

      if (popupWidgetElem.find(event.target).length > 0) {
        eventBus.publish('awPopupItem.selected', eventData);
      }

      $scope.$apply(function () {
        $scope.showPopup = false;
      });

      if (popupWidgetElem[0].children.length > 1) {
        var element = ngModule.element(popupWidgetElem[0].children[1].children);
        element.remove();
      }
    }

    $('body').off('click', exports.hidePopUp);
  };
  /**
   *
   * @memberof NgServices
   * @member popupService
   */


  app.factory('popupService', ['$rootScope', '$injector', function (rootScope, $injector) {
    _rootScope = rootScope;
    _$injector = $injector;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'popupService'
  };
});