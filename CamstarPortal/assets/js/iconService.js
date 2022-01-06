"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 window
 */

/**
 * Please refer {@link https://gitlab.industrysoftware.automation.siemens.com/Apollo/afx/wikis/solution#solution-configuration-for-obtaining-images|Solution configuration for obtaining images}
 *
 * @module js/iconService
 *
 * @publishedApolloService
 *
 */
define([//
'app', //
//
'js/iconRepositoryService', //
'js/defaultIconProviderService', //
'js/httpIconProviderService'], function (app) {
  'use strict';

  var exports = {};
  /**
   * Reference to iconRepositoryService.
   */

  var _iconRepositoryService;
  /**
   * Reference IconService
   */


  var _iconServiceProvider;
  /**
   * Reference defaultIconProviderService
   */


  var _defaultIconProviderService;
  /**
   * Reference httpIconProviderService
   */


  var _httpIconProviderService;
  /**
   * Returns the &lt;IMG&gt; tag for the given type name (or one of its parent super types if the given type icon file
   * was not deployed) **with** 'class' attribute already set to 'aw-base-icon' and draggability disabled.
   *
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix) to get an icon for.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name (or null if the icon name has not been registered as
   *         an alias in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getTypeIcon = function (typeName) {
    return _iconServiceProvider.getTypeIcon(typeName);
  };
  /**
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix) to get an icon for.
   *
   * @param {String} typeIconFileName - The name of the icon file associated with the typeName.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name (or null if the icon name has not been registered as
   *         an alias in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getTypeIconFileTag = function (typeName, typeIconFileName) {
    return _iconServiceProvider.getTypeIconFileTag(typeName, typeIconFileName);
  };
  /**
   * @param {String} typeIconFileName - The name of the icon file associated with the typeName.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name (or null if the icon name has not been registered as
   *         an alias in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getTypeIconFileUrl = function (typeIconFileName) {
    return _iconServiceProvider.getTypeIconFileUrl(typeIconFileName);
  };
  /**
   * Returns the &lt;IMG&gt; tag for the given type name.
   *
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix and no number suffix) to get an icon for.
   *
   * @return {String} The path to the icon image on the web server (or null if no type icon has not been registered as
   *         an alias in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getTypeIconURL = function (typeName) {
    return _iconServiceProvider.getTypeIconURL(typeName);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given ('home' + name) icon **with** 'class' attribute already set to
   * 'aw-base-icon'.
   *
   * @param {String} name - The icon name suffix to get an icon definition for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getTileIcon = function (name) {
    return _iconServiceProvider.getTileIcon(name);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given ('misc' + name) icon **with** 'class' attribute already set to
   * 'aw-base-icon'.
   *
   * @param {String} name - The icon name suffix to get an icon definition for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getMiscIcon = function (name) {
    return _iconServiceProvider.getMiscIcon(name);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given ('cmd' + name) icon **with** 'class' attribute already set to
   * 'aw-base-icon'.
   *
   * @param {String} name - The icon name suffix to get an icon definition for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getCmdIcon = function (name) {
    return _iconServiceProvider.getCmdIcon(name);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given icon name **with** 'class' attribute already set to
   * 'aw-base-icon'.
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getAwIcon = function (iconName) {
    return _iconServiceProvider.getAwIcon(iconName);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given icon name **without** any 'class' attribute being set.
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   */


  exports.getIcon = function (iconName) {
    return _iconServiceProvider.getIcon(iconName);
  };
  /**
   * Returns the HTML &lt;SVG&gt; string for the given ('indicator' + name) icon **with** 'class' attribute already
   * set to 'aw-base-icon'.
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String} SVG definition string for the icon (or null if the icon name has not been registered as an alias
   *         in a module.json or the SVG file was not found during war the build).
   * @ignore
   */


  exports.getIndicatorIcon = function (iconName) {
    return _iconServiceProvider.getIndicatorIcon(iconName);
  };
  /**
   * Initialize icon service provider.
   */


  function initializeIconServiceProvider() {
    switch (_iconRepositoryService.getIconFetchMethod()) {
      case _iconRepositoryService.GET:
        _iconServiceProvider = _httpIconProviderService;
        break;

      case _iconRepositoryService.DEFAULT:
      default:
        _iconServiceProvider = _defaultIconProviderService;
    }
  }
  /**
   * This service provides access to the definition of SVG icons deployed on the web server.
   *
   * @memberof NgServices
   * @member iconService
   *
   * @param {iconRepositoryService} iconRepositoryService - Service to use.
   * @param {defaultIconProviderService} defaultIconProviderService - Service to use.
   * @param {httpIconProviderService} httpIconProviderService - Service to use.
   *
   * @returns {iconService} Reference to service API Object.
   */


  app.factory('iconService', [//
  'iconRepositoryService', //
  'defaultIconProviderService', //
  'httpIconProviderService', //
  function (iconRepositoryService, defaultIconProviderService, httpIconProviderService) {
    _iconRepositoryService = iconRepositoryService;
    _defaultIconProviderService = defaultIconProviderService;
    _httpIconProviderService = httpIconProviderService;
    initializeIconServiceProvider();
    return exports;
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating
   * which service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'iconService'
  };
});