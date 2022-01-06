"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Angular doesn't support ng-change on file input, so add custom directive to handle on file selection change.
 *
 * @module js/on-file-change.directive
 */
define(['app', 'jquery', 'lodash', 'js/browserUtils'], //
function (app, $, _, browserUtils) {
  'use strict';
  /**
   * Angular doesn't support ng-change on file input, so add custom directive to handle on file selection change.
   *
   * @example <input type="file" ng-model="file.fmsFile" ng-required="true" accept="{{typeFilter}}" name="fmsFile"
   *          on-file-change="updateFile"/>
   *
   * @member on-file-change
   * @memberof NgAttributeDirectives
   */

  app.directive('onFileChange', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link($scope, element, attrs, ngModel) {
        var onChangeHandler = $scope.$eval(attrs.onFileChange);

        if (browserUtils.isNonEdgeIE) {
          var oldValue = element.val();
          var newValue = '';

          var fileChanged = function fileChanged(event) {
            oldValue = newValue;

            if (element.val() === oldValue) {
              newValue = '';
            } else {
              newValue = element.val();
            }

            if (oldValue !== newValue) {
              element.val(newValue);
              $scope.$apply(function () {
                ngModel.$setViewValue(newValue);
                ngModel.$render();
              });

              if (onChangeHandler) {
                event.target.value = newValue;
                onChangeHandler(event);
              }
            }
          };

          element.bind('click', function (clickEvent) {
            $('body').on('focusin', function () {
              _.defer(function () {
                fileChanged(clickEvent);
              });

              $('body').off('focusin');
            });
          });
        } else {
          element.bind('change', function (event) {
            $scope.$apply(function () {
              ngModel.$setViewValue(element.val());
              ngModel.$render();
            });

            if (onChangeHandler) {
              onChangeHandler(event);
            }
          });
          element.bind('drop', function (event) {
            event.target.files = event.originalEvent.dataTransfer.files;
            element.trigger('change', event);
          });
          element.bind('click', function (event) {
            event.target.value = ''; // 'change' event is not fired on Chrome
            // call change handle to validate explicitly

            if (onChangeHandler) {
              onChangeHandler(event);
            }
          });
        }
      }
    };
  });
});