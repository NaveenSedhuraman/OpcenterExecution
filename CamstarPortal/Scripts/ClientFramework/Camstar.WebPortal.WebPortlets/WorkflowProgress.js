// Copyright Siemens 2019  

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
/// <reference path="~/Scripts/ClientFramework/Camstar.WebPortal.PortalFramework/WebPartBase.js" />

Type.registerNamespace("Camstar.WebPortal.WebPortlets");

Camstar.WebPortal.WebPortlets.WorkflowProgress = function(element)
{
    Camstar.WebPortal.WebPortlets.WorkflowProgress.initializeBase(this, [element]);
    
    this._isVisible = false;
}

Camstar.WebPortal.WebPortlets.WorkflowProgress.prototype = {
    initialize: function()
    {
        Camstar.WebPortal.WebPortlets.WorkflowProgress.callBaseMethod(this, 'initialize');   
        
    },

    dispose: function()
    {
        Camstar.WebPortal.WebPortlets.WorkflowProgress.callBaseMethod(this, 'dispose');
    },

    get_isVisible: function()
    {
        if (this.get_element() != null)
            return (this.get_element().offsetHeight == 30);
        else
            return false;
    }
}

Camstar.WebPortal.WebPortlets.WorkflowProgress.registerClass('Camstar.WebPortal.WebPortlets.WorkflowProgress', Camstar.WebPortal.PortalFramework.WebPartBase);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
