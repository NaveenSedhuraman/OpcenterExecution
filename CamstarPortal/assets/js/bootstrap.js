"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global requirejs */

/**
 * @module js/bootstrap
 */
requirejs.config({
    "bundles": {},
    "paths": {
        "@swac/base": "lib/@swac/swac-base",
        "@swac/boot": "lib/@swac/swac-boot",
        "@swac/container": "lib/@swac/swac-container",
        "angular-ui-router": "lib/angular-ui-router-0.4.3/angular-ui-router",
        "angular": "lib/angular/angular",
        "ckeditor": "lib/ckeditor/ckeditor",
        "Debug": "lib/debug/debug",
        "hammer": "lib/hammerjs/hammer",
        "highcharts": "lib/highcharts/highcharts",
        "highcharts-3d": "lib/highcharts/highcharts-3d",
        "highcharts-more": "lib/highcharts/highcharts-more",
        "highmaps": "lib/highcharts/highmaps",
        "highstock": "lib/highcharts/highstock",
        "no-data-to-display": "lib/highcharts/modules/no-data-to-display",
        "exporting": "lib/highcharts/modules/exporting",
        "jquerytouch": "lib/jquery-ui-touch-punch/jquery.ui.touch-punch",
        "jquery": "lib/jquery/jquery",
        "jqueryui": "lib/jqueryui-1.12/jqueryui",
        "app": "js/adapters/angularjs/appWrapper",
        "assert": "js/adapters/angularjs/assert",
        "soa": "js/soa",
        "lodash": "lib/lodash/lodash",
        "lzstring": "lib/lz-string/lz-string",
        "vs": "lib/monaco-editor/vs",
        "ui.grid": "lib/uigrid/ui-grid",
        "noty": "lib/noty/jquery.noty",
        "oclazyload": "lib/oclazyload/ocLazyLoad.require",
        "postal": "lib/postal/postal",
        "lib/piwik/analytics": "lib/piwik/analytics",
        "lib/piwik/piwik": "lib/piwik/piwik"
    },
    "shim": {
        "angular-ui-router": {
            "deps": [
                "angular"
            ]
        },
        "angular": {
            "deps": [
                "jquery"
            ],
            "exports": "angular"
        },
        "bootstrap": {
            "deps": [
                "jquery"
            ]
        },
        "highcharts": {
            "deps": [
                "jquery"
            ],
            "exports": "Highcharts"
        },
        "no-data-to-display": {
            "deps": [
                "highcharts"
            ]
        },
        "jquerytouch": {
            "deps": [
                "jqueryui"
            ]
        },
        "app": {
            "deps": [
                "angular-ui-router"
            ]
        },
        "ui.grid": {
            "deps": [
                "angular"
            ]
        },
        "noty": {
            "deps": [
                "jquery"
            ]
        },
        "oclazyload": {
            "deps": [
                "angular"
            ]
        }
    },
    "baseUrl": "assets",
    "waitSeconds": 0
});
/**
 * Load the main application JS file and 'bootstrap' the AngularJS system on this page's document.
 */

requirejs(['app', 'jquery', 'lodash', 'Debug', 'js/contribution.service', 'js/routeChangeHandler', 'js/configurationService', 'js/stateResolveService', 'config/states', 'js/aw_polyfill' ,'js/mom.utils','js/mom.init.service','@swac/base','@swac/boot','@swac/container','angular-ui-router','angular','js/workspaceInitService','jquery','ui.grid','oclazyload','js/splmStatsJsService','js/splmStatsService'
], function (app, $, _, Debug, contributionService, routeChangeHandler, cfgSvc, stateResolveService) {
  'use strict';

  var trace = new Debug('bootstrap');
  trace('postRequireInsertHere:pre'); (function(){_.noConflict();})();
		(function(){requirejs(['js/splmStatsJsService' ],function(splmStatsJsService){splmStatsJsService.install();});})();
		(function(){requirejs([ 'js/splmStatsService' ], function( splmStatsService ){ splmStatsService.installAnalyticsConfig();});})();
		

  trace('postRequireInsertHere:post');

  contributionService.require('states', function (states) {
    // TODO: should probably use require.toUrl('') instead of build processing
    trace('states', states);
    var baseUrl = 'assets';
    var statesCfg = cfgSvc.getCfgCached('states');

    var mergedRoutes = _.merge.apply(this, [statesCfg].concat(states)); // eslint-disable-line no-invalid-this
    // Global parameters that apply to every route


    var globalParameters = ['ah', // hosting enablement
    'debugApp', // debug
    'locale', // locale override
    'logActionActivity', 'logEventBusActivity', 'logLevel', 'logLifeCycle']; // Parameters that should not be in the URL (runtime only)

    var nonUrlParameters = ['validateDefaultRoutePath' // workspace validation
    ];
    var defaultPage = 'portal';
    /**
     * Async load dependency for given state object.
     *
     * @param {Object} state - Object who's dependencies to load.
     *
     * @returns {Promise} Resolved when the dependencies are loaded.
     */

    function createLoad(state) {
      return ['$q', function ($q) {
        return $q(function (resolve) {
          requirejs(state.dependencies, resolve);
        });
      }];
    }
    /**
     * Update given object with global parameters.
     *
     * @param {Object} state - Object to update.
     */


    function updateWithParameters(state) {
      var params = globalParameters.slice(); // copy globalParameters

      if (state.params) {
        params = _.union(params, Object.keys(state.params));
      }

      if (state.parent) {
        var parent = mergedRoutes[state.parent];

        if (parent && parent.params) {
          params = _.union(params, Object.keys(parent.params));
        }
      }

      var urlParams = params.filter(function (p) {
        return nonUrlParameters.indexOf(p) === -1;
      });

      if (urlParams.length > 0) {
        var haveQueryParam = state.url.indexOf('?') !== -1;
        state.url += (haveQueryParam ? '&' : '?') + urlParams.join('&');
      }
    }

    _.forEach(mergedRoutes, function (route) {
      if (route.dependencies) {
        if (route.resolve) {
          route.resolve.load = createLoad(route);
        } else {
          route.resolve = {
            load: createLoad(route)
          };
        }
      } // Create the declarative functions from resolveActions map and set it on the state/route resolve.


      if (route.resolveActions) {
        stateResolveService.updateResolveOnState(route);
      }

      if (route.url && !route.abstract) {
        updateWithParameters(route);
      }
    });

    var routesConfig = {
      defaultRoutePath: defaultPage,
      routes: mergedRoutes
    };
    app.initModule('AwRootAppModule', ['ui.router','ui.grid','ui.grid.selection','ui.grid.resizeColumns','ui.grid.moveColumns','ui.grid.pinning','ui.grid.cellNav','ui.grid.autoResize','ui.grid.infiniteScroll','ui.grid.treeView','oc.lazyLoad'], true, baseUrl, routesConfig, routeChangeHandler);
    trace('postInitInsertHere:pre'); (function(){requirejs( [ 'js/mom.init.service' ], function(){ app.getInjector().get( 'momInitService' ).init(); } );})();
		(function(){requirejs( [ 'js/theme.service' ], function(){ app.getInjector().get( 'themeService' ).init(); } );})();
		(function(){requirejs( [ 'js/aw.narrowMode.service' ], function(){ app.getInjector().get( 'narrowModeService' ).checkNarrowMode(); } );})();
		

    trace('postInitInsertHere:post');
    app.constant('globalParameters', globalParameters);
    var baseUrlPath = app.getBaseUrlPath();
    var mainLink = document.createElement('link');
    mainLink.type = 'text/css';
    mainLink.rel = 'stylesheet';
    mainLink.href = baseUrlPath + '/main.css';
    var uiGridLink = document.createElement('link');
    uiGridLink.type = 'text/css';
    uiGridLink.rel = 'stylesheet';
    uiGridLink.href = baseUrlPath + '/lib/uigrid/ui-grid.min.css';
    $('head').append(mainLink).append(uiGridLink);
  });
});