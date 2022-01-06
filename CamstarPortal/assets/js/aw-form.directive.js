"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to wrap HTML form element to provide validation support
 *
 * @module js/aw-form.directive
 * @requires app
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to wrap HTML form element to provide validation support
   *
   * @example <aw-form name="mainPanelForm"></aw-form>
   *
   * @member aw-form
   * @memberof NgDirectives
   */

  app.directive('awForm', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: '<form class="aw-layout-panelContent" ng-transclude novalidate></form>'
    };
  });
});