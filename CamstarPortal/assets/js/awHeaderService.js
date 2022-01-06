"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/awHeaderService
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'js/appCtxService', 'js/localeService', 'js/page.service', 'js/configurationService', 'js/breadCrumbService'], function (app, _, eventBus, logger) {
  'use strict';

  var contextName = 'location.titles';
  var exports = {};

  var _stateSvc;

  var _document;

  var _appCtxService;

  var _localeSvc;

  var _cfgSvc;

  var _$q;

  var _breadCrumbSvc;

  exports.getTitles = function () {
    var output = {};
    var promises = [];
    promises.push(_cfgSvc.getCfg('solutionDef').then(function (solution) {
      var browserTitle = solution ? solution.browserTitle : 'Apollo';
      output.browserTitle = browserTitle;
      return output;
    }));
    ['browserSubTitle', 'headerTitle'].forEach(function (key) {
      var property = _stateSvc.current.data[key];

      if (property) {
        if (typeof property === 'string') {
          output[key] = property;
          promises.push(_$q.when(output));
        } else {
          promises.push(_localeSvc.getLocalizedText(property.source, property.key).then(function (result) {
            output[key] = result;
            return output;
          }));
        }
      }
    });
    return _$q.all(promises).then(function () {
      return output;
    });
  };

  exports.updateBreadCrumb = function (eventData) {
    var output = {};
    output.breadcrumbConfig = _appCtxService.getCtx('breadCrumbConfig');
    output.breadCrumbProvider = _breadCrumbSvc.refreshBreadcrumbProvider(output.breadcrumbConfig, _appCtxService.getCtx('mselected'), eventData.searchFilterCategories, eventData.searchFilterMap, _stateSvc.current.data.params.searchCriteria, _stateSvc.current.data.label, true);
    return output;
  };

  exports.updateDocumentTitles = function () {
    _document[0].title = _appCtxService.ctx[contextName].browserTitle + (_appCtxService.ctx[contextName].browserSubTitle ? ' - ' + _appCtxService.ctx[contextName].browserSubTitle : '');
  };

  exports.constructTabs = function (subPages) {
    var subLocationTabs = [];
    var promises = [];

    var constructTabFromState = function constructTabFromState(name, pageId, priority, isSelected, stateName, selectWhen) {
      return {
        classValue: 'aw-base-tabTitle',
        name: name,
        displayTab: true,
        pageId: pageId,
        priority: priority,
        selectedTab: isSelected,
        state: stateName,
        selectWhen: selectWhen,
        visible: true
      };
    };

    subPages.sort(function (a, b) {
      return a.priority - b.priority;
    });

    _.forEach(subPages, function (page, index) {
      var label = page.data.label;
      var isSelectedTab = page === _stateSvc.current;
      var priority = page.data.priority ? page.data.priority : 0;
      var stateName = page.name;

      if (label) {
        var selectWhen = 'data.subLocationTabCond.currentTab === \'' + stateName + '\'';

        if (_.isString(label)) {
          subLocationTabs.push(constructTabFromState(label, index, priority, isSelectedTab, stateName, selectWhen));
          promises.push(_$q.when());
        } else {
          promises.push(_localeSvc.getLocalizedText(label.source, label.key).then(function (result) {
            subLocationTabs.push(constructTabFromState(result, index, priority, isSelectedTab, stateName, selectWhen));
          }));
        }
      }
    });

    return _$q.all(promises).then(function () {
      return subLocationTabs;
    });
  };

  exports.switchSubLocation = function (pageId, tabTitle, tabsModel) {
    var title = tabTitle || pageId;
    var tabToSelect = tabsModel.find(function (tab) {
      return tab.name === title;
    });

    if (tabToSelect) {
      // When the tab widget is forced to update after the state has already changed it will still trigger callback
      if (tabToSelect.state !== _stateSvc.current.name) {
        if (tabToSelect.params) {
          _stateSvc.go(tabToSelect.state, tabToSelect.params);
        } else {
          _stateSvc.go(tabToSelect.state);
        }
      }
    } else {
      logger.error('Missing tab was selected: ' + tabTitle);
    }
  };
  /**
   * @memberof NgServices
   * @member mockTableDataService
   */


  app.factory('awHeaderService', ['$q', '$document', '$state', 'localeService', 'appCtxService', 'pageService', 'configurationService', 'breadCrumbService', function ($q, $document, $state, localeService, appCtxService, pageService, configurationService, breadCrumbService) {
    _$q = $q;
    _document = $document;
    _localeSvc = localeService;
    _stateSvc = $state;
    _cfgSvc = configurationService;
    _appCtxService = appCtxService;
    _breadCrumbSvc = breadCrumbService;
    return exports;
  }]);
  /**
   * Since this module can be loaded as a dependent DUI module we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'awHeaderService'
  };
});