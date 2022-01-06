"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-table.directive
 * @deprecated, use aw-splm-table instead
 */
define(['app', //
'js/eventBus', //
'js/viewModelService', //
'js/aw.table.controller', 'js/aw-table-auto-resize.directive', 'js/aw-table-cell.directive', 'js/aw-table-icon-cell.directive', 'js/aw-table-command-cell.directive', 'js/aw-treetable-command-cell.directive', 'js/aw-fill.directive', 'js/aw-right-click.directive', 'js/aw-long-press.directive', 'js/aw-icon.directive', 'js/aw-popup-panel.directive', 'js/aw-popup-command-bar.directive'], function (app, eventBus) {
  'use strict'; // eslint-disable-next-line valid-jsdoc

  /**
   * This directive is the root of a high-functionality table (grid) widget.
   *
   * @example <aw-table gridid="declGridId" use-tree="true" show-decorators="true"></aw-table>
   *
   * @member aw-table
   * @memberof NgElementDirectives
   */

  app.directive('awTable', ['viewModelService', function (viewModelSvc) {
    return {
      restrict: 'E',
      controller: 'awTableController',
      scope: {
        gridid: '@',
        useTree: '@',
        showDecorators: '@',
        anchor: '@?',
        showDropArea: '@?',
        showContextMenu: '<?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-table.directive.html',
      link: function link($scope, element) {
        if ($scope.showDropArea !== undefined) {
          if ($scope.showDropArea === 'false') {
            element.find('.aw-widgets-droptable').removeClass('aw-widgets-droptable');
          }
        }
        /**
         * Check if we are using a 'gridid' in the closest 'declViewModel' in the scope tree.<BR>
         * If so: Use it to display the aw-table data<BR>
         *
         * @param {Boolean} firstTime - TRUE if initializing first time, FALSE otherwise
         */


        var initializeGrid = function initializeGrid(firstTime) {
          if ($scope.gridid) {
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            var declGrid = declViewModel.grids[$scope.gridid];

            if (declGrid && declGrid.dataProvider) {
              $scope.dataprovider = declViewModel.dataProviders[declGrid.dataProvider];
              /**
               * Delete firstPage results only on dataProvider reset
               */

              if (!firstTime && $scope.dataprovider.json.firstPage) {
                delete $scope.dataprovider.json.firstPage;
              }

              if (firstTime) {
                if ($scope.dataprovider.selectionModel && !$scope.dataprovider.selectionModel.isSelectionEnabled()) {
                  $scope.enableSelection = false;
                }
              }

              viewModelSvc.executeCommand(declViewModel, declGrid.dataProvider, $scope);
            }
          }
        };

        initializeGrid(true);
        $scope.$on('dataProvider.reset', function () {
          initializeGrid();
        });
        $scope.$on('$destroy', function () {
          eventBus.publish('tableDestroyed');
        });
      }
    };
  }]);
});