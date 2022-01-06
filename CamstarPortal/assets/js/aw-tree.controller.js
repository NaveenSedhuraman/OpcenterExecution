"use strict";

// Copyright 2017 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines controller for '<aw-tree>' directive.
 *
 * @module js/aw-tree.controller
 */
define(['app', 'angular', 'js/eventBus'], function (app, ngModule, eventBus) {
  'use strict';
  /**
   * Defines awTree controller. Extends the {@link  NgControllers.awTreeController}. Handles 'NodeSelectionEvent' in the tree
   *
   * @member awTreeController
   * @memberof NgControllers
   */

  app.controller('awTreeController', ['$scope', '$controller', function ($scope, $controller) {
    var ctrl = this;
    ngModule.extend(ctrl, $controller('awNodeController', {
      $scope: $scope
    }));
    $scope.$on('TreeNodeSelectionEvent', function (event, data) {
      var node = data.node;
      event.stopPropagation();

      if (node) {
        if ($scope.name) {
          eventBus.publish($scope.name + '.treeNodeSelected', {
            node: node
          });
        }

        if ($scope.selectedNode) {
          $scope.selectedNode.selected = false;
        }

        $scope.selectedNode = node;
        $scope.selectedNode.selected = true;
      }

      $scope.$emit('NodeSelectionEvent', {
        node: node
      });
    });
  }]);
});