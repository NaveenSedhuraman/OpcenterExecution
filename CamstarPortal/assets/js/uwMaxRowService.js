"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 window
 */

/**
 * Max Row service is used to calculate the height of array widget based on max row count. This service is only
 * applicable for Array widget.
 * <P>
 * Note: This module does not return an API object. The API is only available when the service defined this module is
 * injected by AngularJS.
 *
 * @module js/uwMaxRowService
 */
define(['app', 'jquery'], //
function (app, $) {
  'use strict';

  var exports = {};
  /**
   * @private
   *
   * @param {Element} liElement - DOM element the controller is attached to.
   *
   * @return {Number} - returns single row height of an array.
   */

  exports._calculateRowHeight = function (liElement) {
    // row height is equal to max(min-height, line-height) + padding.
    // row height is just the height of a single line - can't use element height
    // if an element has multiple lines it takes multiple rows
    var lineHeight = Math.max(parseInt(liElement.css('line-height'), 10), // line-height css property
    parseInt(liElement.css('min-height'), 10)); // min-height css property

    return lineHeight + parseInt(liElement.css('padding-top'), 10) + parseInt(liElement.css('padding-bottom'), 10);
  };
  /**
   * @private
   *
   * @param {Element} $element - DOM element the controller is attached to.
   * @param {Number} maxRowCount - maximum row count visible.
   *
   * @return {Number} - returns calculated array height based of max row count.
   */


  exports._calculateArrayHeight = function ($element, maxRowCount) {
    if ($element) {
      var arrayHeight = 0;
      var nextHeight = 0;
      var maxRowCountIn = maxRowCount; // If maxRowCount is undefined, by default for array properties we need to show 5 rows before overflowing

      if (!maxRowCountIn) {
        maxRowCountIn = 5;
      } // Calculate the height of each row individually


      for (var i = 1; i < maxRowCountIn + 1; i++) {
        // Get the next row
        var liElement = $element.find('ul li.aw-jswidgets-arrayValueCellListItem:nth-child(' + i + ')');

        if (liElement && liElement.outerHeight()) {
          // if it does not exist reuse the height of the previous element in the list
          nextHeight = exports._calculateRowHeight(liElement);
        }

        arrayHeight += nextHeight;
      }

      return arrayHeight;
    }

    return null;
  };
  /**
   * Definition for the uwMaxRowService service used by (aw-property-array-val) and (aw-property-non-edit-array-val).
   *
   * @member uwMaxRowService
   * @memberof NgServices
   */


  app.factory('uwMaxRowService', [function () {
    return exports;
  }]);
});