"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service is used to find the alternate object for a given model object
 *
 * @module js/adapterService
 * @namespace adapterService
 */
define(['app', 'assert', 'js/configurationService', 'js/adapterParserService', 'config/adapters'], function (app, assert, cfgSvc) {
  'use strict';
  /**
   * @member adapterService
   * @memberof NgServices
   *
   * @param {adapterParserService} adapterParser - Service to use.
   *
   * @returns {adapterService} Instance of the service API object.
   */

  app.factory('adapterService', ['adapterParserService', function (adapterParser) {
    //  FIXME this should be loaded async but before the sync API below that uses it is called
    var _adapterConfigObject = cfgSvc.getCfgCached('adapters');

    var exports = {};
    /**
     * ############################################################<BR>
     * Define the public functions exposed by this module.<BR>
     * ############################################################<BR>
     */

    /**
     * This method returns the adapted objects based on a given object. This takes an array of source objects on which
     * the conditions will be applied. If any of the source object satisfies the condition, it takes the target object
     * corresponding to the sourceobject and returns it.
     *
     * @param {Array} sourceObjects - source objects
     * @param {Boolean} isFullyAdapted - if object should be recursively adapted
     * @return {Promise} Resolved with an array of adapted objects containing the results of the operation.
     */

    exports.getAdaptedObjects = function (sourceObjects, isFullyAdapted) {
      assert(_adapterConfigObject, 'The Adapter Config service is not loaded');
      return adapterParser.getAdaptedObjects(sourceObjects, _adapterConfigObject, isFullyAdapted);
    };
    /**
     * This method returns the adapted objects based on a given object. This takes an array of source objects on which
     * the conditions will be applied. If any of the source object satisfies the condition, it takes the target object
     * corresponding to the sourceobject and returns it.
     *
     * This is a blocking call and assumes that the underlying property on current object is already loaded and available
     * in cdm for the adapter service to fetch the adapted object. This function does not perform soa call neither does it
     * support capability to invoke functions from dependent modules
     *
     * @param {Array} sourceObjects - source objects
     * @return {Array} Adapted objects
     */


    exports.getAdaptedObjectsSync = function (sourceObjects) {
      assert(_adapterConfigObject, 'The Adapter Config service is not loaded');
      return adapterParser.getAdaptedObjectsSync(sourceObjects, _adapterConfigObject);
    };
    /**
     * This method apply and evaluate the conditions on the source object and returns boolean value accordingly.
     *
     * @param {Object} sourceObject - source object
     * @return {Object} verdict object
     */


    exports.applyConditions = function (sourceObject) {
      adapterParser.setConfiguration(_adapterConfigObject);
      return adapterParser.applyConditions(sourceObject);
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'adapterService'
  };
});