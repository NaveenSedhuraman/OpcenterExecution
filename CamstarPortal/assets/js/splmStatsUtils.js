"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This utility module provides helpful functions intended to efficiently manipulate pltable contents.
 *
 * @module js/splmStatsUtils
 */
define(['app', 'angular', 'lodash', 'js/splmStatsConstants'], function (app, ngModule, _, _t) {
  'use strict';

  var exports = {};
  var _costlyWidgets = {};
  /**
   * Locate the closest parent element
   * http://stackoverflow.com/a/24107550/888165
   *
   * @param {DOMElement} element element to start search
   *
   * @param {String} selector css selector to use in locating closest element
   *
   * @param {Int} maxLevelsUp the maximum levels up to search
   *
   * @returns {DOMElement} the closeest parent element
   */

  exports.countWatchersFn = function () {
    var _$rootScope = app.getInjector().get('$rootScope');

    var q = [_$rootScope];
    var watchers = 0;
    var scope;

    while (q.length > 0) {
      scope = q.pop();

      if (scope.$$watchers) {
        watchers += scope.$$watchers.length;
      }

      if (scope.$$childHead) {
        q.push(scope.$$childHead);
      }

      if (scope.$$nextSibling) {
        q.push(scope.$$nextSibling);
      }
    }

    return watchers;
  };
  /**
   * @returns {Integer} Number of DOM elements on the page
   */


  exports.getDomElementsCount = function () {
    return document.body.getElementsByTagName('*').length;
  };
  /**
   * 
   * @param {HTMLElement} element - Element we want to check how many watchers are on
   * 
   * @returns {Integer} Number of watchers on element
   */


  var _getWatcherCount = function _getWatcherCount(element) {
    var scope = ngModule.element(element).scope();
    return scope && scope.$$watchersCount ? scope.$$watchersCount : 0;
  };
  /**
   * Recursive function to find the greatest depth for a given element 
   * 
   * @param {HTMLElement} elem - Element we want to traverse to find the biggest DOM Depth underneath
   * @param {Integer} level - Current level we are at
   * 
   * @returns {Integer} Max depth under a given element
   */


  exports.getDomTreeDepth = function (elem, level) {
    if (!elem.children || elem.children.length === 0) {
      return level;
    }

    var max = 0;

    for (var i = 0; i < elem.children.length; i++) {
      var temp = exports.getDomTreeDepth(elem.children[i], level + 1);

      var watcherCount = _getWatcherCount(elem.children[i]);

      if ((temp > 7 || watcherCount > 50) && elem.children[i].tagName.toLowerCase().includes('aw-')) {
        if (!_costlyWidgets[elem.children[i].tagName]) {
          _costlyWidgets[elem.children[i].tagName] = 0;
        }

        _costlyWidgets[elem.children[i].tagName]++;
      }

      if (max < temp) {
        max = temp;
      }
    }

    return max;
  };
  /**
   * @returns {Object} Object with keys all "costly" widgets - Those with greater than 7 depth and more than 50 watchers ( inclusive for subtree under elements )
   */


  exports.getCostlyWidgets = function () {
    return _costlyWidgets;
  };
  /**
   * @returns {Integer} Number of costly widgets on the page in total
   */


  exports.getCostlyWidgetsCount = function () {
    var i = 0;

    _.forEach(_costlyWidgets, function (val, key) {
      i += val;
    });

    return i;
  };
  /**
   * Gets now
   * @returns {DOMHighResTimeStamp} performance.now()
   */


  exports.now = function () {
    if (window.performance) {
      return window.performance.now();
    }

    return Date.now();
  };
  /**
   * Checks to see if splmAnalytics are enabled or not
   * @returns {Boolean} Analytics disabled?
   */


  exports.isAnalyticsDisabled = function () {
    var optOut = localStorage.getItem('AW_SAN_OPTOUT');
    var doDisable = localStorage.getItem('AW_SAN_DO_DISABLE');
    return !(optOut === 'false' && doDisable === 'false');
  };

  return exports;
});