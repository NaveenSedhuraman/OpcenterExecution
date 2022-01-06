"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to perform action on enter
 *
 * @module js/aw-enter-key.directive
 */
define(['app', 'js/viewModelService'], function (app) {
  'use strict'; // eslint-disable-next-line valid-jsdoc

  /**
   * Directive to perform action on enter key
   *
   * @example aw-enter-key="<Name of action>"
   *
   * @member aw-enter-key
   * @memberof NgAttributeDirectives
   */

  app.directive('awEnterKey', ['viewModelService', function (viewModelSvc) {
    return function ($scope, $element, attrs) {
      $element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          $scope.$evalAsync(function () {
            var declViewModel = viewModelSvc.getViewModel($scope, true);
            viewModelSvc.executeCommand(declViewModel, attrs.awEnterKey, $scope);
          });
          event.preventDefault();
        }
      });
    };
  }]);
});