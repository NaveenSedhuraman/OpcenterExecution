// Copyright Siemens 2019  

/// <reference path="../MicrosoftAjaxExt.js"/>
Type.registerNamespace("Camstar.UI");

// Generic Client-Side UI Component Interface
Camstar.UI.IUIComponent = function () { };
Camstar.UI.IUIComponent.Prototype =
    {
        get_isStatic: function () { },
        refresh: function (html) { }
    };
Camstar.UI.IUIComponent.registerInterface('Camstar.UI.IUIComponent');

// Base class for all client-side objects
Camstar.UI.Control = function (element) {
    // check to see if this control already exists    
    var me = element ? $find(element.id) : null;

    if (me) {
        // dispose it so new DOM element can be initialized with this component
        me.dispose();
    }

    if (element)
        // fixes ASP.AJAX bug introduced in .NET4.0
        element.control = undefined;

    Camstar.UI.Control.initializeBase(this, [element]);
};

Camstar.UI.Control.prototype =
    {
        initialize: function () {
            Camstar.UI.Control.callBaseMethod(this, 'initialize');
            var wp = $(this.get_element()).parents('.webpart');
            if (wp.length && wp.attr('HighlightRequiredFields')) {
                this._hl_required_class = wp.attr('HighlightRequiredFields');
            }
            else {
                this._hl_required_class = null;
            }
        },

        dispose: function () {
            Camstar.UI.Control.callBaseMethod(this, 'dispose');
        },

        get_isStatic: function () { return false; },

        refresh: function (html) {
            var internalWebPart = document.getElementById('WebPart_' + this._serverID); //$('#WebPart_' + this._serverID);
            if (this.get_element().children.length == 0 && internalWebPart.length != 0) {
                // the internal web part inside the dialog
                var $i = $(internalWebPart);
                var d = $(html);
                if ($i.is(':visible')) {
                    // if the dialog web part has been visible it will be set visible after rendering
                    setTimeout(function () {
                        $i.show();
                    }, 100);
                }
                $i.empty();
                $i.html(d.html());
                d.remove();
            }
            else {
                this.get_element().innerHTML = html;
            }
            if (!this._initialized)
                this.initialize();
        },

        directUpdate: function (value) { },

        get_hl_required: function () { return this._hl_required_class; }

    };
Camstar.UI.Control.registerClass('Camstar.UI.Control', Sys.UI.Control, Camstar.UI.IUIComponent);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
