"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Definition for the (aw-datebox) directive.
 *
 * @module js/aw-datebox.directive
 */
define(['app', 'angular', 'jquery', 'js/logger', 'js/dateTimeService', 'js/uwUtilService'], function (app, ngModule, $, logger) {
  'use strict';
  /**
   * Definition for the (aw-datebox) directive.
   * <P>
   * Note: This directive is meant to be used as an attribute on an (input) element.
   *
   * @example TODO
   *
   * @member aw-datebox
   * @memberof NgAttributeDirectives
   */

  app.directive('awDatebox', ['$injector', 'dateTimeService', 'uwUtilService', function ($injector, dateTimeSvc, utils) {
    return {
      restrict: 'A',
      scope: {
        // prop comes from the parent controller's scope
        prop: '='
      },
      require: 'ngModel',
      link: function link(scope, $element, attrs, ngModelCtrl) {
        if (!scope.prop) {
          return;
        }
        /**
         * Check to make sure this property should be here.
         */


        if (scope.prop.type !== 'DATE' && scope.prop.type !== 'DATEARRAY') {
          logger.warn('<aw-datebox>: Property is not of type date. Type=' + scope.prop.type);
          return;
        }

        if (!scope.prop.dateApi) {
          logger.warn('<aw-datebox>: Date property has no API set');
          return;
        }

        var dateApi = scope.prop.dateApi;
        /**
         * Set some text into the scope that the templates can see.
         */

        if (dateApi.isDateEnabled) {
          if (scope.prop.isRequired) {
            dateApi.dateFormatPlaceholder = dateTimeSvc.getDateFormatPlaceholder() + ' - ' + scope.prop.propertyRequiredText;
          } else {
            dateApi.dateFormatPlaceholder = dateTimeSvc.getDateFormatPlaceholder();
          }
        }

        if (dateApi.isTimeEnabled) {
          if (scope.prop.isRequired) {
            dateApi.timeFormatPlaceholder = dateTimeSvc.getTimeFormatPlaceholder() + ' - ' + scope.prop.propertyRequiredText;
          } else {
            dateApi.timeFormatPlaceholder = dateTimeSvc.getTimeFormatPlaceholder();
          }
        }
        /**
         * Set all UI values based on the given Milliseconds since 'epoch'.
         *
         * @memberof NgControllers.awDateTimeController
         *
         * @param {Number} timeToApply - Milliseconds since 'epoch'.
         *
         * @return {Void}
         */


        dateApi.setApiValues = function (timeToApply) {
          var parent = $element.parent();

          if (parent) {
            var crtlScope = parent.scope();

            if (crtlScope) {
              crtlScope.setDateApiValues(timeToApply);
            }
          }
        };
        /**
         * Setup to build the JQueryUI 'datepicker' the 1st time the input gets focus or is clicked on.
         */


        $element.focus(function (event) {
          if (!$element.hasClass('hasDatepicker')) {
            scope.$parent.$parent.buildDatepickerUI(event.target, attrs, ngModelCtrl);
          }
        });
        /**
         * Setup to validate/save the current text value when the user leaves the field.
         */

        $element.blur(function (event) {
          //  Check to see if we're blurring because of a click in the datepicker
          if (!utils.isBlurTarget(event, '#ui-datepicker-div')) {
            scope.$parent.$parent.blurDateFunction();
          }
        });
        /**
         * Set the initial text values for date & time (if necessary)
         */

        var jsDate = new Date(scope.prop.dbValue);

        if (!jsDate) {
          jsDate = dateTimeSvc.getNullDate();
        } else if (jsDate.constructor !== Date) {
          jsDate = dateTimeSvc.getJSDate(jsDate);
        }

        dateApi.setApiValues(jsDate.getTime());
      }
    };
  }]);
});