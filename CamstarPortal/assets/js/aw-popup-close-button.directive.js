"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-popup-close-button.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to display a button on popup panel to close the popup.
   *
   * @example <aw-popup-close-button><aw-i18n>i18n.cancel</aw-i18n></aw-popup-close-button>
   *
   * @member aw-popup-close-button
   * @memberof NgElementDirectives
   */

  app.directive('awPopupCloseButton', function () {
    return {
      restrict: 'E',
      transclude: true,
      template: '<button class="aw-popup-secondaryButton"  ng-click="$emit(\'awPopup.close\')" ng-transclude ></button>',
      replace: true
    };
  });
});