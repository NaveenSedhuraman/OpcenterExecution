"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Fill Down Helper for listen hammer event and manipulate the table element
 *
 * @module js/splmTableFillDownHelper
 *
 * @publishedApolloService
 *
 */
define([//
'lodash', 'hammer', 'js/browserUtils', 'js/splmTableUtils', 'js/logger', 'js/eventBus'], function (_, hammer, browserUtils, _t, logger, eventBus) {
  'use strict';
  /**
   * Instances of this class represent a fill down helper for PL Table
   *
   * @class SPLMTableFillDownHelper
   * @param {Object} tableElem PL Table DOMElement
   */

  function SPLMTableFillDownHelper(tableElem) {
    var self = this;

    if (!browserUtils.isMobileOS) {
      document.body.classList.add('nonTouch');
    } // reference to the entire table visual tree element


    delete self.tableContentElt; // element ref to the source cellTop

    delete self.currentSrcCell; // get the bounding rectangle of the source cell

    delete self.currentSrcCellRectangle; // currently registered event handler

    delete self.currentPanHandler;
    delete self.currentPanHandlerElement;
    self.scrollDelta = 0; // currently doing a drag?

    self.isActivelyDragging = false; // the cells within the current drag area; modified as the drag action is done

    self.dragSelectedCells = []; // unhook the drag event hanlder, reset the drag state

    self.removePanEvtHandler = function () {
      if (self.currentPanHandler) {
        self.currentPanHandler.off('panup pandown panend panstart pancancel', self.handleHammerCellDrag);
      }

      delete self.currentPanHandler;
      self.isActivelyDragging = false;
      delete self.currentPanHandlerElement;

      if (self.currentSrcCell) {
        self.currentSrcCell.classList.remove('dragSrc');
      }
    }; // pan in some direction. compute the drag coords, find the cells within it
    // (includes the source and target cells), and style the cells appropriately
    // to mark the drag area


    self.handlePan = function (hEvt) {
      // get all cells in this column - the attribute name must match the rendering code
      var getAllColCells = function getAllColCells() {
        return _t.util.getColumnContentCellElementsByIndex(self.tableContentElt, self.targetColNumber);
      };

      var scrollAsNeeded = function scrollAsNeeded(panEvent) {
        // look at table height and offset to determine if we are near the top or bottom?
        var tableScrollContentRenderer = _t.util.getTableInstance(tableElem).renderer;

        var boundingTop = self.currentViewportElement.getBoundingClientRect().top;
        var boundingBottom = boundingTop + self.currentViewportElement.getBoundingClientRect().height;

        if (panEvent.srcEvent.pageY < boundingTop + 10) {
          // scroll up logic
          self.scrollDelta = tableScrollContentRenderer.manualScroll(false);
          logger.debug(scroll, ' scroll up');
        } else if (panEvent.srcEvent.pageY > boundingBottom - 10) {
          // scroll down logic
          self.scrollDelta = tableScrollContentRenderer.manualScroll(true);
          logger.debug(scroll, ' scroll down');
        }
      };

      var yDragTop;
      var yDragBottom; // reset the array of cells in the drag area

      self.dragSelectedCells = []; // which direction is the drag in?

      if (hEvt.srcEvent.clientY + self.scrollDelta > self.currentSrcCellRectangle.top + 1) {
        // down
        self.dragUp = false;
        yDragTop = self.currentSrcCellRectangle.top - 1;
        yDragBottom = hEvt.srcEvent.clientY + self.scrollDelta;
      } else {
        // up - swap for contains calculations
        self.dragUp = true;
        yDragTop = hEvt.srcEvent.clientY + self.scrollDelta;
        yDragBottom = self.currentSrcCellRectangle.bottom + 1;
      } // check if the data is being virtualized, if so, adjust target area


      var currentSrcCellProperty = _t.util.getPropertyByCellElement(self.currentSrcCell);

      if (self.srcUiVal !== currentSrcCellProperty.uiValue) {
        if (self.dragUp) {
          yDragBottom = 9999;
        } else {
          yDragTop = 0;
        }
      } // loop through each cell to see if it is in the drag area


      var columnCells = getAllColCells();
      var cellIndex = 0;

      for (var i = 0; i < columnCells.length; i++) {
        if (self.currentSrcCell === columnCells[i]) {
          cellIndex = i;
          break;
        }
      }

      for (i = 0; i < columnCells.length; i++) {
        var currentCell = columnCells[i];
        var indexDelta = i - cellIndex;
        var currentCellTop = self.currentSrcCellRectangle.top + self.currentSrcCellRectangle.height * indexDelta;
        var currentCellBottom = currentCellTop + self.currentSrcCellRectangle.height; // clear any previous styling

        currentCell.classList.remove('dragCellTop');
        currentCell.classList.remove('dragCell');
        currentCell.classList.remove('dragCellBottom');
        var yCell = currentCellTop; // y coord for this cell

        if (self.dragUp === true) {
          yCell = currentCellBottom;
        } // compute whether or not this cell is in the drag area


        if (yCell < yDragBottom && yCell >= yDragTop) {
          // if ( hEvt.srcEvent.clientY > currentCellTop && hEvt.srcEvent.clientY < currentCellBottom ) {
          // this element fits inside the selection rectangle
          currentCell.classList.add('dragCell');
          self.dragSelectedCells.push(currentCell);
        }
      } // decorate top and bottom cells specially


      if (self.dragSelectedCells.length) {
        self.dragSelectedCells[0].classList.add('dragCellTop');
        self.dragSelectedCells[self.dragSelectedCells.length - 1].classList.add('dragCellBottom');
      } // attempt to scroll the grid if we are dragging off


      scrollAsNeeded(hEvt);
    }; // the end pan/drag has been encountered - trigger the data processing
    // based on the drag area boundary


    self.handlePanEnd = function () {
      // eslint-disable-line no-unused-vars
      // check that we have more than just the source cell
      if (self.dragSelectedCells.length > 1) {
        var endTargetProp;
        var direction;

        if (self.dragUp) {
          endTargetProp = _t.util.getPropertyByCellElement(self.dragSelectedCells[0]);
          direction = 'up';
        } else {
          endTargetProp = _t.util.getPropertyByCellElement(self.dragSelectedCells[self.dragSelectedCells.length - 1]);
          direction = 'down';
        } // iterate the target cells


        for (var inx = 0; inx < self.dragSelectedCells.length; inx++) {
          if (self.currentSrcCell !== self.dragSelectedCells[inx]) {
            var sourceProperty = _t.util.getPropertyByCellElement(self.currentSrcCell);

            var targetProperty = _t.util.getPropertyByCellElement(self.dragSelectedCells[inx]); // Make sure the value of the property is actually going to change


            if (!_.isEqual(sourceProperty.dbValues, targetProperty.dbValues)) {
              // eslint-disable-line
              var editCells = self.dragSelectedCells[inx].getElementsByClassName(_t.const.CLASS_AW_EDITABLE_CELL);

              if (editCells.length > 0 && editCells[0].classList.contains(_t.const.CLASS_AW_EDITABLE_CELL)) {
                editCells[0].classList.add(_t.const.CLASS_CELL_CHANGED);
              }
            }
          }

          self.dragSelectedCells[inx].classList.remove('dragCellTop');
          self.dragSelectedCells[inx].classList.remove('dragCell');
          self.dragSelectedCells[inx].classList.remove('dragCellBottom');
        } // for
        // emit this fill-complete event to be handled by the tabled


        var gridId = _t.util.getTableInstance(tableElem).gridId;

        eventBus.publish('awFill.completeEvent_' + gridId, {
          propertyName: self.propertyName,
          source: self.srcUid,
          endTarget: endTargetProp.parentUid,
          direction: direction
        });
      } // children > 1


      self.scrollDelta = 0;
      self.isActivelyDragging = false;
      self.tableContentElt.classList.remove('aw-jswidgets-dragfilling');
    };

    self.handlePanCancel = function () {
      self.removePanEvtHandler();
    };

    self.handlePanStart = function (hEvt) {
      // starting pan...
      self.dragUp = false;
      self.isActivelyDragging = true; // the source cell for the fill

      var srcCell = _t.util.closestElement(hEvt.target, '.' + _t.const.CLASS_CELL);

      self.currentSrcCell = srcCell;
      self.currentSrcCellRectangle = self.currentSrcCell.getBoundingClientRect();
      self.currentViewportElement = _t.util.closestElement(self.currentSrcCell, '.' + _t.const.CLASS_VIEWPORT);

      var property = _t.util.getPropertyByCellElement(self.currentSrcCell);

      self.srcUid = property.parentUid;
      self.srcUiVal = property.uiValue;
      self.propertyName = property.propertyName;
      self.tableContentElt = _t.util.closestElement(hEvt.target, _t.const.ELEMENT_TABLE); // table content area

      self.currentSrcCell.classList.add('dragSrc');
      self.tableContentElt.classList.add('aw-jswidgets-dragfilling');
      self.targetColNumber = self.currentSrcCell.columnDef.index;
    }; // function for handling the Pan/drag related events from hammer.
    // account for all the Hammer event states


    self.handleHammerCellDrag = function (hEvt) {
      if (hEvt.type === 'panstart') {
        self.handlePanStart(hEvt);
      } else if (hEvt.type === 'panend') {
        // ending pan
        self.handlePanEnd();
      } else if (hEvt.type === 'pancancel') {
        // cancelling pan
        self.handlePanCancel();
      } else if (self.isActivelyDragging) {
        // other event - actively dragging, so handle pan
        self.handlePan(hEvt);
      }
    }; // this is triggered from the drag handle drag action on the directive.
    // Determine if we need to setup the hammer pan/drag listener.
    // Establish the drag start


    self.initialize = function (event) {
      // checking range...
      if (!self.isActivelyDragging) {
        event.preventDefault();

        if (self.currentPanHandlerElement) {
          if (self.currentPanHandlerElement !== event.target) {
            // remove the old one
            self.removePanEvtHandler();
          }
        }

        if (!self.currentPanHandler) {
          var hmrMgr = hammer(event.target, {
            touchAction: 'pan-y'
          }); // track the element that the hammer is using

          self.currentPanHandlerElement = event.target;
          var panRecognizer = hmrMgr.get('pan');
          panRecognizer.set({
            direction: hammer.DIRECTION_VERTICAL
          }); // set options

          hmrMgr.on('panup pandown panend panstart pancancel', self.handleHammerCellDrag); // panleft panright

          self.currentPanHandler = hmrMgr;
        } else if (self.currentPanHandlerElement) {
          // existing handler, same element?
          if (self.currentPanHandlerElement !== event.target) {
            logger.warn('different event handler element - shouldnt be here ------------------');
          }
        }
      }
    };

    return self;
  }

  return SPLMTableFillDownHelper;
});