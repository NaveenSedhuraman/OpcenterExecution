"use strict";

// Copyright 2019 Siemens AG

/**
 * **Note:** This module is for internal use only.
 * @module "js/mom.init.service"
 * @requires app
 * @requires logger
 * @requires eventBus
 * @requires appCtxService
 * @ignore
 */

/* eslint-disable valid-jsdoc */

/*global
 define
 */
define(['app', 'js/eventBus', 'js/logger', 'js/appCtxService'], //
function (app, eventBus, logger) {
  'use strict';

  var exports = {};

  var _appCtxSvc;

  exports.init = function () {
    logger.trace('MOM UI - Environment initialization start');
    eventBus.publish('mom.init');

    _appCtxSvc.registerCtx('momBaseUrl', app.getBaseUrlPath());

    _appCtxSvc.registerCtx('momChangeThemeDisabled', true);

    logger.trace('MOM UI - Environment initialization end');
  };

  app.factory('momInitService', ['appCtxService', function (appCtxService) {
    _appCtxSvc = appCtxService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momInitService'
  };
});