"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Slider widget
 *
 * @module js/aw-slider.directive
 */
define(['app', 'js/aw-slider.controller', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display a slider widget
   *
   * @example <aw-slider prop="data.xxx" />
   *
   * @member aw-slider
   * @memberof NgElementDirectives
   */

  app.directive('awSlider', [function () {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: 'awSliderController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-slider.directive.html',
      replace: true
    };
  }]);
});