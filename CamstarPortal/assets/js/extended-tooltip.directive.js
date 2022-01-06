"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Attribute Directive for extended tooltip.
 *
 * @module js/extended-tooltip.directive
 */
define(['app', 'lodash', 'jquery', 'js/eventBus', 'js/parsingUtils', 'assert', 'js/balloonPopupService', 'js/viewModelService', 'js/appCtxService', 'js/configurationService'], function (app, _, $, eventBus, parsingUtils, assert) {
  'use strict';
  /**
   * Attribute Directive for extended tooltip.
   *
   * @example   <aw-link prop="data.box1" action="buttonAction1"  extended-tooltip="data.listTooltip"></aw-link>
   *
   * @member extended-tooltip
   * @memberof NgAttributeDirectives
   */

  app.directive('extendedTooltip', ['viewModelService', 'balloonPopupService', '$timeout', 'appCtxService', 'configurationService', function (viewModelSvc, balloonPopupSvc, $timeout, appCtxService, cfgSvc) {
    return {
      restrict: 'A',
      link: function link(scope, element, attr) {
        var self;
        var isObject = true;
        var tooltipConfig = {};
        var tooltipBox = {};
        var defaultTooltipArray = '';
        var viewportOffset = '';
        var extendedTooltipContent = false;
        var timeId = '';
        var hidePopupTimeId = '';
        var declViewModel;
        var extendedTooltipObject;
        var attrPropName;
        var viewModelProp = '';
        var sizeMap = [];
        var oldTooltipConfig = '';
        /**
        * @private
        *
        * @param {object}
        *            key - the size from the Map.
        */

        var getSizeForPopup = function getSizeForPopup(key) {
          tooltipBox.popupOrientation = sizeMap[key].popupOrientation;
          tooltipBox.popupWidth = sizeMap[key].popupWidth;
          tooltipBox.popupHeight = sizeMap[key].popupHeight;
          tooltipBox.popupMinHeight = sizeMap[key].popupMinHeight;
          tooltipBox.popupMinWidth = sizeMap[key].popupMinWidth;
        };

        cfgSvc.getCfg('extendedTooltipSize').then(function (tooltipJsonSize) {
          sizeMap = tooltipJsonSize;
          getSizeForPopup('default');
        });

        var clearTooltipData = function clearTooltipData(event) {
          // Unregister the context
          appCtxService.unRegisterCtx(tooltipConfig.view);
          event.target = null;
          balloonPopupSvc.hideLinkPopUp(event);
        };

        var hideTooltip = function hideTooltip(event) {
          // cancelling timeout of openBalloonpopup function
          var isCancelled = $timeout.cancel(timeId);

          if (!isCancelled) {
            var popId = tooltipConfig.elementDimension.popupId ? tooltipConfig.elementDimension.popupId + 'BalloonPopup' : tooltipConfig.view + 'BalloonPopup';

            if (balloonPopupSvc.hideLinkPopUp) {
              hidePopupTimeId = $timeout(function () {
                clearTooltipData(event);
              }, 100);
            }

            $('#' + popId).on('mouseenter', function () {
              $timeout.cancel(hidePopupTimeId);
              $('#' + popId).on('mouseleave', function (event) {
                clearTooltipData(event);
              });
            });
          }

          $(self).off('mouseleave', hideTooltip);
        };
        /**
        * remove default tooltip of ui-element.
        *
        * @private
        */


        var removeElementTitle = function removeElementTitle() {
          defaultTooltipArray = $(element).find('[title]');
          defaultTooltipArray && defaultTooltipArray.removeAttr('title');
        };
        /**
        * update the dimension in toolconfig.
        *
        * @private
        * @param {object}
        *       elementOffset - Provides viewport details
        */


        var updateElementDimension = function updateElementDimension(elementOffset) {
          tooltipConfig.elementDimension.offsetHeight = elementOffset.height;
          tooltipConfig.elementDimension.offsetLeft = elementOffset.left;
          tooltipConfig.elementDimension.offsetTop = elementOffset.top;
          tooltipConfig.elementDimension.offsetWidth = elementOffset.width;
          tooltipConfig.elementDimension.defaultSize = true;
        };
        /**
        * Register tooltip context.
        *
        * @private
        */


        var registerTootlipContext = function registerTootlipContext() {
          var tooltipContext = scope[attr.extendedTooltipContext];

          if (!tooltipContext) {
            assert(tooltipContext, 'Missing scope: ' + attr.extendedTooltipContext);
          }

          appCtxService.registerCtx(tooltipConfig.view, tooltipContext);
        }; // quick check for touch


        var isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;

        if (attr.extendedTooltip && !isTouchDevice) {
          element.on('mouseenter', function (event) {
            // check for not to execute balloon popup code again when it has been done in first place
            if (oldTooltipConfig !== attr.extendedTooltip) {
              self = this;
              declViewModel = viewModelSvc.getViewModel(scope, true);
              removeElementTitle();

              try {
                oldTooltipConfig = attr.extendedTooltip;
                extendedTooltipObject = JSON.parse(attr.extendedTooltip);
                isObject = extendedTooltipObject === 'undefined';
              } catch (err) {
                isObject = true;
              }
            } // handling tooltip viewportOffset behavior for commands and ui elements


            if (isObject) {
              attrPropName = attr.extendedTooltip.substr(attr.extendedTooltip.indexOf('.') + 1);
              tooltipConfig = viewModelSvc.getViewModelObject(declViewModel, attrPropName);
              viewportOffset = element.filter('[extended-tooltip]')[0].getBoundingClientRect();

              if (!viewportOffset.height) {
                viewportOffset = $(element[0].parentElement)[0].getBoundingClientRect();
              }

              tooltipConfig.elementDimension = {
                elementObject: element.filter('[extended-tooltip]')[0]
              };
            } else {
              tooltipConfig = extendedTooltipObject;
              viewportOffset = element.filter('[extended-tooltip]')[0].getBoundingClientRect();
              tooltipConfig.elementDimension = {
                popupId: element[0].id
              };
            } // If user gives key for the size ( like medium ,large..) set that for the popup


            if (tooltipConfig.size) {
              getSizeForPopup(tooltipConfig.size);
            }

            updateElementDimension(viewportOffset); // handling of tooltip content when there is no view/viewmodel in ui element's json file

            if (tooltipConfig.extendedTooltipContent) {
              viewModelProp = parsingUtils.getStringBetweenDoubleMustaches(tooltipConfig.extendedTooltipContent);
              var content = parsingUtils.parentGet(declViewModel._internal.origCtxNode, viewModelProp);
              tooltipConfig.view = content === undefined ? viewModelProp : content;
              tooltipConfig.elementDimension.popupId = attrPropName;
              extendedTooltipContent = true;
            }

            tooltipConfig.elementDimension.popupType = 'extendedTooltip'; // open balloon popup after 1 second

            timeId = $timeout(function () {
              // Register the context
              if (attr.extendedTooltipContext) {
                registerTootlipContext();
              }

              balloonPopupSvc.openBalloonPopup(tooltipConfig.view, tooltipConfig.elementDimension, tooltipBox.popupOrientation, tooltipBox.popupHeight, tooltipBox.popupWidth, 'false', tooltipBox.popupMinHeight, tooltipBox.popupMinWidth, extendedTooltipContent);
            }, 300);
            $(self).on('mouseleave click', hideTooltip);
          });
        }
      }
    };
  }]);
});