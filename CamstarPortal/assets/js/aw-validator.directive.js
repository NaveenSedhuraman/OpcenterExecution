"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-validator) directive used to validate a UI property.
 *
 * @module js/aw-validator.directive
 */
define(['app', 'angular', //
'js/uwValidationService'], //
function (app, ngModule) {
  'use strict';
  /**
   * Definition for the (aw-validator) directive used to validate a UI property.
   *
   * @example TODO
   *
   * @member aw-validator
   * @memberof NgAttributeDirectives
   */

  app.directive('awValidator', ['uwValidationService', function (uwValidationSvc) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function link($scope, $element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }

        if (attrs.awValidator === 'DATE' || attrs.awValidator === 'TIME') {
          /**
           * Add the validation 'machinery' to the set of 'validators' on the ng-model controller.
           *
           * @param value
           *
           * @returns {Void}
           */
          ngModelCtrl.$validators.dateTimeValidator = function (value) {
            var valueFinal = value;

            if (ngModule.isUndefined(valueFinal)) {
              valueFinal = '';
            }

            if (attrs.awValidator === 'DATE') {
              return uwValidationSvc.checkDate($scope, valueFinal, true) && uwValidationSvc.checkRequired($scope, ngModelCtrl, valueFinal);
            } else if (attrs.awValidator === 'TIME') {
              return uwValidationSvc.checkTime($scope, valueFinal, true) && uwValidationSvc.checkRequired($scope, ngModelCtrl, valueFinal);
            }

            return false;
          };
        }

        if (attrs.awValidator === 'REQUIRED') {
          /**
           * Add the required validation 'machinery' to the set of 'validators' on the ng-model controller.
           *
           * @param value
           *
           * @returns {Void}
           */
          ngModelCtrl.$validators.awRequired = function (modelValue, viewValue) {
            return uwValidationSvc.checkRequired($scope, ngModelCtrl, viewValue);
          };
        }
      }
    };
  }]);
});