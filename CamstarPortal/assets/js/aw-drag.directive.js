"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive for the drag handle, which is used to hook the UI event and input for fill down drag.
 *
 * @module js/aw-drag.directive
 */
define(['app', 'js/logger'], function (app, logger) {
  'use strict';
  /**
   * Directive for the drag handle, which is used to hook the UI event and input for fill down drag.
   *
   * @member aw-drag
   * @memberof NgAttributeDirectives
   */

  app.directive('awDrag', function () {
    return {
      restrict: 'A',
      link: function link(scope, element) {
        try {
          element.off('mouseover').on('mouseover', function (event) {
            scope.checkStartRangeSelect(event.originalEvent);
          });
        } catch (e) {
          logger.error('awDrag exception ' + e);
        }
      }
    };
  });
});