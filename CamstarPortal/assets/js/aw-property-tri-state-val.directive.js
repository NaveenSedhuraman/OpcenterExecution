"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-tri-state-val.directive) directive.
 *
 * @module js/aw-property-tri-state-val.directive
 */
define(['app', //
'js/uwPropertyService', 'js/aw-property-label.directive', 'js/aw-property-lov-val.directive'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-tri-state-val.directive) directive.
   *
   * @example <aw-property-tri-state-val.directive prop="prop" />
   *
   * @member aw-property-tri-state-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyTriStateVal', //
  [function () {
    return {
      restrict: 'E',
      scope: {
        prop: '='
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-tri-state-val.directive.html',
      link: function link($scope) {
        $scope.prop.defaultSelectionValue = $scope.defaultSelectionValue; // if LOV entries were not provided, create one

        if (!$scope.prop.hasLov) {
          $scope.prop.lovApi = {};
          $scope.prop.propertyLabelDisplay = 'NO_PROPERTY_LABEL';

          $scope.prop.lovApi.getInitialValues = function (filterStr, deferred) {
            var listModelTrue = {
              propDisplayValue: $scope.prop.propertyRadioTrueText,
              propInternalValue: true,
              propDisplayDescription: '',
              hasChildren: false,
              children: {},
              sel: false
            };
            var listModelFalse = {
              propDisplayValue: $scope.prop.propertyRadioFalseText,
              propInternalValue: false,
              propDisplayDescription: '',
              hasChildren: false,
              children: {},
              sel: false
            };
            var lovEntries = [];
            lovEntries.push(listModelTrue);
            lovEntries.push(listModelFalse);
            return deferred.resolve(lovEntries);
          };

          $scope.prop.lovApi.getNextValues = function (deferred) {
            deferred.resolve(null);
          };

          $scope.prop.lovApi.validateLOVValueSelections = function (lovEntries) {// eslint-disable-line no-unused-vars
            // Either return a promise or don't return anything. In this case, we don't want to return anything
          };

          $scope.prop.hasLov = true;
          $scope.prop.isSelectOnly = true;
        }
      }
    };
  }]);
});