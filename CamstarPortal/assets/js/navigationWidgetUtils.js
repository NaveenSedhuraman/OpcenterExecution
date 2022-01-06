"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This file contains the utility methods to insert the navigation widget into a an element. This is for GWT consumption
 * of the navigation widget.
 *
 * @module js/navigationWidgetUtils
 */
define(['angular', 'jquery', 'js/ngUtils', //
'js/aw-hierarchical-navigation.directive'], function (ngModule, $, ngUtils) {
  var exports = {};
  /**
   * Inserts the navigation widget directive into the given parent element.
   *
   * @param {Element} parentElement - The DOM element the controller and 'inner' HTML content will be added to.
   *            <P>
   *            Note: All existing 'child' elements of this 'parent' will be removed.
   * @param {integer} childrenToShow - The number of children to show before displaying the 'more...' link
   */

  exports.insertNavigationWidget = function (parentElement, childrenToShow) {
    /**
     * Create an 'outer' <DIV> and create the angular controller on it.
     * <P>
     * Remove any existing 'children' of the given 'parent'
     * <P>
     * Add this new element as a 'child' of the given 'parent'
     */
    var ctrlElement = ngModule.element('<aw-hierarchical-navigation childNodes="children" ' + 'parentNodes="parents" displayNameProp="\'name\'" displayCountProp="\'count\'" ' + ' toolTipProp="\'tooltip\'" maxChildrenToShow="' + childrenToShow + '"></aw-hierarchical-navigation>');
    $(parentElement).empty();
    $(parentElement).append(ctrlElement);
    ngUtils.include(parentElement, ctrlElement);
  };
  /**
   * Adds a node to the navigation widget hierarchy
   *
   * @param {Element} parentElement - the parent element that this node will be added to
   * @param {Object} node - the node to be added.
   * @param {Boolean} isParent - Flag indicating if this is a parent node
   */


  exports.addNode = function (parentElement, node, isParent) {
    var scope = ngModule.element(parentElement.firstChild).scope();

    if (scope) {
      if (isParent) {
        if (scope.parents) {
          scope.parents.push(node);
        } else {
          scope.parents = [node];
        }
      } else {
        if (scope.children) {
          scope.children.push(node);
        } else {
          scope.children = [node];
        }
      }
    }
  };
  /**
   * Called when the hosting GWT widget is 'unLoaded'.
   *
   * @param {Element} parentElement - The DOM element to retrieve scope.
   */


  exports.unloadWidget = function (parentElement) {
    var contrScope = ngModule.element(parentElement.firstChild).scope();

    if (contrScope) {
      contrScope.$destroy();
    }
  };
  /**
   * Creates a node to be inserted into the navigation widget.
   *
   * @param {String} name the node name text
   * @param {String} tooltip the tooltip text
   * @param {Integer} count the child count
   * @param {Object} context the context object
   * @param {Object} callback the callback
   * @return a IJSO object for a node in the navigation widget
   */


  exports.createNode = function (name, tooltip, count, context, callback) {
    return {
      name: name,
      tooltip: tooltip,
      count: count,
      context: context,
      callback: callback
    };
  };

  return exports;
});