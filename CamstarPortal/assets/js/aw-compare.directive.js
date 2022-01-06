"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-compare.directive
 */
define(['app', 'angular', 'lodash', 'js/eventBus', 'js/functionalUtility.service', 'js/aw-compare.controller', 'js/aw-icon.directive'], function (app, ngModule, _, eventBus) {
  'use strict'; // eslint-disable-next-line valid-jsdoc

  /**
   * Directive to objects in compare view
   *
   * @example <aw-compare dataprovider="dataprovider" column-provider="columnProvider"></aw-compare>
   *
   * @member aw-compare
   * @memberof NgElementDirectives
   */

  app.directive('awCompare', ['functionalUtilityService', function (functional) {
    return {
      restrict: 'E',
      scope: {
        // Fixed list of columns to use with compare
        columns: '=?',
        // Or a provider to use to load the columns
        columnProvider: '=?',
        // Data provider to use to load the VMO
        dataprovider: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-compare.directive.html',
      controller: 'awCompareGridController',
      link: function link($scope, $element, attrs, ctrl) {
        // Show the first column in Arrange panel
        $scope.showFirstColumnInArrange = true; // Automatically add expected classes to avoid lots of step defs + css updates

        $element.addClass('aw-widgets-compareContainer aw-jswidgets-commonGrid'); // Event subscriptions to remove on $destroy

        var eventSubDefs = [];
        /**
         * Refresh the grid with the current objects and columns
         */

        var refreshGrid = function refreshGrid() {
          ctrl.refreshGridData($scope.dataprovider.getViewModelCollection().getLoadedViewModelObjects(), $scope.columns);
        };
        /**
         * Reload compare - reload data (not columns)
         *
         * @param {Column[]} columns New columns
         */


        var setColumns = function setColumns(columns) {
          $scope.columns = columns;

          if ($scope.dataprovider.json.firstPage) {
            delete $scope.dataprovider.json.firstPage;
          } // Update the property policy


          ctrl.updatePropertyPolicy(columns);
          $scope.dataprovider.initialize($scope);
          refreshGrid();
        };
        /**
         * Reset compare - reload columns and data
         */


        var reset = function reset() {
          if ($scope.columnProvider.loadColumnAction) {
            ctrl.doLoadColumnAction($scope.columnProvider.loadColumnAction).then(setColumns);
          } else {
            setColumns($scope.columns);
          }
        }; // Whenever a new object is displayed in aw-compare


        $scope.$watchCollection($scope.dataprovider.getViewModelCollection().getLoadedViewModelObjects, refreshGrid); // Refresh the grid whenever the columns change

        $scope.$watch('columns', refreshGrid); // If there is a column provider

        if ($scope.columnProvider) {
          eventSubDefs.push(eventBus.subscribe('columnArrange', function (eventData) {
            if (eventData.name === $scope.columnProvider.columnConfigId) {
              $scope.arrangeEvent = eventData;

              if (eventData.arrangeType === 'reset') {
                ctrl.doLoadColumnAction($scope.columnProvider.resetColumnAction).then(setColumns);
              } else {
                // Update columns
                $scope.columns = eventData.columns.map(function (column) {
                  return {
                    field: column.propertyName,
                    name: column.propertyName,
                    columnOrder: column.columnOrder,
                    visible: column.hiddenFlag !== true,
                    pixelWidth: column.pixelWidth,
                    sortDirection: column.sortDirection,
                    sortPriority: column.sortPriority,
                    typeName: column.typeName,
                    displayName: column.displayName,
                    sortBy: column.sortByFlag
                  };
                });
                refreshGrid(); // Save new column config

                ctrl.doLoadColumnAction($scope.columnProvider.saveColumnAction);
              }
            }
          }));
        } else {
          var columnConfigId = $scope.dataprovider.name + 'Compare';
          $scope.columnProvider = {
            columnConfigId: columnConfigId
          };
          eventSubDefs.push(eventBus.subscribe('columnArrange', function (eventData) {
            if (eventData.name === columnConfigId) {
              // Reorder and update columns
              // Because the event data is required to be the direct input to a SOA it does not set all properties again (ex display name)
              var newColumnOrderByName = eventData.columns.map(functional.getProp('propertyName'));
              $scope.columns.sort(function (a, b) {
                return newColumnOrderByName.indexOf(a.name) - newColumnOrderByName.indexOf(b.name);
              });
              eventData.columns.forEach(function (newColData, idx) {
                var currentColData = $scope.columns[idx];
                currentColData.visible = newColData.hiddenFlag !== true;
                currentColData.pixelWidth = newColData.pixelWidth;
                currentColData.columnOrder = newColData.columnOrder;
                currentColData.sortDirection = newColData.sortDirection;
                currentColData.sortPriority = newColData.sortPriority;
              });
              refreshGrid();
            }
          }));
        } // Fired when an external tool (such as a command panel) wants to reset the data provider (and selection)


        eventSubDefs.push(eventBus.subscribe($scope.dataprovider.name + '.reset', reset));
        $scope.$on('dataProvider.reset', reset);
        $scope.$on('$destroy', function () {
          // Remove event listeners
          eventSubDefs.map(eventBus.unsubscribe); // Remove property policy

          ctrl.updatePropertyPolicy(); // AW-65681 Fire tableDestroyed event so that arrange panel can be closed

          eventBus.publish('tableDestroyed');
        });
      }
    };
  }]);
});