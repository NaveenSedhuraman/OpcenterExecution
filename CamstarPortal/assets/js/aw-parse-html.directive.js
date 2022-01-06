"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the 'aw-parse-html' directive used to parse URL text and replace them with actual links.
 *
 * @module js/aw-parse-html.directive
 */
define(['app', //
'js/sanitizer', 'js/appCtxService'], function (app) {
  'use strict';
  /**
   * Definition for the 'aw-parse-html' directive used to parse URL text and replace them with actual links.
   *
   * @member aw-parse-html
   * @memberof NgAttributeDirectives
   */

  app.directive('awParseHtml', //
  ['sanitizer', 'appCtxService', //
  function (sanitizer, appCtxService) {
    /**
     * @private
     */
    return {
      restrict: 'A',
      replace: true,
      scope: {
        displayVal: '<',
        isRichText: '<',
        renderingHint: '<'
      },
      link: function link($scope, $element) {
        $scope.$watchGroup([function _watchHighlighter() {
          var highlighter = appCtxService.ctx.highlighter;

          if (highlighter) {
            return highlighter.regEx;
          }
        }, 'displayVal'], function () {
          var parsedHtml = $scope.displayVal;
          var highlighter = appCtxService.ctx.highlighter;

          if (parsedHtml) {
            var isRichText = $scope.isRichText;

            if (!isRichText || isRichText && $scope.renderingHint) {
              // escape HTML string
              parsedHtml = sanitizer.htmlEscapeAllowEntities(parsedHtml, true, true);
            }
          }

          if (highlighter) {
            parsedHtml = parsedHtml.replace(highlighter.regEx, highlighter.style);
          }

          parsedHtml = !parsedHtml ? '' : parsedHtml;

          if ($element[0].innerHTML !== parsedHtml) {
            $element.html(parsedHtml);
          }
        });
      }
    };
  }]);
});