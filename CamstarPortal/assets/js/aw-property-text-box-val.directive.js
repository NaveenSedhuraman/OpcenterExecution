"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-text-box-val) directive.
 *
 * @module js/aw-property-text-box-val.directive
 */
define(['app', 'js/eventBus', //
'js/uwPropertyService', 'js/aw-property-error.directive', 'js/aw-autofocus.directive', 'js/aw-widget-initialize.directive', 'js/aw-validator.directive'], //
function (app, eventBus) {
  'use strict';
  /**
   * Definition for the (aw-property-text-box-val) directive.
   *
   * @example TODO
   *
   * @member aw-property-text-box-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyTextBoxVal', //
  ['uwPropertyService', //
  function (uwPropertySvc) {
    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     */
    function myController($scope) {
      var _kcEnter = 13;
      /**
       * Bound via 'ng-change' on the 'input' element and called on value change.
       *
       * @memberof TextBoxValController
       */

      $scope.changeFunction = function () {
        if (!$scope.prop.isArray) {
          // this is needed for test harness
          $scope.prop.dbValues = [$scope.prop.dbValue];
          uwPropertySvc.updateViewModelProperty($scope.prop);
        }
      };
      /**
       * Bound via 'ng-keydown' on the 'input' element and called on key down on 'input'
       *
       * @memberof TextBoxValController
       */


      $scope.evalKey = function ($event) {
        if ($event.keyCode === _kcEnter) {
          if ($scope.prop.isArray) {
            $scope.prop.updateArray($event);
            $event.preventDefault();
          }
        }
      };
      /**
       * Bound via 'ng-blur' on the 'input' element and called on called on input 'blur' (i.e. they leave the
       * field)
       *
       * @memberof TextBoxValController
       */


      $scope.blurTextBoxFunction = function ($event) {
        eventBus.publish($scope.prop.propertyName + '.blured', {
          prop: $scope.prop
        });

        if ($scope.prop.isArray) {
          $scope.prop.updateArray($event);
        }
      };
    }

    myController.$inject = ['$scope'];
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '='
      },
      controller: myController,
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-text-box-val.directive.html'
    };
  }]);
});