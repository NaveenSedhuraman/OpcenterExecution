"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * @module js/aw-search-breadcrumb.directive
 */
define(['app', 'angular', 'js/aw-popup-panel.directive', 'js/aw-search-breadcrumb.controller', 'js/aw-property-image.directive', 'js/localeService', 'js/appCtxService', 'js/aw-repeat.directive', 'js/exist-when.directive', 'js/aw-list.directive', 'js/aw-default-cell.directive', 'js/aw-popup-panel.directive', 'js/aw-search-box.directive', 'js/aw-icon.directive', 'js/aw-enter.directive', 'js/viewModelService', 'js/aw-scrollpanel.directive'], function (app, ngModule) {
  'use strict';
  /**
   * Definition for the (aw-search-breadcrumb) directive.
   *
   * @member aw-search-breadcrumb
   * @memberof NgElementDirectives
   * @param {localeService} localeSvc - Service to use.
   * @param {$q} $q - Service to use.
   * @param {appCtxService} appCtxService - Service to use.
   * @returns {exports} Instance of this service.
   */

  app.directive('awSearchBreadcrumb', ['localeService', '$q', 'appCtxService', function (localeSvc, $q, appCtxService) {
    return {
      restrict: 'E',
      scope: {
        provider: '=',
        breadcrumbConfig: '='
      },
      link: function link(scope, element) {
        scope.ctx = appCtxService.ctx;
        localeSvc.getTextPromise().then(function (localTextBundle) {
          scope.loadingMsg = localTextBundle.LOADING_TEXT;
        });
        localeSvc.getLocalizedText('UIMessages', 'clearBreadCrumb').then(function (result) {
          scope.clearBreadCrumb = result;
        });
        localeSvc.getLocalizedText('UIMessages', 'updateSearchDropDownTitle').then(function (result) {
          scope.updateSearchDropDownTitle = result;
        });

        scope.showSearchUpdateCriteriaPopUp = function (event) {
          $q.all(scope.$applyAsync(scope.showpopupUpdateCriteria = true)).then(function () {
            scope.$applyAsync(function () {
              var myPopup = ngModule.element(element).find('.aw-search-updateCriteriaPopup');
              myPopup.scope().$broadcast('awPopupWidget.open', {
                popupUpLevelElement: ngModule.element(event.currentTarget.parentElement)
              });
            });
          });
        };
      },
      controller: 'awSearchBreadcrumbController',
      templateUrl: app.getBaseUrlPath() + '/html/aw-search-breadcrumb.directive.html'
    };
  }]);
});