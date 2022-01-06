// Copyright Siemens 2019  

/// <reference path="../MicrosoftAjaxExt.js"/>
/// <reference path="../Camstar.UI/Control.js" />
Type.registerNamespace("Camstar.WebPortal.Personalization");

/******************* CamstarPortal.WebControls.TabContainer *******************/
CamstarPortal.WebControls.PageTabContainer = function (element)
{
    CamstarPortal.WebControls.PageTabContainer.initializeBase(this, [element]);
    this._controlID = null;
    this._isDirtyAllowed = false;
},

CamstarPortal.WebControls.PageTabContainer.prototype =
{
    initialize: function ()
    {
        CamstarPortal.WebControls.PageTabContainer.callBaseMethod(this, 'initialize');
        $(".ui-page-tab").scrollableTabs({
            overflow: "scroll",
            dirtyMark: this.get_isDirtyAllowed(),
            tabRemoved: function (ev, evdata) {
                CleanupSession(getParameterByName('CallStackKey', evdata.panelSrc));
            }
        });
        if (this._extensions != null)
            eval(this._extensions);
    },

    dispose: function ()
    {
        CamstarPortal.WebControls.PageTabContainer.callBaseMethod(this, 'dispose');
    },
    
    OpenPage: function (pageName, query, caption, iconURl)
    {
        __page = $find("__Page");
        pageName = pageName + '.aspx';
        if (!query)
            query = "ResetCallStack=true";
        __page.openInTabId(pageName, query, caption, null, iconURl);
        return false;
    },

    get_isDirtyAllowed: function () { return this._isDirtyAllowed; },
    set_isDirtyAllowed: function (value) { this._isDirtyAllowed = value; },

    get_extensions: function () { return this._extensions; },
    set_extensions: function (value) { this._extensions = value; },

    get_controlID: function () { return this._controlID; },
    set_controlID: function (value) { this._controlID = value; }
};

CamstarPortal.WebControls.PageTabContainer.registerClass('CamstarPortal.WebControls.PageTabContainer', Camstar.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
