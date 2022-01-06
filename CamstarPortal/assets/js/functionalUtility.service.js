"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Defines provider for commands from the View model definition
 *
 * @module js/functionalUtility.service
 */
define(['app'], function (app) {
  'use strict';
  /**
   * Service to define some common functional utilities that are not available natively in Javascript
   *
   * The functions in this service support currying unless otherwise noted. See
   * https://www.sitepoint.com/currying-in-functional-javascript/ for more information.
   *
   * The unit tests provide example usages of these functions
   */

  app.service('functionalUtilityService', [function FunctionalUtilityService() {
    /**
     * Reducer function to convert a list of strings into a object based map
     *
     * toBooleanMap : (Map Boolean, String) -> Map Boolean
     */
    this.toBooleanMap = function toBooleanMap(acc, nxt) {
      acc[nxt] = true;
      return acc;
    };
    /**
     * Get a property from an object.
     *
     * getProp : String -> Object -> a
     */


    this.getProp = function getProp(propName) {
      return function getPropInner(obj) {
        return obj[propName];
      };
    };
    /**
     * Retrieve a value from the given map
     *
     * fromMap : Map a -> String -> a
     */


    this.fromMap = function fromMap(map) {
      return function fromMapInner(val) {
        return map[val];
      };
    };
    /**
     * Identity function
     *
     * identity : a -> a
     */


    this.identity = function identity(x) {
      return x;
    };
    /**
     * Combine two lists
     *
     * concat : (List a, List a) -> List a
     */


    this.concat = function concat(acc, nxt) {
      return acc.concat(nxt);
    };
  }]);
  return {
    moduleServiceNameToInject: 'functionalUtilityService'
  };
});