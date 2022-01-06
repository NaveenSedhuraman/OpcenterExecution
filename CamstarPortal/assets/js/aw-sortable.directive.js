"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-sortable) directive.
 *
 * @module js/aw-sortable.directive
 */
define(['app', 'angular'], //
function (app, ngModule) {
  'use strict';
  /**
   * Definition for the (aw-sortable) directive.
   *
   * @example TODO
   *
   * @member aw-sortable
   * @memberof NgAttributeDirectives
   */

  app.directive('awSortable', function () {
    return {
      restrict: 'A',
      link: function link(scope, $element) {
        $element.sortable({
          revert: true,
          handle: 'button',
          cancel: ''
        });
        $element.disableSelection();
        $element.on('sortdeactivate', function (event, ui) {
          var from = ngModule.element(ui.item).scope().$index;
          var to = $element.children().index(ui.item);

          if (to >= 0) {
            scope.$apply(function () {
              if (from >= 0) {
                scope.$emit('my-sorted', {
                  from: from,
                  to: to
                });
              }
            });
          }
        });
      }
    };
  });
});