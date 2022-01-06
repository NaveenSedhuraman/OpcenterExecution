"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * @module js/aw.html.panel.property.controller
 */
define(['app', //
'js/dateTimeService', 'js/localeService', 'js/uwPropertyService'], //
function (app) {
  'use strict';
  /**
   * Defines the controller for <aw-property> directives in an HtmlPanel.
   *
   * @memberof NgControllers
   * @member awHtmlPanelPropertyController
   */

  app.controller('awHtmlPanelPropertyController', //
  ['$scope', '$attrs', '$element', 'dateTimeService', 'localeService', 'uwPropertyService', //
  function ($scope, $attrs, $element, dateTimeSvc, localeSvc, uwPropertySvc) {
    /**
     * Initialize the properties and API objects necessary to manage the given viewModelProperty.
     *
     * @param {ViewModelProperty} propIn - Property to initialize.
     */
    function initPropInfo(propIn) {
      /**
       * Setup localized 'dateValue' & 'timeValue' text based on the current 'dbValue' Date Object.
       */
      if (propIn.type === 'DATE' && propIn.dateApi) {
        propIn.dateApi.dateValue = dateTimeSvc.formatDate(propIn.dbValue);
        propIn.dateApi.timeValue = dateTimeSvc.formatTime(propIn.dbValue);
      }

      if (propIn.type === 'BOOLEAN' || propIn.type === 'BOOLEANARRAY') {
        localeSvc.getTextPromise().then(function (localTextBundle) {
          propIn.propertyRadioTrueText = localTextBundle.RADIO_TRUE;
          propIn.propertyRadioFalseText = localTextBundle.RADIO_FALSE;
          /**
           * Handles setting of custom labels and vertical alignment attributes when directives are used
           * natively
           */

          if (propIn.radioBtnApi && propIn.radioBtnApi.customTrueLabel) {
            propIn.propertyRadioTrueText = propIn.radioBtnApi.customTrueLabel;
          }

          if (propIn.radioBtnApi && propIn.radioBtnApi.customFalseLabel) {
            propIn.propertyRadioFalseText = propIn.radioBtnApi.customFalseLabel;
          }

          if (propIn.radioBtnApi && propIn.radioBtnApi.vertical) {
            propIn.vertical = propIn.radioBtnApi.vertical;
          }
        });
      }

      if (propIn.type === 'STRING' || propIn.type === 'STRINGARRAY') {
        propIn.inputType = 'text';
      }
    }

    if ($scope.prop) {
      initPropInfo($scope.prop);
    } else {
      /**
       * Watch for when/if the property becomes valid later.
       */
      var lsnr = $scope.$watch('prop', function _watchProp(prop) {
        if (prop) {
          initPropInfo(prop);
          lsnr();
        }
      });
    }
    /**
     * Called by various templates to delegate an ng-change directive.
     *
     * @memberof NgControllers.awHtmlPanelPropertyController
     *
     * @return {Void}
     */


    $scope.changeFunction = function () {
      var uiProperty = $scope.prop;
      var type = uiProperty.type;

      if (type === 'DATE' || type === 'DATEARRAY') {
        uiProperty.dbValue = new Date(uiProperty.dateApi.dateValue);
        uiProperty.dateApi.dateObject = new Date(uiProperty.dateApi.dateValue);
      }

      uwPropertySvc.updateViewModelProperty(uiProperty);
    };
    /**
     * @memberof NgControllers.awHtmlPanelPropertyController
     *
     * @param {Number} index -
     *
     * @return {Void}
     */


    $scope.onClick = function (index) {
      $scope.newValue = $scope.prop.displayValues[index];
    };
    /**
     * @memberof NgControllers.awHtmlPanelPropertyController
     *
     * @param {Number} index -
     *
     * @return {Void}
     */


    $scope.onRemove = function (index) {
      $scope.prop.displayValues.splice(index, 1);
      $scope.prop.dbValue.splice(index, 1);
      $scope.changeFunction();
    };

    $scope.$on('my-sorted', function (ev, val) {
      $scope.prop.displayValues.splice(val.to, 0, $scope.prop.displayValues.splice(val.from, 1)[0]);
      $scope.prop.dbValue.splice(val.to, 0, $scope.prop.dbValue.splice(val.from, 1)[0]);
      $scope.changeFunction();
    });
    /**
     * @memberof NgControllers.awHtmlPanelPropertyController
     *
     * @return {Void}
     */

    $scope.addValue = function () {
      $scope.prop.displayValues.push($scope.prop.newValue);

      if ($scope.prop.type === 'DATEARRAY') {
        $scope.prop.dbValue.push(new Date($scope.prop.newValue));
      } else {
        $scope.prop.dbValue.push($scope.prop.newValue);
      }

      $scope.prop.newValue = '';
      $scope.changeFunction();
    };

    $scope.$on('$destroy', function () {
      // Destroying all watch listeners
      $element.remove();
    });
  }]);
});