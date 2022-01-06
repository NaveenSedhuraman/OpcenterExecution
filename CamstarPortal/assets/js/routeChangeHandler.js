"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This is the integration logic with the route change events.
 *
 * NOTE - since this is loaded PRIOR to app.initModule() it can't use the typical angular resolution patterns. Needs to
 * be treated as a requirejs only module.
 *
 * @module js/routeChangeHandler
 */
define(['app', 'js/sessionState', 'js/postLoginPipeline.service', 'js/workspaceValidationService', 'js/page.service'], //
function (app, sessionState) {
  'use strict';

  var exports = {};
  /**
   * state change handler function called when the router is about to transition states. Leverages the
   * authentication state information to determine whether or not to prevent the current route change, and trigger
   * the authentication path.
   *
   * If session state shows already authenticated, allow the transition.
   *
   * @param {Object} event ui-router event
   * @param {Object} toState target state name
   * @param {Object} toParams target state params
   * @param {Object} fromState current state name (if any)
   * @param {Object} fromParams current state params
   * @param {Object} options ui-router navigation options
   */

  exports.routeStateChangeStart = function (event, toState, toParams, fromState, fromParams, options) {
    // this gets run prior to bootstrap finishing, so there is no angular resolution available.
    if (!sessionState.getIsAuthenticated()) {
      if (!sessionState.isAuthenticationInProgress()) {
        // save these for future nav trigger -- NOT SURE about SSO case.
        var targetNavDetails = {};
        targetNavDetails.toState = toState;
        targetNavDetails.toParams = toParams;
        targetNavDetails.options = options; // the session may be ok, but until we ask the server we don't know.

        event.preventDefault(); // From this point, we can trigger async load behavior since the event has been updated.
        // check if there is a valid current session, if so continue, otherwise trigger
        // the authentication path.

        sessionState.performValidSessionCheck(targetNavDetails);
      } else {
        // during authInProgress true, Only page that without auth
        // can be accessed.
        if (!toState.noAuth) {
          sessionState.setAuthStatus(false);
          sessionState.setAuthenticationInProgress(false);
          event.preventDefault(); // stop the auth processing of the current flow, stop the nav request for
          // this new URL, but trigger a state change to the new target route.

          sessionState.forceNavigation(toState, toParams);
        }
      }
    } else {
      var workspaceValService = app.getInjector().get('workspaceValidationService');
      workspaceValService.isValidPageAsync(toState.name).then(function (changeState) {
        var defRoutePath = app.getInjector().get('defaultRoutePath'); // If the page being navigated to is not a valid page (i.e. not in the list of available pages for the workspace),
        // go to the default page. If it is a valid page, we might be here because the user has switched his workspace and the
        // page user was on is no longer a valid page in the new workspace. So go to the default page.

        if (!changeState || toParams.validateDefaultRoutePath === 'true' && toState.name !== defRoutePath) {
          event.preventDefault();
          var $state = app.getInjector().get('$state');
          $state.go(defRoutePath);
        }
      });
    }
  };
  /**
   * Invoked when the state change was successful from UI router
   *
   * @param {Object} event ui-router event
   * @param {Object} toState target state name
   * @param {Object} toParams target state params
   * @param {Object} fromState current state name (if any)
   * @param {Object} fromParams current state params
   */


  exports.routeStateChangeSuccess = function (event, toState, toParams, fromState, fromParams) {
    var postLoginPipeLineSvc = app.getInjector().get('postLoginPipelineservice');
    var allStagesAuthenticated = postLoginPipeLineSvc.checkPostLoginAuthenticatedStages();

    if (sessionState && sessionState.getIsAuthenticated()) {
      if (allStagesAuthenticated) {
        sessionState.routeStateChangeSuccess(event, toState, toParams, fromState, fromParams);
        var pageService = app.getInjector().get('pageService');
        pageService.navigateToDefaultSubPage(toState, toParams);
      } else {
        sessionState.runPostLoginStages();
      }
    }
  };
  /**
   * delegates from the route resolution down into the session state RequireJS module. This simply wraps the load
   * and call to the session manager.
   *
   * @return {Promise} promise
   */


  exports.pickAuthenticator = function ($q) {
    return sessionState.pickAuthenticator($q);
  }; // Require Module only - no Angular service.


  return exports;
});