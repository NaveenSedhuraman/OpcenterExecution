// Copyright Siemens 2019  

/// <reference name="MicrosoftAjax.js"/>
Type.registerNamespace('Camstar.Ajax');

/******************* Camstar.Ajax.RequestType *******************/
Camstar.Ajax.RequestType = function() { };
Camstar.Ajax.RequestType.prototype =
{
    Command: 0,
    PostBack: 1,
    Submit: 2,
    PageFlow: 3
};
Camstar.Ajax.RequestType.registerEnum('Camstar.Ajax.RequestType');

/******************* Camstar.Ajax.ResponseType *******************/
Camstar.Ajax.ResponseType = function() { };
Camstar.Ajax.ResponseType.prototype =
{
    Template: 0,
    UIComponent: 1,
    Script: 2,
    Command: 3,
    Status: 4,
    Exception: 5,
    DirectUpdate: 6
};
Camstar.Ajax.ResponseType.registerEnum('Camstar.Ajax.ResponseType');

// Camstar.Ajax.DirectUpdateParameterKeys
Camstar.Ajax.DirectUpdateParameterKeys = function() { };
Camstar.Ajax.DirectUpdateParameterKeys.prototype =
{
    Data: 1,
    Visible: 2,
    Enable: 3,
    DataText: 4
};
Camstar.Ajax.DirectUpdateParameterKeys.registerEnum('Camstar.Ajax.DirectUpdateParameterKeys');


/******************* Camstar.Ajax.Response *******************/

Camstar.Ajax.Response = function(responseData, context)
{
    Camstar.Ajax.Response.initializeBase(this);

    /* Private Member Variables */
    this._responseData = responseData;
    this._responseSections = this._responseData.Response;
    this._context = context;
    this._blocks = new Array();
    this._scriptLoaderTask = null;
    this._scriptsToExecute = new Array();
    this._scriptIncludesQueue = new Array();
    this._scriptsDownloaded = new Array();

    this._scriptLoadedDelegate = Function.createDelegate(this, this._scriptLoadedHandler);
}

Camstar.Ajax.Response.prototype =
{
    dispose: function ()
    {
        this._responseData = null;
        this._responseSections = null;
        this._context = null;
        this._blocks = null;
        this._refreshHandlers = null;
    },

    syncResponse: function ()
    {
        try
        {
            var section;
            Sys._ScriptLoader._referencedScripts = null;
            Sys._ScriptLoader.readLoadedScripts();

            var length = this._responseSections.length;
            for (var x = 0; x < length; x++)
            {
                section = this._responseSections[x];

                switch (section.Type)
                {
                    case eval(Camstar.Ajax.ResponseType.Template):
                        this.processTemplateData(section); break;
                    case eval(Camstar.Ajax.ResponseType.UIComponent):
                        this.processUIComponent(section); break;
                    case eval(Camstar.Ajax.ResponseType.Script):
                        this.processScriptData(section); break;
                    case eval(Camstar.Ajax.ResponseType.Command):
                        this.processCommandData(section);
                        break;
                    case eval(Camstar.Ajax.ResponseType.Status):
                        this.processStatusData(section); break;
                    case eval(Camstar.Ajax.ResponseType.Exception):
                        this.processExceptionData(section); break;
                    case eval(Camstar.Ajax.ResponseType.DirectUpdate):
                        this.processDirectUpdate(section); break;
                    default: break;
                }
            }
        }
        catch (e) {
            alert('Message: ' +e.message + '\n' +
                'Source File: ' + e.fileName + '\n' +
                'Line: ' + e.lineNumber);
        }
        finally
        {
            this.executeScriptData();
            __page._additionalInput = null;
            if (__page.doReload) {
                if (!__page.IsPageFlowRedirecting) {
                    __page.onPageLoad();
                    var target = __page.get_postBackTarget();
                    if (target != null) {
                        __page.set_postBackTarget(null);
                        if ($get(target) != null)
                            __page.setFocus(target);
                    }
                    if (!__page.directUpdateShowsModal) // don't hide modal if DirectUpdate opened it.
                        __page.hideModal();
                    __page.directUpdateShowsModal = false; // hide modal after post back.
                }

                else {
                    __page.IsPageFlowRedirecting = false;
                }
            }
            else {
                __page.doReload = true;
            }

            // load barcode scan popover after ajax update
            if (__page._mobileBarcodeEnabled && __page.isMobilePage()) {
                InitBarcodeIcons();
            }
        }
    },

    executeScriptData: function ()
    {
        if (this._scriptIncludesQueue.length > 0)
        {
            var length = this._scriptIncludesQueue.length
            for (var x = 0; x < length; x++)
            {
                try
                {
                    this._scriptLoaderTask = new Sys._ScriptLoaderTask(__page.createJavascriptInclude(this._scriptIncludesQueue[x]), this._scriptLoadedDelegate);
                    this._scriptLoaderTask.execute();
                }
                catch (ex)
                {
                    alert("Exception " + ex.message + "\nScript Include Queue:\n" + this._scriptIncludesQueue[x]);
                }
            }
        }
        else
        {
            this._executeScripts();
        }
    },

    _scriptLoadedHandler: function (scriptElement)
    {
        Array.add(this._scriptsDownloaded, scriptElement.src);

        if (this._scriptsDownloaded.length == this._scriptIncludesQueue.length)
        {
            //all scripts includes are downloaded...now execute scripts
            this._executeScripts();

            this._scriptsDownloaded = new Array();
            this._scriptsIncludesQueue = new Array();
            this._scriptsToExecute = new Array();
        }

    },

    _executeScripts: function ()
    {
        var docHeader = __page.get_documentHeader();
        var length = this._scriptsToExecute.length;

        var scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'text/javascript');

        for (var x = 0; x < length; x++)
        {
            scriptElement.text += this._scriptsToExecute[x];
        }

        docHeader.appendChild(scriptElement);
        Sys._ScriptLoaderTask._clearScript(scriptElement);
    },

    scriptExists: function (scriptURL)
    {
        var scripts = document.getElementsByTagName('script');
        var length = scripts.length;

        for (var i = 0; i < length; i++)
        {
            if (scripts[i].src == scriptURL)
            {
                return true;
            }
        }

        return false;
    },

    processTemplateData: function (section)
    {
        __page.set_virtualPageName(section.ResponseID);
        __page.replaceTemplateElement(section.Data.HTML);
    },

    processUIComponent: function (section)
    {
        var component = $find(section.ResponseID);
        if (Camstar.UI.IUIComponent.isImplementedBy(component))
        {
            component.refresh(section.Data.HTML);
        }
    },

    processScriptData: function (section)
    {
        if (section.Data.ScriptType == "ClientScriptInclude" && section.Data.ScriptUrl)
        {
            //queue javascript includes
            if (!Sys._ScriptLoader.isScriptLoaded(section.Data.ScriptUrl))
            {
                if (!Array.contains(this._scriptIncludesQueue, section.Data.ScriptUrl))
                    Array.add(this._scriptIncludesQueue, section.Data.ScriptUrl);
            }
        }
        else if (section.Data.ScriptType == "ClientStartupScript" && section.Data.ScriptText && section.Data.NoTag)
        {
            Array.add(this._scriptsToExecute, section.Data.ScriptText);
        }
        else if (section.Data.ScriptType == "ClientStartupScript" && !section.Data.NoTag)
        {
            Array.add(this._scriptsToExecute, section.Data.ScriptText);
        }
        else if (section.Data.ScriptType == "ClientScriptBlock")
        {
            Array.add(this._scriptsToExecute, section.Data.ScriptText);
        }
        else if (section.Data.ScriptType == "ArrayDeclaration")
        {
            window[section.ResponseID] = null;
            Array.add(this._scriptsToExecute, "Sys.WebForms.PageRequestManager._addArrayElement('" + section.ResponseID + "', " + section.Data.ScriptText + ");");
        }
        else if (section.Data.ScriptType == "HiddenField")
        {
            var hiddenElement = document.getElementById(section.ResponseID);
            if (hiddenElement != null)
            {
                hiddenElement.value = section.Data.ScriptText;
            }
            else
            {
                if (document.forms.length > 0)
                {
                    hiddenElement = document.createElement("input");
                    hiddenElement.type = "hidden";
                    hiddenElement.value = section.Data.ScriptText;
                    hiddenElement.id = section.ResponseID;
                    document.forms[0].appendChild(hiddenElement);
                }
            }
        }
        else
        {
            Array.add(this._scriptsToExecute, section.Data.ScriptText);
        }
    },

    processCommandData: function (section)
    {
        if (section) {
            eval("this._context." + this._responseData.ClientCallback + "(section)");
        };
    },

    processStatusData: function (section)
    {
        var component = $find(section.ResponseID);
        if (component && component.processStatusData)
        {
            component.processStatusData(section.Data);
        }
        else
        {
            // display message
            //var sb = $find('WebPart_StatusBar_UIComponent');
            //sb.write(section.Data.Message, "Error");
            var msgText = '';
            if (section.Data.Message)
            {
                msgText += section.Data.Message;
            }
            else
            {
                for (var i = 0; i < section.Data.ValidationItems.length; i++)
                {
                    msgText += section.Data.ValidationItems[i].Message + "\n";
                }
            }
            alert(msgText);
        }
    },

    processExceptionData: function (section)
    {
    },

    processDirectUpdate: function (section)
    {
        if (section.ResponseID)
        {
            var component = $find(section.ResponseID);
            if (component)
            {
                component.directUpdate(section.Data);
            }
            else
            {
                var el = $get(section.ResponseID);
                if (el)
                {
                    var val = section.Data.PropertyValue;

                    switch (section.Data.ControlType)
                    {
                        case "Button":
                            this.directUpdateButton(el, section, val); break;
                        case "BooleanSwitch":
                            this.directUpdateRadioButtonList(el, section, val); break;
                        case "CheckBox":
                            this.directUpdateCheckBox(el, section, val); break;
                        case "DateChooser":
                            this.directUpdateDateChooser(el, section, val); break;
                        case "TextEditor":
                            this.directUpdateTextEditor(el, section, val); break;
                        case "RadioButtonList":
                            this.directUpdateRadioButtonList(el, section, val); break;
                    }
                }
            }
        }
    },

    directUpdateButton: function (el, section, val)
    {
        if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Visible))
        {
            el.parentNode.parentNode.parentNode.parentNode.style.display = val == "True" ? "block" : "none";
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Enable))
        {
            el.disabled = (val != "True");
            el.style.cursor = (val != "True") ? "default" : "";
        }
    },

    directUpdateRadioButtonList: function (el, section, val)
    {
        if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Visible))
        {
            // el = SPAN (placeholder)
            el.style.display = val == "True" ? "block" : "none";
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Enable))
        {
            el.disabled = (val != "True");
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Data))
        {
            // val = radio control selected index
            val = parseInt(val);

            var inputList = el.getElementsByTagName("input");

            for (var ii = 0; ii < inputList.length; ii++)
            {
                inputList[ii].checked = (ii == val);
            }
        }
    },

    directUpdateCheckBox: function (el, section, val)
    {
        if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Visible))
        {
            // el = SPAN (placeholder)
            el.style.display = val == "True" ? "block" : "none";
            $(".LabelControl", el)[0].style.display = val == "True" ? "block" : "none";
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Enable))
        {
            el.disabled = (val != "True");
            $(".LabelControl", el)[0].disabled = (val != "True");
            var checkBoxSpan = $(".Checkbox", el)[0];
            checkBoxSpan.disabled = (val != "True");
            checkBoxSpan.childNodes[0].disabled = (val != "True");
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Data))
        {
            $(".Checkbox", el)[0].childNodes[0].checked = (val == "True");
        }
    },

    directUpdateDateChooser: function (el, section, val)
    {
        if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Visible))
        {
            el.style.display = val == "True" ? "block" : "none";
            el.parentNode.parentNode.cells[0].childNodes[0].style.display = val == "True" ? "block" : "none";
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Enable))
        {
            el.disabled = (val != "True");
            var mainTable = el.childNodes[0].rows[0].cells[0].childNodes[0].disabled = (val != "True");
            var dateTable = $(".DateChooserControl", el)[0];
            var dateImage = dateTable.rows[0].cells[1].childNodes[0];
            var calendar = $(".calStyle", el.parentNode)[0];
            dateTable.rows[0].cells[0].childNodes[0].disabled = (val != "True");
            var controlIsland = $(".ControlIslandMiddle", el)[0];
            controlIsland.childNodes[0].disabled = (val != "True");
            controlIsland.style.backgroundColor = controlIsland.getAttribute(val != "True" ? "DisabledBG" : "EnabledBG");
            if (calendar)
            {
                calendar.disabled = (val != "True");
            }
            dateImage.className = val != "True" ? "CalendarImageDisabled" : "CalendarImage";
        }
        else if (section.Data.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Data))
        {
            var dateTable = $(".DateChooserControl", el)[0];
            dateTable.rows[0].cells[0].childNodes[0].value = val;
        }
    },

    directUpdateTextEditor: function (el, section, val)
    {
        //TODO: implement direct updates for text editor.  
    },

    addAfterUpdateHandler: function (functionPointer)
    {
        this._afterUpdateHandlers.push(functionPointer);
    }
}

Camstar.Ajax.Response.registerClass('Camstar.Ajax.Response', null, Sys.IDisposable);

/******************* Camstar.Ajax.Request *******************/

Camstar.Ajax.Request = function (httpVerb)
{
    /*** Private Member Variables ***/
    this._url = null;
    this._started = false;

    this._executor = new Sys.Net.XMLHttpExecutor();
    this._webRequest = new Sys.Net.WebRequest();
    this._webRequest.set_httpVerb(httpVerb);

    Camstar.Ajax.Request.initializeBase(this);
}

Camstar.Ajax.Request.prototype =
{
    /*** Public Methods ***/
    dispose: function ()
    {
        this._url = null;
        this._started = null;

        if (this._executor) this._executor.dispose();
        if (this._webRequest) this._webRequest.dispose();
    },

    execute: function ()
    {
        //set the request url
        this._webRequest.set_url(this._url);
        //set the completed event handler for processing return data
        this._webRequest.add_completed(this.onRequestCompleted);
        //set executor for WebRequest object
        this._webRequest.set_executor(this._executor);
        this._webRequest.invoke();
        this._started = this._executor.get_started();
    },

    addCompletedHandler: function (functionPointer)
    {
        this._webRequest.add_completed(functionPointer);
    },

    addInvokingHandler: function (functionPointer)
    {
        Sys.Net.WebRequestManager.add_invokingRequest(functionPointer);
    },

    abort: function ()
    {
        this._executor.abort();
    },

    onRequestCompleted: function ()
    {
    },

    /*** Public Properties ***/
    get_url: function () { return this._url; },
    set_url: function (value) { this._url = value; },

    get_isTimedOut: function () { return this._executor.get_timedOut; },

    get_isAborted: function () { return this._executor.get_aborted(); },

    get_isStarted: function () { return this._executor.get_started(); },

    set_serverParameters: function (params)
    {
        this._webRequest.set_body(params);
        if (!Camstars.Browser.WebKit)
        {
            this._webRequest.get_headers()["Content-Length"] = params.length;
        }
    },

    set_userContext: function (context) { this._webRequest.set_userContext(context); },
    get_userContext: function () { return this._webRequest.get_userContext(); }
}

Camstar.Ajax.Request.registerClass('Camstar.Ajax.Request', null, Sys.IDisposable);

/******************* Camstar.Ajax.Transition *******************/

Camstar.Ajax.Transition = function(requestType, sourceControl)
{
    //private members
    this._requestType = requestType;
    this._sourceControl = sourceControl;
    this._command = requestType;
    this._commandParameters = null;
    this._clientCallback = null;
    this._virtualPage = null;
    this._response = null;
    this._postdata = null;
    this._noModalImage = false;
}

Camstar.Ajax.Transition.prototype =
{
    //public methods
    dispose: function()
    {
        this._requestType = null;
        this._sourceControl = null;
        this._command = null;
        this._clientCallback = null;
        this._virtualPage = null;
        this._response = null;
        this._postdata = null;
    },

    buildCommandRequest: function()
    {
        var jsonObj =
        {
            "ID": this._sourceControl.get_controlId(),
            "RequestType": this._requestType,
            "VirtualPage": __page.get_virtualPageName(),
            "TargetType": this._sourceControl.get_serverType(),
            "Command": this._command,
            "CommandParameters": this._commandParameters,
            "ClientCallback": this._clientCallback,
            "Response": this._response
        };

        return Sys.Serialization.JavaScriptSerializer.serialize(jsonObj);
    },

    get_serverParameters: function()
    {
        switch (this._requestType)
        {
            case eval(Camstar.Ajax.RequestType.PostBack):
                return this._postdata ? __page.createBodyContent() : ""; break;
            case eval(Camstar.Ajax.RequestType.Submit):
                return __page.createBodyContent(); break;
            case eval(Camstar.Ajax.RequestType.Command):
                return this.buildCommandRequest(); break;
            case eval(Camstar.Ajax.RequestType.PageFlow):
                return ""; break;
            default:
                alert("Invalid request attempted"); break;
        }
    },

    //public properties
    get_virtualPage: function() { return this._virtualPage; },
    set_virtualPage: function(value) { this._virtualPage = value; },

    get_targetType: function() { return this._sourceControl.get_serverType(); },
    set_targetType: function(value) { this._sourceControl.set_serverType(value); },

    get_command: function() { return this._command; },
    set_command: function(value) { this._command = value; },

    get_commandParameters: function() { return this._commandParameters; },
    set_commandParameters: function(value) { this._commandParameters = value; },
    
    get_clientCallback: function() { return this._clientCallback; },
    set_clientCallback: function(value) { this._clientCallback = value; },

    get_requestType: function() { return this._requestType; },
    set_requestType: function(value) { this._requestType = value; },

    get_postdata: function() { return this._postdata; },
    set_postdata: function(value) { this._postdata = value; },

    set_noModalImage: function (value) { this._noModalImage = value; },
    get_noModalImage: function () { return this._noModalImage; }
}

Camstar.Ajax.Transition.registerClass('Camstar.Ajax.Transition', null, Sys.IDisposable);

/******************* Camstar.Ajax.Communicator *******************/

Camstar.Ajax.Communicator = function(transition, caller)
{
    //Member Variables
    this._caller = caller;
    this._transition = transition;
    this._request = null;
    this._response = null;

    if (this._transition.get_requestType() == eval(Camstar.Ajax.RequestType.Command))
    {
        this._request = new Camstar.Ajax.Request("POST");
        var ajaxUrl = 'AjaxEntry.axd';
        if (__page._CallStackKey != null && __page._CallStackKey.length > 0) {
            ajaxUrl += "?CallStackKey=" + __page._CallStackKey;
    }
        this._request.set_url(ajaxUrl);
    }
    else if (this._transition.get_requestType() == eval(Camstar.Ajax.RequestType.PostBack)) {
        this._request = new Camstar.Ajax.Request("POST");
        this._request.set_url(transition.get_virtualPage());
    }
    else if (this._transition.get_requestType() == eval(Camstar.Ajax.RequestType.Submit))
    {
        this._request = new Camstar.Ajax.Request("POST");
        this._request.set_url(transition.get_virtualPage());
    }
    else if (this._transition.get_requestType() == eval(Camstar.Ajax.RequestType.PageFlow))
    {
        this._request = new Camstar.Ajax.Request("GET");
        this._request.set_url(transition.get_virtualPage());
    }

    Camstar.Ajax.Communicator.initializeBase(this);
}

Camstar.Ajax.Communicator.prototype =
{
    dispose: function ()
    {
        this._caller = null;
        if (this._transition) this._transition.dispose();
        if (this._request) this._request.dispose();
        if (this._response) this._response.dispose();
    },

    syncCall: function ()
    {
        if (!__page._lock)
        {
            __page._lock = true;

            this._request.set_serverParameters(this._transition.get_serverParameters());
            this._request.set_userContext(this._caller);
            this._request.addCompletedHandler(this.onRequestCompleted);
            this._request.execute();
        }

        if (this._transition.get_noModalImage() == true)
        {
            // not show spinning immage
        }
        else
        {
            __page.showModal();
        }

        return false;
    },

    addRequestCompletedHandler: function (functionPointer)
    {
        this._request.addCompletedHandler(functionPointer);
    },

    onRequestCompleted: function (executor, eventArgs)
    {
        __page._lock = false;

        var data = executor.get_responseData();

        if (data.indexOf("SessionIsExpired") != -1)
        {
            pop.hide();
            getCEP_top().document.location.replace('default.htm');
        }
        else
        {
            // Check if the response contains AJAX based data otherwise display raw page content.
            if (data.indexOf('"ClientCallback"') == 1)
            {
                if (data != "")
                    data = Sys.Serialization.JavaScriptSerializer.deserialize(data, false);

                var webReq = executor.get_webRequest();
                var context = webReq.get_userContext();

                this._response = new Camstar.Ajax.Response(data, context);
                this._response.syncResponse();
            }
            else
            {
                var req = executor.get_webRequest();
                var url = req._url;
                setTimeout(function()
                {
                    document.open();
                    document.write(data);
                    document.close();
                }, 0);
            }
        }

        if (__page.get_virtualPageName() != null && __page.get_virtualPageName() == "MainPage"
            && __page.getConcierge() != null && !__page.getConcierge().get_opened())
            __page.getConcierge().toggle(true);
    }
}

var datatowrite;

Camstar.Ajax.Communicator.registerClass('Camstar.Ajax.Communicator', null, Sys.IDisposable);

//Override Microsoft's validation method for performance
Function._validateParams = function Function$_validateParams(params, expectedParams) {
    return null;
}; 

//Notifiy ScriptManager that this is the end of the script
if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
