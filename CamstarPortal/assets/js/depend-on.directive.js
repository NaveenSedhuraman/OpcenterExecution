"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to support the interdependnt LOVs
 *
 * @module js/depend-on.directive
 */
define(['app', 'lodash', 'js/eventBus', //
'js/viewModelService'], //
function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to support the interdependnt LOVs
   *
   * @example <aw-widget prop="data.listBoxState" depend-on="listBoxCountry" on-change="switchList"></aw-widget>
   *
   * @member depend-on
   * @memberof NgElementDirectives
   */

  app.directive('dependOn', ['viewModelService', function (viewModelSvc) {
    return {
      restrict: 'A',
      link: function link(scope, element, attr) {
        var declViewModel = viewModelSvc.getViewModel(scope, true);

        var prop = _.get(declViewModel, attr.dependOn);

        scope.prop = prop;
        var propChangeEventReg = eventBus.subscribe(prop.dataProvider + '.validSelectionEvent', function (event) {
          if (attr.onChange) {
            viewModelSvc.executeCommand(declViewModel, attr.onChange, scope);
          }
        });
        scope.$on('$destroy', function () {
          eventBus.unsubscribe(propChangeEventReg);
        });
      }
    };
  }]);
});