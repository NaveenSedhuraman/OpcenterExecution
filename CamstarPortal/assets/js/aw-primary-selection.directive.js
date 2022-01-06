"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-primary-selection.directive
 */
define(['app'], function (app) {
  'use strict';
  /**
   * Definition for the <aw-primary-selection> directive.
   *
   * @example <div aw-primary-selection></div>
   *
   * @member aw-primary-selection
   * @memberof NgElementDirectives
   */

  app.directive('awPrimarySelection', [function () {
    return {
      restrict: 'A',
      link: function link($scope) {
        $scope.$on('dataProvider.selectionChangeEvent', function (event, data) {
          // Set source to primary workarea
          data.source = 'primaryWorkArea';
        });
      }
    };
  }]);
});