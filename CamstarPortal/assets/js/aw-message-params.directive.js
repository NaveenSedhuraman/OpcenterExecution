"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to evaluate message and apply message params based on the context provided
 *
 * @module js/aw-message-params.directive
 */
define(['app', 'js/messagingService'], //
function (app) {
  'use strict';
  /**
   * Directive to evaluate message and apply message params based on the context provided
   *
   * @example <aw-message-params context="context" params="params" message="msg"></aw-partial-error>
   *
   * @member aw-message-params
   * @memberof NgElementDirectives
   */

  app.directive('awMessageParams', ['messagingService', function (messagingSvc) {
    return {
      restrict: 'E',
      scope: {
        context: '=',
        params: '=',
        message: '@'
      },
      template: '<div>{{localizedMessage}}</div>',
      link: function link($scope) {
        if ($scope.message) {
          $scope.localizedMessage = messagingSvc.applyMessageParams($scope.message, $scope.params, $scope.context);
        }
      }
    };
  }]);
});