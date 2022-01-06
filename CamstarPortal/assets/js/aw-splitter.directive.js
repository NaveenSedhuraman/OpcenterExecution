"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-splitter.directive
 */
define(['app', //
'js/awSplitterService'], //
function (app) {
  'use strict';
  /**
   * Define a splitter between two elements.
   * <P>
   * Defines a standard splitter control between two adjacent elements. A horizontal splitter or vertical splitter can
   * be placed.
   *
   * @example Splitter not between <aw-row> or <aw-column> elements
   * @example <aw-splitter min-size-area-1="317" min-size-area-2="300" direction="vertical"></aw-splitter>
   *
   * @example Horizontal Splitter
   * @example <aw-row height="6"></aw-row>
   * @example <aw-splitter></aw-splitter>
   * @example <aw-row height="6"></aw-row>
   *
   * @example Vertical Splitter
   * @example <aw-column width="6"></aw-column>
   * @example <aw-splitter></aw-splitter>
   * @example <aw-column width="6"></aw-column>
   *
   * @memberof NgDirectives
   * @member aw-splitter
   */

  app.directive('awSplitter', ['awSplitterService', '$timeout', function (splitterSvc, $timeout) {
    return {
      restrict: 'E',
      scope: {
        minSize1: '@?',
        // optional
        minSize2: '@?',
        // optional
        direction: '@?',
        // optional
        isPrimarySplitter: '@?' // optional

      },
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-splitter.directive.html',
      link: {
        post: function post($scope, elements, attributes) {
          $timeout(function () {
            if (attributes.isprimarysplitter === 'true') {
              $scope.$on('viewModeChanged', function () {
                splitterSvc.initSplitter(elements, attributes);
              });
            }

            splitterSvc.initSplitter(elements, attributes);
          });
        }
      }
    };
  }]);
});