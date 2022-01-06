"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define navigator window */

/* eslint-disable no-extend-native */

/**
 * This module provides a centralized polyfill support for commonly used APIs in JavaScript that aren't available in all
 * browsers (i.e. IE11).
 * <P>
 * Note: This modules does not create an injectable service.
 *
 * @module js/aw_polyfill
 */
define(['lodash'], function (_) {
  'use strict';
  /**
   * Augment the String prototype to add a format method "{0} is dead, but {1} is alive {0} {2}".format("Java",
   * "JavaScript") results in Java is dead, but JavaScript is alive. Java {2}
   */

  if (!String.prototype.format) {
    Object.defineProperty(String.prototype, 'format', {
      value: function value() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] !== 'undefined' ? args[number] : match;
        });
      }
    });
  }

  if (!String.prototype.startsWith) {
    // This API isn't supported by IE11
    Object.defineProperty(String.prototype, 'startsWith', {
      value: function value(target, position) {
        return _.startsWith(this, target, position);
      }
    });
  }

  if (!Array.prototype.find) {
    // This API isn't supported by IE11
    Object.defineProperty(Array.prototype, 'find', {
      value: function value(callback, otherThis) {
        return _.find(otherThis ? otherThis : this, callback);
      }
    });
  }

  if (!Array.prototype.includes) {
    // This API isn't supported by IE11
    Object.defineProperty(Array.prototype, 'includes', {
      value: function value(searchElement, fromIndex) {
        return _.includes(this, searchElement, fromIndex);
      }
    });
  }

  if (typeof Object.assign !== 'function') {
    // This API isn't supported by IE11
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function value(target) {
        // .length of function is 2
        'use strict';

        if (target === null) {
          // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }

        return to;
      },
      writable: true,
      configurable: true
    });
  }
});