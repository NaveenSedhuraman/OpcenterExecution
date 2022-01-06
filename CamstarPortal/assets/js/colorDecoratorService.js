"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Service to set color decorators on a vmo.
 *
 * @module js/colorDecoratorService
 */
define(['app', 'lodash', 'js/expressionParserUtils', 'js/declUtils', 'js/parsingUtils', 'js/eventBus', //
'js/appCtxService', 'js/configurationService', 'js/commandsMapService', 'js/conditionService', 'js/awDuiLocalizationService'], //
function (app, _, expressionParserUtils, declUtils, parsingUtil, eventBus) {
  'use strict'; //  FIXME this should be loaded async but before the sync API below that uses it is called

  /**
   * colorDecoratorService factory
   */

  app.factory('colorDecoratorService', ['$q', 'appCtxService', 'configurationService', 'commandsMapService', 'conditionService', 'awDuiLocalizationService', function ($q, appCtxSvc, cfgSvc, commandsMapSvc, conditionSvc, awDuiLocalizationSvc) {
    /**
     * {Object} Map of decorator name versus the decorator definition as configured in the application.
     */
    var _decoratorProviders;
    /**
     * {StringMap} Map of cached dependent module names to the async loaded module objects.
     */


    var _mapModuleNameToModuleObject = {};
    /**
     * {StringMap} Map of cached dependent module names to its proper (camelCase) associated service name.
     */

    var _mapModuleNameToServiceName = {};
    /**
     * {StringMap} Map of cached decorator name i18n key to its localized values
     */

    var _mapDecoratorI18nKeyToLocalizedTitle = {};
    cfgSvc.getCfg('decorators').then(function (decorators) {
      _decoratorProviders = decorators; // Loop through decorators and load localized titles if any

      var decoratorNames = [];
      var promises = [];

      _.forEach(_decoratorProviders, function (decoratorJson, decoratorName) {
        if (decoratorJson.title && _.startsWith(decoratorJson.title, '{{') && decoratorJson.i18n) {
          promises.push(awDuiLocalizationSvc.populateI18nMap(decoratorJson.i18n));
          decoratorNames.push(decoratorName);
        }
      }); // update the decorator i18n title map once all localized values are available


      $q.all(promises).then(function (results) {
        _.forEach(results, function (result) {
          _.forEach(decoratorNames, function (decoratorName) {
            var decoratorJson = _decoratorProviders[decoratorName];

            if (decoratorJson.title && _.startsWith(decoratorJson.title, '{{') && decoratorJson.i18n) {
              // decoratorJson title value will be {{i18n.xxyyzz}}
              var i18Key = parsingUtil.getStringBetweenDoubleMustaches(decoratorJson.title);
              var titleKey = i18Key.split('.');
              titleKey = titleKey && titleKey.length > 1 ? titleKey[1] : titleKey[0];

              if (result[titleKey]) {
                _mapDecoratorI18nKeyToLocalizedTitle[decoratorName + '.' + i18Key] = result[titleKey];
              }
            }
          });
        });
      });
    });
    /**
     * @param {JSONObject} decoratorJson -
     * @return {ModuleObject}
     */

    function _getModuleObject(decoratorJson) {
      var serviceName = _mapModuleNameToServiceName[decoratorJson.deps];

      if (!serviceName) {
        serviceName = _.camelCase([decoratorJson.deps.replace('js/', '')]);
        _mapModuleNameToServiceName[decoratorJson.deps] = serviceName;
      }

      return _mapModuleNameToModuleObject[decoratorJson.deps];
    }
    /**
     * Processes the decorators
     *
     * @param {Object} decoratatorProviders
     * @param {ViewModelObject} vmo -
     * @param {Object|null} depsMap - optional deps map
     */


    function _processDecorators(decoratatorProviders, vmo) {
      var sublocationName = appCtxSvc.ctx.sublocation ? appCtxSvc.ctx.sublocation.nameToken : null;

      _.forEach(decoratatorProviders, function (decoratorJson, decoratorName) {
        if (!decoratorJson.subLocationName || sublocationName === decoratorJson.subLocationName) {
          var modelTypes = decoratorJson.modelTypes;
          var isValid = false;

          if (_.isArray(modelTypes)) {
            _.forEach(modelTypes, function (modelType) {
              if (modelType) {
                isValid = commandsMapSvc.isInstanceOf(modelType, vmo.modelType);

                if (isValid) {
                  return false; // break
                }
              }
            });
          } else {
            // No supplied modelType to limit to.
            isValid = true;
          }

          if (isValid) {
            if (decoratorJson.conditions) {
              var declViewModel = {
                localContext: {
                  vmo: vmo
                }
              };
              var context = {
                ctx: appCtxSvc.ctx
              };
              var verdict = true;

              for (var condition in decoratorJson.conditions) {
                var expression = decoratorJson.conditions[condition].expression;
                verdict = verdict && conditionSvc.evaluateCondition(declViewModel, expression, context);
              }

              if (verdict) {
                if (decoratorJson.title && decoratorJson.i18n) {
                  vmo.colorTitle = _mapDecoratorI18nKeyToLocalizedTitle[decoratorName + '.' + parsingUtil.getStringBetweenDoubleMustaches(decoratorJson.title)];
                }

                if (decoratorJson.cellClassName) {
                  vmo.cellDecoratorStyle = decoratorJson.cellClassName;
                }

                if (decoratorJson.gridClassName) {
                  vmo.gridDecoratorStyle = decoratorJson.gridClassName;
                }
              }
            } else if (decoratorJson.method && decoratorJson.deps) {
              var _depModuleObj = _getModuleObject(decoratorJson);

              if (_depModuleObj[decoratorJson.method].apply(_depModuleObj, [vmo])) {
                vmo.cellDecoratorStyle = decoratorJson.cellClassName;
                vmo.gridDecoratorStyle = decoratorJson.gridClassName;

                if (decoratorJson.title && decoratorJson.i18n) {
                  vmo.colorTitle = _mapDecoratorI18nKeyToLocalizedTitle[decoratorName + '.' + parsingUtil.getStringBetweenDoubleMustaches(decoratorJson.title)];
                }
              }
            }
          }
        }
      });
    }

    var exports = {};
    /**
     * Sets cell list decorators.
     *
     * @param {ViewModelObject|ViewModelObjectArray} vmoIn - ViewModelObject(s) to set style on.
     * @param {Boolean} skipEvent - if true will skip event.
     */

    exports.setDecoratorStyles = function (vmoIn, skipEvent) {
      var unloadedDepModules = {};
      var sublocationName = appCtxSvc.ctx.sublocation ? appCtxSvc.ctx.sublocation.nameToken : null;

      _.forEach(_decoratorProviders, function (decoratorJson) {
        if ((!sublocationName || sublocationName === decoratorJson.subLocationName) && !_.isEmpty(decoratorJson.deps) && !_mapModuleNameToModuleObject[decoratorJson.deps]) {
          unloadedDepModules[decoratorJson.deps] = true;
        }
      }); // See if loading modules is necessary


      if (!_.isEmpty(unloadedDepModules)) {
        var depsArray = Object.keys(unloadedDepModules);
        declUtils.loadDependentModules(depsArray, $q, app.getInjector()).then(function (depsMap) {
          _.forEach(depsMap, function (moduleObj, moduleName) {
            _mapModuleNameToModuleObject['js/' + moduleName] = moduleObj;
          });

          if (_.isArray(vmoIn)) {
            for (var ndx = 0; ndx < vmoIn.length; ndx++) {
              _processDecorators(_decoratorProviders, vmoIn[ndx]);
            }
          } else {
            _processDecorators(_decoratorProviders, vmoIn);
          }

          if (!skipEvent) {
            eventBus.publish('decoratorsUpdated', vmoIn);
          }
        });
      } else {
        if (_.isArray(vmoIn)) {
          for (var ndx = 0; ndx < vmoIn.length; ndx++) {
            _processDecorators(_decoratorProviders, vmoIn[ndx]);
          }
        } else {
          _processDecorators(_decoratorProviders, vmoIn);
        }

        if (!skipEvent) {
          eventBus.publish('decoratorsUpdated', vmoIn);
        }
      }
    };
    /**
     * API to override generated decorators (used for testing only).
     *
     * @param {Object} decoratorsOverride
     */


    exports.setDecorators = function (decoratorsOverride) {
      _decoratorProviders = decoratorsOverride;
      _mapModuleNameToModuleObject = {};
      _mapModuleNameToServiceName = {};
    };

    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'colorDecoratorService'
  };
});