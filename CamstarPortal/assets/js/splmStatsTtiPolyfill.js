"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/**
 * A modified version of tti-profill done by BigClayClay
 * 
 * https://github.com/GoogleChromeLabs/tti-polyfill
 *
 * @module js/splmStatsTtiPolyfill
 *
 * @publishedApolloService
 *
 */
define([//
'app', 'lodash', 'js/logger', 'js/eventBus', 'js/splmStatsXhrService', 'js/splmStatsConstants'], function (app, _, logger, eventBus, splmStatsXhrService, _t) {
  'use strict';
  /**
   * Instances of this class represent TTIpolyfill
   *
   * @class SPLMStatsTtiPolyfill
   */

  function SPLMStatsTtiPolyfill() {
    var self = this;
    /**
     * Time to wait for $digest cycles to make sure no more.
     */

    var LAST_DIGEST_BUSY_WAIT = 200;
    var _isRunning = false;
    var _interval = LAST_DIGEST_BUSY_WAIT;
    var _resetPingBusyDebounce_ = null;

    var _startJSLoopTimer = function _startJSLoopTimer(deferred) {
      setTimeout(function (deferred) {
        if (deferred) {
          deferred.resolve(true);
        }
      }, _t.const.ERROR_MAX_CAPTURE_TIME);
      return deferred.promise;
    };

    self.setInterval = function (interval) {
      _interval = interval > 0 ? interval : LAST_DIGEST_BUSY_WAIT;
    };

    self.isRunning = function () {
      return _isRunning;
    };

    self.resetPingBusyDebounce = function () {
      if (_resetPingBusyDebounce_) {
        _resetPingBusyDebounce_();
      }
    };

    self.waitForPageToLoad = function () {
      var _observer = null;
      var _lockWatcher = null;
      var _digestLock = true;
      var q = app.getInjector().get('$q');
      var defer = q.defer();
      var timerDefer = q.defer();
      var _locListener = null;
      var _commandListener = null;
      var _debounceCount = 0;

      if (!_isRunning) {
        var rootScope = app.getInjector().get('$rootScope');
        var timeout = app.getInjector().get('$timeout');

        var _pingBusyDebounce = _.debounce(function () {
          _debounceCount++;

          if (splmStatsXhrService.getCount() > 0) {
            _resetPingBusyDebounce();
          } else {
            if (!_digestLock && _isRunning && _debounceCount > 1) {
              _isRunning = false;

              _lockWatcher();

              _locListener();

              eventBus.unsubscribe(_commandListener);

              if (_observer) {
                _observer.disconnect();
              }

              timerDefer.resolve(true);
              defer.resolve();
              _debounceCount = 0;
            } else {
              _pingBusyDebounce.cancel();

              _pingBusyDebounce();
            }
          }
        }, _interval, {
          maxWait: 10000,
          trailing: true,
          leading: false
        });

        var _pingBusyDebounceTimer = function _pingBusyDebounceTimer() {
          // Runs after last digest cycle...
          _digestLock = false;

          _pingBusyDebounce();
        }; // This method is the key magic to cover:
        // - extra long digest
        // - extra long css flow
        // - non-angularJS top method
        // - If we have already resolved our promise, disregard any further scheduling until we cleanup listeners


        var _resetPingBusyDebounce = function _resetPingBusyDebounce() {
          if (_isRunning) {
            _pingBusyDebounce.cancel();

            timeout(_pingBusyDebounceTimer, 0, false);
          }
        };

        _resetPingBusyDebounce_ = _resetPingBusyDebounce;
        _lockWatcher = rootScope.$watch(function () {
          _digestLock = true;

          _resetPingBusyDebounce();
        });
        _locListener = rootScope.$on('$locationChangeStart', function () {
          _resetPingBusyDebounce();
        });
        _commandListener = eventBus.subscribe('aw-command-logEvent', function () {
          _resetPingBusyDebounce();
        }); // Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
        // have WebKitMutationObserver but not un-prefixed MutationObserver.
        // Some browser doesn't have both.
        // https://developer.mozilla.org/docs/Web/API/MutationObserver

        var BrowserMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        if (BrowserMutationObserver) {
          _observer = new BrowserMutationObserver(function () {
            _digestLock = true;

            _resetPingBusyDebounce();
          });
          var config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
          };

          _observer.observe(document, config);
        }

        _startJSLoopTimer(timerDefer).then(function (successful) {
          if (!successful) {
            logger.error(_t.const.ERROR_MAX_CAPTURE_TIME_LOG);
          }
        });

        _pingBusyDebounce();

        _isRunning = true;
      }

      return defer.promise;
    };

    return self;
  }

  return SPLMStatsTtiPolyfill;
});