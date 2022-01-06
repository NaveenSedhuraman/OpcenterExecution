// Copyright Siemens 2019 

/// <reference path="../MicrosoftAjaxExt.js"/>
/// <reference path="../Camstar.UI/Control.js" />
/// <reference path="../../jquery/jquery.min.js" />
/// <reference path="../../jquery/jquery-ui.min.js" />
Type.registerNamespace('Camstar.WebPortal.PortalFramework');

//Constructor
Camstar.WebPortal.PortalFramework.WebPartBase = function(element)
{
    Camstar.WebPortal.PortalFramework.WebPartBase.initializeBase(this, [element]);

    /*** Private Member Variables ***/
    this._wrapperIDs = new Array();
    this._serverType = null;
    this._serverID = null;
    this._chromeState = null;
    this._isStatic = false;
    this._zoneElement = null;
    this._isResizable = false;
    this._pageTemplate = null;
    this._isEditing = false;
    this._dirtyFlagTrigger = true;
    this._width = null;
    this._wpDelConfirmMsg = null;
    this._commandBarSettings = null;
};

Camstar.WebPortal.PortalFramework.WebPartBase.prototype =
{
    initialize: function()
    {
        //call base intialize function
        Camstar.WebPortal.PortalFramework.WebPartBase.callBaseMethod(this, 'initialize');
        this._toggleChromeStateDelegate = Function.createDelegate(this, this._onToggleChromeState);
        this._toggleConciergeStateDelegate = Function.createDelegate(this, this._onToggleConciergeStateDelegate);
        this._toggleImageDelegate = Function.createDelegate(this, this._onToggleImage);
        this._closeDelegate = Function.createDelegate(this, this._onClose);
        this._editDelegate = Function.createDelegate(this, this._onEdit);

        var minimizeButton = this.get_minimizeButton();
        if (minimizeButton)
        {
            $clearHandlers(minimizeButton);

            $addHandlers(minimizeButton,
            {
                'click': this._toggleChromeStateDelegate,
                'mouseover': this._toggleImageDelegate,
                'mouseout': this._toggleImageDelegate
            }, this);
        }

        var closeButton = this.get_closeButton();
        if (closeButton)
        {
            $clearHandlers(closeButton);
            $addHandlers(closeButton, { 'click': this._closeDelegate }, this);
        }

        var editButton = this.get_editButton();
        if (editButton)
        {
            $clearHandlers(editButton);
            $addHandlers(editButton, { 'click': this._editDelegate }, this);
        }

        //ensures entire webpart is visible during editing
        if (this.get_isEditing() && parseInt(this.get_width()) < 250)
        {
            this.get_element().style.position = "absolute";
            this.get_element().style.zIndex = "10000";
            this.get_element().style.backgroundColor = "White";
        }
        else
        {
            this.get_element().style.position = "";
            this.get_element().style.zIndex = "";
            this.get_element().style.backgroundColor = "";
        }

        var webPartElement = this.get_element();

        // add 'cell empty' style for cells with all invisible children.
        this._setEmptyCell(webPartElement.id);


        // Command Bar initailization
        var cmdtype = this.get_CommandBarSettings();
        if (cmdtype) {
            var p = getCEP_top().__page;
            if (p)
                p.setPageSideBar(cmdtype, webPartElement.ownerDocument);
        }

        if (this._isResizable)
        {
            var me = this;
            $(function()
            {
                var zoneElement = $(me.get_zoneElement());
                var zoneContainer = zoneElement.parents('td');
                if (zoneContainer.length > 0)
                {
                    if (Camstars.Browser.IE) // ie doesn't calculate td's width properly.
                    {
                        var zoneContainerTable = zoneElement.parents('table');
                        if (zoneContainerTable.length > 0)
                        {
                            zoneContainerTable.css({ width: 'auto' });
                            zoneContainer.width(zoneContainer.width());
                            zoneContainerTable.css({ width: '100%' });
                        }
                    }
                    if (!zoneContainer.hasClass("vsplitter-container"))
                        zoneContainer.addClass("vsplitter-container");
                    me.makeResizable();
                }
            });
        }

        if ($(document.body).hasClass("Horizon-theme")) {
            var $wp = $(">.webpart", this.get_element());
            if ($wp.hasClass("webpart-containerstatus-m") || $wp.hasClass("ui-webpart-resource-status")) {
                // add to page's init
                $(">form", document.body)
                    .off("page.initialized")
                    .on("page.initialized", function () {
                        containerStatusM_adjustment();
                        resourceStatus_adjustment();
                    });
            }
        }
    },

    makeResizable: function()
    {
        var leftZone = $(this.get_zoneElement()).closest('td');
        if (leftZone.length > 0)
        {
            var rightZone = leftZone.next();
            if (rightZone.length > 0)
            {
                var me = this;                                                                                                   
                $(leftZone).filter(":visible").css({ display: 'inline-block', overflow: 'hidden' });
                if (!leftZone.is('.ui-resizable'))
                {
                    leftZone.attr('origWidth', $(leftZone).width());
                    leftZone.attr('actualWidth', $(leftZone).width());
                    leftZone.resizable({
                        helper: "ui-resizable-helper",
                        handles: 'e',
                        maxWidth: leftZone.width(),
                        stop: function(event, ui)
                        {
                            var deltaX = ui.size.width - ui.originalSize.width;
                            me.resizeContent(ui.element, deltaX);
                            leftZone.attr('actualWidth', ui.size.width);
                            $(ui.element).height('auto');
                        }
                    });

                    // init expand/collapse button for vertical splitter.
                    $('<div class="vSplitter-button"></div>').appendTo($('div.ui-resizable-e', leftZone)).click(function()
                    {
                        var currentWidth = $(leftZone).width();
                        var deltaX = 0;
                        if (currentWidth > 20) // need to collapse
                        {
                            deltaX = 10 - currentWidth;
                            $(leftZone).width(10);
                            leftZone.attr('actualWidth', 10);
                            leftZone.find("input").prop("readonly", true);
                        }
                        else // need to expand
                        {
                            deltaX = leftZone.attr('origWidth') - currentWidth;
                            $(leftZone).width(leftZone.attr('origWidth'));
                            leftZone.attr('actualWidth', leftZone.attr('origWidth'));
                            leftZone.find("input").prop("readonly", "");
                        }
                        me.resizeContent($(leftZone), deltaX);
                    });
                }

                // restores controls' sizes after post back.
                if (leftZone.attr('origWidth') && leftZone.attr('actualWidth'))
                {
                    var zoneWidth = leftZone.attr('actualWidth');
                    leftZone.width(zoneWidth);
                    if (zoneWidth != leftZone.attr('origWidth'))
                    {
                        setTimeout(function()
                        {
                            me.resizeContent(leftZone, zoneWidth - leftZone.attr('origWidth'));
                        }, 0);
                    }
                }

                //in collapse mode, postback causes visual artefacts because left zone 
                //input control receives focus and webpart scrolls. 
                //disabling all input controls prevents getting focus by collapsed left zone
                if ($(leftZone).width() == 10)
                    leftZone.find("input").prop("readonly", true);
                else
                    leftZone.find("input").prop("readonly", "");
            }
        }
    },

    resizeContent: function(leftZone, deltaX)
    {
        var divTwo = $(leftZone).next();
        // resizes grids.
        $('table.ui-jqgrid-btable', divTwo).filter(":visible").each(
            function()
            {
                var g = $find(this.id);
                if (g && g._width)
                {
                    g._width -= deltaX;
                    var theGrid = jQuery(g.GridID);
                    theGrid.setGridWidth(g._width, g._shrinkColumns);
                    g._fixScroll(g._gridID);
                }
            }
        );
        // resizes tab panels.
        $('.ui-tabs-panel', divTwo).filter(":visible").each(
            function()
            {
                $('#' + this.id).width($('#' + this.id).width() - deltaX);
            }
        );

        if ($(leftZone).width() <= 10)
            $('.vSplitter-button', leftZone).addClass('right');
        else
            $('.vSplitter-button', leftZone).removeClass('right');
    },


    /*** Event Delegates ***/
    _onToggleConciergeStateDelegate: function(e)
    {
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("ToggleConciergeState");
        transition.set_clientCallback("ToggleConciergeState_apply");

        var communicator = new Camstar.Ajax.Communicator(transition, this);
        communicator.syncCall();

        return false;
    },


    _onToggleChromeState: function(e)
    {
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("ToggleChromeState");
        transition.set_clientCallback("ToggleChromeState_apply");

        var communicator = new Camstar.Ajax.Communicator(transition, this);
        communicator.syncCall();

        return false;
    },

    _onToggleImage: function(e)
    {
        var imgButton = e.target;

        if (imgButton)
        {
            if (e.type == "mouseover")
            {
                imgButton.src = imgButton.getAttribute("overImg");
            }
            else if (e.type == "mouseout")
            {
                imgButton.src = imgButton.getAttribute("normalImg");
            }
        }
    },

    _onClose: function(e)
    {
        var confirmationMessage = this._wpDelConfirmMsg;

        var eventTarget = this.get_zoneElement().id;
        var eventArgument = "Close:" + this.get_controlId();
        var postbackFunction = "__page.postback('" + eventTarget + "','" + eventArgument + "')";

        JConfirmationShort(confirmationMessage, postbackFunction);
        return false;
    },

    _onEdit: function(e)
    {
        if (this.get_isEditing())
        {
            // If edit mode closing simulate Cancel button click
            var cancelButton = this.GetCancelEditButton();
            if (cancelButton)
            {
                cancelButton.click();
            }
        }
        else
        {
            // If normal view - pass to normal execution
            return true;
        }
        return false;
    },

    //    /*** Public Methods ***/
    ToggleConciergeState_apply: function(responseSection)
    {
        if (responseSection && responseSection.Data)
        {
            __page.getConcierge().refresh(responseSection.Data.Message);
            $(this.get_zoneElement()).hide();
            $(this.get_zoneElement()).toggle("slide", { direction: "up" }, 1000);
        }

        __page.hideModal();
    },

    ToggleChromeState_apply: function(responseSection)
    {
        if (responseSection && responseSection.Data)
        {
            var state = responseSection.Data.Message;
            var contPanel = this.get_contentPanel();
            if (contPanel)
                contPanel.style.display = (state == "Normal") ? "block" : "none";

            var minimizeButton = this.get_minimizeButton();

            if (state == "Normal")
            {
                minimizeButton.src = minimizeButton.getAttribute("minimizeImageH");
                minimizeButton.setAttribute("overImg", minimizeButton.getAttribute("minimizeImage"));
                minimizeButton.setAttribute("normalImg", minimizeButton.getAttribute("minimizeImageH"));
            }
            else
            {
                minimizeButton.src = minimizeButton.getAttribute("restoreImageH");
                minimizeButton.setAttribute("overImg", minimizeButton.getAttribute("restoreImage"));
                minimizeButton.setAttribute("normalImg", minimizeButton.getAttribute("restoreImageH"));
            }
        }

        __page.hideModal();
    },

    dispose: function()
    {
        var minimizeButton = this.get_minimizeButton();
        if (minimizeButton)
            $clearHandlers(minimizeButton);
        this._wrapperIDs = null;
        this._serverType = null;
        this._serverID = null;
        this._chromeState = null;
        this._isStatic = null;
        this._zoneElement = null;
        this._isResizable = false;

        Camstar.WebPortal.PortalFramework.WebPartBase.callBaseMethod(this, 'dispose');
    },

    _setEmptyCell: function(elementId)
    {
        $('.webpart .matrix', $get(elementId)).each(function(matrixNum, matrix) {
            if ($(matrix).is(":visible") == true) {
                $('tr, div.row', $(matrix)).each(function (rn, r) {
                    ($(r).children("td.cell, div.cell-m")).each(function (cn, c) {
                            var isToggleContainer = $(this).closest('div.toggle-container,div.accordionContent,.ui-tabs-panel').length > 0;
                            var visibleChildren = $(c).children(":visible");
                            if (visibleChildren.length == 0 && !isToggleContainer) {
                                $(c).addClass("empty");
                            }
                        })
                        .last().addClass('last-cell');
                });
            }
        });
    },

    /*** Public Properties ***/
    get_controlId: function() { return this._serverID; },
    set_controlId: function(value) { this._serverID = value; },

    get_serverType: function() { return this._serverType; },
    set_serverType: function(value) { this._serverType = value; },

    get_isStatic: function() { return this._isStatic; },
    set_isStatic: function(value) { this._isStatic = value; },

    get_wrapperIDs: function() { return this._wrapperIDs; },
    set_wrapperIDs: function(value) { this._wrapperIDs = value; },

    get_zoneElement: function() { return this._zoneElement; },
    set_zoneElement: function(value) { this._zoneElement = value; },

    get_isResizable: function() { return this._isResizable; },
    set_isResizable: function(value) { this._isResizable = value; },

    get_pageTemplate: function() { return this._pageTemplate; },
    set_pageTemplate: function(value) { this._pageTemplate = value; },

    get_isEditing: function() { return this._isEditing; },
    set_isEditing: function(value) { this._isEditing = value; },

    get_dirtyFlagTrigger: function() { return this._dirtyFlagTrigger; },
    set_dirtyFlagTrigger: function(value) { this._dirtyFlagTrigger = value; },

    get_width: function() { return this._width; },
    set_width: function(value) { this._width = value; },

    get_WPDeleteConfirmation: function() { return this._wpDelConfirmMsg; },
    set_WPDeleteConfirmation: function(value) { this._wpDelConfirmMsg = value; },

    get_minimizeButton: function() { return this.getWrapperElement(0); },

    get_refreshButton: function() { return this.getWrapperElement(1); },

    get_editButton: function() { return this.getWrapperElement(2); },

    get_contentPanel: function() { return this.getWrapperElement(3); },

    get_closeButton: function () { return this.getWrapperElement(4); },

    get_CommandBarSettings: function () { return this._commandBarSettings; },
    set_CommandBarSettings: function (value) { this._commandBarSettings = value; },

    getWrapperElement: function(index)
    {
        if (this._wrapperIDs && this._wrapperIDs.length > 0)
        {
            var id = this._wrapperIDs[index];
            if (id)
            {
                return $get(id, this.get_element());
            }
        }
        return null;
    },

    GetCancelEditButton: function()
    {
        var buttonList = this.get_element().getElementsByTagName("input");
        for (var i = 0; i < buttonList.length; i++)
        {
            if (buttonList[i].id.indexOf("Editor_CloseButton") >= 0)
            {
                return buttonList[i];
            }
        }
        return null;
    }
};

// Optional descriptor for JSON serialization.
Camstar.WebPortal.PortalFramework.WebPartBase.descriptor =
{
    properties:
    [
        { name: 'controlId', type: String }, // server ID
        { name: 'serverType', type: String },
        { name: 'isStatic', type: Boolean },
        { name: "wrapperIDs", type: Array },
        { name: 'zoneElement', type: String },
    ]
};

Camstar.WebPortal.PortalFramework.WebPartBase.registerClass('Camstar.WebPortal.PortalFramework.WebPartBase', Camstar.UI.Control);

//Notifiy ScriptManager that this is the end of the script
if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
