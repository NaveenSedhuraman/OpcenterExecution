"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw-tab-container.controller
 */
define(['app'], //
function (app) {
  'use strict';
  /**
   * Controller of aw-tab-container
   *
   * @memberof NgControllers
   * @member awTabContainerController
   */

  app.controller('awTabContainerController', ['$scope', function ($scope) {
    var self = this;
    $scope.tabs = null;

    if (!$scope.tabsModel) {
      $scope.tabsModel = [];
    }

    $scope.selectedObject = {};

    if ($scope.$parent && $scope.$parent.visibleTabs) {
      $scope.tabsModel = $scope.$parent.visibleTabs;
      $scope.selectedObject = $scope.$parent.selectedObject;
    }

    $scope.tabApi = null;

    if ($scope.tabContainerModel) {
      $scope.tabsModel = $scope.tabContainerModel;
    }

    if ($scope.callback) {
      $scope.tabApi = $scope.callback;
    }

    if ($scope.$parent && $scope.$parent.tabApi) {
      $scope.tabApi = $scope.$parent.tabApi;
    }

    $scope.webkitPrefix = '';

    if (navigator.userAgent.toLowerCase().indexOf('applewebkit') !== -1) {
      $scope.webkitPrefix = '-webkit-';
    }
    /**
     * @memberof NgControllers.awTabContainerController
     *
     * @param {Object} tabsModel -
     * @return {Void}
     */


    self.setData = function (tabsModel) {
      $scope.$apply(function () {
        $scope.tabsModel = tabsModel;
      });
    };
    /**
     * Method to be called from the TAB container
     *
     * @memberof NgControllers.awTabContainerController
     *
     * @param {NgTabItem} selectedTab -
     * @return {Void}
     */


    self.updateSelectedTab = function (selectedTab) {
      if (!$scope.selectedObject) {
        $scope.selectedObject = {};
      }

      if (selectedTab !== $scope.selectedObject.tab) {
        $scope.selectedObject.tab = selectedTab;

        if ($scope.updateSelectedTabById) {
          $scope.updateSelectedTabById(parseInt($scope.selectedObject.tab.pageId, 10));
        } else {
          if ($scope.$parent.updateSelectedTabById) {
            $scope.$parent.updateSelectedTabById(parseInt($scope.selectedObject.tab.pageId, 10));
          }
        }

        $scope.setSelectedTab();
      }
    }; // Event is fired when tab selection needs to be updated


    $scope.$on('NgTabSelectionUpdate', function (event, tab) {
      self.updateSelectedTab(tab);
      $scope.refreshTabsBar();
    });
  }]);
});