"use strict";

// Copyright 2018 Siemens Product Lifecycle Management Software Inc.

/* global define */

/**
 * Defines the {@link NgControllers.awChartCtrl}
 *
 * @module js/aw-chart.controller
 * @requires app
 * @requires highcharts
 * @requires js/localeService
 * @requires js/cssUtils.service
 */
define(['app', 'lodash', 'js/eventBus', 'js/logger', 'highcharts', 'js/localeService', 'js/cssUtils.service', 'js/viewModelService', 'js/declDataProviderService'], function (app, _, eventBus, logger, highcharts) {
  'use strict';

  highcharts.setOptions({
    lang: {
      thousandsSep: ','
    }
  });
  /**
   * The controller for the aw-chart directive
   *
   * @class awChartCtrl
   * @param $scope {Object} - Directive scope
   * @param localeService {Object} - locale service
   * @param cssUtils {Object} - cssUtils service
   * @memberof NgControllers
   */

  app.controller('awChartCtrl', ['$scope', '$window', 'localeService', 'cssUtils', 'viewModelService', 'declDataProviderService', function AwChartCtrl($scope, $window, localeService, cssUtils, viewModelService, declDataProviderService) {
    /**
     * The id of the chart
     *
     * @member chartID
     * @memberOf NgControllers.awChartCtrl
     */
    $scope.chartID = 'aw-chart-' + $scope.$id;
    /**
     * Controller reference
     */

    var self = this;
    /**
     * Get the Highcharts chart configuration object. See http://api.highcharts.com/highcharts for more
     * information.
     *
     * @method getChartConfig
     * @memberOf NgControllers.awChartCtrl
     *
     * @param chartTitleColor {String} - Chart title color
     * @param categories {String[]} - Categories
     * @param colors {String[]} - Column colors
     * @param colors {Boolean} - Boolean colorByPoint
     * @param values {Number[]} - Column values
     *
     * @return {Object} Highcharts configuration object
     */

    self.getChartConfig = function (chartTitleColor, categories, colors, colorByPoint, values) {
      var chartConfig;
      var chartType = $scope.chartProvider.chartType;
      var viewModelChartConfig = $scope.chartProvider.chartConfig;
      var spacingLeft = 20; // If the chart config in viewmodel has been specified

      var isDataLabelOnChartEnabled, zoomType, isYAxisLinearOrLogarithmic, xAxisLabel, yAxisLabel;

      if (viewModelChartConfig !== undefined) {
        zoomType = viewModelChartConfig.isChartZoomable === true ? 'xy' : undefined;
        isYAxisLinearOrLogarithmic = viewModelChartConfig.isYAxisLinearOrLogarithmic === 'logarithmic' ? 'logarithmic' : 'linear';
        isDataLabelOnChartEnabled = viewModelChartConfig.isDataLabelOnChartEnabled === undefined ? true : viewModelChartConfig.isDataLabelOnChartEnabled;
        xAxisLabel = viewModelChartConfig.xAxisLabel !== undefined ? viewModelChartConfig.xAxisLabel : '';
        yAxisLabel = viewModelChartConfig.yAxisLabel !== undefined ? viewModelChartConfig.yAxisLabel : '';
        spacingLeft = viewModelChartConfig.spacingLeft !== undefined ? viewModelChartConfig.spacingLeft : spacingLeft;
      } // If the chart config in viewmodel has NOT been specified, set 'isDataLabelOnChartEnabled' to true
      // zoomType = default, isYAxisLinearOrLogarithmic = default, xAxisLabel="", yAxisLabel = "" as default chart configuration
      // more default options can be set in this else block as chart rendering options/schema expands
      else {
          isDataLabelOnChartEnabled = true;
        }

      chartConfig = {
        chart: {
          renderTo: $scope.chartID,
          type: chartType,
          spacingLeft: spacingLeft,
          zoomType: zoomType,
          backgroundColor: null
        },
        credits: {
          enabled: false
        },
        title: {
          text: $scope.chartProvider.title,
          style: {
            color: chartTitleColor
          }
        },
        legend: {
          enabled: true,
          itemStyle: {
            color: chartTitleColor
          }
        },
        series: values
      };

      if (chartType === 'column') {
        chartConfig.chart.colors = colors;
        chartConfig.xAxis = {
          gridLineWidth: 0,
          tickWidth: 0,
          lineColor: 'transparent',
          title: {
            text: xAxisLabel
          },
          labels: {
            enabled: true
          },
          categories: categories
        };
        chartConfig.yAxis = {
          gridLineWidth: 0,
          gridLineColor: 'transparent',
          startOnTick: false,
          type: isYAxisLinearOrLogarithmic,
          title: {
            text: yAxisLabel
          },
          labels: {
            enabled: false
          },
          stackLabels: {
            enabled: isDataLabelOnChartEnabled,
            style: {
              textShadow: false
            }
          }
        };
        chartConfig.plotOptions = {
          series: {
            colors: colors,
            colorByPoint: colorByPoint,
            allowPointSelect: true,
            cursor: 'pointer',
            point: {
              events: {
                select: function select(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.selected', selectedChartEntity);
                },
                unselect: function unselect(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.unselected', selectedChartEntity);
                }
              }
            }
          },
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            stacking: 'normal'
          }
        };
      } else if (chartType === 'line') {
        chartConfig.xAxis = {
          gridLineWidth: '',
          tickWidth: '',
          lineColor: '',
          title: {
            text: xAxisLabel,
            style: {
              color: chartTitleColor
            }
          },
          labels: {
            enabled: true
          },
          categories: categories
        };
        chartConfig.yAxis = {
          startOnTick: false,
          type: isYAxisLinearOrLogarithmic,
          title: {
            text: yAxisLabel,
            style: {
              color: chartTitleColor
            }
          },
          labels: {
            enabled: true
          }
        };
        chartConfig.plotOptions = {
          series: {
            allowPointSelect: true,
            connectNulls: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: isDataLabelOnChartEnabled,
              color: chartTitleColor
            },
            point: {
              events: {
                select: function select(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.selected', selectedChartEntity);
                },
                unselect: function unselect(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.unselected', selectedChartEntity);
                }
              }
            }
          }
        };
      } else if (chartType === 'pie') {
        chartConfig.plotOptions = {
          series: {
            colors: colors,
            colorByPoint: colorByPoint
          },
          pie: {
            dataLabels: {
              enabled: true,
              format: '{point.y}'
            },
            showInLegend: true,
            allowPointSelect: true,
            cursor: 'pointer',
            point: {
              events: {
                select: function select(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.selected', selectedChartEntity);
                },
                unselect: function unselect(event) {
                  var selectedChartEntity = self.getClickedChartEventData(event);
                  eventBus.publish($scope.chartProvider.name + '.unselected', selectedChartEntity);
                }
              }
            }
          }
        };

        if (chartConfig.series.length > 0) {
          chartConfig.series[0].type = 'pie';
        }
      } else {
        logger.error('Chart type not supported. Chart will not be rendered');
      }

      if (viewModelChartConfig !== undefined) {
        if (viewModelChartConfig.showAxes) {
          chartConfig.chart.showAxes = viewModelChartConfig.showAxes;
        }

        if (viewModelChartConfig.tooltip) {
          chartConfig.tooltip = viewModelChartConfig.tooltip;
        }

        if (viewModelChartConfig.xAxis) {
          chartConfig.xAxis = Object.assign(chartConfig.xAxis, viewModelChartConfig.xAxis);
        }

        if (viewModelChartConfig.yAxis) {
          chartConfig.yAxis = Object.assign(chartConfig.yAxis, viewModelChartConfig.yAxis);
        }

        if (viewModelChartConfig.plotOptions) {
          chartConfig.plotOptions = Object.assign(chartConfig.plotOptions, viewModelChartConfig.plotOptions);
        }

        if (viewModelChartConfig.legend) {
          chartConfig.legend = Object.assign(chartConfig.legend, viewModelChartConfig.legend);
        }
      }

      return chartConfig;
    };
    /**
     * Returns clicked chart entity details
     *
     * @param {String} event The click event on the chart
     *
     * @returns {Object} Object having x, y values and series name
     */


    self.getClickedChartEventData = function (event) {
      return {
        label: event.target.category || event.target.name,
        value: event.target.y,
        seriesName: event.target.series.name
      };
    };
    /**
     * Initialize chart by invoking dataload action
     *
     * @param {String} loadActionName The load action
     *
     * @returns {Promise} Promise resolved with initial data for chart
     */


    self.doLoadChartDataAction = function (loadActionName) {
      var declViewModel = viewModelService.getViewModel($scope, true);
      var loadAction = declViewModel.getAction(loadActionName);
      return declDataProviderService.executeLoadAction(loadAction, {}, $scope).then(function () {
        self.refreshChart();
      });
    };
    /**
     * Update or build the chart based on the current chart provider
     *
     * @method refreshChart
     * @memberOf NgControllers.awChartCtrl
     */


    self.refreshChart = function () {
      var config = null;

      if ($scope.chartProvider && $scope.chartProvider.chartPoints && $scope.chartProvider.chartType) {
        // ==========Determine all of the dynamic options================
        // Fetch categories(i.e x-axis values) from all series that have all the possible x axis values
        var categories = [];
        var tempValues = [];
        var present = false;
        $scope.chartProvider.chartPoints.forEach(function (cat) {
          categories = _.union(categories, cat.keyValueDataForChart.map(function (xAxisValues) {
            return xAxisValues.label;
          }));
        }); // setting data to respective categories

        $scope.chartProvider.chartPoints.forEach(function (cat) {
          tempValues = [];
          categories.forEach(function (category) {
            present = false;

            for (var i = 0; i < cat.keyValueDataForChart.length; i++) {
              if (category === cat.keyValueDataForChart[i].label) {
                tempValues.push(cat.keyValueDataForChart[i]);
                present = true;
                break;
              }
            }

            if (!present) {
              tempValues.push({
                label: category,
                value: null
              });
            }
          });
          cat.keyValueDataForChart = tempValues;
        }); // Fetch y-axis values

        var temp = [];

        for (var t in $scope.chartProvider.chartPoints) {
          if (!$scope.chartProvider.chartPoints[t].keyValueDataForChart) {
            continue;
          } // for PIE chart we need name : value for the legends to display


          if ($scope.chartProvider.chartType === 'pie') {
            temp[t] = $scope.chartProvider.chartPoints[t].keyValueDataForChart.map(function (yAxis) {
              return {
                y: yAxis.value,
                name: yAxis.name
              };
            });
          } else {
            temp[t] = $scope.chartProvider.chartPoints[t].keyValueDataForChart.map(function (yAxisValues) {
              return yAxisValues.value;
            });
          }
        } // prepare values for 'series' parameter for chartConfig


        var values = [];

        for (var x in $scope.chartProvider.chartPoints) {
          if (!$scope.chartProvider.chartPoints[x].keyValueDataForChart) {
            continue;
          }

          values.push({
            name: $scope.chartProvider.chartPoints[x].seriesName,
            data: temp[x]
          });
        }

        var colors = cssUtils.getColumnChartColors();
        var colorByPoint = false;
        var chartTitleColor = cssUtils.getPropertyFromCssClass('aw-charts-chartTitleColor', 'background-color'); // Load the localized text

        localeService.getLocalizedText('UIMessages', 'results').then(function (resultText) {
          // to ensure when there is only 1 series , column charts with multiple colors are rendered as currently supported by aw-column-chart
          // same behaviour is needed for PIE chart with single series.
          if ($scope.chartProvider.chartPoints.length === 1 && ($scope.chartProvider.chartType === 'column' || $scope.chartProvider.chartType === 'pie')) {
            colorByPoint = true;
            config = self.getChartConfig(chartTitleColor, categories, colors, colorByPoint, values);
          } else {
            // when chart (column or line) has >= 1 series , chart is rendered with the new config and colors as decided by highcharts theme
            config = self.getChartConfig(chartTitleColor, categories, null, colorByPoint, values);
          }

          if (config !== undefined) {
            var Chart = $window.Highcharts.Chart;
            $scope.chart = new Chart(config);
          }
        });
      }
    };
    /**
     * Update the colors of the chart ; applicable only for column chart with single series
     * for multiple series charts for both column and line charts, highcharts color library has been leveraged
     * @method refreshColors
     * @memberOf NgControllers.awChartCtrl
     */


    self.refreshColors = function () {
      if ($scope.chart) {
        var chartTitleColor = cssUtils.getPropertyFromCssClass('aw-charts-chartTitleColor', 'background-color'); // Update the colors and redraw the chart

        $scope.chart.setTitle({
          text: $scope.chartProvider.title,
          style: {
            color: chartTitleColor
          }
        }, null, false);
        $scope.chart.series[0].update({
          colors: cssUtils.getColumnChartColors()
        });
        $scope.chart.yAxis[0].update({
          title: {
            text: $scope.chartProvider.title,
            style: {
              color: chartTitleColor
            }
          }
        });
        $scope.chart.xAxis[0].update({
          title: {
            text: $scope.chartProvider.title,
            style: {
              color: chartTitleColor
            }
          }
        });
      }
    };
    /**
     * Force a resize of the chart
     *
     * @method reflow
     * @memberOf NgControllers.awChartCtrl
     */


    self.reflow = function () {
      // Resize the chart
      if ($scope.chart) {
        $scope.chart.reflow();
      }
    };
  }]);
});