"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive for the drag handle, which is used to hook the UI event and input for fill down drag.
 * <P>
 * Note: created from aw-drag.directive (gwt table)
 *
 * @module js/aw-fill.directive
 */
define(['app', 'js/logger', 'js/aw.fill.controller'], function (app, logger) {
  'use strict';
  /**
   * Directive for the drag handle, which is used to hook the UI event and input for fill down drag.
   *
   * @member aw-fill
   * @memberof NgAttributeDirectives
   */

  app.directive('awFill', function () {
    return {
      restrict: 'A',
      controller: 'awFillController',
      link: function link(scope, element) {
        try {
          element.off('mouseover').on('mouseover', function (event) {
            scope.checkStartRangeSelect(event.originalEvent);
          });
        } catch (e) {
          logger.error('awFill exception ' + e);
        }
      }
    };
  });
});