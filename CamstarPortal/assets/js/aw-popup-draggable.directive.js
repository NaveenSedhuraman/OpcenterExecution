"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-popup-draggable.directive
 */
define(['app', 'angular'], //
function (app, ngModule) {
  'use strict';
  /**
   * Attribute Directive to change the draggability of aw-popup
   *
   * @example <aw-command-panel caption="i18n.createReport" aw-popup-draggable> </aw-command-panel>
   *
   * @member awPopupDraggable
   * @memberof NgAttributeDirectives
   */

  app.directive('awPopupDraggable', [function () {
    return {
      restrict: 'A',
      require: '^awPopup',
      link: function link(scope, element, attr, ctrl) {
        var $element = ngModule.element(element);
        scope.$applyAsync(function () {
          var titleElement = $element.find('.aw-layout-panelTitle');

          if (titleElement) {
            ngModule.element(titleElement).css('cursor', 'move');
          }

          ctrl.setDraggable(true);
        });
      }
    };
  }]);
});