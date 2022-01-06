"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display localized text.
 *
 * @module js/aw-i18n.directive
 */
define(['app', 'angular', 'lodash', //
'js/viewModelService'], //
function (app, ngModule, _) {
  'use strict';
  /**
   * Directive to display localized text
   *
   * @example <aw-i18n></aw-i18n>
   *
   * @member aw-i18n
   * @memberof NgElementDirectives
   */

  app.directive('awI18n', //
  ['viewModelService', //
  function (viewModelSvc) {
    return {
      restrict: 'E',
      link: function link($scope, element) {
        var declViewModel = viewModelSvc.getViewModel($scope, true);
        var key = element.text();

        if (key && key.length !== 0) {
          var localizedText = _.get(declViewModel, key);

          if (localizedText) {
            ngModule.element(element).text(localizedText);
          }
        }
      }
    };
  }]);
});