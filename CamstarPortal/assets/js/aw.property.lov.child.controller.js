"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/aw.property.lov.child.controller
 */
define(['app', 'jquery', 'js/uwListService'], function (app, $) {
  'use strict';
  /**
   * Controller for {@link NgElementDirectives.aw-property-lov-child} directive.
   *
   * @member awPropertyLovChildController
   * @memberof NgControllers
   */

  app.controller('awPropertyLovChildController', ['$scope', 'uwListService', function ($scope, uwListSvc) {
    // lov data will be held here
    $scope.expanded = false;
    /**
     * Toggle lov expansion state on hlovs
     *
     * @memberof NgControllers.awPropertyLovChildController
     *
     * @param {Object} ev - TODO
     *
     * @param {Object} parentLovEntry - TODO
     */

    $scope.toggleChildren = function (ev, parentLovEntry) {
      ev.stopPropagation();
      parentLovEntry.expanded = typeof parentLovEntry.expanded === 'undefined' ? true : !parentLovEntry.expanded;

      if (parentLovEntry.expanded) {
        parentLovEntry.indicator = 'expanded'; // if first click, also fetch initial vals

        if (typeof parentLovEntry.children === 'undefined') {
          parentLovEntry.children = parentLovEntry.getChildren();
        }
      } else {
        parentLovEntry.indicator = '';
      }
    };
    /**
     * @memberof NgControllers.awPropertyLovChildController
     *
     * @param {Object} lovEntry -
     */


    $scope.setLovEntry = function (lovEntry, $event) {
      // only allow selection of leaf nodes
      if (lovEntry.hasChildren) {
        $scope.toggleChildren($event, lovEntry);
      } else {
        $('body').off('click touchstart', uwListSvc.exitFieldHandler);
        var element = $($event.currentTarget).closest('.aw-jswidgets-lovParentContainer').find('.aw-jswidgets-choice');
        $scope.$parent.setLovEntry(lovEntry, element);
      }
    };
  }]);
});