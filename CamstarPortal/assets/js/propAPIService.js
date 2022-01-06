"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module provides propApi service in native.
 *
 * @module js/propAPIService
 */
define(['app'], //
function (app) {
  'use strict';

  var exports = {};
  /**
   * Create the propapi object and native methods on the propapi object
   *
   * @param {propertyOverlay} object - Property Overlay object
   */

  exports.createPropAPI = function (propertyOverLay) {
    if (!propertyOverLay.propApi) {
      propertyOverLay.propApi = {};
    }
    /*
     * once the native LOVService will be available , remove the comment propertyOverLay.propApi.setLOVValueProvider =
     * function() { _uwPropertySvc.setHasLov( eventdata.propOverlay, true ); if( !eventdata.propOverlay.lovApi ) {
     * _lovSvc.initNativeCellLovApi( eventdata.propOverlay, null, "create", null ); } };
     * propertyOverLay.propApi.setAutoAssignHandler = $entry( function() { // Hook for the autoAssigin handler });
     */

  };

  app.factory('propAPIService', //
  [function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'propAPIService'
  };
});