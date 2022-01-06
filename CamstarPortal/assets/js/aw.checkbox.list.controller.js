"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/aw.checkbox.list.controller
 */
define(['app', 'angular', 'lodash', 'js/logger', 'js/uwLovDataService', 'js/dateTimeService', 'js/uwPropertyService', 'js/uwListService'], function (app, ngModule, _, logger) {
  'use strict';
  /**
   * Using controller for prop update currently, but consider passing an update f(x) from the parent controller using &
   *
   * @memberof NgControllers
   * @member awCheckboxListController
   *
   * @param {Object} $scope - The AngularJS data context node this controller is being created on.
   * @param {Element} $element - The DOM Element that contains this aw-checkbox-list.
   * @param {Object} $filter - filter
   * @param {uwLovDataService} uwLovDataSvc - required service
   * @param {dateTimeService} dateTimeSvc - required service
   * @param {uwPropertyService} uwPropertySvc - required service
   * @param {uwListService} uwListSvc - required service
   */

  app.controller('awCheckboxListController', ['$scope', '$element', '$filter', 'uwLovDataService', 'dateTimeService', 'uwPropertyService', 'uwListService', function ($scope, $element, $filter, uwLovDataSvc, dateTimeSvc, uwPropertySvc, uwListSvc) {
    var uiProperty = $scope.prop;
    uiProperty.uiOriginalValue = uiProperty.uiValue;
    uiProperty.dbOriginalValue = uiProperty.dbValue;
    uiProperty.selectedLovEntries = [];
    $scope.lovEntries = [];
    $scope.selectedPHolders = [];
    $scope.expanded = false;
    $scope.moreValuesExist = true;
    $scope.lovInitialized = false;
    /**
     * TRUE if we are NOT waiting for any values to be returned by the server.
     *
     * @memberof NgControllers.awCheckboxListController
     * @private
     */

    $scope.queueIdle = true;
    $scope.dropPosition = 'below';
    $scope.myCtrl = this;
    $scope.myCtrl.$parent = $element;
    $scope.dropDownVerticalAdj = 0;
    $scope.listFilterText = '';
    /**
     * Toggle the expand/collapse state of the lov list.
     * <P>
     * Note: Called by (aw-property-lov-val) directive template to delegate an 'ng-click' on the text box
     * itself.
     *
     * @memberof NgControllers.awCheckboxListController
     */

    $scope.toggleDropdown = function () {
      if ($scope.expanded) {
        // if expanded, listen for click outside of control
        uwListSvc.collapseList($scope);
      } else {
        /**
         * For now, do this regardless of whether we already have value data - this is necessary to deal
         * with interdep lovEntries.
         * <P>
         * In the future, we can improve this for efficiency with something like: if (
         * $scope.moreValuesExist && !$scope.lovInitialized )
         */
        $scope.requestInitialLovEntries();
        $scope.$evalAsync(function () {
          uwListSvc.expandList($scope, $element);
        });
      }
    };
    /**
     * Called by the 'uwListService' when exiting an LOV choice field.
     *
     * @memberof NgControllers.awCheckboxListController
     *
     */


    $scope.handleFieldExit = function () {// Nothing to do
    };
    /**
     * @memberof NgControllers.awCheckboxListController
     *
     * @return {String} Class name for showing or hiding the loading animation based on lov state
     * Also triggers request for more values when filtered list is small and incomplete.
     */


    $scope.loadingClass = function () {
      var loadingClass = '';

      if ($scope.queueIdle) {
        loadingClass = 'hidden';
      }

      if ($scope.filtered && $scope.filtered.length < 10) {
        // if after filtering, we have less than 10 results, check for more
        $scope.requestNextLovEntries();
      }

      return loadingClass;
    };
    /**
     * @memberof NgControllers.awCheckboxListController
     *
     * @return {String} Class name for filter field based on number of vals (show filter when we
     *         have > 20 vals)
     */


    $scope.filterClass = function () {
      var filterClass = 'hidden';

      if ($scope.selectedPHolders.length + $scope.lovEntries.length > 20) {
        filterClass = '';
      }

      return filterClass;
    };
    /**
     * Function to update the button text with selected values
     * ...not used... uiValue truncates after 4 vals though, so we may want this?
     *
     * @memberof NgControllers.awCheckboxListController
     *
     * @return {String} A comma separated string containing the 'aggregate' of all currently
     *         selected items.
     */


    $scope.getDisplayVal = function () {
      var displayValStr = '';
      $scope.getSelVals().forEach(function (lov) {
        if (lov.sel) {
          displayValStr += displayValStr === '' ? '' : ', ';
          displayValStr += lov.propDisplayValue;
        }
      });
      return displayValStr;
    };
    /**
     * Function to get the js object for the selected vals
     *
     * @memberof NgControllers.awCheckboxListController
     *
     * @return {LOV[]} An array containing the LOV object of all currently selected items.
     */


    $scope.getSelVals = function () {
      var jsonVals = [];
      ngModule.forEach($scope.selectedPHolders.concat($scope.lovEntries), function (lov) {
        if (lov.sel) {
          jsonVals.push(lov);
        }
      });
      return jsonVals;
    };
    /**
     * Get the initial values.
     *
     * @memberof NgControllers.awCheckboxListController
     */


    $scope.requestInitialLovEntries = function () {
      $scope.$evalAsync(function () {
        $scope.lovEntries = [];
        $scope.moreValuesExist = true;
        $scope.queueIdle = false;
        $scope.lovInitialized = true;
      }); // if the lovApi isn't initialized, see if we can do so now from the prop's dataProvider
      // might be better to do this sooner (viewModelProcessingFactory)

      uwLovDataSvc.initLovApi($scope);
      uwLovDataSvc.promiseInitialValues($scope.prop.lovApi, $scope.listFilterText, $scope.prop.propertyName).then($scope.processInitialLovEntries, $scope.processError);
    };
    /**
     * Get the next set of vals (bound to 'aw-when-scrolled' attribute directive).
     *
     * @memberof NgControllers.awCheckboxListController
     */


    $scope.requestNextLovEntries = function () {
      /**
       * This can get called from multiple places.... which would be fine except that the fx implementation
       * will return duplicate values on sequential requests... therefore, throttle here...
       */
      if ($scope.lovInitialized && $scope.moreValuesExist && $scope.queueIdle) {
        $scope.queueIdle = false;
        uwLovDataSvc.promiseNextValues($scope.prop.lovApi, $scope.prop.propertyName).then($scope.processLovEntries, $scope.processError);
      }
    };
    /**
     * Move the LOV information from the values returned from the SOA request into the property's local LOV
     * entry array.
     *
     * @memberof NgControllers.awCheckboxListController
     *
     * @param {ObjectArray} lovEntries - Array of LOV Entry objects returned from the SOA service.
     *                                       entries have .propInternalValue and .propDisplayValue
     */


    $scope.processInitialLovEntries = function (lovEntries) {
      // clear lovEntries to avoid racing filter results...
      $scope.lovEntries = [];
      $scope.selectedPHolders = []; // generate place-holder array for selected values that may or may not be loaded

      for (var inx = 0; inx < uiProperty.dbValue.length; inx++) {
        var disp = uiProperty.uiValues[inx] || uiProperty.displayValues[inx] || uiProperty.dbValue[inx];
        var selectedVal = {
          propInternalValue: uiProperty.dbValue[inx],
          propDisplayValue: disp,
          sel: true
        }; // $scope.addWatch( selectedVal );

        $scope.selectedPHolders.push(selectedVal); // ssu add console here for showcase dbg
      }

      $scope.processLovEntries(lovEntries);
    };
    /**
     * @memberof NgControllers.awCheckboxListController
     *
     * @param {ObjectArray} lovEntries - Array of LOV Entry objects returned from the SOA service.
     */


    $scope.processLovEntries = function (lovEntries) {
      $scope.queueIdle = true;

      if (lovEntries && lovEntries.length === 0) {
        // we have all the vals now...
        $scope.moreValuesExist = false;
      } else if (lovEntries && lovEntries.moreValuesExist !== undefined) {
        $scope.moreValuesExist = lovEntries.moreValuesExist;
      } // for static type do client side filtering


      var lovEntriesFinal = lovEntries;

      if ($scope.prop.lovApi.type === 'static') {
        var filterText = $scope.listFilterText ? $scope.listFilterText.toLowerCase() : $scope.listFilterText;
        lovEntriesFinal = $filter('filter')(lovEntriesFinal, function (value) {
          if (filterText) {
            var prodisplayValue = value.propDisplayValue ? value.propDisplayValue.toLowerCase() : '';
            var prodisplayDescValue = value.propDisplayDescription ? value.propDisplayDescription.toLowerCase() : '';
            return _.includes(prodisplayValue, filterText) || _.includes(prodisplayDescValue, filterText);
          }

          return true;
        });
      }

      ngModule.forEach(lovEntriesFinal, function (lovEntry) {
        var skip = false; // if the new lovEntry is in place-holder array, don't append it to the list

        for (var jnx = 0; jnx < $scope.selectedPHolders.length; jnx++) {
          if ($scope.selectedPHolders[jnx].propInternalValue === lovEntry.propInternalValue) {
            skip = true; // replace place-holder name with lovEntry data

            $scope.selectedPHolders[jnx].propDisplayValue = lovEntry.propDisplayValue;
            $scope.selectedPHolders[jnx].propDisplayDescription = lovEntry.propDisplayDescription;
            break;
          }
        }

        if (!skip) {
          // resetting selected flag to false for static type
          if ($scope.prop.lovApi.type === 'static') {
            lovEntry.sel = false;
            lovEntry.attn = false;
          } // append new value to model


          var lovDbValue = lovEntry.propInternalValue;

          if (uiProperty.type === 'DATE' || uiProperty.type === 'DATEARRAY') {
            lovDbValue = dateTimeSvc.getJSDate(lovEntry.propInternalValue);
            lovEntry.propDisplayValue = dateTimeSvc.formatSessionDateTime(lovDbValue);
            var result = dateTimeSvc.compare(uiProperty.dbValue, lovDbValue);

            if (result === 0) {
              lovEntry.sel = true;
              lovEntry.attn = true;
              lovEntriesFinal[0].attn = false;
            } // uiPropertyService still holds on to old values which causes the values to be retained, so jsu make sure we are
            // clean on uiProperty

          } else if (uiProperty.dbValue !== undefined) {
            if (uiProperty.dbValue.length === 0) {
              uiProperty.newDisplayValues = [];
              uiProperty.newValue = [];
              uiProperty.uiValue = [];
            }

            for (var inx = 0; inx < uiProperty.dbValue.length; inx++) {
              if (uiProperty.dbValue[inx] === lovDbValue) {
                // retains the selection of LOV entries in checkboxlist, the check mark is retained here
                lovEntry.sel = true;
                lovEntry.attn = true;
                lovEntriesFinal[0].attn = false;
              }
            }
          }

          $scope.lovEntries.push(lovEntry);
        }
      });
    };
    /**
     * Call this if there is an error calling our service
     *
     * @memberof NgControllers.awCheckboxListController
     *
     * @param {String} reason -
     */


    $scope.processError = function (reason) {
      // placeholder function. do nothing; error should already be handled.
      $scope.queueIdle = true;
      logger.error('error: ' + reason);
    }; // update list widget when underlying checkbox changes...


    $scope.updateArray = function (lovEntry) {
      // two possibilities
      // 1. reset the prop based on the selected vals (original cblov approach)
      // 2. append / subtract current lovEntry only (like array controller does)
      // going with approach 1 here
      if (!lovEntry.propInternalValue && !lovEntry.propDisplayValue && !lovEntry.isEmptyEntry) {
        return;
      }

      var db = [];
      var display = [];
      var dispValsModel = [];
      $scope.getSelVals().forEach(function (val) {
        db.push(val.propInternalValue);
        display.push(val.propDisplayValue);
        dispValsModel.push({
          displayValue: val.propDisplayValue,
          selected: false
        });
      });
      uiProperty.dbValue = db;
      uwPropertySvc.updateDisplayValues(uiProperty, display);
      uwPropertySvc.updateViewModelProperty(uiProperty);
      uiProperty.dirty = true;
    };

    $scope.$on('$destroy', function () {
      $scope.prop = null;
      $scope.lovEntries = [];
      $scope.selectedPHolders = [];
      $element.remove();
      $element.empty();
    });
  }]);
});