"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 navigator,
 window
 */

/**
 * This module includes the various AngularJS directives that present and control date and/or time entry widgets to the
 * user.
 * <P>
 * Note: We include 'jqueryui' as a parameter to be sure it finished loading before we get here.
 *
 * @module js/uwDirectiveDateTimeService
 */
define(['app', 'jquery', 'jqueryui', 'js/eventBus', 'Debug', 'js/dateTimeService', 'js/localeService', 'js/aw-property-date-time.directive', 'js/aw-property-date-val.directive', 'js/aw-property-date-time-val.directive', 'js/aw-property-time-val.directive', 'js/aw-datebox.directive'], //
function (app, $, jqueryui, eventBus, Debug) {
  'use strict';

  var trace = new Debug('uwDirectiveDateTimeService');
  app.factory('uwDirectiveDateTimeService', ['dateTimeService', 'localeService', function (dateTimeSvc, localeSvc) {
    var _checked = false;
    var exports = {};
    /**
     * Set (if necessary) the locale specific properties of the JQueryUI date picker based on the currently set
     * locale.
     */

    exports.assureDateTimeLocale = function () {
      if (!_checked) {
        _checked = true;
        var promise = dateTimeSvc.getJQueryDatePickerTextBundle();

        if (promise) {
          promise.then(function (jqTextBundle) {
            if (jqTextBundle) {
              $.datepicker.regional[localeSvc.getLanguageCode()] = jqTextBundle;
              $.datepicker.setDefaults(jqTextBundle);
            }
          });
        }
      }
    };
    /**
     * Returns a new Date object based on the given Date value and the current format string using JQuery UI
     * <P>
     * Note: This method handles some corner cases found in (at least) the Firefox browser.
     *
     * @param {String} dateString - the date string to be converted to a date object
     * @param {String} format (OPTIONAL) - the date format to be used
     *
     * @return {Date} A new JS Date object based on the given object.
     */


    exports.parseDate = function (dateString, format) {
      if (!format) {
        format = dateTimeSvc.getDateFormat();
      }

      return $.datepicker.parseDate(format, dateString);
    };
    /**
     * Returns a new Date string value based on the given Date Object and the current format string using JQuery
     * UI
     * <P>
     * Note: This method handles some corner cases found in (at least) the Firefox browser.
     *
     * @param {Object} dateTime - the Date object to be formatted
     * @param {String} format (OPTIONAL) - the date format to be used
     *
     * @return {String} formatted date
     */


    exports.formatDate = function (dateTime, format) {
      if (!format) {
        format = dateTimeSvc.getDateFormat();
      }

      return $.datepicker.formatDate(format, dateTime);
    };
    /**
     * Setup to listen to changes in locale.
     *
     * @param {Object} localeInfo - Updated locale info
     *
     * @return {Void}
     */


    eventBus.subscribe('dateTime.changed', function (localeInfo) {
      // eslint-disable-line no-unused-vars
      _checked = false;
      exports.assureDateTimeLocale();
    }, 'uwDirectiveDateTimeService');
    /**
     * get date  in milliseconds
     *
     * @param {Object} queryVal value
     *
     * @return {Date} - in milliseconds
     */

    exports.convertDateToMsec = function (queryVal) {
      if (typeof queryVal !== 'number') {
        try {
          queryVal = new Date(queryVal).getTime();
        } catch (e) {
          trace('Invalid Date format', e);
        }
      }

      return queryVal > 0 ? queryVal : Infinity;
    };

    return exports;
  }]);
});