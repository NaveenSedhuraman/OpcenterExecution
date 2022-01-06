"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display tree of nodes
 *
 * @module js/aw-tree.directive
 */
define(['app', 'js/aw-tree.controller', //
'js/aw-transclude.directive', 'js/aw-node.directive', 'js/aw-property-image.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display tree of nodes
   *
   * @example <aw-tree name="name" nodes="myNodes"><div>Sample tree item</div></aw-tree>
   *
   * @member aw-tree
   * @memberof NgElementDirectives
   */

  app.directive('awTree', [function () {
    return {
      restrict: 'E',
      controller: 'awTreeController',
      transclude: true,
      scope: {
        tree: '=',
        name: '=?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-node.directive.html'
    };
  }]);
});