"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Navigation service which wraps navigation mechanism from the consumers.
 *
 * @module js/navigationService
 */
define(['app', 'lodash', 'js/navigationUtils', 'js/browserUtils', 'js/parsingUtils', //
'js/conditionService', 'js/appCtxService', 'js/workspaceService', 'js/contextContributionService'], function (app, _, navigationUtils, browserUtils, parsingUtils) {
  'use strict';
  /**
   * Cached reference to the various AngularJS and AW services.
   */

  var exports = {};
  /**
   * Create link to navigate the object
   *
   * @param {Object} action - The 'declAction' object.
   * @param {Object} navigationParams - The 'navigationParams' object specific for "Navigation" action type
   */

  function navigateObject(action, navigationParams) {
    var url = ''; // Check to see if they just want a raw url, and not a reference to some place in the application.

    if (action.navigateTo.indexOf('http') === 0) {
      url = action.navigateTo;
    } else {
      url = browserUtils.getBaseURL();
      /**
       * Check if there are any parameters 'before the #' AND we are NOT trying to launch some other
       * application.
       * <P>
       * If so: Include these in the base URL since they are a necessary context for any 'internal' navigation
       * operation. Specfically, used to preserve hosting and logging options.
       * <P>
       * Note: This is a fix for LCS-173770 (et al.) since any external application would/should be in control
       * of any other context options.
       */

      if (window.location.search && !_.startsWith(action.navigateTo, 'launcher')) {
        url += window.location.search;
      }

      var stateSvc = navigationUtils.getState(); // Since findState isn't public API, we need to use href to check whether path is registered
      // in state or not.

      var statePath = stateSvc.href(action.navigateTo, navigationParams, {
        inherit: false
      });

      if (statePath) {
        url += statePath;
      } else {
        url += action.navigateTo;
        var first = true;

        _.forEach(navigationParams, function (value, key) {
          if (!_.isObject(value)) {
            if (first) {
              url += '?';
              first = false;
            } else {
              url += '&';
            }

            url = url + key + '=' + value;
          }
        });
      }
    }

    if (action.actionType === 'Navigate') {
      if (action.navigateIn === 'newTab') {
        window.open(url, '_blank');
      } else if (action.navigateIn === 'newWindow') {
        var windowFeatures = 'location=yes,menubar=yes,titlebar=yes,toolbar=yes,resizable=yes,scrollbars=yes,';
        var width = window.outerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.outerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var top = window.screenTop ? window.screenTop : window.screenY;
        var left = window.screenLeft ? window.screenLeft : window.screenX;

        if (action.options) {
          for (var key in action.options) {
            var value = action.options[key];

            if (key === 'top') {
              top = value;
            } else if (key === 'left') {
              left = value;
            } else if (key === 'height') {
              height = value;
            } else if (key === 'width') {
              width = value;
            }
          }
        }

        windowFeatures = windowFeatures + 'top=' + top + ',left=' + left + ',height=' + height + ',width=' + width;
        window.open(url, '_blank', windowFeatures);
      } else {
        // default is open in current tab
        if (statePath) {
          stateSvc.go(action.navigateTo, navigationParams, {
            inherit: false
          });
        } else {
          window.open(url, '_self');
        }
      }

      return;
    } else if (evaluateIfHrefPopulateOperation) {
      return url;
    }
  }
  /**
   * Create link to navigate the object
   *
   * @param {Object} action - The 'declAction' object.
   * @param {Object} navigationParams - The 'navigationParams' object specific for "Navigation" action type
   */


  exports.navigate = function (action, navigationParams) {
    var workspaceSvc = app.getInjector().get('workspaceService');
    var appctxSvc = app.getInjector().get('appCtxService');
    var contextSvc = app.getInjector().get('contextContributionService');
    var $state = app.getInjector().get('$state');
    var url = undefined;
    return workspaceSvc.getAvailableNavigations(appctxSvc.ctx.workspace.workspaceId).then(function (navigateConfigurations) {
      var evaluationContext = {};
      /*
        Runtime evaluation context consisting of the ctx , state and navigation context
      */

      evaluationContext.ctx = appctxSvc.ctx;
      var navigateContext = evaluateParam(navigationParams.navigationContext, evaluationContext);
      evaluationContext.navigationContext = navigateContext;
      evaluationContext.state = $state;
      var activeNavigation = navigationUtils.findActiveWorkspaceNavigation(navigateConfigurations, evaluationContext);

      if (activeNavigation) {
        action.navigateTo = activeNavigation.page;

        var params = _.assign({}, navigationParams, activeNavigation.params);

        var contextParam = evaluateParam(params, evaluationContext);
        url = navigateObject(action, contextParam);
      } else {
        url = navigateObject(action, navigationParams);
      }

      return url;
    });
  };
  /**
   * Evaluate if the operation is for population of href attribute of anchor <a> tag
   *
   * @param {Object} action param all params on the navigation
   * @return {Boolean} whether true or false
   */


  function evaluateIfHrefPopulateOperation(action) {
    if (_.isUndefined(action.actionType) && !_.isUndefined(action.navigateTo) && !_.isUndefined(action.navigationParams)) {
      return true;
    }

    return false;
  }
  /**
   * Evaluate the param on the workspace
   *
   * @param {Object} param all params on the navigation
   * @param {Object} evaluationContext - Scope to execute  with
   * @return {Object} resolved param.
   */


  function evaluateParam(param, evaluationContext) {
    _.forEach(param, function (value, key) {
      var parameterKey = parsingUtils.getStringBetweenDoubleMustaches(value);

      var val = _.get(evaluationContext, parameterKey, null);

      if (val && val !== null) {
        _.set(param, key, _.get(evaluationContext, parameterKey, null));
      }
    });

    return param;
  }
  /**
   * This service provides necessary APIs to navigate to a URL within AW.
   *
   * @memberof NgServices
   * @member navigationService
   *
   * @returns {navigationService} Reference to service.
   */


  app.factory('navigationService', [function () {
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'navigationService'
  };
});