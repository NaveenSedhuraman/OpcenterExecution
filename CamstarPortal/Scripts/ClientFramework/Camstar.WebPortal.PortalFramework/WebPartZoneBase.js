// Copyright Siemens 2019  

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
Type.registerNamespace("Camstar.WebPortal.PortalFramework");

Camstar.WebPortal.PortalFramework.WebPartBaseZone = function(element) 
{
    Camstar.WebPortal.PortalFramework.WebPartBaseZone.initializeBase(this, [element]);

    this._isStatic = false;
    this._webPartClientIds = new Array();
}

Camstar.WebPortal.PortalFramework.WebPartBaseZone.prototype = 
{
    initialize: function() 
    {
        Camstar.WebPortal.PortalFramework.WebPartBaseZone.callBaseMethod(this, 'initialize');
    },
    
    dispose: function() 
    {        
        Camstar.WebPortal.PortalFramework.WebPartBaseZone.callBaseMethod(this, 'dispose');
    },
    
    get_isStatic: function() { return this._isStatic; },
    set_isStatic: function(value) { this._isStatic = value; },

    get_webPartClientIds: function() { return this._webPartClientIds; },
    set_webPartClientIds: function(value) { this._webPartClientIds = value;}
}

// Optional descriptor for JSON serialization.
Camstar.WebPortal.PortalFramework.WebPartBaseZone.descriptor =
{
    properties:
    [
        { name: "webPartClientIds", type: Array }
    ]
}

Camstar.WebPortal.PortalFramework.WebPartBaseZone.registerClass('Camstar.WebPortal.PortalFramework.WebPartBaseZone', Camstar.UI.Control);

if (typeof(Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
