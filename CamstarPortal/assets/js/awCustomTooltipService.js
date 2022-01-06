"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This is used to read the tooltip of visual indicator and replace '#' with '\n', to show each status in new line.
 *
 * @module js/awCustomTooltipService
 */
define(['app'], function (app) {
  'use strict';

  var exports = {};
  /**
   * event is a type of mouseover event.
   */

  exports.showCustomTooltip = function (event) {
    var res = event.title.split('#');
    var arrayLength = res.length;

    if (arrayLength > 1) {
      var status = '';

      for (var i = 0; i < arrayLength; i++) {
        if (status === '') {
          status = res[i];
        } else {
          status = status + '\n' + res[i];
        }
      }

      event.title = status;
    }
  };
  /**
   * This is the primary service used to create custom tooltip for celllist objects on the mouseover event of visual
   * indicator.
   *
   * @member awCustomTooltipService
   */


  app.factory('awCustomTooltipService', [function () {
    return exports;
  }]);
});