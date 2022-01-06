// Copyright Siemens 2019  

function focusInccorectDiv(sampleSeq, id)
{
    setTimeout("setFocusSampleCell('" + sampleSeq + "','" + id + "')", 500);
}

function setFocusSampleCell(sampleSeq, id)
{
    var ctl = $("div[sampleSeq=" + sampleSeq + "]");
    if (ctl.length > 0)
    {
        ctl.click(); 
    }
}

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
Type.registerNamespace("CamstarPortal.WebControls");

CamstarPortal.WebControls.DataPointSampleValidationStatus = function ()
{
    throw Error.invalidOperation();
};

CamstarPortal.WebControls.DataPointSampleValidationStatus.prototype = {
    None: 0,
    SpecError: 1,
    WarningError: 2,
    DataTypeError: 3
};


CamstarPortal.WebControls.DataPointSampleValidationStatus.registerEnum("CamstarPortal.WebControls.DataPointSampleValidationStatus", false);

CamstarPortal.WebControls.DataCollection = function (element)
{
    CamstarPortal.WebControls.DataCollection.initializeBase(this, [element]);
    this._element = [element];
    this._inputElement = null;
    this.nextDivIndex = 0;

    this._prevSampleDivObj = null;
    this._currentSampleDivObj = null;

    this._errorStatus = CamstarPortal.WebControls.DataPointSampleValidationStatus.None;
    this._dataTypeErrorMessage = "";
    this._dateControl = null;
    this._dateControlID = null;
    this._readOnly = false;
}

CamstarPortal.WebControls.DataCollection.prototype =
{
    initialize: function ()
    {
        CamstarPortal.WebControls.DataCollection.callBaseMethod(this, 'initialize');

        this._dateControl = $("#" + this.get_DateControlID());
        if (this._dateControl.length > 0)
        {
            this._dateControl.hide();
        }

        if (!this.get_ReadOnly())
        {
            // bind the events
            var obj = $(this._element[0]);

            obj.click(function (event) { this.control._onMouseClick(event); });

            obj.focus(function () { });

            obj.focusout(function (event) { this.control._onBlur(event); });

            obj.keydown(function (event) { this.control._onKeydown(event); });
        }
    },

    dispose: function ()
    {
        CamstarPortal.WebControls.DataCollection.callBaseMethod(this, 'dispose');
    },

    getDataPointType: function (id)
    {
        return $get(id).getAttribute("dataPointType");
    },

    get_inputElement: function ()
    {
        return this._inputElement;
    },

    remove_InputElement: function ()
    {
        this._inputElement = null;
    },

    callServerMethodDataCollection: function (divObj, dataValue)
    {
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("ValidateSampleDataValue");
        var callParameters =
        {
            "Group": parseInt(divObj.attr('groupIndex')),
            "DPIndex": parseInt(divObj.attr('dataPointIndex')),
            "CountSamples": parseInt(divObj.attr('countAllSamples')),
            "SampleIndex": parseInt(divObj.attr('currentSampleIndex')),
            "CellID": divObj.attr("id"),
            "Value": escape(dataValue)
        };
        var callParamsString = Sys.Serialization.JavaScriptSerializer.serialize(callParameters);
        transition.set_commandParameters(callParamsString);
        transition.set_clientCallback("refreshDataCollectionContent");

        var communicator = new Camstar.Ajax.Communicator(transition, this);
        communicator.syncCall();

        return false;
    },

    refreshDataCollectionContent: function (responseSection)
    {
        __page.hideModal();
        var div = $get(responseSection.ResponseID);
        if (div != null)
        {
            switch (eval('CamstarPortal.WebControls.DataPointSampleValidationStatus.' + responseSection.Data.Message))
            {
                case CamstarPortal.WebControls.DataPointSampleValidationStatus.None:
                    div.removeClass("DataCollection-DataTypeError");
                    div.removeClass("DataCollection-SpecError");
                    div.removeClass("DataCollection-WarningError");
                    div.addClass("DataCollection-NoError");
                    break;
                case CamstarPortal.WebControls.DataPointSampleValidationStatus.SpecError:
                    div.removeClass("DataCollection-DataTypeError");
                    div.addClass("DataCollection-SpecError");
                    div.removeClass("DataCollection-WarningError");
                    div.removeClass("DataCollection-NoError");
                    div.style.backgroundColor = this._specErrorColor;
                    break;
                case CamstarPortal.WebControls.DataPointSampleValidationStatus.WarningError:
                    div.removeClass("DataCollection-DataTypeError");
                    div.removeClass("DataCollection-SpecError");
                    div.addClass("DataCollection-WarningError");
                    div.removeClass("DataCollection-NoError");
                    break;
                case CamstarPortal.WebControls.DataPointSampleValidationStatus.DataTypeError:
                    div.addClass("DataCollection-DataTypeError");
                    div.removeClass("DataCollection-SpecError");
                    div.removeClass("DataCollection-WarningError");
                    div.removeClass("DataCollection-NoError");
                    div.setAttribute("title", this._dataTypeErrorMessage);
                    break;
                default:
                    div.style.backgroundColor = this._noErrorColor;
            }
        }
    },

    // Dll name should be specified
    get_serverType: function () { return "CamstarPortal.WebControls.DataCollection, CamstarPortal.WebControls"; },
    set_serverType: function (servType) { },

    get_controlId: function () { return this._element[0].id; },

    findDiv: function (activatedElement)
    {
        var elObj = null;
        if (activatedElement)
        {
            elObj = $(activatedElement);
            if (elObj.attr("dataPointType") == null)
            {
                var container = elObj.parent();
                elObj = null;
                while (container.length > 0)
                {
                    if (container[0].tagName == "DIV")
                    {
                        if (container.attr("dataPointType"))
                            elObj = container;
                        break;
                    }
                    container = container.parent();
                }
            }
        }
        return elObj;
    },

    _onKeydown: function (event)
    {
        if (event.keyCode == 9)
        {
            event.cancelBubble = true;
            event.preventDefault();

            var isBackMove = event.shiftKey;
            var clickedDivObj = this.findDiv(event.target);
            if (clickedDivObj)
            {
                // Move to the next cell
                var tabInd = parseInt(clickedDivObj.attr("sampleSeq"));
                if (isBackMove)
                {
                    if (tabInd == 0)
                        return false;
                    tabInd--;
                }
                else
                {
                    tabInd++;
                }
                var nextObj = $(this._element[0]).find("[sampleSeq=\"" + tabInd.toString() + "\"]");
                if (nextObj != null && nextObj.length > 0)
                    clickedDivObj = nextObj;
                else
                    clickedDivObj = null;

                this._prevSampleDivObj = this._currentSampleDivObj;
                this._currentSampleDivObj = clickedDivObj;

                if (clickedDivObj)
                {
                    // Enlarge simple section if it's closed
                    var groupIndex = clickedDivObj.attr("groupIndex");

                    var simpleSection = $find($("span[class=SimpleSection]")[0].id);
                    var panel = simpleSection.get_Pane(groupIndex);

                    if (panel != null && panel.content.style.display == 'none')
                    {
                        var e = jQuery.Event("click");
                        e.target = panel.header;
                        simpleSection._onHeaderClick(e);
                    }
                    this._currentSampleDivObj.focus();
                }
                else
                {
                    this._currentSampleDivObj = null;
                }

                this.switchSampleCell();
            }
            return false;
        }
    },

    _onMouseClick: function (event)
    {
        var clickedDivObj = this.findDiv(event.target);
        if (clickedDivObj)
        {
            // If click on the same cell - ignore
            if (this._currentSampleDivObj != null && clickedDivObj != null && clickedDivObj.attr("id") == this._currentSampleDivObj.attr("id"))
                return;

            this._prevSampleDivObj = this._currentSampleDivObj;
            this._currentSampleDivObj = clickedDivObj;

            this.switchSampleCell();
        }
    },

    _onBlur: function (event)
    {
        var divObj;
        var toElement = event.originalEvent.toElement;
        if (toElement == null)
        {
            toElement = event.originalEvent.explicitOriginalTarget;
        }
        if (toElement && toElement.nodeName != "BODY")
        {
            if ($(toElement).parents(".DateChooserControl").length == 0)
            {
                if ($(toElement).parents(".calStyle").length == 0)
                {
                    divObj = this.findDiv(toElement);
                    if (divObj == null && this._currentSampleDivObj != null)
                    {
                        this._prevSampleDivObj = this._currentSampleDivObj;
                        this._currentSampleDivObj = null;

                        this.switchSampleCell();
                    }
                }
            }
        }
    },

    switchSampleCell: function ()
    {
        var dpType;

        if (this._prevSampleDivObj)
        {
            // Deactivate leaved cell
            dpType = this._prevSampleDivObj.attr("dataPointType");
            var val = this.updateSample(this._prevSampleDivObj, dpType);
            val = val.trim();

            switch (dpType)
            {
                case "Boolean":
                    {
                        // Do nothing
                        //var checkBox = this._prevSampleDivObj.find(":checkbox");
                    }
                    break;
                case "Timestamp":
                    {
                        this._prevSampleDivObj.text(val);
                    }
                    break;
                case "Decimal": case "Integer": case "String":
                    {
                        var inputBox = this._prevSampleDivObj.find("input");
                        if (inputBox.length > 0)
                        {
                            this._prevSampleDivObj.empty();
                            this._prevSampleDivObj.text(val);
                        }
                    }
                default:
                    break;
            }
        }

        if (this._currentSampleDivObj)
        {
            // Prepare activated cell
            dpType = this._currentSampleDivObj.attr("dataPointType");
            switch (dpType)
            {
                case "Boolean":
                    {
                        var checkBox = this._currentSampleDivObj.find(":checkbox");
                        if (checkBox.length == 0)
                        {
                            // Create if thE checkbox was not created
                            this._currentSampleDivObj.html("<input type='checkbox' value='on'>");
                            checkBox = this._currentSampleDivObj.find(":checkbox");
                        }
                        this._currentSampleDivObj.focus();
                        checkBox.focus();
                    }
                    break;
                case "Timestamp":
                    {
                        val = this._currentSampleDivObj.text().trim();
                        if (val != null && val != "")
                            val = new Date(val);

                        var currentParent = this._dateControl.parent();
                        if (currentParent.length > 0 && currentParent[0] != this._currentSampleDivObj[0])
                            this._dateControl = this._dateControl.detach();
                        this._dateControl.show();
                        this._currentSampleDivObj.empty();
                        this._currentSampleDivObj.append(this._dateControl);
                        var dateChooserObj = this.getDateChooserObj();
                        dateChooserObj.setValue(val);
                        dateChooserObj.focus();
                    }
                    break;
                case "Decimal": case "Integer": case "String":
                    {
                        val = this._currentSampleDivObj.text().trim();
                        // Create input type=text control
                        this._currentSampleDivObj.html("<input type='text' ownerControl='" + this._element[0].id + "' style='width:100%; height:100%' value='" + val + "'>");
                        this._currentSampleDivObj.children().first().focus();
                        if (Camstars.Browser.FireFox)
                        {
                            this._currentSampleDivObj.children().first().focusout(
                                function (event)
                                {
                                    var dc = $("span.DataCollectionControl")[0].control;
                                    dc._onBlur(event);
                                });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    },

    updateSample: function (divObj, dpType)
    {
        var val = this.getSampleValue(divObj, dpType);
        this.callServerMethodDataCollection(divObj, val);
        return val;
    },

    getSampleValue: function (divObj, dpType)
    {
        if (dpType == null)
            dpType = divObj.attr("dataPointType");
        var val = '';

        switch (dpType)
        {
            case "Boolean":
                {
                    var checkBox = divObj.find(":checkbox");
                    if (checkBox.length > 0)
                        val = checkBox[0].checked.toString();
                }
                break;
            case "Timestamp":
                if (divObj.find("table"))
                {
                    // date control is inserted into the current div
                    var dateChooserObj = this.getDateChooserObj();
                    if (dateChooserObj)
                    {
                        val = dateChooserObj.getValue();
                        if (val)
                            val = val.format("MM/dd/yyyy");
                        else
                            val = "";
                    }
                }
                else
                {
                    val = divObj.text();
                }
                break;
            case "Decimal": case "Integer": case "String":
                if (divObj.find("input").length > 0)
                    val = divObj.find("input").first().val();
                else
                    val = "";
                break;
            default:
                val = '';
                break;
        }

        val = val.trim();
        return val;
    },

    get_DataPointSampleValidationStatus: function () { return this._errorStatus; },
    set_DataPointSampleValidationStatus: function (value)
    {
        this._errorStatus = value;
        this.raisePropertyChanged('DataPointSampleValidationStatus');
    },

    get_DataTypeErrorMessage: function () { return this._dataTypeErrorMessage; },
    set_DataTypeErrorMessage: function (value) { this._dataTypeErrorMessage = value; },

    get_DateControlID: function () { return this._dateControlID; },
    set_DateControlID: function (value) { this._dateControlID = value; },

    get_ReadOnly: function () { return this._readOnly; },
    set_ReadOnly: function (value) { this._readOnly = value; },

    getDateChooserObj: function () { return igdrp_getComboById(this.get_DateControlID()); }
}

CamstarPortal.WebControls.DataCollection.registerClass('CamstarPortal.WebControls.DataCollection', Camstar.UI.Control);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
