// Copyright Siemens 2019 

/// <reference path="../MicrosoftAjaxExt.js"/>
/// <reference path="../Camstar.UI/Control.js" />
Type.registerNamespace("Camstar.WebPortal.FormsFramework.WebControls");
Type.registerNamespace("Camstar.WebPortal.Personalization");

Camstar.WebPortal.FormsFramework.WebControls.CheckBox = function (element) {
    Camstar.WebPortal.FormsFramework.WebControls.CheckBox.initializeBase(this, [element]);

    this._inputControl = null;
};

Camstar.WebPortal.FormsFramework.WebControls.CheckBox.prototype = {
    initialize: function() {
        Camstar.WebPortal.FormsFramework.WebControls.CheckBox.callBaseMethod(this, 'initialize');

        var me = this;
        $(this._inputControl).on('click', function (x) {
            me.updateState();
        });

        $(this._inputControl).on('change', function(x)
        {
            me.updateState();
        });

        $(this._inputControl).on('focus', function(x) {
            $(me._element).children('label').first().addClass('focused');
        });

        $(this._inputControl).on('blur', function(x) {
            $(me._element).children('label').first().removeClass('focused');
        });

        this.updateState();
    },

    dispose: function () {
        Camstar.WebPortal.FormsFramework.WebControls.CheckBox.callBaseMethod(this, 'dispose');
    },

    getValue: function()
    {
        return $(this._inputControl).is(":checked");
    },

    setValue: function(v)
    {
        $(this._inputControl).prop("checked", v);
        this.updateState();
    },

    clearValue: function () {
        this.setValue(false);
    },

    updateState: function()
    {
        $(this._element).attr("checked", $(this._inputControl).is(":checked"));
        $(this).trigger("changed", $(this._inputControl).is(":checked"));
    },

    get_Hidden: function () { return this._element.style.display === 'none'; },
    set_Hidden: function (value) {
        if (value === true)
            $(this._element).hide();
        else
            $(this._element).show();
    },

    get_Disabled: function () {
        return this._element.disabled;
    },
    set_Disabled: function (value) {
        this._element.disabled = value;
    },

    get_input: function () { return this._inputControl; },
    set_input: function (value) { this._inputControl = value; }
};

Camstar.WebPortal.FormsFramework.WebControls.CheckBox.registerClass('Camstar.WebPortal.FormsFramework.WebControls.CheckBox', Camstar.UI.Control);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

