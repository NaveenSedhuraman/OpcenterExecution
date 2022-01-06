"use strict";

// Copyright 2019 Siemens AG

/*global
 define
 */

/* eslint-disable valid-jsdoc */

/**
 * A module exposing a custom element for a home page container.
 * @module "js/mom-homepage.directive"
 */
define(['app', //
'js/aw-scrollpanel.directive', 'js/aw-row.directive', 'js/aw-command-bar.directive', 'js/appCtxService'], //
function (app) {
  'use strict';
  /**
   * A custom element for a home page container.
   * @typedef "mom-homepage"
   * @implements {Element}
   */

  app.directive('momHomepage', ['appCtxService', '$timeout', function (appCtxService, $timeout) {
    return {
      restrict: 'E',
      scope: {},
      transclude: true,
      link: function link(scope, element) {
        // Detect scrolling
        var manageScrolling = function manageScrolling(data) {
          if (data.currentTarget.scrollTop > 100 && !appCtxService.ctx.momHomePageScrolledDown) {
            $timeout(function () {
              appCtxService.registerCtx('momHomePageScrolledDown', true);
            }, 10);
          } else if (data.currentTarget.scrollTop < 100 && appCtxService.ctx.momHomePageScrolledDown) {
            $timeout(function () {
              appCtxService.registerCtx('momHomePageScrolledDown', false);
            }, 10);
          }
        };

        var container = element.find('.aw-layout-row > .mom-homepage-container')[0];
        container.addEventListener('scroll', manageScrolling, false);
        scope.$on('$destroy', function () {
          container.removeEventListener('scroll', manageScrolling);
        });
      },
      controller: [function () {}],
      templateUrl: app.getBaseUrlPath() + '/html/mom-homepage.html'
    };
  }]);
});