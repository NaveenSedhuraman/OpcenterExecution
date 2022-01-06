"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-text-area-val) directive.
 *
 * @module js/aw-property-text-area-val.directive
 */
define(['app', 'js/eventBus', //
'js/uwPropertyService', 'js/aw-property-error.directive', 'js/aw-autofocus.directive', 'js/aw-widget-initialize.directive', 'js/aw-validator.directive'], //
function (app, eventBus) {
  'use strict';
  /**
   * Definition for the (aw-property-text-area-val) directive.
   *
   * @example TODO
   *
   * @member aw-property-text-area-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyTextAreaVal', //
  ['uwPropertyService', //
  function (uwPropertySvc) {
    /**
     * Controller used for prop update or pass in using &?
     *
     * @param {Object} $scope - The allocated scope for this controller
     */
    function myController($scope) {
      var _kcEnter = 13;
      var _kcUndo = 90;
      /**
       * Bound via 'ng-change' on the 'textarea' element and called on value change.
       *
       * @memberof TextAreaValController
       */

      $scope.changeFunction = function () {
        if (!$scope.prop.isArray) {
          // this is needed for test harness
          $scope.prop.dbValues = [$scope.prop.dbValue];
          uwPropertySvc.updateViewModelProperty($scope.prop);
        }
        /*
         * getting the input size in bytes ( as english have 1 byte char, chinese have 2 byte char, japanese
         * have 3 byte char, etc ).
         * in UTF8 encodings, each character uses between 1 and 4 bytes
         */


        var encodeStr = encodeURIComponent($scope.prop.dbValue).match(/%[89ABab]/g);
        var len = $scope.prop.dbValue.length + (encodeStr ? encodeStr.length : 0);
        /*
         * This is for handling the copy usecase.
         * If user copy the text input, where length( in terms of byte size ) is more than max-length,
         * then we need to trim the extra chars for those language's input
         * so that user can paste only those chars that are specified by max-length.
         */

        if (len > $scope.prop.maxLength) {
          var newInput = '',
              newInputLength = 0;

          for (var i = 0; i < $scope.prop.dbValue.length; i++) {
            encodeStr = encodeURIComponent($scope.prop.dbValue[i]).match(/%[89ABab]/g);
            newInputLength = newInputLength + $scope.prop.dbValue[i].length + (encodeStr ? encodeStr.length : 0);

            if (newInputLength <= $scope.prop.maxLength) {
              newInput += $scope.prop.dbValue[i];
            } else {
              $scope.prop.dbValue = newInput;
              break;
            }
          }
        }
      };
      /**
       * Bound via 'ng-keydown' on the 'textarea' element and called on key down on 'textarea'
       *
       * @memberof TextAreaValController
       */


      $scope.evalKey = function ($event) {
        if ($event.keyCode === _kcEnter) {
          // For 'textarea' enter new line on 'ShiftKey + Enter' and 'AltKey + Enter'
          if (!$event.shiftKey && !$event.altKey) {
            // Enter key should prevent default behavior and
            // add value to the list if it is an array.
            if ($scope.prop.isArray) {
              $scope.prop.updateArray($event);
              $event.preventDefault();
            }
          } // To support new line character for 'AltKey + Enter'


          if ($event.altKey) {
            $scope.prop.dbValue += '\n';
          }
        } else if ($event.keyCode === _kcUndo && $event.ctrlKey && $scope.prop.value === $scope.prop.dbValue) {
          // Fix to IE undo bug. Do not undo if text has not been changed from original.
          $event.preventDefault();
        }
      };
      /**
       * Bound via 'ng-blur' on the 'textarea' element and called on called on textarea 'blur' (i.e. they leave
       * the field)
       *
       * @memberof TextAreaValController
       */


      $scope.blurTextAreaFunction = function ($event) {
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
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-text-area-val.directive.html'
    };
  }]);
});