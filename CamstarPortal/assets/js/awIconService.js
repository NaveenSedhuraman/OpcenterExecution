"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * This service handles resolution to HTML text of special cases of icon names seen with data binding.
 *
 * @module js/awIconService
 */
define(['app', 'js/fmsUtils', 'js/browserUtils', 'js/iconService', 'js/typeIconsRegistryService', 'soa/kernel/clientMetaModel'], function (app, fmsUtils, browserUtils) {
  'use strict';
  /**
   * Regular expression to extract the type from a type's file name (without number suffix).
   */

  var _REGEX_TYPE_FILE_NAME = /(^type)([a-z0-9\s]+)/i;
  /**
   * Regular expression to extract the type from a type's file name (w/number suffix).
   */

  var _REGEX_TYPE_FILE_NAME_SUFFIX = /(^type)([a-z0-9\s]+)([0-9][0-9]$)/i;
  /**
   * Regular expression detect a full type file name.
   */

  var _REGEX_TYPE_FILE_EXT = /.svg$/i;
  /**
   * {String} Cached base URL path.
   */

  var _iconBase = '';
  /**
   * @private
   *
   * @return {String} The path from the root of the war file to the directory where icon image files can be found.
   */

  function _getIconBaseUrlPath() {
    if (!_iconBase) {
      _iconBase = app.getBaseUrlPath() + '/image/';
    }

    return _iconBase;
  }
  /**
   * This service handles resolution to HTML text of special cases of icon names seen with data binding.
   *
   * @memberof NgServices
   * @member altIconService
   *
   * @param {iconService} iconSvc - Service to use.
   * @param {typeIconsRegistryService} typeIconSvc - Service to use.
   * @param {soa_kernel_clientMetaModel} cmm - Service to use.
   */


  app.service('awIconService', ['iconService', 'typeIconsRegistryService', 'soa_kernel_clientMetaModel', function (iconSvc, typeIconSvc, cmm) {
    var self = this; // eslint-disable-line no-invalid-this

    /**
     * Get the icon to use when one is not found
     *
     * @returns {String} The missing icon
     */

    self.getMissingIcon = function () {
      return iconSvc.getTypeIcon('MissingImage') || '<svg></svg>';
    };
    /**
     * Get the HTML tag for the given icon name.
     *
     * @param {String} iconID - ID of the icon to return. The ID is assumed to match one of the SVG definitions
     *            or have a valid alias to an SVG. Do not include any 'size' number on the end of the ID (e.g.
     *            the SVG's file name). All model types must be prefixed with 'type'.
     *
     * @return {String} HTML tag text (&lt;IMG&gt; or &lt;SVG&gt;) for the given 'iconID' (or 'missing image'
     *         definition if the icon name has not been registered as an alias in a module.json or the SVG file
     *         was not found during war the build)..
     */


    self.getIconDef = function (iconID) {
      var iconDef = null;

      if (iconID) {
        if (_REGEX_TYPE_FILE_EXT.test(iconID)) {
          iconDef = '<img class="aw-base-icon" src="' + _getIconBaseUrlPath() + iconID + '"/>';
        } else {
          iconDef = iconSvc.getAwIcon(iconID);

          if (!iconDef) {
            var parts = iconID.match(_REGEX_TYPE_FILE_NAME_SUFFIX);

            if (parts && parts.length === 4) {
              iconDef = iconSvc.getTypeIcon(parts[2]);
            } else {
              parts = iconID.match(_REGEX_TYPE_FILE_NAME);

              if (parts && parts.length === 3) {
                iconDef = iconSvc.getTypeIcon(parts[2]);
              }
            }
          }
        }
      }

      return iconDef || self.getMissingIcon();
    };
    /**
     * Build thumbnail file url from the ticket input provided
     *
     * @param {String} ticket - thumbnail image ticket
     * @return {String} the URL to the thumbnail file that represents the given ticket or '' if a) the
     *         'ticket' is not valid b) there is no thumbnail.
     */


    self.buildThumbnailFileUrlFromTicket = function (ticket) {
      var thumbnailUrl = '';

      if (ticket && ticket.length > 28) {
        thumbnailUrl = browserUtils.getBaseURL() + 'fms/fmsdownload/' + fmsUtils.getFilenameFromTicket(ticket) + '?ticket=' + ticket;
      }

      return thumbnailUrl;
    };
    /**
     * Get the URL to the thumbnail file that represents the given ViewModelObject, if it exists.
     *
     * @param {ViewModelObject} vmo - The ViewModelObject to return the thumbnail URL for.
     * @return {String} the URL to the thumbnail file that represents the given ViewModelObject (or '' if a) the
     *         'vmo' is not valid b) there is no thumbnail.
     */


    self.getThumbnailFileUrl = function (vmo) {
      var url = '';

      if (vmo) {
        var customVmo = null;

        if (vmo.modelType) {
          customVmo = typeIconSvc.getCustomVmoForThumbnail(vmo);
        }

        if (customVmo === null) {
          customVmo = vmo;
        }

        if (customVmo.props && customVmo.props.awp0ThumbnailImageTicket) {
          var prop = customVmo.props.awp0ThumbnailImageTicket;

          if (prop.dbValues.length > 0) {
            var ticket = prop.dbValues[0];
            url = self.buildThumbnailFileUrlFromTicket(ticket);
          }
        } else if (customVmo.thumbnailURL) {
          url = customVmo.thumbnailURL;
        }
      }

      return url;
    };
    /**
     * Get the URL to the icon file that represents the 'type' of the given ViewModelObject.
     *
     * @param {ViewModelObject} vmo - The ViewModelObject to return the icon definition for.
     * @return {String} the URL to the icon file that represents the 'type' of the given ViewModelObject (or ''
     *         if a) the 'vmo' is not valid b) the type icon has not been registered as an alias in a
     *         module.json or c) the SVG file was not found during war the build).
     */


    self.getTypeIconFileUrl = function (vmo) {
      var url = '';

      if (vmo && vmo.modelType) {
        var customTypeIcon = typeIconSvc.getCustomIcon(vmo);

        if (customTypeIcon && customTypeIcon.length > 0) {
          url = iconSvc.getTypeIconFileUrl(customTypeIcon);
        } else {
          if (vmo.modelType.constantsMap && vmo.modelType.constantsMap.IconFileName) {
            url = _getIconBaseUrlPath() + vmo.modelType.constantsMap.IconFileName;
          } else {
            if (vmo.modelType.typeHierarchyArray) {
              var typeIconFileName = cmm.getTypeIconFileName(vmo.modelType);
              url = iconSvc.getTypeIconFileUrl(typeIconFileName);
            }
          }
        }
      }

      return url;
    };
    /**
     * Returns the &lt;IMG&gt; tag for the given type name.
     *
     * @param {String} typeName - The 'type' name (w/o the 'type' prefix and no number suffix) to get an icon
     *            for.
     * @return {String} The path to the icon image on the web server (or null if no type icon has not been
     *         registered as an alias in a module.json or the SVG file was not found during war the build).
     */


    self.getTypeIconURL = function (typeName) {
      return iconSvc.getTypeIconURL(typeName);
    };
    /**
     * Given a type hierarchy, get the URL to the icon file for the type or its closest superior.
     *
     * @param {StringArray} typeHierarchy - The type hierarchy.
     *
     * @return {String} The URL to the icon file.
     */


    self.getTypeIconFileUrlForTypeHierarchy = function (typeHierarchy) {
      for (var j in typeHierarchy) {
        var iconUrl = iconSvc.getTypeIconURL(typeHierarchy[j]);

        if (iconUrl !== null) {
          return iconUrl;
        }
      }

      return '';
    };
  }]);
  /**
   * Since this module can be loaded GWT-side by the ModuleLoader class we need to return an object indicating which
   * service should be injected to provide the API for this module.
   */

  return {
    moduleServiceNameToInject: 'awIconService'
  };
});