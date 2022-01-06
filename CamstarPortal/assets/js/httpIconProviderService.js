"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 window
 */

/**
 * {@httpIconProviderService} icon provider prepares &lt;img&gt; tag is requires based on configuration provided in
 * solution definition. It uses {@defaultIconProviderService} to use build time prepared cache.
 *
 * @module js/httpIconProviderService
 */
define([//
'app', //
'js/iconRepositoryService', //
'js/defaultIconProviderService' //
], function (app) {
  'use strict';
  /**
   * Reference to defaultIconProviderService.
   */

  var _defaultIconProviderService = null;
  /**
   * Reference to iconRepositoryService
   */

  var _iconRepositoryService = null;
  var exports = {};
  /**
   * Returns the &lt;img&gt; tag for the given icon name
   *
   * @private
   *
   * @param {String} name - The name of the icon to return.
   *
   * @return {String} The &lt;img&gt; tag for the given icon name (or NULL if the icon file was not deployed).
   */

  function _getIMGTag(name) {
    if (!name) {
      return null;
    }

    var iconUrl = _iconRepositoryService.getIconFileUrl(name + '.svg');

    if (iconUrl) {
      return '<img class="aw-base-icon" src="' + iconUrl + '" draggable="false" ondragstart="return false;" />';
    }
  }
  /**
   * Returns the &lt;IMG&gt; tag for the given type name.
   *
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix) to get an icon for.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name.
   */


  exports.getTypeIcon = function (typeName) {
    var icon = _defaultIconProviderService.getTypeIcon(typeName);

    if (!icon) {
      icon = _getIMGTag(typeName);
    }

    return icon;
  };
  /**
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix) to get an icon for.
   *
   * @param {String} typeIconFileName - The name of the icon file associated with the typeName.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name
   */


  exports.getTypeIconFileTag = function (typeName, typeIconFileName) {
    if (!typeIconFileName) {
      return null;
    }

    var iconUrl = _iconRepositoryService.getIconFileUrl(typeIconFileName);

    if (iconUrl) {
      return '<img class="aw-base-icon" src="' + iconUrl + '" draggable="false" ondragstart="return false;" />';
    }
  };
  /**
   * Returns URL.
   *
   * @param {String} typeIconFileName - The name of the icon file associated with the typeName.
   *
   * @return {String} The &lt;IMG&gt; tag for the given type name
   */


  exports.getTypeIconFileUrl = function (typeIconFileName) {
    return _iconRepositoryService.getIconFileUrl(typeIconFileName);
  };
  /**
   * Returns URL.
   *
   * @param {String} typeName - The 'type' name (w/o the 'type' prefix and no number suffix) to get an icon for.
   *
   * @return {String} The path to the icon image on the web server
   */


  exports.getTypeIconURL = function (typeName) {
    var iconUrl = _defaultIconProviderService.getTypeIconURL(typeName);

    if (!iconUrl) {
      iconUrl = _iconRepositoryService.getIconFileUrl(typeName + '.svg');
    }

    return iconUrl;
  };
  /**
   * Returns the HTML &lt;SVG&gt;or &lt;img&gt;.
   *
   * @param {String} name - The icon name suffix to get an icon definition for.
   *
   * @return {String} Returns the HTML &lt;SVG&gt;or &lt;img&gt;.
   */


  exports.getTileIcon = function (name) {
    var icon = _defaultIconProviderService.getTileIcon(name);

    if (!icon) {
      icon = _getIMGTag('home' + name);
    }

    return icon;
  };
  /**
   * Returns the HTML &lt;SVG&gt;or &lt;img&gt;.
   *
   * @param {String} name - The icon name suffix to get an icon definition for.
   *
   * @return {String} Returns the HTML &lt;SVG&gt;or &lt;img&gt;.
   */


  exports.getMiscIcon = function (name) {
    var icon = _defaultIconProviderService.getMiscIcon(name);

    if (!icon) {
      icon = _getIMGTag('misc' + name);
    }

    return icon;
  };
  /**
   * Returns the HTML &lt;SVG&gt; or &lt;img&gt;.
   *
   * @param {String} name - The icon name.
   *
   * @return {String} SVG definition string for the icon
   */


  exports.getCmdIcon = function (name) {
    var icon = _defaultIconProviderService.getCmdIcon(name);

    if (!icon) {
      icon = _getIMGTag('cmd' + name);
    }

    return icon;
  };
  /**
   * Returns the HTML &lt;SVG&gt; or &lt;img&gt;.
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String} Returns the HTML &lt;SVG&gt; or &lt;img&gt;
   */


  exports.getAwIcon = function (iconName) {
    var icon = _defaultIconProviderService.getAwIcon(iconName);

    if (!icon) {
      icon = _getIMGTag(iconName);
    }

    return icon;
  };
  /**
   * Returns the HTML &lt;SVG&gt; or &lt;img&gt;
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String}Returns the HTML &lt;SVG&gt; or &lt;img&gt;
   */


  exports.getIndicatorIcon = function (iconName) {
    var icon = _defaultIconProviderService.getIndicatorIcon(iconName);

    if (!icon) {
      icon = _getIMGTag('indicator' + iconName);
    }

    return icon;
  };
  /**
   * Returns the HTML &lt;SVG&gt; or &lt;img&gt;
   *
   * @param {String} iconName - the icon name to get an icon for.
   *
   * @return {String} SVG definition string or img tag .
   */


  exports.getIcon = function (iconName) {
    var icon = _defaultIconProviderService.getIcon(iconName);

    if (!icon) {
      icon = _getIMGTag(iconName);
    }

    return icon;
  };
  /**
   * This service provides access to the definition of SVG icons deployed on a web server as configured in solution
   * (kit.json).
   *
   * @memberof NgServices
   * @member httpIconProviderService
   *
   * @param {defaultIconProviderService} defaultIconProviderService - Service to use.
   * @param {iconRepositoryService} iconRepositoryService - Service to use.
   *
   * @returns {httpIconProviderService} Reference to service API Object.
   */


  app.factory('httpIconProviderService', [//
  'defaultIconProviderService', //
  'iconRepositoryService', //
  function (defaultIconProviderService, iconRepositoryService) {
    _defaultIconProviderService = defaultIconProviderService;
    _iconRepositoryService = iconRepositoryService;
    return exports;
  }]);
});