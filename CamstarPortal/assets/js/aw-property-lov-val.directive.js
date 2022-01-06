"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * TODO
 *
 * @module js/aw-property-lov-val.directive
 */
define(['app', 'js/localeService', 'js/aw.property.lov.controller', 'js/aw-property-error.directive', 'js/aw-property-image.directive', 'js/aw-property-lov-child.directive', 'js/aw-autofocus.directive', 'js/aw-when-scrolled.directive', 'js/aw-widget-initialize.directive', 'js/aw-validator.directive'], //
function (app) {
  'use strict';
  /**
   * TODO
   *
   * @example TODO
   *
   * @member aw-property-lov-val
   * @memberof NgElementDirectives
   */

  app.directive('awPropertyLovVal', //
  ['$injector', 'localeService', //
  function ($injector, localeSvc) {
    return {
      restrict: 'E',
      scope: {
        // prop comes from the parent controller's scope
        prop: '='
      },
      controller: 'awPropertyLovController',
      link: function link(scope) {
        localeSvc.getTextPromise().then(function (localizedText) {
          scope.prop.lovNoValsText = localizedText.NO_LOV_VALUES;
        });
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-property-lov-val.directive.html'
    };
  }]);
});