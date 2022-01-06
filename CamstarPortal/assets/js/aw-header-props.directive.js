"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive used as header property
 *
 * @module js/aw-header-props.directive
 * @requires app
 * @requires js/aw-repeat.directive
 * @requires js/aw-widget.directive
 */
define(['app', //
'js/aw-repeat.directive', 'js/aw-widget.directive'], //
function (app) {
  'use strict';
  /**
   * Directive used to display the header properties.
   *
   *
   * Parameters:
   * headerProperties - Any properties to display in the header
   *
   * @example <aw-header-props [headerProperties=""]></aw-header--props>
   *
   * @member aw-header-props
   * @memberof NgElementDirectives
   */

  app.directive('awHeaderProps', function () {
    return {
      restrict: 'E',
      scope: {
        headerProperties: '=?headerproperties'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-header-props.directive.html'
    };
  });
});