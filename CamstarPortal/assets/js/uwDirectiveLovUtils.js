"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 clearTimeout,
 define,
 setTimeout,
 window
 */

/**
 * @module js/uwDirectiveLovUtils
 */
define(['angular', //
'js/aw-when-scrolled.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-lov-child.directive'], //
function (ngModule) {
  // Begin RequireJS Define
  'use strict';

  var exports = {};
  /**
   * This method will set selected LOV entry
   *
   * @param {Element} parentElement - The DOM element to retrieve scope.
   * @param {Object} lovEntry - The LOVEntry object containing the values to set the scope property's 'ui' and 'db'
   *            values based upon.
   */

  exports.setSelectedLovEntry = function (parentElement, lovEntry) {
    if (parentElement) {
      var ctrlElement = ngModule.element(parentElement.querySelector('.aw-jswidgets-propertyVal'));

      if (ctrlElement) {
        var ngScope = ngModule.element(ctrlElement).scope();

        if (ngScope && ngScope.$$childHead) {
          ngScope.$$childHead.setSelectedLOV(lovEntry);
        }
      }
    }
  };

  return exports;
});