"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines the directive used to include an iframe within the HTML and use binding to build the URL to be used as its
 * source.
 *
 * @module js/aw-frame.directive
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Defines the directive used to include an iframe within the HTML and use binding to build the URL to be used as
   * its source.
   *
   * @example TODO
   *
   * @member aw-frame
   * @memberof NgElementDirectives
   */

  app.directive('awFrame', ['$sce', function ($sce) {
    return {
      restrict: 'E',
      scope: {
        // 'url' is defined as an attribute on this directive's html tag
        url: '@'
      },
      link: function link($scope, $element, attrs) {
        var width = attrs.width || '100%';
        $element.css('width', width);
        var height = attrs.height || '100%';
        $element.css('height', height);
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-frame.directive.html',
      controller: ['$scope', function ($scope) {
        $scope.getValidUrl = function (inputUrl) {
          return $sce.trustAsResourceUrl(inputUrl);
        };
      }]
    };
  }]);
});