"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/enable-when.directive
 */
define(['app', 'angular'], //
function (app, ngModule) {
  'use strict';
  /**
   * Attribute Directive to change the enablement of an element based on a condition *
   *
   * @example <aw-button action="submit" enable-when="someCondition">Submit</aw-button>
   *
   * @member enable-when
   * @memberof NgAttributeDirectives
   */

  app.directive('enableWhen', function () {
    return {
      restrict: 'A',
      link: function link(scope, element, att) {
        var disableTabForFocusableElements = function disableTabForFocusableElements(value) {
          var elems = element.find('input[type="text"], button, textarea, a, label:empty, span:empty');

          if (value === false) {
            elems.prop('tabindex', '-1');
          } else if (value === true) {
            elems.prop('tabindex', '0');
          }
        };
        /**
         * Sync 'prop'(viewModelProperty, if available) with element's enabled/disabled state.
         * @param element: the element which may have prop (viewModelProperty)
         * @param isEnabled: true or false
         */


        var syncPropState = function syncPropState(element, isEnabled) {
          var ele = ngModule.element(element);
          var scope = ele.scope();

          if (scope && scope.prop && scope.prop.isEnabled !== undefined) {
            scope.prop.isEnabled = isEnabled;
          }
        };

        scope.$watch(att.enableWhen, function (value) {
          var ele = ngModule.element(element);
          /* to add disable class in first div element which is present inside the custom tag
          becasue in chrome, opacity doesn't work as the custom tag width and height is auto * auto */

          var firstDiv = ele.find('div,input').first();

          if (value === false) {
            ele.prop('disabled', true);
            ele.addClass('disabled');

            if (firstDiv.length === 1) {
              firstDiv.addClass('disabled');
              syncPropState(firstDiv, value);
            }
          } else if (value === true) {
            ele.prop('disabled', false);
            ele.removeClass('disabled');

            if (firstDiv.length === 1) {
              firstDiv.removeClass('disabled');
              syncPropState(firstDiv, value);
            }
          }

          disableTabForFocusableElements(value);
        }); // to remove keyboard focus, tabindex must be set to -1 to prevent focusing the disabled element using "tab" key

        scope.$watch(function () {
          return element.find('input[type="text"], button, textarea, a, label:empty, span:empty').length;
        }, function () {
          scope.$evalAsync(function () {
            disableTabForFocusableElements(att.enableWhen);
          });
        });
      }
    };
  });
});