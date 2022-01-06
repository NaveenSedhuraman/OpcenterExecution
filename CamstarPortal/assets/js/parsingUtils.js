"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global requirejs define */

/**
 * This module is part of declarative UI framework and provides view model processing functionalities.
 *
 * @module js/parsingUtils
 */
define(['app', 'lodash', 'js/logger'], function (app, _, logger) {
  'use strict';
  /**
   * Define the base object used to provide all of this module's external API on.
   *
   * @private
   */

  var exports = {};
  /**
   * {Regex} Regular expression that allows extraction of the text between starting '{{' and ending '}}' using String
   * class 'match' function.
   * <P>
   * Note: The regex will only extract 4 segments w/the following for [1] & [3]<BR>
   * results[1] === '{{' && results[3] === '}}' *
   */

  exports.REGEX_DATABINDING = /^({{)([a-zA-Z0-9$._\s:\[\]\']+)(}})$/;
  /**
   * @param {String} expression -
   * @return {String} The string between mustaches or 'undefined'
   */

  exports.getStringInDoubleMustachMarkup = function (expression) {
    if (expression.match) {
      var results = expression.match(exports.REGEX_DATABINDING);

      if (results && results.length === 4) {
        return results[2];
      }
    }
  };
  /**
   * @param {String} expression -
   * @return {String} insertionString - the string between mustaches
   */


  exports.getStringBetweenDoubleMustaches = function (expression) {
    var insertionString = expression;

    if (_.isString(insertionString)) {
      if (_.startsWith(insertionString, '{{')) {
        insertionString = _.trimStart(insertionString, '{{');
        insertionString = _.trimEnd(insertionString, '}}');
      }

      return insertionString;
    }

    return;
  };
  /**
   * Get the required value from the JSON.
   *
   * @param {Object} input - Input object.
   * @param {Object} path - path from which to search the input.
   * @return {Object} - searched output.
   */


  exports.parentGet = function (input, path) {
    var retVal = _.get(input, path);

    if (retVal !== undefined) {
      return retVal;
    }

    if (input && input.$parent) {
      return exports.parentGet(input.$parent, path);
    }
  };
  /**
   * Load dependency modules
   *
   * @param {Object} $q - angular q/promise service
   * @param {Object} depModule - The dependent module to load.
   */


  exports.loadDeps = function ($q, depModule) {
    if (depModule && depModule.length > 0) {
      return $q(function (resolve) {
        requirejs([depModule], function (depModule2) {
          var injector = app.getInjector();
          var moduleObj = depModule2;

          if (depModule2 && depModule2.moduleServiceNameToInject) {
            moduleObj = injector.get(depModule2.moduleServiceNameToInject);
          }

          resolve(moduleObj);
        });
      });
    }

    return $q.resolve();
  };
  /**
   * Try to parse the JSON string, return the JavaScript Object after parsing, false if cannot parse.
   *
   * @param {String} jsonString - JSON string to parse into Object
   */


  exports.parseJsonString = function (jsonString) {
    try {
      var jsonObject = JSON.parse(jsonString);

      if (jsonObject && _typeof(jsonObject) === 'object') {
        return jsonObject;
      }
    } catch (exception) {
      logger.error('Error parsing the JSON string: ' + exception);
    }

    return false;
  };
  /**
  * @param {String} expression -
  * @return {String} key of i18n ex- incase of i18n.Close,it will return "Close".
  */


  exports.geti18nKey = function (expression) {
    var regex = /{{i18n.([_a-zA-Z0-9]+)}}/i;

    if (arguments.length === 1 && _.isString(expression)) {
      return expression.match(regex)[1];
    }

    return true;
  };

  return exports;
});