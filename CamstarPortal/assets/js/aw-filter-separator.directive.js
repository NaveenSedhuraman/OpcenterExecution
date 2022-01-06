"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-filter-separator.directive
 */
define(['app', //
'js/visible-when.directive', 'js/aw-i18n.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display search categories.
   *
   * @example <aw-filter-separator ></aw-filter-separator>
   *
   * @member aw-filter-separator
   * @memberof NgElementDirectives
   */

  app.directive('awFilterSeparator', [function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      template: '<div class="aw-ui-filterSeparator" ng-transclude ></div>',
      replace: true
    };
  }]);
});