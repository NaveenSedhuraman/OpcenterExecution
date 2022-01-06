// Copyright Siemens 2020  

/// <reference name="MicrosoftAjax.js"/>
/// <reference path="~/Scripts/ClientFramework/Camstar.UI/Control.js" />
/// <reference path="~/Scripts/ClientFramework/Camstar.WebPortal.PortalFramework/WebPartBase.js" />
/// <reference path="~/Scripts/ClientFramework/CamstarPortal.WebControls/HeaderMobileControl.js" />
Type.registerNamespace("Camstar.WebPortal.WebPortlets");

Camstar.WebPortal.WebPortlets.StatusBar = function (element) {
    Camstar.WebPortal.WebPortlets.StatusBar.initializeBase(this, [element]);
    this._displaySuccessPopup = true;
    this._successPopupFadeOutTime = 1000;
    this._playSound = false;
    this._warningSound = null;
    this._successSound = null;
    this._errorSound = null;
},

    Camstar.WebPortal.WebPortlets.StatusBar.prototype = {
        initialize: function () {
            Camstar.WebPortal.WebPortlets.StatusBar.callBaseMethod(this, 'initialize');
            // Add custom initialization here
        },
        dispose: function () {
            this._playSound = false;
            this._warningSound = null;
            this._successSound = null;
            this._errorSound = null;

            Camstar.WebPortal.WebPortlets.StatusBar.callBaseMethod(this, 'dispose');
        },

        // Opens status bar
        open: function (useEffect) {
            // get new message
            var $mainElement = $(".webpart-status");

            if ($(".status-message").length > 0) {
                $(".close", $mainElement).bind("click", function (e) {
                    $mainElement.hide();
                });
            }
            else {
                $(".close").bind("click", function (e) {
                    $mainElement.hide();
                });
            }

            var messageType = $("div[messagetype]").attr("messagetype");
            //TODO: handle unordered list in warning messages
            var message, messageText;

            let messageElement = $(".message", $mainElement);
            if (messageElement.length > 0) {
                message = messageElement.html();
                messageText = messageElement.text();
            }
            else {
                // get first child div text
                var msgParts = $mainElement.find('ul >li');
                if (msgParts.length > 0) {
                    message = '<span class="messageType">' + $(msgParts[0]).text() + '</span>' + '<span>' + $(msgParts[1]).text() + '</span>';
                    messageText = $(msgParts[0]).text() + " " + $(msgParts[1]).text();
                }
                else {
                    message = $mainElement.children('div').text();
                    messageText = message;
                }
            }

            var apolloWindow = parent;
            if (!apolloWindow.showApolloInfo) {
                apolloWindow = parent.parent;
                if (!apolloWindow.showApolloInfo) {
                    apolloWindow = parent.parent.parent; // if the popup has a popup (ie. ESignature popup on top of an Attach Document popup)
                }
            }

            if (apolloWindow.showApolloInfo) {
                if (messageType === "Success")
                    apolloWindow.showApolloInfo(messageText);
                else
                    apolloWindow.showApolloError(messageText);
            }

            else {
                var page = top.__page || window.__page || parent.__page || getCEP_top().__page;
                page.displayMessage(message, messageType);

                if (messageType == "Success") {
                    if (this._displaySuccessPopup) {
                        $mainElement.fadeIn(1000).delay(this._successPopupFadeOutTime).fadeOut(1000);
                        // Duplicate message popup on parent window in case of closing slideout panel
                        if ($mainElement.closest("body.commandbar-panel").length) {
                            var $parentStatus = $(".webpart-status", parent.document.body);
                            if ($parentStatus.length) {
                                $parentStatus.html($mainElement.html());
                                $parentStatus.fadeIn(1000).delay(this._successPopupFadeOutTime).fadeOut(1000);
                            }
                        }

                    }
                }
                else {
                    if (useEffect == true) {
                        $mainElement.fadeIn(1000);
                    }
                    else {
                        $mainElement.show();
                    }
                    if (document.documentElement.scrollTop > 0) {
                        if (($mainElement.offset().top - $mainElement.scrollTop()) < document.documentElement.scrollTop && $mainElement.length === 1)
                            $mainElement.scrollTop($mainElement.top);
                    }
                }
                if (getCEP_top().__page && getCEP_top().__page.isMobilePage()) {
                    var headerControl = getCEP_top().$find("NavbarHeader");
                    $(".scrollable-panel").scrollTop(0);
                    if (headerControl)
                        headerControl.addAlert(message, messageType);
                }
            }

            this.playSound(messageType);
            return false;
        },

        // Closes status bar
        close: function (useEffect) {
            var mainElem = this.get_element();
            if (useEffect == true)
                $(mainElem).fadeOut(1000);
            else
                $(mainElem).hide();
            return false;
        },

        write: function (message, msgType, caption) {
            var $mainElement = $(".webpart-status");
            var messageControl = $(".message", $mainElement);
            var title = (typeof caption === "undefined") ? msgType.toUpperCase() : caption;

            messageControl.empty();
            messageControl.append('<span class="messageType">' + title + '!' + '</span> ' + '<span>' + message + '</span>');
            $("div[messagetype]").attr("messagetype", msgType);
            this.open(true);
        },

        processStatusData: function (sectionData) {
            var msgText = '';
            if (sectionData.Message) {
                msgText += sectionData.Message;
            }
            else {
                for (var i = 0; i < sectionData.ValidationItems.length; i++) {
                    msgText += sectionData.ValidationItems[i].Message + "\n";
                }
            }

            this.write(msgText, "Error");
        },

        clear: function () {
            var page = top.__page || window.__page || parent.__page || getCEP_top().__page;
            page.displayMessage('', '');
            $(".webpart-status").hide();
        },

        playSound: function (messageType) {
            if (this._playSound) {
                var path;
                if (messageType == "Success")
                    path = this._successSound;
                else if (messageType == "Warning")
                    path = this._warningSound;
                else
                    path = this._errorSound;
                if (path) {
                    var $mainElement = $(".webpart-status");
                    $('audio', $mainElement).attr('autoplay', 'autoplay');
                    $('audio', $mainElement).attr('src', path);
                }
            }
        },

        get_displaySuccessPopup: function () { return this._displaySuccessPopup; },
        set_displaySuccessPopup: function (value) { this._displaySuccessPopup = value; },
        get_successPopupFadeOutTime: function () { return this._successPopupFadeOutTime; },
        set_successPopupFadeOutTime: function (value) { this._successPopupFadeOutTime = value; },

        get_playSound: function () { return this._playSound; },
        set_playSound: function (value) { this._playSound = value; },
        get_warningSound: function () { return this._warningSound; },
        set_warningSound: function (value) { this._warningSound = value; },
        get_successSound: function () { return this._successSound; },
        set_successSound: function (value) { this._successSound = value; },
        get_errorSound: function () { return this._errorSound; },
        set_errorSound: function (value) { this._errorSound = value; }
    },
    Camstar.WebPortal.WebPortlets.StatusBar.registerClass('Camstar.WebPortal.WebPortlets.StatusBar', Camstar.WebPortal.PortalFramework.WebPartBase);

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();
