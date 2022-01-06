"use strict";

// Copyright 2019 Siemens AG

/**
 * This is a dummy clipboard that was added just to avoid console errors. It doesn't do anything.
 * @module "js/mom.clipboard"
 * @ignore
 */

/*global
define
*/
define([], function () {
  'use strict';

  var exports = {};
  /**
   * Return an array of Objects currently on the clipboard.
   *
   * @return {Array} Current contents of the clipboard.
   */

  exports.getContents = function () {
    return [];
  };
  /**
   * Sets the current contents of the clipboard.
   *
   * @param {Object[]} contentsToSet - Array of Objects to set as the current clipboard
   *            contents.
   */


  exports.setContents = function (contentsToSet) {};
  /**
   * Return the content of the clipboard that is cached.
   *
   * @return {Object[]} Array of current Objects that is cached.
   */


  exports.getCachableObjects = function () {
    return [];
  };
  /**
   * Copies the URL for the given object to OS clipboard
   *
   * @param {Object} selObject - selected object
   * @return {Boolean} verdict whether the content was successfully copied to the clipboard or not
   */


  exports.copyUrlToClipboard = function (selObject) {
    return false;
  };
  /**
   * Copies hyperlink to OS clipboard
   *
   * @param {Object[]} content - array of selected object whose hyperlink is created and copied to os
   *            clipboard
   * @return {Boolean} successful whether the content was successfully copied to the clipboard or not
   */


  exports.copyHyperlinkToClipboard = function (content) {
    return false;
  };

  return exports;
});