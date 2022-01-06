"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define window
 */

/**
 * Module for various FMS related utilities
 *
 * @module js/fmsUtils
 *
 * @namespace fmsUtils
 */
define([//
'app', //
'lodash', //
'js/browserUtils' //
], function (app, _, browserUtils) {
  'use strict';
  /**
   * The FMS proxy servlet context. This must be the same as the FmsProxyServlet mapping in the web.xml
   */

  var WEB_XML_FMS_PROXY_CONTEXT = 'fms';
  /**
   * Relative path to the FMS proxy download service.
   */

  var CLIENT_FMS_DOWNLOAD_PATH = WEB_XML_FMS_PROXY_CONTEXT + '/fmsdownload/';
  /**
   * Relative path to the FMS proxy download service.
   */

  var CLIENT_FMS_UPLOAD_PATH = WEB_XML_FMS_PROXY_CONTEXT + '/fmsupload/';
  /**
   * Build url from a file ticket.
   *
   * @param {String} fileTicket - The file ticket
   * @param {String} openFileName - open file with this name.
   *
   * @return {String} url
   */

  var _buildUrlFromFileTicket = function _buildUrlFromFileTicket(fileTicket, openFileName) {
    var fileName;

    if (!_.isEmpty(openFileName)) {
      // Remove special characters because IIS does not allow special characters in file name
      var validOpenFileName = openFileName;
      var extensionIndex = openFileName.lastIndexOf('.');

      if (extensionIndex > 0) {
        var extension = openFileName.substring(extensionIndex + 1);
        var fileNameWithoutExtension = openFileName.substring(0, extensionIndex);
        validOpenFileName = fileNameWithoutExtension.replace(/[<>*%:&]/, '') + '.' + extension;
      } else {
        validOpenFileName = openFileName.replace(/[<>*%:&]/, '');
      }

      fileName = encodeURIComponent(validOpenFileName);
    } else {
      fileName = exports.getFilenameFromTicket(fileTicket);
    }

    var downloadUri = CLIENT_FMS_DOWNLOAD_PATH + fileName + '?ticket=' + encodeURIComponent(fileTicket);
    return browserUtils.getBaseURL() + downloadUri;
  }; // -------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------
  // Public Functions
  // -------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------


  var exports = {};
  /**
   * Get the file name from FMS ticket
   *
   * @param {String} ticket - The file ticket
   * @return {String} File name
   */

  exports.getFilenameFromTicket = function (ticket) {
    // Check for forward or backslash in the ticket string
    var lastfslash = ticket.lastIndexOf('/');
    var lastbslash = ticket.lastIndexOf('\\');
    var fnamestart = Math.max(lastfslash, lastbslash) + 1;

    if (fnamestart > 0 && fnamestart < ticket.length) {
      return ticket.substring(fnamestart);
    } // Check for a URL Encoded forward or backslash in the ticket string


    var lastEncodedFS = ticket.lastIndexOf('%2f');
    var lastEncodedBS = ticket.lastIndexOf('%5c');
    var encodedfnamestart = Math.max(lastEncodedFS, lastEncodedBS) + 3;

    if (encodedfnamestart > 0 && encodedfnamestart < ticket.length) {
      return ticket.substring(encodedfnamestart);
    } // Return empty string


    return '';
  };
  /**
   * Get the FMS Url
   *
   * @return {String} The FMS Url
   */


  exports.getFMSUrl = function () {
    return CLIENT_FMS_DOWNLOAD_PATH;
  };
  /**
   * Looks up and returns the <b>full</b> FMS upload URL.
   *
   * @return {String} The fms upload url.
   */


  exports.getFMSFullUploadUrl = function () {
    return browserUtils.getBaseURL() + CLIENT_FMS_UPLOAD_PATH;
  };
  /**
   * Get the URI to load the file from FMS given a ticket and original filename.
   *
   * @param {String} ticket - FMS ticket
   * @param {String} originalFilename - (Optional) The original file name to include on the Uri and returned in
   *            content-disposition. The filename will be generated from the ticket it not included.
   *
   * @return {String} The Uri to access the file.
   */


  exports.getFileUri = function (ticket, originalFilename) {
    var filename = !_.isEmpty(originalFilename) ? originalFilename : exports.getFilenameFromTicket(ticket); // Double encoding ticket here because it will be re-encoded by FmsProxyServlet.

    return app.getBaseUrlPath() + '/' + exports.getFMSUrl() + encodeURIComponent(filename) + '?ticket=' + encodeURIComponent(ticket);
  };
  /**
   * Get the FSC URI from given file ticket
   *
   * @param {String} fileTicket - The File ticket
   *
   * @return {String} The FSC URI
   */


  exports.getFscUri = function (fileTicket) {
    var fscUri = '';
    var httpLocation = fileTicket.indexOf('http');
    var percentSign = fileTicket.lastIndexOf('%');

    if (httpLocation !== -1 && percentSign !== -1) {
      fscUri = fileTicket.substring(httpLocation, percentSign);
      var decodedUri = decodeURIComponent(fscUri);

      if (decodedUri) {
        decodedUri = decodedUri.replace(';', '/');
        fscUri = decodedUri;
      }
    }

    return fscUri;
  };
  /**
   * Open a file given the file ticket
   *
   * @param {String} fileTicket - The file ticket
   * @param {String} openFileName - open file with this name.
   */


  exports.openFile = function (fileTicket, openFileName) {
    if (_.isString(fileTicket) && fileTicket.length > 0) {
      window.open(_buildUrlFromFileTicket(fileTicket, openFileName), '_self', 'enabled');
    }
  };
  /**
   * Open the file in new window
   *
   * @param {String} fileTicket - The file ticket
   */


  exports.openFileInNewWindow = function (fileTicket) {
    if (_.isString(fileTicket) && fileTicket.length > 0) {
      window.open(_buildUrlFromFileTicket(fileTicket), '_blank', 'enabled');
    }
  };

  return exports;
});