"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This directive supports icons inside table cells
 *
 * @module js/aw-table-icon-cell.directive
 */
define(['app', 'js/aw-model-icon.directive', 'js/appCtxService', 'js/localeService'], function (app) {
  'use strict';
  /**
   * {Promise} Cached localizaed cellTitle text.
   */

  var _localeTextPromise;
  /**
   * Definition for the 'aw-table-command-cell' directive used for as a container for the edit & non-edit property
   * directives.
   *
   * @example <aw-table-icon-cell vmo="vmo" />
   *
   * @member aw-table-icon-cell
   * @memberof NgElementDirectives
   */


  app.directive('awTableIconCell', function () {
    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     * @param {appCtxService} appCtxSvc - The service to use.
     * @param {localeService} localeSvc - The service to use.
     */
    function myController($scope, appCtxSvc, localeSvc) {
      if (!_localeTextPromise) {
        _localeTextPromise = localeSvc.getLocalizedText('treeTableMessages', 'visibilityControlsTitle');
      }

      _localeTextPromise.then(function (result) {
        $scope.cellTitle = result;
      });

      $scope.ctx = appCtxSvc.ctx;
      /**
       * Called when the icon image in the tree-table comment cell is 'clicked'.
       * <P>
       * Note: This function currently does nothing. Is a place holder for when visibility is being controlled by
       * clicks on the icon.
       *
       * @param {Object} vmo - The object that represents the vmo in the table being clicked.
       * @param {Object} evt - The click event.
       */

      $scope.imageButtonClick = function (vmo, evt) {
        //eslint-disable-line
        // Stop event propagation to avoid selecting the entire row the icon is within.
        evt.stopPropagation(); // Fires off an event up the scope hierarchy the VMO object selected

        $scope.$emit('awTable.imageButtonClick', vmo);
      };
      /**
       * This function is called when the container scope "broadcasts" down a visibilityStateChangedEvent. An api
       * object that can be called to determine the visibility of the cell is called
       */


      $scope.$on('visibilityStateChanged', function (event, api) {
        if (api && $scope.vmo) {
          $scope.vmo.visible = api.getVisibility($scope.vmo.uid);
        }
      });
    }

    myController.$inject = ['$scope', 'appCtxService', 'localeService'];
    return {
      restrict: 'E',
      scope: {
        vmo: '<'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-table-icon-cell.directive.html',
      controller: myController
    };
  });
});