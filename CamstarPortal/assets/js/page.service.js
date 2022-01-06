"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines {@link page.service} which serves basic queries related to page.
 *
 * @module js/page.service
 */
define(['app', 'lodash', 'js/declUtils', 'js/logger', 'js/appCtxService', 'js/workspaceValidationService'], function (app, _, declUtils, logger) {
  'use strict';
  /** object to export */

  var exports = {};
  /** Reference to $state service */

  var _state;
  /** Reference to $parse service */


  var _parse;
  /** Reference to _appCtxService service */


  var _appCtxService;
  /** Reference to {@angular.$q} service */


  var _$q;
  /** Reference to {@$rootScope} */


  var _rootScope;
  /** Reference to {@workspaceValidationService} */


  var _workspaceValService;
  /**
   * Evaluate the provided expression against given environment.
   *
   * @param expression to evaluate.
   * @param evaluationEnvironment against expression to evaluate.
   * @return true if expression is true other-wise false
   */


  var _evaluateExpression = function _evaluateExpression(expression, evaluationEnvironment) {
    return Boolean(_parse(expression)(evaluationEnvironment));
  };
  /**
   * Build evaluationEnvironment.
   *
   * @param state a state
   * @param additionalEvalEnvironment provided by consumer
   * @param moduleObjs
   * @return evaluationEnvironment.
   */


  var _buildEvaluationEnvironment = function _buildEvaluationEnvironment(state, evalEnvironment, additionalEvalEnvironment) {
    return _.assign({}, {
      data: _.clone(state.data),
      params: _.clone(state.params),
      ctx: _.clone(_appCtxService.ctx)
    }, evalEnvironment, additionalEvalEnvironment);
  };
  /**
   * The function reads visibleWhen.deps and loads all the dependencies
   *
   * @param {Object} deps object
   * @param {Object} evalEnvironment to update with dependencies
   * @return promise
   */


  var _updateEnvWithDeps = function _updateEnvWithDeps(deps, evalEnvironment) {
    var deffered = _$q.defer();

    if (deps && deps.length > 0) {
      declUtils.loadImports(deps, _$q).then(function (moduleObjs) {
        var jsFunctions = {};

        _.forEach(moduleObjs, function (module) {
          _.assign(jsFunctions, module);
        });

        _.assign(evalEnvironment, jsFunctions);

        deffered.resolve(evalEnvironment);
      }, function (error) {
        deffered.reject(error);
      });
    } else {
      deffered.resolve();
    }

    return deffered.promise;
  };
  /**
   * Log error and return it.
   *
   * @param error
   * @return the same error
   */


  var _logError = function _logError(error) {
    logger.error(error);
    return error;
  };
  /**
   * The method resolve a promise with a list of states which confirm:<br>
   * <ul>
   * <li>The return state should be child state of the parentState, If parentState is not provided, the return state
   * should be child state of the current state's parent</li>
   * <li>And the state's visibleWhen should be evaluates to true.</li>
   * </ul>
   * The visibleWhen's expression can be as defined below while defining a state.<br>
   * <code>
   * "aState": {
   *     "data":{"priority":0},
   *     "controller": "controllerOfThisState",
   *     "parent": "parentState",
   *     "url": "/someUrl",
   *     "visibleWhen":{"expression":"ctx.someVariable==1"}
   *            }
   * </code>
   * Supported contexts: parentState.data, parentState.params, _appCtxService.ctx any other additionalEvalEnvironment
   * provided to the method.
   *
   * @param {String} parentState is used to get the children, if not provided current state's parent ({@$state.current.parent})
   *            will be considered as a parent state.
   * @return promise <array>
   *
   */


  exports.getAvailableSubpages = function (parentState, additionalEvalEnv) {
    var additionalEvalEnvironment = additionalEvalEnv ? additionalEvalEnv : {};
    var evalEnvironment = {};

    var defferd = _$q.defer();

    var availableStates = [];
    var _parentState = parentState;
    var promises = [];

    if (!_parentState) {
      _parentState = _state.current.parent;
    }

    _state.get().filter(function (state) {
      return state.parent === _parentState;
    }).forEach(function (state) {
      if (state.visibleWhen !== undefined && state.visibleWhen.expression) {
        var promise = _updateEnvWithDeps(state.visibleWhen.deps, evalEnvironment).then(function () {
          var visibleWhen = _evaluateExpression(state.visibleWhen.expression, _buildEvaluationEnvironment(_state.get(_parentState), evalEnvironment, additionalEvalEnvironment)); // should we consider parent state


          if (visibleWhen) {
            availableStates.push(state);
          }
        }, _logError);

        promises.push(promise);
      } else {
        availableStates.push(state);
      }
    });

    _$q.all(promises).then(function () {
      var availableSubPages = availableStates.filter(function (aSubPage) {
        return _workspaceValService.isValidPage(aSubPage.name);
      });
      defferd.resolve(availableSubPages);
    });

    return defferd.promise;
  };
  /**
   * Return a default sub-page for a given page.This method uses
   * <code>state.data.priority<code> to decide a default sub-page.
   * A page will have a default sub-page X, if following are true:
   * 1) X is a visible(available) page.
   * 2) X has highest priority(state.data.priority) value among available sub-pages.
   * 3) X is available in current workspace.
   *
   * @param {Object} page , a state object.
   * @return promise<page>
   */


  exports.getDefaultSubPage = function (page) {
    return this.getAvailableSubpages(page).then(function (availableSubPages) {
      if (availableSubPages && availableSubPages.length > 0) {
        availableSubPages.sort(function (o1, o2) {
          return _.parseInt(o1.data.priority) - _.parseInt(o2.data.priority);
        });
        return availableSubPages[0];
      }

      return null;
    });
  };
  /**
   * If a (parent) page(or location) is revealed application should should find out a visible sub-page (sub-location)
   * which has a highest priority and should reveal it.
   *
   * @param {Object} page - a state
   * @param {Object} toParam
   */


  exports.navigateToDefaultSubPage = function (page, toParams) {
    this.getDefaultSubPage(page.name).then(function (defaultSubPage) {
      if (defaultSubPage) {
        return _state.go(defaultSubPage.name, toParams);
      }
    });
  };
  /**
   * Register listener for state.visibleWhen.expression
   *
   * @param {Object} state
   * @param {$scope} dataCtxNode
   * @param {Object} additionalEvalEnv
   * @return promise which resolves to listener
   */


  var _registerListener = function _registerListener(state, dataCtxNode, additionalEvalEnv) {
    var expression = state.visibleWhen.expression;
    var rootScope = dataCtxNode ? dataCtxNode : _rootScope;
    var evalEnvironment = {};
    return _updateEnvWithDeps(state.visibleWhen.deps, evalEnvironment).then(function () {
      return rootScope.$watch(function () {
        return _evaluateExpression(expression, _buildEvaluationEnvironment(_state.get(state.parent), evalEnvironment, additionalEvalEnv));
      }, function (newValue) {
        state.isVisible = newValue;
      });
    }, _logError);
  };
  /**
   * Unregister active listeners.
   *
   * @param {Array} listener
   */


  var _unRegisterListener = function _unRegisterListener(listeners) {
    _.forEach(listeners, function (listener, index) {
      listeners[index].apply(listener);
    });
  };
  /**
   * Initialization listeners for all applicable states' visibleWhen.expression. <br>
   * <code>state.isVisible</code> can be used to access the state's visibility.
   *
   * @param {Object} parentState is used to get the children, if not provided current state's parent ({@$state.current.parent})
   *            will be considered as a parent state. Listener will be registered against the children.
   * @param {Object} dataCtxNode scope
   * @param {Object} additionalEvalEnv
   *
   */


  exports.registerVisibleWhen = function (parentState, dataCtxNode, additionalEvalEnv) {
    var promises = [];
    var _parentState = parentState;

    if (!_parentState) {
      _parentState = _state.current.parent;
    }

    if (!dataCtxNode) {
      dataCtxNode = _rootScope;
    }

    _state.get().filter(function (state) {
      return state.parent === _parentState;
    }).forEach(function (state) {
      if (state.visibleWhen !== undefined && state.visibleWhen.expression) {
        promises.push(_registerListener(state, dataCtxNode, additionalEvalEnv));
      }
    });

    _$q.all(promises).then(function (arrayOfListeners) {
      if (arrayOfListeners.length > 0) {
        dataCtxNode.$on('$destroy', function () {
          _unRegisterListener(arrayOfListeners);
        });
      }
    });
  };
  /**
   * @class pageService
   */


  app.service('pageService', ['$q', '$state', '$parse', '$rootScope', 'appCtxService', 'workspaceValidationService', function ($q, state, parse, rootScope, appCtxService, workspaceValidationService) {
    _$q = $q;
    _state = state;
    _parse = parse;
    _rootScope = rootScope;
    _appCtxService = appCtxService;
    _workspaceValService = workspaceValidationService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'pageService'
  };
});