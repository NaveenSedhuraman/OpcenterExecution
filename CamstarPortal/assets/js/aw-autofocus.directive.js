"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the 'aw-autofocus' directive used to autofocus an element.
 *
 * @module js/aw-autofocus.directive
 */
define(['app', 'jquery'], //
function (app, $) {
  'use strict';
  /**
   * Definition for the 'aw-autofocus' directive used to autofocus an element
   *
   * @example <someHtmlTag aw-autofocus />
   *
   * @member aw-autofocus
   * @memberof NgAttributeDirectives
   */

  app.directive('awAutofocus', //
  function () {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', function ($scope, $element) {
        if ($scope.autoFocus) {
          $($element[0]).focus();
        }
      }],
      scope: {
        autoFocus: '='
      }
    };
  });
});