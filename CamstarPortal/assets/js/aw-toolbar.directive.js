"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * The ui element provides a toolbar which will have a two slots (anchor) to plug commands.
 * @module js/aw-toolbar.directive
 */
define(['app', 'js/aw-command-bar.directive'], //
function (app) {
  'use strict';
  /**
   * @example <aw-toolbar first-anchor="topSlot" second-anchor="bottomSlot" orientation="VERTICAL">
   * @attribute firstAnchor : first slot to hook commands.
   * @attribute secondAnchor : second slot to hook commands.
   * @attribute orientation: hint to layout the toolbar, it takes one of the values ['VERTICAL','HORIZONTAL']. By default it layouts the toolbar horizontally.
   * @attribute reverse: Whether to reverse the order of the commands. Reverse if directive has "reverse" attribute and it is not
   * explicitly false.
   * @attribute showCommandLabels: If true show labels under the commands.
   * @attribute context: context.
   * @member aw-toolbar
   * @memberof NgElementDirectives
   */

  app.directive('awToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        firstAnchor: '@',
        secondAnchor: '@',
        orientation: '@?',
        reverse: '@?',
        reverseSecond: '@?',
        showCommandLabels: '=?',
        context: '=?'
      },
      replace: true,
      templateUrl: app.getBaseUrlPath() + '/html/aw-toolbar.directive.html',
      link: function link(scope, element, attrs) {
        scope.isReverse = attrs.hasOwnProperty('reverse') && scope.reverse !== 'false';
        scope.isReverseSecond = attrs.hasOwnProperty('reverseSecond') ? attrs.hasOwnProperty('reverseSecond') && scope.reverseSecond !== 'false' : scope.isReverse;
        scope.orientation = scope.orientation === 'VERTICAL' ? 'VERTICAL' : 'HORIZONTAL';
      }
    };
  }]);
});