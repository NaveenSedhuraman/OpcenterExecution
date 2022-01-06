"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display the secondary workarea.
 *
 * @module js/aw-secondary-workarea.directive
 */
define(['app', 'lodash', 'js/aw-xrt-summary.directive', 'js/aw-selection-summary.directive', 'js/editHandlerService', 'js/appCtxService' //
], function (app, _) {
  'use strict';
  /* eslint-disable-next-line valid-jsdoc*/

  /**
   * Directive to display the secondary workarea.
   *
   * @example <aw-secondary-workarea selected="modelObjects"></aw-secondary-workarea>
   *
   * @member aw-secondary-workarea
   * @memberof NgElementDirectives
   */

  app.directive('awSecondaryWorkarea', ['editHandlerService', 'appCtxService', function (editHandlerService, appCtxSvc) {
    return {
      restrict: 'E',
      templateUrl: app.getBaseUrlPath() + '/html/aw-secondary-workarea.directive.html',
      scope: {
        selected: '=?',
        // The currently selected model objects,
        isXrtApplicable: '<?' // Whether XRT should be used. Determined by solution by default.

      },
      link: function link($scope, $element) {
        if (!$scope.hasOwnProperty('isXrtApplicable')) {
          $scope.isXrtApplicable = !_.isUndefined(appCtxSvc.ctx.tcSessionData);
        }

        var sash = $element.prev('.aw-layout-splitter');

        if (sash) {
          $scope.$watch(_.debounce(function updateInvisibleClass() {
            var width = $element.width();

            if (width < 300) {
              $element.addClass('invisible');
              sash.addClass('invisible');
            } else {
              $element.removeClass('invisible');
              sash.removeClass('invisible');
            }
          }), 250, {
            leading: false,
            trailing: true
          });
        } // Delay updating view until edit handler check is complete


        $scope.$watch('selected.length', function (newSelectedLength) {
          var eh = editHandlerService.getActiveEditHandler();

          if (eh) {
            eh.leaveConfirmation(function () {
              $scope.selectedLength = newSelectedLength;
            });
          } else {
            $scope.selectedLength = newSelectedLength;
          }
        }); // Set selection source to secondary workarea

        $scope.$on('dataProvider.selectionChangeEvent', function (event, data) {
          data.source = 'secondaryWorkArea';
        });
      }
    };
  }]);
});