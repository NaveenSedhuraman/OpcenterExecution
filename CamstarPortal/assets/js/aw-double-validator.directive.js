"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-double-validator) directive used to validate a UI property.
 *
 * @module js/aw-double-validator.directive
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
   * Definition for the (aw-double-validator) directive used to validate a UI property.
   *
   * @example TODO
   *
   * @member aw-double-validator
   * @memberof NgAttributeDirectives
   */

  app.directive('awDoubleValidator', ['uwValidationService', function (uwValidationSvc) {
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


        ngModelCtrl.$asyncValidators.validDouble = function (value, viewValue) {
          var valueFinal = viewValue;

          if (_.isUndefined(valueFinal) || _.isNull(valueFinal)) {
            valueFinal = '';
          }

          return uwValidationSvc.checkAsyncDouble($scope, ngModelCtrl, valueFinal);
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