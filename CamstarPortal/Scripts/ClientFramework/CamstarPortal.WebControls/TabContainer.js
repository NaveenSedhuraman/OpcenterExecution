// Copyright Siemens 2019  

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
Type.registerNamespace("Camstar.WebPortal.Personalization");

/******************* CamstarPortal.WebControls.TabContainer *******************/
CamstarPortal.WebControls.TabContainer = function(element)
{
    CamstarPortal.WebControls.TabContainer.initializeBase(this, [element]);
    this._controlID = null;
    this._loadAllTabs = false;
}

CamstarPortal.WebControls.TabContainer.prototype =
{
    initialize: function()
    {
        CamstarPortal.WebControls.TabContainer.callBaseMethod(this, 'initialize');


        $(this.get_element()).scrollableTabs({
            overflow: "wrap",
            removable: false,
            hideIfEmpty: false,
            activate: function (event, ui) {
                //If workflow control (which uses jsPlumb) is present on hidden tab,
                //it may incorretly calculate items' & connections' dimensions, and therefore needs to be redrawn
                if (typeof (jsPlumb) === "object")
                    jsPlumb.repaintEverything();
                if (!this.control.get_loadAllTabs())
                {
                    __page.postback(this.control.get_controlID(), ui.newTab.index(), null);
                    return false;
                }
                return true;
            }
        });
    },

    dispose: function()
    {
        CamstarPortal.WebControls.TabContainer.callBaseMethod(this, 'dispose');
    },

    get_controlID: function() { return this._controlID; },
    set_controlID: function(value) { this._controlID = value; },

    get_loadAllTabs: function() { return this._loadAllTabs; },
    set_loadAllTabs: function(value) { this._loadAllTabs = value; }
};

CamstarPortal.WebControls.TabContainer.registerClass('CamstarPortal.WebControls.TabContainer', Camstar.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
