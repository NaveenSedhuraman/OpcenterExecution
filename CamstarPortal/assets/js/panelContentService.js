"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * This service is used to manage the configuration for fetching the View and ViewModel files.
 *
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/solution#solution-configuration-for-obtaining-declarative-view-and-view-model|Solution configuration for obtaining declarative View and View Model}
 *
 * @module js/panelContentService
 *
 * @publishedApolloService
 */
define(['app', 'lodash', 'js/declUtils', 'js/logger', 'js/eventBus', 'js/configurationService', 'js/actionService', 'js/viewModelProcessingFactory', 'js/appCtxService', 'js/viewModelService', 'config/viewAndViewModelRepoConfiguration'], function (app, _, declUtils, logger, eventBus, cfgSvc) {
  'use strict';

  var exports = {};

  var _$http;

  var _$q;

  var _$rootScope;

  var _$templateCache;

  var _$interpolate;

  var _actionSvc;

  var _cfgSvc;

  var _vmProcFactory;

  var _appCtxSvc;

  var _viewModelService;

  var _darsiViews = [];
  /**
   * Return the view model and view for the given declViewAndViewModel Id.
   *
   * @param {String} declViewAndViewModelId - ID of the View and ViewModel.
   *
   * @return {promise} Object with 'view' and 'viewModel' set.
   */

  exports.getPanelContent = function (declViewAndViewModelId) {
    return getViewAndViewModel(declViewAndViewModelId, false);
  };
  /**
   * Fetch ViewModel JSON
   *
   * @param {String} declViewModelId - id of viewModel
   *
   * @return {promise} Object with 'viewModel' set.
   */


  exports.getViewModelById = function (declViewModelId) {
    return getViewAndViewModel(declViewModelId, true);
  };
  /**
   * Fetch View and ViewModelJson using Rest API.
   *
   * @param {String} declViewAndViewModelId - ...
   * @param {Object} viewAndViewModelRepoConfiguration - ...
   *
   * @return {Promise} Resolved when 'post' is complete.
   */


  var callRestAPI = function callRestAPI(declViewAndViewModelId, viewAndViewModelRepoConfiguration) {
    viewAndViewModelRepoConfiguration.inputData.panelId = declViewAndViewModelId;
    return _$http.post(viewAndViewModelRepoConfiguration.url, viewAndViewModelRepoConfiguration.inputData);
  };
  /**
   * Fetch View and ViewModelJson using SOA .
   *
   * @param {String} declViewAndViewModelId - ...
   * @param {Object} viewAndViewModelRepoConfiguration - ...
   *
   * @return {Promise} Resolved when 'SOA Action' is complete.
   */


  var callSOA = function callSOA(declViewAndViewModelId, viewAndViewModelRepoConfiguration) {
    /*
     * ========= Get the view and viewmodel from SOA and prepare promise =========
     */
    viewAndViewModelRepoConfiguration.inputData.panelId = declViewAndViewModelId;
    return _actionSvc.performSOAAction(viewAndViewModelRepoConfiguration);
  };
  /**
   * Fetch View and ViewModelJson using GET Url.
   *
   * @param {String} declViewId - ...
   * @param {String} declViewModelId - ...
   * @param {Object} viewAndViewModelRepoConfiguration - ...
   *
   * @return {Promise} Resolved whe operation is complete.
   */


  var callGET = function callGET(declViewId, declViewModelId, viewAndViewModelRepoConfiguration) {
    if (logger.isDeclarativeLogEnabled()) {
      logger.declarativeLog('DECLARATIVE TRACE - Loading View/View Model ' + declViewModelId);
    }

    var viewAndViewModelUrl = {};
    var parseContext = {
      baseUrl: app.getBaseUrlPath(),
      declViewModelId: declViewModelId
    };
    viewAndViewModelUrl.view = _$interpolate(viewAndViewModelRepoConfiguration.viewUrl)(parseContext);
    viewAndViewModelUrl.viewModel = _$interpolate(viewAndViewModelRepoConfiguration.viewModelUrl)(parseContext);
    var promises = [];
    var viewAndViewModelResponse = {};

    if (declViewId) {
      // Check if already there in template cache.
      var htmlString = null;

      if (!_cfgSvc.isDarsiEnabled() || _darsiViews.includes(viewAndViewModelUrl.view)) {
        htmlString = _$templateCache.get(viewAndViewModelUrl.view);
      }

      viewAndViewModelResponse.viewUrl = viewAndViewModelUrl.view;

      if (htmlString) {
        viewAndViewModelResponse.view = htmlString;
      } else {
        promises.push(_$http.get(viewAndViewModelUrl.view, {
          cache: true
        }).then(function (response) {
          viewAndViewModelResponse.view = response.data;

          _$templateCache.put(viewAndViewModelUrl.view, viewAndViewModelResponse.view);

          _darsiViews.push(viewAndViewModelUrl.view);

          return response;
        }));
      }
    }

    if (declViewModelId) {
      // Through configurationService, get the intended ViewModel, now from "a ViewModels bundle",
      // But before that get that "viewModels bundle" name from "moduleViewModelsMap", residing in assets/config
      promises.push(_cfgSvc.getCfg('viewmodel.' + declViewModelId).then(function (viewModel) {
        // Get the deep clone of the viewmodel object so that original (cached) value remains intact.
        viewAndViewModelResponse.viewModel = _.cloneDeep(viewModel);
        viewAndViewModelResponse.viewModel.skipClone = true;
        return viewAndViewModelResponse.viewModel; // ensure we're done with clone before returning
      }));
    }

    return _$q.all(promises).then(function () {
      return viewAndViewModelResponse;
    });
  };
  /**
   * Fetch the viewAndViewModelRepoConfiguration and validate it before returning it.
   *
   * @return {Object} viewAndViewModelRepoConfiguration
   */


  function getViewAndViewModelRepoConfiguration() {
    var viewAndViewModelRepoConfiguration = cfgSvc.getCfgCached('viewAndViewModelRepoConfiguration');

    if (viewAndViewModelRepoConfiguration && viewAndViewModelRepoConfiguration.actionType) {
      if (viewAndViewModelRepoConfiguration.viewUrl) {
        if (viewAndViewModelRepoConfiguration.viewUrl === '{{baseUrl}}') {
          viewAndViewModelRepoConfiguration.viewUrl = '{{baseUrl}}/html/';
        }

        if (viewAndViewModelRepoConfiguration.viewUrl && viewAndViewModelRepoConfiguration.viewUrl.indexOf('{{declViewModelId}}') === -1) {
          viewAndViewModelRepoConfiguration.viewUrl += '{{declViewModelId}}View.html';
        }

        if (viewAndViewModelRepoConfiguration.viewModelUrl === '{{baseUrl}}') {
          viewAndViewModelRepoConfiguration.viewModelUrl = '{{baseUrl}}/viewmodel/';
        }

        if (viewAndViewModelRepoConfiguration.viewModelUrl && viewAndViewModelRepoConfiguration.viewModelUrl.indexOf('{{declViewModelId}}') === -1) {
          viewAndViewModelRepoConfiguration.viewModelUrl += '{{declViewModelId}}ViewModel.json';
        }
      }

      return viewAndViewModelRepoConfiguration;
    }

    return {
      actionType: 'GET',
      viewUrl: '{{baseUrl}}/html/{{declViewModelId}}View.html',
      viewModelUrl: '{{baseUrl}}/viewmodel/{{declViewModelId}}ViewModel.json'
    };
  }
  /**
   * Fetch View and ViewModelJson using viewAndViewModelRepoConfiguration.
   *
   * @param {String} declViewModelId - ID of the View and ViewModel.
   * @returns {Object} Object with 'view' and 'viewModel' strings.
   */


  function getViewAndViewModelPaths(declViewModelId) {
    var viewAndViewModelRepoConfiguration = getViewAndViewModelRepoConfiguration();
    var parseContext = {
      baseUrl: app.getBaseUrlPath(),
      declViewModelId: declViewModelId
    };
    return {
      view: _$interpolate(viewAndViewModelRepoConfiguration.viewUrl)(parseContext),
      viewModel: _$interpolate(viewAndViewModelRepoConfiguration.viewModelUrl)(parseContext)
    };
  }
  /**
   * Fetch View and ViewModelJson using viewAndViewModelRepoConfiguration.
   *
   * @param {String} declViewAndViewModelId - ID of the View and ViewModel.
   *
   * @param {Boolean} getViewModelOnly - true if only 'viewmodel' is expected.
   *
   * @return {promise} Object with 'view'(optional) and 'viewModel' set.
   */


  var getViewAndViewModel = function getViewAndViewModel(declViewAndViewModelId, getViewModelOnly) {
    var viewAndViewModelRepoConfiguration = getViewAndViewModelRepoConfiguration();

    if (declUtils.isNil(viewAndViewModelRepoConfiguration)) {
      logger.error('viewAndViewModelRepoConfiguration is missing');
      return _$q.reject('viewAndViewModelRepoConfiguration is missing');
    }

    var promise;

    if (viewAndViewModelRepoConfiguration.actionType === 'GET') {
      if (getViewModelOnly) {
        promise = callGET(null, declViewAndViewModelId, viewAndViewModelRepoConfiguration); // Mock the configuration output Data for this case where we are loading the view and view model by direct url to the files

        viewAndViewModelRepoConfiguration = {
          outputData: {
            viewModel: 'viewModel'
          }
        };
      } else {
        promise = callGET(declViewAndViewModelId, declViewAndViewModelId, viewAndViewModelRepoConfiguration); // Mock the configuration output Data for this case where we are loading the view and view model by direct url to the files

        viewAndViewModelRepoConfiguration = {
          outputData: {
            view: 'view',
            viewModel: 'viewModel'
          }
        };
      }
    } else if (viewAndViewModelRepoConfiguration.actionType === 'RESTService') {
      promise = callRestAPI(declViewAndViewModelId, viewAndViewModelRepoConfiguration);
    } else if (viewAndViewModelRepoConfiguration.actionType === 'TcSoaService') {
      promise = callSOA(declViewAndViewModelId, viewAndViewModelRepoConfiguration);
    } else {
      var declViewModel = _vmProcFactory.createDeclViewModel({
        _viewModelId: '__panelContentSvc'
      });

      var dataCtxNode = _$rootScope.$new();

      dataCtxNode.name = declViewAndViewModelId;
      dataCtxNode.ctx = _appCtxSvc.ctx;
      dataCtxNode.baseUrl = app.getBaseUrlPath();

      _viewModelService.setupLifeCycle(dataCtxNode, declViewModel);

      promise = declUtils.loadDependentModule(viewAndViewModelRepoConfiguration.deps, _$q, app.getInjector()).then(function (depModuleObj) {
        return _actionSvc.executeAction(declViewModel, viewAndViewModelRepoConfiguration, dataCtxNode, depModuleObj);
      }).finally(function () {
        dataCtxNode.$destroy();
      });
    }
    /*
     * ========= Process the returned promise =========
     */


    return promise.then(function (response) {
      var viewAndViewModel = {};

      if (!declUtils.isNil(response)) {
        if (!getViewModelOnly) {
          viewAndViewModel.view = _.get(response, viewAndViewModelRepoConfiguration.outputData.view);
        }

        viewAndViewModel.viewUrl = response.viewUrl;
        viewAndViewModel.viewModel = _.get(response, viewAndViewModelRepoConfiguration.outputData.viewModel);
        viewAndViewModel.viewModel._viewModelId = declViewAndViewModelId;
        viewAndViewModel.viewModel.skipClone = true;
        return viewAndViewModel;
      }

      logger.error('Invalid response received');
      throw new Error('Invalid response received');
    });
  };
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * @memberof NgServices
   * @member panelContentService
   */


  app.factory('panelContentService', ['$http', '$q', '$rootScope', '$templateCache', '$interpolate', '$cacheFactory', 'actionService', 'configurationService', 'viewModelProcessingFactory', 'appCtxService', 'viewModelService', function ($http, $q, $rootScope, $templateCache, $interpolate, $cacheFactory, actionSvc, cfgSvc, vmProcFactory, appCtxService, viewModelService) {
    _$http = $http;
    _$q = $q;
    _$rootScope = $rootScope;
    _$templateCache = $templateCache;
    _$interpolate = $interpolate;
    _actionSvc = actionSvc;
    _cfgSvc = cfgSvc;
    _vmProcFactory = vmProcFactory;
    _appCtxSvc = appCtxService;
    _viewModelService = viewModelService;
    eventBus.subscribe('configurationChange.viewmodel', function (data) {
      var viewModelName = data.path.split('.')[1];
      var paths = getViewAndViewModelPaths(viewModelName);
      $cacheFactory.get('$http').remove(paths.view);
      $cacheFactory.get('$http').remove(paths.viewModel);
      $templateCache.remove(paths.view);
    });
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'panelContentService'
  };
});