"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-integer-validator) directive used to validate a UI property.
 *
 * @module js/aw-integer-validator.directive
 */
define(['app', 'lodash', //
'js/uwValidationService'], //
function (app, _) {
  'use strict';
  /**
   * Define local variables for commonly used key-codes.
   */

  var _kcSpace = 32;
  /**
   * Definition for the (aw-integer-validator) directive used to validate a UI property.
   *
   * @example TODO
   *
   * @member aw-integer-validator
   * @memberof NgAttributeDirectives
   */

  app.directive('awIntegerValidator', ['uwValidationService', function (uwValidationSvc) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link($scope, $element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }
        /**
         * Add the validation 'machinery' to the set of 'validators' on the ng-model controller.
         *
         * @param value
         *
         * @returns {Void}
         */


        ngModelCtrl.$asyncValidators.validInteger = function (value, viewValue) {
          var valueFinal = viewValue;

          if (_.isUndefined(valueFinal) || _.isNull(valueFinal)) {
            valueFinal = '';
          }

          return uwValidationSvc.checkAsyncInteger($scope, ngModelCtrl, valueFinal);
        };
        /**
         * Set up to ignore any 'space' key being pressed while in the field.
         *
         * @param event
         *
         * @returns {Void}
         */


        $element.bind('keypress', function (event) {
          if (event.keyCode === _kcSpace) {
            // ignore space key
            event.preventDefault();
          }
        });
      }
    };
  }]);
});