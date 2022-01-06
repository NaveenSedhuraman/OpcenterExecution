"use strict";

// Copyright 2019 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * This is a directive for rendering advanced searches with custom entries (preferred searches, other searches, and a separation line).
 * Everything else is similar to aw-property-lov-val.directive.
 *
 * @module js/aw-advsearch-lov-val.directive
 */
define(['app', 'js/localeService', 'js/aw.property.lov.controller', 'js/aw-property-error.directive', 'js/aw-property-image.directive', 'js/aw-property-lov-child.directive', 'js/aw-autofocus.directive', 'js/aw-when-scrolled.directive', 'js/aw-widget-initialize.directive', 'js/exist-when.directive'], //
function (app) {
  'use strict';
  /**
   *
   *
   * @member aw-advsearch-lov-val
   * @memberof NgElementDirectives
   */

  app.directive('awAdvsearchLovVal', //
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
          scope.lovNoValsText = localizedText.NO_LOV_VALUES;
        });
        localeSvc.getTextPromise('SearchCoreMessages').then(function (localizedText) {
          scope.i18n = {
            preferredSearches: localizedText.preferredSearches,
            regularSearches: localizedText.regularSearches
          };
        });

        scope.changeFunctionCustom = function () {
          if (scope.prop.uiValue !== '') {
            scope.changeFunction();
          } else {
            scope.dropDownVerticalAdj = 0;
            scope.prop.dbValue = scope.prop.uiValue;
            scope.prop.uiValues = [scope.prop.uiValue];
            scope.prop.dbValues = [scope.prop.dbValue];
            scope.listFilterText = scope.prop.uiValue;
            scope.lovEntries = [];

            if (scope.expanded) {
              scope.collapseList();
            }
          }
        };
      },
      templateUrl: app.getBaseUrlPath() + '/html/aw-advsearch-lov-val.directive.html'
    };
  }]);
});