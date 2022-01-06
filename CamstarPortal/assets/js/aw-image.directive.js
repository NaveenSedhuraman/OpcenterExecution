"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a thumbnail img using xrt thumbnail image styling .
 *
 * @module js/aw-image.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to display a thumbnail img using xrt thumbnail image styling.
   *
   * @example <aw-image source="vpProp.url"></aw-image>
   *
   * @member aw-image
   * @memberof NgElementDirectives
   */

  app.directive('awImage', [function () {
    return {
      restrict: 'E',
      scope: {
        source: '=',
        isIcon: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-image.directive.html',
      replace: true
    };
  }]);
});