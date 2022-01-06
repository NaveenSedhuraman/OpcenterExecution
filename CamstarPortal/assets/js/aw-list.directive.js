"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display list of items
 *
 * @module js/aw-list.directive
 */
define(['app', //
'js/aw-list.controller', 'js/aw-virtual-repeat.controller', 'js/aw-transclude.directive', 'js/aw-list-command.directive', 'js/aw-icon.directive', 'js/aw-cell-command-bar.directive', 'js/aw-long-press.directive', 'js/aw-static-list-command.directive'], //
function (app) {
  'use strict';
  /**
   * Directive to display list of items
   *
   * @example <aw-list dataprovider="dataProvider"><div>Sample list item</div></aw-list>
   *
   * @member aw-list
   * @memberof NgElementDirectives
   */

  app.directive('awList', //
  [//
  function () {
    return {
      restrict: 'E',
      controller: 'awListController',
      transclude: true,
      scope: {
        dataprovider: '=',
        useVirtual: '@',
        fixedCellHeight: '@?',
        showDropArea: '@?',
        showContextMenu: '<?',
        isGroupList: '@?',
        hasFloatingCellCommands: '<?'
      },
      templateUrl: function templateUrl(elem, attrs) {
        if (attrs.fixedCellHeight) {
          return app.getBaseUrlPath() + '/html/aw-list.directive.html';
        }

        if (attrs.isGroupList === 'true') {
          return app.getBaseUrlPath() + '/html/aw-group-list.directive.html';
        }

        return app.getBaseUrlPath() + '/html/aw-static-list.directive.html';
      },
      link: function link($scope, element) {
        if ($scope.showDropArea !== undefined) {
          if ($scope.showDropArea === 'false') {
            element.find('.aw-widgets-droptable').removeClass('aw-widgets-droptable');
          }
        }

        if ($scope.dataprovider.selectionModel && !$scope.dataprovider.selectionModel.isSelectionEnabled()) {
          $scope.disableSelection = true;
        }
      }
    };
  }]);
  /**
   * Directive to support virtualization in cell list
   *
   * @example
   * <li aw-virtual-repeat="item in dataprovider"></li>
   *
   * @member aw-virtual-repeat
   * @memberof NgAttributeDirectives
   */

  app.directive('awVirtualRepeat', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      multiElement: true,
      transclude: 'element',
      priority: 1000,
      require: ['awVirtualRepeat', '^^awList'],
      terminal: true,
      controller: 'awVirtualRepeatController',
      // eslint-disable-next-line func-name-matching
      compile: function awVirtualRepeatCompile($element, $attrs) {
        var expression = $attrs.awVirtualRepeat;
        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
        var repeatName = match[1];
        var repeatListExpression = $parse(match[2]);
        return function awVirtualRepeatLink($scope, $element, $attrs, ctrl, $transclude) {
          ctrl[0].init(ctrl[1], $transclude, repeatName, repeatListExpression);
        };
      }
    };
  }]);
});