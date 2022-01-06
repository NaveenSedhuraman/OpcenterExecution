"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This module contains a controller that handles checking authentication
 *
 * @module js/aw.checkAuthentication.controller
 * @class aw.checkAuthentication.controller
 * @memberOf angular_module
 */
define(['app', 'js/sessionManager.service'], //
function (app) {
  'use strict';

  app.controller('CheckAuthentication', ['$q', '$scope', '$injector', 'authenticator', 'sessionManagerService', function ($q, $scope, $injector, authenticator, sessionMgr) {
    if (authenticator) {
      authenticator.setScope($scope, $injector);
      sessionMgr.resetPipeLine();
      authenticator.authenticate($q).then(function () {
        sessionMgr.authenticationSuccessful();
      });
    }
  }]);
});