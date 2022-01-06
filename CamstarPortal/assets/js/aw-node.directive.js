"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display tree's node
 *
 * @module js/aw-node.directive
 */
define(['app', 'js/aw-node.controller', //
'js/aw-transclude.directive', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display tree of nodes
   *
   * @example <aw-node tree="myNodes"><div>Sample tree item</div></aw-node>
   *
   * @member aw-node
   * @memberof NgElementDirectives
   */

  app.directive('awNode', [function () {
    return {
      restrict: 'E',
      controller: 'awNodeController',
      transclude: true,
      scope: {
        tree: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-node.directive.html'
    };
  }]);
});