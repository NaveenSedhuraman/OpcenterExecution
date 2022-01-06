// Copyright Siemens 2020 

/// <reference path="../MicrosoftAjaxExt.js"/>
/// <reference path="../Camstar.UI/Control.js" />
/// <reference path="../../jquery/jquery.min.js" />
/// <reference path="../../jquery/jquery-ui.min.js" />
/// <reference path="../../jquery/tiny_mce/skins/content/default/content.min.css" />

Type.registerNamespace("Camstar.WebPortal.FormsFramework.WebControls");
Type.registerNamespace("Camstar.WebPortal.Personalization");

Camstar.WebPortal.Personalization.TextBoxMaskingMode = function () { };

Camstar.WebPortal.Personalization.TextBoxMaskingMode.prototype =
{
    None: 0,
    Integer: 1,
    Decimal: 2,
    Formatted: 3
};

Camstar.WebPortal.Personalization.TextBoxMaskingMode.registerEnum("Camstar.WebPortal.Personalization.TextBoxMaskingMode", false);

Camstar.WebPortal.FormsFramework.WebControls.TextBox = function(element) 
{
    Camstar.WebPortal.FormsFramework.WebControls.TextBox.initializeBase(this, [element]);

    this._inputControl = null;
    this._cssClass = null;
    this._extensions = null;
    this._label = null;
    this._mask = Camstar.WebPortal.Personalization.TextBoxMaskingMode.None;
    this._precision = null;
    this._scale = null;
    this._format = null;
    this._oldValue = "";
    this._isInlineControl = false;
    this._required = false;
    this._customScriptHandlers = null;
    this._prompt = null;
    this._richTextEditor = false;
    this._timers;
    this._interval;
    this._defaultValue = null;
    this.$editorState;
};

Camstar.WebPortal.FormsFramework.WebControls.TextBox.prototype =
{
    initialize: function()
    {
        Camstar.WebPortal.FormsFramework.WebControls.TextBox.callBaseMethod(this, 'initialize');

        var me = this;
        if (this.get_richTextEditor())
        {
            $(this.get_element()).hide();
            setTimeout(function() { me.richEditorInit(); }, 1);
            
            return;
        }
        else
        {
            if (this.get_cssClass().indexOf("AsDiv") > -1)
            {
                this._inputControl = this.get_element();
            }
            else
            {
                var textareas = $('textarea', this.get_element());
                if (textareas.length > 0) {
                    this._inputControl = textareas[0];
                }
                else {
                    this._inputControl = $('input[type="text"]', this.get_element())[0];
                }
            }

            if (this._inputControl)
                this._oldValue = this._inputControl.value;

            if (this._inputControl)
            {
                $(this._inputControl)
                    .on("blur", function (e) { return me._onBlur(e); })
                    .on("focus", function (e) { return me._onFocus(e); })
                    .on("keyup", function (e) { return me._onKeyUp(e); });

                this.setToolTip();
                if (this._isInlineControl && this._required)
                    $(this._inputControl).attr('required', 'required');
                if (this._required)
                    this._setRequiredState(this._inputControl);
            }

            if (this._prompt)
            {
                var promptSpan = $('<span class="input-prompt"/>');
                $(promptSpan).attr('id', 'input-prompt-' + $(this._inputControl).attr('id'));
                $(promptSpan).append(this._prompt);

                var inputControl = $(this._inputControl);

                $(function ()
                {
                    setTimeout(function ()
                    {
                        var deltaWidth = inputControl.outerWidth() - inputControl.width();
                        var deltaHeight = inputControl.outerHeight() - inputControl.height();
                        $(promptSpan).css('margin-left', parseInt(inputControl.css('margin-left')) + deltaWidth / 2);
                        $(promptSpan).css('margin-top', parseInt(inputControl.css('margin-top')) + deltaHeight / 2);
                    }, 0);
                });

                $(promptSpan).click(function ()
                {
                    $(this).hide();
                    inputControl.focus();
                });

                if (inputControl.val() != '')
                {
                    $(promptSpan).hide();
                }
                inputControl.before(promptSpan);
                inputControl.focus(function ()
                {
                    $('#input-prompt-' + $(this).attr('id')).hide();
                });
            }

            if (this._mask == Camstar.WebPortal.Personalization.TextBoxMaskingMode.Integer)
                $(this._inputControl).on('input', function (e) { return me._integerMasking(e); });
            else if (this._mask == Camstar.WebPortal.Personalization.TextBoxMaskingMode.Decimal)
                $(this._inputControl).on('input', function (e) { return me._decimalMasking(e); });

            else if (this._mask == Camstar.WebPortal.Personalization.TextBoxMaskingMode.Formatted && this._format != null)
                $(this._inputControl).mask(this._format);
        }

        if (this._extensions != null)
            eval(this._extensions);

        if (this.get_interval()) {
            this.set_interval(this.get_interval());
        }
        if (this.get_timers()) {
            this.timersInit();
        }
        if (this._inputControl) {            
            if (this._inputControl.getAttribute("onchange"))
                if (!$(this._inputControl).closest(".ParametricDataControl").length) {
                    if (this._inputControl.id != "ctl00_WebPartManager_SchedulingGroupWP_EveryHourControl_ctl00" &&
                        this._inputControl.id != "ctl00_WebPartManager_SchedulingGroupWP_StartingAtHourControl_ctl00" &&
                        this._inputControl.id != "ctl00_WebPartManager_CurrentStatusWP_CollapsibleSectionsAccordion_ctl07_ContainerSearchFilters_Qty_ctl00" &&
                        this._inputControl.id != "ctl00_WebPartManager_CurrentStatusWP_ContainerSearchFilters_Qty_ctl00") {
                        this._inputControl.setAttribute("onchange", "onChangeTextBox('" + this._inputControl.name + "')");
                    }

                }

        }
    },

    richEditorInit: function(forceInit)
    {
        var $tx = $('#' + this.get_element().id);

        var $ownerWp = $tx.closest('.webpart');
        if ($ownerWp.hasClass('litepopup-webpart') && typeof forceInit == "undefined") {
            // tinymce is not initialized for the parent (caller) form 
            return;
        }

        $tx.show();

        $tx.parent().attr("tinymce", "tinymce");

        var isReadOnly = 0;
        if ($tx.is('[readonly]'))
        {
            isReadOnly = 1;
        }

        var hlClass = $ownerWp.attr('[HighlightRequiredFields]');
        var highlightRequired = ($tx.is('[required]') && hlClass);
        if (!highlightRequired)
            hlClass = null;
        this.$editorState = $('[id$=editorState]', $tx.parent());

        var me = this;

        tinymce.init({
            selector: '#' + this.get_element().id,
            readonly: isReadOnly,
            branding: false,
            content_style: 'p { font-size: 10pt; }',
            theme: 'silver',
            plugins: ['searchreplace', 'paste', 'lists', 'autolink', 'code', 'image', 'autoresize'],
            toolbar1: "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
            toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent | undo redo | code | subscript superscript | forecolor backcolor | image",
            style_formats: [
                { title: 'Blue Underline', inline: 'span', styles: { color: 'blue', textDecoration: 'underline' } },
                { title: 'Red Bold', inline: 'span', styles: { color: 'red', fontWeight: 'bold' } },
                { title: 'ALL CAPS', inline: 'span', styles: { textTransform: 'uppercase' } },
                { title: 'all lowercase', inline: 'span', styles: { textTransform: 'lowercase' } }
            ],
            menubar: false,
            resize: 'both',
            add_form_submit_trigger: false,
            paste_data_images: true,
            init_instance_callback: function (ed) {
                if (hlClass)
                    me.highlightTinymce(ed, hlClass);

                me.changeParagraphLabelToStyles(ed);
            },
            setup: function (ed)
            {
                ed.on('blur', function (e){
                    ed.save();
                });
                ed.on('focus', function () {
                    if (me.$editorState.val())
                        me.setRichEditorPosition(ed, me.$editorState.val().split(','));
                });
                ed.on('click', function () {
                    me.getRichEditorPosition(ed);
                });
                ed.on('Change', function ()
                {
                    if (hlClass)
                        me.highlightTinymce(ed, hlClass);
                });
                ed.on('ExecCommand', function () {
                    ed.save();
                    me.getRichEditorPosition(ed);
                });
                ed.on('BeforeAddUndo', function(e) {
                    if (e && e.originalEvent && e.originalEvent && e.originalEvent.command === "Paste")
                        return false;
                });
                ed.on('SetContent', function (e) {
                    if (e.initial === true) {
                        if (me.$editorState.val())
                            me.setRichEditorPosition(ed, me.$editorState.val().split(','));
                    }
                });

                var maxLength = ed.getParam("maxLength");
                var maxlengthLastContent = $("#" + ed.id).val();

                ed.on('keydown', function (e) {
                    if (maxLength) {
                        var key = e.keyCode;
                        var allowedKeys = [8, 37, 38, 39, 40, 46]; // Backspace, Del, Arrows.
                        if (allowedKeys.indexOf(key) < 0 && !me.checkMaxLength(ed, parseInt(maxLength) - 1)) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                        maxlengthLastContent = ed.getContent();
                    }
                });

                ed.on('keyup', function () {
                    if (maxLength)
                    {
                        if (!me.checkMaxLength(ed, parseInt(maxLength)))
                            ed.setContent(maxlengthLastContent);
                        else
                            maxlengthLastContent = ed.getContent();
                    }
                    if (Camstars.Browser.IE)
                        ed.save();
                    me.getRichEditorPosition(ed);
                });
            }
        });        
    },

    richEditorRemove: function ()
    {
        var editorInstance = tinymce.get(this.get_element().id);
        if (editorInstance) {
            editorInstance.remove();
        }
    },

    checkMaxLength: function(ed, maxLength) {
        if (maxLength)
            return $.trim(ed.getContent().replace(/(<([^>]+)>|&nbsp;)/ig, "")).length <= maxLength;
        return true;
    },

    getNodeIndex : function(c) {
        var parentChilds = c.parentNode.childNodes;
        for (var i = 0; i < parentChilds.length; i++) {
            if (parentChilds[i] == c)
                return i;
        }
        return -1;
    },

    getRichEditorPosition: function (ed)
    {
        this.changeParagraphLabelToStyles(ed);

        var p = ed.getBody();   
        var range = ed.selection.getRng(true);

        var path = [];
        var index;
        var c = range.startContainer;
        while (c != p) {
            index = this.getNodeIndex(c);
            if (index != -1) {
                path.push(index);
                c = c.parentNode;
            }
            else {
                break;
            }
        }
        // path transmitted in backward
        path.push(range.startOffset);
        this.$editorState.val(path.join());
    },

    setRichEditorPosition: function (ed, path)
    {
        var startOffset = path.pop();
        var index;
        var body = ed.getBody();        // start <p>

        var c = body;
        while (path.length) {
            index = path.pop();
            c = c.childNodes[index];
            if (!c)
                return;

            if (c.nodeType == 3)
                break;
        }
        try {
            if (typeof startOffset == "string")
                startOffset = parseInt(startOffset);
            ed.selection.setCursorLocation(c, startOffset);
        }
        catch (e) {
            console.error('error - setRichEditorPosition', ed, path);
        }
    },

    highlightTinymce: function(ed, highlightClass)
    {
        var $edctl = $('#' + ed.id);
        if ($edctl.length && highlightClass)
        {
            var $box = $edctl.parent().find('td.mceIframeContainer');
            var text = tinymce.trim(ed.getBody().innerText || ed.getBody().textContent);
            if (text.length > 0)
                $box.removeClass(highlightClass);
            else
                $box.addClass(highlightClass);
        }
    },

    timersInit: function () {
        var tmrs = this.get_timers();        
        if (tmrs)
        {
            timersWatcher.initialize(this.get_element().id);
            timersWatcher.interval = this.get_interval();
            timersWatcher.loadTimersFromContainer(tmrs);
            timersWatcher.update();
        }
    },

    dispose: function()
    {
        this.richEditorRemove();
        Camstar.WebPortal.FormsFramework.WebControls.TextBox.callBaseMethod(this, 'dispose');
    },

    setToolTip: function()
    {
        if (this._inputControl.scrollWidth > this._inputControl.offsetWidth)
        {
            this._inputControl.parentNode.title = this.get_cssClass().indexOf("AsDiv") > -1 ? this._inputControl.innerHTML : this._inputControl.value;
        }
    },

    _onBlur: function(e)
    {
        var inputControl = e.target;
        var val = inputControl.value;
        if (this._mask == Camstar.WebPortal.Personalization.TextBoxMaskingMode.Integer ||
                this._mask == Camstar.WebPortal.Personalization.TextBoxMaskingMode.Decimal
        )
        {
            if (val == "+" || val == "-")
            {
                this._oldValue = "";
                inputControl.value = "";
            }
        }

        inputControl.parentNode.title = inputControl.scrollWidth > inputControl.offsetWidth ? inputControl.value : "";

        this._setRequiredState(this._inputControl);

        if (this._customScriptHandlers && this._customScriptHandlers.onblur != undefined)
        {
            var fun = window[this._customScriptHandlers.onblur];
            if (fun != undefined)
                fun.call(inputControl, e);
        }

        if (this._customScriptHandlers && this._customScriptHandlers.change != undefined)
            eval(this._customScriptHandlers.change);
        
        $(this).trigger("changed");

        if (this._prompt && inputControl.value == '') 
            $('#input-prompt-' + $(inputControl).attr('id')).show();
    },

    applyDurationMask: function () {
        //Valid value: 99:23:59:59
        var exp = /^\d\d\.(((0|1)?[0-9])|(2[0-3])):[0-5][0-9]:[0-5][0-9]$/;
        var isMatch = exp.exec(this._inputControl.value);
        if (isMatch == null)
            this._inputControl.value = '';
    },

    _integerMasking: function(e)
    {
        var value = e.target.value;
        var passTest = /^[-+]?\d*$/.test(value);

        if (!passTest)
            e.target.value = this._oldValue;
        else
            this._oldValue = value;
    },

    _decimalMasking: function(e)
    {
        var value = e.target.value;
        var prec = (this._precision != null) ? "{1," + this._precision + "}" : "+";
        var scale = (this._scale != null) ? "{0," + this._scale + "}" : "+";
        var decSeparator = Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator;
        var regExp = "/^[-+]?(\\d" + prec + "\\" + decSeparator + "?\\d" + scale + "?)?$/";
        var passTest = eval(regExp).test(value);

        if (!passTest)
            e.target.value = this._oldValue;
        else
            this._oldValue = value;
    },

    _onKeyUp: function(e)
    {
        if (/^[0-9]+$/.test(this._inputControl.getAttribute("maxlength")))
        {
            var len = parseInt(this._inputControl.getAttribute("maxlength"), 10);
            if (this._inputControl.value.length > len)
            {
                this._inputControl.value = this._inputControl.value.substr(0, len);
                this._oldValue = this._inputControl.value;
                return false;
            }
        }

        if (this._required)
        {
            this._setRequiredState(this._inputControl);
        }
        this._oldValue = this._inputControl.value;
    },

    _onFocus: function(e)
    {
        $(this._inputControl).select();
        this._setRequiredState(this._inputControl);
    },

    _setRequiredState: function(inpCtl)
    {
        var hl_css = this.get_hl_required();
        if (hl_css && this.get_required())
        {
            if (inpCtl.value.length > 0)
                $(inpCtl).removeClass(hl_css);
            else
                $(inpCtl).addClass(hl_css);
        }
    },

    directUpdate: function(value)
    {
        Camstar.WebPortal.FormsFramework.WebControls.TextBox.callBaseMethod(this, 'directUpdate');

        if (value.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Data))
        {
            if (this._inputControl)
            {
                this._inputControl.value = value.PropertyValue;
                this._oldValue = value.PropertyValue;
                this._setRequiredState(this._inputControl);
            }
        }
        else if (value.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Enable))
        {
            if (this._inputControl)
            {
                //span element
                var spanElement = this.get_element();
                if (spanElement)
                {
                    spanElement.disabled = value.PropertyValue != "True";
                }

                this._inputControl.disabled = value.PropertyValue != "True";
                this._inputControl.parentNode.style.backgroundColor = this._inputControl.parentNode.getAttribute(value.PropertyValue != "True" ? "DisabledBG" : "EnabledBG");

                // Parent element is TD
                if (!this._inputControl.disabled)
                {
                    this._inputControl.parentNode.onactivate = "ControlIslandOnFocus(this,'MediumTextBoxControlSelected');";
                }
            }
        }
        else if (value.PropertyKey == eval(Camstar.Ajax.DirectUpdateParameterKeys.Visible))
        {
            if (this._inputControl)
            {
                var parent = this._inputControl.parentNode;

                while (parent.tagName != "SPAN")
                {
                    parent = parent.parentNode;
                }

                parent.style.display = value.PropertyValue == "True" ? "" : "none";
            }
        }
    },

    Focus: function()
    {
        this._inputControl.focus();
    },

    Click: function (method)
    {
        $(this._inputControl).off('click').on('click', method);
    },

    SetAttribute: function(name, val)
    {
        this._inputControl.setAttribute(name, val);
    },

    SetStyle: function(name, val)
    {
        this._inputControl.style[name] = val;
    },

    DataChanged: function(method)
    {
        $(this._inputControl).on('change', method);
    },

    DataChanging: function(method)
    {
        $(this._inputControl).on('keyup', method);
    },

    getValue: function()
    {
        if (this._inputControl)
            return this._inputControl.value;
        else
            return null;
    },

    setValue: function(value)
    {
        if (this._inputControl)
        {
            this._inputControl.value = value;
            this._setRequiredState(this._inputControl);
        }
    },

    clearValue: function() 
    {
        this.setValue('');
    },

    get_Data: function() { return this.getValue(); },
    set_Data: function(value) { this.setValue(value); },

    get_Hidden: function() { return this._element.style.display == 'none'; },
    set_Hidden: function(value)
    {
        if (value == true)
        {
            this._element.style.display = 'none';
            this._label.style.display = 'none';
        } else
        {
            this._element.style.display = '';
            this._label.style.display = '';
        }
    },

    get_Disabled: function () { return this._element.disabled; },
    set_Disabled: function(value)
    {
        this._element.disabled = value;
        this._inputControl.disabled = value;
    },

    get_ReadOnly: function() { return this._inputControl.readonly; },
    set_ReadOnly: function(value)
    {
        this._inputControl.readOnly = value;
    },

    get_IsEmpty: function() { return !this.getValue(); },

    get_cssClass: function() { return this._cssClass; },
    set_cssClass: function(value) { this._cssClass = value; },

    get_prompt: function() { return this._prompt; },
    set_prompt: function(value) { this._prompt = value; },

    get_extensions: function() { return this._extensions; },
    set_extensions: function(value) { this._extensions = value; },

    get_label: function() { return this._label; },
    set_label: function(value) { this._label = value; },

    get_mask: function() { return this._mask; },
    set_mask: function(value) { this._mask = value; },

    get_precision: function() { return this._precision; },
    set_precision: function(value) { this._precision = value; },

    get_scale: function() { return this._scale; },
    set_scale: function(value) { this._scale = value; },

    get_format: function() { return this._format; },
    set_format: function(value) { this._format = value; },

    get_isInlineControl: function() { return this._isInlineControl; },
    set_isInlineControl: function(value) { this._isInlineControl = value; },

    get_customScriptHandlers: function() { return this._customScriptHandlers; },
    set_customScriptHandlers: function(value) { this._customScriptHandlers = value; },

    get_required: function() { return this._required; },
    set_required: function (value) { this._required = value; },

    get_richTextEditor: function () { return this._richTextEditor; },
    set_richTextEditor: function (value) { this._richTextEditor = value; },

    get_timers: function () { return this._timers; },
    set_timers: function (value) { this._timers = value; },

    get_interval: function() { return this._interval; },
    set_interval: function(value) { this._interval = value; },

    get_defaultValue: function () { return this._defaultValue; },
    set_defaultValue: function (value) { this._defaultValue = value; },

    changeParagraphLabelToStyles: function (ed) {
        $('div button[title="Formats"] span', ed.editorContainer).each(
            function (ind, ui) {
                if (ui.innerText == "Paragraph") {
                    // Timeout needed for Chrome bug.
                    setTimeout(function () {
                        ui.innerText = "Styles";
                        return false;
                    }, 1);
                }
                return true;
            });

    }
};

Camstar.WebPortal.FormsFramework.WebControls.TextBox.registerClass('Camstar.WebPortal.FormsFramework.WebControls.TextBox', Camstar.UI.Control);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
