"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define
 */

/**
 * @module js/awConstantsService
 *
 * @namespace awConstantsService
 */
define([//
'app', //
'js/browserUtils' //
], function (app, browserUtils) {
  'use strict';

  var exports = {};
  var Constants = {
    fmsUrl: browserUtils.getBaseURL() + 'fms/fmsupload/'
  };
  /**
   * Get the value of Constant parameter
   *
   * @param {String} constantName - Parameter name
   * @return {String} Value of the constant parameter
   */

  exports.getConstant = function (constantName) {
    var newVal = constantName.replace('Constants.', '');
    return Constants[newVal];
  };
  /**
   * Definition for the 'awConstantsService' service used by declarative panels in application.
   *
   * @member awConstantsService
   * @memberof NgServices
   *
   * @returns {awConstantsService} Instance of the service API object.
   */


  app.factory('awConstantsService', [function () {
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'awConstantsService'
  };
});