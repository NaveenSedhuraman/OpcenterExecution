// © 2019 Siemens Product Lifecycle Management Software Inc.
Type.registerNamespace("Camstar.WebPortal.FormsFramework.WebControls");

Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC = function(element) 
{
    Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC.initializeBase(this, [element]);

    this._cssClass = null;
    this._dataJson = null;
    this._options = null;
    this._chartType = null;
    this._dataJson = null;
    this._spcName = null;
    this._metricName = null;
    this._controlId = null;
    this._clientId = null;
    this._docName = null;
};

Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC.prototype =
{
    initialize: function()
    {
        Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC.callBaseMethod(this, "initialize");

        this._measurements = [];
        this._subgroup = 1;
        this.calculateAndDraw();
    },

    seriesClick: function (data) {
        var id = null;
        if (data.sequenceId !== undefined) {
            var el = null;
            this._measurements.some(function (val) {
                if (val.sequenceId === data.sequenceId) {
                    el = val;
                    return true;
                }
                return false;
            });
            if (el)
                id = el.id;
        }
        else if (!isNaN(data.subgroupNumber)) {
            id = data.referenceId;
        }
        if (id !== null)
            return annotate(this._spcName, id, this._metricName);
        return false;
    },

    calculateAndDraw: function() {
        var me = this;

        //if (this._docName) {
            
        //}

        if (this._dataJson) {
            var decodedData = atob(this._dataJson);
            var obj = JSON.parse(decodedData); 
            if (obj.subgroups) {
                me.drawControl(obj, obj.violationDocName);
            }
            else {
                if (this._spcServerUrl) {
                    $.ajax({
                        url: this._spcServerUrl,
                        contentType: "application/json",
                        method: "POST",
                        data: decodedData,
                        success: function (data) {
                            me.drawControl(data);
                        },
                        // error: Error,
                        dataType: "JSON"
                    });
                }
            }
        }
    },

    drawControl: function (data, docName) {
        var $control = $(this._element);
        if (this._cssClass && !$control.hasClass(this._cssClass))
            $control.addClass(this._cssClass);

        if (data) {
            var hasErrors = false;
            if (data.messages) {
                var errors = data.messages.filter(function(m) {
                    return m.level === "error";
                });
                hasErrors = errors.length > 0;
                if (hasErrors) {
                    __page.displayStatus(errors[0].messageLong, "Error");
                }
            }
            if (!hasErrors) {
                var options = JSON.parse(this._options);
                if (data.measurements)
                    this._measurements = data.measurements.map(function(value) {
                        return { "id": value.referenceID, "sequenceId": value.sequenceID };
                    });
                if (data.specifications)
                    this._subgroup = data.specifications.subgroupSize > 0 ? data.specifications.subgroupSize : 1;

                if (options.backgroundColor) {
                    if (!this.hasViolations(data.subgroups))
                        options.backgroundColor = "";
                }

                options.locale = options.locale || "en";
                options.data = data;
                options.onSeriesClick = this.seriesClick.bind(this);

                if (options.chartType === "HistogramChart") {
                    $control.histogramChart(options);
                }
                else if (options.chartType === "SingleValueChart") {
                    $control.singleValueChart(options);
                }
                else if (options.chartType === "ProbabilityPlot") {
                    $control.probabilityPlot(options);
                }
                else if (options.chartType === "AttributiveControlChart") {
                    $control.attrControlChart(options);
                }
                else if (options.chartType === "CumulativeSumChart") {
                    $control.cumulativeSumChart(options);
                }
                else if (options.chartType === "CumulativeCountChart") {
                    $control.cumulativeCountChart(options);
                }
                else if (options.chartType === "UCumulativeSumChart") {
                    $control.cumulatedUSumChart(options);
                }
                else if (options.chartType === "DefectPareto") {
                    $control.defectPareto(options);
                }
                else {
                    options.chartType = data.controlChartType || data.specifications.controlChartType;
                    $control.chart(options);
                }
            }
            this.attachDocument(docName);
        }
    },

    refreshSPCChart: function (responseSection) {
        if (responseSection) {
            var json = responseSection.Data.Message;
            if (json) {
                this._dataJson = json;
                this.calculateAndDraw();
            }
        }
    },

    hasViolations: function(subgroups) {
        if (subgroups && Array.isArray(subgroups) && subgroups.length > 0) {
            var statuses = subgroups[subgroups.length - 1].statuses;
            if (statuses && Array.isArray(statuses) && statuses.length > 0) {
                return statuses.some(function (s) {
                    if (s.category) {
                        return s.category.toLowerCase() === 'processviolation_1' ||
                            s.category.toLowerCase() === 'processviolation_2';
                    }
                    return false;
                });
            }
        }
        return false;
    },

    attachDocument: function(docName) {
        if (docName) {
            var doc = $('<div class=\"spcChartDoc\"></div>');
            var link = $("<a></a>",
                {
                    href: 'javascript:DownloadFile(\"' + docName + '\")'
                });
            link.text(docName);
            doc.append(link);
            $(this._element).append(doc);
        }
    },

    dispose: function () {
        this._cssClass = null;
        this._dataJson = null;
        this._options = null;
        this._chartType = null;
        this._spcName = null;
        this._metricName = null;
        this._controlId = null;
        this._clientId = null;
        this._docName = null;
        this._measurements = null;

        Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC.callBaseMethod(this, "dispose");
    },

    get_Hidden: function() { return this._element.style.display == "none"; },
    set_Hidden: function(value)
    {
        if (value === true)
        {
            this._element.style.display = "none";
            this._label.style.display = "none";
        }
        else
        {
            this._element.style.display = "";
            this._label.style.display = "";
        }
    },

    get_cssClass: function() { return this._cssClass; },
    set_cssClass: function (value) { this._cssClass = value; },
    get_chartType: function () { return this._chartType; },
    set_chartType: function (value) { this._chartType = value; },

    get_spcServerUrl: function () { return this._spcServerUrl; },
    set_spcServerUrl: function (value) { this._spcServerUrl = value; },
    get_options: function () { return this._options; },
    set_options: function (value) { this._options = value; },
    

    get_data: function () { return this._dataJson; },
    set_data: function (value) { this._dataJson = value; },

    get_metricName: function () { return this._metricName; },
    set_metricName: function (value) { this._metricName = value; },

    get_spcName: function () { return this._spcName; },
    set_spcName: function (value) { this._spcName = value; },

    get_controlId: function () { return this._controlId; },
    set_controlId: function (value) { this._controlId = value; },

    get_clientId: function () { return this._clientId; },
    set_clientId: function (value) { this._clientId = value; }

    //get_docName: function () { return this._docName; },
    //set_docName: function (value) { this._docName = value; }

};

Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC.registerClass("Camstar.WebPortal.FormsFramework.WebControls.SPCChartCC", Camstar.UI.Control);

if (typeof (Sys) !== "undefined") Sys.Application.notifyScriptLoaded();


