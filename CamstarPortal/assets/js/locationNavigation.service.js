"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This represents the Location Navigation and tracking
 *
 * @module js/locationNavigation.service
 */
define(['app', 'js/eventBus', 'js/logger', 'js/leavePlace.service', 'js/appCtxService'], function (app, eventBus, logger) {
  'use strict';

  var exports = {};
  var _appCtxSvc = null; // service and module references

  var _$state = null;
  var _$document = null;
  var _$urlMatcherFactory = null; // members

  var _stateStackNames;

  var _stateStack;

  var _popState = null;
  var _$rootScope = null;
  /**
   * {Integer} The number of previous states that will be persisted for navigation from back button.
   * If the number of states exceeds this count, the earliest state will be forgotten. 
   */

  var _persistentStatesCount = 24;
  /**
   * Initializes the previous routes and route names if they are present in sessionStorage
   */

  exports.init = function () {
    _stateStack = [];
    _stateStackNames = [];

    try {
      if (sessionStorage.getItem('STATES_ARRAY_NAMES') && sessionStorage.getItem('STATES_ARRAY')) {
        _stateStackNames = JSON.parse(sessionStorage.getItem('STATES_ARRAY_NAMES'));
        _stateStack = JSON.parse(sessionStorage.getItem('STATES_ARRAY'));
      }
    } catch (e) {
      logger.trace('Error in location initiation', e);
    }
  };
  /**
   * Function parses a URL and returns an object consisting of state and params
   */


  var parseUrl = function parseUrl(url) {
    var stateStart = url.lastIndexOf('#');
    var paramsStart = url.lastIndexOf('?');
    var state = url.substring(stateStart + 1);
    var paramsStr = '';
    var params = {};

    if (paramsStart > -1) {
      state = url.substring(stateStart + 1, paramsStart);
      paramsStr = url.substr(paramsStart + 1);
      var paramPairs = paramsStr.split('&');

      for (var i = 0; i < paramPairs.length; i++) {
        var keyValue = paramPairs[i].split('=');

        if (keyValue.length === 2) {
          params[keyValue[0]] = _$urlMatcherFactory.type('string').decode(decodeURIComponent(keyValue[1]));
        }
      }
    }

    if (state === '/com.siemens.splm.clientfx.tcui.xrt.showObject') {
      state = 'com_siemens_splm_clientfx_tcui_xrt_showObject';
    }

    return {
      state: {
        name: state
      },
      params: params,
      url: url
    };
  };
  /**
   * goBack function wired to the goBack Button
   */


  exports.goBack = function () {
    _popState = _stateStack.pop();
    sessionStorage.setItem('STATES_ARRAY', JSON.stringify(_stateStack));

    _stateStackNames.pop();

    if (_stateStackNames.length === 0) {
      _stateStackNames.push(_$document[0].title);
    }

    sessionStorage.setItem('STATES_ARRAY_NAMES', JSON.stringify(_stateStackNames));

    _appCtxSvc.registerCtx('previousLocationDisplayName ', exports.getGoBackLocation());

    if (_popState && _popState.state) {
      logger.trace('&&&&& go pop state' + _popState.state.name);

      _$state.go(_popState.state.name, _popState.params, {
        inherit: false
      });

      if (_$rootScope.$$phase !== '$apply' && _$rootScope.$$phase !== '$digest') {
        _$rootScope.$apply();
      }
    }
  };

  exports.peekLastState = function () {
    if (_stateStack && _stateStack.length > 0) {
      return _stateStack[_stateStack.length - 1];
    }

    return undefined;
  };

  exports.getGoBackLocation = function () {
    if (_stateStackNames && _stateStackNames.length > 1) {
      return _stateStackNames[_stateStackNames.length - 2];
    }

    return undefined;
  };

  exports.updateCurrentDisplayName = function () {
    if (_stateStackNames && _stateStackNames.length > 0) {
      var title = _$document[0].title;
      _stateStackNames[_stateStackNames.length - 1] = title.substr(title.indexOf('-') + 1);
      sessionStorage.setItem('STATES_ARRAY', JSON.stringify(_stateStack));
    }

    return undefined;
  };
  /**
   * Invoked when the state change was successful from UI router
   */


  exports.routeStateChangeSuccess = function (event, toState, toParams, fromState, fromParams) {
    if (fromState && fromState.name !== 'checkAuthentication') {
      if (_popState && _popState.state.name === toState.name) {
        _popState = null;
        return;
      }

      if (toState && toState.name && fromState && fromState.name && toState.name === fromState.name && toState.name !== 'com_siemens_splm_clientfx_tcui_xrt_showObject') {
        return;
      }

      if (toState && toState.parent && fromState && fromState.parent && toState.parent === fromState.parent) {
        return;
      }

      var newState = {
        state: fromState,
        params: fromParams,
        displayName: _$document[0].title
      };

      if (_stateStack.length > 0) {
        var lastState = exports.peekLastState();

        if (lastState.state.name !== newState.state.name && newState.state.name !== '') {
          _stateStack.push(newState);

          _stateStackNames.push(newState.displayName);

          logger.trace('^^^^1 pushing newState ' + newState.state.name);
        } else if (newState.state.name === 'com_siemens_splm_clientfx_tcui_xrt_showObject' && lastState.params.uid !== newState.params.uid && (newState.params.uid !== toParams.uid || newState.state.name !== toState.name)) {
          _stateStack.push(newState);

          _stateStackNames.push(newState.displayName);

          logger.trace('^^^^2 pushing newState ' + newState.state.name);
        }
      } else if (!newState.state.abstract) {
        _stateStack.push(newState);

        _stateStackNames.push(newState.displayName);

        logger.trace('^^^^3 pushing newState ' + newState.state.name);
      } // If persisted states count exceeds allowed count, remove earliest state


      if (_stateStack.length > _persistentStatesCount) {
        _stateStack.shift();

        _stateStackNames.shift();
      }

      _appCtxSvc.registerCtx('previousLocationDisplayName ', exports.getGoBackLocation());

      sessionStorage.setItem('STATES_ARRAY_NAMES', JSON.stringify(_stateStackNames));
      sessionStorage.setItem('STATES_ARRAY', JSON.stringify(_stateStack));
    }
  };
  /**
   * Function to update the state parameter
   */


  exports.updateStateParameter = function (paramName, paramValue) {
    _$state.params[paramName] = paramValue;

    _$state.go('.', _$state.params, {
      inherit: true
    });
  };
  /**
   * Function to transition to a new state
   */


  exports.go = function (transitionTo, toParams, options) {
    _$state.go(transitionTo, toParams, options);
  };
  /**
   * The native location Navigation service.
   *
   * @member locationNavigationService
   * @memberof NgServices
   */


  app.factory('locationNavigationService', ['$state', '$document', '$rootScope', '$urlMatcherFactory', 'appCtxService', function ($state, $document, $rootScope, $urlMatcherFactory, appCtxSvc) {
    _$state = $state;
    _$document = $document;
    _$rootScope = $rootScope;
    _$urlMatcherFactory = $urlMatcherFactory;
    _appCtxSvc = appCtxSvc;
    exports.init();
    $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
      var newLocation = parseUrl(newUrl);
      var oldLocation = parseUrl(oldUrl);
      exports.updateCurrentDisplayName();
      /*
       * Several location changes are made during show object location as query parameters are added do not
       * want to check changes until toLocation are valid locations
       */

      if (newLocation.state.name === 'com_siemens_splm_clientfx_tcui_xrt_showObject' && oldLocation.state.name === 'com_siemens_splm_clientfx_tcui_xrt_showObject' && newLocation.params && newLocation.params.uid) {
        if (oldLocation.params) {
          if (newLocation.params.uid !== oldLocation.params.uid) {
            exports.routeStateChangeSuccess(event, newLocation.state, newLocation.params, oldLocation.state, oldLocation.params);
          }
        } else {
          exports.routeStateChangeSuccess(event, newLocation.state, newLocation.params, oldLocation.state, oldLocation.params);
        }
      }

      logger.trace('#### locationChangeSuccess changed! new: ' + newUrl + ', oldUrl: ' + oldUrl);
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'locationNavigationService'
  };
});