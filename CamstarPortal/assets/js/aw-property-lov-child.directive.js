"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * TODO
 *
 * @module js/aw-property-lov-child.directive
 */
define(['app', 'angular', //
'js/aw.property.lov.child.controller', 'js/aw-property-image.directive'], //
function (app, ngModule) {
  'use strict';
  /**
   * TODO
   *
   * @example TODO
   *
   * @member aw-property-lov-child
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyLovChild', //
  ['$compile', //
  function ($compile) {
    return {
      restrict: 'E',
      scope: {
        // prop comes from the parent controller's scope
        lovEntry: '='
      },
      controller: 'awPropertyLovChildController',
      link: function link(scope, $element) {
        // if the child value has children of its own, insert dynamically to
        // avoid recursion in the template
        if (scope.lovEntry.hasChildren) {
          var lovChildrenHtml = ngModule.element('<ul ng-show="lovEntry.expanded">' + //
          '<li class="aw-jswidgets-nestingListItem" ng-repeat="child in lovEntry.children">' + //
          '<aw-property-lov-child lov-entry="child"/></li></ul>');
          $element.append(lovChildrenHtml);
          $compile(lovChildrenHtml)(scope);
        }
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-lov-child.directive.html'
    };
  }]);
});