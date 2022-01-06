"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to validate the form
 *
 * @module js/aw-form-validator.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Directive to validate the form
   *
   * @example <div aw-form-validator ng-model='data'/>
   *
   * @member aw-form-validator
   * @memberof NgElementDirectives
   */

  app.directive('awFormValidator', //
  [function () {
    return {
      restrict: 'A',
      require: '^form',
      link: function link($scope, element, attribute, $ctrl) {
        $ctrl.$setValidity = function () {
          var elems = element.find('input');
          var dirtyState = false;

          for (var i = 0; i < elems.length; i++) {
            var inputCtrl = elems.eq(i).controller('ngModel');

            if (inputCtrl.$dirty) {
              dirtyState = true;
              break;
            }
          }

          if (!dirtyState) {
            $ctrl.$setPristine();
          }
        };
      }
    };
  }]);
});