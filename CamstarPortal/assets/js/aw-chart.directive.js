"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global
 define
 */

/**
 * Directive to display a column chart using Highcharts.
 *
 * @module js/aw-chart.directive
 * @requires app
 * @requires jquery
 * @requires lodash
 * @requires js/eventBus
 * @requires highcharts
 * @requires js/localeService
 */
define(['app', 'lodash', 'js/eventBus', 'js/aw-chart.controller'], function (app, _, eventBus) {
  'use strict';
  /**
   * Directive to display a column or a curve chart using Highcharts.
   *
   * @example <aw-chart chart-provider="data.chartProviders.myChartProvider"></aw-chart>
   *
   * @member aw-chart
   * @memberof NgElementDirectives
   */

  app.directive('awChart', [function () {
    return {
      restrict: 'E',
      scope: {
        /**
         * The chart provider. This is a configurable object with a "title" (String) , "chartType" (String) ,
         * "loadDataAction" (Object[]) and "chartConfig" (Object).
         *
         * "loadDataAction" holds chartPoints that has an array of "label" (String) and "value" (Number) property.
         */
        chartProvider: '='
      },
      controller: 'awChartCtrl',
      link: function link($scope, $element, $attr, $controller) {
        /**
         * The current element will be used as the target for the chart
         */
        $element.attr('id', $scope.chartID);
        /**
         * When the chartProvider or any properties on it change, refresh the chart
         */

        $scope.$watchGroup(['chartProvider', 'chartProvider.title', 'chartProvider.type', 'chartProvider.chartConfig'], $controller.refreshChart);
        /**
         * When the container div resizes also resize the chart
         */

        $scope.$watch(function _watchChartColumnSize() {
          return {
            h: $element.height(),
            w: $element.width()
          };
        }, _.debounce(function (a, b) {
          // Filter the initial update
          if (a !== b) {
            $controller.reflow();
          }
        }, 250, {
          leading: true,
          trailing: true
        }), true);
        /**
         * Does a shallow watch of the chart points - if one is added or removed the chart will update, but changing
         * a value for a chartPoint will not update it.
         */

        $scope.$watchCollection('chartProvider.chartPoints', function (a, b) {
          // Filter the initial update
          if (a !== b) {
            $controller.refreshChart();
          }
        }); // Action for loading chart data ; a mandatory field

        var loadData = function loadData() {
          if ($scope.chartProvider.loadDataAction) {
            $controller.doLoadChartDataAction($scope.chartProvider.loadDataAction);
          }
        };

        loadData();
        /**
         * When the theme changes update the colors
         */

        var handleThemeChangeEvent = function handleThemeChangeEvent() {
          // Add listener
          var themeChangeListener = eventBus.subscribe('ThemeChangeEvent', function () {
            $scope.$evalAsync($controller.refreshColors);
          }); // And remove it when the scope is destroyed

          $scope.$on('$destroy', function () {
            eventBus.unsubscribe(themeChangeListener);
          });
        };

        handleThemeChangeEvent();
        /**
         * Unbind the chart on destroy
         */

        $scope.$on('$destroy', function () {
          if ($scope.chart) {
            if ($scope.chart.destroy) {
              $scope.chart.destroy();
            }

            $scope.chart = null;
          }
        });
      }
    };
  }]);
});