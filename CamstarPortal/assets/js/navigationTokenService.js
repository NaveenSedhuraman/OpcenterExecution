"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global define requirejs */

/**
 * @module js/navigationTokenService
 */
define(['app', 'lodash', 'js/configurationService', 'js/adapterParserService', 'js/viewModelObjectService', 'js/declarativeDataCtxService', 'js/viewModelService', 'js/navigationService'], function (app, _) {
  'use strict';

  var _navigationToken;

  var exports = {};

  var _adapterParserSvc;

  var _declarativeDataCtxSvc;

  var _navigationService;

  var _viewModelSvc;

  var _viewModelObjectSvc;

  var _cfgSvc; // A property is which type of BO will be driven by solution config , based on the same naivigationToken will be associated in the href attribute of 
  // anchor tag for the particular property
  // Example : 

  /* [{"conditions": {"$and": [{ "modelType.typeHierarchyArray": { "$in": "ImanFile" }}]}, 
       "navigations": {"navigateTo": "downloadFile","navigationParams": {"uid": "{{navContext.vmo.uid}}"}  }    
      },    
      {"conditions": {"modelType.typeHierarchyArray": {"$notin": "ImanFile"}},
       "navigations": {"navigateTo": "com_siemens_splm_clientfx_tcui_xrt_showObject","navigationParams": {"uid": "{{navContext.vmo.uid}}" }  }    
      }
      ]
  */


  exports.getNavigationContent = function (scope, dbValue) {
    var conditionVerdict = {};
    return _cfgSvc.getCfg('navigationURLToken').then(function (token) {
      _navigationToken = token;

      if (_navigationToken) {
        var propVmo = _viewModelObjectSvc.createViewModelObject(dbValue);

        scope.navContext = {
          vmo: propVmo
        };
        conditionVerdict = _adapterParserSvc.applyConditions(propVmo, _navigationToken);

        if (conditionVerdict && conditionVerdict.verdict) {
          var inputData = _.cloneDeep(_navigationToken[conditionVerdict.index].navigations.navigationParams);

          try {
            _declarativeDataCtxSvc.applyScope(_viewModelSvc.getViewModel(scope, true), inputData, null, scope, null);
          } catch (error) {
            throw new Error(error);
          }

          return _declarativeDataCtxSvc.applyExpression(inputData).then(function () {
            return _navigationService.navigate(_navigationToken[conditionVerdict.index].navigations, inputData).then(function (url) {
              return url;
            });
          });
        }
      }
    });
  };
  /**
   * This service .
   *
   * @memberof NgServices
   * @member navigationTokenService
   *
   * @param {configurationService} cfgSvc - Service to use.
   *
   * @returns {navigationTokenService} Reference to service API Object.
   */


  app.factory('navigationTokenService', ['configurationService', 'adapterParserService', 'declarativeDataCtxService', 'navigationService', 'viewModelService', 'viewModelObjectService', function (cfgSvc, adapterParserService, declarativeDataCtxSvc, navigationService, viewModelSvc, viewModelObjectService) {
    _cfgSvc = cfgSvc;
    _adapterParserSvc = adapterParserService;
    _declarativeDataCtxSvc = declarativeDataCtxSvc;
    _navigationService = navigationService;
    _viewModelSvc = viewModelSvc;
    _viewModelObjectSvc = viewModelObjectService;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which service
   * should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'navigationTokenService'
  };
});