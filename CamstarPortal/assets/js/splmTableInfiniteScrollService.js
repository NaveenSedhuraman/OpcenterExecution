"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service is for exposing the native js data provider behavior. The module supports loading the module from GWT
 * and getting the native JS code invoked.
 *
 * @module js/splmTableInfiniteScrollService
 */
define(['app', 'js/logger', 'js/browserUtils', 'js/splmTableUtils', 'js/splmTableMomentumScrolling', 'lodash'], function (app, logger, browserUtils, _t, SPLMTableMomentumScrolling, _) {
  'use strict';
  /**
   * Native infinite scroll.
   *
   * @constructor
   */

  var SPLMTableInfiniteScroll = function SPLMTableInfiniteScroll(containerHeight) {
    var self = this;
    var settings = {};
    var currentScrollTop = 0; // Holds the last scroll position to detect scroll down or up

    var previousScrollTop = 0;
    var rowElements = []; // contains cache of rendered list

    var initialized = false;
    var containerHeightInitialized = false;
    var _containerHeight = containerHeight;
    var initialRowIndex = 0;
    var extraVisibleRowCount = browserUtils.isIE ? 20 : 5;
    var visibleRowsCount = 0;
    var currentScrollLeft = 0;
    var scrollToRowInProgress = false;
    var scrollToRowScrollTop = null;
    var maintainScrollPosition = false;
    var disablePinScrollEvent = false;
    var userPinScrollsDetected = 0;
    var scrollContainerWidth = 0;
    var verticalScrollDebounceTime = browserUtils.isIE ? 200 : 0;
    var horizontalScrollDebounceTime = browserUtils.isIE ? 500 : 0;
    var verticalScrollDebounceMaxWait = browserUtils.isIE ? Infinity : 0;
    var momentumScrolling = new SPLMTableMomentumScrolling();
    var lastScrollTimeStamp = new Date();
    var elapsedMSSinceLastScroll = 0; // LCS-133249 Scrolling performance issue
    // Do scroll syncing at very beginning

    var extraTop = 0;

    var horizontalScrollDebounceEvent = _.debounce(function () {
      settings.updateScrollColumnsInView(currentScrollLeft, scrollContainerWidth);
      settings.updateVisibleCells(settings.scrollParentElem);
    }, horizontalScrollDebounceTime);

    var verticalScrollDebounceEvent = _.debounce(function () {
      handleScrollEventInternal();
    }, verticalScrollDebounceTime, {
      maxWait: verticalScrollDebounceMaxWait
    });

    self.initializeGrid = function (obj) {
      settings = obj;
      settings.pinParentElem = settings.pinViewportElem.children[0];
      settings.scrollParentElem = settings.scrollViewportElem.children[0];
      settings.totalFound = settings.loadedVMObjects.length;
      initializeEvents();
      momentumScrolling.enable(settings.pinViewportElem, settings.scrollViewportElem);
      initialized = true;
    };

    self.checkForResize = _.debounce(function () {
      elapsedMSSinceLastScroll = new Date() - lastScrollTimeStamp;

      if (elapsedMSSinceLastScroll < 200) {
        return;
      }

      var newClientWidth = settings.scrollViewportElem.offsetWidth;

      if (newClientWidth !== scrollContainerWidth) {
        if (newClientWidth > scrollContainerWidth) {
          scrollContainerWidth = newClientWidth;
          settings.updateScrollColumnsInView(currentScrollLeft);
        } else {
          scrollContainerWidth = newClientWidth;
          settings.updateScrollColumnsInView(currentScrollLeft, scrollContainerWidth);
        }

        settings.updateVisibleCells(settings.scrollParentElem);
      }

      if (settings.directiveElem.clientHeight !== _containerHeight) {
        _containerHeight = settings.directiveElem.clientHeight;
        var rowContainerHeight = settings.scrollViewportElem.clientHeight || settings.pinViewportElem.clientHeight || _containerHeight;
        var rowCount = Math.floor(rowContainerHeight / settings.rowHeight);
        setVisibleRowsCount(rowCount);
        self.handleScroll();
      }
    }, 200);

    self.isInitialized = function () {
      return initialized;
    };
    /**
     * Renders the initial rows on initialization once table div has been rendered so that
     * the height can be computed properly
     */


    self.renderInitialRows = function () {
      self.initializeProperties();
      settings.initialRowIndex = initialRowIndex;
      self.handleScroll();
    };
    /**
     * set the object set height
     * @param {Number} heightVal The container height
     */


    self.setContainerHeight = function (heightVal) {
      _containerHeight = heightVal; // LCS-140092 - AW UxRefresh does not allow scrolling in Qt WebEngine Browser
      // 100% is not working in Qt WebEngine, use heightVal here

      settings.scrollViewportElem.style.maxHeight = String(heightVal - settings.headerHeight) + 'px';
      settings.pinViewportElem.style.maxHeight = String(heightVal - settings.headerHeight) + 'px';
    };
    /**
     * Sets the visible row count
     */


    function setVisibleRowsCount(rowCount) {
      visibleRowsCount = rowCount;
    }
    /**
     * Initialize scroll properties
     */


    self.initializeProperties = function () {
      // LCS-138303 - Performance tuning for 14 Objectset Table case - implementation
      // Use given clientHeight to save one computed CSS reading
      if (_containerHeight === undefined) {
        _containerHeight = containerHeight > 0 ? containerHeight : settings.directiveElem.clientHeight;
      } else if (containerHeightInitialized === false) {
        self.setContainerHeight(_containerHeight);
      }

      containerHeightInitialized = true; // Table should have height of at least one row.

      settings.scrollViewportElem.style.minHeight = String(settings.rowHeight) + 'px';
      settings.pinViewportElem.style.minHeight = String(settings.rowHeight) + 'px';
      var scrollCanvasHeight = _containerHeight - settings.headerHeight;

      if (scrollCanvasHeight < 0) {
        scrollCanvasHeight = 0;
      }

      var rowCount = Math.floor(scrollCanvasHeight / settings.rowHeight);
      setVisibleRowsCount(rowCount);
      extraVisibleRowCount = 5;
      extraVisibleRowCount += extraVisibleRowCount % 2; // Make it even

      logger.trace('Table scroll service: Visible row count - ' + visibleRowsCount);
    };
    /**
     * Updates the container and top space heights so the rows are positioned correctly
     */


    self.updateRowAlignment = function () {
      var topHeight = 0;

      if (rowElements) {
        var firstElement = rowElements[0];

        if (firstElement && firstElement.getAttribute('data-indexNumber')) {
          var firstElementIdx = parseInt(firstElement.getAttribute('data-indexNumber'));

          if (settings.treeTableEditSettings) {
            topHeight = (firstElementIdx - settings.treeTableEditSettings.firstIndex) * settings.rowHeight;
          } else {
            topHeight = firstElementIdx * settings.rowHeight;
          }
        }
      }

      settings.pinParentElem.style.top = topHeight + 'px';
      settings.scrollParentElem.style.top = topHeight + 'px';
      var scrollContentHeight; // If tree table and editing, use treeEditSettings.lastIndex - the first index to get number of rows in total

      if (settings.treeTableEditSettings) {
        scrollContentHeight = (settings.treeTableEditSettings.lastIndex - settings.treeTableEditSettings.firstIndex + 1) * settings.rowHeight - topHeight;
      } else {
        scrollContentHeight = settings.totalFound * settings.rowHeight - topHeight;
      }

      settings.pinParentElem.style.height = scrollContentHeight + 'px';
      settings.scrollParentElem.style.height = scrollContentHeight + 'px';
    };
    /**
     * Scrolls the table up/down one row.
     *
     * @param {Boolean} isScrollDown - scroll down indicator, false for scroll up
     * @returns {Number} returns the new scrollTop of the scrollViewportElement
     */


    self.manualScroll = function (isScrollDown) {
      var scrollDistance = isScrollDown ? self.getRowHeight() : -self.getRowHeight();
      settings.scrollViewportElem.scrollTop += scrollDistance;
      return settings.scrollViewportElem.scrollTop;
    };
    /**
     * Returns the row height as an int
     * @returns {Number} The row Height
     */


    self.getRowHeight = function () {
      return settings.rowHeight;
    };
    /**
     * Sets the row height
     *
     *  @param {int} rowHeight - the height of the row in pixels
     */


    self.setRowHeight = function (rowHeight) {
      settings.rowHeight = rowHeight;
    };
    /**
     * Gets the total objects found
     * @returns {Number} The total number of objects found
     */


    self.getTotalFound = function () {
      return settings.totalFound;
    };
    /**
     * Sets the loaded view model objects
     *
     *  @param {[ViewModelObject]} loadedViewModelObjects - the collection of view model objects
     */


    self.setLoadedVMObjects = function (loadedViewModelObjects) {
      // Maintain the scroll position
      if (maintainScrollPosition === true) {
        // This will set the variables for maintaining scroll position.
        // The values are used when handleScroll is called again.
        setValuesForMaintainingScroll(loadedViewModelObjects.length - settings.totalFound);
      }

      settings.loadedVMObjects = loadedViewModelObjects;
      settings.totalFound = loadedViewModelObjects.length;
    };

    self.setScrollPositionToBeMaintained = function () {
      maintainScrollPosition = true;
    };
    /**
     * Sets the proper variables to maintain the scroll position
     * @param {integer} rowDifferenceCount - the difference in rows used to calculate maintained scroll position
     */


    function setValuesForMaintainingScroll(rowDifferenceCount) {
      maintainScrollPosition = false;
      scrollToRowInProgress = true;
      scrollToRowScrollTop = settings.scrollViewportElem.scrollTop + settings.rowHeight * rowDifferenceCount;
    }

    self.isScrollToRowInProgress = function () {
      return scrollToRowInProgress;
    };
    /**
     * Initialize Scroll Event to table
     */


    function initializeEvents() {
      settings.scrollViewportElem.removeEventListener('scroll', handleScrollEvent);
      settings.pinViewportElem.removeEventListener('scroll', handlePinScrollEvent);
      settings.scrollViewportElem.addEventListener('scroll', handleScrollEvent);
      settings.pinViewportElem.addEventListener('scroll', handlePinScrollEvent);
    }
    /**
     * Scroll Event Handler
     */


    function handleScrollEvent() {
      lastScrollTimeStamp = new Date();
      var oldScrollTop = currentScrollTop;
      currentScrollTop = settings.scrollViewportElem.scrollTop;
      var oldScrollLeft = currentScrollLeft;
      currentScrollLeft = settings.scrollViewportElem.scrollLeft; // LCS-133249 Scrolling performance issue
      // Do scroll syncing at very beginning

      var pinViewportElem = settings.pinViewportElem;

      if (userPinScrollsDetected === 0) {
        disablePinScrollEvent = true;
        pinViewportElem.scrollTop = currentScrollTop;
      }

      settings.onStartScroll();

      if (oldScrollLeft !== currentScrollLeft) {
        settings.syncHeader(false, currentScrollLeft);
        horizontalScrollDebounceEvent();
      }

      if (oldScrollTop !== currentScrollTop) {
        var tempExtraTop = pinViewportElem.offsetHeight + currentScrollTop - pinViewportElem.scrollHeight;

        if (tempExtraTop > 0) {
          pinViewportElem.style.top = String(tempExtraTop * -1) + 'px';
          extraTop = tempExtraTop;
        } else if (extraTop > 0) {
          // For non IE/Edge, need to set top back when scroll up
          pinViewportElem.style.top = '0px';
          extraTop = 0;
        }

        verticalScrollDebounceEvent();
      }

      userPinScrollsDetected -= 1;

      if (userPinScrollsDetected < 0) {
        userPinScrollsDetected = 0;
      }
    }
    /**
     * Real processing method for scroll event after debounce/requestAnimationFrame
     */


    function handleScrollEventInternal() {
      var func;
      var isScrollDown = currentScrollTop > previousScrollTop;

      if (isScrollDown) {
        func = self.handleScrollDown;
      } else {
        func = handleScrollUp;
      }

      previousScrollTop = currentScrollTop; // Do scroll shadow

      if (currentScrollTop > 0) {
        if (!settings.tableElem.classList.contains(_t.const.CLASS_TABLE_SCROLLED)) {
          settings.tableElem.classList.add(_t.const.CLASS_TABLE_SCROLLED);
        }
      } else {
        if (settings.tableElem.classList.contains(_t.const.CLASS_TABLE_SCROLLED)) {
          settings.tableElem.classList.remove(_t.const.CLASS_TABLE_SCROLLED);
        }
      }

      func.call();
    }
    /**
     * Method to handle scroll down
     */


    self.handleScrollDown = function () {
      if (rowElements && rowElements.length) {
        var lastChildElem = rowElements[rowElements.length - 1];
        var lastIndexNumber = parseInt(lastChildElem.getAttribute('data-indexNumber'));
        var lastItemBottomPosition;

        if (settings.treeTableEditSettings) {
          lastItemBottomPosition = (lastIndexNumber - settings.treeTableEditSettings.firstIndex) * settings.rowHeight + settings.rowHeight;
        } else {
          lastItemBottomPosition = lastIndexNumber * settings.rowHeight + settings.rowHeight;
        }

        var lastItemAboveTop = lastItemBottomPosition < currentScrollTop;

        if (lastItemAboveTop === true) {
          // Check if all the elements are rendered.
          if (lastIndexNumber + 1 < settings.totalFound) {
            // Last element went up and page is empty. Need to calculate the page number now
            self.handleScroll(true);
          }
        } else if (lastItemBottomPosition < currentScrollTop + (visibleRowsCount + extraVisibleRowCount) * settings.rowHeight) {
          var extraBlankRowsInView = Math.ceil((currentScrollTop + visibleRowsCount * settings.rowHeight - lastItemBottomPosition) / settings.rowHeight);
          extraBlankRowsInView = extraBlankRowsInView < 0 ? 0 : extraBlankRowsInView; // Last element went up and element is still in the page. Can do continuous rendering

          var startCount = parseInt(lastChildElem.getAttribute('data-indexNumber')) + 1;
          var endCount = startCount + extraVisibleRowCount + extraBlankRowsInView;
          renderPageData(startCount, endCount, true);
        }
      } else {
        self.handleScroll(true);
      }
    };
    /**
     * Method to handle wheel scroll event
     *
     * @param {Object} e - the event
     */


    function handlePinScrollEvent(e) {
      if (disablePinScrollEvent === true) {
        disablePinScrollEvent = false;
        return;
      }

      var currentPinScrollLeft = settings.pinViewportElem.scrollLeft;
      settings.syncHeader(true, currentPinScrollLeft); // If scrollTop is same as currentScrollTop then nothing else needs to be done.

      if (settings.pinViewportElem.scrollTop === currentScrollTop) {
        return;
      }

      userPinScrollsDetected += 1;

      if (settings.pinViewportElem.scrollTop !== settings.pinViewportElem.scrollHeight - settings.pinViewportElem.offsetHeight) {
        settings.scrollViewportElem.scrollTop = settings.pinViewportElem.scrollTop;
      } else {
        settings.scrollViewportElem.scrollTop = settings.pinViewportElem.scrollTop + 40;
      } // Prevent scrolling the parent div


      e.preventDefault();
    }
    /**
     * Method call by handleScrollUp and handleScrollDown which processing page rendering
     *
     * @param {boolean} isScrollDown - isScrollDown
     */


    self.handleScroll = function (isScrollDown) {
      var currentStartIndex = Math.floor(currentScrollTop / settings.rowHeight);

      if (settings.initialRowIndex) {
        self.updateRowAlignment();
        var newScrollTop = (settings.initialRowIndex - visibleRowsCount * 0.75) * settings.rowHeight;
        delete settings.initialRowIndex;
        currentScrollTop = newScrollTop < 0 ? 0 : newScrollTop;
        currentStartIndex = Math.floor(currentScrollTop / settings.rowHeight);
        settings.scrollViewportElem.scrollTop = currentScrollTop;
      }

      if (scrollToRowInProgress === true) {
        self.updateRowAlignment();
        settings.scrollViewportElem.scrollTop = scrollToRowScrollTop;
        scrollToRowInProgress = false;
        scrollToRowScrollTop = null;
      }

      var start = currentStartIndex - extraVisibleRowCount;
      var end = currentStartIndex + visibleRowsCount + extraVisibleRowCount;

      if (end > settings.totalFound - 1) {
        var offset = end - settings.totalFound - 1;
        end -= offset;
        start -= offset;
      }

      renderPageData(start, end, isScrollDown, true);
      previousScrollTop = currentScrollTop;
    };
    /**
     * Method to handle scroll up
     */


    function handleScrollUp() {
      if (rowElements && rowElements.length) {
        var firstChildElem = rowElements[0];
        var firstItemIndex = parseInt(firstChildElem.getAttribute('data-indexNumber'));
        var firstItemTopPosition;

        if (settings.treeTableEditSettings) {
          firstItemTopPosition = (firstItemIndex - settings.treeTableEditSettings.firstIndex) * settings.rowHeight;
        } else {
          firstItemTopPosition = firstItemIndex * settings.rowHeight;
        }

        var firstItemBelowBottom = firstItemTopPosition > currentScrollTop + visibleRowsCount * settings.rowHeight;

        if (firstItemBelowBottom === true) {
          self.handleScroll(false);
        } else if (firstItemTopPosition > currentScrollTop - extraVisibleRowCount * settings.rowHeight) {
          var extraBlankRowsInView = Math.ceil((firstItemTopPosition - currentScrollTop) / settings.rowHeight);
          extraBlankRowsInView = extraBlankRowsInView < 0 ? 0 : extraBlankRowsInView;
          var endCount = parseInt(firstChildElem.getAttribute('data-indexNumber')) - 1;
          var startCount = endCount - extraVisibleRowCount - extraBlankRowsInView;
          renderPageData(startCount, endCount, false);
        }
      } else {
        self.handleScroll(true);
      }
    }
    /**
     * Sets up scrolling for trees while in edit mode
     * @param {Boolean} isEditing if the table is in edit mode or not
     */


    self.setupTreeEditScroll = function (isEditing) {
      if (!isEditing) {
        if (settings.treeTableEditSettings) {
          // Find our current scroll position
          var relativeIdx = settings.scrollViewportElem.scrollTop / self.getRowHeight();
          var scrollTop = (relativeIdx + settings.treeTableEditSettings.firstIndex - 1) * self.getRowHeight(); // Remove tree Edit settings

          delete settings.treeTableEditSettings; // Reset alignment/rows

          self.updateRowAlignment();
          self.handleScroll(true); // Reset our scroll position to what we were at

          settings.pinViewportElem.scrollTop = scrollTop;
          settings.scrollViewportElem.scrollTop = scrollTop;
        }

        return;
      } // If no element in table, return


      if (!rowElements || !rowElements[0]) {
        return;
      } // Find first row that contains data


      var firstChildElem = rowElements[0];
      var firstIndex = parseInt(firstChildElem.getAttribute('data-indexNumber'));
      var hasProps = settings.loadedVMObjects[firstIndex].props;

      while (hasProps && firstIndex > 0) {
        hasProps = settings.loadedVMObjects[firstIndex - 1].props;

        if (hasProps) {
          firstIndex--;
        }
      } // Find last row that contains data


      var lastChildElem = rowElements[rowElements.length - 1];
      var lastIndex = parseInt(lastChildElem.getAttribute('data-indexNumber'));
      hasProps = settings.loadedVMObjects[lastIndex].props;

      while (hasProps && lastIndex < settings.totalFound - 1) {
        hasProps = settings.loadedVMObjects[lastIndex + 1].props;

        if (hasProps) {
          lastIndex++;
        }
      }

      settings.treeTableEditSettings = {
        firstIndex: firstIndex,
        lastIndex: lastIndex,
        totalDataLength: lastIndex + 1
      }; // update the container height

      self.updateRowAlignment();
    };
    /**
     *  Remove rows from lower-bound to upper-bound
     *
     * @param {Object} upperCountIdx - event
     * @param {Object} lowerCounterIdx - event
     */


    function removeRows(upperCountIdx, lowerCounterIdx) {
      settings.removeRows(upperCountIdx, lowerCounterIdx);
      rowElements = settings.scrollParentElem.querySelectorAll(settings.rowSelector);
    }
    /**
     *  Resets infinite scroll back to a starting state
     */


    self.resetInfiniteScroll = function () {
      self.setLoadedVMObjects([]);
      self.resetInitialRowIndex();
      settings.scrollViewportElem.scrollTop = 0;
      self.handleScroll();
    };
    /**
     * Method to render rows
     *
     * @param {Number} startIndex Start render index
     * @param {Number} endIndex End render Index
     */


    function renderRows(startIndex, endIndex) {
      settings.renderRows(startIndex, endIndex);
      rowElements = settings.scrollParentElem.querySelectorAll(settings.rowSelector);
    }
    /**
     * Method to render rows
     *
     * @param {int} startCount - event
     * @param {int} endCount - event
     * @param {int} isScrollDown - event
     * @param {int} removeAllChild - event
     */


    function renderPageData(startCount, endCount, isScrollDown, removeAllChild) {
      var totalDataLength; // Check if table is tree table and is editing

      if (settings.treeTableEditSettings) {
        if (startCount < settings.treeTableEditSettings.firstIndex) {
          startCount = settings.treeTableEditSettings.firstIndex;
        }

        if (endCount > settings.treeTableEditSettings.lastIndex) {
          endCount = settings.treeTableEditSettings.lastIndex;
        }

        totalDataLength = settings.treeTableEditSettings.totalDataLength;
      } else {
        // Check to avoid negative indexing
        if (startCount < 0) {
          startCount = 0;
        }

        totalDataLength = settings.totalFound;
      }

      if (startCount >= totalDataLength) {
        if (totalDataLength === 0) {
          // if collection becomes empty, then remove all the existing list rows
          removeRows(rowElements.length - 1, 0);
          self.updateRowAlignment();
        }

        settings.updateScrollColumnsInView(currentScrollLeft, scrollContainerWidth);
        renderRows(startCount, endCount);

        if (startCount === totalDataLength) {
          logger.trace('Table scroll service: Rendering of page data complete. No more data to render.');
          return;
        }
      } // check to avoid wrong indexing for startCount


      if (startCount > totalDataLength) {
        endCount -= startCount;
        startCount = 0;
      } // check to avoid wrong indexing for endCount


      if (endCount >= totalDataLength) {
        endCount = totalDataLength - 1;
      }

      if (removeAllChild) {
        // remove the elements from the dom tree.
        removeRows(rowElements.length - 1, 0);
      }

      renderRows(startCount, endCount);
      removeExtraRows(isScrollDown);
      self.updateRowAlignment();
      afterGridRender();
    }
    /**
     * Remove extra rows
     */


    function removeExtraRows(isScrollDown) {
      var rowParentElem = settings.scrollParentElem;
      rowElements = rowParentElem.querySelectorAll(settings.rowSelector);

      if (rowElements.length === 0) {
        logger.error('Rendering error');
      } else {
        var extraChildCount;
        var invisibleRowsCount;
        var invisibleRowsHeight;

        if (isScrollDown === true) {
          var firstElem = rowElements[0];
          var firstRenderedItemIndex = parseInt(firstElem.getAttribute('data-indexNumber'));

          if (settings.treeTableEditSettings) {
            invisibleRowsHeight = (firstRenderedItemIndex - settings.treeTableEditSettings.firstIndex) * settings.rowHeight - currentScrollTop;
          } else {
            invisibleRowsHeight = firstRenderedItemIndex * settings.rowHeight - currentScrollTop;
          }

          if (invisibleRowsHeight < 0) {
            invisibleRowsCount = Math.floor(Math.abs(invisibleRowsHeight) / settings.rowHeight);
            extraChildCount = invisibleRowsCount - extraVisibleRowCount;

            if (extraChildCount > 0) {
              // remove the elements from the dom tree.
              removeRows(extraChildCount, 0);
            }
          }
        } else if (isScrollDown === false) {
          var lastElem = rowElements[rowElements.length - 1];
          var lastRenderedItemIndex = parseInt(lastElem.getAttribute('data-indexNumber'));
          var visRowsHeight = visibleRowsCount * settings.rowHeight + currentScrollTop;

          if (settings.treeTableEditSettings) {
            invisibleRowsHeight = (lastRenderedItemIndex - settings.treeTableEditSettings.firstIndex) * settings.rowHeight + settings.rowHeight - visRowsHeight;
          } else {
            invisibleRowsHeight = lastRenderedItemIndex * settings.rowHeight + settings.rowHeight - visRowsHeight;
          }

          if (invisibleRowsHeight > 0) {
            invisibleRowsCount = Math.floor(invisibleRowsHeight / settings.rowHeight);
            extraChildCount = invisibleRowsCount - extraVisibleRowCount;

            if (extraChildCount > 0) {
              removeRows(rowElements.length - 1, rowElements.length - extraChildCount - 1);
            }
          }
        } else {// do nothing for undefined
        }
      }
    }
    /**
     * After grid rendered
     */


    function afterGridRender() {
      var firstRenderedItemIndex = 0;
      var lastRenderedItemIndex = 0;
      var firstElem = rowElements[0];
      firstRenderedItemIndex = parseInt(firstElem.getAttribute('data-indexNumber'));
      var lastElem = rowElements[rowElements.length - 1];
      lastRenderedItemIndex = parseInt(lastElem.getAttribute('data-indexNumber'));
      var firstRenderedItem = {
        index: firstRenderedItemIndex,
        uid: firstElem.vmo.uid,
        levelNdx: firstElem.vmo.levelNdx
      };
      var lastRenderedItem = {
        index: lastRenderedItemIndex,
        uid: lastElem.vmo.uid,
        levelNdx: lastElem.vmo.levelNdx
      };
      settings.afterGridRenderCallback(firstRenderedItem, lastRenderedItem);
    }

    self.destroyGrid = function () {
      settings.scrollViewportElem && settings.scrollViewportElem.removeEventListener('scroll', handleScrollEvent);
      settings.pinViewportElem && settings.pinViewportElem.removeEventListener('scroll', handlePinScrollEvent);
      momentumScrolling.disable();
      self.checkForResize.cancel();
      horizontalScrollDebounceEvent.cancel();
      verticalScrollDebounceEvent.cancel();
    };
    /**
     * Scrolls to the given row
     *
     * @param {integer[]} rowIndexes Index to scroll to
     * @returns {boolean} returns false if a row is in view
     */


    self.scrollToRowIndex = function (rowIndexes) {
      // Only scroll to row if it is out of view
      if (self.isInitialized() === true) {
        for (var i = 0; i < rowIndexes.length; i++) {
          var rowIndex = rowIndexes[i];
          var lastIndexNumber = 0;
          var firstIndexNumber = 0;

          if (rowElements.length > 0) {
            lastIndexNumber = Number(rowElements[rowElements.length - 1].getAttribute('data-indexnumber'));
            firstIndexNumber = Number(rowElements[0].getAttribute('data-indexnumber'));

            if (rowIndex > lastIndexNumber || rowIndex < firstIndexNumber) {
              initialRowIndex = rowIndex;
              continue;
            }

            var firstRowElementIndex = Number(rowElements[0].getAttribute('data-indexnumber'));
            var scrollToRowElementPosition = rowElements[rowIndex - firstRowElementIndex].getBoundingClientRect();
            var scrollCanvasRect = settings.scrollViewportElem.getBoundingClientRect();

            if (scrollToRowElementPosition.top < scrollCanvasRect.top || scrollToRowElementPosition.bottom > scrollCanvasRect.bottom) {
              initialRowIndex = rowIndex;
              continue;
            }

            initialRowIndex = rowIndex;
          }

          return false;
        } // Check if attempting to scroll past maximum scrollTop, if so set flag


        var maxScrollTop = settings.scrollViewportElem.scrollHeight - settings.scrollViewportElem.clientHeight;
        var newScrollTop = (initialRowIndex - visibleRowsCount * 0.75) * settings.rowHeight;

        if (newScrollTop > maxScrollTop) {
          scrollToRowInProgress = true;
          scrollToRowScrollTop = newScrollTop;
        }

        settings.scrollViewportElem.scrollTop = newScrollTop;
      } else {
        initialRowIndex = rowIndexes[0];
      }

      return true;
    };

    self.isInitialRowIndexInView = function () {
      var scrollCanvasRect = settings.scrollViewportElem.getBoundingClientRect();
      var firstRowElementIndex = Number(rowElements[0].getAttribute('data-indexnumber'));
      var initialRowElement = rowElements[initialRowIndex - firstRowElementIndex];

      if (initialRowElement === undefined) {
        return false;
      }

      var initialRowRect = initialRowElement.getBoundingClientRect();

      if (initialRowRect.top < scrollCanvasRect.top || initialRowRect.bottom > scrollCanvasRect.bottom) {
        return false;
      }

      return true;
    };
    /**
     * Resets the initial row index to 0 so that infinite scroll service will
     * start the rendering of rows at the top.
     */


    self.resetInitialRowIndex = function () {
      initialRowIndex = 0;
    };
  };

  return SPLMTableInfiniteScroll;
});