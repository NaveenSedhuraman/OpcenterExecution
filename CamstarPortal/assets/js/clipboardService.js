"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define
 */

/**
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/clipboard|Clipboard}
 *
 * @module js/clipboardService
 *
 * @publishedApolloService
 *
 */
define([//
'app', //
'lodash', //
'js/logger', //
'js/declUtils', //
//
'js/configurationService' //
], function (app, _, logger, declUtils) {
  'use strict';
  /**
   * Register service.
   *
   * @member clipboardService
   * @memberof NgServices
   *
   * @param {$q} $q - Service to use.
   * @param {$injector} $injector - Service to use.
   * @param {configurationService} cfgSvc - Service to use.
   *
   * @returns {clipboardService} Reference to service's API object.
   */

  app.factory('clipboardService', [//
  '$q', //
  '$injector', //
  'configurationService', //
  function ($q, $injector, cfgSvc) {
    var exports = {};

    var _delegateService;

    var dep;
    var solution; // Asynchronously loading the configured clipboardService

    cfgSvc.getCfg('solutionDef').then(function (solutionDef) {
      solution = solutionDef;

      if (solution.clipboard) {
        return cfgSvc.getCfg('clipboard');
      }

      return $q.reject('Missing configuration for \'clipboard\' in solution configuration.');
    }).then(function (clipboardProviders) {
      dep = clipboardProviders[solution.clipboard].dep;
      return declUtils.loadDependentModule(dep, $q, $injector);
    }).then(function (depModuleObj) {
      if (!depModuleObj) {
        logger.error('Could not load the clipboard module ' + dep);
      }

      _delegateService = depModuleObj;
      return _delegateService;
    }).catch(function (e) {
      logger.warn(e);
    });
    /**
     * Return an array of Objects currently on the clipboard.
     *
     * @memberof clipboardService
     *
     * @return {Array} Current contents of the clipboard.
     */

    exports.getContents = function () {
      return _delegateService ? _delegateService.getContents() : [];
    };
    /**
     * Sets the current contents of the clipboard.
     *
     * @param {Array} contentsToSet - Array of Objects to set as the current clipboard contents.
     *
     */


    exports.setContents = function (contentsToSet) {
      if (_delegateService) {
        _delegateService.setContents(contentsToSet);
      }
    };
    /**
     * Return the content of the clipboard that is cached.
     *
     * @return {Array} Array of current Objects that is cached.
     */


    exports.getCachableObjects = function () {
      return _delegateService ? _delegateService.getCachableObjects() : [];
    };
    /**
     * Copies the URL for the given object to OS clipboard
     *
     * @memberof clipboardService
     *
     * @param {Object} selObject - selected object
     *
     * @return {Boolean} verdict whether the content was successfully copied to the clipboard or not
     */


    exports.copyUrlToClipboard = function (selObject) {
      return _delegateService ? _delegateService.copyUrlToClipboard(selObject) : false;
    };
    /**
     * Copies hyperlink to OS clipboard
     *
     * @param {Array} content - array of selected object whose hyperlink is created and copied to os clipboard
     * @return {Boolean} successful whether the content was successfully copied to the clipboard or not
     */


    exports.copyHyperlinkToClipboard = function (content) {
      return _delegateService ? _delegateService.copyHyperlinkToClipboard(content) : false;
    };

    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'clipboardService'
  };
});