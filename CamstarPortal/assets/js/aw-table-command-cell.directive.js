"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This directive supports commands inside table cells
 *
 * @module js/aw-table-command-cell.directive
 */
define(['app', 'js/parsingUtils', //
'js/aw-property-val.directive', 'js/aw-list-command.directive', 'js/aw-icon.directive', 'js/aw-table-command-bar.directive', //
'js/awTableService', 'js/aw-clickable-title.directive'], function (app, parsingUtils) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Definition for the 'aw-table-command-cell' directive used for as a container for the edit & non-edit property
   * directives.
   *
   * @example <aw-table-command-cell prop="prop" commands="commands" vmo="vmo" />
   *
   * @member aw-table-command-cell
   * @memberof NgElementDirectives
   */

  app.directive('awTableCommandCell', ['awTableService', function (awTableSvc) {
    /* eslint-disable-next-line valid-jsdoc*/

    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     */
    function myController($scope, $element) {
      $scope.startEdit = function (event) {
        awTableSvc.handleCellStartEdit($scope, $element, event);
      };

      $scope.stopEdit = function (event) {
        awTableSvc.handleCellStartEdit($scope, $element, event);
      };
      /**
       * During construction we want to have multi-select OFF by default.
       */


      $scope.dataProvider = parsingUtils.parentGet($scope, 'dataprovider');
      /**
       * Create context for nested command bar
       *
       * Watch is necessary as cells are not recreated (making new controller) again when scrolling. The $scope
       * values will just change.
       *
       * Creating anonymous object in the view also does not work as it triggers command bar binding every digest
       * cycle (object identity is never the same)
       */

      $scope.commandContext = {
        vmo: $scope.vmo
      };
      $scope.$watch('vmo', function () {
        // $scope.commandContext cannot change - object is used directly by GWT
        // this whole watch could be removed once GWT is gone - zero compile does not need it
        $scope.commandContext.vmo = $scope.vmo;
      });
    }

    myController.$inject = ['$scope', '$element'];
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '<',
        commands: '<',
        vmo: '<',
        row: '<',
        rowindex: '<',
        anchor: '<?',
        modifiable: '@?'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-table-command-cell.directive.html',
      controller: myController
    };
  }]);
});