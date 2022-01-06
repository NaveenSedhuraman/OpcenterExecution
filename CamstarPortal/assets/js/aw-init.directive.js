"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-init.directive
 */
define(['app'], function (app) {
  'use strict';
  /**
   * The awInit directive allows us to evaluate an expression in the current scope. <br>
   * Note: awInit is a replacement of {@angular's ngInit}
   *
   * @example <aw-div aw-init='maxSize=3'></aw-div>
   *
   * @member aw-init
   * @memberof NgAttributeDirectives
   */

  app.directive('awInit', [function () {
    return {
      restrict: 'A',
      priority: 450,
      // same as ngInit
      compile: function compile() {
        return {
          pre: function pre(scope, element, attrs) {
            scope.$eval(attrs.awInit);
          }
        };
      }
    };
  }]);
});