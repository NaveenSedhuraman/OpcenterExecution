"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module contains a controller that updates sessionManager about Successful authentication so
 *  that session manager could complete its execution pipe line.
 *
 * @module js/aw.internalOAuth2State.controller
 * @class aw.internalOAuth2State.controller
 * @memberOf angular_module
 */
define(['app', 'js/sessionManager.service'], //
function (app) {
  'use strict';

  app.controller('internalOAuth2StateController', ['sessionManagerService', function (sessionMgr) {
    sessionMgr.authenticationSuccessful();
  }]);
});