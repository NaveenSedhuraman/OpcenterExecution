"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This service is used to the saveHandler object based on configuration.
 *
 * @module js/saveHandlerService
 */
define(['app', 'assert', 'lodash', 'js/configurationService', 'js/appCtxService', 'js/adapterParserService', //
'config/saveHandlers'], //
function (app, assert, _, cfgSvc) {
  'use strict';

  var _adapterConfigObject;

  var _adapterParser;

  var _appCtxService;

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
   * @return {Promise} Resolved with an array of adapted objects containing the results of the operation.
   */

  exports.getSaveServiceHandlers = function (sourceObjects) {
    assert(_adapterConfigObject, 'The Adapter Config service is not loaded');
    sourceObjects.push(_appCtxService.ctx);
    return _adapterParser.getAdaptedObjects(sourceObjects, _adapterConfigObject).then(function (adaptedObjects) {
      _.forEach(sourceObjects, function (n) {
        adaptedObjects = _.without(adaptedObjects, n);
      });

      return adaptedObjects;
    });
  };
  /**
   * @memberof NgServices
   */


  app.factory('saveHandlerService', ['adapterParserService', 'appCtxService', function (adapterParser, appCtxService) {
    _adapterParser = adapterParser;
    _appCtxService = appCtxService; //  FIXME this should be loaded async but before the sync API below that uses it is called

    _adapterConfigObject = cfgSvc.getCfgCached('saveHandlers');
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'saveHandlerService'
  };
});