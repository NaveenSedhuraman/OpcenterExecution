"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display an icon from the icon service.
 *
 * @module js/aw-icon.directive
 * @requires app
 * @requires js/awIconService
 */
define(['app', //
'js/awIconService'], function (app) {
  'use strict';
  /**
   * @param {String} iconId -
   * @param {DOMElement} $element -
   * @param {awIconService} awIconSvc -
   */

  function _watchIconId(iconId, $element, awIconSvc) {
    // Get the icon contents from the icon service
    var iconDef = awIconSvc.getIconDef(iconId); // Update the element contents

    $element.empty();
    $element.append(iconDef);
  } // eslint-disable-next-line valid-jsdoc

  /**
   * Directive to display an icon with the given id.
   *
   * @example <aw-icon id="[id]"></aw-icon>
   *
   * @member aw-icon
   * @memberof NgDirectives
   */


  app.directive('awIcon', ['awIconService', function (awIconSvc) {
    return {
      restrct: 'E',
      scope: {
        id: '@'
      },
      link: function link($scope, $element) {
        $scope.$watch('id', function (newId) {
          _watchIconId(newId, $element, awIconSvc);
        });
      }
    };
  }]);
});