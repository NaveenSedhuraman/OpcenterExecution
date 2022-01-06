"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Directive to display the header.
 *
 * @module js/aw-header-title.directive
 * @requires app
 * @requires js/aw-gwt-presenter.directive
 */
define(['app', 'js/eventBus', 'js/logger', 'js/analyticsService', 'js/localeService', 'js/locationNavigation.service', 'js/aw-icon.directive', 'js/aw-model-icon.directive', 'js/aw-header-subtitle.directive', 'js/aw-header-props.directive', 'js/aw-visual-indicator.directive', 'js/aw-include.directive'], function (app, eventBus, logger, analyticsSvc) {
  'use strict';
  /**
   * Directive to display the header.
   *
   * The header presenter is a singleton so only one instance of this directive can be used at a time.
   *
   * Parameters: headerVMO - The header view model object used to show icon(left of the header title) and visual
   * indicator headerTitle - The title to set in the headeraw-base-summaryOnlyBackButton headerProperties - Any
   * properties to display in the header
   *
   * @example <aw-header headerTitle="Teamcenter" [headerProperties=""]></aw-header>
   *
   * @member aw-header
   * @memberof NgElementDirectives
   */

  app.directive('awHeaderTitle', ['localeService', 'locationNavigationService', function (localeSvc, locationNavigationSvc) {
    return {
      restrict: 'E',
      scope: {
        headerVMO: '=?headervmo',
        headerTitle: '=headertitle',
        headerProperties: '=?headerproperties'
      },
      link: function link(scope) {
        localeSvc.getLocalizedText('UIMessages', 'backBtn').then(function (result) {
          scope.backBtnTitle = result;
        }); // Listen for event for clearing header properties

        var eventReg = eventBus.subscribe('clear.default.header', function (data) {
          if (data.name === 'clear.default.header') {
            // Header properties to be cleared here
            logger.info('Header properties to be cleared here');
          }
        }); // And remove the event registration when the scope is destroyed

        scope.$on('$destroy', function () {
          eventBus.unsubscribe(eventReg);
        });
      },
      controller: ['$scope', function ($scope) {
        // Action when Back button is clicked
        $scope.onBack = function () {
          if (locationNavigationSvc) {
            locationNavigationSvc.goBack();
          }

          var prevLocationEvent = {};
          prevLocationEvent.sanAnalyticsType = 'Previous Locations';
          prevLocationEvent.sanCommandId = 'sanPreviousLocation';
          prevLocationEvent.sanCommandTitle = 'Previous Location';
          analyticsSvc.logCommands(prevLocationEvent);
        }; // Action when Narrow Summary Title is clicked


        $scope.onClickNarrowSummaryTitle = function () {
          // Fire event
          eventBus.publish('narrowSummaryLocationTitleClickEvent', {});
        };
      }],
      templateUrl: app.getBaseUrlPath() + '/html/aw-header-title.directive.html'
    };
  }]);
});