"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/uwListService
 */
define(['app', 'jquery', 'js/browserUtils', 'js/logger', 'js/uwUtilService'], function (app, $, browserUtils, logger) {
  'use strict';
  /**
   * Define local variables for commonly used key-codes.
   */

  var _kcTab = 9;
  var _kcEnter = 13;
  var _kcEscape = 27;
  var _kcUpArrow = 38;
  var _kcDnArrow = 40;
  var _$timeout = null;
  var _utilsSvc = null;
  var exports = {};
  /**
   * @private
   *
   * @param {Object} scope - The 'scope' all controller level values are defined on.
   * @param {Element} $element - DOM element the controller is attached to.
   *
   */

  exports._adjustPositionForValues = function (scope, $element) {
    // Setup the click handler
    _$timeout(function () {
      $('body').off('click touchstart dragstart', scope, exports.exitFieldHandler).on('click touchstart dragstart', scope, exports.exitFieldHandler);
    });

    scope.$evalAsync(function () {
      // now that we have the list of items determine if we should be above or below the choice
      var $choiceElem = $element.find('.aw-jswidgets-choice');
      var dropElem = $element.find('.aw-jswidgets-drop')[0];
      var dropRect = dropElem.getBoundingClientRect();

      if (!scope.forceDropPosition) {
        var choiceElem = $choiceElem[0];
        var choiceRect = choiceElem.getBoundingClientRect();
        var spaceBelow = window.innerHeight - choiceRect.bottom;
        scope.dropPosition = spaceBelow < dropRect.height ? 'above' : 'below';
      }
      /**
       * For non-IE browsers "overflow: hidden" on <aw-table>, its direct parent and children elements causes
       * popup to be clipped off under the table. Until and unless we use detached popup (i.e. attaching popup
       * directly under <body> element) mechanism this issue is not going to resolve.
       *
       * FIXME: This is a temporary fix for 3.4 where we tweak css 'overflow' property to visible when popup is
       * shown and will reset them back once popup is collapsed
       */


      if ($(dropElem).closest('aw-table').length > 0 && !browserUtils.isNonEdgeIE) {
        $(dropElem).closest('aw-table').css({
          overflow: 'visible'
        });
        var parentScrollPanel = $(dropElem).closest('aw-table').parent('.aw-base-scrollPanel');

        if (parentScrollPanel.length > 0) {
          parentScrollPanel.css({
            overflow: 'visible'
          });
        }

        var childOverflownElements = $(dropElem).closest('aw-table').find('.aw-jswidgets-grid.aw-layout-flexColumn, .aw-jswidgets-actualGrid.aw-layout-flexColumn');

        if (childOverflownElements.length > 0) {
          childOverflownElements.css({
            overflow: 'visible'
          });
        }
      } // Get the border width from the CSS


      if (scope.dropPosition === 'above') {
        scope.dropDownVerticalAdj = -Math.abs(dropRect.bottom - dropRect.top) + 'px';
      } else {
        scope.dropDownVerticalAdj = scope.choiceElemHeight + 'px';
      }
    });
  };
  /**
   * For non-IE browsers reset "overflow" CSS property on <aw-table>, its direct parent and children elements causes
   * popup to be clipped off under the table. Until and unless we use detached popup (i.e. attaching popup directly
   * under <body> element) mechanism this issue is not going to resolve.
   *
   * FIXME: This is a temporary fix for 3.4 where we tweak css 'overflow' property to visible when popup is shown and
   * will reset them back once popup is collapsed
   *
   * @param {Element} element - DOM element the controller is attached to.
   *
   */


  exports.resetAfterCollapse = function (element) {
    var dropElem = element.find('.aw-jswidgets-drop')[0];

    if ($(dropElem).closest('aw-table').length > 0 && !browserUtils.isNonEdgeIE) {
      $(dropElem).closest('aw-table').css({
        overflow: ''
      });
      var parentScrollPanel = $(dropElem).closest('aw-table').parent('.aw-base-scrollPanel');

      if (parentScrollPanel.length > 0) {
        parentScrollPanel.css({
          overflow: ''
        });
      }

      var childOverflownElements = $(dropElem).closest('aw-table').find('.aw-jswidgets-grid.aw-layout-flexColumn, .aw-jswidgets-actualGrid.aw-layout-flexColumn');

      if (childOverflownElements.length > 0) {
        childOverflownElements.css({
          overflow: ''
        });
      }
    }
  };
  /**
   * This gets called when we exit the control by clicking outside.
   * <P>
   * Note: More ideally, it would be invoked on blur, but blur events are not well-supported across browsers. In the
   * case of Input blur, we want to ignore clicks inside the drop, so we need to know the target that caused the blur.
   * In chrome, it's 'relatedTarget', in IE you have to use 'document.activeElement', in FF you have
   * 'explicitOriginalTarget', etc. Instead, this is using a document click listener.
   *
   * @private
   *
   * @param {Object} scope - The 'scope' all controller level values are defined on.
   * @param {DOMEvent} event - The associated event object
   *
   */


  exports._exitField = function (scope, event) {
    var targetScope = $(event.target).scope();
    var choiceScope = $(event.target).parents('.aw-jswidgets-choice').scope();
    var dropScope = $(event.target).parents('.aw-jswidgets-drop').scope();
    var targetScopeId = -1;
    var choiceScopeId = -1;
    var dropScopeId = -1;

    if (targetScope) {
      targetScopeId = targetScope.$id;
    }

    if (choiceScope) {
      choiceScopeId = choiceScope.$id;
    }

    if (dropScope) {
      dropScopeId = dropScope.$id;
    } // Some platforms, such as iPAD Safari, send erroneous field exit events, check to make sure this isn't one


    if (targetScopeId === scope.$id || choiceScopeId === scope.$id || dropScopeId === scope.$id) {
      return;
    }

    if (scope.expanded) {
      exports.collapseList(scope);
      scope.handleFieldExit(null, null, true);
    }
  };
  /**
   * Exit field handler which gets triggered when user clicks outside of the LOV
   *
   * @param {DOMEvent} event -
   *
   */


  exports.exitFieldHandler = function (event) {
    exports._exitField(event.data, event);
  };
  /**
   * Collapse the drop-down
   *
   * @param {Object} scope - The object holding all the state within the 'scope' of the widget needing the list.
   *
   */


  exports.collapseList = function (scope) {
    scope.listFilterText = '';
    $('body').off('click touchstart dragstart', exports.exitFieldHandler);
    scope.$evalAsync(function () {
      scope.expanded = false; // clear the watcher

      if (scope.listener) {
        scope.listener();
      } // clear the event listener


      if (scope.unbindSelectionEventListener) {
        scope.unbindSelectionEventListener();
      }
    });

    if (scope.collapseList) {
      scope.collapseList();
    }
  };
  /**
   * Show the popup list of lovEntries.
   *
   * @param {Object} scope - The object holding all the state within the 'scope' of the widget needing the list.
   * @param {JqliteElement} $element - TODO
   *
   */


  exports.expandList = function (scope, $element) {
    scope.unbindSelectionEventListener = scope.$on('dataProvider.selectionChangeEvent', function (event) {
      // Prevent selection event (fired by the listbox dataProvider, if any)
      // to bubble-up to primary/secondary workarea and trigger a selection change.
      event.stopPropagation();
    });

    if (!scope.expanded) {
      var choiceElem = $element.find('.aw-jswidgets-choice')[0];
      var widgetContainer = $element.parents('.aw-jswidgets-arrayWidgetContainer')[0];
      var dropElem = $element.find('.aw-jswidgets-drop')[0];

      if (!choiceElem) {
        logger.warn('uwListService.expandList: Unable to find choice input field element');
        return;
      }

      if (!dropElem) {
        logger.warn('uwListService.expandList: Unable to find dropdown list container element');
        return;
      }

      scope.dropPosition = 'below';
      /**
       * Position the dropdown list element
       */

      var choiceElemDimensions = choiceElem.getBoundingClientRect();
      var widgetContainerDimensions = null;

      if (widgetContainer) {
        widgetContainerDimensions = widgetContainer.getBoundingClientRect();
      }

      scope.lovDDLeft = widgetContainerDimensions ? widgetContainerDimensions.left : choiceElemDimensions.left;
      scope.lovDDTop = window.pageYOffset + choiceElemDimensions.top;
      var stackedRows = false; // Check for special case where ui-grid has been scrolled. Ui-grid applies a transform, forcing rows to stack.

      if ($(dropElem).closest('.ui-grid-row') && $(dropElem).closest('.ui-grid-row').attr('style') && $(dropElem).closest('.ui-grid-row').attr('style').indexOf('transform') >= 0) {
        stackedRows = true; // force list to pop above so it can be visible
        // note this will fail at the top of the screen for non-IE browsers: solution unknown

        scope.forceDropPosition = true;
        scope.dropPosition = 'above';
      } // this dropElem div uses position:fixed, but in ui-grid, top/left are relative to aw-layout-workareaMain (except in IE).
      // Why? Is this considered the viewport? getBoundingClientRect (which is also suppossed to be relative to the viewport),
      // seems to have a different idea of the viewport (it uses the body).
      // TODO: figure this out - there is some subtlty hiding here that i haven't yet found...
      // work-around is to detect aw-table and adjust for non-IE browsers:


      if ($(dropElem).closest('aw-table').length > 0 && !browserUtils.isNonEdgeIE) {
        // adjust non-IE browsers
        if (stackedRows) {
          // special-case: overwrite top/left values since new viewport is created by ui-grid transform in this case
          scope.lovDDLeft = 'auto';
          scope.lovDDTop = 2;
        } else {
          // adjust top and left for non-IE browsers
          scope.lovDDLeft -= $(dropElem).closest('aw-table')[0].getBoundingClientRect().left;
          scope.lovDDTop -= $(dropElem).closest('aw-table')[0].getBoundingClientRect().top;
        }
      }

      scope.lovDDWidth = widgetContainerDimensions ? widgetContainerDimensions.width : choiceElemDimensions.width;
      scope.choiceElemHeight = choiceElemDimensions.bottom - choiceElemDimensions.top;
      /**
       * Listen for changes so we can hide the drop on scroll, etc.
       *
       * @return {Void}
       */

      scope.listener = scope.$watch(function _watchListHeight() {
        return $element.find('.aw-widgets-cellListWidget')[0].clientHeight;
      }, function (newValue, oldValue) {
        if (newValue !== oldValue && newValue > 0) {
          exports._adjustPositionForValues(scope, $element);
        }
      });

      _utilsSvc.handleScroll(scope, $element, 'listService', function () {
        scope.$scrollPanel.off('scroll.listService');
        scope.$scrollPanel = null;
        exports.collapseList(scope);
      });

      scope.expanded = true;
    }
  };
  /**
   * Evaluate a key press in the input
   *
   * @param {Object} scope - associated scope
   * @param {Object} event - associated event object
   * @param {Object} $element - associated element
   */


  exports.evalKey = function (scope, event, $element) {
    // find the index in the lovEntries array of the value of current attention
    var getAttnIndex = function getAttnIndex() {
      if (scope.lovEntries.length && scope.expanded) {
        return scope.lovEntries.map(function (lovEntry) {
          return lovEntry.attn;
        }).indexOf(true);
      }
    };

    var code = event.keyCode;

    if (code === _kcTab || code === _kcEnter || code === _kcEscape || code === _kcUpArrow || code === _kcDnArrow) {
      var attnIndex = getAttnIndex();
      var selectIndex = -1;

      if (code === _kcTab) {
        // on tab, accept the current text, don't auto-complete
        scope.handleFieldExit(event, null);
      } else if (code === _kcEnter) {
        // on enter, autocomplete if there is a matching index
        scope.handleFieldExit(event, attnIndex);
      } else if (code === _kcUpArrow || code === _kcDnArrow) {
        // arrow keys
        if (!scope.expanded) {
          scope.toggleDropdown();
        } // if attn isn't yet set, set it to the first val


        if (attnIndex < 0) {
          scope.lovEntries[0].attn = true;
          selectIndex = 0;
        } else {
          if (code === _kcDnArrow) {
            // down arrow: move the attention down
            if (scope.lovEntries.length > attnIndex + 1) {
              scope.lovEntries[attnIndex].attn = false;
              scope.lovEntries[attnIndex + 1].attn = true;
              selectIndex = attnIndex + 1;
            }
          } else {
            // up arrow
            if (attnIndex > 0) {
              scope.lovEntries[attnIndex].attn = false;
              scope.lovEntries[attnIndex - 1].attn = true;
              selectIndex = attnIndex - 1;
            }
          }
        } // scroll as-needed


        exports.scrollAttention(scope, $element);

        if (scope.handleFieldSelect) {
          scope.handleFieldSelect(selectIndex);
        }
      } else if (code === _kcEscape) {
        exports.collapseList(scope);
        scope.handleFieldEscape();
      }
    }
  };
  /**
   * Scroll to the list item of attention.
   *
   * @param {Object} scope -
   * @param {DOMElement} $element -
   *
   */


  exports.scrollAttention = function (scope, $element) {
    var dropElem = $element.find('.aw-jswidgets-drop');

    if (!dropElem) {
      logger.warn('uwListService.scrollAttention: Unable to find dropdown list container element');
      return;
    }

    _$timeout(function () {
      var $chosenElem = dropElem.find('div.aw-jswidgets-nestingListItemDisplay.aw-state-attention');

      if ($chosenElem && $chosenElem.length) {
        // Calculate where to scroll to show the selected item in the LOV drop down
        var calcTop = dropElem.scrollTop() + $chosenElem.position().top - dropElem.height() / 2;
        dropElem.animate({
          scrollTop: calcTop
        }, 'fast');
      }
    });
  };
  /**
   * Definition for the uwListService service used by (aw-property-lov-val) and (aw-property-time-val).
   *
   * @memberof NgServices
   * @member uwListService
   *
   * @returns {Object} exports
   */


  app.factory('uwListService', ['$timeout', 'uwUtilService', function ($timeout, utilsSvc) {
    _$timeout = $timeout;
    _utilsSvc = utilsSvc;
    return exports;
  }]);
});