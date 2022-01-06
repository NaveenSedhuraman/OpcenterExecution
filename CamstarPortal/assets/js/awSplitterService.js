"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/awSplitterService
 */
define(['app', 'angular', 'js/eventBus', 'js/localStorage', 'js/logger', 'js/analyticsService', 'js/appCtxService'], function (app, ngModule, eventBus, localStorage, logger, analyticsSvc) {
  'use strict';
  /**
   * This service is used to add a mouse down event handler for <aw-splitter> elements and to set the direction of the
   * splitter based on where it is in the grid system (between two rows or between two columns).
   *
   * It also provide window level event handlers for mouse move and mouse down that are used to update an active
   * splitter.
   *
   * @memberof NgServices
   * @member awSplitterService
   */

  app.factory('awSplitterService', ['$window', 'appCtxService', function ($window, appCtxService) {
    var exports = {};
    exports.constants = {
      gridSystemSize: 12,
      minSize1: 20,
      minSize2: 20
    }; // A structure set when a splitter is activated (only one splitter an be active at any time)
    // See exports.mouseDownEvent for structure definition

    exports.activeSplitterData = null;
    exports.isPrimarySplitter = false;
    /**
     * Initialize a Given Splitter
     *
     * Set the onmousedown event for the splitter and establishes the type of splitter
     *
     * @param {object} scopeElements - The angularJS scope elements used to define the splitter
     * @param {object} attributes - The angularJS scope attributes defined on the splitter
     */

    exports.initSplitter = function (scopeElements, attributes) {
      var splitter;
      var ctx = appCtxService.ctx;
      var initialSplitterState; // To handle gwt issues

      if (scopeElements[0].parentNode.parentNode && scopeElements[0].parentNode.parentNode.classList.contains('aw-layout-sashPanel')) {
        splitter = scopeElements[0].parentNode.parentNode;
      } else {
        splitter = scopeElements[0];
      }

      var area1 = splitter.previousElementSibling;
      var area2 = splitter.nextElementSibling; // If user defines a direction use that. If not, check for row/column on each side. Else default to vertical

      if (attributes.direction) {
        if (attributes.direction.toUpperCase() === 'HORIZONTAL') {
          splitter.style.cursor = 'row-resize';
        } else if (attributes.direction.toUpperCase() === 'VERTICAL') {
          splitter.style.cursor = 'col-resize';
        }
      } else if (area1 && area2) {
        var classList1 = area1.classList;
        var classList2 = area2.classList;

        if (classList1.contains('aw-layout-row') && classList2.contains('aw-layout-row')) {
          splitter.style.cursor = 'row-resize';
        } else if (classList1.contains('aw-layout-column') && classList2.contains('aw-layout-column')) {
          splitter.style.cursor = 'col-resize';
        }
      } else {
        splitter.style.cursor = 'col-resize';
      }

      splitter.onmousedown = exports.mouseDownEvent;
      splitter.ontouchstart = exports.mouseDownEvent; // If this is the primary sash, load its previous position for a specific view.

      if (attributes.isprimarysplitter === 'true') {
        if (ctx && ctx.ViewModeContext && ctx.ViewModeContext.ViewModeContext) {
          exports.viewModeContext = ctx.ViewModeContext.ViewModeContext;
        }

        if (localStorage.get(exports.viewModeContext)) {
          initialSplitterState = JSON.parse(localStorage.get(exports.viewModeContext));

          if (initialSplitterState && area1 && area2) {
            area1.style.flexBasis = initialSplitterState.area1Size + 'px';
            area1.style.webkitFlexBasis = initialSplitterState.area1Size + 'px';
            area2.style.flexBasis = initialSplitterState.area2Size + 'px';
            area2.style.webkitFlexBasis = initialSplitterState.area2Size + 'px';
          }
        }
      }
    };
    /**
     * Mouse Down Event - initialize the active splitter
     *
     * @param {object} event - mouse down event object
     */


    exports.mouseDownEvent = function (event) {
      // Do not allow accidental text selection - which will cause the splitter to lockup
      // Note that there are various CSS properties to control this but not a common one yet (as far as I can tell)
      // Look for user-select: none (also ms-user-select and webkit-user-select and moz-user-select)
      // Until there is a common way to prevent accidental selection - here is the workaround
      event = event || window.event;

      if (window.getSelection) {
        var selection = window.getSelection();
        var node = selection.focusNode;

        if (node !== null) {
          selection.removeAllRanges();
        }
      } else {
        if (document.selection) {
          document.selection.empty();
        }
      }

      event.stopPropagation();
      event.preventDefault(); // Create the active splitter data structure

      var x = event.clientX;
      var y = event.clientY;

      if (!x && !y) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      var splitter = event.currentTarget;
      var area1 = splitter.previousElementSibling;
      var area2 = splitter.nextElementSibling;
      var minSize1 = null;
      var minSize2 = null;
      var isPrimarySplitter = null; // To handle gwt issues

      if (splitter.classList.contains('aw-layout-sashPanel')) {
        minSize1 = parseInt(splitter.firstElementChild.firstElementChild.getAttribute('min-size-1'));
        minSize2 = parseInt(splitter.firstElementChild.firstElementChild.getAttribute('min-size-2'));
        isPrimarySplitter = splitter.firstElementChild.firstElementChild.getAttribute('isprimarysplitter');
      } else {
        minSize1 = parseInt(splitter.getAttribute('min-size-1'));
        minSize2 = parseInt(splitter.getAttribute('min-size-2'));
        isPrimarySplitter = splitter.getAttribute('isprimarysplitter');
      } // If user did not define minimum sizes, default to 20


      if (!minSize1 && !minSize2) {
        minSize1 = exports.constants.minSize1;
        minSize2 = exports.constants.minSize2;
      }

      var direction = splitter.style.cursor;
      exports.activeSplitterData = {
        splitter: splitter,
        // The splitter element
        area1: area1,
        // The element to the left or on top
        area2: area2,
        // The element to the right or on bottom
        minSize1: minSize1,
        // The element to the left or on top minimum length
        minSize2: minSize2,
        // The element to the right or on bottom minimum length
        direction: direction,
        // row-resize or column-resize
        isPrimarySplitter: isPrimarySplitter,
        // If the current splitter is the primary to remember its position
        x: x,
        y: y
      }; // Last mouse position used to update splitter

      ngModule.element($window).on('mousemove', exports.mouseMoveEventHandler);
      ngModule.element($window).on('mouseup', exports.mouseUpEventHandler);
      ngModule.element($window).on('touchmove', exports.mouseMoveEventHandler);
      ngModule.element($window).on('touchend', exports.mouseUpEventHandler);
      ngModule.element($window).on('touchcancel', exports.mouseUpEventHandler);
    };
    /**
     * Mouse Up Event Handler - stop the active splitter
     *
     * @param {event} event - Event object
     */


    exports.mouseUpEventHandler = function () {
      ngModule.element($window).off('mousemove', exports.mouseMoveEventHandler);
      ngModule.element($window).off('mouseup', exports.mouseUpEventHandler);
      ngModule.element($window).off('touchmove', exports.mouseMoveEventHandler);
      ngModule.element($window).off('touchend', exports.mouseUpEventHandler);
      ngModule.element($window).off('touchcancel', exports.mouseUpEventHandler); // Remember the sash's position for the specific view.

      if (exports.activeSplitterData.isPrimarySplitter && exports.viewModeContext) {
        var area1Size = exports.activeSplitterData.area1.clientWidth;
        var area2Size = exports.activeSplitterData.area2.clientWidth;
        var data = {
          area1Size: area1Size,
          area2Size: area2Size
        };
        localStorage.publish(exports.viewModeContext, JSON.stringify(data)); // Publish event to log splitter data to analytics

        var splitterEventData = {};
        splitterEventData.sanAnalyticsType = 'Splitter';
        splitterEventData.sanCommandId = 'Splitter';
        splitterEventData.sanCommandTitle = 'Splitter';
        splitterEventData.sanViewMode = exports.viewModeContext;
        splitterEventData.sanPrimaryPercentage = (area1Size / (area1Size + area2Size) * 100).toFixed(2);
        splitterEventData.sanPixelSize = area1Size;
        analyticsSvc.logCommands(splitterEventData);
      }

      exports.activeSplitterData = null;
    };
    /**
     * Mouse Move Event Handler - update the active splitter
     *
     * @param {event} event - Event object
     */


    exports.mouseMoveEventHandler = function (event) {
      event = event || window.event;

      if (exports.activeSplitterData === null) {
        return;
      }

      event.preventDefault();
      var x = event.clientX;
      var y = event.clientY;

      if (!x && !y) {
        var touch = event.originalEvent.touches[0];
        x = touch.clientX;
        y = touch.clientY;
      }

      exports.updateActiveSplitter(x, y);
    };
    /**
     * Update Active Splitter
     *
     * For a given mouse position update the size of the associated DIV elements for the active splitter.
     *
     * @param {number} xPos - current mouse X position
     * @param {number} yPos - current mouse Y position
     */


    exports.updateActiveSplitter = function (xPos, yPos) {
      var splitterData = exports.activeSplitterData;

      if (!splitterData) {
        return;
      }

      var xDelta = xPos - splitterData.x;
      var yDelta = yPos - splitterData.y;

      if (xDelta === 0 && yDelta === 0) {
        return;
      }

      var area1 = splitterData.area1;
      var area2 = splitterData.area2;
      var minSize1 = splitterData.minSize1;
      var minSize2 = splitterData.minSize2;
      var size1 = parseFloat(area1.style.flexGrow);
      var size2 = parseFloat(area2.style.flexGrow);
      var direction = splitterData.direction;

      if (direction === 'row-resize') {
        var h1 = area1.clientHeight;
        var h2 = area2.clientHeight;

        if (exports.splitterLimit(h1, h2, yDelta, minSize1, minSize2)) {
          // make max size/min size if we hit the limit, not at the limit yet & not using flex grow
          if (!size1 && !size2) {
            if (yDelta > 0 && h2 !== minSize2) {
              exports.updateAreaSize(area1, size1, h1, h2 - minSize2);
              exports.updateAreaSize(area2, size2, minSize2, '');
            } else if (yDelta < 0 && h1 !== minSize1) {
              exports.updateAreaSize(area1, size1, minSize1, '');
              exports.updateAreaSize(area2, size2, h2, h1 - minSize1);
            }

            splitterData.y = splitterData.splitter.getBoundingClientRect().top - 10;
            splitterData.x = xPos;
          }

          return;
        }

        exports.updateAreaSize(area1, size1, h1, yDelta);
        exports.updateAreaSize(area2, size2, h2, -yDelta);
      } else {
        // direction is column-resize
        var w1 = area1.clientWidth;
        var w2 = area2.clientWidth;

        if (exports.splitterLimit(w1, w2, xDelta, minSize1, minSize2)) {
          // make max size/min size if we hit the limit, not at the limit yet & not using flex grow
          if (!size1 && !size2) {
            if (xDelta > 0 && w2 !== minSize2) {
              exports.updateAreaSize(area1, size1, w1, w2 - minSize2);
              exports.updateAreaSize(area2, size2, minSize2, '');
            } else if (xDelta < 0 && w1 !== minSize1) {
              exports.updateAreaSize(area1, size1, minSize1, '');
              exports.updateAreaSize(area2, size2, w2, w1 - minSize1);
            }

            splitterData.x = splitterData.splitter.getBoundingClientRect().right - 10;
            splitterData.y = yPos;
          }

          return;
        }

        exports.updateAreaSize(area1, size1, w1, xDelta);
        exports.updateAreaSize(area2, size2, w2, -xDelta);
      }

      splitterData.x = xPos;
      splitterData.y = yPos; // Tell the world the areas have changed size

      eventBus.publish('aw-splitter-update', {
        splitter: splitterData.splitter,
        area1: area1,
        area2: area2
      });
    };
    /**
     * Update Area Size
     *
     * Update the size of a given area based on a delta amount and the type of area (fixed or proportional)
     *
     * @param {object} area - a row or column element
     * @param {number} oldSize - the previous attribute size value for the row or column
     * @param {number} oldSizePx - the previous rendered size in px for the row or column
     * @param {number} deltaPx - the amount to change the area in px
     */


    exports.updateAreaSize = function (area, oldSize, oldSizePx, deltaPx) {
      var newSizePx = oldSizePx + deltaPx;
      var gridSystemSize = exports.constants.gridSystemSize; // This is a fixed size
      // Note the size is no longer in units of em because the user has set a fix px size

      area.style.flexBasis = newSizePx.toString() + 'px';
      area.style.webkitFlexBasis = newSizePx.toString() + 'px';
    };
    /**
     * Splitter Limit - return true if a splitter has hit a limiting size
     *
     * Return true if the limit is being hit for one of the areas The test is done this way because it is possible for
     * areas to become smaller than the limit due to window resizing. We want to be able to grow areas that are too
     * small with a splitter but not continue to shrink those areas
     *
     * @param {number} size1 - Size (width or height) of left or top area for the active splitter
     * @param {number} size2 - Size (width or height) of right or bottom area for the active splitter
     * @param {number} delta - Amount the sizes are being changed
     * @param {number} minSize1 - Minimum size (width or height) of left or top area for the active splitter
     * @param {number} minSize2 - Minimum size (width or height) of right or bottom area for the active splitter
     *
     *
     * @return {boolean} - true if a limit would be hit by the delta change
     */


    exports.splitterLimit = function (size1, size2, delta, minSize1, minSize2) {
      if (delta > 0) {
        // The right or bottom area is being reduced in size
        if (size2 - delta < minSize2) {
          return true;
        }
      } else {
        // delta < 0 - the left or top area is being reduced in size
        if (size1 + delta < minSize1) {
          return true;
        }
      }

      return false;
    };
    /**
     * Report a usage error.
     *
     * @param {string} errorMessage - error to report.
     */


    exports.reportError = function (errorMessage) {
      // alert('awLayoutSplitterService:' + errorMessage);
      logger.warn('awSplitterService:' + errorMessage);
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'awSplitterService'
  };
});