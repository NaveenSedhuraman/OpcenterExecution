// Copyright Siemens 2020  

var mkUserFieldsDiv = "userFieldsDiv";
var mkParametricDiv = "parametricDiv";
var mkValidateFunctionName = "OnDCDFieldValueChanged";
var mDisabledKeyAlert = "This key has been disabled.";
var gkBackSpaceKeyCode = 8;
var gkKeyCode = "";

// The control name where current scroll position are saver on post back
var	mPositionInputName = "__position";

var Camstars =
{
    Browser: 
    {
        IE:     /*@cc_on!@*/false || !!document.documentMode,
        Opera:  !!window.opera,
        WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
        Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
        MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
        FireFox: !document.all,
        IsMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
};

Camstars.Object = 
{
    extend: function(destination, source)
    {
        if (arguments.length == 1)
        {
            source = this;
        }
        
        for (var property in source)
        {
            
            if (this.isFunction(source[property]) && source[property].arguments && source[property].arguments.length == 1)
            {
                destination[property] = source[property](destination);
            }
            else
            {
                destination[property] = source[property];
            }
        }
    
        return destination;
    },
    
    isString: function(object)
    {
        return typeof object == "string";
    },
    
    isElement: function(object)
    {
        return object && object.nodeType == 1;
    },
   
    isUndefined: function(object)
    {
        return typeof object == "undefined";
    },
    
    isFunction: function(object)
    {
        return typeof object == "function";
    }
};

Camstars.Event = 
{
    extend: function(destination)
    {
       destination.addEvent = function(eventName, wrapper){ Camstars.Event.addEvent(this, eventName, wrapper); };
       destination.removeEvent = function(eventName, wrapper){ Camstars.Event.removeEvent(this, eventName, wrapper); };
    },
    
    addEvent: function(element, eventName, wrapper)
    {
        if (element.addEventListener)
        {
            return element.addEventListener(eventName, wrapper, false);
        }
        else
        {
            return element.attachEvent(eventName.indexOf("on") > -1 ? eventName : "on" + eventName, wrapper);
        }
    },
    
    removeEvent: function(element, eventName, wrapper)
    {
        if (element.removeEventListener)
        {
            return element.removeEventListener(eventName, wrapper, false);
        }
        else
        {
            return element.detachEvent(eventName.indexOf("on") > -1 ? eventName : "on" + eventName, wrapper);
        }
    }
};


Camstars.Controls =
{
    getValueById: function (editorClientId)
    {
        var ctl = $find(editorClientId);
        var val = "";
        if (ctl)
        {
            if (ctl.getValue != undefined)
            {
                val = ctl.getValue();
            }
            else if (ctl._element != undefined)
            {
                if (ctl._element.value != undefined)
                    val = ctl._element.value;
                else
                {
                    //some container element. Check for file uploader
                    var elemFile = $("#" + editorClientId).find("input[type='text']");
                    if (elemFile.length) {
                        val = elemFile.val();
                        if (val.lastIndexOf("\\") != -1)
                            val = val.substring(val.lastIndexOf("\\") + 1);
                    }
                }
            }
        }
        else
        {
            // Try jquery object
            ctl = $("#" + editorClientId);
            if (ctl && ctl.length > 0) {
                if (ctl.find("input[type='file']").length > 0)
                {
                    val = ctl.find("input[type='file']").val();
                    // leave only file name
                    if (val.lastIndexOf("\\") != -1)
                        val = val.substring(val.lastIndexOf("\\") + 1);
                }
                else
                {
                    val = ctl.val();
                    if (val)
                    {
                        if (ctl.is(':checkbox'))
                        {
                            val = ctl.is(':checked');
                        }
                    }
                    else if (ctl.length == 1 && ctl[0].tagName === "SPAN")
                    {
                        //deals with wrapped elements
                        ctl = ctl.find("input");
                        if (ctl && ctl.attr("type") === "radio")
                            val = ctl[0].checked.toString();
                    }
                }
            }
        }
        return val;
    },

    setValueById: function (editorClientId, value, takeDefault)
    {
        var ctl = $find(editorClientId);
        if (ctl)
        {
            if (takeDefault && ctl.get_defaultValue && (value === undefined || value == null || value === '')) {
                value = ctl.get_defaultValue() || value;
            }

            if (ctl.directUpdate != undefined && ctl.GridID == undefined)
            {
                ctl.directUpdate({ PropertyKey: eval(Camstar.Ajax.DirectUpdateParameterKeys.Data), PropertyValue: value });
            }
            else
            {
                if (ctl.setValue != undefined)
                    ctl.setValue(value);
            }
        }
        else
        {
            ctl = $("#" + editorClientId);
            if (ctl && ctl.length > 0)
            {
                if (takeDefault && (value === undefined || value == null || value === '')) {
                    value = ctl.attr("defaultValue") || ctl.parent().attr("defaultValue") || value;
                }

                if (ctl[0].type == "checkbox")
                    ctl[0].checked = (value == "True" || value == 1);
                else
                    ctl.val(value);
            }
        }
    }
}

Camstars.Object.extend(String.prototype, {
    empty: function()
    {
        return this == "";
    }
});

Camstars.Object.extend(window, {
    getViewportHeight: function()
    {
        if (window.innerHeight != window.undefined) return window.innerHeight;
	    if (document.compatMode == "CSS1Compat") return document.documentElement.clientHeight;
	    if (document.body) return document.body.clientHeight;
	    return window.undefined;
    },
    
    getViewportWidth: function()
    {
        if (window.innerWidth!=window.undefined) return window.innerWidth;
	    if (document.compatMode=='CSS1Compat') return document.documentElement.clientWidth;
	    if (document.body) return document.body.clientWidth;
	    return window.undefined;
    },
    
    getScrollTop: function()
    {
        if (window.pageYOffset) return window.pageYOffset;
		if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop;
		if (document.body) return document.body.scrollTop;
    },
    
    getScrollLeft: function()
    {
        if (window.pageXOffset) return window.pageXOffset;
		if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollLeft;
		if (document.body) return document.body.scrollLeft;
    }
});

// The method is event handler used for InterationGrid PDD control. 
// It is invoked when text box with number (int, float, dec, fixed) inside is changed. 
// The method verifies the value and if the value is out of the limits the background color is switched.
// The colors are defined in the CSS classes.
// The method is also invoked to revalidate related data points if the Is Limit Override check box is being clicked.
// Parameters:
//     string lowerLimit, upperLimit   - value limits;
//     bool   isLimitOverrideAllowed   - true if the the value can be out of the limits. 
//     int    layoutMode               - current dataPointSummary rendering mode: 
//                                      1- IterationGrid; 2 - RowColumn; 0 - validation disabled.
//     string valueType                - type of validated value
function OnDCDFieldValueChanged(lowerLimit, upperLimit, isLimitOverrideAllowed, layoutMode, valueType)
{
    var sampleRow = null;
    if(event.srcElement != null)
    {
        var inputElement = event.srcElement;
        if (valueType== null)
        {
            // The Override value checkbox was clicked.
            sampleRow = GetSampleRow(inputElement);
            if (sampleRow == null)
                return;
                
            var inputs = sampleRow.getElementsByTagName("INPUT");
                for(var j=0; j<inputs.length; j++)
                {
                    if (inputs[j].type == "text")
                    {
                        if (inputs[j].onchange != null)
                            if (inputs[j].onchange.toString().indexOf(mkValidateFunctionName)>=0)
                            {
                                // The text box onchange event should be fired.
                                inputs[j].fireEvent("onchange");
                            }
                    }
                    else if (inputs[j].type == "checkbox")
                    {
                        if (inputs[j].onclick != null)
                            if (inputs[j].onclick.toString().indexOf(mkValidateFunctionName)>=0 && inputs[j] != inputElement)
                            {
                                // The text box onchange event should be fired.
                                inputs[j].fireEvent("onclick");
                            }
                    }
                }
            inputs = sampleRow.getElementsByTagName("SELECT");
            for(var j=0; j<inputs.length; j++)
            {
                if (inputs[j].onchange != null)
                    if (inputs[j].onchange.toString().indexOf(mkValidateFunctionName)>=0 && inputs[j] != inputElement)
                    {
                        // The text box onchange event should be fired.
                        inputs[j].fireEvent("onchange");
                    }
            }
        }
        else
        {            
            var isCompositeLimitOverrideAllowed = isLimitOverrideAllowed;
            if (layoutMode == 1 || layoutMode == 2)
            {
                // Find checkbox IsOverrideAllowed for Iteration Grid           
                sampleRow = GetSampleRow(inputElement);                
                var ovrctl = GetOverrideEnableControl(sampleRow); 
                if (ovrctl != null)
                        isCompositeLimitOverrideAllowed = (ovrctl.checked && isLimitOverrideAllowed);
            }
            else
                return;

            // This is a comparison itself
            var currentValue = inputElement.value;
            if (valueType != "String" && valueType != "Boolean")
            {
                // Numeric validation
                currentValue = Number.parseLocale(currentValue);
                if(isNaN(currentValue) && inputElement.value != "")
                {
                    inputElement.parentElement.className = "TextMediumError";
                }
                else
                {
                    if (lowerLimit != null)
                        lowerLimit = Number.parseLocale(lowerLimit);
                    if (upperLimit != null)
                        upperLimit = Number.parseLocale(upperLimit);
                    if(((lowerLimit == null) || (lowerLimit != null && currentValue >= lowerLimit)) &&
                       ((upperLimit == null) || (upperLimit != null && currentValue <= upperLimit)) ||
                       (event.srcElement.value == ""))
                    {
                        inputElement.parentElement.className = "TextMedium";
                    }
                    else
                    {
                        inputElement.parentElement.className = isCompositeLimitOverrideAllowed ? "TextMediumWarning" : "TextMediumError";
                    }
                }
             }
             else if (valueType == "Boolean")
             {
                var boolValue = null;
                var isElementCheckBox = (inputElement.tagName == "INPUT");
                if (! isElementCheckBox )
                {
                    var selectedValue = inputElement.value;
                    if (selectedValue == "1") 
                        boolValue = "true";
                    else 
                        if (selectedValue == "0" ) 
                            boolValue = "false";
                }
                else
                {
                    boolValue = inputElement.checked ? "true" : "false";
                }
                var violation = false;
                if (boolValue!=null && lowerLimit != null && upperLimit!=null)
                {
                    lowerLimit = lowerLimit.toLocaleLowerCase();
                    upperLimit = upperLimit.toLocaleLowerCase();

                    if (lowerLimit == "1") lowerLimit = "true";
                    else if (lowerLimit == "0" ) lowerLimit = "false";

                    if (upperLimit == "1") upperLimit = "true";
                    else if (upperLimit == "0") upperLimit = "false";

                    if(lowerLimit == upperLimit)
                        violation = (boolValue != lowerLimit);
                }
                if (! violation) {
                    if (isElementCheckBox)
                        inputElement.className = "Checkbox";
                    else
                        inputElement.className = "SelectMedium";
                }
                else
                {
                    if (isElementCheckBox)
                    inputElement.className = isCompositeLimitOverrideAllowed ? "CheckboxWarning" : "CheckboxError";
                    else
                        inputElement.className = isCompositeLimitOverrideAllowed ? "SelectMediumWarning" : "SelectMediumError";
                }
             }
             else 
             {
                // String validation
                var stringValue = currentValue.toLocaleLowerCase();
                
                if (((lowerLimit == null) || (lowerLimit != null && stringValue.localeCompare(lowerLimit.toLocaleLowerCase()) >= 0)) &&
                   ((upperLimit == null) || (upperLimit != null && stringValue.localeCompare(upperLimit.toLocaleLowerCase()) <= 0)) ||
                   stringValue.length==0)
                {
                    event.srcElement.className = "TextMedium";
                }
                else
                {
                    event.srcElement.className = isCompositeLimitOverrideAllowed ? "TextMediumWarning" : "TextMediumError";
                }
             }
         }
    }
} //OnDCDFieldValueChanged

function OnDCDFieldValueChanged_Comp(el /* parent id or input element*/, lowerLimit, upperLimit, booleanTrue, booleanFalse, isLimitOverrideAllowed, layoutMode, valueType, inp, $dp) {

    var sampleRow = null;
    var element = (typeof el == "string") ? document.getElementById(el) : el;

    if (!element)
        return;

    if (!$(element).is(":input"))
        element = $(":input", element).get(0);

    var inputElement = element;

    if (valueType== null) {

        // The Override value checkbox was clicked.
        sampleRow = GetSampleRow(inputElement);
        if (sampleRow == null)
            return;
                
        var inputs = sampleRow.getElementsByTagName("INPUT");
        for(var j=0; j<inputs.length; j++) {
            if (inputs[j].type == "text") {
                if (inputs[j].onchange != null)
                    if (inputs[j].onchange.toString().indexOf(mkValidateFunctionName)>=0) {
                        // The text box onchange event should be fired.
                        inputs[j].fireEvent("onchange");
                    }
            }
            else if (inputs[j].type == "checkbox") {
                if (inputs[j].onclick != null)
                    if (inputs[j].onclick.toString().indexOf(mkValidateFunctionName)>=0 && inputs[j] != inputElement) {
                        // The text box onchange event should be fired.
                        inputs[j].fireEvent("onclick");
                    }
            }
        }
        inputs = sampleRow.getElementsByTagName("SELECT");
                    
        for(var j=0; j<inputs.length; j++) {
            if (inputs[j].onchange != null)
                if (inputs[j].onchange.toString().indexOf(mkValidateFunctionName)>=0 && inputs[j] != inputElement) {
                    // The text box onchange event should be fired.
                    inputs[j].fireEvent("onchange");
                }
        }
    }
    else {

        var isCompositeLimitOverrideAllowed = isLimitOverrideAllowed;
        var $inp = $(inputElement);
        var $inpContext = $inp.closest(".ParametricDataControl");

        if (!$dp) {
            $dp = $inp.closest('.DataPointItem');
            if (!$dp.length)
                $dp = $inp.closest('.DataPointItem-resp,.ShopFloorDCVerticalDataResp,.ShopFloorDCHorizontalDataResp', $inpContext);
        }

        // This is a comparison itself
        var currentValue = $inp.val();
        if (valueType != "String" && valueType != "Boolean") {
            // Numeric validation
            currentValue = Number.parseLocale(currentValue);
            if (isNaN(currentValue) && inputElement.value != "") {
                $(inputElement.parentElement).addClass("ui-error");
            }
            else {
                $(inputElement.parentElement).removeClass("ui-error");
                if (lowerLimit != null)
                    lowerLimit = Number.parseLocale(lowerLimit);
                if (upperLimit != null)
                    upperLimit = Number.parseLocale(upperLimit);
                var lowLimitBroken = lowerLimit != null && currentValue < lowerLimit;
                var upLimitBroken = upperLimit != null && currentValue > upperLimit;

                var inputWarningClass = isCompositeLimitOverrideAllowed ? "ui-warning" : "ui-error";
                var lowSpanWarningClass = isCompositeLimitOverrideAllowed ? "LL-warning" : "LL-error";
                var upSpanWarningClass = isCompositeLimitOverrideAllowed ? "UL-warning" : "UL-error";

                $(inputElement.parentElement).toggleClass(inputWarningClass, lowLimitBroken || upLimitBroken);
                $('.LL', $dp).toggleClass(lowSpanWarningClass, lowLimitBroken);
                $('.UL', $dp).toggleClass(upSpanWarningClass, upLimitBroken);
            }
        }
        else if (valueType == "Boolean") {
            var boolValue = null;
            var isElementCheckBox = $(inputElement).is(":checkbox");
            if (!isElementCheckBox) {
                boolValue = $inp.val() && $inp.val().toLocaleLowerCase();
                if (!boolValue)
                    boolValue = null;
            }
            else {
                boolValue = inputElement.checked ? "true" : "false";
            }
            var violation = false;
            var getLimit = function (lim, bTrue, bFalse) {
                var l = lim.toLocaleLowerCase();
                if (l == "1")
                    l = "true";
                else if (l == "0")
                    l = "false";
                else if (l == bTrue)
                    l = "true";
                else if (l == bFalse)
                    l = "false";
                return l;
            };

            if (boolValue != null && lowerLimit != null && upperLimit != null) {

                var booleanTrue = booleanTrue.toLocaleLowerCase();
                var booleanFalse = booleanFalse.toLocaleLowerCase();

                var lLimit = getLimit(lowerLimit, booleanTrue, booleanFalse);
                var uLimit = getLimit(upperLimit, booleanTrue, booleanFalse);

                if (lLimit == uLimit)
                    violation = (boolValue != lLimit);
            }
            // border color changed for parent SPAN
            if (isElementCheckBox)
                $inp.parent().toggleClass(isCompositeLimitOverrideAllowed ? "CheckboxWarning" : "CheckboxError", violation);
            else
                $inp.parent().toggleClass(isCompositeLimitOverrideAllowed ? "ui-warning-select" : "ui-error-select", violation);
        }    
        else {
            // String validation
            currentValue = currentValue || "";
            var stringValue = currentValue.toLocaleLowerCase();

            var lowSpanWarningClass = isCompositeLimitOverrideAllowed ? "LL-warning" : "LL-error";
            var upSpanWarningClass = isCompositeLimitOverrideAllowed ? "UL-warning" : "UL-error";                

            if (((lowerLimit == null) || (lowerLimit != null && stringValue.localeCompare(lowerLimit.toLocaleLowerCase()) >= 0)) &&
                ((upperLimit == null) || (upperLimit != null && stringValue.localeCompare(upperLimit.toLocaleLowerCase()) <= 0)) ||
                stringValue.length == 0) {

                $(".cs-textbox", $dp).removeClass(["ui-error", "ui-warning"]);
                $('.LL', $dp).removeClass(lowSpanWarningClass);
                $('.UL', $dp).removeClass(upSpanWarningClass);
            }
            else {                    
                var lowLimitBroken = lowerLimit != null && stringValue.localeCompare(lowerLimit.toLocaleLowerCase()) <= 0;
                var upLimitBroken = upperLimit != null && stringValue.localeCompare(upperLimit.toLocaleLowerCase()) >= 0;

                $(".cs-textbox", $dp).addClass(isCompositeLimitOverrideAllowed ? "ui-warning" : "ui-error");                    
                $('.LL', $dp).toggleClass(lowSpanWarningClass, lowLimitBroken);
                $('.UL', $dp).toggleClass(upSpanWarningClass, upLimitBroken);
            }                
        }
    }
} 

// Provides initial validation of data points after post backs.
// Parameters:
//       dataPointID   - ID of dataPoint control
//       initArray     - is the array of pairs of control ID and its event. 
function InitDataPointValidation(dataPointID, initArray)
{
    for(var i=0; i<initArray.length; i+=2)
    {
        var id = dataPointID + "_"+ initArray[i];
        var eventName = initArray[i+1];
        var validatedControl = null;
        
        // Search for the control
        var parentObj = document.all[id];
        var fired = false;
        if (parentObj != null)
        {
            var inputObjs = parentObj.getElementsByTagName("input");
            for(var j=0; j<inputObjs.length; j++)
            {
                var obj = inputObjs[j];
                if (eventName == "OnChange")
                {
                    if(obj.onchange != null)
                        if (obj.onchange.toString().indexOf(mkValidateFunctionName) >= 0 )
                        {
                            obj.fireEvent(eventName);
                            fired = true;
                            break;
                        }
                }
                else if (eventName == "OnClick")
                {
                    if(obj.onclick != null)
                        if (obj.onclick.toString().indexOf(mkValidateFunctionName) >= 0 )
                        {
                            obj.fireEvent(eventName);
                            fired = true;
                            break;
                        }
                }
            }

            if (!fired)
            {
                var selectObjs = parentObj.getElementsByTagName("select");
                for(var j=0; j<selectObjs.length; j++)
                {
                    var obj = selectObjs[j];
                    if (eventName == "OnChange")
                    {
                        if(obj.onchange != null)
                            if (obj.onchange.toString().indexOf(mkValidateFunctionName) >= 0 )
                            {
                                obj.fireEvent(eventName);
                                break;
                            }
                    }
                }
            }
        }
    }
} // InitDataPointValidation

function InitDataPointValidation_Comp(dataPointID, initArray) {

    for (var i = 0; i < initArray.length; i += 2) {
        var elementId = dataPointID + "_" + initArray[i];
        var eventName = initArray[i + 1];

        // Search for the control
        var element = document.getElementById(elementId);
        if (element != null && element.childNodes[0]) {
            element = element.childNodes[0];
            var obj = element;
            var booleanControl = $('#' + elementId).find("select");

            if (booleanControl.length > 0)
                obj = booleanControl[0];

            if (eventName == "OnChange") {
                if (obj.onchange != null)
                    if (obj.onchange.toString().indexOf(mkValidateFunctionName) >= 0) {
                        obj.onchange();
                    }
            }
            else if (eventName == "OnClick") {
                if (obj.onclick != null)
                    if (obj.onclick.toString().indexOf(mkValidateFunctionName) >= 0) {
                        obj.fireEvent(eventName);
                    }
            }
        }
    }

    // Wrap main datapoint table into the div to have correct hotizontal scrolling
    var $pdc = $("#" + dataPointID + " .ParametricDataControlMainTableResp");
    if (!$(".tbl-wrapper", $pdc).length) {
        $(">table", $pdc).wrap("<div class=tbl-wrapper></div>");
    }

    // Adjust header width 
    setTimeout(function () {
        var $pdd = $("#" + dataPointID + " .ParametricDataControlMainTableResp");
        var $hdr = $(".ShopFloorDCHeaderResp", $pdd);
        var $tbl = $(".tbl-wrapper > table", $pdd);
        $hdr.width($tbl.width() - ($pdd.is('[horizontal="true"]') ? 16 : 17));
    }, 100);

} // InitDataPointValidation

// Finds the sample <tr> element in case of IterationGrid or <table> for RowColumn mode.
// Parameter:
//      fromElement - the INPUT or SELECT element that belongs to PDD control.
function GetSampleRow(fromElement)
{
    for (var parent = fromElement.parentElement; parent != null; parent = parent.parentElement)
    {
        if (parent.getAttribute("PDDSample")!=null)
            break;
    }
    return parent;
} //GetSampleRow

// Returns isOverrideLimits checkbox element of PDD control.
// Parameter:
//      sampleRow   - the <tr> or <table> container element.
function GetOverrideEnableControl(sampleRow)
{
    var inputObjs = sampleRow.getElementsByTagName("INPUT");
    for(var i=0; i<inputObjs.length; i++)
    {
        if (inputObjs[i].type == "checkbox" && inputObjs[i].id.indexOf("DataPoint_IsLimitOverride")!=-1)
            return inputObjs[i];
    }
    return null;
} //GetOverrideEnableControl

function DataCollectionResponsiveInit(id) {
    var $dc = $('#' + id + ' .grid-layout');
    var IE = Camstars.Browser.IE;

    if (IE) {
        $dc.css({
            "-ms-grid-rows": "repeat(" + $dc.attr("rows") + ", 1fr)",
            "-ms-grid-columns": "repeat(" + $dc.attr("columns") + ", 1fr)"
        });
    }
    else {
        $dc.css({
            "grid-template-rows": "repeat(" + $dc.attr("rows") + ", 1fr)",
            "grid-template-columns": "repeat(" + $dc.attr("columns") + ", 1fr)"
        });
    }

    var setLimits = function ($s, $labelAndInput) {
        var upLimit = $s.attr("up-limit");
        if (upLimit) {
            $(".Label", $labelAndInput).append("<span class=UL></span>");
            $(".Label .UL", $labelAndInput).text(upLimit);
        }

        var lowLimit = $s.attr("low-limit");
        if (lowLimit) {
            $(".control-container", $labelAndInput).append("<div class=LL-row><span class=LL></span></div>");
            $(".LL", $labelAndInput).text(lowLimit);
        }

        // Add value limit validation OnDCDFieldValueChanged_Comp
        var $c = $(".control-container :input", $labelAndInput);
        if ($c.length) {
            var evName;
            if ($c.is(":text") || $c.is("select")) {
                if ($c.attr("onchange"))
                    $c.attr("onchange", null);
                evName = "change";
            }
            else if ($c.is(":checkbox")) {
                evName = "click";
            }

            $c.off(evName).on(evName, function () {
                limitValidation(this);
            });
        }
    };

    $(".DataPointItem-resp", $dc).each(function () {
        var $d = $(this);
        var r = parseInt($d.attr("row"));
        var c = parseInt($d.attr("col"));

        if (!IE)
            $d.css("grid-area", r.toString() + " / " + c.toString() + " / " + (r + 1).toString() + " / " + (c + 1).toString());
        else {
            $d.css({
                "-ms-grid-row": r.toString(),
                "-ms-grid-row-span": "1",
                "-ms-grid-column": c.toString(),
                "-ms-grid-column-span": "1"
            });
        }

        // Add label
        var $l = $("<div class='LabelAndInput active' />");
        $l.append("<div class=Label><span class=label-text /></div>");
        $(".label-text", $l).text($d.attr("label") + $d.attr("uom"));

        // Move data control into the control-container
        $l.append("<div class=control-container />");
        $(".control-container", $l).append($("[dataPointName]", $d).detach());

        if ($d.attr("valueType") != "Object") {
            setLimits($d, $l);
        }
        $d.append($l);
    });

    var $computation = $(".computation-responsive");
    if ($computation.length) {
        $computation.append("<div class=expression />")
            .append("<div class=equal-sign>=</div>")
            .append("<div class=result-area />");

        var $resultArea = $(".result-area", $computation);
        $resultArea.append("<div class=result><div class=LabelAndInput><div class=Label><span class=label-text /></div></div></div>");
        $(".LabelAndInput", $resultArea).append("<div class=control-container />");
        $(".LabelAndInput .control-container", $resultArea).append("<div class=control-result />");
        $resultArea.append("<div class=calculation /></div>");
        $('.calculation', $resultArea).append($(":submit", $computation).detach());

        $(".expression", $computation).text($computation.attr("expression"));
        $(".result .control-result", $resultArea).text($computation.attr("result")).prop("title", $computation.attr("result"));
        $(".label-text", $resultArea).text($computation.attr("resultName"));

        setLimits($computation, $(".LabelAndInput", $resultArea));

        var v = $computation.attr("violations");
        if (v) {
            var vtype = (v.indexOf("error") != -1) ? "error" : "warning";
            $computation.addClass("ui-" + vtype);

            if (v.indexOf(":up") != -1)
                $(".UL", $resultArea).addClass("UL-" + vtype);

            if (v.indexOf(":low") != -1)
                $(".LL", $resultArea).addClass("LL-" + vtype);
        }
    }

    // Initial data validation
    $(".DataPointItem-resp", $dc).each(function () {
        limitValidation($(":input", this).get(0));
    });

}

function limitValidation(el) {
    var $dp = $(el).closest('.DataPointItem-resp');
    var boolLimits = $dp.attr("boolLimits").split('|');

    OnDCDFieldValueChanged_Comp(el,
        $dp.attr("low-limit") || null, $dp.attr("up-limit") || null,
        boolLimits[0] || "True", boolLimits[1] || "False",
        $dp.attr("limitOvr") === "true", 1, $dp.attr("valueType"), el, $dp);
}

// It is part of creating file upload control
// Hides button from inputLevel1 file control so that user could see our image
function AdjustFileInputWidth(ctrlId, fileCtrlSuffix, childTblLevel3Id)
{
    var divLevel1 = document.getElementById(ctrlId + "_DivLevel1");
    var inputLevel1 = document.getElementById(ctrlId + "_" + fileCtrlSuffix);
    var divLevel2 = document.getElementById(ctrlId + "_DivLevel2");
    var inputLevel3Empty = document.getElementById(ctrlId + "_" + fileCtrlSuffix + "_Level3");

    if (divLevel1 == null || inputLevel1 == null || divLevel2 == null || inputLevel3Empty == null)
        return false;

    var percStart = Math.round((inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth) / inputLevel1.offsetWidth * 100 - 1);
    var percEnd = percStart + 1;

    var strFilter = "alpha(style=1, opacity=100, finishOpacity=0, startX=" + percStart.toString() + ", startY=0, finishX=" + percEnd.toString() + ", finishY=0)";
    inputLevel1.style.filter = strFilter;

    divLevel1.style.height = inputLevel3Empty.offsetHeight + 1;
    divLevel1.style.width = inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth + inputLevel3Empty.offsetHeight + 4;
    divLevel2.style.width = inputLevel1.offsetWidth - inputLevel3Empty.offsetWidth;

    if (childTblLevel3Id != "")
    {
        var childTblLevel3 = document.getElementById(childTblLevel3Id);
        if (childTblLevel3 == null)
            return false;
        childTblLevel3.style.width = inputLevel1.offsetWidth + 3;
    }

}// AdjustFileInputWidth

// Fix focus when scrolling
function OnScrollParametricData(parametricDiv)
{
	SaveScrollingPosition();
}

// Saves current window scroll position
function SaveScrollingPosition()
{
    if( document.forms[0] != null )
    {
        var positionInput = document.forms[0].elements[mPositionInputName];
        if( positionInput != null )
        {
            positionInput.value = document.body.scrollLeft + "," + document.body.scrollTop;
            var userFieldsDiv = document.all[mkUserFieldsDiv]
            if (userFieldsDiv!=null)
                positionInput.value += ("," + userFieldsDiv.scrollLeft+ "," + userFieldsDiv.scrollTop);
            else
                positionInput.value += ",0,0";
            var parametricDiv = document.all[mkParametricDiv]
            if (parametricDiv!=null)
                positionInput.value += ("," + parametricDiv.scrollLeft+ "," + parametricDiv.scrollTop);
            else
                positionInput.value += ",0,0";
        }
    }
} // SaveScrollingPosition

// Restores window scroll position after post-back
// Returns true if scroll position is not at (0,0) and false otherwise
function RestoreScrollingPosition()
{
    var hasScrolling = false;
    if( document.forms[0] != null )
    {
        var positionInput = document.forms[0].elements[mPositionInputName];
        if( positionInput != null )
        {
            if( positionInput.value.length > 0 )
            {
                var	position = positionInput.value.split(',')
                if( position.length == 6 )
                {
                    var	myPageX = position[0];
                    var	myPageY = position[1];
                    window.scrollTo(myPageX,myPageY);
                    if( myPageX > 0 || myPageY > 0 ) hasScrolling = true;

                    var userFieldsDiv = document.all[mkUserFieldsDiv]
                    if (userFieldsDiv!=null)
                    {
                        userFieldsDiv.scrollTop = position[3];
                        userFieldsDiv.scrollLeft = position[2];
                    }
                    var parametricDiv = document.all[mkParametricDiv]
                    if (parametricDiv!=null)
                    {
                        parametricDiv.scrollTop = position[5];
                        parametricDiv.scrollLeft = position[4];
                    }
                }
            }
        }
    }
    return hasScrolling;
} // RestoreScrollingPosition

function StartDownloadFile(Name, Version, AttachmentsID) {

    var iframe = $('#DownloadIframe');
    if (iframe.length < 1) {
        iframe = $('<iframe id="DownloadIframe"/>');
        iframe.hide();
        iframe.appendTo(document.body);
    }
    iframe.attr('src', "DownloadFile.aspx?Name=" + Name + "&Version=" + Version + "&AttachmentsID=" + AttachmentsID + "&refreshPrm=" + (new Date()).getTime());
}


function PrintPDF(filePath) {
    var wnd = window.open('http://localhost/CamstarPortal' + filePath);
    wnd.print();
}

function DownloadFile(Name) {
    var callStackKey = __page.get_CallStackKey();
    var iframe = $('#DownloadIframe');
    if (iframe.length < 1)
        iframe = $('<iframe id="DownloadIframe"/>');

    iframe.attr('src', "DownloadFile.aspx?cskey="+callStackKey+"&retrieveviewdocfile=" + Name);
    iframe.hide();
    iframe.appendTo(document.body);
}

function DownloadMedwatch()
{
    var iframe = document.createElement("iframe");
    
    // Point the IFRAME to GenerateFile, with the
    //   desired region as a querystring argument.
    iframe.src = "ExportToPDF.aspx";

    // This makes the IFRAME invisible to the user.
    iframe.style.visibility = "hidden";

    // Add the IFRAME to the page.  This will trigger
    //   a request to GenerateFile now.
    document.body.appendChild(iframe);
}

function DoResetDataPostback(clearData, data, controlID, eventTarget)
{
    var eventArgument = clearData + ":" + data + ":" + controlID;
    __page.postback(eventTarget, eventArgument);

    $get('__EVENTARGUMENT').value = '';
} //DoResetDataPostback

function StarAndStopDrag()
{
    $('.WebPartCatalogItem').draggable(
        {
            start: function(event, ui)
            {
                $('.WebPartCatalogItem').css({ 'position': 'static' });
                ui.helper[0].style.position = "absolute";
            },
            stop: function(event, ui)
            {
                ui.helper[0].style.position = "static";
                $('.WebPartCatalogItem').draggable({ revert: true });
                $('.WebPartCatalogItem').css({ 'position': 'static' });
            }
        });
}

// Function to cancel the list of keys pressed by the user
function CancelKeyPress(e) 
{
    var disabledKey = false;

    if (!e) e = event;
    var isPossibleTextElement = jQuery.grep(['DIV', 'INPUT', 'TEXTAREA'], function (a) { return a == (!e.target ? event.srcElement.tagName : e.target.tagName); }).length > 0;
    var targetElement = (!e.target ? event.srcElement : e.target);

    gkKeyCode = e.keyCode;
    var t = getCEP_top();
    for (var i = 0; i < t.CancelKeyPressList.length; i++) 
    {
        var splitItem = t.CancelKeyPressList[i].split('+');
        if (splitItem.length == 1) 
        {
        	if (gkKeyCode == t.CancelKeyPressList[i]) 
            {
                // Check to see if it is the backspace
            	if ((t.CancelKeyPressList[i] == gkBackSpaceKeyCode) && isPossibleTextElement) 
                {
                    // Do not cancel the backspace if the user 
                    // is in a text box, textarea, text editor area or password element.
                    if ((!IsTextElement(targetElement)) && (!IsTextAreaElement(targetElement))
                        && (!IsFileElement(targetElement)) && (!IsPasswordElement(targetElement))
                        && (!IsURLElement(targetElement)))
                    {
                        disabledKey = true;
                    } // if
                    else 
                    {
                        // Do not cancel the backspace if the user 
                        // is in a text box, textarea or password element
                        // and it`s ReadOnly property is not set to true.
                        if (IsReadOnly(targetElement)) 
                        {
                            disabledKey = true;
                        }
                    }
                }
                else 
                {
                    disabledKey = true;
                } // if else
            } // if
        }
        else if (splitItem.length == 2) 
        {
            // The alt key
            if (splitItem[0] == gkAltKeyCode) 
            {
            	if (event.altKey) 
                {
                	if (gkKeyCode == splitItem[1]) 
                    {
                        disabledKey = true;
                    } // if
                } // if
            } // if
        } // if else

        // Inform the user of the key being disabled
        if (disabledKey) 
        {
        	gkKeyCode = 0;
        	if (window.event) event.returnValue = false; //IE
        	else e.preventDefault();//FF

            if (t.PortalLblDisabledKey != null)
                alert(t.PortalLblDisabledKey);
            else
                alert(mDisabledKeyAlert);
            return false;
        } // if
    } // for
} // CancelKeyPress

// Determines if we are currently on a text element.
function IsTextElement(el) 
{
    if (el.tagName == "INPUT" && el.type.toLowerCase() == "text") {
        return true;
    }

    return false;
} //IsTextElement()

// Determines if we are currently on a text area element (multi-line text box).
function IsTextAreaElement(el) 
{
    var retVal;
    var srcElementTagName = el.tagName.toLowerCase();
    if (srcElementTagName == "textarea")
        retVal = true;
    else 
    {
        // Spectial test for WebHtmlEditor control
        if (srcElementTagName == "div" && el.getAttribute("contentEditable"))
            retVal = true;
        else
            retVal = false;
    }
    return retVal;
}  //IsTextAreaElement()

// Determines if we are currently on a file element.
function IsFileElement(el) 
{
    if (el.tagName == "INPUT" && el.type.toLowerCase() == "file") {
        return true;
    }

    return false;
}  //IsFileElement()

// Determines if we are currently on a password element.
function IsPasswordElement(el) 
{
    if (el.tagName == "INPUT" && el.type.toLowerCase() == "password") {
        return true;
    }

    return false;
}  //IsPasswordElement()

// Determines if we are currently on a URL element.
function IsURLElement(el) {
    if (el.tagName == "INPUT" && el.type.toLowerCase() == "url") {
        return true;
    }

    return false;
}

//Determines if the current element`s readOnly property is set to true
function IsReadOnly(el) 
{    
    var retVal = false;
    var TrueReadOnly = true;
    var srcElementReadOnly = el.readOnly;
    if (srcElementReadOnly == TrueReadOnly)
        retVal = true;
    return retVal;
} //IsReadOnly

function OpenDataCollectionExportWindow(headerText, titleText, CSVText, excelText)
{
    if (document.getElementById("dialog-form") == null)
    {
        var div = document.createElement("div");
        div.id = "dialog-form";
        div.title = headerText;

        document.body.appendChild(div);

        var divTitle = document.createElement("div");
        divTitle.innerHTML = titleText;
        div.appendChild(divTitle);

        div.appendChild(document.createElement("br"));
        div.appendChild(document.createElement("br"));

        var fieldSet = document.createElement("fieldset");
        div.appendChild(fieldSet);

        var input = document.createElement("input");
        input.type = "radio"
        input.name = "Export"
        input.value = "2";
        input.id = "ExportToCSV";
        input.checked = true;
        fieldSet.appendChild(input);

        var label = document.createElement("label");
        label.innerHTML = CSVText;
        fieldSet.appendChild(label);

        label = document.createElement("label");
        label.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        fieldSet.appendChild(label);

        input = document.createElement("input");
        input.type = "radio"
        input.name = "Export"
        input.value = "1";
        input.id = "ExportToXML";
        fieldSet.appendChild(input);

        label = document.createElement("label");
        label.innerHTML = excelText;
        fieldSet.appendChild(label);
    }
    else
    {
        if (document.getElementById("ExportToCSV") != null)
        {
            document.getElementById("ExportToCSV").checked = true;
        }
    }

    $("#dialog-form").dialog({
        autoOpen: false,
        height: 200,
        width: 400,
        modal: true,
        buttons: {
            "Export": function ()
            {
                var eventArgument;
                if ($("#ExportToXML")[0].checked)
                {
                    eventArgument = "ExportDataCollection:0";
                }
                else if ($("#ExportToCSV")[0].checked)
                {
                    eventArgument = "ExportDataCollection:1";
                }

                var eventTarget = "__Page";
                __page.postback(eventTarget, eventArgument);

                $get('__EVENTARGUMENT').value = '';
                $(this).dialog("close");
            },
            Cancel: function ()
            {
                $("#dialog-form").dialog("close");
            }
        }
    });

    $("#dialog-form").dialog("open");
}

// handles keypress
function SmartScanResolver(e) {
    if (typeof (smartScanProc) != "undefined") {
        return smartScanProc.ProcessKeyPress(e.charCode != null && e.charCode != 0 ? e.charCode : e.keyCode);
    }
    return true;
}

// handles keydown
function SmartScanTabResolver(e) {
    if (typeof (smartScanProc) != "undefined" && e.keyCode == 9) {
        return smartScanProc.ProcessKeyPress(e.keyCode);
    }
    return true;
}

function SmartScanTemplate(_controlId, _prefix, typeName) {
    this.controlId = _controlId;
    this.prefix = _prefix;
    this.typeName = typeName;
    this.zIndex = 0;

    this.Setup = function () {
        this.zIndex = GetTabIndex(_controlId);
    };

    this.GetClearValue = function (inputText) {
        // Remove preamble and prefix
        if (inputText.indexOf(this.prefix) == 1)
            return inputText.substring(this.prefix.length + 1, inputText.length);
        else
            return null;
    };

    this.IsMatched = function (inputText) {
        // The first char is preamble
        if (inputText.indexOf(this.prefix) == 1)
            return true;
        else
            return false;
    };

    this.GetInputElement = function () {
        var inp = document.getElementById(this.controlId);
        if (inp) {
            if (!inp.disabled && inp.style.display != "none" && !inp.readOnly) {
                return inp;
            }
        }
        return null;
    };

    this.PopulateValue = function (inputText) {
        document.getElementById(this.controlId).value = inputText;
        $("#" + this.controlId).change();
        $("#" + this.controlId).trigger('smartScanningChange');
    };     //PopulateValue

    // set a specified value without requiring multiple DOM traversals to find the element.
    this.SetValue = function (inputText) {
        var element = this.GetInputElement();
        if (element) {
            element.value = inputText;
            $(element).change().trigger('smartScanningChange');
        }
    };
}

function SmartScanProcessor(_delimiters, _preambleChar, _defaultErrorLabel, smartScanRuleName, smartScanPatterns) {
    this.defaultErrorLabel = _defaultErrorLabel;
    this.smartScanRuleName = smartScanRuleName;
    this.smartScanPatterns = smartScanPatterns;
    this.isTypeScanner = false;
    this.delimiters = _delimiters;
    this.preambleChar = _preambleChar;
    this.templates = new Array();
    this.templatesCount = 0;
    this.inputBuffer = "";
    this.inputStarted = false;
    this.isSetupDone = false;

    this.AddTemplate = function (_controlId, _prefix, typeName) {
        var add = true;
        for (var j = 0; j < this.templatesCount; j++) {
            if (this.templates[j].controlId === _controlId) {
                add = false;
                break;
            }
        }
        if (add) {
            var templ = new SmartScanTemplate(_controlId, _prefix, typeName);
            this.templates[this.templatesCount++] = templ;
        }
    };

    this.Setup = function () {
        for (var i = 0; i < this.templatesCount; i++) {
            this.templates[i].Setup();
        }

        // sort templates
        var tempTemplate = null;
        for (var j = 0; j < this.templatesCount; j++) {
            for (var k = 0; k < this.templatesCount - j - 1; k++) {
                if (this.templates[k].Index > this.templates[k + 1].Index) {
                    tempTemplate = this.templates[k];
                    this.templates[k] = this.templates[k + 1];
                    this.templates[k + 1] = tempTemplate;
                }
            }
        }
    };

    this.GetMatchedTemplates = function () {
        if (!this.isSetupDone) {
            this.Setup();
            this.isSetupDone = true;
        }

        var count = 0;
        var tmplMatched = new Array();
        for (var i = 0; i < this.templates.length; i++) {
            var template = this.templates[i];
            if (template.IsMatched(this.inputBuffer)) {
                tmplMatched[count++] = template;
            }
        }
        return tmplMatched;
    };

    this.FindTargetTemplate = function (_matchedTemplates) {
        var template = null;
        if (_matchedTemplates.length == 1) {
            if (_matchedTemplates[0].GetInputElement()) {
                template = _matchedTemplates[0];
            }
        }
        else {
            var index = GetTabIndex(null); // Get tabindex of focused element
            var activeCtrl = document.activeElement;
            if (activeCtrl.type != null) {
                if (activeCtrl.style.zIndex == 0 && activeCtrl.type != "text") {
                    var ctrl = GetParentElement(null);
                    if (!activeCtrl.nextSibling) {
                        if (activeCtrl.previousSibling) {
                            var tmpCtrl = activeCtrl.previousSibling;
                            if (tmpCtrl.id != null) {
                                var tempIndex = GetTabIndex(null);
                                if (tempIndex <= index) {
                                    var nextCtrl = ctrl.nextSibling;
                                    while (nextCtrl) {
                                        if (nextCtrl.style && nextCtrl.style.zIndex != "") {
                                            index = nextCtrl.style.zIndex;
                                            break;
                                        }
                                        nextCtrl = nextCtrl.nextSibling;

                                    }
                                }
                            }
                        }
                    }
                }
            }

            var isFindTemplate = false;
            for (var i = 0; i < _matchedTemplates.length; i++) {
                if (_matchedTemplates[i].zIndex >= index) {
                    if (!_matchedTemplates[i].GetInputElement()) {
                        continue;
                    }
                    template = _matchedTemplates[i];
                    isFindTemplate = true;
                    break;
                }

            }

            if (template == null) {
                if (_matchedTemplates[0].GetInputElement()) {
                    template = _matchedTemplates[0];
                }
            }
        }
        return template;
    };

    this.Resolve = function () {
        var template = null;
        var _matchedTemplates = this.GetMatchedTemplates();
        if (_matchedTemplates.length > 0) {
            template = this.FindTargetTemplate(_matchedTemplates);
        }
        else {
            setTimeout("alert('" + this.defaultErrorLabel + "')", 100);
        }

        if (template) {
            if (template.GetInputElement()) {
                var valueText = template.GetClearValue(this.inputBuffer);
                template.PopulateValue(valueText);
            }
        }
    };

    this.ProcessKeyPress = function (keyCode) {
        var c = String.fromCharCode(keyCode);

        if (c != null && c != "") {
            if (c == this.preambleChar) {
                // begin input capture of scanned barcode.
                this.isTypeScanner = true;

                this.inputStarted = true;
                this.inputBuffer = c;
                //If it is necessary to see the typing string uncomment the following code
                //window.status = this.inputBuffer;

                return false;
            }
            else if (String.fromCharCode(keyCode) == this.delimiters) {
                if (this.isTypeScanner) {
                    // end input capture and process barcode.
                    if (this.smartScanPatterns) { 
                        this.applySmartScanRule();
                        return false;
                    } else {
                        // process with configured smart tags in templates
                        //Parse the input buffer then resolve each value
                        var mas = [];
                        for (var i = 0; i < this.templates.length; i++) {
                            var n = this.inputBuffer.indexOf(this.templates[i].prefix);
                            if (n > 0) mas.push(n);
                        }

                        if (mas.length > 1) {
                            var fullstring = this.inputBuffer;
                            mas.push(fullstring.length)
                            mas.sort(function (a, b) {
                                return a - b;
                            });
                            for (var i = 1; i < mas.length; i++) {
                                //Process each value skipping the preamble
                                this.inputBuffer = this.preambleChar + fullstring.substring(mas[i - 1], mas[i]);
                                this.Resolve();
                            }
                        } else this.Resolve();

                        //If it is necessary to see the typing string uncomment the following code
                        //window.status = this.inputBuffer;
                        this.isTypeScanner = false;
                        this.inputBuffer = "";
                        if (keyCode == 9)
                            return true;
                        else
                            return false;
                    }
                }
                return true;
            }
            else {
                if (this.inputStarted) {
                    this.inputBuffer += c;
                    //If it is necessary to see the typing string uncomment the following code
                    //window.status = this.inputBuffer;
                    if (this.isTypeScanner) {
                        return false;
                    }
                }
                else
                    return true;
            }
        }
    };

    // parses the captured barcode using the active smart scan rule
    this.applySmartScanRule = function () {
        var smartProc = this; // remove 'this' confusion inside helper functions.

        // captured barcode includes preamble as first char, remove it for rule based processing
        var barcode = this.inputBuffer.substring(1);
        var data = '{ "barcode": "' + barcode + '", "patterns": ' + this.smartScanPatterns + ' }';
        // at this point any char that needs escaping will have a single backslash(barcode or patterns).
        // to communicate via ajax with the parser assembly, we need to escape that backslash.
        data = data.replace(/\\/g, '\\\\');

        $.ajax({
            type: "POST",
            dataType: "json",
            url: './SmartScanService.svc/web/ParseBarcode',
            headers: {
                'Accept': 'application/json'
            },
            // Must set content-type this way to avoid jQuery bug with sending JSON containing "??"
            // https://forum.jquery.com/topic/special-characters-issue-find-random-strings-like-jquery20206329934545792639-1415046914457-in-data
            contentType: "application/json;charset=UTF-8",
            async: true,
            data: data,
            context: document.body
        }).success(parseSuccess).fail(parseFail);

        function parseFail(response) {
            if (response) {
                // the response should have meaningful error info in it. dump the details to the console and show a user friendly message to look there.
                showErrorLabel('SmartScanServiceError', response.responseText);
            } else {
                // shouldn't happen but just in case
                showErrorLabel('UTILITY_ERR_UNKNOWN_ERROR');
            }
            finishScan();
        }

        function parseSuccess(response) {
            var errorMessage;
            var anyDataSet = false;

            if (response.ParseBarcodeResult.IsSuccess) {
                if (response.bcValues.length > 0) {
                    // iterate extracted values and set to all controls with matching data types.
                    console.log('Parse Results: ' + JSON.stringify(response.bcValues));
                    response.bcValues.forEach(function (item) {
                        var matchingTemplates = getMatchingTemplates(item.Key);
                        anyDataSet = anyDataSet || matchingTemplates.length > 0;
                        matchingTemplates.forEach(function (template) {
                            console.log('Setting Value(' + item.Value + ') to control with id: ' + template.controlId);
                            template.SetValue(item.Value);
                        });
                    });
                    if (!anyDataSet) {
                        // data was extracted from the barcode, but didn't match any configured fields.
                        getLabel('SmartScanDataNoMatchFields', function (result) {
                            showError(result.labelValue.replace('#ErrorMsg.Name', smartProc.smartScanRuleName));
                        });
                    }

                } else {
                    // no parser errors, but no data extracted from barcode.
                    getLabel('SmartScanNoDataFound', function (result) {
                        showError(result.labelValue.replace('#ErrorMsg.Name', smartProc.smartScanRuleName));
                    });
                }
            } else if (response.localizedErrMsg) {
                showError(response.localizedErrMsg);
            } else if (response.ParseBarcodeResult.ExceptionData) {
                showError(response.ParseBarcodeResult.ExceptionData.Description);
            } else {
                // shouldn't happen but just in case
                showErrorLabel('UTILITY_ERR_UNKNOWN_ERROR');
            }
            finishScan();           
        }

        // find the templates whose typeName matches a smart scan pattern type.
        function getMatchingTemplates(type) {
            var matchingTemplates = [];
            smartProc.templates.forEach(function (template) {
                if (template.typeName === type)
                    matchingTemplates.push(template);
            });
            return matchingTemplates;
        }

        // since rule based smart scanning is async, delay final cleanup until it is all done.
        function finishScan() {
            smartProc.isTypeScanner = false;
            smartProc.inputBuffer = "";
            if (this.delimiters === '\t') {
                //TODO: non-rule based smart scan returns true to allow default behavior of tab key.
                //      rule based cannot do that since it needs an async call.
                //      may have to do something here like trigger a tab key press, but on what element?.
                //      could we get from focus? wait and see what problems arise(if any).
            }
        }

        // shows a message in an alert box and logs it to the console
        function showError(popupMessage, consoleMessage) {
            popupMessage = popupMessage || smartProc.defaultErrorLabel;
            setTimeout("alert('" + popupMessage + "')", 100);

            consoleMessage = consoleMessage || popupMessage;
            console.error(consoleMessage);
        }

        // shows a message in an alert box for the specified label
        function showErrorLabel(labelName, consoleMessage) {
            getLabel(labelName, function (result) {
                showError(result.labelValue, consoleMessage);
            });
        }

        // get a single label value
        function getLabel(labelName, callback) {
            getLabels([labelName], function (result) {
                if (callback) {
                    result.labelValue = result.error ? labelName : result.labels[labelName];
                    callback(result);
                }
            });
        }

        // gets multiple label values
        function getLabels(labelNames, callback) {
            var requestedLabels = [];
            var request;

            labelNames.forEach(function (labelName) {
                requestedLabels.push({ Name: labelName });
            });

            __page.getLabels(requestedLabels, function (response) {
                var result = {
                    labels: {},
                    error: ''
                };

                if (Array.isArray(response)) {
                    response.forEach(function (label) {
                        result.labels[label.Name] = label.Value ? label.Value : label.DefaultValue;
                    });
                } else {
                    result.error = response.Error;
                    console.error('Error getting labels for: ' + JSON.stringify(labelNames) + '. Message: ' + response.Error);
                }

                if (callback) {
                    callback(result);
                }
            });    
        }
    };
}

function GetParentElement(ctrlId) {
    var currTabindex = 0;
    var theControl = ctrlId ? document.getElementById(ctrlId) : document.activeElement;
    if (theControl) {
        currTabindex = theControl.style.zIndex;
        while (!currTabindex && theControl.parentElement) {
            currTabindex = theControl.parentElement.style.zIndex;
            theControl = theControl.parentElement;
        }
    }

    return theControl;
}

function GetTabIndex(ctrlId) {
    var currTabindex = 0;
    var theControl = ctrlId ? document.getElementById(ctrlId) : document.activeElement;
    if (theControl) {
        currTabindex = theControl.style.zIndex;
        while (!currTabindex && theControl.parentElement) {
            currTabindex = theControl.parentElement.style.zIndex;
            theControl = theControl.parentElement;
        }
    }
    return currTabindex;
}

function SetupSmartScanningEvents() {
    if (document.body.attachEvent) {
        document.body.attachEvent("onkeypress", SmartScanResolver);
        document.body.attachEvent("onkeydown", SmartScanTabResolver);
    }
    else {
        document.onkeypress = SmartScanResolver;
        document.onkeydown = SmartScanTabResolver;
    }
}

function getTextWidth(el){
    var s = $('<span >'+ $(el).html() +'</span>');
    s.css({
       position : 'absolute',
       left : -9999,
       top : -9999,
       // ensure that the span has same font properties as the element
       'font-family' : el.css('font-family'),
       'font-size' : el.css('font-size'),
       'font-weight' : el.css('font-weight'),
       'font-style' : el.css('font-style')
    });
    $('body').append(s);
    var result = s.width();
    //remove the newly created span
    s.remove();
    return result;
}

function setDirtyFlag() {
    __page.setDirty();
}

function ConfirmTabClosing($li, callback)
{
    var caption = $('span:first', $li).text();
    var labels = [{ Name: 'Lbl_UnsavedChangesOnVirtualPage' }, { Name: 'Lbl_Warning' }];
    __page.getLabels(labels, function (response) {
        if ($.isArray(response)) {
            var value;
            var warningLbl;
            $.each(response, function () {
                var labelName = this.Name;
                var labelText = this.Value;
                switch (labelName)
                {
                    case 'Lbl_UnsavedChangesOnVirtualPage':
                        value = labelText.replace('{0}', caption);
                        break;
                    case 'Lbl_Warning':
                        warningLbl = labelText;
                        break;
                    default:
                        break;
                }
            });            
            JConfirmationLong(value, null, callback, null, null, null, warningLbl);
        }
        else {
            alert(response.Error);
        }
    });    
}

function removeTab($li) {
    if (typeof $li == 'string')
        $li = $('li[aria-controls="' + $li + '"]');

    if ($li.length)
        $li.closest('.ui-page-tab').scrollableTabs("remove", null, $li);
}

function GetChildTabs($li)
{
    var id = $li.attr('aria-controls');
    var $divContent = $('div[id="' + id + '"]', $li.parent().parent());
    var $ifr = $divContent.find('iframe');
    if ($ifr.length)
        return $ifr.contents().find(".ui-page-tab").find('li');
    else
        return [];
}

function getIframe(src, win)
{
    if (win === undefined)
        win = top;

    if (win.document.URL == src)
    {
        return win;
    }

    for (var i = 0; i < win.frames.length; i++)
    {
        if (win.frames[i].document.URL == src)
        {
            return win.frames[i];
        }
        else
        {
            var w = getIframe(src, win.frames[i]);
            if (w != null)
                return w;
        }
    }
    return null;
}

function removeIframe($iframe)
{
    if ($iframe.length > 0)
    {
        $iframe[0].src = "about:blank";
        if ($iframe[0].contentWindow)
        {
            $iframe[0].contentWindow.document.write("");
            $iframe[0].contentWindow.close();
        }
        else if ($iframe[0].contentDocument)
            $iframe[0].contentDocument.write("");
        $iframe.remove();
    }
}

function getTextHeight(el, width)
{
    var s = $('<span >' + $(el).html() + '</span>');
    s.css({
        position: 'absolute',
        left: -9999,
        top: -9999,
        width: width,
        // ensure that the span has same font properties as the element
        'font-family': el.css('font-family'),
        'font-size': el.css('font-size'),
        'font-weight': el.css('font-weight'),
        'font-style': el.css('font-style')
    });
    $('body').append(s);
    var result = s.height();
    //remove the newly created span
    s.remove();
    return result;
}

function SerializeObject(obj, indentValue) 
{
    var hexDigits = "0123456789ABCDEF";
    function ToHex(d) 
    {
        return hexDigits[d >> 8] + hexDigits[d & 0x0F];
    }
    function Escape(string) 
    {
        return string.replace(/[\x00-\x1F'\\]/g,
        function (x) 
        {
            if (x == "'" || x == "\\") return "\\" + x;
            return "\\x" + ToHex(String.charCodeAt(x, 0));
        })
    }
    var indent;
    if (indentValue == null) 
    {
        indentValue = "";
        indent = ""; // or " "
    }
    else 
    {
        indent = "\n";
    }
    return GetObject(obj, indent).replace(/,$/, "");
    function GetObject(obj, indent)
    {
        if (typeof obj == 'string') 
        {
            return "'" + Escape(obj) + "',";
        }
        if (obj instanceof Array) 
        {
            result = indent + "[";
            for (var i = 0; i < obj.length; i++) 
            {
                result += indent + indentValue + GetObject(obj[i], indent + indentValue);
            }
            result += indent + "],";
            return result;
        }
        var result = "";
        if (typeof obj == 'object') 
        {
            result += indent + "{";
            for (var property in obj) 
            {
                result += indent + indentValue + "'" +
            Escape(property) + "' : " +
            GetObject(obj[property], indent + indentValue);
            }
            result += indent + "},";
        }
        else 
        {
            result += obj + ",";
        }
        return result.replace(/,(\n?\s*)([\]}])/g, "$1$2");
    }
}

function CleanupSession(stackKey)
{
    if (stackKey)
    {
        var loc = window.location;
        var appPath = loc.pathname.substr(0, loc.pathname.indexOf('/', 1));
        var url = loc.protocol + "//" + loc.host + appPath + "/SessionHandler.ashx" + "?keyId=" + stackKey;
        //to prevent ajax request caching in IE you need to have unique request every time
        if (Camstars.Browser.IE)
            url += "&date=" + new Date().getTime();
        // Send ajax request to kill the session
        $.ajax({ url: url })
            .done(function () {
                // Correctly closed
            }).fail(function () {
                console.error("CleanupSessionKeys fails", textStatus);
            });
    }
}

var donotclosesession = false;

function KillSession()
{
    if (!donotclosesession)
    {
        var loc = window.location;
        var appPath = loc.pathname.substr(0, loc.pathname.indexOf('/', 1));
        var url = loc.protocol + "//" + loc.host + appPath + "/SessionHandler.ashx";


        $.ajax({ url: url })
            .done(function () {
                // Correctly closed
            }).fail(function () {
                console.error("CleanupSessionKeys fails", textStatus);
            });
    }
    return false;
}

function getParameterByName(name, url)
{
    if (typeof (url) == 'undefined')
        url = window.location.href;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setParameterByName(name, newVal, url)
{
    var retVal = "";
    if (url == null || url == '')
    {
        if (newVal)
            retVal = "?" + name + "=" + newVal;
    }
    else if (!newVal)
        retVal = url;
    else
    {
        var param = getParameterByName(name, url);
        if (param)
        {
            var segments = url.split("?");
            var pageName = "";
            var query;
            if (segments.length == 2)
            {
                pageName = segments[0];
                query = segments[1];
            }
            else
            {
                query = segments[0];
            }
            var oldParam = name + "=" + param;
            var newParam = name + "=" + newVal;
            query = query.replace(oldParam, newParam);
            retVal = pageName + "?" + query;
        }
        else
            retVal = url + "&" + name + "=" + newVal;
    }
    return retVal;
}

function isVerticalScrollDisplayed()
{
    return $get("scrollablepanel").scrollHeight > $('#scrollablepanel').height();
}

function buildTopMenu($el) {
    var speed = 300;
    if ($el.length) {
		$el.find("li.opened").has("ul").children("ul").addClass("collapse in");
        $el.find("li").not(".opened").has("ul").children("ul").addClass("collapse");
        $el.find("li[onclick]").on("click", function(e) {
            $('.opened').removeClass("opened").children("ul.in").removeClass("in").hide(speed);
            $el.parent().collapse("hide");            
	    });

        $el.find("li").has("ul").children("a").on("click", function(e) {
		    e.preventDefault();
		    var li = $(this).parent("li");
			if (li.hasClass("opened")) {
			    li.removeClass("opened").children("ul.in").removeClass("in").hide(speed);
			}
			else {
			    li.addClass("opened").children("ul").addClass("in").show(speed);
			    li.siblings().removeClass("opened").children("ul.in").removeClass("in").hide(speed);
			}
		});		
	}
}

function onLoad()
{
    if (Camstars.Browser.IE)
        window.onunload = function (evt) { KillSession(); }
    else
        window.onbeforeunload = function (evt) { KillSession(); }
}

function getCEP_top() {
    var t = window;
    for (var i = 0; i < 10; i++) { // max of 10 iterations
        if (/Main.aspx/i.test(t.location.pathname) && ! /redirectToPageFlow/i.test(t.location.search)) {
            return t;
        }
        else {
            t = t.parent;
        }            
    }
    return t;
}

function top_resize() {
    $(getCEP_top()).trigger("resize", ["force-top-resize"]);
}


function openPortalStudio(primaryVersion) {
    donotclosesession = true;
    var psVer = primaryVersion;
    if (event.ctrlKey === true)
        psVer = primaryVersion == 1 ? 2 : 1;

    if (psVer == 1)
        location.href = "PortalStudio.aspx";
    else 
        location.href = "PortalStudio/index.html?portalMode=Classic&wcf=" + escape(top.wcfUrl);
    return false;
}

function onChangeTextBox(name) {
    if (!Camstars.Browser.IE) {
        window.__IgnoreNextPostback = window.__IgnoreNextPostback || {};
        if (window.__IgnoreNextPostback[name] === true) {
            delete window.__IgnoreNextPostback[name];
            return false;
        }

        if (event && event.keyCode === 13)
            window.__IgnoreNextPostback[name] = true;
    }
    setTimeout(function () { __doPostBack(name, ''); }, 0)
}