"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used for triggering drag and click event for PL Table without conflict
 *
 * @module js/splmTableDragHandler
 *
 * @publishedApolloService
 *
 */
define([//
'lodash', //
'js/eventBus', 'angular', 'js/logger', 'js/splmTableUtils' //
], function (_, eventBus, ngModule, logger, _t) {
  'use strict';

  var exports = {};

  var _dragEventHandler = function _dragEventHandler(e) {
    // NOTE: pute every variable's inside this scope for isolation
    var _elem = e.currentTarget; // NOTE: This number is based on manual testing. We can adjust it at any time.

    var _clickInterval = 160; // For stopping cursor change from darg-and-drop service

    var _cursorMutexListener = function _cursorMutexListener(mutexEvent) {
      if (mutexEvent.originalEvent) {
        mutexEvent = mutexEvent.originalEvent;
      }

      mutexEvent.preventDefault();
      return false;
    };

    var _onDragListener = function _onDragListener(dragEvent) {
      if (dragEvent.originalEvent) {
        dragEvent = dragEvent.originalEvent;
      }

      dragEvent.preventDefault();
      dragEvent.cancelBubble = true;

      _elem.dispatchEvent(_t.util.createCustomEvent(_t.const.EVENT_ON_ELEM_DRAG, dragEvent));
    };

    var _onDragEndListener = function _onDragEndListener(dragEndEvent) {
      if (dragEndEvent.originalEvent) {
        dragEndEvent = event.originalEvent;
      }

      dragEndEvent.preventDefault();
      document.removeEventListener('mouseup', _onDragEndListener);
      document.removeEventListener('mousemove', _onDragListener);
      document.removeEventListener('mousedown', _cursorMutexListener);
      document.removeEventListener('mouseover', _cursorMutexListener);
      dragEndEvent.cancelBubble = true;

      _elem.dispatchEvent(_t.util.createCustomEvent(_t.const.EVENT_ON_ELEM_DRAG_END, dragEndEvent));
    };

    var _onDragStartListener = function _onDragStartListener(dragStartEvent) {
      if (dragStartEvent.originalEvent) {
        dragStartEvent = dragStartEvent.originalEvent;
      }

      dragStartEvent.preventDefault();
      dragStartEvent.cancelBubble = true;
      document.addEventListener('mouseup', _onDragEndListener);
      document.addEventListener('mousemove', _onDragListener);
      document.addEventListener('mousedown', _cursorMutexListener);
      document.addEventListener('mouseover', _cursorMutexListener);

      _elem.dispatchEvent(_t.util.createCustomEvent(_t.const.EVENT_ON_ELEM_DRAG_START, dragStartEvent));
    };

    var handleOriginEvent = function handleOriginEvent(originEvent) {
      var ticking = false;

      var cleanClickTicking = function cleanClickTicking() {
        _elem.removeEventListener('mouseup', cleanClickTicking);

        ticking = false;
      };

      var setupClickTiking = function setupClickTiking() {
        ticking = true;

        _elem.addEventListener('mouseup', cleanClickTicking);
      };

      setupClickTiking();
      setTimeout(function () {
        if (ticking === true) {
          cleanClickTicking();

          _onDragStartListener(originEvent);
        }
      }, _clickInterval);
    };

    handleOriginEvent(e);
  };

  exports.enableDragging = function (elem) {
    elem.addEventListener('mousedown', _dragEventHandler);
  };

  exports.disableDragging = function (elem) {
    elem.removeEventListener('mousedown', _dragEventHandler);
  };
  /**
   * Listen for DnD highlight/unhighlight event from dragAndDropService
   */


  eventBus.subscribe('dragDropEvent.highlight', function (eventData) {
    exports.handleDragDropHighlightPLTable(eventData);
  });
  /**
   * Add/Remove the widget  class to the elements of splm table that need highlighting/unhighlighting.
   * @param {DOMElement} rowOrTableElement - The element the mouse is over when the event was fired.
   * @param {Boolean} isHighlightFlag - add or remove the highlight class
   * @param {Boolean} isGlobalArea - is the object drag target over global invalid area or not
   */

  var _setHoverStyleToChildren = function _setHoverStyleToChildren(rowOrTableElement, isHighlightFlag, isGlobalArea) {
    var splmTablePinnedContainer = null;
    var splmTableScrollContainer = null;

    if (!isGlobalArea) {
      // target on table row
      // find the closest div holding splm table container
      var splmTable = _t.util.closestElement(rowOrTableElement, '.aw-splm-table');

      splmTablePinnedContainer = splmTable.querySelector('.aw-splm-table-pinned-container');
      splmTableScrollContainer = splmTable.querySelector('.aw-splm-table-scroll-container');
      var rowIndex = parseInt(rowOrTableElement.getAttribute('data-indexnumber'));
    } else {
      if (isHighlightFlag) {
        rowOrTableElement.classList.add('aw-theme-dropframe');
        rowOrTableElement.classList.add('aw-widgets-dropframe');
      } else {
        rowOrTableElement.classList.remove('aw-theme-dropframe');
        rowOrTableElement.classList.remove('aw-widgets-dropframe');
      }

      splmTablePinnedContainer = rowOrTableElement.querySelector('.aw-splm-table-pinned-container');
      splmTableScrollContainer = rowOrTableElement.querySelector('.aw-splm-table-scroll-container');
    }

    if (splmTablePinnedContainer && splmTableScrollContainer) {
      var pcList = [];
      var scList = [];
      var eachRowPC;
      var eachRowSC;

      if (!_.isUndefined(rowIndex)) {
        // target on table row
        pcList = splmTablePinnedContainer.querySelectorAll('div.ui-grid-row[data-indexnumber=\'' + rowIndex + '\']');

        if (pcList && pcList.length > 0) {
          eachRowPC = pcList[0];
        }

        scList = splmTableScrollContainer.querySelectorAll('div.ui-grid-row[data-indexnumber=\'' + rowIndex + '\']');

        if (scList && scList.length > 0) {
          eachRowSC = scList[0];
        }
      } else {
        // target on white area
        pcList = splmTablePinnedContainer.querySelectorAll('div.ui-grid-row');
        scList = splmTableScrollContainer.querySelectorAll('div.ui-grid-row');
      } // highlight every single row with borders ; this will not be required when drag is over an invalid/white area
      // when over an invalid/white area , border-color will not be required for every single table row ; but only on splm-table-container


      if (!isGlobalArea && !_.isUndefined(rowIndex)) {
        // target on table row
        if (eachRowPC && eachRowSC) {
          if (isHighlightFlag) {
            eachRowPC.classList.add('aw-theme-dropframe');
            eachRowPC.classList.add('aw-widgets-dropframe');
            eachRowSC.classList.add('aw-theme-dropframe');
            eachRowSC.classList.add('aw-widgets-dropframe');
          } else {
            eachRowPC.classList.remove('aw-theme-dropframe');
            eachRowPC.classList.remove('aw-widgets-dropframe');
            eachRowSC.classList.remove('aw-theme-dropframe');
            eachRowSC.classList.remove('aw-widgets-dropframe');
          }
        }
      }

      _.forEach(pcList, function (pc) {
        if (pc.children) {
          if (isHighlightFlag) {
            if (isGlobalArea) {
              pc.classList.add('aw-noeachrow-highlight-dropframe');
            } else {
              pc.classList.add('aw-splm-table-pinned-container-drop-frame');
            }

            _.forEach(pc.children, function (eachPc) {
              if (isGlobalArea) {
                eachPc.classList.add('aw-noeachrow-highlight-dropframe');
              } else {
                eachPc.classList.add('aw-theme-dropframe');
                eachPc.classList.add('aw-widgets-dropframe');
              }
            });
          } else {
            if (isGlobalArea) {
              pc.classList.remove('aw-noeachrow-highlight-dropframe');
            } else {
              pc.classList.remove('aw-splm-table-pinned-container-drop-frame');
            }

            _.forEach(pc.children, function (eachPc) {
              if (isGlobalArea) {
                eachPc.classList.remove('aw-noeachrow-highlight-dropframe');
              } else {
                eachPc.classList.remove('aw-theme-dropframe');
                eachPc.classList.remove('aw-widgets-dropframe');
              }
            });
          }
        }
      });

      _.forEach(scList, function (sc) {
        if (sc.children) {
          if (isHighlightFlag) {
            if (isGlobalArea) {
              sc.classList.add('aw-noeachrow-highlight-dropframe');
            } else {
              sc.classList.add('aw-splm-table-scroll-container-drop-frame');
            }

            _.forEach(sc.children, function (eachSc) {
              if (isGlobalArea) {
                eachSc.classList.add('aw-noeachrow-highlight-dropframe');
              } else {
                eachSc.classList.add('aw-theme-dropframe');
                eachSc.classList.add('aw-widgets-dropframe');
              }
            });
          } else {
            if (isGlobalArea) {
              sc.classList.remove('aw-noeachrow-highlight-dropframe');
            } else {
              sc.classList.remove('aw-splm-table-scroll-container-drop-frame');
            }

            _.forEach(sc.children, function (eachSc) {
              if (isGlobalArea) {
                eachSc.classList.remove('aw-noeachrow-highlight-dropframe');
              } else {
                eachSc.classList.remove('aw-theme-dropframe');
                eachSc.classList.remove('aw-widgets-dropframe');
              }
            });
          }
        }
      });
    }
  };

  exports.handleDragDropHighlightPLTable = function (eventData) {
    if (!_.isUndefined(eventData) && !_.isUndefined(eventData.targetElement) && eventData.targetElement.classList) {
      var isHighlightFlag = eventData.isHighlightFlag;
      var target = eventData.targetElement;
      var targetScope;

      if (isHighlightFlag) {
        if (target.classList.contains(_t.const.CLASS_ROW)) {
          targetScope = ngModule.element(target).scope();

          if (targetScope.row) {
            targetScope.row.hover = true;
            targetScope.$evalAsync();
          } else {
            _setHoverStyleToChildren(target, true, false);
          }
        } else if (target.classList.contains(_t.const.CLASS_TABLE)) {
          // this is when current drag is on an invalid/white area
          _setHoverStyleToChildren(target, true, true);
        }
      } else {
        if (target.classList.contains(_t.const.CLASS_ROW)) {
          targetScope = ngModule.element(target).scope();

          if (targetScope.row) {
            targetScope.row.hover = true;
            targetScope.$evalAsync();
          } else {
            _setHoverStyleToChildren(target, false, false);
          }
        } else if (target.classList.contains(_t.const.CLASS_TABLE)) {
          // this is when current drag is on an invalid/white area
          _setHoverStyleToChildren(target, false, true);
        }
      }
    }
  };

  return exports;
});