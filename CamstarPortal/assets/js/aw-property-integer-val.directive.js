"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-integer-val) directive.
 *
 * @module js/aw-property-integer-val.directive
 */
define(['app', 'angular', 'js/eventBus', //
'js/uwPropertyService', 'js/aw-property-error.directive', 'js/aw-property-lov-val.directive', 'js/aw-property-non-edit-val.directive', 'js/aw-autofocus.directive', 'js/aw-integer-validator.directive', 'js/aw-validator.directive', 'js/aw-widget-initialize.directive'], //
function (app, ngModule, eventBus) {
  'use strict';
  /**
   * Definition for the (aw-property-integer-val) directive.
   *
   * @example TODO
   *
   * @member aw-property-integer-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyIntegerVal', //
  ['uwPropertyService', //
  function (uwPropertySvc) {
    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     */
    function myController($scope) {
      var uiProperty = $scope.prop;
      var _kcEnter = 13;
      /**
       * Bound via 'ng-change' on the 'input' element and called on value change
       *
       * @memberof NumericValController
       */

      $scope.changeFunction = function () {
        if (ngModule.isUndefined(uiProperty.dbValue)) {
          uiProperty.dbValue = '';
        }
      };
      /**
       * Bound via 'ng-blur' on the 'input' element and called on input 'blur' (i.e. they leave the field)
       *
       * @memberof NumericValController
       */


      $scope.blurNumericFunction = function ($event) {
        /**
         * In most cases, updateViewModelProperty will overwrite this, but in a few cases, e.g., if there is a
         * validation error, uiValue won't get updated, so manually do it here
         * <P>
         * Note: Setting 'dbValues' is needed for test harness
         * <P>
         * Note: We HAVE to check for 'null' since value can be '0' (which is otherwise 'false')
         */
        if (uiProperty.isArray) {
          uiProperty.updateArray($event);
        } else {
          if (uiProperty.dbValue === null || uiProperty.dbValue === undefined) {
            uiProperty.uiValue = '';
            uiProperty.dbValues = [];
          } else {
            uiProperty.uiValue = uiProperty.dbValue.toString();
            uiProperty.dbValues = [uiProperty.dbValue.toString()];
          }

          uwPropertySvc.updateViewModelProperty(uiProperty);
        }

        eventBus.publish($scope.prop.propertyName + '.blured', {
          prop: $scope.prop
        });
      };
      /**
       * Bound via 'ng-keydown' on the 'input' element and called on key down on 'input'
       *
       * @memberof NumericValController
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
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-integer-val.directive.html'
    };
  }]);
});