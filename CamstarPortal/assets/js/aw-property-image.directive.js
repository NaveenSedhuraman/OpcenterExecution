"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Definition for the (aw-property-image) directive.
 *
 * @module js/aw-property-image.directive
 */
define(['app', //
'js/iconService'], //
function (app) {
  'use strict';
  /**
   * Definition for the (aw-property-image) directive.
   *
   * @example TODO
   *
   * @member aw-property-image
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyImage', ['iconService', function (iconSvc) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        if (element) {
          element.append(iconSvc.getIcon(attrs.name));
        }
      }
    };
  }]);
});