"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the <aw-property-toggle-val> directive.
 *
 * @module js/aw-property-toggle-button-val.directive
 */
define(['app', //
'js/uwPropertyService', 'js/aw-property-error.directive', 'js/aw-autofocus.directive', 'js/aw-widget-initialize.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the <aw-property-toggle-val> directive.
   *
   * @example TODO
   *
   * @member aw-property-toggle-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyToggleButtonVal', //
  ['uwPropertyService', //
  function (uwPropertySvc) {
    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     */
    function myController($scope) {
      if (!$scope.prop) {
        return;
      }

      var uiProperty = $scope.prop;
      var _kcEnter = 13;
      /**
       * Bound via 'ng-change' on the 'input' element and called on value change.
       *
       * @memberof ToggleButtonValController
       */

      $scope.changeFunction = function () {
        if (!uiProperty.isArray) {
          // this is needed for test harness
          uiProperty.dbValues = [Boolean(uiProperty.dbValue)];
          uwPropertySvc.updateViewModelProperty(uiProperty);
        }
      };
      /**
       * Returns 'TRUE' if isRequired flag is set to true.
       *
       * @memberof ToggleButtonValController
       */


      $scope.showRequired = function () {
        if (uiProperty && uiProperty.dbValue === null) {
          return $scope.prop.isRequired;
        }

        return false;
      };
      /**
       * Bound via 'ng-keydown' on the 'input' element and called on key down on 'input'
       *
       * @memberof ToggleButtonValController
       */


      $scope.evalKey = function ($event) {
        if ($event.keyCode === _kcEnter) {
          if (uiProperty.isArray) {
            uiProperty.updateArray($event);
            $event.preventDefault();
          }
        }
      };
    }

    myController.$inject = ['$scope'];
    return {
      restrict: 'E',
      controller: myController,
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-toggle-button-val.directive.html'
    };
  }]);
});