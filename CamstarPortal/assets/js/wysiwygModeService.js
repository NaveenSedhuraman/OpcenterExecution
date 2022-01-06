"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/*global
 define
 */

/**
 * @module js/wysiwygModeService
 */
define(['app', 'js/declUtils'], function (app, declUtils) {
  'use strict';

  var exports = {};
  var _appCtxService = null;

  var findWysiwygMode = function findWysiwygMode(datactxNode) {
    if (!datactxNode.$parent && datactxNode.data) {
      var declViewModel = declUtils.findViewModel(datactxNode);
      datactxNode = declViewModel._internal.origCtxNode;
    }

    while (datactxNode && !datactxNode.isWysiwygMode) {
      datactxNode = datactxNode.$parent;
    }

    return datactxNode && datactxNode.isWysiwygMode;
  };

  exports.isWysiwygMode = function (datactxNode) {
    var isWysiwygMode = false;

    var state = _appCtxService.getCtx('wysiwyg.state');

    if (state && (state.current.name === 'wysiwygCanvas' || state.current.name === 'wysiwygPreview')) {
      if (datactxNode) {
        isWysiwygMode = findWysiwygMode(datactxNode);
      }
    }

    return isWysiwygMode;
  };

  app.factory('wysModeSvc', ['appCtxService', function (appCtxService) {
    _appCtxService = appCtxService;
    return exports;
  }]);
  return {
    moduleServiceNameToInject: 'wysModeSvc'
  };
});