"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define,
 requirejs
 */

/**
 * This is the uiJs layer route/state contribution.
 *
 * @module js/ui.states
 */
define([], function () {
  'use strict';

  var contribution = {
    // route to deal with handling checks for authentication.
    checkAuthentication: {
      templateUrl: '/html/login.html',
      controller: 'CheckAuthentication',
      noAuth: true,
      resolve: {
        authenticator: ['$q', function ($q) {
          return $q(function (resolve) {
            requirejs(['js/routeChangeHandler'], function (rtChangeHandler) {
              resolve(rtChangeHandler.pickAuthenticator($q));
            });
          });
        }],
        loadController: ['$q', function ($q) {
          return $q(function (resolve) {
            requirejs(['js/aw.checkAuthentication.controller'], resolve);
          });
        }]
      }
    }
  };
  return function (key, deferred) {
    if (key === 'states') {
      if (deferred) {
        deferred.resolve(contribution);
      } else {
        return contribution;
      }
    } else {
      if (deferred) {
        deferred.resolve();
      }
    }
  };
});