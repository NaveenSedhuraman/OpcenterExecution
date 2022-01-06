"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-repeat.directive
 */
define(['app'], function (app) {
  'use strict';
  /**
   *
   * @example <aw-button aw-repeat='item : items'></aw-button>
   *
   * @member aw-repeat
   * @memberof ngRepeatDirective
   */

  app.directive('awRepeat', ['ngRepeatDirective', function (ngRepeatDirective) {
    var ngRepeat = ngRepeatDirective[0];
    return {
      transclude: ngRepeat.transclude,
      priority: ngRepeat.priority,
      terminal: ngRepeat.terminal,
      restrict: ngRepeat.restrict,
      multiElement: ngRepeat.multiElement,
      $$tlb: true,
      compile: function compile($element, $attr) {
        var expression = $attr.awRepeat.trim();

        if (expression.match(/([a-z]|[A-Z]|$|_).*:.*/g)) {
          expression = expression.replace(':', ' in ');
        } else {
          throw 'Invalid expression:' + expression;
        }

        $attr.ngRepeat = expression;
        return ngRepeat.compile.apply(ngRepeat, arguments);
      }
    };
  }]);
});