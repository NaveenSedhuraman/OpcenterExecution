"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the <aw-property-array-val> directive.
 *
 * @module js/aw-property-array-val.directive
 */
define(['app', 'jquery', //
'js/uwMaxRowService', 'js/aw.property.array.val.controller', 'js/aw-property-array-edit-val.directive', 'js/aw-property-image.directive'], function (app, $) {
  'use strict';
  /**
   * Definition for the <aw-property-array-val> directive.
   *
   * @example TODO
   *
   * @member aw-property-array-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyArrayVal', //
  ['$timeout', 'uwMaxRowService', //
  function ($timeout, maxRowSvc) {
    return {
      restrict: 'E',
      scope: {
        // 'prop' is defined in the parent (i.e. controller's) scope
        prop: '=',
        inTableCell: '@'
      },
      controller: 'awPropertyArrayValController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-array-val.directive.html',
      link: function link($scope, $element) {
        if (!$scope.prop) {
          return;
        }

        $scope.editArrayTimer = $timeout(function () {
          var arrayHeight = maxRowSvc._calculateArrayHeight($element, $scope.prop.maxRowCount);

          if (arrayHeight) {
            $scope.arrayHeight = arrayHeight;
          }
        }); // This will get removed once IE/Edge start supporting focus-within CSS pseudo selector

        var elementToFind = '.aw-jswidgets-arrayWidgetContainer';
        var classToToggle = 'aw-jswidgets-arrayWidgetContainerFocused';
        $($element).focusin(function () {
          $(this).find(elementToFind).addClass(classToToggle);
        });
        $($element).focusout(function () {
          $(this).find(elementToFind).removeClass(classToToggle);
        });
        $scope.$on('$destroy', function () {
          $element.remove();
          $element.empty();
        });
      }
    };
  }]);
});