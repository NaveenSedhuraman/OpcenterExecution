"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * TODO
 * <P>
 * Note: This modules does not create an injectable service.
 *
 * @module js/awFileNameUtils
 */
define([], //
function () {
  'use strict';

  var exports = {};
  /**
   * Get file name from path
   *
   * @param {String} filePath - The file path to get
   *
   * @return {String} file name
   */

  exports.getFileFromPath = function (filePath) {
    if (filePath !== null) {
      var seperatorIndex = filePath.lastIndexOf('\\');

      if (seperatorIndex === -1) {
        seperatorIndex = filePath.lastIndexOf('/');
      }

      return filePath.substring(seperatorIndex + 1);
    }

    return null;
  };
  /**
   * Get file name without extension from file name
   *
   * @param {String} fileName file name
   * @return {String} file name without extension
   */


  exports.getFileNameWithoutExtension = function (fileName) {
    var extIndex = fileName.lastIndexOf('.');

    if (extIndex > -1) {
      return fileName.substring(0, extIndex);
    }

    return fileName;
  };
  /**
   * Get file name extension from file name
   *
   * @param {String} fileName file name
   * @return {String} file name extension
   */


  exports.getFileExtension = function (fileName) {
    var extIndex = fileName.lastIndexOf('.');

    if (extIndex > -1) {
      return fileName.substring(extIndex);
    }

    return '';
  };

  return exports;
});