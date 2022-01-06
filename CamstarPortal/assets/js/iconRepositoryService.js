"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/iconRepositoryService
 */
define(['app'], function (app) {
  'use strict';
  /**
   * This service provides access method and url of icons based on configuration in kit.
   *
   * @memberof NgServices
   * @member iconRepositoryService
   *
   * @param {imageRepositoryConfiguration} imageRepositoryConfiguration - Service to use.
   *
   * @returns {iconRepositoryService} Reference to service API Object.
   */

  app.factory('iconRepositoryService', ['imageRepositoryConfiguration', function (imageRepositoryConfiguration) {
    /** Exports */
    var exports = {};
    /** A place holder */

    var BASE_URL = '{{baseUrl}}';
    /** Fetch method. */

    var _fetchMethod = null;
    /** URl */

    var _Url = null;
    /** constant a possible value of #fetchMethod */

    exports.GET = 'GET';
    exports.DEFAULT = 'DEFAULT';
    /**
     * Return Url based on configuration.
     *
     * @param {String} filename - Name of the file to base retun value on.
     *
     * @return {String} The IconFile URL
     */

    exports.getIconFileUrl = function (filename) {
      if (_Url) {
        return _Url + filename;
      }
    };
    /**
     * @return {Function} Method to be used for Icon.
     */


    exports.getIconFetchMethod = function () {
      return _fetchMethod;
    };
    /**
     * Initialize the service.
     */


    var initialize = function initialize() {
      if (!(imageRepositoryConfiguration && imageRepositoryConfiguration.actionType && imageRepositoryConfiguration.url)) {
        return;
      }

      if (imageRepositoryConfiguration.actionType === exports.GET && imageRepositoryConfiguration.url.indexOf(BASE_URL) > -1) {
        _Url = imageRepositoryConfiguration.url.replace(BASE_URL, app.getBaseUrlPath() + '/image/');
        _fetchMethod = exports.DEFAULT;
      } else if (imageRepositoryConfiguration.actionType === exports.GET) {
        _Url = imageRepositoryConfiguration.url + '/image/';
        _fetchMethod = exports.GET;
      }
    };

    initialize();
    return exports;
  }]);
});