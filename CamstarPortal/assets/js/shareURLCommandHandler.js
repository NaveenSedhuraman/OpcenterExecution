"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define

 */

/**
 * This is the command handler for copy link.
 *
 * @module js/shareURLCommandHandler
 */
define([//
'app', //
'js/clipboardService'], //
function (app) {
  'use strict';

  var exports = {};
  /**
   * Cached ClipBoardService
   */

  var _clipboardService = null;
  /**
   * Copies the content to OS clipboard
   */

  exports.execute = function (context) {
    _clipboardService.copyUrlToClipboard(context);
  };
  /**
   * @member shareURLCommandHandler
   */


  app.factory('shareURLCommandHandler', ['clipboardService', //
  function (clipboardService) {
    _clipboardService = clipboardService;
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'shareURLCommandHandler'
  };
});