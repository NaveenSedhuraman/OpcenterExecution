"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2019 Siemens AG

/**
 * **Note:** This module is for internal use only.
 * @module "js/mom.breadcrumb.service"
 * @requires app
 * @requires js/eventBus
 * @requires lodash
 * @requires "js/momc.ctx.service"
 * @ignore
 */

/*global
define
*/

/* eslint-disable require-jsdoc */
define(['app', 'js/eventBus', 'lodash', 'js/mom.ctx.service'], function (app, eventBus, _) {
  'use strict';

  var exports = {};

  var _appCtxSvc;

  var _$state;

  var _momCtxService;

  var _$stateParams;

  var provider = {
    crumbs: [],
    onSelect: function onSelect(crumb) {
      if (crumb.stateId) {
        var state = _$state.get(crumb.stateId);

        var params = {};

        if (crumb.stateParams) {
          params = crumb.stateParams;
        } else {
          if (state && state.data && state.data.params) {
            params = state.data.params;
          }

          Object.getOwnPropertyNames(_$stateParams).forEach(function (pName) {
            if (typeof _$stateParams[pName] === 'string') {
              params[pName] = params[pName] || _$stateParams[pName];
            }
          });
        }

        var reload = _$state.current.name === crumb.stateId;

        _$state.go(crumb.stateId, params, {
          reload: reload
        });
      }
    }
  };

  function locationCrumb(c) {
    var id = c.stateId || _$state.current.name;
    var displayName = c.title;

    if (!displayName) {
      var titles = _appCtxSvc.getCtx('location.titles');

      if (titles) {
        try {
          displayName = _momCtxService._getTitleFromState(id, displayName);
        } catch (e) {
          displayName = null;
        } finally {
          displayName = displayName || titles.headerTitle;
        }
      }
    }

    return {
      displayName: displayName,
      showArrow: c.showArrow || false,
      stateId: id,
      // custom
      stateParams: c.stateParams,
      selectedCrumb: false,
      clicked: false
    };
  }

  function selectionCrumb(title) {
    return {
      displayName: title,
      showArrow: false,
      selectedCrumb: true,
      clicked: false
    };
  }

  function updateLocationTitle(stateId, title) {
    var locationCrumbs = provider.crumbs.filter(function (crumb) {
      return !crumb.selectedCrumb;
    });

    if (locationCrumbs.length > 0) {
      locationCrumbs[locationCrumbs.length - 1].displayName = title;
    }
  }

  function createOrUpdateSelectedCrumb(cfg) {
    if (provider.crumbs.length <= 0) {
      return;
    }

    var config = cfg || _.get(_$state, "current.data.breadcrumbConfig");

    if (config) {
      var selected = _appCtxSvc.getCtx('selected') || {};

      var selectedTitle = _.get(selected, config.selectionTitleField);

      provider.crumbs[provider.crumbs.length - 1].showArrow = false;

      if (config.selectionTitleField && selected !== {} && selectedTitle) {
        if (_typeof(selectedTitle === 'object') && selectedTitle.dbValue) {
          selectedTitle = selectedTitle.dbValue;
        }

        exports.setBreadcrumbSelection(selectedTitle);
      } else {
        exports.unsetBreadcrumbSelection();
      }
    }
  }

  exports.setBreadcrumbSelection = function (title) {
    if (provider.crumbs.length <= 0) {
      return;
    }

    var last = provider.crumbs[provider.crumbs.length - 1];

    if (last && last.selectedCrumb) {
      last.displayName = title;
    } else if (last && last.displayName === title) {// nothing to do
    } else {
      provider.crumbs[provider.crumbs.length - 1].showArrow = true;
      provider.crumbs.push(selectionCrumb(title));
    }
  };

  exports.unsetBreadcrumbSelection = function () {
    if (provider.crumbs.length <= 1) {
      return;
    }

    if (provider.crumbs[provider.crumbs.length - 1].selectedCrumb) {
      provider.crumbs.pop();
      provider.crumbs[provider.crumbs.length - 1].showArrow = false;
    }
  };

  exports.reset = function () {
    provider.crumbs = [];
  };

  exports.provider = function () {
    return provider;
  };

  exports.addLocationCrumb = function (c) {
    provider.crumbs.forEach(function (crumb) {
      crumb.showArrow = true;
    });
    provider.crumbs.push(locationCrumb(c));
  };

  exports.getCrumbs = function () {
    return provider.crumbs;
  };

  exports.select = function (crumb) {
    return provider.onSelect(crumb);
  };

  exports.setCrumbs = function (crumbs, cfg) {
    if (crumbs && crumbs.length > 0) {
      provider.crumbs = crumbs;
      return provider;
    }

    return exports.build(cfg);
  };

  exports.build = function (cfg) {
    var config = cfg || _.get(_$state, "current.data.breadcrumbConfig");

    provider.crumbs = [];
    provider.crumbs.push(locationCrumb({
      showArrow: true
    })); // current location

    while (config && config.parent) {
      var state = _$state.get(config.parent);

      var title;

      if (state && 'data' in state && 'breadcrumbConfig' in state.data) {
        config = state.data.breadcrumbConfig;

        try {
          title = _momCtxService._getTitleFromState(_$state.get(state.parent).name, title);
        } catch (e) {
          title = null;
        }

        title = title || _$state.get(state.parent).data.headerTitle;
        provider.crumbs.push(locationCrumb({
          title: title,
          stateId: state.name,
          showArrow: true
        }));
      }
    }

    provider.crumbs = provider.crumbs.reverse();
    createOrUpdateSelectedCrumb(config);

    if (provider.crumbs.length > 0) {
      provider.crumbs[0].primaryCrumb = true;
    }

    return provider;
  };

  app.factory('momBreadcrumbService', ['appCtxService', '$state', "momCtxService", '$stateParams', function (appCtxService, $state, momCtxService, $stateParams) {
    _appCtxSvc = appCtxService;
    _$state = $state;
    _momCtxService = momCtxService;
    _$stateParams = $stateParams; // Update breadcrumb when location title changes or an item is selected

    eventBus.subscribe('appCtx.update', function (data) {
      if (data.name === 'location.titles' && data.value) {
        updateLocationTitle(_$state.current.name, data.value.headerTitle);
      } else if (data.name === 'selected') {
        createOrUpdateSelectedCrumb();
      }
    });
    eventBus.subscribe('appCtx.register', function (data) {
      if (data.name === 'selected') {
        createOrUpdateSelectedCrumb();
      }
    });
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'momBreadcrumbService'
  };
});