"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define requirejs */

/**
 * This is purely a Require module. It will get called on the initial flow path and state is checked during route
 * transitions. It will do an on demand load of the session manager service.
 *
 * @module js/sessionState
 */
define(['app', 'js/logger'], function (app, logger) {
  'use strict';

  var exports = {};
  var _isSessionAuthenticated = false;
  var _authInProgress = false;

  exports.setAuthStatus = function (isAuth) {
    _isSessionAuthenticated = isAuth;
  };

  exports.getIsAuthenticated = function () {
    return _isSessionAuthenticated;
  };

  exports.isAuthenticationInProgress = function () {
    return _authInProgress;
  };

  exports.setAuthenticationInProgress = function (val) {
    _authInProgress = val;
  };

  exports.forceNavigation = function (toState, toParams) {
    // try to put an async "gap" around the state.go - much like the sessionmgr interaction..
    requirejs(['js/sessionManager.service'], function () {
      var inj = app.getInjector();

      if (inj) {
        var stateSvc = inj.get('$state');
        stateSvc.go(toState, toParams);
      }
    });
  };
  /**
   * this is the wrapper around the checkSessionValid() api. this is the defer point at which we can async load.
   */


  exports.performValidSessionCheck = function (targetNavDetails) {
    // this is the break point for our dependency load.  on demand load of the session manager service.
    requirejs(['js/sessionManager.service'], function () {
      var sessionManagerService = app.getInjector().get('sessionManagerService');
      sessionManagerService.checkSessionValid(targetNavDetails);
    });
  };

  exports.runPostLoginStages = function () {
    // this is the break point for our dependency load.  on demand load of the session manager service.
    requirejs(['js/sessionManager.service'], function () {
      var sessionManagerService = app.getInjector().get('sessionManagerService');
      sessionManagerService.runPostLoginBlocking().then(function () {
        sessionManagerService.runNavToState();
      }, function () {
        if (logger.isTraceEnabled()) {
          logger.trace('SM: end runPostLoginBlocking Stage - but ERROR');
        }

        sessionManagerService.runNavToState();
      });
    });
  };
  /**
   * wrapper around the session manager api. load upon request and invoke session manager.
   *
   * @param {Object} $q
   * @return {Promise} promise
   */


  exports.pickAuthenticator = function ($q) {
    // this is the break point for our dependency load.  on demand load of the session manager service.
    return $q(function (resolve) {
      requirejs(['js/sessionManager.service'], function () {
        var sessionManagerService = app.getInjector().get('sessionManagerService');
        resolve(sessionManagerService.pickAuthenticator());
      });
    });
  };
  /**
   * Invoked when the state change was successful from UI router
   */


  exports.routeStateChangeSuccess = function (event, toState, toParams, fromState, fromParams) {
    // this is the break point for our dependency load.  on demand load of the session manager service.
    requirejs(['js/locationNavigation.service'], function () {
      var locationNavigationSvc = app.getInjector().get('locationNavigationService');
      locationNavigationSvc.routeStateChangeSuccess(event, toState, toParams, fromState, fromParams);
    });
  }; // Require Module only - not an Angular service.


  return exports;
});