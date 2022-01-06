"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Reporter for Mobile Devices
 *
 * @module js/splmStatsMobileReporter
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'js/logger', 'lodash', 'js/splmStatsConstants', 'js/messagingService', 'js/aw-message-params.directive'], function (app, logger, _, _t, messagingService) {
  'use strict';
  /**
   * Instances of this class represent a reporter for Mobile Devices
   *
   * @class SPLMStatsMobileReporter
   */

  function SPLMStatsMobileReporter() {
    var self = this;

    self.report = function (obj) {
      var failedRequests = obj.XHR.errorInfo.requestsAborted.concat(obj.XHR.errorInfo.requestsErrored).concat(obj.XHR.errorInfo.requestsTimeout);
      var $injector = app.getInjector().get('$injector');

      var _inj = _.debounce(function () {
        $injector.invoke(['messagingService', function (messagingService) {
          var objStr = 'Performance Metrics:';
          objStr += '\nTTI: ' + obj.TTI.toFixed(3) + 'ms';
          objStr += '\nTotal Network Time: ' + obj.totalNetworkTime.toFixed(3) + 'ms';
          objStr += '\nXHR Request Count: ' + obj.XHR.details.length;
          objStr += '\nFailed XHR Count: ' + failedRequests.length;
          objStr += '\nDOMNodes: ' + obj.DOM.elemCount;
          objStr += '\nDOMTree Depth: ' + obj.DOM.DOMTreeDepth;
          objStr += '\nAngular Digest Cycles: ' + obj.AngularJS.DigestCycles;
          messagingService.showInfo(objStr);
        }]);
      }, 1000, {
        leading: false,
        trailing: true
      });

      _inj();
    };

    return self;
  }

  return SPLMStatsMobileReporter;
});