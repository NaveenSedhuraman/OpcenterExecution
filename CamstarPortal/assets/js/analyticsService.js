"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* eslint-disable new-cap */

/* eslint-disable no-undef */

/* global define
 */

/**
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/Apollo-Analytics|Apollo-Analytics}
 *
 * @module js/analyticsService
 *
 * @publishedApolloService
 *
 */
define(['app', 'jquery', 'lodash', 'js/logger', 'js/declUtils', 'js/configurationService'], function (app, $, _, logger, declUtils, cfgSvc) {
  'use strict';
  /**
   * This flag indicates if analytics are enabled for this session.
   *
   * @type { {Array.<string>}}
   * @private
   */

  var exports = {};

  var _$q = $.Deferred();

  var _delegateService;

  var eventsToInclude = [];
  /**
   * This API populates the eventsToInclude array based on the passed analytics config.
   * @param {JSON} analyticsJson - The Analytics JSON configuration.
   * @ignore
   */

  function _populateEventsToPublish(analyticsJson) {
    if (analyticsJson && analyticsJson.events) {
      var analyticsEvents = analyticsJson.events;

      if (analyticsEvents.include && analyticsEvents.include.length) {
        _.forEach(analyticsEvents.include, function (toInclude) {
          eventsToInclude.push(toInclude.toLowerCase());
        });
      }
    }
  }
  /**
   * This API returns true if publishAll events is enabled.
   * @returns {Boolean} true if publishAll is enabled, false otherwise.
   * @ignore
   */


  function _isPublishAllEnabled() {
    return eventsToInclude.length === 0;
  }
  /**
   * This API checks if the passed eventType should be published or not.
   * @param {String} eventType - The analytics event type to check.
   * @returns {Boolean} true if event needs to be published, false otherwise.
   * @ignore
   */


  function _shouldPublishEvent(eventType) {
    if (_isPublishAllEnabled() || eventType === undefined) {
      return true;
    }

    if (eventsToInclude.length && eventsToInclude.includes(eventType.toLowerCase())) {
      return true;
    }

    return false;
  }
  /**
   * responsible for choosing the appropriate analyticsService logic to be used. resolve the promise with the
   * appropriate analyticsService.
   *
   * @return {Promise} returns a promise to be resolved once the correct analyticsService is chosen.
   */


  function _pickAnalyticsService() {
    if (_delegateService) {
      // if an analyticsService is already set, just use it.
      return _$q.resolve(_delegateService);
    }

    var solution = cfgSvc.getCfgCached('solutionDef');

    if (!solution) {
      return new Promise(function (resolve, reject) {
        _.defer(function () {
          _pickAnalyticsService().then(resolve).catch(reject);
        });
      });
    }

    var name = solution.analytics;

    if (name) {
      var $injector = app.getInjector().get('$injector');
      var $q = app.getInjector().get('$q');
      return declUtils.loadDependentModule('config/analytics', $q, $injector).then(function () {
        var analyticsProviders = cfgSvc.getCfgCached('analytics');
        return declUtils.loadDependentModule(analyticsProviders[name].dep, $q, $injector).then(function (depModuleObj) {
          if (!depModuleObj) {
            logger.error('Could not load the analytics module ' + depModuleObj);
          }

          _populateEventsToPublish(analyticsProviders[name]);

          _delegateService = depModuleObj;
          return _delegateService;
        });
      });
    }

    return _$q.reject();
  }
  /**
   * This method should be invoked upon successful authentication a backend server. It should not be invoked upon
   * client side page refresh if the previous server session is reused. This method should be called 0 or 1 times per
   * session.
   */


  exports.authenticationSuccessful = function () {
    if (_delegateService) {
      _delegateService.authenticationSuccessful();
    } else {
      _pickAnalyticsService().then(function (_delegateService) {
        _delegateService.authenticationSuccessful();
      });
    }
  };
  /**
   * This method should be invoked before the enable() method.
   * This sets the data that the will be used by the initialization process during the enable.
   *
   * @param {map} preInitData Map of key value pairs. "user_id" and "vendor_id" are the two supported keys.
   * @return {Promise} promise
   */


  exports.setPreInitData = function (preInitData) {
    // Vendor ID is used to hash the user ID, so if we don't have the vendor ID we shouldnt be sending the user ID.
    if (!preInitData.vendor_id) {
      preInitData.user_id = '';
    }

    if (_delegateService) {
      return _$q.resolve(_delegateService.setPreInitData(preInitData));
    }

    return _pickAnalyticsService().then(function (_delegateService) {
      _delegateService.setPreInitData(preInitData);
    });
  };
  /**
   * This method should be called when the client determines that Analytics logging should be enabled. This method
   * should be called 0 or 1 times per session.
   *
   * @param {Boolean} useInternalServer Log to the InternalServer
   * @return {Promise} promise
   */


  exports.enable = function (useInternalServer) {
    if (_delegateService) {
      return _delegateService.enable(useInternalServer).then(function () {
        exports.logPageViewEvent();
      });
    }

    return _pickAnalyticsService().then(function (_delegateService) {
      _delegateService.enable(useInternalServer).then(function () {
        exports.logPageViewEvent();
      });
    });
  };
  /**
   * This method should be used by the client to log a command to the Analytics server.
   * This method can be called whether Analytics has been enabled or not.
   *
   * @param {Object} data - value of the event. It can be a simple string, a JSON string, or empty. No other data
   *            types are supported.
   * @ignore
   */


  exports.logCommands = function (data) {
    if (_delegateService) {
      var analyticsType = data && data.sanAnalyticsType;

      if (_shouldPublishEvent(analyticsType)) {
        _delegateService.logCommands(data);
      }
    }
  };
  /**
   * This method should be used by the client to log an event to the Analytics server. This method can be called
   * whether Analytics has been enabled or not.
   *
   * @param {String} name - name of an event
   * @param {Object} property - value of the event. It can be a simple string, a JSON string, or empty. No other data
   *            types are supported.
   */


  exports.logAnalyticsEvent = function (name, property) {
    if (_delegateService) {
      var analyticsType = property && property.sanAnalyticsType;

      if (_shouldPublishEvent(analyticsType)) {
        _delegateService.logEvent(name, property);
      }
    }
  };
  /**
   * This method should be used to log Page Load data.
   * @param {Object} data The data to be Logged
   */


  exports.logPageViewEvent = function (data) {
    if (_delegateService) {
      if (_shouldPublishEvent('Page Views')) {
        _delegateService.logPageViewEvent(data);
      }
    }
  };
  /**
   * This method should be used by the client to log an event to the Analytics server. This method can be called
   * whether Analytics has been enabled or not.
   *
   * @param {String} name - name of an event
   * @param {Object} property - value of the event. It can be a simple string, a JSON string, or empty. No other data
   *            types are supported.
   * @ignore
   */


  exports.logEvent = function (name, property) {
    if (_delegateService) {
      _delegateService.logEvent(name, property);
    }
  };
  /**
   * This method should be used by the client to log an event to the Analytics server. This method can be called
   * whether Analytics has been enabled or not.
   *
   * @param {String} name - name of an event
   * @param {Object} property - value of the event. It can be a simple string, a JSON string, or empty. No other data
   *            types are supported.
   */


  exports.logProductInfo = function (name, property) {
    if (_delegateService) {
      _delegateService.logProductInfo(name, property);
    }
  };
  /**
   * This method should be called when the client determines that Analytics logging should be disabled. This method
   * should be called 0 or 1 times per session.
   *
   * The Opt-out state is stored in the localStorage. San itself can rememeber the opt-out state.
   * But, we want to be sure on our end as well.
   *
   * @param {Boolean} useInternalServer log to the internal server
   * @param {String}  encVendId encrypted Vendor Id
   */


  exports.disable = function (useInternalServer, encVendId) {
    if (_delegateService) {
      _delegateService.disable(useInternalServer, encVendId);
    }
  };
  /**
   * This method should be used by the client to check if an UI artifact can be logged to Analytics.
   *
   *
   * @param {String} artifactName - name of an the UI artifact to be checked to see if it is okay to log to analytics
   * @param {String} artifactType - Type of the artifact. The following is the list of Valid values are:
   *                                  "Theme", "Command", and "Page"
   * @returns {String} - value to report
   */


  exports.publishableValue = function (artifactName, artifactType) {
    if (_delegateService) {
      return _delegateService.publishableValue(artifactName, artifactType);
    }
  };

  return exports;
});