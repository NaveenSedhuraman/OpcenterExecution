"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines the {@link NgControllers.awColumnChartCtrl}
 *
 * @module js/aw-column-chart.controller
 * @requires app
 * @requires highcharts
 * @requires js/localeService
 * @requires js/cssUtils.service
 */
define(['app', 'highcharts', 'js/localeService', 'js/cssUtils.service'], function (app, highcharts) {
  'use strict';

  highcharts.setOptions({
    lang: {
      thousandsSep: ','
    }
  });
  /**
   * The controller for the aw-command-bar directive
   *
   * @class awColumnChartCtrl
   * @param $scope {Object} - Directive scope
   * @param localeService {Object} - locale service
   * @param cssUtils {Object} - cssUtils service
   * @memberof NgControllers
   */

  app.controller('awColumnChartCtrl', ['$scope', '$window', 'localeService', 'cssUtils', function ($scope, $window, localeService, cssUtils) {
    /**
     * The id of the chart
     *
     * @member chartID
     * @memberOf NgControllers.awColumnChartCtrl
     */
    $scope.chartID = 'aw-column-chart-' + $scope.$id;
    /**
     * Controller reference
     */

    var ctrl = this;
    /**
     * Get the base value from the given values. Negative values are not supported.
     *
     * @method calculateBase
     * @memberOf NgControllers.awColumnChartCtrl
     *
     * @param values {Number[]} - Values
     *
     * @return {Number} Base value
     */

    ctrl.calculateBase = function (values) {
      if (values.length > 0) {
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);

        if (min < max) {
          // Formulated using power regression of sample points
          var base = min * Math.pow(min / max, 0.1898); // Adjusted to make the base closer to the min value which will make the height slightly shorter

          return base + (min - base) * 0.05;
        }

        return min;
      }

      return 1;
    };
    /**
     * Get the Highcharts chart configuration object. See http://api.highcharts.com/highcharts for more
     * information.
     *
     * @method getChartConfig
     * @memberOf NgControllers.awColumnChartCtrl
     *
     * @param title {String} - Chart title
     * @param chartTitleColor {String} - Chart title color
     * @param categories {String[]} - Categories
     * @param base {Number} - Base value
     * @param colors {String[]} - Column colors
     * @param values {Number[]} - Column values
     * @param resultText {String} - Text to show on hover
     *
     * @return {Object} Highcharts configuration object
     */


    ctrl.getChartConfig = function (title, chartTitleColor, categories, base, colors, values, resultText) {
      return {
        chart: {
          renderTo: $scope.chartID,
          type: 'column',
          showAxes: false,
          backgroundColor: null,
          spacingLeft: 20
        },
        credits: {
          enabled: false
        },
        title: {
          text: title,
          style: {
            color: chartTitleColor
          }
        },
        legend: {
          enabled: false
        },
        xAxis: {
          gridLineWidth: 0,
          tickWidth: 0,
          categories: categories,
          lineColor: 'transparent'
        },
        yAxis: {
          min: base,
          startOnTick: false,
          type: 'logarithmic',
          gridLineWidth: 0,
          gridLineColor: 'transparent',
          title: {
            text: ''
          },
          labels: {
            enabled: false
          },
          stackLabels: {
            enabled: true,
            style: {
              textShadow: false
            }
          }
        },
        plotOptions: {
          series: {
            colors: colors,
            colorByPoint: true,
            allowPointSelect: true,
            cursor: 'pointer',
            point: {
              events: {
                select: function select(event) {
                  var column = $scope.chartProvider.columns[event.target.index];

                  if ($scope.chartProvider.onSelect) {
                    $scope.chartProvider.onSelect(column);
                  }
                },
                unselect: function unselect(event) {
                  var column = $scope.chartProvider.columns[event.target.index];

                  if ($scope.chartProvider.onDeselect) {
                    $scope.chartProvider.onDeselect(column);
                  }
                }
              }
            }
          },
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            stacking: 'normal'
          }
        },
        series: [{
          data: values,
          name: resultText
        }]
      };
    };
    /**
     * Update the chart that already exists.
     *
     * @method updateChart
     * @memberOf NgControllers.awColumnChartCtrl
     *
     * @param config {Object} - Highcharts configuration object
     */


    ctrl.updateChart = function (config) {
      $scope.chart.setTitle(config.title, null, false);
      $scope.chart.xAxis[0].setCategories(config.xAxis.categories, false);
      $scope.chart.yAxis[0].setExtremes(config.yAxis.min, null, false);
      $scope.chart.series[0].setData(config.series[0].data, false);
      $scope.chart.series[0].name = config.series[0].name;

      if ($scope.chart.series[0].data) {
        $scope.chart.series[0].data.map(function (d) {
          d.selected = false;
        });
      }

      $scope.chart.redraw();
    };
    /**
     * Update or build the chart based on the current chart provider
     *
     * @method refreshChart
     * @memberOf NgControllers.awColumnChartCtrl
     */


    ctrl.refreshChart = function () {
      if ($scope.chartProvider && $scope.chartProvider.columns) {
        // Determine all of the dynamic options
        var categories = $scope.chartProvider.columns.map(function (column) {
          return column.label;
        });
        var values = $scope.chartProvider.columns.map(function (column) {
          return column.value;
        });
        var base = ctrl.calculateBase(values);
        var colors = cssUtils.getColumnChartColors();
        var chartTitleColor = cssUtils.getPropertyFromCssClass('aw-charts-chartTitleColor', 'background-color'); // Load the localized text

        localeService.getLocalizedText('UIMessages', 'results').then(function (resultText) {
          // Create or update a chart with the new config
          var config = ctrl.getChartConfig($scope.chartProvider.title, chartTitleColor, categories, base, colors, values, resultText);

          if ($scope.chart) {
            // Not supported until highcharts 5.0.0
            // : $scope.chart.update( config );
            ctrl.updateChart(config);
          } else {
            var Chart = $window.Highcharts.Chart;
            $scope.chart = new Chart(config);
          }
        });
      }
    };
    /**
     * Update the colors of the chart
     *
     * @method refreshColors
     * @memberOf NgControllers.awColumnChartCtrl
     */


    ctrl.refreshColors = function () {
      if ($scope.chart) {
        // Update the colors and redraw the chart
        $scope.chart.setTitle({
          text: $scope.chartProvider.title,
          style: {
            color: cssUtils.getPropertyFromCssClass('aw-charts-chartTitleColor', 'background-color')
          }
        }, null, false);
        $scope.chart.series[0].update({
          colors: cssUtils.getColumnChartColors()
        });
      }
    };
    /**
     * Force a resize of the chart
     *
     * @method reflow
     * @memberOf NgControllers.awColumnChartCtrl
     */


    ctrl.reflow = function () {
      // Resize the chart
      if ($scope.chart) {
        $scope.chart.reflow();
      }
    };
  }]);
});