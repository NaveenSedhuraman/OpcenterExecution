// Copyright Siemens 2020 

/// <reference path="../MicrosoftAjaxExt.js"/>
/// <reference path="../Camstar.Ajax/CamstarAjax.js"/>
/// <reference path="../Camstar.UI/Control.js" />
/// <reference path="../../jquery/jquery.min.js" />
/// <reference path="../../Camstar.js" />
Type.registerNamespace("Camstar.WebPortal.PortalFramework");

/*** SessionTimeout ***/
function resetSessionTimer(action) {
    $('#sessionTimeoutStartTime', getCEP_top().document).val($.now());
}

/*** Constructors ***/
Camstar.WebPortal.PortalFramework.WebPartPageBase = function ()
{
    Camstar.WebPortal.PortalFramework.WebPartPageBase.initializeBase(this);

    /*** Private Member Variables ***/
    this._serverType = "Camstar.WebPortal.PortalFramework.WebPartPageBase";
    this._isfloating = null;
    this._isChild = false;
    this._communicator = null;
    this._virtualPageName = null;
    this._eventTarget = null;
    this._eventArgument = null;
    this._header = null;
    this._additionalInput = null;
    this._fullpostback = null;
    this._isTabContainerPage = null;
    this._configurator = null;
    this._concierge = null;
    this._userprofile = null;
    this._firstRedirect = true;
    this._templateElement = null;
    this._workflowProgress = null;
    this._webParts = new Array();
    this._isConciergeLoaded = false;
    this._postBackTarget = null;
    this._currencyDecimalSeparator = null;
    this._shortDatePattern = null;
    this._longTimePattern = null;

    this._notifyParent = false;
    this._notifyParentOnClose = false;

    this._labels = null;

    this._CallStackKey = null;
    this._queryString = null;
    this._Title = null;
    this._activeElement = null;
    this._formSubmitElement = null;
    this._scrollableElement = null;
    this._defaultButtonID = null;
    this.lastFocusedControl = null;
    this.IsPageFlowRedirecting = false;
    this._tagItems = null;
    this._sessionVariables = [];
    this.directUpdateShowsModal = false;
    this._loadingTitleValue = null;
    this._fullScreen = false;
    this._hideTopMenu = false;
    this._hideFooter = false;
    this._hideHeader = false;
    this._hideTabs = false;
    this._helpUrl = null;
    this._commandBarSettings = null;
    this._startInfo = {};
    this._pageType = "";
    this.doReload = true;

    // property for translated labels with shape of [{ Name: '', Value: ''}]
    // can be populated by executing getLabels method in custom callback
    this._pageLabels = null;

    // isResponsiveFlag
    this._isResponsive = false;
    
    // mobileBarcodeEnabled
    this._mobileBarcodeEnabled = false;

    this._pageCulture = null;

    resetSessionTimer("initialize");
};

Camstar.WebPortal.PortalFramework.WebPartPageBase.prototype =
{
    /*** Public Methods ***/
    initialize: function()
    {
        Camstar.WebPortal.PortalFramework.WebPartPageBase.callBaseMethod(this, 'initialize');

        var frm = window.theForm;
        var me = this;

        Sys.UI.DomEvent.addHandler(frm, 'submit', this.submit);
        Sys.UI.DomEvent.addHandler(frm, 'click', this.formElementClick);

        // init tabs
        if (!$("body", document).hasClass("modeling") && $(".ui-page-tab").length) {
            $(".ui-page-tab").scrollableTabs({
                overflow: "scroll",
                removable: true,
                hideIfEmpty: true,
                conciergeLvl: $("body", document).hasClass("body-tabbed"),
                $conciergeZoneApollo: $(".apollo-concierge"),
                tabRemoved: function (ev, evdata) { 
                    CleanupSession(getParameterByName('CallStackKey', evdata.panelSrc)); 
                    if (document.getElementById("tablist").children.length == 0 && document.getElementById("emp-state") !== null)
                        document.getElementById("emp-state").style.display = "inline-flex";
                },
                tabRemoving: function () {
                    if (typeof setApolloHeader !== 'undefined') {
                        setApolloHeader('', '');
                    }
                },
                activate: function (e, u) {  
                    var ifr = $(">iframe", u.newPanel).get(0);
                    if (ifr) {
                        var page = ifr.contentWindow.__page;
                        if (page) {
                            page.applyDisplaySettings();
                            if (typeof setApolloHeader !== 'undefined') {
                                setApolloHeader('', page._CallStackKey);
                            }
                        }
                    }
                    if (document.getElementById("emp-state") !== null) {
                        document.getElementById("emp-state").style.display = "none";
                    }
                },
                clickConcierge: function () {
                    $(this).siblings(".apollo-concierge").find(".zone").toggle();
                }
            });
        }

        $(document).off('keydown').on('keydown',
            function(e)
            {
                if (me.isKeyDisabled(e))
                {
                    if (getCEP_top().PortalLblDisabledKey !== null)
                        alert(getCEP_top().PortalLblDisabledKey);
                    else
                        alert(window.mDisabledKeyAlert);
                    e.preventDefault();
                    return false;
                }
                else
                {
                    if (e.keyCode === 9)
                    {
                        me.keyTabbing(e);
                        return false;
                    }
                    return true;
                }
            }
            );

        this._oldPostBack = window.__doPostBack;
        window.__doPostBack = this.postback;

        if ($.alerts != null)
        {
            $.alerts.okButton = '&nbsp;' + this._labels.YesLabel + '&nbsp;';
            $.alerts.cancelButton = '&nbsp;' + this._labels.NoLabel + '&nbsp;';
            $.alerts.alertOkButton = '&nbsp;' + this._labels.OkLabel + '&nbsp;';
            $.alerts._title = this._labels.MessageTitle;
        }

        if (this.get_defaultButtonID() != null)
        {
            var $divContainer = $(this.get_templateElement());
            if ($divContainer.length)
            {
                $divContainer.prop('tabindex', 0);
                $divContainer.on('keydown', { buttonID: '#' + this.get_defaultButtonID() },
                    function(e)
                    {
                        if (e.keyCode == 13)
                        {
                            // click default button ' + e.data.buttonID
                            $(e.data.buttonID).click();
                            return false;
                        }
                    });
            }
        }

        window.__page = this;
        window.__toppage = getCEP_top().__page;
        this.onPageLoad();
        this.set_helpUrl(this._helpUrl);
        this.setFocusOnLoad();
    },

    dispose: function()
    {
        __doPostBack = this._oldPostBack;

        this._lock = false;

        this._isfloating = null;
        this._isChild = false;
        this._communicator = null;
        this._virtualPageName = null;
        this._eventTarget = null;
        this._eventArgument = null;
        this._header = null;
        this._additionalInput = null;
        this._fullpostback = null;
        this._isTabContainerPage = null;
        this._configurator = null;
        this._concierge = null;
        this._userprofile = null;
        this._templateElement = null;
        this._webParts = null;
        this._queryString = null;
        this._homePage = null;
        this._postBackTarget = null;
        this._activeElement = null;
        this._formSubmitElement = null;

        this._notifyParent = false;
        this._notifyParentOnClose = false;

        this._scrollableElement = null;
        this._fullScreen = null;
        this._hideTopMenu = null;
        this._hideFooter = null;
        this._hideHeader = null;
        this._hideTabs = null;
        this._helpUrl = null;
        this._pageType = "";

        Camstar.WebPortal.PortalFramework.WebPartPageBase.callBaseMethod(this, 'dispose');
    },

    getParent: function () {
        var par = window.parent;
        while (par && typeof par.__page == "undefined" && par != window) {
            if (par == top) {
                // Top is apollo frame
                return null;
            }
            par = par.parent;
        }
        return par == window ? null : par;
    },

    isAllowClose: function (tab, closeCallback) {
        if ($(document.body).hasClass("body-modeling")) {
            var t = this.getParent();
            if (t.__page)
                t.__page.confirmCloseDialog(closeCallback, tab);
            return false;
        }
        this.resetDirty(tab);
        closeCallback();
        return true;
    },

    confirmCloseDialog: function (closeCallback, tab) {
        var me = this;

        var labels = [{ Name: 'Lbl_UnsavedChangesOnVirtualPage' }, { Name: 'Lbl_Warning' }];
        me.getLabels(labels, function (response) {
            if ($.isArray(response)) {
                var value;
                var warning;
                $.each(response, function () {
                    var labelname = this.Name;
                    var labeltext = this.Value;
                    switch (labelname) {
                        case 'Lbl_UnsavedChangesOnVirtualPage':
                            value = labeltext.replace('{0}', $('span:first', tab).text());
                            break;
                        case 'Lbl_Warning':
                            warning = labeltext;
                            break;
                        default:
                            break;
                    }
                });

                jConfirm(value, null, function (r) {
                    if (r == true) {
                        me.resetDirty(tab);
                        closeCallback();
                    }
                }, warning);
            }
            else {
                alert(response.Error);
            }
        });
    },

    cleanPickLists: function()
    {
        var picklists = $(".cs-picklist-panel");

        if (picklists.length > 0)
        {
            for (var x = 0; x < picklists.length; x++)
            {
                if (picklists[x].style.display == '')
                {
                    picklists[x].parentNode.removeChild(picklists[x]);
                }
            }
        }
    },


    pageflow: function (pageflowName, callStackKey, resumePageflow, qoName)
    {
        var oldServerType = this._serverType;
        this._serverType = "Camstar.WebPortal.PortalFramework.PageFlowStateMachine,Camstar.WebPortal.PortalFramework";
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("GetStartPageFlow");

        transition.set_commandParameters(pageflowName + ',' + callStackKey + ',' + resumePageflow + ',' + qoName);
        transition.set_clientCallback("goPageflow");
        transition.set_postdata(true);

        this._communicator = new Camstar.Ajax.Communicator(transition, this);
        this._communicator.syncCall();
        this._serverType = oldServerType;
    },

    goPageflow: function(section)
    {
        if (section && section.Data && section.Data.HTML)
        {
            this.IsPageFlowRedirecting = true;
            this.redirect(section.Data.HTML);
        }
    },

    redirect: function(pageName)
    {
        this.cleanPickLists();

        var isCurrentFloating = document.URL.indexOf("IsFloatingFrame") != -1;
        var isFloating = pageName.indexOf("IsFloatingFrame=") != -1;
        var isPageflow = pageName.indexOf('PageFlowID=') != -1;

        if (isCurrentFloating && isFloating)
        {
            var parentIframe = null;
            var currentUrl = document.URL;

            parent.$("iframe").each(function (iel, el)
            {
                if (el.src === currentUrl)
                {
                    parentIframe = el;
                    parentIframe.src = "about:blank";
                    parentIframe.src = pageName;
                    return false;
                }
                return true;
            });

            return false;
        }

        this.disposeAllWebParts(isFloating);
        var segments = pageName.split("?");
        var query;
        if (segments.length == 2)
            query = this.getQueryStringWithCallStackKey(segments[1], pageName);
        else
            query = this.getQueryStringWithCallStackKey('');
        if (query != '')
            query += "&Redirect=true";
        else
            query = "?Redirect=true";

        this.set_queryString(query);
        pageName = segments[0] + '?' + query.replace('?', '');

        var $pagetab = this.$getPageTabControl();
        var $tab = $pagetab.scrollableTabs("getActiveTab");

        if (!(this.IsPageFlowRedirecting || isPageflow)) {
            // unlock title
            $pagetab.scrollableTabs("lockCaption", $tab, false);
            $pagetab.scrollableTabs("setCaption", $tab, this._getLoadingText());
        }
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.PostBack), this);
        transition.set_virtualPage(pageName);

        this._communicator = new Camstar.Ajax.Communicator(transition, this);
        this._communicator.syncCall();

        if (this._firstRedirect)
        {
            this._homePage = pageName;
            this._firstRedirect = false;
        }

        if (pageName != this._homePage && this.getConcierge() != null)
        {
            this.getConcierge().toggle(false);
        }
        return false;
    },

    openInNewWindow: function(pageName)
    {
        window.open(pageName, '_blank', 'scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes');
    },

    openPageflow: function(pageflow, query, caption, $tab, iconUrl)
    {
        var pageName = 'Main.aspx';
        var callstackKey = getParameterByName("CallStackKey");
        query = setParameterByName("CallStackKey", callstackKey, query);
        if (query != '')
            query += '&redirectToPageflow=' + pageflow;
        else
            query = 'redirectToPageflow=' + pageflow;
        return this.openInTab(pageName, query, caption, $tab, iconUrl);
    },

    openInTab: function (pageName, query, caption, $tab, iconUrl, mainTabs) {
        if ($tab)
            return this.openInExistingTab(pageName, query, caption, $tab, iconUrl, mainTabs);
        else
            return this.openInNewTab(pageName, query, caption, iconUrl, mainTabs);
    },

    // Added for integrity
    openInTabId: function (pageName, query, caption, tabId, iconUrl, mainTabs) {

        var $tab = tabId ? this.$getPageTabControl(mainTabs).scrollableTabs("getTab", { callStackKey: tabId }) : null;
        return this.openInTab(pageName, query, caption, $tab, iconUrl, mainTabs);
    },

    openInMainTabs: function (pageName, query, caption, tabId, iconUrl) {
        var $tab = tabId ? this.$getPageTabControl(true).scrollableTabs("getTab", { id: tabId }) : null;
        return this.openInTab(pageName, query, caption, $tab, iconUrl, true);
    },

    $getPageTabControl: function(firstLevelTab)
    {
        var parent = window;
        var $tabControl = parent.$(".ui-page-tab");
        if (!firstLevelTab) {
            while (parent != top && parent.parent != null && $tabControl.length == 0){
                parent = parent.parent;
                $tabControl = parent.$(".ui-page-tab");
            }
        }
        else {
            $tabControl = getCEP_top().$(".ui-page-tab");
        }
        return $tabControl;
    },

    getTabCallStackKey: function ($tab, $pageTabControl) {
        if (!$tab) 
            return "";
        
        if (!$pageTabControl)
            $pageTabControl = this.$getPageTabControl();
        var tabProp = $pageTabControl.scrollableTabs("getTabProperties", $tab);
        if (tabProp)
            return tabProp.callStackKey;

        return "";
    },

    getParentKey: function()
    {
        return parent.__page.get_CallStackKey();
    },

    generateQuickGuid: function () {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    },

    openInNewTab: function (pageName, query, caption, iconUrl, mainTabs)
    {
        // Close concierge panel if open
        if (this.getConcierge() != null)
            this.getConcierge().close();

        pageName = pageName.replace(".aspx", "");

        var $tabControl = this.$getPageTabControl(mainTabs);
        var callStackKey = !this.isMobilePage() ? this.generateQuickGuid() : "Home";

        query = setParameterByName("CallStackKey", callStackKey, query);
        var newURL = this.changePageName(pageName, query);

        var tabPrm = {
            caption: caption,
            url: newURL,
            callStackKey: callStackKey
        }
        var $newTab = $tabControl.scrollableTabs("add", tabPrm);

        var redirectPF = 'redirectToPageFlow=';
        if (query.indexOf(redirectPF) > -1) {
            var index = query.indexOf(redirectPF);
            pageName = query.substring(index + redirectPF.length, query.indexOf('&', index));
        }
        var pageFlowName = this.retrieveQueryStringParam(query, 'redirectToPageFlow');
        callStackKey = this.retrieveQueryStringParam(query, 'CallStackKey');

        if (pageFlowName.length > 0)
            pageName = pageFlowName;

        this.setApolloHeader(pageName, callStackKey);
        if (caption) {
            // Lock the caption coming from the menu for pageflow and modeling child pages
            this.setPageTitle($newTab, caption);
            $tabControl.scrollableTabs("lockCaption", $newTab, true);
        }
        else {
            // Display "Loading..." . The label will be taken from the page later
            this.setPageTitle($newTab, this._getLoadingText());
        }
    },

    retrieveQueryStringParam: function (query, paramName) {
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === paramName) {
                return decodeURIComponent(pair[1]);
            }
        }
        return '';
    },

    openInExistingTab: function (pageName, query, caption, $tab, iconUrl, mainTabs) {

        if (!$tab) {
            return this.openInNewTab(pageName, query, caption, iconUrl, mainTabs);
        }

        var $tabControl = this.$getPageTabControl(mainTabs === true);

        var callStackKey = this.getTabCallStackKey($tab, $tabControl);
        if (!callStackKey)
            return this.openInNewTab(pageName, query, caption, iconUrl, mainTabs);        

        var clearCaptionLocked = true;
        query = setParameterByName("CallStackKey", callStackKey, query);

        var selectedPanel = this.getTabPanelByTab($tab, $tabControl); // div container
        if (selectedPanel) {
            if (this.getConcierge() != null)
                this.getConcierge().close();

            if (clearCaptionLocked) {
                // tab caption is unloked
                $tabControl.scrollableTabs("lockCaption", $tab, false);
            }

            var iframe = $("iframe", selectedPanel)[0];
            if (iframe) {
                var me = this;
                var trueJob = function()
                {
                    $(iframe).off();
                    $(iframe).load(function() {
                        if (this.contentDocument.body.onresize)
                            this.contentDocument.body.onresize();
                    });
                    iframe.src = '';
                    iframe.src = me.changePageName(pageName, query);
                    me.setPageTitle(callStackKey, caption);
                };
                if (this.isDirty($(selectedPanel)))
                {
                    jConfirm("You have unsaved changes on the page. Do you want to proceed?", null, function(r)
                    {
                        if (r == true)
                        {
                            me.resetDirty($(selectedPanel));
                            trueJob();
                        }
                    }, 'Warning');
                }
                else
                    trueJob();
            }
        }
    },

    closeTab: function (message) {
        var $ap = this.$getActiveTabPanel();
        setTimeout('parent.removeTab("' + $ap.prop('id') + '");', 1);
        if (message != '') {
            var page = window.__page || parent.__page || getCEP_top().__page;
            //bug fix 49717 - Horizon: Success message should be displayed after submitting changes on 'Sign Approval' page
            var $warningMsg = $("#WebPart_StatusBar > div > ul");
            if ($warningMsg.length > 0) {
                var $mainElement = $warningMsg.parent();
                $warningMsg.remove();
                if ($(".message", $mainElement).length === 0)
                    $mainElement.append("<div><div class='message'></div></div>");
            }
            page.displayStatus(message, "Success");
            //end of bug fix
            page.displayMessage("<span>SUCCESS!</span> " + message, "Success");
        }
        return;
    },

    displayMessage: function(message, type)
    {
        $("#textFlyout").hide();

        if ($("footer", getCEP_top().document.body).footer != undefined)
            $("footer", getCEP_top().document.body).footer('displayMessage', message, type);
    },

    displayStatus: function(message, type, caption)
    {
        $get("WebPart_StatusBar").parentNode.control.write(message, type, caption);
    },

    setApolloHeader: function (name, key) {
        if (typeof setApolloHeader !== 'undefined') {
            setApolloHeader(name, key);
        }
    },


    setPageTitle: function ($tab_or_callstack, caption, lockCaption, isServerRedirect) {
        isServerRedirect = typeof isServerRedirect == "undefined" ? false : isServerRedirect;
        var $tabControl = this.$getPageTabControl();
        var $tab;
        if (typeof $tab_or_callstack == "string") {
            // find tab by call stack key
            $tab = $tabControl.scrollableTabs("getTab", { callStackKey: $tab_or_callstack });
        }
        else
            $tab = $tab_or_callstack;

        if (this.get_isfloating() || document.URL.indexOf("IsFloatingFrame=") != -1) {
            // Set title of floating frame
            parent.pop.setTitle(caption);
        }
        else {
            if (/redirectToPageflow/i.test(document.URL) || isServerRedirect) {
                if (caption)
                    $tabControl.scrollableTabs("lockCaption", $tab, false);
            }
            $tabControl.scrollableTabs("setCaption", $tab, caption);
            if (typeof lockCaption == "boolean")
                $tabControl.scrollableTabs("lockCaption", $tab, lockCaption);
        }
    },

    getCurrentCallStackKey: function()
    {
        return $("div.ui-tabs-panel:not(.ui-tabs-hide)", this.$getPageTabControl()).prop('id');
    },

    getTabPanelByTab: function ($tab, $tabControl) {

        if (!$tabControl)
            $tabControl = this.$getPageTabControl();
        var tp = $tabControl.scrollableTabs("getTabProperties", $tab);

        if (tp)
            return tp.panel;
        else
            return null;
    },

    getTabIndexByTabId: function(callStackKey)
    {
        if (callStackKey != '')
        {
            var selectedPanelObj = $("iframe", this.$getPageTabControl());
            var index = -1;
            for (var i = 0; i < selectedPanelObj.length; i++)
            {
                if (selectedPanelObj[i].id == ("tabfr" + callStackKey))
                    index = i;
            }
            if (index == -1)
                return null;
            else
                return index;
        }
        else
            return null;
    },

    selectTab: function(index)
    {
        this.$getPageTabControl().tabs({active: index});
        return false;
    },

    refresh: function()
    {
        this.cleanPickLists();

        this.redirect(this.get_virtualPageName());
    },

    postback: function(eventTarget, eventArgument, additionalInput)
    {
        resetSessionTimer("postback");

        var theControl = $('[name="' + eventTarget + '"]');
        if (theControl.length)
        {
            var editorDiv = $(theControl).parents('.ui-dialog-content');
            if (editorDiv.length)
            {
                // grab additional input
                if (additionalInput == undefined)
                    additionalInput = '';

                editorDiv.find(':input').each(function()
                    {
                        if (this.name && ((this.value != this.defautValue) || this.type == 'hidden' || this.type == 'checkbox'))
                        {
                            if (this.type == 'checkbox')
                            {
                                if (this.checked == true)
                                    additionalInput += (this.name + "=on&");
                                else; // no submit
                        }
                        else
                            {
                                additionalInput += (this.name + "=" + encodeURIComponent(this.value) + "&");
                            }
                        }
                    }
                );
            }
            if (document.activeElement.tagName == "BUTTON") {
                // Added to handle blur event issues with IE11.  We do not want to click button when caller is reset button on lite popups.
                if (document.activeElement.id !== 'light_popup_dialog_button_Reset'){
                    document.activeElement.click();
                }
            }
                
        }

        if (document.activeElement)
        {            
            __page.lastFocusedControl = document.activeElement;
        }

        if (additionalInput)
            __page._additionalInput = additionalInput;
        else
            __page._additionalInput = null;
        $get('__EVENTTARGET').value = eventTarget;
        $get('__EVENTARGUMENT').value = eventArgument;

        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.PostBack), this);
        var pageName = __page.get_virtualPageName() + '.aspx';

        if (pageName != 'LineAssignmentPage.aspx' && this._isTabContainerPage == null)
        {
            if (__page.get_CallStackKey())
                pageName += "?CallStackKey=" + __page.get_CallStackKey();
        }

        if (__page.get_isfloating())
        {
            if (pageName.indexOf("?") == -1)
            {
                pageName += "?IsFloatingPostback=true";
            }
            else
            {
                pageName += "&IsFloatingPostback=true";
            }
        }

        if (__page.get_isChild())
        {
            if (pageName.indexOf("?") == -1)
            {
                pageName += "?IsChild=true";
            }
            else
            {
                pageName += "&IsChild=true";
            }
        }

        transition.set_virtualPage(pageName);
        transition.set_postdata(true);

        this._communicator = new Camstar.Ajax.Communicator(transition, this);
        this._communicator.syncCall();


        var targetId = $get('__EVENTTARGET').value;
        __page.set_postBackTarget(targetId);
        $get('__EVENTTARGET').value = '';
        $get('__EVENTARGUMENT').value = '';
        __page._additionalInput = null;

        if (Camstars.Browser.SafariMobile)
        {
            __page.cleanPickLists();
        }
    },

    submit: function(e)
    {
        resetSessionTimer("submit");
        if (!__page._fullpostback)
        {
            if (e && e.preventDefault)
            {
                //prevent postback in FF
                e.preventDefault();
            }

            var pageName = __page.get_virtualPageName() + '.aspx';
            if (pageName != 'LineAssignmentPage.aspx' && this._isTabContainerPage == null)
            {
                if (__page.get_CallStackKey())
                    pageName += "?CallStackKey=" + __page.get_CallStackKey();
            }

            if (__page.get_isfloating())
            {
                if (pageName.indexOf("?") == -1)
                {
                    pageName += "?IsFloatingPostback=true";
                }
                else
                {
                    pageName += "&IsFloatingPostback=true";
                }
            }

            if (__page.get_isChild())
            {
                if (pageName.indexOf("?") == -1)
                {
                    pageName += "?IsChild=true";
                }
                else
                {
                    pageName += "&IsChild=true";
                }
            }

            var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Submit), this);
            transition.set_virtualPage(pageName);
            transition.set_postdata(true);

            this._communicator = new Camstar.Ajax.Communicator(transition, this);
            this._communicator.syncCall();
            return false;
        }
        return true;
    },

    setDirty: function () {
        var $tabCtl = $(".ui-page-tab");
        if ($tabCtl.length) {
            // Set dirty mark on current tab
            $tabCtl.scrollableTabs("setDirty", true);
        }

        // Notify parent
        var p = this.getParent();
        if (p) 
            p.__page.setDirty();

    },

    isDirty: function (selectedPanelOrTabId) {
        if (selectedPanelOrTabId) {
            if (typeof selectedPanelOrTabId == "string") {
                var $tabCtl = this.$getPageTabControl();
                if ($tabCtl.length) {
                    return $tabCtl.scrollableTabs("isDirty", selectedPanelOrTabId);
                }
            }
            else {
                var isDirtyAttr = $(selectedPanelOrTabId).attr("isDirty");
                return isDirtyAttr === 'true';
            }
        }
        else {
            if (window.frameElement) {
                var tabId = $(window.frameElement).attr("aria-controls");
                var p = this.getParent();
                if (p)
                    return p.__page.isDirty(tabId);
            }
        }
        return false;
    },

    resetDirty: function (tabId) {
        
        if (!tabId && window.frameElement) {
            tabId = $(window.frameElement).attr("aria-controls");
        }
        if (!tabId)
            return;

        if (typeof tabId != "string") {
            tabId = tabId.attr("aria-controls");
        }

        var $tabCtl = $(".ui-page-tab");
        if ($tabCtl.length) {
            // Set dirty mark on current tab
            var dt = $tabCtl.scrollableTabs("setDirty", false, tabId);
            if (dt > 0) {
                // Don't do parent Reset if any tabs are dirty
                return;
            }
            else {
                // get parent tabId
                tabId = $(window.frameElement).attr("aria-controls");
            }
        }

        // Notify parent
        var p = this.getParent();
        if (p)
            p.__page.resetDirty(tabId);
    },

    setFocusOnLoad: function(focusId)
    {
        if (window["__startFocusElement"] && window["__startFocusElement"].length)
        {
            var fc = window["__startFocusElement"][0];
            if (fc)
            {
                this.lastFocusedControl = fc;
                window["__startFocusElement"] = null;
            }
        }
        var me = this;
        //have to added delay 0.2s for tinymce initializing
        setTimeout(function()
        {
            me.changeFocusTo(me.lastFocusedControl);
        }, 200);
       
    },

    changeFocusTo: function (focusElement)
    {
       var focusId;

        if (focusElement)
        {
            if (typeof focusElement == "object" && focusElement.length)
                focusId = focusElement.prop('id');
            else if (typeof focusElement == "string")
                focusId = focusElement;
            else
                focusId = focusElement.id;
        }
        else
           focusId = null;
       
        var fcts = this.get_focusableElements();
        var focusElementsLen = fcts.length;
        if (focusElementsLen)
        {
            var focusIndex = 0;
            if (focusId)
            {
                focusId = ((focusId[0] == '#') ? '' : '#') + focusId;
                focusIndex = $.inArray(focusId, fcts);
                if (focusIndex == -1)
                    focusIndex = 0;
            }

            // Looping focus but only 1 time
            var loop = 1;
            while (focusIndex < focusElementsLen)
            {
                if (fcts[focusIndex] != '#') {
                    var $f = $(fcts[focusIndex]);

                    //In new version 4.7.13 tinymce: 
                    //if tinyMCE wasn`t be initialized yet -> tinymce.activeEditor == null
                    //tinymce.editors is empty even if there is tinymce.activeEditor
                    if (typeof tinymce != 'undefined' && tinymce.activeEditor != null && ('#' + tinymce.activeEditor.id == $f.selector)) {                       
                        tinymce.activeEditor.focus();
                        break;
                    }
                    var isInFramesContainerStatusWp = $f.parents(".webpart-containerstatus").length !== 0 && $f.parents("body.pagepanel-eproc").length !== 0;
                    if ($f.length && !$f.is(':disabled') && $f.is(':visible') && !$f.attr('readonly') && !$f.is('div.tiny') && !isInFramesContainerStatusWp)//txn iframe with container status beeing hidden
                    {
                        $f.prop('tabindex', -1);
                        if ($f.prop('id').indexOf("WebPartManager_ButtonsBar") > -1) {
                            if (fcts[0].indexOf('WebPartManager_ContainerStatus') > -1) {
                                var $v = $(fcts[0]);
                                this.setFocus($v.prop('id'));
                            }
                            else {
                                this.setFocus($f.prop('id'));
                            }
                        }
                        else
                        {
                            this.setFocus($f.prop('id'));

                        }   
                     //console.log('set focus to  ' + fcts[focusIndex]);
                     break;
                    }
                }
                //console.log('focus failed. element not found' + fcts[focusIndex]);
                focusIndex++;
                if (loop && focusIndex == focusElementsLen)
                {
                    loop--;
                    focusIndex = 0;
                }
            }
        }
    },

    onPageLoad: function()
    {      
        if (Camstars.Browser.IE)
            $(document.body).addClass("ie");

        this.positionInfoZoneContainer();
        this.positionActionZoneContainer();
        this.setUpFormElements();
        if (this.get_isChild()) {
            $(window).on("resize", function () {
                $(getCEP_top()).trigger("resize", ["child-resize"]);
            });
        }

        if (!this.get_isfloating() && !this.get_isChild() && !this.isMobilePage()) {
            this.applyDisplaySettings();
        }

        $("form :input").off('change', window.setDirtyFlag);
        $("form").on('change', (function(ev)
        {
            if ($(ev.target).is(':visible')) {
                var w = $(ev.target).closest('.webpart');
                if (w.length){
                    var webPart = window.$find(w.attr('id') + "_UIComponent");
                    if (webPart == null || (webPart.get_dirtyFlagTrigger() &&
                                            !$(webPart._element).closest('.float-form-container').length) // not popup
                                            )
                        window.setDirtyFlag();
                }
            }
        }));

        this.setPageSideBar();
        this.updateSideBar();

        // instantiate property as empty array
        if (this._pageLabels === null) {
            this._pageLabels = [];
        }

        var mainTabs;
        if ($(document.body).hasClass("modeling"))
            mainTabs = true;

        if (!this.get_isfloating()) {
            var $tabControl = this.$getPageTabControl(mainTabs);
            if ($tabControl.length) {
                var $tab = null;
                if (this._CallStackKey)
                    $tab = $tabControl.scrollableTabs("getTab", { callStackKey: this._CallStackKey });

                if ($tab) {
                    var me = this;
                    $tab.click(function () {
                        me.set_helpUrl(me._helpUrl);
                    });
                    if (this.isMobilePage()) {
                        var loadingText = this._getLoadingText();
                        if ($(".tab-caption-text", $tab).text() == loadingText && this._Title)
                            $(".tab-caption-text", $tab).text(this._Title);
                        $tabControl.scrollableTabs("setCaption", $tab);
                    }
                    else {
                        $tabControl.scrollableTabs("setCaption", $tab, this._Title);
                    }
                    $tabControl.scrollableTabs("lockCaption", $tab, true);
                }
            }
        }
        else {
            parent.pop.setTitle(this._Title);
        }

        var me = this;

        var si = this._startInfo;
        if (si) {       
            switch (this._pageType) {
                case "ajax-tab-master":
                    if (si.PortalHomePage) {
                        var path = si.PortalHomePage;
                        this._CallStackKey = this.generateQuickGuid();
                        this.set_queryString('CallStackKey=' + this._CallStackKey + '&ResetCallStack=true');
                        this.set_virtualPageName(path);
                        this.openInNewTab(path, si.PortalQuery, si.HomePageCaption, null, true);
                    }
                    else if (si.RedirectPageflow) {
                        this.openPageflow(si.RedirectPageflow, '', '', this.$getActiveTab());
                    }
                    if (si.RedirectPage) {
                        var pageName = si.RedirectPage + ".aspx";
                        var query = '';
                        if (si.TestMode === true)
                            query = "?Test=true";
                        this.set_virtualPageName(pageName);
                        this.openInTab(pageName, query, si.RedirectPageCaption, this.$getActiveTab());
                    }

                    if (si.ShowGeneralMessage === true) {
                        $(document).ready(function () {
                            var ifr = this.defaultView.frameElement;
                            $(ifr).width("100%").height("100%").show();
                            me._displayGeneralMessage(si);
                        });
                        
                    }
                    break;
                case "ajax-master":
                    if (si.RedirectPageflow) {
                        this.pageflow(si.RedirectPageflow, this._CallStackKey, si.ResumeWorkflow, si.QualityObject);
                        si.RedirectPageflow = null;
                    }
                    else if (si.RedirectPage) {
                        this.redirect(si.RedirectPage);
                        si.RedirectPage = null;
                    }
                    else {
                    }
                    break;
                case "ajax-master-mobile":
                case "ajax-child-master":
                default:
                    break;
            }
        }
        $(">form", document.body).trigger("page.initialized");
    },

    applyDisplaySettings: function() {
        var top_doc_body = getCEP_top().document.body;
        if (!this.isMobilePage() && (!this.isModelingPage() || !$(parent.document.body).is(".modeling, .body-main"))) // modeling pages within Modeling_VP support full screen option only.
        {
            var needResize = false;
            if ($("footer", top_doc_body).is(":visible") === !!this._hideFooter) {
                $("footer", top_doc_body).toggle(!this._hideFooter);
                needResize = true;
            }
            if ($("header", top_doc_body).is(":visible") === !!this._hideHeader) {
                $("header", top_doc_body).toggle(!this._hideHeader);
                needResize = true;
            }
            if ($("nav", top_doc_body).is(":visible") === !!this._hideTopMenu) {
                $("nav", top_doc_body).toggle(!this._hideTopMenu);
                needResize = true;
            }
            if ($("ul#tablist", top_doc_body).is(":visible") === !!this._hideTabs) {
                $("ul#tablist, div#tabsDownMenu, div#tabsLeftRightArrows", top_doc_body).toggle(!this._hideTabs);
                needResize = true;
            }
            if ($(".cs-nav-tabs", top_doc_body).is(":visible") === !!this._hideTabs) {
                $(".cs-nav-tabs", top_doc_body).toggle(!this._hideTabs);
                needResize = true;
            }
            if (needResize) {
                top_resize();
            }
            $(window.document.body).toggleClass("fullScreenPage", this.get_fullScreen());
            $(top_doc_body).toggleClass("fullScreenPage", this.get_fullScreen());
        }

    },

    ensureDisplaySettings: function(displayStr) {
        if (displayStr) {
            var jsonDisplay = JSON.parse(displayStr);
            this._fullScreen = jsonDisplay["FullScreen"];
            this._hideFooter = jsonDisplay["HideFooter"];
            this._hideHeader = jsonDisplay["HideHeader"];
            this._hideTopMenu = jsonDisplay["HideTopMenu"];
            this._hideTabs = jsonDisplay["HideTabs"];
            this.applyDisplaySettings();
        }
    },

    openHelpframe: function(noHelpFileMessage)
    {
        var left = (screen.width / 2) - (1000 / 2);
        var top = (screen.height / 2) - (600 / 2);

        var $activeTab = this.$getActiveTabPanel();
        if ($activeTab.length)
        {
            var popupHelpUrl = $activeTab.attr('popupHelpUrl');
            if (popupHelpUrl)
                var url = popupHelpUrl != "none" ? popupHelpUrl: null;
            else
                var url = $activeTab.attr('helpurl');

            if (url)
            {
            }
            else
            {
                if (parent['__page'])
                {
                    var $selectedPanelObj = parent.$("div.ui-tabs-panel[aria-hidden=false]", parent['__page'].$getPageTabControl());
                    if ($selectedPanelObj.attr('helpurl'))
                        url = $selectedPanelObj.attr('helpurl');
                }
            }
            if (url)
                window.open(url, '_blank', 'menubar=0,toolbar=0,resizable=1,location=0,width=1000,height=600, top=' + top + ', left=' + left);
            else
                alert(noHelpFileMessage);
        }
        else 
        {
            window.open(HelpPageName, '_blank', 'menubar=0,toolbar=0,resizable=1,location=0,width=1000,height=600, top=' + top + ', left=' + left);
        }
    },

    replaceTemplateElement: function (htmlText) {
        var $tmpl = $(this.get_templateElement());
        var sideBar = $find('ctl00_SideBarRight');
        if (sideBar) {
            // restore header/status web part position
            sideBar.headerAdjustment(true);
        }
        $tmpl.empty();
        $tmpl.html(htmlText);

        var customEvent = new CustomEvent("changeElement", {
            message: "The element state was changed"
        });

        $tmpl[0].dispatchEvent(customEvent);
    },

    $getActiveTab: function () {
        this.$getPageTabControl().scrollableTabs("getActiveTab");
    },
    
    $getActiveTabPanel: function (firstLevelTab)
    {
        var $selectedPanelObj = $("div.ui-tabs-panel[aria-hidden=false]", this.$getPageTabControl(firstLevelTab));
        if ($selectedPanelObj.length && !firstLevelTab)
        {
            // try to find inner tabs.
            var $ifr = $selectedPanelObj.find('iframe');
            if ($ifr.length)
            {
                var $pageTab = $ifr.contents().find('div.ui-page-tab');
                if ($pageTab.length && !$pageTab.hasClass('genericEvent'))
                    $selectedPanelObj = $('div.ui-tabs-panel[aria-hidden=false]', $pageTab);
            }
        }
        return $selectedPanelObj;
    },

    _picklistFocusHandler: function () {
        $(this).parent().attr("state", "select");
    },

    _picklistBlurHandler: function () {
        $(this).parent().removeAttr("state");
        if ($(this).attr('required')) {
        }
        else {
            $(this).parent().addClass("ui-state-active");
        }
    },

    _displayGeneralMessage: function (si) {

        var $divMsg = $("<div />").append(si.GenMessage);
        jAlert($divMsg, [si.GeneralMessageLabel || this._labels.MessageLabel, si.CloseLabel_GenMessage] );
    },

    setUpFormElements: function () {
        var me = this;
        var $picklist = $('.cs-picklist input');

        $picklist.off('focus', me._picklistFocusHandler);
        $picklist.on('focus', me._picklistFocusHandler);

        $picklist.off('blur', me._picklistBlurHandler);
        $picklist.on('blur', me._picklistBlurHandler);
    },

    _getLoadingText: function () {
        var loadingTitleCaption = "Loading...";
        if (this._loadingTitleValue) {
            localStorage.setItem('Lbl_PopupLoadingTitle', this._loadingTitleValue);
            loadingTitleCaption = this._loadingTitleValue;
        } else {
            loadingTitleCaption = localStorage.getItem('Lbl_PopupLoadingTitle');
        }
        return loadingTitleCaption || "Loading...";
    },

    loadConcierge: function()
    {
        if (!this._isConciergeLoaded)
        {
            this._isConciergeLoaded = true;
            var conc = this.getConcierge();
            if (conc)
                conc.refreshContent();
        }
    },

    positionInfoZoneContainer: function()
    {
        var infoZoneContainer = $get("InfoZoneContainer");

        if (infoZoneContainer && this.get_workflowProgress() && this.get_workflowProgress().get_isVisible())
        {
            infoZoneContainer.className = "InfoZoneContainerWithProgress";
        }
    },

    positionActionZoneContainer: function()
    {
        var actionZoneContainer = $get("ActionZoneContainer");

        if (actionZoneContainer && this.get_workflowProgress() && this.get_workflowProgress().get_isVisible())
        {
            actionZoneContainer.className = "ActionZoneContainerWithProgress";
        }
    },

    createJavascriptInclude: function(url)
    {
        // Add new script element
        var js = document.createElement('script');
        js.setAttribute('type', 'text/javascript');
        js.setAttribute('src', url);

        return js;
    },


    createBodyContent: function()
    {
        var formBody = new Sys.StringBuilder();
        var count = theForm.elements.length;

        for (var i = 0; i < count; i++)
        {
            var element = theForm.elements[i];
            var name = element.name;

            if (typeof (name) === "undefined" || (name === null) || (name.length === 0) || (name === this._scriptManagerID))
            {
                continue;
            }

            var tagName = element.tagName.toUpperCase();
            if (tagName === 'INPUT')
            {
                var type = element.type;
                if ((type === 'text') || (type === 'password') || (type === 'hidden'))
                {
                    formBody.append(encodeURIComponent(name));
                    formBody.append('=');
                    formBody.append(encodeURIComponent(element.value));
                    formBody.append('&');
                }
                if ((type === 'checkbox'))
                {
                    formBody.append(encodeURIComponent(name));
                    formBody.append('=');
                    if(element.checked)
                        formBody.append(encodeURIComponent(element.value));
                    formBody.append('&');
                }
                if (type === 'radio' && element.checked)
                {
                    formBody.append(encodeURIComponent(name));
                    formBody.append('=');
                    formBody.append(encodeURIComponent(element.value));
                    formBody.append('&');
                }
            }
            else if (tagName === 'SELECT')
            {
                var optionCount = element.options.length;
                for (var j = 0; j < optionCount; j++)
                {
                    var option = element.options[j];
                    if (option.selected)
                    {
                        formBody.append(encodeURIComponent(name));
                        formBody.append('=');
                        formBody.append(encodeURIComponent(option.value));
                        formBody.append('&');
                    }
                }
            }
            else if (tagName === 'TEXTAREA')
            {
                formBody.append(encodeURIComponent(name));
                formBody.append('=');
                if (Camstars.Browser.IE && element.value == '<p></p>')
                    formBody.append(encodeURIComponent(''));
                else
                    formBody.append(encodeURIComponent(element.value));
                formBody.append('&');
            }
        }

        if (this._additionalInput)
        {
            formBody.append(this._additionalInput);
            this._additionalInput = null;
        }

        return formBody.toString();
    },

    formElementClick: function(evt)
    {
        if (typeof (__page) != 'undefined') {
            __page.closePanels(evt);
            __page._formSubmitElement = null;
            var element = evt.target;
            if (element.disabled) {
                return;
            }
            var fullpostback = element.getAttribute('fullpostback');
            if (fullpostback) {
                __page._fullpostback = '1';
            }
            else {
                if (element.name) {
                    if (element.tagName === 'INPUT') {
                        var type = element.type;
                        if (type === 'submit') {
                            __page._additionalInput = element.name + '=' + encodeURIComponent(element.value);
                            __page._formSubmitElement = element.id;
                        }
                        else if (type === 'image') {
                            var x = evt.offsetX;
                            var y = evt.offsetY;
                            __page._additionalInput = element.name + '.x=' + x + '&' + element.name + '.y=' + y;
                        }
                    }
                    else if ((element.tagName === 'BUTTON') && (element.name.length !== 0) && (element.type === 'submit')) {
                        __page._additionalInput = element.name + '=' + encodeURIComponent(element.value);
                    }
                }
            }
        }
    },

    closePanels: function(e) {
        if (this.isMobilePage()) {
            $('div.cs-picklist-panel:visible, #ui-datepicker-div:visible').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0) {
                    var panel = $find(this.id);
                    if (panel)
                        panel.onClose(e);
                    else
                        $.datepicker._hideDatepicker();
                }
            });
        }
    },

    showModal: function()
    {
        var mod = $get("mod");
        if (mod)
        {
            mod.style.display = "block";
        }
    },

    hideModal: function()
    {
        var mod = $get("mod");
        if (mod)
            mod.style.display = "none";
    },

    showUserProfile: function(post)
    {
        if (post)
            __page.postback(null, "ShowUserProfile", "");
        else
            this.get_userprofile().show();
    },

    disposeAllWebParts: function(includingStaticComponents)
    {
        var components = Sys.Application.getComponents();
        if (components)
        {
            for (var i = 0; i < components.length; i++)
            {
                var component = components[i];
                if (component == this)
                {
                    // Do not remove itself
                    continue;
                }
                if (Camstar.UI.IUIComponent.isImplementedBy(component))
                {
                    if (includingStaticComponents === true || !component.get_isStatic())
                        component.dispose();
                }
            }
        }
    },

    setFocus: function(id)
    {
        if (!id) return;
        var $targetControl = $("#" + id);
        if (!$targetControl.length || $targetControl.is('[readonly]')) return;

        if ($targetControl.attr("tinymce") !== undefined && tinymce)
        {
            setTimeout(function()
            {
                if (tinymce.activeEditor)
                {
                    var ed = tinymce.activeEditor;
                    ed.selection.select(ed.getBody(), 1);
                    ed.selection.collapse(1);
                    ed.getBody().focus();
                    ed.getWin().focus();
                }
            }, 100);

            return;
        }

        if ($targetControl.is('[role=grid]'))
        {
            setTimeout(function () { $targetControl.focus();}, 1);
            return;
        }

        var editorControlId = $targetControl.attr("EditorControlID");
        if (editorControlId !== undefined)
        {
            $targetControl = $("#" + editorControlId);
        }
        else if ((typeof (WebForm_CanFocus) != "undefined") && (!WebForm_CanFocus($targetControl.get(0))))
        {
            $targetControl = $(WebForm_FindFirstFocusableChild($targetControl.get(0)));
        }

        if ($targetControl.length)
        {
            
            var prevtarget = $targetControl;
            if (!$targetControl.is('input,select,textarea'))
                $targetControl = $('input,select,textarea', $targetControl).first();
            if ($targetControl.length)
                // The setTimeout is required by Firefox for css focus to work reliably (to highlight the field).
            {
                try { $targetControl.focus(); }
                catch (e) { }
            }
            else
                prevtarget.focus();
            
        }
    },

    getScrollableElement: function()
    {
        if (this._scrollableElement)
            return this._scrollableElement;
        return $('#scrollablepanel, .scrollable-panel');
    },

    setScrollableElement: function(value)
    {
        this._scrollableElement = value;
    },

    refreshHeader: function()
    {
        return this._header.refresh();
    },

    isKeyDisabled: function(e)
    {
        var isDisabled = false;

        if (!e) e = event;
        var isPossibleTextElement = jQuery.grep(['DIV', 'INPUT', 'TEXTAREA'], function (a) { return a == (!e.target ? event.srcElement.tagName : e.target.tagName); }).length > 0;
        var targetElement = (!e.target ? event.srcElement : e.target);

        var k = e.keyCode;
        var disabledKeys = window.CancelKeyPressList;
        var backSpaceCode = window.gkBackSpaceKeyCode;

        for (var i = 0; i < disabledKeys.length; i++)
        {
            var splitItem = disabledKeys[i].split('+');
            if (splitItem.length == 1)
            {
                if (k == disabledKeys[i])
                {
                    // Check to see if it is the backspace
                    if ((disabledKeys[i] == backSpaceCode) && isPossibleTextElement)
                    {
                        // Do not cancel the backspace if the user 
                        // is in a text box, textarea, text editor area or password element.
                        if ((!window.IsTextElement(targetElement)) && (!window.IsTextAreaElement(targetElement))
                            && (!window.IsFileElement(targetElement)) && (!window.IsPasswordElement(targetElement))
                            && (!window.IsURLElement(targetElement)))
                        {
                            isDisabled = true;
                        } // if
                        else
                        {
                            // Do not cancel the backspace if the user 
                            // is in a text box, textarea or password element
                            // and it`s ReadOnly property is not set to true.
                            if (window.IsReadOnly(targetElement))
                            {
                                isDisabled = true;
                                break;
                            }
                        }
                    }
                    else
                    {
                        isDisabled = true;
                        break;
                    } // if else
                } // if
            }
            else if (splitItem.length == 2)
            {
                // The alt key
                if (splitItem[0] == window.gkAltKeyCode)
                {
                    if (event.altKey)
                    {
                        if (k == splitItem[1])
                        {
                            isDisabled = true;
                            break;
                        } // if
                    } // if
                } // if
            } // if else
        } // for

        return isDisabled;
    },

    keyTabbing: function(e)
    {
        var me = this;
        var l = this.get_focusableElements();
        if (l.length > 1)
        {
            var current = '#' + e.target.id;
            var i = $.inArray(current, l);
            if (i == -1)
                i = 0;

            var loop = 2;
            while (loop)
            {
                if (!e.shiftKey)
                {
                    i++;
                    if (i >= l.length)
                    {
                        i = 0;
                        loop--;
                    }
                }
                else
                {
                    i--;
                    if (i < 0)
                    {
                        i = l.length-1;
                        loop--;
                    }
                }

                var $el = $(l[i]);
                if ($el.length == 0 || $el.is(':disabled') || $el.is(':hidden') || $el.is('[readonly]') || $el.is('div.tiny') /* readonly Editor */)
                {
                    if (tinymce.activeEditor!=null && ('#'+tinymce.activeEditor.id==$el.selector))
                    {
                        tinymce.execCommand('mceFocus', false, 'id_of_textarea');
                        break;
                     }
                    continue;
                }
                else if($el.closest('div.ui-tabs-panel').hasClass('ui-tabs-hide'))
                {
                    continue;
                }
                else
                    break;
            }
            if (loop)
            {
                if (e.target.id == $(l[i])[0].id)
                    $(l[i]).blur();
                else
                    me.changeFocusTo($(l[i]));
                e.preventDefault();
            }
        }
    },

    makeTabstopsForDialog: function($wp)
    {
        if ($wp && $wp.length)
        {
            // Reduce list
            var l = this.get_focusableElements();
            this._initial_focusableElements = l;
            var nl = [];
            for (var i = 0; i < l.length; i++)
            {
                var c = $(l[i], $wp);
                if (c.length)
                {
                    nl.push(l[i]);
                }
            }
            nl.push('#light_popup_dialog_button_OK');
            nl.push('#light_popup_dialog_button_Close');
            nl.push('#light_popup_dialog_button_Reset');

            this.set_focusableElements(nl);
        }
        else
        {
            // restore
            this.set_focusableElements(this._initial_focusableElements);
            delete this._initial_focusableElements;
        }
    },

    getQueryStringWithCallStackKey : function(queryString, pageName)
    {
        if (queryString == undefined)
            queryString = '';
        var url = '?' + queryString.replace('?', '');
        if (pageName != undefined)
            url = pageName;
        if (getParameterByName('CallStackKey', url) == '')
        {
            var callStackKey = this.getCurrentCallStackKey();
            if (callStackKey != '')
            {               
                queryString += ((queryString == '') ? "?CallStackKey=" + callStackKey : "&CallStackKey=" + callStackKey);
            }
        }
        return queryString;
    },

    changePageName: function(newPage, query)
    {
        newPage = newPage.replace(".aspx", "");
        if (query)
            query = '?' + query.replace("?", "");
        var url = window.location.pathname; // returns for ex. '/CamstarPortal/default.aspx'
        var newPathName;
        if (url.lastIndexOf('/') > 0)
            newPathName = url.substring(1, url.lastIndexOf('/')) + '/' + newPage;
        else
            newPathName = newPage;
        return window.location.protocol + "//" + window.location.host + "/" + newPathName + '.aspx' + query;
    },

    loadSessionVariable: function(id)
    {
        this.loadSessionVariables([id]);
    },

    loadSessionVariables: function (ids)
    {
        var callStack = this.get_CallStackKey();
        var oldServerType = this._serverType;
        this._serverType = "Camstar.WebPortal.FormsFramework.SessionVariables,Camstar.WebPortal.FormsFramework";
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("GetValues");
        var svList = [];
        Array.forEach(ids, function(id)
        {
            svList.push({ Id: id, Value: null, CallStackKey: callStack });
        });

        var serializedPostData = Sys.Serialization.JavaScriptSerializer.serialize(svList);
        transition.set_commandParameters(serializedPostData);
        transition.set_clientCallback("receiveSessionVariables");
        transition.set_postdata(true);

        this._communicator = new Camstar.Ajax.Communicator(transition, this);
        this._communicator.syncCall();
        this._serverType = oldServerType;
    },

    receiveSessionVariables: function(section)
    {
        if (!(section && section.Data && section.Data.HTML))
            return;

        var serialised = section.Data.HTML;
        var data = Sys.Serialization.JavaScriptSerializer.deserialize(serialised);
        for (var ii=0; ii<data.length; ii++)
        {
            var svIndex = -1;
            // If the item already exists
            for (var i = 0; i < this._sessionVariables.length; i++)
            {
                if (this._sessionVariables[i].Id == data[ii].Id)
                {
                    svIndex = i;
                    break;
                }
            }
            if (svIndex != -1)
                this._sessionVariables[svIndex].Value = data[ii].Value;
            else
                this._sessionVariables.push(data[ii]);
        }
    },

    saveSessionVariables: function (p)
    {
        var ids = $.isArray(p) ? p : [p];
        var callStack = this.get_CallStackKey();
        if (this.get_isfloating()) {
            callStack = this.getParentKey();
        }

        var oldServerType = this._serverType;
        this._serverType = "Camstar.WebPortal.FormsFramework.SessionVariables,Camstar.WebPortal.FormsFramework";
        var transition = new Camstar.Ajax.Transition(eval(Camstar.Ajax.RequestType.Command), this);
        transition.set_command("SetValues");
        var svList = [];
        for(var i=0; i<ids.length; i++)
        {
            svList.push({ Id: ids[i], Value: this.getSessionVariable(ids[i]), CallStackKey: callStack });
        }

        var serializedPostData = Sys.Serialization.JavaScriptSerializer.serialize(svList);
        transition.set_commandParameters(serializedPostData);
        transition.set_clientCallback("receiveSessionVariables");
        transition.set_postdata(true);

        this._communicator = new Camstar.Ajax.Communicator(transition, this);
        this._communicator.syncCall();
        this._serverType = oldServerType;
    },

    getSessionVariable : function(id)
    {
        for (var i = 0; i < this._sessionVariables.length; i++)
        {
            if (this._sessionVariables[i].Id == id)
                return this._sessionVariables[i].Value;
        }
        return null;
    },

    setSessionVariable: function (id, val, submit)
    {
        var isAdded = true;
        for (var i = 0; i < this._sessionVariables.length; i++)
        {
            if (this._sessionVariables[i].Id == id)
            {
                this._sessionVariables[i].Value = val;
                isAdded = false;
                break;
            }
        }

        if(isAdded)
            this._sessionVariables.push({ Id: id, Value: val });

        if (submit === true || submit === "true")
            this.saveSessionVariables(id);
    },

    getLabel: function(labelName, callback)
    {
        if (labelName)
        {
            this.getLabels([{ Name: labelName }], callback);
        }
    },

    getLabels: function (labels, callback)
    {
        var me = this;
        if (labels && labels.length)
        {
            $.post(
                "AjaxEntry.axd",
                JSON.stringify({
                    RequestType: 0,
                    TargetType: "Camstar.WebPortal.FormsFramework.Utilities.LabelCache,Camstar.WebPortal.FormsFramework.Utilities",
                    Command: "GetMultipleLabels",
                    CommandParameters: JSON.stringify(labels)
                }),
                function (d) {
                    var resp = JSON.parse(d);
                    if (resp.Response) {
                        resp.Response.forEach(function (section) {
                            if (section.Data) {
                                var lbls = JSON.parse(section.Data.HTML);
                                if (callback) {
                                    callback.apply(window, [lbls]);
                                }
                                else {
                                    labels.forEach(function (l) {
                                        var ll = lbls.find(function (l1) { return l.Name == l1.Name; })
                                        if (ll)
                                            l.Value = ll.Value;
                                    });
                                }
                            }
                        });
                    }
                }
            );
        }
    },

    // tagItems - array of tag names to get values from: ["TagName1", "TagName2"],
    // all tag items will be returned when not specified. 
    getTagItemValues: function (tagItems)
    {
        var retJsonObject = {};
        if (this._tagItems != null)
        {
            var me = this;
            $.each(this._tagItems, function ()
            {
                if (tagItems && $.inArray(this.Name, tagItems) < 0)
                    return true;

                if (this.TagItemSource === 0) // control.
                {
                    if (this.EditorClientId)
                        retJsonObject[this.Name] = Camstars.Controls.getValueById(this.EditorClientId);
                }
                else if (this.TagItemSource === 1) // session variable.
                    retJsonObject[this.Name] = me.getSessionVariable(this.Name);
            });
        }
        return retJsonObject;
    },

    setTagItemValues: function (jsonObject, forcePostBack)
    {
        if (jsonObject && this._tagItems)
        {
            var me = this;
            var sessionVariablesToSubmit = [];
            $.each(this._tagItems, function ()
            {
                var value = jsonObject[this.Name];
                if (typeof (jsonObject[this.Name]) !== "undefined")
                {
                    if (this.TagItemSource === 0) // control.
                    {
                        if (this.EditorClientId)
                            Camstars.Controls.setValueById(this.EditorClientId, value);
                    }
                    else if (this.TagItemSource === 1) // session variable.
                    {
                        me.setSessionVariable(this.Name, value, false);
                        sessionVariablesToSubmit.push(this.Name);
                    }
                }
            });
            if (sessionVariablesToSubmit.length)
                this.saveSessionVariables(sessionVariablesToSubmit);
        }
        if (forcePostBack)
            this.postback(null, "SetTagItemValues", "");
    },

    isModelingPage: function () {
        return $(window.document.body).hasClass("body-modeling");
    },
    isMobilePage: function () {
        return $(getCEP_top().document.body).hasClass("mobile");
    },
    isModelingBasePage: function () // ModelingVP
    {
        return $(window.document.body).is(".modeling, .body-main");
    },

    setPageSideBar: function (cmdtype, doc) {
        cmdtype = cmdtype || this.get_CommandBarSettings();
        doc = doc || document;
        if (cmdtype) {
            // Create commandBar singletone 
            var win = getCEP_top();
            var cmdClass = win[cmdtype];
            if (cmdClass) {
                $(doc.body).attr("sideMenu", cmdtype);
                return  true;
            }
        }

        return false;
    },

    updateSideBar: function () {

        var sideBar = $find('ctl00_SideBarRight');
        if (!sideBar && window.frameElement) {
            if (!$(window.frameElement).attr("slideout"))
                if(parent.$find)
                    sideBar = parent.$find('ctl00_SideBarRight');
        }

        if (sideBar) 
            sideBar.update();
    },

    getConcierge: function () {
        var cc = $find("WebPart_ConciergeControl_UIComponent");
        if (cc)
            return cc;

        return null;
    },

    /*** Public Properties ***/
    get_controlId: function() { return "page"; },

    get_serverType: function() { return this._serverType; },
    set_serverType: function(value) { this._serverType = value; },

    get_communicator: function() { return this._communicator; },

    get_virtualPageName: function() { return this._virtualPageName; },
    set_virtualPageName: function (value) { this._virtualPageName = value; },

    get_queryString: function() { return this._queryString; },
    set_queryString: function(value) { this._queryString = value; },

    get_eventArgument: function()
    {
        if (this._eventArgument == null)
        {
            this._eventArgument = $get("__EVENTARGUMENT");
        }
        return this._eventArgument;
    },
    set_eventArgument: function(value) { this.get_eventArgument().value = value; },

    get_eventTarget: function()
    {
        if (this._eventTarget == null)
        {
            this._eventTarget = $get("__EVENTTARGET");
        }
        return this._eventTarget;
    },
    set_eventTarget: function(value) { this.get_eventTarget().value = value; },

    get_documentHeader: function()
    {
        if (this._documentHeader == null)
        {
            this._documentHeader = document.getElementsByTagName('head')[0];
        }

        return this._documentHeader;
    },

    get_workflowProgress: function() { return this._workflowProgress; },
    set_workflowProgress: function(value) { this._workflowProgress = value; },

    get_isfloating: function() { return this._isfloating; },
    set_isfloating: function(value)
    {
        this._isfloating = value;
        this.set_Title(this.get_Title());
    },

    get_isChild: function() { return this._isChild; },
    set_isChild: function(value) { this._isChild = value; },

    get_header: function() { return this._header; },
    set_header: function(value) { this._header = value; },

    get_configurator: function() { return this._configurator; },
    set_configurator: function(value) { this._configurator = value; },

    get_userprofile: function() { return this._userprofile; },
    set_userprofile: function(value) { this._userprofile = value; },

    get_templateElement: function() { return this._templateElement; },
    set_templateElement: function (value) {
        if (!value) {
            // search for the DynamicContentDiv if the TemplateContentDiv is not found
            value = $get("DynamicContentDiv");
        }
        this._templateElement = value;
    },

    get_postBackTarget: function() { return this._postBackTarget; },
    set_postBackTarget: function(value) { this._postBackTarget = value; },

    get_notifyParent: function() { return this._notifyParent; },
    set_notifyParent: function(value) { this._notifyParent = value; },

    get_notifyParentOnClose: function() { return this._notifyParentOnClose; },
    set_notifyParentOnClose: function(value) { this._notifyParentOnClose = value; },

    get_helpUrl: function()
    {
        return this.$getActiveTabPanel().attr('helpurl');
    },
    set_helpUrl: function(value)
    {
        this._helpUrl = value;
        if (this._isfloating != null) {
            var ap = this.$getActiveTabPanel();
            if (this._isfloating) {
                var helpUrl = this._helpUrl == null ? "none" : this._helpUrl;
                ap.attr('popupHelpUrl', helpUrl);
            }
            else {
                if (!this.lastFocusedControl || this._homePage)    // check if the page is the new opened page or the page is a pageflow
                    ap.attr('helpurl', this._helpUrl);
            }
        }
    },

    get_CallStackKey: function() { return this._CallStackKey; },
    set_CallStackKey: function(value) { this._CallStackKey = value; },

    get_CurrencyDecimalSeparator: function() { return this._currencyDecimalSeparator; },
    set_CurrencyDecimalSeparator: function(value)
    {
        this._currencyDecimalSeparator = value;
        Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator = value;
    },

    get_ShortDatePattern: function () { return this._shortDatePattern; },
    set_ShortDatePattern: function (value) {
        this._shortDatePattern = value;
        Sys.CultureInfo.CurrentCulture.dateTimeFormat.ShortDatePattern = value;
    },

    get_LongTimePattern: function () { return this._longTimePattern; },
    set_LongTimePattern: function (value) {
        this._longTimePattern = value;
        Sys.CultureInfo.CurrentCulture.dateTimeFormat.LongTimePattern = value;
    },

    get_Title: function() { return this._Title; },
    set_Title: function(value) { this._Title = value; },

    get_activeElement: function() { return this._activeElement; },
    set_activeElement: function(value) { this._activeElement = value; },

    get_LoadingLabelText: function () { return this._loadingTitleValue; },
    set_LoadingLabelText: function (value) { this._loadingTitleValue = value; },

    get_labels: function() { return this._labels; },
    set_labels: function(value) { this._labels = value; },

    get_defaultButtonID: function() { return this._defaultButtonID; },
    set_defaultButtonID: function(value) { this._defaultButtonID = value; },

    get_focusableElements: function () { return window["__focusableElements"]; },
    set_focusableElements: function (value) { window["__focusableElements"] = value; },

    get_tagItems: function () { return this._tagItems; },
    set_tagItems: function (value) { this._tagItems = value; },

    get_fullScreen: function() {
        if (this.isModelingPage()) {
            if (parent && parent.__page && parent.__page.isModelingBasePage())
                this._fullScreen = parent.__page._fullScreen;
        }
        return this._fullScreen;
    },
    set_fullScreen: function(value) {
        this._fullScreen = value;
    },


    // mobileBarcodeEnabled
    get_mobileBarcodeEnabled: function () { return this._mobileBarcodeEnabled; },
    set_mobileBarcodeEnabled: function (value) { this._mobileBarcodeEnabled = value; },

    // isResponsive
    get_isResponsive: function () { return this._isResponsive; },
    set_isResponsive: function (value) { this._isResponsive = value; },

    get_hideFooter: function () { return this._hideFooter; },
    set_hideFooter: function (value) { this._hideFooter = value; },

    get_hideHeader: function () { return this._hideHeader; },
    set_hideHeader: function (value) { this._hideHeader = value; },

    get_hideTopMenu: function () { return this._hideTopMenu; },
    set_hideTopMenu: function (value) { this._hideTopMenu = value; },

    get_hideTabs: function () { return this._hideTabs; },
    set_hideTabs: function (value) { this._hideTabs = value; },

    get_CommandBarSettings: function () { return this._commandBarSettings; },
    set_CommandBarSettings: function (value) { this._commandBarSettings = value; },

    get_startInfo: function () { return this._startInfo; },
    set_startInfo: function (value) { this._startInfo = value; },

    get_pageType: function () { return this._pageType; },
    set_pageType: function (value) { this._pageType = value; },

    get_pageCulture: function () { return this._pageCulture; },
    set_pageCulture: function (value) { this._pageCulture = value; }

};

Camstar.WebPortal.PortalFramework.WebPartPageBase.registerClass('Camstar.WebPortal.PortalFramework.WebPartPageBase', Sys.Component);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();


function resize_page() {
    top_resize();
}
