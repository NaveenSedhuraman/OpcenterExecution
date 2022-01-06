// Copyright Siemens 2019  

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
/// <reference path="~/Scripts/ClientFramework/Camstar.WebPortal.PortalFramework/WebPartBase.js" />

Type.registerNamespace("Camstar.WebPortal.WebPortlets");

Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons = function(element)
{
    Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons.initializeBase(this, [element]);
}

Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons.prototype =
{
    initialize: function () {
        Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons.callBaseMethod(this, 'initialize');

        // re-order buttons if needed
        $(':submit', this._element).each(function (a,btn)
        {
            if ($(btn).is('[position=rightmost]') && $(btn).parent().hasClass('left'))
            {
                // Move the button to the right panel
                var leftDiv = $(btn).parent();
                var rightDiv = leftDiv.next();
                var b = $(btn).detach();
                b.appendTo(rightDiv);
                rightDiv.css('margin-right', '-240px');
            }
        }
        );
    },

    dispose: function () {
        Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons.callBaseMethod(this, 'dispose');
    }
}

Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons.registerClass('Camstar.WebPortal.WebPortlets.WorkflowNavigationButtons', Camstar.WebPortal.PortalFramework.WebPartBase);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
