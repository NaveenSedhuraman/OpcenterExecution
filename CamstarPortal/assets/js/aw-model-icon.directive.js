"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Display the icon associated with a given 'ViewModelObject'.
 *
 * @module js/aw-model-icon.directive
 */
define(['app'], function (app) {
  'use strict';
  /**
   * Display the icon associated with a given 'ViewModelObject'.
   *
   * @example <aw-model-icon vmo="[ViewModelObject]"></aw-model-icon>
   *
   * @memberof NgDirectives
   * @member aw-model-icon
   */

  app.directive('awModelIcon', function () {
    return {
      restrct: 'E',
      scope: {
        vmo: '<',
        hideoverlay: '<'
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-model-icon.directive.html'
    };
  });
});