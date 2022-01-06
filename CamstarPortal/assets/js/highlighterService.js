"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to set a highlighter.
 *
 * @module js/highlighterService
 */
define(['app', 'lodash', 'js/declUtils', //
'js/appCtxService', 'js/configurationService', 'js/conditionService'], //
function (app, _, expressionParserUtils, declUtils) {
  'use strict';
  /**
   * highlighterService factory
   */

  app.factory('highlighterService', ['$q', 'appCtxService', 'configurationService', 'conditionService', function ($q, appCtxSvc, cfgSvc, conditionSvc) {
    var _decoratorProvidersPromise = cfgSvc.getCfg('highlighter');
    /**
     * Processes the decorators
     *
     * @param {Object} decoratatorProviders highlight decoratator providers
     * @param {Object|null} searchTermsToHighlight - search terms to highlight with.
     */


    function _processDecorators(decoratatorProviders, searchTermsToHighlight) {
      _.forEach(decoratatorProviders, function (decoratorJson) {
        if (decoratorJson.conditions) {
          var declViewModel = {};
          var evaluationEnv = {
            ctx: appCtxSvc.ctx
          };
          var verdict = true;

          for (var condition in decoratorJson.conditions) {
            var expression = decoratorJson.conditions[condition].expression;
            verdict = verdict && conditionSvc.parseExpression(declViewModel, expression, evaluationEnv);
          }

          if (verdict && searchTermsToHighlight && searchTermsToHighlight.length > 0) {
            var highlightMatchString = searchTermsToHighlight.join('|');
            highlightMatchString = exports.escapeRegexSpecialChars(highlightMatchString);
            var regEx = new RegExp('(' + highlightMatchString + ')', 'gi');
            var ctx = appCtxSvc.getCtx('highlighter');

            if (ctx === undefined) {
              ctx = {};
              appCtxSvc.registerCtx('highlighter', ctx);
            }

            ctx.regEx = regEx;
            ctx.style = decoratorJson.highlightStyle;
            appCtxSvc.updateCtx('highlighter', ctx);
          } else {
            if (appCtxSvc.getCtx('highlighter')) {
              appCtxSvc.unRegisterCtx('highlighter');
            }
          }
        }
      });
    }

    var exports = {};
    /**
     * escapeRegexSpecialChars
     *
     * @function escapeRegexSpecialChars
     * @memberOf NgServices.awSearchService
     * @param {Object} regex - regex string.
     * @return {String} escaped regex string
     */

    exports.escapeRegexSpecialChars = function (regex) {
      return regex.replace(/[-\/\\^$+.()[\]{}]/g, '\\$&');
    };
    /**
     * Sets cell list decorators.
     *
     * @param {Object} searchTermsToHighlight - search terms to highlight with.
     */


    exports.highlightKeywords = function (searchTermsToHighlight) {
      var unloadedDepModules = {};
      var sublocationName = appCtxSvc.ctx.sublocation ? appCtxSvc.ctx.sublocation.nameToken : null;

      if (_decoratorProvidersPromise) {
        _decoratorProvidersPromise.then(function (_decoratorProviders) {
          _.forEach(_decoratorProviders, function (decoratorJson) {
            if ((!sublocationName || sublocationName === decoratorJson.subLocationName) && !_.isEmpty(decoratorJson.deps)) {
              unloadedDepModules[decoratorJson.deps] = true;
            }
          }); // See if loading modules is necessary


          if (!_.isEmpty(unloadedDepModules)) {
            var depsArray = Object.keys(unloadedDepModules);
            declUtils.loadDependentModules(depsArray, $q, app.getInjector()).then(function () {
              _processDecorators(_decoratorProviders, searchTermsToHighlight);
            });
          } else {
            _processDecorators(_decoratorProviders, searchTermsToHighlight);
          }
        });
      }
    };

    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'highlighterService'
  };
});