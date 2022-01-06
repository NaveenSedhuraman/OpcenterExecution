//Note: should not be referenced directly in HTML file. Will be used by bundler.js
// The idea behid is to merge all these files in one file named dist/ui-chart.js. That file will be used in demo or 3rd party app. 
'use strict';
(function ($) {


    /**
      * @typedef {string} chartTypes
      * @description Type of the control chart for variable characteristics. This can be used for different chart types parameter.
      * @property {string} xb_s - xb/s chart
      * @property {string} mxb_ms - mxb_ms chart
      * @property {string} xb_R - xb_R chart
      * @property {string} mxb_mR - mxb_mR chart
      * @property {string} x_ms - x_ms chart
      * @property {string} x_mR - x_mR chart
      * @property {string} xb - xb chart
      * @property {string} s - s chart
      * @property {string} r - range chart
      * @property {string} hist_S - Histogram chart where the array histogramClassesByS is used {@link OuputModel} only valid in Histogram Function {@link HistoChart}
      * @property {string} hist_S -Histogram chart where the array histogramClassesByTolerances is used {@link OuputModel} only valid in Histogram Function {@link HistoChart}
      * @property {string} svc - Single Value Chart
      * @property {string} med -Median chart
      * @property {string} med_R med_R chart
    **/
    var chartTypes = {
        xb_s: 1,
        mxb_ms: 2,
        xb_R: 3,
        mxb_mR: 4,
        x_ms: 5,
        x_mR: 6,
        xb: 7,
        s: 8,
        r: 9,
        hist_S: 10,
        //Histogram by Tolerance
        hist_T: 11,
        svc: 12,
        ms: 13,
        mR: 14,
        med: 15,
        med_R: 16,
        cu_Sum: 17
    };
    var movingMeanWeightings = {
        Uniformly: 1,
        Exponentially: 2
    };
    var attrChartTypes = {
        p: 7,
        np: 8,
        C: 9,
        U: 10
    };
    var siemensColors = {
        SiemensSnow: "#FFFFFF",
        PLBlack4: '#1E1E1E',
        SIEMENS_NATURAL_BLUE_DARK: "#006487",
        SIEMENS_BLUE_DARK: "#005F87",
        SIEMENS_STATUS_RED_DARK: "#DC0000",
        SIEMENS_STATUS_GREEN_DARK: "#0A9B00",
        SIEMENS_STATUS_GREEN_LIGHT:"#28E632",
        SiemensYellowDark: "#FFB900",
        SiemensBlue9: "#0F789B",
        SiemensBlueLight: "#50BED7",
        PL_BLACK_22: '#D2D2D2',
        SiemensBlue13: "#3296B9",
        PL_BLACK_19: '#B4B4B4',
        violationZone:'red'
    };
    var chartSeriesColors = {
        Histogram: {
            Bin: siemensColors.SiemensBlue13,
            ToleranceLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            Xbb: siemensColors.SIEMENS_STATUS_GREEN_DARK,
            StandardDeviation: siemensColors.SIEMENS_NATURAL_BLUE_DARK
        },
        ControlChart: {
            ControlLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            WarningLimit: siemensColors.SiemensYellowDark,
            ToleranceLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            xbarProcess: siemensColors.SIEMENS_STATUS_GREEN_DARK,
            ProcessViolation: siemensColors.SIEMENS_STATUS_RED_DARK,
            xbarX: siemensColors.SiemensBlue9,
            Sr: siemensColors.SiemensBlue9,
            Marker: siemensColors.SIEMENS_STATUS_RED_DARK,
            InfoMarker: siemensColors.SiemensBlueLight,
            YellowMarker: siemensColors.SiemensYellowDark
        },
        SingleValueChart: {
            ControlLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            WarningLimit: siemensColors.SiemensYellowDark,
            ToleranceLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            Measurement: siemensColors.SiemensBlue9,
            xbp: siemensColors.SIEMENS_STATUS_GREEN_DARK,
            Marker: siemensColors.SIEMENS_STATUS_RED_DARK,
            YellowMarker: siemensColors.SiemensYellowDark
        },
        AttrControlChart: {
            ControlLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            WarningLimit: siemensColors.SiemensYellowDark,
            ToleranceLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            main: siemensColors.SiemensBlue9,
            Marker: siemensColors.SIEMENS_STATUS_RED_DARK,
            ProcessMeanValue: siemensColors.SIEMENS_STATUS_GREEN_DARK,
            localMeanValue: siemensColors.SIEMENS_STATUS_GREEN_LIGHT
        },
        ProbabilityPlot:
        {
            mainSeries: siemensColors.SiemensBlue9,
            slope: siemensColors.PLBlack4,
            ToleranceLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            StandardDeviation: siemensColors.SIEMENS_NATURAL_BLUE_DARK
        },
        Pareto:
        {
            DefectsCount: siemensColors.SIEMENS_BLUE_DARK,
            DefectsCounthover: siemensColors.SIEMENS_NATURAL_BLUE_DARK
        },
        CUSumChart:
        {
            CUSumLow: siemensColors.SiemensBlueLight,
            CUSumHigh: siemensColors.SIEMENS_BLUE_DARK,
            CUSumControlLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            CUSumMeanValue: siemensColors.SIEMENS_STATUS_GREEN_DARK
        },
        CUCountChart: {
            controlLimit: siemensColors.SIEMENS_STATUS_RED_DARK,
            meanValue: siemensColors.SIEMENS_STATUS_GREEN_DARK,
            mainSeries: siemensColors.SiemensBlue9
        }
    };
    var titleStyle = {
        fontSize: '15.5pt',
        color: siemensColors.PLBlack4
    };
    var axiesStyle = {
        fontSize: '7.5pt',
        color: siemensColors.PLBlack4
    };
    var axiesTitleStyle = {
        fontSize: '12.5pt',
        color: siemensColors.PLBlack4
    };
    var siemensTooltip = {
        // enabled: false
        split: false, // to show seperate each tooltip e.g. Series, UWL etc.
        headerFormat: '',
        formatter: undefined,
        backgroundColor: siemensColors.SiemensSnow,
        borderWidth: 0,
        padding: 0,
        VerticalAlignValue: 'middle',
        useHTML: true
    };

    /**
     * The IDs of the series used in control chart. These can be used in addPoint, updatePoint methods or to hide series.
     * @typedef {string} seriesIds
     * @memberof ControlChart
     * @property {string} ucl_1 - Upper control limit id of the first series.
     * @property {string} lcl_1 - Lower control limit id of the first series.
     * @property {string} uwl_1 - Upper warn limit id of the first series.
     * @property {string} lwl_1 - Lower warn limit id of the first series.
     * @property {string} xbp_1 - Process mean value id of the first series.
     * @property {string} series__1 - XB series id of the first series.
      
     * @property {string} ucl_2 - Upper control limit id of the second series.
     * @property {string} lcl_2 - Lower control limit id of the second series.
     * @property {string} uwl_2 - Upper warn limit id of the second series.
     * @property {string} lwl_2 - Lower warn limit id of the second series.
     * @property {string} xbp_2 - Process mean value id of the second series.
     * @property {string} series__2 - Series id of the second main series. It can be s, r, etc. series
     * @property {string} boxplot - The boxplot series id
     * @example
     * <caption> The series Id can be use like this add a point in a specific series </caption>
     * $('#chart').chart('addPoint', 'ucl_1', 19.90);
     * 
     * // to hide a series in chart , the series can be used too
     *  * $('#chart').chart(
     *      {
     *          locale: "en",
     *          data: {
     *              specifications: {
     *                              subgroupSize : 2,
     *                              controlChartType : 'xb_s',     
     *          },
     *          subgroups: [],  // Array of objects in defined format
     *      },
     *      decimalPlaces: 2,
     *      hiddenSeries: ['lcl_1', 'boxplot'],
     *      onSeriesClick: function (data) {
     *          console.log(data);
     *      },
     *      onLegendClick : function (data) {
     *          console.log(data);
     *      }
     *      });
     */

    /**
     * The IDs of the series used in single value chart.These can be used to hide specific series. 
     * @typedef {string} seriesIds
     * @memberof SingleValueChart
     * @property {string} ucl - Upper control limit series id.
     * @property {string} lcl - Lower control limit series id.
     * @property {string} uwl - Upper warn limit series id.
     * @property {string} lwl - Lower warn limit series id.
     * @property {string} xbp - Process mean value series id.
     * @property {string} utl - Upper control limit series id.
     * @property {string} ltl - Lower control limit series id .
     * @property {string} measurement - Measurement series id.
     * @example 
     * <caption> The series Id can be use like this to hide the series </caption>
     * $('#svc').singleValueChart(
     *      {
     *          locale: "en",
     *          data: {
     *          specifications: {
     *                          subgroupSize : 2,
     *                          controlChartType : 'xb_s'
     *          },
     *          measurements : [], // Array of objects in defined format
     *          subgroups: [],  // Array of objects in defined format
     *      },
     *      decimalPlaces: 2,
     *      hiddenSeries: ["lcl"],
     *      onSeriesClick: function (data) {
     *          console.log(data);
     *      }, 
     *      onLegendClick : function (data) {
     *          console.log(data);
     *      }
     *      });
     * */

    var seriesIds = {
        singleValueChart: {
            ucl: 'ucl',
            lcl: 'lcl',
            uwl: 'uwl',
            lwl: 'lwl',
            utl: 'utl',
            ltl: 'ltl',
            xbp: 'xbp',
            measurement: 'measurements__1',
            flagSeries: 'flagSeries'
        },
        HistogramChart: {
            Classes: 'classes'
        },
        controlChart: {
            ucl1: 'ucl_1',
            lcl1: 'lcl_1',
            uwl1: 'uwl_1',
            lwl1: 'lwl_1',
            xbp1: 'xbp_1',
            series1: 'series__1',

            ucl2: 'ucl_2',
            lcl2: 'lcl_2',
            uwl2: 'uwl_2',
            lwl2: 'lwl_2',
            xbp2: 'xbp_2',
            series2: 'series__2',

            boxplot: 'boxplot', // this is for custom icon for boxplot
            boxplot_main: 'boxplot_main', // shouldn't be documented 
            toolChanged: 'tool_changed',
            measurement: 'measurement',
            flagSeries: 'flagSeries',
            SPCZoneA: 'SPC_ZONE_A',
            SPCZoneB1: 'SPC_ZONE_B1',
            SPCZoneB2: 'SPC_ZONE_B2',
            SPCZoneC1: 'SPC_ZONE_C1',
            SPCZoneC2: 'SPC_ZONE_C2'
        },
        visControlChart: {
            nonConformanceRate: 'nonConformanceRate',
            numberOfDefects: 'numberOfDefects',
            upperControlLimitOfControlChart1: 'ucl_vis'
        },
        cuSumChart: {
            cuSumLow: 'cuSumLow',
            cuSumHigh: 'cuSumHigh',
            cuSumUCL: 'cuSumUCL',
            cuSumLCL: 'cuSumLCL',
            cuSumCL: 'cuSumCL'
        },
        cuCountChart: {
            cuCount: 'cuCount',
            lcl: 'ucl',
            ucl: 'lcl',
            xbp: 'xbp'
        }
    };
    var onLegendClickEvent =
    {
        seriesID: undefined,
        isVisible: true
    };
    var onSeriesClickEvent =
    {
        subgroupNumber: undefined,
        seriesName: undefined,
        point: undefined,
        seriesID: undefined
    };
    var svgRepository =
    {
        ToolChanged: '<svg id="ToolChanged" width="16" height="16" data-name="Livello 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g id="g827"><path id="path9" d="M2.165,21.943a2.548,2.548,0,0,1-1.283-.725A2.485,2.485,0,0,1,.173,20a1.826,1.826,0,0,1,.036-1.2c.051-.1,1.815-2.084,3.92-4.412s3.822-4.25,3.816-4.268S7.192,9.34,6.286,8.419L4.641,6.745l-.949.948-.95.948L1.371,7.251,0,5.861l.926-.9c.509-.5,1.832-1.8,2.94-2.89L5.879.082l.2.142a1.466,1.466,0,0,0,.905.328A1.625,1.625,0,0,0,8,.2L8.285,0l.791.81.791.81-1.224,1.2-1.224,1.2,1.588,1.61L10.6,7.231l.1-.088a3.831,3.831,0,0,0,.272-.3l.174-.208-.072-.367A10.514,10.514,0,0,1,11,4.021a4.139,4.139,0,0,1,.841-2.127A5.184,5.184,0,0,1,15.227.051c.576-.069.824-.033,1.078.154.318.234.408.351.43.562a.451.451,0,0,1-.066.323c-.047.073-.473.573-.945,1.111-.842.957-.865.987-1.006,1.369-.2.551-.443,1.267-.432,1.275s.326.282.713.619l.7.612.184-.069c.1-.038.453-.191.781-.34.553-.251.613-.29.834-.546a19.56,19.56,0,0,1,1.822-1.972c.193-.067.4.018.67.276.328.314.355.429.33,1.354A4.335,4.335,0,0,1,19.8,6.922,4.176,4.176,0,0,1,18.24,8.744a5.3,5.3,0,0,1-3.217.765h-.744l-.254.3-.334.386c-.076.089-.07.1.279.477a3.3,3.3,0,0,1,.342.4c-.01.006-.193.129-.41.271l-.395.259-.268-.308c-.148-.168-1.581-1.637-3.184-3.266l-3.047-3.1-.137-.142-.729.7-.729.7.747.768c.412.423,1.91,1.946,3.33,3.386,1.514,1.535,2.574,2.643,2.561,2.677a4.272,4.272,0,0,1-.258.395l-.235.338-.271-.268-.27-.268L7.422,17.422C5.446,19.738,3.8,21.66,3.76,21.692a2.209,2.209,0,0,1-.313.176,2.236,2.236,0,0,1-1.282.075M3.11,20.9c.061-.055,1.7-1.967,3.651-4.25l3.54-4.152-.809-.808-.808-.809-.162.166c-.089.092-1.794,1.974-3.79,4.183-3.578,3.961-3.628,4.02-3.628,4.2a1.66,1.66,0,0,0,.606,1.2c.4.33,1.167.475,1.4.266M13.293,9.11c.5-.589.525-.6,1.357-.584A4.928,4.928,0,0,0,17.8,7.837,3.823,3.823,0,0,0,19.2,5.68a4.667,4.667,0,0,0,.127-1.074c-.012-.013-.1.066-.189.175s-.426.485-.74.837l-.57.641-.949.428c-.521.236-1.016.442-1.1.459-.295.061-.441-.032-1.441-.915-.525-.464-.986-.89-1.021-.945-.172-.26-.107-.569.385-1.895l.275-.739.682-.773a6.862,6.862,0,0,0,.654-.8A3.862,3.862,0,0,0,12.326,3.03a3.881,3.881,0,0,0-.333,2.036A8.36,8.36,0,0,0,12.1,6.3c.125.641.107.691-.457,1.307l-.34.37.789.79c.434.433.8.787.811.786s.186-.2.387-.438M5.178,4.915,8.064,2.077,8.55,1.6l-.184-.184-.183-.184-.391.128a2.557,2.557,0,0,1-1.537.023l-.263-.094-.731.719C2.454,4.767,1.369,5.845,1.369,5.872c0,.043,1.341,1.413,1.378,1.407.017,0,1.111-1.066,2.431-2.364" class="aw-theme-iconOutline" fill="#464646"></path><path id="path824" d="M17.6,16.943s-.034-.214-.074-.469c-.066-.413-.072-.465-.054-.473s.307-.052.656-.105c.73-.111.708-.107.7-.122s-.075-.066-.158-.133a3.668,3.668,0,0,0-1.785-.846,2.119,2.119,0,0,0-.821.076,2.453,2.453,0,0,0-.509.265,3.189,3.189,0,0,0-.9,1.115c-.04.077-.075.142-.077.145s-.827-.431-.853-.449c0,0,.044-.074.257-.4a3.481,3.481,0,0,1,1.58-1.539,3.548,3.548,0,0,1,.8-.184,2.709,2.709,0,0,1,.693.013,5.155,5.155,0,0,1,2.084,1.014.733.733,0,0,0,.169.107c0-.008-.04-.289-.092-.625s-.092-.612-.089-.615.216-.038.473-.077l.467-.072.226,1.461c.124.8.224,1.463.222,1.465s-.644.1-1.427.221-1.439.222-1.458.226a.093.093,0,0,1-.036,0Z" class="aw-theme-iconOutline" fill="#464646"></path><path id="path3-5" d="M17.5,24a6.487,6.487,0,1,1,.026,0H17.5m0-12A5.5,5.5,0,1,0,23,17.5,5.5,5.5,0,0,0,17.5,12" class="aw-theme-iconOutline" fill="#464646"></path><path id="circle5-7" d="M17,19.251A1.75,1.75,0,1,1,15.251,17.5h0A1.75,1.75,0,0,1,17,19.251Z" class="aw-theme-iconOutline" fill="#464646"></path><path id="circle5-4" d="M19.762,17.508a1.76,1.76,0,1,0,.024,0Zm.012,1h.01a.75.75,0,0,1,.75.75h0a.75.75,0,1,1-.76-.75Z" class="aw-theme-iconOutline" fill="#464646"></path></g></svg>',
        Attachment: '<svg id="Attachment"  width="16" height="16" version="1.1"    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve" width="25" height="25"><path class="aw-theme-iconOutline" fill="#464646" d="M6.2,23c-1.6,0-3.2-0.6-4.4-1.8c-2.4-2.4-2.4-6.3,0-8.7l9.8-9.8l0.7,0.7l-9.8,9.8c-2,2-2,5.3,0,7.3	c2,2,5.3,2,7.3,0l12-12c1.5-1.5,1.5-3.8,0-5.3c-1.5-1.5-3.8-1.5-5.3,0L6.4,13.4c-0.4,0.4-0.7,1-0.7,1.6c0,0.6,0.2,1.2,0.7,1.6	c0.9,0.9,2.4,0.9,3.3,0l8-8l0.7,0.7l-8,8c-1.3,1.3-3.4,1.3-4.7,0c-0.6-0.6-1-1.5-1-2.4c0-0.9,0.3-1.7,1-2.4L15.8,2.5	c0.9-0.9,2.1-1.4,3.4-1.4s2.5,0.5,3.4,1.4s1.4,2.1,1.4,3.4s-0.5,2.5-1.4,3.4l-12,12C9.3,22.4,7.7,23,6.2,23z"></path></svg>',
        Remark: '<svg id="Remark" width="16" height="16" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <g id="g963"> <path id="rect13-9-3" d="M1,1V17H9.884v-1H1.943V2H22.057V13.3H23V1Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="path15-5" d="M3.318,2.92l-.64.768,7.2,5.994a3.549,3.549,0,0,0,4.633-.059L21.3,3.68l-.66-.752L13.85,8.869a2.516,2.516,0,0,1-3.336.045Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="line17-6" d="M9.928,8.953,2.7,14.414l.6.8,7.23-5.459Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="line19-5" d="M14.387,8.969l-.567.8,4.368,3.466h1.567Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="path833" d="M12.027,13.891a.913.913,0,0,0-.839.684.231.231,0,0,0-.018.035L9.639,20.731a.5.5,0,0,0,.364.606.481.481,0,0,0,.12.015h.111a3.1,3.1,0,0,0,6.155-.244.729.729,0,0,1,.375-.154,1.485,1.485,0,0,1,.363.045,3.1,3.1,0,0,0,6.166.353h.086a.452.452,0,0,0,.121-.016.189.189,0,0,0,.033-.013.449.449,0,0,0,.135-.067l.018-.009a.494.494,0,0,0,.214-.395.485.485,0,0,0-.052-.217l-1.5-6.01v-.009c0-.009-.01-.016-.012-.024A.906.906,0,0,0,21.4,13.9c-.4.044-.886.38-.886,1.73a.5.5,0,1,0,1,0,1.783,1.783,0,0,1,.006-.2l.777,3.111a3.086,3.086,0,0,0-5.047,1.483,1.928,1.928,0,0,0-.478-.061,1.425,1.425,0,0,0-.471.084,3.087,3.087,0,0,0-5.08-1.484L12,15.415c0,.065.006.13.006.211a.5.5,0,1,0,1,0c0-1.353-.483-1.69-.887-1.735ZM13.2,18.737h.016a2.115,2.115,0,0,1,2.2,2.025c0,.03,0,.06,0,.09A2.131,2.131,0,1,1,13.2,18.737Zm6.946,0a2.116,2.116,0,0,1,2.2,2.025c0,.03,0,.06,0,.09a2.121,2.121,0,1,1-2.205-2.115Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="path827" d="M14.323,19.467a.5.5,0,0,1-.047.7L12.528,21.7a.5.5,0,0,1-.688-.726l.03-.026,1.748-1.528a.5.5,0,0,1,.7.053Z" class="aw-theme-iconOutline" fill="#464646"></path> <path id="path825" d="M21.217,19.467a.5.5,0,0,1-.046.7L19.422,21.7a.5.5,0,0,1-.829-.377.5.5,0,0,1,.171-.375l1.748-1.528a.5.5,0,0,1,.7.053Z" class="aw-theme-iconOutline" fill="#464646"></path> </g></svg>'
    };
    var statusesCategory=
    {
        processviolation_1: 'processviolation_1',
        outlier: 'outlier',
        toolchanged: 'toolchanged',
        remark: 'remark',
        attachment:'attachment'


    };
    


/**
 * @description Provide methods for drawing control chart .
 *
 * @namespace ControlChart
 * */

/**
 * @description A new control chart can be drawn using this method.
 * @memberof ControlChart
 * @function chart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {ControlChart.options} options - The chart options parameter
 * @tutorial CreateControlCharts
 * @example
    $('#chart').chart({
                        chartType: data.controlChartType,
                        locale: locale,
                        data: data,
                        chartTitle: 'xb/s Chart',
                        xAxisTitle: 'Subgroups',
                        decimalPlaces: 4,
                        height: '60%',
                        width: 800,
                        onSeriesClick: function (data) {
                            console.log(data);
                        },
                        series1yAxisMinValue: 1.20,
                        series1yAxisMaxValue: 2.20,
                        series2yAxisMinValue: 0.30,
                        series2yAxisMaxValue: 0.50,
                        onLegendClick: function (data) {
                           console.log(data);
                        }
                    });
 */

/**
 * @memberof ControlChart
 * @typedef {object} options
 * @property {string}  [chartType=xb_s] - Enumeration to specifies which chart type should be used see {@link chartTypes}
 * @property {string}  [locale=en]  User locale to display label and violations in a specific language
 * @property {ControlChart.data} data  JSON Array with subgroup in a defined format {@link ControlChart.data}
 * @property {string}  [chartTitle] - The Chart title
 * @property {string}  [xAxisTitle] - The xAxis Title 
 * @property {boolean}  [xAxisCustomInfoLabel=false] - If true, the default subgroup number label for xAxis will be overriden. by the property of customInfo object. where xAxisLabel is true. For more information  please refer {@link ControlChart.customInfo}
 * @property {number}  [decimalPlaces=4] - The data of chart will be round based on number of decimal places.
 * @property {number}  [height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @property {number}  [width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @property {string}  [yAxisSeries1Title] - A String specifies the yAxisSeries1Title name.
 * @property {number}  [series1yAxisMinValue] - A number specifies the min value of the series1 yAxis value.
 * @property {number}  [series1yAxisMaxValue] - A number specifies the max value of the series1 yAxis value.
 * @property {string}  [yAxisSeries2Title] - A String specifies the yAxisSeries2Title name.
 * @property {number}  [series2yAxisMinValue] - A number specifies the min value of the series2 yAxis value.
 * @property {number}  [series2yAxisMaxValue] - A number specifies the max value of the series2 yAxis value.
 * @property {Array}   [hiddenSeries] -  An array contains the IDs of the series that should not be displayed on the chart see {@link seriesIds}
 * @property {boolean} [boxplot=false] - If true then box plot will be displayed on control chart. The <b>highcharts-more.js</b> will must be referenced for box plot chart.
 * @property {ControlChart.onLegendClick} [onLegendClick=null] -  A callback can be register which will be fired when the legend item belonging to the series is clicked.
 * @property {ControlChart.onSeriesClick} [onSeriesClick=null] - A callback can be register which will be fired when a point on a Series is clicked.
 * @property {string} [backgroundColor='#FFFFFF'] - Refer to chart background color
 * @property {ControlChart.series} [series] - To customize the series related options.
 * @property {ControlChart.yAxisUnit} [yAxisUnit] - The unit of y Axis object.
 * @property {boolean} [showMeasurements = false] - This will display the measurements series in chart, if measurements series is provided along subgroups in data. This will only work for xb, med, mxb_ms and mxb_mR chart types.
 * @property {string} [meanValueSeries1Name] - Mean value series1 name.
 * @property {string} [meanValueSeries2Name] - Mean value series2 name.
 * @property {bool} [drawSPCZones] - If the value is true, the SPC zone will be drawn on the chart
 * @example
 * $('#chart').chart({
 *      chartType: data.controlChartType,
 *      locale: locale,
 *      data: data,
 *      chartTitle: 'XB/s Chart',
 *      xAxisTitle: 'Subgroups',
 *      decimalPlaces: 4,
 *      height: '60%',
 *      width: undefined,
 *      onSeriesClick: function (data) {
 *                              console.log(data);
 *                              },
 *      series1yAxisMinValue: 1.10,
 *      series1yAxisMaxValue: 2.20,
 *      series2yAxisMinValue: 0.005,
 *      series2yAxisMaxValue: 0.006,
 *      xAxisCustomInfoLabel: true,
 *      onLegendClick: function (data) {
 *                              console.log(data);
 *                               },
 *       boxplot: true,
 *       series: {
 *          color: {
 *                  warningLimit: '#FFDFGE',
 *                  controlLimit: 'green',
 *                  toleranceLimit: '#FFDFGD',
 *                  processMeanValue: 'black',
 *                  series1: '#FF2233',
 *                  series2 : '#435576'
 *                  }
 *           }
 *  });
 */

/**
 * @typedef {object} yAxisUnit
 * @memberof ControlChart
 * @description To specify the series yAxis unit related properities.
 * @property {string} [text=""] - To specify the series colors.
 * @property {number} [x=60] - x position of the text.
 * @property {number} [y=null] - y position of the text. 
 * @property {number|string} [fontSize=null] - The font size of the text. If as number will be given then unit will be in pixel. As string in points can be size given e.g. '12pt'
 * @example
 * $('#chart').chart({
 *      chartType: data.controlChartType,
 *      locale: locale,
 *      data: data,
 *      chartTitle: 'XB/s Chart',
 *      xAxisTitle: 'Subgroups',
 *      decimalPlaces: 4,
 *      height: '60%',
 *      width: undefined,
 *      onSeriesClick: function (data) {
 *                              console.log(data);
 *                              },
 *      series1yAxisMinValue: 1.10,
 *      series1yAxisMaxValue: 2.20,
 *      series2yAxisMinValue: 0.005,
 *      series2yAxisMaxValue: 0.006,
 *      xAxisCustomInfoLabel: true,
 *      onLegendClick: function (data) {
 *                              console.log(data);
 *                               },
 *       boxplot: true,
 *       yAxisUnit: {
 *                  text: 'DW05Unit01',
 *                  x: 100,
 *                  y: -20,
 *                  fontSize: '20pt'
 *                  },
 *       series: {
 *          color: {
 *                  warningLimit: '#FFDFGE',
 *                  controlLimit: 'green',
 *                  toleranceLimit: '#FFDFGD',
 *                  processMeanValue: 'black',
 *                  series1: '#FF2233',
 *                  series2 : '#435576'
 *                  }
 *           }
 *  });
 */


/**
 * @typedef {object} series
 * @memberof ControlChart
 * @description To specify the series related options e.g. color of series.
 * @property {object} color - To specify the series colors.
 * @property {string} [color.series1="#0F789B"] - It refer to the hexdecimal color or color name of main series of first row. e.g. xb
 * @property {string} [color.series2="#0F789B"] - It refer to the hexdecimal color or color name of main series of second row. e.g. xb
 * @property {string} [color.controlLimit="#DC0000"] - It refer to the hexdecimal color or color name of both series control limits. e.g. upper control limit 1, upper control limit 2 etc.
 * @property {string} [color.warningLimit="#FFB900"] - It refer to the hexdecimal color or color name of warning limit of both series. e.g. upper warn limit 1, lower warn limit 1 etc.
 * @property {string} [color.processMeanValue="#0A9B00"] - It refer to the hexdecimal color or color name of process mean value. e.g. xbp1, xbp2 etc.
 * @example
 * $('#chart').chart({
 *      chartType: data.controlChartType,
 *      locale: locale,
 *      data: data,
 *      chartTitle: 'XB/s Chart',
 *      xAxisTitle: 'Subgroups',
 *      decimalPlaces: 4,
 *      height: '60%',
 *      width: undefined,
 *      onSeriesClick: function (data) {
 *                              console.log(data);
 *                              },
 *      series1yAxisMinValue: 1.10,
 *      series1yAxisMaxValue: 2.20,
 *      series2yAxisMinValue: 0.005,
 *      series2yAxisMaxValue: 0.006,
 *      xAxisCustomInfoLabel: true,
 *      onLegendClick: function (data) {
 *                              console.log(data);
 *                               },
 *       boxplot: true,
 *       series: {
 *          color: {
 *                  warningLimit: '#FFDFGE',
 *                  controlLimit: 'green',
 *                  toleranceLimit: '#FFDFGD',
 *                  processMeanValue: 'black',
 *                  series1: '#FF2233',
 *                  series2 : '#435576'
 *                  }
 *           }
 *  }
 */

/**
 * @description The input data format for control chart.
 * @typedef {Object} data
 * @memberof ControlChart
 * @example
 * // If measurements need not to be display
 * {
 *      specifications: {
 *                          subgroupSize: 5,
 *                          controlChartType : 'xb_s'                      
 *                      },
 *      subgroups : [
 *                      {
 *                          subgroupNumber: 0,
 *                          calculatedS: 0.00228,
 *                          calculatedR: 0.00600,
 *                          calculatedXb: 19.9958,
 *                          calculatedMin: 19.993,
 *                          calculatedMax: 19.999,
 *                          statuses: null,
 *                          upperControlLimit1Abs: 20.035,
 *                          lowerControlLimit1Abs: 19.965,
 *                          upperWarnLimit1Abs: 20.035,
 *                          lowerWarnLimit1Abs: 19.975,
 *                          upperControlLimit2Abs: 0.021,
 *                          lowerControlLimit2Abs: 0.0005,
 *                          upperWarnLimit2Abs: 0.018,
 *                          lowerWarnLimit2Abs: 0.0015,
 *                          calculatedProcessMeanValue1: 20.00453,
 *                          calculatedProcessMeanValue2: 0.00835581,
 *                          processSigma: 0.00888916271350903
 *                  }
 *              ]
 *  }

 * --------------------------------------------------------------------------------------------------------
 * // If measurements need to be displayed in chart then following is the data format
 * {
 *      specifications: {
 *                          subgroupSize: 5,
 *                          controlChartType : 'xb'                      
 *                      },
 *      subgroups : [
 *                      {
 *                          subgroupNumber: 0,
 *                          calculatedS: 0.002280350857290605,
 *                          calculatedR: 0.006000000000000227,
 *                          calculatedXb: 19.9958,
 *                          calculatedMin: 19.993,
 *                          calculatedMax: 19.999,
 *                          statuses: null,
 *                          upperControlLimit1Abs: 20.035,
 *                          lowerControlLimit1Abs: 19.965,
 *                          upperWarnLimit1Abs: 20.035,
 *                          lowerWarnLimit1Abs: 19.975,
 *                          upperControlLimit2Abs: 0.021,
 *                          lowerControlLimit2Abs: 0.0005,
 *                          upperWarnLimit2Abs: 0.018,
 *                          lowerWarnLimit2Abs: 0.0015,
 *                          calculatedProcessMeanValue1: 20.0045318,
 *                          calculatedProcessMeanValue2: 0.008355812950698488,
 *                          processSigma: 0.00888916271350903
 *                      }
 *                  ],
 *      measurements : [
 *                      {
 *                          referenceID: "0",
 *                          measuredValue: 19.993,
 *                          transformedMeasuredValue: 1.3008779659885696,
 *                          valueTimestamp: "0001-01-01T00:00:00",
 *                          statuses: null,
 *                          sequenceID: 0,
 *                          violations: null,
 *                          subgroupNumber: 10 // new subgroup number
 *                      }
 *                  ]
 *  }
 */

/**
 * @description An array of objects with following properties can be injected against each subgroup.
 * @typedef {object} customInfo
 * @memberof ControlChart
 * @property {string} label - The label to be display in tooltip.
 * @property {string} value - The value to be used to show in tooltip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be showin in tooltip for a particular subgrup as 'label: value'
 * @property {boolean} xAxisLabel - If true then value of will be showin on xAxis labels instead of default labels. e.g. subgroup number
 * @property {boolean} isRemark - If true then the info on the Custome Info object will be treated as a Remark which will be shown in a Flag series over the series
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given format, please refer {@link ControlChart.data}</caption>

    data.subgroups[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
 */


$.fn.chart = function (options) {
    
    var settings = {};

    if (options && typeof options === 'object') {
        var _options = setDefault(options); // extend the object and set default

        settings = $.extend({
            chartType: chartTypes.xb_s, // default XB Chart
            chartName: options.chartType, // save the chart name e.g. xb_s etc.
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: getLocalizedText(options.chartType + '_chart', _options.locale),
            xAxisTitle: getLocalizedText('x_axis_subgroups', _options.locale),
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            backgroundColor: undefined,

            /* Series 1 Settings */
            yAxisSeries1Title: getLocalizedText(_options.seriesNames[0], _options.locale),
            series1Name: getLocalizedText(_options.seriesNames[0], _options.locale) || 'Series1',
            series1yAxisMinValue: undefined,
            series1yAxisMaxValue: undefined,
            meanValueSeries1Name: undefined,
            drawSPCZones: false,

            /* Series 2 Settings */
            yAxisSeries2Title: getLocalizedText(_options.seriesNames[1], _options.locale),
            series2Name: getLocalizedText(_options.seriesNames[1], _options.locale) || 'Series2',
            series2yAxisMinValue: undefined,
            series2yAxisMaxValue: undefined,
            meanValueSeries2Name: undefined,
            isSeries2Visible: !(_options.chartType === chartTypes.xb || _options.chartType === chartTypes.s || _options.chartType === chartTypes.r || _options.chartType === chartTypes.mR || _options.chartType === chartTypes.ms || _options.chartType === chartTypes.med),
            hiddenSeries: [],
            xAxisCustomInfoLabel: false,
            boxplot: false,
            showMeasurements: false,
            yAxisUnit: getDefaultyAxisUnitObj(),

            /*Event Functions*/
            onLegendClick: undefined,
            onSeriesClick: undefined,



            series: getDefaultSeriesColors()
            
        }, _options);
    } else if (typeof options === 'string') { // Method call
        settings = $(this).data('settings') || {};  // restore the settings object from prev settings
    } else if (!options)
        throw 'Not valid options or parameter to the "chart" extension passed';

    var $this = this,
        _args = arguments,
        chart = {
            init: function () {
                var containerId = $this.attr('id'),
                    input = {
                        series1: [], UCL1: [], LCL1: [], UWL1: [], LWL1: [], xbP1: [],
                        series2: [], LCL2: [], UCL2: [], LWL2: [], UWL2: [], xbP2: [],
                        flagSeries: [], customInfo: [], subgroups: [], boxplot: [], median: [], measurements: [], flagremarks: [], flagAttachment: [],
                        zoneA: [], zoneB1: [], zoneB2: [], zoneC1: [], zoneC2: [],
                    };

                if (settings.data && settings.data.subgroups) {
                    prepareData(input);

                    settings.inputs = input;// for custominfo tooltip
                    var seriesData = prepareSeries(input),
                        _chart = Highcharts.stockChart(containerId, prepareChartOptions(seriesData, input));
                    //  chart.xAxis[0].setExtremes(75, 100);	// Initial select last 25 samples
                    $this.data('chartApi', _chart); // required to call methods e.g. addPoint
                    $this.data('settings', settings);
                } else
                    throw 'Invalid data format exception: Series data is not in defined format';
            },

            /**
             * @function addPoint
             * @description Add a new point to a specific series the series is specified by its seriesId. The control chart must be drawn before using {@link ControlChart.chart} method.
             * @param {string} seriesId The id of the series that being updated. For IDs of the series please refer {@link ControlChart.seriesIds}
             * @param {number} newPoint The value of the point that being added.
             * @memberof ControlChart
             * @example
             * $('#chart').chart('addPoint', 'ucl_1', 19.90);
             * // This will add a new point at the right most side with the value of 19.90 in upper control limit of first series.
             */
            addPoint: function (seriesId, newPoint) {
                var __chart = $this.data('chartApi');
                if (__chart) {
                    if (typeof seriesId === 'string') { // it is update by id of chart
                        if (__chart.get(seriesId)) {
                            __chart.get(seriesId).addPoint(newPoint, true);
                        }
                    }
                }
            },

            /**
             * @function addSubgroup
             * @description Add a new subgroup on the right most side of control chart.
             * @param {object} newSubgroup - The complete new subgroup which is provided like before to control chart
             * @memberof ControlChart
             * @example
             * $('#chart').chart('addSubgroup', {
             *                          subgroupNumber: 2,
             *                          calculatedS: 0.0106,
             *                          calculatedR: 0.0270,
             *                          calculatedXb: 19.9754,
             *                          statuses:
             *                                [
             *                                  {category: "processViolation_2", viewedPoints: null, points: null, lowerPercentage: null, upperPercentage: null},
             *                                  {category: "middleThird", viewedPoints: null, points: null, lowerPercentage: null, upperPercentage: null},
             *                                  {category: "processViolation_1", viewedPoints: null, points: null, lowerPercentage: null, upperPercentage: null},
             *                                  {category: "ucL_1", viewedPoints: null, points: null, lowerPercentage: null, upperPercentage: null}
             *                                ],
             *                            upperControlLimit1Abs: 20.014,
             *                            lowerControlLimit1Abs: 19.985,
             *                            upperWarnLimit1Abs: null,
             *                            lowerWarnLimit1Abs: null,
             *                            upperControlLimit2Abs: 0.01715,
             *                            lowerControlLimit2Abs: 0.00202,
             *                            upperWarnLimit2Abs: null,
             *                            lowerWarnLimit2Abs: null,
             *                            calculatedProcessMeanValue1: 20.0045,
             *                            calculatedProcessMeanValue2: 0.00835,
             *                            boxPlot: [ 19.958, 19.9655, 19.979, 19.9835, 19.985],
             *                            customInfo: [
             *                                         {
             *                                            label: "Charge Number",
             *                                            value: "CH00304",
             *                                            showInTooltip: true,
             *                                            xAxisLabel: false
             *                                          },
             *                                          {
             *                                             label: "Date",
             *                                             value: "22.1.2020",
             *                                             showInTooltip: true,
             *                                             xAxisLabel: true
             *                                           }
             *                                   ]
             *       });
             */
            addSubgroup: function (newSubgroup) {
                addNewSubgroup(newSubgroup);
            },            

            /**
             * @function updatePoint
             * @description this function update the value of a proper point, the point can be identified by its seriesID and sortNumber. The control chart must be drawn before using {@link ControlChart.chart} method.
             * @param {string} seriesId The id of the series that being updated. For IDs of the series please refer {@link ControlChart.seriesIds}
             * @param {number} sgNum The subgroup Number of the point that being updated.
             * @param {number} newValue the new Value of the Point that being updated.
             * @memberof ControlChart
             * @name updatePoint
             * @example
             * $('#chart').chart('updatePoint', 'ucl_1', 2,  19.90);
             * // This will update the value of third subgroup with the new given value 19.90. Please remember that subgroup number always start from 0.
            */
            updatePoint: function (seriesId, sgNum, newValue) {
                var __chart = $this.data('chartApi');

                if (typeof newValue !== 'number') throw 'The new provided value is not a valid number';

                if (__chart) {
                    if (typeof seriesId === 'string' && __chart.get(seriesId)) { // it is update by id of chart
                        if (__chart.get(seriesId).data[sgNum]) {
                            var data = __chart.get(seriesId).data[sgNum];
                            data.update(newValue);                            
                        }
                    }
                }
            },

            /**
             * @function updateColor
             * @description To update the color of the series and chart background.
             * @memberof ControlChart
             * @param {object} colorScheme - The new color scheme for series
             * @param {string} colorScheme.series1 - The hexadecimal code or color name of main first series e.g. xb.
             * @param {string} colorScheme.series2 - The hexadecimal code or color name the second main series e.g. Range, s Series.
             * @param {string} colorScheme.controlLimit - The hexadecimal code or color name of control limit
             * @param {string} colorScheme.warningLimit - The hexadecimal code or color name of warning limit.
             * @param {string} colorScheme.processMeanValue - The hexadecimal code or color name of process mean value.
             * @example
             *  $('#chart').chart('updateColor', {
             *                                      series1: '#FF35AF',
             *                                      series2: '#FF35DF',
             *                                      controlLimit: 'blue',
             *                                      warningLimit : '#FF3522',
             *                                      processMeanValue : 'white',
             *                                      backgroundColor: 'red'
             *                                    });
             */
            updateColor: function (colorScheme) {
                updateChartColor(colorScheme);
            },

            /**
             * @description - Change the visible state of measurements series.
             * @memberof ControlChart
             * @function showMeasurements
             * @param {boolean} state - True will display the measurements series and false will hide it.
             * @example
             * $('#chart').chart('showMeasurements', true);
             */
            showMeasurements: function (state) {
                var chartApi = $this.data('chartApi');
                if (typeof state === 'boolean' && displayMeasurements() && chartApi.get(seriesIds.controlChart.measurement)) {
                    chartApi.get(seriesIds.controlChart.measurement).update({ visible: state }, true);
                }
            },

            /**
             * @description - Update a specific subgroup
             * @memberof ControlChart
             * @function updateSubgroup
             * @param {number} sgNum - The SubGroupNumber which need to be updated
             * @param {object} subgroup - The new Subgroup object with or without customInfo object. For details please see the example below             
             * @example
             * // to leave a value unchanged do not include it in the object
             * $('#chart').chart('updateSubgroup', 79, {	
             *                                          lcl1:		19.98,
             *                                          lcl2:		0.01,
             *                                          lwl1:		19.991,
             *                                          lwl2:		0.02,
             *                                          series1:	19.981,
             *                                          series2:	0.15,
             *                                          ucl1:		20.02,
             *                                          ucl2:		0.2,
             *                                          uwl1:		20.02,
             *                                          uwl2:		0.2,
             *                                          xbP1:		19.998,
             *                                          xbP2:		0.1,
             *                                          custominfo: newCustomInfoObject // see customInfo section
             *                                          });
             * 
             */
            updateSubgroup: function (sgNum, subgroup)
            {
                updateSubgroup(roundFloat(sgNum), subgroup);
            }

        };
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2], _args[3]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function yAxisLabels() {
        var unit = settings.yAxisUnit && isNullOrUndefined(settings.yAxisUnit.text) ? '' : settings.yAxisUnit.text;
        var yAxis = [
            {
                min: settings.series1yAxisMinValue,
                max: settings.series1yAxisMaxValue,
                opposite: false,
                lineWidth: 2,
                labels: {
                    // rotation: -90, // settings.xAxisLabelsRotation,
                    formatter: function () {
                        return roundFloat(this.value, settings.decimalPlaces);
                    },
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisSeries1Title,
                    style: axiesTitleStyle
                },
                lineColor: siemensColors.PL_BLACK_22,
            }
        ];

        if (settings.isSeries2Visible) {
            yAxis[0].height = '52%';
            yAxis.push({
                min: settings.series2yAxisMinValue,
                max: settings.series2yAxisMaxValue,
                labels: {
                    // align: 'right',
                    // x: -8
                    formatter: function () {
                        return roundFloat(this.value, settings.decimalPlaces);
                    },
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisSeries2Title,
                    style: axiesTitleStyle
                },
                opposite: false,
                top: '53%',
                height: '46%',
                offset: 0,
                lineWidth: 2,
                lineColor: siemensColors.PL_BLACK_22
            });
        }

        yAxis.push(
            {// to show units of chart
                opposite: false,
                title: {
                    reserveSpace: false,
                    text: unit,
                    align: 'high',                    
                    rotation: 0,
                    x: settings.yAxisUnit.x,
                    y: settings.yAxisUnit.y,
                    style: {
                        fontSize: settings.yAxisUnit.fontSize,
                        color: siemensColors.PLBlack4
                    }
                }
            });
        return yAxis;
    }

    /**
    * @description The callback format which will handle the series click event.
    * @memberof ControlChart
    * @callback onSeriesClick
    * @param {object} data - An object with the below mentioned properties will be handed back as parameter.
    * @param {number} data.subgroupNumber - The subgroup number.
    * @param {string} data.seriesName - The series name.
    * @param {number} data.point - The Y value of this point.
    * @param {string} data.seriesId - The id of the clicked series.
    * @param {string} data.referenceId - The reference id from corresponding first/left measurement.
    * @param {array} data.violations The violations if handled for this point in point.
    * @param {array} data.customInfo the customInfo object injected against a subgroup.     *
    * @example
    *   data = { subgroupNumber: 1, seriesName: xb, point: 1, seriesId: ucl__1, violations: ['Run Down'], customInfo : [], referenceId: '1' }
    */

    function onSeriesClick(e) {
        if (typeof settings.onSeriesClick === 'function') { // if callback is defined
            var subgroupNumber,
                point,
                seriesID,
                seriesName,
                subgroups = settings.inputs.subgroups,
                violations,
                referenceId,
                response;   // response object for callback

            if (e && e.point && e.point.index < subgroups.length) {
                subgroupNumber = e.point.index;
                point = e.point.y;
                if (e.point.options && e.point.options.violations) {
                    violations = e.point.options.violations;
                }
                if (settings.data.subgroups[e.point.index]) {
                    referenceId = settings.data.subgroups[e.point.index].referenceID;
                }
            }
            if (e.point.series && typeof e.point.y === 'number') {
                seriesName = e.point.series.name;
                seriesID = e.point.series.options.id;
                point = e.point.y;
            }

            response = { subgroupNumber: subgroupNumber, seriesName: seriesName, point: point, seriesId: seriesID, violations: violations, referenceId: referenceId };

            if (settings.inputs.customInfo[e.point.index])
                response.customInfo = settings.inputs.customInfo[e.point.index];

            settings.onSeriesClick(response);
        }
    }

    /**
    * @description The callback format which will handle the legend click event. The default action is to toggle the visibility of the series. This can be prevented by returning false or calling event.preventDefault().
    * @memberof ControlChart
    * @callback onLegendClick
    * @param {object} data - The object hold the information of clicked legend.
    * @param {string} data.seriesId - The series id of the clicked legend item.
    * @param {boolean} data.isVisible - Flag to represent the state of series that whether series was visible before click event or not.
    * @example
    * // When a callback is registered with options in single value chart options
    *  $('#chart').chart(
    *                  {
    *                      locale: "en",
    *                      data: {   
    *                          subgroups: [],  // Array of objects in defined format
    *                      },
    *                      decimalPlaces: 2,
    *                      onLegendClick : function (data) {
    *                                          console.log(data);
    *                                            //The output will be like this
    *                                            // seriesId: "lcl_1", isVisible: false
    *                                       }
    *                  }
    *              );
    *
    */

    function onLegendClick(e) {
        if (typeof settings.onLegendClick === 'function') {
            var seriesID,
                isVisible,
                output;

            seriesID = e.target.userOptions.id;
            isVisible = this.visible;
            output = { seriesId: seriesID, isVisible: isVisible };
            settings.onLegendClick(output);
        }
    }

    function prepareData(input) {
        var movingMeanWeightingType = undefined;

        if (settings.data && settings.data.subgroups) {

            if (settings.data.specifications) {
                movingMeanWeightingType = parseMovingMeanWeighting(settings.data.specifications.movingMeanWeighting);
            }

            $.each(settings.data.subgroups, function (index, item) {
                extractSubgroupData(item, index, input, movingMeanWeightingType);
            });
        }
        if (settings.data && settings.data.measurements && settings.showMeasurements === true) {
            var subgroupSize = settings.data && settings.data.specifications && settings.data.specifications.subgroupSize > 0 ? settings.data.specifications.subgroupSize : 1;

            if (settings.chartType === chartTypes.xb || settings.chartType === chartTypes.med) {
                $.each(settings.data.measurements, function (i, measurement) {
                    input.measurements.push([parseInt(i / subgroupSize), measurement.measuredValue]);
                });
            } else if (settings.chartType === chartTypes.mxb_ms || settings.chartType === chartTypes.mxb_mR) {
                for (var i = 0; i < settings.data.measurements.length; i++) {
                    for (var j = 0; j < subgroupSize && settings.data.measurements[i + j] && input.measurements.length < (settings.data.subgroups.length - 1) * subgroupSize; j++) {
                        input.measurements.push([i + subgroupSize - 1, settings.data.measurements[i + j].measuredValue]);
                    }
                }
            }
        }
    }

    function extractSubgroupData(subgroup, index, input, movingMeanWeightingType) {
        var output = calculateLimits(subgroup, movingMeanWeightingType),

            statuses = subgroup.statuses,
            data = getViolation(statuses),
            newstatuses = data.newstatuses,
            violations = data.violations,
            customInfo = subgroup.customInfo || [],
            subgroupNumber = subgroup.subgroupNumber >= index ? subgroup.subgroupNumber : index;

        if (settings.xAxisCustomInfoLabel === true) {    // for xAxis
            if (subgroup.customInfo) {
                input.subgroups.push(getCustomxAxisLabel(subgroup.customInfo));
            } else { input.subgroups.push(null); } //show empty, if no corresponding custominfo is given
        } else
            input.subgroups.push(subgroupNumber);

        addSeries1Data(newstatuses, input, output, violations, index);

        input.customInfo.push(customInfo); // for tooltip

        if (settings.boxplot === true) {
            if (!isNullOrUndefined(output.seriesVal1)) {
                input.boxplot.push(output.boxplot);
            } else {
                input.boxplot.push(null);
            }
        }

        addSeries2Data(newstatuses, input, output, violations, index);
        buildSpcZones(input, subgroup);
    }

    function buildSpcZones(input, subgroup) {
        if (input && subgroup && subgroup.calculatedProcessMeanValue1 && subgroup.processSigma && settings.drawSPCZones) {
            var mean = subgroup.calculatedProcessMeanValue1,
                sigma = subgroup.processSigma;

            input.zoneA.push([calculateMeanSigma(mean, -sigma, 1), calculateMeanSigma(mean, sigma, 1)]);
            input.zoneB1.push([calculateMeanSigma(mean, sigma, 1), calculateMeanSigma(mean, sigma, 2)]);
            input.zoneB2.push([calculateMeanSigma(mean, sigma, 2), calculateMeanSigma(mean, sigma, 3)]);
            input.zoneC1.push([calculateMeanSigma(mean, -sigma, 1), calculateMeanSigma(mean, -sigma, 2)]);
            input.zoneC2.push([calculateMeanSigma(mean, -sigma, 2), calculateMeanSigma(mean, -sigma, 3)]);
        }
    }
    function calculateMeanSigma(mean, sigma, factor) {

        return (mean + (sigma * factor))

    }
    function getViolation(statuses) {
        var data = { newstatuses: [], violations: [] };

        if (statuses && statuses.length > 0 && typeof statuses === 'object') {
            statuses.forEach(function (s) {
                if (s.category) {
                    if (s.category.toLowerCase() !== 'processviolation_1' && s.category.toLowerCase() !== 'processviolation_2')
                        data.violations.push(getLocalizedText(s.category, settings.locale));

                    data.newstatuses.push(s.category.toLowerCase());
                }
            });
        }

        return data;
    }

    function addSeries1Data(statuses, input, output, violations, index) {
        var series1Val = output.seriesVal1;
        if (statuses && statuses.length > 0 && typeof statuses === 'object') {
            if (statuses.indexOf("processviolation_1") > -1) {// to draw red triangle
                input.series1.push({
                    marker: {
                        fillColor: chartSeriesColors.ControlChart.Marker,
                        lineWidth: 3,
                        lineColor: chartSeriesColors.ControlChart.Marker,
                        symbol: 'triangle'
                    },
                    name: 'violation' + index,
                    y: series1Val,
                    violations: violations  //to get in tooltip and in click event
                });
            } else if (statuses.indexOf("outlier") > -1) {
                input.series1.push({
                    marker: {
                        fillColor: chartSeriesColors.ControlChart.YellowMarker,
                        lineWidth: 3,
                        lineColor: chartSeriesColors.ControlChart.YellowMarker,
                        symbol: 'triangle'
                    },
                    name: 'outlier',
                    y: series1Val,
                    violations: violations
                });
            } else
                input.series1.push(series1Val);          

            if (statuses.indexOf("toolchanged") > -1) {
                
                input.flagSeries.push({
                    y: series1Val,
                    x: index,
                    title:  svgRepository.ToolChanged , 
                    text: getLocalizedText('ToolChanged', settings.locale),
                });
            }
            if (statuses.indexOf("remark") > -1) {
                input.flagSeries.push({
                    y: series1Val,
                    x: index,                    
                    title:  svgRepository.Remark ,
                    text: getCustomRemarks(settings,index)
                });
            }
            if (statuses.indexOf("attachment") > -1) {
                input.flagSeries.push({
                    y: series1Val,
                    x: index,
                    title:  svgRepository.Attachment ,
                    text: getLocalizedText('Attachment', settings.locale),
                  
                });
            }
        } else {
            input.series1.push(series1Val);
            if (statuses && typeof statuses !== 'object') // if statuses are given in wrong format e.g. as string but not as object
                console.error('Violations statuses are not valid array of object. It should be an array of objects with defined format. Please consult doco.');
        }

        input.UCL1.push(output.ucl1);
        input.LCL1.push(output.lcl1);
        input.UWL1.push(output.uwl1);
        input.LWL1.push(output.lwl1);
        input.xbP1.push(output.xbp1);
    }

    function addSeries2Data(statuses, input, output, violations, index) {
        if (settings.isSeries2Visible) {
            if (statuses.indexOf("processviolation_2") > -1)
                input.series2.push({
                    marker: {
                        fillColor: chartSeriesColors.ControlChart.Marker,
                        lineWidth: 3,
                        lineColor: chartSeriesColors.ControlChart.Marker,
                        symbol: 'triangle'
                    },
                    name: 'violation' + index,
                    y: output.seriesVal2,
                    violations: violations
                });
            else
                input.series2.push(output.seriesVal2);

            input.LCL2.push(output.lcl2);
            input.UCL2.push(output.ucl2);
            input.LWL2.push(output.lwl2);
            input.UWL2.push(output.uwl2);
            input.xbP2.push(output.xbp2);
        }
    };

    function getCustomxAxisLabel(customInfo) {
        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.xAxisLabel === true; });
            if (xAxisObj && xAxisObj.length > 0 && xAxisObj[0].value)
                return xAxisObj[0].value;
        }
        return '';
    }

    function getCustomTooltip(customInfo) {
        var customTooltip = [];

        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.showInTooltip === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.label + ' : ' + o.value);
                });
            }
        }
        return customTooltip.join('<br>');
    }

    function getBoxplotTooltip() {
        var msg = [],
            inputs = settings.inputs,
            violations = [],
            customInfo = settings.inputs.customInfo || [];

        if (typeof inputs.series1[this.point.index] === 'number') // here can be violations too
            msg.push('<b>' + settings.series1Name + ' : ' + inputs.series1[this.point.index] + '</b>');

        if (inputs.series1[this.point.index] && inputs.series1[this.point.index].violations) {
            msg.push('<b>' + settings.series1Name + ' : ' + roundFloat(inputs.series1[this.point.index].y, settings.decimalPlaces) + '</b>');
            inputs.series1[this.point.index].violations.forEach(function (v) { violations.push(v); });
        }

        if (typeof inputs.UCL1[this.point.index] === 'number')
            msg.push(getLocalizedText(seriesIds.controlChart.ucl1, settings.locale) + ' : ' + inputs.UCL1[this.point.index]);

        if (typeof inputs.UWL1[this.point.index] === 'number')
            msg.push(getLocalizedText(seriesIds.controlChart.uwl1, settings.locale) + ' : ' + inputs.UWL1[this.point.index]);

        if (typeof inputs.xbP1[this.point.index] === 'number')
            msg.push(getLocalizedText(seriesIds.controlChart.xbp1, settings.locale) + ' : ' + inputs.xbP1[this.point.index]);

        if (typeof inputs.LWL1[this.point.index] === 'number')
            msg.push(getLocalizedText(seriesIds.controlChart.lwl1, settings.locale) + ' : ' + inputs.LWL1[this.point.index]);

        if (typeof inputs.LCL1[this.point.index] === 'number')
            msg.push(getLocalizedText(seriesIds.controlChart.lcl1, settings.locale) + ' : ' + inputs.LCL1[this.point.index]);

        if (customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(settings.inputs.customInfo[this.point.index]));
        }

        if (violations.length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            violations.forEach(function (v) { msg.push(v); });
        }

        msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
        if (typeof this.point.high === 'number')
            msg.push(getLocalizedText('bPlot_high', settings.locale) + ' : ' + this.point.high);

        if (typeof this.point.q3 === 'number')
            msg.push(getLocalizedText('bPlot_q3', settings.locale) + ' : ' + this.point.q3);

        if (typeof this.point.median === 'number')
            msg.push(getLocalizedText('bPlot_median', settings.locale) + ' : ' + this.point.median);

        if (typeof this.point.q1 === 'number')
            msg.push(getLocalizedText('bPlot_q1', settings.locale) + ' : ' + this.point.q1);

        if (typeof this.point.low === 'number')
            msg.push(getLocalizedText('bPlot_low', settings.locale) + ' : ' + this.point.low);

        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>"
    }

    function displayTooltip(/*tooltip*/) {
        //ControlChart displayTooltip
        if (settings.boxplot === true && this.point.low) { // it is from boxplot tooltip
            return getBoxplotTooltip.bind(this)();
        }

        var msg = [],
            customInfo = settings.inputs.customInfo || [];

        msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');

        if (customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(customInfo[this.point.index]));
        }

        if ((this.key.toString().startsWith('violation') || this.key.toString().startsWith('outlier')) && this.point.violations) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            this.point.violations.forEach(function (v) { msg.push(v); });
        } else if (this.series.name === seriesIds.controlChart.flagSeries && this.point) {
            // msg = [this.point.text]; // just show annotation
            msg = [];
            msg.push(getCustomRemarks(settings, this.point.x));
            // else return tooltip.defaultFormatter.call(this, tooltip);
        }

        if (this.point.text) // for flags type series, only it should be shown
            return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + this.point.text + "</span></div>";

        //return tooltip.defaultFormatter.call(this, tooltip);
        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";
    }

    function prepareSeries(input) {
        var seriesData = [
            {
                id: seriesIds.controlChart.ucl1,
                name: getLocalizedText('UCL_1', settings.locale),
                data: input.UCL1,
                yAxis: 0,
                color: settings.series.color.controlLimit || chartSeriesColors.ControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                showInLegend: shouldDisplaySeries(input.UCL1),
                visible: shouldDisplaySeries(input.UCL1, seriesIds.controlChart.ucl1),
                index: 0
            },
            {
                id: seriesIds.controlChart.uwl1,
                name: getLocalizedText('UWL_1', settings.locale), // Highcharts.uiLocale[settings.locale].UWL_1,
                data: input.UWL1,
                yAxis: 0,
                color: settings.series.color.warningLimit || chartSeriesColors.ControlChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                showInLegend: shouldDisplaySeries(input.UWL1),
                visible: shouldDisplaySeries(input.UWL1, seriesIds.controlChart.uwl1),
                index: 1
            },
            {
                id: seriesIds.controlChart.series1,
                name: settings.series1Name,
                data: input.series1,
                yAxis: 0,
                color: settings.series.color.series1 || chartSeriesColors.ControlChart.xbarX,
                // showInNavigator: true,  // to display xAxis series in range selector for highstock chart
                showInLegend: false,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                events: {
                    click: onSeriesClick
                },
                index: 2,
                zoneAxis: 'x',
                zones: prepareColoredZone()
            },
            {
                id: seriesIds.controlChart.xbp1,
                name: settings.meanValueSeries1Name || getLocalizedText('xbp_1', settings.locale), //Highcharts.uiLocale[settings.locale].xbp_1,
                data: input.xbP1,
                yAxis: 0,
                color: settings.series.color.processMeanValue || chartSeriesColors.ControlChart.xbarProcess,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                showInLegend: shouldDisplaySeries(input.xbP1),
                visible: shouldDisplaySeries(input.xbP1, seriesIds.controlChart.xbp1),
                index: 3
            },
            {
                id: seriesIds.controlChart.lwl1,
                name: getLocalizedText('LWL_1', settings.locale), // Highcharts.uiLocale[settings.locale].LWL_1,
                data: input.LWL1,
                yAxis: 0,
                color: settings.series.color.warningLimit || chartSeriesColors.ControlChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                showInLegend: shouldDisplaySeries(input.LWL1),
                visible: shouldDisplaySeries(input.LWL1, seriesIds.controlChart.lwl1),
                index: 4
            },
            {
                id: seriesIds.controlChart.lcl1,
                name: getLocalizedText('LCL_1', settings.locale), // Highcharts.uiLocale[settings.locale].LCL_1,
                data: input.LCL1,
                yAxis: 0,
                color: settings.series.color.controlLimit || chartSeriesColors.ControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                showInLegend: shouldDisplaySeries(input.LCL1),
                visible: shouldDisplaySeries(input.LCL1, seriesIds.controlChart.lcl1),
                index: 5
            },
            {
                id: seriesIds.controlChart.ucl2,
                name: getLocalizedText('UCL_2', settings.locale), //  Highcharts.uiLocale[settings.locale].UCL_2,
                data: input.UCL2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                color: settings.series.color.controlLimit || chartSeriesColors.ControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,

                visible: settings.isSeries2Visible && shouldDisplaySeries(input.UCL2, seriesIds.controlChart.ucl2),
                showInLegend: settings.isSeries2Visible && shouldDisplaySeries(input.UCL2),
                index: 6
            },
            {
                id: seriesIds.controlChart.uwl2,
                name: getLocalizedText('UWL_2', settings.locale), // Highcharts.uiLocale[settings.locale].UWL_2,
                data: input.UWL2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                color: settings.series.color.warningLimit || chartSeriesColors.ControlChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                visible: settings.isSeries2Visible && shouldDisplaySeries(input.UWL2, seriesIds.controlChart.uwl2),
                showInLegend: settings.isSeries2Visible && shouldDisplaySeries(input.UWL2),
                index: 7
            },
            {
                id: seriesIds.controlChart.series2,
                name: settings.series2Name,
                data: input.series2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                visible: settings.isSeries2Visible,
                showInLegend: false,
                color: settings.series.color.series2 || chartSeriesColors.ControlChart.Sr,
                step: false,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                events: {
                    click: onSeriesClick
                },
                index: 8
            },
            {
                id: seriesIds.controlChart.xbp2,
                name: settings.meanValueSeries2Name || getLocalizedText('xbp_2', settings.locale), // Highcharts.uiLocale[settings.locale].xbp_2,
                data: input.xbP2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                color: settings.series.color.processMeanValue || chartSeriesColors.ControlChart.xbarProcess,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                visible: settings.isSeries2Visible && shouldDisplaySeries(input.xbP2, seriesIds.controlChart.xbp2),
                showInLegend: settings.isSeries2Visible && shouldDisplaySeries(input.xbP2),
                index: 9
            },
            {
                id: seriesIds.controlChart.lwl2,
                name: getLocalizedText('LWL_2', settings.locale), // Highcharts.uiLocale[settings.locale].LWL_2,
                data: input.LWL2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                color: settings.series.color.warningLimit || chartSeriesColors.ControlChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                visible: settings.isSeries2Visible && shouldDisplaySeries(input.LWL2, seriesIds.controlChart.lwl2),
                showInLegend: settings.isSeries2Visible && shouldDisplaySeries(input.LWL2),
                index: 10
            },
            {
                id: seriesIds.controlChart.lcl2,
                name: getLocalizedText('LCL_2', settings.locale),
                data: input.LCL2,
                yAxis: settings.isSeries2Visible ? 1 : 0,
                color: settings.series.color.controlLimit || chartSeriesColors.ControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                events: {
                    click: onSeriesClick
                },
                lineWidth: 1.2,
                visible: settings.isSeries2Visible && shouldDisplaySeries(input.LCL2, seriesIds.controlChart.lcl2),
                showInLegend: settings.isSeries2Visible && shouldDisplaySeries(input.LCL2),
                index: 11
            },
            {
                id: seriesIds.controlChart.flagSeries,
                name: seriesIds.controlChart.flagSeries,
                type: 'flags',
                data: input.flagSeries,
                onSeries: settings.series1Name,
                showInLegend: false,                          
                useHTML: true,
                dataLabels: {
                    useHTML: true,
                },
                lineWidth: 1,
                lineColor: '#005F87',
                stackDistance:10

            }          
                        
        ];

        if (settings.boxplot === true) {
            seriesData.push({
                linkedTo: 'boxplot',
                name: getLocalizedText('bPlot_series', settings.locale) + '_orig',
                data: input.boxplot,
                type: 'boxplot',
                id: seriesIds.controlChart.boxplot_main,
                showInLegend: false
            }, { // dummy series to show box icon and linked to boxplot series; as boxplot legend icon is not customizeable
                name: getLocalizedText('bPlot_series', settings.locale),
                id: seriesIds.controlChart.boxplot, // for custom icon in legend
                data: null,
                type: 'scatter',
                marker: {
                    enabled: true,
                    lineColor: 'grey',
                    symbol: 'box',
                    lineWidth: 2,
                    radius: 5
                },
                visible: shouldDisplaySeries(input.boxplot, seriesIds.controlChart.boxplot)
            }
            );
        }
        if (settings.drawSPCZones === true) {
            seriesData.push(
                {
                    id: seriesIds.controlChart.SPCZoneA,
                    name: '± Sigma',
                    type: 'arearange',
                    data: input.zoneA,
                    zIndex: -1,
                    fillOpacity: 0.4
                },
                {
                    id: seriesIds.controlChart.SPCZoneB1,
                    name: '± 2Sigma',
                    type: 'arearange',
                    data: input.zoneB1,
                    zIndex: -1,
                    fillOpacity: 0.4,
                    color: '#BDF5B1'

                },
                {
                    id: seriesIds.controlChart.SPCZoneC1,
                    name: '± 2Sigma',
                    type: 'arearange',
                    data: input.zoneC1,
                    zIndex: -1,
                    fillOpacity: 0.4,
                    color: '#BDF5B1',
                    showInLegend: false,
                    linkedTo: seriesIds.controlChart.SPCZoneB1
                },
                {
                    id: seriesIds.controlChart.SPCZoneB2,
                    name: '± 3Sigma',
                    type: 'arearange',
                    data: input.zoneB2,
                    zIndex: -1,
                    fillOpacity: 0.4,
                    color: '#B3B6F2',
                },

                {
                    id: seriesIds.controlChart.SPCZoneC2,
                    name: '± 3Sigma',
                    type: 'arearange',
                    data: input.zoneC2,
                    zIndex: -1,
                    fillOpacity: 0.4,
                    color: '#B3B6F2',
                    showInLegend: false,
                    linkedTo: seriesIds.controlChart.SPCZoneB2
                }
            )

        }

        if (displayMeasurements()) {
            seriesData.push({
                name: getLocalizedText('measurements', settings.locale),
                data: input.measurements,
                type: 'scatter',
                id: seriesIds.controlChart.measurement,
                showInLegend: true,
                marker: {
                    enabled: true,
                    symbol: 'cross',
                    // fillColor: 'grey',
                    lineWidth: 2,
                    radius: 3,
                    lineColor: 'grey'
                }
            });
        }
        return seriesData;
    }

    function setDefault(_options) {
        siemensTooltip.formatter = displayTooltip;
        var opt = undefined;
        if (_options && typeof _options === 'object') {
            opt = $.extend({}, _options);
            opt.seriesNames = opt.chartType ? opt.chartType.split('_') : ['', '']; // to display the names in yAxis
            if (parseMovingMeanWeighting(opt.data.specifications.movingMeanWeighting)  === movingMeanWeightings.Exponentially) {
                opt.seriesNames[0] = 'ewma';
                opt.boxplot = false;
            }
            opt.chartType = parseChartType(opt.chartType);
            if (!opt.locale || !Highcharts.uiLocale[opt.locale]) {
                console.error('Warning: Locale "' + opt.locale + '" not found, default English locales will be used');
                opt.locale = 'en';
            }

            if (!opt.series && typeof opt.series !== 'object') opt.series = getDefaultSeriesColors();
            else opt.series = $.extend(getDefaultSeriesColors(), opt.series);
            
            if (typeof opt.yAxisUnit !== 'object') opt.yAxisUnit = getDefaultyAxisUnitObj();
            else opt.yAxisUnit = $.extend(getDefaultyAxisUnitObj(), opt.yAxisUnit);
        }

        return opt;
    }

    function shouldDisplaySeries(series, hiddenSeriesId) {
        var notNullSeries = [];
        if (series && series.filter) {
            notNullSeries = series.filter(function (k) {
                if (k !== null && k !== undefined)
                    return k.toString();
            });
        }
        var nonullableSeries = notNullSeries.length > 0;
        var isVisibleSeries = !(settings.hiddenSeries.indexOf(hiddenSeriesId) > -1);

        return nonullableSeries && isVisibleSeries;
    }

    function calculateLimits(input, movingMeanWeightingType) {
        var output = {};            

        if (input) {
            switch (settings.chartType) {
                case chartTypes.s:
                case chartTypes.r:
                case chartTypes.ms:
                case chartTypes.mR:
                    output.ucl1 = roundFloat(input.upperControlLimit2Abs , true);
                    output.lcl1 = roundFloat(input.lowerControlLimit2Abs, true);
                    output.uwl1 = roundFloat(input.upperWarnLimit2Abs, true);
                    output.lwl1 = roundFloat(input.lowerWarnLimit2Abs, true);
                    output.xbp1 = roundFloat(input.calculatedProcessMeanValue2, true);
                    output.seriesVal1 = settings.chartType === chartTypes.s || settings.chartType === chartTypes.ms ? roundFloat(input.calculatedS, true) : roundFloat(input.calculatedR, true);
                    break;
                case chartTypes.xb_s:
                case chartTypes.mxb_ms:
                case chartTypes.x_ms:
                case chartTypes.xb_R:
                case chartTypes.mxb_mR:
                case chartTypes.x_mR:
                case chartTypes.cu_Sum:
                case chartTypes.med_R:
                    output.ucl1 = roundFloat(input.upperControlLimit1Abs, true);
                    output.lcl1 = roundFloat(input.lowerControlLimit1Abs, true);
                    output.uwl1 = roundFloat(input.upperWarnLimit1Abs, true);
                    output.lwl1 = roundFloat(input.lowerWarnLimit1Abs, true);
                    output.xbp1 = roundFloat(input.calculatedProcessMeanValue1, true);
                    output.seriesVal1 = movingMeanWeightingType === movingMeanWeightings.Exponentially ? roundFloat(input.calculatedEWMA, true) : roundFloat(input.calculatedXb, true);
                    output.ucl2 = roundFloat(input.upperControlLimit2Abs, true);
                    output.lcl2 = roundFloat(input.lowerControlLimit2Abs, true);
                    output.uwl2 = roundFloat(input.upperWarnLimit2Abs, true);
                    output.lwl2 = roundFloat(input.lowerWarnLimit2Abs, true);
                    output.xbp2 = roundFloat(input.calculatedProcessMeanValue2, true);
                    output.seriesVal2 = settings.chartType === chartTypes.xb_s || settings.chartType === chartTypes.mxb_ms || settings.chartType === chartTypes.x_ms ? roundFloat(input.calculatedS, true) : roundFloat(input.calculatedR, true);
                    break;
                case chartTypes.med:
                case chartTypes.xb:
                    output.ucl1 = roundFloat(input.upperControlLimit1Abs, true);
                    output.uwl1 = roundFloat(input.upperWarnLimit1Abs, true);
                    output.seriesVal1 = roundFloat(input.calculatedXb, true);
                    output.xbp1 = roundFloat(input.calculatedProcessMeanValue1, true);
                    output.lwl1 = roundFloat(input.lowerWarnLimit1Abs, true);
                    output.lcl1 = roundFloat(input.lowerControlLimit1Abs, true);
                    break;
                default: // XB chart type
                    output.ucl1 = roundFloat(input.upperControlLimit1Abs, true);
                    output.lcl1 = roundFloat(input.lowerControlLimit1Abs, true);
                    output.uwl1 = roundFloat(input.upperWarnLimit1Abs, true);
                    output.lwl1 = roundFloat(input.lowerWarnLimit1Abs, true);
                    output.xbp1 = roundFloat(input.calculatedProcessMeanValue1, true);
                    output.seriesVal1 = roundFloat(input.calculatedXb, true);
            }

            if (settings.boxplot === true) {
                output.boxplot = [];
                $.each(input.boxPlot, function (i, d) {
                    output.boxplot.push(roundFloat(d));
                });
            }
        }
        return output;
    }

    function prepareChartOptions(seriesData, input) {

        var options =
        {
            chart: {
                backgroundColor: settings.backgroundColor,
                type: 'line',
                height: settings.height,
                width: settings.width,
                animation: false,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    },
                    events: {
                        legendItemClick: onLegendClick
                    }
                },
                boxplot: {
                    color: 'grey',
                    fillColor: '#E1DCDC12',
                    lineWidth: 1,
                    medianColor: '#0C5DA5',
                    medianWidth: 2
                },
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            navigator: {
                baseSeries: 2,
                enabled: true, // to show or hide zoom level on x-axis
                series: {
                    lineColor: chartSeriesColors.ControlChart.Measurement
                },
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                }
            },
            rangeSelector: {
                enabled: false
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                title: {
                    text: settings.xAxisTitle,
                    style: axiesTitleStyle
                },
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 1,
                gridLineColor: siemensColors.PL_BLACK_22,
                labels: {
                    rotation: -90,
                    formatter: function () {
                        return input.subgroups[this.value];
                    },
                    style: axiesStyle
                },
               
                range: 25 // select last 25 samples
            },
            yAxis: yAxisLabels(),
            series: seriesData
        };

        return options;
    }

    function addNewSubgroup(newSubgroup, redraw) {
        
        var chartApi = $this.data('chartApi');

        if (newSubgroup && chartApi) {
            extractSubgroupData(newSubgroup, settings.inputs.series1.length, settings.inputs);

            if (chartApi.get(seriesIds.controlChart.series1))
                chartApi.get(seriesIds.controlChart.series1).setData(settings.inputs.series1, false);

            if (chartApi.get(seriesIds.controlChart.ucl1))
                chartApi.get(seriesIds.controlChart.ucl1).setData(settings.inputs.UCL1, false);

            if (chartApi.get(seriesIds.controlChart.lcl1))
                chartApi.get(seriesIds.controlChart.lcl1).setData(settings.inputs.LCL1, false);

            if (chartApi.get(seriesIds.controlChart.uwl1))
                chartApi.get(seriesIds.controlChart.uwl1).setData(settings.inputs.UWL1, false);

            if (chartApi.get(seriesIds.controlChart.lwl1))
                chartApi.get(seriesIds.controlChart.lwl1).setData(settings.inputs.LWL1, false);

            if (chartApi.get(seriesIds.controlChart.xbp1))
                chartApi.get(seriesIds.controlChart.xbp1).setData(settings.inputs.xbP1, false);

            if (chartApi.get(seriesIds.controlChart.toolChanged))
                chartApi.get(seriesIds.controlChart.toolChanged).setData(settings.inputs.flagSeries, false);

            if (settings.boxplot === true) {
                chartApi.get(seriesIds.controlChart.boxplot_main).setData(settings.inputs.boxplot, false);
            }

            if (settings.isSeries2Visible) {
                if (chartApi.get(seriesIds.controlChart.series2))
                    chartApi.get(seriesIds.controlChart.series2).setData(settings.inputs.series2, false);

                if (chartApi.get(seriesIds.controlChart.ucl2))
                    chartApi.get(seriesIds.controlChart.ucl2).setData(settings.inputs.UCL2, false);

                if (chartApi.get(seriesIds.controlChart.lcl2))
                    chartApi.get(seriesIds.controlChart.lcl2).setData(settings.inputs.LCL2, false);

                if (chartApi.get(seriesIds.controlChart.uwl2))
                    chartApi.get(seriesIds.controlChart.uwl2).setData(settings.inputs.UWL2, false);

                if (chartApi.get(seriesIds.controlChart.lwl2))
                    chartApi.get(seriesIds.controlChart.lwl2).setData(settings.inputs.LWL2, false);

                if (chartApi.get(seriesIds.controlChart.xbp2))
                    chartApi.get(seriesIds.controlChart.xbp2).setData(settings.inputs.xbP2, false);
            }
        }
        if (redraw)
            chartApi.redraw();
    }

    function updateChartColor(colorScheme) {
        var chartApi = $this.data('chartApi');

        if (typeof colorScheme === 'object' && chartApi) {
            if (colorScheme.backgroundColor) {
                chartApi.update({ chart: { backgroundColor: colorScheme.backgroundColor } }, false);
            }

            if (colorScheme.series1) {
                updateSeriesColor(seriesIds.controlChart.series1, colorScheme.series1);
            }

            if (colorScheme.series2) {
                updateSeriesColor(seriesIds.controlChart.series2, colorScheme.series2);
            }

            if (colorScheme.controlLimit) {
                updateSeriesColor(seriesIds.controlChart.ucl1, colorScheme.controlLimit);
                updateSeriesColor(seriesIds.controlChart.lcl1, colorScheme.controlLimit);
                updateSeriesColor(seriesIds.controlChart.ucl2, colorScheme.controlLimit);
                updateSeriesColor(seriesIds.controlChart.lcl2, colorScheme.controlLimit);
            }

            if (colorScheme.warningLimit) {
                updateSeriesColor(seriesIds.controlChart.uwl1, colorScheme.warningLimit);
                updateSeriesColor(seriesIds.controlChart.lwl1, colorScheme.warningLimit);
                updateSeriesColor(seriesIds.controlChart.uwl2, colorScheme.warningLimit);
                updateSeriesColor(seriesIds.controlChart.lwl2, colorScheme.warningLimit);
            }

            if (colorScheme.processMeanValue) {
                updateSeriesColor(seriesIds.controlChart.xbp1, colorScheme.processMeanValue);
                updateSeriesColor(seriesIds.controlChart.xbp2, colorScheme.processMeanValue);
            }

            chartApi.redraw();
        }

        function updateSeriesColor(seriesId, newColor) {
            var chartApi = $this.data('chartApi');

            if (chartApi && chartApi.get(seriesId) && newColor) {
                chartApi.get(seriesId).update({ color: newColor }, false);
            }
        }
    }

    function updateSubgroup(sgNum, subGroupObj) {
        var chartApi = $this.data('chartApi');
        //GetSubGroup obj
        if (subGroupObj.customInfo) {
            settings.inputs.customInfo[sgNum] = subGroupObj.customInfo;
            var flagSeriesData = chartApi.get(seriesIds.controlChart.flagremarks).data;
            if (flagSeriesData) {
                flagSeriesData.filter(function (obj) {
                    return obj.x === sgNum
                }).map(function (obj) {
                    obj.text = getCustomRemarks(settings, sgNum);

                });
            }

        }
        if (isNullOrUndefined(subGroupObj.lcl1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.lcl1).data[sgNum])) {
            var lcl1 = roundFloat(subGroupObj.lcl1, settings.decimalPlaces);
            settings.inputs.LCL1[sgNum] = lcl1;
            chartApi.get(seriesIds.controlChart.lcl1).data[sgNum].update(lcl1);

        }
        if (isNullOrUndefined(subGroupObj.ucl1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.ucl1).data[sgNum])) {
            var ucl1 = roundFloat(subGroupObj.ucl1, settings.decimalPlaces);
            settings.inputs.UCL1[sgNum] = ucl1;
            chartApi.get(seriesIds.controlChart.ucl1).data[sgNum].update(ucl1);

        }
        if (isNullOrUndefined(subGroupObj.lwl1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.lwl1).data[sgNum])) {
            var lwl1 = roundFloat(subGroupObj.lwl1, settings.decimalPlaces);
            settings.inputs.LWL1[sgNum] = lwl1;
            chartApi.get(seriesIds.controlChart.lwl1).data[sgNum].update(lwl1);

        }
        if (isNullOrUndefined(subGroupObj.uwl1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.uwl1).data[sgNum])) {
            var uwl1 = roundFloat(subGroupObj.uwl1, settings.decimalPlaces);
            settings.inputs.UWL1[sgNum] = uwl1;
            chartApi.get(seriesIds.controlChart.uwl1).data[sgNum].update(uwl1);

        }
        if (isNullOrUndefined(subGroupObj.xbP1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.xbP1).data[sgNum])) {
            var xbP1 = roundFloat(subGroupObj.xbP1, settings.decimalPlaces);
            settings.inputs.xbP1[sgNum] = xbP1;
            chartApi.get(seriesIds.controlChart.xbp1).data[sgNum].update(xbP1);

        }
        if (isNullOrUndefined(subGroupObj.series1) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.series1).data[sgNum])) {
            var series1 = roundFloat(subGroupObj.series1, settings.decimalPlaces);
            settings.inputs.series1[sgNum] = series1;
            chartApi.get(seriesIds.controlChart.series1).data[sgNum].update(series1);

        }



        if (isNullOrUndefined(subGroupObj.lcl2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.lcl2).data[sgNum])) {
            var lcl2 = roundFloat(subGroupObj.lcl2, settings.decimalPlaces);
            settings.inputs.LCL2[sgNum] = lcl2;
            chartApi.get(seriesIds.controlChart.lcl2).data[sgNum].update(lcl2);

        }
        if (isNullOrUndefined(subGroupObj.ucl2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.ucl2).data[sgNum])) {
            var ucl2 = roundFloat(subGroupObj.ucl2, settings.decimalPlaces);
            settings.inputs.UCL2[sgNum] = ucl2;
            chartApi.get(seriesIds.controlChart.ucl2).data[sgNum].update(ucl2);

        }
        if (isNullOrUndefined(subGroupObj.lwl2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.lwl2).data[sgNum])) {
            var lwl2 = roundFloat(subGroupObj.lwl2, settings.decimalPlaces);
            settings.inputs.LWL2[sgNum] = lwl2;
            chartApi.get(seriesIds.controlChart.lwl2).data[sgNum].update(lwl2);

        }
        if (isNullOrUndefined(subGroupObj.uwl2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.uwl2).data[sgNum])) {
            var uwl2 = roundFloat(subGroupObj.uwl2, settings.decimalPlaces);
            settings.inputs.UWL2[sgNum] = uwl2;
            chartApi.get(seriesIds.controlChart.uwl2).data[sgNum].update(uwl2);

        }
        if (isNullOrUndefined(subGroupObj.xbP2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.xbP2).data[sgNum])) {
            var xbP2 = roundFloat(subGroupObj.xbP2, settings.decimalPlaces);
            settings.inputs.xbP2[sgNum] = xbP2;
            chartApi.get(seriesIds.controlChart.xbp2).data[sgNum].update(xbP2);

        }
        if (isNullOrUndefined(subGroupObj.series2) && isNullOrUndefined(chartApi.get(seriesIds.controlChart.series2).data[sgNum])) {
            var series2 = roundFloat(subGroupObj.series2, settings.decimalPlaces);
            settings.inputs.series2[sgNum] = series2;
            chartApi.get(seriesIds.controlChart.series2).data[sgNum].update(series2);

        }
        
       

        chartApi.redraw();
    }

    function displayMeasurements() {
        var isVisible = (settings.showMeasurements === true && (settings.chartType === chartTypes.xb || settings.chartType === chartTypes.med || settings.chartType === chartTypes.mxb_ms || settings.chartType === chartTypes.mxb_mR));

        return isVisible;
    }

    function prepareColoredZone()
    {
        var zone = [];
        var violationZones = [];
        var subgroupSize = settings.data && settings.data.specifications && settings.data.specifications.subgroupSize > 0 ? settings.data.specifications.subgroupSize : 1;
        var interval;
        switch (settings.chartType) {
            
            case chartTypes.mxb_ms:
            case chartTypes.mxb_mR:
                interval = [[0, subgroupSize - 1]];
                zone=(getColoredSeriesZone(interval, siemensColors.SiemensBlueLight));
                break;
        }
        //Disply violated samples and values in a different color 
        if (settings.data && settings.data.subgroups) {
            var violatedSubgroupsNumber = [];
            settings.data.subgroups.forEach(function (subgroup) {
                var statuses = subgroup.statuses;
                var newstatuses = [];
                if (statuses && statuses.length > 0) {
                    for (var i = 0; i < statuses.length; i++)
                        newstatuses.push(statuses[i].category.toLowerCase());
                    if (newstatuses.indexOf("involvedbyother") > -1) {
                        violatedSubgroupsNumber.push(roundFloat(subgroup.subgroupNumber));
                    }
                }
            });
           
        }
        interval = getSequence(violatedSubgroupsNumber)
        violationZones = getColoredSeriesZone(interval, siemensColors.violationZone);
        violationZones.forEach(function (violationZone) {
            zone.push(violationZone);

        });
        return zone;
        
         
    }

    function getDefaultyAxisUnitObj() {
        var obj = {
            text: '',
            x: 60,
            y: undefined,
            fontSize: undefined
        };
        return obj;
    }

    function getDefaultSeriesColors() {
        var obj =
        {
            color: {
                series1: chartSeriesColors.ControlChart.xbarX,
                series2: chartSeriesColors.ControlChart.Sr,
                controlLimit: chartSeriesColors.ControlChart.ControlLimit,
                warningLimit: chartSeriesColors.ControlChart.WarningLimit,
                processMeanValue: chartSeriesColors.ControlChart.xbarProcess
            }
        };
        return obj;
    }


    function parseMovingMeanWeighting(movingMeanWeighting) {
        if (movingMeanWeighting && typeof movingMeanWeighting === 'string') {
            for (var key in movingMeanWeightings) {
                if (key.toLowerCase() === movingMeanWeighting.toLowerCase())
                    return movingMeanWeightings[key];
            }
        } else {
            console.warn("Invalid MovingMeanWeighting in parameter, valid values can be one from these -> Uniformly, Exponentially ");
            return -1;
        }
        return -1;
    }

    function getCustomRemarks(settings, index) {
        var customTooltip = [];
        var customInfo = undefined;
        if (settings.data && settings.data.subgroups && settings.data.subgroups[index]) { // Why is it needed? customInfo is already in customInfo array
            customInfo = settings.data.subgroups[index].customInfo;
        } 
        if (customInfo) {
            var xAxisObj = customInfo.filter(function (k) { return k.isRemark === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.value);
                });
            }
        }

        return getLocalizedText('annotation', settings.locale) + ' : ' + customTooltip.join(', ');
    } 
};
/**
 * @description Provide methods for drawing Histogram chart .
 *
 * @namespace HistogramChart
 * */
/**
 * @description A new Histogram chart  can be drawn using this method.
 * @memberof HistogramChart
 * @function histogramChart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {HistogramChart.options} options - The chart options parameter
 * @tutorial CreateHistogramChart
 * @example
    var $chart = $('#HistogramS').histogramChart({
                    locale: switchlocale || 'en',
                    decimalPlaces: 4,
                    height: '60%',
                    width: undefined,
                    chartType: 'hist_S',
                    xAxisTitle:'(mm)',
                    data: data
                });
 */

/**
* @memberof  HistogramChart
* @typedef  {object} options
* @property {string}  [locale=en]  User locale to display label and violations in a specific language
* @property {HistogramChart.data} data - JSON Array with sample count, percentage and bins border
* @property {string} [chartTitle= 'HISTOGRAM'] - The Chart title
* @property {string} [xAxisTitle] - The xAxis Title
* @property {string} [yAxisTitle= '%'] - The yAxis Title
* @property {number}  [decimalPlaces=4] - The data of chart will be round based on number of decimal places.
* @property {number}  [height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
*                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
* @property {number}  [width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
* @property {chartTypes} chartType - Enumeration to specifies which chart type should be used @see {@link chartTypes}
*/

/**
* @description The data array of the Histogram
* @typedef {object} data
* @memberof HistogramChart
* @property {number} count Number of samples that lies in the bin range
* @property {number} percentage Percentage of the sample that lies in the bin range
* @property {number} lowerBorder The broder of the bin range
* @example
*{
*	"result": {
*		"histogramClassesByS": [
*			{
*				"count": 0,
*				"percentage": 0.0,
*				"lowerBorder": 19.96251030353614
*			},
*			{
*				"count": 5,
*				"percentage": 1.0,
*				"lowerBorder": 19.96897514914596
*			},
*			{
*				"count": 12,
*				"percentage": 2.4,
*				"lowerBorder": 19.975439994755786
*			},
*			{
*				"count": 26,
*				"percentage": 5.2,
*				"lowerBorder": 19.98190484036561
*			},
*			{
*				"count": 34,
*				"percentage": 6.800000000000001,
*				"lowerBorder": 19.98836968597543
*			},
*			{
*				"count": 102,
*				"percentage": 20.4,
*				"lowerBorder": 19.994834531585256
*			},
*			{
*				"count": 126,
*				"percentage": 25.2,
*				"lowerBorder": 20.001299377195079
*			},
*			{
*				"count": 106,
*				"percentage": 21.2,
*				"lowerBorder": 20.0077642228049
*			},
*			{
*				"count": 49,
*				"percentage": 9.8,
*				"lowerBorder": 20.014229068414726
*			},
*			{
*				"count": 24,
*				"percentage": 4.8,
*				"lowerBorder": 20.020693914024549
*			},
*			{
*				"count": 3,
*				"percentage": 0.6,
*				"lowerBorder": 20.02715875963437
*			},
*			{
*				"count": 5,
*				"percentage": 1.0,
*				"lowerBorder": 20.033623605244196
*			},
*			{
*				"count": 3,
*				"percentage": 0.6,
*				"lowerBorder": 20.040088450854019
*			},
*			{
*				"count": 0,
*				"percentage": 0.0,
*				"lowerBorder": 20.04655329646384
*			}
*		],
*		"histogramClassesByTolerances": [
*			{
*				"count": 2,
*				"percentage": 0.4,
*				"lowerBorder": 19.952727272727274
*			},
*			{
*				"count": 1,
*				"percentage": 0.2,
*				"lowerBorder": 19.96
*			},
*			{
*				"count": 5,
*				"percentage": 1.0,
*				"lowerBorder": 19.96727272727273
*			},
*			{
*				"count": 12,
*				"percentage": 2.4,
*				"lowerBorder": 19.974545454545458
*			},
*			{
*				"count": 30,
*				"percentage": 6.0,
*				"lowerBorder": 19.981818181818185
*			},
*			{
*				"count": 61,
*				"percentage": 12.2,
*				"lowerBorder": 19.989090909090913
*			},
*			{
*				"count": 109,
*				"percentage": 21.8,
*				"lowerBorder": 19.99636363636364
*			},
*			{
*				"count": 136,
*				"percentage": 27.200000000000004,
*				"lowerBorder": 20.003636363636369
*			},
*			{
*				"count": 92,
*				"percentage": 18.4,
*				"lowerBorder": 20.010909090909096
*			},
*			{
*				"count": 34,
*				"percentage": 6.800000000000001,
*				"lowerBorder": 20.018181818181824
*			},
*			{
*				"count": 8,
*				"percentage": 1.6,
*				"lowerBorder": 20.02545454545455
*			},
*			{
*				"count": 5,
*				"percentage": 1.0,
*				"lowerBorder": 20.03272727272728
*			},
*			{
*				"count": 3,
*				"percentage": 0.6,
*				"lowerBorder": 20.040000000000008
*			}
*		],
*		"listOfCalculations": [
*			{
*				"inStandardDeviationRange": 312.0,
*				"inStandardDeviationRangePercentage": 62.4,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 312.0,
*				"inSigmaRangePercentage": 62.4,
*				"lowerStandardDeviation": 19.99564263728649,
*				"upperStandardDeviation": 20.013420962713508
*			},
*			{
*				"inStandardDeviationRange": 124.0,
*				"inStandardDeviationRangePercentage": 24.8,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 436.0,
*				"inSigmaRangePercentage": 87.2,
*				"lowerStandardDeviation": 19.986753474572983,
*				"upperStandardDeviation": 20.022310125427017
*			},
*			{
*				"inStandardDeviationRange": 42.0,
*				"inStandardDeviationRangePercentage": 8.4,
*				"countOfGreaterStandardDeviation": 22.0,
*				"countOfGreaterStandardDeviationPercentage": 4.3999999999999999,
*				"countOfGreaterNegativeStandardDeviation": 12.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 2.4,
*				"countOfGreaterPositiveStandardDeviation": 10.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 2.0,
*				"inSigmaRange": 478.0,
*				"inSigmaRangePercentage": 95.60000000000001,
*				"lowerStandardDeviation": 19.97786431185947,
*				"upperStandardDeviation": 20.031199288140529
*			},
*			{
*				"inStandardDeviationRange": 14.0,
*				"inStandardDeviationRangePercentage": 2.8000000000000004,
*				"countOfGreaterStandardDeviation": 8.0,
*				"countOfGreaterStandardDeviationPercentage": 1.6,
*				"countOfGreaterNegativeStandardDeviation": 3.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.6,
*				"countOfGreaterPositiveStandardDeviation": 5.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 1.0,
*				"inSigmaRange": 492.0,
*				"inSigmaRangePercentage": 98.4,
*				"lowerStandardDeviation": 19.96897514914596,
*				"upperStandardDeviation": 20.040088450854037
*			},
*			{
*				"inStandardDeviationRange": 4.0,
*				"inStandardDeviationRangePercentage": 0.8,
*				"countOfGreaterStandardDeviation": 4.0,
*				"countOfGreaterStandardDeviationPercentage": 0.8,
*				"countOfGreaterNegativeStandardDeviation": 2.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.4,
*				"countOfGreaterPositiveStandardDeviation": 2.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.4,
*				"inSigmaRange": 496.0,
*				"inSigmaRangePercentage": 99.2,
*				"lowerStandardDeviation": 19.960085986432455,
*				"upperStandardDeviation": 20.048977613567545
*			},
*			{
*				"inStandardDeviationRange": 0.0,
*				"inStandardDeviationRangePercentage": 0.0,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 496.0,
*				"inSigmaRangePercentage": 99.2,
*				"lowerStandardDeviation": 19.951196823718946,
*				"upperStandardDeviation": 20.057866776281054
*			},
*			{
*				"inStandardDeviationRange": 0.0,
*				"inStandardDeviationRangePercentage": 0.0,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 0.0,
*				"inSigmaRangePercentage": 0.0,
*				"lowerStandardDeviation": 19.942307661005438,
*				"upperStandardDeviation": 20.06675593899456
*			},
*			{
*				"inStandardDeviationRange": 0.0,
*				"inStandardDeviationRangePercentage": 0.0,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 0.0,
*				"inSigmaRangePercentage": 0.0,
*				"lowerStandardDeviation": 19.93341849829193,
*				"upperStandardDeviation": 20.07564510170807
*			},
*			{
*				"inStandardDeviationRange": 0.0,
*				"inStandardDeviationRangePercentage": 0.0,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 0.0,
*				"inSigmaRangePercentage": 0.0,
*				"lowerStandardDeviation": 19.924529335578418,
*				"upperStandardDeviation": 20.08453426442158
*			},
*			{
*				"inStandardDeviationRange": 0.0,
*				"inStandardDeviationRangePercentage": 0.0,
*				"countOfGreaterStandardDeviation": 0.0,
*				"countOfGreaterStandardDeviationPercentage": 0.0,
*				"countOfGreaterNegativeStandardDeviation": 0.0,
*				"countOfGreaterNegativeStandardDeviationPercentage": 0.0,
*				"countOfGreaterPositiveStandardDeviation": 0.0,
*				"countOfGreaterPositiveStandardDeviationPercentage": 0.0,
*				"inSigmaRange": 0.0,
*				"inSigmaRangePercentage": 0.0,
*				"lowerStandardDeviation": 19.915640172864909,
*				"upperStandardDeviation": 20.09342342713509
*			}
*		],
*		"distributionValuesModels": null,
*		"processValues": {
*			"calculatedSb": 0.008355812950698488,
*			"calculatedRb": 0.02052000000000014,
*			"calculatedXbb": 20.0045318,
*			"calculatedMin": 19.955,
*			"calculatedMax": 20.055,
*			"cp": 1.4999537935187222,
*			"cpk": 1.3300165284820618,
*			"processIsUnderControl": false,
*			"processIsCapable": false,
*			"countOfValidValues": 500,
*			"countOfValidValuesInPercent": 100.0,
*			"sigmaEstimated": 0.00888916271350903,
*			"countOfValuesLessThanLowerTolerance": 0.0,
*			"countOfValuesLargerThanUpperTolerance": 0.0,
*			"countOfValuesLessThanLowerToleranceInPercent": 0.0,
*			"countOfValuesLargerThanUpperToleranceInPercent": 0.0,
*			"range": 0.10000000000000142,
*			"maxXb": 20.0408,
*			"minXb": 19.9704,
*			"probabilityOfValuesLargerThanUpperToleranceInPercent": 0.0,
*			"probabilityOfValuesLessThanLowerToleranceInPercent": 0.0,
*			"meanModification": 0.0,
*			"p99": 20.040088450854037,
*			"p0_13": 19.96897514914596
*		},
*	},
*	"specifications": {
*		"subgroupSize": 5,
*		"distributionType": null,
*		"controlChartType": "xb_s",
*		"limitationType": null,
*		"averageMovingMeanType": null,
*		"evaluationType": null,
*		"capabilityStudyType": null,
*		"limit": null,
*		"currentNominalValue": null,
*		"currentUpperToleranceLimitAbs": 20.04,
*		"currentLowerToleranceLimitAbs": 19.96,
*		"defectRate": null,
*		"probabilityOfAction": null,
*		"cL_L_Percent": null,
*		"cL_U_Percent": null,
*		"wL_L_Percent": null,
*		"wL_U_Percent": null,
*		"confidenceInterval": 4,
*		"controlLimits": {
*			"currentUpperControlLimit1Abs": null,
*			"currentLowerControlLimit1Abs": null,
*			"currentUpperWarnLimit1Abs": null,
*			"currentLowerWarnLimit1Abs": null,
*			"currentUpperControlLimit2Abs": null,
*			"currentLowerControlLimit2Abs": null,
*			"currentUpperWarnLimit2Abs": null,
*			"currentLowerWarnLimit2Abs": null,
*			"currentProcessMeanValue1": null,
*			"currentProcessMeanValue2": null
*		}
*	}
*}
*
* */

$.fn.histogramChart = function (options) {
    setDefaults();
    var settings = {};

    if (options && typeof options === 'object') {
        settings = $.extend({
            locale: 'en',
            data: {},
            chartTitle: getLocalizedText('Hist_ChartTitle', options.locale),
            xAxisTitle: '',
            yAxisTitle: getLocalizedText('Hist_yAxisTitle', options.locale),
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            chartType: undefined
        }, options);
    } else if (typeof options === 'string') { // Method call
        settings = $(this).data('settings') || {};
    }  // restore the settings object from prev settings
    var $this = this,
        _args = arguments,
        HistogramChart = {
            init: function () {
                var containerId = $this.attr('id');
                var _chart = Highcharts.chart(containerId, createSVHistogramOptionValue(settings));
                $this.data('chartApi', _chart);
                $this.data('settings', settings);
            },

            /**
            * @function addPoint
            * @description Add a new point to  histograms. The histogram chart must be drawn before.
            * @param {number} newPoint The value of the point that being added.
            * @memberof HistogramChart
            * @example
            * $('#chart').chart('addPoint', 14.068);
            * // This will add a new point to the measurements and then calculate the new classes.
            */
            addPoint: function (newPoint) {
                var chartApi = $this.data('chartApi');
                var currentClasses = chartApi.get(seriesIds.HistogramChart.Classes).data;
                if (currentClasses) {
                    console.log(currentClasses);

                    var i;
                    for (i = 0; i < currentClasses.length -1; i++) {
                        if (currentClasses[i].x <= newPoint && currentClasses[i + 1].x > newPoint) {
                            settings.dataCount++;
                            settings.data.result.histogramClassesByTolerances[i].count += 1;
                            break;
                        }
                    }
                    for (i = 0; i < settings.data.result.histogramClassesByTolerances.length - 1; i++) {
                        var newProcentage = settings.data.result.histogramClassesByTolerances[i].count / settings.dataCount * 100;
                        settings.data.result.histogramClassesByTolerances[i].percentage = newProcentage;
                        currentClasses[i].y = newProcentage;
                    }
                    chartApi.get(seriesIds.HistogramChart.Classes).setData(currentClasses);
                    chartApi.redraw();
                    $this.data('settings', settings);
                }
            }
        };
    return this.each(function () {
        if (HistogramChart[options]) {
            return HistogramChart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            HistogramChart.init();
        }
    });
    //Create Histogram Option Values
    function createSVHistogramOptionValue(settings, dataCount) {
        siemensTooltip.formatter = displayHistoTooltip;
        var data = [];
        var categories = [];
        var plotLines = [];
        var histogramPoints = [];
        var bellCurve = [];
        var maxValue = 0;
        var dataCount = 0;
        var labelCounter = 0;
        if (settings.data.result) {
            var diff = 0;
            
            switch (parseChartType(settings.chartType)) {
                case chartTypes.hist_S:
                    data = prepareData(settings.data.result.histogramClassesByS);
                    if (data && data.length > 1) {
                        var classWidth = data[1][0] - data[0][0];
                        diff = classWidth / 2;
                    }
                    bellCurve = prepareBellCurve(settings.data.result.bellCurvePointsS, diff);
                    break;
                case chartTypes.hist_T:
                    data = prepareData(settings.data.result.histogramClassesByTolerances, diff);
                    if (data && data.length > 1) {
                        var classWidth = data[1][0] - data[0][0];
                        diff = classWidth / 2;
                    }
                    bellCurve = prepareBellCurve(settings.data.result.bellCurvePointsTolerances, diff);
                    break;
            }
        }
        if (data && data.length > 0) {
            var classWidth = data[1][0] - data[0][0];
            var diff = classWidth / 2;


            if (data) {
                $.each(data, function (i, item) {
                    var centerPoint = item[0] - diff;
                    histogramPoints.push([item[0], item[1]]);
                    categories.push(centerPoint);
                    dataCount+= item[1];
                });
                settings.dataCount = dataCount;
                
            }
            //declare all lines as null
            var currentLowerToleranceLimitAbs,
                currentUpperToleranceLimitAbs,
                confidenceInterval,
                calculatedXbb,
                plusD,
                minusD,
                confidenceIntervalString;

            var lowerBorder = Math.min.apply(Math, histogramPoints.map(function (o) {
                return o[0];
            }));
            var upperBorder = Math.max.apply(Math, histogramPoints.map(function (o) {
                return o[0];
            }));
            //Since we substract diff from category sothat the category are drown exactly at the beginning of histogram column
            // we need to do the same for all plotted lines so that they are drwan exactly at the original values 
            //Highchrts drw the column in the middle of the x value 
            // we correct the displaed text in the lable formatter in x-Axis to display the original x values 
            if (settings.data.specifications) {
                currentLowerToleranceLimitAbs = roundFloat(settings.data.specifications.currentLowerToleranceLimitAbs || null)-diff;
                if (currentLowerToleranceLimitAbs < lowerBorder || currentLowerToleranceLimitAbs > upperBorder) {
                    currentLowerToleranceLimitAbs = null;
                }
                currentUpperToleranceLimitAbs = roundFloat(settings.data.specifications.currentUpperToleranceLimitAbs || null)-diff;
                if (currentUpperToleranceLimitAbs > upperBorder || currentUpperToleranceLimitAbs < lowerBorder) {
                    currentUpperToleranceLimitAbs = null;
                }
                confidenceInterval = roundFloat(settings.data.specifications.confidenceInterval || null);
                confidenceIntervalString = confidenceInterval == null ? '' : confidenceInterval.toString() + getLocalizedText('HIST_Confidance_Interval', settings.locale);
            }
            if (settings.data.result) {
                if (confidenceInterval && settings.data.result.listOfCalculations) {
                    plusD = roundFloat(settings.data.result.listOfCalculations[confidenceInterval - 1].upperStandardDeviation || null) - diff;
                    if (plusD > upperBorder || plusD < lowerBorder) {
                        plusD = null;
                    }
                    minusD = roundFloat(settings.data.result.listOfCalculations[confidenceInterval - 1].lowerStandardDeviation || null)-diff;
                    if (minusD > upperBorder || minusD < lowerBorder) {
                        minusD = null;
                    }
                }

                if (settings.data.result.processValues) {

                    calculatedXbb = roundFloat(settings.data.result.processValues.calculatedXbb || null)-diff;
                    if (calculatedXbb > upperBorder || calculatedXbb < lowerBorder) {
                        calculatedXbb = null;
                    }
                }
            }

            var plotlinesValues = [];
            plotlinesValues.push(currentLowerToleranceLimitAbs, currentUpperToleranceLimitAbs, calculatedXbb, plusD, minusD);
            var maxPlotLinePoint = Math.max.apply(Math, plotlinesValues.reduce(function (result, plotlinesValue) {
                if (plotlinesValue) {
                    result.push(plotlinesValue);
                }
                return result;
            }, []));

            var minPlotLinePoint = Math.min.apply(Math, plotlinesValues.reduce(function (result, plotlinesValue) {
                if (plotlinesValue) {
                    result.push(plotlinesValue);
                }
                return result;
            }, []));

            plotLines.push(createPlotLineObject(currentLowerToleranceLimitAbs,'red', getLocalizedText('Hist_currentLowerToleranceLimitAbs', settings.locale), -20));
            plotLines.push(createPlotLineObject(currentUpperToleranceLimitAbs, chartSeriesColors.Histogram.ToleranceLimit, getLocalizedText('Hist_currentUpperToleranceLimitAbs', settings.locale), -20));
            if (!settings.data.result.igcCalculation) {
                plotLines.push(createPlotLineObject(calculatedXbb, chartSeriesColors.Histogram.Xbb, getLocalizedText('Hist_Xbb', settings.locale)));
                plotLines.push(createPlotLineObject(plusD, chartSeriesColors.Histogram.StandardDeviation, '+' + confidenceIntervalString), -25);
                plotLines.push(createPlotLineObject(minusD, chartSeriesColors.Histogram.StandardDeviation, '-' + confidenceIntervalString), -25);
            }

            while ((categories[categories.length - 1] < maxPlotLinePoint + diff) && diff > 0) {
                categories.push(categories[categories.length - 1] + classWidth);
            }

            while ((categories[0] > minPlotLinePoint - diff) && diff > 0) {
                var newcat = categories[0] - classWidth;
                categories.unshift(newcat);
            }
            maxValue = Math.max.apply(Math, histogramPoints.map(function (o) {
                return o[1];
            }));
        }
        var optionValues = {
            chart: {
                spacingRight: 30,
                spacingTop: 35,
                marginLeft: 130,
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: -50,
                y: 250
            },
            credits: {
                enabled: false
            },
            title: {
                text: settings.chartTitle, 
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: [{
                title: {
                    text: settings.xAxisTitle,
                    style: axiesTitleStyle
                },
                tickPositions: categories,
                endOnTick: false,
                startOnTick: false,
                minPadding: 0,
                maxPadding: 0,
                min: categories.length > 0 ? categories.sort(function (a, b) {
                    return a - b;
                })[0] : 0,
                max: categories.length > 0 ? categories.sort(function (a, b) {
                    return a - b;
                })[categories.length - 1] : 0,
                plotLines: plotLines,
                gridLineColor: siemensColors.PL_BLACK_22,
                lineColor: siemensColors.PL_BLACK_22,
                labels: {
                    formatter: function () {

                        return roundFloat(this.value + diff, settings.decimalPlaces);
                    },
                    style: axiesStyle
                }
            }, {
                visible: false,
                linkedTo: 0,
                gridLineWidth: 1
                }],
            yAxis: {
                title: {
                    text: settings.yAxisTitle,
                    rotation: -90,
                    margin: 5,
                    align: 'middle',
                    y: 10,
                    style: axiesTitleStyle
                },
                lineWidth: 1,
                lineColor: siemensColors.PL_BLACK_22,
                alignTicks: false,
                min: 0,
                tickInterval: maxValue > 50 ? 10 : maxValue > 20 ? 5 : maxValue > 10 ? 2 : 1,
                labels: {
                    style: axiesStyle//,
                    //formatter: function () {
                    //    return histogramLabelFormatter(this.value, settings.dataCount);
                    //}
                }
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    }
                }
            },
            series: [{
                id: seriesIds.HistogramChart.Classes,
                showInLegend: false,
                name: seriesIds.HistogramChart.Classes,
                type: 'column',
                data: histogramPoints,
                pointPadding: -0.3287,
                color: chartSeriesColors.Histogram.Bin,
                xAxis: 0,
                pointRange: 0
               },
                {
                    id: 'bellCurve',
                    xAxis: 1,
                    data: bellCurve,
                    type: 'spline',
                    showInLegend: !settings.data.result.igcCalculation,
                    name: getLocalizedText('Hist_BellCurve', settings.locale),
                    marker: { enabled: false }
                }]
        };
        return optionValues;
    }
    //Create plot Line object to be displayed along with the Histogram Bins
    function createPlotLineObject(value, color, text, yLabel) {
        var label;
        label = {
            'text': text,
            'rotation': 0,
            'align': 'center',
            'x': yLabel,
            'y': 0,
            'style': {
                'fontSize': '10px',
                'color': color,
                'margin': '5px'
            }
        };
        return {
            'value': value,
            'width': 2,
            'color': color,
            'label': label,
            'zIndex': 4
        };
    }
    //Display ToolTip
    function displayHistoTooltip(tooltip) {
        var y = this.y;
        if (this.series.getName() === getLocalizedText('Hist_BellCurve', settings.locale)) {
            var caption = getLocalizedText('Hist_yAxisTitle', settings.locale); 
            return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + caption + ": </span><span style='font-size:9pt;font-weight:400'>" + this.y + "</span></div>";
        }
        else
        {
            var caption = getLocalizedText('Hist_tt_Count', settings.locale); 
            switch (parseChartType(settings.chartType)) {
                case chartTypes.hist_S:
                    var MeasureObj = settings.data.result.histogramClassesByS.filter(function (obj) {
                        return obj.percentage === y
                    
                    });
                    if (MeasureObj[0]) {
                        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + caption + ": </span><span style='font-size:9pt;font-weight:400'>" + MeasureObj[0].count + "</span></div>";
                    }
                   
                    break;
                case chartTypes.hist_T:
                    var MeasureObj = settings.data.result.histogramClassesByTolerances.filter(function (obj) {
                        return obj.percentage === y

                    });
                    if (MeasureObj[0]) {
                        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + caption + ": </span><span style='font-size:9pt;font-weight:400'>" + MeasureObj[0].count + "</span></div>";
                    }
                    
                    break;
            }

            

        }
      
    }

    function histogramLabelFormatter(value, dataCount) {
        if (dataCount && dataCount > 0) {
            var result = (value / dataCount) * 100;
            return roundFloat(result, settings.decimalPlaces) + ' %';
        }

        return value;
    }

    //Prepare the data to fit the Histogram in the form of 2d array [class,count]
    function prepareData(data) {
        var rowdata = new Array();
        if (!data) {
            return null;
        }
        $.each(data, function (index, item) {
            rowdata.push([roundFloat(item.lowerBorder), roundFloat(item.percentage)]);
        });
        return rowdata;
    }

    //Prepare the data for the bell curve
    function prepareBellCurve(bellCurveData, diff) {
        var rowdata = new Array();
        if (!bellCurveData) {
            return null;
        }
        $.each(bellCurveData, function (index, item) {
            rowdata.push([roundFloat(item.xValue - diff), roundFloat(item.yValue)]);
        });
        return rowdata;
    }

    function setDefaults() {
        if (typeof options === 'object') {
            if ((!options.locale || !Highcharts.uiLocale[options.locale])) {
                console.error('Locale ' + options.locale + ' not found, default English locales will be used');
                options.locale = 'en';
            }
        }
    }
};
/**
 * @description Provide methods for drawing control chart .
 *
 * @namespace SingleValueChart
 * */

/**
 * @description Draw a single Value chart using the provided data from the options parameter
 * @memberof SingleValueChart
 * @function singleValueChart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {object} options - The single Value chart options object.
 * @param {string} [options.locale=en]  User locale
 * @param {SingleValueChart.data} options.data - JSON Array with subgroup, measurements and specifications
 * @param {string} [options.chartTitle = 'Single Value Chart'] - The default value will be based on corresponding locale (if referenced).
 * @param {number} [options.decimalPlaces = 4] - Number of decimal places
 * @param {number} [options.height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @param {number} [options.width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @param {string} [options.xAxisTitle=null] - The x-Axis label disolayed underneath the x-axies by Default it set from the localization file
 * @param {string} [options.yAxisTitle=null] - The x-Axis label disolayed underneath the x-axies by Default it set from the localization file
 * @param {number} [options.yAxisMinValue=auto] - A Number specifies the minimum value of yAxis. Measurement values from this value will be shown in chart.
 * @param {number} [options.yAxisMaxValue=auto] - A Number specifies the maximum value of yAxis. Measurement values till this value will be shown in chart.
 * @param {Array} [options.hiddenSeries] - A series contain the IDs of the series that should not be displayed {@link singleValueChart.seriesIds}
 * @param {SingleValueChart.onLegendClick} [options.onLegendClick] -  The callback function which will be fired if a legend item is clicked.
 * @param {SingleValueChart.onSeriesClick} [options.onSeriesClick] - The callback function which will be fired if a series point is clicked.
 * @param {boolean}  [options.xAxisCustomInfoLabel=false] - If true, the default subgroup number label for xAxis will be overriden by the property of customInfo object, where xAxisLabel is true. For more information  please refer {@link SingleValueChart.customInfo}
 * @param {SingleValueChart.yAxisUnit} [options.yAxisUnit] - The unit of y Axis object.
 * @example
 * $('#svc').singleValueChart(
 *      {
 *          locale: "en",
 *          data: {
 *                  specifications : {
 *                                      subgroupSize : 2,
 *                                      controlChartType : 'xb_s',
 *                                  }
 *                  measurements : [], // Array of objects in defined format
 *                  subgroups: [],  // Array of objects in defined format
 *              },
 *           decimalPlaces: 2,
 *           xAxisCustomInfoLabel: true,
 *           hiddenSeries: ["lcl"],
 *           onSeriesClick: function (data) {
 *                      console.log(data);
 *           },
 *           onLegendClick : function (data) {
 *                      console.log(data);
 *           }
 *        });
 *
 * @tutorial CreateSingleValueChart
 *
 * */

/**
 * @description The format of data for single value chart options.
 * @typedef {Array} data - The array of objects
 * @memberof SingleValueChart
 * @property {Array} subgroups - The array of objects in defined format. Please look the format in the in example below.
 * @property {Array} measurements - The array of objects in defined format.  Please look the format in the in example below.
 * @property {object} specifications - The object represent the corresponding specifications e.g. subgroupSize, controlChartType
 * @property {number} specifications.subgroupSize - The size of the subgroup.
 * @property {chartTypes} specifications.controlChartType - The type of control chart. 
 * @example
 * var data = {
 *      specifications: {
 *                          subgroupSize: 5,
 *                          controlChartType : 'xb_s'                      
 *                      },
 *      subgroups: [
 *                      {
 *                          subgroupNumber: 0
 *                          calculatedS: 0.0022
 *                          calculatedR: 0.0060
 *                          calculatedXb: 19.995
 *                          calculatedMin: 19.99
 *                          calculatedMax: 19.99
 *                          statuses: null
 *                          upperToleranceLimitAbs: 20.04
 *                          lowerToleranceLimitAbs: 19.96
 *                          upperControlLimit1Abs: 20.035
 *                          lowerControlLimit1Abs: 19.965
 *                          upperWarnLimit1Abs: 20.035
 *                          lowerWarnLimit1Abs: 19.975
 *                          upperControlLimit2Abs: 0.021
 *                          lowerControlLimit2Abs: 0.0005
 *                          upperWarnLimit2Abs: 0.018
 *                          lowerWarnLimit2Abs: 0.0015
 *                          calculatedProcessMeanValue1: 20.0045
 *                          calculatedProcessMeanValue2: 0.0083
 *                          processSigma: 0.0088
 *                          initialSortNumber: 0
 *                      }
 *            ],
 *      measurements : [
 *                      {
 *                          referenceID: "1"
 *                          measuredValue: 19.993
 *                          transformedMeasuredValue: 0
 *                          valueTimestamp: "0001-01-01T00:00:00"
 *                          statuses: null
 *                          sequenceID: 0,
 *                          subgroupNumber: 0
 *                      }
 *                  ]
 *  }
 *
 * // Note: The count of measurement array objects should be based on following formula
 * // if chart type is  'x_ms', 'x_mr', 'mx_ms', 'mx_mr' then size of measurements and size of subgroups array should be same.
 * // in other case the size of measurment array should be counted like this
 * // count of measurement array objects =  subgroupSize * count of subgroup array
 */

/**
 * @description An array of objects with following properties can be injected against each measurements.
 * @typedef {object} customInfo
 * @memberof SingleValueChart
 * @property {string} label - The label to be display in tooltip.
 * @property {string} value - The value to be used to show in tooltip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be showin in tooltip for a particular subgrup as 'label: value'
 * @property {boolean} xAxisLabel - If true then value of will be showin on xAxis labels instead of default labels. e.g. subgroup number
 * @property {boolean} isRemark - If this flag is set then the value will be shown when in <b>measurement</b> (input object to charts) contains <b>statuses</b> property with category </b>Remark</b>
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given {@link SingleValueChart.data}</caption>

    data.measurements[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true,
            isRemark: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
 */

/**
 * @typedef {object} yAxisUnit
 * @memberof SingleValueChart
 * @description To specify the yAxis unit related properities.
 * @property {string} [text=""] - To specify the series colors.
 * @property {number} [x=60] - x position of the text.
 * @property {number} [y=null] - y position of the text. 
 * @property {number|string} [fontSize=null] - The font size of the text. If as number will be given then unit will be in pixel. As string in points can be size given e.g. '12pt'
 * @example
 * $('#svc').singleValueChart(
 *      {
 *          locale: "en",
 *          data: {
 *                  specifications: {
 *                              subgroupSize : 2,
 *                              controlChartType : 'xb_s'
 *                              },
 *                  measurements : [], // Array of objects in defined format
 *                  subgroups: [],  // Array of objects in defined format
 *           },
 *           decimalPlaces: 2,
 *           xAxisCustomInfoLabel: true,
 *           hiddenSeries: ["lcl"],
 *           onSeriesClick: function (data) {
 *                      console.log(data);
 *           },
 *           onLegendClick : function (data) {
 *                      console.log(data);
 *           },
 *           yAxisUnit: {
 *                  text: 'DW05Unit01',
 *                  x: 100,
 *                  y: -20,
 *                  fontSize: '20pt'
 *                  }
 *        });
 */

$.fn.singleValueChart = function (options) {
    var settings = {};

    if (options && typeof options === 'object') {   // if not a method call
        setDefaults();

        settings = $.extend({
            chartType: chartTypes.svc,
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: getLocalizedText('svc_chart', options.locale),
            decimalPlaces: 4,
            xAxisTitle: undefined,
            yAxisTitle: undefined,
            height: undefined,
            width: undefined,
            onSeriesClick: undefined,
            yAxisMinValue: undefined,
            yAxisMaxValue: undefined,
            onLegendClick: undefined,
            yAxisUnit: getDefaultyAxisUnitObj(),
            hiddenSeries: []
        }, options, { chartType: chartTypes.svc });
    } else if (typeof options === 'string') { // Method call
        settings = $(this).data('settings') || {};  // restore the settings object from prev settings
    }

    var $this = this,
        _args = arguments,
        chart = {
            init: function () {
                var containerId = $this.attr('id'),
                    input = {
                        series: [], ucl: [], lcl: [],
                        uwl: [], lwl: [], xbp: [],
                        utl: [], ltl: [], data: settings.data, // may be this data can be taken out
                        sortNumbers: [] /*for xAxis labels, as it can be custom based on cutomInfo*/,
                        customInfo: [], sequenceIds: [],//for tooltip
                        flagSeries: []
                    };

                if (settings.data && settings.data.subgroups && settings.data.measurements && settings.data.specifications) {
                    prepareData(input);

                    settings.inputs = input;    // for tooltip etc.

                    var _chart = Highcharts.stockChart(containerId, prepareChartOptions(input));
                    //  chart.xAxis[0].setExtremes(75, 100);	// Initial select last 25 samples
                    $this.data('chartApi', _chart);
                    // $this.data('inputData', input); // to get the series data on method call
                    $this.data('settings', settings);

                } else
                    throw 'Invalid data format exception: Expected data is not in defined format. Please consult developer documentation.';
            },

            /**
             *  @memberof SingleValueChart
             *  @function addMeasurement
             *  @description To add a new point in measurment series.
             *  @param {object|number} newMeasurement - If The value of the point that need to added. Only measurement series will be updated. <br> The corresponding limit will be increase based on their last values.
             *  <br> If the limits need to be update manually then an object should be passed as mentioned in the example below
             *
             *  @example
             *  //To add just a new point in single value chart
             *  $('#SVC').singleValueChart('addMeasurement', 20.09);
             *  // To just add a new measurement value. The limits e.g. control limit etc. will be taken from previous measurement.
             *
             *  // To add new measurement values with limits
             *  $('#SVC').singleValueChart('addMeasurement', {
             *                                          lcl: 10.03,  // lower control limit
             *                                          ucl: 20.09,  // upper control limit
             *                                          lwl: 10.02,  // lower warn limit
             *                                          uwl: 20.05,  // upper warn limit
             *                                          ltl: 19.65,  // lower tolerance limit
             *                                          utl: 19.95,  // upper tolerance limit
             *                                          xbp: 20.001, // process mean value
             *                                          measurement : 20.14  // new measurment value
             *                              });
             *
             */
            addMeasurement: function (newPoint) {
                var inputObject = {};
                if (typeof newPoint === 'number') {
                    inputObject.measurement = newPoint;
                } else if (newPoint && typeof newPoint === 'object') {
                    inputObject = newPoint;
                } else { throw 'The passed value is not a valid number '; }

                addSeriesPoints(inputObject);
            },

            filterSVC: function (filters) {
                var input = $this.data('settings').inputs;
                var measurementssave = $this.data('settings').inputs.data.measurements;
                var filteredMesurements = [];
                var addMeasurement = false;
                if (!filters || filters.length == 0 || filters[0].label == "" || filters[0].value == "") {
                    filteredMesurements = measurementssave;
                }
                else {
                    for (var i = 0; i < measurementssave.length; i++) {
                        addMeasurement = false;
                        if (measurementssave[i].customInfo && measurementssave[i].customInfo.length > 0) {
                            for (var j = 0; j < measurementssave[i].customInfo.length; j++) {
                                if (addMeasurement) break;
                                for (var k = 0; k < filters.length; k++) {
                                    if (addMeasurement) break;

                                    if (measurementssave[i].customInfo[j].label == filters[k].label && measurementssave[i].customInfo[j].value == filters[k].value) {
                                        addMeasurement = true;
                                    }
                                }
                            }

                        }
                        if (addMeasurement) filteredMesurements.push(measurementssave[i]);
                    };
                }

                //input.series.length = 0;
                //input.sortNumbers.length = 0;
                //input.sequenceIds.length = 0;
                //input.ucl.length = 0;
                //input.lcl.length = 0;
                //input.uwl.length = 0;
                //input.lwl.length = 0;
                //input.xbp.length = 0;
                //input.utl.length = 0;
                //input.ltl.length = 0;
                //input.customInfo.length = 0;
                //input.flagSeries.length = 0;



                settings.data.measurements = filteredMesurements;
                var containerId = $this.attr('id'),
                    input = {
                        series: [], ucl: [], lcl: [],
                        uwl: [], lwl: [], xbp: [],
                        utl: [], ltl: [], data: settings.data, // may be this data can be taken out
                        sortNumbers: [] /*for xAxis labels, as it can be custom based on cutomInfo*/,
                        customInfo: [], sequenceIds: [],//for tooltip
                        flagSeries: []
                    };

                if (settings.data && settings.data.subgroups && settings.data.measurements && settings.data.specifications) {
                    siemensTooltip.formatter = displayTooltip; 
                    prepareData(input);

                    settings.inputs = input;    // for tooltip etc.

                    var _chart = Highcharts.stockChart(containerId, prepareChartOptions(input));
                    //  chart.xAxis[0].setExtremes(75, 100);	// Initial select last 25 samples
                    $this.data('chartApi', _chart);
                    // $this.data('inputData', input); // to get the series data on method call
                    $this.data('settings', settings);

                } else
                    throw 'Invalid data format exception: Expected data is not in defined format. Please consult developer documentation.';

                $this.data('chartApi').redraw(); 
                $this.data('settings').inputs.data.measurements = measurementssave;
            },
            
            /**
             * @description This method update the value of a measurement series point. The point can be updated based on provided sequence Id.
             * @memberof SingleValueChart
             * @function updatePoint
             * @param {number} sequenceId - The sequence Id of the point that need to be updated.
             * @param {number} newValue - The new Value of the Point that need to be updated.

             * @example
             * $('#SVC').singleValueChart('updatePoint', 500, 20.09);
             * // This will update the 500th measurment value with 20.09, if 500th measurement is available.
             * // Otherwise no update will be done. On console the corresponding error can be then seen.

            **/
            updatePoint: function (sequenceId, newValue) {
                var __chart = $this.data('chartApi');
                if (__chart) {
                    if (__chart.get(seriesIds.singleValueChart.measurement)) { // only measurement series allowed to update
                        var data = __chart.get(seriesIds.singleValueChart.measurement).data[sequenceId];

                        if (data)
                            data.update(newValue);
                        else
                            console.error('The sequence Id ' + sequenceId + ' is not found');
                    }
                }
            },

            /**
         * @description This method add/update the remark string for statuses <b>Remark</b> in <b>measurement</b> object. Usually <b>Remark</b> object is shown as green diamond shape. 
         * @memberof SingleValueChart
         * @function addRemarks
         * @param {number} sequenceId - The sequence Id of the point where a remark should be added.
         * @param {string} remarks - The new remark text.

         * @example
         * $('#SVC').singleValueChart('addRemarks', 397, 'new remark')
         * // If there is already a remark through customInfo passed, it will be updated. In other case new remark will be added for corresponding sequence id.

        **/
            addRemarks: function (sequenceId, remarks) {
                var customInfo = settings.inputs.customInfo[sequenceId];
                if (customInfo) {
                    if (customInfo.length > 0) {
                        var remarksObj = customInfo.filter(function (k) { return k.isRemark === true; });
                        if (remarksObj.length > 0) {
                            remarksObj[0].value = remarks;
                        }
                        else {
                            customInfo[sequenceId][0].value = remarks;
                            customInfo[sequenceId][0].isRemark = true;
                        }
                    }
                    else {
                        settings.inputs.customInfo[sequenceId].push(
                            {
                                value: remarks,
                                isRemark: true
                            }
                        );
                    }
                }
            }
        };
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2], _args[3], _args[4]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function prepareData(input) {
        $.each(input.data.measurements, function (i, p) {
            var data = input.data,  
            subgrpNum = isSubequalMeasure(data.specifications.controlChartType) ? i : p.subgroupNumber, 
            statuses = p.statuses ? getVoilations(p.statuses) : [],                    
            val = roundFloat(p.measuredValue),
            subgroup = data.subgroups[subgrpNum] || {},
            customInfo = p.customInfo || [], // May be not each subgroup contain customInfo, therefore empty object should be used for corresponding subgroup
            toolChanged_status = getMeasurmentStatuses(p, statusesCategory.toolchanged) || [],
            remark_status = getMeasurmentStatuses(p, statusesCategory.remark) || [],
            attachment_status = getMeasurmentStatuses(p, statusesCategory.attachment) || [],
            ucl = roundFloat(subgroup.upperControlLimit1Abs, null, true),
            lcl = roundFloat(subgroup.lowerControlLimit1Abs, null, true),
            uwl = roundFloat(subgroup.upperWarnLimit1Abs, null, true),
            lwl = roundFloat(subgroup.lowerWarnLimit1Abs, null, true),
            xbp = roundFloat(subgroup.calculatedProcessMeanValue1, null, true),
            utl = roundFloat(subgroup.upperToleranceLimitAbs, null, true),
            ltl = roundFloat(subgroup.lowerToleranceLimitAbs, null, true);
                

            if (statuses.indexOf('processviolation_1') > -1 || statuses.indexOf('processviolation_2') > -1)
                input.series.push({
                    marker: {
                        fillColor: chartSeriesColors.SingleValueChart.Marker,
                        lineWidth: 3,
                        lineColor: chartSeriesColors.SingleValueChart.Marker,
                        symbol: 'triangle'
                    },
                    name: 'violation' + i,
                    y: val,
                    vType: statuses
                });
            else if (statuses.indexOf('outlier') > -1) {
                input.series.push({
                    marker: {
                        fillColor: chartSeriesColors.SingleValueChart.YellowMarker,
                        lineWidth: 3,
                        lineColor: chartSeriesColors.SingleValueChart.YellowMarker,
                        symbol: 'triangle'
                    },
                    name: 'outlier' + i,
                    y: val,
                    vType: statuses
                });
            } else
                input.series.push(val);

            if (settings.xAxisCustomInfoLabel === true) {
                if (customInfo) {
                    input.sortNumbers.push(getCustomxAxisLabel(customInfo));
                } else { input.sortNumbers.push(null); }
            } else
                input.sortNumbers.push(roundFloat(p.sequenceID));

            input.sequenceIds.push(roundFloat(p.sequenceID)); //tooltip

            input.ucl.push(ucl);
            input.lcl.push(lcl);
            input.uwl.push(uwl);
            input.lwl.push(lwl);
            input.xbp.push(xbp);
            input.utl.push(utl);
            input.ltl.push(ltl);
            p.violations = subgroup.statuses;            

            if (toolChanged_status.length > 0) {

                input.flagSeries.push({
                    y: val,
                    x: i,
                    title: svgRepository.ToolChanged,
                    text: getLocalizedText('ToolChanged', settings.locale),
                });
            }
            if (remark_status.length > 0) {
                input.flagSeries.push({
                    y: val,
                    x: i,
                    title: svgRepository.Remark,
                    text: getCustomRemarks(settings, i)
                });
            }
            if (attachment_status.length > 0) {
                input.flagSeries.push({
                    y: val,
                    x: i,
                    title: svgRepository.Attachment,
                    text: getLocalizedText('Attachment', settings.locale),

                });
            }

            input.customInfo.push(customInfo);
        });
    }

    function prepareSeries(input) {
        var ser = [
            {
                id: seriesIds.singleValueChart.ucl,
                name: getLocalizedText('UCL_1', settings.locale), //  Highcharts.uiLocale[settings.locale].UCL_1,
                data: input.ucl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 2,
                showInLegend: shouldDisplaySeries(input.ucl),
                visible: shouldDisplaySeries(input.ucl, seriesIds.singleValueChart.ucl),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.uwl,
                name: getLocalizedText('UWL_1', settings.locale),
                data: input.uwl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 3,
                showInLegend: shouldDisplaySeries(input.uwl),
                visible: shouldDisplaySeries(input.uwl, seriesIds.singleValueChart.uwl),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.utl,
                name: getLocalizedText('UTL_1', settings.locale), //  Highcharts.uiLocale[settings.locale].UTL_1,
                data: input.utl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.ToleranceLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 1,
                showInLegend: shouldDisplaySeries(input.utl),
                visible: shouldDisplaySeries(input.utl, seriesIds.singleValueChart.utl),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.xbp,
                name: getLocalizedText('xbp_1', settings.locale), //  Highcharts.uiLocale[settings.locale].xbp_1,
                data: input.xbp,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.xbp,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 5,
                showInLegend: shouldDisplaySeries(input.xbp),
                visible: shouldDisplaySeries(input.xbp, seriesIds.singleValueChart.xbp),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.measurement,
                name: seriesIds.singleValueChart.measurement,
                data: input.series,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.Measurement,
                showInLegend: false, // to display xAxis series in range selector for highstock chart
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                legendIndex: 4,
                events: {
                    click: onSeriesClick
                },
                zoneAxis: 'x',
                zones: prepareColoredZone()
            },
            {
                id: seriesIds.singleValueChart.lwl,
                name: getLocalizedText('LWL_1', settings.locale), //  Highcharts.uiLocale[settings.locale].LWL_1,
                data: input.lwl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.WarningLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 6,
                showInLegend: shouldDisplaySeries(input.lwl),
                visible: shouldDisplaySeries(input.lwl, seriesIds.singleValueChart.lwl),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.ltl,
                name: getLocalizedText('LTL_1', settings.locale), //  Highcharts.uiLocale[settings.locale].LTL_1,
                data: input.ltl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.ToleranceLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 8,
                showInLegend: shouldDisplaySeries(input.ltl),
                visible: shouldDisplaySeries(input.ltl, seriesIds.singleValueChart.ltl),
                events: {
                    click: onSeriesClick
                }
            },
            {
                id: seriesIds.singleValueChart.lcl,
                name: getLocalizedText('LCL_1', settings.locale), //  Highcharts.uiLocale[settings.locale].LCL_1,
                data: input.lcl,
                yAxis: 0,
                color: chartSeriesColors.SingleValueChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 1.2,
                legendIndex: 7,
                showInLegend: shouldDisplaySeries(input.lcl),
                visible: shouldDisplaySeries(input.lcl, seriesIds.singleValueChart.lcl),
                events: {
                    click: onSeriesClick
                }
            },
            {

                id: seriesIds.singleValueChart.flagSeries,
                name: seriesIds.singleValueChart.flagSeries,
                type: 'flags',
                data: input.flagSeries,
                onSeries: seriesIds.singleValueChart.measurement,
                showInLegend: false,
                useHTML: true,
                dataLabels: {
                    useHTML: true,
                },
                lineWidth: 1,
                lineColor: '#005F87',
                stackDistance: 10

            }
        ];
        return ser;
    }

    /**
     * @description The series click callback event.
     * @memberof SingleValueChart
     * @function onSeriesClick
     * @param {object} data - The object hold the information of clicked point.
     * @param {number} data.sequenceId - The corresponding sequence id of the clicked point.
     * @param {string} data.seriesName - The clicked series name.
     * @param {number} data.point - The clicked point value
     * @param {string} data.seriesId - The id of the clicked series.
     * @example
     * // When a callback is registered with options in single value chart options
     *  $('#svc').singleValueChart(
     *                  {
     *                      locale: "en",
     *                      data: {
     *                          specification: {
    *                                   controlChartType : 'xb'
    *                               },
     *                          measurements : [], // Array of objects in defined format
     *                          subgroups: [],  // Array of objects in defined format
     *                      },
     *                      decimalPlaces: 2,
     *                      hiddenSeries: ["lcl"],
     *                      onSeriesClick: function (data) {
     *                                          console.log(data);
     *                                          //The output will be like this
     *                                          // sequenceId: 484, seriesName: "measurements__1", point: 19.99, seriesId: "measurements__1"
     *                                          }
     *                   }
     *                );
     *

     */
    function onSeriesClick(e) {
        if (typeof settings.onSeriesClick === 'function') { // if callback is defined
            var sequenceId,
                point,
                seriesID,
                seriesName,
                output,
                referenceId;

            if (e && e.point && typeof e.point.x === 'number' && settings.data.measurements[e.point.x]) {
                sequenceId = settings.data.measurements[e.point.x].sequenceID;
                referenceId = settings.data.measurements[e.point.x].referenceID;

                if (e.point.series) {
                    seriesName = e.point.series.name;
                    point = e.point.y;
                    seriesID = e.point.series.options.id;
                }
            } else {
                if (e.point.series && e.point) {
                    seriesName = e.point.series.name;
                    point = e.point.y;
                    seriesID = e.point.series.options.id;
                }
            }
            output = { sequenceId: sequenceId, seriesName: seriesName, point: point, seriesId: seriesID, referenceId: referenceId };
            settings.onSeriesClick(output);
        }
    }

    /**
    * @description The legend click callback event.
    * @memberof SingleValueChart
    * @function onLegendClick
    * @param {Object} data - The object hold the information of clicked legend.
    * @param {string} data.seriesId - The series id of the clicked legend item.
    * @param {boolean} data.isVisible - Flag to represent the state of series that whether series was visible before click event or not.

    * @example
    * // When a callback is registered with options in single value chart options
    *  $('#svc').singleValueChart(
    *                  {
    *                      locale: "en",
    *                      data: {
    *                          specification: {
    *                                   controlChartType : 'xb'
    *                               },
    *                          measurements : [], // Array of objects in defined format
    *                          subgroups: [],  // Array of objects in defined format
    *                      },
    *                      decimalPlaces: 2,
    *                      hiddenSeries: ["lcl"],
    *                      onLegendClick : function (data) {
    *                                          console.log(data);
    *                                            //The output will be like this
    *                                            // seriesId: "lcl", isVisible: false
    *                                       }
    *                  }
    *              );
    *
    */
    function onLegendClick(e) {
        if (typeof settings.onLegendClick === 'function') {
            var seriesID,
                isVisible,
                output;
            seriesID = e.target.userOptions.id;
            isVisible = this.visible;
            output = { seriesId: seriesID, isVisible: isVisible };

            settings.onLegendClick(output);
        }
    }

    function getCustomxAxisLabel(customInfo) {
        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.xAxisLabel === true; });
            if (xAxisObj && xAxisObj.length > 0 && xAxisObj[0].value)
                return xAxisObj[0].value;
        }
        return '';
    }

    function getCustomTooltip(customInfo) {
        var customTooltip = [];

        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.showInTooltip === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.label + ' : ' + o.value);
                });
            }
        }
        return customTooltip.join('<br>');
    }

    function displayTooltip(/*tooltip*/) {// single-value-chart-tooltip
        var msg = [],
            sequenceIds = settings.inputs.sequenceIds ? settings.inputs.sequenceIds : [],
            customInfo = settings.inputs.customInfo || [];

        msg.push('<b>' + getLocalizedText('SVC_xAxisTitle', settings.locale) + ' : ' + sequenceIds[this.point.index] + '</b>');

        if (this.series.name === seriesIds.singleValueChart.measurement)
            msg.push('<b>' + getLocalizedText('SVC_yAxisTitle', settings.locale) + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');
        else
            msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');

        if (settings.inputs.customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(settings.inputs.customInfo[this.point.index]));
        }

        if (this.key.toString().startsWith('violation') || this.key.toString().startsWith('outlier')) {
            if (this.point && this.point.vType) {
                msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
                $.each(this.point.vType, function (i, violation) {
                    if (violation !== 'processviolation_2' && violation !== 'processviolation_1' && violation !== 'remark') {
                        msg.push(getLocalizedText(violation, settings.locale));
                    }
                });
            }
        } else if (this.series.name === seriesIds.singleValueChart.flagSeries && this.point) {
            // msg = [this.point.text]; // just show annotation
            msg = [];
            msg.push(getCustomRemarks(settings,this.point.x));
            // else return tooltip.defaultFormatter.call(this, tooltip);
        }
        if (this.point.text) // for flags type series, only it should be shown
            return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + this.point.text + "</span></div>";


        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";
    }

    function shouldDisplaySeries(series, hiddenSeriesId) {
        var notNullSeries = [];
        if (series && series.filter) {
            notNullSeries = series.filter(function (k) {
                if (k !== null && k !== undefined)
                    return k.toString();
            });
        }

        var nonullableSeries = notNullSeries.length > 0;
        var isVisibleSeries = !(settings.hiddenSeries.indexOf(hiddenSeriesId) > -1);

        return nonullableSeries && isVisibleSeries;
    }

    function setDefaults() {
        if (typeof options === 'object') {
            options.chartType = chartTypes.svc; // cannot be changed.
            siemensTooltip.formatter = displayTooltip;
            if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                console.error('Locale ' + options.locale + ' not found, default English locales will be used');
                options.locale = 'en';
            }
            if (typeof options.yAxisUnit !== 'object') options.yAxisUnit = getDefaultyAxisUnitObj();
            else options.yAxisUnit = $.extend(getDefaultyAxisUnitObj(), options.yAxisUnit);

        }
    }

    function addSeriesPoints(input) {
        var chart = $this.data('chartApi'),
            // $this.data('settings', settings)
            inputs = $this.data('settings').inputs, // $this.data('inputData'),
            lcl = typeof input.lcl === 'number' ? input.lcl : inputs.lcl[inputs.lcl.length - 1] || null,
            ucl = typeof input.ucl === 'number' ? input.ucl : inputs.ucl[inputs.ucl.length - 1] || null,
            lwl = typeof input.lwl === 'number' ? input.lwl : inputs.lwl[inputs.lwl.length - 1] || null,
            uwl = typeof input.uwl === 'number' ? input.uwl : inputs.uwl[inputs.uwl.length - 1] || null,
            ltl = typeof input.ltl === 'number' ? input.ltl : inputs.ltl[inputs.ltl.length - 1] || null,
            utl = typeof input.utl === 'number' ? input.utl : inputs.utl[inputs.utl.length - 1] || null,
            xbp = typeof input.xbp === 'number' ? input.xbp : inputs.xbp[inputs.xbp.length - 1] || null,
            measurement = input.measurement,
            subgrpNum = inputs.sortNumbers.length > 0 ? inputs.sortNumbers[inputs.sortNumbers.length - 1] + 1 : 0;            

        if (typeof measurement !== 'number') throw 'The measurement value is not a valid number';
              
        
        if (chart && input) {
            chart.get(seriesIds.singleValueChart.measurement).addPoint(measurement, false); // true will redraw

            if (!getSeries(seriesIds.singleValueChart.lcl).visible && typeof lcl === 'number') {
                chart.get(seriesIds.singleValueChart.lcl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }

            chart.get(seriesIds.singleValueChart.lcl).addPoint(lcl, false); // data should always be add irrespect of null of not

            if (!getSeries(seriesIds.singleValueChart.ucl).visible && typeof ucl === 'number') {
                chart.get(seriesIds.singleValueChart.ucl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.ucl).addPoint(ucl, false);

            if (!getSeries(seriesIds.singleValueChart.lwl).visible && typeof lwl === 'number') {
                chart.get(seriesIds.singleValueChart.lwl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.lwl).addPoint(lwl, false);

            if (!getSeries(seriesIds.singleValueChart.uwl).visible && typeof uwl === 'number') {
                chart.get(seriesIds.singleValueChart.uwl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.uwl).addPoint(uwl, false);

            if (!getSeries(seriesIds.singleValueChart.ltl).visible && typeof ltl === 'number') {
                chart.get(seriesIds.singleValueChart.ltl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.ltl).addPoint(ltl, false);

            if (!getSeries(seriesIds.singleValueChart.utl).visible && typeof utl === 'number') {
                chart.get(seriesIds.singleValueChart.utl).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.utl).addPoint(utl, false);

            if (!getSeries(seriesIds.singleValueChart.xbp).visible && typeof xbp === 'number') {
                chart.get(seriesIds.singleValueChart.xbp).update(
                    {
                        visible: true,
                        showInLegend: true
                    }, false);
            }
            chart.get(seriesIds.singleValueChart.xbp).addPoint(xbp, false);

            inputs.sortNumbers.push(subgrpNum);
            inputs.sequenceIds.push(subgrpNum);

            chart.redraw();
            
        }
    }

    function isSubequalMeasure(charttype) {
        var charttypes = ['x_ms', 'x_mr', 'mx_ms', 'mx_mr'];
        if (charttypes.indexOf(charttype) > -1)
            return true;
        return false;
    }

    function prepareYAxis() {
        var unit = settings.yAxisUnit && isNullOrUndefined(settings.yAxisUnit.text) ? '' : settings.yAxisUnit.text;
        var yAxis =
            [
                {
                    // tickInterval: 0.008,                    
                    lineColor: siemensColors.PL_BLACK_22,
                    lineWidth: 2,
                    min: settings.yAxisMinValue,
                    max: settings.yAxisMaxValue,
                    opposite: false,
                    labels: {
                        formatter: function () {
                            return roundFloat(this.value, settings.decimalPlaces);  // parseFloat(this.value).toFixed(settings.decimalPlaces)
                        },
                        style: axiesStyle
                    },
                    title: {
                        text: settings.yAxisTitle || getLocalizedText('SVC_yAxisTitle', settings.locale), // Highcharts.uiLocale[settings.locale].SVC_yAxisTitle,
                        style: axiesTitleStyle
                    }
                },
                {// to show units of chart
                    opposite: false,
                    title: {
                        reserveSpace: false,
                        text: unit,
                        align: 'high',
                        rotation: 0,
                        x: settings.yAxisUnit.x,
                        y: settings.yAxisUnit.y,
                        style: {
                            fontSize: settings.yAxisUnit.fontSize,
                            color: siemensColors.PLBlack4
                        }
                    }
                }

            ];

        return yAxis;
    }

    function prepareChartOptions(input) {
        var options =
        {
            chart: {
                type: 'line',
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    },
                    events: {
                        legendItemClick: onLegendClick
                    }
                }
                //,
                //line: {
                //    events: {
                //        legendItemClick: onLegendClick
                //    }
                //}
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            navigator: {
                baseSeries: 4,
                enabled: true, // to show or hide zoom level on x-axis
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                        // enabled: true
                    }
                },
                series: {
                    lineColor: chartSeriesColors.SingleValueChart.Measurement
                }
            },
            rangeSelector: {
                enabled: false
                // selected: 5  // date, month year etc
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                gridLineColor: siemensColors.PL_BLACK_22,
                // categories: input.sortNumbers,
                title: {
                    text: settings.xAxisTitle || getLocalizedText('SVC_xAxisTitle', settings.locale), // Highcharts.uiLocale[settings.locale].SVC_xAxisTitle,
                    style: axiesTitleStyle
                },
                labels: {
                    rotation: -90, // settings.xAxisLabelsRotation,
                    formatter: function () {
                        return input.sortNumbers[this.value];
                    },
                    style: axiesStyle
                },
                range: 25 // select last 25 samples                
            },
            yAxis: prepareYAxis(),
            series: prepareSeries(input)
        };

        return options;
    }

    function prepareColoredZone() {
        var zone = [];
        var violationZones = [];
        var interval;

        if (settings.data && settings.data.measurements) {
            var violatedSubgroupsNumber = [];

            $.each(settings.data.measurements, function (i, p) {
                var // subgroupSize = settings.data.specifications.subgroupSize > 0 ? settings.data.specifications.subgroupSize : 1,
                    subgrpNum = isSubequalMeasure(settings.data.specifications.controlChartType) ? i : p.subgroupNumber, //  parseInt(i / subgroupSize), 
                    statuses = settings.data.subgroups && settings.data.subgroups[subgrpNum] && settings.data.subgroups[subgrpNum].statuses ? getVoilations(settings.data.subgroups[subgrpNum].statuses) : [];
                if (statuses.indexOf("involvedbyother") > -1) {
                    violatedSubgroupsNumber.push(roundFloat(p.sequenceID));
                }

            });

        }
        interval = getSequence(violatedSubgroupsNumber)
        violationZones = getColoredSeriesZone(interval, siemensColors.violationZone);
        violationZones.forEach(function (violationZone) {
            zone.push(violationZone);

        });
        return zone;


    }

    function getDefaultyAxisUnitObj() {
        var obj = {
            text: '',
            x: 60,
            y: undefined,
            fontSize: undefined
        };
        return obj;
    }

    function getMeasurmentStatuses(measurement, status) {
        var statuses = [];
        if (measurement && measurement.statuses && measurement.statuses.filter) {
            statuses = measurement.statuses.filter(function (s) {
                if (s.category && s.category.toLowerCase() === status) {
                    return true;
                }
            });
        }

        return statuses;
    }

    function getCustomRemarks(settings, index) {
        var customTooltip = [];
        var customInfo = undefined;
        if (settings.data && settings.data.measurements && settings.data.measurements[index]) {
            customInfo = settings.data.measurements[index].customInfo;
        }

        if (customInfo) {
            var xAxisObj = customInfo.filter(function (k) { return k.isRemark === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.value);
                });
            }
        }

        return getLocalizedText('annotation', settings.locale) + ' : ' + customTooltip.join(', ');
    } 

    function getSeries(seriesId) {
        var chart = $this.data('chartApi')
        if (seriesId && chart && chart.get(seriesId)) {
            return chart.get(seriesId);
        }
        return {};
    }
};
/**
 * @description Provide methods for drawing Probability Plot.
 *
 * @namespace ProbabilityPlot
 * */
/**
 * @description A new Probability Plot  can be drawn using this method.
 * @memberof ProbabilityPlot
 * @function probabilityPlot
 * @requires highstock.js
 * @requires jQuery.js
 * @param {ProbabilityPlot.options} options - The chart options parameter
 * @tutorial CreatepNetlCharts
 * @example
 * $('#pnet').probabilityPlot({
 *                  locale: 'en',
 *                  data: data,
 *                  decimalPlaces: 4,
 *                  height: 600,
 *                  width: undefined
 *                  });
 */

/**
* @memberof ProbabilityPlot
* @typedef {Object} options
* @property {string}  [locale=en]  User locale to display label and violations in a specific language
* @property {ProbabilityPlot.data} data  JSON Array with subgroup
* @property {number} [decimalPlaces=4] - Number of decimal places
* @property {number}  [height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
*                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
* @property {number}  [width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
* @property {ProbabilityPlot.yAxisUnit} [yAxisUnit] - The unit of y Axis.
* @property {string} [xAxisTitle='Measurement'] - The label for x-Axis.
* @property {string} [yAxisTitle=' '] - The label for y-Axis.
*/


/**
 * @description The data array of the Probability plot
 * @typedef {object} data
 * @memberof ProbabilityPlot
 * @example
 *
 *  data : {
 *          measurements : [
 *                          {value: -1, yCoordinate: 16.27632592097139},
 *                          {value: -1, yCoordinate: 20.15157013521245}
 *                         ],
 *          yAxis :     [
 *                          {value: 3.510946297538803, name: "0,01"},
 *                          {value: 20.91518334301292, name: "1"}
 *                      ],
 *          xMinValue: -2,
 *          xMaxValue: 1,
 *          resultLineY1: 0,
 *          resultLineY2: 100,
 *          resultLineX1: -1.5946437246673486,
 *          resultLineX2: 0.7927497249172357,
 *          xAxisIsLogarithmic: true,
 *          correlationCoefficient: 0.9826515831649699,
 *          gradient: 41.88668609164542,
 *          intercept: 66.79434112315349,
 *          showProbabilityPlotTolerances: true,
 *          showProbabilityPlotSLines: true,
 *          currentUpperToleranceLimitAbs: 0.6989700043360189,
 *          currentLowerToleranceLimitAbs: 0.654353443360189,
 *          p99: 0.4944192130104312,
 *          p0_13: -1.2963132127854518,
 *   }
 */

/**
 * @typedef {object} yAxisUnit
 * @memberof ProbabilityPlot
 * @description To specify the series yAxis unit related properities.
 * @property {string} [text=""] - To specify the series colors.
 * @property {number} [x=60] - x position of the text.
 * @property {number} [y=-6] - y position of the text.
 * @property {number|string} [fontSize=null] - The font size of the text. If as number will be given then unit will be in pixel. As string in points can be size given e.g. '12pt'
 * @example
 * $('#pnet').probabilityPlot({
 *                          locale: 'en',
 *                          data: data,
 *                          decimalPlaces: 4,
 *                          height: 600,
 *                          width: undefined,
 *                          yAxisUnit: {
 *                              text: 'DW05Unit01',
 *                              x: 100,
 *                              y: -20,
 *                              fontSize: '20pt'
 *                          }
 *              }); 
 */ 

$.fn.probabilityPlot = function (options) {
    setDefaults();

    var settings = $.extend({
        locale: 'en',
        data: {},
        decimalPlaces: 4,
        height: undefined,
        width: undefined,
        yAxisUnit: getDefaultyAxisUnitObj(),
        xAxisTitle: getLocalizedText("pNet_xAxisTitle", options.locale),
        yAxisTitle : ' '
    }, options);
    var $this = this,
        _args = arguments,
        chartOption = createChartOptions(settings),
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                //var _chart =
                Highcharts.chart(containerId, chartOption);
            }
        };
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        // siemensTooltip.formatter = displayTooltip;
        var dataObj = PrepareData();
        var optionValues = {
            chart: {
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            title: {
                text: getLocalizedText('pNet_chart', options.locale),
                align: 'center',
                style: titleStyle
            },
            credits: {
                enabled: false
            },
            tooltip: siemensTooltip,
            yAxis: prepareYAxis(dataObj),
            xAxis: {
                title: {
                    text: settings.xAxisTitle // getLocalizedText("pNet_xAxisTitle", settings.locale)
                },
                plotLines: dataObj.yPlotLines,
                //tickPositions: dataObj.xcat.map((v) => Math.log10(v)),
                max: dataObj.xMaxValue,
                min: dataObj.xMinValue,
                labels: {
                    formatter: function () {
                        if (settings.data.result.probabilityPlot.xAxisIsLogarithmic) {
                            return roundFloat(Math.pow(10, this.value), settings.decimalPlaces);
                        }

                        else
                            return this.value;
                    }
                },
                tickWidth: 1,
                gridLineColor: siemensColors.PL_BLACK_22,
                gridLineWidth: 1
            },
            series: [{
                type: 'scatter',
                id: 'Measurements',
                name: 'Measurements',
                data: dataObj.xSeries,
                yAxis: 0,
                color: chartSeriesColors.ProbabilityPlot.mainSeries,
                marker: {
                    enabled: true,
                    radius: 2
                },
                visible: true,
                showInLegend: false
            },
            {
                type: 'line',
                data: dataObj.slope,
                yAxis: 0,
                color: chartSeriesColors.ProbabilityPlot.slope,
                marker: {
                    enabled: true,
                    radius: 0
                },
                visible: true,
                showInLegend: false,
                enableMouseTracking: false
            }
            ]
        };
        return optionValues;
    }
    function createxPlotLineObject(value, color, lableTxt, xLabel) {
        if (!lableTxt)
            lableTxt = '';
        else
            lableTxt = '-' + lableTxt;

        var label = {
            'text': lableTxt,
            'align': 'left',
            'x': -35,
            'y': 0,
            'style': {
                'fontSize': '10px',
                'color': 'black'
            }
        };
        return {
            'value': value,
            'width': 2,
            'color': color,
            'x': 0,
            'y': 0,
            'label': label
        };
    }
    function createyPlotLineObject(value, color, text, yLabel, dashStyle, rotation, zIndex) {
        var label;
        label = {
            'text': text,
            'rotation': rotation || 0,
            'align': 'center',
            'x': 0,
            'y': yLabel,
            'style': {
                'fontSize': '10px',
                'color': color
            }
        };
        return {
            'value': value,
            'width': 2,
            'color': color,
            'label': label,
            'zIndex': zIndex || 4,
            dashStyle: dashStyle
        };
    }
    function PrepareData() {
        var rowdata = [],
            xPlotLines = [],
            yPlotLines = [],
            xSeries = [],
            xcat = [],
            currentLowerToleranceLimitAbs,
            currentUpperToleranceLimitAbs,
            p0_13,
            p99,
            xMaxValue,
            xMinValue,
            confidenceInterval,
            confidenceIntervalString,
            resultLineX1,
            resultLineY1,
            resultLineX2,
            resultLineY2;
        if (settings.data && settings.data.result && settings.data.result.probabilityPlot && settings.data.result.probabilityPlot.yAxis) {
            $.each(settings.data.result.probabilityPlot.yAxis, function (i, item) {
                var value = roundFloat(item.value); //  parseFloat(item.value.toFixed(settings.decimalPlaces));
                var text = (item.name || '0') + ' %';
                xPlotLines.push(createxPlotLineObject(value, siemensColors.PL_BLACK_22, text, undefined));
                rowdata.push(value);
            });
        }
        if (settings.data && settings.data.result && settings.data.result.probabilityPlot && settings.data.result.probabilityPlot.measurements) {
            $.each(settings.data.result.probabilityPlot.measurements, function (index, item) {
                var yValue = roundFloat(item.yCoordinate);
                var value = roundFloat(item.value);
                var xValue = roundFloat(item.xCoordinate);
                xSeries.push([value, yValue]);
                xcat.push(xValue);
            });
        }
        if (settings.data && settings.data.result && settings.data.result.probabilityPlot) {
            currentLowerToleranceLimitAbs = roundFloat(settings.data.result.probabilityPlot.currentLowerToleranceLimitAbs);
            currentUpperToleranceLimitAbs = roundFloat(settings.data.result.probabilityPlot.currentUpperToleranceLimitAbs);
            p0_13 = roundFloat(settings.data.result.probabilityPlot.p0_13);
            p99 = roundFloat(settings.data.result.probabilityPlot.p99);
            confidenceInterval = roundFloat(settings.data.specifications.confidenceInterval || null);
            confidenceIntervalString = confidenceInterval == null ? '' : confidenceInterval.toString() + getLocalizedText('HIST_Confidance_Interval', settings.locale);
            xMaxValue = settings.data.result.probabilityPlot.xMaxValue;
            xMinValue = settings.data.result.probabilityPlot.xMinValue;
            resultLineX1 = roundFloat(settings.data.result.probabilityPlot.resultLineX1);
            resultLineY1 = roundFloat(settings.data.result.probabilityPlot.resultLineY1);
            resultLineX2 = roundFloat(settings.data.result.probabilityPlot.resultLineX2);
            resultLineY2 = roundFloat(settings.data.result.probabilityPlot.resultLineY2);

            yPlotLines.push(createyPlotLineObject(currentLowerToleranceLimitAbs, chartSeriesColors.ProbabilityPlot.ToleranceLimit, getLocalizedText('Hist_currentLowerToleranceLimitAbs', settings.locale), -10, 'Solid'));
            yPlotLines.push(createyPlotLineObject(currentUpperToleranceLimitAbs, chartSeriesColors.ProbabilityPlot.ToleranceLimit, getLocalizedText('Hist_currentUpperToleranceLimitAbs', settings.locale), -10, 'Solid'));
            yPlotLines.push(createyPlotLineObject(p0_13, chartSeriesColors.ProbabilityPlot.StandardDeviation, '-' + confidenceIntervalString), 15, 'Solid');
            yPlotLines.push(createyPlotLineObject(p99, chartSeriesColors.ProbabilityPlot.StandardDeviation, '+' + confidenceIntervalString), 15, 'Solid');
            xPlotLines.push(createxPlotLineObject(100, siemensColors.PL_BLACK_22));
        }
        var maxPlotLinePoint = Math.max(currentLowerToleranceLimitAbs, currentUpperToleranceLimitAbs, p0_13, p99, xMaxValue);
        var minPlotLinePoint = Math.min(currentLowerToleranceLimitAbs, currentUpperToleranceLimitAbs, p0_13, p99, xMinValue);
        var dataObj =
        {
            min: Math.min.apply(Math, rowdata),
            max: Math.max.apply(Math, rowdata),
            xPlotLines: xPlotLines,
            seriesdata: rowdata,
            xSeries: xSeries,
            xcat: xcat,
            xMinValue: minPlotLinePoint,
            xMaxValue: maxPlotLinePoint,
            slope: [[resultLineX1, resultLineY1], [resultLineX2, resultLineY2]],
            yPlotLines: yPlotLines
        };

        return dataObj;
    }
    function displayTooltip(/*tooltip*/) {
        var key = this.key;
        if (settings.data && settings.data.result.probabilityPlot && settings.data.result.probabilityPlot.measurements) {
            var msg = "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + this.series.name + ": </span><span style='font-size:9pt;font-weight:400'>" + this.y + "</span></div>";
            var MeasureObj = settings.data.result.probabilityPlot.measurements.filter(function (obj) {
                return obj.value === key
            });
            if (MeasureObj[0]) {
                var msg = "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + this.series.name + ": </span><span style='font-size:9pt;font-weight:400'>" + MeasureObj[0].xCoordinate + "</span></div>";
            }
        }
        return msg;
        //if (settings.data.result.probabilityPlot.xAxisIsLogarithmic)
        //    var msg = "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + this.series.name + ": </span><span style='font-size:9pt;font-weight:400'>" + Math.round(Math.pow(10, this.key) * 10) / 10 + "</span></div>";
        //else
        //    var msg = "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + this.series.name + ": </span><span style='font-size:9pt;font-weight:400'>" +  this.key + "</span></div>";

        //return msg;
    }
    function setDefaults() {
        if (typeof options === 'object') {
            siemensTooltip.formatter = displayTooltip;
            if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                console.error('Locale ' + options.locale + ' not found, default English locales will be used');
                options.locale = 'en';
            }

            if (typeof options.yAxisUnit !== 'object') options.yAxisUnit = getDefaultyAxisUnitObj();
            else options.yAxisUnit = $.extend(getDefaultyAxisUnitObj(), options.yAxisUnit);
        }
    }
    function prepareYAxis(dataObj) {
        var unit = settings.yAxisUnit && isNullOrUndefined(settings.yAxisUnit.text) ? '' : settings.yAxisUnit.text;
        var yAxis =
            [
                {
                    lineColor: siemensColors.PL_BLACK_22,
                    lineWidth: 2,
                    tickAmount: 2,
                    labels: {
                        enabled: false,
                        style: axiesStyle
                    },
                    endOnTick: true,
                    gridLineWidth: 0,
                    minorGridLineWidth: 0,
                    plotLines: dataObj.xPlotLines,
                    title: {
                        text: settings.yAxisTitle,
                        margin: 60
                    },
                    margin: 15,
                    max: 99
                },
                {// to show units of chart
                    opposite: false,
                    title: {
                        reserveSpace: false,
                        text: unit,
                        align: 'high',
                        rotation: 0,
                        x: settings.yAxisUnit.x,
                        y: settings.yAxisUnit.y,
                        style: {
                            fontSize: settings.yAxisUnit.fontSize,
                            color: siemensColors.PLBlack4
                        }
                    }
                }
            ];

        return yAxis;
    }
    function getDefaultyAxisUnitObj() {
        var obj = {
            text: '',
            x: 60,
            y: -6,
            fontSize: undefined
        };
        return obj;
    }
};
/**
 * @description Provide methods for drawing control chart .
 *
 * @namespace AttributiveControlChart
* */
/**
 * @description A new Attributive Control Chart can be drawn using this method.
 * @memberof AttributiveControlChart
 * @function attrControlChart
 * @requires highstock.js
 * @requires jQuery.js
 * @tutorial CreateAttrControlCharts
 * @param {AttributiveControlChart.options} options - The chart options parameter
 * @example
 * $('#CchartC').attrControlChart({
 *                   locale: 'en',
 *                   data: data,
 *                   chartTitle: 'Attributive Control Chart',
 *                   xAxisTitle: 'Custom Sort Number',
 *                   decimalPlaces: 3,
 *                   yAxisTitle: 'Number of Def',
 *                   seriesName: 'xbp',
 *                   height: '60%',
 *                  xAxisLabel: 'customInfo',
 *               });
 */

/**
 * @memberof AttributiveControlChart
 * @typedef {object} options
 * @property {string}  [locale=en]  User locale to display label and violations in a specific language
 * @property {AttributiveControlChart.data} data  JSON Array with subgroup in a defined format {@link AttributiveControlChart.data}
 * @property {boolean}  [xAxisCustomInfoLabel=false] - If true, the default subgroup number label for xAxis will be overriden by the property of customInfo object, where xAxisLabel is true. For more information  please refer {@link AttributiveControlChart.customInfo}
 * @property {string} chartTitle - The Chart title
 * @property {number}  [decimalPlaces=4] - The data of chart will be round based on number of decimal places.
 * @property {number}  [height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @property {number}  [width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @property {number} yAxisMinValue- a number specifies the min Value of the yAxis
 * @property {number} xAxisMinValue- a number specifies the max Value of the xAxis
 * @property {boolean} [showDefectCollectionCard=false] if true, and the response Object has a defect catalogue, a Defect collection Table will be shown at the top of the chart
 * @property {string} [xAxisTitle='Sort number'] - The label for x-Axis.
 * @property {string} [yAxisTitle='Defective Parts|Non Conformance Rate'] - The label for y-Axis. 
 */
/**
 * @description The series data format for Attributive Control Chart.
 * @typedef {Object} data
 * @memberof AttributiveControlChart
 * @example
*{
*	"subgroups": [
*		{
*			"subgroupNumber": 1,
*			"statuses": null,
*			"numberOfDefects": 0,
*			"nonConformanceRate": 0.0,
*			"subgroupSize": 20,
*			"upperControlLimitAbs": 5.690521271225974,
*			"lowerControlLimitAbs": 0.0,
*			"processMeanValue": 1.736842105263158,
*			"defects": null,
*			"numberOfMajorDefects": null,
*			"numberOfCriticalDefects": null,
*			"numberOfMinorDefects": null
*		},
*		{
*			"subgroupNumber": 6,
*			"statuses": [
*				{
*					"category": "ucL_1",
*					"viewedPoints": null,
*					"points": null,
*					"lowerPercentage": null,
*					"upperPercentage": null
*				},
*				{
*					"category": "processViolation_1",
*					"viewedPoints": null,
*					"points": null,
*					"lowerPercentage": null,
*					"upperPercentage": null
*				},
*				{
*					"category": "aboveZone",
*					"viewedPoints": null,
*					"points": null,
*					"lowerPercentage": null,
*					"upperPercentage": null
*				}
*			],
*			"numberOfDefects": 8,
*			"nonConformanceRate": 0.4,
*			"subgroupSize": 20,
*			"upperControlLimitAbs": 5.690521271225974,
*			"lowerControlLimitAbs": 0.0,
*			"processMeanValue": 1.736842105263158,
*			"defects": null,
*			"numberOfMajorDefects": null,
*			"numberOfCriticalDefects": null,
*			"numberOfMinorDefects": null
*		}
*	],
*	"result": {
*		"calculatedXbb": 1.736842105263158
*	},
*	"specifications": {
*		"controlChartType": "c"
*	}
*}
*/
/**
 * @description An array of objects with following properties can be injected against each subgroup.
 * @typedef {object} customInfo
 * @memberof AttributiveControlChart
 * @property {string} label - The label to be display in tool-tip.
 * @property {string} value - The value to be used to show in tool-tip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be shown in tool-tip for a particular subgroup as 'label: value'
 * @property {boolean} xAxisLabel - If true then value of will be shown on xAxis labels instead of default labels. e.g. subgroup number
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given {@link AttributiveControlChart.DataFormat}</caption>

    data.subgroups[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
 */

$.fn.attrControlChart = function (options) {
    var settings = {};
    if (options && typeof options === 'object') {
        setDefault();
        settings = $.extend({
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: '',
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            yAxisMinValue: undefined,
            yAxisMaxValue: undefined,
            xAxisCustomInfoLabel: false,
            showDefectCollectionCard: false,
            xAxisTitle: getLocalizedText('SVC_xAxisTitle', settings.locale),
            yAxisTitle: getSeriesTitle()
        }, options);
    } else if (!options)
        throw 'Not valid options or parameter to the "chart" widget passed';
    var $this = this,
        _args = arguments,
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                Highcharts.stockChart(containerId, chartOption);
                drawDefectTable(containerId);
            }
        },
        attrChartTYpe = parseAttrChartType(settings.data.specifications.controlChartType),
        chartOption = createChartOptions(settings);
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        if (!settings.data || !settings.data.subgroups)
            throw 'Invalid data format exception: Series data is not in defined format';
        var series = {
            NonConformanceRate: [],
            DefectiveParts: [],
            UCLAbs: [],
            processMeanValue: [],
            flagSeries: [],
            customInfo: [],
            LCLAbs: [],
            sortNumbers: [],
            localMeanValue: []
        };
        settings.inputs = series;
        prepareData(settings.data, series);
        var optionValues = {
            chart: {
                type: 'line',
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    }
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            navigator: {
                baseSeries: 1,
                enabled: true,
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                series: {
                    lineColor: chartSeriesColors.SingleValueChart.Measurement
                }
            },
            rangeSelector: {
                enabled: false
                // selected: 5  // date, month year etc
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                gridLineColor: siemensColors.PL_BLACK_22,
                title: {
                    text: settings.xAxisTitle, //  getLocalizedText('SVC_xAxisTitle', settings.locale), 
                    style: axiesTitleStyle
                },
                labels: {
                    rotation: -90,
                    formatter: function () {
                        return series.sortNumbers[this.value];
                    },
                    style: axiesStyle
                },
                range: 25,
                categories: series.sortNumbers,
                tickInterval: 1,
                tickPixelInterval: 15,
                gridLineWidth: 1
            },
            yAxis: [{
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                min: settings.yAxisMinValue,
                max: settings.yAxisMaxValue,
                opposite: false,
                labels: {
                    formatter: function () {
                        return roundFloat(this.value, settings.decimalPlaces); // parseFloat(this.value).toFixed(settings.decimalPlaces);
                    },
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisTitle, //  getSeriesTitle(),
                    style: axiesTitleStyle,
                    margin: 60
                }
            }
            ],
            series: prepareSeries(series)
        };
        return optionValues;
    }

    function prepareData(data, series) {
        $.each(data.subgroups, function (index, item) {
            var customInfo = item.customInfo || [],
                nonConformanceRate,
                numberOfDefects,
                subgroupNumber,
                upperControlLimitAbs,
                lowerControlLimitAbs,
                processMeanValue,
                calculatedXbb;

            // fill the variable with data
            nonConformanceRate = roundFloat(item.nonConformanceRate);
            numberOfDefects = roundFloat(item.numberOfDefects);
            subgroupNumber = roundFloat(item.subgroupNumber);
            upperControlLimitAbs = roundFloat(item.upperControlLimitAbs);
            lowerControlLimitAbs = roundFloat(item.lowerControlLimitAbs);
            processMeanValue = roundFloat(item.processMeanValue);
            if (data.result)
                calculatedXbb = roundFloat(data.result.calculatedXbb);
            // fill xAxis Labels & check for custom Info
            if (settings.xAxisCustomInfoLabel === true) {    // for xAxis
                if (customInfo.length > 0)
                    series.sortNumbers.push(getCustomxAxisLabel(customInfo));
                else
                    series.sortNumbers.push(null); // show empty, if no corresponding customInfo is given
            } else
                series.sortNumbers.push(subgroupNumber);
            //Fill Seties
            series.customInfo.push(customInfo);
            series.UCLAbs.push(upperControlLimitAbs);
            series.LCLAbs.push(lowerControlLimitAbs);
            series.processMeanValue.push(processMeanValue);
            series.localMeanValue.push(calculatedXbb);

            var countChartViolations = data.specifications.calculateCUCountChart;

            var statuses = item.statuses;
            var newstatuses = [];
            if (statuses && statuses.length > 0) {
                for (var i = 0; i < statuses.length; i++)
                    newstatuses.push(strToLowerCase(statuses[i].category)); //TODO: should be case insensitive

                if (newstatuses.indexOf("processviolation_1") > -1 && countChartViolations === false) {
                    series.NonConformanceRate.push({
                        marker: {
                            fillColor: chartSeriesColors.AttrControlChart.Marker,
                            lineWidth: 3,
                            lineColor: chartSeriesColors.ControlChart.Marker,
                            symbol: 'triangle'
                        },
                        name: 'violation' + index,
                        y: nonConformanceRate,
                        vType: newstatuses
                    });

                    series.DefectiveParts.push({
                        marker: {
                            fillColor: chartSeriesColors.AttrControlChart.Marker,
                            lineWidth: 3,
                            lineColor: chartSeriesColors.ControlChart.Marker,
                            symbol: 'triangle'
                        },
                        name: 'violation' + index,
                        y: numberOfDefects,
                        vType: newstatuses
                    });
                } else {
                    series.NonConformanceRate.push(nonConformanceRate);
                    series.DefectiveParts.push(numberOfDefects);
                }

                if (newstatuses.indexOf("eliminated") > -1) {
                    switch (attrChartTYpe) {
                        case attrChartTypes.C:
                        case attrChartTypes.np:
                            series.flagSeries.push({
                                y: numberOfDefects,
                                x: index,
                                title: 'X',
                                text: getLocalizedText('eliminated', settings.locale)
                            });
                            break;
                        case attrChartTypes.p:
                        case attrChartTypes.U:
                            series.flagSeries.push({
                                y: nonConformanceRate,
                                x: index,
                                title: 'X',
                                text: getLocalizedText('eliminated', settings.locale)
                            });
                            break;
                    }
                }
            } else {
                series.NonConformanceRate.push(nonConformanceRate);
                series.DefectiveParts.push(numberOfDefects);
            }
        });
    }

    function prepareSeries(series) {
        var mainSeriesdata,
            mainSeriesName;
        switch (attrChartTYpe) {
            case attrChartTypes.C:
            case attrChartTypes.np:
                mainSeriesName = getLocalizedText('DefectiveParts', settings.locale);
                mainSeriesdata = series.DefectiveParts;
                break;
            case attrChartTypes.p:
            case attrChartTypes.U:
                mainSeriesName = getLocalizedText('NonConformanceRate', settings.locale);
                mainSeriesdata = series.NonConformanceRate;
        }
        var ser = [
            {
                id: 'UCLAbs',
                name: getLocalizedText('UCL_1', settings.locale),
                data: series.UCLAbs,
                yAxis: 0,
                color: chartSeriesColors.AttrControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 2,
                legendIndex: 1,
                showInLegend: shouldDisplaySeries(series.UCLAbs)
            },
            {
                id: 'main',
                name: mainSeriesName,
                data: mainSeriesdata,
                yAxis: 0,
                color: chartSeriesColors.AttrControlChart.main,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    radius: 4
                },
                events: {
                    click: function (e) {
                        if (!$('#defectTableContainer').length)
                            return;

                        var subgroupNumber = 0;
                        if (e && e.point)
                            subgroupNumber = e.point.index + 1;

                        var offset = $('#' + subgroupNumber).position().left;
                        offset = offset > 100 ? offset - 100 : offset;
                        $('#defectTableContainer').animate({
                            scrollLeft: offset - 100
                        }, 'slow');
                        $('.subGroup').css('border-style', 'none');
                        $('.' + subgroupNumber).css('border-left', '1px solid red');
                        $('.' + subgroupNumber).css('border-right', '1px solid red');
                        $('.' + subgroupNumber).css('border-left', '1px solid red');
                        $('#' + subgroupNumber).css('border-right', '1px solid red');
                        $('#' + subgroupNumber).css('border-left', '1px solid red');
                        $('#' + subgroupNumber).css('border-top', '1px solid red');
                        $('.' + subgroupNumber + '.last').css('border-bottom', '1px solid red');
                    }
                },
                lineWidth: 2,
                legendIndex: 2,
                zoneAxis: 'x',
                zones: prepareColoredZone()
            },
            {
                id: 'processMeanValue',
                name: getLocalizedText('processMeanValue', settings.locale),
                data: series.processMeanValue,
                yAxis: 0,
                color: chartSeriesColors.AttrControlChart.ProcessMeanValue,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 2,
                legendIndex: 3
            },
            {
                id: 'localMeanValue',
                name: getLocalizedText('localMeanValue', settings.locale),
                data: series.localMeanValue,
                yAxis: 0,
                color: chartSeriesColors.AttrControlChart.localMeanValue,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 2,
                legendIndex: 4,
                showInLegend: shouldDisplaySeries(series.localMeanValue)
            },
            {
                id: 'LCLAbs',
                name: getLocalizedText('LCL_1', settings.locale),
                data: series.LCLAbs,
                yAxis: 0,
                color: chartSeriesColors.AttrControlChart.ControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false
                },
                lineWidth: 2,
                legendIndex: 5,
                showInLegend: shouldDisplaySeries(series.LCLAbs)
            },
            {
                type: 'flags',
                data: series.flagSeries,
                onSeries: mainSeriesName,
                shape: 'circlepin',
                width: 16,
                showInLegend: false
            }
        ];
        return ser;
    }

    function displayTooltip(/*tooltip*/) {
        var msg = [],
            customInfo = settings.inputs.customInfo || [];

        msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');

        if (customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(customInfo[this.point.index]));
        }

        if (this.key.toString().startsWith('violation')) {
            if (this.point && this.point.vType && this.point.vType.length > 0 && typeof this.point.vType === 'object') {
                var arr = this.point.vType;
                for (var v in arr) {
                    if (arr[v] && arr[v].toLowerCase() !== 'processviolation_2' && arr[v].toLowerCase() !== 'processviolation_1') {
                        msg.push(getLocalizedText(arr[v], settings.locale));
                    }
                }
            }
        }
        if (this.point.options.text) // for flags type series, only it should be shown
            return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + this.point.options.text + "</span></div>";
        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";
    }

    function setDefault() {
        if (typeof options === 'object') {
            siemensTooltip.formatter = displayTooltip;
            if (options && typeof options === 'object') {
                if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                    console.error('Warning: Locale "' + options.locale + '" not found, default English locales will be used');
                    options.locale = 'en';
                }
            }
        }
    }

    function getCustomxAxisLabel(customInfo) {
        if (customInfo) {
            var xAxisObj = customInfo.filter(function (k) { return k.xAxisLabel === true; });
            if (xAxisObj && xAxisObj.length > 0 && xAxisObj[0].value)
                return xAxisObj[0].value;
        }
        return '';
    }

    function getCustomTooltip(customInfo) {
        var customTooltip = [];

        if (customInfo) {
            var xAxisObj = customInfo.filter(function (k) { return k.showInTooltip === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.label + ' : ' + o.value);
                });
            }
        }
        return customTooltip.join('<br>');
    }
    function getSeriesTitle() {
        switch (attrChartTYpe) {
            case attrChartTypes.C:
            case attrChartTypes.np:
                return getLocalizedText('DefectiveParts', settings.locale);
                break;
            case attrChartTypes.p:
            case attrChartTypes.U:
                return getLocalizedText('NonConformanceRate', settings.locale);
                break;
            default:
                return '';
                break;
        }
    }
    function drawDefectTable(containerId) {
        if (!settings.showDefectCollectionCard)
            return;
        if ($('#defectTableContainer').length) {
            $('#defectTableContainer').remove();
        }
        if (!settings.data.subgroups || !settings.data.result || !settings.data.result.defectPareto)
            return;
        setTimeout(function () {
            var tableWidth = roundFloat($("rect.highcharts-plot-background").attr("width"));
            var tableleftpos = roundFloat($("rect.highcharts-plot-background").attr("x"));
            var groupwidth = 112;

            var defectTableContainer = $("<div />", { id: "defectTableContainer" }),
                defectTableHeader = $("<thead />", { id: "defectTableHeader" }),
                defectTableHeaderRow = $("<tr />", { id: "defectTableHeaderRow" }),
                defectTableBody = $("<tbody />", { id: "defectTableBody" }),
                defectsHeadHtml = $("<th />", { class: "defectThead" });

            var defectTable = $("<Table />", { id: "defectTable" })
                .append(defectTableHeader)
                .append(defectTableHeaderRow).
                append(defectTableBody);

            var htmlArr = [];
            var bodyhtmlArr = [];
            defectTable.css('table-layout', 'fixed');
            var defectTableContainerCss = { 'width': tableWidth + tableleftpos, 'overflow': 'scroll', 'position': 'relative', 'left': '0', 'padding-bottom': '3px' }
            defectTableContainer.css(defectTableContainerCss);
            //defectTableContainer.css("overflow", "scroll");
            //defectTableContainer.css("position", "relative");
            //defectTableContainer.css("left", "0");
            //defectTableContainer.css("pading-bottom", "3px");
            defectTableContainer.append(defectTable);
            defectTableContainer.insertBefore($('#' + containerId));
            var defectsHeadColumnCss = { 'width': 117, 'position': 'sticky', 'left': '0', 'top': 'auto', 'background-color': '#0A7CA4'}
            defectsHeadHtml.css(defectsHeadColumnCss);
            defectsHeadHtml.html('Defects');

            $.each(settings.data.subgroups, function (index, item) {
                htmlArr.push(
                    '<th id=' + roundFloat(item.subgroupNumber) + ' class="subGroup"style="background-color:#0A7CA4 ; width:' + groupwidth + 'px" >' + roundFloat(item.subgroupNumber) + '</th>'
                );
            });
            var lastItem = settings.data.result.defectPareto[settings.data.result.defectPareto.length - 1];
            $.each(settings.data.result.defectPareto, function (index, item) {
                if (item === lastItem) {
                    bodyhtmlArr.push
                        (
                            '<tr><td style="word-break:break-all;position: sticky; left: 0;top:auto;background-color:#0A7CA4" >' + item.defectID + '</td>' + drawSupgroups(item.defectID, groupwidth, true) + '<tr>'
                        );
                } else
                    bodyhtmlArr.push
                        (
                            '<tr><td style="word-break:break-all;position: sticky; left: 0;top:auto;background-color:#0A7CA4" >' + item.defectID + '</td>' + drawSupgroups(item.defectID, groupwidth, false) + '<tr>'
                        );
            });

            bodyhtmlArr.push('<tr><td style="word-break:break-all;position: sticky; left: 0;top:auto;background-color:#0A7CA4" >Total</td>' + calcDefectSum() + '<tr>');
            defectTableHeaderRow.append(defectsHeadHtml);
            defectTableHeaderRow.append(htmlArr.join(' '));
            defectTableBody.append(bodyhtmlArr.join(' '));
        }, 1000);
    }
    function drawSupgroups(defectID, groupwidth) {
        var htmlArr = [];
        $.each(settings.data.subgroups, function (index, item) {
            var defect = item.defects.filter(function (obj) {
                return obj.defectID === defectID;
            });
            htmlArr.push(

                '<td class="' + roundFloat(item.subgroupNumber) + ' subGroup" style="color:#000 ; width:' + groupwidth + 'px">' + defect[0].numberOfDefects + '</td>'
            );
        });
        return htmlArr.join(' ');
    }
    function calcDefectSum() {
        var htmlArr = [];
        $.each(settings.data.subgroups, function (index, item) {
            var defects = item.defects;

            var sum = defects.reduce(function (a, b) {
                return a + b['numberOfDefects'];
            }, 0);

            htmlArr.push(

                '<td class="' + roundFloat(item.subgroupNumber) + ' subGroup last">' + sum + '</td>'
            );
        });
        return htmlArr.join(' ');
    }

    function prepareColoredZone() {
        var zone = [];
        var interval;

        //Disply violated samples and values in a different color 
        if (settings.data && settings.data.subgroups) {
            var violatedSubgroupsNumber = [];
            settings.data.subgroups.forEach(function (subgroup) {
                var statuses = subgroup.statuses;
                var newstatuses = [];
                if (statuses && statuses.length > 0) {
                    for (var i = 0; i < statuses.length; i++)
                        newstatuses.push(strToLowerCase(statuses[i].category));
                    if (newstatuses.indexOf("involvedbyother") > -1) {
                        violatedSubgroupsNumber.push(roundFloat(subgroup.subgroupNumber));
                    }
                }
            });

        }
        interval = getSequence(violatedSubgroupsNumber)
        zone = getColoredSeriesZone(interval, siemensColors.violationZone);
        return zone;


    }

    function shouldDisplaySeries(series) {
        var notNullSeries = [];
        if (series && series.filter) {
            notNullSeries = series.filter(function (k) {
                if (k !== null && k !== undefined)
                    return k.toString();
            });
        }
        var nonullableSeries = notNullSeries.length > 0;
        return nonullableSeries;
    }
};
/**
 * @description Provide methods for drawing the defect Pareto chart .
 *
 * @namespace DefectPareto
 * */

/**
 * @description A new defect Pareto chart can be drawn using this method.
 * @memberof DefectPareto
 * @function defectPareto
 * @requires highstock.js
 * @requires jQuery.js
 * @param {DefectPareto.options} options - The chart options parameter
 * @example
 * $('#paretoChart').defectPareto({
 *              locale: locale || 'en',
 *              data: data,
 *              decimalPlaces: 4,
 *              height: '550px',
 *              chartTitle: undefined,
 *              xAxisTitle: undefined,
 *              yAxisTitle: undefined
 *          });
 */

/**
 * @memberof DefectPareto
 * @typedef {object} options
 * @property {string}  [locale=en]  User locale to display label and violations in a specific language
 * @property {DefectPareto.data} data  Array of defect in a defined format {@link DefectPareto.data}
 * @property {number}  [height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @property {number}  [width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @property {string} [xAxisTitle='Defect'] - The xAxis Title
 * @property {string} [yAxisTitle='Count'] - The yAxis Title
 * @property {string} chartTitle - The chart Title
 */
/**
 * @description The series data format for Defect Pareto  Chart.
 * @typedef {Object} data
 * @memberof DefectPareto
 * @example
*   [
*	    {
*		    "defectID": "DefDefect5",
*		    "classification": "critical",
*		    "numberOfDefects": 170,
*		    "percentage": 14.492753623188407
*	    },
*	    {
*		    "defectID": "DefDefect4",
*		    "classification": "critical",
*		    "numberOfDefects": 145,
*		    "percentage": 12.361466325660699
*	    }
*   ]
*/
$.fn.defectPareto = function (options) {
    setDefaults();
    if (options && typeof options === 'object') {
        var settings = $.extend({
            locale: 'en',
            data: {},
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            chartTitle: undefined,
            xAxisTitle: getLocalizedText('Defect_Pareto_xAxis', options.locale),
            yAxisTitle: getLocalizedText('Defect_Pareto_yAxis', options.locale)
        }, options);
    } else if (!options)
        throw 'Not valid options or parameter to the "chart" widget passed';
    var $this = this,
        _args = arguments,
        chartOption = createChartOptions(settings),
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                //var _chart =
                Highcharts.chart(containerId, chartOption);
            }
        };
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        var input = {
            categories: [],
            defectsCount: []
        }
        prepareData(input);
        var optionValues = {
            chart: {
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                },
                type: 'column'
            },
            title: {
                text: options.chartTitle || getLocalizedText('Pareto_chart_title', options.locale),
                align: 'center',
                style: titleStyle
            },
            credits: {
                enabled: false
            },
            tooltip: siemensTooltip,
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            yAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                labels: {
                    enabled: true,
                    style: axiesStyle,
                    formatter: function () {
                        return this.value + ' %'
                    }
                },
                title: {
                    text: settings.yAxisTitle, //  options.yAxisTitle || getLocalizedText('Defect_Pareto_yAxis', options.locale), 
                    style: axiesTitleStyle
                },
            },
            xAxis: {
                title: {
                    text: settings.xAxisTitle, //  options.xAxisTitle || getLocalizedText('Defect_Pareto_xAxis', options.locale), 
                    style: axiesTitleStyle
                },
                gridLineColor: siemensColors.PL_BLACK_22,
                categories: input.categories
            },
            series: prepareSeries(input)
        };
        return optionValues;
    }
    function prepareData(input) {
        $.each(settings.data, function (index, defect) {
            input.categories.push(roundFloat(defect.defectID));
            input.defectsCount.push(roundFloat(defect.percentage));
        });
    }
    function prepareSeries(input) {
        var ser = [
            {
                name: 'Defects',
                data: input.defectsCount,
                color: chartSeriesColors.Pareto.DefectsCount,
                states: {
                    hover: {
                        color: chartSeriesColors.Pareto.DefectsCounthover
                    }
                }
            }
        ];
        return ser;
    }
    function displayTooltip(/*tooltip*/) {
        if (settings.data) {
            var msg = "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:600'>" + this.series.name + ": </span><span style='font-size:9pt;font-weight:400'>" + roundFloat(this.y, settings.decimalPlaces) + "</span></div>";
            var key = this.x;
            var defectObj = settings.data.filter(function (obj) {
                return obj.defectID === key;
            });
            if (defectObj[0]) {
                var defectIDcaption = "<span style='font-size: 9pt; font-weight: 600'>" + getLocalizedText('Defect_Pareto_ID_Tooltip_Caption', settings.locale) + ":</span><span style='font-size: 9pt; font-weight: 400'> " + roundFloat(defectObj[0].defectID) + "</span><br>";
                var defectCountCaption = "<span style='font-size: 9pt; font-weight: 600'>" + getLocalizedText('Defect_Pareto_count_Tooltip_Caption', settings.locale) + ":</span><span style='font-size: 9pt; font-weight: 400'> " + roundFloat(defectObj[0].numberOfDefects) + "</span><br>";
                var defectPercentCaption = "<span style='font-size: 9pt; font-weight: 600'>" + getLocalizedText('Defect_Pareto_percent_Tooltip_Caption', settings.locale) + ":</span><span style='font-size: 9pt; font-weight: 400'> " + roundFloat(defectObj[0].percentage, settings.decimalPlaces) + " %</span><br>";
                var defectclass = "<span style='font-size: 9pt; font-weight: 600'>" + getLocalizedText('Defect_Pareto_class_Tooltip_Caption', settings.locale) + ":</span><span style='font-size: 9pt; font-weight: 400'> " + defectObj[0].classification + "</span><br>";
                msg = "<div style='padding:8px 16px'>" + defectIDcaption + defectCountCaption + defectPercentCaption + defectclass + "</div>";
            }
        }
        return msg;
    }
    function setDefaults() {
        if (typeof options === 'object') {
            siemensTooltip.formatter = displayTooltip;
            if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                console.error('Locale ' + options.locale + ' not found, default English locales will be used');
                options.locale = 'en';
            }
        }
    }
};
/**
 * @description Provide methods to draw cumulative sum chart .
 *
 * @namespace CumulativeSumChart
 *
 */

/**
 * @description Draw cumulative sum chart with the given parameters.
 * @memberof CumulativeSumChart
 * @function cumulativeSumChart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {object} options
 * @param {string} [options.locale=en]  User locale for tooltip and title etc. It require corresponding localization files to be referenced in html e.g. ui-charts-de.js should be included for german locale.
 * @param {CumulativeSumChart.data} options.data - JSON Array with subgroup
 * @param {string} [options.chartTitle = 'Cumulative Sum Chart'] - The default value will be based on corresponding locale (if referenced).
 * @param {number} [options.decimalPlaces = 4] - Number of decimal places for numbers to be shown in tooltip.
 * @param {number} [options.height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @param {number} [options.width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @param {string} [options.xAxisTitle='Subgroups'] - The label for x-Axis.
 * @param {string} [options.yAxisTitle='CUSUM'] - The label for y-Axis. 
 * @example
 * $('#CUSum').cumulativeSumChart({
 *                      locale: locale,
 *                      data: {
 *                              subgroups: [
 *                                            {
 *                                               cuSumPlus: 0.001049999999999985,
 *                                               cuSumMinus: 0
 *                                             }
 *                                          ],
 *                              result : {
 *                                  cuSum : {
 *                                              upperControlLimit: 0.1116,
 *                                              lowerControlLimit: -0.1116,
 *                                          }
 *                                      },
 *                      decimalPlaces: 4,
 *                      height: 550,
 *                      width: 400,
 *                      });
 *
 */

/**
 * @description The format of data for cumulative sum chart.
 * @typedef {Array} data - The array of objects.
 * @memberof CumulativeSumChart
 * @property {Array} subgroups - The array of objects in defined format. Please look the format in the in example below.
 * @property {object} result - An object containg additional information about cumulative sum chart.
 * @property {object} result.cuSum - The additional attribute of sumulative sum chart.
 * @example
 * var data = {
 *      subgroups: [
 *              {
 *                  cuSumHigh: 0.001049999999999985
 *                  cuSumLow: 0,
 *              }
 *            ],
 *      result : {
 *          cuSum:{
 *              upperControlLimit: 0.1116,
 *              lowerControlLimit: -0.1116,
 *          }
 *  }
 */

/**
 * @description An array of objects with following properties can be injected against each subgroup.
 * @typedef {object} customInfo
 * @memberof CumulativeSumChart
 * @property {string} label - The label to be display in tooltip.
 * @property {string} value - The value to be used to show in tooltip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be showin in tooltip for a particular subgrup as 'label: value'
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given {@link CumulativeSumChart.data}</caption>

    data.subgroups[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
  */

$.fn.cumulativeSumChart = function (options) {
    var settings = {};
    if (options && typeof options === 'object') {
        setDefault();
        settings = $.extend({
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: getLocalizedText('CUSum_chart', options.locale),
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            xAxisTitle: getLocalizedText('x_axis_subgroups', options.locale),
            yAxisTitle: 'CUSUM'
        }, options);
    } else if (!options)
        throw 'Not valid options or parameter to the "chart" widget passed';
    var $this = this,
        _args = arguments,
        chartOption = createChartOptions(settings),
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                Highcharts.stockChart(containerId, chartOption);
            }
        };

    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        if (!settings.data || !settings.data.subgroups)
            throw 'Invalid data format exception: Series data is not in defined format';
        var series = { cuSumLow: [], cuSumHigh: [], cuSumUCL: [], cuSumLCL: [], cuSumCL: [], customInfo: [], xAxisLabels: [] },
            yMin = settings.data.result && settings.data.result.cuSum ? Math.min(settings.data.result.cuSum.lowerControlLimit, settings.data.result.cuSum.minCusumMinus) || null : null,
            yMax = settings.data.result && settings.data.result.cuSum ? Math.max(settings.data.result.cuSum.upperControlLimit, settings.data.result.cuSum.maxCUSumPlus) || null : null;

        prepareData(series);
        settings.inputs = series;

        var optionValues = {
            chart: {
                type: 'line',
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    }
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            navigator: {
                baseSeries: 2,
                enabled: true,
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                series: {
                    lineColor: chartSeriesColors.SingleValueChart.Measurement
                }
            },
            rangeSelector: {
                enabled: false
                // selected: 5  // date, month year etc
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                gridLineColor: siemensColors.PL_BLACK_22,
                title: {
                    text: settings.xAxisTitle,
                    style: axiesTitleStyle
                },
                labels: {
                    rotation: -90,
                    style: axiesStyle,
                    formatter: function () {
                        return series.xAxisLabels[this.value];
                    }
                },
                range: 25
            },
            yAxis: [{
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                min: yMin, // Math.min(settings.data.result.cuSum.lowerControlLimit, settings.data.result.cuSum.minCusumMinus),
                max: yMax, // Math.max(settings.data.result.cuSum.upperControlLimit, settings.data.result.cuSum.maxCUSumPlus),
                opposite: false,
                labels: {
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisTitle,
                    style: axiesTitleStyle
                }
            }
            ],
            series: prepareSeries(series)
        };
        return optionValues;
    }

    function prepareData(series) {
        var data = settings.data,
            ucl = 0,
            lcl = 0;
        if (data && data.result && data.result.cumulatedSumValues) {
            ucl = roundFloat(data.result.cumulatedSumValues.upperControlLimit, null, true);
            lcl = roundFloat(data.result.cumulatedSumValues.lowerControlLimit, null, true);
        }
        $.each(data.subgroups, function (index, item) {
            if (SubgroupContainsStatus(item, "Eliminated") == false) {
                var customInfo = item.customInfo || [];

                series.cuSumLow.push(roundFloat(item.cuSumLow, null, true));
                series.cuSumHigh.push(roundFloat(item.cuSumHigh, null, true));
                series.cuSumUCL.push(ucl);
                series.cuSumLCL.push(lcl);
                series.cuSumCL.push(0); // the midde value should be 0

                if (customInfo.length > 0) { // It should be irrespect of xAxisCutomInfoLabel property
                    series.xAxisLabels.push(getCustomxAxisLabel(customInfo));
                }
                else {
                    series.xAxisLabels.push(index + 1); // sum start from 1
                }

                series.customInfo.push(customInfo);
            }
        });
    }

    function getCustomxAxisLabel(customInfo) {
        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.xAxisLabel === true; });
            if (xAxisObj && xAxisObj.length > 0 && xAxisObj[0].value)
                return xAxisObj[0].value;
        }
        return '';
    }

    function getCustomTooltip(customInfo) {
        var customTooltip = [];

        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.showInTooltip === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.label + ' : ' + o.value);
                });
            }
        }
        return customTooltip.join('<br>');
    }

    function prepareSeries(series) {
        var ser = [
            {
                id: seriesIds.cuSumChart.cuSumUCL, // 'CUSumUCL',
                name: getLocalizedText(seriesIds.cuSumChart.cuSumUCL, settings.locale),
                data: series.cuSumUCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 1.2,
                legendIndex: 0,
                showInLegend: shouldDisplaySeries(series.cuSumUCL),
                visible: shouldDisplaySeries(series.cuSumUCL)
            },
            {
                id: seriesIds.cuSumChart.cuSumCL, // 'CUSumCL',
                name: getLocalizedText(seriesIds.cuSumChart.cuSumCL, settings.locale),
                data: series.cuSumCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumMeanValue,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 1.2,
                legendIndex: 1,
                showInLegend: shouldDisplaySeries(series.cuSumCL),
                visible: shouldDisplaySeries(series.cuSumCL)
            },
            {
                id: seriesIds.cuSumChart.cuSumHigh, //'CUSumPlus',
                name: getLocalizedText(seriesIds.cuSumChart.cuSumHigh, settings.locale),
                data: series.cuSumHigh,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumHigh,
                //step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    radius: 4,
                    symbol: 'circle'
                },
                // lineWidth: 1.2,
                legendIndex: 2,
                showInLegend: shouldDisplaySeries(series.cuSumHigh),
                visible: shouldDisplaySeries(series.cuSumHigh)
            },
            {
                id: seriesIds.cuSumChart.cuSumLow, //  'CUSumMinus',
                name: getLocalizedText(seriesIds.cuSumChart.cuSumLow, settings.locale),
                data: series.cuSumLow,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumLow,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                // lineWidth: 1.2,
                legendIndex: 3,
                showInLegend: shouldDisplaySeries(series.cuSumLow),
                visible: shouldDisplaySeries(series.cuSumLow)
            },          
            {
                id: seriesIds.cuSumChart.cuSumLCL, // 'CUSumLCL',
                name: getLocalizedText(seriesIds.cuSumChart.cuSumLCL, settings.locale),
                data: series.cuSumLCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 1.2,
                legendIndex: 4,
                showInLegend: shouldDisplaySeries(series.cuSumLCL),
                visible: shouldDisplaySeries(series.cuSumLCL)
            }
            
        ];
        return ser;
    }

    function displayTooltip(/*tooltip*/) {
        var msg = [],
            customInfo = settings.inputs.customInfo || [];

        msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');

        if (customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(customInfo[this.point.index]));
        }

        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";
    }

    function shouldDisplaySeries(series) {
        var notNullSeries = [];
        if (series && series.filter) {
            notNullSeries = series.filter(function (k) {
                if (!isNullOrUndefined(k))
                    return k.toString();
            });
        }

        var nonullableSeries = notNullSeries.length > 0;
        return nonullableSeries;
    }

    function setDefault() {
        if (typeof options === 'object') {
            siemensTooltip.formatter = displayTooltip;
            //if (options && typeof options === 'object') {
            if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                console.error('Warning: Locale "' + options.locale + '" not found, default English locales will be used');
                options.locale = 'en';
            }
            //}
        }
    }
};
/**
 * @description Provide methods to draw cumulative count chart .
 *
 * @namespace CumulativeCountChart
 *
 */

/**
 * @description Draw cumulative count chart with the given parameters.
 * @memberof CumulativeCountChart
 * @function cumulativeCountChart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {object} options
 * @param {string} [options.locale=en]  User locale for tooltip and title etc. It require corresponding localization files to be referenced in html e.g. ui-charts-de.js should be included for german locale.
 * @param {CumulativeCountChart.data} options.data - JSON Array with subgroup
 * @param {string} [options.chartTitle = 'Cumulative Count Chart'] - The default value will be based on corresponding locale (if referenced).
 * @param {number} [options.decimalPlaces = 4] - Number of decimal places for numbers to be shown in tooltip.
 * @param {number} [options.height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @param {number} [options.width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @param {string} [options.xAxisTitle='subgroups'] - The label for x-Axis.
 * @param {string} [options.yAxisTitle='Cumulative Count'] - The label for y-Axis.
 * @param {boolean}  [options.xAxisCustomInfoLabel=false] - If true, the default label for xAxis will be overriden by the property of customInfo object, where xAxisLabel is true. For more information  please refer {@link CumulativeCountChart.customInfo}
 * @example
 * $('#CUSum').cumulativeCountChart({
 *                      locale: locale,
 *                      data: {
 *                              subgroups: [
 *                                            {
 *                                            subgroupNumber: 1,
 *                                            cumulativeCount: 1,
 *                                            lowerControlLimitAbs: 39.98666666666667,
 *                                            upperControlLimitAbs: 2395.7869569035784,
 *                                            numberOfDefects: 4,
 *                                            processMeanValue: 559.8133333333333,
 *                                            statuses: 
 *                                               [ 
 *                                                  {
 *                                                      category: "LCL_1"
 *                                                  },
 *                                                  {
 *                                                      category: "ProcessViolation_1"
 *                                                  }
 *                                               ]
 *                                            }
 *                                         ]
 *                               },
 *                      decimalPlaces: 4,
 *                      height: '80%',
 *                      width: 400,
 *                      });
 *
 */

/**
 * @description The format of data for cumulative sum chart.
 * @typedef {Array} data - The array of objects.
 * @memberof CumulativeCountChart
 * @property {Array} subgroups - The array of objects in defined format. Please look the format in the in example below. 
 * @example
 * var data = 
 * {
 *                              subgroups: [
 *                                            {
 *                                            subgroupNumber: 1,
 *                                            cumulativeCount: 1,
 *                                            lowerControlLimitAbs: 39.98666666666667,
 *                                            upperControlLimitAbs: 2395.7869569035784,
 *                                            numberOfDefects: 4,
 *                                            processMeanValue: 559.8133333333333,
 *                                            statuses: 
 *                                               [ 
 *                                                  {
 *                                                      category: "LCL_1"
 *                                                  },
 *                                                  {
 *                                                      category: "ProcessViolation_1"
 *                                                  }
 *                                               ]
 *                                            }
 *                                         ]
 *                               }
 
 */

/**
 * @description An array of objects with following properties can be injected against each subgroup.
 * @typedef {object} customInfo
 * @memberof CumulativeCountChart
 * @property {string} label - The label to be display in tooltip.
 * @property {string} value - The value to be used to show in tooltip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be showin in tooltip for a particular subgrup as 'label: value'
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given {@link CumulativeCountChart.data}</caption>

    data.subgroups[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
  */
$.fn.cumulativeCountChart = function (options) {
    var settings = {};
    if (options && typeof options === 'object') {
        setDefault();
        settings = $.extend({
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: getLocalizedText('cuCount_chart', options.locale),
            decimalPlaces: 4,
            height: undefined,
            width: undefined,
            xAxisTitle: getLocalizedText('x_axis_subgroups', options.locale),
            yAxisTitle: getLocalizedText('cuCount', options.locale),
        }, options);

    } else if (!options)
        throw 'Not valid options or parameter to the "chart" widget passed';
    var $this = this,
        _args = arguments,
        chartOption = createChartOptions(settings),
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                Highcharts.stockChart(containerId, chartOption);
            }
        };

    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        if (!settings.data || !settings.data.subgroups)
            throw 'Invalid data format exception: Series data is not in defined format';
        var series = { cuCount: [], ucl: [], lcl: [], xbp: [], xAxisLabels: [], customInfo : [] };

        prepareData(series);
        settings.inputs = series;

        var optionValues = {
            chart: {
                type: 'line',
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    }
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            navigator: {
                baseSeries: 1,
                enabled: true,
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                series: {
                    lineColor: chartSeriesColors.SingleValueChart.Measurement
                }
            },
            rangeSelector: {
                enabled: false
                // selected: 5  // date, month year etc
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                gridLineColor: siemensColors.PL_BLACK_22,
                title: {
                    text: settings.xAxisTitle,
                    style: axiesTitleStyle
                },
                labels: {
                    rotation: -90,
                    style: axiesStyle,
                    formatter: function () {
                        return series.xAxisLabels[this.value];
                    }
                },
                range: 25
            },
            yAxis: [{
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                // min: yMin, // Math.min(settings.data.result.cuSum.lowerControlLimit, settings.data.result.cuSum.minCusumMinus),
                // max: yMax, // Math.max(settings.data.result.cuSum.upperControlLimit, settings.data.result.cuSum.maxCUSumPlus),
                opposite: false,
                labels: {
                    formatter: function () {
                        return roundFloat(this.value, settings.decimalPlaces); // series.xAxisLabels[this.value];
                    },
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisTitle,
                    style: axiesTitleStyle
                }
            }
            ],
            series: prepareSeries(series)
        };
        return optionValues;
    }

    function prepareData(series) {
        var data = settings.data;
        var selectedSubgroups = (data.subgroups || []).filter(function (k) {
            return k.numberOfDefects > 0;
        });

        $.each(selectedSubgroups, function (index, item) {
            if (SubgroupContainsStatus(item, "Eliminated") == false) {
                var customInfo = item.customInfo || [],
                    violations = getViolations(item.statuses);

                if (violations.newStatuses.length > 0) {
                    series.cuCount.push({
                        marker: {
                            fillColor: chartSeriesColors.ControlChart.Marker,
                            lineWidth: 3,
                            lineColor: chartSeriesColors.ControlChart.Marker,
                            symbol: 'triangle'
                        },
                        name: 'violation' + index,
                        y: roundFloat(item.cumulativeCount, null, true),
                        violations: violations.violations  //to get in tooltip and in click event
                    });
                }
                else
                    series.cuCount.push(roundFloat(item.cumulativeCount, null, true));


                series.ucl.push(roundFloat(data.result.cumulatedCountValues.upperControlLimit, null, true));
                series.lcl.push(roundFloat(data.result.cumulatedCountValues.lowerControlLimit, null, true));
                series.xbp.push(roundFloat(data.result.cumulatedCountValues.processMeanValue, null, true));

                if (settings.xAxisCustomInfoLabel === true) {
                    series.xAxisLabels.push(getCustomxAxisLabel(customInfo));
                } else {
                    series.xAxisLabels.push(roundFloat(item.subgroupNumber, null, true));
                }

                series.customInfo.push(customInfo);
            }
        });


    }

    function getViolations(statuses) {
        var data = { newStatuses: [], violations: [] };

        if (statuses && statuses.length > 0 && typeof statuses === 'object') {
            statuses.forEach(function (s) {
                if (s.category) {
                    if (s.category.toLowerCase() !== 'processviolation_1' && s.category.toLowerCase() !== 'processviolation_2')
                        data.violations.push(getLocalizedText(s.category, settings.locale));

                    data.newStatuses.push(s.category.toLowerCase());
                }
            });
        }

        if (data.newStatuses.indexOf('processviolation_1') < 0 && data.newStatuses.indexOf('processviolation_2') < 0) { // if no violations found then return empty
            data = { newStatuses: [], violations: [] };
        }

        return data;
    }

    function getCustomxAxisLabel(customInfo) {
        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.xAxisLabel === true; });
            if (xAxisObj && xAxisObj.length > 0 && xAxisObj[0].value)
                return xAxisObj[0].value;
        }
        return '';
    }

    function getCustomTooltip(customInfo) {
        var customTooltip = [];

        if (customInfo && customInfo.filter) {
            var xAxisObj = customInfo.filter(function (k) { return k.showInTooltip === true; });
            if (xAxisObj) {
                xAxisObj.forEach(function (o) {
                    customTooltip.push(o.label + ' : ' + o.value);
                });
            }
        }
        return customTooltip.join('<br>');
    }

    function prepareSeries(series) {
        var ser = [
            {
                id: seriesIds.cuCountChart.ucl, //  'CUSumMinus',
                name: getLocalizedText('UCL_1', settings.locale),
                data: series.ucl,
                yAxis: 0,
                color: chartSeriesColors.CUCountChart.controlLimit,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: false,
                    radius: 4
                },
                lineWidth: 1.2,
                legendIndex: 1,
                showInLegend: shouldDisplaySeries(series.ucl),
                visible: shouldDisplaySeries(series.ucl)
            },
            {
                id: seriesIds.cuCountChart.cuCount, //'CUSumPlus',
                name: getLocalizedText(seriesIds.cuCountChart.cuCount, settings.locale),
                data: series.cuCount,
                yAxis: 0,
                color: chartSeriesColors.CUCountChart.mainSeries,
                //step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    symbol: 'circle',
                    radius: 4,
                    enabled: true
                },
                //lineWidth: 2,
                legendIndex: 2,
                showInLegend: false,
                visible: true
            },
            {
                id: seriesIds.cuCountChart.xbp, // 'CUSumLCL',
                name: getLocalizedText('xbp_1', settings.locale),
                data: series.xbp,
                yAxis: 0,
                color: chartSeriesColors.CUCountChart.meanValue,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 1.2,
                legendIndex: 3,
                showInLegend: shouldDisplaySeries(series.xbp),
                visible: shouldDisplaySeries(series.xbp)
            },
            {
                id: seriesIds.cuCountChart.lcl, // 'CUSumUCL',
                name: getLocalizedText('LCL_1', settings.locale),
                data: series.lcl,
                yAxis: 0,
                color: chartSeriesColors.CUCountChart.controlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 1.2,
                legendIndex: 4,
                showInLegend: shouldDisplaySeries(series.lcl),
                visible: shouldDisplaySeries(series.lcl)
            }
        ];
        return ser;
    }

    function displayTooltip(/*tooltip*/) {
        var msg = [],
            customInfo = settings.inputs.customInfo || [];

        msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');

        if (this.key.toString().startsWith('violation') && this.point.options.violations) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            this.point.options.violations.forEach(function (v) { if(v) msg.push(v); });
        }

        if (customInfo.length > this.point.index && customInfo[this.point.index].length > 0) {
            msg.push('<hr style="margin-top: 7px; padding: 0; margin-bottom: -10px; "/>');
            msg.push(getCustomTooltip(customInfo[this.point.index]));
        }

        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";

    }

    function shouldDisplaySeries(series) {
        var notNullSeries = [];
        if (series && series.filter) {
            notNullSeries = series.filter(function (k) {
                if (!isNullOrUndefined(k))
                    return k.toString();
            });
        }

        var nonullableSeries = notNullSeries.length > 0;
        return nonullableSeries;
    }

    function setDefault() {
        siemensTooltip.formatter = displayTooltip;
        if (options && typeof options === 'object') {
            if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                console.error('Warning: Locale "' + options.locale + '" not found, default English locales will be used');
                options.locale = 'en';
            }

        }
    }
};
/**
 * @description Provide methods to draw cumulative sum chart .
 *
 * @namespace uCuSumChart
 *
 */

/**
 * @description Draw cumulative sum chart with the given parameters.
 * @memberof uCuSumChart
 * @function cumulatedUSumChart
 * @requires highstock.js
 * @requires jQuery.js
 * @param {object} options
 * @param {string} [options.locale=en]  User locale for tooltip and title etc. It require corresponding localization files to be referenced in html e.g. ui-charts-de.js should be included for german locale.
 * @param {uCuSumChart.data} options.data - JSON Array with subgroup
 * @param {string} [options.chartTitle = 'Cumulative Sum Chart'] - The default value will be based on corresponding locale (if referenced).
 * @param {number} [options.decimalPlaces = 4] - Number of decimal places for numbers to be shown in tooltip.
 * @param {number} [options.height=null] - The chart height in pixel unit or as percentage %. An explicit height for the chart. If a number, the height is given in pixels. If given a percentage string (for example '56%'), the height is given as the percentage of the actual chart width. This allows for preserving the aspect ratio across responsive sizes.<br>
 *                               By default (when null) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.
 * @param {number} [options.width = null] - The chart width in pixel. This is an explicit width for the chart. By default (when null) the width is calculated from the offset width of the containing element.
 * @param {string} [options.xAxisTitle='subgroups'] - The label for x-Axis.
 * @param {string} [options.yAxisTitle='Cumulative Sum'] - The label for y-Axis.
 * @param {boolean}  [options.xAxisCustomInfoLabel=false] - If true, the default label for xAxis will be overriden by the property of customInfo object, where xAxisLabel is true. For more information  please refer {@link CumulativeCountChart.customInfo}
 * 

/**
 * @description The format of data for cumulative sum chart.
 * @typedef {Array} data - The array of objects.
 * @memberof uCuSumChart
 * @property {Array} subgroups - The array of objects in defined format. Please look the format in the in example below.
 */

/**
 * @description An array of objects with following properties can be injected against each subgroup.
 * @typedef {object} customInfo
 * @memberof uCuSumChart
 * @property {string} label - The label to be display in tooltip.
 * @property {string} value - The value to be used to show in tooltip and for xAxis labels.
 * @property {boolean} showInTooltip - if true, the label and value will also be showin in tooltip for a particular subgrup as 'label: value'
 * @example
 * <caption>A customInfo can be injected like this, if a data is defined in the given {@link CumulativeCountChart.data}</caption>

    data.subgroups[0].customInfo = [
        {
            label: 'Charge Number',
            value: 'CH001',
            showInTooltip: true,
            xAxisLabel: false
        },
        {
            label: 'Date',
            value: '05-01-2020',
            showInTooltip: true,
            xAxisLabel: true
        }
    ];
  // Note: If against a subgroup more than one objects have 'xAxisLabel' true then the value by default
  // of the first object will be taken. e.g. If in the given example both objects have xAxisLabel true
  // then in chart the value of first object on xAxis label (for subgroup 0) will be displayed.
  // Which is in this case 'CH001'
  */

$.fn.cumulatedUSumChart = function (options) {
    var settings = {};
    if (options && typeof options === 'object') {
        setDefault();
        settings = $.extend({
            locale: 'en',
            data: {}, // JSON Array with subgroup
            chartTitle: getLocalizedText('CUSum_chart', 'en'),
            decimalPlaces: 2,
            height: undefined,
            width: undefined,
            xAxisTitle: getLocalizedText('x_axis_subgroups', 'en'),
            yAxisTitle: undefined
        }, options);

    } else if (!options)
        throw 'Not valid options or parameter to the "chart" widget passed';


    var $this = this,
        _args = arguments,
        chart = {
            init: function () {
                var containerId = $this.attr('id');
                Highcharts.stockChart(containerId, chartOption);
            }
        },
        chartOption = createChartOptions(settings);
    return this.each(function () {
        if (chart[options]) {
            return chart[options]
                (_args[1], _args[2]);
        } else if (typeof options === 'object' || !options) {
            chart.init();
        }
    });

    function createChartOptions(settings) {
        if (!settings.data || !settings.data.subgroups)
            throw 'Invalid data format exception: Series data is not in defined format';
        var series = {
            CUSumMinus: [],
            CUSumPlus: [],
            CUSum: [],
            CUSumUCL: [],
            CUSumLCL: [],
            CUSumCL: [],
            xAxisLabels: []
        };
        var ymin = Math.min(settings.data.result.cumulatedSumValues.lowerControlLimit, settings.data.result.cumulatedSumValues.minCumulatedSumLow);
        var ymax = Math.max(settings.data.result.cumulatedSumValues.upperControlLimit, settings.data.result.cumulatedSumValues.maxCumulatedSumHigh);
        console.log(ymin, ymax);
        prepareData(settings.data, series);
        var optionValues = {
            chart: {
                type: 'line',
                height: settings.height,
                width: settings.width,
                style: {
                    fontFamily: 'Segoe UI,Open Sans,Arial,Helvetica,sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 0.8
                        }
                    }
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100
            },
            navigator: {
                baseSeries: 0,
                enabled: true,
                xAxis: {
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                series: {
                    lineColor: chartSeriesColors.SingleValueChart.Measurement
                }
            },
            rangeSelector: {
                enabled: false
                // selected: 5  // date, month year etc
            },
            title: {
                text: settings.chartTitle,
                style: titleStyle
            },
            tooltip: siemensTooltip,
            xAxis: {
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                gridLineColor: siemensColors.PL_BLACK_22,
                title: {
                    text: settings.xAxisTitle, // getLocalizedText('x_axis_subgroups', settings.locale),
                    style: axiesTitleStyle
                },
                labels: {
                    style: axiesStyle,
                    formatter: function () {
                        return series.xAxisLabels[this.value];
                    }
                },
                range: 25
            },
            yAxis: [{
                lineColor: siemensColors.PL_BLACK_22,
                lineWidth: 2,
                min: Math.min(settings.data.result.cumulatedSumValues.lowerControlLimit, settings.data.result.cumulatedSumValues.minCumulatedSumLow),
                max: Math.max(settings.data.result.cumulatedSumValues.upperControlLimit, settings.data.result.cumulatedSumValues.maxCumulatedSumHigh),
                opposite: false,                
                labels: {
                    formatter: function () {
                        return roundFloat(this.value, settings.decimalPlaces); // series.xAxisLabels[this.value];
                    },
                    style: axiesStyle
                },
                title: {
                    text: settings.yAxisTitle,
                    style: axiesTitleStyle
                }
            }
            ],
            series: prepareSeries(series)
        };
        return optionValues;
    }

    function prepareData(data, series) {
        
        $.each(data.subgroups, function (index, item) {
            
            if (SubgroupContainsStatus(item, "Eliminated") == false ) {
                series.CUSumMinus.push(item.cuSumLow);
                series.CUSumPlus.push(item.cuSumHigh);
                series.CUSum.push(item.cuSum);
                series.CUSumUCL.push(data.result.cumulatedSumValues.upperControlLimit);
                series.CUSumLCL.push(data.result.cumulatedSumValues.lowerControlLimit);
                series.CUSumCL.push(0);
                series.xAxisLabels.push(item.subgroupNumber);
            }
        });


    }

    function prepareSeries(series) {
        var ser = [
            {
                id: 'CUSumMinus',
                name: getLocalizedText('CUSumLow', settings.locale),
                data: series.CUSumMinus,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumLow,
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    radius: 4
                },
                lineWidth: 2,
                legendIndex: 1,
                showInLegend: true,
                visible: true
            },
            {
                id: 'CUSumPlus',
                name: getLocalizedText('CUSumHigh', settings.locale),
                data: series.CUSumPlus,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumHigh,
                //step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    radius: 4
                },
                lineWidth: 2,
                legendIndex: 2,
                showInLegend: true,
                visible: true
            },
            {
                id: 'CUSum',
                name: getLocalizedText('CUSum', settings.locale),
                data: series.CUSum,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumHigh,
                //step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                marker: {
                    enabled: true,
                    radius: 4
                },
                lineWidth: 2,
                legendIndex: 3,
                showInLegend: true,
                visible: true
            },
            {
                id: 'CUSumUCL',
                name: getLocalizedText('CUSumUCL', settings.locale),
                data: series.CUSumUCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 2,
                legendIndex: 4,
                showInLegend: true,
                visible: true
            },
            {
                id: 'CUSumLCL',
                name: getLocalizedText('CUSumLCL', settings.locale),
                data: series.CUSumLCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumControlLimit,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 2,
                legendIndex: 5,
                showInLegend: true,
                visible: true
            },
            {
                id: 'CUSumCL',
                name: getLocalizedText('CUSumCL', settings.locale),
                data: series.CUSumCL,
                yAxis: 0,
                color: chartSeriesColors.CUSumChart.CUSumMeanValue,
                step: 'left',
                tooltip: {
                    valueDecimals: settings.decimalPlaces
                },
                lineWidth: 2,
                legendIndex: 6,
                showInLegend: true,
                visible: true
            }
        ];
        return ser;
    }

    function displayTooltip(/*tooltip*/) {
        var msg = [];

        msg.push('<b>' + this.series.name + ' : ' + roundFloat(this.y, settings.decimalPlaces) + '</b>');
        return "<div style='padding:8px 16px'><span style='font-size:9pt;font-weight:400'>" + msg.join('<br>') + "</span></div>";

    }

    function setDefault() {
        if (typeof options === 'object') {
            siemensTooltip.formatter = displayTooltip;
            if (options && typeof options === 'object') {
                if (!options.locale || !Highcharts.uiLocale[options.locale]) {
                    console.error('Warning: Locale "' + options.locale + '" not found, default English locales will be used');
                    options.locale = 'en';
                }
            }
        }
    }
};
//Note: should not be referenced directly in HTML file. Will be used by bundler.js

function setDefaultLocaleText() {
    if (Highcharts /* && settings.locale === 'en'*/) {
        // Highcharts.uilocale is in init() initialized
        Highcharts.uiLocale.en = {
            "Chi2Test": "Chi² Test",
            "Eliminated": "Sample eliminated",
            "EliminatedByCalculation": "Sample is automatically eliminated",
            "USL": "Upper Specification Limit",
            "LSL": "Lower Specification Limit",
            "UCL_1": "Upper CL (CC1)",
            "LCL_1": "Lower CL (CC1)",
            "UWL_1": "Upper WL (CC1)",
            "LWL_1": "Lower WL (CC1)",
            "Specification": "Specification",
            "TrendUp_1": "Trend up (CC1)",
            "TrendDown_1": "Trend down (CC1)",
            "RunHigh_1": "Run up (CC1)",
            "RunLow_1": "Run down (CC1)",
            "MiddleThird": "Middlethird",
            "ProcessViolation_1": "Process violation in CC1",
            "Zone": "Generic Zone",
            "ZoneRule_01": "Zone Rule #1",
            "ZoneRule_02": "Zone Rule #2",
            "ZoneRule_03": "Zone Rule #3",
            "ZoneRule_04": "Zone Rule #4",
            "ZoneRule_05": "Zone Rule #5",
            "ZoneRule_06": "Zone Rule #6",
            "ZoneRule_07": "Zone Rule #7",
            "ZoneRule_08": "Zone Rule #8",
            "ZoneRule_09": "Zone Rule #9",
            "ZoneRule_10": "Zone Rule #10",
            "Changed": "Values have been changed",
            "Outlier": "Sample contains outlier",
            "UCL_2": "Upper CL (CC2)",
            "LCL_2": "Lower CL (CC2)",
            "UWL_2": "Upper WL (CC2)",
            "LWL_2": "Lower WL (CC2)",
            "TrendUp_2": "Trend up (CC2)",
            "TrendDown_2": "Trend down (CC2)",
            "RunHigh_2": "Run up (CC2)",
            "RunLow_2": "Run down (CC2)",
            "ProcessViolation_2": "Process violation in CC2",
            "ToolChanged": "Tool change",
            "Hist_tt_Count": "Count",
            "Hist_ND": "d",
            "Hist_currentLowerToleranceLimitAbs": "LT",
            "Hist_currentUpperToleranceLimitAbs": "UT",
            "Hist_Xbb": "xbb",
            "Hist_ChartTitle": "HISTOGRAM",
            "Hist_yAxisTitle": "%",
            "Hist_BellCurve":"Bell Curve",
            "SVC_xAxisTitle": "Sort number",
            "SVC_yAxisTitle": "Measurements",
            "xbp_1": "Process Mean Value (xbP1)",
            "xbp_2": "Process Mean Value (xbP2)",
            "UTL_1": "Upper TL (CC1)",
            "UTL_2": "Upper TL (CC2)",
            "LTL_1": "Lower TL (CC1)",
            "LTL_2": "Lower TL (CC2)",
            "decimalDelimiter": ".",
            "NonConformanceRate": "Non Conformance Rate",
            "DefectiveParts": "Defective Parts",
            "processMeanValue": "process Mean Value",
            "localMeanValue": "xbb",
            "HIST_Confidance_Interval": "s^ND",

            //series Names names
            "svc": "Single Value",
            "xb": "xb",
            "mxb": "mxb",
            "ewma": "ewma",
            "mr": "mR",
            "ms": "ms",
            "s": "s",
            "r": "R",
            "x": "x",
            "med": "Median",
            "measurements": "Measurements",

            "x_axis_subgroups": "Subgroups",

            //chart names
            "xb_chart": "XB Chart",
            "xb_s_chart": "xb/s Chart",
            "mxb_ms_chart": "mxb/mS Chart",
            "xb_r_chart": "xb/r Chart",
            "mxb_mr_chart": "mxb/mR Chart",
            "x_ms_chart": "x/ms Chart",
            "x_mr_chart": "x/mr Chart",
            "s_chart": "S Chart",
            "r_chart": "R Chart",
            "svc_chart": "Single Value Chart",
            "pNet_chart": "Probability Plot",
            "pNet_xAxisTitle": "Measurement",
            "ms_chart": "S Chart",
            "mr_chart": "R Chart",
            "med_chart": "Median Chart",
            "med_r_chart": "Median/R Chart",

            // Boxplot            
            "bPlot_low": "Min",
            "bPlot_high": "Max",
            "bPlot_median": "Median",
            "bPlot_q1": "Q1",
            "bPlot_q3": "Q3",
            "bPlot_series": "Boxplot",
            "eliminated": "Eliminated",
            "Defect_Pareto_xAxis": "Defect",
            "Defect_Pareto_yAxis": "Count",
            "Pareto_chart_title": "Defect Pareto",
            "Defect_Pareto_percent_Tooltip_Caption": 'Percentage',
            "Defect_Pareto_count_Tooltip_Caption": 'Count',
            "Defect_Pareto_class_Tooltip_Caption": "Type",
            "Defect_Pareto_ID_Tooltip_Caption":"Defect ID",

            // CUSum
            "cuSum": "S",
            "cuSumLow": "SL",
            "CUSumHigh": "SH",
            "CUSumUCL": "UCL",
            "CUSumLCL": "LCL",
            "CUSumCL": "CL",
            "CUSum_chart": "Cumulative Sum Chart",

            "cuCount_chart": "Cumulative Count Chart",
            "cuCount": "Cumulative Count",
            "Annotation": "Annotation",
            "Attachment":"Attachment"
        };
    }
}

function SubgroupContainsStatus(subgroup, status) {
    var statusExists = false;
    if (subgroup.statuses && subgroup.statuses.length > 0) {
        for (var i = 0; i < subgroup.statuses.length; i++)

            if (strToLowerCase(subgroup.statuses[i].category)== status.toLowerCase()) {
                statusExists = true;
                break;
            }
    }
    return statusExists;
}

function parseChartType(chartType) {
    if (chartType && typeof chartType === 'string') {
        for (var key in chartTypes) {
            if (key.toLowerCase() === chartType.toLowerCase())
                return chartTypes[key];
        }
    }
    throw "Invalid Char type in parameter, valid values can be one from these -> xb_s, mxb_ms, xb_R, mxb_mR, x_ms, x_mR, xb, s, r, hist_S, hist_T ";
}



function parseAttrChartType(chartType) {
    if (chartType && typeof chartType === 'string') {
        for (var key in attrChartTypes) {
            if (key.toLowerCase() === chartType.toLowerCase())
                return attrChartTypes[key];
        }
    } else
        throw "Invalid Char type in parameter, valid values can be one from these -> xb_s, mxb_ms, xb_R, mxb_mR, x_ms, x_mR, xb, s, r,hist_S,hist_T ";
}

function getLocalizedText(key, locale) {
    var text = '';
    if (key && locale && Highcharts.uiLocale[locale]) {
        var matchedKey = Object.keys(Highcharts.uiLocale[locale]).filter(function (k) {
            return k.toLowerCase() === key.toLowerCase();
        });
        if (matchedKey.length > 0) {
            text = Highcharts.uiLocale[locale][matchedKey[0]];
        }
    } else {
        console.log('Text not found for key ' + key + ' and locale ' + locale);
    }
    return text;
}

function getVoilations(inputObj) {
    var lowercaseStatuses = [];
    if (inputObj) {
        lowercaseStatuses =
            $.map(inputObj, function (el) {
                if (el.category)
                    return el.category.toString().toLowerCase();
            });
    }
    return lowercaseStatuses;
}

function roundFloat(inputFloat, decimalPlaces, nullReturn) {
    //Note: parseFloat of null, undefined and empty string is NaN
    if (!isNaN(parseFloat(inputFloat)) && !isNaN(parseFloat(decimalPlaces))) {
        return parseFloat(parseFloat(inputFloat.toString()).toFixed(decimalPlaces));
    } else if (!isNaN(parseFloat(inputFloat)) && !decimalPlaces)
        return parseFloat(inputFloat);

    if (nullReturn === true)
        return null

    return inputFloat;
}

function isNullOrUndefined(input) {
    return input === null || input === undefined;
}

function getColoredSeriesZone(interval, color) {
    var zone = [];

    for (var i = 0; i < interval.length; i++) {
        zone.push({ value: interval[i][0] }, { value: interval[i][1], color: color });
    }

    return zone;

}

function getSequence(violatedSubgroupsNumber) {
    var tempSeq = [];
    var interval = [];
    //TODO: here should be check added against violatedSubgroupsNumber for null or it's type should be checked against array
    tempSeq.push(violatedSubgroupsNumber[0]);
    for (var i = 1; i < violatedSubgroupsNumber.length; i++) {
        if (Math.abs(violatedSubgroupsNumber[i + 1] - violatedSubgroupsNumber[i]) == 1)
            tempSeq.push(violatedSubgroupsNumber[i])
        else {
            tempSeq.push(violatedSubgroupsNumber[i]);
            interval.push([Math.min.apply(null, tempSeq), Math.max.apply(null, tempSeq)]);
            tempSeq = [];
        }
    }

    return interval;
}

function createCustomHighStockSymbols() {
    if (Highcharts && Highcharts.SVGRenderer) {
        
        Highcharts.SVGRenderer.prototype.symbols.cross = function (x, y, w, h) {
            return ['M', x, y, 'L', x + w, y + h, 'M', x + w, y, 'L', x, y + h, 'z'];
        };
        
        Highcharts.SVGRenderer.prototype.symbols.box = function (x, y, w, h) {
            return ['M', x, y, 'L', x + w, y, 'M', x + w, y, 'L', x + w, y + h, 'M', x + w, y + h, 'L', x, y + h, 'M', x, y + h, 'L', x, y, 'z'];
        };

        (function (H) {
            var addEvent = H.addEvent,
                each = H.each,
                Renderer = H.Renderer,
                SVGRenderer = H.SVGRenderer,
                VMLRenderer = H.VMLRenderer,
                symbols = SVGRenderer.prototype.symbols,
                simpleShapes = ['circle', 'square', 'diamond'],
                additionalShapes = ['flag', 'circlepin', 'squarepin', 'diamondpin'];

            // create the circlepin, squarepin and diamondpin icons with anchor
            each(simpleShapes, function (shape) {
                symbols[shape + 'pin'] = function (x, y, w, h, options) {

                    var anchorX = options && options.anchorX,
                        anchorY = options && options.anchorY,
                        path,
                        labelTopOrBottomY;

                    // For single-letter flags, make sure circular flags are not taller than their width
                    if (shape === 'circle' && h > w) {
                        x -= Math.round((h - w) / 2);
                        w = h;
                    }

                    path = symbols[shape](x, y, w, h);

                    if (anchorX && anchorY) {
                        // if the label is below the anchor, draw the connecting line from the top edge of the label
                        // otherwise start drawing from the bottom edge
                        labelTopOrBottomY = (y > anchorY) ? y : y + h;
                        path.push('M', anchorX, labelTopOrBottomY, 'L', anchorX, anchorY);
                    }

                    return path;
                };
            });

            // The symbol callbacks are generated on the SVGRenderer object in all browsers. Even
            // VML browsers need this in order to generate shapes in export. Now share
            // them with the VMLRenderer.
            if (Renderer === VMLRenderer) {
                each(additionalShapes, function (shape) {
                    VMLRenderer.prototype.symbols[shape] = symbols[shape];
                });
            }
        }(Highcharts));
        
    }
}
function resolveOverlappingFlags() {
    (function (H) {
        function collide(a, b) {
            return !(b.x > a.x + a.width || b.x + b.width < a.x || b.y > a.y + a.height || b.y + b.height < a.y);
        }

        H.wrap(H.seriesTypes.flags.prototype, 'drawPoints', function (p) {
            var series = this,
                chart = series.chart,
                overlap = true,
                counter = 0,
                index,
                offset = series.options.stackDistance,
                currentBBox,
                compareBBox,
                compareSeries;

            p.call(this);

            while (overlap && counter < 100) { // as long as flags do overlap, move them. Extra limiter up to 100 iterations.
                overlap = false;
                H.each(series.points, function (currentPoint) {
                    if (currentPoint.graphic) { // only existing point with label

                        index = 0;
                        currentBBox = {
                            x: currentPoint.graphic.translateX,
                            y: currentPoint.graphic.translateY,
                            width: currentPoint.graphic.width,
                            height: currentPoint.graphic.height
                        };

                        for (; series.index - index >= 0; index++) { // compare only with previous series

                            compareSeries = chart.series[index];

                            if (compareSeries.options.type === "flags") { // only flag type seires

                                H.each(compareSeries.points, function (comparePoint) { // compare current label with all others
                                    if (compareSeries === series && comparePoint.index >= currentPoint.index) {
                                        return; // perf
                                    }

                                    if (comparePoint.graphic) { // only existing point with label

                                        compareBBox = {
                                            x: comparePoint.graphic.translateX,
                                            y: comparePoint.graphic.translateY,
                                            width: comparePoint.graphic.width,
                                            height: comparePoint.graphic.height
                                        };

                                        if (collide(currentBBox, compareBBox)) { // when collide, move current label to top
                                            overlap = true;
                                            currentPoint.graphic.attr({
                                                y: currentPoint.graphic.attr("y") - offset,
                                                anchorY: currentPoint.plotY
                                            });
                                            currentPoint.tooltipPos[1] -= offset;
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
                counter++;
            }
        });
    })(Highcharts);
}
function init() {
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    if (Highcharts && !Highcharts.uiLocale)
        Highcharts.uiLocale = {};
    setDefaultLocaleText();
    createCustomHighStockSymbols();
    resolveOverlappingFlags();
}
function strToLowerCase(str) {
    if (typeof str === 'string')
        return str.toLowerCase();
}
//function moving_average(array) {

//    for (var i = 1; i < array.length; i++) {
//        var result = []
//        result.push(array[i] - array[i - 1]);
//    }

//    return arr => result.reduce((a, b) => a + b, 0) / result.length;
//}
function getStatuse(statuses,key) {
    var status = [];
    if (statuses && statuses.filter) {
        status = statuses.filter(function (s) {
            if (s.category && s.category.toLowerCase() === key) {
                return true;
            }
        });
    }

    return statuses;
}


init();

}) (jQuery);